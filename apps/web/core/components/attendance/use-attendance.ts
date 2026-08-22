/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabaseAttendanceService } from "@keel/services";
import type { IAttendanceBreak, IAttendanceRecord, IAttendanceSettings } from "@keel/types";
import { useUser } from "@/hooks/store/user";
import { useWorkspace } from "@/hooks/store/use-workspace";

export type TClockState = "out" | "in" | "break";

/**
 * Everything the clock surfaces need: what is open right now, a second hand,
 * and the six actions that change it.
 *
 * The ticking `now` lives here rather than in each component so the shift
 * readout, the timer readout and the ribbon all advance on the same frame —
 * two clocks a second apart on one screen look broken.
 */
export function useAttendance() {
  const { data: currentUser } = useUser();
  const { currentWorkspace } = useWorkspace();

  const workspaceId = currentWorkspace?.id ?? "";
  const memberId = currentUser?.id ?? "";

  const [settings, setSettings] = useState<IAttendanceSettings | null>(null);
  const [openShift, setOpenShift] = useState<IAttendanceRecord | null>(null);
  const [openTask, setOpenTask] = useState<IAttendanceRecord | null>(null);
  const [openBreak, setOpenBreak] = useState<IAttendanceBreak | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (!workspaceId || !memberId) return;

    try {
      const records = await supabaseAttendanceService.getOpenRecords(workspaceId, memberId);
      if (!isMounted.current) return;

      const shift = records.find((r) => r.kind === "shift") ?? null;
      const task = records.find((r) => r.kind === "task") ?? null;
      setOpenShift(shift);
      setOpenTask(task);

      const activeBreak = shift ? await supabaseAttendanceService.getOpenBreak(shift.id) : null;
      if (!isMounted.current) return;
      setOpenBreak(activeBreak);
    } catch (e) {
      if (isMounted.current) setError(e instanceof Error ? e.message : "Could not read your attendance");
    }
  }, [workspaceId, memberId]);

  // First load also seeds settings and leave types, so a workspace opening
  // attendance for the first time lands on a working page rather than a setup
  // screen.
  useEffect(() => {
    if (!workspaceId) return;

    let cancelled = false;
    void (async () => {
      setIsLoading(true);
      try {
        const nextSettings = await supabaseAttendanceService.bootstrap(workspaceId);
        if (!cancelled) setSettings(nextSettings);
        await refresh();
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not open attendance");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [workspaceId, refresh]);

  // The second hand runs only while something is open. A page left on a
  // finished day has nothing to count and should not wake once a second.
  const hasRunningClock = Boolean(openShift || openTask);
  useEffect(() => {
    if (!hasRunningClock) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [hasRunningClock]);

  const state: TClockState = openBreak ? "break" : openShift ? "in" : "out";

  const run = useCallback(
    async (action: () => Promise<unknown>) => {
      setIsBusy(true);
      setError(null);
      try {
        await action();
        await refresh();
      } catch (e) {
        // Postgres speaks in SQLSTATEs; the message it raises is already
        // written for a person, so it is shown as-is rather than replaced with
        // something vaguer.
        setError(e instanceof Error ? e.message : "That did not work");
      } finally {
        setIsBusy(false);
      }
    },
    [refresh]
  );

  const actions = useMemo(
    () => ({
      clockIn: () => run(() => supabaseAttendanceService.clockIn(workspaceId)),
      clockOut: () => run(() => supabaseAttendanceService.clockOut()),
      startBreak: () => run(() => supabaseAttendanceService.startBreak()),
      endBreak: () => run(() => supabaseAttendanceService.endBreak()),
      startTimer: (issueId: string, projectId?: string) =>
        run(() => supabaseAttendanceService.startTaskTimer(workspaceId, issueId, projectId)),
      stopTimer: () => run(() => supabaseAttendanceService.stopTaskTimer()),
    }),
    [run, workspaceId]
  );

  const shiftSeconds = openShift ? (now - new Date(openShift.clock_in_at).getTime()) / 1000 : 0;
  const taskSeconds = openTask ? (now - new Date(openTask.clock_in_at).getTime()) / 1000 : 0;
  const breakSeconds = openBreak ? (now - new Date(openBreak.started_at).getTime()) / 1000 : 0;

  return {
    workspaceId,
    memberId,
    settings,
    state,
    openShift,
    openTask,
    openBreak,
    shiftSeconds,
    taskSeconds,
    breakSeconds,
    now,
    isLoading,
    isBusy,
    error,
    clearError: () => setError(null),
    refresh,
    ...actions,
  };
}

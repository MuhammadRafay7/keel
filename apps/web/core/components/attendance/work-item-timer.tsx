/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react";
import { supabaseAttendanceService } from "@keel/services";
import type { IAttendanceRecord } from "@keel/types";
import { cn } from "@keel/utils";
import { useUser } from "@/hooks/store/user";
import { useWorkspace } from "@/hooks/store/use-workspace";
import { formatDuration, formatElapsed, recordSeconds } from "./helpers";

type TWorkItemTimerProps = {
  issueId: string;
  projectId: string;
  disabled?: boolean;
};

/**
 * Time against one work item, from inside the work item.
 *
 * A timer that lives only on the attendance page is a timer nobody starts —
 * the moment you decide to work on something is the moment you are looking at
 * it, not at a timesheet. The control is deliberately one button wide: the
 * decision here is "am I on this or not", and anything more is a form.
 */
export const WorkItemTimer = observer(function WorkItemTimer({ issueId, projectId, disabled }: TWorkItemTimerProps) {
  const { data: currentUser } = useUser();
  const { currentWorkspace } = useWorkspace();

  const workspaceId = currentWorkspace?.id ?? "";
  const memberId = currentUser?.id ?? "";

  const [records, setRecords] = useState<IAttendanceRecord[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const load = useCallback(async () => {
    if (!issueId) return;
    try {
      setRecords(await supabaseAttendanceService.getIssueTime(issueId));
    } catch {
      // A work item panel should still open when attendance is unreachable —
      // the timer simply shows nothing rather than taking the page down.
      setRecords([]);
    }
  }, [issueId]);

  useEffect(() => {
    void load();
  }, [load]);

  const running = useMemo(
    () => records.find((r) => r.member_id === memberId && !r.clock_out_at) ?? null,
    [records, memberId]
  );

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const { mine, team } = useMemo(() => {
    let mineSeconds = 0;
    let teamSeconds = 0;
    records.forEach((record) => {
      const seconds = recordSeconds(record, now);
      teamSeconds += seconds;
      if (record.member_id === memberId) mineSeconds += seconds;
    });
    return { mine: mineSeconds, team: teamSeconds };
  }, [records, memberId, now]);

  const toggle = useCallback(async () => {
    setIsBusy(true);
    setError(null);
    try {
      if (running) await supabaseAttendanceService.stopTaskTimer();
      else await supabaseAttendanceService.startTaskTimer(workspaceId, issueId, projectId);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "The timer did not start");
    } finally {
      setIsBusy(false);
    }
  }, [running, workspaceId, issueId, projectId, load]);

  return (
    <div className="flex w-full flex-col gap-1">
      <div className="flex w-full items-center gap-2">
        <button
          type="button"
          onClick={toggle}
          disabled={disabled || isBusy || !workspaceId}
          className={cn(
            "inline-flex items-center gap-1.5 focus-ring rounded-md px-2 py-1 text-body-xs-medium transition-smooth",
            running
              ? "bg-accent-subtle text-accent-primary hover:bg-accent-subtle-hover"
              : "text-tertiary hover:bg-layer-transparent-hover hover:text-primary",
            (disabled || isBusy) && "cursor-not-allowed opacity-60"
          )}
        >
          <span
            className={cn("size-1.5 rounded-full", running ? "animate-pulse bg-accent-primary" : "bg-layer-3")}
            aria-hidden="true"
          />
          {running ? "Stop timer" : "Start timer"}
        </button>

        {running ? (
          <span className="font-code text-body-xs-regular text-accent-primary tabular-nums">
            {formatElapsed(recordSeconds(running, now))}
          </span>
        ) : (
          mine > 0 && (
            <span className="font-code text-body-xs-regular text-secondary tabular-nums">{formatDuration(mine)}</span>
          )
        )}

        {team > mine && (
          <span className="text-body-xs-regular text-placeholder">{formatDuration(team)} on the team</span>
        )}
      </div>

      {error && <p className="text-body-xs-regular text-danger-primary">{error}</p>}
    </div>
  );
});

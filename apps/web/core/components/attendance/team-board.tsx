/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react";
import { supabaseAttendanceService } from "@keel/services";
import type { IAttendanceTeamMember, TAttendanceState } from "@keel/types";
import { cn } from "@keel/utils";
import { useMember } from "@/hooks/store/use-member";
import { formatClockTime, formatElapsed } from "./helpers";

type TTeamBoardProps = {
  workspaceId: string;
  now: number;
};

const STATE_ORDER: TAttendanceState[] = ["in", "break", "leave", "out"];

const STATE_COPY: Record<TAttendanceState, { label: string; dot: string; text: string }> = {
  in: { label: "On the clock", dot: "bg-success-primary", text: "text-success-primary" },
  break: { label: "On a break", dot: "bg-warning-primary", text: "text-warning-primary" },
  leave: { label: "On leave", dot: "bg-accent-primary", text: "text-accent-primary" },
  out: { label: "Not clocked in", dot: "bg-layer-3", text: "text-placeholder" },
};

/**
 * Who is working right now.
 *
 * Grouped by state rather than sorted by name, because the question this
 * answers is "who is around", and an alphabetical list makes you read all of
 * it to find out. Live over Realtime: a board that needs refreshing to show a
 * clock-in is a board nobody trusts.
 */
export const TeamBoard = observer(function TeamBoard({ workspaceId, now }: TTeamBoardProps) {
  const { getUserDetails } = useMember();
  const [team, setTeam] = useState<IAttendanceTeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!workspaceId) return;
    try {
      setTeam(await supabaseAttendanceService.getTeamToday(workspaceId));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load the team");
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!workspaceId) return;
    return supabaseAttendanceService.subscribeToWorkspace(workspaceId, () => void load());
  }, [workspaceId, load]);

  const grouped = useMemo(() => {
    const map = new Map<TAttendanceState, IAttendanceTeamMember[]>();
    STATE_ORDER.forEach((state) => map.set(state, []));
    team.forEach((member) => map.get(member.state)?.push(member));
    return map;
  }, [team]);

  if (isLoading) return <p className="py-10 text-center text-13 text-placeholder">Loading the team…</p>;

  if (error) {
    return (
      <p className="rounded-xl border border-danger-subtle bg-danger-subtle px-4 py-3 text-13 text-danger-primary">
        {error}
      </p>
    );
  }

  return (
    <section aria-label="Who is working" className="flex flex-col gap-6">
      {STATE_ORDER.map((state) => {
        const members = grouped.get(state) ?? [];
        if (members.length === 0) return null;

        const copy = STATE_COPY[state];

        return (
          <div key={state}>
            <div className="mb-2 flex items-center gap-2">
              <span className={cn("size-1.5 rounded-full", copy.dot)} aria-hidden="true" />
              <h3 className="text-12 font-semibold tracking-wide text-secondary uppercase">{copy.label}</h3>
              <span className="font-code text-12 text-placeholder tabular-nums">{members.length}</span>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {members.map((member) => {
                const details = getUserDetails(member.member_id);
                const name = details?.display_name || details?.first_name || details?.email?.split("@")[0] || "Someone";
                const elapsed =
                  member.clock_in_at != null
                    ? (now - new Date(member.clock_in_at).getTime()) / 1000
                    : member.elapsed_seconds;

                return (
                  <article
                    key={member.member_id}
                    className="flex items-center justify-between gap-3 squircle-card border border-subtle bg-surface-1 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-14 font-medium text-primary">{name}</p>
                      <p className="mt-0.5 text-12 text-placeholder">
                        {member.clock_in_at
                          ? `Since ${formatClockTime(member.clock_in_at)}`
                          : state === "leave"
                            ? "Away today"
                            : "No shift today"}
                      </p>
                    </div>

                    {member.clock_in_at && (
                      <span className={cn("font-code text-14 tabular-nums", copy.text)}>{formatElapsed(elapsed)}</span>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        );
      })}
    </section>
  );
});

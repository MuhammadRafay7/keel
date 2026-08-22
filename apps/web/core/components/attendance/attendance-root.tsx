/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useCallback, useEffect, useState } from "react";
import { observer } from "mobx-react";
import { cn } from "@keel/utils";
import { ClockCard } from "./clock-card";
import { Requests } from "./requests";
import { TeamBoard } from "./team-board";
import { Timesheet } from "./timesheet";
import { useAttendance } from "./use-attendance";

type TTab = "today" | "team" | "requests";

const TABS: { key: TTab; label: string }[] = [
  { key: "today", label: "Your time" },
  { key: "team", label: "Team" },
  { key: "requests", label: "Requests" },
];

/**
 * The clock stays above the tabs rather than inside "Your time".
 *
 * Clocking out is the one thing somebody might come to this page to do while
 * looking at something else, and putting it behind a tab means finding it
 * first. It is also the only control here with a cost to getting wrong.
 */
export const AttendanceRoot = observer(function AttendanceRoot() {
  const attendance = useAttendance();
  const [tab, setTab] = useState<TTab>("today");

  // Bumped whenever the clock changes, so the sheet below re-reads rather than
  // showing a day that ended a moment ago.
  const [revision, setRevision] = useState(0);
  const bump = useCallback(() => setRevision((r) => r + 1), []);

  useEffect(() => {
    bump();
  }, [attendance.openShift?.id, attendance.openTask?.id, bump]);

  if (attendance.isLoading) {
    return <p className="py-20 text-center text-13 text-placeholder">Opening attendance…</p>;
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6">
      <ClockCard attendance={attendance} />

      <nav className="flex items-center gap-1 border-b border-subtle" aria-label="Attendance sections">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            aria-current={tab === item.key ? "page" : undefined}
            className={cn(
              "relative -mb-px focus-ring rounded-t-md px-3 py-2 text-13 font-medium transition-smooth",
              tab === item.key
                ? "text-primary after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:rounded-full after:bg-accent-primary"
                : "text-tertiary hover:text-primary"
            )}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {tab === "today" && (
        <Timesheet
          workspaceId={attendance.workspaceId}
          memberId={attendance.memberId}
          now={attendance.now}
          revision={revision}
        />
      )}

      {tab === "team" && <TeamBoard workspaceId={attendance.workspaceId} now={attendance.now} />}

      {tab === "requests" && (
        <Requests
          workspaceId={attendance.workspaceId}
          memberId={attendance.memberId}
          onChange={() => {
            bump();
            void attendance.refresh();
          }}
        />
      )}
    </div>
  );
});

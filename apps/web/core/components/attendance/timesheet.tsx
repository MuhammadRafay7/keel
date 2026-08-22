/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@keel/propel/button";
import { supabaseAttendanceService } from "@keel/services";
import type { IAttendanceBreak, IAttendanceDayTotal, IAttendanceRecord } from "@keel/types";
import { cn } from "@keel/utils";
import { DayRibbon } from "./day-ribbon";
import { formatClockTime, formatDayLabel, formatDuration, monthRange, toDecimalHours, weekRange } from "./helpers";

type TRange = "week" | "month";

type TTimesheetProps = {
  workspaceId: string;
  memberId: string;
  now: number;
  /** Bumped by the clock card so the sheet redraws the moment anything changes. */
  revision: number;
};

/**
 * The person's own record of the period.
 *
 * Two totals, never one. "On the clock" is what the shift says; "attributed"
 * is how much of it landed against work items. Summing them would count the
 * same hour twice, and the distance between them is the number worth seeing.
 */
export function Timesheet({ workspaceId, memberId, now, revision }: TTimesheetProps) {
  const [range, setRange] = useState<TRange>("week");
  const [records, setRecords] = useState<IAttendanceRecord[]>([]);
  const [breaks, setBreaks] = useState<IAttendanceBreak[]>([]);
  const [totals, setTotals] = useState<IAttendanceDayTotal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bounds = useMemo(() => (range === "week" ? weekRange(new Date()) : monthRange(new Date())), [range]);

  useEffect(() => {
    if (!workspaceId || !memberId) return;

    let cancelled = false;
    void (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [nextRecords, nextTotals] = await Promise.all([
          supabaseAttendanceService.getRecords({ workspaceId, memberId, ...bounds }),
          supabaseAttendanceService.getDayTotals({ workspaceId, memberId, ...bounds }),
        ]);
        if (cancelled) return;

        setRecords(nextRecords);
        setTotals(nextTotals);
        setBreaks(await supabaseAttendanceService.getBreaks(nextRecords.map((r) => r.id)));
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load your timesheet");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [workspaceId, memberId, bounds, revision]);

  const recordsByDate = useMemo(() => {
    const map = new Map<string, IAttendanceRecord[]>();
    records.forEach((r) => {
      const list = map.get(r.business_date) ?? [];
      list.push(r);
      map.set(r.business_date, list);
    });
    return map;
  }, [records]);

  const summary = useMemo(
    () =>
      totals.reduce(
        (acc, day) => ({
          worked: acc.worked + day.shift_seconds,
          tracked: acc.tracked + day.task_seconds,
          days: acc.days + (day.shift_seconds > 0 ? 1 : 0),
          flagged: acc.flagged + (day.needs_review ? 1 : 0),
        }),
        { worked: 0, tracked: 0, days: 0, flagged: 0 }
      ),
    [totals]
  );

  const exportCsv = useCallback(() => {
    const header = ["Date", "First in", "Last out", "Hours on the clock", "Hours attributed", "Needs review"];
    const rows = totals.map((day) => [
      day.business_date,
      formatClockTime(day.first_in),
      formatClockTime(day.last_out),
      toDecimalHours(day.shift_seconds),
      toDecimalHours(day.task_seconds),
      day.needs_review ? "yes" : "no",
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `timesheet-${bounds.from}-to-${bounds.to}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [totals, bounds]);

  return (
    <section aria-label="Your timesheet">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-lg bg-layer-1 p-0.5">
          {(["week", "month"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setRange(option)}
              className={cn(
                "focus-ring rounded-md px-3 py-1 text-13 font-medium capitalize transition-smooth",
                range === option ? "bg-surface-1 text-primary shadow-raised-100" : "text-tertiary hover:text-primary"
              )}
            >
              This {option}
            </button>
          ))}
        </div>

        <Button variant="tertiary" size="sm" onClick={exportCsv} disabled={totals.length === 0}>
          Export CSV
        </Button>
      </header>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryTile label="On the clock" value={formatDuration(summary.worked)} emphasis />
        <SummaryTile label="Attributed to work items" value={formatDuration(summary.tracked)} />
        <SummaryTile label="Days worked" value={String(summary.days)} />
        <SummaryTile
          label="Need review"
          value={String(summary.flagged)}
          tone={summary.flagged > 0 ? "warning" : undefined}
        />
      </div>

      {isLoading && <p className="py-10 text-center text-13 text-placeholder">Loading your timesheet…</p>}

      {error && (
        <p className="rounded-xl border border-danger-subtle bg-danger-subtle px-4 py-3 text-13 text-danger-primary">
          {error}
        </p>
      )}

      {!isLoading && !error && totals.length === 0 && (
        <div className="squircle-card border border-dashed border-subtle px-6 py-12 text-center">
          <p className="text-14 font-medium text-secondary">Nothing recorded this {range}</p>
          <p className="mt-1 text-13 text-placeholder">Clock in above and the day will appear here.</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {totals.map((day) => (
          <article
            key={day.business_date}
            className="interactive-row squircle-card border border-subtle bg-surface-1 px-4 py-3"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <div className="flex items-baseline gap-3">
                <h3 className="text-14 font-semibold text-primary">{formatDayLabel(day.business_date)}</h3>
                <span className="font-code text-12 text-tertiary tabular-nums">
                  {formatClockTime(day.first_in)} – {day.is_open ? "now" : formatClockTime(day.last_out)}
                </span>
                {day.needs_review && (
                  <span className="rounded-full bg-warning-subtle px-2 py-0.5 text-10 font-semibold tracking-wide text-warning-primary uppercase">
                    Check this
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-4">
                <span className="font-code text-15 font-medium text-primary tabular-nums">
                  {formatDuration(day.shift_seconds)}
                </span>
                <span className="font-code text-12 text-placeholder tabular-nums">
                  {formatDuration(day.task_seconds)} attributed
                </span>
              </div>
            </div>

            <DayRibbon
              className="mt-3"
              records={recordsByDate.get(day.business_date) ?? []}
              breaks={breaks}
              now={now}
            />
          </article>
        ))}
      </div>
    </section>
  );
}

function SummaryTile({
  label,
  value,
  emphasis,
  tone,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
  tone?: "warning";
}) {
  return (
    <div className="squircle-card border border-subtle bg-surface-1 px-4 py-3">
      <p className="text-11 font-medium tracking-wide text-placeholder uppercase">{label}</p>
      <p
        className={cn(
          "mt-1 font-code tabular-nums",
          emphasis ? "text-24 font-medium" : "text-20",
          tone === "warning" ? "text-warning-primary" : "text-primary"
        )}
      >
        {value}
      </p>
    </div>
  );
}

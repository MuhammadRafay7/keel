/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useMemo } from "react";
import type { IAttendanceBreak, IAttendanceRecord } from "@keel/types";
import { cn } from "@keel/utils";
import { formatClockTime, formatDuration } from "./helpers";

type TDayRibbonProps = {
  records: IAttendanceRecord[];
  breaks: IAttendanceBreak[];
  now: number;
  className?: string;
};

/** Minutes past local midnight. */
const minutesOf = (iso: string | number): number => {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
};

const HOUR = 60;

/**
 * A day, drawn to scale.
 *
 * A table of clock-in and clock-out times tells you the numbers but not the
 * shape: where the gaps fell, how much of the shift ended up attributed to
 * work items, whether somebody worked straight through. The ribbon is the one
 * view that answers those at a glance, because it is the day itself rather
 * than a summary of it.
 *
 * Two tracks on one time axis. The upper is the shift, with breaks punched out
 * of it — a break reads as an absence of shift, which is what it is. The lower
 * is time attributed to work items. The two are never stacked or summed: the
 * visible gap between a long upper track and a short lower one is the useful
 * number, and hiding it behind a total would be the whole point missed.
 */
export function DayRibbon({ records, breaks, now, className }: TDayRibbonProps) {
  const shifts = useMemo(() => records.filter((r) => r.kind === "shift"), [records]);
  const tasks = useMemo(() => records.filter((r) => r.kind === "task"), [records]);

  // The window is fitted to the day rather than fixed at 00:00–24:00, where a
  // normal shift would occupy a third of the width and the rest would be
  // empty. It never tightens past a working day, so days stay comparable to
  // each other down a list.
  const { start, end } = useMemo(() => {
    const edges = records.flatMap((r) => [minutesOf(r.clock_in_at), minutesOf(r.clock_out_at ?? now)]);

    const earliest = edges.length ? Math.min(...edges) : 9 * HOUR;
    const latest = edges.length ? Math.max(...edges) : 17 * HOUR;

    return {
      start: Math.max(0, Math.min(8 * HOUR, Math.floor(earliest / HOUR) * HOUR)),
      end: Math.min(24 * HOUR, Math.max(18 * HOUR, Math.ceil(latest / HOUR) * HOUR)),
    };
  }, [records, now]);

  const span = Math.max(HOUR, end - start);
  const toPercent = (minutes: number) => ((Math.min(end, Math.max(start, minutes)) - start) / span) * 100;

  const hourTicks = useMemo(() => {
    const ticks: number[] = [];
    // Every second hour on a normal day, every third on a long one, so the
    // labels never collide at narrow widths.
    const step = span > 12 * HOUR ? 3 * HOUR : 2 * HOUR;
    for (let m = Math.ceil(start / step) * step; m < end; m += step) ticks.push(m);
    return ticks;
  }, [start, end, span]);

  const breaksByRecord = useMemo(() => {
    const map = new Map<string, IAttendanceBreak[]>();
    breaks.forEach((b) => {
      const list = map.get(b.record_id) ?? [];
      list.push(b);
      map.set(b.record_id, list);
    });
    return map;
  }, [breaks]);

  if (records.length === 0) {
    return <div className={cn("flex h-12 items-center text-12 text-placeholder", className)}>Nothing recorded</div>;
  }

  return (
    <div className={cn("select-none", className)}>
      <div className="relative">
        {/* Hour grid. Behind both tracks so a segment reads as sitting on the
            timeline rather than next to it. */}
        <div className="pointer-events-none absolute inset-0 flex" aria-hidden="true">
          {hourTicks.map((m) => (
            <div key={m} className="absolute top-0 bottom-0 w-px bg-layer-2" style={{ left: `${toPercent(m)}%` }} />
          ))}
        </div>

        {/* The shift */}
        <div className="relative h-7 rounded-full bg-layer-1">
          {shifts.map((shift) => {
            const from = minutesOf(shift.clock_in_at);
            const to = minutesOf(shift.clock_out_at ?? now);
            const isOpen = !shift.clock_out_at;

            return (
              <div
                key={shift.id}
                className={cn(
                  "absolute top-0 bottom-0 rounded-full transition-smooth",
                  shift.needs_review ? "bg-warning-primary/80" : "bg-accent-primary",
                  isOpen && "animate-pulse"
                )}
                style={{ left: `${toPercent(from)}%`, width: `${Math.max(0.6, toPercent(to) - toPercent(from))}%` }}
                title={`${formatClockTime(shift.clock_in_at)} – ${
                  shift.clock_out_at ? formatClockTime(shift.clock_out_at) : "now"
                }`}
              >
                {(breaksByRecord.get(shift.id) ?? []).map((b) => {
                  const bFrom = minutesOf(b.started_at);
                  const bTo = minutesOf(b.ended_at ?? now);
                  const left = ((bFrom - from) / Math.max(1, to - from)) * 100;
                  const width = ((bTo - bFrom) / Math.max(1, to - from)) * 100;

                  return (
                    <div
                      key={b.id}
                      className="absolute top-0 bottom-0 bg-canvas"
                      style={{ left: `${Math.max(0, left)}%`, width: `${Math.max(0.8, width)}%` }}
                      title={`Break, ${formatDuration(((bTo - bFrom) * 60) | 0)}`}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Time attributed to work items, on the same axis */}
        <div className="relative mt-1 h-1.5">
          {tasks.map((task) => {
            const from = minutesOf(task.clock_in_at);
            const to = minutesOf(task.clock_out_at ?? now);

            return (
              <div
                key={task.id}
                className={cn(
                  "absolute top-0 bottom-0 rounded-full",
                  task.needs_review ? "bg-warning-primary/60" : "bg-accent-primary/45"
                )}
                style={{ left: `${toPercent(from)}%`, width: `${Math.max(0.6, toPercent(to) - toPercent(from))}%` }}
                title={`Tracked ${formatClockTime(task.clock_in_at)} – ${
                  task.clock_out_at ? formatClockTime(task.clock_out_at) : "now"
                }`}
              />
            );
          })}
        </div>
      </div>

      <div className="relative mt-1.5 h-3.5">
        {hourTicks.map((m) => (
          <span
            key={m}
            className="absolute -translate-x-1/2 font-code text-10 text-placeholder tabular-nums"
            style={{ left: `${toPercent(m)}%` }}
          >
            {String(Math.floor(m / 60)).padStart(2, "0")}
          </span>
        ))}
      </div>
    </div>
  );
}

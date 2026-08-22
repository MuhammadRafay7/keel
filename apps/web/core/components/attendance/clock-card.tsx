/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { Button } from "@keel/propel/button";
import { cn } from "@keel/utils";
import { formatClockTime, formatDuration, formatElapsed } from "./helpers";
import type { useAttendance } from "./use-attendance";

type TClockCardProps = {
  attendance: ReturnType<typeof useAttendance>;
  className?: string;
};

/**
 * The clock.
 *
 * One number, large, monospaced and tabular, because it is the only thing on
 * the page that changes every second and digits that shift width as they tick
 * turn a calm readout into a fidget. Everything else on the card is quiet so
 * the count is what the eye lands on.
 */
export function ClockCard({ attendance, className }: TClockCardProps) {
  const {
    state,
    openShift,
    openTask,
    today,
    shiftSeconds,
    taskSeconds,
    breakSeconds,
    isBusy,
    error,
    clearError,
    clockIn,
    clockOut,
    startBreak,
    endBreak,
    stopTimer,
  } = attendance;

  const isOut = state === "out";
  const isOnBreak = state === "break";

  const hasWorkedToday = today.workedSeconds > 0 || today.sessions > 0;

  const statusLabel = isOut
    ? hasWorkedToday
      ? "Done for now"
      : "Not clocked in"
    : isOnBreak
      ? `On a break since ${formatClockTime(attendance.openBreak?.started_at)}`
      : `Clocked in at ${formatClockTime(openShift?.clock_in_at)}`;

  return (
    <section
      className={cn(
        "specular-border relative overflow-hidden squircle-card border border-subtle bg-surface-1 p-6",
        className
      )}
      aria-label="Your clock"
    >
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn("size-2 shrink-0 rounded-full transition-smooth", {
                "bg-success-primary": state === "in",
                "bg-warning-primary": isOnBreak,
                "bg-layer-3": isOut,
              })}
              aria-hidden="true"
            />
            <span className="text-12 font-medium tracking-wide text-secondary uppercase">{statusLabel}</span>
          </div>

          <div
            className={cn(
              "mt-2 font-code text-40 leading-none font-medium tabular-nums transition-smooth",
              isOut ? "text-placeholder" : isOnBreak ? "text-warning-primary" : "text-primary"
            )}
            // Screen readers should hear a duration, not a stream of digits
            // re-announced every second.
            aria-live="off"
          >
            {isOut
              ? hasWorkedToday
                ? formatDuration(today.workedSeconds)
                : "--:--"
              : formatElapsed(isOnBreak ? breakSeconds : shiftSeconds)}
          </div>

          <p className="mt-2 text-12 text-tertiary">
            {isOut
              ? hasWorkedToday
                ? `Worked today across ${today.sessions} session${today.sessions === 1 ? "" : "s"}`
                : "Your day starts when you clock in."
              : isOnBreak
                ? `Break so far. Today's total is ${formatDuration(today.workedSeconds)}`
                : `This session. Today's total is ${formatDuration(today.workedSeconds)}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isOut ? (
            <Button variant="primary" size="lg" onClick={clockIn} loading={isBusy}>
              Clock in
            </Button>
          ) : (
            <>
              <Button variant="secondary" size="lg" onClick={isOnBreak ? endBreak : startBreak} disabled={isBusy}>
                {isOnBreak ? "End break" : "Start break"}
              </Button>
              <Button variant="primary" size="lg" onClick={clockOut} loading={isBusy}>
                Clock out
              </Button>
            </>
          )}
        </div>
      </div>

      {(hasWorkedToday || !isOut) && (
        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-subtle pt-4 sm:grid-cols-4">
          <Fact label="Today" value={formatDuration(today.workedSeconds)} emphasis />
          <Fact label="Came in" value={formatClockTime(today.arrivedAt)} />
          <Fact label="Breaks" value={today.breakSeconds > 0 ? formatDuration(today.breakSeconds) : "None"} />
          <Fact
            label="On work items"
            value={today.taskSeconds > 0 ? formatDuration(today.taskSeconds) : "Not tracked"}
          />
        </dl>
      )}

      {openTask && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent-subtle bg-accent-subtle/60 px-4 py-3">
          <div className="min-w-0">
            <p className="text-11 font-semibold tracking-wide text-accent-primary uppercase">Timer running</p>
            <p className="mt-0.5 truncate text-13 text-secondary">
              Against a work item since {formatClockTime(openTask.clock_in_at)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-code text-18 text-accent-primary tabular-nums">{formatElapsed(taskSeconds)}</span>
            <Button variant="tertiary" size="sm" onClick={stopTimer} disabled={isBusy}>
              Stop timer
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div
          className="mt-5 flex items-start justify-between gap-3 rounded-xl border border-danger-subtle bg-danger-subtle px-4 py-3"
          role="alert"
        >
          <p className="text-13 text-danger-primary">{error}</p>
          <button
            type="button"
            onClick={clearError}
            className="shrink-0 focus-ring rounded-sm text-12 font-medium text-danger-primary underline-offset-2 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}
    </section>
  );
}

/**
 * One fact about today. A description list rather than divs: these are
 * label/value pairs, and a screen reader should hear them as such.
 */
function Fact({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div>
      <dt className="text-11 font-medium tracking-wide text-placeholder uppercase">{label}</dt>
      <dd
        className={cn(
          "mt-0.5 font-code tabular-nums",
          emphasis ? "text-18 font-medium text-primary" : "text-14 text-secondary"
        )}
      >
        {value}
      </dd>
    </div>
  );
}

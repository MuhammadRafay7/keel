/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import * as React from "react";
import { cn } from "../utils";

export type TIssuePriorities = "urgent" | "high" | "medium" | "low" | "none";

interface IPriorityIcon {
  className?: string;
  containerClassName?: string;
  priority: TIssuePriorities | undefined | null;
  size?: number;
  withContainer?: boolean;
}

/**
 * Three bars rising left to right, with as many filled as the priority is high.
 *
 * This replaces lucide's `SignalHigh` / `SignalMedium` / `SignalLow`. Those draw
 * only the bars they need and anchor them to the left of the box, so each level
 * sat at a different horizontal offset — the old component papered over it with
 * a per-priority `translate-x` nudge, and the icons still failed to line up in a
 * column of work items.
 *
 * Drawing all three bars every time and varying only the fill fixes that: the
 * glyph occupies the same box at every level, so a list reads as one column. It
 * also makes the scale legible on sight — an unfilled bar is visibly a step not
 * taken, which a shorter icon never communicates.
 */
function SignalBars({ level, size, className }: { level: 0 | 1 | 2 | 3; size: number; className?: string }) {
  const bars = [
    { x: 1.5, height: 5 },
    { x: 6.25, height: 9.5 },
    { x: 11, height: 14 },
  ];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
    >
      {bars.map((bar, index) => (
        <rect
          // oxlint-disable-next-line react/no-array-index-key
          key={index}
          x={bar.x}
          y={15 - bar.height}
          width={3.5}
          height={bar.height}
          rx={1.25}
          fill="currentColor"
          // Unfilled steps stay visible but recede, so the glyph still reads as
          // a three-step scale rather than as a shorter icon.
          opacity={index < level ? 1 : 0.25}
        />
      ))}
    </svg>
  );
}

/** Urgent is a different shape, not a fuller bar — it has to stop the eye. */
function UrgentIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
    >
      <rect x="1" y="1" width="14" height="14" rx="4" fill="currentColor" />
      <rect x="7.1" y="4" width="1.8" height="5.4" rx="0.9" className="fill-on-color" />
      <rect x="7.1" y="10.6" width="1.8" height="1.8" rx="0.9" className="fill-on-color" />
    </svg>
  );
}

/** No priority set: the same three steps, none of them taken. */
function NoneIcon({ size, className }: { size: number; className?: string }) {
  return <SignalBars level={0} size={size} className={className} />;
}

const LEVELS: Record<TIssuePriorities, 0 | 1 | 2 | 3> = {
  urgent: 3,
  high: 3,
  medium: 2,
  low: 1,
  none: 0,
};

export function PriorityIcon(props: IPriorityIcon) {
  const { priority, className = "", containerClassName = "", size = 14, withContainer = false } = props;
  const resolved: TIssuePriorities = priority ?? "none";

  const priorityClasses: Record<TIssuePriorities, string> = {
    urgent: "bg-priority-urgent/10 text-priority-urgent border-priority-urgent/40",
    high: "bg-priority-high/10 text-priority-high border-priority-high/40",
    medium: "bg-priority-medium/10 text-priority-medium border-priority-medium/40",
    low: "bg-priority-low/10 text-priority-low border-priority-low/40",
    none: "bg-layer-2 text-priority-none border-priority-none/30",
  };

  const colorClass = {
    urgent: "text-priority-urgent",
    high: "text-priority-high",
    medium: "text-priority-medium",
    low: "text-priority-low",
    none: "text-priority-none",
  }[resolved];

  const glyph =
    resolved === "urgent" ? (
      <UrgentIcon size={size} className={className} />
    ) : resolved === "none" ? (
      <NoneIcon size={size} className={className} />
    ) : (
      <SignalBars level={LEVELS[resolved]} size={size} className={className} />
    );

  if (!withContainer) return <span className={cn("inline-flex", colorClass)}>{glyph}</span>;

  return (
    <div
      className={cn(
        "flex flex-shrink-0 items-center justify-center rounded-md border p-0.5",
        priorityClasses[resolved],
        containerClassName
      )}
    >
      {glyph}
    </div>
  );
}

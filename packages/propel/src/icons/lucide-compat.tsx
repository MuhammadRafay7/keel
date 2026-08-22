/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import * as React from "react";
import type { ISvgIcons } from "./type";
import { cn } from "../utils";

export function ALargeSmall({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M21 14h-5" />
      <path d="M16 16v-3.5a2.5 2.5 0 0 1 5 0V16" />
      <path d="M4.5 13h6" />
      <path d="m3 16 4.5-9 4.5 9" />
    </svg>
  );
}

export function AlertCircle({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

export function AlertOctagon({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

export function AlertTriangle({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export function AlertTriangleIcon({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export function AlignLeft({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <line x1="21" y1="6" x2="3" y2="6" />
      <line x1="15" y1="12" x2="3" y2="12" />
      <line x1="17" y1="18" x2="3" y2="18" />
    </svg>
  );
}

export function ArchiveRestore({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <rect width="20" height="5" x="2" y="3" rx="1" />
      <path d="M4 8v11a2 2 0 0 0 2 2h2" />
      <path d="M20 8v5" />
      <path d="m9 15 3-3 3 3" />
      <path d="M12 12v9" />
    </svg>
  );
}

export function ArchiveRestoreIcon({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <rect width="20" height="5" x="2" y="3" rx="1" />
      <path d="M4 8v11a2 2 0 0 0 2 2h2" />
      <path d="M20 8v5" />
      <path d="m9 15 3-3 3 3" />
      <path d="M12 12v9" />
    </svg>
  );
}

export function ArchiveX({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <rect width="20" height="5" x="2" y="3" rx="1" />
      <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
      <path d="m9.5 11.5 5 5" />
      <path d="m14.5 11.5-5 5" />
    </svg>
  );
}

export function ArrowDown({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </svg>
  );
}

export function ArrowDownWideNarrow({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="m3 16 4 4 4-4" />
      <path d="M7 20V4" />
      <path d="M11 4h10" />
      <path d="M11 8h7" />
      <path d="M11 12h4" />
    </svg>
  );
}

export function ArrowLeft({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

export function ArrowRight({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export function ArrowRightCircle({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
      <path d="m12 8 4 4-4 4" />
    </svg>
  );
}

export function ArrowRightLeft({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="m16 3 4 4-4 4" />
      <path d="M20 7H4" />
      <path d="m8 21-4-4 4-4" />
      <path d="M4 17h16" />
    </svg>
  );
}

export function ArrowUp({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}

export function ArrowUpNarrowWide({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="m3 8 4-4 4 4" />
      <path d="M7 4v16" />
      <path d="M11 12h4" />
      <path d="M11 16h7" />
      <path d="M11 20h10" />
    </svg>
  );
}

export function ArrowUpToLine({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M5 3h14" />
      <path d="m18 13-6-6-6 6" />
      <path d="M12 7v14" />
    </svg>
  );
}

export function ArrowUpWideNarrow({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="m3 8 4-4 4 4" />
      <path d="M7 4v16" />
      <path d="M11 4h10" />
      <path d="M11 8h7" />
      <path d="M11 12h4" />
    </svg>
  );
}

export function Ban({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m4.93 4.93 14.14 14.14" />
    </svg>
  );
}

export function BarChart2({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

export function BarChart4({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M3 3v18h18" />
      <rect width="4" height="7" x="7" y="10" rx="1" />
      <rect width="4" height="12" x="15" y="5" rx="1" />
    </svg>
  );
}

export function Bell({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

export function BellOff({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M8.7 3A6 6 0 0 1 18 8c0 2.4.7 4.5 1.7 6.2" />
      <path d="M17 17H3s3-2 3-9c0-.8.1-1.6.4-2.3" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

export function Bot({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  );
}

export function Box({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

export function Briefcase({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <rect width="20" height="14" x="2" y="7" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

export function Building({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <rect width="16" height="20" x="4" y="2" rx="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  );
}

export function Calendar({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

export function CalendarCheck({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <path d="m9 16 2 2 4-4" />
    </svg>
  );
}

export function CalendarDays({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M8 18h.01" />
      <path d="M12 18h.01" />
      <path d="M16 18h.01" />
    </svg>
  );
}

export function ChartNoAxesColumn({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

export function Check({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function CheckCheck({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M18 6 7 17l-5-5" />
      <path d="m22 10-7.5 7.5L13 16" />
    </svg>
  );
}

export function CheckCircle({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

export function CheckCircle2({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function CheckSquare({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

export function ChevronDown({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function ChevronRight({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export function ChevronUp({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

export function Circle({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

export function CircleAlert({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

export function CircleArrowUp({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="16 12 12 8 8 12" />
      <line x1="12" y1="16" x2="12" y2="8" />
    </svg>
  );
}

export function CircleCheck({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function CircleDashed({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="10" stroke-dasharray="4 4" />
    </svg>
  );
}

export function CircleDot({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function CircleMinus({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

export function CirclePlus({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

export function CircleUser({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="10" r="3" />
      <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
    </svg>
  );
}

export function CircleUserRound({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="10" r="3" />
      <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
    </svg>
  );
}

export function CircleX({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

export function Clipboard({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <rect width="8" height="4" x="8" y="2" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    </svg>
  );
}

export function Clock({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export function CloudOff({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <line x1="2" y1="2" x2="22" y2="22" />
      <path d="M5.782 5.782A7 7 0 0 0 4 10a5 5 0 0 0 4.567 4.978" />
      <path d="M12.33 6.1a7 7 0 0 1 6.55 3.9A5 5 0 0 1 19 20h-8" />
    </svg>
  );
}

export function Component({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M5.5 8.5 9 12l-3.5 3.5L2 12l3.5-3.5Z" />
      <path d="m12 2 3.5 3.5L12 9 8.5 5.5 12 2Z" />
      <path d="M18.5 8.5 22 12l-3.5 3.5L15 12l3.5-3.5Z" />
      <path d="m12 15 3.5 3.5L12 22l-3.5-3.5L12 15Z" />
    </svg>
  );
}

export function CopyPlus({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <rect width="14" height="14" x="8" y="8" rx="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
      <line x1="12" y1="15" x2="18" y2="15" />
      <line x1="15" y1="12" x2="15" y2="18" />
    </svg>
  );
}

export function CornerDownRight({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <polyline points="15 10 20 15 15 20" />
      <path d="M4 4v7a4 4 0 0 0 4 4h12" />
    </svg>
  );
}

export function CreditCard({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  );
}

export function Crown({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7Z" />
    </svg>
  );
}

export function Dot({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="1" />
    </svg>
  );
}

export function Download({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

export function Earth({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

export function Ellipsis({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  );
}

export function Eraser({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="m7 21-4.3-4.3a1 1 0 0 1 0-1.4l13-13a1 1 0 0 1 1.4 0l4.3 4.3a1 1 0 0 1 0 1.4L8.4 21Z" />
      <path d="M22 21H7" />
      <path d="m5 11 9 9" />
    </svg>
  );
}

export function Expand({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}

export function ExternalLink({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

export function Eye({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function EyeIcon({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function EyeOff({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

export function FileCode({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="m10 13-2 2 2 2" />
      <path d="m14 13 2 2-2 2" />
    </svg>
  );
}

export function FileOutput({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M4 15h8" />
      <path d="m9 12 3 3-3 3" />
    </svg>
  );
}

export function FileSearch({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <circle cx="11.5" cy="14.5" r="2.5" />
      <path d="M13.25 16.25 15 18" />
    </svg>
  );
}

export function FileSpreadsheet({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M8 13h8" />
      <path d="M8 17h8" />
      <path d="M12 10v10" />
    </svg>
  );
}

export function FileStack({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M21 7h-3a2 2 0 0 1-2-2V2" />
      <path d="M21 6v6.5c0 .8-.7 1.5-1.5 1.5h-7c-.8 0-1.5-.7-1.5-1.5v-9c0-.8.7-1.5 1.5-1.5H17Z" />
      <path d="M7 8v8.8c0 .7.6 1.2 1.3 1.2h8.4" />
      <path d="M3 12v8.8c0 .7.6 1.2 1.3 1.2h8.4" />
    </svg>
  );
}

export function FileText({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}

export function Folder({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
    </svg>
  );
}

export function FolderPlus({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M12 10v6" />
      <path d="M9 13h6" />
      <path d="M20 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2Z" />
    </svg>
  );
}

export function GitBranch({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <line x1="6" y1="3" x2="6" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  );
}

export function GripVertical({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <circle cx="9" cy="12" r="1" />
      <circle cx="9" cy="5" r="1" />
      <circle cx="9" cy="19" r="1" />
      <circle cx="15" cy="12" r="1" />
      <circle cx="15" cy="5" r="1" />
      <circle cx="15" cy="19" r="1" />
    </svg>
  );
}

export function Hash({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10" y1="3" x2="8" y2="21" />
      <line x1="16" y1="3" x2="14" y2="21" />
    </svg>
  );
}

export function HelpCircle({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export function History({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <polyline points="12 7 12 12 15 15" />
    </svg>
  );
}

export function Home({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

export function Hotel({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z" />
      <path d="m9 16 3-3 3 3" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M16 10h.01" />
      <path d="M8 10h.01" />
    </svg>
  );
}

export function ImageIcon({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}

export function Inbox({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}

export function Info({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

export function KeyRound({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" />
      <circle cx="16.5" cy="7.5" r=".5" fill="currentColor" />
    </svg>
  );
}

export function Languages({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="m5 8 6 6" />
      <path d="m4 14 6-6 2 3" />
      <path d="M2 5h12" />
      <path d="M7 2h1" />
      <path d="m22 22-5-10-5 10" />
      <path d="M14 18h6" />
    </svg>
  );
}

export function Layers({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 12.5-8.58 3.91a2 2 0 0 1-1.66 0L3.18 12.5" />
      <path d="m22 17.5-8.58 3.91a2 2 0 0 1-1.66 0L3.18 17.5" />
    </svg>
  );
}

export function LayoutGrid({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  );
}

export function LayoutGridIcon({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  );
}

export function Lightbulb({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.6 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );
}

export function Link({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

export function Link2Icon({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M9 17H7A5 5 0 0 1 7 7h2" />
      <path d="M15 7h2a5 5 0 1 1 0 10h-2" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

export function ListFilter({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M3 6h18" />
      <path d="M7 12h10" />
      <path d="M10 18h4" />
    </svg>
  );
}

export function ListFilterPlus({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M3 6h18" />
      <path d="M7 12h10" />
      <path d="M10 18h4" />
    </svg>
  );
}

export function ListTodo({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <rect width="6" height="6" x="3" y="5" rx="1" />
      <path d="m3 17 2 2 4-4" />
      <path d="M13 6h8" />
      <path d="M13 12h8" />
      <path d="M13 18h8" />
    </svg>
  );
}

export function Loader({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
    </svg>
  );
}

export function LockKeyhole({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="16" r="1" />
      <rect width="18" height="12" x="3" y="10" rx="2" />
      <path d="M7 10V7a5 5 0 0 1 10 0v3" />
    </svg>
  );
}

export function LockKeyholeOpen({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="16" r="1" />
      <rect width="18" height="12" x="3" y="10" rx="2" />
      <path d="M7 10V7a5 5 0 0 1 9.9-1" />
    </svg>
  );
}

export function LogOut({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export function Mail({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

export function Mails({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <rect width="16" height="13" x="6" y="4" rx="2" />
      <path d="m22 7-7.1 4.45a2 2 0 0 1-2.1 0L6 7" />
      <path d="M2 8v11a2 2 0 0 0 2 2h14" />
    </svg>
  );
}

export function Maximize2({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}

export function Menu({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}

export function MessageCircle({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z" />
    </svg>
  );
}

export function MessageSquare({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function MessageSquareIcon({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function MessagesSquare({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z" />
      <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
    </svg>
  );
}

export function Microscope({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M6 18h8" />
      <path d="M3 22h18" />
      <path d="M14 22a7 7 0 1 0-14 0" />
      <path d="M9 14h2" />
      <path d="M9 12a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2Z" />
      <path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3" />
    </svg>
  );
}

export function Minimize2({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <polyline points="4 14 10 14 10 20" />
      <polyline points="20 10 14 10 14 4" />
      <line x1="14" y1="10" x2="21" y2="3" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}

export function Minus({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function MinusCircle({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

export function Monitor({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <line x1="12" y1="17" x2="12" y2="21" />
      <line x1="8" y1="21" x2="16" y2="21" />
    </svg>
  );
}

export function Moon({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

export function MoreHorizontal({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  );
}

export function MoreVertical({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}

export function MoreVerticalIcon({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}

export function MoveDiagonal({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <polyline points="13 5 19 5 19 11" />
      <polyline points="11 19 5 19 5 13" />
      <line x1="19" y1="5" x2="5" y2="19" />
    </svg>
  );
}

export function MoveLeft({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M6 8L2 12L6 16" />
      <path d="M2 12H22" />
    </svg>
  );
}

export function MoveRight({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M18 8L22 12L18 16" />
      <path d="M2 12H22" />
    </svg>
  );
}

export function Network({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <rect width="6" height="6" x="16" y="16" rx="1" />
      <rect width="6" height="6" x="2" y="16" rx="1" />
      <rect width="6" height="6" x="9" y="2" rx="1" />
      <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" />
      <path d="M12 12V8" />
    </svg>
  );
}

export function OctagonAlert({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

export function Palette({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.7-.75 1.7-1.7 0-.42-.16-.8-.43-1.09-.27-.29-.44-.68-.44-1.11 0-.9.7-1.6 1.6-1.6h2.2c3 0 5.4-2.4 5.4-5.4 0-4.8-4-8.7-9.1-8.7Z" />
    </svg>
  );
}

export function PanelLeft({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
    </svg>
  );
}

export function PanelRight({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <line x1="15" y1="3" x2="15" y2="21" />
    </svg>
  );
}

export function Paperclip({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57a4 4 0 1 1 5.66 5.66l-8.59 8.58a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

export function PaperclipIcon({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57a4 4 0 1 1 5.66 5.66l-8.59 8.58a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

export function PenSquare({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

export function PenTool({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="m12 19 7-7 3 3-7 7-3-3z" />
      <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18z" />
      <circle cx="11" cy="11" r="2" />
    </svg>
  );
}

export function Pencil({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}

export function Pin({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <line x1="12" y1="17" x2="12" y2="22" />
      <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a1 1 0 0 0 0-2H8a1 1 0 0 0 0 2h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
    </svg>
  );
}

export function PinOff({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <line x1="2" y1="2" x2="22" y2="22" />
      <line x1="12" y1="17" x2="12" y2="22" />
      <path d="M9 9v1.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h12" />
      <path d="M15 9.34V6h1a1 1 0 0 0 0-2H9" />
    </svg>
  );
}

export function Plus({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function RefreshCcw({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

export function RefreshCw({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
    </svg>
  );
}

export function Rocket({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-3.05 11a22.35 22.35 0 0 1-3.95 2z" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export function RotateCcw({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

export function Send({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

export function Settings({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function Settings2({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M20 7h-9" />
      <path d="M14 17H5" />
      <circle cx="17" cy="7" r="3" />
      <circle cx="7" cy="17" r="3" />
    </svg>
  );
}

export function SettingsIcon({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function Share2({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

export function Shrink({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <polyline points="4 14 10 14 10 20" />
      <polyline points="20 10 14 10 14 4" />
      <line x1="14" y1="10" x2="21" y2="3" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}

export function Signal({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M2 20h.01" />
      <path d="M7 20v-4" />
      <path d="M12 20v-8" />
      <path d="M17 20V8" />
      <path d="M22 20V4" />
    </svg>
  );
}

export function SignalHigh({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M2 20h.01" />
      <path d="M7 20v-4" />
      <path d="M12 20v-8" />
      <path d="M17 20V8" />
    </svg>
  );
}

export function SignalMediumIcon({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M2 20h.01" />
      <path d="M7 20v-4" />
      <path d="M12 20v-8" />
    </svg>
  );
}

export function SlidersHorizontal({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <line x1="21" y1="4" x2="14" y2="4" />
      <line x1="10" y1="4" x2="3" y2="4" />
      <line x1="21" y1="12" x2="12" y2="12" />
      <line x1="8" y1="12" x2="3" y2="12" />
      <line x1="21" y1="20" x2="16" y2="20" />
      <line x1="12" y1="20" x2="3" y2="20" />
      <line x1="14" y1="2" x2="14" y2="6" />
      <line x1="8" y1="10" x2="8" y2="14" />
      <line x1="16" y1="18" x2="16" y2="22" />
    </svg>
  );
}

export function SmilePlus({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M22 11v1a10 10 0 1 1-9-10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
      <line x1="19" y1="2" x2="19" y2="8" />
      <line x1="16" y1="5" x2="22" y2="5" />
    </svg>
  );
}

export function Sparkle({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  );
}

export function Sparkles({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  );
}

export function SquarePlus({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

export function SquareStackIcon({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <rect width="14" height="14" x="8" y="8" rx="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

export function SquareUser({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <circle cx="12" cy="10" r="3" />
      <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
    </svg>
  );
}

export function Star({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function StarOff({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <line x1="2" y1="2" x2="22" y2="22" />
      <path d="M8.34 8.34 2 9.27l5 4.87L5.82 21.02 12 17.77l5.35 2.81" />
    </svg>
  );
}

export function StickyNote({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3z" />
      <polyline points="14 3 14 9 20 9" />
    </svg>
  );
}

export function Sun({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
      <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
      <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
    </svg>
  );
}

export function Tag({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
      <circle cx="7" cy="7" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function TagIcon({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
      <circle cx="7" cy="7" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function TicketCheck({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function Timer({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <line x1="10" y1="2" x2="14" y2="2" />
      <line x1="12" y1="14" x2="15" y2="11" />
      <circle cx="12" cy="14" r="8" />
    </svg>
  );
}

export function Trash2({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

export function TrendingDown({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
      <polyline points="16 17 22 17 22 11" />
    </svg>
  );
}

export function TrendingUp({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

export function Triangle({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M13.73 4a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    </svg>
  );
}

export function TriangleAlert({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export function TriangleIcon({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M13.73 4a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    </svg>
  );
}

export function Type({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  );
}

export function UploadCloud({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M4 14.89A6 6 0 0 1 10 4a7 7 0 0 1 6.55 3.9A5 5 0 0 1 19 18h-2" />
      <polyline points="16 12 12 8 8 12" />
      <line x1="12" y1="8" x2="12" y2="21" />
    </svg>
  );
}

export function User({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function UserMinus2({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  );
}

export function UserPlus({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="17" y1="11" x2="23" y2="11" />
    </svg>
  );
}

export function UserPlus2({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="17" y1="11" x2="23" y2="11" />
    </svg>
  );
}

export function UserRound({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg>
  );
}

export function Users({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function Users2Icon({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function UsersIcon({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function Webhook({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2" />
      <path d="m6 17 3.13-5.78c.53-.96.53-2.02 0-2.98L6 2.5" />
      <circle cx="12" cy="2" r="2" />
      <circle cx="20" cy="18" r="2" />
    </svg>
  );
}

export function X({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export function XCircle({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}

export function Zap({ className, width, height, size, strokeWidth = 1.5, ...props }: ISvgIcons) {
  const iconWidth = size ?? width ?? 16;
  const iconHeight = size ?? height ?? 16;
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

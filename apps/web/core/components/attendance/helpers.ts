/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { IAttendanceRecord } from "@keel/types";

export const SECONDS_PER_DAY = 86_400;

/**
 * A running clock, as digits that do not move sideways as they tick.
 *
 * The seconds are what make it read as *running* rather than as a total, so
 * they stay on the live readout and come off everywhere else.
 */
export const formatElapsed = (seconds: number): string => {
  const safe = Math.max(0, Math.floor(seconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

/** A settled total: "7h 42m", or "42m" under the hour. Never "0h 42m". */
export const formatDuration = (seconds: number): string => {
  const safe = Math.max(0, Math.floor(seconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);

  if (h === 0 && m === 0) return "—";
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

/** Decimal hours, for exports and anything that will be multiplied by a rate. */
export const toDecimalHours = (seconds: number): string => (Math.max(0, seconds) / 3600).toFixed(2);

export const formatClockTime = (iso: string | null | undefined): string =>
  iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }) : "—";

const startOfDay = (d: Date): number => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** "Today" / "Yesterday" / "Mon 12 Mar", matching how the chat view labels days. */
export const formatDayLabel = (businessDate: string): string => {
  const [y, m, d] = businessDate.split("-").map(Number);
  if (!y || !m || !d) return businessDate;

  const date = new Date(y, m - 1, d);
  const days = Math.round((startOfDay(new Date()) - startOfDay(date)) / 86_400_000);

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";

  return date.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" });
};

export const toISODate = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

/** The Monday-based week containing `date`, as ISO dates. */
export const weekRange = (date: Date): { from: string; to: string } => {
  const day = (date.getDay() + 6) % 7;
  const monday = new Date(date);
  monday.setDate(date.getDate() - day);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { from: toISODate(monday), to: toISODate(sunday) };
};

export const monthRange = (date: Date): { from: string; to: string } => ({
  from: toISODate(new Date(date.getFullYear(), date.getMonth(), 1)),
  to: toISODate(new Date(date.getFullYear(), date.getMonth() + 1, 0)),
});

/** Seconds a record has run for, counting up while it is still open. */
export const recordSeconds = (record: IAttendanceRecord, now: number): number => {
  const start = new Date(record.clock_in_at).getTime();
  const end = record.clock_out_at ? new Date(record.clock_out_at).getTime() : now;
  return Math.max(0, (end - start) / 1000);
};

/**
 * Where a moment falls in its local day, as a fraction — the coordinate the
 * day ribbon is drawn in.
 */
export const dayFraction = (iso: string, now: number): number => {
  const t = new Date(iso || now).getTime();
  const d = new Date(t);
  const seconds = d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
  return Math.min(1, Math.max(0, seconds / SECONDS_PER_DAY));
};

/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

/**
 * A shift is the working day. A task span is time against a work item, and is
 * a breakdown *within* a shift rather than an addition to it — the two are
 * never summed.
 */
export type TAttendanceKind = "shift" | "task";

/** How the row got here. `auto` means the sweep guessed an end time. */
export type TAttendanceSource = "web" | "manual" | "auto";

/**
 * `superseded` rows are the originals a correction replaced. They stay so an
 * exported month can be reproduced exactly as it was exported.
 */
export type TAttendanceStatus = "open" | "closed" | "auto_closed" | "superseded";

export type TAttendanceRequestStatus = "pending" | "approved" | "rejected" | "withdrawn";

export type TLeaveRequestStatus = "pending" | "approved" | "rejected" | "cancelled";

export type TLeaveDayPortion = "full" | "first_half" | "second_half";

/** What somebody is doing right now, for the team view. */
export type TAttendanceState = "in" | "break" | "leave" | "out";

export interface IAttendanceRecord {
  id: string;
  created_at: string;
  updated_at: string;
  workspace_id: string;
  member_id: string;
  kind: TAttendanceKind;
  project_id: string | null;
  issue_id: string | null;
  clock_in_at: string;
  clock_out_at: string | null;
  /**
   * The employee's local date, frozen at clock-in. Reports group on this, so
   * an overnight shift stays on the day it started and a later timezone change
   * cannot rewrite last year's numbers.
   */
  business_date: string;
  tz: string;
  source: TAttendanceSource;
  status: TAttendanceStatus;
  needs_review: boolean;
  superseded_by_id: string | null;
  note: string;
  deleted_at: string | null;
}

export interface IAttendanceBreak {
  id: string;
  created_at: string;
  record_id: string;
  started_at: string;
  ended_at: string | null;
}

export interface IAttendanceDayTotal {
  member_id: string;
  business_date: string;
  /** Worked seconds, breaks already deducted. */
  shift_seconds: number;
  break_seconds: number;
  /** Time attributed to work items on the same day. Never added to the above. */
  task_seconds: number;
  first_in: string | null;
  last_out: string | null;
  is_open: boolean;
  needs_review: boolean;
}

export interface IAttendanceTeamMember {
  member_id: string;
  state: TAttendanceState;
  clock_in_at: string | null;
  elapsed_seconds: number;
  break_seconds: number;
  active_issue_id: string | null;
  active_project_id: string | null;
  on_leave: boolean;
}

export interface IAttendanceCorrection {
  id: string;
  created_at: string;
  updated_at: string;
  workspace_id: string;
  member_id: string;
  /** Null when the request is "there is no record of this at all". */
  record_id: string | null;
  requested_clock_in_at: string;
  requested_clock_out_at: string | null;
  reason: string;
  status: TAttendanceRequestStatus;
  reviewed_by_id: string | null;
  reviewed_at: string | null;
  review_note: string;
  resulting_record_id: string | null;
}

export interface ILeaveType {
  id: string;
  workspace_id: string;
  name: string;
  colour: string;
  annual_allowance: number;
  allows_half_day: boolean;
  carryover_days: number;
  is_paid: boolean;
  is_balance_tracked: boolean;
  is_active: boolean;
}

export interface ILeaveBalance {
  id: string;
  workspace_id: string;
  member_id: string;
  leave_type_id: string;
  year: number;
  allocated: number;
  carried_over: number;
  used: number;
}

export interface ILeaveRequest {
  id: string;
  created_at: string;
  updated_at: string;
  workspace_id: string;
  member_id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  day_portion: TLeaveDayPortion;
  /** Working days, counted at request time with holidays already excluded. */
  days: number;
  reason: string;
  status: TLeaveRequestStatus;
  reviewed_by_id: string | null;
  reviewed_at: string | null;
  review_note: string;
}

export interface IWorkSchedule {
  id: string;
  workspace_id: string;
  member_id: string;
  /** ISO weekday numbers, 1 = Monday. */
  workdays: number[];
  start_time: string;
  end_time: string;
  break_minutes: number;
  grace_minutes: number | null;
  is_active: boolean;
}

export interface IWorkspaceHoliday {
  id: string;
  workspace_id: string;
  holiday_date: string;
  name: string;
}

export interface IAttendanceSettings {
  workspace_id: string;
  default_shift_hours: number;
  auto_close_grace_hours: number;
  task_timer_max_hours: number;
  default_grace_minutes: number;
  is_task_tracking_enabled: boolean;
  is_manual_entry_enabled: boolean;
  /**
   * Reviews everyone who has no approver of their own. Null falls through to
   * the workspace admins.
   */
  default_approver_id?: string | null;
}

export interface IAttendanceApprover {
  id: string;
  workspace_id: string;
  member_id: string;
  approver_id: string;
}

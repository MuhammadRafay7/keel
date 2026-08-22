/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { RealtimeChannel } from "@supabase/supabase-js";
import type {
  IAttendanceApprover,
  IAttendanceBreak,
  IAttendanceCorrection,
  IAttendanceDayTotal,
  IAttendanceRecord,
  IAttendanceSettings,
  IAttendanceTeamMember,
  ILeaveBalance,
  ILeaveRequest,
  ILeaveType,
  IWorkSchedule,
  IWorkspaceHoliday,
  TLeaveDayPortion,
} from "@keel/types";
import { getSupabase } from "./client";

/**
 * Attendance.
 *
 * Nothing here inserts into a table that records time. Every write is an RPC,
 * because the clock has to be the server's — a client that could post its own
 * timestamps could post the hours it wished it had worked. Reads go straight
 * at the tables, where RLS decides what comes back.
 */
export class AttendanceService {
  /**
   * Ensures the workspace has settings and a starting set of leave types.
   * Idempotent, so the page calls it on open rather than checking first.
   */
  async bootstrap(workspaceId: string): Promise<IAttendanceSettings> {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc("attendance_bootstrap", { p_workspace_id: workspaceId });
    if (error) throw error;
    return data as IAttendanceSettings;
  }

  // -------------------------------------------------------------------------
  // Clocking
  // -------------------------------------------------------------------------

  async clockIn(workspaceId: string, note = ""): Promise<IAttendanceRecord> {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc("attendance_clock_in", {
      p_workspace_id: workspaceId,
      p_note: note,
    });
    if (error) throw error;
    return data as IAttendanceRecord;
  }

  async clockOut(note = ""): Promise<IAttendanceRecord> {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc("attendance_clock_out", { p_note: note });
    if (error) throw error;
    return data as IAttendanceRecord;
  }

  async startBreak(): Promise<IAttendanceBreak> {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc("attendance_break_start");
    if (error) throw error;
    return data as IAttendanceBreak;
  }

  async endBreak(): Promise<IAttendanceBreak> {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc("attendance_break_end");
    if (error) throw error;
    return data as IAttendanceBreak;
  }

  // -------------------------------------------------------------------------
  // Task timers
  // -------------------------------------------------------------------------

  /**
   * Starting a second timer stops the first — the server does that in one
   * statement, so there is no window where two are running.
   */
  async startTaskTimer(workspaceId: string, issueId: string, projectId?: string): Promise<IAttendanceRecord> {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc("attendance_start_task_timer", {
      p_workspace_id: workspaceId,
      p_issue_id: issueId,
      p_project_id: projectId ?? null,
    });
    if (error) throw error;
    return data as IAttendanceRecord;
  }

  async stopTaskTimer(): Promise<IAttendanceRecord> {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc("attendance_stop_task_timer");
    if (error) throw error;
    return data as IAttendanceRecord;
  }

  /** Time remembered rather than observed. Lands marked `manual`. */
  async logManual(payload: {
    workspaceId: string;
    startedAt: string;
    endedAt: string;
    kind?: "shift" | "task";
    issueId?: string | null;
    note?: string;
  }): Promise<IAttendanceRecord> {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc("attendance_log_manual", {
      p_workspace_id: payload.workspaceId,
      p_started_at: payload.startedAt,
      p_ended_at: payload.endedAt,
      p_kind: payload.kind ?? "task",
      p_issue_id: payload.issueId ?? null,
      p_note: payload.note ?? "",
    });
    if (error) throw error;
    return data as IAttendanceRecord;
  }

  // -------------------------------------------------------------------------
  // Reading time
  // -------------------------------------------------------------------------

  /** The open shift and open timer, if either exists. */
  async getOpenRecords(workspaceId: string, memberId: string): Promise<IAttendanceRecord[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("attendance_records")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("member_id", memberId)
      .is("clock_out_at", null)
      .is("deleted_at", null);
    if (error) throw error;
    return (data ?? []) as IAttendanceRecord[];
  }

  async getOpenBreak(recordId: string): Promise<IAttendanceBreak | null> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("attendance_breaks")
      .select("*")
      .eq("record_id", recordId)
      .is("ended_at", null)
      .maybeSingle();
    if (error) throw error;
    return (data as IAttendanceBreak) ?? null;
  }

  /**
   * Raw spans for a date range. `superseded` rows are excluded: they are the
   * originals corrections replaced, kept for the audit trail, and showing them
   * would double-count the day.
   */
  async getRecords(params: {
    workspaceId: string;
    from: string;
    to: string;
    memberId?: string;
  }): Promise<IAttendanceRecord[]> {
    const supabase = getSupabase();
    let query = supabase
      .from("attendance_records")
      .select("*")
      .eq("workspace_id", params.workspaceId)
      .gte("business_date", params.from)
      .lte("business_date", params.to)
      .neq("status", "superseded")
      .is("deleted_at", null)
      .order("clock_in_at", { ascending: true });

    if (params.memberId) query = query.eq("member_id", params.memberId);

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as IAttendanceRecord[];
  }

  async getBreaks(recordIds: string[]): Promise<IAttendanceBreak[]> {
    if (recordIds.length === 0) return [];
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("attendance_breaks")
      .select("*")
      .in("record_id", recordIds)
      .order("started_at", { ascending: true });
    if (error) throw error;
    return (data ?? []) as IAttendanceBreak[];
  }

  /**
   * Every span logged against one work item, so a detail panel can show what
   * it has actually cost next to what it was estimated at.
   */
  async getIssueTime(issueId: string): Promise<IAttendanceRecord[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("attendance_records")
      .select("*")
      .eq("issue_id", issueId)
      .neq("status", "superseded")
      .is("deleted_at", null)
      .order("clock_in_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as IAttendanceRecord[];
  }

  /**
   * Day totals, computed in Postgres so the dashboard and an export cannot
   * disagree about the same week.
   */
  async getDayTotals(params: {
    workspaceId: string;
    from: string;
    to: string;
    memberId?: string;
  }): Promise<IAttendanceDayTotal[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc("attendance_day_totals", {
      p_workspace_id: params.workspaceId,
      p_from: params.from,
      p_to: params.to,
      p_member_id: params.memberId ?? null,
    });
    if (error) throw error;
    return (data ?? []) as IAttendanceDayTotal[];
  }

  async getTeamToday(workspaceId: string): Promise<IAttendanceTeamMember[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc("attendance_team_today", { p_workspace_id: workspaceId });
    if (error) throw error;
    return (data ?? []) as IAttendanceTeamMember[];
  }

  // -------------------------------------------------------------------------
  // Corrections
  // -------------------------------------------------------------------------

  async requestCorrection(payload: {
    workspaceId: string;
    requestedClockInAt: string;
    requestedClockOutAt?: string | null;
    recordId?: string | null;
    reason?: string;
  }): Promise<IAttendanceCorrection> {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc("attendance_request_correction", {
      p_workspace_id: payload.workspaceId,
      p_requested_clock_in_at: payload.requestedClockInAt,
      p_requested_clock_out_at: payload.requestedClockOutAt ?? null,
      p_record_id: payload.recordId ?? null,
      p_reason: payload.reason ?? "",
    });
    if (error) throw error;
    return data as IAttendanceCorrection;
  }

  async reviewCorrection(correctionId: string, approve: boolean, note = ""): Promise<IAttendanceCorrection> {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc("attendance_review_correction", {
      p_correction_id: correctionId,
      p_approve: approve,
      p_note: note,
    });
    if (error) throw error;
    return data as IAttendanceCorrection;
  }

  async withdrawCorrection(correctionId: string): Promise<IAttendanceCorrection> {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc("attendance_withdraw_correction", {
      p_correction_id: correctionId,
    });
    if (error) throw error;
    return data as IAttendanceCorrection;
  }

  /** RLS narrows this to the caller's own requests plus anything they review. */
  async getCorrections(workspaceId: string, status?: string): Promise<IAttendanceCorrection[]> {
    const supabase = getSupabase();
    let query = supabase
      .from("attendance_corrections")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as IAttendanceCorrection[];
  }

  // -------------------------------------------------------------------------
  // Leave
  // -------------------------------------------------------------------------

  async getLeaveTypes(workspaceId: string): Promise<ILeaveType[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("leave_types")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("is_active", true)
      .order("name", { ascending: true });
    if (error) throw error;
    return (data ?? []) as ILeaveType[];
  }

  /**
   * Admin writes on the configuration tables go straight at them rather than
   * through an RPC: unlike a clock-in, there is no server-side truth to
   * establish, and the `write as admin` policies already gate them.
   */
  async createLeaveType(
    workspaceId: string,
    payload: Partial<Omit<ILeaveType, "id" | "workspace_id">> & { name: string }
  ): Promise<ILeaveType> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("leave_types")
      .insert({ ...payload, workspace_id: workspaceId })
      .select()
      .single();
    if (error) throw error;
    return data as ILeaveType;
  }

  async updateLeaveType(leaveTypeId: string, patch: Partial<ILeaveType>): Promise<ILeaveType> {
    const supabase = getSupabase();
    const { data, error } = await supabase.from("leave_types").update(patch).eq("id", leaveTypeId).select().single();
    if (error) throw error;
    return data as ILeaveType;
  }

  /**
   * Retires a leave type rather than deleting it. `leave_requests.leave_type_id`
   * is `on delete restrict` for a reason — removing a type would orphan the
   * history of everyone who ever took that kind of leave.
   */
  async retireLeaveType(leaveTypeId: string): Promise<ILeaveType> {
    return this.updateLeaveType(leaveTypeId, { is_active: false });
  }

  /** Includes retired types, which the member-facing list deliberately hides. */
  async getAllLeaveTypes(workspaceId: string): Promise<ILeaveType[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("leave_types")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("is_active", { ascending: false })
      .order("name", { ascending: true });
    if (error) throw error;
    return (data ?? []) as ILeaveType[];
  }

  /**
   * Sets somebody's allowance for a year. This is the documented way to grant
   * more than the type's default — the balance check refuses to go negative,
   * so an exception has to be recorded rather than waved through.
   */
  async setLeaveBalance(payload: {
    workspaceId: string;
    memberId: string;
    leaveTypeId: string;
    year: number;
    allocated: number;
    carriedOver?: number;
  }): Promise<ILeaveBalance> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("leave_balances")
      .upsert(
        {
          workspace_id: payload.workspaceId,
          member_id: payload.memberId,
          leave_type_id: payload.leaveTypeId,
          year: payload.year,
          allocated: payload.allocated,
          carried_over: payload.carriedOver ?? 0,
        },
        { onConflict: "workspace_id,member_id,leave_type_id,year" }
      )
      .select()
      .single();
    if (error) throw error;
    return data as ILeaveBalance;
  }

  async getLeaveBalances(workspaceId: string, memberId: string, year: number): Promise<ILeaveBalance[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("leave_balances")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("member_id", memberId)
      .eq("year", year);
    if (error) throw error;
    return (data ?? []) as ILeaveBalance[];
  }

  async getLeaveRequests(workspaceId: string, status?: string): Promise<ILeaveRequest[]> {
    const supabase = getSupabase();
    let query = supabase
      .from("leave_requests")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("start_date", { ascending: false });

    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as ILeaveRequest[];
  }

  async requestLeave(payload: {
    workspaceId: string;
    leaveTypeId: string;
    startDate: string;
    endDate: string;
    dayPortion?: TLeaveDayPortion;
    reason?: string;
  }): Promise<ILeaveRequest> {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc("attendance_request_leave", {
      p_workspace_id: payload.workspaceId,
      p_leave_type_id: payload.leaveTypeId,
      p_start_date: payload.startDate,
      p_end_date: payload.endDate,
      p_day_portion: payload.dayPortion ?? "full",
      p_reason: payload.reason ?? "",
    });
    if (error) throw error;
    return data as ILeaveRequest;
  }

  async reviewLeave(requestId: string, approve: boolean, note = ""): Promise<ILeaveRequest> {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc("attendance_review_leave", {
      p_request_id: requestId,
      p_approve: approve,
      p_note: note,
    });
    if (error) throw error;
    return data as ILeaveRequest;
  }

  async cancelLeave(requestId: string): Promise<ILeaveRequest> {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc("attendance_cancel_leave", { p_request_id: requestId });
    if (error) throw error;
    return data as ILeaveRequest;
  }

  /** Working days a request would cost, holidays and rest days already removed. */
  async previewLeaveDays(payload: {
    workspaceId: string;
    memberId: string;
    startDate: string;
    endDate: string;
    dayPortion?: TLeaveDayPortion;
  }): Promise<number> {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc("attendance_leave_days", {
      p_workspace_id: payload.workspaceId,
      p_member_id: payload.memberId,
      p_start_date: payload.startDate,
      p_end_date: payload.endDate,
      p_day_portion: payload.dayPortion ?? "full",
    });
    if (error) throw error;
    return Number(data ?? 0);
  }

  // -------------------------------------------------------------------------
  // Configuration
  // -------------------------------------------------------------------------

  async getSettings(workspaceId: string): Promise<IAttendanceSettings | null> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("attendance_settings")
      .select("*")
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    if (error) throw error;
    return (data as IAttendanceSettings) ?? null;
  }

  async updateSettings(
    workspaceId: string,
    patch: Partial<Omit<IAttendanceSettings, "workspace_id">>
  ): Promise<IAttendanceSettings> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("attendance_settings")
      .update(patch)
      .eq("workspace_id", workspaceId)
      .select()
      .single();
    if (error) throw error;
    return data as IAttendanceSettings;
  }

  async getSchedules(workspaceId: string): Promise<IWorkSchedule[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase.from("work_schedules").select("*").eq("workspace_id", workspaceId);
    if (error) throw error;
    return (data ?? []) as IWorkSchedule[];
  }

  async upsertSchedule(schedule: Omit<IWorkSchedule, "id">): Promise<IWorkSchedule> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("work_schedules")
      .upsert(schedule, { onConflict: "workspace_id,member_id" })
      .select()
      .single();
    if (error) throw error;
    return data as IWorkSchedule;
  }

  async getHolidays(workspaceId: string, year?: number): Promise<IWorkspaceHoliday[]> {
    const supabase = getSupabase();
    let query = supabase
      .from("workspace_holidays")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("holiday_date", { ascending: true });

    if (year) query = query.gte("holiday_date", `${year}-01-01`).lte("holiday_date", `${year}-12-31`);

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as IWorkspaceHoliday[];
  }

  async addHoliday(workspaceId: string, holidayDate: string, name: string): Promise<IWorkspaceHoliday> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("workspace_holidays")
      .insert({ workspace_id: workspaceId, holiday_date: holidayDate, name })
      .select()
      .single();
    if (error) throw error;
    return data as IWorkspaceHoliday;
  }

  async removeHoliday(holidayId: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from("workspace_holidays").delete().eq("id", holidayId);
    if (error) throw error;
  }

  async deleteSchedule(scheduleId: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from("work_schedules").delete().eq("id", scheduleId);
    if (error) throw error;
  }

  async addApprover(workspaceId: string, memberId: string, approverId: string): Promise<IAttendanceApprover> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("attendance_approvers")
      .insert({ workspace_id: workspaceId, member_id: memberId, approver_id: approverId })
      .select()
      .single();
    if (error) throw error;
    return data as IAttendanceApprover;
  }

  async removeApprover(approverRowId: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from("attendance_approvers").delete().eq("id", approverRowId);
    if (error) throw error;
  }

  async getApprovers(workspaceId: string): Promise<IAttendanceApprover[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase.from("attendance_approvers").select("*").eq("workspace_id", workspaceId);
    if (error) throw error;
    return (data ?? []) as IAttendanceApprover[];
  }

  // -------------------------------------------------------------------------
  // Realtime
  // -------------------------------------------------------------------------

  /**
   * Pushes for the team view. Clocking out is an UPDATE, so both events are
   * subscribed — the migration sets replica identity accordingly.
   */
  subscribeToWorkspace(workspaceId: string, onChange: () => void): () => void {
    const supabase = getSupabase();

    const subscription: RealtimeChannel = supabase
      .channel(`attendance:${workspaceId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "attendance_records", filter: `workspace_id=eq.${workspaceId}` },
        () => onChange()
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(subscription);
    };
  }
}

export const supabaseAttendanceService = new AttendanceService();

/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { IAnalyticsResponse, TAnalyticsFilterParams } from "@keel/types";

import { getSupabase } from "./client";

/**
 * The workspace analytics panel.
 *
 * Every card on both tabs comes from a single `workspace_analytics` call. The
 * function returns one row of counts; the two tabs read different keys out of
 * it, which is why there is no per-tab branching here.
 *
 * The counts run as the caller, so a project the user cannot see contributes
 * nothing — the panel is scoped by RLS rather than by anything asserted here.
 */
export class SupabaseAnalyticsService {
  // `tab` is not a parameter here: both tabs read different keys out of the
  // same row, so there is nothing for the query to branch on.
  async getAdvanceAnalytics(workspaceSlug: string, params?: TAnalyticsFilterParams): Promise<IAnalyticsResponse> {
    const { data, error } = await getSupabase().rpc("workspace_analytics", {
      p_workspace_slug: workspaceSlug,
      // The panel sends a comma-joined string; the function takes a uuid array.
      p_project_ids: this.toIdArray(params?.project_ids),
      p_cycle_id: params?.cycle_id ?? null,
      p_module_id: params?.module_id ?? null,
    });

    if (error) throw new Error(`Failed to load analytics: ${error.message}`);

    // A set-returning function comes back as an array of one row.
    const row = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | undefined;
    if (!row) return this.emptyResponse();

    return {
      total_users: Number(row.total_users ?? 0),
      total_admins: Number(row.total_admins ?? 0),
      total_members: Number(row.total_members ?? 0),
      total_guests: Number(row.total_guests ?? 0),
      total_projects: Number(row.total_projects ?? 0),
      total_cycles: Number(row.total_cycles ?? 0),
      total_intake: Number(row.total_intake ?? 0),
      total_work_items: Number(row.total_work_items ?? 0),
      backlog_work_items: Number(row.backlog_work_items ?? 0),
      un_started_work_items: Number(row.un_started_work_items ?? 0),
      started_work_items: Number(row.started_work_items ?? 0),
      completed_work_items: Number(row.completed_work_items ?? 0),
      cancelled_work_items: Number(row.cancelled_work_items ?? 0),
    };
  }

  /**
   * The per-project insight table.
   *
   * Projects with nothing filed come back at zero rather than being omitted, so
   * the table stays a roster of what exists.
   */
  async getAdvanceAnalyticsStats(
    workspaceSlug: string,
    params?: TAnalyticsFilterParams
  ): Promise<Record<string, unknown>[]> {
    const { data, error } = await getSupabase().rpc("workspace_work_item_stats", {
      p_workspace_slug: workspaceSlug,
      p_project_ids: this.toIdArray(params?.project_ids),
      p_cycle_id: params?.cycle_id ?? null,
      p_module_id: params?.module_id ?? null,
    });

    if (error) throw new Error(`Failed to load analytics: ${error.message}`);

    return ((data ?? []) as unknown as Record<string, unknown>[]).map((row) => ({
      project_id: String(row.project_id ?? ""),
      project__name: (row.project__name as string) ?? "",
      total_work_items: Number(row.total_work_items ?? 0),
      backlog_work_items: Number(row.backlog_work_items ?? 0),
      un_started_work_items: Number(row.un_started_work_items ?? 0),
      started_work_items: Number(row.started_work_items ?? 0),
      completed_work_items: Number(row.completed_work_items ?? 0),
      cancelled_work_items: Number(row.cancelled_work_items ?? 0),
    }));
  }

  /** "id-a,id-b" → ["id-a", "id-b"]; absent or empty → null, meaning no filter. */
  private toIdArray(value: string | undefined): string[] | null {
    if (!value) return null;
    const ids = value
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
    return ids.length > 0 ? ids : null;
  }

  private emptyResponse(): IAnalyticsResponse {
    return {
      total_users: 0,
      total_admins: 0,
      total_members: 0,
      total_guests: 0,
      total_projects: 0,
      total_cycles: 0,
      total_intake: 0,
      total_work_items: 0,
      backlog_work_items: 0,
      un_started_work_items: 0,
      started_work_items: 0,
      completed_work_items: 0,
      cancelled_work_items: 0,
    };
  }
}

export const supabaseAnalyticsService = new SupabaseAnalyticsService();

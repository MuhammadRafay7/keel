/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type {
  IUserActivityResponse,
  IUserPriorityDistribution,
  IUserProfileProjectSegregation,
  IUserProfileData,
  IUserStateDistribution,
  TIssuePriorities,
  TIssue,
  TIssuesResponse,
  TStateGroups,
} from "@keel/types";

import { getSupabase } from "./client";
import { ISSUE_SELECT, supabaseWorkItemService } from "./work-item.service";

const escapeCsv = (value: unknown): string => {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const STATE_GROUPS: TStateGroups[] = ["backlog", "unstarted", "started", "completed", "cancelled"];
const PRIORITIES: TIssuePriorities[] = ["urgent", "high", "medium", "low", "none"];

/**
 * The "Your work" screens: one person's work items across a whole workspace,
 * and the counts summarising them.
 *
 * Scoped by workspace rather than project, so the queries here filter on
 * workspace_id and lean on the work item RLS policy to drop anything in a
 * project the viewer cannot see.
 */
export class SupabaseUserWorkItemService {
  private async workspaceIdFromSlug(workspaceSlug: string): Promise<string> {
    const { data, error } = await getSupabase().from("workspaces").select("id").eq("slug", workspaceSlug).single();

    if (error || !data) throw new Error(`Failed to find the workspace: ${error?.message ?? workspaceSlug}`);

    return (data as { id: string }).id;
  }

  /** Work item ids linked to a user through a join table. */
  private async issueIdsForUser(
    workspaceId: string,
    table: "issue_assignees" | "issue_subscribers",
    column: "assignee_id" | "subscriber_id",
    userId: string
  ): Promise<string[]> {
    const { data, error } = await getSupabase()
      .from(table)
      .select("issue_id")
      .eq("workspace_id", workspaceId)
      .eq(column, userId);

    if (error) throw new Error(`Failed to load your work items: ${error.message}`);

    return Array.from(new Set((data ?? []).map((row) => (row as { issue_id: string }).issue_id)));
  }

  /**
   * The three profile tabs differ only in how the user is attached to the work
   * item, which the caller signals through the params it would have sent to
   * the REST API: assignees, created_by or subscriber.
   */
  async getUserProfileIssues(
    workspaceSlug: string,
    userId: string,
    params?: { assignees?: string; created_by?: string; subscriber?: string; group_by?: string },
    _config = {}
  ): Promise<TIssuesResponse> {
    const supabase = getSupabase();
    const workspaceId = await this.workspaceIdFromSlug(workspaceSlug);

    let query = supabase
      .from("issues")
      .select(ISSUE_SELECT)
      .eq("workspace_id", workspaceId)
      .eq("is_draft", false)
      .is("deleted_at", null)
      .is("archived_at", null);

    if (params?.created_by) {
      query = query.eq("created_by_id", params.created_by);
    } else {
      const [table, column] = params?.subscriber
        ? (["issue_subscribers", "subscriber_id"] as const)
        : (["issue_assignees", "assignee_id"] as const);

      const issueIds = await this.issueIdsForUser(workspaceId, table, column, userId);

      // No links means no results — not "no filter".
      if (issueIds.length === 0) return this.toResponse([], params?.group_by);

      query = query.in("id", issueIds);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to load your work items: ${error.message}`);

    const issues = (data ?? []).map((row) =>
      supabaseWorkItemService.toIssue(row as unknown as Record<string, unknown>)
    );

    return this.toResponse(issues, params?.group_by);
  }

  /** Counts and distributions behind the profile summary. */
  async getUserProfileData(workspaceSlug: string, userId: string): Promise<IUserProfileData> {
    const supabase = getSupabase();
    const workspaceId = await this.workspaceIdFromSlug(workspaceSlug);

    const [assignedIds, subscribedIds] = await Promise.all([
      this.issueIdsForUser(workspaceId, "issue_assignees", "assignee_id", userId),
      this.issueIdsForUser(workspaceId, "issue_subscribers", "subscriber_id", userId),
    ]);

    const assignedQuery =
      assignedIds.length > 0
        ? supabase
            .from("issues")
            .select("priority, state_id")
            .eq("workspace_id", workspaceId)
            .eq("is_draft", false)
            .is("deleted_at", null)
            .is("archived_at", null)
            .in("id", assignedIds)
        : null;

    const [assignedRows, createdCount, states] = await Promise.all([
      assignedQuery,
      supabase
        .from("issues")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", workspaceId)
        .eq("created_by_id", userId)
        .eq("is_draft", false)
        .is("deleted_at", null)
        .is("archived_at", null),
      supabase.from("states").select("id, group").eq("workspace_id", workspaceId),
    ]);

    if (assignedRows?.error) throw new Error(`Failed to load your work summary: ${assignedRows.error.message}`);
    if (createdCount.error) throw new Error(`Failed to load your work summary: ${createdCount.error.message}`);
    if (states.error) throw new Error(`Failed to load your work summary: ${states.error.message}`);

    const groupByStateId = new Map(
      ((states.data ?? []) as { id: string; group: string }[]).map((state) => [state.id, state.group])
    );

    const assigned = (assignedRows?.data ?? []) as { priority: string | null; state_id: string | null }[];

    const stateCounts = new Map<string, number>();
    const priorityCounts = new Map<string, number>();

    for (const row of assigned) {
      const group = row.state_id ? groupByStateId.get(row.state_id) : undefined;
      if (group) stateCounts.set(group, (stateCounts.get(group) ?? 0) + 1);

      const priority = row.priority ?? "none";
      priorityCounts.set(priority, (priorityCounts.get(priority) ?? 0) + 1);
    }

    const completed = stateCounts.get("completed") ?? 0;
    const cancelled = stateCounts.get("cancelled") ?? 0;

    const state_distribution: IUserStateDistribution[] = STATE_GROUPS.map((group) => ({
      state_group: group,
      state_count: stateCounts.get(group) ?? 0,
    }));

    const priority_distribution: IUserPriorityDistribution[] = PRIORITIES.map((priority) => ({
      priority,
      priority_count: priorityCounts.get(priority) ?? 0,
    }));

    return {
      assigned_issues: assigned.length,
      completed_issues: completed,
      created_issues: createdCount.count ?? 0,
      pending_issues: assigned.length - completed - cancelled,
      subscribed_issues: subscribedIds.length,
      state_distribution,
      priority_distribution,
    };
  }

  /** The activity feed on a person's profile. */
  async getUserProfileActivity(
    workspaceSlug: string,
    userId: string,
    params?: { per_page?: number }
  ): Promise<IUserActivityResponse> {
    const supabase = getSupabase();
    const workspaceId = await this.workspaceIdFromSlug(workspaceSlug);

    const { data, error } = await supabase
      .from("issue_activities")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("actor_id", userId)
      .order("created_at", { ascending: false })
      .limit(params?.per_page ?? 50);

    if (error) throw new Error(`Failed to load activity: ${error.message}`);

    const results = (data ?? []) as unknown as IUserActivityResponse["results"];

    return {
      count: results.length,
      extra_stats: null,
      next_cursor: "",
      next_page_results: false,
      prev_cursor: "",
      prev_page_results: false,
      results,
      total_pages: 1,
      total_results: results.length,
    };
  }

  /** Per-project counts for the profile page, plus the person being viewed. */
  async getUserProfileProjectsSegregation(
    workspaceSlug: string,
    userId: string
  ): Promise<IUserProfileProjectSegregation> {
    const supabase = getSupabase();
    const workspaceId = await this.workspaceIdFromSlug(workspaceSlug);

    const [assignedIds, user, states] = await Promise.all([
      this.issueIdsForUser(workspaceId, "issue_assignees", "assignee_id", userId),
      supabase
        .from("users")
        .select("avatar_url, cover_image_url, display_name, first_name, last_name, date_joined, user_timezone")
        .eq("id", userId)
        .maybeSingle(),
      supabase.from("states").select("id, group").eq("workspace_id", workspaceId),
    ]);

    const groupByStateId = new Map(
      ((states.data ?? []) as { id: string; group: string }[]).map((state) => [state.id, state.group])
    );

    const [assigned, created] = await Promise.all([
      assignedIds.length > 0
        ? supabase.from("issues").select("project_id, state_id").in("id", assignedIds).is("deleted_at", null)
        : null,
      supabase
        .from("issues")
        .select("project_id")
        .eq("workspace_id", workspaceId)
        .eq("created_by_id", userId)
        .is("deleted_at", null),
    ]);

    const byProject = new Map<string, { assigned: number; completed: number; created: number }>();
    const bucket = (projectId: string) => {
      if (!byProject.has(projectId)) byProject.set(projectId, { assigned: 0, completed: 0, created: 0 });
      return byProject.get(projectId)!;
    };

    for (const row of (assigned?.data ?? []) as { project_id: string; state_id: string | null }[]) {
      const entry = bucket(row.project_id);
      entry.assigned += 1;
      if (row.state_id && groupByStateId.get(row.state_id) === "completed") entry.completed += 1;
    }

    for (const row of (created.data ?? []) as { project_id: string }[]) {
      bucket(row.project_id).created += 1;
    }

    return {
      project_data: Array.from(byProject.entries()).map(([id, counts]) => ({
        id,
        assigned_issues: counts.assigned,
        completed_issues: counts.completed,
        created_issues: counts.created,
        pending_issues: counts.assigned - counts.completed,
      })),
      user_data: (user.data ?? {}) as IUserProfileProjectSegregation["user_data"],
    };
  }

  /** The activity export, built in the page rather than mailed as a job. */
  async exportProfileActivityCsv(workspaceSlug: string, userId: string): Promise<{ csv: string; rows: number }> {
    const activity = await this.getUserProfileActivity(workspaceSlug, userId, { per_page: 500 });

    const headers = ["Date", "Work item", "Field", "From", "To", "Comment"];

    const lines = (activity.results as unknown as Record<string, unknown>[]).map((row) =>
      [row.created_at, row.issue_id, row.field, row.old_value, row.new_value, row.comment].map(escapeCsv).join(",")
    );

    return { csv: [headers.join(","), ...lines].join("\n"), rows: lines.length };
  }

  private toResponse(issues: TIssue[], groupBy?: string): TIssuesResponse {
    return {
      grouped_by: groupBy ?? "",
      next_cursor: "",
      prev_cursor: "",
      next_page_results: false,
      prev_page_results: false,
      total_count: issues.length,
      count: issues.length,
      total_pages: 1,
      extra_stats: null,
      results: issues,
      total_results: issues.length,
    };
  }
}

export const supabaseUserWorkItemService = new SupabaseUserWorkItemService();

/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { TIssue, TWorkspaceDraftIssue, TWorkspaceDraftPaginationInfo } from "@keel/types";

import { getSupabase } from "./client";
import { supabaseWorkItemService } from "./work-item.service";

const DRAFT_FIELDS =
  "id, name, description_html, priority, state_id, parent_id, project_id, workspace_id, " +
  "sort_order, start_date, target_date, completed_at, created_at, updated_at, created_by_id, updated_by_id";

/**
 * Drafts are work items a person started and has not committed to a project
 * board yet. They live in their own table, keyed to the author rather than a
 * project, which is why the workspace — not a project — scopes every query.
 */
export class SupabaseDraftService {
  private async currentUserId(): Promise<string> {
    const { data } = await getSupabase().auth.getSession();
    const id = data.session?.user.id;
    if (!id) throw new Error("Not signed in.");
    return id;
  }

  private async workspaceIdFromSlug(workspaceSlug: string): Promise<string> {
    const { data, error } = await getSupabase().from("workspaces").select("id").eq("slug", workspaceSlug).single();

    if (error || !data) throw new Error(`Failed to find the workspace: ${error?.message ?? workspaceSlug}`);

    return (data as { id: string }).id;
  }

  /** Strips the fields that live in join tables rather than on the row. */
  private toColumns(payload: Partial<TWorkspaceDraftIssue | TIssue>): Record<string, unknown> {
    const { assignee_ids, label_ids, module_ids, ...columns } = payload as Record<string, unknown>;
    void assignee_ids;
    void label_ids;
    void module_ids;
    return columns;
  }

  async getIssues(workspaceSlug: string): Promise<TWorkspaceDraftPaginationInfo<TWorkspaceDraftIssue>> {
    const workspaceId = await this.workspaceIdFromSlug(workspaceSlug);
    const userId = await this.currentUserId();

    const { data, error } = await getSupabase()
      .from("draft_issues")
      .select(DRAFT_FIELDS)
      .eq("workspace_id", workspaceId)
      .eq("created_by_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to load your drafts: ${error.message}`);

    const results = (data ?? []) as unknown as TWorkspaceDraftIssue[];

    return {
      next_cursor: undefined,
      prev_cursor: undefined,
      next_page_results: false,
      prev_page_results: false,
      total_pages: 1,
      count: results.length,
      total_count: results.length,
      total_results: results.length,
      results,
      extra_stats: undefined,
      grouped_by: undefined,
      sub_grouped_by: undefined,
    };
  }

  async getIssueById(workspaceSlug: string, issueId: string): Promise<TWorkspaceDraftIssue> {
    const { data, error } = await getSupabase().from("draft_issues").select(DRAFT_FIELDS).eq("id", issueId).single();

    if (error || !data) throw new Error(`Failed to load that draft: ${error?.message ?? issueId}`);

    return data as unknown as TWorkspaceDraftIssue;
  }

  async createIssue(
    workspaceSlug: string,
    payload: Partial<TWorkspaceDraftIssue | TIssue>
  ): Promise<TWorkspaceDraftIssue> {
    const workspaceId = await this.workspaceIdFromSlug(workspaceSlug);
    const userId = await this.currentUserId();
    const now = new Date().toISOString();

    // The link fields are not columns on the draft row; they are applied when
    // the draft is promoted to a real work item.
    const columns = this.toColumns(payload);

    const { data, error } = await getSupabase()
      .from("draft_issues")
      .insert([
        {
          ...columns,
          workspace_id: workspaceId,
          created_at: now,
          updated_at: now,
          created_by_id: userId,
          updated_by_id: userId,
        },
      ])
      .select(DRAFT_FIELDS)
      .single();

    if (error || !data) throw new Error(`Failed to save that draft: ${error?.message ?? "unknown error"}`);

    return data as unknown as TWorkspaceDraftIssue;
  }

  async updateIssue(
    workspaceSlug: string,
    issueId: string,
    payload: Partial<TWorkspaceDraftIssue | TIssue>
  ): Promise<TWorkspaceDraftIssue> {
    const userId = await this.currentUserId();

    const columns = this.toColumns(payload);

    const { data, error } = await getSupabase()
      .from("draft_issues")
      .update({ ...columns, updated_at: new Date().toISOString(), updated_by_id: userId })
      .eq("id", issueId)
      .select(DRAFT_FIELDS)
      .single();

    if (error || !data) throw new Error(`Failed to update that draft: ${error?.message ?? "unknown error"}`);

    return data as unknown as TWorkspaceDraftIssue;
  }

  async deleteIssue(workspaceSlug: string, issueId: string): Promise<void> {
    const { error } = await getSupabase()
      .from("draft_issues")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", issueId);

    if (error) throw new Error(`Failed to delete that draft: ${error.message}`);
  }

  /**
   * Promoting a draft creates a real work item and drops the draft, so a
   * failure part-way leaves the draft in place rather than losing the text.
   */
  async moveIssue(workspaceSlug: string, issueId: string, payload: Partial<TWorkspaceDraftIssue>): Promise<TIssue> {
    const draft = await this.getIssueById(workspaceSlug, issueId);
    const projectId = payload.project_id ?? draft.project_id;

    if (!projectId) throw new Error("Choose a project before moving this draft.");

    const created = await supabaseWorkItemService.createIssue(workspaceSlug, projectId, {
      name: payload.name ?? draft.name,
      description_html: (payload as { description_html?: string }).description_html,
      priority: payload.priority ?? draft.priority,
      state_id: payload.state_id ?? draft.state_id,
      parent_id: payload.parent_id ?? draft.parent_id,
      start_date: payload.start_date ?? draft.start_date,
      target_date: payload.target_date ?? draft.target_date,
      assignee_ids: payload.assignee_ids ?? draft.assignee_ids ?? [],
      label_ids: payload.label_ids ?? draft.label_ids ?? [],
    } as Partial<TIssue>);

    await this.deleteIssue(workspaceSlug, issueId);

    return created;
  }
}

export const supabaseDraftService = new SupabaseDraftService();

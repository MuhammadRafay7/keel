/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { TIssue } from "@keel/types";

import { getSupabase } from "./client";

const ISSUE_FIELDS =
  "id, name, description_html, priority, state_id, parent_id, project_id, sequence_id, sort_order, " +
  "start_date, target_date, completed_at, archived_at, is_draft, estimate_point_id, type_id, " +
  "created_at, updated_at, created_by_id, updated_by_id";

const ISSUE_SELECT = `${ISSUE_FIELDS}, issue_assignees(assignee_id), issue_labels(label_id)`;

/**
 * Work items.
 *
 * Assignees and labels are separate tables, so they arrive as embedded rows and
 * are flattened to the id arrays the application expects. Creation goes through
 * create_work_item (0005), which allocates the per-project sequence number under
 * a lock — that number is what makes a work item addressable as KEEL-4, and two
 * items sharing one would be corruption rather than an inconvenience.
 */
export class SupabaseWorkItemService {
  async createIssue(workspaceSlug: string, projectId: string, data: Partial<TIssue>): Promise<TIssue> {
    const supabase = getSupabase();

    const { data: created, error } = await supabase.rpc("create_work_item", {
      p_project_id: projectId,
      p_name: data.name ?? "",
      p_description_html: data.description_html ?? "<p></p>",
      p_priority: data.priority ?? "none",
      p_state_id: data.state_id ?? null,
      p_parent_id: data.parent_id ?? null,
      p_start_date: data.start_date ?? null,
      p_target_date: data.target_date ?? null,
      p_assignees: data.assignee_ids ?? [],
      p_labels: data.label_ids ?? [],
    });

    if (error) throw new Error(error.message);

    return this.toIssue({
      ...(created as Record<string, unknown>),
      issue_assignees: (data.assignee_ids ?? []).map((id) => ({ assignee_id: id })),
      issue_labels: (data.label_ids ?? []).map((id) => ({ label_id: id })),
    });
  }

  async getIssues(workspaceSlug: string, projectId: string): Promise<TIssue[]> {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("issues")
      .select(ISSUE_SELECT)
      .eq("project_id", projectId)
      .eq("is_draft", false)
      .is("deleted_at", null)
      .is("archived_at", null)
      .order("sort_order", { ascending: true });

    if (error) throw new Error(`Failed to load work items: ${error.message}`);

    return (data ?? []).map((row) => this.toIssue(row as unknown as Record<string, unknown>));
  }

  async retrieve(workspaceSlug: string, projectId: string, issueId: string): Promise<TIssue> {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("issues")
      .select(ISSUE_SELECT)
      .eq("project_id", projectId)
      .eq("id", issueId)
      .is("deleted_at", null)
      .single();

    if (error) throw new Error(`Failed to load that work item: ${error.message}`);

    return this.toIssue(data as unknown as Record<string, unknown>);
  }

  /**
   * Assignees and labels are replaced wholesale when present, because the
   * application sends the complete intended set rather than a delta.
   */
  async updateIssue(workspaceSlug: string, projectId: string, issueId: string, patch: Partial<TIssue>): Promise<void> {
    const supabase = getSupabase();

    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    const direct: (keyof TIssue)[] = [
      "name",
      "description_html",
      "priority",
      "state_id",
      "parent_id",
      "start_date",
      "target_date",
      "sort_order",
      "is_draft",
    ];
    for (const key of direct) {
      if (key in patch) payload[key] = patch[key];
    }

    const { error } = await supabase.from("issues").update(payload).eq("id", issueId);
    if (error) throw new Error(`Failed to save that work item: ${error.message}`);

    if (patch.assignee_ids) {
      await this.replaceLinks("issue_assignees", "assignee_id", issueId, projectId, patch.assignee_ids);
    }
    if (patch.label_ids) {
      await this.replaceLinks("issue_labels", "label_id", issueId, projectId, patch.label_ids);
    }
  }

  /** Soft delete, consistent with the rest of the schema. */
  async deleteIssue(workspaceSlug: string, projectId: string, issueId: string): Promise<void> {
    const supabase = getSupabase();

    const { error } = await supabase.from("issues").update({ deleted_at: new Date().toISOString() }).eq("id", issueId);

    if (error) throw new Error(`Failed to delete that work item: ${error.message}`);
  }

  private async replaceLinks(
    table: "issue_assignees" | "issue_labels",
    column: "assignee_id" | "label_id",
    issueId: string,
    projectId: string,
    ids: string[]
  ): Promise<void> {
    const supabase = getSupabase();

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;

    const { data: project } = await supabase.from("projects").select("workspace_id").eq("id", projectId).single();
    const workspaceId = (project as { workspace_id?: string } | null)?.workspace_id;

    const { error: clearError } = await supabase.from(table).delete().eq("issue_id", issueId);
    if (clearError) throw new Error(`Failed to update that work item: ${clearError.message}`);

    if (ids.length === 0) return;

    const now = new Date().toISOString();
    const rows = ids.map((id) => ({
      created_at: now,
      updated_at: now,
      [column]: id,
      issue_id: issueId,
      project_id: projectId,
      workspace_id: workspaceId,
      created_by_id: userId,
      updated_by_id: userId,
    }));

    const { error } = await supabase.from(table).insert(rows);
    if (error) throw new Error(`Failed to update that work item: ${error.message}`);
  }

  /**
   * Public because intake reads the same rows through a different table and
   * must produce the same shape — a second mapper would be a second set of
   * defaults to keep in step.
   */
  toIssue(row: Record<string, unknown>): TIssue {
    const assignees = (row.issue_assignees ?? []) as { assignee_id: string }[];
    const labels = (row.issue_labels ?? []) as { label_id: string }[];

    return {
      id: String(row.id),
      name: (row.name as string) ?? "",
      description_html: (row.description_html as string) ?? "<p></p>",
      sequence_id: (row.sequence_id as number) ?? 0,
      sort_order: (row.sort_order as number) ?? 0,
      state_id: (row.state_id as string) ?? null,
      priority: (row.priority as TIssue["priority"]) ?? null,
      label_ids: labels.map((l) => l.label_id),
      assignee_ids: assignees.map((a) => a.assignee_id),
      estimate_point: (row.estimate_point_id as string) ?? null,
      project_id: (row.project_id as string) ?? null,
      parent_id: (row.parent_id as string) ?? null,
      type_id: (row.type_id as string) ?? null,
      start_date: (row.start_date as string) ?? null,
      target_date: (row.target_date as string) ?? null,
      completed_at: (row.completed_at as string) ?? null,
      archived_at: (row.archived_at as string) ?? null,
      created_at: (row.created_at as string) ?? "",
      updated_at: (row.updated_at as string) ?? "",
      created_by: (row.created_by_id as string) ?? "",
      updated_by: (row.updated_by_id as string) ?? "",
      is_draft: Boolean(row.is_draft),
      // Cycles and modules are not migrated yet; counts need aggregates that
      // arrive with their own phases.
      cycle_id: null,
      module_ids: null,
      sub_issues_count: 0,
      attachment_count: 0,
      link_count: 0,
    };
  }
}

export const supabaseWorkItemService = new SupabaseWorkItemService();

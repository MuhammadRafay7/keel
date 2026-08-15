/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { TInboxIssue, TInboxIssueWithPagination, TIssue } from "@keel/types";

import { getSupabase } from "./client";
import { supabaseWorkItemService } from "./work-item.service";

const INTAKE_ISSUE_FIELDS =
  "id, status, snoozed_till, duplicate_to_id, source, source_email, intake_id, issue_id, " +
  "project_id, workspace_id, created_at, updated_at, created_by_id";

const ISSUE_SELECT =
  "id, name, description_html, priority, state_id, parent_id, project_id, sequence_id, sort_order, " +
  "start_date, target_date, completed_at, archived_at, is_draft, estimate_point_id, type_id, " +
  "created_at, updated_at, created_by_id, updated_by_id, issue_assignees(assignee_id), issue_labels(label_id)";

/** Django's status codes, unchanged, so stored rows keep their meaning. */
const INTAKE_STATUS = {
  pending: -2,
  rejected: -1,
  snoozed: 0,
  accepted: 1,
  duplicate: 2,
} as const;

/**
 * Intake triage.
 *
 * A filed item is a real work item from the moment it is created, sitting in the
 * project's triage state. Accepting it therefore moves it to the default state
 * rather than converting anything — which is why an accepted item keeps its id,
 * its comments and its history.
 *
 * Status changes go through update_intake_status (0010) because accepting has a
 * second effect on the work item, and the two must not come apart.
 */
export class SupabaseIntakeService {
  async list(workspaceSlug: string, projectId: string, _params: object = {}): Promise<TInboxIssueWithPagination> {
    const { data, error } = await getSupabase()
      .from("intake_issues")
      .select(`${INTAKE_ISSUE_FIELDS}, issue:issues!inner(${ISSUE_SELECT})`)
      .eq("project_id", projectId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to load intake: ${error.message}`);

    const results = (data ?? []).map((row) => this.toInboxIssue(row as Record<string, unknown>));

    // Everything is returned in one page. The pagination envelope is kept
    // because the store reads these fields; it is not a claim that paging works.
    return {
      results,
      count: results.length,
      total_results: results.length,
      total_pages: 1,
      per_page: results.length,
      next_cursor: "",
      prev_cursor: "",
      next_page_results: false,
      prev_page_results: false,
      extra_stats: null,
    };
  }

  async retrieve(workspaceSlug: string, projectId: string, intakeIssueId: string): Promise<TInboxIssue> {
    const { data, error } = await getSupabase()
      .from("intake_issues")
      .select(`${INTAKE_ISSUE_FIELDS}, issue:issues!inner(${ISSUE_SELECT})`)
      .eq("id", intakeIssueId)
      .is("deleted_at", null)
      .single();

    if (error) throw new Error(`Failed to load that intake item: ${error.message}`);
    return this.toInboxIssue(data as unknown as Record<string, unknown>);
  }

  async create(workspaceSlug: string, projectId: string, data: Partial<TIssue>): Promise<TInboxIssue> {
    const supabase = getSupabase();

    const { data: created, error } = await supabase.rpc("create_intake_work_item", {
      p_project_id: projectId,
      p_name: data.name ?? "",
      p_description_html: data.description_html ?? "<p></p>",
      p_priority: data.priority ?? "none",
    });

    if (error) throw new Error(error.message);

    // The function returns the intake row; the work item it wrapped is read
    // back so the caller gets the same shape a list entry has.
    return this.retrieve(workspaceSlug, projectId, String((created as { id: string }).id));
  }

  /**
   * Triage: accept, decline, snooze, or mark as a duplicate. Everything the
   * status implies — leaving triage, or being taken out of the project's work —
   * happens inside the function.
   */
  async update(
    workspaceSlug: string,
    projectId: string,
    intakeIssueId: string,
    patch: Partial<TInboxIssue>
  ): Promise<TInboxIssue> {
    if (patch.status === undefined) {
      // Nothing but status lives on the intake row itself, so a patch without
      // one has nothing to apply.
      return this.retrieve(workspaceSlug, projectId, intakeIssueId);
    }

    const { error } = await getSupabase().rpc("update_intake_status", {
      p_intake_issue_id: intakeIssueId,
      p_status: patch.status,
      p_snoozed_till: patch.snoozed_till ? new Date(patch.snoozed_till).toISOString() : null,
      p_duplicate_to: patch.duplicate_to ?? null,
    });

    if (error) throw new Error(error.message);
    return this.retrieve(workspaceSlug, projectId, intakeIssueId);
  }

  /** Editing the work item behind an intake entry. */
  async updateIssue(
    workspaceSlug: string,
    projectId: string,
    intakeIssueId: string,
    patch: Partial<TIssue>
  ): Promise<TInboxIssue> {
    const existing = await this.retrieve(workspaceSlug, projectId, intakeIssueId);

    await supabaseWorkItemService.updateIssue(workspaceSlug, projectId, existing.issue.id, patch);
    return this.retrieve(workspaceSlug, projectId, intakeIssueId);
  }

  /**
   * Discarding an intake entry takes the work item with it. An orphaned work
   * item in the triage state would be reachable from nowhere.
   */
  async destroy(workspaceSlug: string, projectId: string, intakeIssueId: string): Promise<void> {
    const supabase = getSupabase();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("intake_issues")
      .update({ deleted_at: now, updated_at: now })
      .eq("id", intakeIssueId)
      .select("issue_id")
      .single();

    if (error) throw new Error(`Failed to delete that intake item: ${error.message}`);

    await supabase
      .from("issues")
      .update({ deleted_at: now })
      .eq("id", String((data as { issue_id: string }).issue_id));
  }

  private toInboxIssue(row: Record<string, unknown>): TInboxIssue {
    const issue = (row.issue ?? {}) as Record<string, unknown>;

    return {
      id: String(row.id),
      status: Number(row.status ?? INTAKE_STATUS.pending),
      snoozed_till: row.snoozed_till ? new Date(row.snoozed_till as string) : null,
      duplicate_to: (row.duplicate_to_id as string) ?? undefined,
      source: (row.source as TInboxIssue["source"]) ?? undefined,
      issue: supabaseWorkItemService.toIssue(issue),
      created_by: String(row.created_by_id ?? ""),
      // Resolving the duplicate's name and sequence would be a second query per
      // row; the id above is enough for the UI to link to it.
      duplicate_issue_detail: undefined,
    } as TInboxIssue;
  }
}

export const supabaseIntakeService = new SupabaseIntakeService();

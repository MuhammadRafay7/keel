/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { TIssueActivity } from "@keel/types";

import { getSupabase } from "./client";

const ACTOR_FIELDS = "id, first_name, last_name, display_name, avatar, is_bot";

const ACTIVITY_FIELDS =
  "id, issue_id, project_id, workspace_id, verb, field, old_value, new_value, comment, " +
  "attachments, old_identifier, new_identifier, epoch, issue_comment_id, actor_id, " +
  "created_at, updated_at, created_by_id, updated_by_id";

/**
 * The work item history.
 *
 * Read-only by design. Rows are written by the triggers in 0009 and the client
 * has no INSERT policy, so there is no create method here and there is not
 * meant to be one.
 */
export class SupabaseActivityService {
  /**
   * The feed polls with `created_at__gt` to pick up what has happened since the
   * last look, so the filter is applied rather than ignored — without it every
   * poll re-fetches the whole history.
   */
  async getIssueActivities(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    params: { created_at__gt?: string } | object = {}
  ): Promise<TIssueActivity[]> {
    const supabase = getSupabase();

    let query = supabase
      .from("issue_activities")
      .select(ACTIVITY_FIELDS)
      .eq("issue_id", issueId)
      .order("created_at", { ascending: true });

    const since = (params as { created_at__gt?: string }).created_at__gt;
    if (since) query = query.gt("created_at", since);

    const { data, error } = await query;

    if (error) throw new Error(`Failed to load the activity for this work item: ${error.message}`);

    const rows = (data ?? []) as unknown as Record<string, unknown>[];

    // issue_activities has three foreign keys into users, so an embed would have
    // to name the constraint. The actors are fetched separately instead: one
    // extra query, no dependency on a generated constraint name.
    const actorIds = [...new Set(rows.map((row) => row.actor_id).filter(Boolean))] as string[];
    const actors = new Map<string, Record<string, unknown>>();

    if (actorIds.length > 0) {
      const { data: users } = await supabase.from("users").select(ACTOR_FIELDS).in("id", actorIds);
      for (const user of (users ?? []) as unknown as Record<string, unknown>[]) {
        actors.set(String(user.id), user);
      }
    }

    return rows.map((row) => this.toActivity(row, actors.get(String(row.actor_id)) ?? {}));
  }

  private toActivity(row: Record<string, unknown>, actor: Record<string, unknown>): TIssueActivity {
    return {
      id: String(row.id),
      workspace: String(row.workspace_id ?? ""),
      project: String(row.project_id ?? ""),
      issue: String(row.issue_id ?? ""),
      actor: String(row.actor_id ?? ""),
      actor_detail: {
        id: String(actor.id ?? ""),
        first_name: (actor.first_name as string) ?? "",
        last_name: (actor.last_name as string) ?? "",
        display_name: (actor.display_name as string) ?? "",
        avatar_url: (actor.avatar as string) ?? "",
        is_bot: Boolean(actor.is_bot),
      },
      created_at: String(row.created_at ?? ""),
      updated_at: String(row.updated_at ?? ""),
      created_by: (row.created_by_id as string) ?? undefined,
      updated_by: (row.updated_by_id as string) ?? undefined,
      attachments: (row.attachments ?? []) as unknown[],
      verb: String(row.verb ?? ""),
      field: (row.field as string) ?? undefined,
      old_value: (row.old_value as string) ?? undefined,
      new_value: (row.new_value as string) ?? undefined,
      comment: (row.comment as string) ?? undefined,
      old_identifier: (row.old_identifier as string) ?? undefined,
      new_identifier: (row.new_identifier as string) ?? undefined,
      epoch: Number(row.epoch ?? 0),
      issue_comment: (row.issue_comment_id as string) ?? null,
    } as unknown as TIssueActivity;
  }
}

export const supabaseActivityService = new SupabaseActivityService();

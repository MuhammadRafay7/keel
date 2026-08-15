/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { TIssueComment, TIssueLink, TIssueRelationTypes } from "@keel/types";

import { getSupabase } from "./client";

const COMMENT_FIELDS =
  "id, comment_html, comment_json, comment_stripped, access, actor_id, issue_id, project_id, " +
  "workspace_id, created_at, updated_at, created_by_id, edited_at";

/**
 * Everything attached to a work item: comments, links, reactions and relations.
 *
 * All of these tables carry project_id, so one RLS rule covers them — you reach
 * them through membership of the project. That is why none of these methods
 * check permissions themselves.
 */
export class SupabaseWorkItemDetailService {
  private async context(projectId: string): Promise<{ userId: string; workspaceId: string; now: string }> {
    const supabase = getSupabase();

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    if (!userId) throw new Error("Not signed in.");

    const { data: project, error } = await supabase
      .from("projects")
      .select("workspace_id")
      .eq("id", projectId)
      .single();

    if (error) throw new Error(`Failed to resolve that project: ${error.message}`);

    return {
      userId,
      workspaceId: String((project as { workspace_id: string }).workspace_id),
      now: new Date().toISOString(),
    };
  }

  // -- Comments -------------------------------------------------------------

  async getIssueComments(workspaceSlug: string, projectId: string, issueId: string): Promise<TIssueComment[]> {
    const { data, error } = await getSupabase()
      .from("issue_comments")
      .select(COMMENT_FIELDS)
      .eq("issue_id", issueId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true });

    if (error) throw new Error(`Failed to load comments: ${error.message}`);
    return (data ?? []) as unknown as TIssueComment[];
  }

  async createIssueComment(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    data: Partial<TIssueComment>
  ): Promise<TIssueComment> {
    const { userId, workspaceId, now } = await this.context(projectId);

    const { data: created, error } = await getSupabase()
      .from("issue_comments")
      .insert({
        created_at: now,
        updated_at: now,
        comment_html: data.comment_html ?? "<p></p>",
        comment_json: data.comment_json ?? {},
        // Django kept a plain-text copy for search; left empty until the search
        // slice decides how it is produced.
        comment_stripped: "",
        attachments: [],
        access: data.access ?? "INTERNAL",
        actor_id: userId,
        issue_id: issueId,
        project_id: projectId,
        workspace_id: workspaceId,
        created_by_id: userId,
        updated_by_id: userId,
      })
      .select(COMMENT_FIELDS)
      .single();

    if (error) throw new Error(`Failed to post that comment: ${error.message}`);
    return created as unknown as TIssueComment;
  }

  async patchIssueComment(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    commentId: string,
    data: Partial<TIssueComment>
  ): Promise<TIssueComment> {
    const now = new Date().toISOString();

    const { data: updated, error } = await getSupabase()
      .from("issue_comments")
      .update({
        comment_html: data.comment_html,
        comment_json: data.comment_json,
        updated_at: now,
        edited_at: now,
      })
      .eq("id", commentId)
      .select(COMMENT_FIELDS)
      .single();

    if (error) throw new Error(`Failed to save that comment: ${error.message}`);
    return updated as unknown as TIssueComment;
  }

  async deleteIssueComment(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    commentId: string
  ): Promise<void> {
    const { error } = await getSupabase()
      .from("issue_comments")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", commentId);

    if (error) throw new Error(`Failed to delete that comment: ${error.message}`);
  }

  // -- Links ----------------------------------------------------------------

  async getIssueLinks(workspaceSlug: string, projectId: string, issueId: string): Promise<TIssueLink[]> {
    const { data, error } = await getSupabase()
      .from("issue_links")
      .select("*")
      .eq("issue_id", issueId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true });

    if (error) throw new Error(`Failed to load links: ${error.message}`);
    return (data ?? []) as unknown as TIssueLink[];
  }

  async createIssueLink(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    data: Partial<TIssueLink>
  ): Promise<TIssueLink> {
    const { userId, workspaceId, now } = await this.context(projectId);

    const { data: created, error } = await getSupabase()
      .from("issue_links")
      .insert({
        created_at: now,
        updated_at: now,
        title: data.title ?? "",
        url: data.url ?? "",
        metadata: {},
        issue_id: issueId,
        project_id: projectId,
        workspace_id: workspaceId,
        created_by_id: userId,
        updated_by_id: userId,
      })
      .select("*")
      .single();

    if (error) throw new Error(`Failed to add that link: ${error.message}`);
    return created as unknown as TIssueLink;
  }

  async updateIssueLink(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    linkId: string,
    data: Partial<TIssueLink>
  ): Promise<TIssueLink> {
    const now = new Date().toISOString();

    const { data: updated, error } = await getSupabase()
      .from("issue_links")
      .update({
        title: data.title,
        url: data.url,
        updated_at: now,
      })
      .eq("id", linkId)
      .select("*")
      .single();

    if (error) throw new Error(`Failed to update that link: ${error.message}`);
    return updated as unknown as TIssueLink;
  }

  async deleteIssueLink(workspaceSlug: string, projectId: string, issueId: string, linkId: string): Promise<void> {
    const { error } = await getSupabase().from("issue_links").delete().eq("id", linkId);
    if (error) throw new Error(`Failed to remove that link: ${error.message}`);
  }

  // -- Reactions ------------------------------------------------------------

  async createIssueReaction(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    reaction: string
  ): Promise<void> {
    const { userId, workspaceId, now } = await this.context(projectId);

    const { error } = await getSupabase().from("issue_reactions").insert({
      created_at: now,
      updated_at: now,
      reaction,
      actor_id: userId,
      issue_id: issueId,
      project_id: projectId,
      workspace_id: workspaceId,
      created_by_id: userId,
      updated_by_id: userId,
    });

    if (error) throw new Error(`Failed to add that reaction: ${error.message}`);
  }

  async deleteIssueReaction(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    reaction: string
  ): Promise<void> {
    const supabase = getSupabase();
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;

    const { error } = await supabase
      .from("issue_reactions")
      .delete()
      .eq("issue_id", issueId)
      .eq("reaction", reaction)
      .eq("actor_id", userId);

    if (error) throw new Error(`Failed to remove that reaction: ${error.message}`);
  }

  // -- Relations ------------------------------------------------------------

  async getIssueRelations(workspaceSlug: string, projectId: string, issueId: string): Promise<unknown[]> {
    // A relation is directional, and the work item can sit on either end of it.
    const { data, error } = await getSupabase()
      .from("issue_relations")
      .select("*")
      .or(`issue_id.eq.${issueId},related_issue_id.eq.${issueId}`)
      .is("deleted_at", null);

    if (error) throw new Error(`Failed to load related work items: ${error.message}`);
    return data ?? [];
  }

  async createIssueRelation(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    relationType: TIssueRelationTypes,
    relatedIssueIds: string[]
  ): Promise<void> {
    const { userId, workspaceId, now } = await this.context(projectId);

    const rows = relatedIssueIds.map((relatedId) => ({
      created_at: now,
      updated_at: now,
      relation_type: relationType,
      issue_id: issueId,
      related_issue_id: relatedId,
      project_id: projectId,
      workspace_id: workspaceId,
      created_by_id: userId,
      updated_by_id: userId,
    }));

    const { error } = await getSupabase().from("issue_relations").insert(rows);
    if (error) throw new Error(`Failed to link those work items: ${error.message}`);
  }

  async deleteIssueRelation(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    relatedIssueId: string
  ): Promise<void> {
    const { error } = await getSupabase()
      .from("issue_relations")
      .delete()
      .eq("issue_id", issueId)
      .eq("related_issue_id", relatedIssueId);

    if (error) throw new Error(`Failed to unlink those work items: ${error.message}`);
  }
}

export const supabaseWorkItemDetailService = new SupabaseWorkItemDetailService();

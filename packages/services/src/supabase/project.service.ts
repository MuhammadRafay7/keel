/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { IIssueLabel, TPartialProject, TProject } from "@keel/types";

import { getSupabase } from "./client";

const PROJECT_FIELDS =
  "id, name, identifier, description, network, logo_props, workspace_id, archived_at, created_at, updated_at, " +
  "created_by_id, updated_by_id, project_lead_id, default_assignee_id, default_state_id, estimate_id, " +
  "cycle_view, module_view, issue_views_view, page_view, intake_view, archive_in, close_in, timezone, " +
  "is_time_tracking_enabled, is_issue_type_enabled, guest_view_all_features, cover_image";

/**
 * Projects within a workspace.
 *
 * Creation goes through create_project (0004) because a project is inseparable
 * from its first membership and its six default states — a project without
 * states cannot hold a work item, so a partial create would be worse than none.
 *
 * Visibility follows the `network` column: a public project (2) is readable by
 * the whole workspace, a private one only by its members. That test lives in
 * the RLS policy, so it cannot be forgotten at a call site.
 */
export class SupabaseProjectService {
  private async currentUserId(): Promise<string> {
    const { data } = await getSupabase().auth.getSession();
    const id = data.session?.user.id;
    if (!id) throw new Error("Not signed in.");
    return id;
  }

  async createProject(workspaceSlug: string, data: Partial<TProject>): Promise<TProject> {
    const supabase = getSupabase();

    const { data: created, error } = await supabase.rpc("create_project", {
      p_workspace_slug: workspaceSlug,
      p_name: data.name ?? "",
      p_identifier: data.identifier ?? "",
      p_description: data.description ?? "",
      p_network: data.network ?? 2,
      p_logo_props: data.logo_props ?? {},
    });

    if (error) throw new Error(error.message);

    return this.toProject({ ...(created as Record<string, unknown>), member_role: 20 });
  }

  /**
   * Shaped as `{ status }` to match what the form already reads: true means the
   * identifier is free.
   */
  async checkProjectIdentifierAvailability(workspaceSlug: string, identifier: string): Promise<{ status: boolean }> {
    const supabase = getSupabase();

    const { data, error } = await supabase.rpc("is_project_identifier_available", {
      p_workspace_slug: workspaceSlug,
      p_identifier: identifier,
    });

    if (error) throw new Error(`Failed to check that project ID: ${error.message}`);

    return { status: Boolean(data) };
  }

  async getProjects(workspaceSlug: string): Promise<TProject[]> {
    const rows = await this.selectProjects(workspaceSlug);
    return rows.map((row) => this.toProject(row));
  }

  async getProjectsLite(workspaceSlug: string): Promise<TPartialProject[]> {
    const rows = await this.selectProjects(workspaceSlug);
    return rows.map((row) => this.toProject(row));
  }

  async getProject(workspaceSlug: string, projectId: string): Promise<TProject> {
    const supabase = getSupabase();
    const userId = await this.currentUserId();

    const { data, error } = await supabase
      .from("projects")
      .select(`${PROJECT_FIELDS}, workspace:workspaces!inner(slug), my_membership:project_members(role, member_id)`)
      .eq("workspace.slug", workspaceSlug)
      .eq("id", projectId)
      .eq("my_membership.member_id", userId)
      .is("deleted_at", null)
      .single();

    if (error) throw new Error(`Failed to load that project: ${error.message}`);

    return this.toProject(data as Record<string, unknown>);
  }

  async updateProject(workspaceSlug: string, projectId: string, patch: Partial<TProject>): Promise<TProject> {
    const supabase = getSupabase();

    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    const direct: (keyof TProject)[] = [
      "name",
      "description",
      "network",
      "logo_props",
      "cycle_view",
      "module_view",
      "issue_views_view",
      "page_view",
      "archive_in",
      "close_in",
      "timezone",
      "guest_view_all_features",
    ];
    for (const key of direct) {
      if (key in patch) payload[key] = patch[key];
    }
    // The columns carry an _id suffix the type does not.
    if (patch.project_lead !== undefined) payload.project_lead_id = patch.project_lead ?? null;
    if (patch.default_assignee !== undefined) payload.default_assignee_id = patch.default_assignee ?? null;
    if (patch.default_state !== undefined) payload.default_state_id = patch.default_state ?? null;

    const { data, error } = await supabase
      .from("projects")
      .update(payload)
      .eq("id", projectId)
      .select(PROJECT_FIELDS)
      .single();

    if (error) throw new Error(`Failed to save the project: ${error.message}`);

    return this.toProject(data as Record<string, unknown>);
  }

  /** Soft delete, consistent with the rest of the schema. */
  async deleteProject(workspaceSlug: string, projectId: string): Promise<void> {
    const supabase = getSupabase();

    const { error } = await supabase
      .from("projects")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", projectId);

    if (error) throw new Error(`Failed to delete the project: ${error.message}`);
  }

  // -- Labels ---------------------------------------------------------------
  // Labels belong to a project and are applied to work items, so they live
  // here rather than with the work item that references them.

  async getProjectLabels(workspaceSlug: string, projectId: string): Promise<IIssueLabel[]> {
    const { data, error } = await getSupabase()
      .from("labels")
      .select("*")
      .eq("project_id", projectId)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });

    if (error) throw new Error(`Failed to load labels: ${error.message}`);
    return (data ?? []) as unknown as IIssueLabel[];
  }

  async createLabel(workspaceSlug: string, projectId: string, data: Partial<IIssueLabel>): Promise<IIssueLabel> {
    const supabase = getSupabase();
    const userId = await this.currentUserId();

    const { data: project } = await supabase.from("projects").select("workspace_id").eq("id", projectId).single();
    const now = new Date().toISOString();

    const { data: created, error } = await supabase
      .from("labels")
      .insert({
        created_at: now,
        updated_at: now,
        name: data.name ?? "",
        description: data.description ?? "",
        color: data.color ?? "#60646C",
        sort_order: 65535,
        project_id: projectId,
        workspace_id: (project as { workspace_id?: string } | null)?.workspace_id,
        parent_id: data.parent ?? null,
        created_by_id: userId,
        updated_by_id: userId,
      })
      .select("*")
      .single();

    if (error) throw new Error(`Failed to create that label: ${error.message}`);
    return created as unknown as IIssueLabel;
  }

  async patchLabel(
    workspaceSlug: string,
    projectId: string,
    labelId: string,
    patch: Partial<IIssueLabel>
  ): Promise<IIssueLabel> {
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const key of ["name", "description", "color", "sort_order"] as const) {
      if (key in patch) payload[key] = patch[key as keyof IIssueLabel];
    }

    const { data, error } = await getSupabase().from("labels").update(payload).eq("id", labelId).select("*").single();

    if (error) throw new Error(`Failed to save that label: ${error.message}`);
    return data as unknown as IIssueLabel;
  }

  async deleteLabel(workspaceSlug: string, projectId: string, labelId: string): Promise<void> {
    const { error } = await getSupabase()
      .from("labels")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", labelId);

    if (error) throw new Error(`Failed to delete that label: ${error.message}`);
  }

  private async selectProjects(workspaceSlug: string): Promise<Record<string, unknown>[]> {
    const supabase = getSupabase();
    const userId = await this.currentUserId();

    const { data, error } = await supabase
      .from("projects")
      .select(`${PROJECT_FIELDS}, workspace:workspaces!inner(slug), my_membership:project_members(role, member_id)`)
      .eq("workspace.slug", workspaceSlug)
      .eq("my_membership.member_id", userId)
      .is("deleted_at", null)
      .order("name", { ascending: true });

    if (error) throw new Error(`Failed to load projects: ${error.message}`);

    return (data ?? []) as unknown as Record<string, unknown>[];
  }

  /**
   * `member_role` is null when the user can see the project but has not joined
   * it — a public project they are not a member of. The application relies on
   * that distinction to offer "join" rather than "open".
   */
  private toProject(row: Record<string, unknown>): TProject {
    const membership = row.my_membership as { role?: number }[] | undefined;
    const memberRole = row.member_role ?? membership?.[0]?.role ?? null;

    return {
      id: String(row.id),
      name: (row.name as string) ?? "",
      identifier: (row.identifier as string) ?? "",
      description: (row.description as string) ?? "",
      network: (row.network as number) ?? 2,
      logo_props: (row.logo_props ?? {}) as TProject["logo_props"],
      workspace: String(row.workspace_id ?? ""),
      archived_at: (row.archived_at as string) ?? null,
      sort_order: null,
      member_role: memberRole as TProject["member_role"],
      cycle_view: Boolean(row.cycle_view),
      module_view: Boolean(row.module_view),
      issue_views_view: Boolean(row.issue_views_view),
      page_view: Boolean(row.page_view),
      inbox_view: Boolean(row.intake_view),
      guest_view_all_features: Boolean(row.guest_view_all_features),
      project_lead: (row.project_lead_id as string) ?? null,
      default_assignee: (row.default_assignee_id as string) ?? null,
      default_state: (row.default_state_id as string) ?? null,
      estimate: (row.estimate_id as string) ?? null,
      archive_in: (row.archive_in as number) ?? 0,
      close_in: (row.close_in as number) ?? 0,
      timezone: (row.timezone as string) ?? "UTC",
      cover_image: (row.cover_image as string) ?? undefined,
      created_at: row.created_at as Date,
      updated_at: row.updated_at as Date,
      created_by: (row.created_by_id as string) ?? "",
      updated_by: (row.updated_by_id as string) ?? "",
    };
  }
}

export const supabaseProjectService = new SupabaseProjectService();

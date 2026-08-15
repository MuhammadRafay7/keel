/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { IUserProjectsRole, IWorkspaceMember, IWorkspaceMemberMe } from "@keel/types";

import { getSupabase } from "./client";

const MEMBER_USER_FIELDS = "id, email, first_name, last_name, display_name, avatar, is_bot, is_active";

/**
 * Workspace membership.
 *
 * Every query here is scoped by the workspace slug rather than an id, because
 * that is what the router carries. RLS does the access check, so a slug the
 * user has no membership in simply returns nothing.
 */
export class SupabaseMemberService {
  private async currentUserId(): Promise<string> {
    const { data } = await getSupabase().auth.getSession();
    const id = data.session?.user.id;
    if (!id) throw new Error("Not signed in.");
    return id;
  }

  /**
   * The signed-in user's own membership — the row the permission gate reads
   * before it will render a workspace.
   */
  async workspaceMemberMe(workspaceSlug: string): Promise<IWorkspaceMemberMe> {
    const supabase = getSupabase();
    const userId = await this.currentUserId();

    const { data, error } = await supabase
      .from("workspace_members")
      .select("*, workspace:workspaces!inner(id, slug)")
      .eq("workspace.slug", workspaceSlug)
      .eq("member_id", userId)
      .eq("is_active", true)
      .single();

    if (error) throw new Error(`Failed to load your access to this workspace: ${error.message}`);

    const row = data as Record<string, unknown>;
    const workspace = row.workspace as { id: string } | null;

    return {
      id: String(row.id),
      member: String(row.member_id),
      workspace: String(workspace?.id ?? ""),
      role: row.role as IWorkspaceMemberMe["role"],
      company_role: (row.company_role as string) ?? null,
      created_at: row.created_at as Date,
      updated_at: row.updated_at as Date,
      created_by: (row.created_by_id as string) ?? "",
      updated_by: (row.updated_by_id as string) ?? "",
      view_props: (row.view_props ?? {}) as IWorkspaceMemberMe["view_props"],
      default_props: (row.default_props ?? {}) as IWorkspaceMemberMe["default_props"],
      // Drafts are not migrated yet, so there is nothing to count.
      draft_issue_count: 0,
    };
  }

  /** Everyone in the workspace, with the user record each membership points at. */
  async fetchWorkspaceMembers(workspaceSlug: string): Promise<IWorkspaceMember[]> {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("workspace_members")
      // workspace_members has three foreign keys into users (member, created_by,
      // updated_by), so the embed has to name the constraint it means.
      .select(
        `*, workspace:workspaces!inner(id, slug), member:users!workspace_member_member_id_824f5497_fk_user_id(${MEMBER_USER_FIELDS})`
      )
      .eq("workspace.slug", workspaceSlug)
      .eq("is_active", true);

    if (error) throw new Error(`Failed to load the members of this workspace: ${error.message}`);

    return (data ?? []).map((raw) => {
      const row = raw as Record<string, unknown>;
      const member = (row.member ?? {}) as Record<string, unknown>;

      return {
        id: String(row.id),
        role: row.role,
        is_active: Boolean(row.is_active),
        created_at: row.created_at,
        member: {
          id: String(member.id ?? ""),
          email: (member.email as string) ?? "",
          first_name: (member.first_name as string) ?? "",
          last_name: (member.last_name as string) ?? "",
          display_name: (member.display_name as string) ?? "",
          avatar_url: (member.avatar as string) ?? "",
          is_bot: Boolean(member.is_bot),
        },
      } as unknown as IWorkspaceMember;
    });
  }

  /**
   * The user's role in each project of the workspace, keyed by project id.
   * Projects are not migrated yet, so this is empty rather than absent — the
   * permission store expects a map either way.
   */
  async getWorkspaceUserProjectsRole(workspaceSlug: string): Promise<IUserProjectsRole> {
    const supabase = getSupabase();
    const userId = await this.currentUserId();

    const { data, error } = await supabase
      .from("project_members")
      .select("role, project_id, workspace:workspaces!inner(slug)")
      .eq("workspace.slug", workspaceSlug)
      .eq("member_id", userId)
      .eq("is_active", true);

    if (error) throw new Error(`Failed to load your project access: ${error.message}`);

    const roles: IUserProjectsRole = {};
    for (const raw of data ?? []) {
      const row = raw as Record<string, unknown>;
      roles[String(row.project_id)] = row.role as number;
    }
    return roles;
  }
}

export const supabaseMemberService = new SupabaseMemberService();

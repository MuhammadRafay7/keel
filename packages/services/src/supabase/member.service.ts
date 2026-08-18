/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type {
  IProjectBulkAddFormData,
  IUserProjectsRole,
  IWorkspaceBulkInviteFormData,
  IWorkspaceMember,
  IWorkspaceMemberInvitation,
  IWorkspaceMemberMe,
  TProjectMembership,
} from "@keel/types";

import { getSupabase } from "./client";

const MEMBER_USER_FIELDS = "id, email, first_name, last_name, display_name, avatar, is_bot, is_active";

const PROJECT_MEMBER_FIELDS = "id, member_id, role, is_active, sort_order, project_id, workspace_id, created_at";

const INVITE_FIELDS = "id, email, accepted, token, message, responded_at, role, workspace_id, created_at";

/**
 * Workspace and project membership, and the invitations that produce it.
 *
 * Every query here is scoped by the workspace slug rather than an id, because
 * that is what the router carries. RLS does the access check, so a slug the
 * user has no membership in simply returns nothing.
 *
 * The privileged operations — adding, removing, changing a role, inviting,
 * accepting — go through the functions in 0010 rather than table writes. A role
 * change has consequences a policy cannot express: a workspace must keep an
 * admin, and an invitation must not grant more than its sender holds.
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

    const row = data as unknown as Record<string, unknown>;
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

  // -- Workspace members ----------------------------------------------------

  async updateWorkspaceMember(
    workspaceSlug: string,
    memberId: string,
    data: Partial<IWorkspaceMember>
  ): Promise<IWorkspaceMember> {
    const { error } = await getSupabase().rpc("update_workspace_member_role", {
      p_workspace_slug: workspaceSlug,
      p_member_id: memberId,
      p_role: (data as { role?: number }).role,
    });

    if (error) throw new Error(error.message);

    const members = await this.fetchWorkspaceMembers(workspaceSlug);
    const updated = members.find((member) => member.member.id === memberId);
    if (!updated) throw new Error("The role was changed, but that member could not be read back.");
    return updated;
  }

  /**
   * Removal is a deactivation. The person's work items, comments and activity
   * still point at them, so the row has to survive even when the access does
   * not — and project access goes with it, inside the function.
   */
  async deleteWorkspaceMember(workspaceSlug: string, memberId: string): Promise<void> {
    const { error } = await getSupabase().rpc("remove_workspace_member", {
      p_workspace_slug: workspaceSlug,
      p_member_id: memberId,
    });

    if (error) throw new Error(error.message);
  }

  // -- Workspace invitations ------------------------------------------------

  /**
   * Creates the invitation rows and returns them, tokens included.
   *
   * Transactional email sends the invitation via Resend Edge Function.
   * If email sending fails, the Edge Function deletes the row so no unsent
   * invitation remains in the database.
   */
  async inviteWorkspace(
    workspaceSlug: string,
    data: IWorkspaceBulkInviteFormData
  ): Promise<IWorkspaceMemberInvitation[]> {
    const { data: created, error } = await getSupabase().rpc("create_workspace_invitations", {
      p_workspace_slug: workspaceSlug,
      p_invites: data.emails ?? [],
    });

    if (error) throw new Error(error.message);
    return ((created ?? []) as Record<string, unknown>[]).map((row) => this.toInvitation(row, workspaceSlug));
  }

  /** Invitations sent for this workspace — what the members settings page lists. */
  async workspaceInvitations(workspaceSlug: string): Promise<IWorkspaceMemberInvitation[]> {
    const { data, error } = await getSupabase()
      .from("workspace_member_invites")
      .select(`${INVITE_FIELDS}, workspace:workspaces!inner(id, name, slug, logo)`)
      .eq("workspace.slug", workspaceSlug)
      .eq("accepted", false)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to load invitations: ${error.message}`);
    return (data ?? []).map((row) => this.toInvitation(row as Record<string, unknown>));
  }

  async getWorkspaceInvitation(workspaceSlug: string, invitationId: string): Promise<IWorkspaceMemberInvitation> {
    const { data, error } = await getSupabase()
      .from("workspace_member_invites")
      .select(`${INVITE_FIELDS}, workspace:workspaces(id, name, slug, logo)`)
      .eq("id", invitationId)
      .is("deleted_at", null)
      .single();

    if (error) throw new Error(`Failed to load that invitation: ${error.message}`);
    return this.toInvitation(data as unknown as Record<string, unknown>);
  }

  async updateWorkspaceInvitation(
    workspaceSlug: string,
    invitationId: string,
    data: Partial<IWorkspaceMemberInvitation>
  ): Promise<IWorkspaceMemberInvitation> {
    const { error } = await getSupabase()
      .from("workspace_member_invites")
      .update({ role: data.role, updated_at: new Date().toISOString() })
      .eq("id", invitationId);

    if (error) throw new Error(`Failed to change that invitation: ${error.message}`);
    return this.getWorkspaceInvitation(workspaceSlug, invitationId);
  }

  /** Revoking an invitation that has not been accepted. */
  async deleteWorkspaceInvitations(workspaceSlug: string, invitationId: string): Promise<void> {
    const now = new Date().toISOString();

    const { error } = await getSupabase()
      .from("workspace_member_invites")
      .update({ deleted_at: now, updated_at: now })
      .eq("id", invitationId);

    if (error) throw new Error(`Failed to revoke that invitation: ${error.message}`);
  }

  /** Accepting one invitation, from its own page. */
  async joinWorkspace(workspaceSlug: string, invitationId: string): Promise<void> {
    const { error } = await getSupabase().rpc("accept_workspace_invitation", {
      p_invitation_id: invitationId,
    });

    if (error) throw new Error(error.message);
  }

  /**
   * Accepting or declining several at once, from the invitations list shown
   * after sign-up. Each is a separate call: one failing must not silently
   * abandon the rest, so they are settled and the first failure reported.
   */
  async joinWorkspaces(data: { invitations?: string[]; accept?: boolean }): Promise<void> {
    const invitationIds = data.invitations ?? [];
    const accepting = data.accept !== false;

    const results = await Promise.allSettled(
      invitationIds.map((id) =>
        getSupabase().rpc(accepting ? "accept_workspace_invitation" : "decline_workspace_invitation", {
          p_invitation_id: id,
        })
      )
    );

    for (const result of results) {
      if (result.status === "rejected") throw new Error(String(result.reason));
      if (result.value.error) throw new Error(result.value.error.message);
    }
  }

  // -- Project members ------------------------------------------------------

  async fetchProjectMembers(workspaceSlug: string, projectId: string): Promise<TProjectMembership[]> {
    const { data, error } = await getSupabase()
      .from("project_members")
      .select(PROJECT_MEMBER_FIELDS)
      .eq("project_id", projectId)
      .eq("is_active", true)
      .is("deleted_at", null);

    if (error) throw new Error(`Failed to load the members of this project: ${error.message}`);
    return (data ?? []).map((row) => this.toProjectMembership(row as Record<string, unknown>));
  }

  async projectMemberMe(workspaceSlug: string, projectId: string): Promise<TProjectMembership> {
    const userId = await this.currentUserId();

    const { data, error } = await getSupabase()
      .from("project_members")
      .select(PROJECT_MEMBER_FIELDS)
      .eq("project_id", projectId)
      .eq("member_id", userId)
      .eq("is_active", true)
      .single();

    if (error) throw new Error(`Failed to load your access to this project: ${error.message}`);
    return this.toProjectMembership(data as unknown as Record<string, unknown>);
  }

  async getProjectMember(workspaceSlug: string, projectId: string, memberId: string): Promise<TProjectMembership> {
    const { data, error } = await getSupabase()
      .from("project_members")
      .select(PROJECT_MEMBER_FIELDS)
      .eq("project_id", projectId)
      .eq("member_id", memberId)
      .single();

    if (error) throw new Error(`Failed to load that project member: ${error.message}`);
    return this.toProjectMembership(data as unknown as Record<string, unknown>);
  }

  /**
   * Adding people to a project. Not an invitation — they are already in the
   * workspace, which the function verifies before writing anything.
   */
  async bulkAddMembersToProject(
    workspaceSlug: string,
    projectId: string,
    data: IProjectBulkAddFormData
  ): Promise<TProjectMembership[]> {
    const { data: created, error } = await getSupabase().rpc("add_project_members", {
      p_project_id: projectId,
      p_members: data.members ?? [],
    });

    if (error) throw new Error(error.message);
    return ((created ?? []) as Record<string, unknown>[]).map((row) => this.toProjectMembership(row));
  }

  async updateProjectMember(
    workspaceSlug: string,
    projectId: string,
    memberId: string,
    data: Partial<TProjectMembership>
  ): Promise<TProjectMembership> {
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.role !== undefined) payload.role = data.role;

    const { data: updated, error } = await getSupabase()
      .from("project_members")
      .update(payload)
      .eq("project_id", projectId)
      .eq("member_id", memberId)
      .select(PROJECT_MEMBER_FIELDS)
      .single();

    if (error) throw new Error(`Failed to change that member's role: ${error.message}`);
    return this.toProjectMembership(updated as Record<string, unknown>);
  }

  async deleteProjectMember(workspaceSlug: string, projectId: string, memberId: string): Promise<void> {
    const { error } = await getSupabase().rpc("remove_project_member", {
      p_project_id: projectId,
      p_member_id: memberId,
    });

    if (error) throw new Error(error.message);
  }

  // -- Leaving and joining ----------------------------------------------------
  // Leaving is removing your own membership, which the same RPCs already do —
  // they check that the caller may remove that member, and you always may
  // remove yourself.

  async leaveWorkspace(workspaceSlug: string): Promise<void> {
    await this.deleteWorkspaceMember(workspaceSlug, await this.currentUserId());
  }

  async leaveProject(workspaceSlug: string, projectId: string): Promise<void> {
    await this.deleteProjectMember(workspaceSlug, projectId, await this.currentUserId());
  }

  /** Joining public projects the person picked from the browser. */
  async joinProjects(workspaceSlug: string, projectIds: string[]): Promise<void> {
    const userId = await this.currentUserId();

    const results = await Promise.all(
      projectIds.map((projectId) =>
        getSupabase().rpc("add_project_members", {
          p_project_id: projectId,
          p_members: [{ member_id: userId, role: 15 }],
        })
      )
    );

    const failure = results.find((result) => result.error);
    if (failure?.error) throw new Error(`Failed to join that project: ${failure.error.message}`);
  }

  // -- Mapping --------------------------------------------------------------

  private toProjectMembership(row: Record<string, unknown>): TProjectMembership {
    return {
      id: String(row.id),
      member: String(row.member_id ?? ""),
      role: row.role,
      // The API distinguished the role a member holds from the one they were
      // granted; nothing downgrades a role behind the member's back here, so
      // the two are the same value.
      original_role: row.role,
      created_at: String(row.created_at ?? ""),
    } as unknown as TProjectMembership;
  }

  private toInvitation(row: Record<string, unknown>, fallbackSlug?: string): IWorkspaceMemberInvitation {
    const workspace = (row.workspace ?? {}) as Record<string, unknown>;
    const slug = (workspace.slug as string) || (row.workspace_slug as string) || fallbackSlug || "";

    return {
      id: String(row.id),
      email: (row.email as string) ?? "",
      accepted: Boolean(row.accepted),
      token: (row.token as string) ?? "",
      message: (row.message as string) ?? "",
      responded_at: row.responded_at as Date,
      role: row.role as IWorkspaceMemberInvitation["role"],
      invite_link: `${typeof window === "undefined" ? "" : window.location.origin}/workspace-invitations/?invitation_id=${String(row.id)}&slug=${encodeURIComponent(slug)}&token=${encodeURIComponent((row.token as string) ?? "")}&email=${encodeURIComponent((row.email as string) ?? "")}`,
      workspace: {
        id: String(workspace.id ?? row.workspace_id ?? ""),
        name: (workspace.name as string) ?? "",
        slug: slug,
        logo_url: (workspace.logo as string) ?? "",
      },
    };
  }
}

export const supabaseMemberService = new SupabaseMemberService();

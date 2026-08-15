/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { IWorkspace, IWorkspaceMemberInvitation } from "@keel/types";

import { getSupabase } from "./client";

/**
 * Workspaces, scoped by membership.
 *
 * Reads go straight to the tables and are trimmed by RLS — a non-member's query
 * returns no rows rather than an error, so there is nothing to leak. Creation
 * goes through the create_workspace function instead, because a workspace and
 * its first membership row have to appear together or not at all
 * (supabase/migrations/0003_workspaces.sql).
 */
export class SupabaseWorkspaceService {
  /**
   * The embedded membership is filtered to the signed-in user deliberately.
   * RLS makes every member of the workspace readable, so an unfiltered embed
   * would hand back whichever member sorted first and report their role as
   * yours.
   */
  private static readonly SELECT =
    "*, my_membership:workspace_members!inner(role), member_count:workspace_members(count)";

  private async currentUserId(): Promise<string> {
    const { data } = await getSupabase().auth.getSession();
    const id = data.session?.user.id;
    if (!id) throw new Error("Not signed in.");
    return id;
  }

  /** Workspaces the signed-in user belongs to. */
  async userWorkspaces(): Promise<IWorkspace[]> {
    const supabase = getSupabase();
    const userId = await this.currentUserId();

    const { data, error } = await supabase
      .from("workspaces")
      .select(SupabaseWorkspaceService.SELECT)
      .eq("my_membership.member_id", userId)
      .eq("my_membership.is_active", true)
      .is("deleted_at", null)
      .order("created_at", { ascending: true });

    if (error) throw new Error(`Failed to load your workspaces: ${error.message}`);

    return (data ?? []).map((row) => this.toWorkspace(row));
  }

  async retrieve(workspaceSlug: string): Promise<IWorkspace> {
    const supabase = getSupabase();
    const userId = await this.currentUserId();

    const { data, error } = await supabase
      .from("workspaces")
      .select(SupabaseWorkspaceService.SELECT)
      .eq("slug", workspaceSlug)
      .eq("my_membership.member_id", userId)
      .is("deleted_at", null)
      .single();

    if (error) throw new Error(`Failed to load that workspace: ${error.message}`);

    return this.toWorkspace(data);
  }

  async createWorkspace(data: Partial<IWorkspace>): Promise<IWorkspace> {
    const supabase = getSupabase();

    const { data: created, error } = await supabase.rpc("create_workspace", {
      p_name: data.name ?? "",
      p_slug: data.slug ?? "",
      p_organization_size: data.organization_size ?? null,
    });

    if (error) throw new Error(error.message);

    // The function returns the workspace row alone; the caller is its admin by
    // construction, so the role is known without a second round trip.
    return this.toWorkspace({
      ...(created as Record<string, unknown>),
      my_membership: [{ role: 20 }],
      member_count: [{ count: 1 }],
    });
  }

  async updateWorkspace(workspaceSlug: string, patch: Partial<IWorkspace>): Promise<IWorkspace> {
    const supabase = getSupabase();
    const userId = await this.currentUserId();

    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (patch.name !== undefined) payload.name = patch.name;
    if (patch.organization_size !== undefined) payload.organization_size = patch.organization_size;
    if (patch.timezone !== undefined) payload.timezone = patch.timezone;
    if (patch.logo_url !== undefined) payload.logo = patch.logo_url;

    const { data, error } = await supabase
      .from("workspaces")
      .update(payload)
      .eq("slug", workspaceSlug)
      .select(SupabaseWorkspaceService.SELECT)
      .eq("my_membership.member_id", userId)
      .single();

    if (error) throw new Error(`Failed to save the workspace: ${error.message}`);

    return this.toWorkspace(data);
  }

  /** Soft delete, matching the column the rest of the schema already uses. */
  async deleteWorkspace(workspaceSlug: string): Promise<void> {
    const supabase = getSupabase();

    const { error } = await supabase
      .from("workspaces")
      .update({ deleted_at: new Date().toISOString() })
      .eq("slug", workspaceSlug);

    if (error) throw new Error(`Failed to delete the workspace: ${error.message}`);
  }

  /**
   * Whether a slug is free. Shaped as `{ status }` because that is what the
   * form already reads — status true means available.
   */
  async workspaceSlugCheck(slug: string): Promise<{ status: boolean }> {
    const supabase = getSupabase();

    const { data, error } = await supabase.rpc("is_workspace_slug_available", { p_slug: slug });

    if (error) throw new Error(`Failed to check that URL: ${error.message}`);

    return { status: Boolean(data) };
  }

  /**
   * Invitations addressed to the signed-in user's email address.
   *
   * The email filter is applied here as well as in the policy. 0010 gave
   * workspace admins read access to the invitations they sent, so "everything I
   * can see" is no longer the same set as "everything addressed to me" — an
   * admin would otherwise be asked to accept their own outgoing invitations.
   */
  async userWorkspaceInvitations(): Promise<IWorkspaceMemberInvitation[]> {
    const supabase = getSupabase();

    const { data: sessionData } = await supabase.auth.getSession();
    const email = sessionData.session?.user.email?.toLowerCase();
    if (!email) return [];

    const { data, error } = await supabase
      .from("workspace_member_invites")
      .select("*, workspace:workspaces(id, name, slug, logo)")
      .ilike("email", email)
      .eq("accepted", false)
      .is("deleted_at", null);

    if (error) throw new Error(`Failed to load your invitations: ${error.message}`);

    return (data ?? []) as unknown as IWorkspaceMemberInvitation[];
  }

  /**
   * Maps a workspaces row onto IWorkspace.
   *
   * `role` comes from the embedded membership rather than the workspace itself,
   * because a workspace has no single role — it has one per member.
   */
  private toWorkspace(row: Record<string, unknown>): IWorkspace {
    const membership = row.my_membership as { role?: number }[] | { role?: number } | undefined;
    const mine = Array.isArray(membership) ? membership[0] : membership;
    const role = mine?.role ?? 15;
    const counts = row.member_count as { count?: number }[] | undefined;

    return {
      id: String(row.id),
      name: (row.name as string) ?? "",
      slug: (row.slug as string) ?? "",
      owner: { id: row.owner_id } as IWorkspace["owner"],
      created_at: row.created_at as Date,
      updated_at: row.updated_at as Date,
      created_by: (row.created_by_id as string) ?? "",
      updated_by: (row.updated_by_id as string) ?? "",
      organization_size: (row.organization_size as string) ?? "",
      logo_url: (row.logo as string) ?? null,
      timezone: (row.timezone as string) ?? "UTC",
      role,
      url: "",
      total_members: counts?.[0]?.count ?? 1,
      // Not yet migrated; becomes real with the projects phase.
      total_projects: 0,
    };
  }
}

export const supabaseWorkspaceService = new SupabaseWorkspaceService();

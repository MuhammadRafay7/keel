/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { IFavorite, IState, IWorkspaceSidebarNavigation, TPartialProject } from "@keel/types";

import { getSupabase } from "./client";

/**
 * The reads the application fires the moment a workspace opens: its projects,
 * states, favourites and sidebar preferences.
 *
 * All of them are membership-scoped by RLS, so a slug the user cannot see comes
 * back empty rather than forbidden. Each returns a real (usually empty) result
 * instead of throwing, because the workspace shell renders around them — a
 * workspace with no projects yet is the normal first state, not a failure.
 */
export class SupabaseWorkspaceContentService {
  private async currentUserId(): Promise<string> {
    const { data } = await getSupabase().auth.getSession();
    const id = data.session?.user.id;
    if (!id) throw new Error("Not signed in.");
    return id;
  }

  async getProjectsLite(workspaceSlug: string): Promise<TPartialProject[]> {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("projects")
      .select(
        "id, name, identifier, description, logo_props, network, workspace_id, archived_at, workspace:workspaces!inner(slug)"
      )
      .eq("workspace.slug", workspaceSlug)
      .is("deleted_at", null)
      .order("name", { ascending: true });

    if (error) throw new Error(`Failed to load projects: ${error.message}`);

    return (data ?? []) as unknown as TPartialProject[];
  }

  async getWorkspaceStates(workspaceSlug: string): Promise<IState[]> {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("states")
      .select("*, workspace:workspaces!inner(slug)")
      .eq("workspace.slug", workspaceSlug)
      .is("deleted_at", null);

    if (error) throw new Error(`Failed to load states: ${error.message}`);

    return (data ?? []) as unknown as IState[];
  }

  async getFavorites(workspaceSlug: string): Promise<IFavorite[]> {
    const supabase = getSupabase();
    const userId = await this.currentUserId();

    const { data, error } = await supabase
      .from("user_favorites")
      .select("*, workspace:workspaces!inner(slug)")
      .eq("workspace.slug", workspaceSlug)
      .eq("user_id", userId)
      .is("deleted_at", null);

    if (error) throw new Error(`Failed to load your favourites: ${error.message}`);

    return (data ?? []) as unknown as IFavorite[];
  }

  /**
   * Sidebar layout, stored per user per workspace. A user who has never
   * reordered anything has no row, which is not an error — it means defaults.
   */
  async getSidebarPreferences(workspaceSlug: string): Promise<IWorkspaceSidebarNavigation> {
    const supabase = getSupabase();
    const userId = await this.currentUserId();

    const { data, error } = await supabase
      .from("workspace_home_preferences")
      .select("*, workspace:workspaces!inner(slug)")
      .eq("workspace.slug", workspaceSlug)
      .eq("user_id", userId);

    if (error) throw new Error(`Failed to load your sidebar preferences: ${error.message}`);

    return (data ?? []) as unknown as IWorkspaceSidebarNavigation;
  }

  async getWorkspaceUserProperties(workspaceSlug: string): Promise<unknown> {
    const supabase = getSupabase();
    const userId = await this.currentUserId();

    const { data, error } = await supabase
      .from("workspace_user_properties")
      .select("*, workspace:workspaces!inner(slug)")
      .eq("workspace.slug", workspaceSlug)
      .eq("user_id", userId);

    if (error) throw new Error(`Failed to load your workspace preferences: ${error.message}`);

    return data ?? [];
  }
}

export const supabaseWorkspaceContentService = new SupabaseWorkspaceContentService();

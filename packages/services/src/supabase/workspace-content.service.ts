/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { IFavorite, IState, IWorkspaceSidebarNavigation, TSticky } from "@keel/types";

import { getSupabase } from "./client";

/**
 * The reads the application fires the moment a workspace opens: its states,
 * favourites and sidebar preferences. Projects have their own service.
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

  async addFavorite(workspaceSlug: string, payload: Partial<IFavorite>): Promise<IFavorite> {
    const supabase = getSupabase();
    const userId = await this.currentUserId();
    const workspaceId = await this.workspaceIdFromSlug(workspaceSlug);

    const { data, error } = await supabase
      .from("user_favorites")
      .insert([
        {
          ...payload,
          user_id: userId,
          workspace_id: workspaceId,
          created_by_id: userId,
          updated_by_id: userId,
        },
      ])
      .select()
      .single();

    if (error || !data) throw new Error(`Failed to add that favourite: ${error?.message ?? "unknown error"}`);

    return data as unknown as IFavorite;
  }

  async updateFavorite(favoriteId: string, patch: Partial<IFavorite>): Promise<IFavorite> {
    const supabase = getSupabase();
    const userId = await this.currentUserId();

    const { data, error } = await supabase
      .from("user_favorites")
      .update({ ...patch, updated_at: new Date().toISOString(), updated_by_id: userId })
      .eq("id", favoriteId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error || !data) throw new Error(`Failed to update that favourite: ${error?.message ?? "unknown error"}`);

    return data as unknown as IFavorite;
  }

  async deleteFavorite(favoriteId: string): Promise<void> {
    const supabase = getSupabase();
    const userId = await this.currentUserId();

    const { error } = await supabase
      .from("user_favorites")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", favoriteId)
      .eq("user_id", userId);

    if (error) throw new Error(`Failed to remove that favourite: ${error.message}`);
  }

  /**
   * Starring an entity from its own screen. The favourites table is generic —
   * a row is a (user, entity_type, entity_identifier) triple — so one pair of
   * methods covers projects, cycles, modules, views and pages.
   */
  async addEntityFavorite(
    workspaceSlug: string,
    entityType: string,
    entityId: string,
    projectId?: string
  ): Promise<IFavorite> {
    return this.addFavorite(workspaceSlug, {
      entity_type: entityType,
      entity_identifier: entityId,
      project_id: projectId ?? null,
    } as Partial<IFavorite>);
  }

  async removeEntityFavorite(workspaceSlug: string, entityType: string, entityId: string): Promise<void> {
    const supabase = getSupabase();
    const userId = await this.currentUserId();
    const workspaceId = await this.workspaceIdFromSlug(workspaceSlug);

    const { error } = await supabase
      .from("user_favorites")
      .update({ deleted_at: new Date().toISOString() })
      .eq("workspace_id", workspaceId)
      .eq("user_id", userId)
      .eq("entity_type", entityType)
      .eq("entity_identifier", entityId);

    if (error) throw new Error(`Failed to remove that favourite: ${error.message}`);
  }

  /** The contents of a favourite folder. */
  async getGroupedFavorites(workspaceSlug: string, favoriteId: string): Promise<IFavorite[]> {
    const supabase = getSupabase();
    const userId = await this.currentUserId();

    const { data, error } = await supabase
      .from("user_favorites")
      .select("*")
      .eq("user_id", userId)
      .eq("parent", favoriteId)
      .is("deleted_at", null)
      .order("sequence", { ascending: true });

    if (error) throw new Error(`Failed to load that favourite: ${error.message}`);

    return (data ?? []) as unknown as IFavorite[];
  }

  // -- Quick links --------------------------------------------------------------
  // The link tiles on the workspace home screen, saved per user.

  async getWorkspaceLinks(workspaceSlug: string): Promise<unknown[]> {
    const supabase = getSupabase();
    const userId = await this.currentUserId();
    const workspaceId = await this.workspaceIdFromSlug(workspaceSlug);

    const { data, error } = await supabase
      .from("workspace_user_links")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("owner_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to load your links: ${error.message}`);

    return data ?? [];
  }

  async createWorkspaceLink(workspaceSlug: string, payload: Record<string, unknown>): Promise<unknown> {
    const supabase = getSupabase();
    const userId = await this.currentUserId();
    const workspaceId = await this.workspaceIdFromSlug(workspaceSlug);
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("workspace_user_links")
      .insert([
        {
          ...payload,
          workspace_id: workspaceId,
          owner_id: userId,
          created_at: now,
          updated_at: now,
          created_by_id: userId,
          updated_by_id: userId,
        },
      ])
      .select()
      .single();

    if (error || !data) throw new Error(`Failed to save that link: ${error?.message ?? "unknown error"}`);

    return data;
  }

  async updateWorkspaceLink(linkId: string, patch: Record<string, unknown>): Promise<unknown> {
    const { data, error } = await getSupabase()
      .from("workspace_user_links")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", linkId)
      .select()
      .single();

    if (error || !data) throw new Error(`Failed to update that link: ${error?.message ?? "unknown error"}`);

    return data;
  }

  async deleteWorkspaceLink(linkId: string): Promise<void> {
    const { error } = await getSupabase()
      .from("workspace_user_links")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", linkId);

    if (error) throw new Error(`Failed to delete that link: ${error.message}`);
  }

  /** Every label in the workspace, for cross-project label pickers. */
  async getWorkspaceLabels(workspaceSlug: string): Promise<unknown[]> {
    const { data, error } = await getSupabase()
      .from("labels")
      .select("*, workspace:workspaces!inner(slug)")
      .eq("workspace.slug", workspaceSlug)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });

    if (error) throw new Error(`Failed to load labels: ${error.message}`);

    return data ?? [];
  }

  async updateWorkspaceUserProperties(workspaceSlug: string, patch: Record<string, unknown>): Promise<unknown> {
    const supabase = getSupabase();
    const userId = await this.currentUserId();
    const workspaceId = await this.workspaceIdFromSlug(workspaceSlug);

    const { data, error } = await supabase
      .from("workspace_user_properties")
      .upsert(
        {
          workspace_id: workspaceId,
          user_id: userId,
          ...patch,
          updated_at: new Date().toISOString(),
          created_by_id: userId,
          updated_by_id: userId,
        },
        { onConflict: "workspace_id,user_id" }
      )
      .select()
      .single();

    if (error) throw new Error(`Failed to save those filters: ${error.message}`);

    return data ?? {};
  }

  // -- Stickies ---------------------------------------------------------------
  // Personal notes pinned to a workspace. Always the current user's own: there
  // is no sharing model, so user_id scopes every query.

  async getStickies(
    workspaceSlug: string,
    query?: string,
    perPage = 25
  ): Promise<{ results: TSticky[]; total_pages: number }> {
    const supabase = getSupabase();
    const userId = await this.currentUserId();
    const workspaceId = await this.workspaceIdFromSlug(workspaceSlug);

    let request = supabase
      .from("stickies")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("owner_id", userId)
      .is("deleted_at", null)
      .order("sort_order", { ascending: false })
      .limit(perPage);

    if (query) request = request.ilike("name", `%${query.replace(/[%_]/g, (c) => `\\${c}`)}%`);

    const { data, error } = await request;

    if (error) throw new Error(`Failed to load your notes: ${error.message}`);

    return { results: (data ?? []) as unknown as TSticky[], total_pages: 1 };
  }

  async getSticky(stickyId: string): Promise<TSticky> {
    const { data, error } = await getSupabase().from("stickies").select("*").eq("id", stickyId).single();

    if (error || !data) throw new Error(`Failed to load that note: ${error?.message ?? stickyId}`);

    return data as unknown as TSticky;
  }

  async createSticky(workspaceSlug: string, payload: Partial<TSticky>): Promise<TSticky> {
    const supabase = getSupabase();
    const userId = await this.currentUserId();
    const workspaceId = await this.workspaceIdFromSlug(workspaceSlug);
    const now = new Date().toISOString();

    const { workspace, ...columns } = payload as Record<string, unknown>;
    void workspace;

    const { data, error } = await supabase
      .from("stickies")
      .insert([
        {
          ...columns,
          workspace_id: workspaceId,
          owner_id: userId,
          created_at: now,
          updated_at: now,
          created_by_id: userId,
          updated_by_id: userId,
        },
      ])
      .select()
      .single();

    if (error || !data) throw new Error(`Failed to create that note: ${error?.message ?? "unknown error"}`);

    return data as unknown as TSticky;
  }

  async updateSticky(stickyId: string, patch: Partial<TSticky>): Promise<TSticky> {
    const supabase = getSupabase();
    const userId = await this.currentUserId();

    const { workspace, ...columns } = patch as Record<string, unknown>;
    void workspace;

    const { data, error } = await supabase
      .from("stickies")
      .update({ ...columns, updated_at: new Date().toISOString(), updated_by_id: userId })
      .eq("id", stickyId)
      .select()
      .single();

    if (error || !data) throw new Error(`Failed to update that note: ${error?.message ?? "unknown error"}`);

    return data as unknown as TSticky;
  }

  async deleteSticky(stickyId: string): Promise<void> {
    const { error } = await getSupabase()
      .from("stickies")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", stickyId);

    if (error) throw new Error(`Failed to delete that note: ${error.message}`);
  }

  private async workspaceIdFromSlug(workspaceSlug: string): Promise<string> {
    const { data, error } = await getSupabase().from("workspaces").select("id").eq("slug", workspaceSlug).single();

    if (error || !data) throw new Error(`Failed to find the workspace: ${error?.message ?? workspaceSlug}`);

    return (data as { id: string }).id;
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

  /**
   * Home widgets and sidebar sections share workspace_home_preferences: both
   * are "this user, this workspace, this key, shown or not, in this order".
   */
  async updateHomePreference(
    workspaceSlug: string,
    key: string,
    patch: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const supabase = getSupabase();
    const userId = await this.currentUserId();
    const workspaceId = await this.workspaceIdFromSlug(workspaceSlug);

    const { data, error } = await supabase
      .from("workspace_home_preferences")
      .upsert(
        {
          key,
          workspace_id: workspaceId,
          user_id: userId,
          ...patch,
          updated_at: new Date().toISOString(),
          created_by_id: userId,
          updated_by_id: userId,
        },
        { onConflict: "workspace_id,user_id,key" }
      )
      .select()
      .single();

    if (error) throw new Error(`Failed to save that preference: ${error.message}`);

    return (data ?? {}) as Record<string, unknown>;
  }

  async updateHomePreferences(
    workspaceSlug: string,
    entries: Array<{ key: string } & Record<string, unknown>>
  ): Promise<unknown> {
    const supabase = getSupabase();
    const userId = await this.currentUserId();
    const workspaceId = await this.workspaceIdFromSlug(workspaceSlug);
    const now = new Date().toISOString();

    const { error } = await supabase.from("workspace_home_preferences").upsert(
      entries.map((entry) => ({
        ...entry,
        workspace_id: workspaceId,
        user_id: userId,
        updated_at: now,
        created_by_id: userId,
        updated_by_id: userId,
      })),
      { onConflict: "workspace_id,user_id,key" }
    );

    if (error) throw new Error(`Failed to save those preferences: ${error.message}`);

    return this.getSidebarPreferences(workspaceSlug);
  }

  async getHomeWidgets(workspaceSlug: string): Promise<unknown[]> {
    const supabase = getSupabase();
    const userId = await this.currentUserId();
    const workspaceId = await this.workspaceIdFromSlug(workspaceSlug);

    const { data, error } = await supabase
      .from("workspace_home_preferences")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("user_id", userId)
      .order("sort_order", { ascending: true });

    if (error) throw new Error(`Failed to load your home layout: ${error.message}`);

    return data ?? [];
  }

  /**
   * Recently visited entities, hydrated with just enough of each entity to
   * render a row. The visit rows only carry an id and a type, so the names are
   * looked up per type in one query each rather than per row.
   */
  async getRecentVisits(workspaceSlug: string, entityName?: string): Promise<unknown[]> {
    const supabase = getSupabase();
    const userId = await this.currentUserId();
    const workspaceId = await this.workspaceIdFromSlug(workspaceSlug);

    let query = supabase
      .from("user_recent_visits")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("visited_at", { ascending: false })
      .limit(20);

    if (entityName) query = query.eq("entity_name", entityName);

    const { data, error } = await query;

    if (error) throw new Error(`Failed to load recent activity: ${error.message}`);

    const visits = (data ?? []) as unknown as {
      id: string;
      entity_name: string;
      entity_identifier: string;
      visited_at: string;
    }[];

    const idsFor = (name: string) =>
      visits.filter((visit) => visit.entity_name === name).map((visit) => visit.entity_identifier);

    const [projects, issues, pages] = await Promise.all([
      this.namesFor("projects", idsFor("project")),
      this.namesFor("issues", idsFor("issue")),
      this.namesFor("pages", [...idsFor("page"), ...idsFor("workspace_page")]),
    ]);

    const byType: Record<string, Map<string, Record<string, unknown>>> = {
      project: projects,
      issue: issues,
      page: pages,
      workspace_page: pages,
    };

    return visits.map((visit) => {
      const entity = visit as Record<string, unknown>;
      entity.entity_data = byType[visit.entity_name]?.get(visit.entity_identifier) ?? { name: "" };
      return entity;
    });
  }

  private async namesFor(table: "projects" | "issues" | "pages", ids: string[]) {
    const rows = new Map<string, Record<string, unknown>>();
    if (ids.length === 0) return rows;

    const columns =
      table === "issues" ? "id, name, sequence_id, project_id, priority, state_id" : "id, name, logo_props";

    const { data } = await getSupabase()
      .from(table)
      .select(columns)
      .in("id", Array.from(new Set(ids)));

    for (const row of (data ?? []) as unknown as Record<string, unknown>[]) {
      rows.set(row.id as string, row);
    }

    return rows;
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

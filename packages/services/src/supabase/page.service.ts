/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { TPage } from "@keel/types";

import { getSupabase } from "./client";

const PAGE_FIELDS =
  "id, name, description_html, description_json, access, owned_by_id, workspace_id, color, " +
  "is_locked, is_global, view_props, logo_props, sort_order, archived_at, created_at, updated_at, " +
  "created_by_id, updated_by_id";

/**
 * Pages.
 *
 * A page belongs to a workspace; project_pages is what places it inside a
 * project, which is why listing by project goes through that join table.
 *
 * Only the document body is handled here. Real-time co-editing is a separate
 * problem: it needs a stateful server that this hosting model does not provide,
 * and until that is resolved these reads and writes are last-write-wins.
 */
export class SupabasePageService {
  private async context(): Promise<{ userId: string; now: string }> {
    const { data } = await getSupabase().auth.getSession();
    const userId = data.session?.user.id;
    if (!userId) throw new Error("Not signed in.");
    return { userId, now: new Date().toISOString() };
  }

  async getProjectPages(workspaceSlug: string, projectId: string): Promise<TPage[]> {
    const { data, error } = await getSupabase()
      .from("project_pages")
      .select(`page:pages!inner(${PAGE_FIELDS})`)
      .eq("project_id", projectId)
      .is("page.deleted_at", null);

    if (error) throw new Error(`Failed to load pages: ${error.message}`);

    return (data ?? []).map((row) => (row as unknown as { page: TPage }).page);
  }

  async getWorkspacePages(workspaceSlug: string): Promise<TPage[]> {
    const { data, error } = await getSupabase()
      .from("pages")
      .select(`${PAGE_FIELDS}, workspace:workspaces!inner(slug)`)
      .eq("workspace.slug", workspaceSlug)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });

    if (error) throw new Error(`Failed to load pages: ${error.message}`);
    return (data ?? []) as unknown as TPage[];
  }

  async getPageDetails(workspaceSlug: string, pageId: string): Promise<TPage> {
    const { data, error } = await getSupabase()
      .from("pages")
      .select(PAGE_FIELDS)
      .eq("id", pageId)
      .is("deleted_at", null)
      .single();

    if (error) throw new Error(`Failed to load that page: ${error.message}`);
    return data as unknown as TPage;
  }

  async createPage(workspaceSlug: string, data: Partial<TPage>, projectId?: string): Promise<TPage> {
    const { data: created, error } = await getSupabase().rpc("create_page", {
      p_workspace_slug: workspaceSlug,
      p_name: data.name ?? "Untitled",
      p_access: data.access ?? 0,
      p_project_id: projectId ?? null,
    });

    if (error) throw new Error(error.message);
    return created as unknown as TPage;
  }

  async updatePage(workspaceSlug: string, pageId: string, patch: Partial<TPage>): Promise<TPage> {
    const { now } = await this.context();

    const payload: Record<string, unknown> = { updated_at: now };
    for (const key of [
      "name",
      "description_html",
      "description_json",
      "access",
      "color",
      "is_locked",
      "logo_props",
      "sort_order",
    ] as const) {
      if (key in patch) payload[key] = patch[key as keyof TPage];
    }

    const { data, error } = await getSupabase()
      .from("pages")
      .update(payload)
      .eq("id", pageId)
      .select(PAGE_FIELDS)
      .single();

    if (error) throw new Error(`Failed to save that page: ${error.message}`);
    return data as unknown as TPage;
  }

  async deletePage(workspaceSlug: string, pageId: string): Promise<void> {
    const { error } = await getSupabase()
      .from("pages")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", pageId);

    if (error) throw new Error(`Failed to delete that page: ${error.message}`);
  }

  async archivePage(workspaceSlug: string, pageId: string): Promise<void> {
    const { error } = await getSupabase()
      .from("pages")
      .update({ archived_at: new Date().toISOString() })
      .eq("id", pageId);

    if (error) throw new Error(`Failed to archive that page: ${error.message}`);
  }

  async restorePage(workspaceSlug: string, pageId: string): Promise<void> {
    const { error } = await getSupabase().from("pages").update({ archived_at: null }).eq("id", pageId);
    if (error) throw new Error(`Failed to restore that page: ${error.message}`);
  }
}

export const supabasePageService = new SupabasePageService();

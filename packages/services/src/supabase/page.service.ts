/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { TDocumentPayload, TPage } from "@keel/types";

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
  /**
   * Puts `project_ids` back on a page row.
   *
   * The column does not exist — `project_pages` is what places a page inside a
   * project — but the application treats `project_ids[0]` as the project a page
   * belongs to, and every write goes through that lookup. A page returned
   * without it cannot be saved, renamed, locked or archived.
   */
  private toPage(row: Record<string, unknown>, projectId?: string): TPage {
    const joined = (row.project_pages ?? []) as { project_id: string }[];
    const projectIds = projectId ? [projectId] : joined.map((p) => p.project_id).filter(Boolean);
    const { project_pages: _ignored, ...page } = row;
    return { ...page, project_ids: projectIds } as unknown as TPage;
  }

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

    return (data ?? []).map((row) =>
      this.toPage((row as unknown as { page: Record<string, unknown> }).page, projectId)
    );
  }

  async getWorkspacePages(workspaceSlug: string): Promise<TPage[]> {
    const { data, error } = await getSupabase()
      .from("pages")
      .select(`${PAGE_FIELDS}, workspace:workspaces!inner(slug), project_pages(project_id)`)
      .eq("workspace.slug", workspaceSlug)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });

    if (error) throw new Error(`Failed to load pages: ${error.message}`);
    return (data ?? []).map((row) => this.toPage(row as unknown as Record<string, unknown>));
  }

  async getPageDetails(workspaceSlug: string, pageId: string): Promise<TPage> {
    const { data, error } = await getSupabase()
      .from("pages")
      .select(`${PAGE_FIELDS}, project_pages(project_id)`)
      .eq("id", pageId)
      .is("deleted_at", null)
      .single();

    if (error) throw new Error(`Failed to load that page: ${error.message}`);
    return this.toPage(data as unknown as Record<string, unknown>);
  }

  async createPage(workspaceSlug: string, data: Partial<TPage>, projectId?: string): Promise<TPage> {
    const { data: created, error } = await getSupabase().rpc("create_page", {
      p_workspace_slug: workspaceSlug,
      p_name: data.name ?? "Untitled",
      p_access: data.access ?? 0,
      p_project_id: projectId ?? null,
    });

    if (error) throw new Error(error.message);
    return this.toPage(created as unknown as Record<string, unknown>, projectId);
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
      .select(`${PAGE_FIELDS}, project_pages(project_id)`)
      .single();

    if (error) throw new Error(`Failed to save that page: ${error.message}`);
    return this.toPage(data as unknown as Record<string, unknown>);
  }

  /**
   * The document body, saved from the editor.
   *
   * This is the write that makes single-writer pages real. The collaborative
   * path persisted through Hocuspocus, which is not running here, so without
   * this every keystroke was discarded.
   *
   * `description_binary` is a Yjs snapshot and is deliberately not stored: there
   * is no Yjs document in this path, and writing a stale or empty binary would
   * be worse than writing none — the collaborative editor would later load it in
   * preference to the HTML and show an empty page.
   */
  async updateDescription(workspaceSlug: string, pageId: string, data: TDocumentPayload): Promise<void> {
    const { now } = await this.context();

    const { error } = await getSupabase()
      .from("pages")
      .update({
        description_html: data.description_html ?? "<p></p>",
        description_json: data.description_json ?? {},
        updated_at: now,
      })
      .eq("id", pageId);

    if (error) throw new Error(`Failed to save this page: ${error.message}`);
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

  /** Locking a page keeps it readable but stops edits. */
  async setPageLocked(pageId: string, locked: boolean): Promise<void> {
    const { error } = await getSupabase()
      .from("pages")
      .update({ is_locked: locked, updated_at: new Date().toISOString() })
      .eq("id", pageId);

    if (error) throw new Error(`Failed to ${locked ? "lock" : "unlock"} that page: ${error.message}`);
  }

  async setPageAccess(pageId: string, access: number): Promise<void> {
    const { error } = await getSupabase()
      .from("pages")
      .update({ access, updated_at: new Date().toISOString() })
      .eq("id", pageId);

    if (error) throw new Error(`Failed to change who can see that page: ${error.message}`);
  }

  /** Copies a page's content into a new one in the same project. */
  async duplicatePage(workspaceSlug: string, pageId: string): Promise<TPage> {
    const supabase = getSupabase();
    const { userId, now } = await this.context();

    const { data: source, error: readError } = await supabase.from("pages").select("*").eq("id", pageId).single();

    if (readError || !source) throw new Error(`Failed to copy that page: ${readError?.message ?? pageId}`);

    const original = source as Record<string, unknown>;

    const { data, error } = await supabase
      .from("pages")
      .insert([
        {
          name: `${(original.name as string) ?? "Page"} (copy)`,
          description_html: original.description_html ?? "<p></p>",
          description_json: original.description_json ?? {},
          access: original.access ?? 0,
          color: original.color ?? "",
          logo_props: original.logo_props ?? {},
          project_id: original.project_id ?? null,
          workspace_id: original.workspace_id,
          created_at: now,
          updated_at: now,
          created_by_id: userId,
          updated_by_id: userId,
          owned_by_id: userId,
        },
      ])
      .select()
      .single();

    if (error || !data) throw new Error(`Failed to copy that page: ${error?.message ?? "unknown error"}`);

    return data as unknown as TPage;
  }

  /** Moves a page to another project. */
  async movePage(pageId: string, newProjectId: string): Promise<void> {
    const { error } = await getSupabase()
      .from("pages")
      .update({ project_id: newProjectId, updated_at: new Date().toISOString() })
      .eq("id", pageId);

    if (error) throw new Error(`Failed to move that page: ${error.message}`);
  }

  /**
   * The collaborative editor asks for a binary snapshot. Nothing writes one in
   * this stack yet, so an empty buffer tells the editor to build its document
   * from description_html instead.
   */
  async fetchDescriptionBinary(): Promise<ArrayBuffer> {
    return new ArrayBuffer(0);
  }
}

export const supabasePageService = new SupabasePageService();

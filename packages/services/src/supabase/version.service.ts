/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type {
  TDescriptionVersion,
  TDescriptionVersionDetails,
  TDescriptionVersionsListResponse,
  TPageVersion,
} from "@keel/types";

import { getSupabase } from "./client";

/**
 * Version history for pages and work item descriptions.
 *
 * Nothing in this stack writes a version yet — Django wrote them from a
 * background task — so an empty history is the normal answer rather than a
 * failure, and the panels render "no earlier versions" instead of erroring.
 */
export class SupabaseVersionService {
  private async list(table: string, column: string, entityId: string): Promise<Record<string, unknown>[]> {
    try {
      const { data, error } = await getSupabase()
        .from(table)
        .select("*")
        .eq(column, entityId)
        .is("deleted_at", null)
        .order("last_saved_at", { ascending: false });

      if (error) return [];

      return (data ?? []) as unknown as Record<string, unknown>[];
    } catch {
      return [];
    }
  }

  private async retrieve(table: string, versionId: string): Promise<Record<string, unknown> | null> {
    try {
      const { data, error } = await getSupabase().from(table).select("*").eq("id", versionId).maybeSingle();

      if (error) return null;

      return (data ?? null) as Record<string, unknown> | null;
    } catch {
      return null;
    }
  }

  // -- Pages ------------------------------------------------------------------

  async listPageVersions(pageId: string): Promise<TPageVersion[]> {
    return (await this.list("page_versions", "page_id", pageId)) as unknown as TPageVersion[];
  }

  async retrievePageVersion(versionId: string): Promise<TPageVersion> {
    const version = await this.retrieve("page_versions", versionId);

    if (!version) throw new Error("That version is no longer available.");

    return version as unknown as TPageVersion;
  }

  /** Restoring writes the old description back onto the live page. */
  async restorePageVersion(pageId: string, versionId: string): Promise<void> {
    const version = await this.retrievePageVersion(versionId);

    const { error } = await getSupabase()
      .from("pages")
      .update({
        description_html: version.description_html ?? "<p></p>",
        description_json: version.description_json ?? {},
        updated_at: new Date().toISOString(),
      })
      .eq("id", pageId);

    if (error) throw new Error(`Failed to restore that version: ${error.message}`);
  }

  // -- Work item descriptions -------------------------------------------------

  async listDescriptionVersions(workItemId: string): Promise<TDescriptionVersionsListResponse> {
    const results = (await this.list(
      "issue_description_versions",
      "issue_id",
      workItemId
    )) as unknown as TDescriptionVersion[];

    return {
      cursor: "",
      next_cursor: null,
      next_page_results: false,
      page_count: results.length,
      prev_cursor: null,
      prev_page_results: false,
      results,
      total_pages: 1,
    } as TDescriptionVersionsListResponse;
  }

  async retrieveDescriptionVersion(versionId: string): Promise<TDescriptionVersionDetails> {
    const version = await this.retrieve("issue_description_versions", versionId);

    if (!version) throw new Error("That version is no longer available.");

    return version as unknown as TDescriptionVersionDetails;
  }
}

export const supabaseVersionService = new SupabaseVersionService();

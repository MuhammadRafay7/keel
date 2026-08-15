/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { TIssueAttachment } from "@keel/types";

import { getSupabase } from "./client";
import { STORAGE_BUCKETS, supabaseStorageService } from "./storage.service";

const ATTACHMENT_ENTITY_TYPE = "ISSUE_ATTACHMENT";

const ATTACHMENT_FIELDS =
  "id, asset, attributes, size, issue_id, project_id, workspace_id, entity_type, " +
  "created_at, updated_at, created_by_id, updated_by_id";

/**
 * Work item attachments.
 *
 * An attachment is a stored object plus the `file_assets` row that says which
 * work item it belongs to. Phase 3 built both halves; this puts them together.
 *
 * `asset_url` is signed and therefore expires. It is produced at read time and
 * never persisted — a stored signed URL is a broken link an hour later.
 */
export class SupabaseAttachmentService {
  async getIssueAttachments(workspaceSlug: string, projectId: string, issueId: string): Promise<TIssueAttachment[]> {
    const { data, error } = await getSupabase()
      .from("file_assets")
      .select(ATTACHMENT_FIELDS)
      .eq("issue_id", issueId)
      .eq("entity_type", ATTACHMENT_ENTITY_TYPE)
      .eq("is_deleted", false)
      .eq("is_uploaded", true)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to load attachments: ${error.message}`);

    const rows = (data ?? []) as unknown as Record<string, unknown>[];
    if (rows.length === 0) return [];

    // One signing call for the whole list rather than one per row — the same
    // request either way, and the list renders in one pass.
    const urls = await supabaseStorageService.signedUrls(
      STORAGE_BUCKETS.project,
      rows.map((row) => String(row.asset))
    );

    return rows.map((row, index) => this.toAttachment(row, urls[index] ?? ""));
  }

  async uploadIssueAttachment(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    file: File
  ): Promise<TIssueAttachment> {
    const uploaded = await supabaseStorageService.uploadProjectAsset(workspaceSlug, projectId, file, {
      entityType: ATTACHMENT_ENTITY_TYPE,
      issueId,
    });

    const { data, error } = await getSupabase()
      .from("file_assets")
      .select(ATTACHMENT_FIELDS)
      .eq("id", uploaded.asset_id)
      .single();

    if (error) throw new Error(`Uploaded, but failed to read that attachment back: ${error.message}`);
    return this.toAttachment(data as unknown as Record<string, unknown>, uploaded.url);
  }

  /**
   * Removes the object and marks the row deleted, then returns what was
   * deleted — the store removes it from the list by the id in the response.
   */
  async deleteIssueAttachment(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    assetId: string
  ): Promise<TIssueAttachment> {
    const supabase = getSupabase();

    const { data, error } = await supabase.from("file_assets").select(ATTACHMENT_FIELDS).eq("id", assetId).single();

    if (error) throw new Error(`Failed to find that attachment: ${error.message}`);

    const row = data as unknown as Record<string, unknown>;
    await supabaseStorageService.deleteAsset(STORAGE_BUCKETS.project, String(row.asset), assetId);

    return this.toAttachment(row, "");
  }

  private toAttachment(row: Record<string, unknown>, assetUrl: string): TIssueAttachment {
    const attributes = (row.attributes ?? {}) as Record<string, unknown>;

    return {
      id: String(row.id),
      attributes: {
        name: (attributes.name as string) ?? "",
        size: Number(attributes.size ?? row.size ?? 0),
      },
      asset_url: assetUrl,
      issue_id: String(row.issue_id ?? ""),
      updated_at: String(row.updated_at ?? ""),
      updated_by: String(row.updated_by_id ?? ""),
      created_by: String(row.created_by_id ?? ""),
    };
  }
}

export const supabaseAttachmentService = new SupabaseAttachmentService();

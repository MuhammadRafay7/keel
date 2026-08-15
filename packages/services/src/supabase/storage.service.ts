/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { getSupabase } from "./client";

export const STORAGE_BUCKETS = {
  user: "user-assets",
  workspace: "workspace-assets",
  project: "project-assets",
} as const;

/** Signed URLs for private objects. An hour outlives any reasonable page view. */
const SIGNED_URL_TTL_SECONDS = 60 * 60;

export type TUploadResult = {
  asset_id: string;
  path: string;
  /** Ready to use in an `src`. Signed and therefore temporary for private buckets. */
  url: string;
};

/**
 * File storage.
 *
 * Uploads go straight from the browser to Supabase Storage using the user's own
 * session — there is no signing round-trip, because the storage policies in
 * 0008 make the same membership decision the tables do.
 *
 * Those policies read the owning id out of the object path, so every path is
 * built here and nowhere else. A file written to the wrong prefix would be
 * governed by the wrong rule.
 */
export class SupabaseStorageService {
  private async currentUserId(): Promise<string> {
    const { data } = await getSupabase().auth.getSession();
    const id = data.session?.user.id;
    if (!id) throw new Error("Not signed in.");
    return id;
  }

  /**
   * Filenames arrive from the user's filesystem and end up in a URL path, so
   * they are reduced to something safe and prefixed with a random segment —
   * two people uploading "screenshot.png" must not collide.
   */
  private objectName(file: File): string {
    const safe = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.\-_]/g, "-")
      .replace(/-+/g, "-")
      .slice(-80);
    return `${crypto.randomUUID()}-${safe}`;
  }

  // -- Uploads --------------------------------------------------------------

  async uploadUserAsset(file: File, entityType?: string): Promise<TUploadResult> {
    const userId = await this.currentUserId();
    const path = `${userId}/${this.objectName(file)}`;

    await this.put(STORAGE_BUCKETS.user, path, file);
    const assetId = await this.record({ path, file, entityType, userId, ownerId: userId });

    return { asset_id: assetId, path, url: this.publicUrl(STORAGE_BUCKETS.user, path) };
  }

  async uploadWorkspaceAsset(workspaceSlug: string, file: File, entityType?: string): Promise<TUploadResult> {
    const userId = await this.currentUserId();
    const workspaceId = await this.workspaceIdFromSlug(workspaceSlug);
    const path = `${workspaceId}/${this.objectName(file)}`;

    await this.put(STORAGE_BUCKETS.workspace, path, file);
    const assetId = await this.record({ path, file, entityType, workspaceId, ownerId: userId });

    return { asset_id: assetId, path, url: this.publicUrl(STORAGE_BUCKETS.workspace, path) };
  }

  /**
   * Attachments and editor uploads. The path carries workspace then project,
   * because the policy tests project membership from the second segment.
   */
  async uploadProjectAsset(
    workspaceSlug: string,
    projectId: string,
    file: File,
    entity?: { entityType?: string; issueId?: string; pageId?: string; commentId?: string }
  ): Promise<TUploadResult> {
    const userId = await this.currentUserId();
    const workspaceId = await this.workspaceIdFromSlug(workspaceSlug);
    const path = `${workspaceId}/${projectId}/${this.objectName(file)}`;

    await this.put(STORAGE_BUCKETS.project, path, file);
    const assetId = await this.record({
      path,
      file,
      entityType: entity?.entityType,
      workspaceId,
      projectId,
      issueId: entity?.issueId,
      pageId: entity?.pageId,
      commentId: entity?.commentId,
      ownerId: userId,
    });

    const url = await this.signedUrl(STORAGE_BUCKETS.project, path);
    return { asset_id: assetId, path, url };
  }

  // -- Reading --------------------------------------------------------------

  publicUrl(bucket: string, path: string): string {
    return getSupabase().storage.from(bucket).getPublicUrl(path).data.publicUrl;
  }

  /**
   * Private objects are reachable only through a signed, expiring URL. Callers
   * should sign at render time rather than storing the result — a persisted
   * signed URL becomes a broken image an hour later.
   */
  async signedUrl(bucket: string, path: string, expiresIn = SIGNED_URL_TTL_SECONDS): Promise<string> {
    const { data, error } = await getSupabase().storage.from(bucket).createSignedUrl(path, expiresIn);

    if (error) throw new Error(`Failed to prepare that file for viewing: ${error.message}`);
    return data.signedUrl;
  }

  async signedUrls(bucket: string, paths: string[], expiresIn = SIGNED_URL_TTL_SECONDS): Promise<string[]> {
    if (paths.length === 0) return [];

    const { data, error } = await getSupabase().storage.from(bucket).createSignedUrls(paths, expiresIn);

    if (error) throw new Error(`Failed to prepare those files for viewing: ${error.message}`);
    return (data ?? []).map((entry) => entry.signedUrl).filter((url): url is string => Boolean(url));
  }

  // -- Deletion -------------------------------------------------------------

  /**
   * Removes the object and marks the row deleted. The object goes first: a
   * stored file with no row is invisible and billable, which is worse than a
   * row briefly pointing at a file that has already gone.
   */
  async deleteAsset(bucket: string, path: string, assetId?: string): Promise<void> {
    const supabase = getSupabase();

    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw new Error(`Failed to delete that file: ${error.message}`);

    if (assetId) {
      await supabase
        .from("file_assets")
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq("id", assetId);
    }
  }

  // -- Internals ------------------------------------------------------------

  private async put(bucket: string, path: string, file: File): Promise<void> {
    const { error } = await getSupabase()
      .storage.from(bucket)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (error) {
      // The bucket enforces a MIME allow-list and a size cap; both surface here
      // and both are worth saying plainly rather than as a storage error code.
      throw new Error(`Failed to upload ${file.name}: ${error.message}`);
    }
  }

  private async workspaceIdFromSlug(workspaceSlug: string): Promise<string> {
    const { data, error } = await getSupabase()
      .from("workspaces")
      .select("id")
      .eq("slug", workspaceSlug)
      .is("deleted_at", null)
      .single();

    if (error) throw new Error(`Failed to resolve that workspace: ${error.message}`);
    return String((data as { id: string }).id);
  }

  private async record(input: {
    path: string;
    file: File;
    ownerId: string;
    entityType?: string;
    userId?: string;
    workspaceId?: string;
    projectId?: string;
    issueId?: string;
    pageId?: string;
    commentId?: string;
  }): Promise<string> {
    const { data, error } = await getSupabase()
      .from("file_assets")
      .insert({
        asset: input.path,
        attributes: { name: input.file.name, type: input.file.type, size: input.file.size },
        size: input.file.size,
        entity_type: input.entityType ?? null,
        user_id: input.userId ?? null,
        workspace_id: input.workspaceId ?? null,
        project_id: input.projectId ?? null,
        issue_id: input.issueId ?? null,
        page_id: input.pageId ?? null,
        comment_id: input.commentId ?? null,
        // The object is already stored by the time this row is written, so it
        // is recorded as uploaded rather than confirmed in a second call.
        is_uploaded: true,
        is_deleted: false,
        is_archived: false,
        storage_metadata: {},
        created_by_id: input.ownerId,
        updated_by_id: input.ownerId,
      })
      .select("id")
      .single();

    if (error) throw new Error(`Failed to record that file: ${error.message}`);
    return String((data as { id: string }).id);
  }
}

export const supabaseStorageService = new SupabaseStorageService();

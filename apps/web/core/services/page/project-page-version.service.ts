/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// keel types
import { API_BASE_URL } from "@keel/constants";
import type { TPageVersion } from "@keel/types";
// helpers
// services
import { isSupabaseConfigured, supabaseVersionService } from "@keel/services";
import { APIService } from "@/services/api.service";

export class ProjectPageVersionService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async fetchAllVersions(workspaceSlug: string, projectId: string, pageId: string): Promise<TPageVersion[]> {
    if (isSupabaseConfigured) return supabaseVersionService.listPageVersions(pageId);
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/pages/${pageId}/versions/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async fetchVersionById(
    workspaceSlug: string,
    projectId: string,
    pageId: string,
    versionId: string
  ): Promise<TPageVersion> {
    if (isSupabaseConfigured) return supabaseVersionService.retrievePageVersion(versionId);
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/pages/${pageId}/versions/${versionId}/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async restoreVersion(workspaceSlug: string, projectId: string, pageId: string, versionId: string): Promise<void> {
    if (isSupabaseConfigured) return supabaseVersionService.restorePageVersion(pageId, versionId);
    return this.post(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/pages/${pageId}/versions/${versionId}/restore/`
    )
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}

/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// helpers
import { API_BASE_URL } from "@keel/constants";
// services
import { isSupabaseConfigured, supabaseProjectService } from "@keel/services";
import { APIService } from "@/services/api.service";

export class ProjectArchiveService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async archiveProject(
    workspaceSlug: string,
    projectId: string
  ): Promise<{
    archived_at: string;
  }> {
    if (isSupabaseConfigured) return supabaseProjectService.setProjectArchived(projectId, true);
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/archive/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async restoreProject(workspaceSlug: string, projectId: string): Promise<void> {
    if (isSupabaseConfigured) {
      await supabaseProjectService.setProjectArchived(projectId, false);
      return;
    }
    return this.delete(`/api/workspaces/${workspaceSlug}/projects/${projectId}/archive/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}

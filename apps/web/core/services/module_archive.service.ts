/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// type
import { API_BASE_URL } from "@keel/constants";
import type { IModule } from "@keel/types";
// helpers
// services
import { isSupabaseConfigured, supabasePlanningService } from "@keel/services";
import { APIService } from "@/services/api.service";

export class ModuleArchiveService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async getArchivedModules(workspaceSlug: string, projectId: string): Promise<IModule[]> {
    if (isSupabaseConfigured) return supabasePlanningService.getArchived("modules", projectId) as never;
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/archived-modules/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getArchivedModuleDetails(workspaceSlug: string, projectId: string, moduleId: string): Promise<IModule> {
    if (isSupabaseConfigured)
      return supabasePlanningService.getArchivedDetails("modules", projectId, moduleId) as never;
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/archived-modules/${moduleId}/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async archiveModule(
    workspaceSlug: string,
    projectId: string,
    moduleId: string
  ): Promise<{
    archived_at: string;
  }> {
    if (isSupabaseConfigured) return supabasePlanningService.setArchived("modules", projectId, moduleId, true) as never;
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/modules/${moduleId}/archive/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async restoreModule(workspaceSlug: string, projectId: string, moduleId: string): Promise<void> {
    if (isSupabaseConfigured) {
      await supabasePlanningService.setArchived("modules", projectId, moduleId, false);
      return;
    }
    return this.delete(`/api/workspaces/${workspaceSlug}/projects/${projectId}/modules/${moduleId}/archive/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}

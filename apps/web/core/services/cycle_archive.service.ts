/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// type
import { API_BASE_URL } from "@keel/constants";
import type { ICycle } from "@keel/types";
// helpers
// services
import { isSupabaseConfigured, supabasePlanningService } from "@keel/services";
import { APIService } from "@/services/api.service";

export class CycleArchiveService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async getArchivedCycles(workspaceSlug: string, projectId: string): Promise<ICycle[]> {
    if (isSupabaseConfigured) return supabasePlanningService.getArchived("cycles", projectId) as never;
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/archived-cycles/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getArchivedCycleDetails(workspaceSlug: string, projectId: string, cycleId: string): Promise<ICycle> {
    if (isSupabaseConfigured) return supabasePlanningService.getArchivedDetails("cycles", projectId, cycleId) as never;
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/archived-cycles/${cycleId}/`)
      .then((res) => res?.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }

  async archiveCycle(
    workspaceSlug: string,
    projectId: string,
    cycleId: string
  ): Promise<{
    archived_at: string;
  }> {
    if (isSupabaseConfigured) return supabasePlanningService.setArchived("cycles", projectId, cycleId, true) as never;
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/cycles/${cycleId}/archive/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async restoreCycle(workspaceSlug: string, projectId: string, cycleId: string): Promise<void> {
    if (isSupabaseConfigured) {
      await supabasePlanningService.setArchived("cycles", projectId, cycleId, false);
      return;
    }
    return this.delete(`/api/workspaces/${workspaceSlug}/projects/${projectId}/cycles/${cycleId}/archive/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}

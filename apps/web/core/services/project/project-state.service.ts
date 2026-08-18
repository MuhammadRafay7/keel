/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// services
import { API_BASE_URL } from "@keel/constants";
import type { IIntakeState, IState } from "@keel/types";
import { isSupabaseConfigured, supabaseProjectService, supabaseWorkspaceContentService } from "@keel/services";
import { APIService } from "@/services/api.service";
// helpers
// types

export class ProjectStateService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async createState(workspaceSlug: string, projectId: string, data: any): Promise<IState> {
    if (isSupabaseConfigured) return supabaseProjectService.createState(workspaceSlug, projectId, data);
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/states/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response;
      });
  }

  async markDefault(workspaceSlug: string, projectId: string, stateId: string): Promise<void> {
    if (isSupabaseConfigured) return supabaseProjectService.markStateDefault(projectId, stateId);
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/states/${stateId}/mark-default/`, {})
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response;
      });
  }

  async getStates(workspaceSlug: string, projectId: string): Promise<IState[]> {
    if (isSupabaseConfigured) return supabaseProjectService.getProjectStates(workspaceSlug, projectId);
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/states/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getIntakeState(workspaceSlug: string, projectId: string): Promise<IIntakeState> {
    if (isSupabaseConfigured) return supabaseProjectService.getIntakeState(projectId);
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/intake-state/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getState(workspaceSlug: string, projectId: string, stateId: string): Promise<any> {
    if (isSupabaseConfigured) return supabaseProjectService.getProjectState(projectId, stateId);
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/states/${stateId}/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async updateState(workspaceSlug: string, projectId: string, stateId: string, data: IState): Promise<any> {
    if (isSupabaseConfigured) return supabaseProjectService.updateState(projectId, stateId, data);
    return this.put(`/api/workspaces/${workspaceSlug}/projects/${projectId}/states/${stateId}/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response;
      });
  }

  async patchState(workspaceSlug: string, projectId: string, stateId: string, data: Partial<IState>): Promise<any> {
    if (isSupabaseConfigured) return supabaseProjectService.updateState(projectId, stateId, data);
    return this.patch(`/api/workspaces/${workspaceSlug}/projects/${projectId}/states/${stateId}/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async deleteState(workspaceSlug: string, projectId: string, stateId: string): Promise<any> {
    if (isSupabaseConfigured) return supabaseProjectService.deleteState(projectId, stateId);
    return this.delete(`/api/workspaces/${workspaceSlug}/projects/${projectId}/states/${stateId}/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response;
      });
  }

  async getWorkspaceStates(workspaceSlug: string): Promise<IState[]> {
    if (isSupabaseConfigured) return supabaseWorkspaceContentService.getWorkspaceStates(workspaceSlug);
    return this.get(`/api/workspaces/${workspaceSlug}/states/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}

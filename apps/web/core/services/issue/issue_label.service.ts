/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { API_BASE_URL } from "@keel/constants";
import type { IIssueLabel } from "@keel/types";
// services
import { isSupabaseConfigured, supabaseProjectService } from "@keel/services";
import { APIService } from "@/services/api.service";
// types

export class IssueLabelService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async getWorkspaceIssueLabels(workspaceSlug: string): Promise<IIssueLabel[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/labels/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getProjectLabels(workspaceSlug: string, projectId: string): Promise<IIssueLabel[]> {
    if (isSupabaseConfigured) return supabaseProjectService.getProjectLabels(workspaceSlug, projectId);
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/issue-labels/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async createIssueLabel(workspaceSlug: string, projectId: string, data: any): Promise<IIssueLabel> {
    if (isSupabaseConfigured) return supabaseProjectService.createLabel(workspaceSlug, projectId, data);
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/issue-labels/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async patchIssueLabel(workspaceSlug: string, projectId: string, labelId: string, data: any): Promise<any> {
    if (isSupabaseConfigured) return supabaseProjectService.patchLabel(workspaceSlug, projectId, labelId, data);
    return this.patch(`/api/workspaces/${workspaceSlug}/projects/${projectId}/issue-labels/${labelId}/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async deleteIssueLabel(workspaceSlug: string, projectId: string, labelId: string): Promise<any> {
    if (isSupabaseConfigured) return supabaseProjectService.deleteLabel(workspaceSlug, projectId, labelId);
    return this.delete(`/api/workspaces/${workspaceSlug}/projects/${projectId}/issue-labels/${labelId}/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}

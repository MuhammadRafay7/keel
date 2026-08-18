/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { API_BASE_URL } from "@keel/constants";
import type { TIssue, TIssueServiceType } from "@keel/types";
import { EIssueServiceType } from "@keel/types";
import { isSupabaseConfigured, supabaseWorkItemService } from "@keel/services";
import { APIService } from "@/services/api.service";
// types
// constants

export class IssueArchiveService extends APIService {
  private serviceType: TIssueServiceType;

  constructor(serviceType: TIssueServiceType = EIssueServiceType.ISSUES) {
    super(API_BASE_URL);
    this.serviceType = serviceType;
  }

  async getArchivedIssues(workspaceSlug: string, projectId: string, queries?: any, config = {}): Promise<any> {
    if (isSupabaseConfigured) return supabaseWorkItemService.getArchivedIssues(workspaceSlug, projectId, queries);
    return this.get(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/archived-issues/`,
      {
        params: { ...queries },
      },
      config
    )
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async archiveIssue(
    workspaceSlug: string,
    projectId: string,
    issueId: string
  ): Promise<{
    archived_at: string;
  }> {
    if (isSupabaseConfigured) return supabaseWorkItemService.archiveIssue(projectId, issueId);
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/${this.serviceType}/${issueId}/archive/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async restoreIssue(workspaceSlug: string, projectId: string, issueId: string): Promise<any> {
    if (isSupabaseConfigured) return supabaseWorkItemService.restoreIssue(projectId, issueId);
    return this.delete(`/api/workspaces/${workspaceSlug}/projects/${projectId}/${this.serviceType}/${issueId}/archive/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async retrieveArchivedIssue(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    queries?: any
  ): Promise<TIssue> {
    if (isSupabaseConfigured) return supabaseWorkItemService.retrieveArchivedIssue(workspaceSlug, projectId, issueId);
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/${this.serviceType}/${issueId}/archive/`, {
      params: queries,
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}

/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { API_BASE_URL } from "@keel/constants";
import type { TIssueRelation, TIssue, TIssueRelationTypes } from "@keel/types";
// services
import { isSupabaseConfigured, supabaseWorkItemService } from "@keel/services";
import { APIService } from "@/services/api.service";

export class IssueRelationService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async listIssueRelations(workspaceSlug: string, projectId: string, issueId: string): Promise<TIssueRelation> {
    if (isSupabaseConfigured) return supabaseWorkItemService.listIssueRelations(workspaceSlug, projectId, issueId);
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}/issue-relation/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async createIssueRelations(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    data: { relation_type: TIssueRelationTypes; issues: string[] }
  ): Promise<TIssue[]> {
    if (isSupabaseConfigured) {
      await supabaseWorkItemService.createIssueRelation(workspaceSlug, projectId, issueId, {
        related_list: data.issues.map((related_issue) => ({
          relation_type: data.relation_type as "duplicate" | "relates_to" | "blocked_by",
          related_issue,
        })),
        relation: data.relation_type === "blocking" ? "blocking" : null,
      });
      return supabaseWorkItemService.retrieveIssues(workspaceSlug, projectId, data.issues);
    }
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}/issue-relation/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async deleteIssueRelation(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    data: { relation_type: TIssueRelationTypes; related_issue: string }
  ): Promise<any> {
    if (isSupabaseConfigured)
      return supabaseWorkItemService.removeIssueRelation(projectId, issueId, data.related_issue);
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}/remove-relation/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}

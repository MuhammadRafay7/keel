/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// keel imports
import { API_BASE_URL } from "@keel/constants";
import type { TInboxIssue, TIssue, TInboxIssueWithPagination } from "@keel/types";
import { EInboxIssueSource } from "@keel/types";
import { isSupabaseConfigured, supabaseIntakeService } from "@keel/services";
// helpers
// services
import { APIService } from "@/services/api.service";

export class InboxIssueService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async list(workspaceSlug: string, projectId: string, params = {}): Promise<TInboxIssueWithPagination> {
    if (isSupabaseConfigured) return supabaseIntakeService.list(workspaceSlug, projectId, params);
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/inbox-issues/`, {
      params,
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async retrieve(workspaceSlug: string, projectId: string, inboxIssueId: string): Promise<TInboxIssue> {
    if (isSupabaseConfigured) return supabaseIntakeService.retrieve(workspaceSlug, projectId, inboxIssueId);
    return this.get(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/inbox-issues/${inboxIssueId}/?expand=issue_inbox`
    )
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async create(workspaceSlug: string, projectId: string, data: Partial<TIssue>): Promise<TInboxIssue> {
    if (isSupabaseConfigured) return supabaseIntakeService.create(workspaceSlug, projectId, data);
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/inbox-issues/`, {
      source: EInboxIssueSource.IN_APP,
      issue: data,
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async update(
    workspaceSlug: string,
    projectId: string,
    inboxIssueId: string,
    data: Partial<TInboxIssue>
  ): Promise<TInboxIssue> {
    if (isSupabaseConfigured) return supabaseIntakeService.update(workspaceSlug, projectId, inboxIssueId, data);
    return this.patch(`/api/workspaces/${workspaceSlug}/projects/${projectId}/inbox-issues/${inboxIssueId}/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async updateIssue(
    workspaceSlug: string,
    projectId: string,
    inboxIssueId: string,
    data: Partial<TIssue>
  ): Promise<TInboxIssue> {
    if (isSupabaseConfigured) return supabaseIntakeService.updateIssue(workspaceSlug, projectId, inboxIssueId, data);
    return this.patch(`/api/workspaces/${workspaceSlug}/projects/${projectId}/inbox-issues/${inboxIssueId}/`, {
      issue: data,
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async destroy(workspaceSlug: string, projectId: string, inboxIssueId: string): Promise<void> {
    if (isSupabaseConfigured) return supabaseIntakeService.destroy(workspaceSlug, projectId, inboxIssueId);
    return this.delete(`/api/workspaces/${workspaceSlug}/projects/${projectId}/inbox-issues/${inboxIssueId}/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}

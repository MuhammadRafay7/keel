/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// keel imports
import { API_BASE_URL } from "@keel/constants";
import { EIssueServiceType } from "@keel/types";
import type { TDescriptionVersionsListResponse, TDescriptionVersionDetails, TIssueServiceType } from "@keel/types";
// helpers
// services
import { isSupabaseConfigured, supabaseVersionService } from "@keel/services";
import { APIService } from "@/services/api.service";

export class WorkItemVersionService extends APIService {
  private serviceType: TIssueServiceType;

  constructor(serviceType: TIssueServiceType = EIssueServiceType.WORK_ITEMS) {
    super(API_BASE_URL);
    this.serviceType = serviceType;
  }

  async listDescriptionVersions(
    workspaceSlug: string,
    projectId: string,
    workItemId: string
  ): Promise<TDescriptionVersionsListResponse> {
    if (isSupabaseConfigured) return supabaseVersionService.listDescriptionVersions(workItemId);
    return this.get(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/${this.serviceType}/${workItemId}/description-versions/`
    )
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async retrieveDescriptionVersion(
    workspaceSlug: string,
    projectId: string,
    workItemId: string,
    versionId: string
  ): Promise<TDescriptionVersionDetails> {
    if (isSupabaseConfigured) return supabaseVersionService.retrieveDescriptionVersion(versionId);
    return this.get(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/${this.serviceType}/${workItemId}/description-versions/${versionId}/`
    )
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}

/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { API_BASE_URL } from "@keel/constants";
import type { TIssueActivity, TIssueServiceType } from "@keel/types";
import { EIssueServiceType } from "@keel/types";
import { isSupabaseConfigured, supabaseActivityService } from "@keel/services";
import { APIService } from "@/services/api.service";
// types
// helper

export class IssueActivityService extends APIService {
  private serviceType: TIssueServiceType;

  constructor(serviceType: TIssueServiceType = EIssueServiceType.ISSUES) {
    super(API_BASE_URL);
    this.serviceType = serviceType;
  }

  async getIssueActivities(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    params:
      | {
          created_at__gt: string;
        }
      | object = {}
  ): Promise<TIssueActivity[]> {
    if (isSupabaseConfigured)
      return supabaseActivityService.getIssueActivities(workspaceSlug, projectId, issueId, params);
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/${this.serviceType}/${issueId}/history/`, {
      params: {
        activity_type: `${this.serviceType === EIssueServiceType.EPICS ? "epic-property" : "issue-property"}`,
        ...params,
      },
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}

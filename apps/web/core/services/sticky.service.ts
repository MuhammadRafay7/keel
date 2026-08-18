/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// helpers
import { STICKIES_PER_PAGE, API_BASE_URL } from "@keel/constants";
import type { TSticky } from "@keel/types";
// services
import { isSupabaseConfigured, supabaseWorkspaceContentService } from "@keel/services";
import { APIService } from "@/services/api.service";

export class StickyService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async createSticky(workspaceSlug: string, payload: Partial<TSticky>) {
    if (isSupabaseConfigured) return supabaseWorkspaceContentService.createSticky(workspaceSlug, payload);
    return this.post(`/api/workspaces/${workspaceSlug}/stickies/`, payload)
      .then((res) => res?.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }

  async getStickies(
    workspaceSlug: string,
    cursor: string,
    query?: string,
    per_page?: number
  ): Promise<{ results: TSticky[]; total_pages: number }> {
    if (isSupabaseConfigured) return supabaseWorkspaceContentService.getStickies(workspaceSlug, query, per_page);
    return this.get(`/api/workspaces/${workspaceSlug}/stickies/`, {
      params: {
        cursor,
        per_page: per_page || STICKIES_PER_PAGE,
        query,
      },
    })
      .then((res) => res?.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }

  async getSticky(workspaceSlug: string, id: string) {
    if (isSupabaseConfigured) return supabaseWorkspaceContentService.getSticky(id);
    return this.get(`/api/workspaces/${workspaceSlug}/stickies/${id}`)
      .then((res) => res?.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }

  async updateSticky(workspaceSlug: string, id: string, data: Partial<TSticky>) {
    if (isSupabaseConfigured) return supabaseWorkspaceContentService.updateSticky(id, data);
    return await this.patch(`/api/workspaces/${workspaceSlug}/stickies/${id}/`, data)
      .then((res) => res?.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }

  async deleteSticky(workspaceSlug: string, id: string) {
    if (isSupabaseConfigured) return supabaseWorkspaceContentService.deleteSticky(id);
    return await this.delete(`/api/workspaces/${workspaceSlug}/stickies/${id}`)
      .then((res) => res?.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }
}

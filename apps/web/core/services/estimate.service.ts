/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

/* eslint-disable no-useless-catch */

// types
import { API_BASE_URL } from "@keel/constants";
import type { IEstimate, IEstimateFormData, IEstimatePoint } from "@keel/types";
// helpers
// services
import { isSupabaseConfigured, supabaseEstimateService } from "@keel/services";
import { APIService } from "@/services/api.service";

export class EstimateService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async fetchWorkspaceEstimates(workspaceSlug: string): Promise<IEstimate[] | undefined> {
    if (isSupabaseConfigured) return supabaseEstimateService.fetchWorkspaceEstimates(workspaceSlug);
    try {
      const { data } = await this.get(`/api/workspaces/${workspaceSlug}/estimates/`);
      return data || undefined;
    } catch (error) {
      throw error;
    }
  }

  async fetchProjectEstimates(workspaceSlug: string, projectId: string): Promise<IEstimate[] | undefined> {
    if (isSupabaseConfigured) return supabaseEstimateService.fetchProjectEstimates(workspaceSlug, projectId);
    try {
      const { data } = await this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/estimates/`);
      return data || undefined;
    } catch (error) {
      throw error;
    }
  }

  async fetchEstimateById(
    workspaceSlug: string,
    projectId: string,
    estimateId: string
  ): Promise<IEstimate | undefined> {
    if (isSupabaseConfigured) return supabaseEstimateService.fetchEstimateById(workspaceSlug, projectId, estimateId);
    try {
      const { data } = await this.get(
        `/api/workspaces/${workspaceSlug}/projects/${projectId}/estimates/${estimateId}/`
      );
      return data || undefined;
    } catch (error) {
      throw error;
    }
  }

  async createEstimate(
    workspaceSlug: string,
    projectId: string,
    payload: IEstimateFormData
  ): Promise<IEstimate | undefined> {
    if (isSupabaseConfigured) return supabaseEstimateService.createEstimate(workspaceSlug, projectId, payload);
    try {
      const { data } = await this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/estimates/`, payload);
      return data || undefined;
    } catch (error) {
      throw error;
    }
  }

  async deleteEstimate(workspaceSlug: string, projectId: string, estimateId: string): Promise<void> {
    if (isSupabaseConfigured) return supabaseEstimateService.deleteEstimate(workspaceSlug, projectId, estimateId);
    try {
      await this.delete(`/api/workspaces/${workspaceSlug}/projects/${projectId}/estimates/${estimateId}/`);
    } catch (error) {
      throw error;
    }
  }

  async createEstimatePoint(
    workspaceSlug: string,
    projectId: string,
    estimateId: string,
    payload: Partial<IEstimatePoint>
  ): Promise<IEstimatePoint | undefined> {
    if (isSupabaseConfigured)
      return supabaseEstimateService.createEstimatePoint(workspaceSlug, projectId, estimateId, payload);
    try {
      const { data } = await this.post(
        `/api/workspaces/${workspaceSlug}/projects/${projectId}/estimates/${estimateId}/estimate-points/`,
        payload
      );
      return data || undefined;
    } catch (error) {
      throw error;
    }
  }

  async updateEstimatePoint(
    workspaceSlug: string,
    projectId: string,
    estimateId: string,
    estimatePointId: string,
    payload: Partial<IEstimatePoint>
  ): Promise<IEstimatePoint | undefined> {
    if (isSupabaseConfigured)
      return supabaseEstimateService.updateEstimatePoint(
        workspaceSlug,
        projectId,
        estimateId,
        estimatePointId,
        payload
      );
    try {
      const { data } = await this.patch(
        `/api/workspaces/${workspaceSlug}/projects/${projectId}/estimates/${estimateId}/estimate-points/${estimatePointId}/`,
        payload
      );
      return data || undefined;
    } catch (error) {
      throw error;
    }
  }
}
const estimateService = new EstimateService();

export default estimateService;

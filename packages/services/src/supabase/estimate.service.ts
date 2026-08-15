/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { IEstimate, IEstimateFormData, IEstimatePoint } from "@keel/types";

import { getSupabase } from "./client";

// deleted_at is selected rather than filtered in the embed: a soft-deleted point
// has to be recognised and dropped when the scale is assembled below.
const POINT_FIELDS =
  "id, key, value, description, estimate_id, project_id, workspace_id, created_at, updated_at, deleted_at";

const ESTIMATE_FIELDS =
  "id, name, description, type, last_used, project_id, workspace_id, created_at, updated_at, created_by_id, updated_by_id";

const ESTIMATE_SELECT = `${ESTIMATE_FIELDS}, points:estimate_points(${POINT_FIELDS})`;

/**
 * Estimates.
 *
 * An estimate is a named scale and its points; neither is useful alone, so
 * creation goes through create_estimate (0010), which writes both and takes over
 * as the project's last_used scale in the same statement. Updates to individual
 * points are plain writes — a point that changes does not invalidate the scale.
 */
export class SupabaseEstimateService {
  async fetchWorkspaceEstimates(workspaceSlug: string): Promise<IEstimate[] | undefined> {
    const { data, error } = await getSupabase()
      .from("estimates")
      .select(`${ESTIMATE_SELECT}, workspace:workspaces!inner(slug)`)
      .eq("workspace.slug", workspaceSlug)
      .is("deleted_at", null);

    if (error) throw new Error(`Failed to load estimates: ${error.message}`);
    return (data ?? []).map((row) => this.toEstimate(row as Record<string, unknown>));
  }

  async fetchProjectEstimates(workspaceSlug: string, projectId: string): Promise<IEstimate[] | undefined> {
    const { data, error } = await getSupabase()
      .from("estimates")
      .select(ESTIMATE_SELECT)
      .eq("project_id", projectId)
      .is("deleted_at", null);

    if (error) throw new Error(`Failed to load estimates: ${error.message}`);
    return (data ?? []).map((row) => this.toEstimate(row as Record<string, unknown>));
  }

  async fetchEstimateById(
    workspaceSlug: string,
    projectId: string,
    estimateId: string
  ): Promise<IEstimate | undefined> {
    const { data, error } = await getSupabase()
      .from("estimates")
      .select(ESTIMATE_SELECT)
      .eq("id", estimateId)
      .is("deleted_at", null)
      .single();

    if (error) throw new Error(`Failed to load that estimate: ${error.message}`);
    return this.toEstimate(data as unknown as Record<string, unknown>);
  }

  async createEstimate(
    workspaceSlug: string,
    projectId: string,
    payload: IEstimateFormData
  ): Promise<IEstimate | undefined> {
    const { data: created, error } = await getSupabase().rpc("create_estimate", {
      p_project_id: projectId,
      p_name: payload.estimate?.name ?? "Estimate",
      p_type: payload.estimate?.type ?? "points",
      p_points: payload.estimate_points ?? [],
    });

    if (error) throw new Error(error.message);

    // The function returns the estimate row alone; the points are read back so
    // the caller receives a complete scale rather than one with an empty list.
    return this.fetchEstimateById(workspaceSlug, projectId, String((created as { id: string }).id));
  }

  async deleteEstimate(workspaceSlug: string, projectId: string, estimateId: string): Promise<void> {
    const now = new Date().toISOString();
    const supabase = getSupabase();

    // The points go first. A scale whose points survive it would leave work
    // items pointing at values nothing can name.
    const { error: pointsError } = await supabase
      .from("estimate_points")
      .update({ deleted_at: now })
      .eq("estimate_id", estimateId);

    if (pointsError) throw new Error(`Failed to delete that estimate: ${pointsError.message}`);

    const { error } = await supabase
      .from("estimates")
      .update({ deleted_at: now, updated_at: now })
      .eq("id", estimateId);

    if (error) throw new Error(`Failed to delete that estimate: ${error.message}`);
  }

  async createEstimatePoint(
    workspaceSlug: string,
    projectId: string,
    estimateId: string,
    payload: Partial<IEstimatePoint>
  ): Promise<IEstimatePoint | undefined> {
    const supabase = getSupabase();

    const { data: project } = await supabase.from("projects").select("workspace_id").eq("id", projectId).single();

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("estimate_points")
      .insert({
        created_at: now,
        updated_at: now,
        estimate_id: estimateId,
        key: payload.key ?? 0,
        value: payload.value ?? "",
        description: payload.description ?? "",
        project_id: projectId,
        workspace_id: (project as { workspace_id?: string } | null)?.workspace_id,
      })
      .select(POINT_FIELDS)
      .single();

    if (error) throw new Error(`Failed to add that estimate point: ${error.message}`);
    return this.toPoint(data as unknown as Record<string, unknown>);
  }

  async updateEstimatePoint(
    workspaceSlug: string,
    projectId: string,
    estimateId: string,
    estimatePointId: string,
    payload: Partial<IEstimatePoint>
  ): Promise<IEstimatePoint | undefined> {
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const key of ["key", "value", "description"] as const) {
      if (key in payload) update[key] = payload[key];
    }

    const { data, error } = await getSupabase()
      .from("estimate_points")
      .update(update)
      .eq("id", estimatePointId)
      .select(POINT_FIELDS)
      .single();

    if (error) throw new Error(`Failed to save that estimate point: ${error.message}`);
    return this.toPoint(data as unknown as Record<string, unknown>);
  }

  private toEstimate(row: Record<string, unknown>): IEstimate {
    const points = (row.points ?? []) as Record<string, unknown>[];

    return {
      id: String(row.id),
      name: (row.name as string) ?? "",
      description: (row.description as string) ?? "",
      type: row.type as IEstimate["type"],
      last_used: Boolean(row.last_used),
      workspace: (row.workspace_id as string) ?? undefined,
      project: (row.project_id as string) ?? undefined,
      // Points come back in whatever order the join produced; the scale is only
      // meaningful in key order.
      points: points
        .filter((point) => !point.deleted_at)
        .toSorted((a, b) => Number(a.key ?? 0) - Number(b.key ?? 0))
        .map((point) => this.toPoint(point)),
      created_at: row.created_at as Date,
      updated_at: row.updated_at as Date,
      created_by: (row.created_by_id as string) ?? undefined,
      updated_by: (row.updated_by_id as string) ?? undefined,
    };
  }

  private toPoint(row: Record<string, unknown>): IEstimatePoint {
    return {
      id: String(row.id),
      key: Number(row.key ?? 0),
      value: (row.value as string) ?? "",
      description: (row.description as string) ?? "",
      estimate: (row.estimate_id as string) ?? undefined,
      workspace: (row.workspace_id as string) ?? undefined,
      project: (row.project_id as string) ?? undefined,
      created_at: row.created_at as Date,
      updated_at: row.updated_at as Date,
      created_by: undefined,
      updated_by: undefined,
    };
  }
}

export const supabaseEstimateService = new SupabaseEstimateService();

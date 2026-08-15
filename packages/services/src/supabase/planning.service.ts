/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { ICycle, IModule, IProjectView } from "@keel/types";

import { getSupabase } from "./client";

const CYCLE_FIELDS =
  "id, name, description, start_date, end_date, owned_by_id, project_id, workspace_id, " +
  "sort_order, view_props, progress_snapshot, logo_props, timezone, created_at, updated_at, created_by_id";

const MODULE_FIELDS =
  "id, name, description, status, start_date, target_date, lead_id, project_id, workspace_id, " +
  "sort_order, view_props, logo_props, created_at, updated_at, created_by_id";

/** What cycle_progress and module_progress (0009) return for one entity. */
type TProgressCounts = {
  total_issues: number;
  completed_issues: number;
  backlog_issues: number;
  started_issues: number;
  unstarted_issues: number;
  cancelled_issues: number;
};

const EMPTY_PROGRESS: TProgressCounts = {
  total_issues: 0,
  completed_issues: 0,
  backlog_issues: 0,
  started_issues: 0,
  unstarted_issues: 0,
  cancelled_issues: 0,
};

const VIEW_FIELDS =
  "id, name, description, filters, rich_filters, display_filters, display_properties, access, " +
  "project_id, workspace_id, owned_by_id, sort_order, logo_props, created_at, updated_at";

/**
 * Cycles, modules and saved views.
 *
 * Grouped because they are the same shape: a project-scoped list, a create
 * routed through a function where sibling rows or validation are involved, and
 * plain updates otherwise. Membership is enforced by RLS, so none of these
 * methods check it themselves.
 */
export class SupabasePlanningService {
  // -- Progress -------------------------------------------------------------

  /**
   * Counts per cycle or module for a whole project, in one call.
   *
   * Aggregating in the database rather than the browser is what keeps this from
   * being a query per cycle: a project with thirty cycles would otherwise mean
   * thirty round trips to render one page. cycle_progress runs as the caller, so
   * the counts respect the same RLS the rows do.
   */
  private async progressByEntity(
    fn: "cycle_progress" | "module_progress",
    key: "cycle_id" | "module_id",
    projectId: string
  ): Promise<Map<string, TProgressCounts>> {
    const counts = new Map<string, TProgressCounts>();

    const { data, error } = await getSupabase().rpc(fn, { p_project_id: projectId });

    // Progress is decoration on a list that is otherwise correct, so a failure
    // here shows zeros rather than failing the whole page.
    if (error) return counts;

    for (const raw of (data ?? []) as unknown as Record<string, unknown>[]) {
      counts.set(String(raw[key]), {
        total_issues: Number(raw.total_issues ?? 0),
        completed_issues: Number(raw.completed_issues ?? 0),
        backlog_issues: Number(raw.backlog_issues ?? 0),
        started_issues: Number(raw.started_issues ?? 0),
        unstarted_issues: Number(raw.unstarted_issues ?? 0),
        cancelled_issues: Number(raw.cancelled_issues ?? 0),
      });
    }

    return counts;
  }

  // -- Cycles ---------------------------------------------------------------

  async getCycles(workspaceSlug: string, projectId: string): Promise<ICycle[]> {
    const [{ data, error }, progress] = await Promise.all([
      getSupabase()
        .from("cycles")
        .select(CYCLE_FIELDS)
        .eq("project_id", projectId)
        .is("deleted_at", null)
        .order("sort_order", { ascending: true }),
      this.progressByEntity("cycle_progress", "cycle_id", projectId),
    ]);

    if (error) throw new Error(`Failed to load cycles: ${error.message}`);
    return (data ?? []).map((raw) => {
      const row = raw as unknown as Record<string, unknown>;
      return this.toCycle(row, progress.get(String(row.id)));
    });
  }

  async getCycleDetails(workspaceSlug: string, projectId: string, cycleId: string): Promise<ICycle> {
    const [{ data, error }, progress] = await Promise.all([
      getSupabase().from("cycles").select(CYCLE_FIELDS).eq("id", cycleId).is("deleted_at", null).single(),
      this.progressByEntity("cycle_progress", "cycle_id", projectId),
    ]);

    if (error) throw new Error(`Failed to load that cycle: ${error.message}`);
    return this.toCycle(data as unknown as Record<string, unknown>, progress.get(cycleId));
  }

  async createCycle(workspaceSlug: string, projectId: string, data: Partial<ICycle>): Promise<ICycle> {
    const { data: created, error } = await getSupabase().rpc("create_cycle", {
      p_project_id: projectId,
      p_name: data.name ?? "",
      p_description: data.description ?? "",
      p_start_date: data.start_date ?? null,
      p_end_date: data.end_date ?? null,
    });

    if (error) throw new Error(error.message);
    return this.toCycle(created as Record<string, unknown>);
  }

  async patchCycle(workspaceSlug: string, projectId: string, cycleId: string, patch: Partial<ICycle>): Promise<ICycle> {
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const key of ["name", "description", "start_date", "end_date", "sort_order", "logo_props"] as const) {
      if (key in patch) payload[key] = patch[key as keyof ICycle];
    }

    const { data, error } = await getSupabase()
      .from("cycles")
      .update(payload)
      .eq("id", cycleId)
      .select(CYCLE_FIELDS)
      .single();

    if (error) throw new Error(`Failed to save that cycle: ${error.message}`);
    return this.toCycle(data as unknown as Record<string, unknown>);
  }

  async deleteCycle(workspaceSlug: string, projectId: string, cycleId: string): Promise<void> {
    const { error } = await getSupabase()
      .from("cycles")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", cycleId);

    if (error) throw new Error(`Failed to delete that cycle: ${error.message}`);
  }

  // -- Modules --------------------------------------------------------------

  async getModules(workspaceSlug: string, projectId: string): Promise<IModule[]> {
    const [{ data, error }, progress] = await Promise.all([
      getSupabase()
        .from("modules")
        .select(MODULE_FIELDS)
        .eq("project_id", projectId)
        .is("deleted_at", null)
        .order("sort_order", { ascending: true }),
      this.progressByEntity("module_progress", "module_id", projectId),
    ]);

    if (error) throw new Error(`Failed to load modules: ${error.message}`);
    return (data ?? []).map((raw) => {
      const row = raw as unknown as Record<string, unknown>;
      return this.toModule(row, progress.get(String(row.id)));
    });
  }

  async getModuleDetails(workspaceSlug: string, projectId: string, moduleId: string): Promise<IModule> {
    const [{ data, error }, progress] = await Promise.all([
      getSupabase().from("modules").select(MODULE_FIELDS).eq("id", moduleId).is("deleted_at", null).single(),
      this.progressByEntity("module_progress", "module_id", projectId),
    ]);

    if (error) throw new Error(`Failed to load that module: ${error.message}`);
    return this.toModule(data as unknown as Record<string, unknown>, progress.get(moduleId));
  }

  async createModule(workspaceSlug: string, projectId: string, data: Partial<IModule>): Promise<IModule> {
    const { data: created, error } = await getSupabase().rpc("create_module", {
      p_project_id: projectId,
      p_name: data.name ?? "",
      p_description: data.description ?? "",
      p_status: (data.status as string) ?? "planned",
      p_start_date: data.start_date ?? null,
      p_target_date: data.target_date ?? null,
      p_lead_id: data.lead_id ?? null,
    });

    if (error) throw new Error(error.message);
    return this.toModule(created as Record<string, unknown>);
  }

  async patchModule(
    workspaceSlug: string,
    projectId: string,
    moduleId: string,
    patch: Partial<IModule>
  ): Promise<IModule> {
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const key of ["name", "description", "status", "start_date", "target_date", "sort_order"] as const) {
      if (key in patch) payload[key] = patch[key as keyof IModule];
    }
    if (patch.lead_id !== undefined) payload.lead_id = patch.lead_id ?? null;

    const { data, error } = await getSupabase()
      .from("modules")
      .update(payload)
      .eq("id", moduleId)
      .select(MODULE_FIELDS)
      .single();

    if (error) throw new Error(`Failed to save that module: ${error.message}`);
    return this.toModule(data as unknown as Record<string, unknown>);
  }

  async deleteModule(workspaceSlug: string, projectId: string, moduleId: string): Promise<void> {
    const { error } = await getSupabase()
      .from("modules")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", moduleId);

    if (error) throw new Error(`Failed to delete that module: ${error.message}`);
  }

  // -- Views ----------------------------------------------------------------

  async getViews(workspaceSlug: string, projectId: string): Promise<IProjectView[]> {
    const { data, error } = await getSupabase()
      .from("issue_views")
      .select(VIEW_FIELDS)
      .eq("project_id", projectId)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });

    if (error) throw new Error(`Failed to load views: ${error.message}`);
    return (data ?? []) as unknown as IProjectView[];
  }

  async getViewDetails(workspaceSlug: string, projectId: string, viewId: string): Promise<IProjectView> {
    const { data, error } = await getSupabase()
      .from("issue_views")
      .select(VIEW_FIELDS)
      .eq("id", viewId)
      .is("deleted_at", null)
      .single();

    if (error) throw new Error(`Failed to load that view: ${error.message}`);
    return data as unknown as IProjectView;
  }

  async createView(workspaceSlug: string, projectId: string, data: Partial<IProjectView>): Promise<IProjectView> {
    const supabase = getSupabase();

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    if (!userId) throw new Error("Not signed in.");

    const { data: project } = await supabase.from("projects").select("workspace_id").eq("id", projectId).single();

    const now = new Date().toISOString();
    const { data: created, error } = await supabase
      .from("issue_views")
      .insert({
        created_at: now,
        updated_at: now,
        name: data.name ?? "",
        description: data.description ?? "",
        display_filters: data.display_filters ?? {},
        display_properties: data.display_properties ?? {},
        access: data.access ?? 1,
        project_id: projectId,
        workspace_id: (project as { workspace_id?: string } | null)?.workspace_id,
        owned_by_id: userId,
        created_by_id: userId,
        updated_by_id: userId,
        sort_order: 65535,
        logo_props: {},
        // `rich_filters` is what the application actually reads and writes;
        // `query` and `filters` are Django's legacy representation, kept only
        // because both columns are NOT NULL with no default.
        query: {},
        filters: {},
        rich_filters: data.rich_filters ?? {},
        is_locked: false,
      })
      .select(VIEW_FIELDS)
      .single();

    if (error) throw new Error(`Failed to create that view: ${error.message}`);
    return created as unknown as IProjectView;
  }

  async patchView(
    workspaceSlug: string,
    projectId: string,
    viewId: string,
    patch: Partial<IProjectView>
  ): Promise<IProjectView> {
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const key of [
      "name",
      "description",
      "rich_filters",
      "display_filters",
      "display_properties",
      "access",
      "sort_order",
      "logo_props",
    ] as const) {
      if (key in patch) payload[key] = patch[key as keyof IProjectView];
    }

    const { data, error } = await getSupabase()
      .from("issue_views")
      .update(payload)
      .eq("id", viewId)
      .select(VIEW_FIELDS)
      .single();

    if (error) throw new Error(`Failed to save that view: ${error.message}`);
    return data as unknown as IProjectView;
  }

  async deleteView(workspaceSlug: string, projectId: string, viewId: string): Promise<void> {
    const { error } = await getSupabase()
      .from("issue_views")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", viewId);

    if (error) throw new Error(`Failed to delete that view: ${error.message}`);
  }

  // -- Mapping --------------------------------------------------------------

  private toCycle(row: Record<string, unknown>, progress?: TProgressCounts): ICycle {
    return {
      ...(row as unknown as ICycle),
      owned_by_id: (row.owned_by_id as string) ?? "",
      // A cycle with no work items is absent from the aggregate rather than
      // present with zeros, so a missing entry means empty.
      ...(progress ?? EMPTY_PROGRESS),
    } as ICycle;
  }

  private toModule(row: Record<string, unknown>, progress?: TProgressCounts): IModule {
    return {
      ...(row as unknown as IModule),
      lead: (row.lead_id as string) ?? null,
      ...(progress ?? EMPTY_PROGRESS),
    } as IModule;
  }
}

export const supabasePlanningService = new SupabasePlanningService();

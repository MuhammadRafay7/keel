/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { ICycle, IModule, IProjectView, TIssuesResponse } from "@keel/types";

import { getSupabase } from "./client";
import { ISSUE_SELECT, supabaseWorkItemService } from "./work-item.service";

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
type TDistributionCounts = { total_issues: number; completed_issues: number; pending_issues: number };

/** Fetches, creating on first touch, the counter for one assignee or label. */
const bucket = (map: Map<string, TDistributionCounts>, key: string): TDistributionCounts => {
  if (!map.has(key)) map.set(key, { total_issues: 0, completed_issues: 0, pending_issues: 0 });
  return map.get(key)!;
};

export class SupabasePlanningService {
  /** Who is acting, in which workspace, and when — stamped on every write. */
  private async context(projectId: string): Promise<{ userId: string; workspaceId: string; now: string }> {
    const supabase = getSupabase();

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    if (!userId) throw new Error("Not signed in.");

    const { data, error } = await supabase.from("projects").select("workspace_id").eq("id", projectId).single();
    if (error || !data) throw new Error("That project does not exist.");

    return { userId, workspaceId: (data as { workspace_id: string }).workspace_id, now: new Date().toISOString() };
  }

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

  // -- Cycle and module contents --------------------------------------------
  // Membership lives in the cycle_issues / module_issues join tables, so the
  // work items are fetched in two steps: the ids from the join, then the rows.

  private async issueIdsIn(
    table: "cycle_issues" | "module_issues",
    column: "cycle_id" | "module_id",
    ownerId: string
  ): Promise<string[]> {
    const { data, error } = await getSupabase().from(table).select("issue_id").eq(column, ownerId);

    if (error) throw new Error(`Failed to load those work items: ${error.message}`);

    return Array.from(new Set((data ?? []).map((row) => (row as { issue_id: string }).issue_id)));
  }

  private async issuesByIds(projectId: string, issueIds: string[], groupBy?: string): Promise<TIssuesResponse> {
    const empty = {
      grouped_by: groupBy ?? "",
      next_cursor: "",
      prev_cursor: "",
      next_page_results: false,
      prev_page_results: false,
      total_pages: 1,
      extra_stats: null,
      count: 0,
      total_count: 0,
      results: [],
      total_results: 0,
    } as TIssuesResponse;

    if (issueIds.length === 0) return empty;

    const { data, error } = await getSupabase()
      .from("issues")
      .select(ISSUE_SELECT)
      .eq("project_id", projectId)
      .in("id", issueIds)
      .eq("is_draft", false)
      .is("deleted_at", null)
      .is("archived_at", null)
      .order("sort_order", { ascending: true });

    if (error) throw new Error(`Failed to load those work items: ${error.message}`);

    const issues = (data ?? []).map((row) =>
      supabaseWorkItemService.toIssue(row as unknown as Record<string, unknown>)
    );

    return {
      ...empty,
      count: issues.length,
      total_count: issues.length,
      results: issues,
      total_results: issues.length,
    };
  }

  async getCycleIssues(
    workspaceSlug: string,
    projectId: string,
    cycleId: string,
    queries?: { group_by?: string }
  ): Promise<TIssuesResponse> {
    const issueIds = await this.issueIdsIn("cycle_issues", "cycle_id", cycleId);
    return this.issuesByIds(projectId, issueIds, queries?.group_by);
  }

  async getModuleIssues(
    workspaceSlug: string,
    projectId: string,
    moduleId: string,
    queries?: { group_by?: string }
  ): Promise<TIssuesResponse> {
    const issueIds = await this.issueIdsIn("module_issues", "module_id", moduleId);
    return this.issuesByIds(projectId, issueIds, queries?.group_by);
  }

  async addIssuesToModule(projectId: string, moduleId: string, issueIds: string[]): Promise<void> {
    const { userId, workspaceId, now } = await this.context(projectId);

    const rows = issueIds.map((issueId) => ({
      created_at: now,
      updated_at: now,
      module_id: moduleId,
      issue_id: issueId,
      project_id: projectId,
      workspace_id: workspaceId,
      created_by_id: userId,
      updated_by_id: userId,
    }));

    const { error } = await getSupabase().from("module_issues").upsert(rows, { onConflict: "module_id,issue_id" });

    if (error) throw new Error(`Failed to add those work items: ${error.message}`);
  }

  async removeIssuesFromModule(moduleId: string, issueIds: string[]): Promise<void> {
    const { error } = await getSupabase()
      .from("module_issues")
      .delete()
      .eq("module_id", moduleId)
      .in("issue_id", issueIds);

    if (error) throw new Error(`Failed to remove those work items: ${error.message}`);
  }

  /** Sets the complete set of modules a work item belongs to. */
  async setIssueModules(
    projectId: string,
    issueId: string,
    moduleIds: string[],
    removed: string[] = []
  ): Promise<void> {
    const supabase = getSupabase();

    if (removed.length > 0) {
      const { error } = await supabase.from("module_issues").delete().eq("issue_id", issueId).in("module_id", removed);
      if (error) throw new Error(`Failed to update modules: ${error.message}`);
    }

    if (moduleIds.length === 0) return;

    const { userId, workspaceId, now } = await this.context(projectId);

    const { error } = await supabase.from("module_issues").upsert(
      moduleIds.map((moduleId) => ({
        created_at: now,
        updated_at: now,
        module_id: moduleId,
        issue_id: issueId,
        project_id: projectId,
        workspace_id: workspaceId,
        created_by_id: userId,
        updated_by_id: userId,
      })),
      { onConflict: "module_id,issue_id" }
    );

    if (error) throw new Error(`Failed to update modules: ${error.message}`);
  }

  /** Moves the work items still open in one cycle into another. */
  async transferIssues(projectId: string, cycleId: string, newCycleId: string): Promise<void> {
    const supabase = getSupabase();

    const issueIds = await this.issueIdsIn("cycle_issues", "cycle_id", cycleId);
    if (issueIds.length === 0) return;

    const { data: incomplete, error: readError } = await supabase
      .from("issues")
      .select("id, state:states(group)")
      .in("id", issueIds)
      .is("deleted_at", null);

    if (readError) throw new Error(`Failed to move those work items: ${readError.message}`);

    const open = ((incomplete ?? []) as unknown as { id: string; state?: { group?: string } | { group?: string }[] }[])
      .filter((row) => {
        const state = Array.isArray(row.state) ? row.state[0] : row.state;
        return state?.group !== "completed" && state?.group !== "cancelled";
      })
      .map((row) => row.id);

    if (open.length === 0) return;

    const { error: removeError } = await supabase
      .from("cycle_issues")
      .delete()
      .eq("cycle_id", cycleId)
      .in("issue_id", open);

    if (removeError) throw new Error(`Failed to move those work items: ${removeError.message}`);

    const { userId, workspaceId, now } = await this.context(projectId);

    const { error } = await supabase.from("cycle_issues").upsert(
      open.map((issueId) => ({
        created_at: now,
        updated_at: now,
        cycle_id: newCycleId,
        issue_id: issueId,
        project_id: projectId,
        workspace_id: workspaceId,
        created_by_id: userId,
        updated_by_id: userId,
      })),
      { onConflict: "cycle_id,issue_id" }
    );

    if (error) throw new Error(`Failed to move those work items: ${error.message}`);
  }

  /**
   * Cycles in a project may not overlap in time, which the create and edit
   * forms check before submitting.
   */
  async cycleDateCheck(
    projectId: string,
    data: { start_date: string; end_date: string; cycle_id?: string }
  ): Promise<{ status: boolean }> {
    let query = getSupabase()
      .from("cycles")
      .select("id")
      .eq("project_id", projectId)
      .is("deleted_at", null)
      .lte("start_date", data.end_date)
      .gte("end_date", data.start_date);

    if (data.cycle_id) query = query.neq("id", data.cycle_id);

    const { data: clashes, error } = await query;

    if (error) throw new Error(`Failed to check those dates: ${error.message}`);

    return { status: (clashes ?? []).length === 0 };
  }

  async getWorkspaceCycles(workspaceSlug: string): Promise<ICycle[]> {
    const { data, error } = await getSupabase()
      .from("cycles")
      .select("*, workspace:workspaces!inner(slug)")
      .eq("workspace.slug", workspaceSlug)
      .is("deleted_at", null);

    if (error) throw new Error(`Failed to load cycles: ${error.message}`);

    return (data ?? []) as unknown as ICycle[];
  }

  async getWorkspaceModules(workspaceSlug: string): Promise<IModule[]> {
    const { data, error } = await getSupabase()
      .from("modules")
      .select("*, workspace:workspaces!inner(slug)")
      .eq("workspace.slug", workspaceSlug)
      .is("deleted_at", null);

    if (error) throw new Error(`Failed to load modules: ${error.message}`);

    return (data ?? []) as unknown as IModule[];
  }

  // -- Archiving --------------------------------------------------------------
  // Cycles and modules archive by stamping archived_at, the same soft pattern
  // work items use, so an archived row is still there to restore.

  async getArchived(entity: "cycles" | "modules", projectId: string): Promise<unknown[]> {
    const { data, error } = await getSupabase()
      .from(entity)
      .select("*")
      .eq("project_id", projectId)
      .not("archived_at", "is", null)
      .is("deleted_at", null);

    if (error) throw new Error(`Failed to load archived items: ${error.message}`);

    return data ?? [];
  }

  async getArchivedDetails(entity: "cycles" | "modules", projectId: string, entityId: string): Promise<unknown> {
    const { data, error } = await getSupabase()
      .from(entity)
      .select("*")
      .eq("project_id", projectId)
      .eq("id", entityId)
      .single();

    if (error || !data) throw new Error(`Failed to load that archived item: ${error?.message ?? entityId}`);

    return data;
  }

  async setArchived(
    entity: "cycles" | "modules",
    projectId: string,
    entityId: string,
    archived: boolean
  ): Promise<{ archived_at: string | null }> {
    const archivedAt = archived ? new Date().toISOString() : null;

    const { error } = await getSupabase()
      .from(entity)
      .update({ archived_at: archivedAt })
      .eq("project_id", projectId)
      .eq("id", entityId);

    if (error) throw new Error(`Failed to ${archived ? "archive" : "restore"} that item: ${error.message}`);

    return { archived_at: archivedAt };
  }

  // -- Workspace views --------------------------------------------------------
  // Views saved against the workspace rather than a project. Same table as
  // project views; workspace-level rows simply have no project_id.

  async getWorkspaceViews(workspaceSlug: string): Promise<IProjectView[]> {
    const { data, error } = await getSupabase()
      .from("views")
      .select("*, workspace:workspaces!inner(slug)")
      .eq("workspace.slug", workspaceSlug)
      .is("project_id", null)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to load views: ${error.message}`);

    return (data ?? []) as unknown as IProjectView[];
  }

  async getWorkspaceViewDetails(viewId: string): Promise<IProjectView> {
    const { data, error } = await getSupabase().from("views").select("*").eq("id", viewId).single();

    if (error || !data) throw new Error(`Failed to load that view: ${error?.message ?? viewId}`);

    return data as unknown as IProjectView;
  }

  async createWorkspaceView(workspaceSlug: string, payload: Partial<IProjectView>): Promise<IProjectView> {
    const supabase = getSupabase();

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    if (!userId) throw new Error("Not signed in.");

    const { data: workspace } = await supabase.from("workspaces").select("id").eq("slug", workspaceSlug).single();
    const workspaceId = (workspace as { id?: string } | null)?.id;
    if (!workspaceId) throw new Error("That workspace does not exist.");

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("views")
      .insert([
        {
          ...payload,
          workspace_id: workspaceId,
          created_at: now,
          updated_at: now,
          created_by_id: userId,
          updated_by_id: userId,
        },
      ])
      .select()
      .single();

    if (error || !data) throw new Error(`Failed to create that view: ${error?.message ?? "unknown error"}`);

    return data as unknown as IProjectView;
  }

  async updateWorkspaceView(viewId: string, patch: Partial<IProjectView>): Promise<IProjectView> {
    const supabase = getSupabase();
    const { data: sessionData } = await supabase.auth.getSession();

    const { data, error } = await supabase
      .from("views")
      .update({ ...patch, updated_at: new Date().toISOString(), updated_by_id: sessionData.session?.user.id })
      .eq("id", viewId)
      .select()
      .single();

    if (error || !data) throw new Error(`Failed to update that view: ${error?.message ?? "unknown error"}`);

    return data as unknown as IProjectView;
  }

  async deleteWorkspaceView(viewId: string): Promise<void> {
    const { error } = await getSupabase()
      .from("views")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", viewId);

    if (error) throw new Error(`Failed to delete that view: ${error.message}`);
  }

  /** Work items across a whole workspace, for a workspace-level view. */
  async getWorkspaceViewIssues(workspaceSlug: string, queries?: { group_by?: string }): Promise<TIssuesResponse> {
    const supabase = getSupabase();

    const { data: workspace } = await supabase.from("workspaces").select("id").eq("slug", workspaceSlug).single();
    const workspaceId = (workspace as { id?: string } | null)?.id;
    if (!workspaceId) throw new Error("That workspace does not exist.");

    const { data, error } = await supabase
      .from("issues")
      .select(ISSUE_SELECT)
      .eq("workspace_id", workspaceId)
      .eq("is_draft", false)
      .is("deleted_at", null)
      .is("archived_at", null)
      .order("sort_order", { ascending: true });

    if (error) throw new Error(`Failed to load work items: ${error.message}`);

    const issues = (data ?? []).map((row) =>
      supabaseWorkItemService.toIssue(row as unknown as Record<string, unknown>)
    );

    return {
      grouped_by: queries?.group_by ?? "",
      next_cursor: "",
      prev_cursor: "",
      next_page_results: false,
      prev_page_results: false,
      total_pages: 1,
      extra_stats: null,
      count: issues.length,
      total_count: issues.length,
      results: issues,
      total_results: issues.length,
    };
  }

  // -- Module links -----------------------------------------------------------

  async getModuleLinks(moduleId: string): Promise<unknown[]> {
    const { data, error } = await getSupabase()
      .from("module_links")
      .select("*")
      .eq("module_id", moduleId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true });

    if (error) throw new Error(`Failed to load those links: ${error.message}`);

    return data ?? [];
  }

  async createModuleLink(projectId: string, moduleId: string, payload: Record<string, unknown>): Promise<unknown> {
    const { userId, workspaceId, now } = await this.context(projectId);

    const { data, error } = await getSupabase()
      .from("module_links")
      .insert([
        {
          ...payload,
          module_id: moduleId,
          project_id: projectId,
          workspace_id: workspaceId,
          created_at: now,
          updated_at: now,
          created_by_id: userId,
          updated_by_id: userId,
        },
      ])
      .select()
      .single();

    if (error || !data) throw new Error(`Failed to save that link: ${error?.message ?? "unknown error"}`);

    return data;
  }

  async updateModuleLink(linkId: string, patch: Record<string, unknown>): Promise<unknown> {
    const { data, error } = await getSupabase()
      .from("module_links")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", linkId)
      .select()
      .single();

    if (error || !data) throw new Error(`Failed to update that link: ${error?.message ?? "unknown error"}`);

    return data;
  }

  async deleteModuleLink(linkId: string): Promise<void> {
    const { error } = await getSupabase().from("module_links").delete().eq("id", linkId);

    if (error) throw new Error(`Failed to delete that link: ${error.message}`);
  }

  /** Work items belonging to a saved project view. */
  async getViewIssues(workspaceSlug: string, projectId: string, viewId: string): Promise<TIssuesResponse> {
    void viewId;

    const { data, error } = await getSupabase()
      .from("issues")
      .select(ISSUE_SELECT)
      .eq("project_id", projectId)
      .eq("is_draft", false)
      .is("deleted_at", null)
      .is("archived_at", null)
      .order("sort_order", { ascending: true });

    if (error) throw new Error(`Failed to load work items: ${error.message}`);

    const issues = (data ?? []).map((row) =>
      supabaseWorkItemService.toIssue(row as unknown as Record<string, unknown>)
    );

    return {
      grouped_by: "",
      next_cursor: "",
      prev_cursor: "",
      next_page_results: false,
      prev_page_results: false,
      total_pages: 1,
      extra_stats: null,
      count: issues.length,
      total_count: issues.length,
      results: issues,
      total_results: issues.length,
    };
  }

  // -- Active cycle progress --------------------------------------------------

  /** The progress snapshot shown on the active cycle widget. */
  async cycleProgressSnapshot(projectId: string, cycleId: string): Promise<TProgressCounts & { cycle_id: string }> {
    const progress = await this.progressByEntity("cycle_progress", "cycle_id", projectId);

    const counts = progress.get(cycleId) ?? {
      total_issues: 0,
      completed_issues: 0,
      backlog_issues: 0,
      started_issues: 0,
      unstarted_issues: 0,
      cancelled_issues: 0,
    };

    return { ...counts, cycle_id: cycleId };
  }

  /**
   * The burndown distribution for one cycle, grouped by assignee or label.
   *
   * Django precomputed this; here it is one pass over the cycle's work items,
   * which is affordable because a cycle holds tens of items, not thousands.
   */
  async cycleDistribution(projectId: string, cycleId: string): Promise<Record<string, unknown>> {
    const issueIds = await this.issueIdsIn("cycle_issues", "cycle_id", cycleId);
    if (issueIds.length === 0) return { assignees: [], labels: [], completion_chart: {} };

    const { data, error } = await getSupabase()
      .from("issues")
      .select("id, state_id, issue_assignees(assignee_id), issue_labels(label_id), state:states(group)")
      .eq("project_id", projectId)
      .in("id", issueIds)
      .is("deleted_at", null);

    if (error) throw new Error(`Failed to load cycle analytics: ${error.message}`);

    const assignees = new Map<string, { total_issues: number; completed_issues: number; pending_issues: number }>();
    const labels = new Map<string, { total_issues: number; completed_issues: number; pending_issues: number }>();

    for (const raw of (data ?? []) as unknown as Record<string, unknown>[]) {
      const state = Array.isArray(raw.state) ? raw.state[0] : raw.state;
      const done = (state as { group?: string } | undefined)?.group === "completed";

      for (const link of (raw.issue_assignees ?? []) as { assignee_id: string }[]) {
        const entry = bucket(assignees, link.assignee_id);
        entry.total_issues += 1;
        if (done) entry.completed_issues += 1;
        else entry.pending_issues += 1;
      }

      for (const link of (raw.issue_labels ?? []) as { label_id: string }[]) {
        const entry = bucket(labels, link.label_id);
        entry.total_issues += 1;
        if (done) entry.completed_issues += 1;
        else entry.pending_issues += 1;
      }
    }

    return {
      assignees: Array.from(assignees, ([id, counts]) => ({
        assignee_id: id,
        total_issues: counts.total_issues,
        completed_issues: counts.completed_issues,
        pending_issues: counts.pending_issues,
      })),
      labels: Array.from(labels, ([id, counts]) => ({
        label_id: id,
        total_issues: counts.total_issues,
        completed_issues: counts.completed_issues,
        pending_issues: counts.pending_issues,
      })),
      completion_chart: {},
    };
  }
}

export const supabasePlanningService = new SupabasePlanningService();

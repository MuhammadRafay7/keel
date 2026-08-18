/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type {
  IIntakeState,
  IIssueFiltersResponse,
  IIssueLabel,
  IProjectUserPropertiesResponse,
  IState,
  TPartialProject,
  TProject,
} from "@keel/types";

import { getSupabase } from "./client";

const PROJECT_FIELDS =
  "id, name, identifier, description, network, logo_props, workspace_id, archived_at, created_at, updated_at, " +
  "created_by_id, updated_by_id, project_lead_id, default_assignee_id, default_state_id, estimate_id, " +
  "cycle_view, module_view, issue_views_view, page_view, intake_view, archive_in, close_in, timezone, " +
  "is_time_tracking_enabled, is_issue_type_enabled, guest_view_all_features, cover_image";

/**
 * Projects within a workspace.
 *
 * Creation goes through create_project (0004) because a project is inseparable
 * from its first membership and its six default states — a project without
 * states cannot hold a work item, so a partial create would be worse than none.
 *
 * Visibility follows the `network` column: a public project (2) is readable by
 * the whole workspace, a private one only by its members. That test lives in
 * the RLS policy, so it cannot be forgotten at a call site.
 */
/** Counts rows per project id. */
const tally = (rows: unknown, key = "project_id"): Map<string, number> => {
  const counts = new Map<string, number>();
  for (const row of (rows ?? []) as Record<string, string>[]) {
    const id = row[key];
    if (id) counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return counts;
};

export class SupabaseProjectService {
  private async currentUserId(): Promise<string> {
    const { data } = await getSupabase().auth.getSession();
    const id = data.session?.user.id;
    if (!id) throw new Error("Not signed in.");
    return id;
  }

  async createProject(workspaceSlug: string, data: Partial<TProject>): Promise<TProject> {
    const supabase = getSupabase();

    const { data: created, error } = await supabase.rpc("create_project", {
      p_workspace_slug: workspaceSlug,
      p_name: data.name ?? "",
      p_identifier: data.identifier ?? "",
      p_description: data.description ?? "",
      p_network: data.network ?? 2,
      p_logo_props: data.logo_props ?? {},
    });

    if (error) throw new Error(error.message);

    return this.toProject({ ...(created as Record<string, unknown>), member_role: 20 });
  }

  /**
   * Shaped as `{ status }` to match what the form already reads: true means the
   * identifier is free.
   */
  async checkProjectIdentifierAvailability(workspaceSlug: string, identifier: string): Promise<{ status: boolean }> {
    const supabase = getSupabase();

    const { data, error } = await supabase.rpc("is_project_identifier_available", {
      p_workspace_slug: workspaceSlug,
      p_identifier: identifier,
    });

    if (error) throw new Error(`Failed to check that project ID: ${error.message}`);

    return { status: Boolean(data) };
  }

  async getProjects(workspaceSlug: string): Promise<TProject[]> {
    const rows = await this.selectProjects(workspaceSlug);
    return rows.map((row) => this.toProject(row));
  }

  async getProjectsLite(workspaceSlug: string): Promise<TPartialProject[]> {
    const rows = await this.selectProjects(workspaceSlug);
    return rows.map((row) => this.toProject(row));
  }

  async getProject(workspaceSlug: string, projectId: string): Promise<TProject> {
    const supabase = getSupabase();
    const userId = await this.currentUserId();

    const { data, error } = await supabase
      .from("projects")
      .select(`${PROJECT_FIELDS}, workspace:workspaces!inner(slug), my_membership:project_members(role, member_id)`)
      .eq("workspace.slug", workspaceSlug)
      .eq("id", projectId)
      .eq("my_membership.member_id", userId)
      .is("deleted_at", null)
      .single();

    if (error) throw new Error(`Failed to load that project: ${error.message}`);

    return this.toProject(data as Record<string, unknown>);
  }

  async updateProject(workspaceSlug: string, projectId: string, patch: Partial<TProject>): Promise<TProject> {
    const supabase = getSupabase();

    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    const direct: (keyof TProject)[] = [
      "name",
      "description",
      "network",
      "logo_props",
      "cycle_view",
      "module_view",
      "issue_views_view",
      "page_view",
      "archive_in",
      "close_in",
      "timezone",
      "guest_view_all_features",
    ];
    for (const key of direct) {
      if (key in patch) payload[key] = patch[key];
    }
    // The columns carry an _id suffix the type does not.
    if (patch.project_lead !== undefined) payload.project_lead_id = patch.project_lead ?? null;
    if (patch.default_assignee !== undefined) payload.default_assignee_id = patch.default_assignee ?? null;
    if (patch.default_state !== undefined) payload.default_state_id = patch.default_state ?? null;

    const { data, error } = await supabase
      .from("projects")
      .update(payload)
      .eq("id", projectId)
      .select(PROJECT_FIELDS)
      .single();

    if (error) throw new Error(`Failed to save the project: ${error.message}`);

    return this.toProject(data as unknown as Record<string, unknown>);
  }

  /** Soft delete, consistent with the rest of the schema. */
  async deleteProject(workspaceSlug: string, projectId: string): Promise<void> {
    const supabase = getSupabase();

    const { error } = await supabase
      .from("projects")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", projectId);

    if (error) throw new Error(`Failed to delete the project: ${error.message}`);
  }

  /**
   * The counts on the project cards. Counted per table rather than through a
   * view, because there is no aggregate view for these and the numbers are
   * small enough that five counting queries per workspace is cheaper than
   * maintaining one.
   */
  async getProjectAnalyticsCount(workspaceSlug: string): Promise<Record<string, unknown>[]> {
    const supabase = getSupabase();

    const { data: workspace } = await supabase.from("workspaces").select("id").eq("slug", workspaceSlug).single();
    const workspaceId = (workspace as { id?: string } | null)?.id;
    if (!workspaceId) throw new Error("That workspace does not exist.");

    const [projects, issues, cycles, modules, members, states] = await Promise.all([
      supabase.from("projects").select("id").eq("workspace_id", workspaceId).is("deleted_at", null),
      supabase
        .from("issues")
        .select("project_id, state_id")
        .eq("workspace_id", workspaceId)
        .is("deleted_at", null)
        .is("archived_at", null),
      supabase.from("cycles").select("project_id").eq("workspace_id", workspaceId).is("deleted_at", null),
      supabase.from("modules").select("project_id").eq("workspace_id", workspaceId).is("deleted_at", null),
      supabase.from("project_members").select("project_id").eq("workspace_id", workspaceId).eq("is_active", true),
      supabase.from("states").select("id, group").eq("workspace_id", workspaceId),
    ]);

    const completedStates = new Set(
      ((states.data ?? []) as { id: string; group: string }[])
        .filter((state) => state.group === "completed")
        .map((state) => state.id)
    );

    const issueCounts = tally(issues.data);
    const cycleCounts = tally(cycles.data);
    const moduleCounts = tally(modules.data);
    const memberCounts = tally(members.data);

    const completedCounts = new Map<string, number>();
    for (const row of (issues.data ?? []) as { project_id: string; state_id: string | null }[]) {
      if (row.state_id && completedStates.has(row.state_id)) {
        completedCounts.set(row.project_id, (completedCounts.get(row.project_id) ?? 0) + 1);
      }
    }

    return ((projects.data ?? []) as { id: string }[]).map((project) => ({
      id: project.id,
      total_issues: issueCounts.get(project.id) ?? 0,
      completed_issues: completedCounts.get(project.id) ?? 0,
      total_cycles: cycleCounts.get(project.id) ?? 0,
      total_modules: moduleCounts.get(project.id) ?? 0,
      total_members: memberCounts.get(project.id) ?? 0,
    }));
  }

  /** Archiving a project hides it from the sidebar without deleting anything. */
  async setProjectArchived(projectId: string, archived: boolean): Promise<{ archived_at: string }> {
    const archivedAt = archived ? new Date().toISOString() : null;

    const { error } = await getSupabase().from("projects").update({ archived_at: archivedAt }).eq("id", projectId);

    if (error) throw new Error(`Failed to ${archived ? "archive" : "restore"} that project: ${error.message}`);

    return { archived_at: archivedAt as string };
  }

  // -- Per-user project preferences -----------------------------------------
  // The REST endpoint this replaces returned one object stitched from two
  // tables, and the callers still send it back that way: the filters and
  // display settings belong to project_user_properties (RLS in 0012), while
  // sort_order and the navigation preferences belong to the member row.

  private static readonly USER_PROPERTY_COLUMNS = ["rich_filters", "display_filters", "display_properties"] as const;

  private static readonly MEMBER_COLUMNS = ["sort_order", "preferences"] as const;

  private static readonly EMPTY_USER_PROPERTIES: IProjectUserPropertiesResponse = {
    rich_filters: {},
    display_filters: {},
    display_properties: {},
    sort_order: 0,
    preferences: {
      pages: { block_display: false },
      navigation: {},
    },
  } as IProjectUserPropertiesResponse;

  async getProjectUserProperties(workspaceSlug: string, projectId: string): Promise<IProjectUserPropertiesResponse> {
    const supabase = getSupabase();
    const userId = await this.currentUserId();

    // Selected whole rather than by column list: both tables came across from
    // Django, and naming a column that is not there fails the whole request
    // instead of falling back to a default.
    const [properties, member] = await Promise.all([
      supabase
        .from("project_user_properties")
        .select("*")
        .eq("project_id", projectId)
        .eq("user_id", userId)
        .maybeSingle(),
      supabase.from("project_members").select("*").eq("project_id", projectId).eq("member_id", userId).maybeSingle(),
    ]);

    if (properties.error) throw new Error(`Failed to load your project preferences: ${properties.error.message}`);

    const propertyRow = (properties.data ?? {}) as Partial<IProjectUserPropertiesResponse>;
    const memberRow = (member.data ?? {}) as Partial<IProjectUserPropertiesResponse>;
    const defaults = SupabaseProjectService.EMPTY_USER_PROPERTIES;

    return {
      ...defaults,
      rich_filters: propertyRow.rich_filters ?? defaults.rich_filters,
      display_filters: propertyRow.display_filters ?? defaults.display_filters,
      display_properties: propertyRow.display_properties ?? defaults.display_properties,
      sort_order: memberRow.sort_order ?? defaults.sort_order,
      preferences: memberRow.preferences ?? defaults.preferences,
    };
  }

  async updateProjectUserProperties(
    workspaceSlug: string,
    projectId: string,
    patch: Partial<IProjectUserPropertiesResponse>
  ): Promise<IProjectUserPropertiesResponse> {
    const supabase = getSupabase();
    const userId = await this.currentUserId();
    const now = new Date().toISOString();

    const pick = (keys: readonly string[]): Record<string, unknown> =>
      Object.fromEntries(
        Object.entries(patch).filter(([key, value]) => keys.includes(key) && value !== undefined)
      ) as Record<string, unknown>;

    const propertyPatch = pick(SupabaseProjectService.USER_PROPERTY_COLUMNS);
    const memberPatch = pick(SupabaseProjectService.MEMBER_COLUMNS);

    if (Object.keys(propertyPatch).length > 0) {
      const { data: project } = await supabase.from("projects").select("workspace_id").eq("id", projectId).single();
      const workspaceId = (project as { workspace_id?: string } | null)?.workspace_id;

      if (!workspaceId) throw new Error("That project does not exist.");

      const { error } = await supabase.from("project_user_properties").upsert(
        {
          project_id: projectId,
          workspace_id: workspaceId,
          user_id: userId,
          ...propertyPatch,
          updated_at: now,
          created_by_id: userId,
          updated_by_id: userId,
        },
        { onConflict: "project_id,user_id" }
      );

      if (error) throw new Error(`Failed to save your project preferences: ${error.message}`);
    }

    if (Object.keys(memberPatch).length > 0) {
      const { error } = await supabase
        .from("project_members")
        .update({ ...memberPatch, updated_at: now, updated_by_id: userId })
        .eq("project_id", projectId)
        .eq("member_id", userId);

      if (error) throw new Error(`Failed to save your project preferences: ${error.message}`);
    }

    return this.getProjectUserProperties(workspaceSlug, projectId);
  }

  // -- Per-entity filters ----------------------------------------------------
  // Cycles, modules and epics each keep their own filter set per user, in
  // tables that mirror project_user_properties. If one of those tables is not
  // present the screen should still open with default filters rather than
  // fail to load, so reads fall back and only writes surface the error.

  async getEntityUserProperties(
    table: "cycle_user_properties" | "module_user_properties" | "project_epic_user_properties",
    column: "cycle_id" | "module_id" | "project_id",
    entityId: string
  ): Promise<IIssueFiltersResponse> {
    const defaults: IIssueFiltersResponse = {
      rich_filters: {},
      display_filters: {},
      display_properties: {},
    } as IIssueFiltersResponse;

    try {
      const userId = await this.currentUserId();

      const { data, error } = await getSupabase()
        .from(table)
        .select("*")
        .eq(column, entityId)
        .eq("user_id", userId)
        .maybeSingle();

      if (error || !data) return defaults;

      const row = data as Partial<IIssueFiltersResponse>;

      return {
        rich_filters: row.rich_filters ?? defaults.rich_filters,
        display_filters: row.display_filters ?? defaults.display_filters,
        display_properties: row.display_properties ?? defaults.display_properties,
      };
    } catch {
      return defaults;
    }
  }

  async updateEntityUserProperties(
    table: "cycle_user_properties" | "module_user_properties" | "project_epic_user_properties",
    column: "cycle_id" | "module_id" | "project_id",
    entityId: string,
    projectId: string,
    patch: Partial<IIssueFiltersResponse>
  ): Promise<IIssueFiltersResponse> {
    const supabase = getSupabase();
    const userId = await this.currentUserId();

    const { data: project } = await supabase.from("projects").select("workspace_id").eq("id", projectId).single();
    const workspaceId = (project as { workspace_id?: string } | null)?.workspace_id;

    if (!workspaceId) throw new Error("That project does not exist.");

    const { error } = await supabase.from(table).upsert(
      {
        [column]: entityId,
        project_id: projectId,
        workspace_id: workspaceId,
        user_id: userId,
        ...patch,
        updated_at: new Date().toISOString(),
        created_by_id: userId,
        updated_by_id: userId,
      },
      { onConflict: `${column},user_id` }
    );

    if (error) throw new Error(`Failed to save those filters: ${error.message}`);

    return this.getEntityUserProperties(table, column, entityId);
  }

  // -- States ---------------------------------------------------------------
  // A project's workflow columns. create_project seeds six of them, so a
  // project always has states; the screens below edit that set.

  async getProjectStates(workspaceSlug: string, projectId: string): Promise<IState[]> {
    const { data, error } = await getSupabase()
      .from("states")
      .select("*")
      .eq("project_id", projectId)
      .is("deleted_at", null)
      .order("sequence", { ascending: true });

    if (error) throw new Error(`Failed to load states: ${error.message}`);

    return (data ?? []) as unknown as IState[];
  }

  async getProjectState(projectId: string, stateId: string): Promise<IState> {
    const { data, error } = await getSupabase()
      .from("states")
      .select("*")
      .eq("project_id", projectId)
      .eq("id", stateId)
      .single();

    if (error || !data) throw new Error(`Failed to load that state: ${error?.message ?? stateId}`);

    return data as unknown as IState;
  }

  /** The state new intake work items land in. */
  async getIntakeState(projectId: string): Promise<IIntakeState> {
    const { data, error } = await getSupabase()
      .from("states")
      .select("*")
      .eq("project_id", projectId)
      .eq("is_triage", true)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) throw new Error(`Failed to load the intake state: ${error.message}`);
    if (!data) throw new Error("This project has no intake state.");

    return data as unknown as IIntakeState;
  }

  async createState(workspaceSlug: string, projectId: string, payload: Partial<IState>): Promise<IState> {
    const supabase = getSupabase();
    const userId = await this.currentUserId();

    const { data: project } = await supabase.from("projects").select("workspace_id").eq("id", projectId).single();
    const workspaceId = (project as { workspace_id?: string } | null)?.workspace_id;

    if (!workspaceId) throw new Error("That project does not exist.");

    // Sequence orders the columns; Django allocated it server-side, so the
    // next one has to be worked out here instead.
    const { data: last } = await supabase
      .from("states")
      .select("sequence")
      .eq("project_id", projectId)
      .order("sequence", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextSequence = ((last as { sequence?: number } | null)?.sequence ?? 0) + 15000;

    const { data, error } = await supabase
      .from("states")
      .insert([
        {
          ...payload,
          project_id: projectId,
          workspace_id: workspaceId,
          sequence: payload.sequence ?? nextSequence,
          created_by_id: userId,
          updated_by_id: userId,
        },
      ])
      .select()
      .single();

    if (error || !data) throw new Error(`Failed to create that state: ${error?.message ?? "unknown error"}`);

    return data as unknown as IState;
  }

  async updateState(projectId: string, stateId: string, patch: Partial<IState>): Promise<IState> {
    const supabase = getSupabase();
    const userId = await this.currentUserId();

    const { data, error } = await supabase
      .from("states")
      .update({ ...patch, updated_at: new Date().toISOString(), updated_by_id: userId })
      .eq("project_id", projectId)
      .eq("id", stateId)
      .select()
      .single();

    if (error || !data) throw new Error(`Failed to update that state: ${error?.message ?? "unknown error"}`);

    return data as unknown as IState;
  }

  /**
   * Exactly one state per project is the default, so the previous holder has
   * to be cleared first.
   */
  async markStateDefault(projectId: string, stateId: string): Promise<void> {
    const supabase = getSupabase();

    const { error: clearError } = await supabase
      .from("states")
      .update({ default: false })
      .eq("project_id", projectId)
      .eq("default", true);

    if (clearError) throw new Error(`Failed to update the default state: ${clearError.message}`);

    const { error } = await supabase
      .from("states")
      .update({ default: true })
      .eq("project_id", projectId)
      .eq("id", stateId);

    if (error) throw new Error(`Failed to update the default state: ${error.message}`);
  }

  async deleteState(projectId: string, stateId: string): Promise<void> {
    const { error } = await getSupabase()
      .from("states")
      .update({ deleted_at: new Date().toISOString() })
      .eq("project_id", projectId)
      .eq("id", stateId);

    if (error) throw new Error(`Failed to delete that state: ${error.message}`);
  }

  // -- Labels ---------------------------------------------------------------
  // Labels belong to a project and are applied to work items, so they live
  // here rather than with the work item that references them.

  async getProjectLabels(workspaceSlug: string, projectId: string): Promise<IIssueLabel[]> {
    const { data, error } = await getSupabase()
      .from("labels")
      .select("*")
      .eq("project_id", projectId)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });

    if (error) throw new Error(`Failed to load labels: ${error.message}`);
    return (data ?? []) as unknown as IIssueLabel[];
  }

  async createLabel(workspaceSlug: string, projectId: string, data: Partial<IIssueLabel>): Promise<IIssueLabel> {
    const supabase = getSupabase();
    const userId = await this.currentUserId();

    const { data: project } = await supabase.from("projects").select("workspace_id").eq("id", projectId).single();
    const now = new Date().toISOString();

    const { data: created, error } = await supabase
      .from("labels")
      .insert({
        created_at: now,
        updated_at: now,
        name: data.name ?? "",
        description: "",
        color: data.color ?? "#60646C",
        sort_order: 65535,
        project_id: projectId,
        workspace_id: (project as { workspace_id?: string } | null)?.workspace_id,
        parent_id: data.parent ?? null,
        created_by_id: userId,
        updated_by_id: userId,
      })
      .select("*")
      .single();

    if (error) throw new Error(`Failed to create that label: ${error.message}`);
    return created as unknown as IIssueLabel;
  }

  async patchLabel(
    workspaceSlug: string,
    projectId: string,
    labelId: string,
    patch: Partial<IIssueLabel>
  ): Promise<IIssueLabel> {
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    // `description` is a column on `labels` but not a field the application
    // carries on a label, so there is nothing to send for it.
    for (const key of ["name", "color", "sort_order"] as const) {
      if (key in patch) payload[key] = patch[key as keyof IIssueLabel];
    }

    const { data, error } = await getSupabase().from("labels").update(payload).eq("id", labelId).select("*").single();

    if (error) throw new Error(`Failed to save that label: ${error.message}`);
    return data as unknown as IIssueLabel;
  }

  async deleteLabel(workspaceSlug: string, projectId: string, labelId: string): Promise<void> {
    const { error } = await getSupabase()
      .from("labels")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", labelId);

    if (error) throw new Error(`Failed to delete that label: ${error.message}`);
  }

  private async selectProjects(workspaceSlug: string): Promise<Record<string, unknown>[]> {
    const supabase = getSupabase();
    const userId = await this.currentUserId();

    const { data, error } = await supabase
      .from("projects")
      .select(`${PROJECT_FIELDS}, workspace:workspaces!inner(slug), my_membership:project_members(role, member_id)`)
      .eq("workspace.slug", workspaceSlug)
      .eq("my_membership.member_id", userId)
      .is("deleted_at", null)
      .order("name", { ascending: true });

    if (error) throw new Error(`Failed to load projects: ${error.message}`);

    return (data ?? []) as unknown as Record<string, unknown>[];
  }

  /**
   * `member_role` is null when the user can see the project but has not joined
   * it — a public project they are not a member of. The application relies on
   * that distinction to offer "join" rather than "open".
   */
  private toProject(row: Record<string, unknown>): TProject {
    const membership = row.my_membership as { role?: number }[] | undefined;
    const memberRole = row.member_role ?? membership?.[0]?.role ?? null;

    return {
      id: String(row.id),
      name: (row.name as string) ?? "",
      identifier: (row.identifier as string) ?? "",
      description: (row.description as string) ?? "",
      network: (row.network as number) ?? 2,
      logo_props: (row.logo_props ?? {}) as TProject["logo_props"],
      workspace: String(row.workspace_id ?? ""),
      archived_at: (row.archived_at as string) ?? null,
      sort_order: null,
      member_role: memberRole as TProject["member_role"],
      cycle_view: Boolean(row.cycle_view),
      module_view: Boolean(row.module_view),
      issue_views_view: Boolean(row.issue_views_view),
      page_view: Boolean(row.page_view),
      inbox_view: Boolean(row.intake_view),
      guest_view_all_features: Boolean(row.guest_view_all_features),
      project_lead: (row.project_lead_id as string) ?? null,
      default_assignee: (row.default_assignee_id as string) ?? null,
      default_state: (row.default_state_id as string) ?? null,
      estimate: (row.estimate_id as string) ?? null,
      archive_in: (row.archive_in as number) ?? 0,
      close_in: (row.close_in as number) ?? 0,
      timezone: (row.timezone as string) ?? "UTC",
      cover_image: (row.cover_image as string) ?? undefined,
      created_at: row.created_at as Date,
      updated_at: row.updated_at as Date,
      created_by: (row.created_by_id as string) ?? "",
      updated_by: (row.updated_by_id as string) ?? "",
    };
  }
}

export const supabaseProjectService = new SupabaseProjectService();

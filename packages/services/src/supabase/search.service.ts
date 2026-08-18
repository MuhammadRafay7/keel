/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type {
  ISearchIssueResponse,
  IWorkspaceSearchResults,
  TProjectIssuesSearchParams,
  TSearchEntityRequestPayload,
  TSearchResponse,
} from "@keel/types";

import { getSupabase } from "./client";

/** An embedded one-to-one comes back as an object or a single-element array. */
const firstOf = <T>(value: T | T[] | undefined): T | undefined => (Array.isArray(value) ? value[0] : value);

/** The identifier of a row's embedded project, however PostgREST shaped it. */
const identifierOf = (row: { project?: { identifier?: string } | { identifier?: string }[] }): string =>
  firstOf(row.project)?.identifier ?? "";

/** Escapes the wildcards PostgREST's `ilike` treats specially. */
const toPattern = (query: string): string => `%${query.replace(/[%_]/g, (c) => `\\${c}`)}%`;

/**
 * Search across a workspace.
 *
 * Django ran this as one endpoint over several models; here each entity is its
 * own query, run in parallel. Every table carries workspace_id, and RLS drops
 * anything in a project the searcher cannot see, so no permission filtering is
 * repeated here.
 */
export class SupabaseSearchService {
  private async workspaceIdFromSlug(workspaceSlug: string): Promise<string> {
    const { data, error } = await getSupabase().from("workspaces").select("id").eq("slug", workspaceSlug).single();

    if (error || !data) throw new Error(`Failed to find the workspace: ${error?.message ?? workspaceSlug}`);

    return (data as { id: string }).id;
  }

  /** The global search palette. */
  async searchWorkspace(
    workspaceSlug: string,
    params: { project_id?: string; search: string; workspace_search: boolean }
  ): Promise<IWorkspaceSearchResults> {
    const supabase = getSupabase();
    const empty: IWorkspaceSearchResults = {
      results: { workspace: [], project: [], issue: [], cycle: [], module: [], issue_view: [], page: [] },
    };

    if (!params.search.trim()) return empty;

    const workspaceId = await this.workspaceIdFromSlug(workspaceSlug);
    const pattern = toPattern(params.search);

    // A project-scoped search stays inside that project; a workspace search
    // spans all of them.
    const scoped = <T extends { eq: (column: string, value: string) => T }>(query: T): T =>
      !params.workspace_search && params.project_id ? query.eq("project_id", params.project_id) : query;

    const [projects, issues, cycles, modules, views, pages] = await Promise.all([
      supabase
        .from("projects")
        .select("id, name, identifier")
        .eq("workspace_id", workspaceId)
        .is("deleted_at", null)
        .ilike("name", pattern)
        .limit(10),
      scoped(
        supabase
          .from("issues")
          .select("id, name, sequence_id, project_id, type_id, project:projects(identifier)")
          .eq("workspace_id", workspaceId)
          .is("deleted_at", null)
          .ilike("name", pattern)
          .limit(10)
      ),
      scoped(
        supabase
          .from("cycles")
          .select("id, name, project_id, project:projects(identifier)")
          .eq("workspace_id", workspaceId)
          .is("deleted_at", null)
          .ilike("name", pattern)
          .limit(10)
      ),
      scoped(
        supabase
          .from("modules")
          .select("id, name, project_id, project:projects(identifier)")
          .eq("workspace_id", workspaceId)
          .is("deleted_at", null)
          .ilike("name", pattern)
          .limit(10)
      ),
      scoped(
        supabase
          .from("views")
          .select("id, name, project_id, project:projects(identifier)")
          .eq("workspace_id", workspaceId)
          .is("deleted_at", null)
          .ilike("name", pattern)
          .limit(10)
      ),
      supabase
        .from("pages")
        .select("id, name")
        .eq("workspace_id", workspaceId)
        .is("deleted_at", null)
        .ilike("name", pattern)
        .limit(10),
    ]);

    type NamedRow = {
      id: string;
      name: string;
      project_id?: string;
      sequence_id?: number;
      type_id?: string;
      project?: { identifier?: string } | { identifier?: string }[];
    };

    const rows = (result: { data: unknown }): NamedRow[] => (result?.data ?? []) as NamedRow[];

    return {
      results: {
        workspace: [],
        project: rows(projects).map((row) => ({
          id: row.id,
          name: row.name,
          identifier: (row as unknown as { identifier: string }).identifier,
          workspace__slug: workspaceSlug,
        })),
        issue: rows(issues).map((row) => ({
          id: row.id,
          name: row.name,
          project_id: row.project_id ?? "",
          project__identifier: identifierOf(row),
          sequence_id: row.sequence_id ?? 0,
          type_id: row.type_id ?? "",
          workspace__slug: workspaceSlug,
        })),
        cycle: rows(cycles).map((row) => ({
          id: row.id,
          name: row.name,
          project_id: row.project_id ?? "",
          project__identifier: identifierOf(row),
          workspace__slug: workspaceSlug,
        })),
        module: rows(modules).map((row) => ({
          id: row.id,
          name: row.name,
          project_id: row.project_id ?? "",
          project__identifier: identifierOf(row),
          workspace__slug: workspaceSlug,
        })),
        issue_view: rows(views).map((row) => ({
          id: row.id,
          name: row.name,
          project_id: row.project_id ?? "",
          project__identifier: identifierOf(row),
          workspace__slug: workspaceSlug,
        })),
        page: rows(pages).map((row) => ({
          id: row.id,
          name: row.name,
          project_ids: [],
          project__identifiers: [],
          workspace__slug: workspaceSlug,
        })),
      },
    } as IWorkspaceSearchResults;
  }

  /** The typeahead behind @-mentions and entity pickers in the editor. */
  async searchEntity(workspaceSlug: string, params: TSearchEntityRequestPayload): Promise<TSearchResponse> {
    const supabase = getSupabase();
    const workspaceId = await this.workspaceIdFromSlug(workspaceSlug);
    const pattern = toPattern(params.query ?? "");
    const limit = params.count || 10;
    const wanted = new Set(params.query_type);
    const response: TSearchResponse = {};

    const scopeToProject = <T extends { eq: (column: string, value: string) => T }>(query: T): T =>
      params.project_id ? query.eq("project_id", params.project_id) : query;

    if (wanted.has("user_mention")) {
      const { data } = await supabase
        .from("workspace_members")
        .select("member_id, member:users(id, display_name, avatar_url)")
        .eq("workspace_id", workspaceId)
        .eq("is_active", true)
        .limit(limit);

      response.user_mention = (
        (data ?? []) as unknown as {
          member: { id: string; display_name: string; avatar_url: string };
        }[]
      )
        .filter(
          (row) =>
            row.member && (!params.query || row.member.display_name?.toLowerCase().includes(params.query.toLowerCase()))
        )
        .map((row) => ({
          member__id: row.member.id,
          member__display_name: row.member.display_name,
          member__avatar_url: row.member.avatar_url,
        }));
    }

    if (wanted.has("project")) {
      const { data } = await supabase
        .from("projects")
        .select("id, name, identifier, logo_props")
        .eq("workspace_id", workspaceId)
        .is("deleted_at", null)
        .ilike("name", pattern)
        .limit(limit);

      response.project = ((data ?? []) as unknown as Record<string, unknown>[]).map((row) => {
        row.workspace__slug = workspaceSlug;
        return row;
      }) as unknown as TSearchResponse["project"];
    }

    if (wanted.has("issue")) {
      const { data } = await scopeToProject(
        supabase
          .from("issues")
          .select("id, name, sequence_id, project_id, priority, state_id, type_id, project:projects(identifier)")
          .eq("workspace_id", workspaceId)
          .is("deleted_at", null)
          .ilike("name", pattern)
          .limit(limit)
      );

      response.issue = ((data ?? []) as unknown as Record<string, unknown>[]).map((row) => {
        row.project__identifier = identifierOf(row);
        return row;
      }) as unknown as TSearchResponse["issue"];
    }

    const planningSearch = (table: "cycles" | "modules") =>
      scopeToProject(
        supabase
          .from(table)
          .select("id, name, project_id, status, project:projects(identifier)")
          .eq("workspace_id", workspaceId)
          .is("deleted_at", null)
          .ilike("name", pattern)
          .limit(limit)
      );

    const [cycleResult, moduleResult] = await Promise.all([
      wanted.has("cycle") ? planningSearch("cycles") : null,
      wanted.has("module") ? planningSearch("modules") : null,
    ]);

    const withProject = (result: { data: unknown } | null): Record<string, unknown>[] =>
      ((result?.data ?? []) as unknown as Record<string, unknown>[]).map((row) => {
        row.project__identifier = identifierOf(row);
        row.workspace__slug = workspaceSlug;
        return row;
      });

    if (cycleResult) response.cycle = withProject(cycleResult) as unknown as TSearchResponse["cycle"];
    if (moduleResult) response.module = withProject(moduleResult) as unknown as TSearchResponse["module"];

    if (wanted.has("page")) {
      const { data } = await supabase
        .from("pages")
        .select("id, name, logo_props")
        .eq("workspace_id", workspaceId)
        .is("deleted_at", null)
        .ilike("name", pattern)
        .limit(limit);

      response.page = ((data ?? []) as unknown as Record<string, unknown>[]).map((row) => {
        row.projects__id = [];
        row.workspace__slug = workspaceSlug;
        return row;
      }) as unknown as TSearchResponse["page"];
    }

    return response;
  }

  /** The work item picker used by parent, relation and cycle/module dialogs. */
  async projectIssuesSearch(
    workspaceSlug: string,
    projectId: string,
    params: TProjectIssuesSearchParams
  ): Promise<ISearchIssueResponse[]> {
    const supabase = getSupabase();
    const pattern = toPattern(params.search ?? "");

    let query = supabase
      .from("issues")
      .select(
        "id, name, sequence_id, project_id, start_date, type_id, " +
          "project:projects(identifier, name), state:states(name, color, group)"
      )
      .eq("project_id", projectId)
      .eq("is_draft", false)
      .is("deleted_at", null)
      .limit(100);

    if (params.search) query = query.ilike("name", pattern);
    if (params.issue_id) query = query.neq("id", params.issue_id);

    const { data, error } = await query;

    if (error) throw new Error(`Failed to search work items: ${error.message}`);

    return ((data ?? []) as unknown as Record<string, unknown>[]).map((row) => {
      const project = firstOf(row.project as { identifier?: string; name?: string });
      const state = firstOf(row.state as { name?: string; color?: string; group?: string });

      return {
        id: row.id as string,
        name: row.name as string,
        project_id: row.project_id as string,
        project__identifier: project?.identifier ?? "",
        project__name: project?.name ?? "",
        sequence_id: (row.sequence_id as number) ?? 0,
        start_date: (row.start_date as string) ?? null,
        state__color: state?.color ?? "",
        state__group: state?.group ?? "backlog",
        state__name: state?.name ?? "",
        workspace__slug: workspaceSlug,
        type_id: (row.type_id as string) ?? "",
      } as ISearchIssueResponse;
    });
  }
}

export const supabaseSearchService = new SupabaseSearchService();

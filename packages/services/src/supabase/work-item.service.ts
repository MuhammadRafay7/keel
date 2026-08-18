/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type {
  IIssueDisplayProperties,
  TBulkOperationsPayload,
  TIssue,
  TIssueActivity,
  TIssueLink,
  TIssuesResponse,
  TIssueSubIssues,
  TSubIssuesStateDistribution,
} from "@keel/types";

import { getSupabase } from "./client";
import { supabaseWorkItemDetailService } from "./work-item-detail.service";

const ISSUE_FIELDS =
  "id, name, description_html, priority, state_id, parent_id, project_id, sequence_id, sort_order, " +
  "start_date, target_date, completed_at, archived_at, is_draft, estimate_point_id, type_id, " +
  "created_at, updated_at, created_by_id, updated_by_id";

const ISSUE_SELECT = `${ISSUE_FIELDS}, issue_assignees(assignee_id), issue_labels(label_id)`;

/**
 * A rich filter expression, as the header and filter row serialise it:
 * `{ and: [{ "assignee_id__in": "id-1,id-2" }] }`, or a bare condition object
 * when only one filter is applied. Multi-value operators carry their values
 * comma-joined in a single string.
 */
type TFilterCondition = Record<string, string | number | boolean>;

/** Flattens an expression down to the conditions it contains. */
const flattenFilterConditions = (expression: unknown): TFilterCondition[] => {
  let parsed: unknown = expression;
  if (typeof expression === "string") {
    try {
      parsed = JSON.parse(expression);
    } catch {
      return [];
    }
  }

  if (!parsed || typeof parsed !== "object") return [];

  const group = (parsed as { and?: unknown }).and;
  if (Array.isArray(group)) return group.flatMap((entry) => flattenFilterConditions(entry));

  return Object.keys(parsed as object).length > 0 ? [parsed as TFilterCondition] : [];
};

const splitFilterValue = (value: string | number | boolean): string[] =>
  String(value)
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v.length > 0);

/** Groups conditions by property, so `assignee_id__in` is reachable by name. */
const collectFilterValues = (expression: unknown): Record<string, string[]> => {
  const collected: Record<string, string[]> = {};

  for (const condition of flattenFilterConditions(expression)) {
    for (const [key, value] of Object.entries(condition)) {
      const separator = key.lastIndexOf("__");
      if (separator < 0) continue;
      const property = key.slice(0, separator);
      collected[property] = [...(collected[property] ?? []), ...splitFilterValue(value)];
    }
  }

  return collected;
};

/** A uuid nothing will match, so an empty result set stays empty. */
const NO_MATCH_UUID = "00000000-0000-0000-0000-000000000000";

const DEFAULT_DISPLAY_PROPERTIES: IIssueDisplayProperties = {
  assignee: true,
  start_date: true,
  due_date: true,
  labels: true,
  key: true,
  priority: true,
  state: true,
  sub_issue_count: true,
  link: true,
  attachment_count: true,
  estimate: true,
  created_on: true,
  updated_on: true,
};

/**
 * Work items.
 *
 * Assignees and labels are separate tables, so they arrive as embedded rows and
 * are flattened to the id arrays the application expects. Creation goes through
 * create_work_item (0005), which allocates the per-project sequence number under
 * a lock — that number is what makes a work item addressable as KEEL-4, and two
 * items sharing one would be corruption rather than an inconvenience.
 */
export class SupabaseWorkItemService {
  private async context(projectId: string): Promise<{ userId: string; workspaceId: string; now: string }> {
    const supabase = getSupabase();

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    if (!userId) throw new Error("Not signed in.");

    const { data: project, error } = await supabase
      .from("projects")
      .select("workspace_id")
      .eq("id", projectId)
      .single();

    if (error) throw new Error(`Failed to resolve project: ${error.message}`);

    return {
      userId,
      workspaceId: String((project as { workspace_id: string }).workspace_id),
      now: new Date().toISOString(),
    };
  }

  async createIssue(workspaceSlug: string, projectId: string, data: Partial<TIssue>): Promise<TIssue> {
    const supabase = getSupabase();

    const stateId = data.state_id && data.state_id.trim() !== "" ? data.state_id : null;
    const parentId = data.parent_id && data.parent_id.trim() !== "" ? data.parent_id : null;
    const startDate = data.start_date && data.start_date.trim() !== "" ? data.start_date : null;
    const targetDate = data.target_date && data.target_date.trim() !== "" ? data.target_date : null;

    const { data: created, error } = await supabase.rpc("create_work_item", {
      p_project_id: projectId,
      p_name: data.name ?? "",
      p_description_html: data.description_html ?? "<p></p>",
      p_priority: data.priority ?? "none",
      p_state_id: stateId,
      p_parent_id: parentId,
      p_start_date: startDate,
      p_target_date: targetDate,
      p_assignees: data.assignee_ids ?? [],
      p_labels: data.label_ids ?? [],
    });

    if (error) throw new Error(error.message);

    return this.toIssue({
      ...(created as Record<string, unknown>),
      issue_assignees: (data.assignee_ids ?? []).map((id) => ({ assignee_id: id })),
      issue_labels: (data.label_ids ?? []).map((id) => ({ label_id: id })),
    });
  }

  async getIssues(workspaceSlug: string, projectId: string, queries?: any): Promise<TIssuesResponse> {
    return this.getIssuesFromServer(workspaceSlug, projectId, queries);
  }

  async getIssuesFromServer(
    workspaceSlug: string,
    projectId: string,
    queries?: any,
    _config = {}
  ): Promise<TIssuesResponse> {
    const supabase = getSupabase();

    let query = supabase
      .from("issues")
      .select(ISSUE_SELECT)
      .eq("project_id", projectId)
      .eq("is_draft", false)
      .is("deleted_at", null)
      .is("archived_at", null);

    if (queries?.state_id) {
      query = query.eq("state_id", queries.state_id);
    }
    if (queries?.priority) {
      query = query.eq("priority", queries.priority);
    }

    const filterValues = collectFilterValues(queries?.filters);

    if (filterValues.state_id?.length) query = query.in("state_id", filterValues.state_id);
    if (filterValues.priority?.length) query = query.in("priority", filterValues.priority);
    if (filterValues.created_by_id?.length) query = query.in("created_by_id", filterValues.created_by_id);
    if (filterValues.state_group?.length) {
      const stateIds = await this.stateIdsForGroups(projectId, filterValues.state_group);
      query = query.in("state_id", stateIds.length > 0 ? stateIds : [NO_MATCH_UUID]);
    }

    // Dates arrive as `from,to` for a range and a single value for an exact match.
    for (const column of ["start_date", "target_date"] as const) {
      const values = filterValues[column];
      if (!values?.length) continue;

      if (values.length === 1) {
        query = query.eq(column, values[0]);
        continue;
      }

      const [from, to] = values;
      if (from) query = query.gte(column, from);
      if (to) query = query.lte(column, to);
    }

    // Assignees and labels live in join tables. Resolving the matching work
    // item ids first keeps the embedded arrays whole — an inner join would
    // trim them to just the values being filtered on.
    const [assigneeMatches, labelMatches] = await Promise.all([
      filterValues.assignee_id?.length
        ? this.issueIdsByLink(projectId, "issue_assignees", "assignee_id", filterValues.assignee_id)
        : null,
      filterValues.label_id?.length
        ? this.issueIdsByLink(projectId, "issue_labels", "label_id", filterValues.label_id)
        : null,
    ]);

    for (const matches of [assigneeMatches, labelMatches]) {
      if (matches === null) continue;
      query = query.in("id", matches.length > 0 ? matches : [NO_MATCH_UUID]);
    }

    const { data, error } = await query.order("sort_order", { ascending: true });

    if (error) throw new Error(`Failed to load work items: ${error.message}`);

    const issues = (data ?? []).map((row) => this.toIssue(row as unknown as Record<string, unknown>));

    return {
      grouped_by: queries?.group_by ?? "",
      next_cursor: "",
      prev_cursor: "",
      next_page_results: false,
      prev_page_results: false,
      total_count: issues.length,
      count: issues.length,
      total_pages: 1,
      extra_stats: null,
      results: issues,
      total_results: issues.length,
    };
  }

  /** Work item ids that have one of `values` in a join table. */
  private async issueIdsByLink(
    projectId: string,
    table: "issue_assignees" | "issue_labels",
    column: "assignee_id" | "label_id",
    values: string[]
  ): Promise<string[]> {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from(table)
      .select("issue_id")
      .eq("project_id", projectId)
      .in(column, values);

    if (error) throw new Error(`Failed to apply the ${column} filter: ${error.message}`);

    return Array.from(new Set((data ?? []).map((row) => (row as { issue_id: string }).issue_id)));
  }

  /** State ids belonging to any of the given state groups. */
  private async stateIdsForGroups(projectId: string, groups: string[]): Promise<string[]> {
    const supabase = getSupabase();

    const { data, error } = await supabase.from("states").select("id").eq("project_id", projectId).in("group", groups);

    if (error) throw new Error(`Failed to apply the state filter: ${error.message}`);

    return (data ?? []).map((row) => (row as { id: string }).id);
  }

  async getIssuesForSync(
    workspaceSlug: string,
    projectId: string,
    queries?: any,
    config = {}
  ): Promise<TIssuesResponse> {
    return this.getIssuesFromServer(workspaceSlug, projectId, queries, config);
  }

  async getDeletedIssues(workspaceSlug: string, projectId: string, queries?: any): Promise<TIssuesResponse> {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("issues")
      .select(ISSUE_SELECT)
      .eq("project_id", projectId)
      .not("deleted_at", "is", null)
      .order("updated_at", { ascending: false });

    if (error) throw new Error(`Failed to load deleted work items: ${error.message}`);

    const issues = (data ?? []).map((row) => this.toIssue(row as unknown as Record<string, unknown>));

    return {
      grouped_by: queries?.group_by ?? "",
      next_cursor: "",
      prev_cursor: "",
      next_page_results: false,
      prev_page_results: false,
      total_count: issues.length,
      count: issues.length,
      total_pages: 1,
      extra_stats: null,
      results: issues,
      total_results: issues.length,
    };
  }

  async getIssuesWithParams(
    workspaceSlug: string,
    projectId: string,
    _queries?: any
  ): Promise<TIssue[] | { [key: string]: TIssue[] }> {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("issues")
      .select(ISSUE_SELECT)
      .eq("project_id", projectId)
      .eq("is_draft", false)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });

    if (error) throw new Error(`Failed to load work items: ${error.message}`);

    return (data ?? []).map((row) => this.toIssue(row as unknown as Record<string, unknown>));
  }

  async retrieve(workspaceSlug: string, projectId: string, issueId: string): Promise<TIssue> {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("issues")
      .select(ISSUE_SELECT)
      .eq("project_id", projectId)
      .eq("id", issueId)
      .is("deleted_at", null)
      .single();

    if (error) throw new Error(`Failed to load that work item: ${error.message}`);

    return this.toIssue(data as unknown as Record<string, unknown>);
  }

  async retrieveIssues(workspaceSlug: string, projectId: string, issueIds: string[]): Promise<TIssue[]> {
    if (issueIds.length === 0) return [];
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("issues")
      .select(ISSUE_SELECT)
      .eq("project_id", projectId)
      .in("id", issueIds)
      .is("deleted_at", null);

    if (error) throw new Error(`Failed to load work items: ${error.message}`);

    return (data ?? []).map((row) => this.toIssue(row as unknown as Record<string, unknown>));
  }

  async getIssueActivities(workspaceSlug: string, projectId: string, issueId: string): Promise<TIssueActivity[]> {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("issue_activities")
      .select("*")
      .eq("issue_id", issueId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to load work item activity: ${error.message}`);

    return (data ?? []) as unknown as TIssueActivity[];
  }

  async addIssueToCycle(
    workspaceSlug: string,
    projectId: string,
    cycleId: string,
    data: { issues: string[] }
  ): Promise<any> {
    if (data.issues.length === 0) return { message: "No issues provided" };
    const { userId, workspaceId, now } = await this.context(projectId);
    const supabase = getSupabase();

    const rows = data.issues.map((issueId) => ({
      created_at: now,
      updated_at: now,
      issue_id: issueId,
      cycle_id: cycleId,
      project_id: projectId,
      workspace_id: workspaceId,
      created_by_id: userId,
      updated_by_id: userId,
    }));

    const { error } = await supabase.from("cycle_issues").upsert(rows, { onConflict: "cycle_id,issue_id" });
    if (error) throw new Error(`Failed to add issue to cycle: ${error.message}`);

    return { message: "Issues added to cycle successfully" };
  }

  async removeIssueFromCycle(
    workspaceSlug: string,
    projectId: string,
    cycleId: string,
    bridgeId: string
  ): Promise<any> {
    const supabase = getSupabase();

    const { error } = await supabase
      .from("cycle_issues")
      .delete()
      .eq("cycle_id", cycleId)
      .or(`id.eq.${bridgeId},issue_id.eq.${bridgeId}`);

    if (error) throw new Error(`Failed to remove issue from cycle: ${error.message}`);

    return { message: "Issue removed from cycle successfully" };
  }

  async createIssueRelation(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    data: {
      related_list: Array<{
        relation_type: "duplicate" | "relates_to" | "blocked_by";
        related_issue: string;
      }>;
      relation?: "blocking" | null;
    }
  ): Promise<any> {
    const { userId, workspaceId, now } = await this.context(projectId);
    const supabase = getSupabase();

    const isBlocking = data.relation === "blocking";
    const rows = data.related_list.map((item) => ({
      created_at: now,
      updated_at: now,
      relation_type: isBlocking ? "blocked_by" : item.relation_type,
      issue_id: isBlocking ? item.related_issue : issueId,
      related_issue_id: isBlocking ? issueId : item.related_issue,
      project_id: projectId,
      workspace_id: workspaceId,
      created_by_id: userId,
      updated_by_id: userId,
    }));

    const { error } = await supabase.from("issue_relations").insert(rows);
    if (error) throw new Error(`Failed to create work item relations: ${error.message}`);

    return { message: "Relation created successfully" };
  }

  async deleteIssueRelation(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    relationId: string
  ): Promise<any> {
    const supabase = getSupabase();

    const { error } = await supabase
      .from("issue_relations")
      .delete()
      .or(
        `id.eq.${relationId},and(issue_id.eq.${issueId},related_issue_id.eq.${relationId}),and(issue_id.eq.${relationId},related_issue_id.eq.${issueId})`
      );

    if (error) throw new Error(`Failed to delete work item relation: ${error.message}`);

    return { message: "Relation deleted successfully" };
  }

  async getIssueDisplayProperties(workspaceSlug: string, projectId: string): Promise<any> {
    const supabase = getSupabase();
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    if (!userId) return DEFAULT_DISPLAY_PROPERTIES;

    const { data, error } = await supabase
      .from("project_user_properties")
      .select("display_properties")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw new Error(`Failed to get display properties: ${error.message}`);

    return data?.display_properties ?? DEFAULT_DISPLAY_PROPERTIES;
  }

  async updateIssueDisplayProperties(
    workspaceSlug: string,
    projectId: string,
    data: IIssueDisplayProperties
  ): Promise<any> {
    const { userId, workspaceId, now } = await this.context(projectId);
    const supabase = getSupabase();

    const { error } = await supabase.from("project_user_properties").upsert(
      {
        project_id: projectId,
        workspace_id: workspaceId,
        user_id: userId,
        display_properties: data as unknown as Record<string, unknown>,
        updated_at: now,
        created_by_id: userId,
        updated_by_id: userId,
      },
      { onConflict: "project_id,user_id" }
    );

    if (error) throw new Error(`Failed to save display properties: ${error.message}`);

    return { display_properties: data };
  }

  /**
   * Assignees and labels are replaced wholesale when present, because the
   * application sends the complete intended set rather than a delta.
   */
  async updateIssue(workspaceSlug: string, projectId: string, issueId: string, patch: Partial<TIssue>): Promise<void> {
    const supabase = getSupabase();

    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    const direct: (keyof TIssue)[] = [
      "name",
      "description_html",
      "priority",
      "state_id",
      "parent_id",
      "start_date",
      "target_date",
      "sort_order",
      "is_draft",
    ];
    for (const key of direct) {
      if (key in patch) payload[key] = patch[key];
    }

    const { error } = await supabase.from("issues").update(payload).eq("id", issueId);
    if (error) throw new Error(`Failed to save that work item: ${error.message}`);

    if (patch.assignee_ids) {
      await this.replaceLinks("issue_assignees", "assignee_id", issueId, projectId, patch.assignee_ids);
    }
    if (patch.label_ids) {
      await this.replaceLinks("issue_labels", "label_id", issueId, projectId, patch.label_ids);
    }
  }

  /** Soft delete, consistent with the rest of the schema. */
  async deleteIssue(workspaceSlug: string, projectId: string, issueId: string): Promise<void> {
    const supabase = getSupabase();

    const { error } = await supabase.from("issues").update({ deleted_at: new Date().toISOString() }).eq("id", issueId);

    if (error) throw new Error(`Failed to delete that work item: ${error.message}`);
  }

  async updateIssueDates(
    workspaceSlug: string,
    projectId: string,
    updates: { id: string; start_date?: string; target_date?: string }[]
  ): Promise<void> {
    const supabase = getSupabase();
    const now = new Date().toISOString();

    await Promise.all(
      updates.map(async (item) => {
        const { error } = await supabase
          .from("issues")
          .update({
            start_date: item.start_date ?? null,
            target_date: item.target_date ?? null,
            updated_at: now,
          })
          .eq("id", item.id);

        if (error) throw new Error(`Failed to update dates: ${error.message}`);
      })
    );
  }

  async subIssues(workspaceSlug: string, projectId: string, issueId: string, _queries?: any): Promise<TIssueSubIssues> {
    const supabase = getSupabase();

    const { data: issuesData, error: issuesError } = await supabase
      .from("issues")
      .select(ISSUE_SELECT)
      .eq("parent_id", issueId)
      .is("deleted_at", null)
      .is("archived_at", null)
      .order("sort_order", { ascending: true });

    if (issuesError) throw new Error(`Failed to load sub-items: ${issuesError.message}`);

    const subIssuesList = (issuesData ?? []).map((row) => this.toIssue(row as unknown as Record<string, unknown>));

    const stateDistribution: TSubIssuesStateDistribution = {
      backlog: [],
      unstarted: [],
      started: [],
      completed: [],
      cancelled: [],
    };

    if (subIssuesList.length > 0) {
      const { data: states } = await supabase.from("states").select("id, group").eq("project_id", projectId);

      const stateGroupMap = new Map<string, string>();
      for (const s of states ?? []) {
        stateGroupMap.set(s.id, s.group);
      }

      for (const issue of subIssuesList) {
        const group = issue.state_id ? stateGroupMap.get(issue.state_id) : undefined;
        if (group && group in stateDistribution) {
          stateDistribution[group as keyof TSubIssuesStateDistribution].push(issue.id);
        } else {
          stateDistribution.backlog.push(issue.id);
        }
      }
    }

    return {
      state_distribution: stateDistribution,
      sub_issues: subIssuesList,
    };
  }

  async addSubIssues(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    data: { sub_issue_ids: string[] }
  ): Promise<TIssueSubIssues> {
    if (data.sub_issue_ids.length === 0) return this.subIssues(workspaceSlug, projectId, issueId);
    const supabase = getSupabase();

    const { error } = await supabase
      .from("issues")
      .update({ parent_id: issueId, updated_at: new Date().toISOString() })
      .in("id", data.sub_issue_ids);

    if (error) throw new Error(`Failed to add sub-items: ${error.message}`);

    return this.subIssues(workspaceSlug, projectId, issueId);
  }

  async fetchIssueLinks(workspaceSlug: string, projectId: string, issueId: string): Promise<TIssueLink[]> {
    return supabaseWorkItemDetailService.getIssueLinks(workspaceSlug, projectId, issueId);
  }

  async createIssueLink(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    data: Partial<TIssueLink>
  ): Promise<TIssueLink> {
    return supabaseWorkItemDetailService.createIssueLink(workspaceSlug, projectId, issueId, data);
  }

  async updateIssueLink(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    linkId: string,
    data: Partial<TIssueLink>
  ): Promise<TIssueLink> {
    return supabaseWorkItemDetailService.updateIssueLink(workspaceSlug, projectId, issueId, linkId, data);
  }

  async deleteIssueLink(workspaceSlug: string, projectId: string, issueId: string, linkId: string): Promise<any> {
    await supabaseWorkItemDetailService.deleteIssueLink(workspaceSlug, projectId, issueId, linkId);
    return { message: "Link deleted successfully" };
  }

  async bulkOperations(workspaceSlug: string, projectId: string, data: TBulkOperationsPayload): Promise<any> {
    if (data.issue_ids.length === 0) return { message: "No issue IDs provided" };
    const supabase = getSupabase();
    const props = data.properties;

    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (props.state_id !== undefined) payload.state_id = props.state_id;
    if (props.priority !== undefined) payload.priority = props.priority;
    if (props.start_date !== undefined) payload.start_date = props.start_date;
    if (props.target_date !== undefined) payload.target_date = props.target_date;
    if (props.estimate_point !== undefined) payload.estimate_point_id = props.estimate_point;

    if (Object.keys(payload).length > 1) {
      const { error } = await supabase.from("issues").update(payload).in("id", data.issue_ids);
      if (error) throw new Error(`Bulk update failed: ${error.message}`);
    }

    const { userId, workspaceId, now } = await this.context(projectId);

    await Promise.all(
      data.issue_ids.map(async (id) => {
        if (props.assignee_ids) {
          await this.replaceLinks("issue_assignees", "assignee_id", id, projectId, props.assignee_ids);
        }
        if (props.label_ids) {
          await this.replaceLinks("issue_labels", "label_id", id, projectId, props.label_ids);
        }
        if (props.cycle_id !== undefined) {
          await supabase.from("cycle_issues").delete().eq("issue_id", id);
          if (props.cycle_id) {
            await this.addIssueToCycle(workspaceSlug, projectId, props.cycle_id, { issues: [id] });
          }
        }
        if (props.module_ids !== undefined && props.module_ids !== null) {
          await supabase.from("module_issues").delete().eq("issue_id", id);
          if (props.module_ids.length > 0) {
            const rows = props.module_ids.map((modId) => ({
              created_at: now,
              updated_at: now,
              issue_id: id,
              module_id: modId,
              project_id: projectId,
              workspace_id: workspaceId,
              created_by_id: userId,
              updated_by_id: userId,
            }));
            await supabase.from("module_issues").insert(rows);
          }
        }
      })
    );

    return { message: "Bulk operations completed successfully" };
  }

  async bulkDeleteIssues(workspaceSlug: string, projectId: string, data: { issue_ids: string[] }): Promise<any> {
    if (data.issue_ids.length === 0) return { message: "No issue IDs provided" };
    const supabase = getSupabase();

    const { error } = await supabase
      .from("issues")
      .update({ deleted_at: new Date().toISOString() })
      .in("id", data.issue_ids);

    if (error) throw new Error(`Bulk delete failed: ${error.message}`);

    return { message: "Work items deleted successfully" };
  }

  async bulkArchiveIssues(
    workspaceSlug: string,
    projectId: string,
    data: { issue_ids: string[] }
  ): Promise<{ archived_at: string }> {
    const now = new Date().toISOString();
    if (data.issue_ids.length === 0) return { archived_at: now };
    const supabase = getSupabase();

    const { error } = await supabase.from("issues").update({ archived_at: now }).in("id", data.issue_ids);

    if (error) throw new Error(`Bulk archive failed: ${error.message}`);

    return { archived_at: now };
  }

  async getIssueNotificationSubscriptionStatus(
    workspaceSlug: string,
    projectId: string,
    issueId: string
  ): Promise<{ subscribed: boolean }> {
    const supabase = getSupabase();
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    if (!userId) return { subscribed: false };

    const { data, error } = await supabase
      .from("issue_subscribers")
      .select("id")
      .eq("issue_id", issueId)
      .eq("subscriber_id", userId)
      .is("deleted_at", null);

    if (error) throw new Error(`Failed to get subscription status: ${error.message}`);

    return { subscribed: (data ?? []).length > 0 };
  }

  async unsubscribeFromIssueNotifications(workspaceSlug: string, projectId: string, issueId: string): Promise<any> {
    const supabase = getSupabase();
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    if (!userId) return { subscribed: false };

    const { error } = await supabase
      .from("issue_subscribers")
      .delete()
      .eq("issue_id", issueId)
      .eq("subscriber_id", userId);

    if (error) throw new Error(`Failed to unsubscribe: ${error.message}`);

    return { subscribed: false };
  }

  async subscribeToIssueNotifications(workspaceSlug: string, projectId: string, issueId: string): Promise<any> {
    const { userId, workspaceId, now } = await this.context(projectId);
    const supabase = getSupabase();

    const { error } = await supabase.from("issue_subscribers").upsert(
      {
        created_at: now,
        updated_at: now,
        issue_id: issueId,
        subscriber_id: userId,
        project_id: projectId,
        workspace_id: workspaceId,
        created_by_id: userId,
        updated_by_id: userId,
      },
      { onConflict: "issue_id,subscriber_id" }
    );

    if (error) throw new Error(`Failed to subscribe: ${error.message}`);

    return { subscribed: true };
  }

  async bulkSubscribeIssues(workspaceSlug: string, projectId: string, data: { issue_ids: string[] }): Promise<any> {
    await Promise.all(data.issue_ids.map((id) => this.subscribeToIssueNotifications(workspaceSlug, projectId, id)));
    return { message: "Subscribed to issues successfully" };
  }

  async getIssueMetaFromURL(
    workspaceSlug: string,
    projectId: string,
    issueId: string
  ): Promise<{ project_identifier: string; sequence_id: string }> {
    const supabase = getSupabase();

    const { data: project, error: pError } = await supabase
      .from("projects")
      .select("identifier")
      .eq("id", projectId)
      .single();

    if (pError) throw new Error(`Failed to load project: ${pError.message}`);

    const { data: issue, error: iError } = await supabase
      .from("issues")
      .select("sequence_id")
      .eq("id", issueId)
      .single();

    if (iError) throw new Error(`Failed to load work item: ${iError.message}`);

    return {
      project_identifier: String(project.identifier),
      sequence_id: String(issue.sequence_id),
    };
  }

  async retrieveWithIdentifier(
    workspaceSlug: string,
    project_identifier: string,
    issue_sequence: string,
    _queries?: any
  ): Promise<TIssue> {
    const supabase = getSupabase();

    const { data: project, error: pError } = await supabase
      .from("projects")
      .select("id")
      .eq("identifier", project_identifier)
      .is("deleted_at", null)
      .single();

    if (pError) throw new Error(`Failed to load project with identifier: ${pError.message}`);

    const { data: issue, error: iError } = await supabase
      .from("issues")
      .select(ISSUE_SELECT)
      .eq("project_id", project.id)
      .eq("sequence_id", Number(issue_sequence))
      .is("deleted_at", null)
      .single();

    if (iError) throw new Error(`Failed to load work item: ${iError.message}`);

    return this.toIssue(issue as unknown as Record<string, unknown>);
  }

  private async replaceLinks(
    table: "issue_assignees" | "issue_labels",
    column: "assignee_id" | "label_id",
    issueId: string,
    projectId: string,
    ids: string[]
  ): Promise<void> {
    const supabase = getSupabase();

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;

    const { data: project } = await supabase.from("projects").select("workspace_id").eq("id", projectId).single();
    const workspaceId = (project as { workspace_id?: string } | null)?.workspace_id;

    const { error: clearError } = await supabase.from(table).delete().eq("issue_id", issueId);
    if (clearError) throw new Error(`Failed to update that work item: ${clearError.message}`);

    if (ids.length === 0) return;

    const now = new Date().toISOString();
    const rows = ids.map((id) => ({
      created_at: now,
      updated_at: now,
      [column]: id,
      issue_id: issueId,
      project_id: projectId,
      workspace_id: workspaceId,
      created_by_id: userId,
      updated_by_id: userId,
    }));

    const { error } = await supabase.from(table).insert(rows);
    if (error) throw new Error(`Failed to update that work item: ${error.message}`);
  }

  /**
   * Public because intake reads the same rows through a different table and
   * must produce the same shape — a second mapper would be a second set of
   * defaults to keep in step.
   */
  toIssue(row: Record<string, unknown>): TIssue {
    const assignees = (row.issue_assignees ?? []) as { assignee_id: string }[];
    const labels = (row.issue_labels ?? []) as { label_id: string }[];

    return {
      id: String(row.id),
      name: (row.name as string) ?? "",
      description_html: (row.description_html as string) ?? "<p></p>",
      sequence_id: (row.sequence_id as number) ?? 0,
      sort_order: (row.sort_order as number) ?? 0,
      state_id: (row.state_id as string) ?? null,
      priority: (row.priority as TIssue["priority"]) ?? null,
      label_ids: labels.map((l) => l.label_id),
      assignee_ids: assignees.map((a) => a.assignee_id),
      estimate_point: (row.estimate_point_id as string) ?? null,
      project_id: (row.project_id as string) ?? null,
      parent_id: (row.parent_id as string) ?? null,
      type_id: (row.type_id as string) ?? null,
      start_date: (row.start_date as string) ?? null,
      target_date: (row.target_date as string) ?? null,
      completed_at: (row.completed_at as string) ?? null,
      archived_at: (row.archived_at as string) ?? null,
      created_at: (row.created_at as string) ?? "",
      updated_at: (row.updated_at as string) ?? "",
      created_by: (row.created_by_id as string) ?? "",
      updated_by: (row.updated_by_id as string) ?? "",
      is_draft: Boolean(row.is_draft),
      cycle_id: null,
      module_ids: null,
      sub_issues_count: 0,
      attachment_count: 0,
      link_count: 0,
    };
  }
}

export const supabaseWorkItemService = new SupabaseWorkItemService();

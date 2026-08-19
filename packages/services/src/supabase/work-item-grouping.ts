/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { TIssue, TIssuesResponse } from "@keel/types";

import { getSupabase } from "./client";

/**
 * Shapes a flat list of work items into the paginated, grouped response the
 * issue stores expect.
 *
 * Django did the grouping in the query; here the rows come back flat, so the
 * bucketing happens once, in this module, for every service that answers with
 * a `TIssuesResponse`. Returning a flat `results` array alongside a non-empty
 * `grouped_by` is what left the board layout with no columns to draw: the
 * store files everything under a single ALL_ISSUES key that no column reads.
 */

/** The group key the layouts use for work items that carry no value. */
const NO_GROUP = "None";

/**
 * The work item field behind each server-side group_by key.
 *
 * The layouts ask for grouping using Django's ORM path names (`labels__id`),
 * while the grouped response has to be keyed by the value the store reads off
 * the work item itself (`label_ids`). This is that translation.
 */
const GROUP_BY_FIELD: Record<string, string> = {
  state_id: "state_id",
  state__group: "state__group",
  priority: "priority",
  labels__id: "label_ids",
  assignees__id: "assignee_ids",
  cycle_id: "cycle_id",
  issue_module__module_id: "module_ids",
  target_date: "target_date",
  project_id: "project_id",
  created_by: "created_by",
};

type TGroupBucket = { results: TIssue[] | Record<string, TGroupBucket>; total_results: number };

/**
 * The groups one work item belongs to. Multi-value properties (labels,
 * assignees, modules) put the item in every matching group, which is what the
 * board does when you group by them.
 */
const groupKeysFor = (issue: TIssue, groupBy: string | undefined): string[] => {
  if (!groupBy) return [];

  const field = GROUP_BY_FIELD[groupBy];
  if (!field) return [NO_GROUP];

  const value = (issue as unknown as Record<string, unknown>)[field];

  if (Array.isArray(value)) return value.length > 0 ? value.map(String) : [NO_GROUP];
  if (value === null || value === undefined || value === "") return [NO_GROUP];

  return [String(value)];
};

/** Buckets work items by group, and by sub-group when one is asked for. */
const groupIssueResults = (
  issues: TIssue[],
  groupBy: string,
  subGroupBy: string | undefined
): Record<string, TGroupBucket> => {
  const grouped: Record<string, TGroupBucket> = {};

  for (const issue of issues) {
    for (const groupKey of groupKeysFor(issue, groupBy)) {
      if (!subGroupBy) {
        const bucket = (grouped[groupKey] ??= { results: [], total_results: 0 });
        (bucket.results as TIssue[]).push(issue);
        bucket.total_results += 1;
        continue;
      }

      const bucket = (grouped[groupKey] ??= { results: {}, total_results: 0 });
      const subGroups = bucket.results as Record<string, TGroupBucket>;

      for (const subGroupKey of groupKeysFor(issue, subGroupBy)) {
        const subBucket = (subGroups[subGroupKey] ??= { results: [], total_results: 0 });
        (subBucket.results as TIssue[]).push(issue);
        subBucket.total_results += 1;
        bucket.total_results += 1;
      }
    }
  }

  return grouped;
};

/**
 * Fills in the fields that only matter for grouping and are not on the work
 * item row itself: a state's group, and cycle/module membership. Each lookup is
 * best-effort — a group falling back to "None" beats an empty board.
 */
const hydrateGroupingFields = async (issues: TIssue[], groupBys: (string | undefined)[]) => {
  if (issues.length === 0) return;

  const supabase = getSupabase();
  const issueIds = issues.map((issue) => issue.id);

  if (groupBys.includes("state__group")) {
    const stateIds = Array.from(
      new Set(issues.map((issue) => issue.state_id).filter((id): id is string => Boolean(id)))
    );

    if (stateIds.length > 0) {
      const { data } = await supabase.from("states").select("id, group").in("id", stateIds);
      const groupByStateId = new Map(
        ((data ?? []) as { id: string; group: string }[]).map((state) => [state.id, state.group])
      );

      for (const issue of issues) {
        issue.state__group = (issue.state_id ? groupByStateId.get(issue.state_id) : null) as TIssue["state__group"];
      }
    }
  }

  if (groupBys.includes("cycle_id")) {
    const { data } = await supabase.from("cycle_issues").select("issue_id, cycle_id").in("issue_id", issueIds);
    const cycleByIssueId = new Map(
      ((data ?? []) as { issue_id: string; cycle_id: string }[]).map((row) => [row.issue_id, row.cycle_id])
    );

    for (const issue of issues) issue.cycle_id = cycleByIssueId.get(issue.id) ?? null;
  }

  if (groupBys.includes("issue_module__module_id")) {
    const { data } = await supabase.from("module_issues").select("issue_id, module_id").in("issue_id", issueIds);
    const modulesByIssueId = new Map<string, string[]>();

    for (const row of (data ?? []) as { issue_id: string; module_id: string }[]) {
      modulesByIssueId.set(row.issue_id, [...(modulesByIssueId.get(row.issue_id) ?? []), row.module_id]);
    }

    for (const issue of issues) issue.module_ids = modulesByIssueId.get(issue.id) ?? null;
  }
};

/**
 * The single place a list of work items becomes a `TIssuesResponse`.
 *
 * `queries` is the param bag the filter store builds, so `group_by` and
 * `sub_group_by` arrive already translated to their server key names.
 */
export const buildIssuesResponse = async (
  issues: TIssue[],
  queries?: { group_by?: string; sub_group_by?: string }
): Promise<TIssuesResponse> => {
  const groupBy = queries?.group_by || undefined;
  const subGroupBy = queries?.sub_group_by || undefined;

  if (groupBy) await hydrateGroupingFields(issues, [groupBy, subGroupBy]);

  const results = groupBy ? groupIssueResults(issues, groupBy, subGroupBy) : issues;

  return {
    grouped_by: groupBy ?? "",
    next_cursor: "",
    prev_cursor: "",
    next_page_results: false,
    prev_page_results: false,
    total_count: issues.length,
    count: issues.length,
    total_pages: 1,
    extra_stats: null,
    results,
    total_results: issues.length,
  } as TIssuesResponse;
};

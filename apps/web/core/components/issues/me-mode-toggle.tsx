/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
import { User } from "@keel/propel/icons";
// keel imports
import type { TWorkItemFilterConditionData, TWorkItemFilterExpression } from "@keel/types";
import { EIssuesStoreType } from "@keel/types";
import { cn } from "@keel/utils";
// hooks
import { useIssues } from "@/hooks/store/use-issues";
import { useUser } from "@/hooks/store/user";

const ME_MODE_CONDITION_KEY = "assignee_id__in";

/** Flattens a rich filter expression to the conditions it holds. */
const toConditions = (expression: TWorkItemFilterExpression | undefined): TWorkItemFilterConditionData[] => {
  if (!expression || Object.keys(expression).length === 0) return [];
  if ("and" in expression && Array.isArray(expression.and)) return expression.and;
  return [expression as TWorkItemFilterConditionData];
};

type TMeModeToggleProps = {
  projectId: string;
  storeType?: EIssuesStoreType.PROJECT | EIssuesStoreType.EPIC;
  workspaceSlug: string;
};

/**
 * One click to "just what is on my plate".
 *
 * It rides on the same rich filter expression the filter row edits rather than
 * keeping a flag of its own, so toggling it shows up as an assignee chip in the
 * row and clearing that chip turns the button off.
 */
export const MeModeToggle = observer(function MeModeToggle(props: TMeModeToggleProps) {
  const { projectId, storeType = EIssuesStoreType.PROJECT, workspaceSlug } = props;
  // store hooks
  const { data: currentUser } = useUser();
  const {
    issuesFilter: { issueFilters, updateFilterExpression },
  } = useIssues(storeType);

  // derived values
  const conditions = toConditions(issueFilters?.richFilters);
  const assigneeCondition = conditions.find((condition) => ME_MODE_CONDITION_KEY in condition);
  const currentAssignees = String(assigneeCondition?.[ME_MODE_CONDITION_KEY] ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  const isActive = currentUser?.id ? currentAssignees.includes(currentUser.id) : false;

  const handleToggle = () => {
    if (!workspaceSlug || !projectId || !currentUser?.id) return;

    const nextAssignees = isActive
      ? currentAssignees.filter((id) => id !== currentUser.id)
      : [...currentAssignees, currentUser.id];

    const others = conditions.filter((condition) => !(ME_MODE_CONDITION_KEY in condition));
    const nextConditions: TWorkItemFilterConditionData[] =
      nextAssignees.length > 0 ? [...others, { [ME_MODE_CONDITION_KEY]: nextAssignees.join(",") }] : others;

    const expression: TWorkItemFilterExpression =
      nextConditions.length > 0 ? { and: nextConditions } : ({} as TWorkItemFilterExpression);

    void updateFilterExpression(workspaceSlug, projectId, expression);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={isActive}
      title="Show only work items assigned to me"
      className={cn(
        "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-12 font-medium transition-all duration-150",
        isActive
          ? "border-accent-subtle bg-accent-subtle font-semibold text-accent-primary shadow-raised-100"
          : "border-subtle bg-surface-2 text-secondary hover:bg-surface-1/80 hover:text-primary"
      )}
    >
      <User className="size-3.5 shrink-0" />
      <span className="hidden @2xl:inline">Me Mode</span>
    </button>
  );
});

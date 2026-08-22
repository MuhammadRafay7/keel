/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useCallback, useState } from "react";
import { observer } from "mobx-react";
import { ChartNoAxesColumn, SlidersHorizontal, User } from "lucide-react";
// keel imports
import { EIssueFilterType, ISSUE_STORE_TO_FILTERS_MAP } from "@keel/constants";
import { useTranslation } from "@keel/i18n";
import { Button } from "@keel/propel/button";
import type {
  IIssueDisplayFilterOptions,
  IIssueDisplayProperties,
  TWorkItemFilterConditionData,
  TWorkItemFilterExpression,
} from "@keel/types";
import { EIssueLayoutTypes, EIssuesStoreType } from "@keel/types";
// hooks
import { useIssues } from "@/hooks/store/use-issues";
import { useUser } from "@/hooks/store/user";
import { cn } from "@keel/utils";
// keel web imports
import type { TProject } from "@keel/types";
// local imports
import { WorkItemsModal } from "../analytics/work-items/modal";
import { WorkItemFiltersToggle } from "../work-item-filters/filters-toggle";
import {
  DisplayFiltersSelection,
  FiltersDropdown,
  LayoutSelection,
  MobileLayoutSelection,
} from "./issue-layouts/filters";

type Props = {
  currentProjectDetails: TProject | undefined;
  projectId: string;
  workspaceSlug: string;
  canUserCreateIssue: boolean | undefined;
  storeType?: EIssuesStoreType.PROJECT | EIssuesStoreType.EPIC;
};
const ME_MODE_CONDITION_KEY = "assignee_id__in";

/** Flattens a rich filter expression to the conditions it holds. */
const toConditions = (expression: TWorkItemFilterExpression | undefined): TWorkItemFilterConditionData[] => {
  if (!expression || Object.keys(expression).length === 0) return [];
  if ("and" in expression && Array.isArray(expression.and)) return expression.and;
  return [expression as TWorkItemFilterConditionData];
};

const LAYOUTS = [
  EIssueLayoutTypes.LIST,
  EIssueLayoutTypes.KANBAN,
  EIssueLayoutTypes.CALENDAR,
  EIssueLayoutTypes.SPREADSHEET,
  EIssueLayoutTypes.GANTT,
];

export const HeaderFilters: React.FC<Props> = observer(function HeaderFilters(props: Props) {
  const {
    currentProjectDetails,
    projectId,
    workspaceSlug,
    canUserCreateIssue,
    storeType = EIssuesStoreType.PROJECT,
  } = props;
  // i18n
  const { t } = useTranslation();
  // states
  const [analyticsModal, setAnalyticsModal] = useState(false);
  // store hooks
  const { data: currentUser } = useUser();
  const {
    issuesFilter: { issueFilters, updateFilters, updateFilterExpression },
  } = useIssues(storeType);

  // derived values
  const activeLayout = issueFilters?.displayFilters?.layout || EIssueLayoutTypes.LIST;
  const layoutDisplayFiltersOptions = ISSUE_STORE_TO_FILTERS_MAP[storeType]?.layoutOptions[activeLayout];

  // Me Mode rides on the same rich filter expression the filter row edits, so
  // the two stay in sync instead of writing to competing filter shapes.
  const conditions = toConditions(issueFilters?.richFilters);
  const assigneeCondition = conditions.find((condition) => ME_MODE_CONDITION_KEY in condition);
  const currentAssignees = String(assigneeCondition?.[ME_MODE_CONDITION_KEY] ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  const isMeModeActive = currentUser?.id ? currentAssignees.includes(currentUser.id) : false;

  const handleMeModeToggle = () => {
    if (!workspaceSlug || !projectId || !currentUser?.id) return;

    const nextAssignees = isMeModeActive
      ? currentAssignees.filter((id) => id !== currentUser.id)
      : [...currentAssignees, currentUser.id];

    const others = conditions.filter((condition) => !(ME_MODE_CONDITION_KEY in condition));
    const nextConditions: TWorkItemFilterConditionData[] =
      nextAssignees.length > 0 ? [...others, { [ME_MODE_CONDITION_KEY]: nextAssignees.join(",") }] : others;

    const expression: TWorkItemFilterExpression =
      nextConditions.length > 0 ? { and: nextConditions } : ({} as TWorkItemFilterExpression);

    void updateFilterExpression(workspaceSlug, projectId, expression);
  };

  const handleLayoutChange = useCallback(
    (layout: EIssueLayoutTypes) => {
      if (!workspaceSlug || !projectId) return;
      updateFilters(workspaceSlug, projectId, EIssueFilterType.DISPLAY_FILTERS, { layout: layout });
    },
    [workspaceSlug, projectId, updateFilters]
  );

  const handleDisplayFilters = useCallback(
    (updatedDisplayFilter: Partial<IIssueDisplayFilterOptions>) => {
      if (!workspaceSlug || !projectId) return;
      updateFilters(workspaceSlug, projectId, EIssueFilterType.DISPLAY_FILTERS, updatedDisplayFilter);
    },
    [workspaceSlug, projectId, updateFilters]
  );

  const handleDisplayProperties = useCallback(
    (property: Partial<IIssueDisplayProperties>) => {
      if (!workspaceSlug || !projectId) return;
      updateFilters(workspaceSlug, projectId, EIssueFilterType.DISPLAY_PROPERTIES, property);
    },
    [workspaceSlug, projectId, updateFilters]
  );

  return (
    <>
      <WorkItemsModal
        isOpen={analyticsModal}
        onClose={() => setAnalyticsModal(false)}
        projectDetails={currentProjectDetails ?? undefined}
        isEpic={storeType === EIssuesStoreType.EPIC}
      />
      <div className="hidden items-center gap-2 md:flex">
        <LayoutSelection
          layouts={LAYOUTS}
          onChange={(layout) => handleLayoutChange(layout)}
          selectedLayout={activeLayout}
        />
        <button
          type="button"
          onClick={handleMeModeToggle}
          title="Filter tasks assigned to me"
          className={cn(
            "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-12 font-medium transition-all duration-150",
            isMeModeActive
              ? "border-accent-subtle bg-accent-subtle font-semibold text-accent-primary shadow-raised-100"
              : "border-subtle bg-surface-2 text-secondary hover:bg-surface-1/80 hover:text-primary"
          )}
        >
          <User className="size-3.5 flex-shrink-0" />
          <span>Me Mode</span>
        </button>
      </div>
      <div className="flex md:hidden">
        <MobileLayoutSelection
          layouts={LAYOUTS}
          onChange={(layout) => handleLayoutChange(layout)}
          activeLayout={activeLayout}
        />
      </div>
      <WorkItemFiltersToggle entityType={storeType} entityId={projectId} />
      <FiltersDropdown
        miniIcon={<SlidersHorizontal className="size-3.5" />}
        title={t("common.display")}
        placement="bottom-end"
      >
        <DisplayFiltersSelection
          layoutDisplayFiltersOptions={layoutDisplayFiltersOptions}
          displayFilters={issueFilters?.displayFilters ?? {}}
          handleDisplayFiltersUpdate={handleDisplayFilters}
          displayProperties={issueFilters?.displayProperties ?? {}}
          handleDisplayPropertiesUpdate={handleDisplayProperties}
          cycleViewDisabled={!currentProjectDetails?.cycle_view}
          moduleViewDisabled={!currentProjectDetails?.module_view}
          isEpic={storeType === EIssuesStoreType.EPIC}
        />
      </FiltersDropdown>
      {canUserCreateIssue ? (
        <Button className="hidden px-2 md:block" onClick={() => setAnalyticsModal(true)} variant="secondary" size="lg">
          <div className="hidden @4xl:flex">{t("common.analytics")}</div>
          <div className="flex @4xl:hidden">
            <ChartNoAxesColumn className="size-3.5" />
          </div>
        </Button>
      ) : (
        <></>
      )}
    </>
  );
});

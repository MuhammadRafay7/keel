/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useCallback, useState } from "react";
import { observer } from "mobx-react";
import { ChartNoAxesColumn, SlidersHorizontal, Sparkles, User } from "lucide-react";
// keel imports
import { EIssueFilterType, ISSUE_STORE_TO_FILTERS_MAP } from "@keel/constants";
import { useTranslation } from "@keel/i18n";
import { Button } from "@keel/propel/button";
import { setToast, TOAST_TYPE } from "@keel/propel/toast";
import type { IIssueDisplayFilterOptions, IIssueDisplayProperties } from "@keel/types";
import { EIssueLayoutTypes, EIssuesStoreType } from "@keel/types";
// hooks
import { useIssues } from "@/hooks/store/use-issues";
import { useProjectState } from "@/hooks/store/use-project-state";
import { useUser } from "@/hooks/store/user";
import { useIssuesActions } from "@/hooks/use-issues-actions";
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
const LAYOUTS = [
  EIssueLayoutTypes.LIST,
  EIssueLayoutTypes.KANBAN,
  EIssueLayoutTypes.CALENDAR,
  EIssueLayoutTypes.SPREADSHEET,
  EIssueLayoutTypes.GANTT,
  EIssueLayoutTypes.CHAT,
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
  const [isSeeding, setIsSeeding] = useState(false);
  // store hooks
  const { data: currentUser } = useUser();
  const {
    issuesFilter: { issueFilters, updateFilters },
  } = useIssues(storeType);
  const { createIssue } = useIssuesActions(storeType);
  const { getProjectStates } = useProjectState();

  // derived values
  const activeLayout = issueFilters?.displayFilters?.layout;
  const layoutDisplayFiltersOptions = ISSUE_STORE_TO_FILTERS_MAP[storeType]?.layoutOptions[activeLayout];

  const currentAssignees = (issueFilters?.filters?.assignees as string[]) || [];
  const isMeModeActive = currentUser?.id ? currentAssignees.includes(currentUser.id) : false;

  const handleMeModeToggle = () => {
    if (!workspaceSlug || !projectId || !currentUser?.id) return;
    const assignees = (issueFilters?.filters?.assignees as string[]) || [];
    const isMeActive = assignees.includes(currentUser.id);
    const newAssignees = isMeActive ? assignees.filter((id) => id !== currentUser.id) : [...assignees, currentUser.id];
    updateFilters(workspaceSlug, projectId, EIssueFilterType.FILTERS, { assignees: newAssignees });
  };

  const handleSeedDemoData = async () => {
    if (!workspaceSlug || !projectId || isSeeding) return;
    setIsSeeding(true);
    setToast({
      type: TOAST_TYPE.INFO,
      title: "Seeding Demo Data",
      message: "Creating sample work items to showcase all ClickUp views...",
    });

    try {
      const projectStates = getProjectStates(projectId.toString()) || [];
      const getStateByGroup = (group: string) => projectStates.find((s) => s.group === group)?.id || undefined;

      const sampleItems = [
        {
          name: "Design System & ClickUp Theme Refresh",
          priority: "urgent",
          state_id: getStateByGroup("started") || getStateByGroup("unstarted"),
          description_html:
            "<p>Implement ClickUp vibrant purple theme tokens, dual-theme support, and modern UI layout controls.</p>",
          start_date: new Date().toISOString().split("T")[0],
          target_date: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
        },
        {
          name: "Setup Work Item API Validation & UUID Sanitization",
          priority: "high",
          state_id: getStateByGroup("completed"),
          description_html:
            "<p>Ensure all optional work item fields convert empty strings to null before Postgres execution.</p>",
          start_date: new Date(Date.now() - 3 * 86400000).toISOString().split("T")[0],
          target_date: new Date().toISOString().split("T")[0],
        },
        {
          name: "Build ClickUp Views Toolbar (List, Board, Calendar, Spreadsheet, Gantt)",
          priority: "high",
          state_id: getStateByGroup("started"),
          description_html:
            "<p>Interactive view header toolbar allowing 1-click tab switching between List, Board, Calendar, Spreadsheet, and Gantt charts.</p>",
          start_date: new Date().toISOString().split("T")[0],
          target_date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
        },
        {
          name: "1-Click Me Mode Filter Toggle",
          priority: "medium",
          state_id: getStateByGroup("unstarted"),
          description_html: "<p>Quickly filter work items assigned to the active logged-in user in 1 click.</p>",
          start_date: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
          target_date: new Date(Date.now() + 10 * 86400000).toISOString().split("T")[0],
        },
        {
          name: "Sprint 1 Retrospective & Product Roadmap",
          priority: "low",
          state_id: getStateByGroup("backlog"),
          description_html: "<p>Gather team feedback on ClickUp design parity and plan next feature milestones.</p>",
          start_date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
          target_date: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
        },
      ];

      if (createIssue) {
        await Promise.all(sampleItems.map((item) => createIssue(projectId.toString(), item)));
      }

      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "Demo Data Seeded!",
        message: "Successfully generated sample work items across all views.",
      });
    } catch (_error) {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: "Seeding Failed",
        message: "Could not create sample work items. Please try again.",
      });
    } finally {
      setIsSeeding(false);
    }
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
              ? "shadow-xs border-accent-subtle bg-accent-subtle font-semibold text-accent-primary"
              : "border-subtle bg-surface-2 text-secondary hover:bg-surface-1/80 hover:text-primary"
          )}
        >
          <User className="size-3.5 flex-shrink-0" />
          <span>Me Mode</span>
        </button>
        <button
          type="button"
          onClick={handleSeedDemoData}
          disabled={isSeeding}
          title="Seed sample work items to explore all ClickUp views"
          className="flex items-center gap-1.5 rounded-lg border border-subtle bg-surface-2 px-2.5 py-1.5 text-12 font-medium text-secondary transition-all duration-150 hover:bg-surface-1/80 hover:text-accent-primary"
        >
          <Sparkles className={cn("size-3.5 flex-shrink-0 text-accent-primary", { "animate-spin": isSeeding })} />
          <span>{isSeeding ? "Seeding..." : "Seed Data"}</span>
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

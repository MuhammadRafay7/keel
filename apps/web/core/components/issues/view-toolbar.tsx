/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useCallback, useState } from "react";
import { observer } from "mobx-react";
import { ChartNoAxesColumn, SlidersHorizontal } from "lucide-react";
// keel imports
import {
  EIssueFilterType,
  ISSUE_LAYOUT_MAP,
  ISSUE_STORE_TO_FILTERS_MAP,
  PROJECT_VIEW_TRACKER_ELEMENTS,
} from "@keel/constants";
import { useTranslation } from "@keel/i18n";
import type { IWorkItemFilterInstance } from "@keel/shared-state";
import { Button } from "@keel/propel/button";
import type { IIssueDisplayFilterOptions, IIssueDisplayProperties, TProject } from "@keel/types";
import { EIssueLayoutTypes, EIssuesStoreType } from "@keel/types";
import { cn } from "@keel/utils";
// components
import { WorkItemsModal } from "@/components/analytics/work-items/modal";
import { IssueLayoutIcon } from "@/components/issues/issue-layouts/layout-icon";
import { MeModeToggle } from "@/components/issues/me-mode-toggle";
import { WorkItemFiltersRow } from "@/components/work-item-filters/filters-row";
import { WorkItemFiltersToggle } from "@/components/work-item-filters/filters-toggle";
// hooks
import { useIssues } from "@/hooks/store/use-issues";
// local imports
import { DisplayFiltersSelection, FiltersDropdown } from "./issue-layouts/filters";

/** The layouts offered as view tabs, in the order they read left to right. */
const VIEW_TABS: EIssueLayoutTypes[] = [
  EIssueLayoutTypes.LIST,
  EIssueLayoutTypes.KANBAN,
  EIssueLayoutTypes.CALENDAR,
  EIssueLayoutTypes.SPREADSHEET,
  EIssueLayoutTypes.GANTT,
];

type TViewTabsProps = {
  activeLayout: EIssueLayoutTypes;
  onChange: (layout: EIssueLayoutTypes) => void;
};

/**
 * The view switcher, as a tab strip rather than a segmented control.
 *
 * Tabs sit on the content's own top edge and carry an underline, so the active
 * view reads as the page you are on rather than as a setting you have toggled.
 */
const ViewTabs = observer(function ViewTabs(props: TViewTabsProps) {
  const { activeLayout, onChange } = props;
  const { t } = useTranslation();

  return (
    <div role="tablist" className="flex items-center gap-0.5 overflow-x-auto">
      {VIEW_TABS.map((layout) => {
        const isActive = activeLayout === layout;

        return (
          <button
            key={layout}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => !isActive && onChange(layout)}
            className={cn(
              "group relative flex shrink-0 items-center gap-1.5 rounded-t-md px-3 pt-2 pb-2.5 text-13 whitespace-nowrap transition-colors duration-150",
              isActive ? "font-semibold text-primary" : "font-medium text-tertiary hover:text-secondary"
            )}
          >
            <IssueLayoutIcon
              layout={layout}
              size={15}
              strokeWidth={2}
              className={cn("size-[15px] shrink-0", isActive ? "text-accent-primary" : "text-tertiary")}
            />
            <span>{t(ISSUE_LAYOUT_MAP[layout].i18n_title)}</span>
            {/* the underline is painted on the toolbar's own bottom border */}
            <span
              className={cn(
                "absolute inset-x-1.5 -bottom-px h-0.5 rounded-full transition-opacity duration-150",
                isActive ? "bg-accent-primary opacity-100" : "opacity-0"
              )}
            />
          </button>
        );
      })}
    </div>
  );
});

type TWorkItemViewToolbarProps = {
  canUserCreateIssue: boolean | undefined;
  currentProjectDetails: TProject | undefined;
  filter: IWorkItemFilterInstance | undefined;
  projectId: string;
  storeType?: EIssuesStoreType.PROJECT | EIssuesStoreType.EPIC;
  workspaceSlug: string;
};

/**
 * The band between the page header and the work items themselves.
 *
 * Everything that changes what you are looking at lives here — which view,
 * which filters, how it is grouped — so the header above stays about where you
 * are, and the controls stay put as you move between views.
 */
export const WorkItemViewToolbar = observer(function WorkItemViewToolbar(props: TWorkItemViewToolbarProps) {
  const {
    canUserCreateIssue,
    currentProjectDetails,
    filter,
    projectId,
    storeType = EIssuesStoreType.PROJECT,
    workspaceSlug,
  } = props;
  // i18n
  const { t } = useTranslation();
  // states
  const [analyticsModal, setAnalyticsModal] = useState(false);
  // store hooks
  const {
    issuesFilter: { issueFilters, updateFilters },
  } = useIssues(storeType);

  // derived values
  const activeLayout = issueFilters?.displayFilters?.layout || EIssueLayoutTypes.LIST;
  const layoutDisplayFiltersOptions = ISSUE_STORE_TO_FILTERS_MAP[storeType]?.layoutOptions[activeLayout];

  const handleLayoutChange = useCallback(
    (layout: EIssueLayoutTypes) => {
      if (!workspaceSlug || !projectId) return;
      updateFilters(workspaceSlug, projectId, EIssueFilterType.DISPLAY_FILTERS, { layout });
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
      <div className="relative z-[19] shrink-0 glass-header">
        <div className="flex items-end justify-between gap-3 px-4">
          <ViewTabs activeLayout={activeLayout} onChange={handleLayoutChange} />

          <div className="flex shrink-0 items-center gap-1.5 pb-1.5">
            <MeModeToggle projectId={projectId} storeType={storeType} workspaceSlug={workspaceSlug} />
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
            {canUserCreateIssue && (
              <Button
                className="hidden px-2 md:block"
                onClick={() => setAnalyticsModal(true)}
                variant="secondary"
                size="lg"
              >
                <div className="hidden @4xl:flex">{t("common.analytics")}</div>
                <div className="flex @4xl:hidden">
                  <ChartNoAxesColumn className="size-3.5" />
                </div>
              </Button>
            )}
          </div>
        </div>
      </div>
      {filter && (
        <WorkItemFiltersRow
          filter={filter}
          trackerElements={{ saveView: PROJECT_VIEW_TRACKER_ELEMENTS.PROJECT_HEADER_SAVE_AS_VIEW_BUTTON }}
        />
      )}
    </>
  );
});

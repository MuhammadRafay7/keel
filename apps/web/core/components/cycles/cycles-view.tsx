/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState } from "react";
import { observer } from "mobx-react";
// components
import { useTranslation } from "@keel/i18n";
import { Button } from "@keel/propel/button";
import { PlusIcon } from "@keel/propel/icons";
// assets
import AllFiltersImage from "@/app/assets/empty-state/cycle/all-filters.svg?url";
import NameFilterImage from "@/app/assets/empty-state/cycle/name-filter.svg?url";
// components
import { CyclesList } from "@/components/cycles/list";
import { CycleCreateUpdateModal } from "@/components/cycles/modal";
import { CycleModuleListLayoutLoader } from "@/components/ui/loader/cycle-module-list-loader";
// hooks
import { useCycle } from "@/hooks/store/use-cycle";
import { useCycleFilter } from "@/hooks/store/use-cycle-filter";

export interface ICyclesView {
  workspaceSlug: string;
  projectId: string;
}

export const CyclesView = observer(function CyclesView(props: ICyclesView) {
  const { workspaceSlug, projectId } = props;
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // store hooks
  const { getFilteredCycleIds, getFilteredCompletedCycleIds, getProjectCycleIds, loader, currentProjectActiveCycleId } =
    useCycle();
  const { searchQuery, clearAllFilters, updateSearchQuery } = useCycleFilter();
  const { t } = useTranslation();

  // derived values
  const totalProjectCycleIds = getProjectCycleIds(projectId);
  const filteredCycleIds = getFilteredCycleIds(projectId, false);
  const filteredCompletedCycleIds = getFilteredCompletedCycleIds(projectId);
  const filteredUpcomingCycleIds = (filteredCycleIds ?? []).filter(
    (cycleId) => cycleId !== currentProjectActiveCycleId
  );

  if (loader || !filteredCycleIds || totalProjectCycleIds === null) return <CycleModuleListLayoutLoader />;

  // Case 1: Brand new project with no cycles created at all
  if (totalProjectCycleIds.length === 0) {
    return (
      <>
        <CycleCreateUpdateModal
          isOpen={isCreateModalOpen}
          handleClose={() => setIsCreateModalOpen(false)}
          workspaceSlug={workspaceSlug}
          projectId={projectId}
        />
        <div className="grid h-full w-full place-items-center p-8">
          <div className="flex max-w-md flex-col items-center text-center">
            <img
              src={AllFiltersImage}
              className="mx-auto h-36 w-36 object-contain sm:h-48 sm:w-48"
              alt={t("project_empty_state.cycles.title")}
            />
            <h5 className="mt-6 mb-2 text-18 font-semibold text-primary">{t("project_empty_state.cycles.title")}</h5>
            <p className="mb-6 text-14 leading-relaxed text-secondary">{t("project_empty_state.cycles.description")}</p>
            <Button
              variant="primary"
              size="lg"
              prependIcon={<PlusIcon className="size-4" />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              {t("project_empty_state.cycles.cta_primary")}
            </Button>
          </div>
        </div>
      </>
    );
  }

  // Case 2: Cycles exist, but active filters or search excluded all of them
  if (filteredCycleIds.length === 0 && filteredCompletedCycleIds?.length === 0) {
    return (
      <div className="grid h-full w-full place-items-center p-8">
        <div className="flex max-w-md flex-col items-center text-center">
          <img
            src={searchQuery.trim() === "" ? AllFiltersImage : NameFilterImage}
            className="mx-auto h-36 w-36 object-contain sm:h-48 sm:w-48"
            alt="No matching cycles"
          />
          <h5 className="mt-6 mb-2 text-18 font-semibold text-primary">{t("project_cycles.no_matching_cycles")}</h5>
          <p className="mb-6 text-14 leading-relaxed text-secondary">
            {searchQuery.trim() === ""
              ? t("project_cycles.remove_filters_to_see_all_cycles")
              : t("project_cycles.remove_search_criteria_to_see_all_cycles")}
          </p>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => {
              clearAllFilters(projectId);
              updateSearchQuery("");
            }}
          >
            Clear filters
          </Button>
        </div>
      </div>
    );
  }

  return (
    <CyclesList
      completedCycleIds={filteredCompletedCycleIds ?? []}
      upcomingCycleIds={filteredUpcomingCycleIds}
      cycleIds={filteredCycleIds}
      workspaceSlug={workspaceSlug}
      projectId={projectId}
    />
  );
});

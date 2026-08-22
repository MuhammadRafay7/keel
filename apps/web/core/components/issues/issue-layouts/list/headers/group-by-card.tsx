/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { CircleDashed } from "@keel/propel/icons";
import { ChevronRightIcon, PlusIcon } from "@keel/propel/icons";
// types
import { TOAST_TYPE, setToast } from "@keel/propel/toast";
import type { TIssue, ISearchIssueResponse, TIssueGroupByOptions } from "@keel/types";
// ui
import { CustomMenu } from "@keel/ui";
// components
import { cn } from "@keel/utils";
import { ExistingIssuesListModal } from "@/components/core/modals/existing-issues-list-modal";
import { MultipleSelectGroupAction } from "@/components/core/multiple-select";
import { CreateUpdateIssueModal } from "@/components/issues/issue-modal/modal";
import { CreateUpdateEpicModal } from "@/components/epic-modal";
// constants
import { useIssueStoreType } from "@/hooks/use-issue-layout-store";
import type { TSelectionHelper } from "@/hooks/use-multiple-select";

interface IHeaderGroupByCard {
  groupID: string;
  groupBy: TIssueGroupByOptions;
  icon?: React.ReactNode;
  title: string;
  count: number;
  issuePayload: Partial<TIssue>;
  canEditProperties: (projectId: string | undefined) => boolean;
  disableIssueCreation?: boolean;
  addIssuesToView?: (issueIds: string[]) => Promise<TIssue>;
  selectionHelpers: TSelectionHelper;
  handleCollapsedGroups: (value: string) => void;
  /** Whether this group's rows are showing. Drives the disclosure chevron. */
  isExpanded?: boolean;
  isEpic?: boolean;
}

export const HeaderGroupByCard = observer(function HeaderGroupByCard(props: IHeaderGroupByCard) {
  const {
    groupID,
    icon,
    title,
    count,
    issuePayload,
    canEditProperties,
    disableIssueCreation,
    addIssuesToView,
    selectionHelpers,
    handleCollapsedGroups,
    isExpanded = true,
    isEpic = false,
  } = props;
  // states
  const [isOpen, setIsOpen] = useState(false);
  const [openExistingIssueListModal, setOpenExistingIssueListModal] = useState(false);
  // router
  const { workspaceSlug, projectId, moduleId, cycleId } = useParams();
  const storeType = useIssueStoreType();
  // derived values
  const renderExistingIssueModal = moduleId || cycleId;
  const existingIssuesListModalPayload = moduleId ? { module: moduleId.toString() } : { cycle: true };
  const isGroupSelectionEmpty = selectionHelpers.isGroupSelected(groupID) === "empty";
  // auth
  const canSelectIssues = canEditProperties(projectId?.toString()) && !selectionHelpers.isSelectionDisabled;

  const handleAddIssuesToView = async (data: ISearchIssueResponse[]) => {
    if (!workspaceSlug || !projectId) return;

    const issues = data.map((i) => i.id);

    try {
      await addIssuesToView?.(issues);

      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "Success!",
        message: "Work items added to the cycle successfully.",
      });
    } catch (_error) {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: "Error!",
        message: "Selected work items could not be added to the cycle. Please try again.",
      });
    }
  };

  return (
    <>
      <div className="group/list-header flex w-full flex-shrink-0 items-center justify-between gap-2 rounded-lg border border-subtle/70 bg-surface-2/60 px-2.5 py-1.5 transition-smooth hover:bg-surface-2">
        <div className="flex items-center gap-2 overflow-hidden">
          {canSelectIssues && (
            <div className="flex w-3.5 flex-shrink-0 items-center">
              <MultipleSelectGroupAction
                className={cn(
                  "pointer-events-none size-3.5 opacity-0 !outline-none group-hover/list-header:pointer-events-auto group-hover/list-header:opacity-100",
                  {
                    "pointer-events-auto opacity-100": !isGroupSelectionEmpty,
                  }
                )}
                groupID={groupID}
                selectionHelpers={selectionHelpers}
                disabled={count === 0}
              />
            </div>
          )}
          <div className="grid flex-shrink-0 place-items-center overflow-hidden">
            {icon ?? <CircleDashed className="size-3.5 text-accent-primary" strokeWidth={2} />}
          </div>

          {/*
            The group title is the collapse control, so it is a real button:
            reachable by keyboard, and announced with its expanded state. It
            previously had neither, and — worse — no chevron at all, so nothing
            on screen said the group could be collapsed in the first place.
          */}
          <button
            type="button"
            aria-expanded={isExpanded}
            className="relative flex cursor-pointer flex-row items-center gap-1.5 overflow-hidden focus-ring rounded-md text-left"
            onClick={() => handleCollapsedGroups(groupID)}
          >
            <ChevronRightIcon
              className={cn("size-3.5 flex-shrink-0 text-tertiary transition-transform duration-200 ease-smooth", {
                "rotate-90": isExpanded,
              })}
              strokeWidth={2.5}
            />
            {/*
              Sentence case, not uppercase. These are state and label names the
              user typed; shouting them back makes a board of ordinary words
              read as a system log, and uppercase costs the eye word-shape,
              which is the thing that makes a scanned list quick to read.
            */}
            <span className="line-clamp-1 text-13 font-semibold tracking-[-0.01em] text-primary">{title}</span>
            <span className="ml-0.5 flex min-w-[22px] items-center justify-center rounded-full bg-accent-subtle px-1.5 py-0.5 text-11 font-semibold text-accent-primary tabular-nums">
              {count || 0}
            </span>
          </button>
        </div>

        {!disableIssueCreation &&
          (renderExistingIssueModal ? (
            <CustomMenu
              customButton={
                <span className="flex size-6 flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden focus-ring rounded-md text-tertiary transition-smooth hover:bg-layer-1 hover:text-primary">
                  <PlusIcon className="h-3.5 w-3.5" strokeWidth={2} />
                </span>
              }
            >
              <CustomMenu.MenuItem
                onClick={() => {
                  setIsOpen(true);
                }}
              >
                <span className="flex items-center justify-start gap-2">Create work item</span>
              </CustomMenu.MenuItem>
              <CustomMenu.MenuItem
                onClick={() => {
                  setOpenExistingIssueListModal(true);
                }}
              >
                <span className="flex items-center justify-start gap-2">Add an existing work item</span>
              </CustomMenu.MenuItem>
            </CustomMenu>
          ) : (
            <button
              type="button"
              aria-label={`Add a work item to ${title}`}
              className="flex size-6 flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden focus-ring rounded-md text-tertiary transition-smooth hover:bg-layer-1 hover:text-primary"
              onClick={() => {
                setIsOpen(true);
              }}
            >
              <PlusIcon width={14} strokeWidth={2} />
            </button>
          ))}

        {isEpic ? (
          <CreateUpdateEpicModal isOpen={isOpen} onClose={() => setIsOpen(false)} data={issuePayload} />
        ) : (
          <CreateUpdateIssueModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            data={issuePayload}
            storeType={storeType}
          />
        )}

        {renderExistingIssueModal && (
          <ExistingIssuesListModal
            workspaceSlug={workspaceSlug?.toString()}
            projectId={projectId?.toString()}
            isOpen={openExistingIssueListModal}
            handleClose={() => setOpenExistingIssueListModal(false)}
            searchParams={existingIssuesListModalPayload}
            handleOnSubmit={handleAddIssuesToView}
          />
        )}
      </div>
    </>
  );
});

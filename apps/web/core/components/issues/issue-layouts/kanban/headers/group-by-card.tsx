/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import React from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
// lucide icons
import { Minimize2, Maximize2, Circle } from "@keel/propel/icons";
import { PlusIcon } from "@keel/propel/icons";
import { TOAST_TYPE, setToast } from "@keel/propel/toast";
import type { TIssue, ISearchIssueResponse, TIssueKanbanFilters, TIssueGroupByOptions } from "@keel/types";
// ui
import { CustomMenu } from "@keel/ui";
import { cn } from "@keel/utils";
// components
import { ExistingIssuesListModal } from "@/components/core/modals/existing-issues-list-modal";
import { CreateUpdateIssueModal } from "@/components/issues/issue-modal/modal";
// constants
import { useIssueStoreType } from "@/hooks/use-issue-layout-store";
import { CreateUpdateEpicModal } from "@/components/epic-modal";

interface IHeaderGroupByCard {
  sub_group_by: TIssueGroupByOptions | undefined;
  group_by: TIssueGroupByOptions | undefined;
  column_id: string;
  icon?: React.ReactNode;
  title: string;
  count: number;
  collapsedGroups: TIssueKanbanFilters;
  handleCollapsedGroups: (toggle: "group_by" | "sub_group_by", value: string) => void;
  issuePayload: Partial<TIssue>;
  disableIssueCreation?: boolean;
  addIssuesToView?: (issueIds: string[]) => Promise<TIssue>;
  isEpic?: boolean;
}

export const HeaderGroupByCard = observer(function HeaderGroupByCard(props: IHeaderGroupByCard) {
  const {
    sub_group_by,
    column_id,
    icon,
    title,
    count,
    collapsedGroups,
    handleCollapsedGroups,
    issuePayload,
    disableIssueCreation,
    addIssuesToView,
    isEpic = false,
  } = props;
  const verticalAlignPosition = sub_group_by ? false : collapsedGroups?.group_by.includes(column_id);
  // states
  const [isOpen, setIsOpen] = React.useState(false);
  const [openExistingIssueListModal, setOpenExistingIssueListModal] = React.useState(false);
  // hooks
  const storeType = useIssueStoreType();
  // router
  const { workspaceSlug, projectId, moduleId, cycleId } = useParams();

  const renderExistingIssueModal = moduleId || cycleId;
  const ExistingIssuesListModalPayload = moduleId ? { module: moduleId.toString() } : { cycle: true };

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

  /*
   * The header's icon buttons. Written once because there are three of them and
   * they had drifted apart — same intent, three slightly different strings.
   */
  const actionButtonClassName =
    "flex size-6 flex-shrink-0 cursor-pointer items-center justify-center rounded-md text-tertiary transition-smooth focus-ring hover:bg-layer-transparent-hover hover:text-primary";

  return (
    <>
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
          searchParams={ExistingIssuesListModalPayload}
          handleOnSubmit={handleAddIssuesToView}
        />
      )}
      <div
        className={cn(
          "group/column-header shadow-2xs relative flex flex-shrink-0 gap-2 rounded-2xl border border-subtle/80 bg-surface-1/90 px-3.5 py-2 backdrop-blur-md transition-smooth",
          verticalAlignPosition
            ? "bg-sky-500/10 dark:bg-sky-500/20 border-sky-500/30 text-sky-600 dark:text-sky-400 w-[48px] flex-col items-center py-4"
            : "w-full flex-row items-center justify-between"
        )}
      >
        <div
          className={`flex min-w-0 items-center gap-2 ${verticalAlignPosition ? "flex-col" : "flex-row overflow-hidden"}`}
        >
          <span className="flex size-5 flex-shrink-0 items-center justify-center overflow-hidden text-accent-primary">
            {icon ? icon : <Circle width={14} strokeWidth={2} />}
          </span>

          <div
            className={`relative flex min-w-0 gap-2 ${
              verticalAlignPosition ? `flex-col items-center` : `flex-row items-center overflow-hidden`
            }`}
          >
            <span
              className={`truncate text-13 font-bold text-primary ${
                verticalAlignPosition ? `max-h-[400px] vertical-lr` : ``
              }`}
            >
              {title}
            </span>
            {/* min-w so a column ticking 9 -> 10 does not nudge the title. */}
            <span className="shadow-2xs flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-layer-2 px-2 text-11 font-semibold text-secondary tabular-nums">
              {count || 0}
            </span>
          </div>
        </div>

        {/*
         * Both actions share one box, so the header reads as title on the left
         * and controls on the right. As three siblings under justify-between,
         * collapse used to float in the middle of the column.
         */}
        {/*
         * The controls stay visible, at low emphasis, rather than appearing on
         * hover. "Add a work item to this column" is the primary action of a
         * board and hiding it until the pointer lands makes it undiscoverable —
         * and on a touch screen, where there is no hover at all, unreachable.
         * Holding them at 60% keeps the column quiet without hiding the way in.
         */}
        <div
          className={`flex flex-shrink-0 items-center gap-0.5 opacity-60 transition-smooth group-hover/column-header:opacity-100 focus-within:opacity-100 ${
            verticalAlignPosition ? "flex-col opacity-100" : ""
          }`}
        >
          {sub_group_by === null && (
            <button
              type="button"
              aria-label={verticalAlignPosition ? "Expand this column" : "Collapse this column"}
              className={actionButtonClassName}
              onClick={() => handleCollapsedGroups("group_by", column_id)}
            >
              {verticalAlignPosition ? (
                <Maximize2 width={14} strokeWidth={2} />
              ) : (
                <Minimize2 width={14} strokeWidth={2} />
              )}
            </button>
          )}

          {!disableIssueCreation &&
            (renderExistingIssueModal ? (
              <CustomMenu
                customButton={
                  <span className={actionButtonClassName}>
                    <PlusIcon height={14} width={14} strokeWidth={2} />
                  </span>
                }
                placement="bottom-end"
              >
                <CustomMenu.MenuItem onClick={() => setIsOpen(true)}>
                  <span className="flex items-center justify-start gap-2">Create work item</span>
                </CustomMenu.MenuItem>
                <CustomMenu.MenuItem onClick={() => setOpenExistingIssueListModal(true)}>
                  <span className="flex items-center justify-start gap-2">Add an existing work item</span>
                </CustomMenu.MenuItem>
              </CustomMenu>
            ) : (
              <button
                type="button"
                aria-label="Add a work item to this column"
                className={actionButtonClassName}
                onClick={() => setIsOpen(true)}
              >
                <PlusIcon width={14} strokeWidth={2} />
              </button>
            ))}
        </div>
      </div>
    </>
  );
});

/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState } from "react";
import { observer } from "mobx-react";
import { ETabIndices } from "@keel/constants";
import { ParentPropertyIcon } from "@keel/propel/icons";
import type { ISearchIssueResponse, TIssue } from "@keel/types";
import { CustomMenu } from "@keel/ui";
import { renderFormattedPayloadDate, getDate, getTabIndex } from "@keel/utils";
// components
import { CycleDropdown } from "@/components/dropdowns/cycle";
import { DateDropdown } from "@/components/dropdowns/date";
import { EstimateDropdown } from "@/components/dropdowns/estimate";
import { IntakeStateDropdown } from "@/components/dropdowns/intake-state/dropdown";
import { MemberDropdown } from "@/components/dropdowns/member/dropdown";
import { ModuleDropdown } from "@/components/dropdowns/module/dropdown";
import { PriorityDropdown } from "@/components/dropdowns/priority";
import { ParentIssuesListModal } from "@/components/issues/parent-issues-list-modal";
import { IssueLabelSelect } from "@/components/issues/select";
// helpers
// hooks
import { useProjectEstimates } from "@/hooks/store/estimates";
import { usePlatformOS } from "@/hooks/use-platform-os";

type TInboxIssueProperties = {
  projectId: string;
  data: Partial<TIssue>;
  handleData: (issueKey: keyof Partial<TIssue>, issueValue: Partial<TIssue>[keyof Partial<TIssue>]) => void;
  isVisible?: boolean;
};

export const InboxIssueProperties = observer(function InboxIssueProperties(props: TInboxIssueProperties) {
  const { projectId, data, handleData, isVisible = false } = props;
  // hooks
  const { areEstimateEnabledByProjectId } = useProjectEstimates();
  const { isMobile } = usePlatformOS();
  // states
  const [parentIssueModalOpen, setParentIssueModalOpen] = useState(false);
  const [selectedParentIssue, setSelectedParentIssue] = useState<ISearchIssueResponse | undefined>(undefined);

  const { getIndex } = getTabIndex(ETabIndices.INTAKE_ISSUE_FORM, isMobile);

  const startDate = data?.start_date;
  const targetDate = data?.target_date;

  const minDate = getDate(startDate);
  minDate?.setDate(minDate.getDate());

  const maxDate = getDate(targetDate);
  maxDate?.setDate(maxDate.getDate());

  return (
    <div className="relative flex flex-wrap items-center gap-2">
      {/* intake state */}
      <div className="h-7">
        <IntakeStateDropdown
          value={data?.state_id}
          onChange={(stateId) => handleData("state_id", stateId)}
          projectId={projectId}
          buttonVariant="border-with-text"
          tabIndex={getIndex("state_id")}
          isForWorkItemCreation={!data?.id}
        />
      </div>

      {/* priority */}
      <div className="h-7">
        <PriorityDropdown
          value={data?.priority}
          onChange={(priority) => handleData("priority", priority)}
          buttonVariant="border-with-text"
          tabIndex={getIndex("priority")}
        />
      </div>

      {/* Assignees */}
      <div className="h-7">
        <MemberDropdown
          projectId={projectId}
          value={data?.assignee_ids || []}
          onChange={(assigneeIds) => handleData("assignee_ids", assigneeIds)}
          buttonVariant={(data?.assignee_ids || [])?.length > 0 ? "transparent-without-text" : "border-with-text"}
          buttonClassName={(data?.assignee_ids || [])?.length > 0 ? "hover:bg-transparent" : ""}
          placeholder="Assignees"
          multiple
          tabIndex={getIndex("assignee_ids")}
        />
      </div>

      {/* labels */}
      <div className="h-7">
        <IssueLabelSelect
          value={data?.label_ids || []}
          onChange={(labelIds) => handleData("label_ids", labelIds)}
          projectId={projectId}
          tabIndex={getIndex("label_ids")}
        />
      </div>

      {/* start date */}
      {isVisible && (
        <div className="h-7">
          <DateDropdown
            value={data?.start_date || null}
            onChange={(date) => handleData("start_date", date ? renderFormattedPayloadDate(date) : "")}
            buttonVariant="border-with-text"
            minDate={minDate ?? undefined}
            placeholder="Start date"
            tabIndex={getIndex("start_date")}
          />
        </div>
      )}

      {/* due date */}
      <div className="h-7">
        <DateDropdown
          value={data?.target_date || null}
          onChange={(date) => handleData("target_date", date ? renderFormattedPayloadDate(date) : "")}
          buttonVariant="border-with-text"
          minDate={minDate ?? undefined}
          placeholder="Due date"
          tabIndex={getIndex("target_date")}
        />
      </div>

      {/* cycle */}
      {isVisible && (
        <div className="h-7">
          <CycleDropdown
            value={data?.cycle_id || ""}
            onChange={(cycleId) => handleData("cycle_id", cycleId)}
            projectId={projectId}
            placeholder="Cycle"
            buttonVariant="border-with-text"
            tabIndex={getIndex("cycle_id")}
          />
        </div>
      )}

      {/* module */}
      {isVisible && (
        <div className="h-7">
          <ModuleDropdown
            value={data?.module_ids || []}
            onChange={(moduleIds) => handleData("module_ids", moduleIds)}
            projectId={projectId}
            placeholder="Modules"
            buttonVariant="border-with-text"
            multiple
            showCount
            tabIndex={getIndex("module_ids")}
          />
        </div>
      )}

      {/* estimate */}
      {isVisible && projectId && areEstimateEnabledByProjectId(projectId) && (
        <div className="h-7">
          <EstimateDropdown
            value={data?.estimate_point || undefined}
            onChange={(estimatePoint) => handleData("estimate_point", estimatePoint)}
            projectId={projectId}
            buttonVariant="border-with-text"
            placeholder="Estimate"
            tabIndex={getIndex("estimate_point")}
          />
        </div>
      )}

      {/* add parent */}
      {isVisible && (
        <div className="h-7">
          {selectedParentIssue ? (
            <CustomMenu
              customButton={
                <button
                  type="button"
                  className="shadow-2xs flex h-7 cursor-pointer items-center justify-between gap-1.5 rounded-full border border-subtle/80 bg-surface-1 px-3 py-1 text-12 font-medium text-secondary transition-all hover:border-strong hover:bg-surface-2 hover:text-primary"
                >
                  <ParentPropertyIcon className="size-3.5 flex-shrink-0 text-tertiary" />
                  <span className="whitespace-nowrap">
                    {selectedParentIssue
                      ? `${selectedParentIssue.project__identifier}-${selectedParentIssue.sequence_id}`
                      : `Add parent`}
                  </span>
                </button>
              }
              placement="bottom-start"
              className="h-full w-full"
              customButtonClassName="h-full"
              tabIndex={getIndex("parent_id")}
            >
              <>
                <CustomMenu.MenuItem className="!p-1" onClick={() => setParentIssueModalOpen(true)}>
                  Change parent work item
                </CustomMenu.MenuItem>
                <CustomMenu.MenuItem
                  className="!p-1"
                  onClick={() => {
                    handleData("parent_id", "");
                    setSelectedParentIssue(undefined);
                  }}
                >
                  Remove parent work item
                </CustomMenu.MenuItem>
              </>
            </CustomMenu>
          ) : (
            <button
              type="button"
              className="shadow-2xs flex h-7 cursor-pointer items-center justify-between gap-1.5 rounded-full border border-subtle/80 bg-surface-1 px-3 py-1 text-12 font-medium text-secondary transition-all hover:border-strong hover:bg-surface-2 hover:text-primary"
              onClick={() => setParentIssueModalOpen(true)}
            >
              <ParentPropertyIcon className="size-3.5 flex-shrink-0 text-tertiary" />
              <span className="whitespace-nowrap">Add parent</span>
            </button>
          )}

          <ParentIssuesListModal
            isOpen={parentIssueModalOpen}
            handleClose={() => setParentIssueModalOpen(false)}
            onChange={(issue) => {
              handleData("parent_id", issue?.id);
              setSelectedParentIssue(issue);
            }}
            projectId={projectId}
            issueId={undefined}
          />
        </div>
      )}
    </div>
  );
});

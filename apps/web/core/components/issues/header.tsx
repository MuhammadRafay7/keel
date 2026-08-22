/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import React, { useState } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
// icons
import { Circle, UploadCloud } from "lucide-react";
// keel imports
import {
  EUserPermissions,
  EUserPermissionsLevel,
  SPACE_BASE_PATH,
  SPACE_BASE_URL,
  WORK_ITEM_TRACKER_ELEMENTS,
} from "@keel/constants";
import { useTranslation } from "@keel/i18n";
import { Button } from "@keel/propel/button";
import { NewTabIcon, WorkItemsIcon } from "@keel/propel/icons";
import { Tooltip } from "@keel/propel/tooltip";
import { EIssuesStoreType } from "@keel/types";
import { Breadcrumbs, Header } from "@keel/ui";
// components
import { BreadcrumbLink } from "@/components/common/breadcrumb-link";
import { CountChip } from "@/components/common/count-chip";
import { BulkImportModal } from "@/components/work-items/import";
// helpers
// hooks
import { useCommandPalette } from "@/hooks/store/use-command-palette";
import { useIssues } from "@/hooks/store/use-issues";
import { useProject } from "@/hooks/store/use-project";
import { useUserPermissions } from "@/hooks/store/user";
import { useAppRouter } from "@/hooks/use-app-router";
import { usePlatformOS } from "@/hooks/use-platform-os";
// keel web imports
import { CommonProjectBreadcrumbs } from "@/components/breadcrumbs/common";

export const IssuesHeader = observer(function IssuesHeader() {
  // router
  const router = useAppRouter();
  const { workspaceSlug, projectId } = useParams();
  // states
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  // store hooks
  const {
    issues: { getGroupIssueCount, fetchIssuesWithExistingPagination },
  } = useIssues(EIssuesStoreType.PROJECT);
  // i18n
  const { t } = useTranslation();

  const { currentProjectDetails, loader } = useProject();

  const { toggleCreateIssueModal } = useCommandPalette();
  const { allowPermissions } = useUserPermissions();
  const { isMobile } = usePlatformOS();

  const SPACE_APP_URL =
    (SPACE_BASE_URL.trim() === "" && typeof window !== "undefined" ? window.location.origin : SPACE_BASE_URL) +
    SPACE_BASE_PATH;
  const publishedURL = `${SPACE_APP_URL}/issues/${currentProjectDetails?.anchor}`;

  const issuesCount = getGroupIssueCount(undefined, undefined, false);
  const canUserCreateIssue = allowPermissions(
    [EUserPermissions.ADMIN, EUserPermissions.MEMBER],
    EUserPermissionsLevel.PROJECT
  );

  return (
    <>
      <Header>
        <Header.LeftItem>
          <div className="flex items-center gap-2.5">
            <Breadcrumbs onBack={() => router.back()} isLoading={loader === "init-loader"} className="flex-grow-0">
              <CommonProjectBreadcrumbs workspaceSlug={workspaceSlug?.toString()} projectId={projectId?.toString()} />
              <Breadcrumbs.Item
                component={
                  <BreadcrumbLink
                    label="Work Items"
                    href={`/${workspaceSlug}/projects/${projectId}/issues/`}
                    icon={<WorkItemsIcon className="h-4 w-4 text-tertiary" />}
                    isLast
                  />
                }
                isLast
              />
            </Breadcrumbs>
            {issuesCount && issuesCount > 0 ? (
              <Tooltip
                isMobile={isMobile}
                tooltipContent={`There are ${issuesCount} ${issuesCount > 1 ? "work items" : "work item"} in this project`}
                position="bottom"
              >
                <CountChip count={issuesCount} />
              </Tooltip>
            ) : null}
          </div>
          {currentProjectDetails?.anchor ? (
            <a
              href={publishedURL}
              className="group flex items-center gap-1.5 rounded-sm bg-accent-primary/10 px-2.5 py-1 text-11 font-medium text-accent-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Circle className="h-1.5 w-1.5 fill-accent-primary" strokeWidth={2} />
              {t("workspace_projects.network.public.title")}
              <NewTabIcon className="hidden h-3 w-3 group-hover:block" strokeWidth={2} />
            </a>
          ) : (
            <></>
          )}
        </Header.LeftItem>
        <Header.RightItem>
          {canUserCreateIssue && (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-1.5"
              >
                <UploadCloud className="size-4" />
                <span className="hidden sm:inline">Import</span>
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  toggleCreateIssueModal(true, EIssuesStoreType.PROJECT);
                }}
                data-ph-element={WORK_ITEM_TRACKER_ELEMENTS.HEADER_ADD_BUTTON.WORK_ITEMS}
              >
                <div className="block sm:hidden">{t("issue.label", { count: 1 })}</div>
                <div className="hidden sm:block">{t("issue.add.label")}</div>
              </Button>
            </div>
          )}
        </Header.RightItem>
      </Header>

      {isImportModalOpen && projectId && workspaceSlug && (
        <BulkImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          workspaceSlug={workspaceSlug.toString()}
          projectId={projectId.toString()}
          projectName={currentProjectDetails?.name}
          onSuccess={() => {
            fetchIssuesWithExistingPagination(workspaceSlug.toString(), projectId.toString(), "mutation");
          }}
        />
      )}
    </>
  );
});

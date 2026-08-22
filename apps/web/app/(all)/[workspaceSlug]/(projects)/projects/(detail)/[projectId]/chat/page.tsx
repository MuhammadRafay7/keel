/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
// keel imports
import { useTranslation } from "@keel/i18n";
// components
import { ProjectChatView } from "@/components/chat/chat-view";
import { PageHead } from "@/components/core/page-title";
// hooks
import { useProject } from "@/hooks/store/use-project";
import type { Route } from "./+types/page";

function ProjectChatPage({ params }: Route.ComponentProps) {
  const { projectId } = params;
  const { t } = useTranslation();
  const { getProjectById } = useProject();

  const project = getProjectById(projectId);
  const pageTitle = project?.name ? `${project.name} - ${t("sidebar.chat")}` : undefined;

  return (
    <>
      <PageHead title={pageTitle} />
      <div className="h-full w-full">
        <ProjectChatView />
      </div>
    </>
  );
}

export default observer(ProjectChatPage);

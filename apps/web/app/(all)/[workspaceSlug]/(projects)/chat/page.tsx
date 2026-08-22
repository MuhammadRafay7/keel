/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { PageHead } from "@/components/core/page-title";
import { WorkspaceChatView } from "@/components/chat/chat-view";
import type { Route } from "./+types/page";

function WorkspaceChatPage({ params }: Route.ComponentProps) {
  const { workspaceSlug } = params;
  const pageTitle = "Workspace Chat";

  return (
    <>
      <PageHead title={pageTitle} />
      <div className="relative h-full w-full overflow-hidden">
        <WorkspaceChatView workspaceSlug={workspaceSlug} />
      </div>
    </>
  );
}

export default WorkspaceChatPage;

/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { Outlet } from "react-router";
import { AppHeader } from "@/components/core/app-header";
import { ContentWrapper } from "@/components/core/content-wrapper";
import { CommentFillIcon } from "@keel/propel/icons";

function WorkspaceChatHeader() {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <CommentFillIcon className="size-4 text-accent-primary" />
      <span className="text-14 font-semibold text-primary">Workspace Chat</span>
    </div>
  );
}

export default function WorkspaceChatLayout() {
  return (
    <ContentWrapper className="h-full w-full overflow-hidden p-0">
      <Outlet />
    </ContentWrapper>
  );
}

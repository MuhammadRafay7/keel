/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { MessageSquare } from "lucide-react";
import {
  ListLayoutIcon,
  BoardLayoutIcon,
  CalendarLayoutIcon,
  SheetLayoutIcon,
  TimelineLayoutIcon,
} from "@keel/propel/icons";
import type { ISvgIcons } from "@keel/propel/icons";
import { EIssueLayoutTypes } from "@keel/types";

export function IssueLayoutIcon({
  layout,
  size,
  ...props
}: { layout: EIssueLayoutTypes; size?: number } & Omit<ISvgIcons, "width" | "height">) {
  const iconProps = {
    ...props,
    ...(size && { width: size, height: size }),
  };

  switch (layout) {
    case EIssueLayoutTypes.LIST:
      return <ListLayoutIcon {...iconProps} />;
    case EIssueLayoutTypes.KANBAN:
      return <BoardLayoutIcon {...iconProps} />;
    case EIssueLayoutTypes.CALENDAR:
      return <CalendarLayoutIcon {...iconProps} />;
    case EIssueLayoutTypes.SPREADSHEET:
      return <SheetLayoutIcon {...iconProps} />;
    case EIssueLayoutTypes.GANTT:
      return <TimelineLayoutIcon {...iconProps} />;
    case EIssueLayoutTypes.CHAT:
      return <MessageSquare {...iconProps} className={props.className || "size-3.5"} />;
    default:
      return null;
  }
}

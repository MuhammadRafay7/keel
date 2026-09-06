/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { LayoutDashboard, Users, Layers, ShieldCheck, Settings, FileText, Image, BrainCog, Mail } from "lucide-react";
// types
import type { TSidebarMenuItem } from "./types";

export type TCoreSidebarMenuKey =
  | "general"
  | "users"
  | "workspace"
  | "auditLogs"
  | "settings"
  | "authentication"
  | "email"
  | "ai"
  | "image";

export const coreSidebarMenuLinks: Record<TCoreSidebarMenuKey, TSidebarMenuItem> = {
  general: {
    Icon: LayoutDashboard,
    name: "Overview",
    description: "Platform statistics, health, and activity.",
    href: `/general/`,
  },
  users: {
    Icon: Users,
    name: "Users",
    description: "Manage accounts, roles, and memberships.",
    href: `/users/`,
  },
  workspace: {
    Icon: Layers,
    name: "Workspaces",
    description: "Manage workspaces, members, and ownership.",
    href: `/workspace/`,
  },
  auditLogs: {
    Icon: FileText,
    name: "Audit Logs",
    description: "Security and administrative audit trail.",
    href: `/audit-logs/`,
  },
  settings: {
    Icon: Settings,
    name: "Platform Settings",
    description: "Global registration gates and policies.",
    href: `/settings/`,
  },
  authentication: {
    Icon: ShieldCheck,
    name: "Authentication",
    description: "Configure authentication modes.",
    href: `/authentication/`,
  },
  email: {
    Icon: Mail,
    name: "Email",
    description: "Configure SMTP controls.",
    href: `/email/`,
  },
  ai: {
    Icon: BrainCog,
    name: "Artificial Intelligence",
    description: "Configure AI credentials and usage.",
    href: `/ai/`,
  },
  image: {
    Icon: Image,
    name: "Images",
    description: "Configure third-party image integrations.",
    href: `/image/`,
  },
};

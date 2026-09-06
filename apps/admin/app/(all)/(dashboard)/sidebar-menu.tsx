/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Users,
  Building2,
  PlusCircle,
  FileText,
  Sliders,
  Mail,
  KeyRound,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Tooltip } from "@keel/propel/tooltip";
import { cn } from "@keel/utils";
import { useTheme, useAdmin } from "@/hooks/store";

interface INavSection {
  title: string;
  items: {
    name: string;
    href: string;
    icon: any;
  }[];
}

export const AdminSidebarMenu = observer(function AdminSidebarMenu() {
  const pathName = usePathname();
  const { isSidebarCollapsed, toggleSidebar } = useTheme();

  const handleItemClick = () => {
    if (window.innerWidth < 768) {
      toggleSidebar(!isSidebarCollapsed);
    }
  };

  const navSections: INavSection[] = [
    {
      title: "Core Platform",
      items: [
        {
          name: "Overview",
          href: "/general",
          icon: Activity,
        },
        {
          name: "User Directory",
          href: "/users",
          icon: Users,
        },
      ],
    },
    {
      title: "Tenant Governance",
      items: [
        {
          name: "Workspaces",
          href: "/workspace",
          icon: Building2,
        },
        {
          name: "Create Workspace",
          href: "/workspace/create",
          icon: PlusCircle,
        },
      ],
    },
    {
      title: "Security & Governance",
      items: [
        {
          name: "Audit & Security Logs",
          href: "/audit-logs",
          icon: FileText,
        },
        {
          name: "Platform Settings",
          href: "/settings",
          icon: Sliders,
        },
      ],
    },
    {
      title: "Infrastructure",
      items: [
        {
          name: "Email Services",
          href: "/email",
          icon: Mail,
        },
        {
          name: "Authentication & SSO",
          href: "/authentication",
          icon: KeyRound,
        },
        {
          name: "AI & Intelligence",
          href: "/ai",
          icon: Sparkles,
        },
      ],
    },
  ];

  return (
    <nav className="scrollbar-thin flex-1 space-y-6 overflow-y-auto px-3 py-4">
      {navSections.map((section) => (
        <div key={section.title} className="space-y-1">
          {!isSidebarCollapsed && (
            <p className="tracking-wider mb-2 px-3 text-10 font-bold text-secondary uppercase select-none">
              {section.title}
            </p>
          )}

          <div className="space-y-1">
            {section.items.map((item) => {
              const Icon = item.icon;
              // Exact match or subpath match for multi-page sections
              const isExact = pathName === item.href;
              const isPrefix = item.href !== "/general" && pathName?.startsWith(item.href);
              const isActive = isExact || isPrefix;

              return (
                <Link key={item.href} href={item.href} onClick={handleItemClick}>
                  <Tooltip tooltipContent={item.name} position="right" className="ml-2" disabled={!isSidebarCollapsed}>
                    <div
                      className={cn(
                        "group relative flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-12 font-semibold transition-all duration-150 outline-none",
                        {
                          "bg-blue-600/10 text-blue-600 dark:text-blue-400 border-blue-500/20 shadow-glow-sm border":
                            isActive,
                          "border border-transparent text-secondary hover:bg-layer-2 hover:text-primary": !isActive,
                          "justify-center px-2": isSidebarCollapsed,
                        }
                      )}
                    >
                      {isActive && (
                        <span className="bg-blue-600 absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-r-full shadow-[0_0_10px_rgba(37,99,235,0.7)]" />
                      )}

                      <Icon
                        className={cn("size-4 flex-shrink-0 transition-colors", {
                          "text-blue-600 dark:text-blue-400": isActive,
                          "text-secondary group-hover:text-primary": !isActive,
                        })}
                      />

                      {!isSidebarCollapsed && (
                        <div className="flex min-w-0 flex-1 items-center justify-between">
                          <span className="truncate">{item.name}</span>
                        </div>
                      )}
                    </div>
                  </Tooltip>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
});

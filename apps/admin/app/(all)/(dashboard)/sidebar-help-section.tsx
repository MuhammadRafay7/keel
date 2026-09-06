/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState, useRef } from "react";
import { observer } from "mobx-react";
import Link from "next/link";
import { HelpCircle, MessageSquare, MoveLeft } from "lucide-react";
import { Transition } from "@headlessui/react";
import { WEB_BASE_URL } from "@keel/constants";
// keel internal packages
import { GithubIcon, NewTabIcon, PageIcon } from "@keel/propel/icons";
import { Tooltip } from "@keel/propel/tooltip";
import { cn } from "@keel/utils";
// hooks
import { useInstance, useTheme } from "@/hooks/store";
// assets

const helpOptions = [
  {
    name: "Documentation",
    href: "https://keel.ostenmark.com/docs",
    Icon: PageIcon,
  },
  {
    name: "Join our Forum",
    href: "https://github.com/MuhammadRafay7/keel/discussions",
    Icon: MessageSquare,
  },
  {
    name: "Report a bug",
    href: "https://github.com/MuhammadRafay7/keel",
    Icon: GithubIcon,
  },
];

export const AdminSidebarHelpSection = observer(function AdminSidebarHelpSection() {
  // states
  const [isNeedHelpOpen, setIsNeedHelpOpen] = useState(false);
  // store
  const { instance } = useInstance();
  const { isSidebarCollapsed, toggleSidebar } = useTheme();
  // refs
  const helpOptionsRef = useRef<HTMLDivElement | null>(null);

  const redirectionLink = encodeURI(WEB_BASE_URL + "/");

  return (
    <div
      className={cn(
        "flex h-14 w-full flex-shrink-0 items-center justify-between gap-1 self-baseline border-t border-subtle bg-surface-1 px-4",
        {
          "h-auto flex-col py-1.5": isSidebarCollapsed,
        }
      )}
    >
      <div className={`flex items-center gap-1.5 ${isSidebarCollapsed ? "flex-col justify-center" : "w-full"}`}>
        <Tooltip tooltipContent="Redirect to Keel" position="right" className="ml-4" disabled={!isSidebarCollapsed}>
          <a
            href={redirectionLink}
            className="hover:border-blue-400/50 shadow-soft relative flex items-center gap-1.5 rounded-full border border-subtle bg-layer-1 px-3 py-1 text-12 font-medium whitespace-nowrap text-secondary transition-all hover:text-primary"
          >
            <NewTabIcon width={13} height={13} />
            {!isSidebarCollapsed && "Open Keel"}
          </a>
        </Tooltip>
        <Tooltip tooltipContent="Help" position={isSidebarCollapsed ? "right" : "top"} className="ml-4">
          <button
            type="button"
            aria-label="Help"
            className={`ml-auto grid place-items-center rounded-full p-1.5 text-secondary transition-colors outline-none hover:bg-layer-2 hover:text-primary ${
              isSidebarCollapsed ? "w-full" : ""
            }`}
            onClick={() => setIsNeedHelpOpen((prev) => !prev)}
          >
            <HelpCircle className="size-4" />
          </button>
        </Tooltip>
        <Tooltip tooltipContent="Toggle sidebar" position={isSidebarCollapsed ? "right" : "top"} className="ml-4">
          <button
            type="button"
            aria-label="Toggle sidebar"
            className={`grid place-items-center rounded-full p-1.5 text-secondary transition-colors outline-none hover:bg-layer-2 hover:text-primary ${
              isSidebarCollapsed ? "w-full" : ""
            }`}
            onClick={() => toggleSidebar(!isSidebarCollapsed)}
          >
            <MoveLeft className={`size-4 duration-300 ${isSidebarCollapsed ? "rotate-180" : ""}`} />
          </button>
        </Tooltip>
      </div>

      <div className="relative">
        <Transition
          show={isNeedHelpOpen}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <div
            className={`absolute bottom-3 z-[15] min-w-[11rem] ${
              isSidebarCollapsed ? "left-full ml-2" : "-left-[75px]"
            } shadow-float divide-y divide-subtle rounded-2xl border border-subtle bg-surface-1 p-1.5 whitespace-nowrap`}
            ref={helpOptionsRef}
          >
            <div className="space-y-0.5 pb-1.5">
              {helpOptions.map(({ name, Icon, href }) => {
                if (href)
                  return (
                    <Link href={href} key={name} target="_blank">
                      <div className="flex items-center gap-x-2 rounded-xl px-2.5 py-1.5 text-11 font-medium text-secondary transition-colors hover:bg-layer-2 hover:text-primary">
                        <div className="grid flex-shrink-0 place-items-center">
                          <Icon className="text-blue-600 dark:text-blue-400 h-3.5 w-3.5" />
                        </div>
                        <span className="text-11">{name}</span>
                      </div>
                    </Link>
                  );
                else
                  return (
                    <button
                      key={name}
                      type="button"
                      className="flex w-full items-center gap-x-2 rounded-xl px-2.5 py-1.5 text-11 font-medium text-secondary transition-colors hover:bg-layer-2 hover:text-primary"
                    >
                      <div className="grid flex-shrink-0 place-items-center">
                        <Icon className="text-blue-600 dark:text-blue-400 h-3.5 w-3.5" />
                      </div>
                      <span className="text-11">{name}</span>
                    </button>
                  );
              })}
            </div>
            <div className="font-mono px-2.5 pt-2 pb-1 text-10 text-tertiary">
              Version: v{instance?.current_version}
            </div>
          </div>
        </Transition>
      </div>
    </div>
  );
});

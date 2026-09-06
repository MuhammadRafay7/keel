/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState, useRef, useEffect } from "react";
import { observer } from "mobx-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Menu as MenuIcon,
  Search,
  ExternalLink,
  Shield,
  LogOut,
  ChevronDown,
  Activity,
  Layers,
  FileText,
  Settings as SettingsIcon,
} from "lucide-react";
import { Menu, Transition } from "@headlessui/react";
import { WEB_BASE_URL } from "@keel/constants";
import { Breadcrumbs } from "@keel/ui";
import { useTheme, useUser, useAdmin } from "@/hooks/store";
import { BreadcrumbLink } from "../breadcrumb-link";
import { CORE_HEADER_SEGMENT_LABELS } from "./core";
import { EXTENDED_HEADER_SEGMENT_LABELS } from "./extended";

export const HamburgerToggle = observer(function HamburgerToggle() {
  const { isSidebarCollapsed, toggleSidebar } = useTheme();
  return (
    <button
      type="button"
      aria-label="Toggle sidebar"
      className="flex size-9 cursor-pointer items-center justify-center rounded-xl border border-subtle bg-layer-1 text-secondary transition-all hover:border-subtle-1 hover:bg-layer-2 hover:text-primary"
      onClick={() => toggleSidebar(!isSidebarCollapsed)}
    >
      <MenuIcon size={16} />
    </button>
  );
});

const HEADER_SEGMENT_LABELS: Record<string, string> = {
  ...CORE_HEADER_SEGMENT_LABELS,
  ...EXTENDED_HEADER_SEGMENT_LABELS,
};

const generateBreadcrumbItems = (pathname: string) => {
  const pathSegments = pathname.split("/").filter(Boolean);
  let currentUrl = "";
  return pathSegments.map((segment) => {
    currentUrl += "/" + segment;
    return {
      title: HEADER_SEGMENT_LABELS[segment] ?? segment.toUpperCase(),
      href: currentUrl,
    };
  });
};

export const AdminHeader = observer(function AdminHeader() {
  const pathName = usePathname();
  const router = useRouter();
  const { currentUser, signOut } = useUser();
  const { stats } = useAdmin();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const breadcrumbItems = generateBreadcrumbItems(pathName || "");

  // Quick navigation shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSignOut = () => {
    signOut();
    router.replace("/");
  };

  const navResults = [
    { title: "Platform Overview", href: "/general", icon: Activity },
    { title: "User Management", href: "/users", icon: Shield },
    { title: "Workspace Governance", href: "/workspace", icon: Layers },
    { title: "Security & Audit Logs", href: "/audit-logs", icon: FileText },
    { title: "Platform Settings", href: "/settings", icon: SettingsIcon },
  ].filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const userInitial = (currentUser?.display_name || currentUser?.email || "A").charAt(0).toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full flex-shrink-0 items-center justify-between border-b border-subtle bg-surface-1/80 px-4 backdrop-blur-md sm:px-6">
        {/* Left: Hamburger & Breadcrumbs */}
        <div className="flex min-w-0 items-center gap-3">
          <HamburgerToggle />

          <div className="hidden items-center gap-2 sm:flex">
            <Breadcrumbs>
              <Breadcrumbs.Item
                component={
                  <BreadcrumbLink
                    href="/general"
                    label="Keel Admin"
                    icon={<Shield className="text-blue-600 h-3.5 w-3.5" />}
                  />
                }
              />
              {breadcrumbItems.map((item) => (
                <Breadcrumbs.Item key={item.href} component={<BreadcrumbLink href={item.href} label={item.title} />} />
              ))}
            </Breadcrumbs>
          </div>
        </div>

        {/* Right: Actions & User Dropdown */}
        <div className="flex items-center gap-2.5">
          {/* Quick Search Trigger */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="hover:border-blue-400 shadow-soft flex items-center gap-2 rounded-full border border-subtle bg-layer-1 px-3.5 py-1.5 text-12 text-secondary transition-all hover:-translate-y-0.5 hover:text-primary"
            title="Quick navigation (Ctrl+K)"
          >
            <Search className="h-3.5 w-3.5 text-secondary" />
            <span className="hidden font-medium sm:inline">Search platform...</span>
            <kbd className="font-mono hidden rounded-full border border-subtle bg-surface-2 px-2 py-0.5 text-10 text-secondary sm:inline-block">
              ⌘K
            </kbd>
          </button>

          {/* Web App Link */}
          <a
            href={WEB_BASE_URL}
            target="_blank"
            rel="noreferrer"
            className="hover:border-blue-400 hover:text-blue-600 shadow-soft hidden items-center gap-1.5 rounded-full border border-subtle bg-layer-1 px-3.5 py-1.5 text-12 font-semibold text-secondary transition-all hover:-translate-y-0.5 sm:flex"
            title="Open workspace application"
          >
            <span>Open App</span>
            <ExternalLink className="h-3 w-3 text-secondary" />
          </a>

          {/* Superadmin User Dropdown */}
          <Menu as="div" className="relative">
            <Menu.Button className="hover:border-blue-400 shadow-soft flex items-center gap-2 rounded-full border border-subtle bg-layer-1 p-1 transition-all hover:-translate-y-0.5 focus:outline-none sm:pr-3">
              <div className="bg-blue-600 shadow-glow-sm flex size-7 items-center justify-center rounded-full text-11 font-semibold text-white">
                {userInitial}
              </div>
              <div className="hidden text-left sm:block">
                <p className="line-clamp-1 max-w-[120px] text-12 leading-none font-semibold text-primary">
                  {currentUser?.display_name || currentUser?.email?.split("@")[0] || "Admin"}
                </p>
                <span className="text-blue-600 dark:text-blue-400 tracking-wider text-10 font-semibold uppercase">
                  Superadmin
                </span>
              </div>
              <ChevronDown className="hidden h-3.5 w-3.5 text-secondary sm:block" />
            </Menu.Button>

            <Transition
              enter="transition duration-100 ease-out"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-75 ease-out"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0"
            >
              <Menu.Items className="absolute right-0 z-50 mt-2 w-64 origin-top-right divide-y divide-subtle rounded-2xl border border-subtle bg-surface-1 p-1.5 shadow-raised-200 backdrop-blur-xl focus:outline-none">
                <div className="px-3 py-2.5">
                  <p className="text-11 text-secondary">Signed in as Superadmin</p>
                  <p className="truncate text-13 font-semibold text-primary">{currentUser?.email || "admin@keel.so"}</p>
                  <div className="bg-purple-500/10 text-purple-600 dark:text-purple-400 mt-1.5 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-10 font-medium">
                    <Shield className="h-3 w-3" />
                    Full Platform Access
                  </div>
                </div>

                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href="/general"
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-12 font-medium ${
                          active ? "bg-layer-2 text-primary" : "text-secondary"
                        }`}
                      >
                        <Activity className="h-4 w-4 text-secondary" />
                        Platform Overview
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href="/audit-logs"
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-12 font-medium ${
                          active ? "bg-layer-2 text-primary" : "text-secondary"
                        }`}
                      >
                        <FileText className="h-4 w-4 text-secondary" />
                        Audit Trail
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href="/settings"
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-12 font-medium ${
                          active ? "bg-layer-2 text-primary" : "text-secondary"
                        }`}
                      >
                        <SettingsIcon className="h-4 w-4 text-secondary" />
                        Platform Settings
                      </Link>
                    )}
                  </Menu.Item>
                </div>

                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className={`text-red-400 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-12 ${
                          active ? "bg-red-500/10 text-red-300" : ""
                        }`}
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </header>

      {/* Quick Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-20 backdrop-blur-sm">
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-subtle bg-surface-1 shadow-raised-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-subtle px-4 py-3.5">
              <Search className="h-4 w-4 text-tertiary" />
              <input
                autoFocus
                type="text"
                placeholder="Jump to page or command..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-14 text-primary placeholder:text-tertiary focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="rounded border border-subtle bg-layer-1 px-1.5 py-0.5 text-11 text-tertiary hover:text-primary"
              >
                ESC
              </button>
            </div>

            <div className="max-h-72 space-y-1 overflow-y-auto p-2">
              {navResults.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSearchOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-secondary transition-colors hover:bg-layer-2 hover:text-primary"
                  >
                    <div className="rounded-lg border border-subtle bg-layer-1 p-1.5">
                      <Icon className="text-purple-400 h-4 w-4" />
                    </div>
                    <span className="text-13 font-medium">{item.title}</span>
                  </Link>
                );
              })}
              {navResults.length === 0 && (
                <p className="p-4 text-center text-12 text-tertiary">No matching console tools found.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
});

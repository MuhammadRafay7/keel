/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
import { useTheme as useNextTheme } from "next-themes";
import Link from "next/link";
import { Sun, Moon, Send, Sparkles } from "lucide-react";
import { useTheme } from "@/hooks/store";

export const AdminSidebarDropdown = observer(function AdminSidebarDropdown() {
  const { isSidebarCollapsed } = useTheme();
  const { resolvedTheme, setTheme } = useNextTheme();

  const handleThemeSwitch = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <div className="flex h-16 items-center justify-between border-b border-subtle px-4">
      {isSidebarCollapsed ? (
        <div className="flex w-full items-center justify-center">
          <Link
            href="/general"
            className="bg-blue-600 shadow-glow hover:bg-blue-700 flex size-9 items-center justify-center rounded-2xl font-bold text-white transition-all hover:scale-105"
          >
            <Send className="h-4 w-4 -rotate-12 fill-current" />
          </Link>
        </div>
      ) : (
        <div className="flex w-full items-center justify-between">
          <Link href="/general" className="group flex items-center gap-3">
            <div className="bg-blue-600 shadow-glow group-hover:bg-blue-700 flex size-9 items-center justify-center rounded-2xl font-bold text-white transition-all group-hover:scale-105">
              <Send className="h-4 w-4 -rotate-12 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading text-15 font-bold tracking-tight text-primary">KEEL</span>
                <span className="bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400 tracking-wider rounded-full border px-2 py-0.5 text-9 font-semibold uppercase">
                  Admin
                </span>
              </div>
              <p className="font-mono mt-0.5 text-10 leading-none text-tertiary">Platform Console</p>
            </div>
          </Link>

          {/* Theme switcher */}
          <button
            type="button"
            onClick={handleThemeSwitch}
            aria-label="Toggle theme"
            className="hover:border-blue-400 flex size-8 items-center justify-center rounded-full border border-subtle bg-layer-1 text-secondary transition-all hover:-translate-y-0.5 hover:bg-layer-2 hover:text-primary"
            title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
          >
            {resolvedTheme === "dark" ? (
              <Sun className="text-amber-400 h-3.5 w-3.5" />
            ) : (
              <Moon className="text-blue-600 h-3.5 w-3.5" />
            )}
          </button>
        </div>
      )}
    </div>
  );
});

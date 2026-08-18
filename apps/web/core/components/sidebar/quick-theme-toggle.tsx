/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { useUserProfile } from "@/hooks/store/user";

export const QuickThemeToggle = observer(function QuickThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { updateUserTheme } = useUserProfile();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeSwitch = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    void updateUserTheme({ theme: newTheme });
  };

  const options = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ] as const;

  return (
    <div className="flex items-center rounded-lg border border-subtle bg-surface-2 p-0.5 text-tertiary">
      {options.map(({ value, icon: Icon, label }) => {
        const isActive = mounted && theme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => handleThemeSwitch(value)}
            title={`Switch to ${label} theme`}
            className={`flex flex-1 items-center justify-center gap-1 rounded-md px-1.5 py-1 text-11 font-medium transition-all duration-150 ${
              isActive
                ? "shadow-xs bg-surface-1 font-semibold text-accent-primary"
                : "hover:bg-surface-1/50 hover:text-primary"
            }`}
          >
            <Icon className="size-3.5 flex-shrink-0" />
            <span className="capitalize">{label}</span>
          </button>
        );
      })}
    </div>
  );
});

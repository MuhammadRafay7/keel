/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { cn } from "@keel/utils";

type TSidebarNavItem = {
  className?: string;
  isActive?: boolean;
  children?: React.ReactNode;
};

/**
 * One row in the left sidebar, and the element the shell repeats more than any
 * other.
 *
 * The active state is carried by three signals at once — an accent wash, accent
 * text, and a short rail against the leading edge — because any one of them
 * alone is easy to miss in a list of a dozen rows scanned peripherally. The rail
 * is what the eye actually finds: it is the only mark that breaks the left
 * margin, so it reads as "you are here" without the row needing to shout.
 *
 * Hover deliberately stops short of the active treatment. A hover that looks
 * like selection makes a user doubt where they are.
 */
export function SidebarNavItem(props: TSidebarNavItem) {
  const { className, isActive, children } = props;
  return (
    <div
      data-active={isActive ? "true" : undefined}
      className={cn(
        "group relative flex w-full cursor-pointer items-center justify-between gap-1.5",
        "focus-ring rounded-lg px-2.5 py-1.5 transition-smooth outline-none",
        // The leading rail. Painted on the row itself rather than a wrapper so
        // it lines up with the row's own vertical padding at every text size.
        "before:absolute before:top-1/2 before:left-0 before:h-4 before:w-[3px] before:-translate-x-1.5",
        "before:-translate-y-1/2 before:rounded-full before:bg-accent-primary before:transition-smooth",
        {
          "bg-accent-subtle text-accent-primary before:scale-y-100 before:opacity-100": isActive,
          "before:scale-y-0 before:opacity-0": !isActive,
          "text-secondary hover:bg-layer-transparent-hover hover:text-primary active:bg-layer-transparent-active":
            !isActive,
        },
        className
      )}
    >
      {children}
    </div>
  );
}

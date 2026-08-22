/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { SearchIcon } from "@keel/propel/icons";
import { cn } from "@keel/utils";

type Props = {
  isActive?: boolean;
};

export function SidebarSearchButton(props: Props) {
  const { isActive } = props;
  return (
    <div
      className={cn(
        "grid aspect-square size-8 flex-shrink-0 place-items-center rounded-lg border border-subtle",
        "focus-ring shadow-raised-100 transition-smooth outline-none hover:border-strong hover:bg-layer-1-hover",
        {
          "border-accent-subtle bg-accent-subtle hover:bg-accent-subtle-hover": isActive,
        }
      )}
    >
      <SearchIcon
        className={cn("size-4 text-tertiary", {
          "text-accent-secondary": isActive,
        })}
      />
    </div>
  );
}

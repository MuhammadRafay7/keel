/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { IGroupHeaderProps } from "@keel/types";

export function GroupHeader({ group, itemCount, onToggleGroup }: IGroupHeaderProps) {
  return (
    <button
      type="button"
      onClick={() => onToggleGroup(group.id)}
      className="flex w-full items-center justify-between gap-2 rounded-xl px-1.5 py-1 text-13 font-semibold tracking-wide uppercase transition-colors duration-150 hover:bg-surface-2"
    >
      <div className="flex items-center gap-2">
        {group.icon}
        <span className="text-12 font-bold text-primary">{group.name}</span>
        <span className="shadow-2xs flex h-5 min-w-5 items-center justify-center rounded-full bg-layer-2 px-1.5 text-11 font-semibold text-secondary">
          {itemCount}
        </span>
      </div>
    </button>
  );
}

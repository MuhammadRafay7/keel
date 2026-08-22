/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import React from "react";
import { Command } from "cmdk";
import { X } from "@keel/propel/icons";
import { useTranslation } from "@keel/i18n";
// keel imports
import { SearchIcon } from "@keel/propel/icons";
// local imports
import type { TPowerKContext, TPowerKPageType } from "../../core/types";
import { POWER_K_MODAL_PAGE_DETAILS } from "./constants";
import { PowerKModalContextIndicator } from "./context-indicator";

type Props = {
  activePage: TPowerKPageType | null;
  context: TPowerKContext;
  onSearchChange: (value: string) => void;
  searchTerm: string;
};

export function PowerKModalHeader(props: Props) {
  const { context, searchTerm, onSearchChange, activePage } = props;
  // translation
  const { t } = useTranslation();
  // derived values
  const placeholder = activePage
    ? t(POWER_K_MODAL_PAGE_DETAILS[activePage].i18n_placeholder)
    : t("power_k.page_placeholders.default");

  return (
    <div className="border-b border-subtle">
      {/* Context Indicator */}
      {context.shouldShowContextBasedActions && !activePage && (
        <PowerKModalContextIndicator
          activeContext={context.activeContext}
          handleClearContext={() => context.setShouldShowContextBasedActions(false)}
        />
      )}

      {/* Search Input */}
      {/* The search row is the palette's headline: it sets at 15px rather than
          13px so the thing being typed is the largest text on the surface. */}
      <div className="flex items-center gap-2.5 px-4 py-3.5">
        <SearchIcon className="size-[18px] shrink-0 text-tertiary" />
        <Command.Input
          value={searchTerm}
          onValueChange={onSearchChange}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-15 text-primary placeholder-(--text-color-placeholder) outline-none"
          autoFocus
        />
        {searchTerm && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => onSearchChange("")}
            className="flex-shrink-0 focus-ring rounded-md p-1 text-tertiary transition-smooth hover:bg-layer-1 hover:text-primary"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

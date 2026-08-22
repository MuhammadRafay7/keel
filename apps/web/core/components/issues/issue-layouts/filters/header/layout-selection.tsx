/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// keel imports
import { ISSUE_LAYOUTS } from "@keel/constants";
import { useTranslation } from "@keel/i18n";
import type { EIssueLayoutTypes } from "@keel/types";
import { cn } from "@keel/utils";
// components
import { IssueLayoutIcon } from "@/components/issues/issue-layouts/layout-icon";

type Props = {
  layouts: EIssueLayoutTypes[];
  onChange: (layout: EIssueLayoutTypes) => void;
  selectedLayout: EIssueLayoutTypes | undefined;
};

export function LayoutSelection(props: Props) {
  const { layouts, onChange, selectedLayout } = props;
  const { t } = useTranslation();
  const handleOnChange = (layoutKey: EIssueLayoutTypes) => {
    if (selectedLayout !== layoutKey) {
      onChange(layoutKey);
    }
  };

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-subtle bg-surface-2/80 p-1 text-12 font-medium shadow-raised-100 backdrop-blur-md">
      {ISSUE_LAYOUTS.filter((l) => layouts.includes(l.key)).map((layout) => {
        const isSelected = selectedLayout === layout.key;
        return (
          <button
            key={layout.key}
            type="button"
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1 whitespace-nowrap transition-all duration-150",
              isSelected
                ? "border border-subtle bg-surface-1 font-semibold text-accent-primary shadow-raised-100"
                : "text-secondary hover:bg-surface-1/60 hover:text-primary"
            )}
            onClick={() => handleOnChange(layout.key)}
          >
            <IssueLayoutIcon
              layout={layout.key}
              size={14}
              strokeWidth={2}
              className={cn("size-3.5 flex-shrink-0", isSelected ? "text-accent-primary" : "text-tertiary")}
            />
            <span className="capitalize">{t(layout.i18n_title)}</span>
          </button>
        );
      })}
    </div>
  );
}

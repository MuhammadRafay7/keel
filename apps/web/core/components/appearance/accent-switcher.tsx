/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
import { Check } from "lucide-react";
import { cn } from "@keel/utils";
// hooks
import { ACCENTS, useAccent, type TAccent } from "@/hooks/use-accent";

/**
 * The accent picker.
 *
 * Each swatch is painted with the same `--brand-default` the theme would apply,
 * by scoping a `data-accent` attribute to the swatch itself. So the swatches are
 * not an approximation of the themes maintained alongside them — they are the
 * themes, and they cannot drift from what selecting one actually does.
 */
export const AccentSwitcher = observer(function AccentSwitcher() {
  const { accent, setAccent } = useAccent();

  return (
    <div className="flex flex-col gap-2 border-b border-subtle py-4 last:border-b-0">
      <div className="flex flex-col gap-0.5">
        <h4 className="text-body-sm-medium text-primary">Accent colour</h4>
        <p className="text-caption-md-regular text-secondary">
          Sets the highlight colour across buttons, links and selected rows. Independent of light and dark.
        </p>
      </div>

      <div role="radiogroup" aria-label="Accent colour" className="mt-1 flex flex-wrap items-center gap-2.5">
        {ACCENTS.map(({ key, label }) => {
          const isActive = accent === key;
          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={isActive}
              aria-label={label}
              title={label}
              onClick={() => setAccent(key as TAccent)}
              data-accent={key}
              className={cn(
                "grid size-7 place-items-center focus-ring rounded-full transition-smooth",
                // Reads `--brand-default` directly rather than going through
                // `bg-accent-primary`. The semantic token is declared once on
                // `:root` as `var(--brand-default)`, so its value is substituted
                // there and inherits down already resolved — the swatch's own
                // ramp override would never reach it. Pointing at the ramp makes
                // the substitution happen on the swatch, where the override is.
                "bg-[var(--brand-default)] text-on-color",
                // The ring sits outside the swatch so it never eats into the
                // colour the swatch exists to show.
                isActive ? "ring-offset-surface-1 ring-2 ring-accent-strong ring-offset-2" : "hover:scale-110"
              )}
            >
              {isActive && <Check className="size-3.5" strokeWidth={3} />}
            </button>
          );
        })}
      </div>
    </div>
  );
});

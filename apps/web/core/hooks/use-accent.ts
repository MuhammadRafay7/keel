/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useCallback, useEffect, useState } from "react";

/**
 * The accent colour, which is independent of light/dark.
 *
 * The two are separate axes on purpose: someone who wants a violet product does
 * not thereby want a light one. Light/dark stays with `next-themes` and syncs to
 * the user's profile; the accent is a `data-accent` attribute on <html> that
 * re-points the `--brand-*` ramp the whole design system resolves through.
 *
 * It is stored per browser rather than on the profile because there is no column
 * for it yet — the same limitation as the AI model preference. Swapping the two
 * `readAccent`/`persistAccent` bodies for a profile field is the only change
 * needed if that column is added.
 */
export const ACCENTS = [
  { key: "violet", label: "Violet" },
  { key: "azure", label: "Azure" },
  { key: "indigo", label: "Indigo" },
  { key: "emerald", label: "Emerald" },
  { key: "teal", label: "Teal" },
  { key: "amber", label: "Amber" },
  { key: "rose", label: "Rose" },
  { key: "pink", label: "Pink" },
] as const;

export type TAccent = (typeof ACCENTS)[number]["key"];

export const DEFAULT_ACCENT: TAccent = "violet";

const STORAGE_KEY = "keel.accent";

const isAccent = (value: string | null): value is TAccent => !!value && ACCENTS.some((accent) => accent.key === value);

export function readAccent(): TAccent {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isAccent(stored) ? stored : DEFAULT_ACCENT;
  } catch {
    // Storage throws outright in some privacy modes rather than returning null.
    return DEFAULT_ACCENT;
  }
}

export function applyAccent(accent: TAccent) {
  document.documentElement.dataset.accent = accent;
}

export function useAccent() {
  const [accent, setAccentState] = useState<TAccent>(DEFAULT_ACCENT);

  useEffect(() => {
    const stored = readAccent();
    setAccentState(stored);
    applyAccent(stored);
  }, []);

  const setAccent = useCallback((next: TAccent) => {
    setAccentState(next);
    applyAccent(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // A colour preference is not worth failing a render over.
    }
  }, []);

  return { accent, setAccent };
}

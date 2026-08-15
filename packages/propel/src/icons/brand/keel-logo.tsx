/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import * as React from "react";

import type { ISvgIcons } from "../type";

/**
 * Keel mark — a keel line carrying three ribs.
 * Reads as a ship's frame and as bars on a roadmap.
 * Stroked in `currentColor` so it inherits theme color; no light/dark variants needed.
 */
export function KeelLogo({ width = "40", height = "40", className, color = "currentColor" }: ISvgIcons) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M14 7V41" stroke={color} strokeWidth="5.5" strokeLinecap="round" />
      <path d="M14 15H33" stroke={color} strokeWidth="5.5" strokeLinecap="round" />
      <path d="M14 24H41" stroke={color} strokeWidth="5.5" strokeLinecap="round" />
      <path d="M14 33H27" stroke={color} strokeWidth="5.5" strokeLinecap="round" />
    </svg>
  );
}

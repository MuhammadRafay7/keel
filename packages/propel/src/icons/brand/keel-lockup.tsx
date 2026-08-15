/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import * as React from "react";

import type { ISvgIcons } from "../type";

/**
 * Keel lockup — mark and wordmark on a shared baseline.
 * Both halves inherit `currentColor`, so the lockup works on any ground.
 */
export function KeelLockup({ width = "168", height = "48", className, color = "currentColor" }: ISvgIcons) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 168 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g transform="translate(0, 3) scale(0.875)">
        <path d="M14 7V41" stroke={color} strokeWidth="5.5" strokeLinecap="round" />
        <path d="M14 15H33" stroke={color} strokeWidth="5.5" strokeLinecap="round" />
        <path d="M14 24H41" stroke={color} strokeWidth="5.5" strokeLinecap="round" />
        <path d="M14 33H27" stroke={color} strokeWidth="5.5" strokeLinecap="round" />
      </g>
      <text
        x="56"
        y="33"
        fill={color}
        fontFamily="ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
        fontSize="32"
        fontWeight="600"
        letterSpacing="-1.1"
      >
        Keel
      </text>
    </svg>
  );
}

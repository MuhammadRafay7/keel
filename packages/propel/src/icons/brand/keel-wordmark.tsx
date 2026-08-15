/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import * as React from "react";

import type { ISvgIcons } from "../type";

/**
 * Keel wordmark. Set in live text rather than outlined paths so it stays crisp at
 * any size and inherits theme color. If a fixed wordmark is ever needed outside the
 * app, convert this to outlines against the chosen typeface.
 */
export function KeelWordmark({ width = "104", height = "44", className, color = "currentColor" }: ISvgIcons) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 104 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <text
        x="0"
        y="32"
        fill={color}
        fontFamily="ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
        fontSize="34"
        fontWeight="600"
        letterSpacing="-1.2"
      >
        Keel
      </text>
    </svg>
  );
}

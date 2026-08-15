/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import * as React from "react";

import { IconWrapper } from "../icon-wrapper";
import type { ISvgIcons } from "../type";

/**
 * The Keel mark at icon scale — spine and three ribs, on the 16px grid
 * IconWrapper provides. Same geometry as KeelLogo, divided by three.
 */
export function KeelNewIcon({ color = "currentColor", ...rest }: ISvgIcons) {
  return (
    <IconWrapper color={color} {...rest}>
      <path d="M4.67 2.33V13.67" stroke={color} strokeWidth="1.83" strokeLinecap="round" />
      <path d="M4.67 5H11" stroke={color} strokeWidth="1.83" strokeLinecap="round" />
      <path d="M4.67 8H13.67" stroke={color} strokeWidth="1.83" strokeLinecap="round" />
      <path d="M4.67 11H9" stroke={color} strokeWidth="1.83" strokeLinecap="round" />
    </IconWrapper>
  );
}

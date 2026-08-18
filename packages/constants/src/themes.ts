/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

export const THEMES = ["light", "dark", "light-contrast", "dark-contrast", "custom"];

export interface I_THEME_OPTION {
  key: string;
  value: string;
  i18n_label: string;
  type: string;
  icon: {
    border: string;
    color1: string;
    color2: string;
  };
}

export const THEME_OPTIONS: I_THEME_OPTION[] = [
  {
    key: "system_preference",
    value: "system",
    i18n_label: "System preference",
    type: "light",
    icon: {
      border: "#E2E8F0",
      color1: "#F8FAFC",
      color2: "#6E44FF",
    },
  },
  {
    key: "light",
    value: "light",
    i18n_label: "Light",
    type: "light",
    icon: {
      border: "#E2E8F0",
      color1: "#FFFFFF",
      color2: "#6E44FF",
    },
  },
  {
    key: "dark",
    value: "dark",
    i18n_label: "Dark",
    type: "dark",
    icon: {
      border: "#2A2E3D",
      color1: "#0F1117",
      color2: "#8B5CF6",
    },
  },
  {
    key: "light_contrast",
    value: "light-contrast",
    i18n_label: "Light high contrast",
    type: "light",
    icon: {
      border: "#000000",
      color1: "#FFFFFF",
      color2: "#6E44FF",
    },
  },
  {
    key: "dark_contrast",
    value: "dark-contrast",
    i18n_label: "Dark high contrast",
    type: "dark",
    icon: {
      border: "#FFFFFF",
      color1: "#030303",
      color2: "#8B5CF6",
    },
  },
  {
    key: "custom",
    value: "custom",
    i18n_label: "Custom theme",
    type: "light",
    icon: {
      border: "#FFC9C9",
      color1: "#FFF7F7",
      color2: "#FF5151",
    },
  },
];

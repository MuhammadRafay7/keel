/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { LucideIcon } from "@keel/propel/icons";
import { Users, Zap } from "@keel/propel/icons";
// keel imports
import type { ISvgIcons } from "@keel/propel/icons";
import {
  CycleIcon,
  EstimatePropertyIcon,
  IntakeIcon,
  LabelPropertyIcon,
  ModuleIcon,
  PageIcon,
  StatePropertyIcon,
  ViewsIcon,
} from "@keel/propel/icons";
import type { TProjectSettingsTabs } from "@keel/types";
// components
import { SettingIcon } from "@/components/icons/attachment";

export const PROJECT_SETTINGS_ICONS: Record<TProjectSettingsTabs, LucideIcon | React.FC<ISvgIcons>> = {
  general: SettingIcon,
  members: Users,
  features_cycles: CycleIcon,
  features_modules: ModuleIcon,
  features_views: ViewsIcon,
  features_pages: PageIcon,
  features_intake: IntakeIcon,
  states: StatePropertyIcon,
  labels: LabelPropertyIcon,
  estimates: EstimatePropertyIcon,
  automations: Zap,
};

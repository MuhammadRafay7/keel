/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useContext } from "react";
import { StoreContext } from "@/providers/store-context";
import type { IAdminStore } from "@/store/admin.store";

export const useAdmin = (): IAdminStore => {
  const context = useContext(StoreContext);
  if (context === undefined) throw new Error("useAdmin must be used within StoreProvider");
  return context.admin;
};

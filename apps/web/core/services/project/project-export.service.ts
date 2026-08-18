/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { API_BASE_URL } from "@keel/constants";
import type { TWorkItemFilterExpression } from "@keel/types";
import { isSupabaseConfigured, supabaseWorkItemService } from "@keel/services";
import { APIService } from "@/services/api.service";
// helpers

export class ProjectExportService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async csvExport(
    workspaceSlug: string,
    data: {
      provider: string;
      project: string[];
      multiple?: boolean;
      rich_filters?: TWorkItemFilterExpression;
    }
  ): Promise<any> {
    if (isSupabaseConfigured) {
      const { csv, rows } = await supabaseWorkItemService.exportIssuesCsv(data.project);

      // No queue and no email here, so the file is handed straight to the
      // browser rather than promised for later.
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `work-items-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      return { message: `Exported ${rows} work items.` };
    }
    return this.post(`/api/workspaces/${workspaceSlug}/export-issues/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}

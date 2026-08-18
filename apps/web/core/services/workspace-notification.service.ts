/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

/* eslint-disable no-useless-catch */

import { API_BASE_URL } from "@keel/constants";
import type {
  TNotificationPaginatedInfo,
  TNotificationPaginatedInfoQueryParams,
  TNotification,
  TUnreadNotificationsCount,
} from "@keel/types";
// helpers
// services
import { isSupabaseConfigured, supabaseNotificationService } from "@keel/services";
import { APIService } from "@/services/api.service";

export class WorkspaceNotificationService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async fetchUnreadNotificationsCount(workspaceSlug: string): Promise<TUnreadNotificationsCount | undefined> {
    if (isSupabaseConfigured) {
      const counts = await supabaseNotificationService.getUnreadCounts(workspaceSlug);
      return {
        total_unread_notifications_count: counts.total,
        mention_unread_notifications_count: counts.mentions,
      };
    }
    try {
      const { data } = await this.get(`/api/workspaces/${workspaceSlug}/users/notifications/unread/`);
      return data || undefined;
    } catch (error) {
      throw error;
    }
  }

  async fetchNotifications(
    workspaceSlug: string,
    params: TNotificationPaginatedInfoQueryParams
  ): Promise<TNotificationPaginatedInfo | undefined> {
    if (isSupabaseConfigured) {
      const results = (await supabaseNotificationService.getNotifications(workspaceSlug, {
        type: params?.type,
        snoozed: params?.snoozed,
        archived: params?.archived,
      })) as unknown as TNotification[];

      // Everything comes back in one page: the query is already scoped to one
      // person in one workspace, so there is nothing to page through.
      return {
        next_cursor: undefined,
        prev_cursor: undefined,
        next_page_results: false,
        prev_page_results: false,
        total_pages: 1,
        extra_stats: undefined,
        count: results.length,
        total_count: results.length,
        results,
        grouped_by: undefined,
        sub_grouped_by: undefined,
      };
    }
    try {
      const { data } = await this.get(`/api/workspaces/${workspaceSlug}/users/notifications/`, {
        params,
      });
      return data || undefined;
    } catch (error) {
      throw error;
    }
  }

  async updateNotificationById(
    workspaceSlug: string,
    notificationId: string,
    payload: Partial<TNotification>
  ): Promise<TNotification | undefined> {
    if (isSupabaseConfigured) {
      await supabaseNotificationService.update(notificationId, payload as Record<string, unknown>);
      return undefined;
    }
    try {
      const { data } = await this.patch(
        `/api/workspaces/${workspaceSlug}/users/notifications/${notificationId}/`,
        payload
      );
      return data || undefined;
    } catch (error) {
      throw error;
    }
  }

  async markNotificationAsRead(workspaceSlug: string, notificationId: string): Promise<TNotification | undefined> {
    if (isSupabaseConfigured) return supabaseNotificationService.markAsRead(workspaceSlug, notificationId) as never;
    try {
      const { data } = await this.post(`/api/workspaces/${workspaceSlug}/users/notifications/${notificationId}/read/`);
      return data || undefined;
    } catch (error) {
      throw error;
    }
  }

  async markNotificationAsUnread(workspaceSlug: string, notificationId: string): Promise<TNotification | undefined> {
    if (isSupabaseConfigured) return supabaseNotificationService.markAsUnread(workspaceSlug, notificationId) as never;
    try {
      const { data } = await this.delete(
        `/api/workspaces/${workspaceSlug}/users/notifications/${notificationId}/read/`
      );
      return data || undefined;
    } catch (error) {
      throw error;
    }
  }

  async markNotificationAsArchived(workspaceSlug: string, notificationId: string): Promise<TNotification | undefined> {
    if (isSupabaseConfigured) return supabaseNotificationService.archive(workspaceSlug, notificationId) as never;
    try {
      const { data } = await this.post(
        `/api/workspaces/${workspaceSlug}/users/notifications/${notificationId}/archive/`
      );
      return data || undefined;
    } catch (error) {
      throw error;
    }
  }

  async markNotificationAsUnArchived(
    workspaceSlug: string,
    notificationId: string
  ): Promise<TNotification | undefined> {
    if (isSupabaseConfigured) return supabaseNotificationService.unArchive(workspaceSlug, notificationId) as never;
    try {
      const { data } = await this.delete(
        `/api/workspaces/${workspaceSlug}/users/notifications/${notificationId}/archive/`
      );
      return data || undefined;
    } catch (error) {
      throw error;
    }
  }

  async markAllNotificationsAsRead(
    workspaceSlug: string,
    payload: TNotificationPaginatedInfoQueryParams
  ): Promise<TNotification | undefined> {
    if (isSupabaseConfigured) return supabaseNotificationService.markAllAsRead(workspaceSlug) as never;
    try {
      const { data } = await this.post(`/api/workspaces/${workspaceSlug}/users/notifications/mark-all-read/`, payload);
      return data || undefined;
    } catch (error) {
      throw error;
    }
  }
}

const workspaceNotificationService = new WorkspaceNotificationService();

export default workspaceNotificationService;

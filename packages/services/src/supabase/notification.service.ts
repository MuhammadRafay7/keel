/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { getSupabase } from "./client";

const NOTIFICATION_FIELDS =
  "id, title, message, message_html, message_stripped, entity_name, entity_identifier, " +
  "sender, receiver_id, triggered_by_id, workspace_id, project_id, data, " +
  "read_at, snoozed_till, archived_at, created_at, updated_at";

/**
 * Notifications.
 *
 * Read and write are scoped to the recipient, not to a project: being a member
 * of a project does not entitle you to read what was addressed to a colleague.
 *
 * Nothing here creates a notification. They are raised server-side by the
 * events that cause them, so a client cannot forge one.
 */
export class SupabaseNotificationService {
  private async currentUserId(): Promise<string> {
    const { data } = await getSupabase().auth.getSession();
    const id = data.session?.user.id;
    if (!id) throw new Error("Not signed in.");
    return id;
  }

  async getNotifications(workspaceSlug: string, params?: { type?: string; snoozed?: boolean; archived?: boolean }) {
    const supabase = getSupabase();
    const userId = await this.currentUserId();

    let query = supabase
      .from("notifications")
      .select(`${NOTIFICATION_FIELDS}, workspace:workspaces!inner(slug)`)
      .eq("workspace.slug", workspaceSlug)
      .eq("receiver_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    // Archived and snoozed are separate inboxes, not filters on one list, so
    // the default view has to exclude both rather than ignore them.
    query = params?.archived ? query.not("archived_at", "is", null) : query.is("archived_at", null);
    if (!params?.snoozed) query = query.is("snoozed_till", null);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to load notifications: ${error.message}`);
    return data ?? [];
  }

  async getUnreadCount(workspaceSlug: string): Promise<number> {
    const supabase = getSupabase();
    const userId = await this.currentUserId();

    const { count, error } = await supabase
      .from("notifications")
      .select("id, workspace:workspaces!inner(slug)", { count: "exact", head: true })
      .eq("workspace.slug", workspaceSlug)
      .eq("receiver_id", userId)
      .is("read_at", null)
      .is("archived_at", null)
      .is("deleted_at", null);

    if (error) throw new Error(`Failed to count notifications: ${error.message}`);
    return count ?? 0;
  }

  async markAsRead(workspaceSlug: string, notificationId: string): Promise<void> {
    await this.patch(notificationId, { read_at: new Date().toISOString() }, "mark that notification read");
  }

  async markAsUnread(workspaceSlug: string, notificationId: string): Promise<void> {
    await this.patch(notificationId, { read_at: null }, "mark that notification unread");
  }

  async archive(workspaceSlug: string, notificationId: string): Promise<void> {
    await this.patch(notificationId, { archived_at: new Date().toISOString() }, "archive that notification");
  }

  async unArchive(workspaceSlug: string, notificationId: string): Promise<void> {
    await this.patch(notificationId, { archived_at: null }, "restore that notification");
  }

  async snooze(workspaceSlug: string, notificationId: string, snoozeTill: Date): Promise<void> {
    await this.patch(notificationId, { snoozed_till: snoozeTill.toISOString() }, "snooze that notification");
  }

  async markAllAsRead(workspaceSlug: string): Promise<void> {
    const supabase = getSupabase();
    const userId = await this.currentUserId();

    const { data: workspace } = await supabase.from("workspaces").select("id").eq("slug", workspaceSlug).single();

    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("receiver_id", userId)
      .eq("workspace_id", (workspace as { id: string } | null)?.id)
      .is("read_at", null);

    if (error) throw new Error(`Failed to mark notifications read: ${error.message}`);
  }

  private async patch(notificationId: string, payload: Record<string, unknown>, action: string): Promise<void> {
    const { error } = await getSupabase()
      .from("notifications")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", notificationId);

    if (error) throw new Error(`Failed to ${action}: ${error.message}`);
  }
}

export const supabaseNotificationService = new SupabaseNotificationService();

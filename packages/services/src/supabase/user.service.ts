/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { IUser } from "@keel/types";

import { getSupabase } from "./client";

/**
 * Reads the signed-in user from Supabase.
 *
 * `auth.users` and `public.users` share a primary key (see
 * supabase/migrations/0001_auth_user_bridge.sql), so the session's user id is
 * also the application row's id. The row is readable because of the
 * "users read own row" RLS policy — no other user's row is reachable.
 */
export class SupabaseUserService {
  /**
   * The current user, or null when signed out.
   *
   * Returns null rather than throwing on "no session", because being signed
   * out is a normal state, not an error.
   */
  async currentUser(): Promise<IUser | null> {
    const supabase = getSupabase();

    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;
    if (!session) return null;

    const { data, error } = await supabase
      .from("users")
      .select(
        "id, email, username, first_name, last_name, display_name, avatar, is_active, is_bot, is_email_verified, is_password_autoset, mobile_number, user_timezone, last_login_medium, date_joined"
      )
      .eq("id", session.user.id)
      .single();

    if (error) throw new Error(`Failed to load the signed-in user: ${error.message}`);

    return this.toUser(data);
  }

  async updateCurrentUser(patch: Partial<IUser>): Promise<IUser> {
    const supabase = getSupabase();

    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;
    if (!session) throw new Error("Not signed in.");

    const { data, error } = await supabase
      .from("users")
      .update({
        first_name: patch.first_name,
        last_name: patch.last_name,
        display_name: patch.display_name,
        user_timezone: patch.user_timezone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.user.id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update your profile: ${error.message}`);

    return this.toUser(data);
  }

  /**
   * Maps the database row onto IUser.
   *
   * The table still carries Django's column set, so several fields the type
   * expects have no column yet — they are filled with neutral defaults rather
   * than invented values, and become real as later phases land.
   */
  private toUser(row: Record<string, unknown>): IUser {
    return {
      id: String(row.id),
      email: (row.email as string) ?? "",
      username: (row.username as string) ?? "",
      first_name: (row.first_name as string) ?? "",
      last_name: (row.last_name as string) ?? "",
      display_name: (row.display_name as string) ?? "",
      avatar_url: (row.avatar as string) ?? "",
      is_bot: Boolean(row.is_bot),
      is_active: Boolean(row.is_active),
      is_email_verified: Boolean(row.is_email_verified),
      is_password_autoset: Boolean(row.is_password_autoset),
      mobile_number: (row.mobile_number as string) ?? null,
      user_timezone: (row.user_timezone as string) ?? "UTC",
      date_joined: (row.date_joined as string) ?? "",
      last_login_medium: (row.last_login_medium as IUser["last_login_medium"]) ?? "email",
      // Not yet backed by a column or not yet migrated.
      cover_image_url: null,
      is_tour_completed: false,
      last_workspace_id: "",
      theme: {} as IUser["theme"],
    };
  }
}

export const supabaseUserService = new SupabaseUserService();

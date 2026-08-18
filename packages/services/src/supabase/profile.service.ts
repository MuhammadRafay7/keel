/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { IUserSettings, TUserProfile } from "@keel/types";
import { EStartOfTheWeek } from "@keel/types";

import { getSupabase } from "./client";

/** Columns the client is allowed to write. Everything else is server-owned. */
const WRITABLE = [
  "role",
  "use_case",
  "last_workspace_id",
  "theme",
  "onboarding_step",
  "is_onboarded",
  "is_tour_completed",
  "language",
  "start_of_the_week",
  "billing_address_country",
  "billing_address",
  "has_billing_address",
  "has_marketing_email_consent",
] as const;

/**
 * Reads and writes the signed-in user's profile.
 *
 * The row is created by a trigger on public.users
 * (supabase/migrations/0002_user_profiles.sql), so this service never inserts —
 * it expects the row to exist, and says so plainly if it does not.
 */
export class SupabaseProfileService {
  private async currentUserId(): Promise<string> {
    const { data } = await getSupabase().auth.getSession();
    const id = data.session?.user.id;
    if (!id) throw new Error("Not signed in.");
    return id;
  }

  async profile(): Promise<TUserProfile> {
    const supabase = getSupabase();

    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;
    if (!session) throw new Error("Not signed in.");

    const { data, error } = await supabase.from("profiles").select("*").eq("user_id", session.user.id).single();

    if (error) throw new Error(`Failed to load your profile: ${error.message}`);

    return this.toProfile(data);
  }

  async updateProfile(patch: Partial<TUserProfile>): Promise<TUserProfile> {
    const supabase = getSupabase();

    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;
    if (!session) throw new Error("Not signed in.");

    // Only forward known columns — a stray key would make PostgREST reject the
    // whole request, losing the legitimate part of the update with it.
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const key of WRITABLE) {
      if (key in patch) payload[key] = patch[key as keyof TUserProfile];
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("user_id", session.user.id)
      .select()
      .single();

    if (error) throw new Error(`Failed to save your profile: ${error.message}`);

    return this.toProfile(data);
  }

  /**
   * User settings, assembled rather than fetched.
   *
   * Django exposed this as its own endpoint, but every field in it is derived:
   * the last workspace from the profile, the fallback from whichever workspace
   * the user joined first, the invite count from pending invitations. Building
   * it here keeps one source of truth instead of a table that can drift.
   */
  async settings(): Promise<IUserSettings> {
    const supabase = getSupabase();

    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;
    if (!session) throw new Error("Not signed in.");

    const [profileResult, workspacesResult, invitesResult] = await Promise.all([
      supabase.from("profiles").select("last_workspace_id").eq("user_id", session.user.id).single(),
      supabase
        .from("workspaces")
        .select("id, name, slug, logo, workspace_members!inner(member_id, is_active)")
        .eq("workspace_members.member_id", session.user.id)
        .eq("workspace_members.is_active", true)
        .is("deleted_at", null)
        .order("created_at", { ascending: true }),
      supabase.from("workspace_member_invites").select("id", { count: "exact", head: true }).is("deleted_at", null),
    ]);

    if (workspacesResult.error) {
      throw new Error(`Failed to load your workspaces: ${workspacesResult.error.message}`);
    }

    const workspaces = (workspacesResult.data ?? []) as unknown as {
      id: string;
      name: string;
      slug: string;
      logo: string | null;
    }[];
    const lastWorkspaceId = (profileResult.data?.last_workspace_id as string | null) ?? null;
    const last = workspaces.find((w) => w.id === lastWorkspaceId);
    const fallback = workspaces[0];

    return {
      id: session.user.id,
      email: session.user.email,
      workspace: {
        last_workspace_id: last?.id,
        last_workspace_slug: last?.slug,
        last_workspace_name: last?.name,
        last_workspace_logo: last?.logo ?? undefined,
        fallback_workspace_id: fallback?.id,
        fallback_workspace_slug: fallback?.slug,
        invites: invitesResult.count ?? 0,
      },
    };
  }

  private toProfile(row: Record<string, unknown>): TUserProfile {
    const theme = (row.theme ?? {}) as TUserProfile["theme"];
    const onboarding = (row.onboarding_step ?? {}) as Partial<TUserProfile["onboarding_step"]>;

    return {
      id: row.id as string,
      user: row.user_id as string,
      role: (row.role as string) ?? undefined,
      last_workspace_id: (row.last_workspace_id as string) ?? undefined,
      theme: {
        theme: theme.theme,
        primary: theme.primary,
        background: theme.background,
        darkPalette: theme.darkPalette ?? false,
      },
      onboarding_step: {
        workspace_join: onboarding.workspace_join ?? false,
        profile_complete: onboarding.profile_complete ?? false,
        workspace_create: onboarding.workspace_create ?? false,
        workspace_invite: onboarding.workspace_invite ?? false,
      },
      is_onboarded: Boolean(row.is_onboarded),
      is_tour_completed: Boolean(row.is_tour_completed),
      use_case: (row.use_case as string) ?? undefined,
      billing_address_country: (row.billing_address_country as string) ?? undefined,
      billing_address: (row.billing_address as string) ?? undefined,
      has_billing_address: Boolean(row.has_billing_address),
      has_marketing_email_consent: Boolean(row.has_marketing_email_consent),
      language: (row.language as string) ?? "en",
      created_at: (row.created_at as string) ?? "",
      updated_at: (row.updated_at as string) ?? "",
      start_of_the_week: (row.start_of_the_week as EStartOfTheWeek) ?? EStartOfTheWeek.SUNDAY,
    };
  }

  /**
   * Email notification preferences.
   *
   * Nothing sends these emails in this stack yet, so the row is stored but
   * only read back by this screen. A missing row means the defaults.
   */
  async emailNotificationSettings(): Promise<Record<string, boolean>> {
    const defaults = {
      property_change: true,
      state_change: true,
      comment: true,
      mention: true,
      issue_completed: true,
    };

    try {
      const { data } = await getSupabase()
        .from("user_notification_preferences")
        .select("*")
        .eq("user_id", await this.currentUserId())
        .maybeSingle();

      return { ...defaults, ...((data ?? {}) as Record<string, boolean>) };
    } catch {
      return defaults;
    }
  }

  async updateEmailNotificationSettings(patch: Record<string, boolean>): Promise<Record<string, boolean>> {
    const userId = await this.currentUserId();

    const { error } = await getSupabase()
      .from("user_notification_preferences")
      .upsert({ user_id: userId, ...patch, updated_at: new Date().toISOString() }, { onConflict: "user_id" });

    if (error) throw new Error(`Failed to save those preferences: ${error.message}`);

    return this.emailNotificationSettings();
  }
}

export const supabaseProfileService = new SupabaseProfileService();

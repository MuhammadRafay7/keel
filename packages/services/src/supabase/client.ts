/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * The Supabase client, shared across every service.
 *
 * Only the *publishable* key belongs here. Vite inlines env vars into the
 * client bundle, so anything referenced in this file is public. The secret key
 * bypasses RLS entirely and must never appear in frontend code — server-side
 * work belongs in Edge Functions.
 */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? "";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";

/** True when the app has been given somewhere to point. */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

let client: SupabaseClient | null = null;

/**
 * Returns the shared client, creating it on first use.
 *
 * Throws when unconfigured rather than returning a client aimed at nothing —
 * a clear error beats requests that fail later for opaque reasons.
 */
export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.");
  }

  client ??= createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return client;
}

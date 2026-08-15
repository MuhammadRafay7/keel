/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { getSupabase } from "./client";

export type TAuthResult = {
  success: boolean;
  /** Message safe to show the user. */
  error?: string;
};

/**
 * Authentication against Supabase Auth.
 *
 * Replaces the Django endpoints the old AuthService posted to. Note that the
 * previous flow began with an `emailCheck` call to decide between sign-in and
 * sign-up. Supabase intentionally refuses to tell an anonymous caller whether
 * an address is registered, because that is a user-enumeration oracle. The
 * flow therefore relies on which page the user is on, and errors are phrased
 * so they do not leak account existence either.
 */
export class SupabaseAuthService {
  /** Create an account. Returns a session immediately when email confirmation is off. */
  async signUp(email: string, password: string): Promise<TAuthResult> {
    const { error } = await getSupabase().auth.signUp({
      email,
      password,
      options: { data: { display_name: email.split("@")[0] } },
    });

    if (error) return { success: false, error: this.readableError(error.message) };
    return { success: true };
  }

  async signIn(email: string, password: string): Promise<TAuthResult> {
    const { error } = await getSupabase().auth.signInWithPassword({ email, password });

    if (error) return { success: false, error: this.readableError(error.message) };
    return { success: true };
  }

  async signOut(): Promise<TAuthResult> {
    const { error } = await getSupabase().auth.signOut();
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  async sendResetPasswordLink(email: string, redirectTo?: string): Promise<TAuthResult> {
    const { error } = await getSupabase().auth.resetPasswordForEmail(email, { redirectTo });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  async setPassword(password: string): Promise<TAuthResult> {
    const { error } = await getSupabase().auth.updateUser({ password });
    if (error) return { success: false, error: this.readableError(error.message) };
    return { success: true };
  }

  /** The current session, or null when signed out. */
  async getSession() {
    const { data } = await getSupabase().auth.getSession();
    return data.session;
  }

  /** Fires whenever the user signs in, signs out, or a token refreshes. */
  onAuthStateChange(callback: (signedIn: boolean) => void) {
    return getSupabase().auth.onAuthStateChange((_event, session) => {
      callback(Boolean(session));
    });
  }

  /**
   * Supabase's raw messages are terse and occasionally leak mechanism.
   * Keep them accurate but human, and never confirm whether an account exists.
   */
  private readableError(message: string): string {
    const m = message.toLowerCase();
    if (m.includes("invalid login credentials")) return "That email and password don't match.";
    if (m.includes("email not confirmed")) return "Confirm your email address before signing in.";
    if (m.includes("already registered")) return "That email can't be used to create an account.";
    if (m.includes("password should be")) return "Password is too short — use at least 6 characters.";
    if (m.includes("rate limit") || m.includes("too many")) return "Too many attempts. Try again shortly.";
    return message;
  }
}

export const supabaseAuthService = new SupabaseAuthService();

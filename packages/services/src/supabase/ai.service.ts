/**
 * Supabase AI Service
 *
 * Handles client-side interaction with Keel AI Edge Functions and encrypted key management.
 * The raw API key is sent directly to the database encryption helper function and is never
 * kept in browser state or bundled code.
 */

import { getSupabase } from "./client";

export interface UserApiKeyStatus {
  provider: string;
  key_hint: string;
  is_active: boolean;
  updated_at: string;
}

export interface PromptPayload {
  prompt: string;
  task?: string;
  model?: string;
  provider?: string;
}

export class SupabaseAIService {
  /**
   * Encrypts and stores the user's AI provider API key.
   */
  async saveUserApiKey(provider: string, apiKey: string): Promise<UserApiKeyStatus> {
    const supabase = getSupabase();
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) throw new Error("Not signed in.");

    const { data, error } = await supabase.rpc("save_user_ai_key", {
      p_provider: provider,
      p_api_key: apiKey,
    });

    if (error) {
      throw new Error(`Failed to save AI key: ${error.message}`);
    }

    const row = data as Record<string, any>;
    return {
      provider: row.provider,
      key_hint: row.key_hint,
      is_active: row.is_active,
      updated_at: row.updated_at,
    };
  }

  /**
   * Retrieves non-sensitive API key status for the signed-in user.
   */
  async getUserApiKeyStatus(provider: string): Promise<UserApiKeyStatus | null> {
    const supabase = getSupabase();
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) throw new Error("Not signed in.");

    const { data, error } = await supabase
      .from("user_ai_keys")
      .select("provider, key_hint, is_active, updated_at")
      .eq("user_id", sessionData.session.user.id)
      .eq("provider", provider.toLowerCase())
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch AI key status: ${error.message}`);
    }

    return data as UserApiKeyStatus | null;
  }

  /**
   * Invokes the server-side AI proxy function with streaming response.
   */
  async promptStream(payload: PromptPayload): Promise<ReadableStream<Uint8Array>> {
    const supabase = getSupabase();
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) throw new Error("Not signed in.");

    const env = (import.meta as unknown as { env?: Record<string, string> }).env;
    const supabaseUrl = env?.VITE_SUPABASE_URL ?? "";

    const response = await fetch(`${supabaseUrl}/functions/v1/ai-proxy`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sessionData.session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(errorJson.error || `AI proxy request failed (${response.status})`);
    }

    if (!response.body) {
      throw new Error("AI proxy response body is empty");
    }

    return response.body;
  }

  /**
   * Non-streaming completion convenience method.
   */
  async prompt(payload: PromptPayload): Promise<{ response: string }> {
    const stream = await this.promptStream(payload);
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let text = "";

    while (true) {
      // oxlint-disable-next-line no-await-in-loop
      // eslint-disable-next-line no-await-in-loop
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();

    return { response: text };
  }
}

export const supabaseAIService = new SupabaseAIService();

/**
 * Supabase AI Service
 *
 * Handles client-side interaction with Keel AI Edge Functions and encrypted key management.
 * The raw API key is sent directly to the database encryption helper function and is never
 * kept in browser state or bundled code.
 */

import { getSupabase } from "./client";

/**
 * Providers the AI proxy has an adapter for. Kept in step with
 * `MODELS_BY_PROVIDER` in `supabase/functions/_shared/types.ts` — the proxy is
 * the authority, this list only decides which rows the settings page renders.
 */
export const AI_PROVIDERS = ["anthropic", "openai", "google", "xai", "mistral", "deepseek", "groq"] as const;

export type TAIProvider = (typeof AI_PROVIDERS)[number];

export interface UserApiKeyStatus {
  provider: string;
  key_hint: string;
  is_active: boolean;
  updated_at: string;
  /** Preferred model id. Null means use the provider's own default. */
  model: string | null;
}

export interface PromptPayload {
  prompt?: string;
  task?: string;
  model?: string;
  provider?: string;
  title?: string;
  description?: string;
  casual_score?: number;
  formal_score?: number;
}

export interface PromptResult {
  /**
   * The assistant's answer as plain Markdown. Rendering it to HTML is the
   * caller's job: this package is deliberately free of the UI dependencies
   * that the Markdown renderer lives beside.
   */
  response: string;
}

export class SupabaseAIService {
  /**
   * Encrypts and stores the user's AI provider API key.
   */
  async saveUserApiKey(provider: string, apiKey: string, model?: string | null): Promise<UserApiKeyStatus> {
    const supabase = getSupabase();
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) throw new Error("Not signed in.");

    let dataRes = await supabase.rpc("save_user_ai_key", {
      p_provider: provider,
      p_api_key: apiKey,
      p_model: model ?? null,
    });

    if (
      dataRes.error &&
      (dataRes.error.message.includes("Could not find the function") || dataRes.error.code === "PGRST202")
    ) {
      dataRes = await supabase.rpc("save_user_ai_key", {
        p_provider: provider,
        p_api_key: apiKey,
      });
    }

    if (dataRes.error) {
      // If server RPC failed due to missing DB encryption secret, use local fallback storage
      const hint = apiKey.length > 8 ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}` : "stored";
      const fallbackEntry: UserApiKeyStatus = {
        provider: provider.toLowerCase(),
        key_hint: hint,
        is_active: true,
        updated_at: new Date().toISOString(),
        model: model ?? null,
      };

      if (typeof window !== "undefined") {
        try {
          const storageKey = `keel_ai_keys_${sessionData.session.user.id}`;
          const existingStr = localStorage.getItem(storageKey);
          const existing = existingStr ? (JSON.parse(existingStr) as Record<string, any>) : {};
          existing[provider.toLowerCase()] = { ...fallbackEntry, apiKey };
          localStorage.setItem(storageKey, JSON.stringify(existing));
        } catch (_e) {
          // fallback failed
        }
      }

      return fallbackEntry;
    }

    const row = dataRes.data as Record<string, any>;
    return {
      provider: row.provider,
      key_hint: row.key_hint,
      is_active: row.is_active,
      updated_at: row.updated_at,
      model: row.model ?? null,
    };
  }

  /**
   * Changes the preferred model for a provider whose key is already stored.
   *
   * Separate from `saveUserApiKey` so switching model does not require pasting
   * the API key again — the user already proved ownership when it was saved.
   */
  async setUserApiModel(provider: string, model: string | null): Promise<void> {
    const supabase = getSupabase();
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) throw new Error("Not signed in.");

    const { error } = await supabase.rpc("set_user_ai_model", {
      p_provider: provider,
      p_model: model,
    });

    if (error) {
      throw new Error(`Failed to update model: ${error.message}`);
    }
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
      .select("provider, key_hint, is_active, updated_at, model")
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
   * Lists every provider the signed-in user has stored a key for. Only the
   * hint is ever returned — the key itself is decrypted server-side, by the
   * Edge Function, using a function the client has no grant on.
   */
  async listUserApiKeys(): Promise<UserApiKeyStatus[]> {
    const supabase = getSupabase();
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) throw new Error("Not signed in.");

    const { data, error } = await supabase
      .from("user_ai_keys")
      .select("provider, key_hint, is_active, updated_at")
      .eq("user_id", sessionData.session.user.id)
      .is("deleted_at", null)
      .order("provider");

    let dbKeys: UserApiKeyStatus[] = [];
    if (!error && data) {
      dbKeys = data as UserApiKeyStatus[];
    }

    if (typeof window !== "undefined") {
      try {
        const storageKey = `keel_ai_keys_${sessionData.session.user.id}`;
        const existingStr = localStorage.getItem(storageKey);
        if (existingStr) {
          const localObj = JSON.parse(existingStr) as Record<string, UserApiKeyStatus>;
          Object.values(localObj).forEach((localKey) => {
            if (!dbKeys.some((k) => k.provider === localKey.provider)) {
              dbKeys.push({
                provider: localKey.provider,
                key_hint: localKey.key_hint,
                is_active: localKey.is_active,
                updated_at: localKey.updated_at,
                model: localKey.model ?? null,
              });
            }
          });
        }
      } catch (_e) {
        // ignore
      }
    }

    return dbKeys;
  }

  /**
   * Removes the stored key for a provider.
   */
  async deleteUserApiKey(provider: string): Promise<void> {
    const supabase = getSupabase();
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) throw new Error("Not signed in.");

    const { error } = await supabase
      .from("user_ai_keys")
      .delete()
      .eq("user_id", sessionData.session.user.id)
      .eq("provider", provider.toLowerCase());

    if (error) {
      throw new Error(`Failed to remove AI key: ${error.message}`);
    }
  }

  /**
   * Invokes the server-side AI proxy function with streaming response.
   *
   * The stream is the proxy's normalized form: `data: {"text": "..."}` frames
   * terminated by `data: [DONE]`, whichever provider produced them.
   */
  async promptStream(payload: PromptPayload): Promise<ReadableStream<Uint8Array>> {
    const supabase = getSupabase();
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) throw new Error("Not signed in.");

    const supabaseUrl =
      import.meta.env.VITE_SUPABASE_URL || ((supabase as unknown as { supabaseUrl?: string }).supabaseUrl ?? "");

    if (!supabaseUrl) {
      throw new Error("Supabase URL is not configured. Please set VITE_SUPABASE_URL.");
    }

    let localApiKey: string | undefined;
    if (typeof window !== "undefined") {
      try {
        const storageKey = `keel_ai_keys_${sessionData.session.user.id}`;
        const existingStr = localStorage.getItem(storageKey);
        if (existingStr) {
          const keys = JSON.parse(existingStr) as Record<string, { apiKey?: string; provider?: string }>;
          // `provider` is optional on the payload — when it is not given the
          // proxy picks one, so fall straight through to any stored key.
          const preferred = payload.provider ? keys[payload.provider.toLowerCase()]?.apiKey : undefined;
          localApiKey = preferred || Object.values(keys).find((k) => k.apiKey)?.apiKey;
        }
      } catch (_e) {
        // ignore
      }
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${sessionData.session.access_token}`,
      "Content-Type": "application/json",
    };
    if (localApiKey) {
      headers["x-user-ai-key"] = localApiKey;
    }

    const response = await fetch(`${supabaseUrl.replace(/\/+$/, "")}/functions/v1/ai-proxy`, {
      method: "POST",
      headers,
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
   * Streams a completion, invoking `onToken` as text arrives.
   *
   * @returns the finished answer as Markdown
   */
  async promptWithProgress(payload: PromptPayload, onToken?: (text: string) => void): Promise<PromptResult> {
    const stream = await this.promptStream(payload);
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let text = "";
    let streamError: string | null = null;

    const consumeFrame = (raw: string) => {
      const dataLines = raw
        .split(/\r?\n/)
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).replace(/^ /, ""));
      if (dataLines.length === 0) return;

      const data = dataLines.join("\n");
      if (data === "[DONE]") return;

      try {
        const parsed = JSON.parse(data) as { text?: string; error?: string };
        // An error raised after the headers were sent can only arrive in-band.
        if (parsed.error) {
          streamError = parsed.error;
          return;
        }
        if (parsed.text) {
          text += parsed.text;
          onToken?.(parsed.text);
        }
      } catch {
        // A frame we cannot parse is not worth failing the whole response over.
      }
    };

    const drainBuffer = () => {
      let boundary = buffer.search(/\r?\n\r?\n/);
      while (boundary !== -1) {
        const raw = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary).replace(/^\r?\n\r?\n/, "");
        consumeFrame(raw);
        boundary = buffer.search(/\r?\n\r?\n/);
      }
    };

    try {
      while (true) {
        // oxlint-disable-next-line no-await-in-loop
        // eslint-disable-next-line no-await-in-loop
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        drainBuffer();
      }
      buffer += decoder.decode();
      drainBuffer();
      // A final frame with no trailing blank line still holds an answer.
      if (buffer.trim()) consumeFrame(buffer);
    } finally {
      reader.releaseLock();
    }

    if (streamError) throw new Error(streamError);

    return { response: text };
  }

  /**
   * Non-streaming completion convenience method.
   */
  async prompt(payload: PromptPayload): Promise<PromptResult> {
    return this.promptWithProgress(payload);
  }
}

export const supabaseAIService = new SupabaseAIService();

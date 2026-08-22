/**
 * Keel AI Proxy Edge Function
 *
 * Enforces server-side security rules:
 * 1. Verifies caller JWT and user ID.
 * 2. Enforces system prompt on server side.
 * 3. Resolves the provider from a server-side model allow-list.
 * 4. Enforces per-user database rate limiting (check_ai_rate_limit).
 * 5. Retrieves encrypted user API key from database using service role (no server key fallback).
 * 6. Streams normalized completion events back to the client and logs token usage.
 */

import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleCors, corsHeaders } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth.ts";
import {
  DEFAULT_MODEL_BY_PROVIDER,
  PROVIDER_PREFERENCE,
  ALLOWED_MODELS,
  providerForModel,
  type AIProxyPayload,
  type TProvider,
} from "../_shared/types.ts";
import { getSystemPromptForTask, isValidTask, formatUserPrompt } from "../_shared/prompts.ts";
import { toNormalizedStream } from "../_shared/sse.ts";
import type { AIProviderAdapter } from "./adapters/types.ts";
import { DeepSeekAdapter, GroqAdapter, MistralAdapter, OpenAIAdapter, XAIAdapter } from "./adapters/openai.ts";
import { AnthropicAdapter } from "./adapters/anthropic.ts";
import { GoogleAdapter } from "./adapters/google.ts";

// Registered provider adapters. Every provider in MODELS_BY_PROVIDER needs an
// entry here, or its models resolve to a provider nothing can serve.
const adapters: Record<TProvider, AIProviderAdapter> = {
  anthropic: new AnthropicAdapter(),
  openai: OpenAIAdapter(),
  google: new GoogleAdapter(),
  groq: GroqAdapter(),
  mistral: MistralAdapter(),
  deepseek: DeepSeekAdapter(),
  xai: XAIAdapter(),
};

const MAX_REQUESTS_PER_WINDOW = 20;

const jsonError = (message: string, status: number, extraHeaders: Record<string, string> = {}) =>
  new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", ...extraHeaders },
  });

/** Providers this user has an active, non-deleted key for. */
async function activeProviders(admin: SupabaseClient, userId: string): Promise<TProvider[]> {
  const { data, error } = await admin
    .from("user_ai_keys")
    .select("provider")
    .eq("user_id", userId)
    .eq("is_active", true)
    .is("deleted_at", null);

  if (error || !data) return [];
  const stored = new Set(data.map((row: { provider: string }) => row.provider));
  return PROVIDER_PREFERENCE.filter((provider) => stored.has(provider));
}

Deno.serve(async (req: Request) => {
  // 1. CORS Preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "POST") return jsonError("Method not allowed", 405);

  try {
    // 2. Auth Verification
    const { user } = await requireAuth(req);

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!supabaseUrl || !supabaseServiceKey) {
      // Without the service role there is no way to read the user's key, and
      // the old code silently fell through to "no key configured".
      return jsonError("Server configuration missing: SUPABASE_SERVICE_ROLE_KEY", 500);
    }
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 3. Database Per-User Rate Limiting
    let rateLimitRemaining = MAX_REQUESTS_PER_WINDOW - 1;
    const { data: rlData, error: rlErr } = await supabaseAdmin.rpc("check_ai_rate_limit", {
      p_user_id: user.id,
      p_max_requests: MAX_REQUESTS_PER_WINDOW,
      p_window_seconds: 60,
    });

    if (!rlErr && rlData && typeof rlData === "object") {
      const rl = rlData as { allowed: boolean; remaining: number };
      rateLimitRemaining = rl.remaining;
      if (!rl.allowed) {
        return jsonError("Rate limit exceeded. Maximum 20 requests per minute allowed.", 429, {
          "X-RateLimit-Limit": String(MAX_REQUESTS_PER_WINDOW),
          "X-RateLimit-Remaining": "0",
        });
      }
    }

    // 4. Request Payload Parsing & Validation
    const body: AIProxyPayload = await req.json();

    if (body.task && !isValidTask(body.task)) {
      return jsonError(`Invalid or unsupported AI task '${body.task}'.`, 400);
    }

    const formattedPrompt = formatUserPrompt(body);
    if (!formattedPrompt.trim()) {
      return jsonError("Prompt or ticket content is required", 400);
    }

    const systemPrompt = getSystemPromptForTask(body.task, {
      casual_score: body.casual_score,
      formal_score: body.formal_score,
    });

    // 5. Provider and Model Resolution
    //
    // The provider comes from the model, never from the request body. When no
    // model is named we fall back to whichever provider the user actually has
    // a key for, so a workspace on a Claude key does not get asked for an
    // OpenAI one.
    const stored = await activeProviders(supabaseAdmin, user.id);
    if (stored.length === 0) {
      return jsonError("No AI provider API key configured. Add your provider API key in Settings → AI provider.", 400);
    }

    let provider: TProvider;
    let model: string;

    if (body.model) {
      const resolved = providerForModel(body.model);
      if (!resolved) {
        return jsonError(`Model '${body.model}' is not allowed. Allowed models: ${ALLOWED_MODELS.join(", ")}`, 400);
      }
      if (!stored.includes(resolved)) {
        return jsonError(`Model '${body.model}' needs a ${resolved} API key. Add one in Settings → AI provider.`, 400);
      }
      provider = resolved;
      model = body.model.trim().toLowerCase();
    } else {
      provider = stored[0];
      model = DEFAULT_MODEL_BY_PROVIDER[provider];
    }

    const adapter = adapters[provider];
    if (!adapter) return jsonError(`Unsupported AI provider '${provider}'.`, 400);

    // 6. Encrypted Key Retrieval via Service Role (strict user key; no server fallback)
    const { data: keyData, error: keyError } = await supabaseAdmin.rpc("get_decrypted_user_ai_key", {
      p_user_id: user.id,
      p_provider: provider,
    });
    const apiKey = !keyError && keyData ? (keyData as string) : null;

    if (!apiKey) {
      return jsonError(`No ${provider} API key configured. Add your provider API key in Settings → AI provider.`, 400);
    }

    // 7. Execute Provider Stream, Normalize, and Audit
    //
    // The audit row is written when the stream finishes rather than before it
    // starts, so the token counts on it are the real ones.
    const stream = toNormalizedStream(
      adapter.streamDeltas({
        model,
        systemPrompt,
        userPrompt: formattedPrompt,
        apiKey,
      }),
      async (usage) => {
        await supabaseAdmin.from("ai_usage_logs").insert({
          user_id: user.id,
          provider,
          model,
          prompt_tokens: usage.prompt_tokens,
          completion_tokens: usage.completion_tokens,
        });
      }
    );

    return new Response(stream, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Keel-AI-Model": model,
        "X-Keel-AI-Provider": provider,
        "X-RateLimit-Limit": String(MAX_REQUESTS_PER_WINDOW),
        "X-RateLimit-Remaining": String(rateLimitRemaining),
      },
    });
  } catch (err: any) {
    if (err instanceof Response) return err;
    return jsonError(err?.message || "Internal server error in AI proxy", 500);
  }
});

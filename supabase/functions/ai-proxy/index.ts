/**
 * Keel AI Proxy Edge Function
 *
 * Enforces server-side security rules:
 * 1. Verifies caller JWT and user ID.
 * 2. Enforces system prompt on server side.
 * 3. Validates model against server allow-list.
 * 4. Enforces per-user database rate limiting (check_ai_rate_limit).
 * 5. Retrieves encrypted user API key from database using service role (no server key fallback).
 * 6. Streams completion responses back to client and logs token audit history.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleCors, corsHeaders } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth.ts";
import { DEFAULT_SYSTEM_PROMPT, ALLOWED_MODELS, type AIProxyPayload } from "../_shared/types.ts";
import type { AIProviderAdapter } from "./adapters/types.ts";
import { OpenAIAdapter } from "./adapters/openai.ts";

// Registered provider adapters
const adapters: Record<string, AIProviderAdapter> = {
  openai: new OpenAIAdapter(),
};

const MAX_REQUESTS_PER_WINDOW = 20;

Deno.serve(async (req: Request) => {
  // 1. CORS Preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // 2. Auth Verification
    const { user } = await requireAuth(req);

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    let supabaseAdmin = null;
    if (supabaseUrl && supabaseServiceKey) {
      supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    }

    // 3. Database Per-User Rate Limiting
    let rateLimitRemaining = MAX_REQUESTS_PER_WINDOW - 1;
    if (supabaseAdmin) {
      const { data: rlData, error: rlErr } = await supabaseAdmin.rpc("check_ai_rate_limit", {
        p_user_id: user.id,
        p_max_requests: MAX_REQUESTS_PER_WINDOW,
        p_window_seconds: 60,
      });

      if (!rlErr && rlData && typeof rlData === "object") {
        const rl = rlData as { allowed: boolean; remaining: number };
        rateLimitRemaining = rl.remaining;
        if (!rl.allowed) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Maximum 20 requests per minute allowed." }),
            {
              status: 429,
              headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
                "X-RateLimit-Limit": String(MAX_REQUESTS_PER_WINDOW),
                "X-RateLimit-Remaining": "0",
              },
            }
          );
        }
      }
    }

    // 4. Request Payload Parsing & Model Allow-List Validation
    const body: AIProxyPayload = await req.json();
    const prompt = body.prompt || body.task || "";
    if (!prompt.trim()) {
      return new Response(JSON.stringify({ error: "Prompt or input text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const requestedModel = (body.model || "gpt-4o-mini").toLowerCase();
    if (!ALLOWED_MODELS.includes(requestedModel as any)) {
      return new Response(
        JSON.stringify({
          error: `Model '${body.model}' is not allowed. Allowed models: ${ALLOWED_MODELS.join(", ")}`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const providerName = (body.provider || "openai").toLowerCase();
    const adapter = adapters[providerName];
    if (!adapter) {
      return new Response(JSON.stringify({ error: `Unsupported AI provider '${body.provider}'.` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 5. Encrypted Key Retrieval via Service Role (Strict user key only; no server fallback)
    let apiKey: string | null = null;
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.rpc("get_decrypted_user_ai_key", {
        p_user_id: user.id,
        p_provider: providerName,
      });
      if (!error && data) {
        apiKey = data as string;
      }
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "No AI provider API key configured. Please set your provider API key in account settings.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 6. Audit Logging
    if (supabaseAdmin) {
      await supabaseAdmin
        .from("ai_usage_logs")
        .insert({
          user_id: user.id,
          provider: providerName,
          model: requestedModel,
        })
        .catch(() => {
          // Non-blocking audit log record
        });
    }

    // 7. Execute Provider Stream Passthrough
    const stream = await adapter.streamCompletion({
      model: requestedModel,
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      userPrompt: prompt,
      apiKey,
    });

    return new Response(stream, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-RateLimit-Limit": String(MAX_REQUESTS_PER_WINDOW),
        "X-RateLimit-Remaining": String(rateLimitRemaining),
      },
    });
  } catch (err: any) {
    if (err instanceof Response) {
      return err;
    }
    return new Response(JSON.stringify({ error: err.message || "Internal server error in AI proxy" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

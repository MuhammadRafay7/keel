/**
 * Keel AI Agent Edge Function.
 *
 * Architecture & Constraints:
 * 1. Two Supabase Clients:
 *    - User-scoped client: used for ALL tool executions (subject to project RLS).
 *    - Service-role client: used ONLY for key decryption, rate limiting, usage logs, and conversation persistence.
 * 2. Multi-turn Agent loop with max 12 turns budget.
 * 3. Inline confirmation for destructive actions (delete, bulk delete, archive).
 * 4. SSE streaming of lifecycle events: text, tool_call, tool_result, confirm, error, done.
 */

/* eslint-disable no-await-in-loop */
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleCors, corsHeaders } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth.ts";
import {
  DEFAULT_MODEL_BY_PROVIDER,
  PROVIDER_PREFERENCE,
  ALLOWED_MODELS,
  providerForModel,
  type TProvider,
} from "../_shared/types.ts";
import type { AgentMsg, AgentTurn, ToolApproval, ToolResult } from "../_shared/agent-types.ts";
import type { AIProviderAdapter } from "../ai-proxy/adapters/types.ts";
import {
  DeepSeekAdapter,
  GroqAdapter,
  MistralAdapter,
  OpenAIAdapter,
  XAIAdapter,
} from "../ai-proxy/adapters/openai.ts";
import { AnthropicAdapter } from "../ai-proxy/adapters/anthropic.ts";
import { GoogleAdapter } from "../ai-proxy/adapters/google.ts";
import { AGENT_TOOLS, executeAgentTool } from "./tools.ts";

const adapters: Record<TProvider, AIProviderAdapter> = {
  anthropic: new AnthropicAdapter(),
  openai: OpenAIAdapter(),
  google: new GoogleAdapter(),
  groq: GroqAdapter(),
  mistral: MistralAdapter(),
  deepseek: DeepSeekAdapter(),
  xai: XAIAdapter(),
};

const AGENT_SYSTEM_PROMPT =
  "You are Keel AI Agent, an intelligent and capable project management assistant integrated directly into Keel. " +
  "You help users manage projects, work items, cycles, modules, states, and saved views. " +
  "You have access to tools to query and mutate project data. " +
  "Guidelines:\n" +
  "- Always use the appropriate tool to find existing IDs (projects, states, labels, members) before creating or updating items.\n" +
  "- When the user asks you to create, update, or search items, execute the tool and explain clearly what you did.\n" +
  "- When modifying work items, summarize the resulting changes cleanly.\n" +
  "- If a tool call reports an error, inspect the error message and attempt to correct your arguments.\n" +
  "- Reply in clear, professional Markdown.";

const MAX_TURNS_PER_REQUEST = 12;
const MAX_REQUESTS_PER_WINDOW = 30;

const jsonError = (message: string, status: number) =>
  new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

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
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "POST") return jsonError("Method not allowed", 405);

  try {
    const { user, token } = await requireAuth(req);

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      return jsonError("Server configuration missing environment keys", 500);
    }

    // 1. Service Role Client (for key decryption, rate limiting, logging, persistence)
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    // 2. User-Scoped Client (strictly for ALL tool executions)
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    // 3. Per-User Rate Limiting
    const { data: rlData, error: rlErr } = await serviceClient.rpc("check_ai_rate_limit", {
      p_user_id: user.id,
      p_max_requests: MAX_REQUESTS_PER_WINDOW,
      p_window_seconds: 60,
    });

    if (!rlErr && rlData && typeof rlData === "object") {
      const rl = rlData as { allowed: boolean; remaining: number };
      if (!rl.allowed) {
        return jsonError("Rate limit exceeded. Please wait a minute before making more agent requests.", 429);
      }
    }

    // 4. Request Payload
    const body = await req.json();
    const {
      conversation_id: reqConversationId,
      workspace_id: workspaceId,
      project_id: projectId,
      message,
      model: requestedModel,
      approvals,
    }: {
      conversation_id?: string;
      workspace_id?: string;
      project_id?: string;
      message?: string;
      model?: string;
      approvals?: ToolApproval[];
    } = body;

    // 5. Provider & Model Resolution
    const stored = await activeProviders(serviceClient, user.id);
    if (stored.length === 0) {
      return jsonError("No AI provider API key configured. Please configure your key in Settings → AI provider.", 400);
    }

    let provider: TProvider;
    let model: string;

    if (requestedModel) {
      const resolved = providerForModel(requestedModel);
      if (!resolved) {
        return jsonError(`Model '${requestedModel}' is not allowed. Allowed models: ${ALLOWED_MODELS.join(", ")}`, 400);
      }
      if (!stored.includes(resolved)) {
        return jsonError(`Model '${requestedModel}' requires a ${resolved} API key in Settings.`, 400);
      }
      provider = resolved;
      model = requestedModel.trim().toLowerCase();
    } else {
      provider = stored[0];
      model = DEFAULT_MODEL_BY_PROVIDER[provider];
    }

    const adapter = adapters[provider];
    if (!adapter) return jsonError(`Unsupported AI provider '${provider}'.`, 400);

    // 6. Decrypt user's API key
    const { data: keyData, error: keyError } = await serviceClient.rpc("get_decrypted_user_ai_key", {
      p_user_id: user.id,
      p_provider: provider,
    });
    const apiKey = !keyError && keyData ? (keyData as string) : null;
    if (!apiKey) {
      return jsonError(`No active ${provider} API key configured.`, 400);
    }

    // 7. Conversation Management
    let conversationId = reqConversationId;
    if (!conversationId) {
      const { data: convData, error: convError } = await serviceClient
        .from("ai_conversations")
        .insert({
          user_id: user.id,
          workspace_id: workspaceId || null,
          project_id: projectId || null,
          title: message ? message.slice(0, 60) : "New conversation",
        })
        .select("id")
        .single();

      if (convError || !convData) {
        return jsonError(`Failed to create conversation: ${convError?.message}`, 500);
      }
      conversationId = convData.id;
    }

    // 8. Load conversation history
    const { data: dbMessages, error: msgError } = await serviceClient
      .from("ai_messages")
      .select("role, content, seq")
      .eq("conversation_id", conversationId)
      .order("seq", { ascending: true });

    if (msgError) {
      return jsonError(`Failed to load messages: ${msgError.message}`, 500);
    }

    let nextSeq = (dbMessages?.length ?? 0) + 1;
    const history: AgentMsg[] = (dbMessages ?? []).map((m: any) => {
      const content = m.content ?? {};
      if (m.role === "user") {
        return { role: "user", text: content.text ?? "" };
      }
      if (m.role === "assistant") {
        return {
          role: "assistant",
          text: content.text ?? "",
          toolCalls: content.toolCalls ?? [],
        };
      }
      if (m.role === "tool") {
        return {
          role: "tool",
          results: content.results ?? [],
        };
      }
      return { role: "user", text: "" };
    });

    // 9. Prepare tool specs
    const toolSpecs = Object.values(AGENT_TOOLS).map((t) => t.spec);

    // 10. Streaming Response Setup
    const encoder = new TextEncoder();

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const sendEvent = (event: Record<string, unknown>) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        };

        try {
          // Handle pending approvals if resuming
          if (Array.isArray(approvals) && approvals.length > 0) {
            const toolResults: ToolResult[] = [];

            for (const app of approvals) {
              if (app.approved) {
                sendEvent({ type: "tool_call", toolCall: { id: app.tool_use_id, name: app.tool_name } });
                const toolDef = AGENT_TOOLS[app.tool_name];
                if (toolDef) {
                  // Find arguments from previous turn's toolCalls
                  const lastAssistantMsg = [...history].toReversed().find((m) => m.role === "assistant");
                  const originalCall =
                    lastAssistantMsg?.role === "assistant"
                      ? lastAssistantMsg.toolCalls.find((tc) => tc.id === app.tool_use_id)
                      : null;

                  const res = await executeAgentTool(app.tool_name, originalCall?.input ?? {}, userClient, {
                    userId: user.id,
                  });
                  toolResults.push({
                    id: app.tool_use_id,
                    name: app.tool_name,
                    content: res.content,
                    isError: res.isError,
                  });
                  sendEvent({
                    type: "tool_result",
                    toolResult: {
                      id: app.tool_use_id,
                      name: app.tool_name,
                      content: res.content,
                      isError: res.isError,
                    },
                  });
                }
              } else {
                toolResults.push({
                  id: app.tool_use_id,
                  name: app.tool_name,
                  content: "User declined execution of this action.",
                  isError: false,
                });
                sendEvent({
                  type: "tool_result",
                  toolResult: {
                    id: app.tool_use_id,
                    name: app.tool_name,
                    content: "User declined execution of this action.",
                  },
                });
              }
            }

            const toolTurn: AgentMsg = { role: "tool", results: toolResults };
            history.push(toolTurn);

            await serviceClient.from("ai_messages").insert({
              conversation_id: conversationId,
              user_id: user.id,
              role: "tool",
              content: { results: toolResults },
              seq: nextSeq++,
            });
          } else if (message?.trim()) {
            const userTurn: AgentMsg = { role: "user", text: message.trim() };
            history.push(userTurn);

            await serviceClient.from("ai_messages").insert({
              conversation_id: conversationId,
              user_id: user.id,
              role: "user",
              content: { text: message.trim() },
              seq: nextSeq++,
            });
          }

          // Main Agent Execution Loop
          let turnCount = 0;
          while (turnCount < MAX_TURNS_PER_REQUEST) {
            turnCount++;

            const turn: AgentTurn = await adapter.complete(history, toolSpecs, {
              model,
              systemPrompt: AGENT_SYSTEM_PROMPT,
              apiKey,
            });

            // Log Token Usage in ai_usage_logs
            try {
              await serviceClient.from("ai_usage_logs").insert({
                user_id: user.id,
                provider,
                model,
                prompt_tokens: turn.usage.prompt_tokens,
                completion_tokens: turn.usage.completion_tokens,
              });
            } catch {
              // Best-effort audit logging
            }

            if (turn.text) {
              sendEvent({ type: "text", text: turn.text });
            }

            // If assistant wants to call tools
            if (turn.toolCalls && turn.toolCalls.length > 0) {
              history.push({
                role: "assistant",
                text: turn.text,
                toolCalls: turn.toolCalls,
              });

              await serviceClient.from("ai_messages").insert({
                conversation_id: conversationId,
                user_id: user.id,
                role: "assistant",
                content: { text: turn.text, toolCalls: turn.toolCalls },
                seq: nextSeq++,
              });

              // Check if any tool is destructive and requires confirmation
              const destructiveCall = turn.toolCalls.find((tc) => AGENT_TOOLS[tc.name]?.destructive);

              if (destructiveCall) {
                // Emit confirmation request and pause execution
                sendEvent({
                  type: "confirm",
                  toolCall: destructiveCall,
                });
                sendEvent({ type: "done", conversationId });
                return;
              }

              // Otherwise execute tools automatically
              const toolResults: ToolResult[] = [];
              for (const tc of turn.toolCalls) {
                sendEvent({ type: "tool_call", toolCall: tc });
                const res = await executeAgentTool(tc.name, tc.input, userClient, { userId: user.id });
                toolResults.push({ id: tc.id, name: tc.name, content: res.content, isError: res.isError });
                sendEvent({
                  type: "tool_result",
                  toolResult: { id: tc.id, name: tc.name, content: res.content, isError: res.isError },
                });
              }

              history.push({
                role: "tool",
                results: toolResults,
              });

              await serviceClient.from("ai_messages").insert({
                conversation_id: conversationId,
                user_id: user.id,
                role: "tool",
                content: { results: toolResults },
                seq: nextSeq++,
              });

              // Continue loop so agent can process results
              continue;
            }

            // Normal completion with no tool calls
            history.push({
              role: "assistant",
              text: turn.text,
              toolCalls: [],
            });

            await serviceClient.from("ai_messages").insert({
              conversation_id: conversationId,
              user_id: user.id,
              role: "assistant",
              content: { text: turn.text, toolCalls: [] },
              seq: nextSeq++,
            });

            break;
          }

          sendEvent({ type: "done", conversationId });
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : "Keel AI agent turn failed";
          sendEvent({ type: "error", error: errorMessage });
          sendEvent({ type: "done", conversationId });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Keel-AI-Conversation-Id": conversationId,
      },
    });
  } catch (err: unknown) {
    const error = err as any;
    if (error instanceof Response) return error;
    return jsonError(error?.message || "Internal server error in Keel AI Agent", 500);
  }
});

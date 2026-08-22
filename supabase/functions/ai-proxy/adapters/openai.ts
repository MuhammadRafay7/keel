/**
 * OpenAI-compatible provider adapter for the Keel AI Proxy.
 *
 * OpenAI's `/chat/completions` shape is the de-facto standard: Groq, Mistral,
 * DeepSeek and xAI all serve it byte-for-byte. One adapter parameterized by
 * base URL covers them, so adding such a provider is a registry entry rather
 * than another copy of this file.
 */

import { readSSE, type TStreamDelta } from "../../_shared/sse.ts";
import type { AgentMsg, ToolSpec, ToolCall, AgentTurn, AgentAdapterOptions } from "../../_shared/agent-types.ts";
import { type AIProviderAdapter, type CompletionParams, providerError } from "./types.ts";

export class OpenAICompatibleAdapter implements AIProviderAdapter {
  readonly providerName: string;
  private readonly baseUrl: string;
  private readonly label: string;
  /** Not every clone implements usage-on-stream; asking for it can 400. */
  private readonly supportsUsageOption: boolean;

  constructor(options: { providerName: string; baseUrl: string; label: string; supportsUsageOption?: boolean }) {
    this.providerName = options.providerName;
    this.baseUrl = options.baseUrl;
    this.label = options.label;
    this.supportsUsageOption = options.supportsUsageOption ?? true;
  }

  async *streamDeltas(params: CompletionParams): AsyncGenerator<TStreamDelta> {
    const { model, systemPrompt, userPrompt, apiKey } = params;

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
        // Without this the usage object is omitted from a streamed response
        // and every audit row records zero tokens.
        ...(this.supportsUsageOption ? { stream_options: { include_usage: true } } : {}),
      }),
    });

    if (!response.ok) throw await providerError(this.label, response);
    if (!response.body) throw new Error(`${this.label} API response body is empty`);

    for await (const frame of readSSE(response.body)) {
      if (frame.data === "[DONE]") return;

      let chunk: {
        choices?: { delta?: { content?: string } }[];
        usage?: { prompt_tokens?: number; completion_tokens?: number } | null;
        error?: { message?: string };
      };
      try {
        chunk = JSON.parse(frame.data);
      } catch {
        continue;
      }

      if (chunk.error) throw new Error(chunk.error.message || `${this.label} stream error`);

      const text = chunk.choices?.[0]?.delta?.content;
      if (text) yield { text };

      // The usage frame arrives last and carries no choices.
      if (chunk.usage) {
        yield {
          usage: {
            prompt_tokens: chunk.usage.prompt_tokens ?? 0,
            completion_tokens: chunk.usage.completion_tokens ?? 0,
          },
        };
      }
    }
  }

  async complete(messages: AgentMsg[], tools: ToolSpec[], opts: AgentAdapterOptions): Promise<AgentTurn> {
    const { model, systemPrompt, apiKey, maxTokens = 4096 } = opts;

    // Convert neutral messages to OpenAI wire format
    const openAIMessages: Array<Record<string, unknown>> = [{ role: "system", content: systemPrompt }];

    for (const msg of messages) {
      switch (msg.role) {
        case "user":
          openAIMessages.push({ role: "user", content: msg.text });
          break;
        case "assistant": {
          const assistantMsg: Record<string, unknown> = {
            role: "assistant",
            content: msg.text || null,
          };
          if (msg.toolCalls.length > 0) {
            assistantMsg.tool_calls = msg.toolCalls.map((tc) => ({
              id: tc.id,
              type: "function",
              function: {
                name: tc.name,
                arguments: JSON.stringify(tc.input),
              },
            }));
          }
          openAIMessages.push(assistantMsg);
          break;
        }
        case "tool":
          for (const result of msg.results) {
            openAIMessages.push({
              role: "tool",
              tool_call_id: result.id,
              content: result.content,
            });
          }
          break;
      }
    }

    const openAITools = tools.map((t) => ({
      type: "function",
      function: {
        name: t.name,
        description: t.description,
        parameters: t.input_schema,
      },
    }));

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: openAIMessages,
        max_tokens: maxTokens,
        ...(openAITools.length > 0 ? { tools: openAITools } : {}),
      }),
    });

    if (!response.ok) throw await providerError(this.label, response);

    const data = await response.json();
    const choice = data.choices?.[0];
    const message = choice?.message ?? {};
    const text = message.content || "";
    const toolCalls: ToolCall[] = [];

    if (Array.isArray(message.tool_calls)) {
      for (const tc of message.tool_calls) {
        let parsedInput: Record<string, unknown> = {};
        if (tc.function?.arguments) {
          try {
            parsedInput = JSON.parse(tc.function.arguments);
          } catch {
            parsedInput = { raw: tc.function.arguments };
          }
        }
        toolCalls.push({
          id: tc.id || `call_${Math.random().toString(36).slice(2, 9)}`,
          name: tc.function?.name || "",
          input: parsedInput,
        });
      }
    }

    let stopReason: AgentTurn["stopReason"] = "end_turn";
    if (choice?.finish_reason === "tool_calls" || choice?.finish_reason === "function_call" || toolCalls.length > 0) {
      stopReason = "tool_use";
    } else if (choice?.finish_reason === "length") {
      stopReason = "max_tokens";
    }

    return {
      text,
      toolCalls,
      stopReason,
      usage: {
        prompt_tokens: data.usage?.prompt_tokens ?? 0,
        completion_tokens: data.usage?.completion_tokens ?? 0,
      },
    };
  }
}

export const OpenAIAdapter = () =>
  new OpenAICompatibleAdapter({
    providerName: "openai",
    baseUrl: "https://api.openai.com/v1",
    label: "OpenAI",
  });

export const GroqAdapter = () =>
  new OpenAICompatibleAdapter({
    providerName: "groq",
    baseUrl: "https://api.groq.com/openai/v1",
    label: "Groq",
  });

export const MistralAdapter = () =>
  new OpenAICompatibleAdapter({
    providerName: "mistral",
    baseUrl: "https://api.mistral.ai/v1",
    label: "Mistral",
    // Mistral rejects stream_options; it reports usage on its final chunk anyway.
    supportsUsageOption: false,
  });

export const DeepSeekAdapter = () =>
  new OpenAICompatibleAdapter({
    providerName: "deepseek",
    baseUrl: "https://api.deepseek.com/v1",
    label: "DeepSeek",
  });

export const XAIAdapter = () =>
  new OpenAICompatibleAdapter({
    providerName: "xai",
    baseUrl: "https://api.x.ai/v1",
    label: "xAI",
  });

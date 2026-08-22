/**
 * Anthropic Provider Adapter implementation for Keel AI Proxy.
 *
 * Raw HTTP rather than @anthropic-ai/sdk: the adapter interface is a
 * fetch-and-decode contract shared with the OpenAI and Google adapters, and
 * pulling an SDK into one of the three would add cold-start weight to an Edge
 * Function for a single non-streaming-helper call.
 */

import { readSSE, type TStreamDelta } from "../../_shared/sse.ts";
import type { AgentMsg, ToolSpec, ToolCall, AgentTurn, AgentAdapterOptions } from "../../_shared/agent-types.ts";
import { type AIProviderAdapter, type CompletionParams, providerError } from "./types.ts";

const ANTHROPIC_VERSION = "2023-06-01";
const MAX_TOKENS = 4096;

export class AnthropicAdapter implements AIProviderAdapter {
  readonly providerName = "anthropic";

  async *streamDeltas(params: CompletionParams): AsyncGenerator<TStreamDelta> {
    const { model, systemPrompt, userPrompt, apiKey } = params;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: MAX_TOKENS,
        // Anthropic takes the system prompt as a top-level field, not as a
        // message with role "system".
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
        stream: true,
      }),
    });

    if (!response.ok) throw await providerError("Anthropic", response);
    if (!response.body) throw new Error("Anthropic API response body is empty");

    for await (const frame of readSSE(response.body)) {
      let chunk: {
        type?: string;
        delta?: { type?: string; text?: string };
        message?: { usage?: { input_tokens?: number; output_tokens?: number } };
        usage?: { input_tokens?: number; output_tokens?: number };
        error?: { message?: string };
      };
      try {
        chunk = JSON.parse(frame.data);
      } catch {
        continue;
      }

      switch (chunk.type) {
        case "content_block_delta":
          // Thinking blocks arrive as thinking_delta on the same event; only
          // text_delta belongs in the answer.
          if (chunk.delta?.type === "text_delta" && chunk.delta.text) {
            yield { text: chunk.delta.text };
          }
          break;
        case "message_start":
          if (chunk.message?.usage?.input_tokens) {
            yield { usage: { prompt_tokens: chunk.message.usage.input_tokens } };
          }
          break;
        case "message_delta":
          // Cumulative output count for the message, sent near the end.
          if (chunk.usage?.output_tokens) {
            yield { usage: { completion_tokens: chunk.usage.output_tokens } };
          }
          break;
        case "error":
          throw new Error(chunk.error?.message || "Anthropic stream error");
        case "message_stop":
          return;
      }
    }
  }

  async complete(messages: AgentMsg[], tools: ToolSpec[], opts: AgentAdapterOptions): Promise<AgentTurn> {
    const { model, systemPrompt, apiKey, maxTokens = MAX_TOKENS } = opts;

    // Convert neutral messages to Anthropic wire format
    const anthropicMessages = messages.map((msg) => {
      switch (msg.role) {
        case "user":
          return { role: "user", content: msg.text };
        case "assistant": {
          const content: Array<
            | { type: "text"; text: string }
            | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }
          > = [];
          if (msg.text) {
            content.push({ type: "text", text: msg.text });
          }
          for (const tc of msg.toolCalls) {
            content.push({
              type: "tool_use",
              id: tc.id,
              name: tc.name,
              input: tc.input,
            });
          }
          return { role: "assistant", content };
        }
        case "tool": {
          const content = msg.results.map((r) => ({
            type: "tool_result",
            tool_use_id: r.id,
            content: r.content,
            ...(r.isError ? { is_error: true } : {}),
          }));
          return { role: "user", content };
        }
      }
    });

    const anthropicTools = tools.map((t) => ({
      name: t.name,
      description: t.description,
      input_schema: t.input_schema,
    }));

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: anthropicMessages,
        ...(anthropicTools.length > 0 ? { tools: anthropicTools } : {}),
      }),
    });

    if (!response.ok) throw await providerError("Anthropic", response);

    const data = await response.json();
    let text = "";
    const toolCalls: ToolCall[] = [];

    if (Array.isArray(data.content)) {
      for (const block of data.content) {
        if (block.type === "text" && block.text) {
          text += block.text;
        } else if (block.type === "tool_use") {
          toolCalls.push({
            id: block.id,
            name: block.name,
            input: (block.input ?? {}) as Record<string, unknown>,
          });
        }
      }
    }

    let stopReason: AgentTurn["stopReason"] = "end_turn";
    if (data.stop_reason === "tool_use") {
      stopReason = "tool_use";
    } else if (data.stop_reason === "max_tokens") {
      stopReason = "max_tokens";
    } else if (data.stop_reason === "refusal") {
      stopReason = "refusal";
    }

    return {
      text,
      toolCalls,
      stopReason,
      usage: {
        prompt_tokens: data.usage?.input_tokens ?? 0,
        completion_tokens: data.usage?.output_tokens ?? 0,
      },
    };
  }
}

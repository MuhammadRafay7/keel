/**
 * Google Gemini Provider Adapter implementation for Keel AI Proxy.
 */

import { readSSE, type TStreamDelta } from "../../_shared/sse.ts";
import type { AgentMsg, ToolSpec, ToolCall, AgentTurn, AgentAdapterOptions } from "../../_shared/agent-types.ts";
import { type AIProviderAdapter, type CompletionParams, providerError } from "./types.ts";

const API_ROOT = "https://generativelanguage.googleapis.com/v1beta/models";

export class GoogleAdapter implements AIProviderAdapter {
  readonly providerName = "google";

  async *streamDeltas(params: CompletionParams): AsyncGenerator<TStreamDelta> {
    const { model, systemPrompt, userPrompt, apiKey } = params;

    // Without alt=sse this endpoint streams a JSON array rather than events.
    const response = await fetch(`${API_ROOT}/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`, {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      }),
    });

    if (!response.ok) throw await providerError("Google", response);
    if (!response.body) throw new Error("Google API response body is empty");

    let promptTokens = 0;
    let completionTokens = 0;

    for await (const frame of readSSE(response.body)) {
      if (frame.data === "[DONE]") break;

      let chunk: {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
        usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
        error?: { message?: string };
      };
      try {
        chunk = JSON.parse(frame.data);
      } catch {
        continue;
      }

      if (chunk.error) throw new Error(chunk.error.message || "Google stream error");

      const parts = chunk.candidates?.[0]?.content?.parts ?? [];
      const text = parts.map((part) => part.text ?? "").join("");
      if (text) yield { text };

      // usageMetadata repeats on every chunk with running totals; keep the last.
      if (chunk.usageMetadata) {
        promptTokens = chunk.usageMetadata.promptTokenCount ?? promptTokens;
        completionTokens = chunk.usageMetadata.candidatesTokenCount ?? completionTokens;
      }
    }

    if (promptTokens || completionTokens) {
      yield { usage: { prompt_tokens: promptTokens, completion_tokens: completionTokens } };
    }
  }

  async complete(messages: AgentMsg[], tools: ToolSpec[], opts: AgentAdapterOptions): Promise<AgentTurn> {
    const { model, systemPrompt, apiKey } = opts;

    // Convert neutral messages to Gemini contents wire format
    const geminiContents: Array<{ role: "user" | "model" | "function"; parts: Array<Record<string, unknown>> }> = [];

    for (const msg of messages) {
      switch (msg.role) {
        case "user":
          geminiContents.push({
            role: "user",
            parts: [{ text: msg.text }],
          });
          break;
        case "assistant": {
          const parts: Array<Record<string, unknown>> = [];
          if (msg.text) parts.push({ text: msg.text });
          for (const tc of msg.toolCalls) {
            parts.push({
              functionCall: {
                name: tc.name,
                args: tc.input,
              },
            });
          }
          geminiContents.push({
            role: "model",
            parts,
          });
          break;
        }
        case "tool": {
          const parts = msg.results.map((r) => ({
            functionResponse: {
              name: r.name,
              response: { content: r.content, isError: r.isError },
            },
          }));
          geminiContents.push({
            role: "function",
            parts,
          });
          break;
        }
      }
    }

    const geminiTools =
      tools.length > 0
        ? [
            {
              functionDeclarations: tools.map((t) => ({
                name: t.name,
                description: t.description,
                parameters: t.input_schema,
              })),
            },
          ]
        : undefined;

    const response = await fetch(`${API_ROOT}/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: geminiContents,
        ...(geminiTools ? { tools: geminiTools } : {}),
      }),
    });

    if (!response.ok) throw await providerError("Google", response);

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const parts = candidate?.content?.parts ?? [];
    let text = "";
    const toolCalls: ToolCall[] = [];

    for (const part of parts) {
      if (part.text) {
        text += part.text;
      }
      if (part.functionCall) {
        toolCalls.push({
          id: `call_${Math.random().toString(36).slice(2, 9)}`,
          name: part.functionCall.name,
          input: (part.functionCall.args ?? {}) as Record<string, unknown>,
        });
      }
    }

    let stopReason: AgentTurn["stopReason"] = "end_turn";
    if (toolCalls.length > 0) {
      stopReason = "tool_use";
    } else if (candidate?.finishReason === "MAX_TOKENS") {
      stopReason = "max_tokens";
    }

    return {
      text,
      toolCalls,
      stopReason,
      usage: {
        prompt_tokens: data.usageMetadata?.promptTokenCount ?? 0,
        completion_tokens: data.usageMetadata?.candidatesTokenCount ?? 0,
      },
    };
  }
}

/**
 * OpenAI Provider Adapter implementation for Keel AI Proxy.
 */

import type { AIProviderAdapter, CompletionParams } from "./types.ts";

export class OpenAIAdapter implements AIProviderAdapter {
  readonly providerName = "openai";

  async streamCompletion(params: CompletionParams): Promise<ReadableStream<Uint8Array>> {
    const { model, systemPrompt, userPrompt, apiKey } = params;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model || "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI Provider Error (${response.status}): ${errorText}`);
    }

    if (!response.body) {
      throw new Error("OpenAI API response body is empty");
    }

    return response.body;
  }
}

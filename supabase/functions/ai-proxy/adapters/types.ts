/**
 * Provider Adapter interface for Keel AI Proxy.
 */

import type { TStreamDelta } from "../../_shared/sse.ts";
import type { AgentMsg, ToolSpec, AgentAdapterOptions, AgentTurn } from "../../_shared/agent-types.ts";

export interface CompletionParams {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  apiKey: string;
}

export interface AIProviderAdapter {
  providerName: string;
  /**
   * Calls the provider and decodes its stream into normalized deltas. Throwing
   * before the first yield surfaces as an HTTP error; throwing after it is
   * reported in-band, because the response has already begun.
   */
  streamDeltas(params: CompletionParams): AsyncGenerator<TStreamDelta>;

  /**
   * Non-streaming completion with provider-neutral tool calling for the Keel AI Agent.
   */
  complete(messages: AgentMsg[], tools: ToolSpec[], opts: AgentAdapterOptions): Promise<AgentTurn>;
}

/** Reads a provider's error body without letting a huge page through. */
export async function providerError(provider: string, response: Response): Promise<Error> {
  const body = await response.text().catch(() => "");
  return new Error(`${provider} provider error (${response.status}): ${body.slice(0, 500)}`);
}

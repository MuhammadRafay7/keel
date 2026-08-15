/**
 * Provider Adapter interface for Keel AI Proxy.
 */

export interface CompletionParams {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  apiKey: string;
}

export interface AIProviderAdapter {
  providerName: string;
  streamCompletion(params: CompletionParams): Promise<ReadableStream<Uint8Array>>;
}

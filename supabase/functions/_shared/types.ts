/**
 * Shared types and constants for Keel AI Edge Functions.
 */

export const DEFAULT_SYSTEM_PROMPT =
  "You are Keel AI Assistant, a helpful assistant integrated into Keel project management. " +
  "Assist users with work items, descriptions, summarize tasks, and rephrase text clearly and professionally. " +
  "Reply in plain Markdown. Do not wrap the whole answer in a code fence.";

/**
 * The model allow-list, keyed by the provider that can actually serve each one.
 *
 * The provider is derived from the model rather than taken from the request:
 * a client that asked for a Claude model and a provider of "openai" used to
 * pass validation and then get posted to OpenAI, which rejected it. One table
 * means the allow-list and the adapter registry cannot drift apart.
 */
export const MODELS_BY_PROVIDER = {
  anthropic: [
    "claude-opus-5",
    "claude-sonnet-5",
    "claude-haiku-4-5",
    "claude-opus-4-8",
    "claude-opus-4-7",
    "claude-opus-4-6",
    "claude-sonnet-4-6",
  ],
  openai: ["gpt-4o", "gpt-4o-mini", "gpt-4.1", "gpt-4.1-mini", "gpt-4.1-nano"],
  google: ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"],
  groq: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"],
  mistral: ["mistral-large-latest", "mistral-small-latest", "codestral-latest"],
  deepseek: ["deepseek-chat", "deepseek-reasoner"],
  xai: ["grok-4", "grok-3", "grok-3-mini"],
} as const satisfies Record<string, readonly string[]>;

export type TProvider = keyof typeof MODELS_BY_PROVIDER;

export const PROVIDERS = Object.keys(MODELS_BY_PROVIDER) as TProvider[];

export const ALLOWED_MODELS: readonly string[] = Object.values(MODELS_BY_PROVIDER).flat();

/** The model used when a request names a provider but no specific model. */
export const DEFAULT_MODEL_BY_PROVIDER: Record<TProvider, string> = {
  anthropic: "claude-opus-5",
  openai: "gpt-4o-mini",
  google: "gemini-2.5-flash",
  groq: "llama-3.3-70b-versatile",
  mistral: "mistral-large-latest",
  deepseek: "deepseek-chat",
  xai: "grok-4",
};

/** Order used to pick a provider when the user has more than one key stored. */
export const PROVIDER_PREFERENCE: TProvider[] = ["anthropic", "openai", "google", "xai", "mistral", "deepseek", "groq"];

/**
 * Resolves the provider that owns a model id, or null when the model is not on
 * the allow-list.
 */
export function providerForModel(model: string): TProvider | null {
  const normalized = model.trim().toLowerCase();
  for (const provider of PROVIDERS) {
    if ((MODELS_BY_PROVIDER[provider] as readonly string[]).includes(normalized)) return provider;
  }
  return null;
}

export interface AIProxyPayload {
  prompt?: string;
  task?: string;
  model?: string;
  provider?: string;
  casual_score?: number;
  formal_score?: number;
  title?: string;
  description?: string;
}

export interface UserApiKeyRow {
  provider: string;
  key_hint: string;
  is_active: boolean;
  updated_at: string;
}

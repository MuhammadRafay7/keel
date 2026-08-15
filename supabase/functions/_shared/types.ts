/**
 * Shared types and constants for Keel AI Edge Functions.
 */

export const DEFAULT_SYSTEM_PROMPT =
  "You are Keel AI Assistant, a helpful assistant integrated into Keel project management. " +
  "Assist users with work items, descriptions, summarize tasks, and rephrase text clearly and professionally.";

export const ALLOWED_MODELS = ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "claude-3-5-sonnet", "gemini-1.5-pro"] as const;

export type TAllowedModel = (typeof ALLOWED_MODELS)[number];

export interface AIProxyPayload {
  prompt: string;
  task?: string;
  model?: TAllowedModel | string;
  provider?: string;
  casual_score?: number;
  formal_score?: number;
}

export interface UserApiKeyRow {
  provider: string;
  key_hint: string;
  is_active: boolean;
  updated_at: string;
}

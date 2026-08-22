/**
 * Provider-neutral types for Keel AI Agent.
 */

export interface ToolSpec {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface ToolResult {
  id: string;
  name: string;
  content: string;
  isError?: boolean;
}

export type AgentMsg =
  | { role: "user"; text: string }
  | { role: "assistant"; text: string; toolCalls: ToolCall[] }
  | { role: "tool"; results: ToolResult[] };

export interface AgentTurn {
  text: string;
  toolCalls: ToolCall[];
  stopReason: "end_turn" | "tool_use" | "max_tokens" | "refusal";
  usage: { prompt_tokens: number; completion_tokens: number };
}

export interface AgentAdapterOptions {
  model: string;
  systemPrompt: string;
  apiKey: string;
  maxTokens?: number;
}

export interface ToolApproval {
  tool_use_id: string;
  tool_name: string;
  approved: boolean;
}

export type AgentStreamEvent =
  | { type: "text"; text: string }
  | { type: "tool_call"; toolCall: ToolCall }
  | { type: "tool_result"; toolResult: ToolResult }
  | { type: "confirm"; toolCall: ToolCall }
  | { type: "error"; error: string }
  | { type: "done"; conversationId: string };

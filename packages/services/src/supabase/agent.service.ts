/**
 * Supabase Keel AI Agent Client Service.
 *
 * Provides typed methods for conversation lifecycle management and SSE streaming event consumption.
 */

import { getSupabase } from "./client";

export interface AgentConversation {
  id: string;
  title: string;
  workspace_id?: string | null;
  project_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgentMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "tool";
  content: Record<string, any>;
  seq: number;
  created_at: string;
}

export interface ToolApprovalPayload {
  tool_use_id: string;
  tool_name: string;
  approved: boolean;
}

export type AgentEvent =
  | { type: "text"; text: string }
  | { type: "tool_call"; toolCall: { id: string; name: string; input?: Record<string, any> } }
  | { type: "tool_result"; toolResult: { id: string; name: string; content: string; isError?: boolean } }
  | { type: "confirm"; toolCall: { id: string; name: string; input?: Record<string, any> } }
  | { type: "error"; error: string }
  | { type: "done"; conversationId: string };

export interface SendAgentMessagePayload {
  conversation_id?: string;
  workspace_id?: string;
  project_id?: string;
  message?: string;
  model?: string;
  approvals?: ToolApprovalPayload[];
}

export class SupabaseAgentService {
  /**
   * Lists all conversations for the current signed-in user.
   */
  async listConversations(workspaceId?: string): Promise<AgentConversation[]> {
    const supabase = getSupabase();
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) throw new Error("Not signed in.");

    let query = supabase
      .from("ai_conversations")
      .select("id, title, workspace_id, project_id, created_at, updated_at")
      .eq("user_id", sessionData.session.user.id)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });

    if (workspaceId) {
      query = query.eq("workspace_id", workspaceId);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to load AI conversations: ${error.message}`);
    return (data ?? []) as AgentConversation[];
  }

  /**
   * Retrieves all messages for a specific conversation.
   */
  async getConversationMessages(conversationId: string): Promise<AgentMessage[]> {
    const supabase = getSupabase();
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) throw new Error("Not signed in.");

    const { data, error } = await supabase
      .from("ai_messages")
      .select("id, conversation_id, role, content, seq, created_at")
      .eq("conversation_id", conversationId)
      .order("seq", { ascending: true });

    if (error) throw new Error(`Failed to load conversation history: ${error.message}`);
    return (data ?? []) as AgentMessage[];
  }

  /**
   * Deletes a conversation.
   */
  async deleteConversation(conversationId: string): Promise<void> {
    const supabase = getSupabase();
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) throw new Error("Not signed in.");

    const { error } = await supabase
      .from("ai_conversations")
      .delete()
      .eq("id", conversationId)
      .eq("user_id", sessionData.session.user.id);

    if (error) throw new Error(`Failed to delete conversation: ${error.message}`);
  }

  /**
   * Sends a message to Keel AI Agent and yields SSE events.
   */
  async *sendMessage(
    payload: SendAgentMessagePayload,
    onEvent?: (event: AgentEvent) => void
  ): AsyncGenerator<AgentEvent> {
    const supabase = getSupabase();
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) throw new Error("Not signed in.");

    const env = (import.meta as unknown as { env?: Record<string, string> }).env;
    const supabaseUrl = env?.VITE_SUPABASE_URL ?? "";

    const response = await fetch(`${supabaseUrl}/functions/v1/ai-agent`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sessionData.session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(errorJson.error || `Agent request failed (${response.status})`);
    }

    if (!response.body) {
      throw new Error("Agent response body is empty");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    const parseEventsFromBuffer = function* (buf: string): Generator<{ event: AgentEvent; remaining: string }> {
      let boundary = buf.search(/\r?\n\r?\n/);
      let cur = buf;

      while (boundary !== -1) {
        const rawFrame = cur.slice(0, boundary);
        cur = cur.slice(boundary).replace(/^\r?\n\r?\n/, "");

        const dataLines = rawFrame
          .split(/\r?\n/)
          .filter((line) => line.startsWith("data:"))
          .map((line) => line.slice(5).replace(/^ /, ""));

        if (dataLines.length > 0) {
          const dataStr = dataLines.join("\n");
          try {
            const parsed = JSON.parse(dataStr) as AgentEvent;
            yield { event: parsed, remaining: cur };
          } catch {
            // ignore malformed SSE frames
          }
        }

        boundary = cur.search(/\r?\n\r?\n/);
      }

      return { remaining: cur };
    };

    try {
      while (true) {
        // eslint-disable-next-line no-await-in-loop
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        for (const { event, remaining } of parseEventsFromBuffer(buffer)) {
          buffer = remaining;
          onEvent?.(event);
          yield event;
        }
      }

      buffer += decoder.decode();
      for (const { event, remaining } of parseEventsFromBuffer(buffer)) {
        buffer = remaining;
        onEvent?.(event);
        yield event;
      }
    } finally {
      reader.releaseLock();
    }
  }
}

export const supabaseAgentService = new SupabaseAgentService();

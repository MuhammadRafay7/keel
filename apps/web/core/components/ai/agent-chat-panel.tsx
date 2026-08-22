import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Send,
  X,
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RefreshCcw,
  Bot,
  User,
  Plus,
  Trash2,
  Layers,
} from "lucide-react";
import { useTranslation } from "@keel/i18n";
import { Button } from "@keel/propel/button";
import { setToast, TOAST_TYPE } from "@keel/propel/toast";
import { cn } from "@keel/utils";
import type { AgentConversation, AgentMessage, AgentEvent, ToolApprovalPayload } from "@keel/services";
import { supabaseAgentService } from "@keel/services";

export interface AgentChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId?: string;
  workspaceSlug?: string;
  projectId?: string;
  projectName?: string;
  onDataMutated?: () => void;
}

interface PendingConfirmation {
  tool_use_id: string;
  tool_name: string;
  input: Record<string, any>;
}

export function AgentChatPanel(props: AgentChatPanelProps) {
  const { isOpen, onClose, workspaceId, workspaceSlug, projectId, projectName, onDataMutated } = props;
  const { t } = useTranslation();

  const [conversations, setConversations] = useState<AgentConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [activeToolCalls, setActiveToolCalls] = useState<Array<{ name: string; status: "running" | "done" }>>([]);
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingConfirmation | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText, activeToolCalls, pendingConfirmation]);

  // Load conversations when opened
  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen, workspaceId]);

  // Load messages when conversation changes
  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
    } else {
      setMessages([]);
      setPendingConfirmation(null);
    }
  }, [activeConversationId]);

  const loadConversations = async () => {
    try {
      const list = await supabaseAgentService.listConversations(workspaceId);
      setConversations(list);
      if (list.length > 0 && !activeConversationId) {
        setActiveConversationId(list[0].id);
      }
    } catch {
      // Ignored if unauthenticated or error
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      const history = await supabaseAgentService.getConversationMessages(convId);
      setMessages(history);
    } catch {
      setMessages([]);
    }
  };

  const handleStartNewConversation = () => {
    setActiveConversationId(null);
    setMessages([]);
    setPendingConfirmation(null);
    setStreamingText("");
    setActiveToolCalls([]);
    setShowHistory(false);
    inputRef.current?.focus();
  };

  const handleDeleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await supabaseAgentService.deleteConversation(convId);
      const remaining = conversations.filter((c) => c.id !== convId);
      setConversations(remaining);
      if (activeConversationId === convId) {
        if (remaining.length > 0) {
          setActiveConversationId(remaining[0].id);
        } else {
          handleStartNewConversation();
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete conversation";
      setToast({ type: TOAST_TYPE.ERROR, title: "Error", message: msg });
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? inputText).trim();
    if (!text || isStreaming) return;

    setInputText("");
    setIsStreaming(true);
    setStreamingText("");
    setActiveToolCalls([]);
    setPendingConfirmation(null);

    // Optimistically add user turn to local UI
    const tempUserMsg: AgentMessage = {
      id: `temp_${Date.now()}`,
      conversation_id: activeConversationId || "new",
      role: "user",
      content: { text },
      seq: messages.length + 1,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    let fullStreamText = "";
    let dataMutationOccurred = false;

    try {
      const generator = supabaseAgentService.sendMessage({
        conversation_id: activeConversationId || undefined,
        workspace_id: workspaceId,
        project_id: projectId,
        message: text,
      });

      for await (const event of generator) {
        if (event.type === "text") {
          fullStreamText += event.text;
          setStreamingText(fullStreamText);
        } else if (event.type === "tool_call") {
          setActiveToolCalls((prev) => [...prev, { name: event.toolCall.name, status: "running" }]);
          if (
            event.toolCall.name.includes("create") ||
            event.toolCall.name.includes("update") ||
            event.toolCall.name.includes("delete") ||
            event.toolCall.name.includes("move") ||
            event.toolCall.name.includes("archive")
          ) {
            dataMutationOccurred = true;
          }
        } else if (event.type === "tool_result") {
          setActiveToolCalls((prev) =>
            prev.map((t) => (t.name === event.toolResult.name ? { ...t, status: "done" } : t))
          );
        } else if (event.type === "confirm") {
          setPendingConfirmation({
            tool_use_id: event.toolCall.id,
            tool_name: event.toolCall.name,
            input: event.toolCall.input ?? {},
          });
        } else if (event.type === "done") {
          if (!activeConversationId && event.conversationId) {
            setActiveConversationId(event.conversationId);
            loadConversations();
          } else if (activeConversationId) {
            loadMessages(activeConversationId);
          }
        } else if (event.type === "error") {
          setToast({ type: TOAST_TYPE.ERROR, title: "Keel AI Error", message: event.error });
        }
      }

      if (dataMutationOccurred) {
        onDataMutated?.();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to connect to Keel AI Agent.";
      setToast({ type: TOAST_TYPE.ERROR, title: "Error", message: msg });
    } finally {
      setIsStreaming(false);
      setStreamingText("");
      setActiveToolCalls([]);
    }
  };

  const handleConfirmationDecision = async (approved: boolean) => {
    if (!pendingConfirmation || !activeConversationId || isStreaming) return;

    const approval: ToolApprovalPayload = {
      tool_use_id: pendingConfirmation.tool_use_id,
      tool_name: pendingConfirmation.tool_name,
      approved,
    };

    setPendingConfirmation(null);
    setIsStreaming(true);
    setStreamingText("");
    setActiveToolCalls([{ name: pendingConfirmation.tool_name, status: "running" }]);

    let dataMutationOccurred = false;

    try {
      const generator = supabaseAgentService.sendMessage({
        conversation_id: activeConversationId,
        approvals: [approval],
      });

      let fullStreamText = "";
      for await (const event of generator) {
        if (event.type === "text") {
          fullStreamText += event.text;
          setStreamingText(fullStreamText);
        } else if (event.type === "tool_call") {
          setActiveToolCalls((prev) => [...prev, { name: event.toolCall.name, status: "running" }]);
          dataMutationOccurred = true;
        } else if (event.type === "tool_result") {
          setActiveToolCalls((prev) =>
            prev.map((t) => (t.name === event.toolResult.name ? { ...t, status: "done" } : t))
          );
        } else if (event.type === "confirm") {
          setPendingConfirmation({
            tool_use_id: event.toolCall.id,
            tool_name: event.toolCall.name,
            input: event.toolCall.input ?? {},
          });
        } else if (event.type === "done") {
          loadMessages(activeConversationId);
        } else if (event.type === "error") {
          setToast({ type: TOAST_TYPE.ERROR, title: "Keel AI Error", message: event.error });
        }
      }

      if (dataMutationOccurred) {
        onDataMutated?.();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to process confirmation.";
      setToast({ type: TOAST_TYPE.ERROR, title: "Error", message: msg });
    } finally {
      setIsStreaming(false);
      setStreamingText("");
      setActiveToolCalls([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="shadow-2xl animate-in slide-in-from-right fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-subtle bg-surface-1/95 backdrop-blur-2xl duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-subtle bg-surface-1 px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-xl bg-accent-primary/10 text-accent-primary">
            <Sparkles className="size-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-14 font-semibold text-primary">Keel AI Agent</h3>
              <span className="inline-flex items-center rounded-full bg-accent-primary/10 px-1.5 py-0.5 text-10 font-medium text-accent-primary">
                Autonomous
              </span>
            </div>
            {projectName && <p className="text-11 text-tertiary">Scope: {projectName}</p>}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowHistory((prev) => !prev)}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-12 font-medium text-secondary transition-colors hover:bg-layer-1"
            title="Conversation History"
          >
            <Layers className="size-3.5" />
            <span>History</span>
            {showHistory ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
          </button>
          <button
            type="button"
            onClick={handleStartNewConversation}
            className="grid size-8 place-items-center rounded-lg text-tertiary transition-colors hover:bg-layer-1 hover:text-primary"
            title="New Chat"
          >
            <Plus className="size-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-lg text-tertiary transition-colors hover:bg-layer-1 hover:text-primary"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* History Drawer */}
      {showHistory && (
        <div className="max-h-48 space-y-1.5 overflow-y-auto border-b border-subtle bg-surface-2 p-3">
          <p className="tracking-wider px-1 text-11 font-semibold text-tertiary uppercase">Past Conversations</p>
          {conversations.length === 0 ? (
            <p className="px-1 py-2 text-12 text-tertiary">No past conversations.</p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => {
                  setActiveConversationId(conv.id);
                  setShowHistory(false);
                }}
                className={cn(
                  "group flex cursor-pointer items-center justify-between rounded-xl px-2.5 py-2 text-12 transition-all",
                  activeConversationId === conv.id
                    ? "bg-accent-primary/10 font-medium text-accent-primary"
                    : "text-secondary hover:bg-layer-1"
                )}
              >
                <span className="truncate pr-2">{conv.title || "Conversation"}</span>
                <button
                  type="button"
                  onClick={(e) => handleDeleteConversation(conv.id, e)}
                  className="p-1 text-tertiary opacity-0 transition-opacity group-hover:opacity-100 hover:text-danger-primary"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && !isStreaming && (
          <div className="flex h-full flex-col items-center justify-center py-16 text-center text-tertiary">
            <div className="mb-3 grid size-12 place-items-center rounded-2xl bg-layer-1 text-secondary">
              <Bot className="size-6 text-accent-primary" />
            </div>
            <h4 className="text-14 font-semibold text-primary">How can Keel AI assist you?</h4>
            <p className="mt-1 max-w-xs text-12">
              Ask in natural language to create tickets, reorganize sprints, summarize progress, or build custom views.
            </p>
            <div className="mt-4 flex w-full max-w-xs flex-col gap-2 text-left">
              {[
                "Create three high-priority bugs about checkout flow",
                "Summarize progress for the current cycle",
                "Move unstarted tickets to the next cycle",
              ].map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendMessage(prompt)}
                  className="rounded-xl border border-subtle bg-surface-2/60 p-2.5 text-left text-12 text-secondary transition-colors hover:bg-layer-1 hover:text-primary"
                >
                  &ldquo;{prompt}&rdquo;
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => {
          if (msg.role === "user") {
            return (
              <div key={msg.id || idx} className="flex justify-end gap-2.5">
                <div className="shadow-xs max-w-[85%] rounded-2xl rounded-tr-sm bg-accent-primary px-4 py-2.5 text-13 text-white">
                  <p className="whitespace-pre-wrap">{msg.content.text}</p>
                </div>
                <span className="mt-1 grid size-7 shrink-0 place-items-center rounded-full bg-accent-primary/20 text-accent-primary">
                  <User className="size-3.5" />
                </span>
              </div>
            );
          }

          if (msg.role === "assistant") {
            const toolCalls = msg.content.toolCalls || [];
            return (
              <div key={msg.id || idx} className="flex justify-start gap-2.5">
                <span className="mt-1 grid size-7 shrink-0 place-items-center rounded-full bg-accent-primary/10 text-accent-primary">
                  <Bot className="size-3.5" />
                </span>
                <div className="max-w-[88%] space-y-2">
                  {/* Tool Calls Chips */}
                  {toolCalls.length > 0 && (
                    <div className="space-y-1.5">
                      {toolCalls.map((tc: any, tIdx: number) => (
                        <div
                          key={tc.id || tIdx}
                          className="inline-flex items-center gap-2 rounded-xl border border-subtle bg-surface-2 px-3 py-1.5 text-11 text-secondary"
                        >
                          <CheckCircle2 className="size-3.5 text-success-primary" />
                          <span className="font-mono font-medium">{tc.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Assistant Text */}
                  {msg.content.text && (
                    <div className="shadow-2xs rounded-2xl rounded-tl-sm border border-subtle bg-surface-2/60 px-4 py-3 text-13 leading-relaxed text-primary">
                      <div className="prose-sm dark:prose-invert max-w-none whitespace-pre-wrap prose">
                        {msg.content.text}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          }

          return null;
        })}

        {/* Streaming & Running Tools Indicator */}
        {isStreaming && (
          <div className="flex justify-start gap-2.5">
            <span className="mt-1 grid size-7 shrink-0 place-items-center rounded-full bg-accent-primary/10 text-accent-primary">
              <Bot className="size-3.5 animate-pulse" />
            </span>
            <div className="max-w-[88%] space-y-2">
              {activeToolCalls.map((tc, tIdx) => (
                <div
                  key={tIdx}
                  className="border-accent-primary/20 inline-flex items-center gap-2 rounded-xl border bg-accent-primary/5 px-3 py-1.5 text-11 text-accent-primary"
                >
                  <RefreshCcw className="size-3.5 animate-spin" />
                  <span>
                    Executing: <b>{tc.name}</b>...
                  </span>
                </div>
              ))}
              {streamingText ? (
                <div className="rounded-2xl rounded-tl-sm border border-subtle bg-surface-2/60 px-4 py-3 text-13 leading-relaxed text-primary">
                  <div className="prose-sm dark:prose-invert max-w-none whitespace-pre-wrap prose">{streamingText}</div>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 text-12 text-tertiary">
                  <RefreshCcw className="size-3.5 animate-spin text-accent-primary" />
                  <span>Keel AI is thinking...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Destructive Action Confirmation Card */}
        {pendingConfirmation && (
          <div className="border-warning-primary/40 animate-in fade-in slide-in-from-bottom-2 space-y-3 rounded-2xl border-2 bg-warning-primary/5 p-4 duration-150">
            <div className="flex items-center gap-2 text-13 font-semibold text-warning-primary">
              <AlertTriangle className="size-4 shrink-0" />
              <span>Confirmation Required</span>
            </div>
            <p className="text-12 text-secondary">Keel AI is requesting permission to execute a destructive action:</p>
            <div className="font-mono overflow-x-auto rounded-xl border border-subtle bg-surface-1 p-3 text-11 text-primary">
              <p className="font-bold text-accent-primary">{pendingConfirmation.tool_name}</p>
              <pre className="mt-1 text-10 text-secondary">{JSON.stringify(pendingConfirmation.input, null, 2)}</pre>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button variant="secondary" onClick={() => handleConfirmationDecision(false)} disabled={isStreaming}>
                <X className="mr-1 size-3.5" />
                Reject
              </Button>
              <Button variant="primary" onClick={() => handleConfirmationDecision(true)} disabled={isStreaming}>
                <Check className="mr-1 size-3.5" />
                Approve & Execute
              </Button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-subtle bg-surface-1 p-3.5">
        <div className="focus-within:border-accent-primary focus-within:ring-accent-primary relative flex items-center rounded-2xl border border-subtle bg-surface-2 transition-all focus-within:ring-1">
          <textarea
            ref={inputRef}
            rows={2}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Keel AI anything..."
            className="w-full resize-none bg-transparent p-3 pr-12 text-13 text-primary outline-none placeholder:text-tertiary"
            disabled={isStreaming}
          />
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isStreaming}
            className={cn(
              "absolute right-2.5 grid size-8 place-items-center rounded-xl transition-all",
              inputText.trim() && !isStreaming
                ? "shadow-xs bg-accent-primary text-white hover:bg-accent-primary/90"
                : "cursor-not-allowed text-tertiary opacity-50 hover:bg-layer-1"
            )}
          >
            <Send className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

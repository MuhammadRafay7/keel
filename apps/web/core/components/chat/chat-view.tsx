/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useEffect, useState, useRef } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
// keel propel & icons
import { Button } from "@keel/propel/button";
import { CommentFillIcon, PlusIcon, SearchIcon, LinkIcon, CheckIcon } from "@keel/propel/icons";
import type { IChatChannel, IChatMessage } from "@keel/types";
import { cn } from "@keel/utils";
// services & hooks
import { supabaseChatService } from "@keel/services";
import { useMember } from "@/hooks/store/use-member";
import { useUser } from "@/hooks/store/user";

/** Messages within this gap of each other collapse under one avatar. */
const GROUPING_WINDOW_MS = 5 * 60 * 1000;

/** A stable per-person avatar tint, so faces stay recognisable down the list. */
const AVATAR_TINTS = [
  "bg-accent-subtle text-accent-primary",
  "bg-surface-2 text-primary",
  "bg-layer-2 text-secondary",
  "bg-accent-primary/10 text-accent-primary",
];

const tintFor = (seed: string | null | undefined): string => {
  if (!seed) return AVATAR_TINTS[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_TINTS[hash % AVATAR_TINTS.length];
};

const initialOf = (name: string | null | undefined): string => name?.trim()?.[0]?.toUpperCase() ?? "U";

const timeOf = (iso: string | null | undefined): string =>
  iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now";

/** "Today" / "Yesterday" / "12 March 2026", for the day separators. */
const startOfDay = (d: Date): number => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

const dayLabelOf = (iso: string | null | undefined): string => {
  if (!iso) return "Today";

  const date = new Date(iso);
  const days = Math.round((startOfDay(new Date()) - startOfDay(date)) / 86_400_000);

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";

  return date.toLocaleDateString([], { day: "numeric", month: "long", year: "numeric" });
};

/**
 * Whether a message opens a new block — a different sender, a different day, or
 * a long enough pause.
 */
const startsBlock = (message: IChatMessage, previous: IChatMessage | undefined): boolean => {
  if (!previous) return true;
  if (previous.sender_id !== message.sender_id) return true;
  if (dayLabelOf(previous.created_at) !== dayLabelOf(message.created_at)) return true;

  const gap = new Date(message.created_at ?? 0).getTime() - new Date(previous.created_at ?? 0).getTime();
  return !Number.isFinite(gap) || gap > GROUPING_WINDOW_MS;
};

// Inline SVG Icon components matching optical specs
function HashIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10" y1="3" x2="8" y2="21" />
      <line x1="16" y1="3" x2="14" y2="21" />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function SmileIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  );
}

function AtSignIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
    </svg>
  );
}

function BoldIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 12a4 4 0 0 0 0-8H6v8" />
      <path d="M15 20a4 4 0 0 0 0-8H6v8" />
    </svg>
  );
}

function ItalicIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" y1="4" x2="10" y2="4" />
      <line x1="14" y1="20" x2="5" y2="20" />
      <line x1="15" y1="4" x2="9" y2="20" />
    </svg>
  );
}

function CodeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function CodeBlockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <path d="M7 8l4 4-4 4" />
      <path d="M13 16h4" />
    </svg>
  );
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

/** Rich Markdown Renderer for Slack/ClickUp-style chat messages */
function ChatMessageContent({ text }: { text: string }) {
  if (!text) return null;

  // Split code blocks first
  const codeBlockRegex = /```([a-z]*)\n?([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: "codeblock", language: match[1], content: match[2] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push({ type: "text", content: text.slice(lastIndex) });
  }

  return (
    <div className="space-y-1.5 text-13 leading-relaxed break-words text-primary">
      {parts.map((part, pIdx) => {
        if (part.type === "codeblock") {
          return (
            <div
              key={pIdx}
              className="font-mono my-2 overflow-x-auto rounded-lg border border-subtle bg-surface-2 p-3 text-12 text-primary shadow-raised-100"
            >
              <div className="tracking-wider mb-1 flex items-center justify-between text-10 font-semibold text-tertiary uppercase">
                <span>{part.language || "code"}</span>
              </div>
              <pre className="font-mono text-12 leading-normal whitespace-pre">{part.content}</pre>
            </div>
          );
        }

        // Parse inline formatting (code, bold, italic)
        const lines = part.content.split("\n");
        return lines.map((line, lIdx) => {
          if (line.startsWith("> ")) {
            return (
              <blockquote key={lIdx} className="border-accent-primary my-1 border-l-2 pl-2.5 text-secondary italic">
                {line.slice(2)}
              </blockquote>
            );
          }
          if (line.startsWith("- ") || line.startsWith("* ")) {
            return (
              <div key={lIdx} className="flex items-start gap-2 pl-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent-primary" />
                <span>{line.slice(2)}</span>
              </div>
            );
          }

          // Inline formatting tags
          const inlineRegex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
          const tokens = line.split(inlineRegex);

          return (
            <p key={lIdx} className="whitespace-pre-wrap">
              {tokens.map((token, tIdx) => {
                if (token.startsWith("`") && token.endsWith("`")) {
                  return (
                    <code
                      key={tIdx}
                      className="font-mono mx-0.5 rounded border border-subtle bg-surface-2 px-1.5 py-0.5 text-12 text-accent-primary"
                    >
                      {token.slice(1, -1)}
                    </code>
                  );
                }
                if (token.startsWith("**") && token.endsWith("**")) {
                  return (
                    <strong key={tIdx} className="font-semibold">
                      {token.slice(2, -2)}
                    </strong>
                  );
                }
                if (token.startsWith("*") && token.endsWith("*")) {
                  return (
                    <em key={tIdx} className="italic">
                      {token.slice(1, -1)}
                    </em>
                  );
                }
                return token;
              })}
            </p>
          );
        });
      })}
    </div>
  );
}

export const WorkspaceChatView = observer(function WorkspaceChatView({
  workspaceSlug: propSlug,
}: {
  workspaceSlug?: string;
}) {
  const params = useParams();
  const workspaceSlug = propSlug || (params.workspaceSlug as string);
  const { data: currentUser } = useUser();
  const {
    getUserDetails,
    workspace: { workspaceMemberIds },
  } = useMember();

  const [channels, setChannels] = useState<IChatChannel[]>([]);
  const [activeChannel, setActiveChannel] = useState<IChatChannel | null>(null);
  const [activeDirectMemberId, setActiveDirectMemberId] = useState<string | null>(null);
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [isLoadingChannels, setIsLoadingChannels] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const members = (workspaceMemberIds ?? [])
    .map((id) => {
      const member = getUserDetails(id);
      return member ? { id, name: member.display_name || member.first_name || member.email || "Member" } : null;
    })
    .filter((member): member is { id: string; name: string } => Boolean(member));

  const mentionMatches =
    mentionQuery === null
      ? []
      : members.filter((member) => member.name.toLowerCase().includes(mentionQuery.toLowerCase())).slice(0, 5);

  useEffect(() => {
    if (!workspaceSlug) return;
    let cancelled = false;

    const loadChannels = async () => {
      setIsLoadingChannels(true);
      try {
        const fetchedChannels = await supabaseChatService.getChannels(workspaceSlug.toString(), "global");
        if (cancelled) return;
        setChannels(fetchedChannels);
        if (fetchedChannels.length > 0) setActiveChannel(fetchedChannels[0]);
      } catch (_err) {
        if (!cancelled) {
          const fallbackChannels = [
            {
              id: "general",
              name: "general",
              workspace_id: workspaceSlug,
              project_id: "",
              description: "General discussions",
            },
            {
              id: "dev-team",
              name: "dev-team",
              workspace_id: workspaceSlug,
              project_id: "",
              description: "Engineering chat",
            },
            {
              id: "design-ui",
              name: "design-ui",
              workspace_id: workspaceSlug,
              project_id: "",
              description: "UI/UX specs",
            },
          ];
          setChannels(fallbackChannels);
          setActiveChannel(fallbackChannels[0]);
        }
      } finally {
        if (!cancelled) setIsLoadingChannels(false);
      }
    };

    void loadChannels();
    return () => {
      cancelled = true;
    };
  }, [workspaceSlug]);

  useEffect(() => {
    const channelId = activeChannel?.id;
    if (!channelId) return;

    let cancelled = false;
    const loadMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const fetchedMessages = await supabaseChatService.getMessages(channelId);
        if (!cancelled) setMessages(fetchedMessages);
      } catch (_err) {
        if (!cancelled) setMessages([]);
      } finally {
        if (!cancelled) setIsLoadingMessages(false);
      }
    };

    void loadMessages();
    const unsubscribe = supabaseChatService.subscribeToMessages(channelId, (message) => {
      if (cancelled) return;
      setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [activeChannel?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const textToSend = inputMessage.trim();
    setInputMessage("");
    setMentionQuery(null);
    setIsSending(true);

    const userName = currentUser?.display_name || currentUser?.first_name || currentUser?.email?.split("@")[0] || "You";
    const channelId = activeChannel?.id || "general";

    const tempMsg: IChatMessage = {
      id: `temp-${Date.now()}`,
      channel_id: channelId,
      workspace_id: workspaceSlug || "",
      project_id: "",
      message: textToSend,
      sender_id: currentUser?.id,
      sender_name: userName,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMsg]);

    try {
      const created = await supabaseChatService.sendMessage(
        workspaceSlug || "global",
        channelId,
        textToSend,
        userName,
        []
      );
      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m.id !== tempMsg.id);
        return withoutTemp.some((m) => m.id === created.id) ? withoutTemp : [...withoutTemp, created];
      });
    } catch (_err) {
      // optimistic state preserved
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim() || !workspaceSlug) return;
    const newChName = newChannelName.toLowerCase().replace(/\s+/g, "-");
    try {
      const created = await supabaseChatService.createChannel(workspaceSlug, workspaceSlug, {
        name: newChName,
        description: `Channel #${newChName}`,
      });
      setChannels((prev) => [...prev, created]);
      setActiveChannel(created);
    } catch {
      const fallbackCh: IChatChannel = {
        id: `ch-${Date.now()}`,
        name: newChName,
        workspace_id: workspaceSlug,
        project_id: "",
      };
      setChannels((prev) => [...prev, fallbackCh]);
      setActiveChannel(fallbackCh);
    }
    setActiveDirectMemberId(null);
    setNewChannelName("");
    setIsCreatingChannel(false);
  };

  const insertFormatting = (prefix: string, suffix: string = "") => {
    const textarea = inputRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = inputMessage.slice(start, end);
    const replacement = `${prefix}${selected || "text"}${suffix}`;
    const nextText = inputMessage.slice(0, start) + replacement + inputMessage.slice(end);

    setInputMessage(nextText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 4));
    }, 0);
  };

  const activeDirectUser = activeDirectMemberId ? getUserDetails(activeDirectMemberId) : null;
  const activeDirectName = activeDirectUser
    ? activeDirectUser.display_name || activeDirectUser.first_name || activeDirectUser.email || "Member"
    : null;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-canvas text-primary">
      {/* Top Integrated Channel Header & Switcher (No duplicate sidebar) */}
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-subtle bg-surface-1 px-5 py-3">
        <div className="flex items-center gap-3 overflow-x-auto py-0.5">
          <div className="flex items-center gap-2 border-r border-subtle pr-2">
            <CommentFillIcon className="size-5 shrink-0 text-accent-primary" />
            <span className="text-14 font-semibold text-primary">Workspace Chat</span>
          </div>

          <div className="flex items-center gap-1.5">
            {channels.map((ch) => {
              const isActive = activeChannel?.id === ch.id && !activeDirectMemberId;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => {
                    setActiveChannel(ch);
                    setActiveDirectMemberId(null);
                  }}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-13 font-medium transition-colors duration-150",
                    isActive
                      ? "shadow-sm bg-accent-primary/10 text-accent-primary"
                      : "text-secondary hover:bg-layer-transparent-hover hover:text-primary"
                  )}
                >
                  <HashIcon className={cn("size-3.5", isActive ? "text-accent-primary" : "text-tertiary")} />
                  <span>{ch.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Member Direct Messages Dropdown / Switcher */}
          {members.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-11 font-medium text-tertiary">DMs:</span>
              {members.slice(0, 3).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setActiveDirectMemberId(m.id);
                  }}
                  className={cn(
                    "flex items-center gap-1 rounded-full px-2.5 py-1 text-12 font-medium transition-colors",
                    activeDirectMemberId === m.id
                      ? "bg-accent-primary text-on-color"
                      : "bg-surface-2 text-secondary hover:bg-surface-2/80"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-4 items-center justify-center rounded-full text-10 font-bold",
                      tintFor(m.id)
                    )}
                  >
                    {initialOf(m.name)}
                  </span>
                  <span>{m.name.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsCreatingChannel(!isCreatingChannel)}
            className="flex items-center gap-1.5 rounded-lg border border-subtle bg-surface-2 px-2.5 py-1.5 text-12 font-medium text-secondary transition-colors hover:bg-surface-2/80 hover:text-primary"
          >
            <PlusIcon className="size-3.5" />
            <span>Channel</span>
          </button>
        </div>
      </header>

      {/* Modal for New Channel Creation */}
      {isCreatingChannel && (
        <div className="border-b border-subtle bg-surface-2 px-5 py-3 shadow-raised-100">
          <form onSubmit={handleCreateChannel} className="flex max-w-md items-center gap-2">
            <input
              type="text"
              autoFocus
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              placeholder="channel-name"
              className="flex-1 rounded-lg border border-subtle bg-surface-1 px-3 py-1.5 text-13 text-primary focus:border-accent-strong focus:outline-none"
            />
            <Button type="submit" variant="primary" size="sm" disabled={!newChannelName.trim()}>
              Create
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsCreatingChannel(false)}>
              Cancel
            </Button>
          </form>
        </div>
      )}

      {/* Chat Messages Main Panel */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-2 overflow-y-auto px-5 py-4">
          {isLoadingMessages && (
            <p className="flex h-full items-center justify-center text-13 text-tertiary">Loading messages…</p>
          )}

          {!isLoadingMessages && messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-2 py-12 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-accent-subtle">
                <CommentFillIcon className="size-6 text-accent-primary" />
              </span>
              <p className="text-14 font-semibold text-primary">
                {activeDirectName
                  ? `Direct message with ${activeDirectName}`
                  : `This is the start of #${activeChannel?.name || "general"}`}
              </p>
              <p className="max-w-sm text-12 text-tertiary">
                Slack & ClickUp-style real-time workspace messaging. Format with code blocks, bold, lists, and quotes.
              </p>
            </div>
          )}

          {messages.map((msg, index) => {
            const previous = messages[index - 1];
            const isBlockStart = startsBlock(msg, previous);
            const isNewDay = !previous || dayLabelOf(previous.created_at) !== dayLabelOf(msg.created_at);
            const isSelf = Boolean(currentUser?.id) && msg.sender_id === currentUser?.id;

            return (
              <div key={msg.id}>
                {isNewDay && (
                  <div className="flex items-center gap-3 py-3" role="separator">
                    <span className="bg-subtle h-px flex-1" />
                    <span className="rounded-full border border-subtle bg-surface-2 px-3 py-0.5 text-11 font-medium text-tertiary">
                      {dayLabelOf(msg.created_at)}
                    </span>
                    <span className="bg-subtle h-px flex-1" />
                  </div>
                )}

                <div
                  className={cn(
                    "group relative flex gap-3 rounded-lg pr-2 transition-colors duration-100 hover:bg-layer-transparent-hover",
                    isBlockStart ? "mt-2 py-1.5 first:mt-0" : "py-0.5"
                  )}
                >
                  {isBlockStart ? (
                    <span
                      className={cn(
                        "shadow-sm mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full text-12 font-semibold",
                        tintFor(msg.sender_id ?? msg.sender_name)
                      )}
                    >
                      {initialOf(msg.sender_name)}
                    </span>
                  ) : (
                    <span
                      aria-hidden
                      className="w-8 shrink-0 self-stretch text-right text-10 leading-5 text-tertiary opacity-0 transition-opacity duration-100 group-hover:opacity-100"
                    >
                      {timeOf(msg.created_at)}
                    </span>
                  )}

                  <div className="min-w-0 flex-1">
                    {isBlockStart && (
                      <div className="mb-0.5 flex items-baseline gap-2">
                        <span className="text-13 font-semibold text-primary">
                          {msg.sender_name}
                          {isSelf && <span className="font-normal ml-1 text-11 text-tertiary">(You)</span>}
                        </span>
                        <span className="text-11 text-tertiary">{timeOf(msg.created_at)}</span>
                      </div>
                    )}
                    <ChatMessageContent text={msg.message} />
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Rich Composer with Slack / ClickUp Formatting Toolbar */}
        <div className="relative shrink-0 px-5 pt-1 pb-5">
          {mentionMatches.length > 0 && (
            <div className="absolute bottom-full left-5 z-10 mb-2 w-64 overflow-hidden rounded-xl border border-subtle bg-surface-1 shadow-overlay-100">
              {mentionMatches.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => {
                    setInputMessage((current) => current.replace(/@[\w ]{0,30}$/, `@${member.name} `));
                    setMentionQuery(null);
                    inputRef.current?.focus();
                  }}
                  className="flex h-9 w-full items-center gap-2 px-3 text-left text-13 text-secondary transition-colors duration-100 hover:bg-layer-transparent-hover hover:text-primary"
                >
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full text-10 font-semibold",
                      tintFor(member.id)
                    )}
                  >
                    {initialOf(member.name)}
                  </span>
                  <span className="truncate">{member.name}</span>
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={handleSendMessage}
            className="flex flex-col rounded-xl border border-subtle bg-surface-2 p-2.5 shadow-raised-100 transition-colors duration-150 focus-within:border-accent-strong"
          >
            {/* Formatting Toolbar */}
            <div className="mb-1.5 flex items-center gap-1 border-b border-subtle/40 pb-1.5 text-tertiary">
              <button
                type="button"
                title="Bold (**text**)"
                onClick={() => insertFormatting("**", "**")}
                className="flex size-6 items-center justify-center rounded transition-colors hover:bg-surface-1 hover:text-primary"
              >
                <BoldIcon className="size-3.5" />
              </button>
              <button
                type="button"
                title="Italic (*text*)"
                onClick={() => insertFormatting("*", "*")}
                className="flex size-6 items-center justify-center rounded transition-colors hover:bg-surface-1 hover:text-primary"
              >
                <ItalicIcon className="size-3.5" />
              </button>
              <span className="bg-subtle mx-0.5 h-3 w-px" />
              <button
                type="button"
                title="Inline Code (`code`)"
                onClick={() => insertFormatting("`", "`")}
                className="flex size-6 items-center justify-center rounded transition-colors hover:bg-surface-1 hover:text-primary"
              >
                <CodeIcon className="size-3.5" />
              </button>
              <button
                type="button"
                title="Code Block (```code```)"
                onClick={() => insertFormatting("```\n", "\n```")}
                className="flex size-6 items-center justify-center rounded transition-colors hover:bg-surface-1 hover:text-primary"
              >
                <CodeBlockIcon className="size-3.5" />
              </button>
              <button
                type="button"
                title="Bullet List (- item)"
                onClick={() => insertFormatting("- ")}
                className="flex size-6 items-center justify-center rounded transition-colors hover:bg-surface-1 hover:text-primary"
              >
                <ListIcon className="size-3.5" />
              </button>
            </div>

            <textarea
              ref={inputRef}
              rows={2}
              value={inputMessage}
              onChange={(e) => {
                const value = e.target.value;
                setInputMessage(value);
                const upToCaret = value.slice(0, e.target.selectionStart ?? value.length);
                const match = /@([\w ]{0,30})$/.exec(upToCaret);
                setMentionQuery(match ? match[1] : null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSendMessage();
                }
              }}
              placeholder={
                activeDirectName ? `Message ${activeDirectName}` : `Message #${activeChannel?.name || "general"}`
              }
              className="placeholder-tertiary w-full resize-none bg-transparent px-1 py-1 text-13 leading-relaxed text-primary focus:outline-none"
            />
            <div className="flex items-center justify-between gap-2 border-t border-subtle/50 px-1 pt-2">
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  title="Attach a file"
                  aria-label="Attach a file"
                  className="flex size-7 items-center justify-center rounded-lg text-tertiary transition-colors duration-100 hover:bg-layer-transparent-hover hover:text-primary"
                >
                  <LinkIcon className="size-4" />
                </button>
                <button
                  type="button"
                  title="Add an emoji"
                  aria-label="Add an emoji"
                  className="flex size-7 items-center justify-center rounded-lg text-tertiary transition-colors duration-100 hover:bg-layer-transparent-hover hover:text-primary"
                >
                  <SmileIcon className="size-4" />
                </button>
                <button
                  type="button"
                  title="Mention someone"
                  aria-label="Mention someone"
                  onClick={() => {
                    setInputMessage((current) => `${current}@`);
                    setMentionQuery("");
                    inputRef.current?.focus();
                  }}
                  className="flex size-7 items-center justify-center rounded-lg text-tertiary transition-colors duration-100 hover:bg-layer-transparent-hover hover:text-primary"
                >
                  <AtSignIcon className="size-4" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden text-11 text-tertiary sm:inline">Enter to send · Shift+Enter for line</span>
                <Button
                  type="submit"
                  disabled={!inputMessage.trim() || isSending}
                  variant="primary"
                  size="sm"
                  className="h-7 gap-1.5 px-3 text-12 font-semibold"
                >
                  <span>Send</span>
                  <SendIcon className="size-3.5" />
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
});

export const ProjectChatView = WorkspaceChatView;

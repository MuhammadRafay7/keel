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
import { CommentFillIcon, PlusIcon, SearchIcon, LinkIcon } from "@keel/propel/icons";
import { setToast, TOAST_TYPE } from "@keel/propel/toast";
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

// Inline SVG Icon components matching 16px/20px optical size spec
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
          setChannels([
            {
              id: "general",
              name: "general",
              workspace_id: workspaceSlug,
              project_id: "",
              description: "Workspace-wide general channel",
            },
            {
              id: "random",
              name: "random",
              workspace_id: workspaceSlug,
              project_id: "",
              description: "Non-work banters & random chatter",
            },
          ]);
          setActiveChannel({
            id: "general",
            name: "general",
            workspace_id: workspaceSlug,
            project_id: "",
            description: "Workspace-wide general channel",
          });
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
      const created = await supabaseChatService.sendMessage("global", channelId, textToSend, userName, []);
      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m.id !== tempMsg.id);
        return withoutTemp.some((m) => m.id === created.id) ? withoutTemp : [...withoutTemp, created];
      });
    } catch (_err) {
      // keep optimistic UI for dev/preview
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim() || !workspaceSlug) return;
    const newCh: IChatChannel = {
      id: `ch-${Date.now()}`,
      name: newChannelName.toLowerCase().replace(/\s+/g, "-"),
      workspace_id: workspaceSlug,
      project_id: "",
    };
    setChannels((prev) => [...prev, newCh]);
    setActiveChannel(newCh);
    setActiveDirectMemberId(null);
    setNewChannelName("");
    setIsCreatingChannel(false);
  };

  const activeDirectUser = activeDirectMemberId ? getUserDetails(activeDirectMemberId) : null;
  const activeDirectName = activeDirectUser
    ? activeDirectUser.display_name || activeDirectUser.first_name || activeDirectUser.email || "Member"
    : null;

  return (
    <div className="flex h-full w-full overflow-hidden bg-canvas text-primary">
      {/* Channel & Direct Message Sidebar */}
      <aside className="flex w-[260px] shrink-0 flex-col border-r border-subtle bg-surface-1">
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-subtle px-4">
          <div className="flex min-w-0 items-center gap-2">
            <CommentFillIcon className="size-4 shrink-0 text-accent-primary" />
            <h2 className="truncate text-14 font-semibold text-primary">Workspace Chat</h2>
          </div>
          <button
            type="button"
            onClick={() => setIsCreatingChannel(!isCreatingChannel)}
            title="Create a channel"
            aria-label="Create a channel"
            className="flex size-7 shrink-0 items-center justify-center rounded-lg text-tertiary transition-colors duration-150 hover:bg-layer-transparent-hover hover:text-primary"
          >
            <PlusIcon className="size-4" />
          </button>
        </header>

        {isCreatingChannel && (
          <form onSubmit={handleCreateChannel} className="shrink-0 border-b border-subtle px-4 py-3">
            <label
              htmlFor="new-w-channel"
              className="mb-1.5 block text-11 font-semibold tracking-wide text-tertiary uppercase"
            >
              New channel
            </label>
            <div className="flex items-center gap-1.5">
              <input
                id="new-w-channel"
                type="text"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder="e.g. announcements"
                className="placeholder-tertiary h-7 w-full min-w-0 rounded-lg border border-subtle bg-surface-2 px-2.5 text-12 text-primary focus:border-accent-strong focus:outline-none"
              />
              <Button type="submit" size="sm" variant="primary" className="h-7 shrink-0 px-2.5 text-11">
                Add
              </Button>
            </div>
          </form>
        )}

        <div className="flex-1 overflow-y-auto px-2 py-3">
          <section>
            <div className="flex items-center justify-between px-2 pb-1">
              <span className="text-11 font-semibold tracking-wide text-tertiary uppercase">Channels</span>
              <span className="text-11 text-tertiary tabular-nums">{channels.length || ""}</span>
            </div>
            <div className="flex flex-col gap-px">
              {isLoadingChannels && channels.length === 0 && (
                <p className="px-2 py-1.5 text-12 text-tertiary">Loading channels…</p>
              )}
              {channels.map((channel) => {
                const isActive = !activeDirectMemberId && activeChannel?.id === channel.id;
                return (
                  <button
                    key={channel.id}
                    type="button"
                    onClick={() => {
                      setActiveChannel(channel);
                      setActiveDirectMemberId(null);
                    }}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "flex h-8 w-full items-center gap-2 rounded-lg px-2 text-13 transition-colors duration-150",
                      isActive
                        ? "bg-accent-subtle font-semibold text-accent-primary"
                        : "font-medium text-secondary hover:bg-layer-transparent-hover hover:text-primary"
                    )}
                  >
                    <HashIcon className={cn("size-3.5 shrink-0", isActive ? "text-accent-primary" : "text-tertiary")} />
                    <span className="truncate">{channel.name}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="mt-5">
            <div className="flex items-center justify-between px-2 pb-1">
              <span className="text-11 font-semibold tracking-wide text-tertiary uppercase">Direct messages</span>
              <span className="text-11 text-tertiary tabular-nums">{members.length}</span>
            </div>
            <div className="flex flex-col gap-px">
              {members.length === 0 && <p className="px-2 py-1.5 text-12 text-tertiary">No members found.</p>}
              {members.map((member) => {
                const isActive = activeDirectMemberId === member.id;
                const isCurrentUser = member.id === currentUser?.id;

                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => {
                      setActiveDirectMemberId(member.id);
                      setActiveChannel(null);
                    }}
                    className={cn(
                      "flex h-8 w-full items-center gap-2 rounded-lg px-2 text-13 transition-colors duration-150",
                      isActive
                        ? "bg-accent-subtle font-semibold text-accent-primary"
                        : "font-medium text-secondary hover:bg-layer-transparent-hover hover:text-primary"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-full text-10 font-semibold",
                        tintFor(member.id)
                      )}
                    >
                      {initialOf(member.name)}
                    </span>
                    <span className="truncate">
                      {member.name}
                      {isCurrentUser ? " (You)" : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </aside>

      {/* Message Pane */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-subtle bg-surface-1 px-5">
          <div className="flex min-w-0 items-center gap-2">
            {activeDirectName ? (
              <>
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full text-11 font-semibold",
                    tintFor(activeDirectMemberId)
                  )}
                >
                  {initialOf(activeDirectName)}
                </span>
                <h2 className="truncate text-14 font-semibold text-primary">{activeDirectName}</h2>
              </>
            ) : (
              <>
                <HashIcon className="size-5 shrink-0 text-accent-primary" />
                <div className="min-w-0">
                  <h2 className="truncate text-14 font-semibold text-primary">{activeChannel?.name || "general"}</h2>
                  {activeChannel?.description && (
                    <p className="truncate text-11 text-tertiary">{activeChannel.description}</p>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="relative hidden shrink-0 md:block">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-tertiary" />
            <input
              type="search"
              placeholder="Search messages"
              aria-label="Search messages"
              className="placeholder-tertiary h-8 w-48 rounded-lg border border-subtle bg-surface-2 pr-3 pl-8 text-12 text-primary focus:border-accent-strong focus:outline-none"
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isLoadingMessages && messages.length === 0 && (
            <p className="flex h-full items-center justify-center text-13 text-tertiary">Loading messages…</p>
          )}

          {!isLoadingMessages && messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-1.5 text-center">
              <span className="mb-1 flex size-11 items-center justify-center rounded-2xl bg-accent-subtle">
                <CommentFillIcon className="size-5 text-accent-primary" />
              </span>
              <p className="text-13 font-semibold text-primary">
                {activeDirectName
                  ? `Direct message with ${activeDirectName}`
                  : `This is the start of #${activeChannel?.name || "general"}`}
              </p>
              <p className="text-12 text-tertiary">Send a message to start the conversation.</p>
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
                    <span className="rounded-full border border-subtle bg-surface-2 px-2.5 py-0.5 text-11 font-medium text-tertiary">
                      {dayLabelOf(msg.created_at)}
                    </span>
                    <span className="bg-subtle h-px flex-1" />
                  </div>
                )}

                <div
                  className={cn(
                    "group relative flex gap-3 rounded-lg pr-2 transition-colors duration-100 hover:bg-layer-transparent-hover",
                    isBlockStart ? "mt-2 py-1 first:mt-0" : "py-px"
                  )}
                >
                  {isBlockStart ? (
                    <span
                      className={cn(
                        "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full text-12 font-semibold",
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
                      <div className="flex items-baseline gap-2">
                        <span className="text-13 font-semibold text-primary">
                          {msg.sender_name}
                          {isSelf && <span className="font-normal ml-1 text-11 text-tertiary">(You)</span>}
                        </span>
                        <span className="text-11 text-tertiary">{timeOf(msg.created_at)}</span>
                      </div>
                    )}
                    <p className="text-13 leading-relaxed break-words whitespace-pre-wrap text-primary">
                      {msg.message}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Composer */}
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
            className="flex flex-col gap-1 rounded-xl border border-subtle bg-surface-2 p-2 shadow-raised-100 transition-colors duration-150 focus-within:border-accent-strong"
          >
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
              className="placeholder-tertiary w-full resize-none bg-transparent px-2 py-1 text-13 leading-relaxed text-primary focus:outline-none"
            />
            <div className="flex items-center justify-between gap-2 border-t border-subtle/50 px-1 pt-1.5">
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

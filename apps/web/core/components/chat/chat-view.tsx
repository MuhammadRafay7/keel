/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useEffect, useState, useRef } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { Hash, Plus, Send, Paperclip, Smile, AtSign, Search, MessageSquare, User, Users } from "lucide-react";
// keel imports
import { Button } from "@keel/propel/button";
import { setToast, TOAST_TYPE } from "@keel/propel/toast";
import type { IChatChannel, IChatMessage } from "@keel/types";
import { cn } from "@keel/utils";
// services & hooks
import { supabaseChatService } from "@keel/services";
import { useMember } from "@/hooks/store/use-member";
import { useUser } from "@/hooks/store/user";

export const ClickUpChatView = observer(function ClickUpChatView() {
  const { workspaceSlug, projectId } = useParams();
  const { data: currentUser } = useUser();
  const {
    getUserDetails,
    project: { projectMemberIds },
  } = useMember();

  // states
  const [channels, setChannels] = useState<IChatChannel[]>([]);
  const [activeChannel, setActiveChannel] = useState<IChatChannel | null>(null);
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [isLoadingChannels, setIsLoadingChannels] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load channels on mount
  useEffect(() => {
    if (!workspaceSlug || !projectId) return;

    let cancelled = false;

    const loadChannels = async () => {
      setIsLoadingChannels(true);
      try {
        const fetchedChannels = await supabaseChatService.getChannels(workspaceSlug.toString(), projectId.toString());
        if (cancelled) return;
        setChannels(fetchedChannels);
        setActiveChannel((current) => current ?? fetchedChannels[0] ?? null);
      } catch (_err) {
        if (cancelled) return;
        setToast({
          type: TOAST_TYPE.ERROR,
          title: "Chat unavailable",
          message: "Could not load channels for this project.",
        });
      } finally {
        if (!cancelled) setIsLoadingChannels(false);
      }
    };

    void loadChannels();

    return () => {
      cancelled = true;
    };
  }, [workspaceSlug, projectId]);

  // Load messages when the active channel changes, then stream new ones
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
        if (cancelled) return;
        setMessages([]);
        setToast({
          type: TOAST_TYPE.ERROR,
          title: "Chat unavailable",
          message: "Could not load messages for this channel.",
        });
      } finally {
        if (!cancelled) setIsLoadingMessages(false);
      }
    };

    void loadMessages();

    // Realtime inserts — de-duplicated against messages this tab already added.
    const unsubscribe = supabaseChatService.subscribeToMessages(channelId, (message) => {
      if (cancelled) return;
      setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [activeChannel?.id]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || !activeChannel || !projectId || isSending) return;

    const textToSend = inputMessage.trim();
    setInputMessage("");
    setIsSending(true);

    const userName = currentUser?.display_name || currentUser?.first_name || currentUser?.email?.split("@")[0] || "You";

    // Optimistic UI update
    const tempMsg: IChatMessage = {
      id: `temp-${Date.now()}`,
      channel_id: activeChannel.id,
      project_id: projectId.toString(),
      workspace_id: activeChannel.workspace_id,
      message: textToSend,
      sender_id: currentUser?.id,
      sender_name: userName,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMsg]);

    try {
      const created = await supabaseChatService.sendMessage(
        projectId.toString(),
        activeChannel.id,
        textToSend,
        userName
      );

      // The realtime stream may have delivered the same row first.
      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m.id !== tempMsg.id);
        return withoutTemp.some((m) => m.id === created.id) ? withoutTemp : [...withoutTemp, created];
      });
    } catch (_err) {
      setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
      setInputMessage(textToSend);
      setToast({
        type: TOAST_TYPE.ERROR,
        title: "Send Failed",
        message: "Message could not be sent. Please try again.",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim() || !workspaceSlug || !projectId) return;

    try {
      const channel = await supabaseChatService.createChannel(workspaceSlug.toString(), projectId.toString(), {
        name: newChannelName,
      });

      setChannels((prev) => [...prev, channel]);
      setActiveChannel(channel);
      setNewChannelName("");
      setIsCreatingChannel(false);
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "Channel Created",
        message: `Created channel #${channel.name}`,
      });
    } catch (_err) {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: "Error",
        message: "Could not create channel.",
      });
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-surface-1 text-primary">
      {/* Sidebar - Channels & DMs */}
      <div className="flex w-64 flex-shrink-0 flex-col border-r border-subtle bg-surface-2/60">
        {/* Workspace Chat Header */}
        <div className="flex h-14 items-center justify-between border-b border-subtle/80 px-4">
          <div className="flex items-center gap-2 font-semibold text-primary">
            <MessageSquare className="size-4 text-accent-primary" />
            <span className="text-14 font-bold">ClickUp Chat</span>
          </div>
          <button
            type="button"
            onClick={() => setIsCreatingChannel(!isCreatingChannel)}
            title="Create new channel"
            className="flex size-7 items-center justify-center rounded-lg border border-subtle bg-surface-1 text-secondary transition-all hover:bg-surface-2 hover:text-accent-primary"
          >
            <Plus className="size-4" />
          </button>
        </div>

        {/* Create Channel Modal / Input inline */}
        {isCreatingChannel && (
          <form onSubmit={handleCreateChannel} className="border-b border-subtle bg-surface-1 p-3">
            <div className="tracking-wider mb-1.5 text-11 font-semibold text-tertiary uppercase">New Channel</div>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder="e.g. frontend-team"
                className="placeholder-tertiary focus:border-accent-primary w-full rounded-md border border-subtle bg-surface-2 px-2.5 py-1 text-12 text-primary focus:outline-none"
              />
              <Button type="submit" size="sm" variant="primary" className="px-2.5 py-1 text-11">
                Add
              </Button>
            </div>
          </form>
        )}

        {/* Channel List */}
        <div className="flex-1 space-y-4 overflow-y-auto p-3">
          <div>
            <div className="tracking-wider mb-1 flex items-center justify-between px-2 text-11 font-bold text-tertiary uppercase">
              <span>Channels</span>
              <Users className="size-3" />
            </div>
            <div className="space-y-0.5">
              {isLoadingChannels && channels.length === 0 && (
                <div className="px-2.5 py-1.5 text-12 text-tertiary">Loading channels…</div>
              )}
              {!isLoadingChannels && channels.length === 0 && (
                <div className="px-2.5 py-1.5 text-12 text-tertiary">No channels yet. Create one to start talking.</div>
              )}
              {channels.map((channel) => {
                const isActive = activeChannel?.id === channel.id;
                return (
                  <button
                    key={channel.id}
                    type="button"
                    onClick={() => setActiveChannel(channel)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-13 transition-all duration-150",
                      isActive
                        ? "shadow-xs bg-accent-subtle font-semibold text-accent-primary"
                        : "text-secondary hover:bg-surface-1/80 hover:text-primary"
                    )}
                  >
                    <Hash
                      className={cn("size-3.5 flex-shrink-0", isActive ? "text-accent-primary" : "text-tertiary")}
                    />
                    <span className="truncate">{channel.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Direct Messages Demo Section */}
          <div>
            <div className="tracking-wider mb-1 flex items-center justify-between px-2 text-11 font-bold text-tertiary uppercase">
              <span>Direct Messages</span>
              <User className="size-3" />
            </div>
            <div className="space-y-0.5">
              {(projectMemberIds ?? []).length === 0 && (
                <div className="px-2.5 py-1.5 text-12 text-tertiary">No teammates on this project yet.</div>
              )}
              {(projectMemberIds ?? []).map((memberId) => {
                const member = getUserDetails(memberId);
                if (!member) return null;
                const memberName = member.display_name || member.first_name || member.email || "Member";
                const isCurrentUser = memberId === currentUser?.id;
                return (
                  <div
                    key={memberId}
                    title="Direct messages are coming soon"
                    className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-13 text-secondary"
                  >
                    <div className="bg-surface-3 relative flex size-5 flex-shrink-0 items-center justify-center rounded-full text-10 font-bold text-primary">
                      {memberName[0]?.toUpperCase()}
                    </div>
                    <span className="truncate">
                      {memberName}
                      {isCurrentUser ? " (You)" : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Stream Area */}
      <div className="flex flex-1 flex-col overflow-hidden bg-surface-1">
        {/* Active Channel Header */}
        <div className="flex h-14 items-center justify-between border-b border-subtle/80 bg-surface-1 px-6">
          <div className="flex items-center gap-2 overflow-hidden">
            <Hash className="size-5 flex-shrink-0 text-accent-primary" />
            <div className="truncate">
              <h2 className="text-14 leading-tight font-bold text-primary">
                {activeChannel?.name || "Select channel"}
              </h2>
              {activeChannel?.description && (
                <p className="truncate text-11 text-tertiary">{activeChannel.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute top-2 left-2.5 size-3.5 text-tertiary" />
              <input
                type="text"
                placeholder="Search messages..."
                className="placeholder-tertiary focus:border-accent-primary w-44 rounded-lg border border-subtle bg-surface-2/60 py-1 pr-3 pl-8 text-12 text-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Message History List */}
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {isLoadingMessages && messages.length === 0 && (
            <div className="flex h-full items-center justify-center text-13 text-tertiary">Loading messages…</div>
          )}
          {!isLoadingMessages && messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
              <MessageSquare className="size-6 text-tertiary" />
              <p className="text-13 font-semibold text-primary">
                {activeChannel ? `This is the start of #${activeChannel.name}` : "Select a channel"}
              </p>
              <p className="text-12 text-tertiary">Send the first message to get the conversation going.</p>
            </div>
          )}
          {messages.map((msg) => {
            const isSelf = Boolean(currentUser?.id) && msg.sender_id === currentUser?.id;
            return (
              <div key={msg.id} className="group flex gap-3">
                <div className="flex size-8 flex-shrink-0 items-center justify-center rounded-full bg-accent-subtle text-12 font-bold text-accent-primary">
                  {msg.sender_name ? msg.sender_name[0].toUpperCase() : "U"}
                </div>
                <div className="flex max-w-[80%] flex-col space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-13 font-semibold text-primary">{msg.sender_name}</span>
                    <span className="text-11 text-tertiary">
                      {msg.created_at
                        ? new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : "Just now"}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "shadow-xs rounded-xl border px-3.5 py-2 text-13 leading-relaxed",
                      isSelf
                        ? "border-accent-primary/30 bg-accent-subtle/70 text-primary"
                        : "border-subtle/80 bg-surface-2/80 text-primary"
                    )}
                  >
                    {msg.message}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* ClickUp Chat Input Bar */}
        <div className="border-t border-subtle bg-surface-1 p-4">
          <form
            onSubmit={handleSendMessage}
            className="focus-within:border-accent-primary shadow-xs flex flex-col rounded-xl border border-subtle bg-surface-2/70 p-2 transition-all"
          >
            <textarea
              rows={2}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSendMessage();
                }
              }}
              placeholder={`Message #${activeChannel?.name || "channel"}... (Enter to send, Shift+Enter for new line)`}
              className="placeholder-tertiary w-full resize-none bg-transparent px-2 py-1 text-13 text-primary focus:outline-none"
            />
            <div className="flex items-center justify-between border-t border-subtle/40 px-1 pt-1">
              <div className="flex items-center gap-1 text-tertiary">
                <button type="button" className="rounded-md p-1 transition-all hover:bg-surface-1 hover:text-primary">
                  <Paperclip className="size-4" />
                </button>
                <button type="button" className="rounded-md p-1 transition-all hover:bg-surface-1 hover:text-primary">
                  <Smile className="size-4" />
                </button>
                <button type="button" className="rounded-md p-1 transition-all hover:bg-surface-1 hover:text-primary">
                  <AtSign className="size-4" />
                </button>
              </div>
              <Button
                type="submit"
                disabled={!inputMessage.trim() || isSending}
                variant="primary"
                size="sm"
                className="gap-1.5 px-3 py-1 text-12 font-semibold"
              >
                <span>Send</span>
                <Send className="size-3.5" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
});

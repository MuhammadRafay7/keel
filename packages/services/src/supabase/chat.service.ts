/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { RealtimeChannel } from "@supabase/supabase-js";
import type { IChatChannel, IChatMessage } from "@keel/types";
import { getSupabase } from "./client";

/** Channels every project starts with, created on first visit to the chat view. */
const DEFAULT_CHANNELS: { name: string; description: string }[] = [
  { name: "general", description: "General project discussions and team updates" },
  { name: "dev-team", description: "Engineering and code review chat" },
  { name: "design-ui", description: "UI/UX specs, assets, and design system discussions" },
];

/** Channel names are slugs, the way Slack and ClickUp treat them. */
const toChannelSlug = (name: string): string =>
  name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
    .slice(0, 60) || "channel";

export class ChatService {
  /** Resolves the workspace a project belongs to — both chat tables are keyed on it. */
  private async getWorkspaceId(projectIdOrSlug: string): Promise<string> {
    const supabase = getSupabase();

    const { data: projData } = await supabase
      .from("projects")
      .select("workspace_id")
      .eq("id", projectIdOrSlug)
      .maybeSingle();
    if (projData?.workspace_id) return projData.workspace_id;

    const { data: wsData } = await supabase.from("workspaces").select("id").eq("slug", projectIdOrSlug).maybeSingle();
    if (wsData?.id) return wsData.id;

    return projectIdOrSlug;
  }

  /**
   * Lists a project's channels, seeding the defaults the first time it is opened.
   */
  async getChannels(_workspaceSlug: string, projectId: string): Promise<IChatChannel[]> {
    const supabase = getSupabase();
    const workspaceId = await this.getWorkspaceId(_workspaceSlug || projectId);

    const { data, error } = await supabase
      .from("chat_channels")
      .select("*")
      .or(`project_id.eq.${projectId},workspace_id.eq.${workspaceId}`)
      .order("created_at", { ascending: true });

    if (error) throw error;
    if (data && data.length > 0) return data as IChatChannel[];

    return this.seedDefaultChannels(projectId === "global" ? _workspaceSlug : projectId);
  }

  private async seedDefaultChannels(projectId: string): Promise<IChatChannel[]> {
    const supabase = getSupabase();
    const workspaceId = await this.getWorkspaceId(projectId);
    const actualProjectId = projectId === "global" || projectId === workspaceId ? "" : projectId;

    const { data, error } = await supabase
      .from("chat_channels")
      .insert(
        DEFAULT_CHANNELS.map((channel) => ({
          name: channel.name,
          description: channel.description,
          project_id: actualProjectId,
          workspace_id: workspaceId,
        }))
      )
      .select();

    if (error) {
      const { data: existing } = await supabase
        .from("chat_channels")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: true });

      if (existing && existing.length > 0) return existing as IChatChannel[];
      throw error;
    }

    return (data ?? []) as IChatChannel[];
  }

  async createChannel(
    _workspaceSlug: string,
    projectId: string,
    channel: Partial<IChatChannel>
  ): Promise<IChatChannel> {
    const supabase = getSupabase();
    const workspaceId = await this.getWorkspaceId(_workspaceSlug || projectId);
    const actualProjectId = projectId === "global" || projectId === workspaceId ? "" : projectId;

    const { data, error } = await supabase
      .from("chat_channels")
      .insert([
        {
          name: toChannelSlug(channel.name ?? ""),
          description: channel.description ?? "",
          project_id: actualProjectId,
          workspace_id: workspaceId,
        },
      ])
      .select()
      .single();

    if (error || !data) throw error ?? new Error("Could not create that channel.");

    return data as IChatChannel;
  }

  async getMessages(channelId: string): Promise<IChatMessage[]> {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("channel_id", channelId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return (data ?? []) as IChatMessage[];
  }

  async sendMessage(
    projectId: string,
    channelId: string,
    messageText: string,
    senderName: string = "User",
    mentions: string[] = []
  ): Promise<IChatMessage> {
    const supabase = getSupabase();
    const workspaceId = await this.getWorkspaceId(projectId);
    const user = (await supabase.auth.getUser())?.data?.user;
    const actualProjectId = projectId === "global" || projectId === workspaceId ? "" : projectId;

    const { data, error } = await supabase
      .from("chat_messages")
      .insert([
        {
          channel_id: channelId,
          project_id: actualProjectId,
          workspace_id: workspaceId,
          message: messageText,
          sender_id: user?.id ?? null,
          sender_name: senderName,
          sender_avatar: "",
          mentions,
        },
      ])
      .select()
      .single();

    if (error || !data) throw error ?? new Error("Could not send that message.");

    return data as IChatMessage;
  }

  async editMessage(messageId: string, newMessageText: string): Promise<IChatMessage> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("chat_messages")
      .update({ message: newMessageText, updated_at: new Date().toISOString() })
      .eq("id", messageId)
      .select()
      .single();

    if (error || !data) throw error ?? new Error("Could not update message.");
    return data as IChatMessage;
  }

  async deleteMessage(messageId: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from("chat_messages").delete().eq("id", messageId);

    if (error) throw error;
  }

  /**
   * Streams inserts for one channel.
   *
   * Requires chat_messages to be in the supabase_realtime publication — see
   * migration 0016. Returns the unsubscribe handle for effect cleanup.
   */
  subscribeToMessages(channelId: string, onMessage: (message: IChatMessage) => void): () => void {
    const supabase = getSupabase();

    const subscription: RealtimeChannel = supabase
      .channel(`chat_messages:${channelId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `channel_id=eq.${channelId}` },
        (payload) => onMessage(payload.new as IChatMessage)
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(subscription);
    };
  }
}

export const supabaseChatService = new ChatService();

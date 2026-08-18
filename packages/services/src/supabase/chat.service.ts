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
  private async getWorkspaceId(projectId: string): Promise<string> {
    const supabase = getSupabase();

    const { data, error } = await supabase.from("projects").select("workspace_id").eq("id", projectId).single();

    if (error || !data) throw error ?? new Error("That project does not exist.");

    return (data as { workspace_id: string }).workspace_id;
  }

  /**
   * Lists a project's channels, seeding the defaults the first time it is opened.
   *
   * The rows have to be real, because everything downstream — reading messages,
   * sending them, subscribing — joins on the channel's uuid.
   */
  async getChannels(_workspaceSlug: string, projectId: string): Promise<IChatChannel[]> {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("chat_channels")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    if (data && data.length > 0) return data as IChatChannel[];

    return this.seedDefaultChannels(projectId);
  }

  private async seedDefaultChannels(projectId: string): Promise<IChatChannel[]> {
    const supabase = getSupabase();
    const workspaceId = await this.getWorkspaceId(projectId);

    const { data, error } = await supabase
      .from("chat_channels")
      .insert(
        DEFAULT_CHANNELS.map((channel) => ({
          name: channel.name,
          description: channel.description,
          project_id: projectId,
          workspace_id: workspaceId,
        }))
      )
      .select();

    // A second tab may have won the race; re-read rather than fail the view.
    if (error) {
      const { data: existing } = await supabase
        .from("chat_channels")
        .select("*")
        .eq("project_id", projectId)
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
    const workspaceId = await this.getWorkspaceId(projectId);

    const { data, error } = await supabase
      .from("chat_channels")
      .insert([
        {
          name: toChannelSlug(channel.name ?? ""),
          description: channel.description ?? "",
          project_id: projectId,
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
    senderName: string = "User"
  ): Promise<IChatMessage> {
    const supabase = getSupabase();
    const workspaceId = await this.getWorkspaceId(projectId);
    const user = (await supabase.auth.getUser())?.data?.user;

    const { data, error } = await supabase
      .from("chat_messages")
      .insert([
        {
          channel_id: channelId,
          project_id: projectId,
          workspace_id: workspaceId,
          message: messageText,
          sender_id: user?.id ?? null,
          sender_name: senderName,
          sender_avatar: "",
        },
      ])
      .select()
      .single();

    if (error || !data) throw error ?? new Error("Could not send that message.");

    return data as IChatMessage;
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

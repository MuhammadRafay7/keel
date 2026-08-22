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
  /**
   * Resolves what a caller's `projectId` argument actually means.
   *
   * The view passes the literal "global" for workspace-level chat, and a real
   * project id otherwise. That distinction used to be carried as an empty
   * string in `project_id`, which is not a uuid — every workspace-level write
   * was rejected by Postgres and swallowed by the UI. A workspace channel now
   * carries a genuine `null`.
   */
  private async resolveScope(
    workspaceSlugOrId: string,
    projectId: string
  ): Promise<{ workspaceId: string; projectId: string | null }> {
    const workspaceId = await this.getWorkspaceId(workspaceSlugOrId || projectId);
    const isWorkspaceLevel = !projectId || projectId === "global" || projectId === workspaceId;
    return { workspaceId, projectId: isWorkspaceLevel ? null : projectId };
  }

  /** A uuid, as opposed to a workspace slug. */
  private static readonly UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  /** Resolves the workspace a project belongs to — both chat tables are keyed on it. */
  private async getWorkspaceId(projectIdOrSlug: string): Promise<string> {
    const supabase = getSupabase();

    // Only ask the projects table when the argument could actually be a project
    // id. A workspace slug sent to `id=eq.…` is not a uuid, so PostgREST
    // answers 400 — harmless, because the slug lookup below then succeeds, but
    // it filled the console with failures that looked like the real fault.
    if (ChatService.UUID.test(projectIdOrSlug)) {
      const { data: projData } = await supabase
        .from("projects")
        .select("workspace_id")
        .eq("id", projectIdOrSlug)
        .maybeSingle();
      if (projData?.workspace_id) return projData.workspace_id;
    }

    const { data: wsData } = await supabase.from("workspaces").select("id").eq("slug", projectIdOrSlug).maybeSingle();
    if (wsData?.id) return wsData.id;

    return projectIdOrSlug;
  }

  /**
   * Lists a project's channels, seeding the defaults the first time it is opened.
   */
  async getChannels(_workspaceSlug: string, projectId: string): Promise<IChatChannel[]> {
    const supabase = getSupabase();
    const scope = await this.resolveScope(_workspaceSlug, projectId);

    // Two distinct queries rather than one `.or(...)`. The old filter
    // interpolated the literal "global" into `project_id.eq.…`, which
    // PostgREST hands to Postgres as a uuid comparison and which fails the
    // whole request — so the list came back empty every time.
    let query = supabase.from("chat_channels").select("*").eq("workspace_id", scope.workspaceId);

    query = scope.projectId ? query.eq("project_id", scope.projectId) : query.is("project_id", null);

    const { data, error } = await query.order("created_at", { ascending: true });

    if (error) throw error;
    if (data && data.length > 0) return data as IChatChannel[];

    return this.seedDefaultChannels(_workspaceSlug, projectId);
  }

  private async seedDefaultChannels(workspaceSlugOrId: string, projectId: string): Promise<IChatChannel[]> {
    const supabase = getSupabase();
    const scope = await this.resolveScope(workspaceSlugOrId, projectId);

    const { data, error } = await supabase
      .from("chat_channels")
      .insert(
        DEFAULT_CHANNELS.map((channel) => ({
          name: channel.name,
          description: channel.description,
          project_id: scope.projectId,
          workspace_id: scope.workspaceId,
        }))
      )
      .select();

    if (error) {
      // Two tabs opening chat at the same moment both try to seed. The unique
      // index added in 0023 makes the loser fail, and the right answer is
      // whatever the winner wrote — not an error and not a second set.
      let existingQuery = supabase.from("chat_channels").select("*").eq("workspace_id", scope.workspaceId);

      existingQuery = scope.projectId
        ? existingQuery.eq("project_id", scope.projectId)
        : existingQuery.is("project_id", null);

      const { data: existing } = await existingQuery.order("created_at", { ascending: true });

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
    const scope = await this.resolveScope(_workspaceSlug, projectId);

    const { data, error } = await supabase
      .from("chat_channels")
      .insert([
        {
          name: toChannelSlug(channel.name ?? ""),
          description: channel.description ?? "",
          project_id: scope.projectId,
          workspace_id: scope.workspaceId,
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

  /**
   * Posts into a channel.
   *
   * Scope comes from the channel row rather than from the caller's argument.
   * The first parameter has always been "a workspace slug or a project id
   * depending on where you are", and guessing which produced rows whose
   * `project_id` disagreed with their own channel's — invisible to their
   * author under RLS, which is what "my messages vanished" looked like.
   * A message belongs wherever its channel belongs, so ask the channel.
   */
  async sendMessage(
    _projectIdOrSlug: string,
    channelId: string,
    messageText: string,
    senderName: string = "User",
    mentions: string[] = []
  ): Promise<IChatMessage> {
    const supabase = getSupabase();
    const user = (await supabase.auth.getUser())?.data?.user;

    const { data: channel, error: channelError } = await supabase
      .from("chat_channels")
      .select("workspace_id, project_id")
      .eq("id", channelId)
      .maybeSingle();

    if (channelError) throw channelError;
    if (!channel) throw new Error("That channel no longer exists. Reload and try again.");

    const scope = { workspaceId: channel.workspace_id as string, projectId: channel.project_id as string | null };

    const { data, error } = await supabase
      .from("chat_messages")
      .insert([
        {
          channel_id: channelId,
          project_id: scope.projectId,
          workspace_id: scope.workspaceId,
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

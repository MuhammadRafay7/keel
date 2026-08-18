/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { IChatChannel, IChatMessage } from "@keel/types";
import { getSupabase } from "./client";

export class ChatService {
  async getChannels(workspaceSlug: string, projectId: string): Promise<IChatChannel[]> {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("chat_channels")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });

    if (error || !data || data.length === 0) {
      // Return default initial ClickUp channels if empty
      return [
        {
          id: "general-channel",
          name: "general",
          description: "General project discussions and team updates",
          project_id: projectId,
          workspace_id: workspaceSlug,
        },
        {
          id: "dev-channel",
          name: "dev-team",
          description: "Engineering and code review chat",
          project_id: projectId,
          workspace_id: workspaceSlug,
        },
        {
          id: "design-channel",
          name: "design-ui",
          description: "UI/UX specs, assets, and design system discussions",
          project_id: projectId,
          workspace_id: workspaceSlug,
        },
      ];
    }

    return data as IChatChannel[];
  }

  async createChannel(workspaceSlug: string, projectId: string, channel: Partial<IChatChannel>): Promise<IChatChannel> {
    const supabase = getSupabase();

    const { data: project } = await supabase.from("projects").select("workspace_id").eq("id", projectId).single();

    const workspaceId = (project as { workspace_id?: string })?.workspace_id || projectId;

    const { data, error } = await supabase
      .from("chat_channels")
      .insert([
        {
          name: channel.name?.toLowerCase().replace(/\s+/g, "-") || "channel",
          description: channel.description || "",
          project_id: projectId,
          workspace_id: workspaceId,
        },
      ])
      .select()
      .single();

    if (error) {
      return {
        id: `channel-${Date.now()}`,
        name: channel.name || "channel",
        description: channel.description || "",
        project_id: projectId,
        workspace_id: workspaceId,
      };
    }

    return data as IChatChannel;
  }

  async getMessages(channelId: string, _projectId: string): Promise<IChatMessage[]> {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("channel_id", channelId)
      .order("created_at", { ascending: true });

    if (error || !data) return [];
    return data as IChatMessage[];
  }

  async sendMessage(
    projectId: string,
    channelId: string,
    messageText: string,
    senderName: string = "User"
  ): Promise<IChatMessage> {
    const supabase = getSupabase();

    const { data: project } = await supabase.from("projects").select("workspace_id").eq("id", projectId).single();

    const workspaceId = (project as { workspace_id?: string })?.workspace_id || projectId;
    const user = (await supabase.auth.getUser())?.data?.user;

    const payload = {
      channel_id: channelId,
      project_id: projectId,
      workspace_id: workspaceId,
      message: messageText,
      sender_id: user?.id || null,
      sender_name: senderName,
      sender_avatar: "",
    };

    const { data, error } = await supabase.from("chat_messages").insert([payload]).select().single();

    if (error || !data) {
      return {
        id: `msg-${Date.now()}`,
        ...payload,
        created_at: new Date().toISOString(),
      };
    }

    return data as IChatMessage;
  }
}

export const supabaseChatService = new ChatService();

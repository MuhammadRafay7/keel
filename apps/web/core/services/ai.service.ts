/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// helpers
import { API_BASE_URL } from "@keel/constants";
import type { AI_EDITOR_TASKS } from "@keel/constants";
// services
import { isSupabaseConfigured, supabaseAIService } from "@keel/services";
import { markdownToHtml } from "@keel/utils";
import { APIService } from "@/services/api.service";

export type TTaskPayload = {
  task: AI_EDITOR_TASKS;
  text_input: string;
  casual_score?: number;
  formal_score?: number;
};

export type TEnhanceWorkItemPayload = {
  task: AI_EDITOR_TASKS;
  title?: string;
  description?: string;
  prompt?: string;
  casual_score?: number;
  formal_score?: number;
};

export type TAIResponse = {
  response: string;
  response_html: string;
};

export class AIService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  /**
   * Renders the proxy's Markdown answer into the `{response, response_html}`
   * pair the editor surfaces consume, so both backends return one shape.
   */
  private async promptSupabase(prompt: string, task?: string): Promise<TAIResponse> {
    const { response } = await supabaseAIService.prompt({ prompt, task });
    return { response, response_html: markdownToHtml(response) };
  }

  async createGptTask(workspaceSlug: string, data: { prompt: string; task: string }): Promise<TAIResponse> {
    if (isSupabaseConfigured) {
      return this.promptSupabase(data.prompt, data.task);
    }
    return this.post(`/api/workspaces/${workspaceSlug}/ai-assistant/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response;
      });
  }

  async performEditorTask(workspaceSlug: string, data: TTaskPayload): Promise<TAIResponse> {
    if (isSupabaseConfigured) {
      const { response } = await supabaseAIService.prompt({
        prompt: data.text_input,
        task: data.task,
        casual_score: data.casual_score,
        formal_score: data.formal_score,
      });
      return { response, response_html: markdownToHtml(response) };
    }
    return this.post(`/api/workspaces/${workspaceSlug}/rephrase-grammar/`, data)
      .then((res) => res?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async enhanceWorkItem(workspaceSlug: string, payload: TEnhanceWorkItemPayload): Promise<TAIResponse> {
    if (isSupabaseConfigured) {
      const { response } = await supabaseAIService.prompt({
        task: payload.task,
        title: payload.title,
        description: payload.description,
        prompt: payload.prompt,
        casual_score: payload.casual_score,
        formal_score: payload.formal_score,
      });
      return { response, response_html: markdownToHtml(response) };
    }
    return this.post(`/api/workspaces/${workspaceSlug}/enhance-work-item/`, payload)
      .then((res) => res?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}

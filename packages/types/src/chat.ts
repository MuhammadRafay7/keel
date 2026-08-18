/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

export interface IChatChannel {
  id: string;
  name: string;
  description?: string;
  is_private?: boolean;
  project_id: string;
  workspace_id: string;
  created_at?: string;
}

export interface IChatMessage {
  id: string;
  channel_id: string;
  project_id: string;
  workspace_id: string;
  message: string;
  sender_id?: string;
  sender_name?: string;
  sender_avatar?: string;
  created_at?: string;
}

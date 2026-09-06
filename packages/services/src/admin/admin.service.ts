/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { getSupabase } from "../supabase/client";

export interface IAdminPlatformStats {
  total_users: number;
  active_users: number;
  new_users_30d: number;
  total_workspaces: number;
  total_projects: number;
  total_issues: number;
}

export interface IAdminUser {
  id: string;
  email: string;
  display_name: string;
  avatar: string;
  is_active: boolean;
  is_superuser: boolean;
  is_staff: boolean;
  created_at: string;
  last_login: string;
  workspaces_count: number;
}

export interface IAdminWorkspace {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  created_at: string;
  owner_id: string;
  owner_email: string;
  owner_name: string;
  members_count: number;
  projects_count: number;
  issues_count: number;
}

export interface IAdminWorkspaceMember {
  member_id: string;
  email: string;
  display_name: string;
  avatar: string;
  role: number;
  is_active: boolean;
  joined_at: string;
}

export interface IAdminUserWorkspace {
  workspace_id: string;
  name: string;
  slug: string;
  role: number;
  joined_at: string;
}

export interface IAdminAuditLog {
  id: string;
  created_at: string;
  actor_id: string;
  actor_email: string;
  action: string;
  target_type: string;
  target_id: string | null;
  details: Record<string, any>;
}

export class AdminService {
  /**
   * Retrieves high-level platform statistics and KPIs.
   */
  async getPlatformStats(): Promise<IAdminPlatformStats> {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc("admin_get_platform_stats");
    if (error) throw error;
    return data as IAdminPlatformStats;
  }

  /**
   * Lists all platform users with search and pagination.
   */
  async listUsers(search = "", limit = 50, offset = 0): Promise<IAdminUser[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc("admin_list_users", {
      p_search: search || null,
      p_limit: limit,
      p_offset: offset,
    });
    if (error) throw error;
    return (data || []) as IAdminUser[];
  }

  /**
   * Creates a new user account with credentials and initial workspace enrollment.
   */
  async createUser(payload: {
    email: string;
    password: string;
    display_name?: string;
    is_superuser?: boolean;
    initial_workspace_id?: string;
    initial_role?: number;
  }): Promise<{ id: string; email: string; success: boolean }> {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc("admin_create_user", {
      p_email: payload.email,
      p_password: payload.password,
      p_display_name: payload.display_name || "",
      p_is_superuser: Boolean(payload.is_superuser),
      p_initial_workspace_id: payload.initial_workspace_id || null,
      p_initial_role: payload.initial_role ?? 15,
    });
    if (error) throw error;
    return data;
  }

  /**
   * Updates user status (active/suspended) and admin role.
   */
  async updateUser(userId: string, data: { is_active?: boolean; is_superuser?: boolean }): Promise<boolean> {
    const supabase = getSupabase();
    const { data: res, error } = await supabase.rpc("admin_update_user", {
      p_user_id: userId,
      p_is_active: data.is_active ?? null,
      p_is_superuser: data.is_superuser ?? null,
    });
    if (error) throw error;
    return Boolean(res);
  }

  /**
   * Permanently deletes a user account.
   */
  async deleteUser(userId: string): Promise<boolean> {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc("admin_delete_user", {
      p_user_id: userId,
    });
    if (error) throw error;
    return Boolean(data);
  }

  /**
   * Lists all workspaces with aggregated metrics.
   */
  async listWorkspaces(search = "", limit = 50, offset = 0): Promise<IAdminWorkspace[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc("admin_list_workspaces", {
      p_search: search || null,
      p_limit: limit,
      p_offset: offset,
    });
    if (error) throw error;
    return (data || []) as IAdminWorkspace[];
  }

  /**
   * Transfers ownership of a workspace to another user.
   */
  async transferWorkspaceOwner(workspaceId: string, newOwnerId: string): Promise<boolean> {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc("admin_transfer_workspace_owner", {
      p_workspace_id: workspaceId,
      p_new_owner_id: newOwnerId,
    });
    if (error) throw error;
    return Boolean(data);
  }

  /**
   * Permanently deletes / soft-deletes a workspace.
   */
  async deleteWorkspace(workspaceId: string): Promise<boolean> {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc("admin_delete_workspace", {
      p_workspace_id: workspaceId,
    });
    if (error) throw error;
    return Boolean(data);
  }

  /**
   * God-mode: Instantly joins any workspace as an Administrator (20).
   */
  async joinWorkspace(workspaceId: string): Promise<boolean> {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc("admin_join_workspace", {
      p_workspace_id: workspaceId,
    });
    if (error) throw error;
    return Boolean(data);
  }

  /**
   * Adds any platform user directly to a workspace.
   */
  async addUserToWorkspace(workspaceId: string, userId: string, role = 15): Promise<boolean> {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc("admin_add_user_to_workspace", {
      p_workspace_id: workspaceId,
      p_user_id: userId,
      p_role: role,
    });
    if (error) throw error;
    return Boolean(data);
  }

  /**
   * Updates a user's role inside a workspace.
   */
  async updateWorkspaceMemberRole(workspaceId: string, userId: string, newRole: number): Promise<boolean> {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc("admin_update_workspace_member_role", {
      p_workspace_id: workspaceId,
      p_user_id: userId,
      p_new_role: newRole,
    });
    if (error) throw error;
    return Boolean(data);
  }

  /**
   * Removes a member from a workspace.
   */
  async removeUserFromWorkspace(workspaceId: string, userId: string): Promise<boolean> {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc("admin_remove_user_from_workspace", {
      p_workspace_id: workspaceId,
      p_user_id: userId,
    });
    if (error) throw error;
    return Boolean(data);
  }

  /**
   * Retrieves all members of a workspace.
   */
  async getWorkspaceMembers(workspaceId: string): Promise<IAdminWorkspaceMember[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc("admin_get_workspace_members", {
      p_workspace_id: workspaceId,
    });
    if (error) throw error;
    return (data || []) as IAdminWorkspaceMember[];
  }

  /**
   * Retrieves all workspaces that a user belongs to.
   */
  async getUserWorkspaces(userId: string): Promise<IAdminUserWorkspace[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc("admin_get_user_workspaces", {
      p_user_id: userId,
    });
    if (error) throw error;
    return (data || []) as IAdminUserWorkspace[];
  }

  /**
   * Lists administrative audit logs.
   */
  async listAuditLogs(limit = 100, offset = 0): Promise<IAdminAuditLog[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc("admin_list_audit_logs", {
      p_limit: limit,
      p_offset: offset,
    });
    if (error) throw error;
    return (data || []) as IAdminAuditLog[];
  }

  /**
   * Reads all application settings.
   */
  async getAppSettings(): Promise<Record<string, string>> {
    const supabase = getSupabase();
    const { data, error } = await supabase.from("app_settings").select("key, value");
    if (error) throw error;
    const settings: Record<string, string> = {};
    (data || []).forEach((row: { key: string; value: string }) => {
      settings[row.key] = row.value;
    });
    return settings;
  }

  /**
   * Updates an application setting.
   */
  async updateAppSetting(key: string, value: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("app_settings")
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) throw error;
  }
}

export const adminService = new AdminService();

/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observable, action, makeObservable, runInAction } from "mobx";
import {
  adminService,
  type IAdminPlatformStats,
  type IAdminUser,
  type IAdminWorkspace,
  type IAdminWorkspaceMember,
  type IAdminUserWorkspace,
  type IAdminAuditLog,
} from "@keel/services";
import type { RootStore } from "./root.store";

export interface IAdminStore {
  stats: IAdminPlatformStats | null;
  users: IAdminUser[];
  workspaces: IAdminWorkspace[];
  auditLogs: IAdminAuditLog[];
  appSettings: Record<string, string>;

  isLoadingStats: boolean;
  isLoadingUsers: boolean;
  isLoadingWorkspaces: boolean;
  isLoadingAuditLogs: boolean;
  isLoadingSettings: boolean;

  fetchStats: () => Promise<IAdminPlatformStats>;
  fetchUsers: (search?: string) => Promise<IAdminUser[]>;
  createUser: (payload: {
    email: string;
    password: string;
    display_name?: string;
    is_superuser?: boolean;
    initial_workspace_id?: string;
    initial_role?: number;
  }) => Promise<{ id: string; email: string; success: boolean }>;
  updateUser: (userId: string, data: { is_active?: boolean; is_superuser?: boolean }) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;

  fetchWorkspaces: (search?: string) => Promise<IAdminWorkspace[]>;
  transferWorkspaceOwner: (workspaceId: string, newOwnerId: string) => Promise<boolean>;
  deleteWorkspace: (workspaceId: string) => Promise<boolean>;
  joinWorkspace: (workspaceId: string) => Promise<boolean>;

  addUserToWorkspace: (workspaceId: string, userId: string, role?: number) => Promise<boolean>;
  updateWorkspaceMemberRole: (workspaceId: string, userId: string, newRole: number) => Promise<boolean>;
  removeUserFromWorkspace: (workspaceId: string, userId: string) => Promise<boolean>;
  getWorkspaceMembers: (workspaceId: string) => Promise<IAdminWorkspaceMember[]>;
  getUserWorkspaces: (userId: string) => Promise<IAdminUserWorkspace[]>;

  fetchAuditLogs: (limit?: number) => Promise<IAdminAuditLog[]>;
  fetchAppSettings: () => Promise<Record<string, string>>;
  updateAppSetting: (key: string, value: string) => Promise<void>;
}

export class AdminStore implements IAdminStore {
  stats: IAdminPlatformStats | null = null;
  users: IAdminUser[] = [];
  workspaces: IAdminWorkspace[] = [];
  auditLogs: IAdminAuditLog[] = [];
  appSettings: Record<string, string> = {};

  isLoadingStats = false;
  isLoadingUsers = false;
  isLoadingWorkspaces = false;
  isLoadingAuditLogs = false;
  isLoadingSettings = false;

  constructor(private store: RootStore) {
    makeObservable(this, {
      stats: observable.ref,
      users: observable.ref,
      workspaces: observable.ref,
      auditLogs: observable.ref,
      appSettings: observable.ref,

      isLoadingStats: observable.ref,
      isLoadingUsers: observable.ref,
      isLoadingWorkspaces: observable.ref,
      isLoadingAuditLogs: observable.ref,
      isLoadingSettings: observable.ref,

      fetchStats: action,
      fetchUsers: action,
      createUser: action,
      updateUser: action,
      deleteUser: action,
      fetchWorkspaces: action,
      transferWorkspaceOwner: action,
      deleteWorkspace: action,
      joinWorkspace: action,
      addUserToWorkspace: action,
      updateWorkspaceMemberRole: action,
      removeUserFromWorkspace: action,
      getWorkspaceMembers: action,
      getUserWorkspaces: action,
      fetchAuditLogs: action,
      fetchAppSettings: action,
      updateAppSetting: action,
    });
  }

  fetchStats = async () => {
    this.isLoadingStats = true;
    try {
      const stats = await adminService.getPlatformStats();
      runInAction(() => {
        this.stats = stats;
        this.isLoadingStats = false;
      });
      return stats;
    } catch (err) {
      runInAction(() => {
        this.isLoadingStats = false;
      });
      throw err;
    }
  };

  fetchUsers = async (search = "") => {
    this.isLoadingUsers = true;
    try {
      const users = await adminService.listUsers(search, 100, 0);
      runInAction(() => {
        this.users = users;
        this.isLoadingUsers = false;
      });
      return users;
    } catch (err) {
      runInAction(() => {
        this.isLoadingUsers = false;
      });
      throw err;
    }
  };

  createUser = async (payload: {
    email: string;
    password: string;
    display_name?: string;
    is_superuser?: boolean;
    initial_workspace_id?: string;
    initial_role?: number;
  }) => {
    const res = await adminService.createUser(payload);
    await this.fetchUsers();
    await this.fetchStats();
    return res;
  };

  updateUser = async (userId: string, data: { is_active?: boolean; is_superuser?: boolean }) => {
    const res = await adminService.updateUser(userId, data);
    runInAction(() => {
      this.users = this.users.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            ...(data.is_active !== undefined ? { is_active: data.is_active } : {}),
            ...(data.is_superuser !== undefined
              ? { is_superuser: data.is_superuser, is_staff: data.is_superuser }
              : {}),
          };
        }
        return u;
      });
    });
    return res;
  };

  deleteUser = async (userId: string) => {
    const res = await adminService.deleteUser(userId);
    runInAction(() => {
      this.users = this.users.filter((u) => u.id !== userId);
    });
    await this.fetchStats();
    return res;
  };

  fetchWorkspaces = async (search = "") => {
    this.isLoadingWorkspaces = true;
    try {
      const workspaces = await adminService.listWorkspaces(search, 100, 0);
      runInAction(() => {
        this.workspaces = workspaces;
        this.isLoadingWorkspaces = false;
      });
      return workspaces;
    } catch (err) {
      runInAction(() => {
        this.isLoadingWorkspaces = false;
      });
      throw err;
    }
  };

  transferWorkspaceOwner = async (workspaceId: string, newOwnerId: string) => {
    const res = await adminService.transferWorkspaceOwner(workspaceId, newOwnerId);
    await this.fetchWorkspaces();
    return res;
  };

  deleteWorkspace = async (workspaceId: string) => {
    const res = await adminService.deleteWorkspace(workspaceId);
    runInAction(() => {
      this.workspaces = this.workspaces.filter((w) => w.id !== workspaceId);
    });
    await this.fetchStats();
    return res;
  };

  joinWorkspace = async (workspaceId: string) => {
    const res = await adminService.joinWorkspace(workspaceId);
    await this.fetchWorkspaces();
    return res;
  };

  addUserToWorkspace = async (workspaceId: string, userId: string, role = 15) => {
    const res = await adminService.addUserToWorkspace(workspaceId, userId, role);
    await this.fetchWorkspaces();
    return res;
  };

  updateWorkspaceMemberRole = async (workspaceId: string, userId: string, newRole: number) => {
    return adminService.updateWorkspaceMemberRole(workspaceId, userId, newRole);
  };

  removeUserFromWorkspace = async (workspaceId: string, userId: string) => {
    const res = await adminService.removeUserFromWorkspace(workspaceId, userId);
    await this.fetchWorkspaces();
    return res;
  };

  getWorkspaceMembers = async (workspaceId: string) => {
    return adminService.getWorkspaceMembers(workspaceId);
  };

  getUserWorkspaces = async (userId: string) => {
    return adminService.getUserWorkspaces(userId);
  };

  fetchAuditLogs = async (limit = 100) => {
    this.isLoadingAuditLogs = true;
    try {
      const logs = await adminService.listAuditLogs(limit, 0);
      runInAction(() => {
        this.auditLogs = logs;
        this.isLoadingAuditLogs = false;
      });
      return logs;
    } catch (err) {
      runInAction(() => {
        this.isLoadingAuditLogs = false;
      });
      throw err;
    }
  };

  fetchAppSettings = async () => {
    this.isLoadingSettings = true;
    try {
      const settings = await adminService.getAppSettings();
      runInAction(() => {
        this.appSettings = settings;
        this.isLoadingSettings = false;
      });
      return settings;
    } catch (err) {
      runInAction(() => {
        this.isLoadingSettings = false;
      });
      throw err;
    }
  };

  updateAppSetting = async (key: string, value: string) => {
    await adminService.updateAppSetting(key, value);
    runInAction(() => {
      this.appSettings = {
        ...this.appSettings,
        [key]: value,
      };
    });
  };
}

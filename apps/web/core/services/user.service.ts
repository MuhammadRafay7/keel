/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// services
import { API_BASE_URL } from "@keel/constants";
import type {
  TIssue,
  IUser,
  IUserActivityResponse,
  IInstanceAdminStatus,
  IUserProfileData,
  IUserProfileProjectSegregation,
  IUserSettings,
  IUserEmailNotificationSettings,
  TIssuesResponse,
  TUserProfile,
  IEmailCheckResponse,
} from "@keel/types";
import {
  isSupabaseConfigured,
  supabaseMemberService,
  supabaseProfileService,
  supabaseUserService,
  supabaseUserWorkItemService,
} from "@keel/services";
import { APIService } from "@/services/api.service";
// types
// helpers

export class UserService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  currentUserConfig() {
    return {
      url: `${this.baseURL}/api/users/me/`,
    };
  }

  async userIssues(
    workspaceSlug: string,
    params: any
  ): Promise<
    | {
        [key: string]: TIssue[];
      }
    | TIssue[]
  > {
    return this.get(`/api/workspaces/${workspaceSlug}/my-issues/`, {
      params,
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async currentUser(): Promise<IUser> {
    if (isSupabaseConfigured) return (await supabaseUserService.currentUser()) as IUser;
    // Using validateStatus: null to bypass interceptors for unauthorized errors.
    return this.get("/api/users/me/", { validateStatus: null })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response;
      });
  }

  async getCurrentUserProfile(): Promise<TUserProfile> {
    if (isSupabaseConfigured) return supabaseProfileService.profile();
    return this.get("/api/users/me/profile/")
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response;
      });
  }
  async updateCurrentUserProfile(data: any): Promise<any> {
    if (isSupabaseConfigured) return supabaseProfileService.updateProfile(data);
    return this.patch("/api/users/me/profile/", data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response;
      });
  }

  async getCurrentUserAccounts(): Promise<any> {
    return this.get("/api/users/me/accounts/")
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response;
      });
  }

  async currentUserInstanceAdminStatus(): Promise<IInstanceAdminStatus> {
    return this.get("/api/users/me/instance-admin/")
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response;
      });
  }

  async currentUserSettings(bustCache: boolean = false): Promise<IUserSettings> {
    if (isSupabaseConfigured) return supabaseProfileService.settings();
    const url = bustCache ? `/api/users/me/settings/?t=${Date.now()}` : "/api/users/me/settings/";
    return this.get(url)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response;
      });
  }

  async currentUserEmailNotificationSettings(): Promise<IUserEmailNotificationSettings> {
    if (isSupabaseConfigured) return supabaseProfileService.emailNotificationSettings() as never;
    return this.get("/api/users/me/notification-preferences/")
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response;
      });
  }

  async updateUser(data: Partial<IUser>): Promise<any> {
    if (isSupabaseConfigured) return supabaseUserService.updateCurrentUser(data);
    return this.patch("/api/users/me/", data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async updateUserOnBoard(): Promise<any> {
    return this.patch("/api/users/me/onboard/", {
      is_onboarded: true,
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async updateUserTourCompleted(): Promise<any> {
    return this.patch("/api/users/me/tour-completed/", {
      is_tour_completed: true,
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async updateCurrentUserEmailNotificationSettings(data: Partial<IUserEmailNotificationSettings>): Promise<any> {
    if (isSupabaseConfigured) return supabaseProfileService.updateEmailNotificationSettings(data as never);
    return this.patch("/api/users/me/notification-preferences/", data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async changePassword(token: string, data: { old_password?: string; new_password: string }): Promise<any> {
    return this.post(`/auth/change-password/`, data, {
      headers: {
        "X-CSRFTOKEN": token,
      },
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getUserProfileData(workspaceSlug: string, userId: string): Promise<IUserProfileData> {
    if (isSupabaseConfigured) return supabaseUserWorkItemService.getUserProfileData(workspaceSlug, userId);
    return this.get(`/api/workspaces/${workspaceSlug}/user-stats/${userId}/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getUserProfileProjectsSegregation(
    workspaceSlug: string,
    userId: string
  ): Promise<IUserProfileProjectSegregation> {
    if (isSupabaseConfigured)
      return supabaseUserWorkItemService.getUserProfileProjectsSegregation(workspaceSlug, userId);
    return this.get(`/api/workspaces/${workspaceSlug}/user-profile/${userId}/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getUserProfileActivity(
    workspaceSlug: string,
    userId: string,
    params: {
      per_page: number;
      cursor?: string;
    }
  ): Promise<IUserActivityResponse> {
    if (isSupabaseConfigured) return supabaseUserWorkItemService.getUserProfileActivity(workspaceSlug, userId, params);
    return this.get(`/api/workspaces/${workspaceSlug}/user-activity/${userId}/`, {
      params,
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async downloadProfileActivity(
    workspaceSlug: string,
    userId: string,
    data: {
      date: string;
    }
  ): Promise<any> {
    if (isSupabaseConfigured) {
      const { csv, rows } = await supabaseUserWorkItemService.exportProfileActivityCsv(workspaceSlug, userId);

      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `activity-${data.date || new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      return { message: `Exported ${rows} activity records.` };
    }
    return this.post(`/api/workspaces/${workspaceSlug}/user-activity/${userId}/export/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getUserProfileIssues(
    workspaceSlug: string,
    userId: string,
    params: any,
    config = {}
  ): Promise<TIssuesResponse> {
    if (isSupabaseConfigured)
      return supabaseUserWorkItemService.getUserProfileIssues(workspaceSlug, userId, params, config);
    return this.get(
      `/api/workspaces/${workspaceSlug}/user-issues/${userId}/`,
      {
        params,
      },
      config
    )
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async deactivateAccount() {
    if (isSupabaseConfigured) return supabaseUserService.deactivateAccount();
    return this.delete(`/api/users/me/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async leaveWorkspace(workspaceSlug: string) {
    if (isSupabaseConfigured) return supabaseMemberService.leaveWorkspace(workspaceSlug);
    return this.post(`/api/workspaces/${workspaceSlug}/members/leave/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async joinProject(workspaceSlug: string, project_ids: string[]): Promise<any> {
    if (isSupabaseConfigured) return supabaseMemberService.joinProjects(workspaceSlug, project_ids);
    return this.post(`/api/users/me/workspaces/${workspaceSlug}/projects/invitations/`, { project_ids })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async leaveProject(workspaceSlug: string, projectId: string) {
    if (isSupabaseConfigured) return supabaseMemberService.leaveProject(workspaceSlug, projectId);
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/members/leave/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async checkEmail(token: string, email: string): Promise<IEmailCheckResponse> {
    return this.post(
      "/auth/email-check/",
      { email },
      {
        headers: {
          "X-CSRFTOKEN": token,
        },
      }
    )
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async generateEmailCode(data: { email: string }): Promise<any> {
    if (isSupabaseConfigured) return supabaseUserService.sendEmailChangeCode(data.email);
    return this.post("/api/users/me/email/generate-code/", data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async verifyEmailCode(data: { email: string; code: string }): Promise<any> {
    if (isSupabaseConfigured) return supabaseUserService.verifyEmailChangeCode(data.email, data.code);
    return this.patch("/api/users/me/email/", data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}

const userService = new UserService();

export default userService;

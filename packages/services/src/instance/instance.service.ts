/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// keel imports
import { API_BASE_URL } from "@keel/constants";
import type {
  IFormattedInstanceConfiguration,
  IInstance,
  IInstanceAdmin,
  IInstanceConfig,
  IInstanceConfiguration,
  IInstanceInfo,
  TPage,
} from "@keel/types";
import { isSupabaseConfigured } from "../supabase/client";
import { APIService } from "../api.service";

/**
 * Service class for managing instance-related operations
 * Handles retrieval of instance information and changelog
 * @extends {APIService}
 */
export class InstanceService extends APIService {
  /**
   * Creates an instance of InstanceService
   * Initializes the service with the base API URL
   */
  constructor() {
    super(API_BASE_URL);
  }

  /**
   * Retrieves information about the current instance
   * @returns {Promise<IInstanceInfo>} Promise resolving to instance information
   * @throws {Error} If the API request fails
   * @remarks This method uses the validateStatus: null option to bypass interceptors for unauthorized errors.
   */
  async info(): Promise<IInstanceInfo> {
    if (isSupabaseConfigured) {
      return {
        instance: {
          id: "keel-instance",
          instance_name: "Keel",
          instance_id: "keel-instance",
          current_version: "1.4.1",
          latest_version: "1.4.1",
          edition: "PLANE_COMMUNITY",
          is_telemetry_enabled: true,
          is_support_required: true,
          is_setup_done: true,
          is_signup_screen_visited: true,
          is_verified: true,
          is_test: false,
          is_current_version_deprecated: false,
          is_activated: true,
          workspaces_exist: true,
        } as unknown as IInstance,
        config: {
          ENABLE_SIGNUP: "1",
          DISABLE_WORKSPACE_CREATION: "0",
          IS_GOOGLE_ENABLED: "0",
          IS_GITHUB_ENABLED: "0",
          IS_GITLAB_ENABLED: "0",
          IS_GITEA_ENABLED: "0",
          is_email_password_enabled: true,
          is_magic_login_enabled: false,
          is_smtp_configured: false,
          is_google_enabled: false,
          is_github_enabled: false,
          is_gitlab_enabled: false,
          is_gitea_enabled: false,
          is_signup_disabled: false,
        } as unknown as IInstanceConfig,
      };
    }

    return this.get("/api/instances/", { validateStatus: null })
      .then((response) => response.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  /**
   * Fetches the changelog for the current instance
   * @returns {Promise<TPage>} Promise resolving to the changelog page data
   * @throws {Error} If the API request fails
   */
  async changelog(): Promise<TPage> {
    return this.get("/api/instances/changelog/")
      .then((response) => response.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  /**
   * Fetches the list of instance admins
   * @returns {Promise<IInstanceAdmin[]>} Promise resolving to an array of instance admins
   * @throws {Error} If the API request fails
   * @remarks This method uses the validateStatus: null option to bypass interceptors for unauthorized errors.
   */
  async admins(): Promise<IInstanceAdmin[]> {
    if (isSupabaseConfigured) {
      return [];
    }

    return this.get("/api/instances/admins/", { validateStatus: null })
      .then((response) => response.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  /**
   * Updates the instance information
   * @param {Partial<IInstance>} data Data to update the instance with
   * @returns {Promise<IInstance>} Promise resolving to the updated instance information
   * @throws {Error} If the API request fails
   */
  async update(data: Partial<IInstance>): Promise<IInstance> {
    if (isSupabaseConfigured) {
      return {
        id: "keel-instance",
        instance_name: data.instance_name ?? "Keel",
        ...data,
      } as unknown as IInstance;
    }

    return this.patch("/api/instances/", data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  /**
   * Fetches the list of instance configurations
   * @returns {Promise<IInstanceConfiguration[]>} Promise resolving to an array of instance configurations
   * @throws {Error} If the API request fails
   */
  async configurations(): Promise<IInstanceConfiguration[]> {
    if (isSupabaseConfigured) {
      return [
        { key: "ENABLE_SIGNUP", value: "1", category: "general" },
        { key: "DISABLE_WORKSPACE_CREATION", value: "0", category: "workspace" },
        { key: "IS_GOOGLE_ENABLED", value: "0", category: "authentication" },
        { key: "IS_GITHUB_ENABLED", value: "0", category: "authentication" },
        { key: "IS_GITLAB_ENABLED", value: "0", category: "authentication" },
        { key: "IS_GITEA_ENABLED", value: "0", category: "authentication" },
      ] as unknown as IInstanceConfiguration[];
    }

    return this.get("/api/instances/configurations/")
      .then((response) => response.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  /**
   * Updates the instance configurations
   * @param {Partial<IFormattedInstanceConfiguration>} data Data to update the instance configurations with
   * @returns {Promise<IInstanceConfiguration[]>} The updated instance configurations
   * @throws {Error} If the API request fails
   */
  async updateConfigurations(data: Partial<IFormattedInstanceConfiguration>): Promise<IInstanceConfiguration[]> {
    if (isSupabaseConfigured) {
      return Object.entries(data).map(([key, value]) => ({
        key,
        value: String(value),
        category: "general",
      })) as unknown as IInstanceConfiguration[];
    }

    return this.patch("/api/instances/configurations/", data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  /**
   * Sends a test email to the specified receiver to test SMTP configuration
   * @param {string} receiverEmail Email address to send the test email to
   * @returns {Promise<void>} Promise resolving to void
   * @throws {Error} If the API request fails
   */
  async sendTestEmail(receiverEmail: string): Promise<void> {
    return this.post("/api/instances/email-credentials-check/", {
      receiver_email: receiverEmail,
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  /**
   * Disables the email configuration
   * @returns {Promise<void>} Promise resolving to void
   * @throws {Error} If the API request fails
   */
  async disableEmail(): Promise<void> {
    return this.delete("/api/instances/configurations/disable-email-feature/")
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}

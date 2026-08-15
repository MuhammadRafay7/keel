/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observable, action, makeObservable, runInAction } from "mobx";
// types
import { isSupabaseConfigured } from "@keel/services";
import type { IInstance, IInstanceConfig } from "@keel/types";
// services
import { InstanceService } from "@/services/instance.service";

type TError = {
  status: string;
  message: string;
  data?: {
    is_activated: boolean;
    is_setup_done: boolean;
  };
};

export interface IInstanceStore {
  // issues
  isLoading: boolean;
  instance: IInstance | undefined;
  config: IInstanceConfig | undefined;
  error: TError | undefined;
  // action
  fetchInstanceInfo: () => Promise<void>;
}

export class InstanceStore implements IInstanceStore {
  isLoading: boolean = true;
  instance: IInstance | undefined = undefined;
  config: IInstanceConfig | undefined = undefined;
  error: TError | undefined = undefined;
  // services
  instanceService;

  constructor() {
    makeObservable(this, {
      // observable
      isLoading: observable.ref,
      instance: observable,
      config: observable,
      error: observable,
      // actions
      fetchInstanceInfo: action,
    });
    // services
    this.instanceService = new InstanceService();
  }

  /**
   * @description fetching instance information
   */
  fetchInstanceInfo = async () => {
    try {
      this.isLoading = true;
      this.error = undefined;

      // Supabase provides authentication directly, so there is no instance
      // endpoint to ask. Report what Supabase Auth actually supports rather
      // than calling the retired Django API.
      if (isSupabaseConfigured) {
        runInAction(() => {
          this.isLoading = false;
          this.instance = { is_setup_done: true, is_signup_screen_visited: true } as unknown as IInstance;
          this.config = {
            is_email_password_enabled: true,
            is_magic_login_enabled: false,
            is_smtp_configured: false,
            is_google_enabled: false,
            is_github_enabled: false,
            is_gitlab_enabled: false,
            is_gitea_enabled: false,
            is_signup_disabled: false,
          } as unknown as IInstanceConfig;
        });
        return;
      }

      const instanceInfo = await this.instanceService.getInstanceInfo();
      runInAction(() => {
        this.isLoading = false;
        this.instance = instanceInfo.instance;
        this.config = instanceInfo.config;
      });
    } catch (error) {
      runInAction(() => {
        this.isLoading = false;
        this.error = {
          status: "error",
          message: "Failed to fetch instance info",
        };
      });
      throw error;
    }
  };
}

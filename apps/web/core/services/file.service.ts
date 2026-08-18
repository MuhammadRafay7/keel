/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { AxiosRequestConfig } from "axios";
// keel types
import { API_BASE_URL } from "@keel/constants";
import { getFileMetaDataForUpload, generateFileUploadPayload } from "@keel/services";
import type { EFileAssetType, TFileEntityInfo, TFileSignedURLResponse } from "@keel/types";
import { getAssetIdFromUrl } from "@keel/utils";
// helpers
// services
import { isSupabaseConfigured, supabaseStorageService } from "@keel/services";
import { APIService } from "@/services/api.service";
import { FileUploadService } from "@/services/file-upload.service";

export interface UnSplashImage {
  id: string;
  created_at: Date;
  updated_at: Date;
  promoted_at: Date;
  width: number;
  height: number;
  color: string;
  blur_hash: string;
  description: null;
  alt_description: string;
  urls: UnSplashImageUrls;
  [key: string]: any;
}

export interface UnSplashImageUrls {
  raw: string;
  full: string;
  regular: string;
  small: string;
  thumb: string;
  small_s3: string;
}

export enum TFileAssetType {
  COMMENT_DESCRIPTION = "COMMENT_DESCRIPTION",
  ISSUE_ATTACHMENT = "ISSUE_ATTACHMENT",
  ISSUE_DESCRIPTION = "ISSUE_DESCRIPTION",
  PAGE_DESCRIPTION = "PAGE_DESCRIPTION",
  PROJECT_COVER = "PROJECT_COVER",
  USER_AVATAR = "USER_AVATAR",
  USER_COVER = "USER_COVER",
  WORKSPACE_LOGO = "WORKSPACE_LOGO",
}

export class FileService extends APIService {
  private cancelSource: any;
  private fileUploadService: FileUploadService;

  constructor() {
    super(API_BASE_URL);
    this.cancelUpload = this.cancelUpload.bind(this);
    // upload service
    this.fileUploadService = new FileUploadService();
  }

  private async updateWorkspaceAssetUploadStatus(workspaceSlug: string, assetId: string): Promise<void> {
    return this.patch(`/api/assets/v2/workspaces/${workspaceSlug}/${assetId}/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async uploadWorkspaceAsset(
    workspaceSlug: string,
    data: TFileEntityInfo,
    file: File,
    uploadProgressHandler?: AxiosRequestConfig["onUploadProgress"]
  ): Promise<TFileSignedURLResponse> {
    if (isSupabaseConfigured) {
      const result = await supabaseStorageService.uploadWorkspaceAsset(workspaceSlug, file, data?.entity_type);
      return {
        asset_id: result.asset_id,
        asset_url: result.url,
        upload_data: { url: result.url, fields: {} },
      } as unknown as TFileSignedURLResponse;
    }
    const fileMetaData = await getFileMetaDataForUpload(file);
    return this.post(`/api/assets/v2/workspaces/${workspaceSlug}/`, {
      ...data,
      ...fileMetaData,
    })
      .then(async (response) => {
        const signedURLResponse: TFileSignedURLResponse = response?.data;
        const fileUploadPayload = generateFileUploadPayload(signedURLResponse, file);
        await this.fileUploadService.uploadFile(
          signedURLResponse.upload_data.url,
          fileUploadPayload,
          uploadProgressHandler
        );
        await this.updateWorkspaceAssetUploadStatus(workspaceSlug.toString(), signedURLResponse.asset_id);
        return signedURLResponse;
      })
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async deleteWorkspaceAsset(workspaceSlug: string, assetId: string): Promise<void> {
    if (isSupabaseConfigured) return supabaseStorageService.deleteAssetById(assetId);
    return this.delete(`/api/assets/v2/workspaces/${workspaceSlug}/${assetId}/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  private async updateProjectAssetUploadStatus(
    workspaceSlug: string,
    projectId: string,
    assetId: string
  ): Promise<void> {
    return this.patch(`/api/assets/v2/workspaces/${workspaceSlug}/projects/${projectId}/${assetId}/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async updateBulkWorkspaceAssetsUploadStatus(
    workspaceSlug: string,
    entityId: string,
    data: {
      asset_ids: string[];
    }
  ): Promise<void> {
    // Supabase uploads are complete when the upload call returns, so there is
    // no separate status to confirm.
    if (isSupabaseConfigured) return;
    return this.post(`/api/assets/v2/workspaces/${workspaceSlug}/${entityId}/bulk/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async updateBulkProjectAssetsUploadStatus(
    workspaceSlug: string,
    projectId: string,
    entityId: string,
    data: {
      asset_ids: string[];
    }
  ): Promise<void> {
    if (isSupabaseConfigured) return;
    return this.post(`/api/assets/v2/workspaces/${workspaceSlug}/projects/${projectId}/${entityId}/bulk/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async uploadProjectAsset(
    workspaceSlug: string,
    projectId: string,
    data: TFileEntityInfo,
    file: File,
    uploadProgressHandler?: AxiosRequestConfig["onUploadProgress"]
  ): Promise<TFileSignedURLResponse> {
    if (isSupabaseConfigured) {
      const result = await supabaseStorageService.uploadProjectAsset(workspaceSlug, projectId, file, {
        entityType: data?.entity_type,
        issueId: data?.entity_identifier,
      });
      return {
        asset_id: result.asset_id,
        asset_url: result.url,
        upload_data: { url: result.url, fields: {} },
      } as unknown as TFileSignedURLResponse;
    }
    const fileMetaData = await getFileMetaDataForUpload(file);
    return this.post(`/api/assets/v2/workspaces/${workspaceSlug}/projects/${projectId}/`, {
      ...data,
      ...fileMetaData,
    })
      .then(async (response) => {
        const signedURLResponse: TFileSignedURLResponse = response?.data;
        const fileUploadPayload = generateFileUploadPayload(signedURLResponse, file);
        await this.fileUploadService.uploadFile(
          signedURLResponse.upload_data.url,
          fileUploadPayload,
          uploadProgressHandler
        );
        await this.updateProjectAssetUploadStatus(workspaceSlug, projectId, signedURLResponse.asset_id);
        return signedURLResponse;
      })
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  private async updateUserAssetUploadStatus(assetId: string): Promise<void> {
    return this.patch(`/api/assets/v2/user-assets/${assetId}/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async uploadUserAsset(data: TFileEntityInfo, file: File): Promise<TFileSignedURLResponse> {
    if (isSupabaseConfigured) {
      const result = await supabaseStorageService.uploadUserAsset(file, data?.entity_type);
      return {
        asset_id: result.asset_id,
        asset_url: result.url,
        upload_data: { url: result.url, fields: {} },
      } as unknown as TFileSignedURLResponse;
    }
    const fileMetaData = await getFileMetaDataForUpload(file);
    return this.post(`/api/assets/v2/user-assets/`, {
      ...data,
      ...fileMetaData,
    })
      .then(async (response) => {
        const signedURLResponse: TFileSignedURLResponse = response?.data;
        const fileUploadPayload = generateFileUploadPayload(signedURLResponse, file);
        await this.fileUploadService.uploadFile(signedURLResponse.upload_data.url, fileUploadPayload);
        await this.updateUserAssetUploadStatus(signedURLResponse.asset_id);
        return signedURLResponse;
      })
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async deleteUserAsset(assetId: string): Promise<void> {
    if (isSupabaseConfigured) return supabaseStorageService.deleteAssetById(assetId);
    return this.delete(`/api/assets/v2/user-assets/${assetId}/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async deleteNewAsset(assetPath: string): Promise<void> {
    return this.delete(assetPath)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async deleteOldWorkspaceAsset(workspaceId: string, src: string): Promise<any> {
    if (isSupabaseConfigured) return supabaseStorageService.deleteAssetBySrc(src);
    const assetKey = getAssetIdFromUrl(src);
    return this.delete(`/api/workspaces/file-assets/${workspaceId}/${assetKey}/`)
      .then((response) => response?.status)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async deleteOldUserAsset(src: string): Promise<any> {
    if (isSupabaseConfigured) return supabaseStorageService.deleteAssetBySrc(src);
    const assetKey = getAssetIdFromUrl(src);
    return this.delete(`/api/users/file-assets/${assetKey}/`)
      .then((response) => response?.status)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async restoreNewAsset(workspaceSlug: string, src: string): Promise<void> {
    if (isSupabaseConfigured) return supabaseStorageService.restoreAsset(src);
    // remove the last slash and get the asset id
    const assetId = getAssetIdFromUrl(src);
    return this.post(`/api/assets/v2/workspaces/${workspaceSlug}/restore/${assetId}/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async checkIfAssetExists(
    workspaceSlug: string,
    assetId: string
  ): Promise<{
    exists: boolean;
  }> {
    if (isSupabaseConfigured) return supabaseStorageService.assetExists(assetId);
    return this.get(`/api/assets/v2/workspaces/${workspaceSlug}/check/${assetId}/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async restoreOldEditorAsset(workspaceId: string, src: string): Promise<void> {
    if (isSupabaseConfigured) return supabaseStorageService.restoreAsset(src);
    const assetKey = getAssetIdFromUrl(src);
    return this.post(`/api/workspaces/file-assets/${workspaceId}/${assetKey}/restore/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  cancelUpload() {
    this.cancelSource.cancel("Upload canceled");
  }

  async getUnsplashImages(query?: string): Promise<UnSplashImage[]> {
    // Unsplash needs a server-side key, which this stack has nowhere to keep.
    // An empty list makes the picker show its upload tab instead of erroring.
    if (isSupabaseConfigured) return [];
    return this.get(`/api/unsplash/`, {
      params: {
        query,
      },
    })
      .then((res) => res?.data?.results ?? res?.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }

  async duplicateAsset(
    workspaceSlug: string,
    assetId: string,
    data: {
      entity_id?: string;
      entity_type: EFileAssetType;
      project_id?: string;
    }
  ): Promise<{ asset_id: string }> {
    if (isSupabaseConfigured) return supabaseStorageService.duplicateAsset(assetId);
    return this.post(`/api/assets/v2/workspaces/${workspaceSlug}/duplicate-assets/${assetId}/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}

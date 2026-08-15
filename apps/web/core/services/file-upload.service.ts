/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { type AxiosRequestConfig, isCancel } from "axios";
// services
import { APIService } from "@/services/api.service";

export class FileUploadService extends APIService {
  // AbortController rather than axios's CancelToken: CancelToken has been
  // deprecated since axios 0.22 and its typings no longer export it as a value,
  // so it cannot be called under verbatimModuleSyntax. isCancel still
  // recognises the CanceledError an abort produces.
  private abortController: AbortController | undefined;

  constructor() {
    super("");
  }

  async uploadFile(
    url: string,
    data: FormData,
    uploadProgressHandler?: AxiosRequestConfig["onUploadProgress"]
  ): Promise<void> {
    this.abortController = new AbortController();
    return this.post(url, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      signal: this.abortController.signal,
      withCredentials: false,
      onUploadProgress: uploadProgressHandler,
    })
      .then((response) => response?.data)
      .catch((error) => {
        if (isCancel(error)) {
          console.log(error.message);
        } else {
          throw error?.response?.data;
        }
      });
  }

  cancelUpload() {
    this.abortController?.abort();
  }
}

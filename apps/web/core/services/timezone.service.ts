/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { API_BASE_URL } from "@keel/constants";
import type { TTimezoneObject, TTimezones } from "@keel/types";
// helpers
// api services
import { isSupabaseConfigured } from "@keel/services";
import { APIService } from "@/services/api.service";

/** The IANA zones the runtime knows, labelled with their current offset. */
function buildTimezones(): TTimezoneObject[] {
  const zones =
    typeof Intl.supportedValuesOf === "function"
      ? Intl.supportedValuesOf("timeZone")
      : [Intl.DateTimeFormat().resolvedOptions().timeZone];

  const now = new Date();

  return zones.map((zone) => {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: zone, timeZoneName: "longOffset" }).formatToParts(now);
    const offset = parts.find((part) => part.type === "timeZoneName")?.value ?? "GMT+00:00";
    const utcOffset = offset.replace("GMT", "") || "+00:00";

    return {
      value: zone,
      label: `(${offset}) ${zone.replace(/_/g, " ")}`,
      utc_offset: utcOffset,
      gmt_offset: offset,
    };
  });
}

export class TimezoneService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async fetch(): Promise<TTimezones> {
    // Django shipped a static list; the browser already knows the same one, so
    // there is nothing to fetch.
    if (isSupabaseConfigured) return { timezones: buildTimezones() };
    return this.get(`/api/timezones/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}

const timezoneService = new TimezoneService();

export default timezoneService;

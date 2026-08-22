/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { supabaseAttendanceService } from "@keel/services";
import type { IAttendanceSettings } from "@keel/types";
import { useWorkspace } from "@/hooks/store/use-workspace";
import { ApproversSection } from "./approvers-section";
import { HolidaysSection } from "./holidays-section";
import { LeaveTypesSection } from "./leave-types-section";
import { PolicySection } from "./policy-section";
import { SchedulesSection } from "./schedules-section";

/**
 * Everything an admin can set, ordered by how often it needs touching:
 * policy once, leave types once a year, holidays once a year, hours when
 * somebody joins, approvers when the org chart moves.
 */
export const AttendanceSettingsRoot = observer(function AttendanceSettingsRoot() {
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?.id ?? "";

  const [settings, setSettings] = useState<IAttendanceSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workspaceId) return;

    let cancelled = false;
    void (async () => {
      setIsLoading(true);
      try {
        // Same idempotent bootstrap the member-facing page calls, so an admin
        // who opens settings first does not land on an empty screen either.
        const next = await supabaseAttendanceService.bootstrap(workspaceId);
        if (!cancelled) setSettings(next);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not open attendance settings");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  if (isLoading) return <p className="py-16 text-center text-body-xs-regular text-placeholder">Loading…</p>;

  if (error) {
    return (
      <p className="rounded-xl border border-danger-subtle bg-danger-subtle px-4 py-3 text-body-xs-regular text-danger-primary">
        {error}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <PolicySection workspaceId={workspaceId} settings={settings} onSaved={setSettings} />
      <LeaveTypesSection workspaceId={workspaceId} />
      <HolidaysSection workspaceId={workspaceId} />
      <SchedulesSection workspaceId={workspaceId} settings={settings} />
      <ApproversSection workspaceId={workspaceId} settings={settings} onSettingsSaved={setSettings} />
    </div>
  );
});

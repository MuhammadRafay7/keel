/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useEffect, useState } from "react";
import { Button } from "@keel/propel/button";
import { Switch } from "@keel/propel/switch";
import { supabaseAttendanceService } from "@keel/services";
import type { IAttendanceSettings } from "@keel/types";
import { InlineError, SettingsRow, SettingsSection, settingsInputClass } from "./shared";

type TPolicySectionProps = {
  workspaceId: string;
  settings: IAttendanceSettings | null;
  onSaved: (settings: IAttendanceSettings) => void;
};

/**
 * The numbers the sweep and the leave checks read.
 *
 * Every field here decides what happens to somebody's hours when they are not
 * around to say — which is why each one says what it does rather than what it
 * is called in the database.
 */
export function PolicySection({ workspaceId, settings, onSaved }: TPolicySectionProps) {
  const [draft, setDraft] = useState<IAttendanceSettings | null>(settings);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setDraft(settings), [settings]);

  if (!draft) return null;

  const set = <K extends keyof IAttendanceSettings>(key: K, value: IAttendanceSettings[K]) =>
    setDraft({ ...draft, [key]: value });

  const isDirty = JSON.stringify(draft) !== JSON.stringify(settings);

  const save = async () => {
    setIsBusy(true);
    setError(null);
    try {
      const { workspace_id: _ignored, ...patch } = draft;
      onSaved(await supabaseAttendanceService.updateSettings(workspaceId, patch));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save these settings");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <SettingsSection
      title="Policy"
      description="What the system assumes when nobody tells it otherwise — the length of a shift with no schedule, how long an open shift waits before it is closed for someone, and when a timer has clearly been left running."
      action={
        <Button variant="primary" size="sm" onClick={save} disabled={!isDirty || isBusy}>
          {isBusy ? "Saving…" : "Save"}
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SettingsRow label="Default shift" hint="Hours, when a member has no schedule">
          <input
            type="number"
            min={1}
            max={24}
            step={0.5}
            value={draft.default_shift_hours}
            onChange={(e) => set("default_shift_hours", Number(e.target.value))}
            className={settingsInputClass}
          />
        </SettingsRow>

        <SettingsRow label="Auto-close after" hint="Hours past the expected end">
          <input
            type="number"
            min={0}
            max={24}
            step={0.5}
            value={draft.auto_close_grace_hours}
            onChange={(e) => set("auto_close_grace_hours", Number(e.target.value))}
            className={settingsInputClass}
          />
        </SettingsRow>

        <SettingsRow label="Timer cap" hint="Hours before a timer is treated as forgotten">
          <input
            type="number"
            min={1}
            max={24}
            step={0.5}
            value={draft.task_timer_max_hours}
            onChange={(e) => set("task_timer_max_hours", Number(e.target.value))}
            className={settingsInputClass}
          />
        </SettingsRow>

        <SettingsRow label="Lateness grace" hint="Minutes after the scheduled start">
          <input
            type="number"
            min={0}
            max={240}
            value={draft.default_grace_minutes}
            onChange={(e) => set("default_grace_minutes", Number(e.target.value))}
            className={settingsInputClass}
          />
        </SettingsRow>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <ToggleRow
          label="Timers on work items"
          hint="Adds a timer to the work item panel in projects that have time tracking switched on."
          value={draft.is_task_tracking_enabled}
          onChange={(value) => set("is_task_tracking_enabled", value)}
        />
        <ToggleRow
          label="Let people add time afterwards"
          hint="Without this, anyone who forgets a timer has to go through the correction queue instead — which turns your approvals into data entry."
          value={draft.is_manual_entry_enabled}
          onChange={(value) => set("is_manual_entry_enabled", value)}
        />
      </div>

      <InlineError message={error} />
    </SettingsSection>
  );
}

function ToggleRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-6 rounded-xl border border-subtle bg-surface-1 px-4 py-3">
      <div className="max-w-2xl">
        <p className="text-body-xs-medium text-primary">{label}</p>
        <p className="mt-0.5 text-11 text-tertiary">{hint}</p>
      </div>
      <Switch value={value} onChange={onChange} label={label} />
    </div>
  );
}

/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useCallback, useEffect, useState } from "react";
import { Button } from "@keel/propel/button";
import { Switch } from "@keel/propel/switch";
import { supabaseAttendanceService } from "@keel/services";
import type { ILeaveType } from "@keel/types";
import { cn } from "@keel/utils";
import { EmptyState, InlineError, SettingsRow, SettingsSection, settingsInputClass } from "./shared";

type TLeaveTypesSectionProps = {
  workspaceId: string;
};

type TLeaveTypeDraft = Omit<ILeaveType, "id" | "workspace_id">;

const NEW_TYPE: TLeaveTypeDraft = {
  name: "",
  colour: "#6366f1",
  annual_allowance: 0,
  allows_half_day: true,
  carryover_days: 0,
  is_paid: true,
  is_balance_tracked: true,
  is_active: true,
};

/**
 * The kinds of leave a workspace grants.
 *
 * Retired rather than deleted, always: `leave_requests.leave_type_id` is
 * `on delete restrict`, so removing a type would mean deleting the history of
 * everyone who ever took it.
 */
export function LeaveTypesSection({ workspaceId }: TLeaveTypesSectionProps) {
  const [types, setTypes] = useState<ILeaveType[]>([]);
  const [draft, setDraft] = useState<TLeaveTypeDraft | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!workspaceId) return;
    try {
      setTypes(await supabaseAttendanceService.getAllLeaveTypes(workspaceId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load leave types");
    }
  }, [workspaceId]);

  useEffect(() => {
    void load();
  }, [load]);

  const act = useCallback(
    async (action: () => Promise<unknown>) => {
      setIsBusy(true);
      setError(null);
      try {
        await action();
        await load();
      } catch (e) {
        setError(e instanceof Error ? e.message : "That did not work");
      } finally {
        setIsBusy(false);
      }
    },
    [load]
  );

  return (
    <SettingsSection
      title="Leave types"
      description="Each type carries its own yearly allowance and its own rules. Retiring one keeps every request ever made against it; there is no delete, on purpose."
      action={
        <Button variant="secondary" size="sm" onClick={() => setDraft({ ...NEW_TYPE })} disabled={Boolean(draft)}>
          Add a type
        </Button>
      }
    >
      {types.length === 0 && !draft && <EmptyState>No leave types yet.</EmptyState>}

      <div className="flex flex-col gap-2">
        {types.map((type) => (
          <LeaveTypeRow
            key={type.id}
            type={type}
            isBusy={isBusy}
            onSave={(patch) => act(() => supabaseAttendanceService.updateLeaveType(type.id, patch))}
            onRetire={() => act(() => supabaseAttendanceService.retireLeaveType(type.id))}
            onRestore={() => act(() => supabaseAttendanceService.updateLeaveType(type.id, { is_active: true }))}
          />
        ))}

        {draft && (
          <div className="squircle-card border border-accent-subtle bg-surface-1 p-4">
            <LeaveTypeFields value={draft} onChange={setDraft} />
            <div className="mt-3 flex items-center justify-end gap-2">
              <Button variant="tertiary" size="sm" onClick={() => setDraft(null)} disabled={isBusy}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={isBusy || !draft.name.trim()}
                onClick={() =>
                  void act(async () => {
                    await supabaseAttendanceService.createLeaveType(workspaceId, draft);
                    setDraft(null);
                  })
                }
              >
                Create
              </Button>
            </div>
          </div>
        )}
      </div>

      <InlineError message={error} />
    </SettingsSection>
  );
}

function LeaveTypeRow({
  type,
  isBusy,
  onSave,
  onRetire,
  onRestore,
}: {
  type: ILeaveType;
  isBusy: boolean;
  onSave: (patch: Partial<ILeaveType>) => Promise<void>;
  onRetire: () => Promise<void>;
  onRestore: () => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(type);

  useEffect(() => setDraft(type), [type]);

  if (isEditing) {
    return (
      <div className="squircle-card border border-accent-subtle bg-surface-1 p-4">
        <LeaveTypeFields value={draft} onChange={(next) => setDraft({ ...type, ...next })} />
        <div className="mt-3 flex items-center justify-end gap-2">
          <Button
            variant="tertiary"
            size="sm"
            onClick={() => {
              setDraft(type);
              setIsEditing(false);
            }}
            disabled={isBusy}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={isBusy}
            onClick={() =>
              void onSave({
                name: draft.name,
                colour: draft.colour,
                annual_allowance: draft.annual_allowance,
                allows_half_day: draft.allows_half_day,
                carryover_days: draft.carryover_days,
                is_paid: draft.is_paid,
                is_balance_tracked: draft.is_balance_tracked,
              }).then(() => setIsEditing(false))
            }
          >
            Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <article
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 squircle-card border border-subtle bg-surface-1 px-4 py-3",
        !type.is_active && "opacity-60"
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="size-3 shrink-0 rounded-full border border-subtle"
          style={{ backgroundColor: type.colour }}
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p className="truncate text-body-xs-medium text-primary">
            {type.name}
            {!type.is_active && <span className="ml-2 text-11 text-placeholder">Retired</span>}
          </p>
          <p className="mt-0.5 text-11 text-tertiary">
            {type.is_balance_tracked ? `${type.annual_allowance} days a year` : "No balance kept"}
            {type.is_paid ? " · Paid" : " · Unpaid"}
            {type.allows_half_day ? " · Half days allowed" : ""}
            {Number(type.carryover_days) > 0 ? ` · ${type.carryover_days} carry over` : ""}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="tertiary" size="sm" onClick={() => setIsEditing(true)} disabled={isBusy}>
          Edit
        </Button>
        {type.is_active ? (
          <Button variant="tertiary" size="sm" onClick={() => void onRetire()} disabled={isBusy}>
            Retire
          </Button>
        ) : (
          <Button variant="tertiary" size="sm" onClick={() => void onRestore()} disabled={isBusy}>
            Restore
          </Button>
        )}
      </div>
    </article>
  );
}

function LeaveTypeFields({ value, onChange }: { value: TLeaveTypeDraft; onChange: (next: TLeaveTypeDraft) => void }) {
  const set = (patch: Partial<TLeaveTypeDraft>) => onChange({ ...value, ...patch });

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SettingsRow label="Name">
          <input
            type="text"
            value={value.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="Annual leave"
            className={settingsInputClass}
          />
        </SettingsRow>

        <SettingsRow label="Days a year">
          <input
            type="number"
            min={0}
            step={0.5}
            value={value.annual_allowance}
            disabled={!value.is_balance_tracked}
            onChange={(e) => set({ annual_allowance: Number(e.target.value) })}
            className={settingsInputClass}
          />
        </SettingsRow>

        <SettingsRow label="Carry over" hint="Days that survive into next year">
          <input
            type="number"
            min={0}
            step={0.5}
            value={value.carryover_days}
            disabled={!value.is_balance_tracked}
            onChange={(e) => set({ carryover_days: Number(e.target.value) })}
            className={settingsInputClass}
          />
        </SettingsRow>

        <SettingsRow label="Colour">
          <input
            type="color"
            value={value.colour}
            onChange={(e) => set({ colour: e.target.value })}
            className="h-9 w-full cursor-pointer rounded-lg border border-subtle bg-surface-1 px-1"
          />
        </SettingsRow>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-6">
        <FieldToggle
          label="Keep a balance"
          value={value.is_balance_tracked}
          onChange={(next) => set({ is_balance_tracked: next })}
        />
        <FieldToggle label="Paid" value={value.is_paid} onChange={(next) => set({ is_paid: next })} />
        <FieldToggle
          label="Half days"
          value={value.allows_half_day}
          onChange={(next) => set({ allows_half_day: next })}
        />
      </div>
    </>
  );
}

function FieldToggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Switch value={value} onChange={onChange} label={label} />
      <span className="text-body-xs-regular text-secondary">{label}</span>
    </div>
  );
}

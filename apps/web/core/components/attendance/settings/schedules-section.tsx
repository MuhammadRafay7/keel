/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react";
import { Button } from "@keel/propel/button";
import { supabaseAttendanceService } from "@keel/services";
import type { IAttendanceSettings, IWorkSchedule } from "@keel/types";
import { cn } from "@keel/utils";
import { useMember } from "@/hooks/store/use-member";
import { InlineError, SettingsRow, SettingsSection, settingsInputClass } from "./shared";

type TSchedulesSectionProps = {
  workspaceId: string;
  settings: IAttendanceSettings | null;
};

/** ISO weekday numbers, which is what `extract(isodow …)` returns in the sweep. */
const WEEKDAYS: { value: number; label: string }[] = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 7, label: "Sun" },
];

const DEFAULT_SCHEDULE = {
  workdays: [1, 2, 3, 4, 5],
  start_time: "09:00",
  end_time: "17:00",
  break_minutes: 60,
  grace_minutes: null as number | null,
  is_active: true,
};

/**
 * When each person is expected to be working.
 *
 * This is what the auto-close sweep consults to decide where an abandoned
 * shift should end — without a schedule it falls back to a default-length day,
 * which is a guess rather than a policy. Everyone is listed, with or without
 * one, because "who has no schedule" is the useful thing to see here.
 */
export const SchedulesSection = observer(function SchedulesSection({ workspaceId, settings }: TSchedulesSectionProps) {
  const {
    workspace: { workspaceMemberIds },
    getUserDetails,
  } = useMember();

  const [schedules, setSchedules] = useState<IWorkSchedule[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!workspaceId) return;
    try {
      setSchedules(await supabaseAttendanceService.getSchedules(workspaceId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load schedules");
    }
  }, [workspaceId]);

  useEffect(() => {
    void load();
  }, [load]);

  const byMember = useMemo(() => {
    const map = new Map<string, IWorkSchedule>();
    schedules.forEach((schedule) => map.set(schedule.member_id, schedule));
    return map;
  }, [schedules]);

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

  const withoutSchedule = (workspaceMemberIds ?? []).filter((id) => !byMember.has(id)).length;

  return (
    <SettingsSection
      title="Working hours"
      description={`Where a shift is expected to end. Anyone without a schedule falls back to a ${
        settings?.default_shift_hours ?? 8
      }-hour day, which the sweep uses as a guess when somebody forgets to clock out.`}
      action={
        withoutSchedule > 0 ? (
          <span className="rounded-full bg-warning-subtle px-2.5 py-1 text-11 font-medium text-warning-primary">
            {withoutSchedule} on the default
          </span>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-2">
        {(workspaceMemberIds ?? []).map((memberId) => {
          const details = getUserDetails(memberId);
          const name = details?.display_name || details?.first_name || details?.email?.split("@")[0] || "Someone";
          const schedule = byMember.get(memberId);
          const isOpen = editing === memberId;

          return (
            <article
              key={memberId}
              className={cn(
                "squircle-card border bg-surface-1 px-4 py-3",
                isOpen ? "border-accent-subtle" : "border-subtle"
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-body-xs-medium text-primary">{name}</p>
                  <p className="mt-0.5 font-code text-11 text-tertiary tabular-nums">
                    {schedule
                      ? `${schedule.start_time.slice(0, 5)}–${schedule.end_time.slice(0, 5)} · ${schedule.workdays
                          .map((d) => WEEKDAYS.find((w) => w.value === d)?.label)
                          .filter(Boolean)
                          .join(" ")} · ${schedule.break_minutes}m break`
                      : "No schedule — workspace default applies"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {schedule && !isOpen && (
                    <Button
                      variant="tertiary"
                      size="sm"
                      disabled={isBusy}
                      onClick={() => void act(() => supabaseAttendanceService.deleteSchedule(schedule.id))}
                    >
                      Clear
                    </Button>
                  )}
                  <Button
                    variant="tertiary"
                    size="sm"
                    disabled={isBusy}
                    onClick={() => setEditing(isOpen ? null : memberId)}
                  >
                    {isOpen ? "Close" : schedule ? "Edit" : "Set hours"}
                  </Button>
                </div>
              </div>

              {isOpen && (
                <ScheduleEditor
                  workspaceId={workspaceId}
                  memberId={memberId}
                  schedule={schedule}
                  isBusy={isBusy}
                  onSave={(payload) =>
                    act(async () => {
                      await supabaseAttendanceService.upsertSchedule(payload);
                      setEditing(null);
                    })
                  }
                />
              )}
            </article>
          );
        })}
      </div>

      <InlineError message={error} />
    </SettingsSection>
  );
});

function ScheduleEditor({
  workspaceId,
  memberId,
  schedule,
  isBusy,
  onSave,
}: {
  workspaceId: string;
  memberId: string;
  schedule?: IWorkSchedule;
  isBusy: boolean;
  onSave: (payload: Omit<IWorkSchedule, "id">) => Promise<void>;
}) {
  const [draft, setDraft] = useState<Omit<IWorkSchedule, "id">>({
    workspace_id: workspaceId,
    member_id: memberId,
    workdays: schedule?.workdays ?? DEFAULT_SCHEDULE.workdays,
    start_time: (schedule?.start_time ?? DEFAULT_SCHEDULE.start_time).slice(0, 5),
    end_time: (schedule?.end_time ?? DEFAULT_SCHEDULE.end_time).slice(0, 5),
    break_minutes: schedule?.break_minutes ?? DEFAULT_SCHEDULE.break_minutes,
    grace_minutes: schedule?.grace_minutes ?? null,
    is_active: schedule?.is_active ?? true,
  });

  const toggleDay = (day: number) =>
    setDraft({
      ...draft,
      workdays: draft.workdays.includes(day)
        ? draft.workdays.filter((d) => d !== day)
        : [...draft.workdays, day].toSorted((a, b) => a - b),
    });

  return (
    <div className="mt-4 border-t border-subtle pt-4">
      <div className="flex flex-wrap items-center gap-1.5">
        {WEEKDAYS.map((day) => {
          const isOn = draft.workdays.includes(day.value);
          return (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              aria-pressed={isOn}
              className={cn(
                "focus-ring rounded-lg px-2.5 py-1 text-11 font-medium transition-smooth",
                isOn
                  ? "bg-accent-primary text-on-accent"
                  : "bg-layer-1 text-tertiary hover:bg-layer-1-hover hover:text-primary"
              )}
            >
              {day.label}
            </button>
          );
        })}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SettingsRow label="Starts">
          <input
            type="time"
            value={draft.start_time}
            onChange={(e) => setDraft({ ...draft, start_time: e.target.value })}
            className={settingsInputClass}
          />
        </SettingsRow>

        <SettingsRow label="Ends" hint="Where an abandoned shift gets closed">
          <input
            type="time"
            value={draft.end_time}
            onChange={(e) => setDraft({ ...draft, end_time: e.target.value })}
            className={settingsInputClass}
          />
        </SettingsRow>

        <SettingsRow label="Break" hint="Minutes">
          <input
            type="number"
            min={0}
            max={480}
            value={draft.break_minutes}
            onChange={(e) => setDraft({ ...draft, break_minutes: Number(e.target.value) })}
            className={settingsInputClass}
          />
        </SettingsRow>

        <SettingsRow label="Grace" hint="Minutes late before it counts. Blank uses the workspace setting">
          <input
            type="number"
            min={0}
            max={240}
            value={draft.grace_minutes ?? ""}
            onChange={(e) =>
              setDraft({ ...draft, grace_minutes: e.target.value === "" ? null : Number(e.target.value) })
            }
            className={settingsInputClass}
          />
        </SettingsRow>
      </div>

      <div className="mt-3 flex justify-end">
        <Button
          variant="primary"
          size="sm"
          disabled={isBusy || draft.workdays.length === 0}
          onClick={() => void onSave(draft)}
        >
          Save hours
        </Button>
      </div>
    </div>
  );
}

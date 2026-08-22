/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useCallback, useEffect, useState } from "react";
import { Button } from "@keel/propel/button";
import { supabaseAttendanceService } from "@keel/services";
import type { IWorkspaceHoliday } from "@keel/types";
import { EmptyState, InlineError, SettingsRow, SettingsSection, settingsInputClass } from "./shared";

type THolidaysSectionProps = {
  workspaceId: string;
};

/**
 * The days nobody is expected in.
 *
 * These feed leave counting, so a holiday inside a booked range costs nobody a
 * day. Counting happens when leave is requested and the answer is stored, so
 * editing this list will not retroactively change leave already granted —
 * which is the behaviour you want, and worth knowing before you edit it.
 */
export function HolidaysSection({ workspaceId }: THolidaysSectionProps) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [holidays, setHolidays] = useState<IWorkspaceHoliday[]>([]);
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!workspaceId) return;
    try {
      setHolidays(await supabaseAttendanceService.getHolidays(workspaceId, year));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load the calendar");
    }
  }, [workspaceId, year]);

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
      title="Holiday calendar"
      description="Days the workspace is closed. Leave booked across one of these does not use up an allowance, and the auto-close sweep leaves them alone."
      action={
        <div className="flex items-center gap-1 rounded-lg bg-layer-1 p-0.5">
          {[currentYear - 1, currentYear, currentYear + 1].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setYear(option)}
              className={`focus-ring rounded-md px-2.5 py-1 font-code text-12 tabular-nums transition-smooth ${
                year === option ? "bg-surface-1 text-primary shadow-raised-100" : "text-tertiary hover:text-primary"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      }
    >
      <div className="grid gap-3 sm:grid-cols-[auto_1fr_auto] sm:items-end">
        <SettingsRow label="Date">
          <input
            type="date"
            value={date}
            min={`${year}-01-01`}
            max={`${year}-12-31`}
            onChange={(e) => setDate(e.target.value)}
            className={settingsInputClass}
          />
        </SettingsRow>

        <SettingsRow label="What it is">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Independence Day"
            className={settingsInputClass}
          />
        </SettingsRow>

        <Button
          variant="secondary"
          size="base"
          disabled={!date || !name.trim() || isBusy}
          onClick={() =>
            void act(async () => {
              await supabaseAttendanceService.addHoliday(workspaceId, date, name.trim());
              setDate("");
              setName("");
            })
          }
        >
          Add
        </Button>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {holidays.length === 0 ? (
          <EmptyState>No holidays set for {year}.</EmptyState>
        ) : (
          holidays.map((holiday) => (
            <article
              key={holiday.id}
              className="flex items-center justify-between gap-3 squircle-card border border-subtle bg-surface-1 px-4 py-2.5"
            >
              <div className="flex min-w-0 items-baseline gap-3">
                <span className="font-code text-12 text-secondary tabular-nums">{holiday.holiday_date}</span>
                <span className="truncate text-body-xs-medium text-primary">{holiday.name}</span>
                <span className="text-11 text-placeholder">
                  {new Date(`${holiday.holiday_date}T00:00:00`).toLocaleDateString([], { weekday: "long" })}
                </span>
              </div>
              <Button
                variant="tertiary"
                size="sm"
                disabled={isBusy}
                onClick={() => void act(() => supabaseAttendanceService.removeHoliday(holiday.id))}
              >
                Remove
              </Button>
            </article>
          ))
        )}
      </div>

      <InlineError message={error} />
    </SettingsSection>
  );
}

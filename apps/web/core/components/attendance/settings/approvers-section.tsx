/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react";
import { Button } from "@keel/propel/button";
import { supabaseAttendanceService } from "@keel/services";
import type { IAttendanceApprover, IAttendanceSettings } from "@keel/types";
import { useMember } from "@/hooks/store/use-member";
import { EmptyState, InlineError, SettingsRow, SettingsSection, settingsInputClass } from "./shared";

type TApproversSectionProps = {
  workspaceId: string;
  settings: IAttendanceSettings | null;
  onSettingsSaved: (settings: IAttendanceSettings) => void;
};

/**
 * Who reviews whose time.
 *
 * The fallback is the important part and is stated in the copy rather than
 * left to be discovered: a member with nobody assigned is reviewed by the
 * workspace admins. That is what makes the feature work on the first day with
 * nothing configured, and it is also why assigning one approver quietly takes
 * the admins off that person's queue.
 */
export const ApproversSection = observer(function ApproversSection({
  workspaceId,
  settings,
  onSettingsSaved,
}: TApproversSectionProps) {
  const {
    workspace: { workspaceMemberIds },
    getUserDetails,
  } = useMember();

  const memberIds = useMemo(() => workspaceMemberIds ?? [], [workspaceMemberIds]);
  const [approvers, setApprovers] = useState<IAttendanceApprover[]>([]);
  const [memberId, setMemberId] = useState("");
  const [approverId, setApproverId] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!workspaceId) return;
    try {
      setApprovers(await supabaseAttendanceService.getApprovers(workspaceId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load approvers");
    }
  }, [workspaceId]);

  useEffect(() => {
    void load();
  }, [load]);

  const nameOf = useCallback(
    (id: string) => {
      const details = getUserDetails(id);
      return details?.display_name || details?.first_name || details?.email?.split("@")[0] || "Someone";
    },
    [getUserDetails]
  );

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

  const onAdmins = useMemo(
    () => memberIds.filter((id) => !approvers.some((a) => a.member_id === id)),
    [memberIds, approvers]
  );

  const canAdd = Boolean(memberId && approverId && memberId !== approverId);

  return (
    <SettingsSection
      title="Approvers"
      description="Who signs off corrections and leave. Name one person for the whole workspace, and add exceptions below only where somebody needs a different approver."
    >
      <div className="mb-5 squircle-card border border-subtle bg-surface-1 p-4">
        <SettingsRow
          label="Approver for everyone"
          hint={
            settings?.default_approver_id
              ? "Their own requests go to the workspace admins."
              : "Nobody named — every request goes to the workspace admins."
          }
        >
          <select
            value={settings?.default_approver_id ?? ""}
            disabled={isBusy}
            onChange={(e) =>
              void act(async () => {
                onSettingsSaved(
                  await supabaseAttendanceService.updateSettings(workspaceId, {
                    default_approver_id: e.target.value || null,
                  })
                );
              })
            }
            className={settingsInputClass}
          >
            <option value="">The workspace admins</option>
            {memberIds.map((id) => (
              <option key={id} value={id}>
                {nameOf(id)}
              </option>
            ))}
          </select>
        </SettingsRow>
      </div>

      <h4 className="mb-2 text-body-xs-medium text-primary">Exceptions</h4>

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <SettingsRow label="Requests from">
          <select value={memberId} onChange={(e) => setMemberId(e.target.value)} className={settingsInputClass}>
            <option value="">Pick a member</option>
            {memberIds.map((id) => (
              <option key={id} value={id}>
                {nameOf(id)}
              </option>
            ))}
          </select>
        </SettingsRow>

        <SettingsRow label="Go to">
          <select value={approverId} onChange={(e) => setApproverId(e.target.value)} className={settingsInputClass}>
            <option value="">Pick an approver</option>
            {memberIds
              .filter((id) => id !== memberId)
              .map((id) => (
                <option key={id} value={id}>
                  {nameOf(id)}
                </option>
              ))}
          </select>
        </SettingsRow>

        <Button
          variant="secondary"
          size="base"
          disabled={!canAdd || isBusy}
          onClick={() =>
            void act(async () => {
              await supabaseAttendanceService.addApprover(workspaceId, memberId, approverId);
              setMemberId("");
              setApproverId("");
            })
          }
        >
          Assign
        </Button>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {approvers.length === 0 ? (
          <EmptyState>No exceptions. Everyone is reviewed by the person named above.</EmptyState>
        ) : (
          approvers.map((row) => (
            <article
              key={row.id}
              className="flex items-center justify-between gap-3 squircle-card border border-subtle bg-surface-1 px-4 py-2.5"
            >
              <p className="min-w-0 truncate text-body-xs-regular text-secondary">
                <span className="font-medium text-primary">{nameOf(row.member_id)}</span>
                <span className="mx-2 text-placeholder">→</span>
                <span className="font-medium text-primary">{nameOf(row.approver_id)}</span>
              </p>
              <Button
                variant="tertiary"
                size="sm"
                disabled={isBusy}
                onClick={() => void act(() => supabaseAttendanceService.removeApprover(row.id))}
              >
                Remove
              </Button>
            </article>
          ))
        )}
      </div>

      {onAdmins.length > 0 && (
        <p className="mt-3 text-11 text-placeholder">
          {onAdmins.length} member{onAdmins.length === 1 ? "" : "s"} reviewed by{" "}
          {settings?.default_approver_id ? nameOf(settings.default_approver_id) : "the workspace admins"}.
        </p>
      )}

      <InlineError message={error} />
    </SettingsSection>
  );
});

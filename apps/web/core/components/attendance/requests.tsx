/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react";
import { Button } from "@keel/propel/button";
import { supabaseAttendanceService } from "@keel/services";
import type { IAttendanceCorrection, ILeaveBalance, ILeaveRequest, ILeaveType, TLeaveDayPortion } from "@keel/types";
import { cn } from "@keel/utils";
import { useMember } from "@/hooks/store/use-member";
import { formatClockTime, toISODate } from "./helpers";

type TRequestsProps = {
  workspaceId: string;
  memberId: string;
  onChange: () => void;
};

const inputClass =
  "focus-ring w-full rounded-lg border border-subtle bg-surface-1 px-3 py-2 text-13 text-primary transition-smooth outline-none placeholder:text-placeholder";

const labelClass = "text-11 font-medium tracking-wide text-placeholder uppercase";

/**
 * Corrections and leave, in one place.
 *
 * Both are the same shape of thing — somebody asks, somebody decides — so they
 * share a layout, and whether a row is yours or yours to review is what
 * changes what it offers. RLS already narrows the list to those two cases, so
 * any row that is not yours is one you can act on.
 */
export const Requests = observer(function Requests({ workspaceId, memberId, onChange }: TRequestsProps) {
  const { getUserDetails } = useMember();

  const [corrections, setCorrections] = useState<IAttendanceCorrection[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<ILeaveRequest[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<ILeaveType[]>([]);
  const [balances, setBalances] = useState<ILeaveBalance[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const load = useCallback(async () => {
    if (!workspaceId) return;
    try {
      const [nextCorrections, nextLeave, nextTypes, nextBalances] = await Promise.all([
        supabaseAttendanceService.getCorrections(workspaceId),
        supabaseAttendanceService.getLeaveRequests(workspaceId),
        supabaseAttendanceService.getLeaveTypes(workspaceId),
        supabaseAttendanceService.getLeaveBalances(workspaceId, memberId, new Date().getFullYear()),
      ]);
      setCorrections(nextCorrections);
      setLeaveRequests(nextLeave);
      setLeaveTypes(nextTypes);
      setBalances(nextBalances);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load requests");
    }
  }, [workspaceId, memberId]);

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
        onChange();
      } catch (e) {
        setError(e instanceof Error ? e.message : "That did not work");
      } finally {
        setIsBusy(false);
      }
    },
    [load, onChange]
  );

  const nameOf = useCallback(
    (id: string) => {
      const details = getUserDetails(id);
      return details?.display_name || details?.first_name || details?.email?.split("@")[0] || "Someone";
    },
    [getUserDetails]
  );

  const pendingCorrections = corrections.filter((c) => c.status === "pending");
  const pendingLeave = leaveRequests.filter((l) => l.status === "pending");

  return (
    <div className="flex flex-col gap-8">
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-danger-subtle bg-danger-subtle px-4 py-3 text-13 text-danger-primary"
        >
          {error}
        </p>
      )}

      <CorrectionForm workspaceId={workspaceId} isBusy={isBusy} onSubmit={act} />

      <section aria-label="Timesheet corrections">
        <h2 className="mb-3 text-14 font-semibold text-primary">
          Corrections
          {pendingCorrections.length > 0 && (
            <span className="ml-2 rounded-full bg-accent-subtle px-2 py-0.5 font-code text-11 text-accent-primary tabular-nums">
              {pendingCorrections.length}
            </span>
          )}
        </h2>

        {corrections.length === 0 ? (
          <EmptyRow>No corrections have been asked for.</EmptyRow>
        ) : (
          <div className="flex flex-col gap-2">
            {corrections.map((correction) => (
              <RequestRow
                key={correction.id}
                title={correction.member_id === memberId ? "Your correction" : nameOf(correction.member_id)}
                detail={`${new Date(correction.requested_clock_in_at).toLocaleDateString()} · ${formatClockTime(
                  correction.requested_clock_in_at
                )} – ${formatClockTime(correction.requested_clock_out_at)}`}
                reason={correction.reason}
                status={correction.status}
                isMine={correction.member_id === memberId}
                isBusy={isBusy}
                onApprove={() => act(() => supabaseAttendanceService.reviewCorrection(correction.id, true))}
                onReject={() => act(() => supabaseAttendanceService.reviewCorrection(correction.id, false))}
                onWithdraw={() => act(() => supabaseAttendanceService.withdrawCorrection(correction.id))}
              />
            ))}
          </div>
        )}
      </section>

      <LeaveForm
        workspaceId={workspaceId}
        memberId={memberId}
        leaveTypes={leaveTypes}
        balances={balances}
        isBusy={isBusy}
        onSubmit={act}
      />

      <section aria-label="Leave requests">
        <h2 className="mb-3 text-14 font-semibold text-primary">
          Leave
          {pendingLeave.length > 0 && (
            <span className="ml-2 rounded-full bg-accent-subtle px-2 py-0.5 font-code text-11 text-accent-primary tabular-nums">
              {pendingLeave.length}
            </span>
          )}
        </h2>

        {leaveRequests.length === 0 ? (
          <EmptyRow>No leave has been booked.</EmptyRow>
        ) : (
          <div className="flex flex-col gap-2">
            {leaveRequests.map((request) => {
              const type = leaveTypes.find((t) => t.id === request.leave_type_id);
              return (
                <RequestRow
                  key={request.id}
                  title={request.member_id === memberId ? "Your leave" : nameOf(request.member_id)}
                  detail={`${type?.name ?? "Leave"} · ${request.start_date}${
                    request.end_date !== request.start_date ? ` – ${request.end_date}` : ""
                  } · ${request.days} day${Number(request.days) === 1 ? "" : "s"}`}
                  reason={request.reason}
                  status={request.status}
                  isMine={request.member_id === memberId}
                  isBusy={isBusy}
                  onApprove={() => act(() => supabaseAttendanceService.reviewLeave(request.id, true))}
                  onReject={() => act(() => supabaseAttendanceService.reviewLeave(request.id, false))}
                  onWithdraw={() => act(() => supabaseAttendanceService.cancelLeave(request.id))}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
});

function EmptyRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="squircle-card border border-dashed border-subtle px-4 py-8 text-center text-13 text-placeholder">
      {children}
    </div>
  );
}

function RequestRow({
  title,
  detail,
  reason,
  status,
  isMine,
  isBusy,
  onApprove,
  onReject,
  onWithdraw,
}: {
  title: string;
  detail: string;
  reason: string;
  status: string;
  isMine: boolean;
  isBusy: boolean;
  onApprove: () => void;
  onReject: () => void;
  onWithdraw: () => void;
}) {
  const isPending = status === "pending";

  return (
    <article className="flex flex-wrap items-center justify-between gap-3 squircle-card border border-subtle bg-surface-1 px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <h3 className="text-13 font-medium text-primary">{title}</h3>
          <StatusPill status={status} />
        </div>
        <p className="mt-0.5 font-code text-12 text-tertiary tabular-nums">{detail}</p>
        {reason && <p className="mt-1 text-12 text-placeholder">“{reason}”</p>}
      </div>

      {isPending && (
        <div className="flex items-center gap-2">
          {isMine ? (
            <Button variant="tertiary" size="sm" onClick={onWithdraw} disabled={isBusy}>
              Withdraw
            </Button>
          ) : (
            <>
              <Button variant="tertiary" size="sm" onClick={onReject} disabled={isBusy}>
                Reject
              </Button>
              <Button variant="primary" size="sm" onClick={onApprove} disabled={isBusy}>
                Approve
              </Button>
            </>
          )}
        </div>
      )}
    </article>
  );
}

function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={cn("rounded-full px-2 py-0.5 text-10 font-semibold tracking-wide uppercase", {
        "bg-warning-subtle text-warning-primary": status === "pending",
        "bg-success-subtle text-success-primary": status === "approved",
        "bg-danger-subtle text-danger-primary": status === "rejected",
        "bg-layer-1 text-placeholder": status === "withdrawn" || status === "cancelled",
      })}
    >
      {status}
    </span>
  );
}

function CorrectionForm({
  workspaceId,
  isBusy,
  onSubmit,
}: {
  workspaceId: string;
  isBusy: boolean;
  onSubmit: (action: () => Promise<unknown>) => Promise<void>;
}) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [reason, setReason] = useState("");

  const canSubmit = Boolean(from && reason.trim());

  return (
    <section className="squircle-card border border-subtle bg-surface-1 p-5" aria-label="Ask for a correction">
      <h2 className="text-14 font-semibold text-primary">Something wrong with a day?</h2>
      <p className="mt-1 text-12 text-tertiary">
        Say what the times should have been. Your approver decides, and the original stays on the record.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_2fr_auto] sm:items-end">
        <label className="flex flex-col gap-1">
          <span className={labelClass}>Started</span>
          <input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} className={inputClass} />
        </label>

        <label className="flex flex-col gap-1">
          <span className={labelClass}>Ended</span>
          <input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} className={inputClass} />
        </label>

        <label className="flex flex-col gap-1">
          <span className={labelClass}>Why</span>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Forgot to clock out"
            className={inputClass}
          />
        </label>

        <Button
          variant="secondary"
          size="base"
          disabled={!canSubmit || isBusy}
          onClick={() =>
            void onSubmit(async () => {
              await supabaseAttendanceService.requestCorrection({
                workspaceId,
                requestedClockInAt: new Date(from).toISOString(),
                requestedClockOutAt: to ? new Date(to).toISOString() : null,
                reason,
              });
              setFrom("");
              setTo("");
              setReason("");
            })
          }
        >
          Send for review
        </Button>
      </div>
    </section>
  );
}

function LeaveForm({
  workspaceId,
  memberId,
  leaveTypes,
  balances,
  isBusy,
  onSubmit,
}: {
  workspaceId: string;
  memberId: string;
  leaveTypes: ILeaveType[];
  balances: ILeaveBalance[];
  isBusy: boolean;
  onSubmit: (action: () => Promise<unknown>) => Promise<void>;
}) {
  const today = toISODate(new Date());
  const [typeId, setTypeId] = useState("");
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(today);
  const [portion, setPortion] = useState<TLeaveDayPortion>("full");
  const [reason, setReason] = useState("");
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    if (leaveTypes.length > 0 && !typeId) setTypeId(leaveTypes[0].id);
  }, [leaveTypes, typeId]);

  // Half days are a single day by definition, so the range collapses with the
  // control rather than leaving an end date that contradicts it.
  useEffect(() => {
    if (portion !== "full") setEnd(start);
  }, [portion, start]);

  // What the request will actually cost, counted by Postgres with holidays and
  // rest days already removed — so the number on the button is the number that
  // comes off the balance.
  useEffect(() => {
    if (!workspaceId || !memberId || !start || !end) return;

    let cancelled = false;
    void (async () => {
      try {
        const next = await supabaseAttendanceService.previewLeaveDays({
          workspaceId,
          memberId,
          startDate: start,
          endDate: end,
          dayPortion: portion,
        });
        if (!cancelled) setDays(next);
      } catch {
        if (!cancelled) setDays(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [workspaceId, memberId, start, end, portion]);

  const selectedType = leaveTypes.find((t) => t.id === typeId);
  const balance = balances.find((b) => b.leave_type_id === typeId);

  const remaining = useMemo(() => {
    if (!selectedType?.is_balance_tracked) return null;
    const allocated = balance ? Number(balance.allocated) : Number(selectedType.annual_allowance);
    const carried = balance ? Number(balance.carried_over) : 0;
    const used = balance ? Number(balance.used) : 0;
    return allocated + carried - used;
  }, [selectedType, balance]);

  return (
    <section className="squircle-card border border-subtle bg-surface-1 p-5" aria-label="Book leave">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-14 font-semibold text-primary">Book time off</h2>
        {remaining !== null && (
          <p className="text-12 text-tertiary">
            <span className="font-code text-primary tabular-nums">{remaining}</span> day
            {remaining === 1 ? "" : "s"} left this year
          </p>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr_2fr_auto] lg:items-end">
        <label className="flex flex-col gap-1">
          <span className={labelClass}>Type</span>
          <select value={typeId} onChange={(e) => setTypeId(e.target.value)} className={inputClass}>
            {leaveTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className={labelClass}>From</span>
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className={inputClass} />
        </label>

        <label className="flex flex-col gap-1">
          <span className={labelClass}>To</span>
          <input
            type="date"
            value={end}
            min={start}
            disabled={portion !== "full"}
            onChange={(e) => setEnd(e.target.value)}
            className={cn(inputClass, portion !== "full" && "opacity-50")}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className={labelClass}>Length</span>
          <select
            value={portion}
            onChange={(e) => setPortion(e.target.value as TLeaveDayPortion)}
            className={inputClass}
            disabled={!selectedType?.allows_half_day}
          >
            <option value="full">Full days</option>
            <option value="first_half">Morning only</option>
            <option value="second_half">Afternoon only</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className={labelClass}>Note</span>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Optional"
            className={inputClass}
          />
        </label>

        <Button
          variant="secondary"
          size="base"
          disabled={!typeId || isBusy || days === 0}
          onClick={() =>
            void onSubmit(async () => {
              await supabaseAttendanceService.requestLeave({
                workspaceId,
                leaveTypeId: typeId,
                startDate: start,
                endDate: portion === "full" ? end : start,
                dayPortion: portion,
                reason,
              });
              setReason("");
            })
          }
        >
          {days === null ? "Request" : `Request ${days} day${days === 1 ? "" : "s"}`}
        </Button>
      </div>

      {days === 0 && (
        <p className="mt-2 text-12 text-warning-primary">
          Those dates are all holidays or rest days, so there is nothing to book.
        </p>
      )}
    </section>
  );
}

/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState } from "react";
import { observer } from "mobx-react";
import useSWR from "swr";
import { FileText, RefreshCw, Clock, Search, Download, Shield, Activity } from "lucide-react";
import { PageWrapper } from "@/components/common/page-wrapper";
import { useAdmin } from "@/hooks/store";

const AuditLogsPage = observer(function AuditLogsPage() {
  const adminStore = useAdmin();
  const { auditLogs, isLoadingAuditLogs } = adminStore;

  const [filterAction, setFilterAction] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { mutate } = useSWR("ADMIN_AUDIT_LOGS", () => adminStore.fetchAuditLogs(150));

  const filteredLogs = (auditLogs || []).filter((log) => {
    const matchesFilter = filterAction === "all" || log.action.toLowerCase().includes(filterAction.toLowerCase());
    const matchesSearch =
      !searchQuery ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.actor_email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.target_id || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleExportCsv = () => {
    if (filteredLogs.length === 0) return;
    const headers = ["Timestamp", "Actor Email", "Action", "Target Type", "Target ID", "Details"];
    const rows = filteredLogs.map((l) => [
      `"${l.created_at}"`,
      `"${l.actor_email || ""}"`,
      `"${l.action}"`,
      `"${l.target_type}"`,
      `"${l.target_id || ""}"`,
      `"${JSON.stringify(l.details || {}).replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const pom = document.createElement("a");
    pom.href = url;
    pom.setAttribute("download", "keel-audit-trail-export.csv");
    pom.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageWrapper
      header={{
        title: "Audit & Security Logs",
        description: "Immutable security trail of administrative logins, God-mode actions, and permission changes.",
      }}
    >
      <div className="space-y-6 pb-10">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="shadow-soft flex items-center gap-4 rounded-3xl border border-subtle bg-surface-1 p-5">
            <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 shadow-soft flex size-11 items-center justify-center rounded-2xl border">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="tracking-wider text-11 font-semibold text-secondary uppercase">Events Recorded</p>
              <h4 className="text-22 font-bold text-primary">{auditLogs ? auditLogs.length : 0}</h4>
            </div>
          </div>

          <div className="shadow-soft flex items-center gap-4 rounded-3xl border border-subtle bg-surface-1 p-5">
            <div className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 shadow-soft flex size-11 items-center justify-center rounded-2xl border">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="tracking-wider text-11 font-semibold text-secondary uppercase">Security Guard</p>
              <h4 className="text-22 text-purple-600 dark:text-purple-400 font-bold">Enforced</h4>
            </div>
          </div>

          <div className="shadow-soft flex items-center gap-4 rounded-3xl border border-subtle bg-surface-1 p-5">
            <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shadow-soft flex size-11 items-center justify-center rounded-2xl border">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="tracking-wider text-11 font-semibold text-secondary uppercase">Audit Stream</p>
              <h4 className="text-22 text-emerald-600 dark:text-emerald-400 font-bold">Live</h4>
            </div>
          </div>
        </div>

        {/* Filter & Action Controls */}
        <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute top-1/2 left-3.5 h-3.5 w-3.5 -translate-y-1/2 text-secondary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search audit trail..."
                className="focus:border-blue-500 shadow-soft w-full rounded-full border border-subtle bg-layer-1 py-1.5 pr-4 pl-9 text-12 text-primary transition-all placeholder:text-secondary focus:outline-none"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="focus:border-blue-500 shadow-soft cursor-pointer rounded-full border border-subtle bg-layer-1 px-4 py-1.5 text-12 text-primary transition-all focus:outline-none"
            >
              <option value="all">All Event Categories</option>
              <option value="USER">User Events</option>
              <option value="WORKSPACE">Workspace Events</option>
              <option value="JOIN">God-Mode Joins</option>
              <option value="ROLE">Role Changes</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={filteredLogs.length === 0}
              className="hover:border-blue-400 shadow-soft inline-flex items-center gap-1.5 rounded-full border border-subtle bg-layer-1 px-4 py-1.5 text-12 font-semibold text-secondary transition-all hover:-translate-y-0.5 hover:text-primary disabled:opacity-40"
            >
              <Download className="h-3.5 w-3.5 text-secondary" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={() => mutate()}
              disabled={isLoadingAuditLogs}
              className="hover:border-blue-400 hover:text-blue-600 shadow-soft inline-flex items-center gap-1.5 rounded-full border border-subtle bg-layer-1 px-4 py-1.5 text-12 font-semibold text-secondary transition-all hover:-translate-y-0.5 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoadingAuditLogs ? "text-blue-600 animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Keel Elevated Logs Table Container */}
        <div className="shadow-card overflow-hidden rounded-3xl border border-subtle bg-surface-1">
          <table className="min-w-full divide-y divide-subtle">
            <thead className="tracking-wider bg-layer-1/80 text-left text-11 font-bold text-secondary uppercase">
              <tr>
                <th scope="col" className="px-6 py-4">
                  Timestamp
                </th>
                <th scope="col" className="px-5 py-4">
                  Actor
                </th>
                <th scope="col" className="px-5 py-4">
                  Event Action
                </th>
                <th scope="col" className="px-5 py-4">
                  Target
                </th>
                <th scope="col" className="px-6 py-4">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle text-12">
              {isLoadingAuditLogs ? (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center text-secondary">
                    Loading audit trail...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center text-secondary">
                    No audit log records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="font-mono transition-colors hover:bg-layer-2/60">
                    {/* Timestamp */}
                    <td className="font-mono px-6 py-3.5 text-11 whitespace-nowrap text-secondary">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-secondary" />
                        {new Date(log.created_at).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </div>
                    </td>

                    {/* Actor */}
                    <td className="font-sans px-5 py-3.5 whitespace-nowrap text-secondary">
                      <span className="font-semibold text-primary">{log.actor_email || "System"}</span>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="bg-blue-500/10 border-blue-500/20 font-mono text-blue-600 dark:text-blue-400 shadow-soft inline-flex items-center gap-1 rounded-full border px-3 py-0.5 text-11 font-semibold">
                        {log.action}
                      </span>
                    </td>

                    {/* Target */}
                    <td className="font-sans px-5 py-3.5 whitespace-nowrap text-secondary">
                      <span className="text-11 font-bold text-secondary uppercase">{log.target_type}:</span>{" "}
                      <span className="font-mono font-medium text-primary">{log.target_id || "N/A"}</span>
                    </td>

                    {/* Details */}
                    <td className="font-mono max-w-xs truncate px-6 py-3.5 text-11 text-secondary">
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageWrapper>
  );
});

export const meta = () => [
  { title: "Audit & Security Logs – Keel Admin" },
  { name: "description", content: "Review platform events and security logs." },
];

export default AuditLogsPage;

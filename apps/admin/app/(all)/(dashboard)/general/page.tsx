/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState } from "react";
import { observer } from "mobx-react";
import Link from "next/link";
import useSWR from "swr";
import {
  Users,
  Building2,
  Layers,
  CheckSquare,
  Download,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  Shield,
  CheckCircle2,
  Server,
} from "lucide-react";
import { PageWrapper } from "@/components/common/page-wrapper";
import { useAdmin, useInstance } from "@/hooks/store";
import { CreateUserModal } from "@/components/users/create-user-modal";
import { GeneralConfigurationForm } from "./form";

function GeneralOverviewPage() {
  const adminStore = useAdmin();
  const { stats, users, workspaces, isLoadingStats, isLoadingUsers, isLoadingWorkspaces } = adminStore;
  const { instance, instanceAdmins, fetchInstanceInfo, fetchInstanceAdmins } = useInstance();
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);

  useSWR("ADMIN_PLATFORM_STATS", () => adminStore.fetchStats());
  useSWR("ADMIN_USERS_LIST", () => adminStore.fetchUsers());
  useSWR("ADMIN_WORKSPACES_LIST", () => adminStore.fetchWorkspaces());
  useSWR("INSTANCE_INFO", () => fetchInstanceInfo());
  useSWR("INSTANCE_ADMINS", () => fetchInstanceAdmins());

  const handleExportUsersCsv = () => {
    if (users.length === 0) return;
    const headers = ["ID", "Email", "Display Name", "Role", "Status", "Workspaces Count", "Joined Date"];
    const rows = users.map((u) => [
      u.id,
      u.email,
      `"${(u.display_name || "").replace(/"/g, '""')}"`,
      u.is_superuser ? "Superadmin" : "User",
      u.is_active ? "Active" : "Suspended",
      u.workspaces_count,
      u.created_at,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    downloadBlob(csvContent, "keel-users-export.csv", "text/csv;charset=utf-8;");
  };

  const handleExportWorkspacesCsv = () => {
    if (workspaces.length === 0) return;
    const headers = [
      "ID",
      "Name",
      "Slug",
      "Owner Email",
      "Owner Name",
      "Members Count",
      "Projects",
      "Issues",
      "Created Date",
    ];
    const rows = workspaces.map((w) => [
      w.id,
      `"${w.name.replace(/"/g, '""')}"`,
      w.slug,
      w.owner_email,
      `"${(w.owner_name || "").replace(/"/g, '""')}"`,
      w.members_count,
      w.projects_count,
      w.issues_count,
      w.created_at,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    downloadBlob(csvContent, "keel-workspaces-export.csv", "text/csv;charset=utf-8;");
  };

  // 100% Real Live Computed Data from Database & API
  const realTotalUsers = users.length > 0 ? users.length : (stats?.total_users ?? 0);
  const realTotalWorkspaces = workspaces.length > 0 ? workspaces.length : (stats?.total_workspaces ?? 0);
  const realSuperadminsCount = users.filter((u) => u.is_superuser).length;
  const realActiveUsersCount = users.filter((u) => u.is_active).length;

  // Real Projects & Issues computed from loaded workspaces or stats
  const calculatedProjects = workspaces.reduce((acc, w) => acc + (w.projects_count || 0), 0);
  const realTotalProjects = stats?.total_projects !== undefined ? stats.total_projects : calculatedProjects;

  const calculatedIssues = workspaces.reduce((acc, w) => acc + (w.issues_count || 0), 0);
  const realTotalIssues = stats?.total_issues !== undefined ? stats.total_issues : calculatedIssues;

  const isLoadingData = isLoadingStats && isLoadingUsers && isLoadingWorkspaces;

  return (
    <PageWrapper
      header={{
        title: "Platform Overview & Settings",
        description: "Real-time metrics, cross-workspace intelligence, and administrative controls.",
      }}
    >
      <div className="space-y-8 pb-10">
        {/* Keel Hero Banner */}
        <div className="border-blue-500/20 shadow-card relative overflow-hidden rounded-3xl border bg-surface-1 p-7 sm:p-8">
          <div className="bg-blue-500/10 pointer-events-none absolute -top-20 -right-20 size-72 rounded-full blur-3xl" />
          <div className="bg-indigo-500/10 pointer-events-none absolute -bottom-20 -left-20 size-72 rounded-full blur-3xl" />

          {/* Top Console Accent */}
          <div className="mb-6 flex items-center justify-between border-b border-subtle pb-5">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-[#ff5f57]" />
              <span className="size-2.5 rounded-full bg-[#febc2e]" />
              <span className="size-2.5 rounded-full bg-[#28c840]" />
              <span className="font-mono ml-3 text-11 text-secondary">keel.admin.console</span>
            </div>

            <div className="border-blue-500/30 bg-blue-500/10 text-xs text-blue-600 dark:text-blue-400 shadow-soft inline-flex items-center gap-2 rounded-full border px-3.5 py-1 font-semibold">
              <span className="bg-emerald-500 size-2 rounded-full" />
              <span>Full Omnipotent Access</span>
            </div>
          </div>

          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-xl space-y-2">
              <h2 className="text-24 font-bold tracking-tight text-primary sm:text-28">Platform Control Center</h2>
              <p className="text-14 leading-relaxed text-secondary">
                Centralized telemetry and governance across all{" "}
                <strong className="text-primary">
                  {realTotalWorkspaces} workspace{realTotalWorkspaces === 1 ? "" : "s"}
                </strong>{" "}
                and{" "}
                <strong className="text-primary">
                  {realTotalUsers} user{realTotalUsers === 1 ? "" : "s"}
                </strong>{" "}
                on this instance.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsCreateUserOpen(true)}
                className="bg-blue-600 shadow-glow hover:bg-blue-700 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-13 font-semibold text-white transition-all hover:-translate-y-0.5"
              >
                <UserPlus className="h-4 w-4" />
                <span>Provision User</span>
              </button>

              <button
                type="button"
                onClick={handleExportUsersCsv}
                disabled={users.length === 0}
                className="hover:border-blue-400 shadow-soft inline-flex items-center gap-2 rounded-full border border-subtle bg-layer-1 px-4 py-2.5 text-13 font-semibold text-secondary transition-all hover:-translate-y-0.5 hover:text-primary disabled:opacity-40"
              >
                <Download className="h-3.5 w-3.5 text-secondary" />
                <span>Export Users</span>
              </button>

              <button
                type="button"
                onClick={handleExportWorkspacesCsv}
                disabled={workspaces.length === 0}
                className="hover:border-blue-400 shadow-soft inline-flex items-center gap-2 rounded-full border border-subtle bg-layer-1 px-4 py-2.5 text-13 font-semibold text-secondary transition-all hover:-translate-y-0.5 hover:text-primary disabled:opacity-40"
              >
                <Download className="h-3.5 w-3.5 text-secondary" />
                <span>Export Workspaces</span>
              </button>
            </div>
          </div>
        </div>

        {/* Real Live Metric Stat Cards Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Total Users */}
          <Link
            href="/users"
            className="group shadow-soft hover:border-blue-400 hover:shadow-card relative overflow-hidden rounded-3xl border border-subtle bg-surface-1 p-6 transition-all hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="tracking-wider text-12 font-semibold text-secondary uppercase">Total Users</span>
              <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 shadow-soft inline-flex size-10 items-center justify-center rounded-2xl border">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-32 font-bold tracking-tight text-primary">
                {isLoadingData ? "..." : realTotalUsers}
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-11 text-secondary">
                <CheckCircle2 className="text-emerald-500 h-3.5 w-3.5" />
                <span>
                  {realActiveUsersCount} active account{realActiveUsersCount === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          </Link>

          {/* Card 2: Workspaces */}
          <Link
            href="/workspace"
            className="group shadow-soft hover:border-blue-400 hover:shadow-card relative overflow-hidden rounded-3xl border border-subtle bg-surface-1 p-6 transition-all hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="tracking-wider text-12 font-semibold text-secondary uppercase">Workspaces</span>
              <div className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 shadow-soft inline-flex size-10 items-center justify-center rounded-2xl border">
                <Building2 className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-32 font-bold tracking-tight text-primary">
                {isLoadingData ? "..." : realTotalWorkspaces}
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-11 text-secondary">
                <ShieldCheck className="text-blue-500 h-3.5 w-3.5" />
                <span>Isolated tenant orgs</span>
              </div>
            </div>
          </Link>

          {/* Card 3: Superadmins */}
          <Link
            href="/users"
            className="group shadow-soft hover:border-blue-400 hover:shadow-card relative overflow-hidden rounded-3xl border border-subtle bg-surface-1 p-6 transition-all hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="tracking-wider text-12 font-semibold text-secondary uppercase">Superadmins</span>
              <div className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 shadow-soft inline-flex size-10 items-center justify-center rounded-2xl border">
                <Shield className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-32 font-bold tracking-tight text-primary">
                {isLoadingData ? "..." : realSuperadminsCount}
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-11 text-secondary">
                <span className="bg-purple-500 size-1.5 rounded-full" />
                <span>Full instance access</span>
              </div>
            </div>
          </Link>

          {/* Card 4: Projects or System Health */}
          <div className="group shadow-soft relative overflow-hidden rounded-3xl border border-subtle bg-surface-1 p-6">
            <div className="flex items-center justify-between">
              <span className="tracking-wider text-12 font-semibold text-secondary uppercase">Active Projects</span>
              <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shadow-soft inline-flex size-10 items-center justify-center rounded-2xl border">
                <Layers className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-32 font-bold tracking-tight text-primary">
                {isLoadingData ? "..." : realTotalProjects}
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-11 text-secondary">
                <span className="bg-emerald-500 size-1.5 rounded-full" />
                <span>Across all workspaces</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Navigation Feature Cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <Link
            href="/users"
            className="group shadow-soft hover:border-blue-400 hover:shadow-card relative flex flex-col justify-between overflow-hidden rounded-3xl border border-subtle bg-surface-1 p-6 transition-all hover:-translate-y-1"
          >
            <div className="space-y-3">
              <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 shadow-soft inline-flex size-11 items-center justify-center rounded-2xl border">
                <Users className="h-5 w-5" />
              </div>
              <h4 className="group-hover:text-blue-600 dark:group-hover:text-blue-400 text-16 font-bold text-primary transition-colors">
                User Directory
              </h4>
              <p className="text-13 leading-relaxed text-secondary">
                Inspect cross-tenant user profiles, suspend access, toggle superadmin roles, and provision accounts.
              </p>
            </div>
            <div className="text-blue-600 dark:text-blue-400 mt-5 flex items-center gap-1.5 text-12 font-semibold">
              <span>Open User Directory</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          <Link
            href="/workspace"
            className="group shadow-soft hover:border-blue-400 hover:shadow-card relative flex flex-col justify-between overflow-hidden rounded-3xl border border-subtle bg-surface-1 p-6 transition-all hover:-translate-y-1"
          >
            <div className="space-y-3">
              <div className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 shadow-soft inline-flex size-11 items-center justify-center rounded-2xl border">
                <Building2 className="h-5 w-5" />
              </div>
              <h4 className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 text-16 font-bold text-primary transition-colors">
                Workspace Governance
              </h4>
              <p className="text-13 leading-relaxed text-secondary">
                God-mode "Enter as Admin", transfer workspace ownership, and manage member rosters across all tenants.
              </p>
            </div>
            <div className="text-indigo-600 dark:text-indigo-400 mt-5 flex items-center gap-1.5 text-12 font-semibold">
              <span>Manage Workspaces</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          <Link
            href="/audit-logs"
            className="group shadow-soft hover:border-blue-400 hover:shadow-card relative flex flex-col justify-between overflow-hidden rounded-3xl border border-subtle bg-surface-1 p-6 transition-all hover:-translate-y-1"
          >
            <div className="space-y-3">
              <div className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20 shadow-soft inline-flex size-11 items-center justify-center rounded-2xl border">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h4 className="group-hover:text-sky-600 dark:group-hover:text-sky-400 text-16 font-bold text-primary transition-colors">
                Security & Audit Trail
              </h4>
              <p className="text-13 leading-relaxed text-secondary">
                Immutable security logs of administrative logins, God-mode actions, and permission changes.
              </p>
            </div>
            <div className="text-sky-600 dark:text-sky-400 mt-5 flex items-center gap-1.5 text-12 font-semibold">
              <span>View Audit Trail</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>

        {/* Instance General Settings Card */}
        {instance && instanceAdmins && (
          <div className="shadow-card rounded-3xl border border-subtle bg-surface-1 p-7 sm:p-8">
            <div className="mb-6 border-b border-subtle pb-4">
              <h3 className="text-17 font-bold text-primary">Instance Identity & Telemetry</h3>
              <p className="mt-1 text-12 text-secondary">
                Configure instance title, administrator email addresses, and telemetry preferences.
              </p>
            </div>
            <GeneralConfigurationForm instance={instance} instanceAdmins={instanceAdmins} />
          </div>
        )}
      </div>

      {/* Provision User Modal */}
      <CreateUserModal isOpen={isCreateUserOpen} onClose={() => setIsCreateUserOpen(false)} />
    </PageWrapper>
  );
}

function downloadBlob(content: string, filename: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const pom = document.createElement("a");
  pom.href = url;
  pom.setAttribute("download", filename);
  pom.click();
  URL.revokeObjectURL(url);
}

export const meta = () => [{ title: "Platform Overview & Settings – Keel Admin" }];

export default observer(GeneralOverviewPage);

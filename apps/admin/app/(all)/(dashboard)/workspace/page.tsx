/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState, useMemo } from "react";
import { observer } from "mobx-react";
import Link from "next/link";
import useSWR from "swr";
import {
  Search,
  Plus,
  Users,
  Layers,
  CheckSquare,
  ExternalLink,
  ArrowRightLeft,
  Trash2,
  ShieldAlert,
} from "lucide-react";
import { TOAST_TYPE, setToast } from "@keel/propel/toast";
import { ToggleSwitch } from "@keel/ui";
import { WEB_BASE_URL } from "@keel/constants";
import { PageWrapper } from "@/components/common/page-wrapper";
import { useAdmin, useInstance } from "@/hooks/store";
import type { IAdminWorkspace } from "@keel/services";
import { ManageMembersModal } from "@/components/workspace/manage-members-modal";
import { TransferOwnerModal } from "@/components/workspace/transfer-owner-modal";

const WorkspaceManagementPage = observer(function WorkspaceManagementPage() {
  const adminStore = useAdmin();
  const { workspaces, isLoadingWorkspaces } = adminStore;
  const { formattedConfig, fetchInstanceConfigurations, updateInstanceConfigurations } = useInstance();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorkspace, setSelectedWorkspace] = useState<IAdminWorkspace | null>(null);
  const [isManageMembersOpen, setIsManageMembersOpen] = useState(false);
  const [isTransferOwnerOpen, setIsTransferOwnerOpen] = useState(false);
  const [isJoiningId, setIsJoiningId] = useState<string | null>(null);
  const [isConfigSubmitting, setIsConfigSubmitting] = useState(false);

  // Load data
  useSWR("ADMIN_WORKSPACES_LIST", () => adminStore.fetchWorkspaces());
  useSWR("ADMIN_USERS_LIST", () => adminStore.fetchUsers());
  useSWR("INSTANCE_CONFIGURATIONS", () => fetchInstanceConfigurations());

  const disableWorkspaceCreation = formattedConfig?.DISABLE_WORKSPACE_CREATION ?? "0";

  const handleToggleCreationPolicy = async () => {
    setIsConfigSubmitting(true);
    const nextVal = disableWorkspaceCreation === "1" ? "0" : "1";
    try {
      await updateInstanceConfigurations({ DISABLE_WORKSPACE_CREATION: nextVal });
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "Policy Updated",
        message:
          nextVal === "1"
            ? "Workspace creation restricted to instance admins only."
            : "Workspace creation opened to all users.",
      });
    } catch {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: "Error",
        message: "Failed to update workspace creation policy.",
      });
    } finally {
      setIsConfigSubmitting(false);
    }
  };

  const handleEnterAsAdmin = async (workspace: IAdminWorkspace) => {
    setIsJoiningId(workspace.id);
    try {
      await adminStore.joinWorkspace(workspace.id);
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "God-Mode Access Granted",
        message: `Elevated to Admin in ${workspace.name}. Redirecting...`,
      });
      window.open(`${WEB_BASE_URL}/${encodeURIComponent(workspace.slug)}`, "_blank");
    } catch (err: any) {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: "Access Error",
        message: err?.message || "Failed to elevate access.",
      });
    } finally {
      setIsJoiningId(null);
    }
  };

  const handleDeleteWorkspace = async (workspace: IAdminWorkspace) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete workspace "${workspace.name}" (${workspace.slug})?\n\nThis will remove all projects, issues, and member associations. This action is irreversible.`
      )
    ) {
      return;
    }

    try {
      await adminStore.deleteWorkspace(workspace.id);
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "Workspace Deleted",
        message: `Workspace "${workspace.name}" has been removed.`,
      });
    } catch (err: any) {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: "Delete Failed",
        message: err?.message || "Could not delete workspace.",
      });
    }
  };

  const filteredWorkspaces = useMemo(() => {
    return workspaces.filter((w) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        w.name.toLowerCase().includes(q) ||
        w.slug.toLowerCase().includes(q) ||
        w.owner_email.toLowerCase().includes(q) ||
        w.owner_name.toLowerCase().includes(q)
      );
    });
  }, [workspaces, searchQuery]);

  return (
    <PageWrapper
      header={{
        title: "Workspace Governance",
        description: "Oversee all organizations, manage memberships, transfer ownership, and exercise God-mode access.",
      }}
    >
      <div className="space-y-6">
        {/* Keel Workspace Creation Policy Card */}
        <div className="shadow-soft hover:shadow-card flex flex-col justify-between gap-4 rounded-3xl border border-subtle bg-surface-1 p-6 transition-all sm:flex-row sm:items-center">
          <div>
            <h3 className="text-15 font-bold tracking-tight text-primary">Workspace Creation Policy</h3>
            <p className="mt-1 text-12 text-tertiary">
              {disableWorkspaceCreation === "1"
                ? "Currently restricted: Only Superadmins can create new workspaces on this platform."
                : "Currently open: Any authenticated user can create their own workspace."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-12 font-semibold text-secondary">Restrict to Admins</span>
            <ToggleSwitch
              value={disableWorkspaceCreation === "1"}
              onChange={handleToggleCreationPolicy}
              size="sm"
              disabled={isConfigSubmitting}
            />
          </div>
        </div>

        {/* Action & Search Bar */}
        <div className="flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
          <div className="relative flex max-w-md flex-1 items-center gap-2">
            <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workspaces by name, slug, or owner..."
              className="focus:border-blue-500 shadow-soft w-full rounded-full border border-subtle bg-layer-1 py-2 pr-4 pl-10 text-12 text-primary transition-all placeholder:text-secondary focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/workspace/create"
              className="bg-blue-600 shadow-glow hover:bg-blue-700 inline-flex items-center gap-2 rounded-full px-5 py-2 text-12 font-semibold text-white transition-all hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4" />
              Create Workspace
            </Link>
          </div>
        </div>

        {/* Keel Workspaces Table Card */}
        <div className="shadow-card overflow-hidden rounded-3xl border border-subtle bg-surface-1">
          <table className="min-w-full divide-y divide-subtle">
            <thead className="tracking-wider bg-layer-1/70 text-left text-11 font-semibold text-tertiary uppercase">
              <tr>
                <th scope="col" className="px-6 py-4">
                  Workspace
                </th>
                <th scope="col" className="px-5 py-4">
                  Primary Owner
                </th>
                <th scope="col" className="px-5 py-4">
                  Members
                </th>
                <th scope="col" className="px-5 py-4">
                  Projects / Issues
                </th>
                <th scope="col" className="px-5 py-4">
                  Created Date
                </th>
                <th scope="col" className="relative px-6 py-4 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle text-13">
              {isLoadingWorkspaces && workspaces.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-tertiary">
                    Loading workspaces directory...
                  </td>
                </tr>
              ) : filteredWorkspaces.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center text-tertiary">
                    No workspaces found.
                  </td>
                </tr>
              ) : (
                filteredWorkspaces.map((ws) => (
                  <tr key={ws.id} className="transition-colors hover:bg-layer-2/60">
                    {/* Workspace Details */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 shadow-soft flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-12 font-bold uppercase">
                          {ws.name?.[0] || "W"}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 font-semibold text-primary">
                            {ws.name}
                            <a
                              href={`${WEB_BASE_URL}/${encodeURIComponent(ws.slug)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:text-blue-600 dark:hover:text-blue-400 text-tertiary transition-colors"
                              title="Open in Web App"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </div>
                          <div className="font-mono text-11 text-tertiary">/{ws.slug}</div>
                        </div>
                      </div>
                    </td>

                    {/* Owner */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="font-medium text-primary">{ws.owner_name}</div>
                      <div className="font-mono text-11 text-tertiary">{ws.owner_email}</div>
                    </td>

                    {/* Members Count */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedWorkspace(ws);
                          setIsManageMembersOpen(true);
                        }}
                        className="hover:border-blue-400 shadow-soft inline-flex items-center gap-1.5 rounded-full border border-subtle bg-layer-1 px-3 py-1 text-12 font-medium text-secondary transition-all hover:-translate-y-0.5 hover:text-primary"
                        title="Click to view and manage members"
                      >
                        <Users className="text-blue-600 dark:text-blue-400 h-3.5 w-3.5" />
                        {ws.members_count} member(s)
                      </button>
                    </td>

                    {/* Projects & Issues */}
                    <td className="px-5 py-4 text-12 whitespace-nowrap text-secondary">
                      <div className="flex items-center gap-3">
                        <span
                          className="font-mono inline-flex items-center gap-1 rounded-full border border-subtle bg-layer-1 px-2.5 py-0.5 text-11 text-secondary"
                          title="Projects"
                        >
                          <Layers className="h-3 w-3 text-tertiary" />
                          {ws.projects_count}
                        </span>
                        <span
                          className="font-mono inline-flex items-center gap-1 rounded-full border border-subtle bg-layer-1 px-2.5 py-0.5 text-11 text-secondary"
                          title="Issues / Work Items"
                        >
                          <CheckSquare className="h-3 w-3 text-tertiary" />
                          {ws.issues_count}
                        </span>
                      </div>
                    </td>

                    {/* Created Date */}
                    <td className="font-mono px-5 py-4 text-12 whitespace-nowrap text-tertiary">
                      {new Date(ws.created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right text-12 font-medium whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {/* God Mode Enter */}
                        <button
                          type="button"
                          onClick={() => handleEnterAsAdmin(ws)}
                          disabled={isJoiningId === ws.id}
                          className="border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 shadow-soft inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-11 font-semibold transition-all hover:-translate-y-0.5 hover:text-white"
                          title="Join as Superadmin and open in web app"
                        >
                          <ShieldAlert className="h-3.5 w-3.5" />
                          {isJoiningId === ws.id ? "Entering..." : "Enter as Admin"}
                        </button>

                        {/* Transfer Owner */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedWorkspace(ws);
                            setIsTransferOwnerOpen(true);
                          }}
                          className="hover:text-blue-600 dark:hover:text-blue-400 rounded-full p-1.5 text-tertiary transition-colors hover:bg-layer-2"
                          title="Transfer Ownership"
                        >
                          <ArrowRightLeft className="h-4 w-4" />
                        </button>

                        {/* Delete Workspace */}
                        <button
                          type="button"
                          onClick={() => handleDeleteWorkspace(ws)}
                          className="hover:text-rose-500 hover:bg-rose-500/10 rounded-full p-1.5 text-tertiary transition-colors"
                          title="Delete Workspace"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manage Members Modal */}
      <ManageMembersModal
        workspace={selectedWorkspace}
        isOpen={isManageMembersOpen}
        onClose={() => {
          setIsManageMembersOpen(false);
          setSelectedWorkspace(null);
        }}
      />

      {/* Transfer Ownership Modal */}
      <TransferOwnerModal
        workspace={selectedWorkspace}
        isOpen={isTransferOwnerOpen}
        onClose={() => {
          setIsTransferOwnerOpen(false);
          setSelectedWorkspace(null);
        }}
      />
    </PageWrapper>
  );
});

export const meta = () => [
  { title: "Workspace Governance – Superadmin Portal" },
  { name: "description", content: "Oversee workspaces, members, and ownership across the platform." },
];

export default WorkspaceManagementPage;

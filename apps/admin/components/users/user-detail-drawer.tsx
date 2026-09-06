/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { observer } from "mobx-react";
import { X, Shield, UserCheck, UserX, Trash2, Plus, Building2, ExternalLink } from "lucide-react";
import { TOAST_TYPE, setToast } from "@keel/propel/toast";
import { WEB_BASE_URL } from "@keel/constants";
import { useAdmin } from "@/hooks/store";
import type { IAdminUser, IAdminUserWorkspace } from "@keel/services";

type TUserDetailDrawerProps = {
  user: IAdminUser | null;
  isOpen: boolean;
  onClose: () => void;
};

export const UserDetailDrawer = observer(function UserDetailDrawer({ user, isOpen, onClose }: TUserDetailDrawerProps) {
  const adminStore = useAdmin();
  const { workspaces } = adminStore;

  const [userWorkspaces, setUserWorkspaces] = useState<IAdminUserWorkspace[]>([]);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(false);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
  const [selectedRole, setSelectedRole] = useState(15);
  const [isAddingWorkspace, setIsAddingWorkspace] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadUserWorkspaces = async () => {
    if (!user) return;
    setIsLoadingWorkspaces(true);
    try {
      const res = await adminStore.getUserWorkspaces(user.id);
      setUserWorkspaces(res);
    } catch {
      setUserWorkspaces([]);
    } finally {
      setIsLoadingWorkspaces(false);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      loadUserWorkspaces();
    }
  }, [isOpen, user]);

  if (!user) return null;

  const handleToggleActive = async () => {
    setIsUpdatingStatus(true);
    try {
      const newStatus = !user.is_active;
      await adminStore.updateUser(user.id, { is_active: newStatus });
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "Account Status Updated",
        message: `User is now ${newStatus ? "active" : "suspended"}.`,
      });
    } catch (err: any) {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: "Error",
        message: err?.message || "Failed to update account status.",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleToggleAdmin = async () => {
    setIsUpdatingStatus(true);
    try {
      const newAdminStatus = !user.is_superuser;
      await adminStore.updateUser(user.id, { is_superuser: newAdminStatus });
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "Admin Privileges Updated",
        message: `User is ${newAdminStatus ? "now an Instance Superadmin" : "no longer an admin"}.`,
      });
    } catch (err: any) {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: "Error",
        message: err?.message || "Failed to update admin role.",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete ${user.email}? This action cannot be undone.`)) {
      return;
    }
    setIsDeleting(true);
    try {
      await adminStore.deleteUser(user.id);
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "User Deleted",
        message: `Account ${user.email} has been permanently removed.`,
      });
      onClose();
    } catch (err: any) {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: "Delete Failed",
        message: err?.message || "Could not delete user account.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddWorkspace = async () => {
    if (!selectedWorkspaceId) return;
    setIsAddingWorkspace(true);
    try {
      await adminStore.addUserToWorkspace(selectedWorkspaceId, user.id, selectedRole);
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "Workspace Assigned",
        message: `User added to workspace.`,
      });
      setSelectedWorkspaceId("");
      await loadUserWorkspaces();
    } catch (err: any) {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: "Assignment Failed",
        message: err?.message || "Could not assign user to workspace.",
      });
    } finally {
      setIsAddingWorkspace(false);
    }
  };

  const handleRemoveFromWorkspace = async (workspaceId: string, workspaceName: string) => {
    if (!window.confirm(`Remove ${user.email} from ${workspaceName}?`)) return;
    try {
      await adminStore.removeUserFromWorkspace(workspaceId, user.id);
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "Member Removed",
        message: `User removed from ${workspaceName}.`,
      });
      await loadUserWorkspaces();
    } catch (err: any) {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: "Error",
        message: err?.message || "Could not remove user from workspace.",
      });
    }
  };

  const handleUpdateWorkspaceRole = async (workspaceId: string, newRole: number) => {
    try {
      await adminStore.updateWorkspaceMemberRole(workspaceId, user.id, newRole);
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "Role Updated",
        message: "Workspace member role updated.",
      });
      await loadUserWorkspaces();
    } catch (err: any) {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: "Role Update Failed",
        message: err?.message || "Could not change role.",
      });
    }
  };

  // Workspaces the user is not yet enrolled in
  const availableWorkspaces = workspaces.filter((w) => !userWorkspaces.some((uw) => uw.workspace_id === w.id));

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-backdrop transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300 sm:duration-400"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300 sm:duration-400"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="shadow-float pointer-events-auto flex w-screen max-w-md flex-col border-l border-subtle bg-surface-1">
                  {/* Header */}
                  <div className="flex items-start justify-between border-b border-subtle p-6">
                    <div className="flex items-center gap-3.5">
                      <div className="bg-blue-600 shadow-glow-sm flex h-12 w-12 items-center justify-center rounded-full text-16 font-bold text-white uppercase">
                        {user.display_name?.[0] || user.email[0]}
                      </div>
                      <div>
                        <Dialog.Title as="h2" className="text-16 font-bold tracking-tight text-primary">
                          {user.display_name || "Anonymous User"}
                        </Dialog.Title>
                        <p className="font-mono text-12 text-tertiary">{user.email}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-full p-1.5 text-tertiary transition-colors hover:bg-layer-1 hover:text-primary"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="flex-1 space-y-6 overflow-y-auto p-6">
                    {/* Status & Roles Badges */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="shadow-soft rounded-2xl border border-subtle bg-layer-1/70 p-3.5">
                        <span className="block text-11 font-medium text-tertiary">Account Status</span>
                        <span
                          className={`mt-1 inline-flex items-center gap-1.5 text-12 font-semibold ${
                            user.is_active ? "text-emerald-500" : "text-rose-500"
                          }`}
                        >
                          {user.is_active ? <UserCheck className="h-3.5 w-3.5" /> : <UserX className="h-3.5 w-3.5" />}
                          {user.is_active ? "Active" : "Suspended"}
                        </span>
                      </div>
                      <div className="shadow-soft rounded-2xl border border-subtle bg-layer-1/70 p-3.5">
                        <span className="block text-11 font-medium text-tertiary">System Role</span>
                        <span
                          className={`mt-1 inline-flex items-center gap-1.5 text-12 font-semibold ${
                            user.is_superuser ? "text-blue-600 dark:text-blue-400" : "text-secondary"
                          }`}
                        >
                          <Shield className="h-3.5 w-3.5" />
                          {user.is_superuser ? "Superadmin" : "Standard User"}
                        </span>
                      </div>
                    </div>

                    {/* Metadata Details */}
                    <div className="shadow-soft space-y-2.5 rounded-2xl border border-subtle bg-layer-1/70 p-4 text-12 text-secondary">
                      <div className="flex justify-between">
                        <span className="text-tertiary">User ID</span>
                        <span className="font-mono text-11 text-primary">{user.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-tertiary">Joined On</span>
                        <span className="font-medium text-primary">
                          {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-tertiary">Workspaces</span>
                        <span className="font-medium text-primary">{userWorkspaces.length} workspace(s)</span>
                      </div>
                    </div>

                    {/* Workspace Memberships */}
                    <div>
                      <div className="mb-2.5 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 text-13 font-semibold text-primary">
                          <Building2 className="text-blue-600 dark:text-blue-400 h-4 w-4" />
                          Joined Workspaces
                        </h3>
                      </div>

                      {isLoadingWorkspaces ? (
                        <p className="py-3 text-center text-12 text-tertiary">Loading workspaces...</p>
                      ) : userWorkspaces.length === 0 ? (
                        <p className="rounded-2xl border border-dashed border-subtle py-4 text-center text-12 text-tertiary">
                          User does not belong to any workspace.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {userWorkspaces.map((ws) => (
                            <div
                              key={ws.workspace_id}
                              className="shadow-soft flex items-center justify-between rounded-2xl border border-subtle bg-layer-1/70 p-3 text-12"
                            >
                              <div>
                                <a
                                  href={`${WEB_BASE_URL}/${encodeURIComponent(ws.slug)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 font-semibold text-primary transition-colors"
                                >
                                  {ws.name}
                                  <ExternalLink className="h-3 w-3 text-tertiary" />
                                </a>
                                <span className="font-mono text-11 text-tertiary">/{ws.slug}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <select
                                  value={ws.role}
                                  onChange={(e) => handleUpdateWorkspaceRole(ws.workspace_id, Number(e.target.value))}
                                  className="focus:border-blue-500 rounded-full border border-subtle bg-surface-1 px-3 py-1 text-11 text-secondary focus:outline-none"
                                >
                                  <option value={20}>Admin</option>
                                  <option value={15}>Member</option>
                                  <option value={5}>Guest</option>
                                </select>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFromWorkspace(ws.workspace_id, ws.name)}
                                  className="hover:text-rose-500 hover:bg-rose-500/10 rounded-full p-1.5 text-tertiary transition-colors"
                                  title="Remove from workspace"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add to another workspace */}
                      {availableWorkspaces.length > 0 && (
                        <div className="mt-3.5 space-y-2.5 rounded-2xl border border-dashed border-subtle bg-layer-1/40 p-3.5">
                          <span className="block text-11 font-semibold text-secondary">
                            Enroll in another workspace
                          </span>
                          <div className="flex gap-2">
                            <select
                              value={selectedWorkspaceId}
                              onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                              className="focus:border-blue-500 flex-1 rounded-full border border-subtle bg-surface-1 px-3 py-1.5 text-12 text-primary focus:outline-none"
                            >
                              <option value="">Select workspace...</option>
                              {availableWorkspaces.map((w) => (
                                <option key={w.id} value={w.id}>
                                  {w.name}
                                </option>
                              ))}
                            </select>
                            <select
                              value={selectedRole}
                              onChange={(e) => setSelectedRole(Number(e.target.value))}
                              className="focus:border-blue-500 rounded-full border border-subtle bg-surface-1 px-3 py-1.5 text-12 text-primary focus:outline-none"
                            >
                              <option value={20}>Admin</option>
                              <option value={15}>Member</option>
                              <option value={5}>Guest</option>
                            </select>
                            <button
                              type="button"
                              onClick={handleAddWorkspace}
                              disabled={!selectedWorkspaceId || isAddingWorkspace}
                              className="bg-blue-600 shadow-glow hover:bg-blue-700 inline-flex items-center justify-center rounded-full p-2 text-white transition-all hover:-translate-y-0.5 disabled:opacity-50"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Administrative Controls */}
                    <div className="space-y-2.5 border-t border-subtle pt-4">
                      <h4 className="tracking-wider text-11 font-semibold text-tertiary uppercase">Account Actions</h4>

                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={handleToggleAdmin}
                          disabled={isUpdatingStatus}
                          className="hover:border-blue-400 hover:text-blue-600 shadow-soft inline-flex items-center justify-start rounded-full border border-subtle bg-layer-1 px-4 py-2.5 text-12 font-semibold text-primary transition-all hover:-translate-y-0.5"
                        >
                          <Shield className="text-blue-600 dark:text-blue-400 mr-2 h-4 w-4" />
                          {user.is_superuser ? "Revoke Instance Admin" : "Grant Instance Admin (Superadmin)"}
                        </button>

                        <button
                          type="button"
                          onClick={handleToggleActive}
                          disabled={isUpdatingStatus}
                          className="hover:border-amber-400 hover:text-amber-500 shadow-soft inline-flex items-center justify-start rounded-full border border-subtle bg-layer-1 px-4 py-2.5 text-12 font-semibold text-secondary transition-all hover:-translate-y-0.5"
                        >
                          {user.is_active ? (
                            <>
                              <UserX className="text-amber-500 mr-2 h-4 w-4" />
                              Suspend Account Access
                            </>
                          ) : (
                            <>
                              <UserCheck className="text-emerald-500 mr-2 h-4 w-4" />
                              Reactivate Account
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={handleDeleteUser}
                          disabled={isDeleting}
                          className="border-rose-500/30 bg-rose-500/10 text-rose-500 hover:bg-rose-500 shadow-soft inline-flex items-center justify-start rounded-full border px-4 py-2.5 text-12 font-semibold transition-all hover:-translate-y-0.5 hover:text-white"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Permanently Delete User Account
                        </button>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
});

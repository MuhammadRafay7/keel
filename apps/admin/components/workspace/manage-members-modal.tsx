/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { observer } from "mobx-react";
import { X, Users, UserPlus, Trash2 } from "lucide-react";
import { TOAST_TYPE, setToast } from "@keel/propel/toast";
import { useAdmin } from "@/hooks/store";
import type { IAdminWorkspace, IAdminWorkspaceMember } from "@keel/services";

type TManageMembersModalProps = {
  workspace: IAdminWorkspace | null;
  isOpen: boolean;
  onClose: () => void;
};

export const ManageMembersModal = observer(function ManageMembersModal({
  workspace,
  isOpen,
  onClose,
}: TManageMembersModalProps) {
  const adminStore = useAdmin();
  const { users } = adminStore;

  const [members, setMembers] = useState<IAdminWorkspaceMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState(15);
  const [isAdding, setIsAdding] = useState(false);

  const loadMembers = async () => {
    if (!workspace) return;
    setIsLoading(true);
    try {
      const res = await adminStore.getWorkspaceMembers(workspace.id);
      setMembers(res);
    } catch {
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && workspace) {
      loadMembers();
    }
  }, [isOpen, workspace]);

  if (!workspace) return null;

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    setIsAdding(true);
    try {
      await adminStore.addUserToWorkspace(workspace.id, selectedUserId, selectedRole);
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "Member Added",
        message: "User has been enrolled in the workspace.",
      });
      setSelectedUserId("");
      await loadMembers();
    } catch (err: any) {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: "Error",
        message: err?.message || "Failed to add member to workspace.",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: number) => {
    try {
      await adminStore.updateWorkspaceMemberRole(workspace.id, userId, newRole);
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "Role Updated",
        message: "Workspace member role changed.",
      });
      await loadMembers();
    } catch (err: any) {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: "Error",
        message: err?.message || "Could not change role.",
      });
    }
  };

  const handleRemoveMember = async (userId: string, email: string) => {
    if (!window.confirm(`Remove ${email} from ${workspace.name}?`)) return;
    try {
      await adminStore.removeUserFromWorkspace(workspace.id, userId);
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "Member Removed",
        message: "User removed from workspace.",
      });
      await loadMembers();
    } catch (err: any) {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: "Error",
        message: err?.message || "Could not remove member.",
      });
    }
  };

  // Platform users not yet in this workspace
  const nonMembers = users.filter((u) => !members.some((m) => m.member_id === u.id));

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-backdrop transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="shadow-float relative w-full transform overflow-hidden rounded-3xl border border-subtle bg-surface-1 p-6 text-left transition-all sm:my-8 sm:max-w-2xl sm:p-8">
                <div className="flex items-center justify-between border-b border-subtle pb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 shadow-soft flex h-10 w-10 items-center justify-center rounded-full border">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-16 font-bold tracking-tight text-primary">
                        Manage Members — {workspace.name}
                      </Dialog.Title>
                      <p className="text-12 text-tertiary">
                        View, add, remove, and adjust roles for members in this workspace.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full p-1.5 text-tertiary transition-colors hover:bg-layer-1 hover:text-primary"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Add Member Form */}
                <form
                  onSubmit={handleAddMember}
                  className="shadow-soft mt-5 space-y-2.5 rounded-2xl border border-subtle bg-layer-1/60 p-4"
                >
                  <span className="block text-12 font-semibold text-primary">Add User to Workspace</span>
                  <div className="flex flex-col gap-2.5 sm:flex-row">
                    <select
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="focus:border-blue-500 shadow-soft flex-1 rounded-full border border-subtle bg-surface-1 px-4 py-2 text-12 text-primary transition-all focus:outline-none"
                    >
                      <option value="">Select user to add...</option>
                      {nonMembers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.display_name ? `${u.display_name} (${u.email})` : u.email}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(Number(e.target.value))}
                      className="focus:border-blue-500 shadow-soft rounded-full border border-subtle bg-surface-1 px-4 py-2 text-12 text-primary transition-all focus:outline-none"
                    >
                      <option value={20}>Admin (20)</option>
                      <option value={15}>Member (15)</option>
                      <option value={5}>Guest (5)</option>
                    </select>

                    <button
                      type="submit"
                      disabled={isAdding || !selectedUserId}
                      className="bg-blue-600 shadow-glow hover:bg-blue-700 inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full px-5 py-2 text-12 font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      Add
                    </button>
                  </div>
                </form>

                {/* Members List */}
                <div className="mt-5">
                  <h4 className="tracking-wider mb-2.5 text-11 font-semibold text-tertiary uppercase">
                    Current Members ({members.length})
                  </h4>

                  <div className="shadow-soft max-h-80 divide-y divide-subtle overflow-y-auto rounded-2xl border border-subtle">
                    {isLoading ? (
                      <p className="p-6 text-center text-12 text-tertiary">Loading members...</p>
                    ) : members.length === 0 ? (
                      <p className="p-6 text-center text-12 text-tertiary">No members found.</p>
                    ) : (
                      members.map((m) => (
                        <div key={m.member_id} className="flex items-center justify-between bg-surface-1 p-3.5 text-12">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 shadow-soft flex h-8 w-8 items-center justify-center rounded-full border text-11 font-bold uppercase">
                              {m.display_name?.[0] || m.email[0]}
                            </div>
                            <div>
                              <div className="font-semibold text-primary">{m.display_name || "User"}</div>
                              <div className="font-mono text-11 text-tertiary">{m.email}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <select
                              value={m.role}
                              onChange={(e) => handleRoleChange(m.member_id, Number(e.target.value))}
                              className="focus:border-blue-500 rounded-full border border-subtle bg-layer-1 px-3 py-1 text-11 text-secondary focus:outline-none"
                            >
                              <option value={20}>Admin</option>
                              <option value={15}>Member</option>
                              <option value={5}>Guest</option>
                            </select>

                            <button
                              type="button"
                              onClick={() => handleRemoveMember(m.member_id, m.email)}
                              className="hover:text-rose-500 hover:bg-rose-500/10 rounded-full p-1.5 text-tertiary transition-colors"
                              title="Remove from workspace"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="shadow-soft inline-flex items-center justify-center rounded-full border border-subtle bg-layer-1 px-5 py-2 text-12 font-semibold text-secondary transition-all hover:-translate-y-0.5 hover:border-subtle-1 hover:text-primary"
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
});

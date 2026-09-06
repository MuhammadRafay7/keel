/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { observer } from "mobx-react";
import { X, UserPlus } from "lucide-react";
import { TOAST_TYPE, setToast } from "@keel/propel/toast";
import { useAdmin } from "@/hooks/store";

type TCreateUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const CreateUserModal = observer(function CreateUserModal({ isOpen, onClose }: TCreateUserModalProps) {
  const adminStore = useAdmin();
  const { workspaces } = adminStore;

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [isSuperuser, setIsSuperuser] = useState(false);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
  const [selectedRole, setSelectedRole] = useState(15); // 15 = Member
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setEmail("");
    setDisplayName("");
    setPassword("");
    setIsSuperuser(false);
    setSelectedWorkspaceId("");
    setSelectedRole(15);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: "Validation Error",
        message: "Email and password are required.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await adminStore.createUser({
        email: email.trim(),
        password: password.trim(),
        display_name: displayName.trim() || undefined,
        is_superuser: isSuperuser,
        initial_workspace_id: selectedWorkspaceId || undefined,
        initial_role: selectedRole,
      });

      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "User Created",
        message: `Account for ${email} has been provisioned.`,
      });
      handleClose();
    } catch (err: any) {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: "Failed to Create User",
        message: err?.message || "An unexpected error occurred while creating the user.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
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
              <Dialog.Panel className="shadow-float relative w-full transform overflow-hidden rounded-3xl border border-subtle bg-surface-1 p-6 text-left transition-all sm:my-8 sm:max-w-lg sm:p-8">
                <div className="flex items-center justify-between border-b border-subtle pb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 shadow-soft flex h-10 w-10 items-center justify-center rounded-full border">
                      <UserPlus className="h-5 w-5" />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-16 font-bold tracking-tight text-primary">
                        Provision User Account
                      </Dialog.Title>
                      <p className="text-12 text-tertiary">Directly create and onboard a new user to the platform.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-full p-1.5 text-tertiary transition-colors hover:bg-layer-1 hover:text-primary"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                  <div>
                    <label className="mb-1.5 block text-12 font-medium text-secondary">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="colleague@company.com"
                      className="focus:border-blue-500 shadow-soft w-full rounded-full border border-subtle bg-layer-1 px-4 py-2.5 text-13 text-primary transition-all placeholder:text-tertiary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-12 font-medium text-secondary">Display Name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Jane Doe"
                      className="focus:border-blue-500 shadow-soft w-full rounded-full border border-subtle bg-layer-1 px-4 py-2.5 text-13 text-primary transition-all placeholder:text-tertiary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-12 font-medium text-secondary">Initial Password *</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="focus:border-blue-500 shadow-soft w-full rounded-full border border-subtle bg-layer-1 px-4 py-2.5 text-13 text-primary transition-all placeholder:text-tertiary focus:outline-none"
                    />
                  </div>

                  <div className="shadow-soft flex items-center gap-2.5 rounded-2xl border border-subtle bg-layer-1/70 p-3.5">
                    <input
                      type="checkbox"
                      id="isSuperuser"
                      checked={isSuperuser}
                      onChange={(e) => setIsSuperuser(e.target.checked)}
                      className="text-blue-600 focus:ring-blue-500 h-4 w-4 rounded-md border-subtle"
                    />
                    <label htmlFor="isSuperuser" className="cursor-pointer text-12 font-medium text-primary">
                      Grant Instance Administrator (Superadmin) Privileges
                    </label>
                  </div>

                  <div className="border-t border-subtle pt-4">
                    <label className="mb-1.5 block text-12 font-medium text-secondary">
                      Initial Workspace Assignment (Optional)
                    </label>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <select
                        value={selectedWorkspaceId}
                        onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                        className="focus:border-blue-500 shadow-soft rounded-full border border-subtle bg-layer-1 px-3.5 py-2 text-12 text-primary transition-all focus:outline-none"
                      >
                        <option value="">Do not assign to workspace</option>
                        {workspaces.map((ws) => (
                          <option key={ws.id} value={ws.id}>
                            {ws.name} ({ws.slug})
                          </option>
                        ))}
                      </select>

                      {selectedWorkspaceId && (
                        <select
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(Number(e.target.value))}
                          className="focus:border-blue-500 shadow-soft rounded-full border border-subtle bg-layer-1 px-3.5 py-2 text-12 text-primary transition-all focus:outline-none"
                        >
                          <option value={20}>Admin (Full Control)</option>
                          <option value={15}>Member (Collaborator)</option>
                          <option value={5}>Guest (Limited)</option>
                        </select>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 border-t border-subtle pt-5">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isSubmitting}
                      className="shadow-soft inline-flex items-center justify-center rounded-full border border-subtle bg-layer-1 px-5 py-2 text-12 font-semibold text-secondary transition-all hover:-translate-y-0.5 hover:border-subtle-1 hover:text-primary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-blue-600 shadow-glow hover:bg-blue-700 inline-flex items-center justify-center rounded-full px-6 py-2 text-12 font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50"
                    >
                      {isSubmitting ? "Provisioning..." : "Provision User"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
});

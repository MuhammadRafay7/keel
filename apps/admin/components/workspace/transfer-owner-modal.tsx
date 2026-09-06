/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { observer } from "mobx-react";
import { X, ArrowRightLeft } from "lucide-react";
import { TOAST_TYPE, setToast } from "@keel/propel/toast";
import { useAdmin } from "@/hooks/store";
import type { IAdminWorkspace } from "@keel/services";

type TTransferOwnerModalProps = {
  workspace: IAdminWorkspace | null;
  isOpen: boolean;
  onClose: () => void;
};

export const TransferOwnerModal = observer(function TransferOwnerModal({
  workspace,
  isOpen,
  onClose,
}: TTransferOwnerModalProps) {
  const adminStore = useAdmin();
  const { users } = adminStore;

  const [selectedNewOwnerId, setSelectedNewOwnerId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!workspace) return null;

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNewOwnerId) return;

    setIsSubmitting(true);
    try {
      await adminStore.transferWorkspaceOwner(workspace.id, selectedNewOwnerId);
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "Ownership Transferred",
        message: `Workspace ownership transferred successfully.`,
      });
      onClose();
    } catch (err: any) {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: "Transfer Failed",
        message: err?.message || "Failed to transfer workspace ownership.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const eligibleUsers = users.filter((u) => u.id !== workspace.owner_id && u.is_active);

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
              <Dialog.Panel className="shadow-float relative w-full transform overflow-hidden rounded-3xl border border-subtle bg-surface-1 p-6 text-left transition-all sm:my-8 sm:max-w-md sm:p-8">
                <div className="flex items-center justify-between border-b border-subtle pb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-soft flex h-10 w-10 items-center justify-center rounded-full border">
                      <ArrowRightLeft className="h-5 w-5" />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-16 font-bold tracking-tight text-primary">
                        Transfer Workspace Ownership
                      </Dialog.Title>
                      <p className="text-12 text-tertiary">Select the new primary owner for {workspace.name}.</p>
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

                <form onSubmit={handleTransfer} className="mt-5 space-y-4">
                  <div className="shadow-soft rounded-2xl border border-subtle bg-layer-1/60 p-4 text-12">
                    <div className="font-medium text-tertiary">Current Owner</div>
                    <div className="mt-1 font-semibold text-primary">
                      {workspace.owner_name}{" "}
                      <span className="font-mono text-11 text-tertiary">({workspace.owner_email})</span>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-12 font-medium text-secondary">Select New Owner</label>
                    <select
                      value={selectedNewOwnerId}
                      onChange={(e) => setSelectedNewOwnerId(e.target.value)}
                      required
                      className="focus:border-blue-500 shadow-soft w-full rounded-full border border-subtle bg-layer-1 px-4 py-2.5 text-12 text-primary transition-all focus:outline-none"
                    >
                      <option value="">Choose new owner...</option>
                      {eligibleUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.display_name ? `${u.display_name} (${u.email})` : u.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <p className="text-11 text-tertiary">
                    The new owner will automatically be granted Admin (20) privileges in the workspace.
                  </p>

                  <div className="flex items-center justify-end gap-3 border-t border-subtle pt-5">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={isSubmitting}
                      className="shadow-soft inline-flex items-center justify-center rounded-full border border-subtle bg-layer-1 px-5 py-2 text-12 font-semibold text-secondary transition-all hover:-translate-y-0.5 hover:border-subtle-1 hover:text-primary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !selectedNewOwnerId}
                      className="bg-blue-600 shadow-glow hover:bg-blue-700 inline-flex items-center justify-center rounded-full px-6 py-2 text-12 font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50"
                    >
                      {isSubmitting ? "Transferring..." : "Confirm Transfer"}
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

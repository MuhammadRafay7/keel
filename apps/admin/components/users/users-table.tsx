/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState, useMemo } from "react";
import { observer } from "mobx-react";
import { Search, UserPlus, Shield, Building2, X } from "lucide-react";
import { useAdmin } from "@/hooks/store";
import type { IAdminUser } from "@keel/services";
import { CreateUserModal } from "./create-user-modal";
import { UserDetailDrawer } from "./user-detail-drawer";

export const UsersTable = observer(function UsersTable() {
  const adminStore = useAdmin();
  const { users, isLoadingUsers } = adminStore;

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "admins" | "active" | "suspended">("all");
  const [selectedUser, setSelectedUser] = useState<IAdminUser | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const counts = useMemo(() => {
    return {
      all: users.length,
      admins: users.filter((u) => u.is_superuser).length,
      active: users.filter((u) => u.is_active).length,
      suspended: users.filter((u) => !u.is_active).length,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Search
      const matchesSearch =
        !searchQuery.trim() ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.display_name && u.display_name.toLowerCase().includes(searchQuery.toLowerCase()));

      // Tab filter
      let matchesTab = true;
      if (activeTab === "admins") matchesTab = u.is_superuser;
      if (activeTab === "active") matchesTab = u.is_active;
      if (activeTab === "suspended") matchesTab = !u.is_active;

      return matchesSearch && matchesTab;
    });
  }, [users, searchQuery, activeTab]);

  const handleRowClick = (user: IAdminUser) => {
    setSelectedUser(user);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-col items-stretch justify-between gap-4 md:flex-row md:items-center">
        {/* Keel Pill Filter Tabs */}
        <div className="shadow-soft flex items-center gap-1.5 overflow-x-auto rounded-full border border-subtle bg-layer-1 p-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-12 font-semibold transition-all ${
              activeTab === "all"
                ? "bg-blue-600 shadow-glow-sm text-white"
                : "text-secondary hover:bg-layer-2 hover:text-primary"
            }`}
          >
            <span>All Users</span>
            <span
              className={`font-mono rounded-full px-2 py-0.5 text-10 ${
                activeTab === "all" ? "bg-white/20 text-white" : "bg-layer-2 font-semibold text-secondary"
              }`}
            >
              {counts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("admins")}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-12 font-semibold transition-all ${
              activeTab === "admins"
                ? "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30 shadow-soft border"
                : "text-secondary hover:bg-layer-2 hover:text-primary"
            }`}
          >
            <span>Superadmins</span>
            <span className="bg-blue-500/10 font-mono text-blue-600 dark:text-blue-400 rounded-full px-2 py-0.5 text-10 font-semibold">
              {counts.admins}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("active")}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-12 font-semibold transition-all ${
              activeTab === "active"
                ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shadow-soft border"
                : "text-secondary hover:bg-layer-2 hover:text-primary"
            }`}
          >
            <span>Active</span>
            <span className="bg-emerald-500/10 font-mono text-emerald-600 dark:text-emerald-400 rounded-full px-2 py-0.5 text-10 font-semibold">
              {counts.active}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("suspended")}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-12 font-semibold transition-all ${
              activeTab === "suspended"
                ? "bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30 shadow-soft border"
                : "text-secondary hover:bg-layer-2 hover:text-primary"
            }`}
          >
            <span>Suspended</span>
            <span className="bg-rose-500/10 font-mono text-rose-600 dark:text-rose-400 rounded-full px-2 py-0.5 text-10 font-semibold">
              {counts.suspended}
            </span>
          </button>
        </div>

        {/* Search & Keel Pill Action */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="focus:border-blue-500 shadow-soft w-full rounded-full border border-subtle bg-layer-1 py-2 pr-8 pl-10 text-12 text-primary transition-all placeholder:text-secondary focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-secondary hover:text-primary"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 shadow-glow hover:bg-blue-700 inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2 text-12 font-semibold text-white transition-all hover:-translate-y-0.5"
          >
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Provision User</span>
          </button>
        </div>
      </div>

      {/* Keel Elevated Data Table Container */}
      <div className="shadow-card overflow-hidden rounded-3xl border border-subtle bg-surface-1">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-subtle text-left">
            <thead className="tracking-wider bg-layer-1/70 text-11 font-semibold text-tertiary uppercase">
              <tr>
                <th scope="col" className="px-6 py-4">
                  User
                </th>
                <th scope="col" className="px-6 py-4">
                  Platform Role
                </th>
                <th scope="col" className="px-6 py-4">
                  Account Status
                </th>
                <th scope="col" className="px-6 py-4 text-center">
                  Workspaces
                </th>
                <th scope="col" className="px-6 py-4">
                  Joined Date
                </th>
                <th scope="col" className="px-6 py-4 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle bg-surface-1">
              {isLoadingUsers ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-13 text-tertiary">
                    Loading users directory...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="shadow-soft mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl border border-subtle bg-layer-1">
                      <Search className="h-6 w-6 text-tertiary" />
                    </div>
                    <h4 className="text-14 font-semibold text-primary">No users match your criteria</h4>
                    <p className="mt-1 text-12 text-tertiary">Try resetting your search query or filter tabs.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const initial = (user.display_name || user.email).charAt(0).toUpperCase();

                  return (
                    <tr
                      key={user.id}
                      onClick={() => handleRowClick(user)}
                      className="group cursor-pointer transition-colors hover:bg-layer-2/60"
                    >
                      {/* User Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 shadow-soft flex size-9 flex-shrink-0 items-center justify-center rounded-full border text-12 font-bold">
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <div className="group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate text-13 font-semibold text-primary transition-colors">
                              {user.display_name || "—"}
                            </div>
                            <div className="font-mono truncate text-12 text-tertiary">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.is_superuser ? (
                          <span className="bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400 shadow-soft inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-11 font-semibold">
                            <Shield className="h-3 w-3" />
                            Superadmin
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-subtle bg-layer-1 px-3 py-0.5 text-11 font-medium text-secondary">
                            Standard User
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.is_active ? (
                          <span className="bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-11 font-medium">
                            <span className="bg-emerald-500 size-1.5 rounded-full" />
                            Active
                          </span>
                        ) : (
                          <span className="bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400 inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-11 font-medium">
                            <span className="bg-rose-500 size-1.5 rounded-full" />
                            Suspended
                          </span>
                        )}
                      </td>

                      {/* Workspaces count */}
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className="font-mono inline-flex items-center gap-1.5 rounded-full border border-subtle bg-layer-1 px-3 py-0.5 text-11 text-secondary">
                          <Building2 className="h-3 w-3 text-tertiary" />
                          {user.workspaces_count ?? 0}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="font-mono px-6 py-4 text-12 whitespace-nowrap text-tertiary">
                        {new Date(user.created_at).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(user);
                          }}
                          className="hover:border-blue-400 hover:text-blue-600 shadow-soft inline-flex items-center rounded-full border border-subtle bg-layer-1 px-3.5 py-1 text-11 font-semibold text-secondary transition-all hover:-translate-y-0.5"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Slide-over Drawer */}
      <UserDetailDrawer
        user={selectedUser}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedUser(null);
        }}
      />

      {/* Provision User Modal */}
      <CreateUserModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  );
});

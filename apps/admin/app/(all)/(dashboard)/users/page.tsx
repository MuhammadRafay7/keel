/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useEffect } from "react";
import { observer } from "mobx-react";
import useSWR from "swr";
import { PageWrapper } from "@/components/common/page-wrapper";
import { UsersTable } from "@/components/users/users-table";
import { useAdmin } from "@/hooks/store";
const UsersManagementPage = observer(function UsersManagementPage() {
  const adminStore = useAdmin();

  // Load initial users and workspaces
  useSWR("ADMIN_USERS_LIST", () => adminStore.fetchUsers());
  useSWR("ADMIN_WORKSPACES_LIST", () => adminStore.fetchWorkspaces());

  return (
    <PageWrapper
      header={{
        title: "User Management",
        description: "Browse all registered users, manage platform roles, inspect memberships, and provision accounts.",
      }}
    >
      <UsersTable />
    </PageWrapper>
  );
});

export default UsersManagementPage;

export const meta = () => [
  { title: "User Management – Admin Portal" },
  { name: "description", content: "Manage platform users, roles, and memberships." },
];

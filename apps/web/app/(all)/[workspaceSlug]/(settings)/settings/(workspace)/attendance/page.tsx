/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
// keel imports
import { EUserPermissions, EUserPermissionsLevel } from "@keel/constants";
// components
import { AttendanceSettingsRoot } from "@/components/attendance/settings";
import { NotAuthorizedView } from "@/components/auth-screens/not-authorized-view";
import { PageHead } from "@/components/core/page-title";
import { SettingsContentWrapper } from "@/components/settings/content-wrapper";
// hooks
import { useUserPermissions } from "@/hooks/store/user";
import { useWorkspace } from "@/hooks/store/use-workspace";
// local imports
import { AttendanceWorkspaceSettingsHeader } from "./header";

const AttendanceSettingsPage = observer(function AttendanceSettingsPage() {
  const { workspaceUserInfo, allowPermissions } = useUserPermissions();
  const { currentWorkspace } = useWorkspace();

  // Everything on this page rewrites how somebody else's hours are counted, so
  // it is admin-only rather than admin-to-edit — the RLS says the same thing.
  const isAdmin = allowPermissions([EUserPermissions.ADMIN], EUserPermissionsLevel.WORKSPACE);

  const pageTitle = currentWorkspace?.name ? `${currentWorkspace.name} - Attendance` : undefined;

  if (workspaceUserInfo && !isAdmin) return <NotAuthorizedView section="settings" className="h-auto" />;

  return (
    <SettingsContentWrapper header={<AttendanceWorkspaceSettingsHeader />}>
      <PageHead title={pageTitle} />
      <div className="pb-3.5">
        <h4 className="text-h3-medium">Attendance</h4>
        <p className="mt-1 max-w-3xl text-body-xs-regular text-tertiary">
          These settings decide how recorded time is counted and who signs it off. Changes apply from now on — hours
          already recorded keep the rules they were recorded under.
        </p>
      </div>
      <AttendanceSettingsRoot />
    </SettingsContentWrapper>
  );
});

export default AttendanceSettingsPage;

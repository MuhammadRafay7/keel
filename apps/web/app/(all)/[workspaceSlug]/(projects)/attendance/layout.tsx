/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { Outlet } from "react-router";
import { Clock } from "@keel/propel/icons";
import { AppHeader } from "@/components/core/app-header";
import { ContentWrapper } from "@/components/core/content-wrapper";

function AttendanceHeader() {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <Clock className="size-4 text-accent-primary" />
      <span className="text-14 font-semibold text-primary">Attendance</span>
    </div>
  );
}

export default function AttendanceLayout() {
  return (
    <>
      <AppHeader header={<AttendanceHeader />} />
      <ContentWrapper className="h-full w-full p-0">
        <Outlet />
      </ContentWrapper>
    </>
  );
}

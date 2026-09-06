/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { ReactNode } from "react";
// keel imports
import { cn } from "@keel/utils";

type TPageWrapperProps = {
  children: ReactNode;
  header?: {
    title: string;
    description: string | ReactNode;
    actions?: ReactNode;
  };
  customHeader?: ReactNode;
  size?: "lg" | "md";
};

export const PageWrapper = (props: TPageWrapperProps) => {
  const { children, header, customHeader, size = "md" } = props;

  return (
    <div
      className={cn("mx-auto h-full w-full space-y-6 py-4", {
        "max-w-[1080px] md:px-6 2xl:max-w-[1280px]": size === "md",
        "px-6 lg:px-12": size === "lg",
      })}
    >
      {customHeader ? (
        <div className="mx-2 shrink-0 space-y-1 border-b border-subtle/80 pt-2 pb-5">{customHeader}</div>
      ) : (
        header && (
          <div className="mx-2 flex shrink-0 flex-col justify-between gap-4 border-b border-subtle/80 pt-2 pb-5 sm:flex-row sm:items-center">
            <div className={header.actions ? "flex flex-col gap-1" : "space-y-1"}>
              <h1 className="text-22 sm:text-26 font-bold tracking-tight text-primary">{header.title}</h1>
              <div className="text-13 text-tertiary">{header.description}</div>
            </div>
            {header.actions && <div className="flex shrink-0 items-center gap-2.5">{header.actions}</div>}
          </div>
        )
      )}
      <div className="vertical-scrollbar scrollbar-sm flex-grow overflow-hidden overflow-y-scroll px-2 pb-6">
        {children}
      </div>
    </div>
  );
};

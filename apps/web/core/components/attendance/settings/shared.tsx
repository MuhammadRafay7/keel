/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { ReactNode } from "react";
import { cn } from "@keel/utils";

export const settingsInputClass =
  "focus-ring w-full rounded-lg border border-subtle bg-surface-1 px-3 py-2 text-body-xs-regular text-primary transition-smooth outline-none placeholder:text-placeholder disabled:opacity-60";

export const settingsLabelClass = "text-11 font-medium tracking-wide text-placeholder uppercase";

/**
 * One block of settings.
 *
 * The description is not decoration: each of these sections changes what
 * happens to somebody's recorded hours, and a heading alone does not say what
 * the consequence is.
 */
export function SettingsSection({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-subtle pb-8 last:border-b-0 last:pb-0">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-2xl">
          <h3 className="text-body-sm-semibold text-primary">{title}</h3>
          <p className="mt-1 text-body-xs-regular text-tertiary">{description}</p>
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

export function SettingsRow({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1", className)}>
      <span className={settingsLabelClass}>{label}</span>
      {children}
      {hint && <span className="text-11 text-placeholder">{hint}</span>}
    </label>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="squircle-card border border-dashed border-subtle px-4 py-8 text-center text-body-xs-regular text-placeholder">
      {children}
    </div>
  );
}

export function InlineError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="mt-3 rounded-lg border border-danger-subtle bg-danger-subtle px-3 py-2 text-body-xs-regular text-danger-primary"
    >
      {message}
    </p>
  );
}

/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// helpers
import { cn } from "@keel/utils";

type Props = {
  name: string;
  description: string;
  icon: React.ReactNode;
  config: React.ReactNode;
  disabled?: boolean;
  withBorder?: boolean;
  unavailable?: boolean;
};

export function AuthenticationMethodCard(props: Props) {
  const { name, description, icon, config, disabled = false, withBorder = true, unavailable = false } = props;

  return (
    <div
      className={cn(
        "shadow-soft hover:shadow-card flex w-full items-center gap-6 rounded-2xl bg-surface-1 transition-all hover:-translate-y-0.5 sm:gap-12",
        {
          "border border-subtle p-5": withBorder,
        }
      )}
    >
      <div
        className={cn("flex grow items-center gap-4", {
          "opacity-50": unavailable,
        })}
      >
        <div className="shrink-0">
          <div className="shadow-soft flex h-11 w-11 items-center justify-center rounded-full border border-subtle bg-layer-1">
            {icon}
          </div>
        </div>
        <div className="grow">
          <div
            className={cn("leading-5 font-semibold text-primary", {
              "text-14": withBorder,
              "text-18": !withBorder,
            })}
          >
            {name}
          </div>
          <div
            className={cn("leading-5 text-tertiary", {
              "mt-0.5 text-12": withBorder,
              "mt-1 text-13": !withBorder,
            })}
          >
            {description}
          </div>
        </div>
      </div>
      <div className={`shrink-0 ${disabled && "opacity-70"}`}>{config}</div>
    </div>
  );
}

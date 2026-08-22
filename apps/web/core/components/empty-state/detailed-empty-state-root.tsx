/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import React from "react";
import { observer } from "mobx-react";
// ui
import { Button } from "@keel/propel/button";
// utils
import { cn } from "@keel/utils";

type EmptyStateSize = "sm" | "base" | "lg";

type ButtonConfig = {
  text: string;
  prependIcon?: React.ReactElement;
  appendIcon?: React.ReactElement;
  onClick?: () => void;
  disabled?: boolean;
};

type Props = {
  title: string;
  description?: string;
  assetPath?: string;
  size?: EmptyStateSize;
  primaryButton?: ButtonConfig;
  secondaryButton?: ButtonConfig;
  customPrimaryButton?: React.ReactNode;
  customSecondaryButton?: React.ReactNode;
  className?: string;
};

const sizeClasses = {
  sm: "md:min-w-[24rem] max-w-[45rem]",
  base: "md:min-w-[28rem] max-w-[50rem]",
  lg: "md:min-w-[30rem] max-w-[60rem]",
} as const;

function CustomButton({
  config,
  variant,
  size,
}: {
  config: ButtonConfig;
  variant: "primary" | "secondary";
  size: EmptyStateSize;
}) {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={config.onClick}
      prependIcon={config.prependIcon}
      appendIcon={config.appendIcon}
      disabled={config.disabled}
    >
      {config.text}
    </Button>
  );
}

export const DetailedEmptyState = observer(function DetailedEmptyState(props: Props) {
  const {
    title,
    description,
    size = "lg",
    primaryButton,
    secondaryButton,
    customPrimaryButton,
    customSecondaryButton,
    assetPath,
    className,
  } = props;

  const hasButtons = primaryButton || secondaryButton || customPrimaryButton || customSecondaryButton;

  return (
    <div
      className={cn(
        "flex min-h-full min-w-full items-center justify-center overflow-y-auto px-5 py-10 md:px-20",
        className
      )}
    >
      <div className={cn("flex flex-col gap-5", sizeClasses[size])}>
        <div className="flex shrink-0 flex-col gap-1.5">
          <h3 className={cn("text-18 font-semibold tracking-[-0.015em] text-primary", { "font-medium": !description })}>
            {title}
          </h3>
          {/*
            The description was inheriting body colour, so it read at the same
            weight as the heading it is meant to sit under. An empty state is
            mostly explanation, and explanation that competes with its own title
            is what makes these screens feel like an error rather than a prompt.
          */}
          {description && <p className="text-13 leading-relaxed text-secondary">{description}</p>}
        </div>

        {assetPath && (
          <img
            src={assetPath}
            alt=""
            className="h-auto w-full rounded-xl border border-subtle shadow-raised-100"
            loading="lazy"
          />
        )}

        {hasButtons && (
          // Left, with the text. Centred buttons under left-aligned copy leave
          // the primary action sitting in the middle of nothing.
          <div className="relative flex w-full flex-shrink-0 items-center justify-start gap-2">
            {/* primary button */}
            {customPrimaryButton ??
              (primaryButton?.text && <CustomButton config={primaryButton} variant="primary" size={size} />)}
            {/* secondary button */}
            {customSecondaryButton ??
              (secondaryButton?.text && <CustomButton config={secondaryButton} variant="secondary" size={size} />)}
          </div>
        )}
      </div>
    </div>
  );
});

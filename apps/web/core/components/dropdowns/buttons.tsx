/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import React from "react";
// helpers
import { Button } from "@keel/propel/button";
import { Tooltip } from "@keel/propel/tooltip";
import { cn } from "@keel/utils";
// types
import { usePlatformOS } from "@/hooks/use-platform-os";
import { BACKGROUND_BUTTON_VARIANTS, BORDER_BUTTON_VARIANTS } from "./constants";
import type { TButtonVariants } from "./types";

export type DropdownButtonProps = {
  children: React.ReactNode;
  className?: string;
  isActive: boolean;
  tooltipContent?: string | React.ReactNode | null;
  tooltipHeading: string;
  showTooltip: boolean;
  variant: TButtonVariants;
  renderToolTipByDefault?: boolean;
};

type ButtonProps = {
  children: React.ReactNode;
  className?: string;
  isActive: boolean;
  tooltipContent?: string | React.ReactNode | null;
  tooltipHeading: string;
  showTooltip: boolean;
  renderToolTipByDefault?: boolean;
};

export function DropdownButton(props: DropdownButtonProps) {
  const {
    children,
    className,
    isActive,
    tooltipContent,
    renderToolTipByDefault = true,
    tooltipHeading,
    showTooltip,
    variant,
  } = props;
  const ButtonToRender: React.FC<ButtonProps> = BORDER_BUTTON_VARIANTS.includes(variant)
    ? BorderButton
    : BACKGROUND_BUTTON_VARIANTS.includes(variant)
      ? BackgroundButton
      : TransparentButton;

  return (
    <ButtonToRender
      className={className}
      isActive={isActive}
      tooltipContent={tooltipContent}
      tooltipHeading={tooltipHeading}
      showTooltip={showTooltip}
      renderToolTipByDefault={renderToolTipByDefault}
    >
      {children}
    </ButtonToRender>
  );
}

function BorderButton(props: ButtonProps) {
  const { children, className, isActive, tooltipContent, renderToolTipByDefault, tooltipHeading, showTooltip } = props;
  const { isMobile } = usePlatformOS();

  return (
    <Tooltip
      tooltipHeading={tooltipHeading}
      tooltipContent={<>{tooltipContent}</>}
      disabled={!showTooltip}
      isMobile={isMobile}
      renderByDefault={renderToolTipByDefault}
    >
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "shadow-2xs flex h-7 items-center justify-start gap-1.5 rounded-full border border-subtle/80 bg-surface-1 px-3 py-1 text-12 font-medium text-secondary transition-all duration-150 hover:border-strong hover:bg-surface-2 hover:text-primary",
          {
            "border-accent-primary/50 bg-accent-primary/10 font-semibold text-accent-primary": isActive,
          },
          className
        )}
      >
        {children}
      </Button>
    </Tooltip>
  );
}

function BackgroundButton(props: ButtonProps) {
  const { children, className, tooltipContent, tooltipHeading, renderToolTipByDefault, showTooltip } = props;
  const { isMobile } = usePlatformOS();
  return (
    <Tooltip
      tooltipHeading={tooltipHeading}
      tooltipContent={<>{tooltipContent}</>}
      disabled={!showTooltip}
      isMobile={isMobile}
      renderByDefault={renderToolTipByDefault}
    >
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "hover:bg-surface-3 flex h-7 items-center justify-between gap-1.5 rounded-full border border-subtle/50 bg-surface-2 px-3 py-1 text-12 font-medium text-secondary transition-colors duration-150",
          className
        )}
      >
        {children}
      </Button>
    </Tooltip>
  );
}

function TransparentButton(props: ButtonProps) {
  const { children, className, isActive, tooltipContent, tooltipHeading, renderToolTipByDefault, showTooltip } = props;
  const { isMobile } = usePlatformOS();
  return (
    <Tooltip
      tooltipHeading={tooltipHeading}
      tooltipContent={<>{tooltipContent}</>}
      disabled={!showTooltip}
      isMobile={isMobile}
      renderByDefault={renderToolTipByDefault}
    >
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "flex h-7 items-center justify-between gap-1.5 rounded-full px-2.5 py-1 text-12 font-medium transition-colors duration-150 hover:bg-surface-2",
          {
            "bg-accent-primary/10 font-semibold text-accent-primary": isActive,
          },
          className
        )}
      >
        {children}
      </Button>
    </Tooltip>
  );
}

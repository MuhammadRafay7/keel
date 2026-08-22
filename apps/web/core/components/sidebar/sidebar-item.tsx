/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { forwardRef } from "react";
import Link from "next/link";
import { cn } from "@keel/utils";

// ============================================================================
// TYPES
// ============================================================================

interface AppSidebarItemData {
  href?: string;
  label?: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  showLabel?: boolean;
}

interface AppSidebarItemProps {
  variant?: "link" | "button";
  item?: AppSidebarItemData;
}

interface AppSidebarItemLabelProps {
  highlight?: boolean;
  label?: string;
}

interface AppSidebarItemIconProps {
  icon?: React.ReactNode;
  highlight?: boolean;
}

interface AppSidebarLinkItemProps {
  href?: string;
  children: React.ReactNode;
  className?: string;
}

interface AppSidebarButtonItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

// ============================================================================
// STYLES
// ============================================================================

/*
 * The rail sits at the far left of every screen and is scanned, not read — so
 * the icon tile carries the whole state and the label only confirms it.
 *
 * The previous treatment scaled the tile up on hover. At 34px a 2% scale is
 * under a pixel: too small to register as motion, but enough to resample the
 * icon and make it shimmer. It is replaced by a wash and a colour shift, which
 * are legible at this size, and the tile holds still.
 */
const styles = {
  base: "group flex flex-col gap-1 items-center justify-center text-tertiary transition-smooth focus-ring rounded-xl",
  icon: "relative flex items-center justify-center gap-2 size-8.5 rounded-xl text-tertiary transition-smooth",
  iconActive: "bg-accent-subtle text-accent-primary shadow-raised-100 ring-1 ring-accent-subtle",
  iconInactive: "text-tertiary group-hover:text-primary group-hover:bg-layer-transparent-hover",
  label: "text-11 font-medium leading-none transition-smooth",
  labelActive: "text-accent-primary font-semibold",
  labelInactive: "group-hover:text-primary text-tertiary",
} as const;

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function AppSidebarItemLabel({ highlight = false, label }: AppSidebarItemLabelProps) {
  if (!label) return null;

  return (
    <span
      className={cn(styles.label, {
        [styles.labelActive]: highlight,
        [styles.labelInactive]: !highlight,
      })}
    >
      {label}
    </span>
  );
}

function AppSidebarItemIcon({ icon, highlight }: AppSidebarItemIconProps) {
  if (!icon) return null;

  return (
    <div
      className={cn(styles.icon, {
        [styles.iconActive]: highlight,
        [styles.iconInactive]: !highlight,
      })}
    >
      {icon}
    </div>
  );
}

/*
 * These forward their ref because `Tooltip` anchors by cloning its child and
 * attaching a ref to it. Without forwarding, React logs "Function components
 * cannot be given refs" and the tooltip has nothing to position against — which
 * is exactly what the top navigation's Inbox tooltip was doing.
 */
const AppSidebarLinkItem = forwardRef<HTMLAnchorElement, AppSidebarLinkItemProps>(function AppSidebarLinkItem(
  { href, children, className, ...rest },
  ref
) {
  if (!href) return null;

  return (
    <Link href={href} ref={ref} className={cn(styles.base, className)} {...rest}>
      {children}
    </Link>
  );
});

const AppSidebarButtonItem = forwardRef<HTMLButtonElement, AppSidebarButtonItemProps>(function AppSidebarButtonItem(
  { children, onClick, disabled = false, className, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(styles.base, className)}
      onClick={onClick}
      disabled={disabled}
      type="button"
      {...rest}
    >
      {children}
    </button>
  );
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export type AppSidebarItemComponent = React.FC<AppSidebarItemProps> & {
  Label: React.FC<AppSidebarItemLabelProps>;
  Icon: React.FC<AppSidebarItemIconProps>;
  Link: React.FC<AppSidebarLinkItemProps>;
  Button: React.FC<AppSidebarButtonItemProps>;
};

const AppSidebarItem = forwardRef<HTMLElement, AppSidebarItemProps>(function AppSidebarItem(
  { variant = "link", item, ...rest },
  ref
) {
  if (!item) return null;

  const { icon, isActive, label, href, onClick, disabled, showLabel = true } = item;

  const commonItems = (
    <>
      <AppSidebarItemIcon icon={icon} highlight={isActive} />
      {showLabel && <AppSidebarItemLabel highlight={isActive} label={label} />}
    </>
  );

  if (variant === "link") {
    return (
      <AppSidebarLinkItem href={href} ref={ref as React.Ref<HTMLAnchorElement>} {...rest}>
        {commonItems}
      </AppSidebarLinkItem>
    );
  }

  return (
    <AppSidebarButtonItem onClick={onClick} disabled={disabled} ref={ref as React.Ref<HTMLButtonElement>} {...rest}>
      {commonItems}
    </AppSidebarButtonItem>
  );
});

// ============================================================================
// COMPOUND COMPONENT ASSIGNMENT
// ============================================================================

const AppSidebarItemWithSlots = Object.assign(AppSidebarItem, {
  Label: AppSidebarItemLabel,
  Icon: AppSidebarItemIcon,
  Link: AppSidebarLinkItem,
  Button: AppSidebarButtonItem,
});

export { AppSidebarItemWithSlots as AppSidebarItem };
export type { AppSidebarItemData, AppSidebarItemProps };

/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { Dispatch, ReactElement, SetStateAction } from "react";
import React, { useCallback, useEffect, useState, useRef } from "react";
// helpers
import { usePlatformOS } from "@keel/hooks";
import { cn } from "@keel/utils";

interface ResizableSidebarProps {
  showPeek?: boolean;
  togglePeek: (value?: boolean) => void;
  isCollapsed?: boolean;
  width: number;
  setWidth: Dispatch<SetStateAction<number>>;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  defaultCollapsed?: boolean;
  peekDuration?: number;
  toggleCollapsed: (value?: boolean) => void;
  onWidthChange?: (width: number) => void;
  onCollapsedChange?: (collapsed: boolean) => void;
  className?: string;
  children?: ReactElement;
  extendedSidebar?: ReactElement;
  isAnyExtendedSidebarExpanded?: boolean;
  isAnySidebarDropdownOpen?: boolean;
}

export function ResizableSidebar({
  showPeek = false,
  togglePeek,
  peekDuration = 500,
  isCollapsed = false,
  toggleCollapsed: toggleCollapsedProp,
  onCollapsedChange,
  width,
  setWidth,
  onWidthChange,
  minWidth = 236,
  maxWidth = 350,
  className = "",
  children,
  extendedSidebar,
  isAnyExtendedSidebarExpanded = false,
  isAnySidebarDropdownOpen = false,
}: ResizableSidebarProps) {
  // states
  const [isResizing, setIsResizing] = useState(false);
  const [isHoveringTrigger, setIsHoveringTrigger] = useState(false);
  // refs
  const peekTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const initialWidthRef = useRef<number>(0);
  const initialMouseXRef = useRef<number>(0);
  // hooks
  const { isMobile } = usePlatformOS();
  // handlers
  const setShowPeek = useCallback(
    (value: boolean) => {
      togglePeek(value);
    },
    [togglePeek]
  );

  const handleResize = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaX = e.clientX - initialMouseXRef.current;
      const newWidth = Math.min(Math.max(initialWidthRef.current + deltaX, minWidth), maxWidth);
      setWidth(newWidth);
    },
    [isResizing, minWidth, maxWidth, setWidth]
  );

  const startResizing = useCallback(
    (e: React.MouseEvent) => {
      setIsResizing(true);
      initialWidthRef.current = width;
      initialMouseXRef.current = e.clientX;
    },
    [width]
  );

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const toggleCollapsed = useCallback(() => {
    toggleCollapsedProp();
    setShowPeek(false);
    setIsHoveringTrigger(false);
    if (peekTimeoutRef.current) {
      clearTimeout(peekTimeoutRef.current);
    }
  }, [toggleCollapsedProp, setShowPeek]);

  const handlePeekEnter = useCallback(() => {
    if (isCollapsed && showPeek) {
      if (peekTimeoutRef.current) {
        clearTimeout(peekTimeoutRef.current);
      }
    }
  }, [isCollapsed, showPeek]);

  const handlePeekLeave = useCallback(() => {
    if (isCollapsed && !isAnyExtendedSidebarExpanded && !isAnySidebarDropdownOpen) {
      peekTimeoutRef.current = setTimeout(() => {
        setShowPeek(false);
      }, peekDuration);
    }
  }, [isCollapsed, peekDuration, setShowPeek, isAnyExtendedSidebarExpanded, isAnySidebarDropdownOpen]);

  // Set up event listeners for resizing
  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleResize);
      document.addEventListener("mouseup", stopResizing);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleResize);
      document.removeEventListener("mouseup", stopResizing);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, handleResize, stopResizing]);

  // Clean up timeout on unmount
  useEffect(
    () => () => {
      if (peekTimeoutRef.current) {
        clearTimeout(peekTimeoutRef.current);
      }
    },
    []
  );

  useEffect(() => {
    if (!isAnySidebarDropdownOpen && isCollapsed && isHoveringTrigger) {
      handlePeekLeave();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnySidebarDropdownOpen]);

  useEffect(() => {
    if (!isAnyExtendedSidebarExpanded && isCollapsed && isHoveringTrigger) {
      handlePeekLeave();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnyExtendedSidebarExpanded]);

  // Reset peek when sidebar is expanded
  useEffect(() => {
    if (!isCollapsed) {
      setShowPeek(false);
      setIsHoveringTrigger(false);
      if (peekTimeoutRef.current) {
        clearTimeout(peekTimeoutRef.current);
      }
    }
  }, [isCollapsed, setShowPeek]);

  // Call external handlers when state changes
  useEffect(() => {
    onWidthChange?.(width);
  }, [width, onWidthChange]);

  useEffect(() => {
    onCollapsedChange?.(isCollapsed);
  }, [isCollapsed, onCollapsedChange]);

  const handleTriggerEnter = useCallback(() => {
    if (!isCollapsed) return;
    setIsHoveringTrigger(true);
    setShowPeek(true);
    if (peekTimeoutRef.current) clearTimeout(peekTimeoutRef.current);
  }, [isCollapsed, setShowPeek]);

  return (
    <>
      {/*
        The hover target that opens the peek panel.

        Everything else the peek needs already existed — the panel, the open and
        close timers, the "stay open while a dropdown is open" guards — but
        nothing ever set `showPeek` to true, so a collapsed sidebar could only
        be reopened by clicking the toggle. This is the missing trigger: a strip
        along the window's leading edge, invisible and only present while the
        sidebar is collapsed.

        It is 12px rather than 1–2px because this is a "throw the pointer at the
        edge" gesture; a hairline target turns it into aiming. It sits under the
        sidebar's own z-index so it can never intercept clicks meant for the
        panel it opens.
      */}
      {isCollapsed && (
        <div
          className="absolute inset-y-0 left-0 z-10 w-3"
          onMouseEnter={handleTriggerEnter}
          aria-hidden="true"
          data-testid="sidebar-peek-trigger"
        />
      )}
      {/* Main Sidebar */}
      <div
        id="main-sidebar"
        className={cn(
          "z-20 h-full border-r border-subtle bg-surface-1",
          !isResizing && "transition-[width,min-width,max-width,transform,opacity] duration-300 ease-smooth",
          isCollapsed ? "w-0 translate-x-[-100%] opacity-0" : "translate-x-0 opacity-100",
          isMobile && "absolute",
          className
        )}
        style={{
          width: `${isCollapsed ? 0 : width}px`,
          minWidth: `${isCollapsed ? 0 : width}px`,
          maxWidth: `${isCollapsed ? 0 : width}px`,
        }}
        role="complementary"
        aria-label="Main sidebar"
        data-prevent-outside-click={isMobile}
      >
        <aside
          className={cn(
            "group/sidebar relative flex h-full w-full flex-col overflow-hidden rounded-none border-y-0 border-l-0 glass-panel pt-3",
            isAnyExtendedSidebarExpanded && "rounded-none"
          )}
        >
          {children}

          {/*
            Resize handle.

            The hit area is 8px wide and invisible; the line the user sees is
            2px and painted by the ::after. Splitting the two is what makes a
            resize edge feel accurate — a 2px target is genuinely hard to grab,
            but an 8px visible bar looks like a piece of chrome nobody asked
            for. It only lights up once the pointer is on it, or while dragging.
          */}
          <div
            className={cn(
              "group/resize absolute top-0 right-0 z-[20] h-full w-2 translate-x-1/2 cursor-ew-resize",
              "after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] after:-translate-x-1/2",
              "after:rounded-full after:bg-accent-primary after:transition-smooth",
              isResizing ? "after:opacity-100" : "after:opacity-0 hover:after:opacity-100"
            )}
            // onDoubleClick toggle sidebar
            onDoubleClick={() => toggleCollapsed()}
            onMouseDown={(e) => startResizing(e)}
            role="separator"
            aria-label="Resize sidebar"
          />
        </aside>
      </div>
      {/* Peek View */}
      <div
        className={cn(
          // The peek panel floats over the content, so it casts sideways rather
          // than carrying a flat all-round shadow that reads as a seam.
          "absolute left-0 z-20 h-full bg-surface-1 shadow-direction-right",
          !isResizing && "transition-[width,transform,opacity] duration-300 ease-smooth",
          isCollapsed && showPeek ? "translate-x-0 opacity-100" : "translate-x-[-100%] opacity-0",
          "pointer-events-none",
          isCollapsed && showPeek && "pointer-events-auto",
          !showPeek ? "w-0" : "w-full"
        )}
        style={{
          width: `${width}px`,
        }}
        onMouseEnter={handlePeekEnter}
        onMouseLeave={handlePeekLeave}
        role="complementary"
        aria-label="Sidebar peek view"
      >
        <aside
          className={cn(
            "group/sidebar relative z-20 flex h-full w-full flex-col overflow-hidden bg-surface-1 pt-4",
            "self-center rounded-md rounded-tl-none rounded-bl-none border-r border-subtle",
            isAnyExtendedSidebarExpanded && "rounded-none"
          )}
        >
          {children}
          {/* Resize handle — see the note on the main sidebar's handle above. */}
          <div
            className={cn(
              "group/resize absolute top-0 right-0 z-[20] h-full w-2 translate-x-1/2 cursor-ew-resize",
              "after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] after:-translate-x-1/2",
              "after:rounded-full after:bg-accent-primary after:transition-smooth",
              isResizing ? "after:opacity-100" : "after:opacity-0 hover:after:opacity-100"
            )}
            // onDoubleClick toggle sidebar
            onDoubleClick={() => toggleCollapsed()}
            onMouseDown={(e) => startResizing(e)}
            role="separator"
            aria-label="Resize sidebar"
          />
        </aside>
      </div>

      {/* Extended Sidebar */}
      {extendedSidebar}
    </>
  );
}

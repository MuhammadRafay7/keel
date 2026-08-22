/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
import { useTranslation } from "@keel/i18n";
import type { IBaseLayoutsKanbanItem, IBaseLayoutsKanbanGroupProps } from "@keel/types";
import { cn } from "@keel/utils";
import { useGroupDropTarget } from "../hooks/use-group-drop-target";
import { GroupHeader } from "./group-header";
import { BaseKanbanItem } from "./item";

export const BaseKanbanGroup = observer(function BaseKanbanGroup<T extends IBaseLayoutsKanbanItem>(
  props: IBaseLayoutsKanbanGroupProps<T>
) {
  const {
    group,
    itemIds,
    items,
    renderItem,
    renderGroupHeader,
    isCollapsed,
    onToggleGroup,
    enableDragDrop = false,
    onDrop,
    canDrag,
    groupClassName,
    loadMoreItems: _loadMoreItems,
  } = props;

  const { t } = useTranslation();
  const { groupRef, isDraggingOver } = useGroupDropTarget({
    groupId: group.id,
    enableDragDrop,
    onDrop,
  });

  if (isCollapsed) {
    return (
      <div
        ref={groupRef}
        onClick={() => onToggleGroup(group.id)}
        className={cn(
          "bg-sky-500/10 dark:bg-sky-500/20 hover:bg-sky-500/20 relative flex h-full w-12 flex-shrink-0 cursor-pointer flex-col items-center justify-between rounded-2xl border border-subtle p-2.5 py-4 transition-all duration-200 select-none",
          {
            "bg-sky-500/25 border-accent-strong": isDraggingOver,
          },
          groupClassName
        )}
      >
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            className="bg-sky-500 shadow-xs flex h-7 w-7 items-center justify-center rounded-full text-12 font-semibold text-white"
          >
            {itemIds.length}
          </button>
          <div className="writing-mode-vertical text-sky-600 dark:text-sky-400 flex rotate-180 items-center gap-2 text-12 font-bold tracking-wide uppercase [writing-mode:vertical-lr]">
            <span>{group.name}</span>
          </div>
        </div>

        {isDraggingOver && enableDragDrop && (
          <div className="bg-sky-500/30 text-sky-700 dark:text-sky-300 absolute inset-0 z-[2] flex items-center justify-center rounded-2xl text-11 font-semibold">
            ↓
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={groupRef}
      className={cn(
        "shadow-xs relative flex max-h-full w-[350px] flex-shrink-0 flex-col overflow-y-auto rounded-2xl border border-subtle/60 bg-surface-1/40 p-2.5 pt-1 transition-all duration-200 dark:bg-surface-2/40",
        {
          "border-accent-subtle bg-layer-1": isDraggingOver,
        },
        groupClassName
      )}
    >
      {/* Group Header */}
      <div className="sticky top-0 z-[2] w-full flex-shrink-0 cursor-pointer px-1 py-2">
        {renderGroupHeader ? (
          renderGroupHeader({ group, itemCount: itemIds.length, isCollapsed, onToggleGroup })
        ) : (
          <GroupHeader
            group={group}
            itemCount={itemIds.length}
            isCollapsed={isCollapsed}
            onToggleGroup={onToggleGroup}
          />
        )}
      </div>

      {/* Group Items */}
      {!isCollapsed && (
        <div className="flex flex-col gap-2 py-2">
          {itemIds.map((itemId, index) => {
            const item = items[itemId];
            if (!item) return null;

            return (
              <BaseKanbanItem
                key={itemId}
                item={item}
                index={index}
                groupId={group.id}
                renderItem={renderItem}
                enableDragDrop={enableDragDrop}
                canDrag={canDrag}
                onDrop={onDrop}
                isLast={index === itemIds.length - 1}
              />
            );
          })}

          {itemIds.length === 0 && (
            <div className="flex items-center justify-center py-8 text-13 text-tertiary">
              {t("common.no_items_in_this_group")}
            </div>
          )}
        </div>
      )}

      {isDraggingOver && enableDragDrop && (
        <div className="absolute top-0 left-0 z-[2] flex h-full w-full items-center justify-center rounded-sm border-[1px] border-strong bg-layer-1/85 text-13 font-medium text-tertiary">
          <div className="my-8 flex flex-col items-center rounded-sm p-3 text-secondary">
            {t("common.drop_here_to_move")}
          </div>
        </div>
      )}
    </div>
  );
});

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LayoutGrid, Star, Clock, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import * as platformRepository from "../../data/repositories/platformRepository";
import { queryKeys } from "../../state/queryKeys";
import { useUiStore } from "../../state/uiStore";
import type { NavType, Platform } from "../../domain/types";

interface QuickEntry {
  navType: NavType;
  label: string;
  icon: React.ReactNode;
}

const quickEntries: QuickEntry[] = [
  { navType: "all", label: "全部命令", icon: <LayoutGrid size={16} /> },
  { navType: "favorites", label: "收藏", icon: <Star size={16} /> },
  { navType: "recent", label: "最近使用", icon: <Clock size={16} /> },
];

interface SortablePlatformItemProps {
  platform: Platform;
  isActive: boolean;
  onSelect: () => void;
}

function SortablePlatformItem({
  platform,
  isActive,
  onSelect,
}: SortablePlatformItemProps) {
  const [hovered, setHovered] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: platform.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: isActive
      ? "var(--color-accent-soft)"
      : "transparent",
    color: isActive
      ? "var(--color-accent)"
      : "var(--color-text-secondary)",
    fontWeight: isActive ? 500 : 400,
    border: "none",
    cursor: "pointer",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm w-full text-left transition-colors"
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      {...attributes}
    >
      {/* Drag handle - only this triggers drag */}
      <span
        className="shrink-0 cursor-grab active:cursor-grabbing"
        style={{
          color: "var(--color-text-placeholder)",
          display: "flex",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.15s",
        }}
        {...listeners}
      >
        <GripVertical size={14} />
      </span>
      <span
        className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
        style={{ backgroundColor: platform.color }}
      />
      <span className="flex-1 truncate">{platform.name}</span>
      <span
        className="text-xs shrink-0"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        {platform.commandCount}
      </span>
    </div>
  );
}

export function Sidebar() {
  const navType = useUiStore((s) => s.navType);
  const currentPlatformId = useUiStore((s) => s.currentPlatformId);
  const setNavType = useUiStore((s) => s.setNavType);
  const setCurrentPlatform = useUiStore((s) => s.setCurrentPlatform);
  const queryClient = useQueryClient();

  const { data: platforms } = useQuery({
    queryKey: queryKeys.platforms,
    queryFn: platformRepository.listPlatforms,
  });

  const platformIds = platforms?.map((p) => p.id) ?? [];

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !platforms) return;

    const oldIndex = platforms.findIndex((p) => p.id === active.id);
    const newIndex = platforms.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(platforms, oldIndex, newIndex);

    // Optimistic update
    queryClient.setQueryData(queryKeys.platforms, reordered);

    // Persist to DB
    await platformRepository.updatePlatformSortOrder(
      reordered.map((p) => p.id)
    );
    await queryClient.invalidateQueries({ queryKey: queryKeys.platforms });
  }

  return (
    <aside
      className="flex flex-col border-r shrink-0 overflow-y-auto"
      style={{
        width: "220px",
        backgroundColor: "var(--color-bg-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      {/* Quick Access */}
      <div className="p-3">
        <h2
          className="text-xs font-medium uppercase tracking-wider mb-2 px-2"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          快捷入口
        </h2>
        <nav className="flex flex-col gap-0.5">
          {quickEntries.map((entry) => {
            const isActive = navType === entry.navType && currentPlatformId === null;
            return (
              <button
                key={entry.navType}
                onClick={() => setNavType(entry.navType)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm w-full text-left transition-colors"
                style={{
                  backgroundColor: isActive
                    ? "var(--color-accent-soft)"
                    : "transparent",
                  color: isActive
                    ? "var(--color-accent)"
                    : "var(--color-text-secondary)",
                  fontWeight: isActive ? 500 : 400,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {entry.icon}
                <span>{entry.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Divider */}
      <div
        className="mx-3 border-t"
        style={{ borderColor: "var(--color-border)" }}
      />

      {/* Platform List */}
      <div className="p-3 flex-1">
        <h2
          className="text-xs font-medium uppercase tracking-wider mb-2 px-2"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          平台
        </h2>
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={platformIds}
            strategy={verticalListSortingStrategy}
          >
            <nav className="flex flex-col gap-0.5">
              {platforms?.map((platform) => (
                <SortablePlatformItem
                  key={platform.id}
                  platform={platform}
                  isActive={
                    navType === "platform" &&
                    currentPlatformId === platform.id
                  }
                  onSelect={() => setCurrentPlatform(platform.id)}
                />
              ))}
            </nav>
          </SortableContext>
        </DndContext>
      </div>
    </aside>
  );
}

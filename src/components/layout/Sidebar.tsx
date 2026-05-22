import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LayoutGrid, Star, Clock, GripVertical, Plus } from "lucide-react";
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
import { PlatformContextMenu } from "../platform/PlatformContextMenu";
import { InputDialog } from "../common/InputDialog";
import { toast } from "../common/Toast";
import * as platformRepository from "../../data/repositories/platformRepository";
import { queryKeys } from "../../state/queryKeys";
import { useUiStore } from "../../state/uiStore";
import type { NavType, Platform } from "../../domain/types";

interface QuickEntry {
  navType: NavType;
  labelKey: string;
  icon: React.ReactNode;
}

const quickEntries: QuickEntry[] = [
  { navType: "all", labelKey: "nav.allCommands", icon: <LayoutGrid size={16} /> },
  { navType: "favorites", labelKey: "nav.favorites", icon: <Star size={16} /> },
  { navType: "recent", labelKey: "nav.recent", icon: <Clock size={16} /> },
];

interface SortablePlatformItemProps {
  platform: Platform;
  isActive: boolean;
  isRenaming: boolean;
  onSelect: () => void;
  onStartRename: () => void;
  onHide: () => void;
  onDelete: () => void;
}

function SortablePlatformItem({
  platform,
  isActive,
  isRenaming,
  onSelect,
  onStartRename,
  onHide,
  onDelete,
}: SortablePlatformItemProps) {
  const [hovered, setHovered] = useState(false);
  const [renameValue, setRenameValue] = useState(platform.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const setPlatformRenameId = useUiStore((s) => s.setPlatformRenameId);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: platform.id });

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const commitRename = useCallback(async () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== platform.name) {
      await platformRepository.renamePlatform(platform.id, trimmed);
      await queryClient.invalidateQueries({ queryKey: queryKeys.platforms });
    }
    setPlatformRenameId(null);
  }, [renameValue, platform.id, platform.name, queryClient, setPlatformRenameId]);

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
    <PlatformContextMenu
      onRename={onStartRename}
      onHide={onHide}
      onDelete={onDelete}
      canDelete={platform.commandCount === 0}
    >
      <div
        ref={setNodeRef}
        style={style}
        className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm w-full text-left transition-colors"
        onClick={isRenaming ? undefined : onSelect}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        {...attributes}
      >
        {/* Drag handle */}
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
        {isRenaming ? (
          <input
            ref={inputRef}
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") setPlatformRenameId(null);
            }}
            className="flex-1 text-sm outline-none min-w-0"
            style={{
              border: "1px solid var(--color-accent)",
              borderRadius: "var(--radius-sm)",
              padding: "1px 4px",
              backgroundColor: "var(--color-bg-surface)",
              color: "var(--color-text-primary)",
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1 truncate">{platform.name}</span>
        )}
        <span
          className="text-xs shrink-0"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          {platform.commandCount}
        </span>
      </div>
    </PlatformContextMenu>
  );
}

export function Sidebar() {
  const { t } = useTranslation();
  const navType = useUiStore((s) => s.navType);
  const currentPlatformId = useUiStore((s) => s.currentPlatformId);
  const setNavType = useUiStore((s) => s.setNavType);
  const setCurrentPlatform = useUiStore((s) => s.setCurrentPlatform);
  const platformRenameId = useUiStore((s) => s.platformRenameId);
  const setPlatformRenameId = useUiStore((s) => s.setPlatformRenameId);
  const queryClient = useQueryClient();

  const [isAdding, setIsAdding] = useState(false);

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

    queryClient.setQueryData(queryKeys.platforms, reordered);
    await platformRepository.updatePlatformSortOrder(
      reordered.map((p) => p.id)
    );
    await queryClient.invalidateQueries({ queryKey: queryKeys.platforms });
  }

  async function handleHide(id: string) {
    await platformRepository.hidePlatform(id);
    await queryClient.invalidateQueries({ queryKey: queryKeys.platforms });
    if (currentPlatformId === id) {
      setNavType("all");
    }
  }

  async function handleDelete(id: string) {
    const count = await platformRepository.getPlatformCommandCount(id);
    if (count > 0) {
      toast(t("platform.deleteBlocked"), "error");
      return;
    }
    try {
      await platformRepository.deletePlatform(id);
      await queryClient.invalidateQueries({ queryKey: queryKeys.platforms });
      if (currentPlatformId === id) {
        setNavType("all");
      }
    } catch {
      toast(t("platform.deleteFailed"), "error");
    }
  }

  async function handleAddPlatform(name: string) {
    await platformRepository.createPlatform(name);
    await queryClient.invalidateQueries({ queryKey: queryKeys.platforms });
    setIsAdding(false);
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
          {t("nav.quickAccess")}
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
                <span>{t(entry.labelKey)}</span>
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
          {t("nav.platforms")}
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
                  isRenaming={platformRenameId === platform.id}
                  onSelect={() => setCurrentPlatform(platform.id)}
                  onStartRename={() => setPlatformRenameId(platform.id)}
                  onHide={() => handleHide(platform.id)}
                  onDelete={() => handleDelete(platform.id)}
                />
              ))}
            </nav>
          </SortableContext>
        </DndContext>

        {/* Add platform */}
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 mt-1 px-2 py-1 rounded-md text-xs w-full text-left transition-colors cursor-pointer"
          style={{
            color: "var(--color-text-tertiary)",
            background: "none",
            border: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--color-accent)";
            e.currentTarget.style.backgroundColor = "var(--color-bg-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--color-text-tertiary)";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <Plus size={14} />
          <span>{t("platform.add")}</span>
        </button>
      </div>

      <InputDialog
        open={isAdding}
        title={t("platform.add")}
        placeholder={t("platform.addPlaceholder")}
        onConfirm={handleAddPlatform}
        onCancel={() => setIsAdding(false)}
      />
    </aside>
  );
}

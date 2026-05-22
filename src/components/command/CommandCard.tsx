import { useQueryClient } from "@tanstack/react-query";
import { Star, Edit, Trash } from "lucide-react";
import { CommandCodeBlock } from "./CommandCodeBlock";
import { Button } from "../common/Button";
import { IconButton } from "../common/IconButton";
import { MoreMenu } from "../common/MoreMenu";
import { toast } from "../common/Toast";
import * as commandRepository from "../../data/repositories/commandRepository";
import { useUiStore } from "../../state/uiStore";
import type { Command } from "../../domain/types";

interface CommandCardProps {
  command: Command;
  isSelected?: boolean;
}

export function CommandCard({ command, isSelected = false }: CommandCardProps) {
  const queryClient = useQueryClient();
  const openEditCommandModal = useUiStore((s) => s.openEditCommandModal);
  const openDeleteConfirm = useUiStore((s) => s.openDeleteConfirm);

  async function handleCopy() {
    try {
      const { writeText } = await import("@tauri-apps/plugin-clipboard-manager");
      await writeText(command.command);
      await commandRepository.recordCommandCopied(command.id);
      toast("已复制", "success");
      await queryClient.invalidateQueries();
    } catch {
      toast("复制失败", "error");
    }
  }

  async function handleToggleFavorite() {
    try {
      await commandRepository.toggleFavorite(command.id);
      await queryClient.invalidateQueries();
    } catch {
      toast("操作失败", "error");
    }
  }

  const metaParts = [
    command.platformName,
    command.categoryName,
    ...command.tags,
  ].filter(Boolean);

  return (
    <div
      className="rounded-lg transition-colors"
      style={{
        backgroundColor: "var(--color-bg-surface)",
        border: isSelected
          ? "1px solid var(--color-accent)"
          : "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "16px",
        boxShadow: isSelected ? "0 0 0 2px var(--color-accent-soft)" : "none",
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = "var(--color-border-strong)";
          e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = "var(--color-border)";
          e.currentTarget.style.boxShadow = "none";
        }
      }}
    >
      {/* Header: title + actions */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3
          className="text-sm font-semibold leading-snug"
          style={{ color: "var(--color-text-primary)" }}
        >
          {command.title}
        </h3>
        <div className="flex items-center gap-1 shrink-0">
          <IconButton
            icon={
              command.isFavorite ? (
                <Star size={16} fill="currentColor" />
              ) : (
                <Star size={16} />
              )
            }
            tooltip={command.isFavorite ? "取消收藏" : "收藏"}
            active={command.isFavorite}
            onClick={handleToggleFavorite}
          />
          <MoreMenu
            items={[
              {
                id: "edit",
                label: "编辑",
                icon: <Edit size={14} />,
                onClick: () => openEditCommandModal(command.id),
              },
              {
                id: "delete",
                label: "删除",
                icon: <Trash size={14} />,
                danger: true,
                onClick: () => openDeleteConfirm(command.id),
              },
            ]}
          />
        </div>
      </div>

      {/* Code block */}
      <div className="mb-2">
        <CommandCodeBlock code={command.command} maxLines={2} />
      </div>

      {/* Description */}
      {command.description && (
        <p
          className="text-xs leading-relaxed mb-2"
          style={{
            color: "var(--color-text-secondary)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {command.description}
        </p>
      )}

      {/* Footer: meta + copy */}
      <div className="flex items-center justify-between gap-2">
        <span
          className="text-xs truncate"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          {metaParts.join(" · ")}
        </span>
        <Button variant="primary" size="sm" onClick={handleCopy}>
          复制
        </Button>
      </div>
    </div>
  );
}

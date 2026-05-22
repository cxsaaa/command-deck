import { useTranslation } from "react-i18next";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

interface CategoryContextMenuProps {
  children: React.ReactNode;
  onRename: () => void;
  onDelete: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  canMoveLeft: boolean;
  canMoveRight: boolean;
}

export function CategoryContextMenu({
  children,
  onRename,
  onDelete,
  onMoveLeft,
  onMoveRight,
  canMoveLeft,
  canMoveRight,
}: CategoryContextMenuProps) {
  const { t } = useTranslation();

  const menuItemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 8px",
    borderRadius: "var(--radius-sm)",
    fontSize: "13px",
    cursor: "pointer",
    outline: "none",
    color: "var(--color-text-secondary)",
    background: "none",
    border: "none",
    width: "100%",
  };

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content
          className="min-w-[160px] rounded-lg p-1 shadow-lg z-50"
          style={{
            backgroundColor: "var(--color-bg-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <ContextMenu.Item
            style={menuItemStyle}
            onSelect={onRename}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--color-bg-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <Pencil size={14} />
            <span>{t("category.rename")}</span>
          </ContextMenu.Item>
          <ContextMenu.Item
            style={{
              ...menuItemStyle,
              opacity: canMoveLeft ? 1 : 0.4,
            }}
            onSelect={canMoveLeft ? onMoveLeft : undefined}
            disabled={!canMoveLeft}
            onMouseEnter={(e) => {
              if (canMoveLeft) e.currentTarget.style.backgroundColor = "var(--color-bg-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <ChevronLeft size={14} />
            <span>{t("category.moveLeft")}</span>
          </ContextMenu.Item>
          <ContextMenu.Item
            style={{
              ...menuItemStyle,
              opacity: canMoveRight ? 1 : 0.4,
            }}
            onSelect={canMoveRight ? onMoveRight : undefined}
            disabled={!canMoveRight}
            onMouseEnter={(e) => {
              if (canMoveRight) e.currentTarget.style.backgroundColor = "var(--color-bg-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <ChevronRight size={14} />
            <span>{t("category.moveRight")}</span>
          </ContextMenu.Item>
          <ContextMenu.Separator
            className="my-1"
            style={{ borderTop: "1px solid var(--color-border)" }}
          />
          <ContextMenu.Item
            style={{
              ...menuItemStyle,
              color: "var(--color-state-danger)",
            }}
            onSelect={onDelete}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--color-state-danger-soft)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <Trash2 size={14} />
            <span>{t("category.delete")}</span>
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}

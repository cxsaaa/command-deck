import { useTranslation } from "react-i18next";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { Pencil, EyeOff, Trash2 } from "lucide-react";

interface PlatformContextMenuProps {
  children: React.ReactNode;
  onRename: () => void;
  onHide: () => void;
  onDelete: () => void;
  canDelete: boolean;
}

export function PlatformContextMenu({
  children,
  onRename,
  onHide,
  onDelete,
  canDelete,
}: PlatformContextMenuProps) {
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
            <span>{t("command.edit")}</span>
          </ContextMenu.Item>
          <ContextMenu.Item
            style={menuItemStyle}
            onSelect={onHide}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--color-bg-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <EyeOff size={14} />
            <span>{t("platform.hide")}</span>
          </ContextMenu.Item>
          <ContextMenu.Separator
            className="my-1"
            style={{ borderTop: "1px solid var(--color-border)" }}
          />
          <ContextMenu.Item
            style={{
              ...menuItemStyle,
              color: canDelete ? "var(--color-state-danger)" : "var(--color-text-placeholder)",
            }}
            onSelect={canDelete ? onDelete : undefined}
            disabled={!canDelete}
            onMouseEnter={(e) => {
              if (canDelete) {
                e.currentTarget.style.backgroundColor = "var(--color-state-danger-soft)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <Trash2 size={14} />
            <span>{t("command.delete")}</span>
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}

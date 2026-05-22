import { type ReactNode } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { IconButton } from "./IconButton";

interface MenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  danger?: boolean;
  onClick: () => void;
}

interface MoreMenuProps {
  items: MenuItem[];
  trigger?: ReactNode;
}

export function MoreMenu({ items, trigger }: MoreMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        {trigger ?? (
          <IconButton
            icon={<MoreHorizontal size={16} />}
            tooltip="More actions"
          />
        )}
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={4}
          align="end"
          style={{
            minWidth: "160px",
            backgroundColor: "var(--color-bg-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-1)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            zIndex: 60,
          }}
        >
          {items.map((item) => (
            <DropdownMenu.Item
              key={item.id}
              onSelect={() => item.onClick()}
              className="flex items-center gap-2 text-sm outline-none select-none transition-colors"
              style={{
                padding: "6px 8px",
                borderRadius: "var(--radius-sm)",
                color: item.danger
                  ? "var(--color-state-danger)"
                  : "var(--color-text-primary)",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = item.danger
                  ? "var(--color-state-danger-soft)"
                  : "var(--color-bg-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              {item.icon && (
                <span
                  className="flex-shrink-0"
                  style={{
                    color: item.danger
                      ? "var(--color-state-danger)"
                      : "var(--color-text-tertiary)",
                  }}
                >
                  {item.icon}
                </span>
              )}
              {item.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

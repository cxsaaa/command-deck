import { type ReactNode } from "react";

interface IconButtonProps {
  icon: ReactNode;
  onClick?: () => void;
  tooltip?: string;
  active?: boolean;
  danger?: boolean;
  className?: string;
}

export function IconButton({
  icon,
  onClick,
  tooltip,
  active = false,
  danger = false,
  className = "",
}: IconButtonProps) {
  const baseColor = danger
    ? "var(--color-state-danger)"
    : active
      ? "var(--color-accent)"
      : "var(--color-text-tertiary)";

  const hoverBg = danger
    ? "var(--color-state-danger-soft)"
    : "var(--color-bg-hover)";

  const hoverColor = danger
    ? "var(--color-state-danger)"
    : "var(--color-text-primary)";

  return (
    <button
      type="button"
      onClick={onClick}
      title={tooltip}
      className={`inline-flex items-center justify-center transition-colors select-none ${className}`}
      style={{
        width: "24px",
        height: "24px",
        borderRadius: "var(--radius-sm)",
        backgroundColor: "transparent",
        color: active ? "var(--color-accent)" : baseColor,
        border: "none",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = hoverBg;
        if (!active) e.currentTarget.style.color = hoverColor;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
        e.currentTarget.style.color = active ? "var(--color-accent)" : baseColor;
      }}
    >
      {icon}
    </button>
  );
}

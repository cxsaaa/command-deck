import { type ReactNode } from "react";

interface ButtonProps {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md";
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const variantClasses: Record<string, string> = {
  primary:
    "bg-[var(--color-accent)] text-[var(--color-text-inverse)] hover:bg-[var(--color-accent-hover)] border-none",
  secondary:
    "bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-bg-hover)]",
  danger:
    "bg-[var(--color-state-danger)] text-white hover:bg-[#B91C1C] border-none",
};

const sizeClasses: Record<string, string> = {
  sm: "h-7 px-2.5 text-[13px]",
  md: "h-[34px] px-3.5 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  onClick,
  disabled = false,
  className = "",
}: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 font-medium rounded-[var(--radius-md)] transition-colors select-none ${
        variantClasses[variant]
      } ${sizeClasses[size]} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${className}`}
    >
      {children}
    </button>
  );
}

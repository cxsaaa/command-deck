import { type ReactNode } from "react";
import { Button } from "./Button";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  icon?: ReactNode;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center"
      style={{
        maxWidth: "360px",
        margin: "0 auto",
        padding: "var(--space-10) var(--space-4)",
      }}
    >
      {icon && (
        <div
          className="mb-4"
          style={{ color: "var(--color-text-placeholder)" }}
        >
          {icon}
        </div>
      )}

      <h3
        className="text-base font-medium mb-1"
        style={{ color: "var(--color-text-primary)" }}
      >
        {title}
      </h3>

      {description && (
        <p
          className="text-sm mb-4"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          {description}
        </p>
      )}

      {action && (
        <Button variant="primary" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

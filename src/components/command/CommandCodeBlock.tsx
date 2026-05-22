import { highlightText } from "../../domain/highlight";

interface CommandCodeBlockProps {
  code: string;
  maxLines?: number;
  searchQuery?: string;
}

export function CommandCodeBlock({ code, maxLines = 2, searchQuery }: CommandCodeBlockProps) {
  const lines = code.split("\n");
  const displayCode =
    lines.length > maxLines
      ? lines.slice(0, maxLines).join("\n") + "\n..."
      : code;

  return (
    <div
      style={{
        fontFamily: "'SF Mono', Menlo, Monaco, Consolas, monospace",
        fontSize: "12px",
        lineHeight: "var(--density-code-line-height)",
        backgroundColor: "var(--color-bg-subtle)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-sm)",
        padding: "6px 10px",
        overflowX: "auto",
        whiteSpace: "pre",
        color: "var(--color-text-primary)",
      }}
    >
      {searchQuery ? highlightText(displayCode, searchQuery) : displayCode}
    </div>
  );
}

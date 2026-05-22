interface CommandCodeBlockProps {
  code: string;
  maxLines?: number;
}

export function CommandCodeBlock({ code, maxLines = 2 }: CommandCodeBlockProps) {
  const lines = code.split("\n");
  const displayCode =
    lines.length > maxLines
      ? lines.slice(0, maxLines).join("\n") + "\n..."
      : code;

  return (
    <div
      style={{
        fontFamily: "'SF Mono', Menlo, Monaco, Consolas, monospace",
        fontSize: "13px",
        lineHeight: "1.5",
        backgroundColor: "var(--color-bg-subtle)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        padding: "10px 12px",
        overflowX: "auto",
        whiteSpace: "pre",
        color: "var(--color-text-primary)",
      }}
    >
      {displayCode}
    </div>
  );
}

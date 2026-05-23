import { useMemo, useRef, useCallback, type KeyboardEvent } from "react";
import { highlightText } from "../../domain/highlight";
import {
  parsePlaceholders,
  hasPlaceholders,
} from "../../domain/placeholders";

interface CommandCodeBlockProps {
  code: string;
  maxLines?: number;
  searchQuery?: string;
  /** Enable interactive placeholder inputs */
  interactive?: boolean;
  /** Current variable values (keyed by variable name) */
  variableValues?: Record<string, string>;
  /** Called when a variable value changes */
  onVariableChange?: (name: string, value: string) => void;
}

export function CommandCodeBlock({
  code,
  maxLines = 2,
  searchQuery,
  interactive = false,
  variableValues,
  onVariableChange,
}: CommandCodeBlockProps) {
  const lines = code.split("\n");
  const displayCode =
    lines.length > maxLines
      ? lines.slice(0, maxLines).join("\n") + "\n..."
      : code;

  const segments = useMemo(
    () => (interactive ? parsePlaceholders(displayCode) : null),
    [interactive, displayCode]
  );

  const hasVars = interactive && segments && hasPlaceholders(displayCode);

  // Collect placeholder input refs for Tab navigation
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>, currentIndex: number) => {
      if (!segments) return;
      const placeholders = segments.filter((s) => s.type === "placeholder");
      if (e.key === "Tab" && !e.shiftKey) {
        e.preventDefault();
        const next = placeholders[currentIndex + 1];
        if (next?.name) {
          inputRefs.current.get(next.name)?.focus();
        }
      } else if (e.key === "Tab" && e.shiftKey) {
        e.preventDefault();
        const prev = placeholders[currentIndex - 1];
        if (prev?.name) {
          inputRefs.current.get(prev.name)?.focus();
        }
      }
    },
    [segments]
  );

  // Pure text mode (no interactive placeholders or interactive=false)
  if (!hasVars) {
    return (
      <div style={codeBlockStyle}>
        {searchQuery
          ? highlightText(displayCode, searchQuery)
          : displayCode}
      </div>
    );
  }

  // Interactive mode: render text + inline inputs
  let placeholderIndex = 0;
  return (
    <div style={codeBlockStyle}>
      {segments!.map((seg, i) => {
        if (seg.type === "text") {
          return searchQuery ? (
            <span key={i}>{highlightText(seg.value, searchQuery)}</span>
          ) : (
            <span key={i}>{seg.value}</span>
          );
        }

        // Placeholder → inline input
        const name = seg.name!;
        const idx = placeholderIndex++;
        const value = variableValues?.[name] ?? "";

        return (
          <input
            key={`${i}-${name}`}
            ref={(el) => {
              if (el) inputRefs.current.set(name, el);
              else inputRefs.current.delete(name);
            }}
            type="text"
            value={value}
            placeholder={name}
            onChange={(e) => onVariableChange?.(name, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            style={{
              ...placeholderInputStyle,
              width: `${Math.max(name.length * 0.6, 3)}em`,
            }}
          />
        );
      })}
    </div>
  );
}

const codeBlockStyle: React.CSSProperties = {
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
};

const placeholderInputStyle: React.CSSProperties = {
  display: "inline-block",
  height: "1.4em",
  padding: "0 4px",
  border: "1px solid var(--placeholder-input-border)",
  borderRadius: "3px",
  backgroundColor: "var(--placeholder-input-bg)",
  color: "var(--placeholder-input-text)",
  fontFamily: "inherit",
  fontSize: "inherit",
  lineHeight: "inherit",
  outline: "none",
  verticalAlign: "baseline",
  minWidth: "2em",
  maxWidth: "60%",
  boxSizing: "content-box",
};

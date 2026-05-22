import { type ReactNode, createElement } from "react";

/**
 * Splits `text` by case-insensitive occurrences of `query`,
 * wrapping matched segments in <mark> elements.
 */
export function highlightText(text: string, query: string): ReactNode[] {
  if (!query.trim()) return [text];

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);

  if (parts.length === 1) return [text];

  return parts.map((part, i) => {
    if (part.toLowerCase() === query.toLowerCase()) {
      return createElement("mark", { key: i }, part);
    }
    return part;
  });
}

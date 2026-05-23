/**
 * Placeholder parsing for dynamic command variables.
 * Supports three formats: <name>, [name], {{name}}
 */

const PLACEHOLDER_REGEX = /(<[^>]+>|\[[^\]]+\]|\{\{[^}]+\}\})/g;

export interface PlaceholderSegment {
  type: "text" | "placeholder";
  value: string;
  name?: string;
}

/**
 * Extract variable name from a placeholder token.
 * "<container_id>" → "container_id"
 * "[branch_name]"  → "branch_name"
 * "{{namespace}}"  → "namespace"
 */
export function extractVariableName(token: string): string {
  if (token.startsWith("{{") && token.endsWith("}}")) {
    return token.slice(2, -2).trim();
  }
  if (token.startsWith("<") && token.endsWith(">")) {
    return token.slice(1, -1).trim();
  }
  if (token.startsWith("[") && token.endsWith("]")) {
    return token.slice(1, -1).trim();
  }
  return token;
}

/**
 * Parse a command string into text and placeholder segments.
 * Empty placeholders (e.g. "<>", "[]", "{{}}") are treated as plain text.
 */
export function parsePlaceholders(command: string): PlaceholderSegment[] {
  const parts = command.split(PLACEHOLDER_REGEX);
  const segments: PlaceholderSegment[] = [];

  for (const part of parts) {
    if (!part) continue;

    const isPlaceholder =
      (part.startsWith("<") && part.endsWith(">") && part.length > 2) ||
      (part.startsWith("[") && part.endsWith("]") && part.length > 2) ||
      (part.startsWith("{{") && part.endsWith("}}") && part.length > 4);

    if (isPlaceholder) {
      segments.push({
        type: "placeholder",
        value: part,
        name: extractVariableName(part),
      });
    } else {
      segments.push({ type: "text", value: part });
    }
  }

  return segments;
}

/**
 * Check if a command string contains any placeholders.
 */
export function hasPlaceholders(command: string): boolean {
  PLACEHOLDER_REGEX.lastIndex = 0;
  return PLACEHOLDER_REGEX.test(command);
}

/**
 * Replace placeholders in a command string with provided values.
 * Unmatched placeholders retain their original text.
 */
export function replacePlaceholders(
  command: string,
  values: Record<string, string>
): string {
  return command.replace(PLACEHOLDER_REGEX, (match) => {
    const name = extractVariableName(match);
    // Empty placeholder names are treated as literal text
    if (!name) return match;
    const value = values[name];
    return value !== undefined && value !== "" ? value : match;
  });
}

/**
 * Get unique variable names from a command string.
 */
export function extractVariableNames(command: string): string[] {
  const seen = new Set<string>();
  const segments = parsePlaceholders(command);
  for (const seg of segments) {
    if (seg.type === "placeholder" && seg.name) {
      seen.add(seg.name);
    }
  }
  return [...seen];
}

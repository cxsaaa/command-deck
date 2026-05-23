import { pinyin } from "pinyin-pro";
import type { Command, CommandFilter } from "./types";

interface ScoredCommand {
  command: Command;
  score: number;
}

const WEIGHTS = {
  titleExact: 100,
  titleIncludes: 95,
  commandIncludes: 90,
  tagIncludes: 70,
  categoryIncludes: 60,
  descriptionIncludes: 50,
  exampleIncludes: 40,
  parameterIncludes: 40,
  favoriteBonus: 20,
  recentBonus: 10,
  usageBonus: 10,
  pinyinFullMatch: 60,
  pinyinInitialMatch: 55,
} as const;

/**
 * Score a Chinese text against an English query using pinyin matching.
 * Returns 0 if no match; higher score for better match.
 */
function scorePinyin(text: string, query: string): number {
  // Extract only Chinese characters from text
  const chineseChars = text.match(/[一-鿿]/g);
  if (!chineseChars || chineseChars.length === 0) return 0;

  const chineseText = chineseChars.join("");

  // Generate pinyin variants
  const initials = pinyin(chineseText, { pattern: "first", type: "array" }).join("").toLowerCase();
  const fullPinyin = pinyin(chineseText, { toneType: "none", type: "array" })
    .join("")
    .toLowerCase();

  // Initials prefix match (e.g., "ckrz" matches "查看日志")
  if (initials.startsWith(query)) {
    return WEIGHTS.pinyinInitialMatch;
  }

  // Full pinyin contains match (e.g., "chakan" matches "查看日志")
  if (fullPinyin.includes(query)) {
    return WEIGHTS.pinyinFullMatch;
  }

  return 0;
}

/**
 * Score pinyin for a text, but only if the query is pure ASCII (English/numbers).
 * Returns the pinyin bonus score, or 0.
 */
function maybePinyinScore(text: string | null | undefined, query: string): number {
  if (!text) return 0;
  // Only trigger on pure ASCII queries
  if (!/^[a-z0-9]+$/.test(query)) return 0;
  return scorePinyin(text, query);
}

function scoreCommand(cmd: Command, query: string): number {
  const q = query.toLowerCase().trim();
  let score = 0;

  // Title matching
  if (cmd.title.toLowerCase() === q) {
    score += WEIGHTS.titleExact;
  } else if (cmd.title.toLowerCase().includes(q)) {
    score += WEIGHTS.titleIncludes;
  }

  // Command matching
  if (cmd.command.toLowerCase().includes(q)) {
    score += WEIGHTS.commandIncludes;
  }

  // Tag matching
  if (cmd.tags.some((tag) => tag.toLowerCase().includes(q))) {
    score += WEIGHTS.tagIncludes;
  }

  // Category matching
  if (cmd.categoryName?.toLowerCase().includes(q)) {
    score += WEIGHTS.categoryIncludes;
  }

  // Description matching
  if (cmd.description?.toLowerCase().includes(q)) {
    score += WEIGHTS.descriptionIncludes;
  }

  // Example matching
  if (cmd.examples.some((ex) => ex.toLowerCase().includes(q))) {
    score += WEIGHTS.exampleIncludes;
  }

  // Parameter matching
  if (
    cmd.parameters.some(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
    )
  ) {
    score += WEIGHTS.parameterIncludes;
  }

  // Pinyin enhancement (only when no direct match found yet and query is ASCII)
  if (score === 0) {
    score += maybePinyinScore(cmd.title, q);
    score += Math.round(maybePinyinScore(cmd.description, q) * 0.8);
    for (const tag of cmd.tags) {
      score += Math.round(maybePinyinScore(tag, q) * 0.7);
    }
  }

  // Bonus scoring (only when there's an actual match)
  if (score > 0) {
    if (cmd.isFavorite) {
      score += WEIGHTS.favoriteBonus;
    }
    if (cmd.lastUsedAt) {
      score += WEIGHTS.recentBonus;
    }
    score += Math.min(cmd.usageCount, WEIGHTS.usageBonus);
  }

  return score;
}

export function searchCommands(
  commands: Command[],
  query: string,
  _filter: CommandFilter,
): Command[] {
  if (!query.trim()) return commands;

  const scored: ScoredCommand[] = commands
    .map((cmd) => ({ command: cmd, score: scoreCommand(cmd, query) }))
    .filter((item) => item.score > 0);

  scored.sort((a, b) => {
    // Score descending
    if (b.score !== a.score) return b.score - a.score;
    // Favorite first
    if (a.command.isFavorite !== b.command.isFavorite) return a.command.isFavorite ? -1 : 1;
    // Last used descending
    const aDate = a.command.lastUsedAt ?? "";
    const bDate = b.command.lastUsedAt ?? "";
    if (aDate !== bDate) return bDate.localeCompare(aDate);
    // Usage count descending
    if (a.command.usageCount !== b.command.usageCount)
      return b.command.usageCount - a.command.usageCount;
    // Title ascending
    return a.command.title.localeCompare(b.command.title);
  });

  return scored.map((item) => item.command);
}

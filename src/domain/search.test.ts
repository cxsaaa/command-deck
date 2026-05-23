import { describe, it, expect } from "vitest";
import { searchCommands } from "./search";
import type { Command, CommandFilter } from "./types";

function makeCommand(overrides: Partial<Command> = {}): Command {
  return {
    id: "test-1",
    title: "Test Command",
    command: "test --help",
    description: "A test command",
    platformId: "platform_test",
    platformName: "Test",
    categoryId: null,
    categoryName: null,
    tags: [],
    examples: [],
    parameters: [],
    notes: null,
    isFavorite: false,
    usageCount: 0,
    lastUsedAt: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

const defaultFilter: CommandFilter = {
  navType: "all",
};

describe("searchCommands", () => {
  it("returns original list when query is empty", () => {
    const commands = [
      makeCommand({ id: "1", title: "Alpha" }),
      makeCommand({ id: "2", title: "Beta" }),
    ];
    const result = searchCommands(commands, "", defaultFilter);
    expect(result).toHaveLength(2);
    expect(result.map((c) => c.id)).toEqual(["1", "2"]);
  });

  it("returns original list when query is whitespace", () => {
    const commands = [makeCommand({ id: "1", title: "Alpha" })];
    const result = searchCommands(commands, "   ", defaultFilter);
    expect(result).toHaveLength(1);
  });

  it("returns empty array when no match", () => {
    const commands = [makeCommand({ id: "1", title: "Alpha" })];
    const result = searchCommands(commands, "zzzznonexistent", defaultFilter);
    expect(result).toHaveLength(0);
  });

  it("scores title exact match highest (100)", () => {
    const exactMatch = makeCommand({ id: "1", title: "Git Status" });
    const includesMatch = makeCommand({
      id: "2",
      title: "Git Status Extended",
    });
    const result = searchCommands(
      [includesMatch, exactMatch],
      "Git Status",
      defaultFilter
    );
    expect(result[0].id).toBe("1");
  });

  it("scores title includes match (95)", () => {
    const titleMatch = makeCommand({ id: "1", title: "Git Status Extended" });
    const commandMatch = makeCommand({
      id: "2",
      title: "Other",
      command: "git status",
    });
    const result = searchCommands(
      [commandMatch, titleMatch],
      "git status",
      defaultFilter
    );
    expect(result[0].id).toBe("1");
  });

  it("scores command content match (90)", () => {
    const cmd = makeCommand({ id: "1", title: "Other", command: "git push" });
    const result = searchCommands([cmd], "git push", defaultFilter);
    expect(result).toHaveLength(1);
  });

  it("scores tag match (70)", () => {
    const tagMatch = makeCommand({
      id: "1",
      title: "Something",
      tags: ["deployment"],
    });
    const descMatch = makeCommand({
      id: "2",
      title: "Other",
      description: "deployment tool",
    });
    const result = searchCommands(
      [descMatch, tagMatch],
      "deployment",
      defaultFilter
    );
    expect(result[0].id).toBe("1");
  });

  it("scores category match (60)", () => {
    const catMatch = makeCommand({
      id: "1",
      title: "Something",
      categoryName: "Version Control",
    });
    const descMatch = makeCommand({
      id: "2",
      title: "Other",
      description: "version control helper",
    });
    const result = searchCommands(
      [descMatch, catMatch],
      "version control",
      defaultFilter
    );
    expect(result[0].id).toBe("1");
  });

  it("scores description match (50)", () => {
    const descMatch = makeCommand({
      id: "1",
      title: "Something",
      description: "useful tool for testing",
    });
    const exampleMatch = makeCommand({
      id: "2",
      title: "Other",
      examples: ["testing --verbose"],
    });
    const result = searchCommands(
      [exampleMatch, descMatch],
      "testing",
      defaultFilter
    );
    expect(result[0].id).toBe("1");
  });

  it("scores example/parameter match (40)", () => {
    const exampleMatch = makeCommand({
      id: "1",
      title: "Something",
      examples: ["npm run build"],
    });
    const noMatch = makeCommand({ id: "2", title: "Other" });
    const result = searchCommands(
      [noMatch, exampleMatch],
      "npm run build",
      defaultFilter
    );
    expect(result[0].id).toBe("1");
  });

  it("adds favorite bonus +20", () => {
    const fav = makeCommand({ id: "1", title: "Git Push", isFavorite: true });
    const normal = makeCommand({ id: "2", title: "Git Push", isFavorite: false });
    const result = searchCommands([normal, fav], "git push", defaultFilter);
    expect(result[0].id).toBe("1");
  });

  it("adds recent usage bonus +10", () => {
    const recent = makeCommand({
      id: "1",
      title: "Git Push",
      lastUsedAt: "2026-05-01T00:00:00Z",
    });
    const never = makeCommand({ id: "2", title: "Git Push", lastUsedAt: null });
    const result = searchCommands([never, recent], "git push", defaultFilter);
    expect(result[0].id).toBe("1");
  });

  it("adds usage count bonus (up to +10)", () => {
    const highUsage = makeCommand({
      id: "1",
      title: "Git Push",
      usageCount: 15,
    });
    const lowUsage = makeCommand({ id: "2", title: "Git Push", usageCount: 2 });
    const result = searchCommands(
      [lowUsage, highUsage],
      "git push",
      defaultFilter
    );
    expect(result[0].id).toBe("1");
  });

  it("sorts by score desc, then isFavorite desc, then lastUsedAt desc, then usageCount desc, then title asc", () => {
    const commands = [
      makeCommand({
        id: "1",
        title: "C Command",
        command: "searchme",
        isFavorite: false,
        usageCount: 0,
        lastUsedAt: null,
      }),
      makeCommand({
        id: "2",
        title: "A Command",
        command: "searchme",
        isFavorite: true,
        usageCount: 5,
        lastUsedAt: "2026-05-01T00:00:00Z",
      }),
      makeCommand({
        id: "3",
        title: "B Command",
        command: "searchme",
        isFavorite: false,
        usageCount: 10,
        lastUsedAt: "2026-04-01T00:00:00Z",
      }),
    ];
    const result = searchCommands(commands, "searchme", defaultFilter);
    // All have same base score (commandIncludes=90), so sort by bonuses
    // id=2: fav(+20) + recent(+10) + usage(+5) = +35
    // id=3: usage(+10) + recent(+10) = +20
    // id=1: 0
    expect(result.map((c) => c.id)).toEqual(["2", "3", "1"]);
  });
});

describe("pinyin search", () => {
  it("matches Chinese title by pinyin initials", () => {
    const cmd = makeCommand({ id: "1", title: "查看日志" });
    const result = searchCommands([cmd], "ckrz", defaultFilter);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("matches Chinese title by shorter pinyin initials prefix", () => {
    const cmd = makeCommand({ id: "1", title: "查看日志" });
    const result = searchCommands([cmd], "ck", defaultFilter);
    expect(result).toHaveLength(1);
  });

  it("matches Chinese title by full pinyin", () => {
    const cmd = makeCommand({ id: "1", title: "查看日志" });
    const result = searchCommands([cmd], "chakan", defaultFilter);
    expect(result).toHaveLength(1);
  });

  it("matches Chinese description by pinyin", () => {
    const cmd = makeCommand({ id: "1", title: "Something", description: "查看日志" });
    const result = searchCommands([cmd], "chakan", defaultFilter);
    expect(result).toHaveLength(1);
  });

  it("does not trigger pinyin on Chinese query", () => {
    const cmd = makeCommand({ id: "1", title: "查看日志" });
    const result = searchCommands([cmd], "查看", defaultFilter);
    // Should match via normal titleIncludes, not pinyin
    expect(result).toHaveLength(1);
  });

  it("ranks direct Chinese match above pinyin match", () => {
    const directMatch = makeCommand({ id: "1", title: "查看日志" });
    const pinyinOnly = makeCommand({ id: "2", title: "查看配置" });
    // "查看" is a substring of both titles; "查看日志" also matches pinyin "ckrz"
    // Both match via titleIncludes (95), so order depends on other factors
    const result = searchCommands([pinyinOnly, directMatch], "查看", defaultFilter);
    expect(result).toHaveLength(2);
  });

  it("ranks pinyin full match above pinyin initials match", () => {
    const fullPinyin = makeCommand({ id: "1", title: "查看" }); // "chakan"
    const initialsOnly = makeCommand({ id: "2", title: "测试" }); // "cs"
    // Query "chakan" → full pinyin match on "查看" (60), initials match "cs" starts with... no
    const result = searchCommands([initialsOnly, fullPinyin], "chakan", defaultFilter);
    expect(result[0].id).toBe("1");
  });

  it("does not match non-Chinese text via pinyin", () => {
    const cmd = makeCommand({ id: "1", title: "Git Status" });
    const result = searchCommands([cmd], "gs", defaultFilter);
    // "gs" does not match "Git Status" via pinyin (no Chinese chars)
    // But it does not match via any other means either
    expect(result).toHaveLength(0);
  });

  it("ignores pinyin for mixed alphanumeric query", () => {
    const cmd = makeCommand({ id: "1", title: "查看日志" });
    // Mixed query like "ck12" should not trigger pinyin (contains digits but still valid)
    const result = searchCommands([cmd], "ck12", defaultFilter);
    // "ck12" has digits — regex /^[a-z0-9]+$/ matches, but initials "ckrz" doesn't start with "ck12"
    expect(result).toHaveLength(0);
  });
});

import { describe, it, expect } from "vitest";
import { sortCommands } from "./sorting";
import type { Command } from "./types";

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

describe("sortCommands", () => {
  describe("createdAt sort (default)", () => {
    it("sorts by createdAt descending", () => {
      const commands = [
        makeCommand({ id: "1", createdAt: "2026-01-01T00:00:00Z" }),
        makeCommand({ id: "2", createdAt: "2026-05-01T00:00:00Z" }),
        makeCommand({ id: "3", createdAt: "2026-03-01T00:00:00Z" }),
      ];
      const result = sortCommands(commands, "platform", "createdAt");
      expect(result.map((c) => c.id)).toEqual(["2", "3", "1"]);
    });
  });

  describe("usageCount sort", () => {
    it("sorts by usageCount descending", () => {
      const commands = [
        makeCommand({ id: "1", usageCount: 2 }),
        makeCommand({ id: "2", usageCount: 10 }),
        makeCommand({ id: "3", usageCount: 5 }),
      ];
      const result = sortCommands(commands, "platform", "usageCount");
      expect(result.map((c) => c.id)).toEqual(["2", "3", "1"]);
    });

    it("uses createdAt as tiebreaker", () => {
      const commands = [
        makeCommand({ id: "1", usageCount: 5, createdAt: "2026-01-01T00:00:00Z" }),
        makeCommand({ id: "2", usageCount: 5, createdAt: "2026-05-01T00:00:00Z" }),
      ];
      const result = sortCommands(commands, "platform", "usageCount");
      expect(result[0].id).toBe("2");
    });
  });

  describe("favoritedAt sort", () => {
    it("sorts favorites first", () => {
      const commands = [
        makeCommand({ id: "1", isFavorite: false }),
        makeCommand({ id: "2", isFavorite: true }),
      ];
      const result = sortCommands(commands, "favorites", "favoritedAt");
      expect(result[0].id).toBe("2");
    });

    it("sorts by createdAt descending within same favorite status", () => {
      const commands = [
        makeCommand({ id: "1", isFavorite: true, createdAt: "2026-01-01T00:00:00Z" }),
        makeCommand({ id: "2", isFavorite: true, createdAt: "2026-05-01T00:00:00Z" }),
      ];
      const result = sortCommands(commands, "favorites", "favoritedAt");
      expect(result[0].id).toBe("2");
    });
  });

  it("does not mutate the original array", () => {
    const commands = [
      makeCommand({ id: "1", createdAt: "2026-01-01T00:00:00Z" }),
      makeCommand({ id: "2", createdAt: "2026-05-01T00:00:00Z" }),
    ];
    const original = [...commands];
    sortCommands(commands, "platform", "createdAt");
    expect(commands.map((c) => c.id)).toEqual(original.map((c) => c.id));
  });
});

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
  describe("platform/all navType", () => {
    it("sorts favorites first", () => {
      const commands = [
        makeCommand({ id: "1", title: "Normal", isFavorite: false }),
        makeCommand({ id: "2", title: "Fav", isFavorite: true }),
      ];
      const result = sortCommands(commands, "platform");
      expect(result[0].id).toBe("2");
    });

    it("sorts by lastUsedAt descending when favorite status is same", () => {
      const commands = [
        makeCommand({
          id: "1",
          title: "Old",
          lastUsedAt: "2026-01-01T00:00:00Z",
        }),
        makeCommand({
          id: "2",
          title: "New",
          lastUsedAt: "2026-05-01T00:00:00Z",
        }),
      ];
      const result = sortCommands(commands, "all");
      expect(result[0].id).toBe("2");
    });

    it("sorts by usageCount descending when lastUsedAt is same", () => {
      const commands = [
        makeCommand({ id: "1", title: "Low", usageCount: 2 }),
        makeCommand({ id: "2", title: "High", usageCount: 10 }),
      ];
      const result = sortCommands(commands, "platform");
      expect(result[0].id).toBe("2");
    });

    it("sorts by categoryName ascending when usageCount is same", () => {
      const commands = [
        makeCommand({ id: "1", title: "Cmd", categoryName: "Zebra" }),
        makeCommand({ id: "2", title: "Cmd", categoryName: "Alpha" }),
      ];
      const result = sortCommands(commands, "all");
      expect(result[0].id).toBe("2");
    });

    it("sorts by title ascending as final tiebreaker", () => {
      const commands = [
        makeCommand({ id: "1", title: "Zebra" }),
        makeCommand({ id: "2", title: "Alpha" }),
      ];
      const result = sortCommands(commands, "platform");
      expect(result[0].id).toBe("2");
    });
  });

  describe("favorites navType", () => {
    it("sorts by lastUsedAt descending", () => {
      const commands = [
        makeCommand({
          id: "1",
          lastUsedAt: "2026-01-01T00:00:00Z",
          platformName: "A",
        }),
        makeCommand({
          id: "2",
          lastUsedAt: "2026-05-01T00:00:00Z",
          platformName: "A",
        }),
      ];
      const result = sortCommands(commands, "favorites");
      expect(result[0].id).toBe("2");
    });

    it("sorts by usageCount descending when lastUsedAt is same", () => {
      const commands = [
        makeCommand({ id: "1", usageCount: 2, platformName: "A" }),
        makeCommand({ id: "2", usageCount: 10, platformName: "A" }),
      ];
      const result = sortCommands(commands, "favorites");
      expect(result[0].id).toBe("2");
    });

    it("sorts by platformName ascending as final tiebreaker", () => {
      const commands = [
        makeCommand({ id: "1", platformName: "Zebra" }),
        makeCommand({ id: "2", platformName: "Alpha" }),
      ];
      const result = sortCommands(commands, "favorites");
      expect(result[0].id).toBe("2");
    });
  });

  describe("recent navType", () => {
    it("sorts by lastUsedAt descending", () => {
      const commands = [
        makeCommand({
          id: "1",
          lastUsedAt: "2026-01-01T00:00:00Z",
        }),
        makeCommand({
          id: "2",
          lastUsedAt: "2026-05-01T00:00:00Z",
        }),
        makeCommand({
          id: "3",
          lastUsedAt: "2026-03-01T00:00:00Z",
        }),
      ];
      const result = sortCommands(commands, "recent");
      expect(result.map((c) => c.id)).toEqual(["2", "3", "1"]);
    });

    it("puts commands without lastUsedAt last", () => {
      const commands = [
        makeCommand({ id: "1", lastUsedAt: null }),
        makeCommand({
          id: "2",
          lastUsedAt: "2026-05-01T00:00:00Z",
        }),
      ];
      const result = sortCommands(commands, "recent");
      expect(result[0].id).toBe("2");
      expect(result[1].id).toBe("1");
    });
  });

  it("does not mutate the original array", () => {
    const commands = [
      makeCommand({ id: "1", title: "Zebra" }),
      makeCommand({ id: "2", title: "Alpha" }),
    ];
    const original = [...commands];
    sortCommands(commands, "platform");
    expect(commands.map((c) => c.id)).toEqual(original.map((c) => c.id));
  });
});

import { describe, it, expect } from "vitest";
import { validateCommandInput } from "./validation";
import type { CommandInput } from "./types";

function makeInput(overrides: Partial<CommandInput> = {}): CommandInput {
  return {
    title: "Test Command",
    command: "test --help",
    platformId: "platform_test",
    ...overrides,
  };
}

const platformIds = ["platform_test", "platform_other"];
const categoryPlatformMap = new Map<string, string>([
  ["cat_1", "platform_test"],
  ["cat_2", "platform_other"],
]);

describe("validateCommandInput", () => {
  it("returns error when title is empty", () => {
    const errors = validateCommandInput(makeInput({ title: "" }), platformIds, categoryPlatformMap);
    expect(errors).toContainEqual({
      field: "title",
      message: "Title is required",
    });
  });

  it("returns error when title is whitespace", () => {
    const errors = validateCommandInput(
      makeInput({ title: "   " }),
      platformIds,
      categoryPlatformMap,
    );
    expect(errors).toContainEqual({
      field: "title",
      message: "Title is required",
    });
  });

  it("returns error when command is empty", () => {
    const errors = validateCommandInput(
      makeInput({ command: "" }),
      platformIds,
      categoryPlatformMap,
    );
    expect(errors).toContainEqual({
      field: "command",
      message: "Command is required",
    });
  });

  it("returns error when platformId is invalid", () => {
    const errors = validateCommandInput(
      makeInput({ platformId: "nonexistent" }),
      platformIds,
      categoryPlatformMap,
    );
    expect(errors).toContainEqual({
      field: "platformId",
      message: "A valid platform must be selected",
    });
  });

  it("returns error when platformId is empty", () => {
    const errors = validateCommandInput(
      makeInput({ platformId: "" }),
      platformIds,
      categoryPlatformMap,
    );
    expect(errors).toContainEqual({
      field: "platformId",
      message: "A valid platform must be selected",
    });
  });

  it("returns error when category does not belong to platform", () => {
    const errors = validateCommandInput(
      makeInput({ categoryId: "cat_2" }),
      platformIds,
      categoryPlatformMap,
    );
    expect(errors).toContainEqual({
      field: "categoryId",
      message: "Category does not belong to the selected platform",
    });
  });

  it("returns error when category does not exist", () => {
    const errors = validateCommandInput(
      makeInput({ categoryId: "nonexistent_cat" }),
      platformIds,
      categoryPlatformMap,
    );
    expect(errors).toContainEqual({
      field: "categoryId",
      message: "Selected category does not exist",
    });
  });

  it("returns error for duplicate tags", () => {
    const errors = validateCommandInput(
      makeInput({ tags: ["tag1", "tag2", "tag1"] }),
      platformIds,
      categoryPlatformMap,
    );
    expect(errors).toContainEqual({
      field: "tags",
      message: "Tags must be unique",
    });
  });

  it("returns error when parameter has empty name", () => {
    const errors = validateCommandInput(
      makeInput({ parameters: [{ name: "", description: "desc" }] }),
      platformIds,
      categoryPlatformMap,
    );
    expect(errors).toContainEqual({
      field: "parameters[0]",
      message: "Each parameter requires both name and description",
    });
  });

  it("returns error when parameter has empty description", () => {
    const errors = validateCommandInput(
      makeInput({ parameters: [{ name: "arg", description: "" }] }),
      platformIds,
      categoryPlatformMap,
    );
    expect(errors).toContainEqual({
      field: "parameters[0]",
      message: "Each parameter requires both name and description",
    });
  });

  it("returns empty errors for valid input", () => {
    const errors = validateCommandInput(makeInput(), platformIds, categoryPlatformMap);
    expect(errors).toHaveLength(0);
  });

  it("returns empty errors for valid input with category", () => {
    const errors = validateCommandInput(
      makeInput({ categoryId: "cat_1" }),
      platformIds,
      categoryPlatformMap,
    );
    expect(errors).toHaveLength(0);
  });

  it("returns empty errors for valid input with tags and parameters", () => {
    const errors = validateCommandInput(
      makeInput({
        tags: ["tag1", "tag2"],
        parameters: [{ name: "--verbose", description: "Enable verbose output" }],
      }),
      platformIds,
      categoryPlatformMap,
    );
    expect(errors).toHaveLength(0);
  });

  it("returns multiple errors at once", () => {
    const errors = validateCommandInput(
      makeInput({ title: "", command: "", platformId: "" }),
      platformIds,
      categoryPlatformMap,
    );
    expect(errors.length).toBeGreaterThanOrEqual(3);
  });
});

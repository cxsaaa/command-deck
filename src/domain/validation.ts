import type { CommandInput } from "./types";

export interface ValidationError {
  field: string;
  message: string;
}

export function validateCommandInput(
  input: CommandInput,
  existingPlatformIds: string[],
  existingCategoryPlatformMap: Map<string, string>,
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Title validation
  if (!input.title || input.title.trim().length < 1) {
    errors.push({ field: "title", message: "Title is required" });
  }

  // Command validation
  if (!input.command || input.command.trim().length < 1) {
    errors.push({ field: "command", message: "Command is required" });
  }

  // Platform validation
  if (!input.platformId || !existingPlatformIds.includes(input.platformId)) {
    errors.push({
      field: "platformId",
      message: "A valid platform must be selected",
    });
  }

  // Category validation
  if (input.categoryId !== undefined && input.categoryId !== null) {
    const categoryPlatform = existingCategoryPlatformMap.get(input.categoryId);
    if (!categoryPlatform) {
      errors.push({
        field: "categoryId",
        message: "Selected category does not exist",
      });
    } else if (input.platformId && categoryPlatform !== input.platformId) {
      errors.push({
        field: "categoryId",
        message: "Category does not belong to the selected platform",
      });
    }
  }

  // Tags validation
  if (input.tags) {
    const uniqueTags = [...new Set(input.tags.map((t) => t.trim()).filter((t) => t.length > 0))];
    if (uniqueTags.length !== input.tags.filter((t) => t.trim().length > 0).length) {
      errors.push({ field: "tags", message: "Tags must be unique" });
    }
  }

  // Parameters validation
  if (input.parameters) {
    for (let i = 0; i < input.parameters.length; i++) {
      const p = input.parameters[i];
      if (!p.name.trim() || !p.description.trim()) {
        errors.push({
          field: `parameters[${i}]`,
          message: "Each parameter requires both name and description",
        });
      }
    }
  }

  return errors;
}

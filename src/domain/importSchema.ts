export interface CommandDeckExport {
  version: "1.0";
  exportedAt: string;
  platforms: ExportPlatform[];
}

export interface ExportPlatform {
  name: string;
  icon?: string;
  color?: string;
  description?: string;
  categories: ExportCategory[];
}

export interface ExportCategory {
  name: string;
  commands: ExportCommand[];
}

export interface ExportCommand {
  title: string;
  command: string;
  description?: string;
  tags?: string[];
  examples?: string[];
  parameters?: { name: string; description: string }[];
  notes?: string;
}

export type ConflictStrategy = "skip" | "overwrite" | "rename";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateImport(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!data || typeof data !== "object") {
    return { valid: false, errors: ["Invalid JSON: not an object"] };
  }

  const obj = data as Record<string, unknown>;

  if (obj.version !== "1.0") {
    errors.push(`Unsupported version: ${String(obj.version)}`);
  }

  if (!Array.isArray(obj.platforms)) {
    errors.push("Missing or invalid 'platforms' array");
    return { valid: false, errors };
  }

  for (let pi = 0; pi < obj.platforms.length; pi++) {
    const platform = obj.platforms[pi] as Record<string, unknown>;
    if (!platform.name || typeof platform.name !== "string") {
      errors.push(`Platform[${pi}]: missing 'name'`);
    }
    if (!Array.isArray(platform.categories)) {
      errors.push(`Platform[${pi}]: missing 'categories' array`);
      continue;
    }

    for (let ci = 0; ci < platform.categories.length; ci++) {
      const cat = platform.categories[ci] as Record<string, unknown>;
      if (!cat.name || typeof cat.name !== "string") {
        errors.push(`Platform[${pi}].categories[${ci}]: missing 'name'`);
      }
      if (!Array.isArray(cat.commands)) {
        errors.push(`Platform[${pi}].categories[${ci}]: missing 'commands' array`);
        continue;
      }

      for (let cmdi = 0; cmdi < cat.commands.length; cmdi++) {
        const cmd = cat.commands[cmdi] as Record<string, unknown>;
        if (!cmd.title || typeof cmd.title !== "string") {
          errors.push(`Command[${pi}][${ci}][${cmdi}]: missing 'title'`);
        }
        if (!cmd.command || typeof cmd.command !== "string") {
          errors.push(`Command[${pi}][${ci}][${cmdi}]: missing 'command'`);
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

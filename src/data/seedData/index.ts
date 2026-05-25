import cliData from "./seedData/cli.json";
import dockerData from "./seedData/docker.json";
import nodejsData from "./seedData/nodejs.json";
import claudeCodeData from "./seedData/claude-code.json";
import type { SeedPlatform, SeedCategory, SeedCommand } from "./types";

type Localized<T> = T | { "zh-CN": T; "en-US": T };

function isLocalized(obj: unknown): obj is { "zh-CN": unknown; "en-US": unknown } {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "zh-CN" in obj &&
    "en-US" in obj
  );
}

function resolve<T>(value: Localized<T>, locale: string): T {
  if (!isLocalized(value)) return value as T;
  const key = locale.startsWith("en") ? "en-US" : "zh-CN";
  return (value[key] ?? value["zh-CN"]) as T;
}

interface PlatformSeed {
  platform: {
    id: string;
    icon: string | null;
    color: string;
    sortOrder: number;
    name: Localized<string>;
    description: Localized<string>;
  };
  categories: {
    id: string;
    platformId: string;
    sortOrder: number;
    name: Localized<string>;
  }[];
  commands: {
    id: string;
    command: string;
    platformId: string;
    categoryId: string;
    examples: string[];
    parameters: {
      name: string;
      description: Localized<string>;
    }[];
    title: Localized<string>;
    description: Localized<string>;
    tags: Localized<string[]>;
    notes: string | null;
  }[];
}

const allPlatforms: PlatformSeed[] = [
  cliData as PlatformSeed,
  dockerData as PlatformSeed,
  nodejsData as PlatformSeed,
  claudeCodeData as PlatformSeed,
];

export function getSeedData(locale: string): {
  platforms: SeedPlatform[];
  categories: SeedCategory[];
  commands: SeedCommand[];
} {
  const platforms: SeedPlatform[] = allPlatforms.map((d) => ({
    id: d.platform.id,
    name: resolve(d.platform.name, locale),
    icon: d.platform.icon,
    color: d.platform.color,
    description: resolve(d.platform.description, locale),
    sortOrder: d.platform.sortOrder,
  }));

  const categories: SeedCategory[] = allPlatforms.flatMap((d) =>
    d.categories.map((c) => ({
      id: c.id,
      platformId: c.platformId,
      name: resolve(c.name, locale),
      sortOrder: c.sortOrder,
    })),
  );

  const commands: SeedCommand[] = allPlatforms.flatMap((d) =>
    d.commands.map((cmd) => ({
      id: cmd.id,
      title: resolve(cmd.title, locale),
      command: cmd.command,
      description: resolve(cmd.description, locale),
      platformId: cmd.platformId,
      categoryId: cmd.categoryId,
      tags: [...resolve(cmd.tags, locale)],
      examples: [...cmd.examples],
      parameters: cmd.parameters.map((p) => ({
        name: p.name,
        description: resolve(p.description, locale) ?? p.name,
      })),
      notes: cmd.notes,
    })),
  );

  return { platforms, categories, commands };
}

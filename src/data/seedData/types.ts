export interface SeedPlatform {
  id: string;
  name: string;
  icon: string | null;
  color: string;
  description: string;
  sortOrder: number;
}

export interface SeedCategory {
  id: string;
  platformId: string;
  name: string;
  sortOrder: number;
}

export interface SeedCommand {
  id: string;
  title: string;
  command: string;
  description: string;
  platformId: string;
  categoryId: string;
  tags: string[];
  examples: string[];
  parameters: { name: string; description: string }[];
  notes: string | null;
}

export type NavType = "all" | "favorites" | "recent" | "platform";
export type SearchScope = "current" | "global";

export interface Platform {
  id: string;
  name: string;
  icon: string | null;
  color: string;
  description: string | null;
  sortOrder: number;
  isVisible: boolean;
  commandCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  platformId: string;
  name: string;
  sortOrder: number;
}

export interface Command {
  id: string;
  title: string;
  command: string;
  description: string | null;
  platformId: string;
  platformName: string;
  categoryId: string | null;
  categoryName: string | null;
  tags: string[];
  examples: string[];
  parameters: CommandParameter[];
  notes: string | null;
  isFavorite: boolean;
  usageCount: number;
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CommandParameter {
  name: string;
  description: string;
}

export interface CommandInput {
  title: string;
  command: string;
  platformId: string;
  categoryId?: string | null;
  description?: string | null;
  tags?: string[];
  examples?: string[];
  parameters?: CommandParameter[];
  notes?: string | null;
}

export interface CommandFilter {
  navType: NavType;
  platformId?: string | null;
  categoryId?: string | null;
  searchQuery?: string;
  searchScope?: SearchScope;
}

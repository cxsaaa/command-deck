export const queryKeys = {
  platforms: ["platforms"] as const,
  categories: (platformId: string) => ["categories", platformId] as const,
  commands: (filter: Record<string, unknown>) => ["commands", filter] as const,
  search: (query: string, filter: Record<string, unknown>) =>
    ["search", query, filter] as const,
  command: (id: string) => ["command", id] as const,
  variableHistories: (commandId: string) =>
    ["variableHistories", commandId] as const,
};

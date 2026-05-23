export interface PlatformStructure {
  id: string;
  icon: string | null;
  color: string;
  sortOrder: number;
}

export const platformStructure: PlatformStructure[] = [
  { id: "platform_docker", icon: null, color: "#2496ED", sortOrder: 1 },
  { id: "platform_claude_code", icon: null, color: "#7C3AED", sortOrder: 2 },
  { id: "platform_cli", icon: null, color: "#64748B", sortOrder: 3 },
  { id: "platform_opencode", icon: null, color: "#10B981", sortOrder: 4 },
  { id: "platform_git", icon: null, color: "#F97316", sortOrder: 5 },
  { id: "platform_kubernetes", icon: null, color: "#326CE5", sortOrder: 6 },
  { id: "platform_homebrew", icon: null, color: "#FBBF24", sortOrder: 7 },
  { id: "platform_nodejs", icon: null, color: "#339933", sortOrder: 8 },
  { id: "platform_python", icon: null, color: "#3776AB", sortOrder: 9 },
  { id: "platform_shell", icon: null, color: "#52525B", sortOrder: 10 },
];

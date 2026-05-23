export interface CategoryStructure {
  id: string;
  platformId: string;
  sortOrder: number;
}

export const categoryStructure: CategoryStructure[] = [
  // Docker
  { id: "cat_docker_common", platformId: "platform_docker", sortOrder: 1 },
  { id: "cat_docker_container", platformId: "platform_docker", sortOrder: 2 },
  { id: "cat_docker_image", platformId: "platform_docker", sortOrder: 3 },
  { id: "cat_docker_logs", platformId: "platform_docker", sortOrder: 4 },
  { id: "cat_docker_network", platformId: "platform_docker", sortOrder: 5 },
  { id: "cat_docker_cleanup", platformId: "platform_docker", sortOrder: 6 },
  // Claude Code
  { id: "cat_claude_common", platformId: "platform_claude_code", sortOrder: 1 },
  { id: "cat_claude_config", platformId: "platform_claude_code", sortOrder: 2 },
  { id: "cat_claude_workflow", platformId: "platform_claude_code", sortOrder: 3 },
  // CLI
  { id: "cat_cli_navigation", platformId: "platform_cli", sortOrder: 1 },
  { id: "cat_cli_files", platformId: "platform_cli", sortOrder: 2 },
  { id: "cat_cli_text", platformId: "platform_cli", sortOrder: 3 },
  { id: "cat_cli_system", platformId: "platform_cli", sortOrder: 4 },
  // OpenCode
  { id: "cat_opencode_common", platformId: "platform_opencode", sortOrder: 1 },
  { id: "cat_opencode_project", platformId: "platform_opencode", sortOrder: 2 },
  // Git
  { id: "cat_git_basic", platformId: "platform_git", sortOrder: 1 },
  { id: "cat_git_branch", platformId: "platform_git", sortOrder: 2 },
  { id: "cat_git_remote", platformId: "platform_git", sortOrder: 3 },
  { id: "cat_git_advanced", platformId: "platform_git", sortOrder: 4 },
  // Kubernetes
  { id: "cat_k8s_pods", platformId: "platform_kubernetes", sortOrder: 1 },
  { id: "cat_k8s_deploy", platformId: "platform_kubernetes", sortOrder: 2 },
  { id: "cat_k8s_service", platformId: "platform_kubernetes", sortOrder: 3 },
  { id: "cat_k8s_debug", platformId: "platform_kubernetes", sortOrder: 4 },
  // Homebrew
  { id: "cat_brew_install", platformId: "platform_homebrew", sortOrder: 1 },
  { id: "cat_brew_manage", platformId: "platform_homebrew", sortOrder: 2 },
  { id: "cat_brew_cask", platformId: "platform_homebrew", sortOrder: 3 },
  // Node.js
  { id: "cat_node_npm", platformId: "platform_nodejs", sortOrder: 1 },
  { id: "cat_node_script", platformId: "platform_nodejs", sortOrder: 2 },
  { id: "cat_node_debug", platformId: "platform_nodejs", sortOrder: 3 },
  // Python
  { id: "cat_python_pip", platformId: "platform_python", sortOrder: 1 },
  { id: "cat_python_venv", platformId: "platform_python", sortOrder: 2 },
  { id: "cat_python_script", platformId: "platform_python", sortOrder: 3 },
  // Shell
  { id: "cat_shell_file", platformId: "platform_shell", sortOrder: 1 },
  { id: "cat_shell_search", platformId: "platform_shell", sortOrder: 2 },
  { id: "cat_shell_process", platformId: "platform_shell", sortOrder: 3 },
  { id: "cat_shell_network", platformId: "platform_shell", sortOrder: 4 },
];

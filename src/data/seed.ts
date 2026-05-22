import type Database from "@tauri-apps/plugin-sql";

interface SeedPlatform {
  id: string;
  name: string;
  icon: string | null;
  color: string;
  description: string;
  sortOrder: number;
}

interface SeedCategory {
  id: string;
  platformId: string;
  name: string;
  sortOrder: number;
}

interface SeedCommand {
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

const platforms: SeedPlatform[] = [
  {
    id: "platform_docker",
    name: "Docker",
    icon: null,
    color: "#2496ED",
    description: "容器平台，用于构建、分享和运行应用",
    sortOrder: 1,
  },
  {
    id: "platform_claude_code",
    name: "Claude Code",
    icon: null,
    color: "#7C3AED",
    description: "Anthropic 推出的 AI 编程助手",
    sortOrder: 2,
  },
  {
    id: "platform_cli",
    name: "CLI",
    icon: null,
    color: "#64748B",
    description: "常用命令行工具",
    sortOrder: 3,
  },
  {
    id: "platform_opencode",
    name: "OpenCode",
    icon: null,
    color: "#10B981",
    description: "开源代码编辑器与开发工具",
    sortOrder: 4,
  },
  {
    id: "platform_git",
    name: "Git",
    icon: null,
    color: "#F97316",
    description: "分布式版本控制系统",
    sortOrder: 5,
  },
  {
    id: "platform_kubernetes",
    name: "Kubernetes",
    icon: null,
    color: "#326CE5",
    description: "容器编排平台",
    sortOrder: 6,
  },
  {
    id: "platform_homebrew",
    name: "Homebrew",
    icon: null,
    color: "#FBBF24",
    description: "macOS 和 Linux 的包管理器",
    sortOrder: 7,
  },
  {
    id: "platform_nodejs",
    name: "Node.js",
    icon: null,
    color: "#339933",
    description: "基于 Chrome V8 引擎的 JavaScript 运行时",
    sortOrder: 8,
  },
  {
    id: "platform_python",
    name: "Python",
    icon: null,
    color: "#3776AB",
    description: "高级编程语言",
    sortOrder: 9,
  },
  {
    id: "platform_shell",
    name: "Shell",
    icon: null,
    color: "#52525B",
    description: "Shell 脚本与系统管理",
    sortOrder: 10,
  },
];

const categories: SeedCategory[] = [
  // Docker
  { id: "cat_docker_common", platformId: "platform_docker", name: "常用", sortOrder: 1 },
  { id: "cat_docker_container", platformId: "platform_docker", name: "容器", sortOrder: 2 },
  { id: "cat_docker_image", platformId: "platform_docker", name: "镜像", sortOrder: 3 },
  { id: "cat_docker_logs", platformId: "platform_docker", name: "日志", sortOrder: 4 },
  { id: "cat_docker_network", platformId: "platform_docker", name: "网络", sortOrder: 5 },
  { id: "cat_docker_cleanup", platformId: "platform_docker", name: "清理", sortOrder: 6 },
  // Claude Code
  { id: "cat_claude_common", platformId: "platform_claude_code", name: "常用", sortOrder: 1 },
  { id: "cat_claude_config", platformId: "platform_claude_code", name: "配置", sortOrder: 2 },
  { id: "cat_claude_workflow", platformId: "platform_claude_code", name: "工作流", sortOrder: 3 },
  // CLI
  { id: "cat_cli_navigation", platformId: "platform_cli", name: "导航", sortOrder: 1 },
  { id: "cat_cli_files", platformId: "platform_cli", name: "文件", sortOrder: 2 },
  { id: "cat_cli_text", platformId: "platform_cli", name: "文本处理", sortOrder: 3 },
  { id: "cat_cli_system", platformId: "platform_cli", name: "系统", sortOrder: 4 },
  // OpenCode
  { id: "cat_opencode_common", platformId: "platform_opencode", name: "常用", sortOrder: 1 },
  { id: "cat_opencode_project", platformId: "platform_opencode", name: "项目", sortOrder: 2 },
  // Git
  { id: "cat_git_basic", platformId: "platform_git", name: "基础", sortOrder: 1 },
  { id: "cat_git_branch", platformId: "platform_git", name: "分支", sortOrder: 2 },
  { id: "cat_git_remote", platformId: "platform_git", name: "远程", sortOrder: 3 },
  { id: "cat_git_advanced", platformId: "platform_git", name: "高级", sortOrder: 4 },
  // Kubernetes
  { id: "cat_k8s_pods", platformId: "platform_kubernetes", name: "Pod", sortOrder: 1 },
  { id: "cat_k8s_deploy", platformId: "platform_kubernetes", name: "部署", sortOrder: 2 },
  { id: "cat_k8s_service", platformId: "platform_kubernetes", name: "服务", sortOrder: 3 },
  { id: "cat_k8s_debug", platformId: "platform_kubernetes", name: "调试", sortOrder: 4 },
  // Homebrew
  { id: "cat_brew_install", platformId: "platform_homebrew", name: "安装", sortOrder: 1 },
  { id: "cat_brew_manage", platformId: "platform_homebrew", name: "管理", sortOrder: 2 },
  { id: "cat_brew_cask", platformId: "platform_homebrew", name: "Cask", sortOrder: 3 },
  // Node.js
  { id: "cat_node_npm", platformId: "platform_nodejs", name: "npm", sortOrder: 1 },
  { id: "cat_node_script", platformId: "platform_nodejs", name: "脚本", sortOrder: 2 },
  { id: "cat_node_debug", platformId: "platform_nodejs", name: "调试", sortOrder: 3 },
  // Python
  { id: "cat_python_pip", platformId: "platform_python", name: "pip", sortOrder: 1 },
  { id: "cat_python_venv", platformId: "platform_python", name: "虚拟环境", sortOrder: 2 },
  { id: "cat_python_script", platformId: "platform_python", name: "脚本", sortOrder: 3 },
  // Shell
  { id: "cat_shell_file", platformId: "platform_shell", name: "文件操作", sortOrder: 1 },
  { id: "cat_shell_search", platformId: "platform_shell", name: "搜索", sortOrder: 2 },
  { id: "cat_shell_process", platformId: "platform_shell", name: "进程", sortOrder: 3 },
  { id: "cat_shell_network", platformId: "platform_shell", name: "网络", sortOrder: 4 },
];

const commands: SeedCommand[] = [
  // ==================== Docker ====================
  {
    id: "cmd_docker_ps",
    title: "查看运行中的容器",
    command: "docker ps",
    description: "列出所有正在运行的容器",
    platformId: "platform_docker",
    categoryId: "cat_docker_container",
    tags: ["容器", "列表", "状态"],
    examples: ["docker ps -a", "docker ps --format '{{.Names}}'"],
    parameters: [],
    notes: null,
  },
  {
    id: "cmd_docker_run",
    title: "运行容器",
    command: "docker run",
    description: "从镜像创建并启动一个新容器",
    platformId: "platform_docker",
    categoryId: "cat_docker_container",
    tags: ["容器", "运行", "创建"],
    examples: [
      "docker run -d nginx",
      "docker run -it ubuntu bash",
      "docker run -p 8080:80 -d nginx",
    ],
    parameters: [
      { name: "-d", description: "以分离模式运行" },
      { name: "-it", description: "交互式并分配 TTY" },
      { name: "-p", description: "将容器端口映射到主机" },
      { name: "--name", description: "为容器指定名称" },
    ],
    notes: null,
  },
  {
    id: "cmd_docker_build",
    title: "构建镜像",
    command: "docker build",
    description: "从 Dockerfile 构建 Docker 镜像",
    platformId: "platform_docker",
    categoryId: "cat_docker_image",
    tags: ["镜像", "构建", "dockerfile"],
    examples: [
      "docker build -t myapp:latest .",
      "docker build -f Dockerfile.prod -t myapp:prod .",
    ],
    parameters: [
      { name: "-t", description: "指定镜像名称和标签（name:tag 格式）" },
      { name: "-f", description: "指定 Dockerfile 文件名" },
    ],
    notes: null,
  },
  {
    id: "cmd_docker_logs_follow",
    title: "跟踪容器日志",
    command: "docker logs -f",
    description: "实时跟踪运行中容器的日志输出",
    platformId: "platform_docker",
    categoryId: "cat_docker_logs",
    tags: ["日志", "跟踪", "调试"],
    examples: ["docker logs -f my_container", "docker logs --tail 100 -f my_container"],
    parameters: [
      { name: "-f", description: "持续跟踪日志输出" },
      { name: "--tail", description: "显示最后 N 行日志" },
    ],
    notes: null,
  },
  {
    id: "cmd_docker_prune",
    title: "清理未使用资源",
    command: "docker system prune",
    description: "删除未使用的容器、网络、镜像，可选清理卷",
    platformId: "platform_docker",
    categoryId: "cat_docker_cleanup",
    tags: ["清理", "释放", "磁盘"],
    examples: [
      "docker system prune",
      "docker system prune -a --volumes",
    ],
    parameters: [
      { name: "-a", description: "删除所有未使用的镜像（不仅是悬空的）" },
      { name: "--volumes", description: "同时清理卷" },
    ],
    notes: "此操作不可恢复，请谨慎使用。",
  },
  // ==================== Claude Code ====================
  {
    id: "cmd_claude_init",
    title: "初始化项目",
    command: "claude init",
    description: "使用 Claude Code 初始化一个新项目",
    platformId: "platform_claude_code",
    categoryId: "cat_claude_common",
    tags: ["初始化", "配置", "项目"],
    examples: ["claude init", "claude init --template react"],
    parameters: [
      { name: "--template", description: "使用项目模板" },
    ],
    notes: null,
  },
  {
    id: "cmd_claude_config_set",
    title: "设置配置",
    command: "claude config set",
    description: "设置 Claude Code 的配置项",
    platformId: "platform_claude_code",
    categoryId: "cat_claude_config",
    tags: ["配置", "设置"],
    examples: [
      "claude config set model claude-sonnet-4-20250514",
      "claude config set theme dark",
    ],
    parameters: [
      { name: "key", description: "要设置的配置项名称" },
      { name: "value", description: "配置值" },
    ],
    notes: null,
  },
  {
    id: "cmd_claude_review",
    title: "代码审查",
    command: "claude review",
    description: "使用 Claude Code 审查代码变更",
    platformId: "platform_claude_code",
    categoryId: "cat_claude_workflow",
    tags: ["审查", "代码", "PR"],
    examples: [
      "claude review",
      "claude review --pr 123",
    ],
    parameters: [
      { name: "--pr", description: "审查指定的 Pull Request" },
    ],
    notes: null,
  },
  {
    id: "cmd_claude_commit",
    title: "生成提交信息",
    command: "claude commit",
    description: "为暂存的变更生成提交信息",
    platformId: "platform_claude_code",
    categoryId: "cat_claude_workflow",
    tags: ["提交", "git", "信息"],
    examples: ["claude commit", "claude commit --amend"],
    parameters: [
      { name: "--amend", description: "修改最近一次提交" },
    ],
    notes: null,
  },
  // ==================== CLI ====================
  {
    id: "cmd_cli_cd",
    title: "切换目录",
    command: "cd",
    description: "切换当前工作目录",
    platformId: "platform_cli",
    categoryId: "cat_cli_navigation",
    tags: ["导航", "目录"],
    examples: ["cd /usr/local", "cd ..", "cd ~"],
    parameters: [
      { name: "path", description: "目标目录路径" },
    ],
    notes: null,
  },
  {
    id: "cmd_cli_ls",
    title: "列出目录内容",
    command: "ls",
    description: "列出当前位置的文件和目录",
    platformId: "platform_cli",
    categoryId: "cat_cli_files",
    tags: ["列表", "文件", "目录"],
    examples: ["ls -la", "ls -lh /var/log"],
    parameters: [
      { name: "-l", description: "使用长列表格式" },
      { name: "-a", description: "显示隐藏文件" },
      { name: "-h", description: "以人类可读的格式显示文件大小" },
    ],
    notes: null,
  },
  {
    id: "cmd_cli_grep",
    title: "搜索文本模式",
    command: "grep",
    description: "在文件中搜索匹配的文本模式",
    platformId: "platform_cli",
    categoryId: "cat_cli_text",
    tags: ["搜索", "文本", "模式"],
    examples: [
      "grep -r 'TODO' .",
      "grep -i 'error' /var/log/syslog",
    ],
    parameters: [
      { name: "-r", description: "递归搜索" },
      { name: "-i", description: "忽略大小写" },
      { name: "-n", description: "显示行号" },
    ],
    notes: null,
  },
  {
    id: "cmd_cli_find",
    title: "查找文件",
    command: "find",
    description: "在目录层级中搜索文件",
    platformId: "platform_cli",
    categoryId: "cat_cli_files",
    tags: ["搜索", "文件", "查找"],
    examples: [
      "find . -name '*.ts'",
      "find /tmp -mtime -1 -type f",
    ],
    parameters: [
      { name: "-name", description: "按文件名模式搜索" },
      { name: "-mtime", description: "按修改时间搜索（天数）" },
      { name: "-type", description: "按文件类型搜索（f=文件, d=目录）" },
    ],
    notes: null,
  },
  {
    id: "cmd_cli_top",
    title: "系统监控",
    command: "top",
    description: "显示系统进程和资源使用情况",
    platformId: "platform_cli",
    categoryId: "cat_cli_system",
    tags: ["系统", "进程", "监控"],
    examples: ["top", "top -o cpu"],
    parameters: [
      { name: "-o", description: "按指定字段排序（cpu、mem）" },
    ],
    notes: null,
  },
  // ==================== OpenCode ====================
  {
    id: "cmd_opencode_open",
    title: "打开项目",
    command: "opencode .",
    description: "在 OpenCode 中打开当前目录作为项目",
    platformId: "platform_opencode",
    categoryId: "cat_opencode_common",
    tags: ["打开", "项目"],
    examples: ["opencode .", "opencode /path/to/project"],
    parameters: [
      { name: "path", description: "项目目录路径" },
    ],
    notes: null,
  },
  {
    id: "cmd_opencode_create",
    title: "创建新项目",
    command: "opencode create",
    description: "从模板创建一个新项目",
    platformId: "platform_opencode",
    categoryId: "cat_opencode_project",
    tags: ["创建", "模板", "项目"],
    examples: ["opencode create my-app", "opencode create --template react my-app"],
    parameters: [
      { name: "--template", description: "使用的项目模板" },
    ],
    notes: null,
  },
  {
    id: "cmd_opencode_dev",
    title: "启动开发服务器",
    command: "opencode dev",
    description: "启动当前项目的开发服务器",
    platformId: "platform_opencode",
    categoryId: "cat_opencode_common",
    tags: ["开发", "服务器", "调试"],
    examples: ["opencode dev", "opencode dev --port 3000"],
    parameters: [
      { name: "--port", description: "指定端口号" },
    ],
    notes: null,
  },
  // ==================== Git ====================
  {
    id: "cmd_git_clone",
    title: "克隆仓库",
    command: "git clone",
    description: "将远程仓库克隆到本地新目录",
    platformId: "platform_git",
    categoryId: "cat_git_remote",
    tags: ["克隆", "仓库", "远程"],
    examples: ["git clone https://github.com/user/repo.git", "git clone --depth 1 URL"],
    parameters: [
      { name: "--depth", description: "创建指定深度的浅克隆" },
      { name: "-b", description: "克隆指定分支" },
    ],
    notes: null,
  },
  {
    id: "cmd_git_status",
    title: "查看工作区状态",
    command: "git status",
    description: "显示工作目录和暂存区的状态",
    platformId: "platform_git",
    categoryId: "cat_git_basic",
    tags: ["状态", "工作区", "树"],
    examples: ["git status", "git status -s"],
    parameters: [
      { name: "-s", description: "以简短格式输出" },
    ],
    notes: null,
  },
  {
    id: "cmd_git_commit",
    title: "提交变更",
    command: "git commit",
    description: "将变更记录到仓库",
    platformId: "platform_git",
    categoryId: "cat_git_basic",
    tags: ["提交", "保存", "记录"],
    examples: [
      'git commit -m "feat: add new feature"',
      "git commit -am 'fix: bug fix'",
    ],
    parameters: [
      { name: "-m", description: "使用指定信息作为提交消息" },
      { name: "-a", description: "自动暂存已修改的文件" },
      { name: "--amend", description: "替换当前分支的最新提交" },
    ],
    notes: null,
  },
  {
    id: "cmd_git_branch",
    title: "管理分支",
    command: "git branch",
    description: "列出、创建或删除分支",
    platformId: "platform_git",
    categoryId: "cat_git_branch",
    tags: ["分支", "列表", "创建"],
    examples: [
      "git branch",
      "git branch feature/new-ui",
      "git branch -d old-branch",
    ],
    parameters: [
      { name: "-d", description: "删除分支" },
      { name: "-a", description: "列出远程跟踪分支和本地分支" },
    ],
    notes: null,
  },
  {
    id: "cmd_git_stash",
    title: "暂存变更",
    command: "git stash",
    description: "将工作区的变更暂存起来",
    platformId: "platform_git",
    categoryId: "cat_git_advanced",
    tags: ["暂存", "保存", "临时"],
    examples: [
      "git stash",
      "git stash pop",
      "git stash list",
    ],
    parameters: [
      { name: "pop", description: "应用并删除最近一次暂存" },
      { name: "list", description: "列出所有暂存" },
      { name: "apply", description: "应用暂存但不删除" },
    ],
    notes: null,
  },
  // ==================== Kubernetes ====================
  {
    id: "cmd_k8s_get_pods",
    title: "查看 Pod 列表",
    command: "kubectl get pods",
    description: "列出当前命名空间中的所有 Pod",
    platformId: "platform_kubernetes",
    categoryId: "cat_k8s_pods",
    tags: ["Pod", "列表", "K8s"],
    examples: [
      "kubectl get pods",
      "kubectl get pods -n kube-system",
      "kubectl get pods -o wide",
    ],
    parameters: [
      { name: "-n", description: "指定命名空间" },
      { name: "-o wide", description: "显示更多详细信息" },
      { name: "-A", description: "列出所有命名空间的 Pod" },
    ],
    notes: null,
  },
  {
    id: "cmd_k8s_apply",
    title: "应用配置",
    command: "kubectl apply",
    description: "通过文件名将配置应用到资源",
    platformId: "platform_kubernetes",
    categoryId: "cat_k8s_deploy",
    tags: ["应用", "部署", "配置"],
    examples: [
      "kubectl apply -f deployment.yaml",
      "kubectl apply -f .",
    ],
    parameters: [
      { name: "-f", description: "要应用的文件、目录或 URL" },
      { name: "-R", description: "递归处理 -f 指定的目录" },
    ],
    notes: null,
  },
  {
    id: "cmd_k8s_describe",
    title: "查看资源详情",
    command: "kubectl describe",
    description: "显示指定资源或资源组的详细信息",
    platformId: "platform_kubernetes",
    categoryId: "cat_k8s_debug",
    tags: ["详情", "信息", "调试"],
    examples: [
      "kubectl describe pod my-pod",
      "kubectl describe deployment my-deploy",
    ],
    parameters: [
      { name: "resource", description: "资源类型（pod、service、deployment 等）" },
      { name: "name", description: "资源名称" },
    ],
    notes: null,
  },
  {
    id: "cmd_k8s_logs",
    title: "查看 Pod 日志",
    command: "kubectl logs",
    description: "打印 Pod 中容器的日志",
    platformId: "platform_kubernetes",
    categoryId: "cat_k8s_debug",
    tags: ["日志", "调试", "Pod"],
    examples: [
      "kubectl logs my-pod",
      "kubectl logs -f my-pod",
      "kubectl logs my-pod -c my-container",
    ],
    parameters: [
      { name: "-f", description: "持续跟踪日志输出" },
      { name: "-c", description: "指定容器名称" },
      { name: "--tail", description: "显示最后 N 行日志" },
    ],
    notes: null,
  },
  // ==================== Homebrew ====================
  {
    id: "cmd_brew_install",
    title: "安装软件包",
    command: "brew install",
    description: "安装 Formula 或 Cask",
    platformId: "platform_homebrew",
    categoryId: "cat_brew_install",
    tags: ["安装", "软件包"],
    examples: [
      "brew install git",
      "brew install --cask google-chrome",
    ],
    parameters: [
      { name: "--cask", description: "安装 Cask（GUI 应用）" },
    ],
    notes: null,
  },
  {
    id: "cmd_brew_update",
    title: "更新 Homebrew",
    command: "brew update",
    description: "获取 Homebrew 和所有 Formula 的最新版本",
    platformId: "platform_homebrew",
    categoryId: "cat_brew_manage",
    tags: ["更新", "升级"],
    examples: ["brew update", "brew update && brew upgrade"],
    parameters: [],
    notes: null,
  },
  {
    id: "cmd_brew_search",
    title: "搜索软件包",
    command: "brew search",
    description: "搜索 Formula 和 Cask",
    platformId: "platform_homebrew",
    categoryId: "cat_brew_manage",
    tags: ["搜索", "查找"],
    examples: ["brew search wget", "brew search --cask chrome"],
    parameters: [
      { name: "--cask", description: "仅搜索 Cask" },
      { name: "--formula", description: "仅搜索 Formula" },
    ],
    notes: null,
  },
  {
    id: "cmd_brew_list",
    title: "列出已安装软件包",
    command: "brew list",
    description: "列出所有已安装的 Formula 和 Cask",
    platformId: "platform_homebrew",
    categoryId: "cat_brew_manage",
    tags: ["列表", "已安装"],
    examples: ["brew list", "brew list --formula"],
    parameters: [
      { name: "--formula", description: "仅列出 Formula" },
      { name: "--cask", description: "仅列出 Cask" },
    ],
    notes: null,
  },
  // ==================== Node.js ====================
  {
    id: "cmd_node_npm_init",
    title: "初始化项目",
    command: "npm init",
    description: "初始化一个新的 Node.js 项目",
    platformId: "platform_nodejs",
    categoryId: "cat_node_npm",
    tags: ["初始化", "项目", "npm"],
    examples: ["npm init", "npm init -y"],
    parameters: [
      { name: "-y", description: "跳过问答并使用默认值" },
    ],
    notes: null,
  },
  {
    id: "cmd_node_npm_install",
    title: "安装依赖",
    command: "npm install",
    description: "安装项目依赖",
    platformId: "platform_nodejs",
    categoryId: "cat_node_npm",
    tags: ["安装", "依赖", "npm"],
    examples: [
      "npm install",
      "npm install express",
      "npm install -D typescript",
    ],
    parameters: [
      { name: "-D", description: "安装为开发依赖" },
      { name: "-g", description: "全局安装" },
    ],
    notes: null,
  },
  {
    id: "cmd_node_npm_run",
    title: "运行脚本",
    command: "npm run",
    description: "运行 package.json 中定义的脚本",
    platformId: "platform_nodejs",
    categoryId: "cat_node_script",
    tags: ["运行", "脚本", "npm"],
    examples: ["npm run build", "npm run test", "npm run dev"],
    parameters: [
      { name: "script", description: "要运行的脚本名称" },
    ],
    notes: null,
  },
  {
    id: "cmd_node_debug",
    title: "调试 Node.js",
    command: "node --inspect",
    description: "启动 Node.js 并启用调试器",
    platformId: "platform_nodejs",
    categoryId: "cat_node_debug",
    tags: ["调试", "检查"],
    examples: ["node --inspect app.js", "node --inspect-brk app.js"],
    parameters: [
      { name: "--inspect", description: "在默认端口 9229 上启用检查器" },
      { name: "--inspect-brk", description: "启用检查器并在脚本启动前暂停" },
    ],
    notes: "可通过 chrome://inspect 连接 Chrome DevTools",
  },
  // ==================== Python ====================
  {
    id: "cmd_python_pip_install",
    title: "安装软件包",
    command: "pip install",
    description: "安装 Python 软件包",
    platformId: "platform_python",
    categoryId: "cat_python_pip",
    tags: ["安装", "pip", "软件包"],
    examples: [
      "pip install requests",
      "pip install -r requirements.txt",
      "pip install --user numpy",
    ],
    parameters: [
      { name: "-r", description: "从 requirements 文件安装" },
      { name: "--user", description: "安装到用户目录" },
      { name: "-U", description: "升级软件包到最新版本" },
    ],
    notes: null,
  },
  {
    id: "cmd_python_venv",
    title: "创建虚拟环境",
    command: "python -m venv",
    description: "创建 Python 虚拟环境",
    platformId: "platform_python",
    categoryId: "cat_python_venv",
    tags: ["虚拟环境", "隔离", "依赖"],
    examples: [
      "python -m venv .venv",
      "python -m venv --system-site-packages .venv",
    ],
    parameters: [
      { name: "--system-site-packages", description: "允许访问全局 site-packages" },
    ],
    notes: "激活方式：source .venv/bin/activate",
  },
  {
    id: "cmd_python_run",
    title: "运行 Python 脚本",
    command: "python",
    description: "运行 Python 脚本或模块",
    platformId: "platform_python",
    categoryId: "cat_python_script",
    tags: ["运行", "脚本"],
    examples: ["python app.py", "python -m module_name"],
    parameters: [
      { name: "-m", description: "以脚本方式运行模块" },
      { name: "-u", description: "强制 stdout/stderr 不缓冲" },
    ],
    notes: null,
  },
  {
    id: "cmd_python_pip_freeze",
    title: "列出已安装软件包",
    command: "pip freeze",
    description: "以 requirements 格式列出已安装的软件包",
    platformId: "platform_python",
    categoryId: "cat_python_pip",
    tags: ["列表", "软件包", "依赖"],
    examples: ["pip freeze", "pip freeze > requirements.txt"],
    parameters: [],
    notes: null,
  },
  // ==================== Shell ====================
  {
    id: "cmd_shell_chmod",
    title: "修改文件权限",
    command: "chmod",
    description: "修改文件模式位",
    platformId: "platform_shell",
    categoryId: "cat_shell_file",
    tags: ["权限", "chmod", "文件"],
    examples: [
      "chmod +x script.sh",
      "chmod 755 file",
      "chmod -R 644 directory/",
    ],
    parameters: [
      { name: "-R", description: "递归应用" },
      { name: "+x", description: "添加执行权限" },
    ],
    notes: null,
  },
  {
    id: "cmd_shell_tar",
    title: "归档文件",
    command: "tar",
    description: "创建或解压归档文件",
    platformId: "platform_shell",
    categoryId: "cat_shell_file",
    tags: ["归档", "压缩", "tar"],
    examples: [
      "tar -czf archive.tar.gz directory/",
      "tar -xzf archive.tar.gz",
    ],
    parameters: [
      { name: "-c", description: "创建新归档" },
      { name: "-x", description: "从归档中提取文件" },
      { name: "-z", description: "通过 gzip 过滤" },
      { name: "-f", description: "指定归档文件" },
    ],
    notes: null,
  },
  {
    id: "cmd_shell_grep_recursive",
    title: "递归搜索文本",
    command: "grep -r",
    description: "在目录中递归搜索文本模式",
    platformId: "platform_shell",
    categoryId: "cat_shell_search",
    tags: ["搜索", "grep", "递归"],
    examples: [
      "grep -r 'pattern' .",
      "grep -rn 'TODO' src/",
      "grep -ri 'error' logs/",
    ],
    parameters: [
      { name: "-r", description: "递归搜索" },
      { name: "-n", description: "显示行号" },
      { name: "-i", description: "忽略大小写" },
    ],
    notes: null,
  },
  {
    id: "cmd_shell_kill",
    title: "终止进程",
    command: "kill",
    description: "向进程发送信号",
    platformId: "platform_shell",
    categoryId: "cat_shell_process",
    tags: ["进程", "终止", "信号"],
    examples: [
      "kill 1234",
      "kill -9 1234",
      "killall node",
    ],
    parameters: [
      { name: "-9", description: "SIGKILL 信号（强制终止）" },
      { name: "-15", description: "SIGTERM 信号（默认，优雅终止）" },
    ],
    notes: null,
  },
  {
    id: "cmd_shell_curl",
    title: "HTTP 请求",
    command: "curl",
    description: "与服务器传输数据",
    platformId: "platform_shell",
    categoryId: "cat_shell_network",
    tags: ["HTTP", "请求", "API"],
    examples: [
      "curl https://api.example.com",
      "curl -X POST -d '{}' -H 'Content-Type: application/json' URL",
      "curl -O https://example.com/file.zip",
    ],
    parameters: [
      { name: "-X", description: "HTTP 方法（GET、POST、PUT、DELETE）" },
      { name: "-d", description: "请求体数据" },
      { name: "-H", description: "请求头" },
      { name: "-O", description: "将输出保存到文件" },
    ],
    notes: null,
  },
];

export async function seedIfEmpty(db: Database): Promise<void> {
  const rows = await db.select<{ count: number }[]>(
    "SELECT COUNT(*) as count FROM platforms"
  );

  if (rows[0]?.count > 0) {
    return;
  }

  const now = new Date().toISOString();

  // Insert platforms
  for (const p of platforms) {
    await db.execute(
      `INSERT INTO platforms (id, name, icon, color, description, sort_order, is_visible, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, 1, $7, $7)`,
      [p.id, p.name, p.icon, p.color, p.description, p.sortOrder, now]
    );
  }

  // Insert categories
  for (const c of categories) {
    await db.execute(
      `INSERT INTO categories (id, platform_id, name, sort_order)
       VALUES ($1, $2, $3, $4)`,
      [c.id, c.platformId, c.name, c.sortOrder]
    );
  }

  // Insert commands with related data
  for (const cmd of commands) {
    await db.execute(
      `INSERT INTO commands (id, title, command, description, platform_id, category_id, notes, is_favorite, usage_count, last_used_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 0, NULL, $8, $8)`,
      [cmd.id, cmd.title, cmd.command, cmd.description, cmd.platformId, cmd.categoryId, cmd.notes, now]
    );

    // Insert tags (upsert to avoid duplicates)
    for (const tagName of cmd.tags) {
      const tagId = `tag_${tagName}`;
      await db.execute(
        `INSERT OR IGNORE INTO tags (id, name) VALUES ($1, $2)`,
        [tagId, tagName]
      );
      await db.execute(
        `INSERT OR IGNORE INTO command_tags (command_id, tag_id) VALUES ($1, $2)`,
        [cmd.id, tagId]
      );
    }

    // Insert examples
    for (let i = 0; i < cmd.examples.length; i++) {
      await db.execute(
        `INSERT INTO command_examples (id, command_id, example, sort_order)
         VALUES ($1, $2, $3, $4)`,
        [`${cmd.id}_ex_${i}`, cmd.id, cmd.examples[i], i]
      );
    }

    // Insert parameters
    for (let i = 0; i < cmd.parameters.length; i++) {
      await db.execute(
        `INSERT INTO command_parameters (id, command_id, name, description, sort_order)
         VALUES ($1, $2, $3, $4, $5)`,
        [`${cmd.id}_param_${i}`, cmd.id, cmd.parameters[i].name, cmd.parameters[i].description, i]
      );
    }
  }
}

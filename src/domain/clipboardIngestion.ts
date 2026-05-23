/**
 * Smart clipboard ingestion: detect CLI commands and suggest platform.
 */

interface ClipboardAnalysis {
  isCliCommand: boolean;
  commandText: string | null;
  suggestedPlatformName: string | null;
}

const MAX_LINES = 5;
const MAX_LINE_LENGTH = 500;

// CLI prefixes for platform matching (lowercase)
const PLATFORM_HINTS: Record<string, string[]> = {
  git: ["git"],
  docker: ["docker", "podman"],
  kubernetes: ["kubectl", "helm", "k9s"],
  node: ["npm", "yarn", "pnpm", "npx", "node"],
  ssh: ["ssh", "scp", "rsync"],
  http: ["curl", "wget"],
  python: ["python", "pip", "conda", "poetry"],
  rust: ["cargo", "rustc", "rustup"],
  go: ["go "],
  brew: ["brew"],
  aws: ["aws"],
  gcloud: ["gcloud"],
  azure: ["az "],
  terraform: ["terraform"],
};

// Known CLI command prefixes
const CLI_PREFIXES = [
  "git",
  "docker",
  "kubectl",
  "helm",
  "npm",
  "yarn",
  "pnpm",
  "npx",
  "node",
  "python",
  "pip",
  "conda",
  "poetry",
  "cargo",
  "rustc",
  "rustup",
  "go",
  "curl",
  "wget",
  "ssh",
  "scp",
  "rsync",
  "chmod",
  "chown",
  "mkdir",
  "rm",
  "cp",
  "mv",
  "ls",
  "cat",
  "grep",
  "awk",
  "sed",
  "find",
  "tar",
  "zip",
  "unzip",
  "brew",
  "apt",
  "yum",
  "systemctl",
  "crontab",
  "openssl",
  "mysql",
  "psql",
  "redis-cli",
  "mongosh",
  "aws",
  "gcloud",
  "az",
  "terraform",
  "ansible",
  "make",
  "cmake",
  "docker-compose",
  "podman",
  "minikube",
  "kind",
  "k9s",
  "stern",
  "jq",
  "xargs",
];

// CLI symbols that indicate command-line content
const CLI_SYMBOLS = ["|", "&&", ">>", ">", "--", "-"];

function isCliCommand(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;

  // Line count check
  const lines = trimmed.split("\n");
  if (lines.length > MAX_LINES) return false;

  // Single line length check
  if (lines.some((l) => l.length > MAX_LINE_LENGTH)) return false;

  // Check for CLI symbols
  if (CLI_SYMBOLS.some((sym) => trimmed.includes(sym))) return true;

  // Check for CLI prefix
  const firstWord = trimmed.split(/\s+/)[0].toLowerCase();
  if (CLI_PREFIXES.includes(firstWord)) return true;

  // Check if first line starts with a known prefix
  const firstLine = lines[0].trim().toLowerCase();
  if (CLI_PREFIXES.some((prefix) => firstLine.startsWith(prefix + " "))) return true;

  return false;
}

function suggestPlatform(text: string): string | null {
  const trimmed = text.trim().toLowerCase();
  for (const [platform, hints] of Object.entries(PLATFORM_HINTS)) {
    for (const hint of hints) {
      if (trimmed.startsWith(hint)) {
        // Return the platform key — caller maps to actual platform name
        return platform;
      }
    }
  }
  return null;
}

/**
 * Map platform hint key to a display name for matching against user's platforms.
 * Returns a lowercase name to match against platform.name.toLowerCase().
 */
export function getPlatformHintName(hintKey: string): string {
  const nameMap: Record<string, string> = {
    git: "git",
    docker: "docker",
    kubernetes: "kubernetes",
    node: "node.js",
    ssh: "ssh",
    http: "http",
    python: "python",
    rust: "rust",
    go: "go",
    brew: "brew",
    aws: "aws",
    gcloud: "gcloud",
    azure: "azure",
    terraform: "terraform",
  };
  return nameMap[hintKey] ?? hintKey;
}

export function analyzeClipboard(text: string): ClipboardAnalysis {
  if (!isCliCommand(text)) {
    return { isCliCommand: false, commandText: null, suggestedPlatformName: null };
  }

  const trimmed = text.trim();
  const hintKey = suggestPlatform(trimmed);
  const platformName = hintKey ? getPlatformHintName(hintKey) : null;

  return {
    isCliCommand: true,
    commandText: trimmed,
    suggestedPlatformName: platformName,
  };
}

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CommandCard } from "./CommandCard";
import type { Command } from "../../domain/types";

// Mock Tauri clipboard plugin
vi.mock("@tauri-apps/plugin-clipboard-manager", () => ({
  writeText: vi.fn().mockResolvedValue(undefined),
}));

// Mock command repository
vi.mock("../../data/repositories/commandRepository", () => ({
  recordCommandCopied: vi.fn().mockResolvedValue(undefined),
  toggleFavorite: vi.fn().mockResolvedValue(undefined),
}));

// Mock toast
vi.mock("../common/Toast", () => ({
  toast: vi.fn(),
}));

// Mock MoreMenu to render a simple button with items
vi.mock("../common/MoreMenu", () => ({
  MoreMenu: ({ items }: { items: Array<{ id: string; label: string; onClick: () => void }> }) => (
    <div>
      {items.map((item) => (
        <button key={item.id} onClick={item.onClick}>
          {item.label}
        </button>
      ))}
    </div>
  ),
}));

// Mock IconButton to render a simple button
vi.mock("../common/IconButton", () => ({
  IconButton: ({
    onClick,
    tooltip,
    icon,
  }: {
    onClick: () => void;
    tooltip: string;
    icon: React.ReactNode;
  }) => (
    <button onClick={onClick} aria-label={tooltip}>
      {icon}
    </button>
  ),
}));

// Mock CommandCodeBlock
vi.mock("./CommandCodeBlock", () => ({
  CommandCodeBlock: ({ code }: { code: string }) => <pre data-testid="code-block">{code}</pre>,
}));

function makeCommand(overrides: Partial<Command> = {}): Command {
  return {
    id: "test-1",
    title: "Git Push",
    command: "git push origin main",
    description: "Push changes to remote",
    platformId: "platform_git",
    platformName: "Git",
    categoryId: "cat_1",
    categoryName: "Version Control",
    tags: ["remote", "push"],
    examples: [],
    parameters: [],
    notes: null,
    isFavorite: false,
    usageCount: 0,
    lastUsedAt: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function renderWithQueryClient(ui: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("CommandCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders command title", () => {
    const command = makeCommand();
    renderWithQueryClient(<CommandCard command={command} />);
    expect(screen.getByText("Git Push")).toBeInTheDocument();
  });

  it("renders command code", () => {
    const command = makeCommand();
    renderWithQueryClient(<CommandCard command={command} />);
    expect(screen.getByTestId("code-block")).toHaveTextContent("git push origin main");
  });

  it("renders description", () => {
    const command = makeCommand();
    renderWithQueryClient(<CommandCard command={command} />);
    expect(screen.getByText("Push changes to remote")).toBeInTheDocument();
  });

  it("renders platform name and category name in meta", () => {
    const command = makeCommand();
    renderWithQueryClient(<CommandCard command={command} />);
    // The meta span contains "Git · Version Control · remote · push"
    expect(screen.getByText(/Git · Version Control/)).toBeInTheDocument();
  });

  it("renders tags in meta", () => {
    const command = makeCommand({
      tags: ["deployment", "ci-cd"],
    });
    renderWithQueryClient(<CommandCard command={command} />);
    expect(screen.getByText(/deployment/)).toBeInTheDocument();
    expect(screen.getByText(/ci-cd/)).toBeInTheDocument();
  });

  it("renders copy button", () => {
    const command = makeCommand();
    renderWithQueryClient(<CommandCard command={command} />);
    expect(screen.getByRole("button", { name: "复制" })).toBeInTheDocument();
  });

  it("calls toggleFavorite when favorite button is clicked", async () => {
    const { toggleFavorite } = await import("../../data/repositories/commandRepository");
    const command = makeCommand();
    const user = userEvent.setup();
    renderWithQueryClient(<CommandCard command={command} />);
    const favButton = screen.getByRole("button", { name: "收藏" });
    await user.click(favButton);
    expect(toggleFavorite).toHaveBeenCalledWith("test-1");
  });

  it("calls writeText and recordCommandCopied when copy button is clicked", async () => {
    const { writeText } = await import("@tauri-apps/plugin-clipboard-manager");
    const { recordCommandCopied } = await import("../../data/repositories/commandRepository");
    const command = makeCommand();
    const user = userEvent.setup();
    renderWithQueryClient(<CommandCard command={command} />);
    const copyButton = screen.getByRole("button", { name: "复制" });
    await user.click(copyButton);
    expect(writeText).toHaveBeenCalledWith("git push origin main");
    expect(recordCommandCopied).toHaveBeenCalledWith("test-1");
  });
});

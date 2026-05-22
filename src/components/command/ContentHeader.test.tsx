import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ContentHeader } from "./ContentHeader";
import { useUiStore } from "../../state/uiStore";

// Mock platform repository
vi.mock("../../data/repositories/platformRepository", () => ({
  listPlatforms: vi.fn().mockResolvedValue([
    {
      id: "platform_git",
      name: "Git",
      icon: "git",
      color: "#F05032",
      description: null,
      sortOrder: 0,
      isVisible: true,
      commandCount: 10,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    },
  ]),
}));

function renderWithQueryClient(ui: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe("ContentHeader", () => {
  beforeEach(() => {
    // Reset store to defaults
    useUiStore.setState({
      navType: "platform",
      currentPlatformId: null,
      searchQuery: "",
    });
  });

  it("shows platform name when navType is platform and platform is selected", async () => {
    useUiStore.setState({
      navType: "platform",
      currentPlatformId: "platform_git",
    });
    renderWithQueryClient(<ContentHeader count={5} />);
    // Wait for query to resolve
    expect(await screen.findByText("Git")).toBeInTheDocument();
    expect(screen.getByText(/5 条命令/)).toBeInTheDocument();
  });

  it("shows correct title for all commands view", () => {
    useUiStore.setState({ navType: "all", searchQuery: "" });
    renderWithQueryClient(<ContentHeader count={10} />);
    expect(screen.getByText("全部命令")).toBeInTheDocument();
    expect(screen.getByText(/10 条命令/)).toBeInTheDocument();
  });

  it("shows search query in title", () => {
    useUiStore.setState({ searchQuery: "git push" });
    renderWithQueryClient(<ContentHeader count={3} />);
    expect(
      screen.getByText("搜索结果：git push")
    ).toBeInTheDocument();
    expect(screen.getByText(/3 条结果/)).toBeInTheDocument();
  });

  it("shows favorites title", () => {
    useUiStore.setState({ navType: "favorites", searchQuery: "" });
    renderWithQueryClient(<ContentHeader count={2} />);
    expect(screen.getByText("收藏")).toBeInTheDocument();
  });

  it("shows recent title", () => {
    useUiStore.setState({ navType: "recent", searchQuery: "" });
    renderWithQueryClient(<ContentHeader count={4} />);
    expect(screen.getByText("最近使用")).toBeInTheDocument();
  });
});

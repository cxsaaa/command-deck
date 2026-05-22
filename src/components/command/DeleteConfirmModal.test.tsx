import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import * as commandRepository from "../../data/repositories/commandRepository";

// Mock command repository
vi.mock("../../data/repositories/commandRepository", () => ({
  deleteCommand: vi.fn().mockResolvedValue(undefined),
}));

// Mock toast
vi.mock("../common/Toast", () => ({
  toast: vi.fn(),
}));

// Mock IconButton (used by Modal close button via lucide X icon)
vi.mock("../common/IconButton", () => ({
  IconButton: (props: { onClick: () => void; tooltip: string }) => (
    <button onClick={props.onClick} aria-label={props.tooltip}>
      {props.tooltip}
    </button>
  ),
}));

function renderWithQueryClient(ui: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe("DeleteConfirmModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows confirmation text when open", () => {
    renderWithQueryClient(
      <DeleteConfirmModal
        open={true}
        commandId="cmd-1"
        onClose={() => {}}
      />
    );
    expect(screen.getByText("确定删除这条命令吗？")).toBeInTheDocument();
    expect(screen.getByText("删除后不可恢复。")).toBeInTheDocument();
  });

  it("does not show content when closed", () => {
    renderWithQueryClient(
      <DeleteConfirmModal
        open={false}
        commandId="cmd-1"
        onClose={() => {}}
      />
    );
    expect(
      screen.queryByText("确定删除这条命令吗？")
    ).not.toBeInTheDocument();
  });

  it("calls onClose when cancel button is clicked", async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();
    renderWithQueryClient(
      <DeleteConfirmModal
        open={true}
        commandId="cmd-1"
        onClose={handleClose}
      />
    );
    const cancelButton = screen.getByRole("button", { name: "取消" });
    await user.click(cancelButton);
    expect(handleClose).toHaveBeenCalledOnce();
  });

  it("calls deleteCommand when delete button is clicked", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(
      <DeleteConfirmModal
        open={true}
        commandId="cmd-1"
        onClose={() => {}}
      />
    );
    const deleteButton = screen.getByRole("button", { name: "删除" });
    await user.click(deleteButton);
    await waitFor(() => {
      expect(commandRepository.deleteCommand).toHaveBeenCalledWith("cmd-1");
    });
  });

  it("renders cancel and delete buttons", () => {
    renderWithQueryClient(
      <DeleteConfirmModal
        open={true}
        commandId="cmd-1"
        onClose={() => {}}
      />
    );
    expect(screen.getByRole("button", { name: "取消" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "删除" })).toBeInTheDocument();
  });
});

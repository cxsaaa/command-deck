import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("renders title", () => {
    render(<EmptyState title="No items found" />);
    expect(screen.getByText("No items found")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<EmptyState title="No items" description="Try adding a new item" />);
    expect(screen.getByText("Try adding a new item")).toBeInTheDocument();
  });

  it("renders action button and handles click", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<EmptyState title="No items" action={{ label: "Add Item", onClick: handleClick }} />);
    const button = screen.getByRole("button", { name: "Add Item" });
    expect(button).toBeInTheDocument();
    await user.click(button);
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("does not render description when not provided", () => {
    const { container } = render(<EmptyState title="No items" />);
    const paragraphs = container.querySelectorAll("p");
    expect(paragraphs).toHaveLength(0);
  });

  it("does not render action button when not provided", () => {
    render(<EmptyState title="No items" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

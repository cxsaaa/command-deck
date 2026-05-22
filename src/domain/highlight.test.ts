import { describe, it, expect } from "vitest";
import { highlightText } from "./highlight";

describe("highlightText", () => {
  it("returns original text when query is empty", () => {
    const result = highlightText("git push origin", "");
    expect(result).toEqual(["git push origin"]);
  });

  it("wraps matching text in mark elements", () => {
    const result = highlightText("git push origin", "push");
    expect(result).toHaveLength(3);
    expect(result[0]).toBe("git ");
    expect(result[1]).toBeDefined(); // <mark>push</mark>
    expect(result[2]).toBe(" origin");
  });

  it("is case-insensitive", () => {
    const result = highlightText("Docker Run", "docker");
    expect(result).toHaveLength(3);
  });

  it("handles multiple matches", () => {
    const result = highlightText("git push && git pull", "git");
    expect(result).toHaveLength(5);
  });

  it("handles query not found", () => {
    const result = highlightText("hello world", "xyz");
    expect(result).toEqual(["hello world"]);
  });

  it("handles query at start", () => {
    const result = highlightText("push to remote", "push");
    // ["", <mark>push</mark>, " to remote"]
    expect(result).toHaveLength(3);
  });

  it("handles query at end", () => {
    const result = highlightText("git push", "push");
    // ["git ", <mark>push</mark>, ""]
    expect(result).toHaveLength(3);
  });
});

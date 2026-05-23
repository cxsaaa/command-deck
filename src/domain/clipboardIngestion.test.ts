import { describe, it, expect } from "vitest";
import { analyzeClipboard, getPlatformHintName } from "./clipboardIngestion";

describe("analyzeClipboard", () => {
  describe("CLI command detection", () => {
    it("detects git commands", () => {
      const result = analyzeClipboard("git status");
      expect(result.isCliCommand).toBe(true);
      expect(result.commandText).toBe("git status");
      expect(result.suggestedPlatformName).toBe("git");
    });

    it("detects docker commands", () => {
      const result = analyzeClipboard("docker ps -a");
      expect(result.isCliCommand).toBe(true);
      expect(result.suggestedPlatformName).toBe("docker");
    });

    it("detects kubectl commands", () => {
      const result = analyzeClipboard("kubectl get pods");
      expect(result.isCliCommand).toBe(true);
      expect(result.suggestedPlatformName).toBe("kubernetes");
    });

    it("detects npm commands", () => {
      const result = analyzeClipboard("npm install express");
      expect(result.isCliCommand).toBe(true);
      expect(result.suggestedPlatformName).toBe("node.js");
    });

    it("detects commands with pipes", () => {
      const result = analyzeClipboard("cat file.txt | grep hello");
      expect(result.isCliCommand).toBe(true);
      expect(result.suggestedPlatformName).toBeNull();
    });

    it("detects commands with flags", () => {
      const result = analyzeClipboard("ls -la --color=auto");
      expect(result.isCliCommand).toBe(true);
    });

    it("detects curl commands", () => {
      const result = analyzeClipboard("curl https://example.com");
      expect(result.isCliCommand).toBe(true);
      expect(result.suggestedPlatformName).toBe("http");
    });
  });

  describe("non-CLI content rejection", () => {
    it("rejects long text", () => {
      const longText = "a".repeat(600);
      const result = analyzeClipboard(longText);
      expect(result.isCliCommand).toBe(false);
    });

    it("rejects multi-line text over 5 lines", () => {
      const text = "line1\nline2\nline3\nline4\nline5\nline6";
      const result = analyzeClipboard(text);
      expect(result.isCliCommand).toBe(false);
    });

    it("rejects empty text", () => {
      const result = analyzeClipboard("");
      expect(result.isCliCommand).toBe(false);
    });

    it("rejects plain prose", () => {
      const result = analyzeClipboard(
        "This is a paragraph of normal text that describes something."
      );
      expect(result.isCliCommand).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("trims whitespace", () => {
      const result = analyzeClipboard("  git log --oneline  ");
      expect(result.isCliCommand).toBe(true);
      expect(result.commandText).toBe("git log --oneline");
    });

    it("handles multi-line CLI command", () => {
      const result = analyzeClipboard("docker run -d \\\n  --name test \\\n  nginx");
      expect(result.isCliCommand).toBe(true);
    });
  });
});

describe("getPlatformHintName", () => {
  it("maps known keys", () => {
    expect(getPlatformHintName("git")).toBe("git");
    expect(getPlatformHintName("docker")).toBe("docker");
    expect(getPlatformHintName("kubernetes")).toBe("kubernetes");
    expect(getPlatformHintName("node")).toBe("node.js");
  });

  it("returns key for unknown mapping", () => {
    expect(getPlatformHintName("unknown")).toBe("unknown");
  });
});

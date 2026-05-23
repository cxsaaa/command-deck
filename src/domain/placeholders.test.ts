import { describe, it, expect } from "vitest";
import {
  parsePlaceholders,
  extractVariableName,
  replacePlaceholders,
  hasPlaceholders,
  extractVariableNames,
} from "./placeholders";

describe("extractVariableName", () => {
  it("extracts from angle brackets", () => {
    expect(extractVariableName("<container_id>")).toBe("container_id");
  });

  it("extracts from square brackets", () => {
    expect(extractVariableName("[branch_name]")).toBe("branch_name");
  });

  it("extracts from double curly braces", () => {
    expect(extractVariableName("{{namespace}}")).toBe("namespace");
  });

  it("trims whitespace inside delimiters", () => {
    expect(extractVariableName("< name >")).toBe("name");
  });
});

describe("parsePlaceholders", () => {
  it("parses command with angle bracket placeholder", () => {
    const result = parsePlaceholders("docker exec -it <container_id> /bin/bash");
    expect(result).toEqual([
      { type: "text", value: "docker exec -it " },
      { type: "placeholder", value: "<container_id>", name: "container_id" },
      { type: "text", value: " /bin/bash" },
    ]);
  });

  it("parses command with square bracket placeholder", () => {
    const result = parsePlaceholders("git checkout [branch_name]");
    expect(result).toEqual([
      { type: "text", value: "git checkout " },
      { type: "placeholder", value: "[branch_name]", name: "branch_name" },
    ]);
  });

  it("parses command with double curly brace placeholder", () => {
    const result = parsePlaceholders("kubectl get pod {{pod_name}} -n {{namespace}}");
    expect(result).toEqual([
      { type: "text", value: "kubectl get pod " },
      { type: "placeholder", value: "{{pod_name}}", name: "pod_name" },
      { type: "text", value: " -n " },
      { type: "placeholder", value: "{{namespace}}", name: "namespace" },
    ]);
  });

  it("parses command with mixed placeholder formats", () => {
    const result = parsePlaceholders('docker exec -it <id> sh -c "{{cmd}}"');
    expect(result).toHaveLength(5);
    expect(result.filter((s) => s.type === "placeholder")).toHaveLength(2);
  });

  it("treats empty placeholders as plain text", () => {
    const result = parsePlaceholders("echo <> and [] and {{}}");
    expect(result.every((s) => s.type === "text")).toBe(true);
  });

  it("returns single text segment for no-placeholder command", () => {
    const result = parsePlaceholders("git status");
    expect(result).toEqual([{ type: "text", value: "git status" }]);
  });

  it("handles duplicate variable names", () => {
    const result = parsePlaceholders("cp <file> <file>");
    const placeholders = result.filter((s) => s.type === "placeholder");
    expect(placeholders).toHaveLength(2);
    expect(placeholders[0].name).toBe("file");
    expect(placeholders[1].name).toBe("file");
  });
});

describe("hasPlaceholders", () => {
  it("returns true for commands with placeholders", () => {
    expect(hasPlaceholders("docker exec -it <id> sh")).toBe(true);
    expect(hasPlaceholders("git checkout [branch]")).toBe(true);
    expect(hasPlaceholders("kubectl get {{pod}}")).toBe(true);
  });

  it("returns false for commands without placeholders", () => {
    expect(hasPlaceholders("git status")).toBe(false);
    expect(hasPlaceholders("ls -la")).toBe(false);
  });

  it("returns false for empty placeholders", () => {
    expect(hasPlaceholders("echo <>")).toBe(false);
  });
});

describe("replacePlaceholders", () => {
  it("replaces placeholder with provided value", () => {
    const result = replacePlaceholders("docker exec -it <container_id> /bin/bash", {
      container_id: "web-nginx",
    });
    expect(result).toBe("docker exec -it web-nginx /bin/bash");
  });

  it("replaces multiple placeholders", () => {
    const result = replacePlaceholders("kubectl get pod {{pod_name}} -n {{namespace}}", {
      pod_name: "my-pod",
      namespace: "default",
    });
    expect(result).toBe("kubectl get pod my-pod -n default");
  });

  it("keeps original placeholder when value is empty string", () => {
    const result = replacePlaceholders("docker exec -it <container_id> sh", { container_id: "" });
    expect(result).toBe("docker exec -it <container_id> sh");
  });

  it("keeps original placeholder when value is not provided", () => {
    const result = replacePlaceholders("docker exec -it <container_id> sh", {});
    expect(result).toBe("docker exec -it <container_id> sh");
  });

  it("handles mixed replaced and unreplaced placeholders", () => {
    const result = replacePlaceholders("kubectl get pod {{pod}} -n {{ns}}", { pod: "my-pod" });
    expect(result).toBe("kubectl get pod my-pod -n {{ns}}");
  });

  it("returns original command when no placeholders", () => {
    const result = replacePlaceholders("git status", {});
    expect(result).toBe("git status");
  });
});

describe("extractVariableNames", () => {
  it("returns unique variable names", () => {
    const names = extractVariableNames("cp <file> <file> <dest>");
    expect(names).toEqual(["file", "dest"]);
  });

  it("returns empty array for no-placeholder command", () => {
    expect(extractVariableNames("git status")).toEqual([]);
  });

  it("handles mixed formats", () => {
    const names = extractVariableNames("docker <id> -e {{env}} -c [cfg]");
    expect(names).toEqual(["id", "env", "cfg"]);
  });
});

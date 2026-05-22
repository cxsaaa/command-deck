import { describe, it, expect } from "vitest";
import { validateImport, type CommandDeckExport } from "./importSchema";

describe("validateImport", () => {
  it("accepts valid export data", () => {
    const data: CommandDeckExport = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      platforms: [
        {
          name: "Docker",
          categories: [
            {
              name: "Containers",
              commands: [
                {
                  title: "List containers",
                  command: "docker ps",
                },
              ],
            },
          ],
        },
      ],
    };
    const result = validateImport(data);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects null/undefined input", () => {
    const result = validateImport(null);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain("not an object");
  });

  it("rejects non-object input", () => {
    const result = validateImport("string");
    expect(result.valid).toBe(false);
  });

  it("rejects unsupported version", () => {
    const data = {
      version: "2.0",
      platforms: [],
    };
    const result = validateImport(data);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("version"))).toBe(true);
  });

  it("rejects missing platforms array", () => {
    const data = { version: "1.0" };
    const result = validateImport(data);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("platforms"))).toBe(true);
  });

  it("rejects platform without name", () => {
    const data = {
      version: "1.0",
      platforms: [{ categories: [] }],
    };
    const result = validateImport(data);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("missing 'name'"))).toBe(true);
  });

  it("rejects platform without categories", () => {
    const data = {
      version: "1.0",
      platforms: [{ name: "Docker" }],
    };
    const result = validateImport(data);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("categories"))).toBe(true);
  });

  it("rejects command without title", () => {
    const data = {
      version: "1.0",
      platforms: [
        {
          name: "Docker",
          categories: [
            {
              name: "Containers",
              commands: [{ command: "docker ps" }],
            },
          ],
        },
      ],
    };
    const result = validateImport(data);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("title"))).toBe(true);
  });

  it("rejects command without command field", () => {
    const data = {
      version: "1.0",
      platforms: [
        {
          name: "Docker",
          categories: [
            {
              name: "Containers",
              commands: [{ title: "List" }],
            },
          ],
        },
      ],
    };
    const result = validateImport(data);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("command"))).toBe(true);
  });

  it("validates multiple platforms and commands", () => {
    const data = {
      version: "1.0",
      platforms: [
        {
          name: "Docker",
          categories: [
            {
              name: "Containers",
              commands: [
                { title: "List", command: "docker ps" },
                { title: "Run", command: "docker run" },
              ],
            },
          ],
        },
        {
          name: "Git",
          categories: [
            {
              name: "Basic",
              commands: [{ title: "Status", command: "git status" }],
            },
          ],
        },
      ],
    };
    const result = validateImport(data);
    expect(result.valid).toBe(true);
  });

  it("collects multiple errors", () => {
    const data = {
      version: "1.0",
      platforms: [
        { categories: [{ commands: [{}] }] },
        { name: "Git", categories: [{ commands: [{}] }] },
      ],
    };
    const result = validateImport(data);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });
});

import { describe, it, expect } from "vitest";
import { getSeedData } from "./index";

describe("seed data localization", () => {
  const zhData = getSeedData("zh-CN");
  const enData = getSeedData("en-US");

  it("has 4 default platforms", () => {
    expect(zhData.platforms).toHaveLength(4);
  });

  it("zh-CN and en-US have the same number of platforms", () => {
    expect(zhData.platforms).toHaveLength(enData.platforms.length);
  });

  it("zh-CN and en-US have the same number of categories", () => {
    expect(zhData.categories).toHaveLength(enData.categories.length);
  });

  it("zh-CN and en-US have the same number of commands", () => {
    expect(zhData.commands).toHaveLength(enData.commands.length);
  });

  it("has reasonable command count (>100)", () => {
    expect(zhData.commands.length).toBeGreaterThan(100);
  });

  it("zh-CN and en-US platforms have matching IDs", () => {
    const zhIds = zhData.platforms.map((p) => p.id).sort();
    const enIds = enData.platforms.map((p) => p.id).sort();
    expect(zhIds).toEqual(enIds);
  });

  it("zh-CN and en-US categories have matching IDs", () => {
    const zhIds = zhData.categories.map((c) => c.id).sort();
    const enIds = enData.categories.map((c) => c.id).sort();
    expect(zhIds).toEqual(enIds);
  });

  it("zh-CN and en-US commands have matching IDs", () => {
    const zhIds = zhData.commands.map((c) => c.id).sort();
    const enIds = enData.commands.map((c) => c.id).sort();
    expect(zhIds).toEqual(enIds);
  });

  it("zh-CN and en-US platforms have matching colors", () => {
    for (const zhP of zhData.platforms) {
      const enP = enData.platforms.find((p) => p.id === zhP.id);
      expect(enP).toBeDefined();
      expect(enP!.color).toBe(zhP.color);
    }
  });

  it("zh-CN platforms have Chinese names", () => {
    const name = zhData.platforms[0].name;
    expect(/[一-鿿]/.test(name)).toBe(true);
  });

  it("en-US platforms have English names", () => {
    const name = enData.platforms[0].name;
    expect(/[一-鿿]/.test(name)).toBe(false);
  });

  it("zh-CN commands have Chinese tags", () => {
    const tags = zhData.commands[0].tags;
    expect(tags.some((t) => /[一-鿿]/.test(t))).toBe(true);
  });

  it("en-US commands have English tags", () => {
    const tags = enData.commands[0].tags;
    expect(tags.every((t) => !/[一-鿿]/.test(t))).toBe(true);
  });

  it("zh-CN and en-US commands have matching command strings", () => {
    for (const zhCmd of zhData.commands) {
      const enCmd = enData.commands.find((c) => c.id === zhCmd.id);
      expect(enCmd).toBeDefined();
      expect(enCmd!.command).toBe(zhCmd.command);
    }
  });

  it("zh-CN and en-US commands have matching tag counts", () => {
    for (const zhCmd of zhData.commands) {
      const enCmd = enData.commands.find((c) => c.id === zhCmd.id);
      expect(enCmd).toBeDefined();
      expect(enCmd!.tags).toHaveLength(zhCmd.tags.length);
    }
  });

  it("all command categoryIds reference valid categories", () => {
    const categoryIds = new Set(zhData.categories.map((c) => c.id));
    for (const cmd of zhData.commands) {
      expect(categoryIds.has(cmd.categoryId)).toBe(true);
    }
  });

  it("all command platformIds reference valid platforms", () => {
    const platformIds = new Set(zhData.platforms.map((p) => p.id));
    for (const cmd of zhData.commands) {
      expect(platformIds.has(cmd.platformId)).toBe(true);
    }
  });

  it("categories reference valid platforms", () => {
    const platformIds = new Set(zhData.platforms.map((p) => p.id));
    for (const cat of zhData.categories) {
      expect(platformIds.has(cat.platformId)).toBe(true);
    }
  });
});

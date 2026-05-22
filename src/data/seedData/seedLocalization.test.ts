import { describe, it, expect } from "vitest";
import * as zhCN from "./zh-CN";
import * as enUS from "./en-US";

describe("seed data localization", () => {
  it("zh-CN and en-US have the same number of platforms", () => {
    expect(zhCN.platforms).toHaveLength(enUS.platforms.length);
  });

  it("zh-CN and en-US have the same number of categories", () => {
    expect(zhCN.categories).toHaveLength(enUS.categories.length);
  });

  it("zh-CN and en-US have the same number of commands", () => {
    expect(zhCN.commands).toHaveLength(enUS.commands.length);
  });

  it("zh-CN and en-US platforms have matching IDs", () => {
    const zhIds = zhCN.platforms.map((p) => p.id).sort();
    const enIds = enUS.platforms.map((p) => p.id).sort();
    expect(zhIds).toEqual(enIds);
  });

  it("zh-CN and en-US categories have matching IDs", () => {
    const zhIds = zhCN.categories.map((c) => c.id).sort();
    const enIds = enUS.categories.map((c) => c.id).sort();
    expect(zhIds).toEqual(enIds);
  });

  it("zh-CN and en-US commands have matching IDs", () => {
    const zhIds = zhCN.commands.map((c) => c.id).sort();
    const enIds = enUS.commands.map((c) => c.id).sort();
    expect(zhIds).toEqual(enIds);
  });

  it("zh-CN and en-US platforms have matching colors", () => {
    for (const zhP of zhCN.platforms) {
      const enP = enUS.platforms.find((p) => p.id === zhP.id);
      expect(enP).toBeDefined();
      expect(enP!.color).toBe(zhP.color);
    }
  });

  it("zh-CN platforms have Chinese descriptions", () => {
    const desc = zhCN.platforms[0].description;
    expect(/[一-鿿]/.test(desc)).toBe(true);
  });

  it("en-US platforms have English descriptions", () => {
    const desc = enUS.platforms[0].description;
    expect(/[一-鿿]/.test(desc)).toBe(false);
  });

  it("zh-CN commands have Chinese tags", () => {
    const tags = zhCN.commands[0].tags;
    expect(tags.some((t) => /[一-鿿]/.test(t))).toBe(true);
  });

  it("en-US commands have English tags", () => {
    const tags = enUS.commands[0].tags;
    expect(tags.every((t) => !/[一-鿿]/.test(t))).toBe(true);
  });

  it("zh-CN and en-US commands have matching command strings", () => {
    for (const zhCmd of zhCN.commands) {
      const enCmd = enUS.commands.find((c) => c.id === zhCmd.id);
      expect(enCmd).toBeDefined();
      expect(enCmd!.command).toBe(zhCmd.command);
    }
  });

  it("zh-CN and en-US commands have matching tag counts", () => {
    for (const zhCmd of zhCN.commands) {
      const enCmd = enUS.commands.find((c) => c.id === zhCmd.id);
      expect(enCmd).toBeDefined();
      expect(enCmd!.tags).toHaveLength(zhCmd.tags.length);
    }
  });
});

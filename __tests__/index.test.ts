import { describe, expect, test } from "vitest";

import * as api from "../lib/index";

const EXPECTED_EXPORTS = [
  "breakpoints",
  "contrast",
  "CSS_VARIABLE_PREFIX",
  "cssVar",
  "cssVarName",
  "deltaE",
  "effects",
  "fonts",
  "fontWeights",
  "hexToOklch",
  "hues",
  "layers",
  "logos",
  "maxChroma",
  "motion",
  "oklchToHex",
  "radii",
  "scales",
  "spacing",
  "THEME_ATTRIBUTE",
  "THEME_BOOT_SCRIPT",
  "THEME_BOOT_SCRIPT_HASH",
  "THEME_STORAGE_KEY",
  "themes",
  "typography",
] as const;

describe("public entry point", () => {
  test("should expose exactly the documented surface", () => {
    expect(Object.keys(api).sort()).toEqual([...EXPECTED_EXPORTS].sort());
  });

  test("should derive a chart tint from a theme colour through the barrel", () => {
    const { l, h } = api.hexToOklch(api.themes.light["chart-1"]);
    const tint = api.oklchToHex({ l: 0.9, c: api.maxChroma(0.9, h) / 2, h });

    expect(l).toBeLessThan(0.9);
    expect(tint).toMatch(/^#[0-9a-f]{6}$/);
    expect(api.contrast(tint, api.themes.light.text)).toBeGreaterThan(7);
    expect(api.deltaE(tint, api.themes.light["chart-1"])).toBeGreaterThan(10);
  });

  test("should build CSS references through the barrel", () => {
    expect(api.cssVar("primary")).toBe("var(--hd-primary)");
    expect(api.cssVarName("primary")).toBe("--hd-primary");
    expect(api.CSS_VARIABLE_PREFIX).toBe("hd");
  });

  test("should carry the theme boot script with its digest", () => {
    expect(api.THEME_BOOT_SCRIPT).toContain(api.THEME_STORAGE_KEY);
    expect(api.THEME_BOOT_SCRIPT).toContain(api.THEME_ATTRIBUTE);
    expect(api.THEME_BOOT_SCRIPT_HASH.startsWith("sha256-")).toBe(true);
  });

  test("should hold plain data in every token export", () => {
    const data = [
      api.breakpoints,
      api.effects,
      api.fonts,
      api.fontWeights,
      api.hues,
      api.layers,
      api.logos,
      api.motion,
      api.radii,
      api.scales,
      api.spacing,
      api.themes,
      api.typography,
    ];

    for (const value of data) {
      expect(JSON.parse(JSON.stringify(value))).toEqual(value);
    }
  });
});

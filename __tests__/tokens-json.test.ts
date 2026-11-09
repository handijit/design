import { describe, expect, test } from "vitest";

import renderTokensJson from "../lib/generators/tokens-json";
import * as api from "../lib/index";

const json = renderTokensJson();
const parsed: Record<string, unknown> = JSON.parse(json);

describe("tokens.json", () => {
  test("should carry exactly the documented keys", () => {
    expect(Object.keys(parsed)).toEqual([
      "prefix",
      "themeAttribute",
      "themeStorageKey",
      "hues",
      "scales",
      "themes",
      "effects",
      "fonts",
      "fontWeights",
      "typography",
      "spacing",
      "radii",
      "motion",
      "layers",
      "breakpoints",
    ]);
  });

  test("should hold the same data as the TypeScript entry", () => {
    expect(parsed).toEqual({
      prefix: api.CSS_VARIABLE_PREFIX,
      themeAttribute: api.THEME_ATTRIBUTE,
      themeStorageKey: api.THEME_STORAGE_KEY,
      hues: api.hues,
      scales: api.scales,
      themes: api.themes,
      effects: api.effects,
      fonts: api.fonts,
      fontWeights: api.fontWeights,
      typography: api.typography,
      spacing: api.spacing,
      radii: api.radii,
      motion: api.motion,
      layers: api.layers,
      breakpoints: api.breakpoints,
    });
  });

  test("should give an Electron main process its window background", () => {
    const themes = parsed.themes as Record<string, Record<string, string>>;

    expect(themes.dark?.["bg-page"]).toBe("#080e1b");
    expect(themes.light?.["bg-page"]).toBe("#fafbfe");
  });

  test("should be indented and end with a newline", () => {
    expect(json.startsWith('{\n  "prefix": "hd",\n')).toBe(true);
    expect(json.endsWith("}\n")).toBe(true);
  });
});

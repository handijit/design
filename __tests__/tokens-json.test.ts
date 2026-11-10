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
      "effectValues",
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
      effectValues: api.effectValues,
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

  test("should give an Electron main process its scrim and shadow colour", () => {
    const values = parsed.effectValues as Record<
      string,
      Record<string, { color: string; alpha: number }>
    >;

    expect(values.light?.scrim).toEqual({ color: "#091122", alpha: 0.48 });
    expect(values.dark?.scrim).toEqual({ color: "#040813", alpha: 0.64 });
    expect(values.light?.shadow).toEqual({ color: "#0f173c", alpha: 0.1 });
  });

  test("should be indented and end with a newline", () => {
    expect(json.startsWith('{\n  "prefix": "hd",\n')).toBe(true);
    expect(json.endsWith("}\n")).toBe(true);
  });
});

import { describe, expect, test } from "vitest";

import effects from "../lib/tokens/effects";
import scales from "../lib/tokens/scales";
import themes from "../lib/tokens/themes";
import type { ThemeName } from "../lib/types";
import approved from "./fixtures/approved-recipe.json";

// The fixture is the approved output of the design recipe. These tests are meant to turn
// red when the palette changes: update the fixture only together with a design decision.
const THEME_NAMES: ThemeName[] = ["light", "dark"];

// The recipe kept the shadow tone next to the colours; the package moved it to `effects`.
const MOVED_TO_EFFECTS = ["shadow", "shadow-alpha"];

describe("approved recipe", () => {
  test("should reproduce every scale hex exactly", () => {
    expect(scales).toEqual(approved.scales);
  });

  test.each(THEME_NAMES)(
    "should reproduce every approved %s colour exactly",
    (name) => {
      const expected = Object.entries(approved.themes[name]).filter(
        ([token]) => !MOVED_TO_EFFECTS.includes(token)
      );
      const theme: Record<string, string> = themes[name];

      expect(expected).toHaveLength(49);
      for (const [token, hex] of expected) {
        expect(theme[token], token).toBe(hex);
      }
    }
  );

  test.each(THEME_NAMES)("should keep the approved %s shadow tone", (name) => {
    expect(effects[name]["shadow-color"]).toBe(approved.themes[name].shadow);
    expect(Number(effects[name]["shadow-alpha"])).toBe(
      Number(approved.themes[name]["shadow-alpha"])
    );
  });

  test("should lock the complete colour set, additions included", () => {
    expect(themes).toMatchSnapshot();
  });

  test("should lock the shadows and scrims", () => {
    expect(effects).toMatchSnapshot();
  });
});

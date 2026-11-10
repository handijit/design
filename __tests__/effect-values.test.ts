import { describe, expect, test } from "vitest";

import { parseHex } from "../lib/helpers/srgb.helper";
import effectValues from "../lib/tokens/effect-values";
import effects from "../lib/tokens/effects";
import themes from "../lib/tokens/themes";
import type { ShadowLayer, ShadowLevel, ThemeName } from "../lib/types";

const THEME_NAMES: ThemeName[] = ["light", "dark"];
const LEVELS: ShadowLevel[] = [1, 2, 3];

/** The CSS a consumer would write by hand from the numbers. */
const channels = (hex: string): string => {
  const { r, g, b } = parseHex(hex, "test");
  return [r, g, b].map((channel) => Math.round(channel * 255)).join(" ");
};

const length = (pixels: number): string => (pixels === 0 ? "0" : `${pixels}px`);

const layerCss = (color: string, layer: ShadowLayer): string => {
  const lengths = [layer.x, layer.y, layer.blur];
  if (layer.spread !== 0) lengths.push(layer.spread);

  return `${lengths.map(length).join(" ")} rgb(${channels(color)} / ${layer.alpha})`;
};

describe.each(THEME_NAMES)("effect values: %s theme", (theme) => {
  const values = effectValues[theme];

  test("should say the same as the CSS shadow colour and opacity", () => {
    expect(channels(values.shadow.color)).toBe(effects[theme]["shadow-color"]);
    expect(String(values.shadow.alpha)).toBe(effects[theme]["shadow-alpha"]);
  });

  test.each(LEVELS)("should say the same as the CSS of shadow %i", (level) => {
    expect(
      values.shadows[level]
        .map((layer) => layerCss(values.shadow.color, layer))
        .join(", ")
    ).toBe(effects[theme][`shadow-${level}`]);
  });

  test("should say the same as the CSS scrim", () => {
    expect(`rgb(${channels(values.scrim.color)} / ${values.scrim.alpha})`).toBe(
      effects[theme].scrim
    );
  });

  test("should hold opaque six-digit hex and opacities a shadow can have", () => {
    const alphas = [
      values.shadow.alpha,
      values.scrim.alpha,
      ...LEVELS.flatMap((level) =>
        values.shadows[level].map((layer) => layer.alpha)
      ),
    ];

    expect(values.shadow.color).toMatch(/^#[0-9a-f]{6}$/);
    expect(values.scrim.color).toMatch(/^#[0-9a-f]{6}$/);
    expect(alphas.every((alpha) => alpha > 0 && alpha <= 0.9)).toBe(true);
  });

  test("should deepen the shadow with every level", () => {
    const reach = LEVELS.map((level) =>
      Math.max(...values.shadows[level].map((layer) => layer.y + layer.blur))
    );

    expect(reach).toEqual([...reach].sort((first, second) => first - second));
    expect(new Set(reach).size).toBe(LEVELS.length);
  });
});

describe("effect values", () => {
  test("should take the scrim colour from the theme it dims", () => {
    expect(effectValues.light.scrim.color).toBe(themes.light.text);
    expect(effectValues.dark.scrim.color).toBe(themes.dark["bg-inset"]);
  });

  test("should need a denser shadow and scrim on the dark theme", () => {
    expect(effectValues.dark.shadow.alpha).toBeGreaterThan(
      effectValues.light.shadow.alpha
    );
    expect(effectValues.dark.scrim.alpha).toBeGreaterThan(
      effectValues.light.scrim.alpha
    );
  });
});

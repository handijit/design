import { describe, expect, test } from "vitest";

import { parseHex } from "../lib/helpers/srgb.helper";
import contrast from "../lib/modules/contrast";
import deltaE from "../lib/modules/delta-e";
import effects from "../lib/tokens/effects";
import themes from "../lib/tokens/themes";
import type { ColorToken, StatusName, ThemeName } from "../lib/types";

// WCAG 2.2 AA floors: 1.4.3 for text, 1.4.11 for graphics and focus indicators.
const TEXT = 4.5;
const PRIMARY_TEXT = 7;
const GRAPHIC = 3;
// Borders separate surfaces that already differ; this keeps them visible, not WCAG-rated.
const BORDER = 1.25;
// Disabled text is exempt from 1.4.3, yet it has to stay legible as "there but off".
const DISABLED = 2;
// OKLab distance × 100 below which two colours start to be confused in a legend.
const DISTINCT = 10;

const THEME_NAMES: ThemeName[] = ["light", "dark"];
const SURFACES: ColorToken[] = ["bg-page", "bg-surface", "bg-raised"];
const STATUSES: StatusName[] = ["success", "warning", "danger", "info"];
const CHARTS: ColorToken[] = [
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "chart-6",
];

type Pair = [foreground: ColorToken, background: ColorToken, minimum: number];

/** The pairs the approved recipe gates, unchanged. */
const recipePairs = (): Pair[] => [
  ...SURFACES.flatMap((surface): Pair[] => [
    ["text", surface, PRIMARY_TEXT],
    ["text-2", surface, TEXT],
    ["text-3", surface, TEXT],
    ["primary-text", surface, TEXT],
    ["accent-text", surface, TEXT],
    ["highlight-text", surface, TEXT],
    ["focus", surface, GRAPHIC],
    ["border-strong", surface, BORDER],
    ...CHARTS.map((chart): Pair => [chart, surface, GRAPHIC]),
  ]),
  ["on-primary", "primary", TEXT],
  ["on-primary", "primary-hover", TEXT],
  ["on-accent", "accent", TEXT],
  ["on-accent", "accent-hover", TEXT],
  ["on-accent", "accent-active", TEXT],
  ["on-primary", "danger-solid", TEXT],
  ["primary-text", "primary-soft", TEXT],
  ["accent-text", "accent-soft", TEXT],
  ["highlight-text", "highlight-soft", TEXT],
  ["success-fg", "success-bg", TEXT],
  ["warning-fg", "warning-bg", TEXT],
  ["danger-fg", "danger-bg", TEXT],
  ["band-text", "band-bg", PRIMARY_TEXT],
  ["band-text-2", "band-bg", TEXT],
];

/** Pairs introduced by the tokens this package added to the recipe. */
const addedPairs = (): Pair[] => [
  ["text", "bg-overlay", PRIMARY_TEXT],
  ["text-2", "bg-overlay", TEXT],
  ["text-3", "bg-overlay", TEXT],
  ["text", "bg-inset", PRIMARY_TEXT],
  ["text-2", "bg-inset", TEXT],
  ["text", "selection-bg", PRIMARY_TEXT],
  ["on-primary", "primary-active", TEXT],
  ["on-highlight", "highlight", TEXT],
  ["band-text", "band-deep", PRIMARY_TEXT],
  ["band-text-2", "band-deep", TEXT],
  ["band-line-strong", "band-bg", GRAPHIC],
  ["band-line-strong", "band-deep", GRAPHIC],
  ["focus", "band-bg", GRAPHIC],
  ["focus", "band-deep", GRAPHIC],
  ["on-accent", "accent", TEXT],
  ...STATUSES.flatMap((status): Pair[] => [
    [`${status}-fg`, `${status}-bg`, TEXT],
    [`${status}-on-solid`, `${status}-solid`, TEXT],
    ...SURFACES.map((surface): Pair => [`${status}-solid`, surface, GRAPHIC]),
  ]),
  ...[...SURFACES, "bg-disabled" as const].map((surface): Pair => [
    "text-disabled",
    surface,
    DISABLED,
  ]),
];

const failures = (theme: ThemeName, pairs: Pair[]): string[] =>
  pairs
    .map(([foreground, background, minimum]) => ({
      foreground,
      background,
      minimum,
      ratio: contrast(themes[theme][foreground], themes[theme][background]),
    }))
    .filter(({ ratio, minimum }) => ratio < minimum)
    .map(
      ({ foreground, background, minimum, ratio }) =>
        `${theme}: ${foreground} on ${background} is ${ratio.toFixed(2)}:1, needs ${minimum}:1`
    );

/** `rgb(r g b / a)` painted over an opaque hex, as an opaque hex. */
const composite = (overlay: string, backdrop: string): string => {
  const match = /^rgb\((\d+) (\d+) (\d+) \/ ([\d.]+)\)$/.exec(overlay);
  if (match === null) throw new Error(`unexpected overlay: ${overlay}`);

  const alpha = Number(match[4]);
  const under = parseHex(backdrop, "composite");
  const channel = (over: string, below: number): string =>
    Math.round(Number(over) * alpha + below * 255 * (1 - alpha))
      .toString(16)
      .padStart(2, "0");

  return `#${channel(match[1] as string, under.r)}${channel(match[2] as string, under.g)}${channel(match[3] as string, under.b)}`;
};

describe.each(THEME_NAMES)("accessibility gates: %s theme", (theme) => {
  test("should pass every contrast pair of the approved recipe", () => {
    expect(recipePairs()).toHaveLength(56);
    expect(failures(theme, recipePairs())).toEqual([]);
  });

  test("should pass the contrast pairs of the added tokens", () => {
    expect(failures(theme, addedPairs())).toEqual([]);
  });

  test("should keep disabled text visibly weaker than tertiary text", () => {
    for (const surface of SURFACES) {
      expect(
        contrast(themes[theme]["text-disabled"], themes[theme][surface])
      ).toBeLessThan(contrast(themes[theme]["text-3"], themes[theme][surface]));
    }
  });

  test("should keep the chart colours apart from each other", () => {
    const close: string[] = [];
    CHARTS.forEach((first, index) => {
      for (const second of CHARTS.slice(index + 1)) {
        const distance = deltaE(themes[theme][first], themes[theme][second]);
        if (distance < DISTINCT) {
          close.push(`${first} / ${second}: ${distance.toFixed(1)}`);
        }
      }
    });

    expect(close).toEqual([]);
  });

  test("should keep the conversion colour apart from the destructive colour", () => {
    expect(
      deltaE(themes[theme].accent, themes[theme]["danger-solid"])
    ).toBeGreaterThanOrEqual(DISTINCT);
  });

  test("should lift a dialog off the page it dims", () => {
    const dimmed = composite(effects[theme].scrim, themes[theme]["bg-page"]);

    expect(
      contrast(themes[theme]["bg-overlay"], dimmed)
    ).toBeGreaterThanOrEqual(BORDER);
  });

  test("should use opaque six-digit hex and never pure black", () => {
    const colours = Object.values(themes[theme]);

    expect(colours).not.toContain("#000000");
    expect(colours.every((hex) => /^#[0-9a-f]{6}$/.test(hex))).toBe(true);
  });
});

describe("gate helpers", () => {
  test("should report a failing pair in words", () => {
    expect(failures("light", [["text-disabled", "bg-page", TEXT]])).toEqual([
      "light: text-disabled on bg-page is 2.28:1, needs 4.5:1",
    ]);
  });

  test("should refuse an overlay it cannot composite", () => {
    expect(() => composite("#000", "#fff")).toThrow("unexpected overlay: #000");
  });
});

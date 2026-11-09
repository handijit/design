import { describe, expect, test } from "vitest";

import hexToOklch from "../lib/modules/hex-to-oklch";
import maxChroma from "../lib/modules/max-chroma";
import oklchToHex from "../lib/modules/oklch-to-hex";

describe("maxChroma", () => {
  test("should find the gamut edge for a lightness and hue", () => {
    expect(maxChroma(0.6, 264)).toBeCloseTo(0.2168, 3);
    expect(maxChroma(0.6, 33)).toBeCloseTo(0.2214, 3);
  });

  test("should leave no room for chroma at white", () => {
    expect(maxChroma(1, 264)).toBeLessThan(0.001);
  });

  test("should still describe black at zero lightness", () => {
    // Near black the gamut tolerance admits a sliver of chroma no screen can show.
    expect(oklchToHex({ l: 0, c: maxChroma(0, 264), h: 264 })).toBe("#000000");
  });

  test("should return a chroma that survives conversion to hex", () => {
    const chroma = maxChroma(0.7, 192);
    const { c } = hexToOklch(oklchToHex({ l: 0.7, c: chroma, h: 192 }));

    // Only the 8-bit rounding of the hex separates the two.
    expect(Math.abs(c - chroma)).toBeLessThan(0.003);
  });

  test.each([
    ["l", Number.NaN, 0],
    ["h", 0.5, Number.NEGATIVE_INFINITY],
    ["l", "0.5", 0],
    ["h", 0.5, undefined],
  ])("should reject a %s that is not a finite number", (name, l, h) => {
    expect(() => maxChroma(l as number, h as number)).toThrow(TypeError);
    expect(() => maxChroma(l as number, h as number)).toThrow(
      new RegExp(`^maxChroma: ${name} must be a finite number, received `)
    );
  });
});

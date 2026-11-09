import { describe, expect, test } from "vitest";

import maxChroma from "../lib/modules/max-chroma";
import oklchToHex from "../lib/modules/oklch-to-hex";
import type { Oklch } from "../lib/types";

describe("oklchToHex", () => {
  test("should convert an in-gamut colour", () => {
    expect(oklchToHex({ l: 1, c: 0, h: 0 })).toBe("#ffffff");
    expect(oklchToHex({ l: 0, c: 0, h: 0 })).toBe("#000000");
    expect(oklchToHex({ l: 0.5, c: 0, h: 123 })).toBe("#636363");
  });

  test("should reduce chroma, not clip channels, outside the gamut", () => {
    const hex = oklchToHex({ l: 0.6, c: 0.4, h: 264 });

    expect(hex).toBe("#3a73ff");
    // Every chroma beyond the gamut edge lands on the same colour at the edge.
    expect(hex).toBe(oklchToHex({ l: 0.6, c: 0.3, h: 264 }));
    expect(hex).toBe(oklchToHex({ l: 0.6, c: maxChroma(0.6, 264), h: 264 }));
  });

  test("should read negative chroma as no chroma", () => {
    expect(oklchToHex({ l: 0.5, c: -0.2, h: 30 })).toBe("#636363");
  });

  test("should accept any hue angle", () => {
    const reference = oklchToHex({ l: 0.6, c: 0.1, h: 30 });

    expect(oklchToHex({ l: 0.6, c: 0.1, h: 390 })).toBe(reference);
    expect(oklchToHex({ l: 0.6, c: 0.1, h: -330 })).toBe(reference);
  });

  test("should clip lightness beyond white and black", () => {
    expect(oklchToHex({ l: 1.5, c: 0, h: 0 })).toBe("#ffffff");
    expect(oklchToHex({ l: -0.5, c: 0, h: 0 })).toBe("#000000");
  });

  test.each([
    ["l", { l: Number.NaN, c: 0, h: 0 }],
    ["c", { l: 0.5, c: Number.POSITIVE_INFINITY, h: 0 }],
    ["h", { l: 0.5, c: 0.1, h: "30" }],
    ["l", { c: 0.1, h: 30 }],
  ])(
    "should reject a colour whose %s is not a finite number",
    (name, color) => {
      expect(() => oklchToHex(color as Oklch)).toThrow(
        new RegExp(`^oklchToHex: ${name} must be a finite number, received `)
      );
      expect(() => oklchToHex(color as Oklch)).toThrow(TypeError);
    }
  );

  test.each([undefined, null])("should reject %s as a colour", (color) => {
    expect(() => oklchToHex(color as unknown as Oklch)).toThrow(
      "oklchToHex: l must be a finite number, received undefined"
    );
  });
});

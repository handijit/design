import { describe, expect, test } from "vitest";

import hexToOklch from "../lib/modules/hex-to-oklch";
import oklchToHex from "../lib/modules/oklch-to-hex";
import scales from "../lib/tokens/scales";

describe("hexToOklch", () => {
  test("should convert a chromatic colour", () => {
    const { l, c, h } = hexToOklch("#2661fa");

    expect(l).toBeCloseTo(0.5554, 3);
    expect(c).toBeCloseTo(0.236, 3);
    expect(h).toBeCloseTo(264, 1);
  });

  test("should report greys with zero chroma and hue", () => {
    expect(hexToOklch("#ffffff")).toEqual({
      l: expect.closeTo(1, 6),
      c: 0,
      h: 0,
    });
    expect(hexToOklch("#000000")).toEqual({ l: 0, c: 0, h: 0 });
    expect(hexToOklch("#777")).toEqual({
      l: expect.closeTo(0.5693, 3),
      c: 0,
      h: 0,
    });
  });

  test("should read shorthand and uppercase hex", () => {
    expect(hexToOklch("#F00")).toEqual(hexToOklch("#ff0000"));
  });

  test("should keep the hue between 0 and 360", () => {
    const { h } = hexToOklch("#0000ff");

    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThan(360);
    expect(h).toBeCloseTo(264.05, 1);
  });

  test("should round-trip every palette colour through oklchToHex", () => {
    const palette = Object.values(scales).flatMap((scale) =>
      Object.values(scale)
    );

    expect(palette).toHaveLength(101);
    for (const hex of palette) {
      expect(oklchToHex(hexToOklch(hex)), hex).toBe(hex);
    }
  });

  test.each([
    ["red", '"red"'],
    ["#12", '"#12"'],
    ["#12345g", '"#12345g"'],
    ["2661fa", '"2661fa"'],
    ["#2661fa80", '"#2661fa80"'],
    [0x2661fa, "number"],
    [undefined, "undefined"],
    [null, "object"],
  ])("should reject %s", (value, description) => {
    expect(() => hexToOklch(value as string)).toThrow(
      new TypeError(
        `hexToOklch: expected a hex colour like "#2661fa", received ${description}`
      )
    );
  });
});

import { describe, expect, test } from "vitest";

import contrast from "../lib/modules/contrast";

describe("contrast", () => {
  test("should be 21 between black and white", () => {
    expect(contrast("#000000", "#ffffff")).toBeCloseTo(21, 10);
  });

  test("should be 1 for the same colour", () => {
    expect(contrast("#2661fa", "#2661fa")).toBe(1);
  });

  test("should not depend on the order of the colours", () => {
    expect(contrast("#fb6041", "#091122")).toBe(contrast("#091122", "#fb6041"));
  });

  test("should match the WCAG reference value for a known pair", () => {
    // #767676 on white is the well-known lightest grey that passes 4.5:1.
    expect(contrast("#767676", "#fff")).toBeCloseTo(4.54, 2);
  });

  test("should name itself when a colour is not a hex", () => {
    expect(() => contrast("#fff", "rgb(0 0 0)")).toThrow(
      new TypeError(
        'contrast: expected a hex colour like "#2661fa", received "rgb(0 0 0)"'
      )
    );
    expect(() => contrast(undefined as unknown as string, "#fff")).toThrow(
      'contrast: expected a hex colour like "#2661fa", received undefined'
    );
  });
});

import { describe, expect, test } from "vitest";

import deltaE from "../lib/modules/delta-e";

describe("deltaE", () => {
  test("should be 0 for the same colour", () => {
    expect(deltaE("#2661fa", "#2661FA")).toBe(0);
  });

  test("should be 100 between black and white", () => {
    expect(deltaE("#000", "#fff")).toBeCloseTo(100, 3);
  });

  test("should not depend on the order of the colours", () => {
    expect(deltaE("#fb6041", "#d2154c")).toBe(deltaE("#d2154c", "#fb6041"));
  });

  test("should measure the distance between two palette colours", () => {
    expect(deltaE("#fb6041", "#d2154c")).toBeCloseTo(14.8, 1);
  });

  test("should name itself when a colour is not a hex", () => {
    expect(() => deltaE("#fff", "blue")).toThrow(
      new TypeError(
        'deltaE: expected a hex colour like "#2661fa", received "blue"'
      )
    );
  });
});

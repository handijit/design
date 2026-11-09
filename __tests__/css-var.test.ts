import { describe, expect, test } from "vitest";

import cssVar from "../lib/modules/css-var";
import cssVarName from "../lib/modules/css-var-name";

describe("cssVarName", () => {
  test("should prefix the token name", () => {
    expect(cssVarName("bg-page")).toBe("--hd-bg-page");
    expect(cssVarName("cobalt-600")).toBe("--hd-cobalt-600");
    expect(cssVarName("type-h1-line-height")).toBe("--hd-type-h1-line-height");
  });
});

describe("cssVar", () => {
  test("should reference the custom property of a token", () => {
    expect(cssVar("bg-page")).toBe("var(--hd-bg-page)");
    expect(cssVar("shadow-2")).toBe("var(--hd-shadow-2)");
  });

  test("should append a fallback verbatim", () => {
    expect(cssVar("accent", "#fb6041")).toBe("var(--hd-accent, #fb6041)");
    expect(cssVar("space-4", "calc(1rem + 2px)")).toBe(
      "var(--hd-space-4, calc(1rem + 2px))"
    );
  });

  test("should keep an empty fallback, which CSS treats as valid", () => {
    expect(cssVar("accent", "")).toBe("var(--hd-accent, )");
  });
});

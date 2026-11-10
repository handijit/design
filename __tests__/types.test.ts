import { describe, expect, expectTypeOf, test } from "vitest";

import type {
  BreakpointName,
  ColorToken,
  Logo,
  Oklch,
  ScaleToken,
  Theme,
  ThemeName,
  ThemePreference,
  TokenName,
} from "../lib/index";
import {
  breakpoints,
  contrast,
  CSS_VARIABLE_PREFIX,
  cssVar,
  cssVarName,
  deltaE,
  effects,
  hexToOklch,
  logos,
  maxChroma,
  oklchToHex,
  scales,
  spacing,
  THEME_ATTRIBUTE,
  THEME_BOOT_SCRIPT_HASH,
  THEME_STORAGE_KEY,
  themes,
  typography,
} from "../lib/index";

describe("type surface", () => {
  test("should type the colour helpers", () => {
    expectTypeOf(oklchToHex).toEqualTypeOf<(color: Oklch) => string>();
    expectTypeOf(hexToOklch).toEqualTypeOf<(hex: string) => Oklch>();
    expectTypeOf(maxChroma).toEqualTypeOf<(l: number, h: number) => number>();
    expectTypeOf(contrast).toEqualTypeOf<
      (first: string, second: string) => number
    >();
    expectTypeOf(deltaE).toEqualTypeOf<
      (first: string, second: string) => number
    >();
  });

  test("should keep the token name in the custom property name", () => {
    expectTypeOf(cssVarName("bg-page")).toEqualTypeOf<"--hd-bg-page">();
    expectTypeOf(cssVar("bg-page")).toEqualTypeOf<string>();
  });

  test("should accept every kind of token name", () => {
    expectTypeOf<"cobalt-600">().toExtend<ScaleToken>();
    expectTypeOf<"slate-25">().toExtend<TokenName>();
    expectTypeOf<"chart-6">().toExtend<ColorToken>();
    expectTypeOf<"border-control">().toExtend<ColorToken>();
    expectTypeOf<"info-on-solid">().toExtend<ColorToken>();
    expectTypeOf<"shadow-2">().toExtend<TokenName>();
    expectTypeOf<"type-h1-line-height">().toExtend<TokenName>();
    expectTypeOf<"space-24">().toExtend<TokenName>();
    expectTypeOf<"z-modal">().toExtend<TokenName>();
  });

  test("should reject names that are not tokens", () => {
    expectTypeOf<"cobalt-25">().not.toExtend<TokenName>();
    expectTypeOf<"chart-7">().not.toExtend<TokenName>();
    expectTypeOf<"space-7">().not.toExtend<TokenName>();
    expectTypeOf<"breakpoint-md">().not.toExtend<TokenName>();

    // @ts-expect-error "bg-pgae" is not a token
    expect(cssVar("bg-pgae")).toBe("var(--hd-bg-pgae)");
  });

  test("should type the themes as complete maps of hex strings", () => {
    expectTypeOf(themes).toEqualTypeOf<Readonly<Record<ThemeName, Theme>>>();
    expectTypeOf(themes.dark["bg-page"]).toEqualTypeOf<string>();
    expectTypeOf<keyof Theme>().toEqualTypeOf<ColorToken>();
    expectTypeOf(effects.light["shadow-1"]).toEqualTypeOf<string>();

    // @ts-expect-error "sepia" is not a theme
    expect(themes.sepia).toBe(undefined);
  });

  test("should index the scales by family and step", () => {
    expectTypeOf(scales.cobalt[600]).toEqualTypeOf<string>();
    expectTypeOf(scales.slate[25]).toEqualTypeOf<string>();

    // @ts-expect-error only the neutral scale has a 25 step
    expect(scales.cobalt[25]).toBe(undefined);
  });

  test("should type the non-colour tokens", () => {
    expectTypeOf(spacing[4]).toEqualTypeOf<number>();
    expectTypeOf(breakpoints).toEqualTypeOf<
      Readonly<Record<BreakpointName, number>>
    >();
    expectTypeOf(typography.h1.font).toEqualTypeOf<
      "display" | "body" | "mono"
    >();
    expectTypeOf(logos.mark).toEqualTypeOf<Logo>();
  });

  test("should type the theme constants as literals where they are contracts", () => {
    expectTypeOf(THEME_ATTRIBUTE).toEqualTypeOf<"data-theme">();
    expectTypeOf(THEME_STORAGE_KEY).toEqualTypeOf<"hd-theme">();
    expectTypeOf(CSS_VARIABLE_PREFIX).toEqualTypeOf<"hd">();
    expectTypeOf(THEME_BOOT_SCRIPT_HASH).toEqualTypeOf<string>();
    expectTypeOf<ThemePreference>().toEqualTypeOf<ThemeName | "system">();
  });

  test("should make the token data read-only", () => {
    // Declared, never called: the assignment must not compile, and must not run either.
    const overwrite = (): void => {
      // @ts-expect-error tokens are read-only
      spacing[4] = 17;
    };

    expectTypeOf(overwrite).toBeFunction();
    expect(spacing[4]).toBe(16);
  });
});

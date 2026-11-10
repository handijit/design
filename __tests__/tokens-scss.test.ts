import { compileString } from "sass";
import { describe, expect, test } from "vitest";

import { staticGroups, themedGroups } from "../lib/generators/declarations";
import renderTokensScss from "../lib/generators/tokens-scss";

const scss = renderTokensScss();

/** Compiles a consumer stylesheet against the generated file, the way a project would. */
const compile = (source: string): string =>
  compileString(`@use "hd:tokens" as *;\n${source}`, {
    style: "compressed",
    importers: [
      {
        canonicalize: (url) => (url === "hd:tokens" ? new URL(url) : null),
        load: () => ({ contents: scss, syntax: "scss" }),
      },
    ],
  }).css;

const TOKEN_NAMES = [...staticGroups(), ...themedGroups("dark")].flatMap(
  ({ declarations }) => declarations.map(([name]) => name)
);

describe("tokens.scss", () => {
  test("should compile on its own without emitting any CSS", () => {
    expect(compile("")).toBe("");
  });

  test("should declare one variable per token, pointing at its custom property", () => {
    expect(TOKEN_NAMES).toHaveLength(262);
    for (const name of TOKEN_NAMES) {
      expect(scss, name).toContain(`\n$hd-${name}: var(--hd-${name});\n`);
    }
  });

  test("should resolve variables to var() references", () => {
    expect(
      compile(".card { background: $hd-bg-surface; padding: $hd-space-4; }")
    ).toBe(".card{background:var(--hd-bg-surface);padding:var(--hd-space-4)}");
  });

  test("should look tokens up by name and reject unknown names", () => {
    expect(compile(".a { color: hd-var(primary-text); }")).toBe(
      ".a{color:var(--hd-primary-text)}"
    );
    expect(compile('.a { z-index: hd-var("z-modal"); }')).toBe(
      ".a{z-index:var(--hd-z-modal)}"
    );
    expect(() => compile(".a { color: hd-var(primry); }")).toThrow(
      "hd-var: unknown token `primry`."
    );
  });

  test("should expose the breakpoints as compile-time pixels", () => {
    expect(compile(".a { width: $hd-breakpoint-md; }")).toBe(".a{width:768px}");
    expect(compile(".a { width: hd-breakpoint(xl); }")).toBe(
      ".a{width:1280px}"
    );
    expect(() => compile(".a { width: hd-breakpoint(xxl); }")).toThrow(
      "hd-breakpoint: unknown breakpoint `xxl`. Expected one of sm, md, lg, xl."
    );
  });

  test("should build min-width queries with hd-up", () => {
    expect(compile(".a { @include hd-up(md) { color: red; } }")).toBe(
      "@media(min-width: 768px){.a{color:red}}"
    );
  });

  test("should build non-overlapping max-width queries with hd-down", () => {
    expect(compile(".a { @include hd-down(md) { color: red; } }")).toBe(
      "@media(max-width: 767.98px){.a{color:red}}"
    );
  });

  test("should build a closed range with hd-between", () => {
    expect(compile(".a { @include hd-between(sm, lg) { color: red; } }")).toBe(
      "@media(min-width: 640px)and (max-width: 1023.98px){.a{color:red}}"
    );
  });

  test("should wrap content for reduced motion", () => {
    expect(
      compile(".a { @include hd-reduced-motion { transition: none; } }")
    ).toBe("@media(prefers-reduced-motion: reduce){.a{transition:none}}");
  });

  test("should set a complete type role with hd-type", () => {
    expect(compile(".title { @include hd-type(h1); }")).toBe(
      ".title{font-family:var(--hd-font-display);font-size:var(--hd-type-h1-size);" +
        "line-height:var(--hd-type-h1-line-height);font-weight:var(--hd-type-h1-weight);" +
        "letter-spacing:var(--hd-type-h1-letter-spacing);font-stretch:var(--hd-type-h1-stretch)}"
    );
    expect(compile(".code { @include hd-type(code); }")).toContain(
      "font-family:var(--hd-font-mono)"
    );
    expect(() => compile(".a { @include hd-type(h7); }")).toThrow(
      "hd-type: unknown type role `h7`."
    );
  });

  test("should end with a single newline", () => {
    expect(scss.endsWith("}\n")).toBe(true);
    expect(scss.endsWith("\n\n")).toBe(false);
  });
});

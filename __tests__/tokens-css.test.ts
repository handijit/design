import { describe, expect, test } from "vitest";

import { staticGroups, themedGroups } from "../lib/generators/declarations";
import renderTokensCss from "../lib/generators/tokens-css";
import effects from "../lib/tokens/effects";
import themes from "../lib/tokens/themes";

type Rule = { selector: string; body: string; media: string | null };

/** Splits the stylesheet into its rules; the generator emits at most one level of nesting. */
const parseRules = (css: string): Rule[] => {
  const rules: Rule[] = [];
  const pattern = /(@media [^{]+|[^{}@/]+)\{((?:[^{}]|\{[^{}]*\})*)\}/g;

  for (const [, head, body] of css.matchAll(pattern)) {
    const prelude = (head as string).trim().replace(/\s+/g, " ");
    if (prelude.startsWith("@media")) {
      for (const nested of parseRules(body as string)) {
        rules.push({ ...nested, media: prelude });
      }
    } else {
      rules.push({ selector: prelude, body: body as string, media: null });
    }
  }

  return rules;
};

const declarations = (body: string): Record<string, string> =>
  Object.fromEntries(
    [...body.matchAll(/^\s*([\w-]+):\s*(.+);$/gm)].map(
      ([, property, value]) => [property as string, value as string]
    )
  );

const css = renderTokensCss();
const withoutComments = css.replace(/\/\*[^]*?\*\//g, "");
const rules = parseRules(withoutComments);
const find = (selector: string, media: string | null = null): Rule => {
  const rule = rules.find(
    (candidate) => candidate.selector === selector && candidate.media === media
  );
  if (rule === undefined) throw new Error(`no rule for ${selector}`);
  return rule;
};

const STATIC_NAMES = staticGroups().flatMap(({ declarations: list }) =>
  list.map(([name]) => `--hd-${name}`)
);
const THEMED_NAMES = themedGroups("light").flatMap(({ declarations: list }) =>
  list.map(([name]) => `--hd-${name}`)
);

describe("tokens.css", () => {
  test("should consist of exactly the five documented rules", () => {
    expect(
      rules.map(({ selector, media }) =>
        media === null ? selector : `${media} { ${selector} }`
      )
    ).toEqual([
      ":root",
      ':root, [data-theme="light"]',
      '@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) }',
      ':root[data-theme="dark"], [data-theme="dark"]',
      "@media (prefers-reduced-motion: reduce) { :root }",
    ]);
  });

  test("should declare every theme-independent token once on :root", () => {
    const root = declarations(find(":root").body);

    expect(Object.keys(root)).toEqual(STATIC_NAMES);
    expect(STATIC_NAMES).toHaveLength(191);
    expect(root["--hd-cobalt-600"]).toBe("#2661fa");
    expect(root["--hd-slate-0"]).toBe("#ffffff");
    expect(root["--hd-space-4"]).toBe("1rem");
    expect(root["--hd-space-0"]).toBe("0rem");
    expect(root["--hd-radius-md"]).toBe("14px");
    expect(root["--hd-radius-pill"]).toBe("999px");
    expect(root["--hd-type-body-size"]).toBe("0.9375rem");
    expect(root["--hd-type-body-line-height"]).toBe("1.55");
    expect(root["--hd-type-h1-stretch"]).toBe("110%");
    expect(root["--hd-type-body-letter-spacing"]).toBe("0em");
    expect(root["--hd-font-weight-semibold"]).toBe("600");
    expect(root["--hd-duration-fast"]).toBe("120ms");
    expect(root["--hd-ease-standard"]).toBe("cubic-bezier(0.2, 0, 0, 1)");
    expect(root["--hd-z-modal"]).toBe("1200");
    expect(root["--hd-font-mono"]).toMatch(/^"IBM Plex Mono", ui-monospace, /);
  });

  test("should keep theme-dependent values out of the static block", () => {
    const root = find(":root").body;

    // A custom property resolves var() where it is declared, so a themed value referenced
    // from :root would freeze to the root theme inside a nested theme island.
    expect(root).not.toMatch(/var\(/);
    expect(root).not.toMatch(/color-scheme/);
    for (const name of THEMED_NAMES) {
      expect(root, name).not.toContain(`${name}:`);
    }
  });

  test.each([
    ["light", ':root, [data-theme="light"]', null],
    ["dark", ':root[data-theme="dark"], [data-theme="dark"]', null],
    [
      "dark",
      ':root:not([data-theme="light"])',
      "@media (prefers-color-scheme: dark)",
    ],
  ] as const)(
    "should declare the full %s theme under %s",
    (theme, selector, media) => {
      const block = declarations(find(selector, media).body);

      expect(Object.keys(block)).toEqual(["color-scheme", ...THEMED_NAMES]);
      expect(block["color-scheme"]).toBe(theme);
      for (const [token, value] of Object.entries({
        ...themes[theme],
        ...effects[theme],
      })) {
        expect(block[`--hd-${token}`], token).toBe(value);
      }
    }
  );

  test("should give the explicit dark rule priority over the light default", () => {
    // Same specificity as `[data-theme="light"]`, so source order decides for islands.
    expect(css.indexOf('[data-theme="dark"] {')).toBeGreaterThan(
      css.indexOf('[data-theme="light"] {')
    );
  });

  test("should shorten every duration for reduced motion without zeroing it", () => {
    const reduced = declarations(
      find(":root", "@media (prefers-reduced-motion: reduce)").body
    );

    expect(reduced).toEqual({
      "--hd-duration-fast": "0.01ms",
      "--hd-duration-base": "0.01ms",
      "--hd-duration-slow": "0.01ms",
    });
  });

  test("should not emit breakpoints, which var() cannot feed to a media query", () => {
    expect(css).not.toMatch(/--hd-breakpoint/);
  });

  test("should name every custom property with the hd prefix", () => {
    const properties = [...withoutComments.matchAll(/^\s*(--[\w-]+):/gm)].map(
      ([, property]) => property as string
    );

    expect(properties).toHaveLength(191 + 3 * 71 + 3);
    expect(properties.every((property) => property.startsWith("--hd-"))).toBe(
      true
    );
  });

  test("should end with a single newline and carry no tabs", () => {
    expect(css.endsWith("}\n")).toBe(true);
    expect(css.endsWith("\n\n")).toBe(false);
    expect(css).not.toContain("\t");
  });

  test("should fail loudly when asked for a rule that does not exist", () => {
    expect(() => find(".missing")).toThrow("no rule for .missing");
  });
});

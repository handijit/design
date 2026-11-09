import { readFileSync } from "node:fs";

import { describe, expect, test } from "vitest";

import * as api from "../lib/index";
import cssVarName from "../lib/modules/css-var-name";
import type { ColorToken, EffectToken } from "../lib/types";

// The README is the reference for every name and value; these tests fail when a token is
// added, renamed or retuned without the tables being updated.
// Prettier pads table cells, so runs of spaces carry no meaning.
const readme = readFileSync("README.md", "utf8").replace(/ +/g, " ");
const barrel = readFileSync("lib/index.ts", "utf8");

const keysOf = <Key extends string>(
  map: Readonly<Record<Key, unknown>>
): Key[] => Object.keys(map) as Key[];

describe("README", () => {
  test("should document every value export", () => {
    const missing = Object.keys(api).filter(
      (name) => !readme.includes(`\`${name}\``)
    );

    expect(missing).toEqual([]);
  });

  test("should name every exported type", () => {
    const block = /export type \{([^}]+)\}/.exec(barrel);
    const types = (block?.[1] ?? "")
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name !== "");

    expect(types).toHaveLength(46);
    expect(types.filter((name) => !readme.includes(`\`${name}\``))).toEqual([]);
  });

  test("should list every colour token with its light and dark value", () => {
    const missing = keysOf<ColorToken>(api.themes.light).filter(
      (token) =>
        !readme.includes(
          `| \`${cssVarName(token)}\` | \`${api.themes.light[token]}\` | \`${api.themes.dark[token]}\` |`
        )
    );

    expect(keysOf(api.themes.light)).toHaveLength(64);
    expect(missing).toEqual([]);
  });

  test("should list every effect token with its light and dark value", () => {
    const missing = keysOf<EffectToken>(api.effects.light).filter(
      (token) =>
        !readme.includes(
          `| \`${cssVarName(token)}\` | \`${api.effects.light[token]}\` | \`${api.effects.dark[token]}\` |`
        )
    );

    expect(missing).toEqual([]);
  });

  test("should list every step of every scale", () => {
    for (const [name, steps] of Object.entries(api.scales)) {
      const row = readme
        .split("\n")
        .find((line) => line.startsWith(`| \`${name}\` |`));

      expect(row, name).toBeDefined();
      for (const hex of Object.values(steps)) {
        expect(row, `${name} ${hex}`).toContain(`\`${hex}\``);
      }
    }
  });

  test("should list every type role with its size", () => {
    for (const [role, style] of Object.entries(api.typography)) {
      expect(readme).toContain(
        `| \`${role}\` | ${style.font} | ${style.size}px (${style.size / 16}rem) | ${style.lineHeight} | ${style.weight} |`
      );
    }
  });

  test("should quote the current boot script digest and font stacks", () => {
    expect(readme).toContain(`\`"${api.THEME_BOOT_SCRIPT_HASH}"\``);
    expect(readme).toContain(
      `A ${new TextEncoder().encode(api.THEME_BOOT_SCRIPT).length}-byte script`
    );
    for (const stack of Object.values(api.fonts)) {
      expect(readme).toContain(`\`${stack}\``);
    }
  });
});

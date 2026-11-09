import { describe, expect, test } from "vitest";

import type { UnicodeRanges } from "../lib/generators/fonts-css";
import renderFontsCss, { fontFileName } from "../lib/generators/fonts-css";
import fontFaces from "../lib/tokens/font-faces";
import fonts from "../lib/tokens/fonts";
import archivoRanges from "../node_modules/@fontsource-variable/archivo/unicode.json";
import interRanges from "../node_modules/@fontsource-variable/inter/unicode.json";
import plexRanges from "../node_modules/@fontsource/ibm-plex-mono/unicode.json";

// The same data the build reads: the ranges published with the font files themselves.
const RANGES: UnicodeRanges = {
  "@fontsource-variable/archivo": archivoRanges,
  "@fontsource-variable/inter": interRanges,
  "@fontsource/ibm-plex-mono": plexRanges,
};

// ğ Ğ ş Ş İ ı ö Ö ü Ü ç Ç
const TURKISH = [
  0x11f, 0x11e, 0x15f, 0x15e, 0x130, 0x131, 0xf6, 0xd6, 0xfc, 0xdc, 0xe7, 0xc7,
];

type Face = Record<string, string>;

const parseFaces = (css: string): Face[] =>
  [...css.matchAll(/@font-face \{([^}]+)\}/g)].map(([, body]) =>
    Object.fromEntries(
      [...(body as string).matchAll(/^\s*([\w-]+):\s*(.+);$/gm)].map(
        ([, property, value]) => [property as string, value as string]
      )
    )
  );

const covers = (range: string, codePoint: number): boolean =>
  range.split(",").some((part) => {
    const [from, to = from] = part.trim().replace("U+", "").split("-");
    return (
      codePoint >= parseInt(from as string, 16) &&
      codePoint <= parseInt(to as string, 16)
    );
  });

const css = renderFontsCss(RANGES);
const faces = parseFaces(css);

describe("fonts.css", () => {
  test("should register every face for the latin-ext and latin subsets", () => {
    expect(
      faces.map((face) => `${face["font-family"]} ${face["font-weight"]}`)
    ).toEqual([
      '"Archivo" 100 900',
      '"Archivo" 100 900',
      '"Inter" 100 900',
      '"Inter" 100 900',
      '"IBM Plex Mono" 400',
      '"IBM Plex Mono" 400',
      '"IBM Plex Mono" 500',
      '"IBM Plex Mono" 500',
    ]);
  });

  test("should keep the width axis of Archivo and of no other family", () => {
    for (const face of faces) {
      expect(face["font-stretch"]).toBe(
        face["font-family"] === '"Archivo"' ? "62% 125%" : undefined
      );
    }
  });

  test("should point at woff2 files next to the stylesheet", () => {
    expect(faces.map((face) => face.src)).toEqual([
      'url("./fonts/archivo-latin-ext-wdth-normal.woff2") format("woff2")',
      'url("./fonts/archivo-latin-wdth-normal.woff2") format("woff2")',
      'url("./fonts/inter-latin-ext-wght-normal.woff2") format("woff2")',
      'url("./fonts/inter-latin-wght-normal.woff2") format("woff2")',
      'url("./fonts/ibm-plex-mono-latin-ext-400-normal.woff2") format("woff2")',
      'url("./fonts/ibm-plex-mono-latin-400-normal.woff2") format("woff2")',
      'url("./fonts/ibm-plex-mono-latin-ext-500-normal.woff2") format("woff2")',
      'url("./fonts/ibm-plex-mono-latin-500-normal.woff2") format("woff2")',
    ]);
    expect(css).not.toMatch(/https?:/);
  });

  test("should swap in the font without hiding text and stay upright", () => {
    for (const face of faces) {
      expect(face["font-display"]).toBe("swap");
      expect(face["font-style"]).toBe("normal");
    }
  });

  test("should cover every Turkish letter in every family", () => {
    for (const family of ['"Archivo"', '"Inter"', '"IBM Plex Mono"']) {
      const ranges = faces
        .filter((face) => face["font-family"] === family)
        .map((face) => face["unicode-range"] as string);

      for (const codePoint of TURKISH) {
        expect(
          ranges.some((range) => covers(range, codePoint)),
          `${family} U+${codePoint.toString(16)}`
        ).toBe(true);
      }
    }
  });

  test("should register the family names the font stacks start with", () => {
    const registered = new Set(
      faces.map((face) => (face["font-family"] as string).replaceAll('"', ""))
    );
    const first = Object.values(fonts).map((stack) =>
      (stack.split(",")[0] as string).replaceAll('"', "")
    );

    expect([...registered].sort()).toEqual([...first].sort());
  });

  test("should name the licence of the fonts", () => {
    expect(css.split("\n")[0]).toBe(
      "/* @handijit/design — generated. Fonts are licensed under the SIL Open Font License 1.1; see fonts/LICENSE-*.txt. */"
    );
  });

  test.each([
    ["a missing package", {}],
    [
      "a missing subset",
      { ...RANGES, "@fontsource-variable/inter": { latin: "U+0000-00FF" } },
    ],
    [
      "an empty range",
      {
        ...RANGES,
        "@fontsource-variable/archivo": {
          latin: "U+0000-00FF",
          "latin-ext": "",
        },
      },
    ],
  ])("should refuse to build with %s", (_, ranges) => {
    expect(() => renderFontsCss(ranges)).toThrow(TypeError);
    expect(() => renderFontsCss(ranges)).toThrow(
      /^renderFontsCss: no unicode range for subset "latin-ext" of @fontsource-variable\//
    );
  });
});

describe("fontFileName", () => {
  test("should fill the subset into the file pattern", () => {
    expect(fontFileName(fontFaces[0]!, "latin")).toBe(
      "archivo-latin-wdth-normal.woff2"
    );
  });
});

import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, test } from "vitest";

import renderFontsCss from "../lib/generators/fonts-css";
import { fontFiles, fontSources, renderAssets } from "../lib/generators/index";
import renderLogoSvg from "../lib/generators/logo-svg";
import renderTokensCss from "../lib/generators/tokens-css";
import renderTokensJson from "../lib/generators/tokens-json";
import renderTokensScss from "../lib/generators/tokens-scss";

const RANGE = { latin: "U+0000-00FF", "latin-ext": "U+0100-02BA" };
const RANGES = {
  "@fontsource-variable/archivo": RANGE,
  "@fontsource-variable/inter": RANGE,
  "@fontsource/ibm-plex-mono": RANGE,
};

describe("renderAssets", () => {
  test("should render every generated file of the package", () => {
    expect(renderAssets(RANGES)).toEqual({
      "tokens.css": renderTokensCss(),
      "tokens.d.css.ts": "export {};\n",
      "tokens.scss": renderTokensScss(),
      "tokens.json": renderTokensJson(),
      "fonts.css": renderFontsCss(RANGES),
      "fonts.d.css.ts": "export {};\n",
      "logos/mark.svg": renderLogoSvg("mark"),
      "logos/horizontal.svg": renderLogoSvg("horizontal"),
    });
  });
});

describe("fontSources", () => {
  test("should list each font package once", () => {
    expect(fontSources()).toEqual([
      "@fontsource-variable/archivo",
      "@fontsource-variable/inter",
      "@fontsource/ibm-plex-mono",
    ]);
  });

  test("should name packages that ship an OFL licence text", () => {
    for (const source of fontSources()) {
      expect(existsSync(join("node_modules", source, "LICENSE")), source).toBe(
        true
      );
    }
  });
});

describe("fontFiles", () => {
  test("should list the eight files fonts.css points at", () => {
    const css = renderFontsCss(RANGES);
    const files = fontFiles();

    expect(files).toHaveLength(8);
    expect(files.map(({ file }) => `./fonts/${file}`)).toEqual(
      [...css.matchAll(/url\("([^"]+)"\)/g)].map(([, url]) => url)
    );
  });

  test("should name files that exist in the installed font packages", () => {
    for (const { source, file } of fontFiles()) {
      expect(
        existsSync(join("node_modules", source, "files", file)),
        `${source}/files/${file}`
      ).toBe(true);
    }
  });
});

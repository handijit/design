import fontFaces, { FONT_SUBSETS } from "../tokens/font-faces";
import logos from "../tokens/logos";
import type { LogoName } from "../types";
import type { UnicodeRanges } from "./fonts-css";
import renderFontsCss, { fontFileName } from "./fonts-css";
import renderLogoSvg from "./logo-svg";
import renderTokensCss from "./tokens-css";
import renderTokensJson from "./tokens-json";
import renderTokensScss from "./tokens-scss";

type FontFileCopy = {
  /** Package the file is read from. */
  readonly source: string;
  /** File name, both inside the package's `files/` and in the published `fonts/`. */
  readonly file: string;
};

// TypeScript resolves `import "@handijit/design/tokens.css"` to this declaration.
const STYLE_DECLARATION = "export {};\n";

/** Every generated text file of the package, keyed by its path inside `build/`. */
const renderAssets = (
  unicodeRanges: UnicodeRanges
): Record<string, string> => ({
  "tokens.css": renderTokensCss(),
  "tokens.d.css.ts": STYLE_DECLARATION,
  "tokens.scss": renderTokensScss(),
  "tokens.json": renderTokensJson(),
  "fonts.css": renderFontsCss(unicodeRanges),
  "fonts.d.css.ts": STYLE_DECLARATION,
  ...Object.fromEntries(
    (Object.keys(logos) as LogoName[]).map((name) => [
      `logos/${name}.svg`,
      renderLogoSvg(name),
    ])
  ),
});

/** The font binaries `fonts.css` points at; the build copies them out of `node_modules`. */
const fontFiles = (): FontFileCopy[] =>
  fontFaces.flatMap((face) =>
    FONT_SUBSETS.map((subset) => ({
      source: face.source,
      file: fontFileName(face, subset),
    }))
  );

/** The packages whose licence text has to travel with the font files. */
const fontSources = (): string[] => [
  ...new Set(fontFaces.map((face) => face.source)),
];

export type { FontFileCopy };
export { fontFiles, fontSources, renderAssets };

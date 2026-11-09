import type { FontFaceSource, FontSubset } from "../tokens/font-faces";
import fontFaces, { FONT_SUBSETS } from "../tokens/font-faces";

/** `unicode-range` of every subset, per source package (from its `unicode.json`). */
type UnicodeRanges = Readonly<
  Record<string, Readonly<Partial<Record<FontSubset, string>>>>
>;

/** The file a face ships for a subset, as named in the source package and in `fonts/`. */
const fontFileName = (face: FontFaceSource, subset: FontSubset): string =>
  face.file.replace("{subset}", subset);

const renderFace = (
  face: FontFaceSource,
  subset: FontSubset,
  range: string
): string =>
  [
    "@font-face {",
    `  font-family: "${face.family}";`,
    "  font-style: normal;",
    // Text stays readable in the fallback stack while the file loads.
    "  font-display: swap;",
    `  font-weight: ${face.weight};`,
    ...(face.stretch === undefined ? [] : [`  font-stretch: ${face.stretch};`]),
    `  src: url("./fonts/${fontFileName(face, subset)}") format("woff2");`,
    `  unicode-range: ${range};`,
    "}",
  ].join("\n");

/**
 * Renders `fonts.css`: self-hosted `@font-face` rules, so nothing is fetched from a font
 * CDN (the desktop apps run offline). The ranges come from the font packages, because they
 * describe which glyphs each file really contains.
 */
const renderFontsCss = (unicodeRanges: UnicodeRanges): string => {
  const faces = fontFaces.flatMap((face) =>
    FONT_SUBSETS.map((subset) => {
      const range = unicodeRanges[face.source]?.[subset];
      if (typeof range !== "string" || range === "") {
        throw new TypeError(
          `renderFontsCss: no unicode range for subset "${subset}" of ${face.source}`
        );
      }
      return renderFace(face, subset, range);
    })
  );

  return `${[
    "/* @handijit/design — generated. Fonts are licensed under the SIL Open Font License 1.1; see fonts/LICENSE-*.txt. */",
    ...faces,
  ].join("\n\n")}\n`;
};

export type { UnicodeRanges };
export { fontFileName };
export default renderFontsCss;

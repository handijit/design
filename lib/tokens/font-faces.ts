type FontSubset = "latin" | "latin-ext";

type FontFaceSource = {
  /** The `font-family` name the face registers. */
  readonly family: string;
  /** The npm package the files are copied from at build time. */
  readonly source: string;
  /** File name of the face; `{subset}` is replaced with the subset name. */
  readonly file: string;
  /** `font-weight` descriptor: one weight or the range of the weight axis. */
  readonly weight: string;
  /** `font-stretch` descriptor, for faces with a width axis. */
  readonly stretch?: string;
};

/** Turkish needs both: latin-ext carries ğ Ğ ş Ş İ, latin carries ı ö ü ç. */
const FONT_SUBSETS: readonly FontSubset[] = ["latin-ext", "latin"];

/**
 * The font files `fonts.css` registers. Archivo keeps its width axis (headings are set at
 * 108–112% width); Inter keeps only the weight axis.
 */
const fontFaces: readonly FontFaceSource[] = [
  {
    family: "Archivo",
    source: "@fontsource-variable/archivo",
    file: "archivo-{subset}-wdth-normal.woff2",
    weight: "100 900",
    stretch: "62% 125%",
  },
  {
    family: "Inter",
    source: "@fontsource-variable/inter",
    file: "inter-{subset}-wght-normal.woff2",
    weight: "100 900",
  },
  {
    family: "IBM Plex Mono",
    source: "@fontsource/ibm-plex-mono",
    file: "ibm-plex-mono-{subset}-400-normal.woff2",
    weight: "400",
  },
  {
    family: "IBM Plex Mono",
    source: "@fontsource/ibm-plex-mono",
    file: "ibm-plex-mono-{subset}-500-normal.woff2",
    weight: "500",
  },
];

export type { FontFaceSource, FontSubset };
export { FONT_SUBSETS };
export default fontFaces;

import { assertFinite, fitChroma } from "../helpers/oklch.helper";

// No sRGB colour reaches this chroma, so the search always starts outside the gamut.
const CHROMA_CEILING = 0.4;

/** The highest chroma sRGB can show at the given OKLCH lightness and hue. */
const maxChroma = (l: number, h: number): number => {
  assertFinite(l, "l", "maxChroma");
  assertFinite(h, "h", "maxChroma");
  return fitChroma(l, h, CHROMA_CEILING);
};

export default maxChroma;

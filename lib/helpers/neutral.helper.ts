import oklchToHex from "../modules/oklch-to-hex";
import hues from "../tokens/hues";

/** A neutral at the given lightness and chroma; neutrals lean to the cobalt hue. */
const neutral = (l: number, c: number): string =>
  oklchToHex({ l, c, h: hues.cobalt });

export default neutral;

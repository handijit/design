import { srgbToOklab } from "../helpers/oklch.helper";
import { parseHex } from "../helpers/srgb.helper";

/**
 * Perceptual distance between two hex colours: Euclidean OKLab distance × 100.
 * Around 2 is a just-noticeable difference; the palette keeps chart colours 10 apart.
 */
const deltaE = (first: string, second: string): number => {
  const from = srgbToOklab(parseHex(first, "deltaE"));
  const to = srgbToOklab(parseHex(second, "deltaE"));
  return Math.hypot(from.l - to.l, from.a - to.a, from.b - to.b) * 100;
};

export default deltaE;

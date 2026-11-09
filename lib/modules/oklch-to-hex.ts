import {
  assertFinite,
  fitChroma,
  isInGamut,
  oklchToSrgb,
} from "../helpers/oklch.helper";
import { formatHex } from "../helpers/srgb.helper";
import type { Oklch } from "../types";

/**
 * Converts an OKLCH colour to `#rrggbb`. A colour outside sRGB keeps its lightness and hue
 * and gives up chroma until it fits; channels are never clipped individually.
 */
const oklchToHex = (color: Oklch): string => {
  // Destructuring a missing argument would throw an unhelpful engine error instead.
  const { l, c, h } = (color ?? {}) as Partial<Oklch>;
  assertFinite(l, "l", "oklchToHex");
  assertFinite(c, "c", "oklchToHex");
  assertFinite(h, "h", "oklchToHex");

  // Negative chroma is the same colour mirrored through grey; read it as "no chroma".
  const chroma = Math.max(0, c as number);
  const requested = { l: l as number, c: chroma, h: h as number };
  const direct = oklchToSrgb(requested);
  if (isInGamut(direct)) return formatHex(direct);

  return formatHex(
    oklchToSrgb({
      ...requested,
      c: fitChroma(requested.l, requested.h, chroma),
    })
  );
};

export default oklchToHex;

import { srgbToOklab } from "../helpers/oklch.helper";
import { parseHex } from "../helpers/srgb.helper";
import type { Oklch } from "../types";

// Below this chroma the hue angle is rounding noise, not information.
const ACHROMATIC_CHROMA = 0.0001;

/** Converts `#rgb` / `#rrggbb` to OKLCH. Greys report chroma 0 and hue 0. */
const hexToOklch = (hex: string): Oklch => {
  const { l, a, b } = srgbToOklab(parseHex(hex, "hexToOklch"));
  const c = Math.hypot(a, b);
  if (c < ACHROMATIC_CHROMA) return { l, c: 0, h: 0 };

  return { l, c, h: ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360 };
};

export default hexToOklch;

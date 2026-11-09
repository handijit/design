import type { Oklch } from "../types";
import type { Rgb } from "./srgb.helper";
import { toGamma, toLinear } from "./srgb.helper";

type Oklab = { l: number; a: number; b: number };

// Rounding noise at the gamut edge must not count as "out of gamut".
const GAMUT_EPSILON = 0.0001;

// 24 halvings of the widest chroma interval land far below one 8-bit step.
const BISECTION_STEPS = 24;

/** OKLCH → gamma-encoded sRGB, without any gamut handling. */
const oklchToSrgb = ({ l, c, h }: Oklch): Rgb => {
  const radians = (h * Math.PI) / 180;
  const greenRed = c * Math.cos(radians);
  const blueYellow = c * Math.sin(radians);

  const long = (l + 0.3963377774 * greenRed + 0.2158037573 * blueYellow) ** 3;
  const medium = (l - 0.1055613458 * greenRed - 0.0638541728 * blueYellow) ** 3;
  const short = (l - 0.0894841775 * greenRed - 1.291485548 * blueYellow) ** 3;

  return {
    r: toGamma(
      4.0767416621 * long - 3.3077115913 * medium + 0.2309699292 * short
    ),
    g: toGamma(
      -1.2684380046 * long + 2.6097574011 * medium - 0.3413193965 * short
    ),
    b: toGamma(
      -0.0041960863 * long - 0.7034186147 * medium + 1.707614701 * short
    ),
  };
};

const isChannelInGamut = (channel: number): boolean =>
  channel >= -GAMUT_EPSILON && channel <= 1 + GAMUT_EPSILON;

const isInGamut = ({ r, g, b }: Rgb): boolean =>
  isChannelInGamut(r) && isChannelInGamut(g) && isChannelInGamut(b);

/** The highest chroma up to `ceiling` that still fits sRGB at this lightness and hue. */
const fitChroma = (l: number, h: number, ceiling: number): number => {
  let low = 0;
  let high = ceiling;

  for (let step = 0; step < BISECTION_STEPS; step += 1) {
    const middle = (low + high) / 2;
    if (isInGamut(oklchToSrgb({ l, c: middle, h }))) low = middle;
    else high = middle;
  }

  return low;
};

/** Gamma-encoded sRGB → OKLab. */
const srgbToOklab = (rgb: Rgb): Oklab => {
  const r = toLinear(rgb.r);
  const g = toLinear(rgb.g);
  const b = toLinear(rgb.b);

  const long = Math.cbrt(
    0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
  );
  const medium = Math.cbrt(
    0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
  );
  const short = Math.cbrt(
    0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
  );

  return {
    l: 0.2104542553 * long + 0.793617785 * medium - 0.0040720468 * short,
    a: 1.9779984951 * long - 2.428592205 * medium + 0.4505937099 * short,
    b: 0.0259040371 * long + 0.7827717662 * medium - 0.808675766 * short,
  };
};

/** Rejects `NaN`, `±Infinity` and non-numbers: no colour can be computed from them. */
const assertFinite = (value: unknown, name: string, caller: string): void => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError(
      `${caller}: ${name} must be a finite number, received ${String(value)}`
    );
  }
};

export type { Oklab };
export { assertFinite, fitChroma, isInGamut, oklchToSrgb, srgbToOklab };

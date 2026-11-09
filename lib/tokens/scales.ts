import neutral from "../helpers/neutral.helper";
import maxChroma from "../modules/max-chroma";
import oklchToHex from "../modules/oklch-to-hex";
import type {
  ChromaticScale,
  ChromaticScaleName,
  ChromaticStep,
  NeutralScale,
  Scales,
} from "../types";
import hues from "./hues";

const STEPS: readonly ChromaticStep[] = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
];

const LIGHTNESS: readonly number[] = [
  0.975, 0.945, 0.895, 0.825, 0.735, 0.645, 0.555, 0.475, 0.395, 0.315, 0.235,
];

/** Share of the gamut's maximum chroma each step uses. */
const SATURATION: readonly number[] = [
  0.8, 0.8, 0.82, 0.86, 0.9, 0.95, 0.96, 0.94, 0.9, 0.85, 0.8,
];

/** Per-family lightness shift: warm and green hues peak lighter than blue. */
const LIGHTNESS_SHIFT: Readonly<Partial<Record<ChromaticScaleName, number>>> = {
  coral: 0.04,
  warning: 0.06,
  turquoise: 0.03,
  success: 0.03,
};

/** How much of the family shift each step receives. */
const SHIFT_CURVE: readonly number[] = [
  0, 0, 0.25, 0.6, 1, 1, 1, 1, 0.5, 0.25, 0,
];

/** Cyan and green tints turn neon at full saturation; these families keep quieter tints. */
const TINT: Readonly<Partial<Record<ChromaticScaleName, number>>> = {
  turquoise: 0.5,
  success: 0.5,
};

const tintFactor = (index: number, tint: number): number => {
  if (index <= 2) return tint;
  // Step 300 eases from the quiet tints into the fully saturated mid-tones.
  if (index === 3) return (tint + 1) / 2;
  return 1;
};

const buildScale = (name: ChromaticScaleName): ChromaticScale => {
  const h = hues[name];
  const shift = LIGHTNESS_SHIFT[name] ?? 0;
  const tint = TINT[name] ?? 1;

  return Object.fromEntries(
    STEPS.map((step, index) => {
      const l =
        (LIGHTNESS[index] as number) + shift * (SHIFT_CURVE[index] as number);
      const s = (SATURATION[index] as number) * tintFactor(index, tint);
      return [step, oklchToHex({ l, c: maxChroma(l, h) * s, h })];
    })
  ) as ChromaticScale;
};

const slate: NeutralScale = {
  0: "#ffffff",
  25: neutral(0.988, 0.004),
  50: neutral(0.974, 0.007),
  100: neutral(0.953, 0.01),
  200: neutral(0.915, 0.014),
  300: neutral(0.86, 0.019),
  400: neutral(0.735, 0.025),
  500: neutral(0.545, 0.032),
  600: neutral(0.47, 0.034),
  700: neutral(0.405, 0.036),
  800: neutral(0.31, 0.038),
  900: neutral(0.235, 0.04),
  950: neutral(0.18, 0.038),
};

/**
 * The raw colour scales. They are the same in every theme; components should reach for
 * the semantic colours in `themes` first.
 */
const scales: Scales = {
  cobalt: buildScale("cobalt"),
  coral: buildScale("coral"),
  turquoise: buildScale("turquoise"),
  success: buildScale("success"),
  warning: buildScale("warning"),
  danger: buildScale("danger"),
  violet: buildScale("violet"),
  magenta: buildScale("magenta"),
  slate,
};

export default scales;

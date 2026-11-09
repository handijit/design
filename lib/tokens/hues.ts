import type { HueName } from "../types";

/** OKLCH hue angle of every chromatic family. Neutrals lean to the cobalt hue. */
const hues: Readonly<Record<HueName, number>> = {
  cobalt: 264,
  coral: 33,
  turquoise: 192,
  success: 156,
  warning: 78,
  danger: 14,
  violet: 310,
  magenta: 348,
};

export default hues;

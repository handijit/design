import { parseHex } from "../helpers/srgb.helper";
import type {
  Effects,
  EffectTone,
  ShadowLayer,
  ThemeEffects,
  ThemeEffectValues,
} from "../types";
import effectValues from "./effect-values";

/** Space-separated sRGB channels of a hex colour, for `rgb(<channels> / <alpha>)`. */
const channels = (hex: string): string => {
  const { r, g, b } = parseHex(hex, "effects");
  return [r, g, b].map((channel) => Math.round(channel * 255)).join(" ");
};

// A zero length is written bare and a zero spread is left out, as one writes it by hand.
const px = (pixels: number): string => (pixels === 0 ? "0" : `${pixels}px`);

const geometry = ({ x, y, blur, spread }: ShadowLayer): string =>
  [x, y, blur, ...(spread === 0 ? [] : [spread])].map(px).join(" ");

const rgb = ({ color, alpha }: EffectTone): string =>
  `rgb(${channels(color)} / ${alpha})`;

const shadow = (color: string, layers: readonly ShadowLayer[]): string =>
  layers
    .map((layer) => `${geometry(layer)} ${rgb({ color, alpha: layer.alpha })}`)
    .join(", ");

const render = (values: ThemeEffectValues): ThemeEffects => ({
  "shadow-color": channels(values.shadow.color),
  "shadow-alpha": String(values.shadow.alpha),
  "shadow-1": shadow(values.shadow.color, values.shadows[1]),
  "shadow-2": shadow(values.shadow.color, values.shadows[2]),
  "shadow-3": shadow(values.shadow.color, values.shadows[3]),
  scrim: rgb(values.scrim),
});

/**
 * Theme-dependent values that are not plain colours: the three elevation shadows, the raw
 * shadow colour and opacity for custom shadows, and the dialog scrim. These are the CSS
 * strings of `effectValues`, which holds the same data as hex and numbers.
 */
const effects: Effects = {
  light: render(effectValues.light),
  dark: render(effectValues.dark),
};

export default effects;

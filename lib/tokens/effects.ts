import { parseHex } from "../helpers/srgb.helper";
import type { Effects, ThemeEffects, ThemeName } from "../types";
import themes from "./themes";

type ShadowLayer = {
  /** Vertical offset, blur radius and spread in CSS pixels. */
  readonly geometry: string;
  /** Multiple of the theme's base shadow opacity. */
  readonly strength: number;
};

/** Shadow colour and base opacity; a dark surface needs a far denser shadow to read. */
const SHADOW_TONE: Readonly<
  Record<ThemeName, { color: string; alpha: number }>
> = {
  light: { color: "15 23 60", alpha: 0.1 },
  dark: { color: "0 0 0", alpha: 0.45 },
};

const CONTACT: ShadowLayer = { geometry: "0 1px 2px", strength: 1 };

const SHADOW_LAYERS: Readonly<Record<1 | 2 | 3, readonly ShadowLayer[]>> = {
  1: [CONTACT],
  2: [CONTACT, { geometry: "0 12px 32px -12px", strength: 2 }],
  3: [
    { geometry: "0 2px 4px", strength: 1 },
    { geometry: "0 24px 56px -16px", strength: 3 },
  ],
};

/** Scrim opacity; the dark page is already near black, so it takes more to recede. */
const SCRIM_ALPHA: Readonly<Record<ThemeName, number>> = {
  light: 0.48,
  dark: 0.64,
};

// A shadow stays a shadow: stacked strength never reaches solid black.
const ALPHA_CEILING = 0.9;

const alpha = (value: number): string =>
  String(Math.round(Math.min(ALPHA_CEILING, value) * 100) / 100);

const channels = (hex: string): string => {
  const { r, g, b } = parseHex(hex, "effects");
  return [r, g, b].map((channel) => Math.round(channel * 255)).join(" ");
};

const shadow = (theme: ThemeName, level: 1 | 2 | 3): string => {
  const tone = SHADOW_TONE[theme];
  return SHADOW_LAYERS[level]
    .map(
      ({ geometry, strength }) =>
        `${geometry} rgb(${tone.color} / ${alpha(tone.alpha * strength)})`
    )
    .join(", ");
};

const buildEffects = (theme: ThemeName, scrimBase: string): ThemeEffects => ({
  "shadow-color": SHADOW_TONE[theme].color,
  "shadow-alpha": alpha(SHADOW_TONE[theme].alpha),
  "shadow-1": shadow(theme, 1),
  "shadow-2": shadow(theme, 2),
  "shadow-3": shadow(theme, 3),
  scrim: `rgb(${channels(scrimBase)} / ${alpha(SCRIM_ALPHA[theme])})`,
});

/**
 * Theme-dependent values that are not plain colours: the three elevation shadows, the raw
 * shadow colour and opacity for custom shadows, and the dialog scrim.
 */
const effects: Effects = {
  light: buildEffects("light", themes.light.text),
  dark: buildEffects("dark", themes.dark["bg-inset"]),
};

export default effects;

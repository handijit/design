import type {
  EffectValues,
  ShadowLayer,
  ShadowLevel,
  ThemeEffectValues,
  ThemeName,
} from "../types";
import themes from "./themes";

type LayerRecipe = {
  /** Vertical offset, blur radius and spread in CSS pixels; no layer is offset sideways. */
  readonly y: number;
  readonly blur: number;
  readonly spread: number;
  /** Multiple of the theme's base shadow opacity. */
  readonly strength: number;
};

/** Shadow colour and base opacity; a dark surface needs a far denser shadow to read. */
const SHADOW_TONE: Readonly<
  Record<ThemeName, { color: string; alpha: number }>
> = {
  light: { color: "#0f173c", alpha: 0.1 },
  dark: { color: "#000000", alpha: 0.45 },
};

const CONTACT: LayerRecipe = { y: 1, blur: 2, spread: 0, strength: 1 };

const SHADOW_LAYERS: Readonly<Record<ShadowLevel, readonly LayerRecipe[]>> = {
  1: [CONTACT],
  2: [CONTACT, { y: 12, blur: 32, spread: -12, strength: 2 }],
  3: [
    { y: 2, blur: 4, spread: 0, strength: 1 },
    { y: 24, blur: 56, spread: -16, strength: 3 },
  ],
};

/** Scrim opacity; the dark page is already near black, so it takes more to recede. */
const SCRIM_ALPHA: Readonly<Record<ThemeName, number>> = {
  light: 0.48,
  dark: 0.64,
};

// A shadow stays a shadow: stacked strength never reaches solid black.
const ALPHA_CEILING = 0.9;

const alpha = (value: number): number =>
  Math.round(Math.min(ALPHA_CEILING, value) * 100) / 100;

const layers = (theme: ThemeName, level: ShadowLevel): ShadowLayer[] =>
  SHADOW_LAYERS[level].map(({ y, blur, spread, strength }) => ({
    x: 0,
    y,
    blur,
    spread,
    alpha: alpha(SHADOW_TONE[theme].alpha * strength),
  }));

const buildValues = (
  theme: ThemeName,
  scrimBase: string
): ThemeEffectValues => ({
  shadow: {
    color: SHADOW_TONE[theme].color,
    alpha: alpha(SHADOW_TONE[theme].alpha),
  },
  shadows: {
    1: layers(theme, 1),
    2: layers(theme, 2),
    3: layers(theme, 3),
  },
  scrim: { color: scrimBase, alpha: alpha(SCRIM_ALPHA[theme]) },
});

/**
 * The shadows and the scrim as hex and numbers, for anything that cannot read a custom
 * property: an Electron main process, an Open Graph image, a PDF. This is the single source;
 * the CSS strings in `effects` are rendered from it.
 */
const effectValues: EffectValues = {
  light: buildValues("light", themes.light.text),
  dark: buildValues("dark", themes.dark["bg-inset"]),
};

export default effectValues;

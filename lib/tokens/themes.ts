import neutral from "../helpers/neutral.helper";
import oklchToHex from "../modules/oklch-to-hex";
import type { Theme, Themes } from "../types";
import hues from "./hues";
import scales from "./scales";

const {
  cobalt,
  coral,
  turquoise,
  success,
  warning,
  danger,
  violet,
  magenta,
  slate,
} = scales;

const WHITE = "#ffffff";

/** Dark theme neutrals: deep cobalt night, never pure black. */
const night = {
  inset: neutral(0.135, 0.026),
  page: neutral(0.165, 0.03),
  surface: neutral(0.205, 0.034),
  raised: neutral(0.245, 0.037),
  overlay: neutral(0.285, 0.04),
  border: neutral(0.315, 0.038),
  borderStrong: neutral(0.42, 0.042),
  text: neutral(0.965, 0.008),
  textTwo: neutral(0.81, 0.022),
  textThree: neutral(0.68, 0.03),
  // Sits between the strong border and tertiary text: readable, clearly inactive.
  textDisabled: neutral(0.46, 0.036),
};

/** Dark-theme tinted fills and hairlines of the cobalt family (primary and info share them). */
const cobaltNight = {
  soft: oklchToHex({ l: 0.27, c: 0.085, h: 265 }),
  softHover: oklchToHex({ l: 0.31, c: 0.1, h: 265 }),
  line: oklchToHex({ l: 0.4, c: 0.13, h: 265 }),
};

/** The brand band: the same deep cobalt in both themes (hero, footer, sign-in side). */
const band = {
  "band-bg": oklchToHex({ l: 0.27, c: 0.13, h: 266 }),
  "band-deep": oklchToHex({ l: 0.2, c: 0.09, h: 268 }),
  "band-line": oklchToHex({ l: 0.38, c: 0.13, h: 266 }),
  // The hairline is decorative; control outlines on the band need 3:1 against it.
  "band-line-strong": oklchToHex({ l: 0.6, c: 0.13, h: 266 }),
  "band-text": WHITE,
  "band-text-2": oklchToHex({ l: 0.86, c: 0.05, h: 262 }),
} as const;

/** The conversion colour and its ink are identical in both themes. */
const accent = {
  accent: coral[500],
  "accent-hover": coral[400],
  "accent-active": oklchToHex({ l: 0.65, c: 0.2, h: hues.coral }),
  "on-accent": slate[950],
} as const;

const light: Theme = {
  "bg-page": slate[25],
  "bg-surface": slate[0],
  "bg-raised": slate[50],
  "bg-inset": slate[100],
  "bg-overlay": slate[0],
  "bg-disabled": slate[100],
  border: slate[200],
  "border-strong": slate[300],
  text: slate[950],
  "text-2": slate[600],
  "text-3": slate[500],
  "text-disabled": slate[400],
  primary: cobalt[600],
  "primary-hover": cobalt[700],
  "primary-active": cobalt[800],
  "on-primary": WHITE,
  "primary-soft": cobalt[50],
  "primary-soft-hover": cobalt[100],
  "primary-line": cobalt[200],
  "primary-text": cobalt[700],
  ...accent,
  "accent-soft": coral[50],
  "accent-text": coral[700],
  highlight: turquoise[500],
  "on-highlight": slate[950],
  "highlight-soft": turquoise[50],
  "highlight-text": turquoise[700],
  focus: cobalt[500],
  "selection-bg": cobalt[200],
  "success-bg": success[50],
  "success-fg": success[700],
  "success-line": success[200],
  "success-solid": success[600],
  "success-on-solid": slate[950],
  "warning-bg": warning[50],
  "warning-fg": warning[700],
  "warning-line": warning[200],
  "warning-solid": warning[600],
  "warning-on-solid": slate[950],
  "danger-bg": danger[50],
  "danger-fg": danger[700],
  "danger-line": danger[200],
  "danger-solid": danger[600],
  "danger-on-solid": WHITE,
  "info-bg": cobalt[50],
  "info-fg": cobalt[700],
  "info-line": cobalt[200],
  "info-solid": cobalt[600],
  "info-on-solid": WHITE,
  "chart-1": cobalt[600],
  "chart-2": coral[600],
  "chart-3": turquoise[600],
  "chart-4": warning[600],
  "chart-5": magenta[600],
  "chart-6": violet[600],
  ...band,
};

const dark: Theme = {
  "bg-page": night.page,
  "bg-surface": night.surface,
  "bg-raised": night.raised,
  "bg-inset": night.inset,
  "bg-overlay": night.overlay,
  "bg-disabled": night.raised,
  border: night.border,
  "border-strong": night.borderStrong,
  text: night.text,
  "text-2": night.textTwo,
  "text-3": night.textThree,
  "text-disabled": night.textDisabled,
  primary: cobalt[600],
  "primary-hover": oklchToHex({ l: 0.575, c: 0.23, h: hues.cobalt }),
  "primary-active": cobalt[700],
  "on-primary": WHITE,
  "primary-soft": cobaltNight.soft,
  "primary-soft-hover": cobaltNight.softHover,
  "primary-line": cobaltNight.line,
  "primary-text": cobalt[300],
  ...accent,
  "accent-soft": oklchToHex({ l: 0.27, c: 0.06, h: hues.coral }),
  "accent-text": coral[300],
  highlight: turquoise[400],
  "on-highlight": slate[950],
  "highlight-soft": oklchToHex({ l: 0.27, c: 0.045, h: hues.turquoise }),
  "highlight-text": turquoise[300],
  focus: cobalt[400],
  "selection-bg": cobaltNight.line,
  "success-bg": oklchToHex({ l: 0.26, c: 0.05, h: hues.success }),
  "success-fg": success[300],
  "success-line": oklchToHex({ l: 0.38, c: 0.08, h: hues.success }),
  "success-solid": success[400],
  "success-on-solid": slate[950],
  "warning-bg": oklchToHex({ l: 0.27, c: 0.05, h: hues.warning }),
  "warning-fg": warning[300],
  "warning-line": oklchToHex({ l: 0.4, c: 0.075, h: hues.warning }),
  "warning-solid": warning[400],
  "warning-on-solid": slate[950],
  "danger-bg": oklchToHex({ l: 0.26, c: 0.065, h: hues.danger }),
  "danger-fg": danger[300],
  "danger-line": oklchToHex({ l: 0.39, c: 0.11, h: hues.danger }),
  "danger-solid": danger[600],
  "danger-on-solid": WHITE,
  "info-bg": cobaltNight.soft,
  "info-fg": cobalt[300],
  "info-line": cobaltNight.line,
  "info-solid": cobalt[600],
  "info-on-solid": WHITE,
  "chart-1": cobalt[400],
  "chart-2": coral[400],
  "chart-3": turquoise[400],
  "chart-4": warning[400],
  "chart-5": magenta[400],
  "chart-6": violet[400],
  ...band,
};

/**
 * Semantic colours per theme. Every value is an opaque `#rrggbb`, so it can be handed to
 * anything that takes a colour (an Electron window background, a canvas, a chart library).
 */
const themes: Themes = { light, dark };

export default themes;

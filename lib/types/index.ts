/** A colour in OKLCH: lightness 0–1, chroma 0–~0.4, hue in degrees. */
type Oklch = {
  /** Perceptual lightness, 0 (black) to 1 (white). */
  l: number;
  /** Chroma; sRGB tops out near 0.32 depending on hue and lightness. */
  c: number;
  /** Hue angle in degrees. */
  h: number;
};

type ThemeName = "light" | "dark";

/** What the user picked; `system` follows the operating system. */
type ThemePreference = ThemeName | "system";

type ChromaticScaleName =
  | "cobalt"
  | "coral"
  | "turquoise"
  | "success"
  | "warning"
  | "danger"
  | "violet"
  | "magenta";

type ScaleName = ChromaticScaleName | "slate";

type ChromaticStep =
  50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;

type NeutralStep = 0 | 25 | ChromaticStep;

type ChromaticScale = Readonly<Record<ChromaticStep, string>>;

type NeutralScale = Readonly<Record<NeutralStep, string>>;

type Scales = Readonly<Record<ChromaticScaleName, ChromaticScale>> & {
  readonly slate: NeutralScale;
};

type HueName = ChromaticScaleName;

type StatusName = "success" | "warning" | "danger" | "info";

type ChartIndex = 1 | 2 | 3 | 4 | 5 | 6;

/** Every theme-dependent colour. Values are always opaque `#rrggbb`. */
type ColorToken =
  | "bg-page"
  | "bg-surface"
  | "bg-raised"
  | "bg-inset"
  | "bg-overlay"
  | "bg-disabled"
  | "border"
  | "border-strong"
  | "border-control"
  | "text"
  | "text-2"
  | "text-3"
  | "text-disabled"
  | "primary"
  | "primary-hover"
  | "primary-active"
  | "on-primary"
  | "primary-soft"
  | "primary-soft-hover"
  | "primary-line"
  | "primary-text"
  | "accent"
  | "accent-hover"
  | "accent-active"
  | "on-accent"
  | "accent-soft"
  | "accent-text"
  | "highlight"
  | "on-highlight"
  | "highlight-soft"
  | "highlight-text"
  | "focus"
  | "selection-bg"
  | `${StatusName}-${"bg" | "fg" | "line" | "solid" | "on-solid"}`
  | `chart-${ChartIndex}`
  | "band-bg"
  | "band-deep"
  | "band-line"
  | "band-line-strong"
  | "band-text"
  | "band-text-2";

type Theme = Readonly<Record<ColorToken, string>>;

type Themes = Readonly<Record<ThemeName, Theme>>;

type FontRole = "display" | "body" | "mono";

type Fonts = Readonly<Record<FontRole, string>>;

type FontWeightName = "regular" | "medium" | "semibold" | "bold";

type FontWeights = Readonly<Record<FontWeightName, number>>;

type TypeRole =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "lead"
  | "body"
  | "small"
  | "caption"
  | "code";

type TypeStyle = {
  /** Which family stack the role is set in. */
  readonly font: FontRole;
  /** Font size in CSS pixels at a 16px root; the CSS output is in rem. */
  readonly size: number;
  /** Unitless line height. */
  readonly lineHeight: number;
  /** Font weight on the variable axis. */
  readonly weight: number;
  /** Letter spacing in em. */
  readonly letterSpacing: number;
  /** Font width in percent (`font-stretch`); 100 is the normal width. */
  readonly stretch: number;
};

type Typography = Readonly<Record<TypeRole, TypeStyle>>;

type SpaceStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24;

type Spacing = Readonly<Record<SpaceStep, number>>;

type RadiusName = "xs" | "sm" | "md" | "lg" | "pill";

type Radii = Readonly<Record<RadiusName, number>>;

type ShadowLevel = 1 | 2 | 3;

type ThemeEffects = {
  /** Shadow colour as space-separated sRGB channels, for `rgb(<color> / <alpha>)`. */
  readonly "shadow-color": string;
  /** Base shadow opacity of the theme, as a CSS number. */
  readonly "shadow-alpha": string;
  /** Resting elevation: cards and segmented controls. */
  readonly "shadow-1": string;
  /** Raised elevation: menus, popovers, floating cards. */
  readonly "shadow-2": string;
  /** Top elevation: dialogs and drawers. */
  readonly "shadow-3": string;
  /** Translucent backdrop behind dialogs. */
  readonly scrim: string;
};

type EffectToken = keyof ThemeEffects;

type Effects = Readonly<Record<ThemeName, ThemeEffects>>;

/** A colour with its opacity: what `rgb(r g b / a)` says in CSS, as plain values. */
type EffectTone = {
  /** The colour as an opaque `#rrggbb`. */
  readonly color: string;
  /** Opacity, 0 (transparent) to 1 (solid). */
  readonly alpha: number;
};

/** One layer of an elevation shadow; lengths are CSS pixels. */
type ShadowLayer = {
  /** Horizontal offset. */
  readonly x: number;
  /** Vertical offset. */
  readonly y: number;
  /** Blur radius. */
  readonly blur: number;
  /** Spread radius; negative pulls the shadow in under its box. */
  readonly spread: number;
  /** Opacity of this layer, painted in the theme's shadow colour. */
  readonly alpha: number;
};

/** The effects of one theme as numbers and hex, for anything that cannot read CSS. */
type ThemeEffectValues = {
  /** Shadow colour and base shadow opacity of the theme. */
  readonly shadow: EffectTone;
  /** The layers of each elevation shadow, outermost paint first as in CSS. */
  readonly shadows: Readonly<Record<ShadowLevel, readonly ShadowLayer[]>>;
  /** Translucent backdrop behind dialogs. */
  readonly scrim: EffectTone;
};

type EffectValues = Readonly<Record<ThemeName, ThemeEffectValues>>;

type DurationName = "fast" | "base" | "slow";

type EasingName = "standard" | "enter" | "exit";

type Motion = {
  /** Durations in milliseconds. */
  readonly duration: Readonly<Record<DurationName, number>>;
  /** CSS timing functions. */
  readonly easing: Readonly<Record<EasingName, string>>;
};

type LayerName =
  | "base"
  | "raised"
  | "sticky"
  | "dropdown"
  | "overlay"
  | "modal"
  | "popover"
  | "toast"
  | "tooltip";

type Layers = Readonly<Record<LayerName, number>>;

type BreakpointName = "sm" | "md" | "lg" | "xl";

type Breakpoints = Readonly<Record<BreakpointName, number>>;

type ScaleToken =
  `${ChromaticScaleName}-${ChromaticStep}` | `slate-${NeutralStep}`;

type TypeProperty =
  "size" | "line-height" | "weight" | "letter-spacing" | "stretch";

/** Tokens that keep one value in every theme. */
type StaticToken =
  | ScaleToken
  | `font-${FontRole}`
  | `font-weight-${FontWeightName}`
  | `type-${TypeRole}-${TypeProperty}`
  | `space-${SpaceStep}`
  | `radius-${RadiusName}`
  | `duration-${DurationName}`
  | `ease-${EasingName}`
  | `z-${LayerName}`;

/** Tokens whose value follows the active theme. */
type ThemedToken = ColorToken | EffectToken;

/** Every custom property in `tokens.css`, without the `--hd-` prefix. */
type TokenName = StaticToken | ThemedToken;

type LogoName = "mark" | "horizontal";

type Logo = {
  /** The SVG `viewBox`. */
  readonly viewBox: string;
  /** Intrinsic width in viewBox units. */
  readonly width: number;
  /** Intrinsic height in viewBox units. */
  readonly height: number;
  /** Path data of everything except the dot; painted with `currentColor`. */
  readonly body: string;
  /** Path data of the square dot of the mark; painted with the accent. */
  readonly dot: string;
};

type Logos = Readonly<Record<LogoName, Logo>>;

export type {
  BreakpointName,
  Breakpoints,
  ChartIndex,
  ChromaticScale,
  ChromaticScaleName,
  ChromaticStep,
  ColorToken,
  DurationName,
  EasingName,
  EffectToken,
  EffectTone,
  EffectValues,
  Effects,
  FontRole,
  FontWeightName,
  FontWeights,
  Fonts,
  HueName,
  LayerName,
  Layers,
  Logo,
  LogoName,
  Logos,
  Motion,
  NeutralScale,
  NeutralStep,
  Oklch,
  Radii,
  RadiusName,
  ScaleName,
  ScaleToken,
  Scales,
  ShadowLayer,
  ShadowLevel,
  SpaceStep,
  Spacing,
  StaticToken,
  StatusName,
  Theme,
  ThemeEffectValues,
  ThemeEffects,
  ThemeName,
  ThemePreference,
  ThemedToken,
  Themes,
  TokenName,
  TypeProperty,
  TypeRole,
  TypeStyle,
  Typography,
};

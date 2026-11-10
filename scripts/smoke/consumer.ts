import "@handijit/design/tokens.css";
import "@handijit/design/fonts.css";
import {
  cssVar,
  cssVarName,
  effectValues,
  type ShadowLayer,
  THEME_ATTRIBUTE,
  themes,
  type ThemeName,
  type TokenName,
} from "@handijit/design";

const token: TokenName = "bg-page";
const theme: ThemeName = "dark";
const attribute: "data-theme" = THEME_ATTRIBUTE;
const property: "--hd-bg-page" = cssVarName("bg-page");
const reference: string = cssVar("bg-page", "#fff");
const hex: string = themes[theme][`bg-page`];
const boundary: string = themes[theme]["border-control"];
const scrimAlpha: number = effectValues[theme].scrim.alpha;
const layers: readonly ShadowLayer[] = effectValues[theme].shadows[3];

// @ts-expect-error a stylesheet the package does not export must not resolve
import "@handijit/design/missing.css";

// @ts-expect-error an unknown token name must not compile
cssVar("bg-pgae");

export {
  attribute,
  boundary,
  hex,
  layers,
  property,
  reference,
  scrimAlpha,
  token,
};

import "@handijit/design/tokens.css";
import "@handijit/design/fonts.css";
import {
  cssVar,
  cssVarName,
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

// @ts-expect-error a stylesheet the package does not export must not resolve
import "@handijit/design/missing.css";

// @ts-expect-error an unknown token name must not compile
cssVar("bg-pgae");

export { attribute, hex, property, reference, token };

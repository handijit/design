import cssVarName from "../modules/css-var-name";
import logos from "../tokens/logos";
import themes from "../tokens/themes";
import type { LogoName } from "../types";

/** Lets a page recolour the dot without touching the accent of the whole theme. */
const LOGO_DOT_PROPERTY = "--hd-logo-dot";

/**
 * Renders a logo as a standalone SVG. The body follows `currentColor`. The dot follows
 * `--hd-logo-dot`, then the theme accent; the literal accent is the last resort for places
 * where no stylesheet reaches the file (`<img>`, a file manager preview).
 */
const renderLogoSvg = (name: LogoName): string => {
  const { viewBox, body, dot } = logos[name];
  const dotFill = `var(${LOGO_DOT_PROPERTY}, var(${cssVarName("accent")}, ${themes.light.accent}))`;

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-label="Han Dijit">`,
    "<title>Han Dijit</title>",
    `<path fill="currentColor" d="${body}"/>`,
    `<path fill="${dotFill}" d="${dot}"/>`,
    "</svg>\n",
  ].join("");
};

export { LOGO_DOT_PROPERTY };
export default renderLogoSvg;

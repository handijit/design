import breakpoints from "../tokens/breakpoints";
import CSS_VARIABLE_PREFIX from "../tokens/css-variable-prefix";
import effects from "../tokens/effects";
import fontWeights from "../tokens/font-weights";
import fonts from "../tokens/fonts";
import hues from "../tokens/hues";
import layers from "../tokens/layers";
import motion from "../tokens/motion";
import radii from "../tokens/radii";
import scales from "../tokens/scales";
import spacing from "../tokens/spacing";
import THEME_ATTRIBUTE from "../tokens/theme-attribute";
import THEME_STORAGE_KEY from "../tokens/theme-storage-key";
import themes from "../tokens/themes";
import typography from "../tokens/typography";

/**
 * Renders `tokens.json`: the same data as the TypeScript entry, for processes that cannot
 * import it (an Electron main process reading the window background, design tooling).
 */
const renderTokensJson = (): string =>
  `${JSON.stringify(
    {
      prefix: CSS_VARIABLE_PREFIX,
      themeAttribute: THEME_ATTRIBUTE,
      themeStorageKey: THEME_STORAGE_KEY,
      hues,
      scales,
      themes,
      effects,
      fonts,
      fontWeights,
      typography,
      spacing,
      radii,
      motion,
      layers,
      breakpoints,
    },
    null,
    2
  )}\n`;

export default renderTokensJson;

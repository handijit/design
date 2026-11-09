import CSS_VARIABLE_PREFIX from "../tokens/css-variable-prefix";
import type { TokenName } from "../types";

/** The custom property name of a token: `cssVarName("bg-page")` → `--hd-bg-page`. */
const cssVarName = <Name extends TokenName>(
  name: Name
): `--${typeof CSS_VARIABLE_PREFIX}-${Name}` =>
  `--${CSS_VARIABLE_PREFIX}-${name}`;

export default cssVarName;

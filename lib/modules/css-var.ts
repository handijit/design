import type { TokenName } from "../types";
import cssVarName from "./css-var-name";

/**
 * A `var()` reference to a token: `cssVar("bg-page")` → `var(--hd-bg-page)`.
 * The optional fallback is emitted verbatim: `var(--hd-bg-page, #fff)`.
 */
const cssVar = (name: TokenName, fallback?: string): string =>
  fallback === undefined
    ? `var(${cssVarName(name)})`
    : `var(${cssVarName(name)}, ${fallback})`;

export default cssVar;

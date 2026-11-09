import sha256Base64 from "../helpers/sha256.helper";
import THEME_BOOT_SCRIPT from "./theme-boot-script";

/**
 * CSP source expression for `THEME_BOOT_SCRIPT`: put it, in single quotes, in `script-src`.
 * The published build carries the digest as a literal; it is computed when the package is
 * built, not when it is imported.
 */
const THEME_BOOT_SCRIPT_HASH: string = `sha256-${sha256Base64(THEME_BOOT_SCRIPT)}`;

export default THEME_BOOT_SCRIPT_HASH;

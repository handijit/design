import THEME_ATTRIBUTE from "./theme-attribute";
import THEME_STORAGE_KEY from "./theme-storage-key";

/**
 * Source of an inline `<script>` for `<head>`. It runs before first paint, sets the theme
 * attribute on `<html>` from the stored choice (or the system theme) and keeps following
 * the system while no explicit choice is stored. Written in ES5 by hand: it is shipped as
 * text, so no compiler ever sees it. Reading storage can throw (sandboxed frames, blocked
 * site data); that counts as "no choice".
 */
const THEME_BOOT_SCRIPT =
  `(function(){var r=document.documentElement,` +
  `q=window.matchMedia("(prefers-color-scheme: dark)"),` +
  `a=function(){var s;try{s=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)})}catch(e){}` +
  `r.setAttribute(${JSON.stringify(THEME_ATTRIBUTE)},s==="light"||s==="dark"?s:q.matches?"dark":"light")};` +
  `a();q.addEventListener("change",a)})();`;

export default THEME_BOOT_SCRIPT;

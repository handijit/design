import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";
import * as design from "@handijit/design";
import tokens from "@handijit/design/tokens.json" with { type: "json" };

const fail = (message) => {
  throw new Error(`ESM entry is broken: ${message}`);
};
const resolve = (specifier) => fileURLToPath(import.meta.resolve(specifier));

if (design.cssVar("bg-page") !== "var(--hd-bg-page)") fail("cssVar");
if (design.contrast("#ffffff", "#000000") !== 21) fail("contrast");
if (design.themes.light.primary !== design.scales.cobalt[600]) fail("themes");
if (!isDeepStrictEqual(tokens.themes, design.themes)) fail("tokens.json");

const digest = createHash("sha256")
  .update(design.THEME_BOOT_SCRIPT, "utf8")
  .digest("base64");
if (design.THEME_BOOT_SCRIPT_HASH !== `sha256-${digest}`) fail("digest");

const css = readFileSync(resolve("@handijit/design/tokens.css"), "utf8");
for (const [token, value] of Object.entries(design.themes.dark)) {
  if (!css.includes(`--hd-${token}: ${value};`)) fail(`tokens.css ${token}`);
}

const fonts = readFileSync(resolve("@handijit/design/fonts.css"), "utf8");
const urls = [...fonts.matchAll(/url\("\.\/(fonts\/[^"]+)"\)/g)];
if (urls.length === 0) fail("fonts.css names no font file");
for (const [, url] of urls) {
  if (!existsSync(resolve(`@handijit/design/${url}`))) fail(url);
}

for (const name of Object.keys(design.logos)) {
  const svg = readFileSync(
    resolve(`@handijit/design/logos/${name}.svg`),
    "utf8"
  );
  if (!svg.includes(design.logos[name].dot)) fail(`logos/${name}.svg`);
}
if (!existsSync(resolve("@handijit/design/tokens.scss"))) fail("tokens.scss");

console.log("ESM entry and asset subpaths OK");

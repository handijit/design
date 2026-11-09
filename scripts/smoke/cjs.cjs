const { isDeepStrictEqual } = require("node:util");
const design = require("@handijit/design");
const tokens = require("@handijit/design/tokens.json");

const fail = (message) => {
  throw new Error(`CJS entry is broken: ${message}`);
};

if (design.cssVar("bg-page") !== "var(--hd-bg-page)") fail("cssVar");
if (design.oklchToHex(design.hexToOklch("#2661fa")) !== "#2661fa")
  fail("oklch");
if (!isDeepStrictEqual(tokens.scales, design.scales)) fail("tokens.json");
for (const subpath of [
  "tokens.css",
  "fonts.css",
  "tokens.scss",
  "logos/mark.svg",
]) {
  require.resolve(`@handijit/design/${subpath}`);
}

console.log("CJS entry OK");

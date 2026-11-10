import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { isDeepStrictEqual } from "node:util";

// Checks the built package against itself. The unit tests measure the sources; this
// measures what was written to build/: that every format exports the same values, that the
// generated files agree with the JavaScript entry, and that nothing they point at is missing.

const require = createRequire(import.meta.url);
const read = (file) => readFileSync(file, "utf8");

const problems = [];
const check = (condition, message) => {
  if (!condition) problems.push(message);
};

if (!existsSync("build/index.mjs")) {
  console.error('verify-build: build/ is missing; run "npm run build" first');
  process.exit(1);
}

const builds = {
  "build/index.mjs": await import("../build/index.mjs"),
  "build/index.cjs": require("../build/index.cjs"),
  "build/index.umd.js": require("../build/index.umd.js"),
};
const esm = builds["build/index.mjs"];
const json = JSON.parse(read("build/tokens.json"));
const css = read("build/tokens.css");

// 1. Every format carries the same public surface with the same values.
for (const [file, api] of Object.entries(builds)) {
  check(
    isDeepStrictEqual(Object.keys(api).sort(), Object.keys(esm).sort()),
    `${file}: the export list differs from build/index.mjs`
  );
  for (const [name, value] of Object.entries(esm)) {
    if (typeof value === "function") continue;
    check(
      isDeepStrictEqual(api[name], value),
      `${file}: "${name}" differs from build/index.mjs`
    );
  }

  // 2. The CSP digest is a literal in the bundle and still matches the script next to it.
  const digest = createHash("sha256")
    .update(api.THEME_BOOT_SCRIPT, "utf8")
    .digest("base64");
  check(
    api.THEME_BOOT_SCRIPT_HASH === `sha256-${digest}`,
    `${file}: THEME_BOOT_SCRIPT_HASH is not the digest of THEME_BOOT_SCRIPT`
  );
  check(
    read(file).includes(`sha256-${digest}`),
    `${file}: the digest is not a literal`
  );
  // The derivation code must not ship: derived tokens are precomputed literals.
  check(
    !/sha256Base64|LIGHTNESS_SHIFT/.test(read(file)),
    `${file}: build-time derivation code leaked into the bundle`
  );
}

// 3. tokens.json holds the data of the JavaScript entry.
const JSON_KEYS = {
  prefix: "CSS_VARIABLE_PREFIX",
  themeAttribute: "THEME_ATTRIBUTE",
  themeStorageKey: "THEME_STORAGE_KEY",
};
for (const [key, value] of Object.entries(json)) {
  const name = JSON_KEYS[key] ?? key;
  check(
    isDeepStrictEqual(JSON.parse(JSON.stringify(esm[name])), value),
    `build/tokens.json: "${key}" differs from the "${name}" export`
  );
}

// 4. tokens.css declares the values of the JavaScript entry, in every theme block.
for (const theme of ["light", "dark"]) {
  const expected = theme === "light" ? 1 : 2;
  for (const [token, value] of Object.entries({
    ...esm.themes[theme],
    ...esm.effects[theme],
  })) {
    const declaration = `--${esm.CSS_VARIABLE_PREFIX}-${token}: ${value};`;
    const count = css.split(declaration).length - 1;
    check(
      // A value shared by both themes appears in all three theme blocks.
      count === expected || count === 3,
      `build/tokens.css: expected "${declaration}" in the ${theme} theme`
    );
  }

  // The CSS strings and the plain values of the effects are one source in two shapes.
  const { shadow, scrim } = esm.effectValues[theme];
  const channels = (hex) =>
    [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16)).join(" ");
  check(
    esm.effects[theme]["shadow-color"] === channels(shadow.color) &&
      esm.effects[theme].scrim ===
        `rgb(${channels(scrim.color)} / ${scrim.alpha})`,
    `build/index.mjs: effectValues.${theme} differs from effects.${theme}`
  );
}
for (const [scale, steps] of Object.entries(esm.scales)) {
  for (const [step, hex] of Object.entries(steps)) {
    check(
      css.includes(`--${esm.CSS_VARIABLE_PREFIX}-${scale}-${step}: ${hex};`),
      `build/tokens.css: ${scale}-${step} is missing or differs`
    );
  }
}

// 5. Every font the stylesheet points at was copied, with its licence, and nothing else.
const referenced = [
  ...read("build/fonts.css").matchAll(/url\("\.\/([^"]+)"\)/g),
]
  .map(([, url]) => url)
  .sort();
const shipped = readdirSync("build/fonts")
  .filter((file) => file.endsWith(".woff2"))
  .map((file) => `fonts/${file}`)
  .sort();
check(
  referenced.length > 0 && isDeepStrictEqual(referenced, shipped),
  "build/fonts: the files differ from the ones build/fonts.css references"
);
for (const file of shipped) {
  const licence = `build/fonts/LICENSE-${file.replace("fonts/", "").split("-latin")[0]}.txt`;
  check(
    existsSync(licence) && read(licence).includes("SIL Open Font License"),
    `${licence}: the licence of ${file} is missing`
  );
}

// 6. Every path promised by package.json exists.
const { exports: entryPoints } = JSON.parse(read("package.json"));
const targets = (entry) =>
  typeof entry === "string" ? [entry] : Object.values(entry).flatMap(targets);
for (const target of Object.values(entryPoints).flatMap(targets)) {
  const path = target.replace(/\/\*$/, "");
  check(
    existsSync(path),
    `package.json exports ${target}, which does not exist`
  );
}

if (problems.length > 0) {
  console.error(`verify-build: ${problems.length} problem(s)`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log(
  `verify-build: ${Object.keys(builds).length} bundles, tokens.css, tokens.json and ${shipped.length} font files agree`
);

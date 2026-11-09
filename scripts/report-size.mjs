import { existsSync, readdirSync, readFileSync } from "node:fs";
import { brotliCompressSync, gzipSync } from "node:zlib";

const OUTPUTS = [
  "build/index.mjs",
  "build/index.cjs",
  "build/index.umd.js",
  "build/index.d.ts",
  "build/tokens.css",
  "build/tokens.scss",
  "build/tokens.json",
  "build/fonts.css",
  "build/logos/mark.svg",
  "build/logos/horizontal.svg",
];
const FONT_DIRECTORY = "build/fonts";

// The minified browser bundle is what a <script> user downloads, and tokens.css is what
// every page of every consumer downloads; the budgets guard those two.
const GZIP_BUDGETS = {
  "build/index.umd.js": 6000,
  "build/tokens.css": 3500,
};

// Fonts are already compressed; their budget is the raw size of all files together.
const FONT_BUDGET_BYTES = 400_000;

const missing = [...OUTPUTS, FONT_DIRECTORY].filter(
  (file) => !existsSync(file)
);
if (missing.length > 0) {
  console.error(
    `report-size: missing ${missing.join(", ")}; run "npm run build" first`
  );
  process.exit(1);
}

const formatBytes = (bytes) => `${(bytes / 1000).toFixed(2)} kB`;

const rows = OUTPUTS.map((file) => {
  const content = readFileSync(file);
  return {
    file,
    raw: content.length,
    gzip: gzipSync(content, { level: 9 }).length,
    brotli: brotliCompressSync(content).length,
  };
});

console.log("| File | Raw | Gzip | Brotli |");
console.log("| --- | --- | --- | --- |");
for (const { file, raw, gzip, brotli } of rows) {
  console.log(
    `| \`${file}\` | ${formatBytes(raw)} | ${formatBytes(gzip)} | ${formatBytes(brotli)} |`
  );
}

const fonts = readdirSync(FONT_DIRECTORY)
  .filter((file) => file.endsWith(".woff2"))
  .sort()
  .map((file) => ({
    file,
    raw: readFileSync(`${FONT_DIRECTORY}/${file}`).length,
  }));
const fontTotal = fonts.reduce((total, { raw }) => total + raw, 0);

console.log("\n| Font file | Raw |");
console.log("| --- | --- |");
for (const { file, raw } of fonts) {
  console.log(`| \`${FONT_DIRECTORY}/${file}\` | ${formatBytes(raw)} |`);
}
console.log(`| ${fonts.length} files | ${formatBytes(fontTotal)} |`);

let failed = false;
console.log("");
for (const [file, budget] of Object.entries(GZIP_BUDGETS)) {
  const { gzip } = rows.find((row) => row.file === file);
  const verdict = gzip <= budget ? "within" : "OVER";
  console.log(`${file}: ${gzip} B gzip, ${verdict} the ${budget} B budget`);
  if (gzip > budget) failed = true;
}

const fontVerdict = fontTotal <= FONT_BUDGET_BYTES ? "within" : "OVER";
console.log(
  `${FONT_DIRECTORY}: ${fontTotal} B raw, ${fontVerdict} the ${FONT_BUDGET_BYTES} B budget`
);
if (fontTotal > FONT_BUDGET_BYTES) failed = true;

if (failed) process.exit(1);

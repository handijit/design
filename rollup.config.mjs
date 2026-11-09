import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import { dts } from "rollup-plugin-dts";

import assets from "./scripts/rollup/assets.mjs";
import precompute from "./scripts/rollup/precompute.mjs";

const input = "./lib/index.ts";

// TypeScript alone downlevels to the tsconfig target; no Babel anywhere.
const ts = () => typescript({ tsconfig: "./tsconfig.json" });

export default [
  {
    input,
    output: [
      { file: "./build/index.mjs", format: "es", sourcemap: true },
      {
        file: "./build/index.cjs",
        format: "cjs",
        exports: "named",
        sourcemap: true,
      },
    ],
    // precompute comes first: its literals replace the token sources before TypeScript
    // would load them. assets writes tokens.css, tokens.scss, tokens.json, fonts and logos.
    plugins: [precompute(), ts(), assets()],
  },
  {
    // Minified single file for <script> and CDN use.
    input,
    output: {
      file: "./build/index.umd.js",
      format: "umd",
      name: "handijitDesign",
      exports: "named",
      sourcemap: true,
    },
    plugins: [precompute(), ts(), terser()],
  },
  {
    // One bundled declaration, written twice: TypeScript reads the format of a declaration file
    // from its extension, so the ESM entry needs a .d.mts next to the CommonJS .d.ts.
    input,
    output: [
      { file: "./build/index.d.ts", format: "es" },
      { file: "./build/index.d.mts", format: "es" },
    ],
    plugins: [dts({ tsconfig: "./tsconfig.json" })],
  },
];

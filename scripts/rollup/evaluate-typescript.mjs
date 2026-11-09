import typescript from "@rollup/plugin-typescript";
import { rollup } from "rollup";

/**
 * Bundles a TypeScript module of this package in memory and returns its exports.
 * The build uses it to turn the token sources into literals and generated files, so the
 * published values are computed once, here, instead of on every consumer's machine.
 */
const evaluateTypescript = async (input) => {
  const bundle = await rollup({
    input,
    plugins: [typescript({ tsconfig: "./tsconfig.json", sourceMap: false })],
  });

  try {
    const { output } = await bundle.generate({ format: "es" });
    const source = Buffer.from(output[0].code).toString("base64");
    // The library has no dependencies, so the bundle is one self-contained module.
    return await import(`data:text/javascript;base64,${source}`);
  } finally {
    await bundle.close();
  }
};

export default evaluateTypescript;

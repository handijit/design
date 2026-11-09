import { readFile } from "node:fs/promises";
import { join } from "node:path";

import evaluateTypescript from "./evaluate-typescript.mjs";

const packageFile = (source, ...segments) =>
  join("node_modules", ...source.split("/"), ...segments);

// "@fontsource-variable/archivo" → "archivo"
const fontSlug = (source) => source.split("/").at(-1);

/**
 * Emits everything in the package that is not JavaScript: the generated stylesheets, the
 * JSON tokens and the logos (rendered by lib/generators from the same token sources as the
 * JavaScript entry), plus the font files and their licences, copied from the font packages
 * so that no binary is committed to this repository.
 */
const assets = () => ({
  name: "handijit-assets",

  async generateBundle(options) {
    // One configuration writes two formats into the same directory; emit once.
    if (options.format !== "es") return;

    const { fontFiles, fontSources, renderAssets } = await evaluateTypescript(
      "./lib/generators/index.ts"
    );

    // The ranges describe which glyphs each subset file really contains, so they are read
    // from the package that ships the file rather than copied by hand.
    const unicodeRanges = Object.fromEntries(
      await Promise.all(
        fontSources().map(async (source) => [
          source,
          JSON.parse(
            await readFile(packageFile(source, "unicode.json"), "utf8")
          ),
        ])
      )
    );

    for (const [fileName, source] of Object.entries(
      renderAssets(unicodeRanges)
    )) {
      this.emitFile({ type: "asset", fileName, source });
    }

    for (const { source, file } of fontFiles()) {
      this.emitFile({
        type: "asset",
        fileName: `fonts/${file}`,
        source: await readFile(packageFile(source, "files", file)),
      });
    }

    for (const source of fontSources()) {
      this.emitFile({
        type: "asset",
        fileName: `fonts/LICENSE-${fontSlug(source)}.txt`,
        source: await readFile(packageFile(source, "LICENSE"), "utf8"),
      });
    }
  },
});

export default assets;

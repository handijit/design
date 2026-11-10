import { relative, sep } from "node:path";

import evaluateTypescript from "./evaluate-typescript.mjs";

// Modules whose default export is derived data. Their computed value replaces their source
// in the bundle: nothing runs at import time, the CSP digest is a build-time constant, and
// every JavaScript engine reads the same hex values (Math.cos and Math.pow are not required
// to round identically across engines, the palette must).
const PRECOMPUTED = {
  "lib/tokens/scales.ts": (api) => api.scales,
  "lib/tokens/themes.ts": (api) => api.themes,
  "lib/tokens/effects.ts": (api) => api.effects,
  "lib/tokens/effect-values.ts": (api) => api.effectValues,
  "lib/tokens/theme-boot-script.ts": (api) => api.THEME_BOOT_SCRIPT,
  "lib/tokens/theme-boot-script-hash.ts": (api) => api.THEME_BOOT_SCRIPT_HASH,
};

const precompute = () => {
  let api;

  return {
    name: "handijit-precompute",

    buildStart() {
      api = evaluateTypescript("./lib/index.ts");
    },

    async load(id) {
      const file = relative(process.cwd(), id).split(sep).join("/");
      const pick = PRECOMPUTED[file];
      if (pick === undefined) return null;

      const value = pick(await api);
      return {
        code: `export default ${JSON.stringify(value, null, 2)};\n`,
        map: { mappings: "" },
      };
    },
  };
};

export { PRECOMPUTED };
export default precompute;

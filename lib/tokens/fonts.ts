import type { Fonts } from "../types";

/**
 * Font family stacks. The first family of each stack ships in `fonts.css`; the rest are
 * system fonts that hold the layout while the web font loads or when it is missing.
 */
const fonts: Fonts = {
  display:
    'Archivo, system-ui, -apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
  body: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  mono: '"IBM Plex Mono", ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
};

export default fonts;

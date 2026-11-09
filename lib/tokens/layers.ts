import type { Layers } from "../types";

/** `z-index` layers, lowest to highest. The gaps leave room for local stacking. */
const layers: Layers = {
  base: 0,
  raised: 1,
  sticky: 100,
  dropdown: 1000,
  overlay: 1100,
  modal: 1200,
  popover: 1300,
  toast: 1400,
  tooltip: 1500,
};

export default layers;

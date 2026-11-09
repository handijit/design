import { parseHex, relativeLuminance } from "../helpers/srgb.helper";

/** WCAG 2 contrast ratio of two opaque hex colours, from 1 to 21. Order does not matter. */
const contrast = (first: string, second: string): number => {
  const one = relativeLuminance(parseHex(first, "contrast"));
  const other = relativeLuminance(parseHex(second, "contrast"));
  return (Math.max(one, other) + 0.05) / (Math.min(one, other) + 0.05);
};

export default contrast;

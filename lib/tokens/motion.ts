import type { Motion } from "../types";

/**
 * Durations (ms) and easings. `tokens.css` collapses the durations under
 * `prefers-reduced-motion: reduce`; code that animates from JavaScript has to check the
 * media query itself.
 */
const motion: Motion = {
  duration: { fast: 120, base: 200, slow: 320 },
  easing: {
    standard: "cubic-bezier(0.2, 0, 0, 1)",
    enter: "cubic-bezier(0, 0, 0, 1)",
    exit: "cubic-bezier(0.3, 0, 1, 1)",
  },
};

export default motion;

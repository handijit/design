import type { Typography } from "../types";

/**
 * The type scale. Sizes are CSS pixels at a 16px root (body is 15px); headings are set in
 * the display family, slightly wide (`stretch` above 100) and tight.
 */
const typography: Typography = {
  display: {
    font: "display",
    size: 56,
    lineHeight: 1.05,
    weight: 700,
    letterSpacing: -0.03,
    stretch: 112,
  },
  h1: {
    font: "display",
    size: 40,
    lineHeight: 1.1,
    weight: 700,
    letterSpacing: -0.025,
    stretch: 110,
  },
  h2: {
    font: "display",
    size: 30,
    lineHeight: 1.15,
    weight: 700,
    letterSpacing: -0.02,
    stretch: 110,
  },
  h3: {
    font: "display",
    size: 22,
    lineHeight: 1.2,
    weight: 650,
    letterSpacing: -0.015,
    stretch: 108,
  },
  h4: {
    font: "display",
    size: 18,
    lineHeight: 1.3,
    weight: 650,
    letterSpacing: -0.01,
    stretch: 108,
  },
  lead: {
    font: "body",
    size: 17,
    lineHeight: 1.55,
    weight: 400,
    letterSpacing: 0,
    stretch: 100,
  },
  body: {
    font: "body",
    size: 15,
    lineHeight: 1.55,
    weight: 400,
    letterSpacing: 0,
    stretch: 100,
  },
  small: {
    font: "body",
    size: 13,
    lineHeight: 1.5,
    weight: 400,
    letterSpacing: 0,
    stretch: 100,
  },
  caption: {
    font: "body",
    size: 12,
    lineHeight: 1.4,
    weight: 500,
    letterSpacing: 0.01,
    stretch: 100,
  },
  code: {
    font: "mono",
    size: 13,
    lineHeight: 1.5,
    weight: 400,
    letterSpacing: 0,
    stretch: 100,
  },
};

export default typography;

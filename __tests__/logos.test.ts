import { describe, expect, test } from "vitest";

import renderLogoSvg, { LOGO_DOT_PROPERTY } from "../lib/generators/logo-svg";
import logos from "../lib/tokens/logos";
import type { LogoName } from "../lib/types";

const NAMES: LogoName[] = ["mark", "horizontal"];

// Absolute commands only: nothing relative to resolve and no arcs or cubic curves.
const PATH_DATA = /^M[\d. MLHVQZ]+Z$/;

// The mark and both dots are drawn with straight segments, so their extent can be read.
const STRAIGHT = /^M[\d.]+ [\d.]+(?: L[\d.]+ [\d.]+)+ Z$/;

const bounds = (data: string): { right: number; bottom: number } => {
  const points = [...data.matchAll(/[ML]([\d.]+) ([\d.]+)/g)];
  return {
    right: Math.max(...points.map(([, x]) => Number(x))),
    bottom: Math.max(...points.map(([, , y]) => Number(y))),
  };
};

describe("logos", () => {
  test("should offer the mark and the horizontal logo", () => {
    expect(Object.keys(logos)).toEqual(NAMES);
  });

  test.each(NAMES)("should describe the %s viewBox consistently", (name) => {
    const { viewBox, width, height } = logos[name];

    expect(viewBox).toBe(`0 0 ${width} ${height}`);
    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);
  });

  test.each(NAMES)("should describe %s with absolute path commands", (name) => {
    expect(logos[name].body).toMatch(PATH_DATA);
    expect(logos[name].dot).toMatch(PATH_DATA);
  });

  test.each([
    ["mark body", logos.mark.body, logos.mark],
    ["mark dot", logos.mark.dot, logos.mark],
    ["horizontal dot", logos.horizontal.dot, logos.horizontal],
  ])("should keep the %s inside the viewBox", (_, data, { width, height }) => {
    expect(data).toMatch(STRAIGHT);
    expect(bounds(data).right).toBeLessThanOrEqual(width);
    expect(bounds(data).bottom).toBeLessThanOrEqual(height);
  });

  test("should keep the dot out of the body, which holds the letters", () => {
    // h, then A (2 contours), N, D (2), İ (stem + tittle), J, İ (2), T.
    expect(logos.mark.body.match(/M/g)).toHaveLength(1);
    expect(logos.horizontal.body.match(/M/g)).toHaveLength(12);
    expect(logos.horizontal.body).not.toContain(logos.horizontal.dot);
  });

  test.each(NAMES)(
    "should keep the %s dot a closed square of its own",
    (name) => {
      const { dot } = logos[name];
      const corners = [...dot.matchAll(/[ML]([\d.]+) ([\d.]+)/g)];
      const xs = corners.map(([, x]) => Number(x));
      const ys = corners.map(([, , y]) => Number(y));

      // A square with cut corners: eight points, as wide as it is tall.
      expect(corners).toHaveLength(8);
      expect(dot.endsWith(" Z")).toBe(true);
      expect(Math.max(...xs) - Math.min(...xs)).toBeCloseTo(
        Math.max(...ys) - Math.min(...ys),
        2
      );
    }
  );

  test("should use the same proportions for the mark in both logos", () => {
    expect(logos.mark.width / logos.mark.height).toBeCloseTo(0.618, 3);
    expect(logos.horizontal.width / logos.horizontal.height).toBeCloseTo(
      5.41,
      2
    );
  });
});

describe("renderLogoSvg", () => {
  test.each(NAMES)("should render %s as a standalone, labelled SVG", (name) => {
    const svg = renderLogoSvg(name);

    expect(
      svg.startsWith(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${logos[name].viewBox}" role="img" aria-label="Han Dijit"><title>Han Dijit</title>`
      )
    ).toBe(true);
    expect(svg.endsWith("</svg>\n")).toBe(true);
  });

  test.each(NAMES)(
    "should draw the %s body in currentColor and the dot in the accent",
    (name) => {
      const paths = [
        ...renderLogoSvg(name).matchAll(/<path fill="([^"]+)" d="([^"]+)"\/>/g),
      ].map(([, fill, data]) => ({ fill, data }));

      expect(paths).toEqual([
        { fill: "currentColor", data: logos[name].body },
        {
          fill: "var(--hd-logo-dot, var(--hd-accent, #fb6041))",
          data: logos[name].dot,
        },
      ]);
    }
  );

  test("should carry nothing a strict content security policy would block", () => {
    const svg = renderLogoSvg("horizontal");

    expect(svg).not.toMatch(/<script|<style|style=|on\w+=|href=/);
  });

  test("should name the property that recolours the dot", () => {
    expect(LOGO_DOT_PROPERTY).toBe("--hd-logo-dot");
  });
});

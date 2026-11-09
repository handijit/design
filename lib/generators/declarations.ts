import breakpoints from "../tokens/breakpoints";
import effects from "../tokens/effects";
import fontWeights from "../tokens/font-weights";
import fonts from "../tokens/fonts";
import layers from "../tokens/layers";
import motion from "../tokens/motion";
import radii from "../tokens/radii";
import scales from "../tokens/scales";
import spacing from "../tokens/spacing";
import themes from "../tokens/themes";
import typography from "../tokens/typography";
import type { StaticToken, ThemeName, ThemedToken, TokenName } from "../types";

type Declaration<Name extends TokenName = TokenName> = readonly [
  name: Name,
  value: string,
];

type DeclarationGroup<Name extends TokenName = TokenName> = {
  /** Heading of the group in generated files and in the docs. */
  readonly title: string;
  readonly declarations: readonly Declaration<Name>[];
};

// Font sizes and spacing are emitted in rem so they follow the reader's font size setting.
const ROOT_FONT_SIZE = 16;

// A bare `0` is not a length inside `calc()`, so zero keeps its unit.
const rem = (pixels: number): string => `${pixels / ROOT_FONT_SIZE}rem`;

const entries = <Key extends string | number, Value>(
  record: Readonly<Record<Key, Value>>
): [`${Key}`, Value][] => Object.entries(record) as [`${Key}`, Value][];

const scaleGroups = (): DeclarationGroup<StaticToken>[] =>
  entries(scales).map(([scale, steps]) => ({
    title: `Scale: ${scale}`,
    declarations: Object.entries(steps).map(
      ([step, hex]) => [`${scale}-${step}` as StaticToken, hex] as const
    ),
  }));

const typeDeclarations = (): Declaration<StaticToken>[] =>
  entries(typography).flatMap(([role, style]) => [
    [`type-${role}-size`, rem(style.size)] as const,
    [`type-${role}-line-height`, String(style.lineHeight)] as const,
    [`type-${role}-weight`, String(style.weight)] as const,
    [`type-${role}-letter-spacing`, `${style.letterSpacing}em`] as const,
    [`type-${role}-stretch`, `${style.stretch}%`] as const,
  ]);

/** Tokens with one value in every theme: raw scales and everything that is not a colour. */
const staticGroups = (): DeclarationGroup<StaticToken>[] => [
  ...scaleGroups(),
  {
    title: "Font families",
    declarations: entries(fonts).map(
      ([role, stack]) => [`font-${role}`, stack] as const
    ),
  },
  {
    title: "Font weights",
    declarations: entries(fontWeights).map(
      ([name, weight]) => [`font-weight-${name}`, String(weight)] as const
    ),
  },
  { title: "Type scale", declarations: typeDeclarations() },
  {
    title: "Spacing",
    declarations: entries(spacing).map(
      ([step, pixels]) => [`space-${step}`, rem(pixels)] as const
    ),
  },
  {
    title: "Radii",
    declarations: entries(radii).map(
      ([name, pixels]) => [`radius-${name}`, `${pixels}px`] as const
    ),
  },
  {
    title: "Motion",
    declarations: [
      ...entries(motion.duration).map(
        ([name, ms]) => [`duration-${name}`, `${ms}ms`] as const
      ),
      ...entries(motion.easing).map(
        ([name, curve]) => [`ease-${name}`, curve] as const
      ),
    ],
  },
  {
    title: "Layers",
    declarations: entries(layers).map(
      ([name, index]) => [`z-${name}`, String(index)] as const
    ),
  },
];

/** Tokens whose value depends on the theme: semantic colours, shadows and the scrim. */
const themedGroups = (theme: ThemeName): DeclarationGroup<ThemedToken>[] => [
  { title: "Colours", declarations: entries(themes[theme]) },
  { title: "Elevation", declarations: entries(effects[theme]) },
];

/** Breakpoints cannot be custom properties (`var()` is invalid in a media query). */
const breakpointEntries = (): [string, number][] => entries(breakpoints);

export type { Declaration, DeclarationGroup };
export { breakpointEntries, staticGroups, themedGroups };

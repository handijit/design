import cssVar from "../modules/css-var";
import CSS_VARIABLE_PREFIX from "../tokens/css-variable-prefix";
import typography from "../tokens/typography";
import type { TokenName } from "../types";
import { breakpointEntries, staticGroups, themedGroups } from "./declarations";

const PREFIX = CSS_VARIABLE_PREFIX;

// One CSS pixel minus the smallest step browsers resolve: `down(md)` must not overlap `up(md)`.
const BELOW = "0.02px";

const MIXINS = `/// Styles from the breakpoint upwards.
@mixin ${PREFIX}-up($breakpoint) {
  @media (min-width: ${PREFIX}-breakpoint($breakpoint)) {
    @content;
  }
}

/// Styles below the breakpoint.
@mixin ${PREFIX}-down($breakpoint) {
  @media (max-width: (${PREFIX}-breakpoint($breakpoint) - ${BELOW})) {
    @content;
  }
}

/// Styles from one breakpoint up to (not including) another.
@mixin ${PREFIX}-between($from, $to) {
  @media (min-width: ${PREFIX}-breakpoint($from)) and (max-width: (${PREFIX}-breakpoint($to) - ${BELOW})) {
    @content;
  }
}

/// Styles for readers who asked the system to reduce motion.
@mixin ${PREFIX}-reduced-motion {
  @media (prefers-reduced-motion: reduce) {
    @content;
  }
}

/// Sets family, size, line height, weight, tracking and width of a type role.
@mixin ${PREFIX}-type($role) {
  @if not map.has-key($${PREFIX}-type-fonts, $role) {
    @error "${PREFIX}-type: unknown type role \`#{$role}\`. Expected one of #{map.keys($${PREFIX}-type-fonts)}.";
  }

  font-family: var(--${PREFIX}-font-#{map.get($${PREFIX}-type-fonts, $role)});
  font-size: var(--${PREFIX}-type-#{$role}-size);
  line-height: var(--${PREFIX}-type-#{$role}-line-height);
  font-weight: var(--${PREFIX}-type-#{$role}-weight);
  letter-spacing: var(--${PREFIX}-type-#{$role}-letter-spacing);
  font-stretch: var(--${PREFIX}-type-#{$role}-stretch);
}`;

const FUNCTIONS = `/// The pixel value of a breakpoint; fails the build on an unknown name.
@function ${PREFIX}-breakpoint($name) {
  @if not map.has-key($${PREFIX}-breakpoints, $name) {
    @error "${PREFIX}-breakpoint: unknown breakpoint \`#{$name}\`. Expected one of #{map.keys($${PREFIX}-breakpoints)}.";
  }

  @return map.get($${PREFIX}-breakpoints, $name);
}

/// A \`var()\` reference to a token; fails the build on an unknown name.
@function ${PREFIX}-var($name) {
  @if not map.has-key($${PREFIX}-tokens, $name) {
    @error "${PREFIX}-var: unknown token \`#{$name}\`.";
  }

  @return map.get($${PREFIX}-tokens, $name);
}`;

const map = (
  name: string,
  pairs: readonly (readonly [string, string])[]
): string =>
  `$${PREFIX}-${name}: (\n${pairs
    .map(([key, value]) => `  "${key}": ${value},`)
    .join("\n")}\n);`;

/**
 * Renders `tokens.scss`: one `$hd-*` variable per token pointing at its custom property,
 * the same as a map, the breakpoints as compile-time pixels (a media query cannot read
 * `var()`), and the mixins built on them.
 */
const renderTokensScss = (): string => {
  // The light theme lists the same names as every other theme; only the values differ.
  const names: TokenName[] = [
    ...staticGroups(),
    ...themedGroups("light"),
  ].flatMap(({ declarations }) => declarations.map(([name]) => name));
  const breakpointPairs = breakpointEntries().map(
    ([name, pixels]) => [name, `${pixels}px`] as const
  );

  return [
    "// @handijit/design — generated from the TypeScript tokens. Do not edit.",
    '@use "sass:map";',
    names.map((name) => `$${PREFIX}-${name}: ${cssVar(name)};`).join("\n"),
    map(
      "tokens",
      names.map((name) => [name, cssVar(name)] as const)
    ),
    breakpointPairs
      .map(([name, value]) => `$${PREFIX}-breakpoint-${name}: ${value};`)
      .join("\n"),
    map("breakpoints", breakpointPairs),
    map(
      "type-fonts",
      Object.entries(typography).map(
        ([role, style]) => [role, `"${style.font}"`] as const
      )
    ),
    FUNCTIONS,
    MIXINS,
    "",
  ]
    .join("\n\n")
    .replace(/\n\n$/, "\n");
};

export default renderTokensScss;

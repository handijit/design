# Changelog

All notable changes to this package are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the package follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-11-10

Two additions; no existing token, value, export or file changes.

### Added

- `border-control` (`--hd-border-control`, `$hd-border-control`,
  `themes.*["border-control"]`): the boundary of an interactive control, such as
  a text field, a checkbox or the track of a switch that is off. `#80899b` in
  the light theme and `#69758d` in the dark theme, neutrals of the slate family.
  It is at least 3:1 (WCAG 1.4.11) against every background a control sits on,
  `bg-page`, `bg-surface`, `bg-raised`, `bg-inset`, `bg-overlay` and
  `bg-disabled`, in both themes, and stays below `text-3`; the test suite gates
  both. `border` and `border-strong` keep their values and remain the hairlines
  for separators, cards and tables: they are 1.1:1 to 2.4:1 and were never
  enough to identify a control on their own.
- `effectValues`: the shadows and the scrim of each theme as hex colours and
  numbers (`effectValues.dark.scrim` is `{ color: "#040813", alpha: 0.64 }`),
  for consumers that cannot read a custom property, such as an Electron main
  process, an Open Graph image or a PDF. Until now these existed only as the
  CSS strings of `effects`. `effectValues` is the single source: `effects`,
  `tokens.css` and `tokens.scss` are rendered from it. Also in `tokens.json`
  under the same name, with the types `EffectValues`, `ThemeEffectValues`,
  `EffectTone` and `ShadowLayer`.

## [1.0.0] - 2026-11-10

First release: the design tokens of Han Dijit for the site, the panel and the
desktop apps, generated from one TypeScript source.

### Added

- Nine OKLCH colour scales (`cobalt`, `coral`, `turquoise`, `success`,
  `warning`, `danger`, `violet`, `magenta`, `slate`), 101 colours in total.
- Light and dark themes of 64 semantic colours each: surfaces, borders, text,
  primary (cobalt), accent (coral), highlight (turquoise), focus, selection,
  four status families, six chart colours and the brand band.
- Per-theme effects: three shadow levels, their colour and alpha parts, and a
  scrim.
- Theme-independent tokens: three font stacks, four font weights, ten type
  roles, a 4px spacing scale, five radii, three durations, three easings, nine
  layers and four breakpoints.
- `tokens.css`: every token as a `--hd-*` custom property. Light by default,
  dark under `prefers-color-scheme: dark`, and explicit on the root element or
  any container, nested in either direction, with `data-theme`. Durations
  collapse under `prefers-reduced-motion: reduce`.
- `tokens.scss`: a `$hd-*` variable for every token, breakpoint constants, and
  the `hd-up`, `hd-down`, `hd-between`, `hd-reduced-motion` and `hd-type`
  mixins.
- `tokens.json`: the token data for consumers without CSS or a bundler.
- JavaScript entry (ESM, CommonJS and a minified UMD bundle, global
  `handijitDesign`) with typed token maps, token-name union types, `cssVar`,
  `cssVarName`, and the colour helpers `contrast`, `deltaE`, `oklchToHex`,
  `hexToOklch` and `maxChroma`.
- `THEME_BOOT_SCRIPT`, an inline script that applies a stored theme before the
  first paint, and `THEME_BOOT_SCRIPT_HASH`, its `sha256-…` digest for a Content
  Security Policy, with `THEME_ATTRIBUTE` and `THEME_STORAGE_KEY`.
- `fonts.css` and self-hosted `woff2` files for Archivo (variable weight and
  width), Inter (variable weight) and IBM Plex Mono (400 and 500), in the
  `latin` and `latin-ext` subsets, with their SIL Open Font License texts.
- The Han Dijit mark and horizontal logo as SVG files and as path data in
  `logos`; the body is painted with `currentColor` and the dot with
  `--hd-logo-dot`, falling back to `--hd-accent`.

[Unreleased]: https://github.com/handijit/design/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/handijit/design/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/handijit/design/releases/tag/v1.0.0

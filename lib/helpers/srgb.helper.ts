/** sRGB channels in the 0–1 range (gamma-encoded unless a function says linear). */
type Rgb = { r: number; g: number; b: number };

const HEX_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

/** sRGB gamma → linear light. */
const toLinear = (channel: number): number =>
  channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;

/** Linear light → sRGB gamma. */
const toGamma = (channel: number): number =>
  channel <= 0.0031308 ? channel * 12.92 : 1.055 * channel ** (1 / 2.4) - 0.055;

const describe = (value: unknown): string =>
  typeof value === "string" ? `"${value}"` : typeof value;

/** `#rgb` / `#rrggbb` → gamma-encoded channels; anything else is a caller error. */
const parseHex = (value: unknown, caller: string): Rgb => {
  if (typeof value !== "string" || !HEX_PATTERN.test(value)) {
    throw new TypeError(
      `${caller}: expected a hex colour like "#2661fa", received ${describe(value)}`
    );
  }

  const digits = value.slice(1);
  const full =
    digits.length === 3
      ? digits.replace(/./g, (digit) => digit + digit)
      : digits;
  const channel = (start: number): number =>
    parseInt(full.slice(start, start + 2), 16) / 255;

  return { r: channel(0), g: channel(2), b: channel(4) };
};

const toByte = (channel: number): string =>
  Math.round(Math.min(1, Math.max(0, channel)) * 255)
    .toString(16)
    .padStart(2, "0");

/** Gamma-encoded channels → lowercase `#rrggbb`; out-of-range channels clip. */
const formatHex = ({ r, g, b }: Rgb): string =>
  `#${toByte(r)}${toByte(g)}${toByte(b)}`;

/** WCAG 2 relative luminance of gamma-encoded channels. */
const relativeLuminance = ({ r, g, b }: Rgb): number =>
  0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

export type { Rgb };
export { formatHex, parseHex, relativeLuminance, toGamma, toLinear };

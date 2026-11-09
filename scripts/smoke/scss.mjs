import { readFileSync } from "node:fs";
import { breakpoints } from "@handijit/design";

const css = readFileSync("consumer.css", "utf8");
const expected = [
  "background: var(--hd-bg-surface);",
  "border-radius: var(--hd-radius-md);",
  "font-size: var(--hd-type-body-size);",
  `@media (min-width: ${breakpoints.md}px)`,
];
for (const fragment of expected) {
  if (!css.includes(fragment)) {
    throw new Error(`tokens.scss is broken: expected "${fragment}"`);
  }
}

console.log("SCSS consumer OK");

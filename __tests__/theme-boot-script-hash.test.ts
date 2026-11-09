import { createHash } from "node:crypto";

import { describe, expect, test } from "vitest";

import THEME_ATTRIBUTE from "../lib/tokens/theme-attribute";
import THEME_BOOT_SCRIPT from "../lib/tokens/theme-boot-script";
import THEME_BOOT_SCRIPT_HASH from "../lib/tokens/theme-boot-script-hash";
import THEME_STORAGE_KEY from "../lib/tokens/theme-storage-key";

describe("THEME_BOOT_SCRIPT_HASH", () => {
  test("should be the SHA-256 digest of the script text", () => {
    const digest = createHash("sha256")
      .update(THEME_BOOT_SCRIPT, "utf8")
      .digest("base64");

    expect(THEME_BOOT_SCRIPT_HASH).toBe(`sha256-${digest}`);
  });

  test("should be a CSP hash source once wrapped in single quotes", () => {
    expect(THEME_BOOT_SCRIPT_HASH).toMatch(/^sha256-[A-Za-z0-9+/]{43}=$/);
  });

  test("should change whenever the script changes", () => {
    // The digest of the published script. A browser refuses the inline script when the
    // policy carries another digest, so editing the script is a breaking change for every
    // consumer that copied this value: update it here deliberately.
    expect(THEME_BOOT_SCRIPT_HASH).toMatchInlineSnapshot(
      `"sha256-yBtu0+cpsTaiuo7oykT/pEhxNmKXW7Q0szD6rE70zOM="`
    );
    expect(THEME_BOOT_SCRIPT).toMatchInlineSnapshot(
      `"(function(){var r=document.documentElement,q=window.matchMedia("(prefers-color-scheme: dark)"),a=function(){var s;try{s=localStorage.getItem("hd-theme")}catch(e){}r.setAttribute("data-theme",s==="light"||s==="dark"?s:q.matches?"dark":"light")};a();q.addEventListener("change",a)})();"`
    );
  });
});

describe("theme constants", () => {
  test("should name the attribute and the storage key", () => {
    expect(THEME_ATTRIBUTE).toBe("data-theme");
    expect(THEME_STORAGE_KEY).toBe("hd-theme");
  });

  test("should be the names the boot script reads and writes", () => {
    expect(THEME_BOOT_SCRIPT).toContain(`localStorage.getItem("hd-theme")`);
    expect(THEME_BOOT_SCRIPT).toContain(`r.setAttribute("data-theme",`);
  });
});

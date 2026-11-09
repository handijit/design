import { beforeEach, describe, expect, test, vi } from "vitest";

import THEME_ATTRIBUTE from "../lib/tokens/theme-attribute";
import THEME_BOOT_SCRIPT from "../lib/tokens/theme-boot-script";
import THEME_STORAGE_KEY from "../lib/tokens/theme-storage-key";

type ChangeListener = () => void;

/** Installs a controllable `matchMedia`; returns a way to flip the system theme. */
const stubSystemTheme = (dark: boolean): ((next: boolean) => void) => {
  const listeners: ChangeListener[] = [];
  const query = {
    matches: dark,
    addEventListener: (_: "change", listener: ChangeListener): void => {
      listeners.push(listener);
    },
  };
  const matchMedia = vi.fn(() => query);
  vi.stubGlobal("matchMedia", matchMedia);

  return (next) => {
    query.matches = next;
    for (const listener of listeners) listener();
  };
};

/** Runs the script the way a browser runs an inline classic script. */
const boot = (): void => {
  // The package ships the script as text for a <script> tag; evaluating that text is the test.
  new Function(THEME_BOOT_SCRIPT)();
};

const theme = (): string | null =>
  document.documentElement.getAttribute(THEME_ATTRIBUTE);

describe("THEME_BOOT_SCRIPT", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute(THEME_ATTRIBUTE);
    localStorage.clear();
  });

  test("should apply a stored dark choice over a light system", () => {
    stubSystemTheme(false);
    localStorage.setItem(THEME_STORAGE_KEY, "dark");

    boot();

    expect(theme()).toBe("dark");
  });

  test("should apply a stored light choice over a dark system", () => {
    stubSystemTheme(true);
    localStorage.setItem(THEME_STORAGE_KEY, "light");

    boot();

    expect(theme()).toBe("light");
  });

  test.each([
    [true, "dark"],
    [false, "light"],
  ])(
    "should follow the system (dark: %s) when nothing is stored",
    (dark, expected) => {
      stubSystemTheme(dark);

      boot();

      expect(theme()).toBe(expected);
    }
  );

  test.each(["system", "DARK", "", "<script>"])(
    "should treat the stored value %j as no choice",
    (stored) => {
      stubSystemTheme(true);
      localStorage.setItem(THEME_STORAGE_KEY, stored);

      boot();

      expect(theme()).toBe("dark");
    }
  );

  test("should ask for the system preference with the standard media query", () => {
    stubSystemTheme(false);

    boot();

    expect(window.matchMedia).toHaveBeenCalledTimes(1);
    expect(window.matchMedia).toHaveBeenCalledWith(
      "(prefers-color-scheme: dark)"
    );
  });

  test("should follow the system when it changes later", () => {
    const setSystemDark = stubSystemTheme(false);
    boot();

    setSystemDark(true);
    expect(theme()).toBe("dark");

    setSystemDark(false);
    expect(theme()).toBe("light");
  });

  test("should keep an explicit choice when the system changes", () => {
    const setSystemDark = stubSystemTheme(false);
    localStorage.setItem(THEME_STORAGE_KEY, "light");
    boot();

    setSystemDark(true);

    expect(theme()).toBe("light");
  });

  test("should pick up a choice stored after boot on the next system change", () => {
    const setSystemDark = stubSystemTheme(false);
    boot();

    localStorage.setItem(THEME_STORAGE_KEY, "dark");
    setSystemDark(false);

    expect(theme()).toBe("dark");
  });

  test("should fall back to the system when storage is blocked", () => {
    stubSystemTheme(true);
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("The operation is insecure.", "SecurityError");
    });

    expect(boot).not.toThrow();
    expect(theme()).toBe("dark");
  });

  test("should leave nothing behind in the global scope", () => {
    stubSystemTheme(false);
    const before = Object.keys(window);

    boot();

    expect(Object.keys(window)).toEqual(before);
  });

  test("should be safe to inline in HTML", () => {
    // "</script" would end the element early; "<!--" switches the HTML parser's script mode.
    expect(THEME_BOOT_SCRIPT).not.toMatch(/<\/script|<!--/i);
    expect(THEME_BOOT_SCRIPT).not.toMatch(/[\n\r\u2028\u2029]/);
  });

  test("should stay ES5 so it runs before any bundle on every engine", () => {
    expect(THEME_BOOT_SCRIPT).not.toMatch(/=>|\b(?:const|let)\b|`/);
    expect(THEME_BOOT_SCRIPT.length).toBeLessThan(400);
  });
});

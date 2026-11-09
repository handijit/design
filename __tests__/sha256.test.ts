import { createHash } from "node:crypto";

import { describe, expect, test } from "vitest";

import sha256Base64 from "../lib/helpers/sha256.helper";

const reference = (text: string): string =>
  createHash("sha256").update(text, "utf8").digest("base64");

describe("sha256Base64", () => {
  test("should match the published test vectors", () => {
    expect(sha256Base64("")).toBe(
      "47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU="
    );
    expect(sha256Base64("abc")).toBe(
      "ungWv48Bz+pBQUDeXa4iI7ADYaOWF3qctBD/YfIAFa0="
    );
  });

  test.each([55, 56, 63, 64, 65, 119, 120, 1000])(
    "should match node:crypto for a %i byte message",
    (length) => {
      const text = "a".repeat(length);

      expect(sha256Base64(text)).toBe(reference(text));
    }
  );

  test("should hash the UTF-8 bytes of non-ASCII text", () => {
    const text = "ğüşiöç İIı — 設計";

    expect(sha256Base64(text)).toBe(reference(text));
  });
});

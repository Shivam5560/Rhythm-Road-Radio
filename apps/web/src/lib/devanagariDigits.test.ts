import { describe, expect, it } from "vitest";
import { toDevanagariDigits } from "./devanagariDigits";
import { formatTime } from "./formatTime";

describe("toDevanagariDigits", () => {
  it("maps every ASCII digit to its Devanagari counterpart", () => {
    expect(toDevanagariDigits("0123456789")).toBe("०१२३४५६७८९");
  });

  it("leaves separators and non-digits alone", () => {
    expect(toDevanagariDigits("04:12")).toBe("०४:१२");
    expect(toDevanagariDigits("गाना 7")).toBe("गाना ७");
  });

  it("composes with formatTime, which is what the player actually renders", () => {
    expect(toDevanagariDigits(formatTime(252))).toBe("०४:१२");
    expect(toDevanagariDigits(formatTime(0))).toBe("००:००");
  });

  it("is a no-op on strings without digits", () => {
    expect(toDevanagariDigits("महफ़िल")).toBe("महफ़िल");
  });
});

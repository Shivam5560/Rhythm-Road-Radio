import { describe, expect, it } from "vitest";
import { shirorekhaClip, wordStagger } from "./reveal";

describe("shirorekhaClip", () => {
  it("hides everything before the reveal starts", () => {
    expect(shirorekhaClip(0)).toEqual({ right: 100, bottom: 88 });
  });

  it("draws the head-stroke left to right first, keeping letterforms hidden", () => {
    const mid = shirorekhaClip(0.175);
    expect(mid.right).toBeGreaterThan(0);
    expect(mid.right).toBeLessThan(100);
    expect(mid.bottom).toBe(88);
  });

  it("has the head-stroke fully drawn before letterforms begin to drop", () => {
    expect(shirorekhaClip(0.35).right).toBe(0);
    expect(shirorekhaClip(0.35).bottom).toBe(88);
  });

  it("fully reveals the line at the end", () => {
    expect(shirorekhaClip(1)).toEqual({ right: 0, bottom: 0 });
  });
});

describe("wordStagger", () => {
  it("gives the first word a head start over the last", () => {
    expect(wordStagger(0, 4, 0.5)).toBeGreaterThan(wordStagger(3, 4, 0.5));
  });

  it("has every word settled by the end", () => {
    for (let i = 0; i < 4; i++) {
      expect(wordStagger(i, 4, 1)).toBe(1);
    }
  });

  it("has no word started at the beginning", () => {
    for (let i = 0; i < 4; i++) {
      expect(wordStagger(i, 4, 0)).toBe(0);
    }
  });
});

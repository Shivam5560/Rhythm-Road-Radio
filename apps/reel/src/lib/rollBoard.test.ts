import { describe, expect, it } from "vitest";
import { highlightSweep, rollOffset } from "./rollBoard";

describe("rollOffset", () => {
  it("shows the outgoing row at rest", () => {
    expect(rollOffset(0, 120)).toBe(0);
  });

  it("lands exactly on the incoming row", () => {
    expect(rollOffset(1, 120)).toBeCloseTo(-120);
  });

  it("overshoots past the incoming row before settling, like a real roller", () => {
    const overshot = Array.from({ length: 40 }, (_, i) => rollOffset(0.6 + i * 0.01, 120));
    expect(Math.min(...overshot)).toBeLessThan(-120);
  });

  it("is monotonic for the first half of the roll", () => {
    let previous = Infinity;
    for (let p = 0; p <= 0.5; p += 0.05) {
      const value = rollOffset(p, 120);
      expect(value).toBeLessThanOrEqual(previous);
      previous = value;
    }
  });
});

describe("highlightSweep", () => {
  it("is off screen at both ends and crosses the board in the middle", () => {
    expect(highlightSweep(0)).toBeLessThanOrEqual(0);
    expect(highlightSweep(1)).toBeGreaterThanOrEqual(1);
    expect(highlightSweep(0.5)).toBeGreaterThan(0.2);
    expect(highlightSweep(0.5)).toBeLessThan(0.8);
  });
});

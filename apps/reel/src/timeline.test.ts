import { describe, expect, it } from "vitest";
import { BEATS, DURATION_IN_FRAMES, FPS, beat, localProgress } from "./timeline";

describe("timeline", () => {
  it("runs exactly 28 seconds", () => {
    expect(DURATION_IN_FRAMES / FPS).toBe(28);
  });

  it("has contiguous beats with no gaps or overlaps", () => {
    let cursor = 0;
    for (const b of BEATS) {
      expect(b.from).toBe(cursor);
      cursor += b.durationInFrames;
    }
    expect(cursor).toBe(DURATION_IN_FRAMES);
  });

  it("gives every mode a 4 second block", () => {
    for (const name of ["driver", "rainy", "party", "ghazal"] as const) {
      expect(beat(name).durationInFrames).toBe(120);
    }
  });

  it("reports progress within a beat as 0 at its start and 1 at its end", () => {
    const b = beat("driver");
    expect(localProgress(b.from, b)).toBe(0);
    expect(localProgress(b.from + b.durationInFrames, b)).toBe(1);
    expect(localProgress(b.from + 60, b)).toBeCloseTo(0.5);
  });

  it("clamps progress outside the beat", () => {
    const b = beat("driver");
    expect(localProgress(0, b)).toBe(0);
    expect(localProgress(839, b)).toBe(1);
  });
});

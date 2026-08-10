import { describe, expect, it } from "vitest";
import { cameraTransform } from "./camera";

describe("cameraTransform", () => {
  it("starts pushed in and settles at rest", () => {
    expect(cameraTransform(0).scale).toBeCloseTo(1.08);
    expect(cameraTransform(1).scale).toBeCloseTo(1.0);
  });

  it("never scales below 1, which would expose the canvas edge", () => {
    for (let p = 0; p <= 1.5; p += 0.05) {
      expect(cameraTransform(p).scale).toBeGreaterThanOrEqual(1);
    }
  });

  it("drifts vertically as it settles", () => {
    expect(cameraTransform(0).y).not.toBe(cameraTransform(1).y);
  });

  it("honours a custom start scale", () => {
    expect(cameraTransform(0, { from: 1.2 }).scale).toBeCloseTo(1.2);
  });
});

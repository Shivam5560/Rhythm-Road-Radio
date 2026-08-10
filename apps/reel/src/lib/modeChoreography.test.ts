import { describe, expect, it } from "vitest";
import { layoutFor } from "../layout";
import { choreographyFor } from "./modeChoreography";

const layout = layoutFor("vertical");
const MODES = ["driver", "rainy", "party", "ghazal"] as const;

describe("choreographyFor", () => {
  it("defines a gesture for every mode, so no state changes without a cause", () => {
    for (const m of MODES) {
      expect(choreographyFor(m, layout).gestures.length, m).toBeGreaterThan(0);
    }
  });

  it("keeps every gesture inside the 120 frame mode block", () => {
    for (const m of MODES) {
      for (const g of choreographyFor(m, layout).gestures) {
        expect(g.startFrame, m).toBeGreaterThanOrEqual(0);
        expect(g.startFrame + g.durationInFrames, m).toBeLessThanOrEqual(120);
      }
    }
  });

  it("puts every gesture inside the safe area", () => {
    for (const m of MODES) {
      for (const g of choreographyFor(m, layout).gestures) {
        const points = g.kind === "tap" ? [g.at] : [g.from, g.to];
        for (const [x, y] of points) {
          expect(x, m).toBeGreaterThanOrEqual(0);
          expect(x, m).toBeLessThanOrEqual(layout.width);
          expect(y, m).toBeGreaterThanOrEqual(layout.safe.top);
          expect(y, m).toBeLessThanOrEqual(layout.safe.bottom);
        }
      }
    }
  });

  it("does not swipe into the driver mode, which is the reel's opening state", () => {
    expect(choreographyFor("driver", layout).gestures.some((g) => g.kind === "swipe")).toBe(false);
  });

  it("swipes into every mode after the first", () => {
    for (const m of ["rainy", "party", "ghazal"] as const) {
      expect(choreographyFor(m, layout).gestures.some((g) => g.kind === "swipe"), m).toBe(true);
    }
  });
});

import { describe, expect, it } from "vitest";
import { gestureState, type Gesture } from "./gestures";

const tap: Gesture = { kind: "tap", at: [500, 1400], startFrame: 10, durationInFrames: 12 };
const swipe: Gesture = { kind: "swipe", from: [800, 900], to: [300, 900], startFrame: 0, durationInFrames: 20 };

describe("gestureState", () => {
  it("is invisible before it starts", () => {
    expect(gestureState(tap, 0).visible).toBe(false);
  });

  it("is invisible well after it ends", () => {
    expect(gestureState(tap, 100).visible).toBe(false);
  });

  it("sits on the target throughout a tap", () => {
    const s = gestureState(tap, 14);
    expect(s.visible).toBe(true);
    expect(s.x).toBe(500);
    expect(s.y).toBe(1400);
  });

  it("registers the press partway through a tap, not on the first frame", () => {
    expect(gestureState(tap, 10).pressed).toBe(false);
    expect(gestureState(tap, 16).pressed).toBe(true);
  });

  it("travels from start to end across a swipe", () => {
    expect(gestureState(swipe, 0).x).toBe(800);
    expect(gestureState(swipe, 20).x).toBe(300);
    const mid = gestureState(swipe, 10).x;
    expect(mid).toBeLessThan(800);
    expect(mid).toBeGreaterThan(300);
  });

  it("holds a swipe pressed for its whole travel", () => {
    expect(gestureState(swipe, 10).pressed).toBe(true);
  });

  it("fades out across the tail after the gesture ends, rather than snapping", () => {
    const end = tap.startFrame + tap.durationInFrames;
    const atEnd = gestureState(tap, end);
    const earlyTail = gestureState(tap, end + 2);
    const midTail = gestureState(tap, end + 4);
    const lateTail = gestureState(tap, end + 7);

    // Fully visible right up to the end of the gesture itself.
    expect(atEnd.fade).toBe(1);

    // Decays smoothly across the tail, never snapping straight to 0.
    expect(earlyTail.fade).toBeLessThan(atEnd.fade);
    expect(earlyTail.fade).toBeGreaterThan(0);
    expect(midTail.fade).toBeLessThan(earlyTail.fade);
    expect(midTail.fade).toBeGreaterThan(0);
    expect(lateTail.fade).toBeLessThan(midTail.fade);
    expect(lateTail.fade).toBeGreaterThan(0);
  });
});

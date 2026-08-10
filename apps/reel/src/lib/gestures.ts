export type Point = [number, number];

export type Gesture =
  | { kind: "tap"; at: Point; startFrame: number; durationInFrames: number }
  | { kind: "swipe"; from: Point; to: Point; startFrame: number; durationInFrames: number }
  | { kind: "drag"; from: Point; to: Point; startFrame: number; durationInFrames: number };

export interface GestureState {
  x: number;
  y: number;
  /** True while the finger is down — drives the ring's contact state. */
  pressed: boolean;
  visible: boolean;
  /** 0..1 through the gesture. */
  progress: number;
  /**
   * 1 while the gesture is active, decaying smoothly to 0 across
   * TAIL_FRAMES once it ends. Drives the cue's opacity so it fades out
   * instead of popping out of existence — `progress` alone can't express
   * this because it's clamped to a max of 1.
   */
  fade: number;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

/** Frames the cue lingers after release before fading out. */
export const TAIL_FRAMES = 8;
/** Fraction of a tap spent approaching before contact registers. */
const TAP_CONTACT = 0.45;

/** 1 up through the end of the gesture, then eases down to 0 across TAIL_FRAMES. */
function fadeFor(elapsed: number, durationInFrames: number): number {
  if (elapsed <= durationInFrames) return 1;
  const tail = clamp01((elapsed - durationInFrames) / TAIL_FRAMES);
  return 1 - easeInOut(tail);
}

export function gestureState(g: Gesture, frame: number): GestureState {
  const elapsed = frame - g.startFrame;
  const visible = elapsed >= 0 && elapsed <= g.durationInFrames + TAIL_FRAMES;
  const progress = clamp01(elapsed / g.durationInFrames);
  const hidden: GestureState = { x: 0, y: 0, pressed: false, visible: false, progress, fade: 0 };

  if (!visible) return hidden;

  const fade = fadeFor(elapsed, g.durationInFrames);

  if (g.kind === "tap") {
    return {
      x: g.at[0],
      y: g.at[1],
      pressed: progress >= TAP_CONTACT && elapsed <= g.durationInFrames,
      visible: true,
      progress,
      fade,
    };
  }

  const t = easeInOut(progress);
  return {
    x: g.from[0] + (g.to[0] - g.from[0]) * t,
    y: g.from[1] + (g.to[1] - g.from[1]) * t,
    pressed: elapsed <= g.durationInFrames,
    visible: true,
    progress,
    fade,
  };
}

export const FPS = 60;
export const DURATION_IN_FRAMES = 28 * FPS;

const SCALE = FPS / 30;

export type BeatName =
  | "hook"
  | "driver"
  | "rainy"
  | "party"
  | "ghazal"
  | "feature1"
  | "feature2"
  | "feature3"
  | "cta";

export interface Beat {
  name: BeatName;
  from: number;
  durationInFrames: number;
}

export const BEATS: Beat[] = [
  { name: "hook", from: 0 * SCALE, durationInFrames: 105 * SCALE },
  { name: "driver", from: 105 * SCALE, durationInFrames: 120 * SCALE },
  { name: "rainy", from: 225 * SCALE, durationInFrames: 120 * SCALE },
  { name: "party", from: 345 * SCALE, durationInFrames: 120 * SCALE },
  { name: "ghazal", from: 465 * SCALE, durationInFrames: 120 * SCALE },
  { name: "feature1", from: 585 * SCALE, durationInFrames: 55 * SCALE },
  { name: "feature2", from: 640 * SCALE, durationInFrames: 55 * SCALE },
  { name: "feature3", from: 695 * SCALE, durationInFrames: 55 * SCALE },
  { name: "cta", from: 750 * SCALE, durationInFrames: 90 * SCALE },
];

export function beat(name: BeatName): Beat {
  const found = BEATS.find((b) => b.name === name);
  if (!found) throw new Error(`Unknown beat: ${name}`);
  return found;
}

/** Position of an absolute frame inside a beat, clamped to 0..1. */
export function localProgress(frame: number, b: Beat): number {
  const raw = (frame - b.from) / b.durationInFrames;
  return Math.min(1, Math.max(0, raw));
}

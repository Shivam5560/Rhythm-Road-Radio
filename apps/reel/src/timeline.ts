export const FPS = 30;
export const DURATION_IN_FRAMES = 840;

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
  { name: "hook", from: 0, durationInFrames: 105 },
  { name: "driver", from: 105, durationInFrames: 120 },
  { name: "rainy", from: 225, durationInFrames: 120 },
  { name: "party", from: 345, durationInFrames: 120 },
  { name: "ghazal", from: 465, durationInFrames: 120 },
  { name: "feature1", from: 585, durationInFrames: 55 },
  { name: "feature2", from: 640, durationInFrames: 55 },
  { name: "feature3", from: 695, durationInFrames: 55 },
  { name: "cta", from: 750, durationInFrames: 90 },
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

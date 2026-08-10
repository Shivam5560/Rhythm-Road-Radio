export interface CameraOptions {
  /** Scale at progress 0. Must be >= 1 so the canvas edge never shows. */
  from?: number;
  /** Vertical drift in pixels across the beat. */
  drift?: number;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
/** Ease-out cubic — decelerating, so the camera lands rather than stops. */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export function cameraTransform(
  progress: number,
  { from = 1.08, drift = 24 }: CameraOptions = {},
): { scale: number; y: number } {
  const t = easeOut(clamp01(progress));
  return {
    scale: Math.max(1, from + (1 - from) * t),
    y: drift * (1 - t) * -1,
  };
}

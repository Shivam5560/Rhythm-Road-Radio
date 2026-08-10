const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * Vertical offset of the roller strip, in pixels, as it turns from the
 * outgoing place name to the incoming one. Overshoots and springs back so it
 * reads as a mechanical roller with slack rather than a CSS transition.
 */
export function rollOffset(progress: number, rowHeight: number): number {
  const t = clamp01(progress);
  // Damped sine: settles on 1 with a decaying overshoot after the first pass.
  const damped = 1 - Math.pow(2, -11 * t) * Math.cos(t * Math.PI * 1.0);
  let result = -rowHeight * damped;
  // Round to snap to exact target at end of animation
  if (t > 0.99) {
    result = Math.round(result);
  }
  return result === 0 ? 0 : result; // Convert -0 to 0
}

/** 0..1 position of the specular highlight sweeping across the metal. */
export function highlightSweep(progress: number): number {
  return clamp01(progress) * 1.6 - 0.3;
}

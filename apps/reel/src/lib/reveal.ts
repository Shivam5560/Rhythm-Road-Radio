const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** Fraction of the reveal spent drawing the head-stroke before letters drop. */
const STROKE_PHASE = 0.35;
/** Percentage of the line box below the shirorekha. */
const BELOW_STROKE = 88;

/**
 * Clip insets for the two-stage Devanagari reveal.
 *
 * Yatra One carries a solid shirorekha across the top of every glyph, so the
 * line can be revealed by first wiping the top band left to right (the stroke
 * drawing itself), then lifting the bottom inset (the letterforms dropping out
 * of it). This reveal is only possible in a Devanagari display face.
 */
export function shirorekhaClip(progress: number): { right: number; bottom: number } {
  const t = clamp01(progress);
  const stroke = clamp01(t / STROKE_PHASE);
  const body = clamp01((t - STROKE_PHASE) / (1 - STROKE_PHASE));
  return {
    right: (1 - stroke) * 100,
    bottom: BELOW_STROKE * (1 - body),
  };
}

/** Per-word progress 0..1, staggered so words land left to right. */
export function wordStagger(index: number, count: number, progress: number): number {
  const t = clamp01(progress);
  if (t === 0) return 0;
  const span = 1 / (count + 2);
  const start = index * span * 0.8;
  return clamp01((t - start) / (1 - start));
}

type Seekable = Pick<Animation, "pause" | "currentTime">;

/**
 * Drive every running CSS animation to an explicit point in time.
 *
 * Remotion captures frames with the page paused, so CSS keyframe animations
 * (`.rain-drop`, `.rain-mist-band`, `.art-spin`, `.player-eq i`) would render
 * frozen. Seeking through the Web Animations API rather than overriding
 * `animation-delay` in CSS matters: each rain drop carries its own inline
 * delay, and WAAPI's `currentTime` is measured on a timeline that already
 * includes that delay — so the stagger survives.
 */
export function syncCssAnimations(timeMs: number, animations: Seekable[]): void {
  for (const animation of animations) {
    try {
      animation.pause();
      animation.currentTime = timeMs;
    } catch {
      // A finished or non-seekable animation must not abort the whole frame.
    }
  }
}

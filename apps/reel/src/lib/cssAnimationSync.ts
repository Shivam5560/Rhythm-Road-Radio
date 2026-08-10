type Seekable = Pick<Animation, "pause" | "currentTime"> & {
  effect?: AnimationEffect | null;
};

/**
 * Drive every running CSS animation to an explicit point in time.
 *
 * Remotion captures frames with the page paused, so CSS keyframe animations
 * (`.rain-drop`, `.rain-mist-band`, `.art-spin`, `.player-eq i`) would render
 * frozen. Seeking through the Web Animations API rather than overriding
 * `animation-delay` in CSS matters: each rain drop carries its own inline
 * delay, and WAAPI's `currentTime` is measured on a timeline that already
 * includes that delay — so the stagger survives.
 *
 * Calling `Animation.pause()` and setting `currentTime` directly on an
 * Animation that originated from a CSS `animation:` declaration is NOT
 * enough on its own, and this is easy to misdiagnose: reading `currentTime`
 * back immediately afterwards gives exactly the value you set. But a few
 * animation frames later, Chromium silently swaps that Animation object out
 * for a brand new one tied to the same element — its `animation-play-state`
 * still declared `running` in CSS — and the replacement starts fresh, idle,
 * driven by real wall-clock time instead of the frame we asked for. The
 * original Animation object you were holding is left canceled
 * (`currentTime === null`, `playState === "idle"`), which is the tell.
 *
 * The reliable fix is to stop asking Blink to reconcile an imperative seek
 * against a declarative CSS animation at all: neutralize the CSS-driven
 * animation on the element (`style.animation = "none"`) and re-create it as
 * a JS-owned Web Animation via `Element.animate()`, copying the exact
 * keyframes and computed timing (including each rain drop's own
 * `animation-delay`) off the original effect. An animation with no CSS
 * `animation-name` backing it has nothing for Blink to reconcile against, so
 * pausing and seeking it sticks.
 */
export function syncCssAnimations(timeMs: number, animations: Seekable[]): void {
  for (const animation of animations) {
    try {
      if (adoptAsOwnedAnimation(animation, timeMs)) {
        continue;
      }
      animation.pause();
      animation.currentTime = timeMs;
    } catch {
      // A finished or non-seekable animation must not abort the whole frame.
    }
  }
}

/**
 * Re-create `animation` as a JS-owned Web Animation on the same element,
 * using its own keyframes/timing, then pause it at `timeMs`. Returns false
 * (leaving the caller to fall back to a plain WAAPI seek) whenever this
 * isn't a real browser KeyframeEffect — e.g. in the unit-test environment,
 * where `KeyframeEffect` doesn't exist and `animations` are plain mocks.
 */
function adoptAsOwnedAnimation(animation: Seekable, timeMs: number): boolean {
  if (typeof KeyframeEffect === "undefined") {
    return false;
  }
  const effect = animation.effect;
  if (!(effect instanceof KeyframeEffect)) {
    return false;
  }
  const target = effect.target;
  if (!target || !(target instanceof Element)) {
    return false;
  }
  const keyframes = effect.getKeyframes();
  const timing = effect.getTiming();
  (target as HTMLElement | SVGElement).style.animation = "none";
  const owned = target.animate(keyframes, timing);
  owned.pause();
  owned.currentTime = timeMs;
  return true;
}

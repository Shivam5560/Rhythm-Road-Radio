import { describe, expect, it, vi } from "vitest";
import { syncCssAnimations } from "./cssAnimationSync";

function fakeAnimation() {
  return { pause: vi.fn(), currentTime: 0 as number | CSSNumericValue | null };
}

describe("syncCssAnimations", () => {
  it("pauses every animation so wall-clock time cannot drift the frame", () => {
    const a = fakeAnimation();
    const b = fakeAnimation();
    syncCssAnimations(500, [a, b]);
    expect(a.pause).toHaveBeenCalledOnce();
    expect(b.pause).toHaveBeenCalledOnce();
  });

  it("seeks every animation to the requested time", () => {
    const a = fakeAnimation();
    syncCssAnimations(1234, [a]);
    expect(a.currentTime).toBe(1234);
  });

  it("keeps going when one animation refuses to be seeked", () => {
    const bad = {
      pause: vi.fn(),
      set currentTime(_v: number | CSSNumericValue | null) {
        throw new Error("not seekable");
      },
      get currentTime() {
        return 0;
      },
    };
    const good = fakeAnimation();
    expect(() => syncCssAnimations(700, [bad, good])).not.toThrow();
    expect(good.currentTime).toBe(700);
  });

  it("seeks an already-adopted animation instead of re-adopting it", () => {
    // A real JS-owned animation created by a previous call to
    // `adoptAsOwnedAnimation` carries the `__reelOwned` marker. On later
    // frames it must only be paused/seeked — never routed back through
    // adoption, which would call `Element.animate()` again and create a new
    // owned animation every single frame (the leak this test guards
    // against). We prove no re-adoption happened by asserting `animate` on
    // the (fake) target element is never invoked.
    const animateSpy = vi.fn();
    const owned = {
      pause: vi.fn(),
      currentTime: 0 as number | CSSNumericValue | null,
      __reelOwned: true,
      // Only `target.animate` matters for this test (proving adoption isn't
      // re-run); the rest of a real AnimationEffect is irrelevant here.
      effect: {
        target: { animate: animateSpy },
      } as unknown as AnimationEffect,
    };

    syncCssAnimations(2000, [owned]);

    expect(owned.pause).toHaveBeenCalledOnce();
    expect(owned.currentTime).toBe(2000);
    expect(animateSpy).not.toHaveBeenCalled();
  });
});

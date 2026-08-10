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
});

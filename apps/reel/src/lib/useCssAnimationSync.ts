import { useEffect } from "react";
import { continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { syncCssAnimations } from "./cssAnimationSync";

/**
 * Hold the frame until the site's CSS animations have been seeked to it.
 * Must be called by any component that mounts `SceneStage` or the player bar.
 */
export function useCssAnimationSync(): void {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  useEffect(() => {
    const handle = delayRender(`css-animation-sync frame ${frame}`);
    syncCssAnimations((frame / fps) * 1000, document.getAnimations());
    continueRender(handle);
  }, [frame, fps]);
}

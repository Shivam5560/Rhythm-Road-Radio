import { Composition } from "remotion";
import { Reel } from "./Reel";
import { DURATION_IN_FRAMES, FPS } from "./timeline";

export function RemotionRoot() {
  return (
    <>
      <Composition
        id="ReelVertical"
        component={Reel}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ format: "vertical" as const }}
      />
      <Composition
        id="ReelSquare"
        component={Reel}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={{ format: "square" as const }}
      />
    </>
  );
}

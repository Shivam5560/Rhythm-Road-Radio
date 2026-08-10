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
      <Composition
        id="ReelHorizontal"
        component={Reel}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{ format: "horizontal" as const }}
      />
      <Composition
        id="ReelHorizontal2K"
        component={Reel}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
        width={2560}
        height={1440}
        defaultProps={{ format: "horizontal2k" as const }}
      />
      <Composition
        id="ReelVertical2K"
        component={Reel}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
        width={1440}
        height={2560}
        defaultProps={{ format: "vertical2k" as const }}
      />
    </>
  );
}

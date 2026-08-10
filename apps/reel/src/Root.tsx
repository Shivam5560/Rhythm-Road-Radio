import { Composition } from "remotion";
import { Probe } from "./Probe";

export function RemotionRoot() {
  return (
    <Composition
      id="Probe"
      component={Probe}
      durationInFrames={30}
      fps={30}
      width={1080}
      height={1920}
    />
  );
}

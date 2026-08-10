import { AbsoluteFill, Sequence } from "remotion";
import { layoutFor, type Format } from "./layout";
import { loadReelFonts } from "./fonts";
import { beat } from "./timeline";
import { ModeBlock } from "./scenes/ModeBlock";
import { Hook } from "./sequences/Hook";
import { FeatureNames, FeatureSheet, FeatureSwipe } from "./sequences/Features";
import { Cta } from "./sequences/Cta";

const fonts = loadReelFonts();

export function Reel({ format }: { format: Format }) {
  const layout = layoutFor(format);
  const props = { layout, fonts };

  const at = (name: Parameters<typeof beat>[0]) => {
    const b = beat(name);
    return { from: b.from, durationInFrames: b.durationInFrames };
  };

  return (
    <AbsoluteFill style={{ background: "#0a0604" }}>
      <Sequence {...at("hook")}><Hook {...props} /></Sequence>
      <Sequence {...at("driver")}><ModeBlock mode="driver" previousMode="ghazal" {...props} /></Sequence>
      <Sequence {...at("rainy")}><ModeBlock mode="rainy" previousMode="driver" {...props} /></Sequence>
      <Sequence {...at("party")}><ModeBlock mode="party" previousMode="rainy" {...props} /></Sequence>
      <Sequence {...at("ghazal")}><ModeBlock mode="ghazal" previousMode="party" {...props} /></Sequence>
      <Sequence {...at("feature1")}><FeatureSwipe {...props} /></Sequence>
      <Sequence {...at("feature2")}><FeatureNames {...props} /></Sequence>
      <Sequence {...at("feature3")}><FeatureSheet {...props} /></Sequence>
      <Sequence {...at("cta")}><Cta {...props} /></Sequence>
    </AbsoluteFill>
  );
}

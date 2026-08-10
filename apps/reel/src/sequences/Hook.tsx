import { AbsoluteFill, useCurrentFrame } from "remotion";
import { modes } from "@site/components/mockups/indian-playlist/IndianPlaylist";
import type { Layout } from "../layout";
import type { ReelFonts } from "../fonts";
import { HOOK_RAIL } from "../copy";
import { SceneLayer } from "../scenes/SceneLayer";
import { Wordmark } from "../overlay/Wordmark";
import { Rail } from "../overlay/Rail";

export function Hook({ layout, fonts }: { layout: Layout; fonts: ReelFonts }) {
  const frame = useCurrentFrame();
  const accent = modes.driver.accent;

  return (
    <AbsoluteFill>
      <SceneLayer mode="driver" progress={frame / 105} camera={{ from: 1.14, drift: 40 }} />
      <AbsoluteFill style={{ zIndex: 6, justifyContent: "center", alignItems: "center", gap: 44 }}>
        <Wordmark
          progress={Math.min(1, frame / 40)}
          displayFamily={fonts.display}
          bodyFamily={fonts.body}
          fontSize={layout.type.wordmark}
        />
        <div style={{ width: layout.boxes.rail.width }}>
          <Rail
            text={HOOK_RAIL}
            progress={Math.min(1, Math.max(0, (frame - 44) / 26))}
            fontFamily={fonts.mono}
            fontSize={layout.type.rail}
            tracking={layout.type.railTracking}
            width={layout.boxes.rail.width}
            accent={accent}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

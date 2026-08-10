import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { modes } from "@site/components/mockups/indian-playlist/IndianPlaylist";
import type { Layout } from "../layout";
import type { ReelFonts } from "../fonts";
import { CTA_RAIL, CTA_URL } from "../copy";
import { SceneLayer } from "../scenes/SceneLayer";
import { Wordmark } from "../overlay/Wordmark";
import { Rail } from "../overlay/Rail";

export function Cta({ layout, fonts }: { layout: Layout; fonts: ReelFonts }) {
  const rawFrame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const frame = (rawFrame / fps) * 30;
  const accent = modes.driver.accent;
  const underline = Math.min(1, Math.max(0, (frame - 46) / 26));

  return (
    <AbsoluteFill>
      <SceneLayer mode="driver" progress={frame / 90} camera={{ from: 1.06, drift: 20 }} />
      <AbsoluteFill
        style={{ zIndex: 6, justifyContent: "center", alignItems: "center", gap: 40, background: "rgba(10,6,4,.34)" }}
      >
        <Wordmark
          progress={Math.min(1, frame / 30)}
          displayFamily={fonts.display}
          bodyFamily={fonts.body}
          fontSize={layout.type.wordmark}
        />
        <Rail
          text={CTA_RAIL}
          progress={Math.min(1, Math.max(0, (frame - 24) / 22))}
          fontFamily={fonts.mono}
          fontSize={layout.type.rail}
          tracking={layout.type.railTracking}
          width={layout.boxes.rail.width}
          accent={accent}
        />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: fonts.mono, fontSize: 40, letterSpacing: 3, color: "#fff4e8" }}>
            {CTA_URL}
          </span>
          <div style={{ height: 3, width: `${underline * 100}%`, minWidth: 2, background: accent, alignSelf: "stretch" }} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { modes, type PlaylistMode } from "@site/components/mockups/indian-playlist/IndianPlaylist";
import type { Layout } from "../layout";
import type { ReelFonts } from "../fonts";
import { FEATURE_RAIL } from "../copy";
import { SceneLayer } from "../scenes/SceneLayer";
import { Rail } from "../overlay/Rail";
import { NowCardVertical } from "../overlay/NowCardVertical";
import { PlaylistSheetVertical } from "../overlay/PlaylistSheetVertical";
import { TouchCue } from "../overlay/TouchCue";
import { tracksFor } from "../lib/tracks";
import type { Gesture } from "../lib/gestures";

const ORDER: PlaylistMode[] = ["driver", "rainy", "party", "ghazal"];

/** Feature 1: four taps on the mode dots, world changing on each. 55 frames. */
export function FeatureSwipe({ layout, fonts }: { layout: Layout; fonts: ReelFonts }) {
  const rawFrame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const frame = (rawFrame / fps) * 30;
  const index = Math.min(3, Math.floor(frame / 13));
  const mode = ORDER[index];
  const dotX = layout.boxes.rollBoard.x + 40 + index * 62;
  const dotY = layout.boxes.rollBoard.y - 0;
  const tap: Gesture = { kind: "tap", at: [dotX, dotY], startFrame: index * 13, durationInFrames: 10 };

  return (
    <AbsoluteFill>
      <SceneLayer mode={mode} progress={(frame % 13) / 13} camera={{ from: 1.03, drift: 8 }} />
      <AbsoluteFill style={{ zIndex: 6 }}>
        <div style={{ position: "absolute", left: layout.boxes.rollBoard.x, top: dotY, display: "flex", gap: 22 }}>
          {ORDER.map((m, i) => (
            <span
              key={m}
              style={{
                width: i === index ? 46 : 14,
                height: 14,
                borderRadius: 7,
                background: i === index ? modes[m].accent : "rgba(255,244,232,.32)",
              }}
            />
          ))}
        </div>
        <div style={{ position: "absolute", left: layout.boxes.rail.x, top: layout.boxes.rail.y }}>
          <Rail
            text={FEATURE_RAIL[0]}
            progress={Math.min(1, frame / 12)}
            fontFamily={fonts.mono}
            fontSize={layout.type.rail}
            tracking={layout.type.railTracking}
            width={layout.boxes.rail.width}
            accent={modes[mode].accent}
          />
        </div>
        <TouchCue gesture={tap} frame={frame} accent={modes[mode].accent} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

/** Feature 2: push in on the card, curated names cycling. 55 frames. */
export function FeatureNames({ layout, fonts }: { layout: Layout; fonts: ReelFonts }) {
  const rawFrame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const frame = (rawFrame / fps) * 30;
  const tracks = tracksFor("ghazal");
  const track = tracks[Math.floor(frame / 11) % tracks.length];

  return (
    <AbsoluteFill>
      <SceneLayer mode="ghazal" progress={frame / 55} camera={{ from: 1.0, drift: 6 }} />
      <AbsoluteFill style={{ zIndex: 6, justifyContent: "center", alignItems: "center" }}>
        <div style={{ transform: `scale(${1 + Math.min(1, frame / 55) * 0.18})` }}>
          <NowCardVertical
            mode="ghazal"
            title={track.title}
            artist={track.artist}
            progress={1}
            width={layout.boxes.nowCard.width}
            bodyFamily={fonts.body}
            monoFamily={fonts.mono}
          />
        </div>
        <div style={{ position: "absolute", left: layout.boxes.rail.x, top: layout.boxes.rail.y }}>
          <Rail
            text={FEATURE_RAIL[1]}
            progress={Math.min(1, frame / 12)}
            fontFamily={fonts.mono}
            fontSize={layout.type.rail}
            tracking={layout.type.railTracking}
            width={layout.boxes.rail.width}
            accent={modes.ghazal.accent}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

/** Feature 3: tap opens the playlist sheet. 55 frames. */
export function FeatureSheet({ layout, fonts }: { layout: Layout; fonts: ReelFonts }) {
  const rawFrame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const frame = (rawFrame / fps) * 30;
  const tap: Gesture = {
    kind: "tap",
    at: [layout.boxes.player.x + 300, layout.boxes.player.y + 40],
    startFrame: 2,
    durationInFrames: 12,
  };

  const sheetWidth = Math.min(1000, layout.width - 80);
  const sheetLeft = Math.max(40, (layout.width - sheetWidth) / 2);
  const sheetTop = layout.height > 1200 ? 700 : (layout.height > 900 ? 220 : 180);
  const sheetHeight = layout.height - sheetTop - 80;

  return (
    <AbsoluteFill>
      <SceneLayer mode="ghazal" progress={frame / 55} camera={{ from: 1.0, drift: 6 }} />
      <AbsoluteFill style={{ zIndex: 6 }}>
        <div style={{ position: "absolute", left: layout.boxes.rail.x, top: layout.safe.top }}>
          <Rail
            text={FEATURE_RAIL[2]}
            progress={Math.min(1, frame / 12)}
            fontFamily={fonts.mono}
            fontSize={layout.type.rail}
            tracking={layout.type.railTracking}
            width={layout.boxes.rail.width}
            accent={modes.ghazal.accent}
          />
        </div>
        <div style={{ position: "absolute", left: sheetLeft, top: sheetTop }}>
          <PlaylistSheetVertical
            heading={`प्लेलिस्ट · ${modes.ghazal.label}`}
            tracks={tracksFor("ghazal")}
            currentIndex={0}
            progress={Math.min(1, Math.max(0, (frame - 12) / 24))}
            accent={modes.ghazal.accent}
            width={sheetWidth}
            height={sheetHeight}
            bodyFamily={fonts.body}
            monoFamily={fonts.mono}
          />
        </div>
        <TouchCue gesture={tap} frame={frame} accent={modes.ghazal.accent} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

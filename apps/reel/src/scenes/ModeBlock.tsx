import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { modes, type PlaylistMode } from "@site/components/mockups/indian-playlist/IndianPlaylist";
import type { Layout } from "../layout";
import type { ReelFonts } from "../fonts";
import { MODE_RAIL } from "../copy";
import { SceneLayer } from "./SceneLayer";
import { RollBoard } from "../overlay/RollBoard";
import { HindiHero } from "../overlay/HindiHero";
import { Rail } from "../overlay/Rail";
import { NowCardVertical } from "../overlay/NowCardVertical";
import { PlayerBar } from "../overlay/PlayerBar";
import { TouchCue } from "../overlay/TouchCue";
import { choreographyFor } from "../lib/modeChoreography";
import { gestureState } from "../lib/gestures";
import { tracksFor } from "../lib/tracks";

export interface ModeBlockProps {
  mode: PlaylistMode;
  previousMode: PlaylistMode;
  layout: Layout;
  fonts: ReelFonts;
}

const BLOCK_FRAMES = 120;
const ROLL_FRAMES = 26;

/** One 4-second mode segment. Frame is local to the block (0..119). */
export function ModeBlock({ mode, previousMode, layout, fonts }: ModeBlockProps) {
  const rawFrame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const frame = (rawFrame / fps) * 30;
  const current = modes[mode];
  const chor = choreographyFor(mode, layout);
  const { boxes, type } = layout;

  const rollProgress = Math.min(1, frame / ROLL_FRAMES);
  const heroProgress = Math.min(1, Math.max(0, (frame - 16) / 44));
  const railProgress = Math.min(1, Math.max(0, (frame - 44) / 26));
  const cardProgress = Math.min(1, Math.max(0, (frame - 30) / 34));
  const sceneProgress = frame / BLOCK_FRAMES;

  // The scene follows the finger during a swipe, then releases.
  const swipe = chor.gestures.find((g) => g.kind === "swipe");
  const dragX = swipe
    ? (1 - Math.min(1, frame / (swipe.durationInFrames + 6))) * -70
    : 0;

  const isPlaying = chor.playFromFrame !== null && frame >= chor.playFromFrame;
  const shuffled = chor.shuffleFromFrame !== null && frame >= chor.shuffleFromFrame;

  // Only "play" | "shuffle" | "scrub" have a button on PlayerBar — "modeDot"
  // lives on the mode-dot nav, which this block doesn't render.
  const pressing = (() => {
    for (let i = 0; i < chor.gestures.length; i++) {
      const g = chor.gestures[i];
      const target = chor.targets[i];
      if (target !== "play" && target !== "shuffle" && target !== "scrub") continue;
      const s = gestureState(g, frame);
      if (s.pressed) return target;
    }
    return null;
  })();

  const drag = chor.gestures.find((g) => g.kind === "drag");
  const dragState = drag ? gestureState(drag, frame) : null;
  const fraction = dragState?.pressed
    ? 0.22 + dragState.progress * 0.44
    : 0.22 + (frame / BLOCK_FRAMES) * 0.1;

  const track = tracksFor(mode)[0] ?? { title: current.hindi, artist: current.label };

  return (
    <AbsoluteFill>
      <SceneLayer mode={mode} progress={sceneProgress} dragX={dragX} />

      <AbsoluteFill style={{ zIndex: 6 }}>
        <div style={{ position: "absolute", ...toStyle(boxes.rollBoard) }}>
          <RollBoard
            from={modes[previousMode].chip}
            to={current.chip}
            progress={rollProgress}
            accent={current.accent}
            width={boxes.rollBoard.width}
            height={boxes.rollBoard.height}
            fontFamily={fonts.body}
            fontSize={type.body}
          />
        </div>

        <div style={{ position: "absolute", ...toStyle(boxes.nowCard) }}>
          <NowCardVertical
            mode={mode}
            title={track.title}
            artist={track.artist}
            progress={cardProgress}
            width={boxes.nowCard.width}
            bodyFamily={fonts.body}
            monoFamily={fonts.mono}
          />
        </div>

        <div style={{ position: "absolute", ...toStyle(boxes.hero) }}>
          <HindiHero
            text={current.title}
            progress={heroProgress}
            fontFamily={fonts.display}
            fontSize={type.hero}
            width={boxes.hero.width}
          />
        </div>

        <div style={{ position: "absolute", ...toStyle(boxes.rail) }}>
          <Rail
            text={MODE_RAIL[mode]}
            progress={railProgress}
            fontFamily={fonts.mono}
            fontSize={type.rail}
            tracking={type.railTracking}
            width={boxes.rail.width}
            accent={current.accent}
          />
        </div>

        <div style={{ position: "absolute", ...toStyle(boxes.player) }}>
          <PlayerBar
            title={track.title}
            artist={track.artist}
            isPlaying={isPlaying}
            shuffled={shuffled}
            fraction={fraction}
            durationSeconds={214}
            accent={current.accent}
            width={boxes.player.width}
            bodyFamily={fonts.body}
            monoFamily={fonts.mono}
            pressing={pressing}
          />
        </div>

        {chor.gestures.map((g, i) => (
          <TouchCue key={i} gesture={g} frame={frame} accent={current.accent} />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

function toStyle(box: { x: number; y: number; width: number; height: number }) {
  return { left: box.x, top: box.y, width: box.width, height: box.height };
}

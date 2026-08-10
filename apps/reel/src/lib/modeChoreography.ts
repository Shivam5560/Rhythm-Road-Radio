import type { PlaylistMode } from "@site/components/mockups/indian-playlist/IndianPlaylist";
import type { Layout } from "../layout";
import type { Gesture } from "./gestures";

/** The on-screen control a gesture is meant to be operating. */
export type GestureTarget = "play" | "shuffle" | "scrub" | "modeDot" | null;

/** A gesture plus the control it drives, so ModeBlock never has to infer it. */
export interface ChoreographedGesture {
  gesture: Gesture;
  target: GestureTarget;
}

export interface ModeChoreography {
  gestures: Gesture[];
  /** Which control each entry in `gestures` (same index) is operating. */
  targets: GestureTarget[];
  /** Frame within the block at which playback visibly starts. */
  playFromFrame: number | null;
  /** Frame within the block at which shuffle lights up. */
  shuffleFromFrame: number | null;
}

/**
 * What the viewer's finger does during each 120-frame mode block. Every state
 * change in the reel is caused by one of these, so nothing appears to change
 * on its own.
 */
export function choreographyFor(mode: PlaylistMode, layout: Layout): ModeChoreography {
  const player = layout.boxes.player;
  const playButton: [number, number] = [player.x + 150, player.y + 108];
  const shuffleButton: [number, number] = [player.x + player.width - 150, player.y + 108];
  const scrubStart: [number, number] = [player.x + 380, player.y + 108];
  const scrubEnd: [number, number] = [player.x + 620, player.y + 108];
  const swipeY = layout.safe.top + 400;
  const swipeIn: Gesture = {
    kind: "swipe",
    from: [900, swipeY],
    to: [220, swipeY],
    startFrame: 0,
    durationInFrames: 18,
  };

  switch (mode) {
    case "driver":
      // Opening state — the reel is already here, so no swipe in.
      return build(
        [{ gesture: { kind: "tap", at: playButton, startFrame: 62, durationInFrames: 14 }, target: "play" }],
        { playFromFrame: 70, shuffleFromFrame: null },
      );
    case "rainy":
      return build([{ gesture: swipeIn, target: null }], { playFromFrame: 0, shuffleFromFrame: null });
    case "party":
      return build(
        [
          { gesture: swipeIn, target: null },
          { gesture: { kind: "tap", at: shuffleButton, startFrame: 74, durationInFrames: 14 }, target: "shuffle" },
        ],
        { playFromFrame: 0, shuffleFromFrame: 82 },
      );
    case "ghazal":
      return build(
        [
          { gesture: swipeIn, target: null },
          {
            gesture: { kind: "drag", from: scrubStart, to: scrubEnd, startFrame: 66, durationInFrames: 30 },
            target: "scrub",
          },
        ],
        { playFromFrame: 0, shuffleFromFrame: null },
      );
  }
}

function build(
  entries: ChoreographedGesture[],
  extra: { playFromFrame: number | null; shuffleFromFrame: number | null },
): ModeChoreography {
  return {
    gestures: entries.map((e) => e.gesture),
    targets: entries.map((e) => e.target),
    ...extra,
  };
}

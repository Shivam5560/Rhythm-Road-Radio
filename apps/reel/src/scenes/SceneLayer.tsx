import { AbsoluteFill } from "remotion";
import { SceneStage } from "@site/components/mockups/indian-playlist/Scene";
import type { PlaylistMode } from "@site/components/mockups/indian-playlist/IndianPlaylist";
import { modes } from "@site/components/mockups/indian-playlist/IndianPlaylist";
import "@site/components/mockups/indian-playlist/indian-playlist.css";
import { useCssAnimationSync } from "../lib/useCssAnimationSync";
import { cameraTransform, type CameraOptions } from "../lib/camera";

export interface SceneLayerProps {
  mode: PlaylistMode;
  /** 0..1 through the beat this scene belongs to. */
  progress: number;
  /** Horizontal offset in px while a swipe is being dragged. */
  dragX?: number;
  camera?: CameraOptions;
}

export function SceneLayer({ mode, progress, dragX = 0, camera }: SceneLayerProps) {
  useCssAnimationSync();
  const { scale, y } = cameraTransform(progress, camera);
  const current = modes[mode];

  return (
    <AbsoluteFill
      className={`indian-playlist mode-${mode}`}
      style={{
        padding: 0,
        height: "100%",
        // The mode tint the site sets inline, so the scrims and accents match.
        ["--mode-accent" as string]: current.accent,
        ["--mode-soft" as string]: current.soft,
      }}
    >
      {/* This transform is what gives `.scene-stage`'s `position: fixed`
          children a containing block, turning it into a camera. */}
      <AbsoluteFill style={{ transform: `translate3d(${dragX}px, ${y}px, 0) scale(${scale})` }}>
        <SceneStage mode={mode} />
        <div className="scene-scrim scene-scrim-left" />
        <div className="scene-scrim scene-scrim-edges" />
        <div className="grain" />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

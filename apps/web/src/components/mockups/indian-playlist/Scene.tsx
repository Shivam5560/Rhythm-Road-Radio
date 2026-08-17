// apps/reel imports SceneStage across the workspace and its tsconfig does not
// carry vite/client, so the asset-module declarations have to travel with this
// file rather than sit in apps/web's compiler options.
/// <reference types="vite/client" />
import { useEffect, useState } from "react";
import type { PlaylistMode } from "./IndianPlaylist";

/**
 * Full-bleed cinematic backdrops, one pre-rendered plate per mode.
 *
 * These replaced four hand-authored SVG scenes. The SVGs ran every silhouette
 * through an feTurbulence + feDisplacementMap pair across full-bleed 1600x900
 * paths, which the compositor re-rasterised continuously — that, stacked under
 * the chrome's backdrop-filters, was the source of the reported laginess. A
 * decoded raster costs one GPU upload and nothing per frame.
 *
 * The plates keep the camera language the SVGs established: eye-level, layered
 * depth, soft distant haze, and the left/upper-left third deliberately quiet so
 * the hero copy always lands on calm pixels. Prompts and sidecars that produced
 * them live in artifacts/plates/ — regenerate from there, don't repaint by hand.
 */

import driverPlate from "../../../assets/plates/driver.webp";
import rainyPlate from "../../../assets/plates/rainy.webp";
import partyPlate from "../../../assets/plates/party.webp";
import ghazalPlate from "../../../assets/plates/ghazal.webp";

export const plates: Record<PlaylistMode, string> = {
  driver: driverPlate,
  rainy: rainyPlate,
  party: partyPlate,
  ghazal: ghazalPlate,
};

/**
 * Per-mode ambience, layered over the active plate.
 *
 * Hard rule: these animate `transform` and `opacity` only, so every one of them
 * runs on the compositor and never triggers layout or paint. That is the whole
 * reason the SVG scenes were replaced — putting per-frame CPU work back over
 * the plates would undo the fix. No filters, no box-shadow animation, no
 * backdrop-filter, and no thousand-node particle systems: each effect is two or
 * three repeating-gradient layers translated by exactly one tile, which loops
 * seamlessly and costs the GPU almost nothing.
 */
function Ambience({ mode }: { mode: PlaylistMode }) {
  if (mode === "rainy") {
    return (
      <>
        <div className="fx fx-rain fx-rain-far" />
        <div className="fx fx-rain fx-rain-near" />
      </>
    );
  }
  if (mode === "driver") {
    return (
      <>
        <div className="fx fx-snow fx-snow-far" />
        <div className="fx fx-snow fx-snow-mid" />
        <div className="fx fx-snow fx-snow-near" />
      </>
    );
  }
  if (mode === "party") {
    // The bonfire glow is one layer; the strung bulbs are three, split by
    // colour so each group can twinkle on its own clock. One layer could not
    // do it — a single background-image can only fade as a whole.
    return (
      <>
        <div className="fx fx-glow fx-glow-fire" />
        <div className="fx fx-bulbs fx-bulbs-amber" />
        <div className="fx fx-bulbs fx-bulbs-rose" />
        <div className="fx fx-bulbs fx-bulbs-cyan" />
      </>
    );
  }
  // Ghazal: an overnight bus that is actually moving. The berth lamp swells,
  // dust drifts up through its pool, and every few seconds a roadside lamp
  // sweeps across the window — the one cue that says the bus has not stopped.
  return (
    <>
      <div className="fx fx-lamp" />
      <div className="fx fx-motes" />
      <div className="fx fx-sweep" />
    </>
  );
}

export function SceneStage({ mode }: { mode: PlaylistMode }) {
  // Only the modes actually visited get mounted, so a first paint pulls one
  // plate rather than all four. Once mounted a layer stays, so returning to a
  // mode crossfades against an already-decoded image instead of flashing.
  const [mounted, setMounted] = useState<PlaylistMode[]>([mode]);
  useEffect(() => {
    setMounted((seen) => (seen.includes(mode) ? seen : [...seen, mode]));
  }, [mode]);

  return (
    <div className="scene-stage" aria-hidden="true">
      {mounted.map((key) => (
        <div
          key={key}
          className={`scene-plate scene-plate-${key} ${key === mode ? "is-active" : ""}`}
          style={{ backgroundImage: `url(${plates[key]})` }}
        />
      ))}
      {/* Only the active mode's ambience is mounted, so nothing animates
          off-screen behind a faded-out plate. */}
      <Ambience mode={mode} />
    </div>
  );
}

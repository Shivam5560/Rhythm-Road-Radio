import { AbsoluteFill } from "remotion";
import { SceneStage } from "@site/components/mockups/indian-playlist/Scene";
import { modes } from "@site/components/mockups/indian-playlist/IndianPlaylist";
import "@site/components/mockups/indian-playlist/indian-playlist.css";
import { loadReelFonts } from "./fonts";

const fonts = loadReelFonts();

/** Throwaway composition proving fonts, the `@site` alias and SVG art all work. */
export function Probe() {
  return (
    <AbsoluteFill className="indian-playlist mode-driver" style={{ padding: 0 }}>
      <SceneStage mode="driver" />
      <AbsoluteFill style={{ zIndex: 5, justifyContent: "flex-end", padding: 80 }}>
        <h1 style={{ fontFamily: fonts.display, fontSize: 96, lineHeight: 1.1, color: "#fff4e8", margin: 0 }}>
          {modes.driver.title}
        </h1>
        <p style={{ fontFamily: fonts.body, fontSize: 34, color: modes.driver.accent, margin: "16px 0 0" }}>
          {modes.driver.chip}
        </p>
        <p style={{ fontFamily: fonts.mono, fontSize: 26, letterSpacing: 4, color: "#fff4e8", margin: "24px 0 0" }}>
          MOUNTAIN HIGHWAY. WINDOWS DOWN.
        </p>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

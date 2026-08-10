import { loadFont as loadYatra } from "@remotion/google-fonts/YatraOne";
import { loadFont as loadNoto } from "@remotion/google-fonts/NotoSansDevanagari";
import { loadFont as loadMono } from "@remotion/google-fonts/DMMono";

export interface ReelFonts {
  display: string;
  body: string;
  mono: string;
}

/**
 * The site loads these three faces through a remote CSS `@import`, which races
 * Remotion's first frame and silently falls back. Loading them here instead
 * blocks rendering until the faces are actually available.
 */
export function loadReelFonts(): ReelFonts {
  const yatra = loadYatra("normal", { weights: ["400"], subsets: ["devanagari", "latin"] });
  const noto = loadNoto("normal", { weights: ["400", "500", "600", "700"], subsets: ["devanagari"] });
  const mono = loadMono("normal", { weights: ["400", "500"], subsets: ["latin"] });
  return {
    display: yatra.fontFamily,
    body: noto.fontFamily,
    mono: mono.fontFamily,
  };
}

import type { PlaylistMode } from "@site/components/mockups/indian-playlist/IndianPlaylist";

/**
 * Every English line that appears in the reel. Single source of truth so the
 * wording can be revised without touching a component.
 *
 * Constraints enforced by copy.test.ts: upper case, 40 characters or fewer,
 * and no ad-free claim — the YouTube iframe can serve ads.
 */

export const HOOK_RAIL = "FOUR MOODS. ONE ENDLESS ROAD.";

export const MODE_RAIL: Record<PlaylistMode, string> = {
  driver: "MOUNTAIN HIGHWAY. WINDOWS DOWN.",
  rainy: "MONSOON NIGHT. WET STREETS.",
  party: "GOA SUNSET. BONFIRE ON THE SAND.",
  ghazal: "NIGHT BUS. LAMP-LIT MEHFIL.",
};

export const FEATURE_RAIL: [string, string, string] = [
  "SWIPE. THE WORLD CHANGES.",
  "EVERY TRACK NAMED BY HAND.",
  "THE WHOLE PLAYLIST, ONE TAP.",
];

export const CTA_RAIL = "NO SIGN-UP. JUST PRESS PLAY.";
export const CTA_URL = "rastaradio.tech";

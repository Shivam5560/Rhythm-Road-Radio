import type { PlaylistMode } from "@site/components/mockups/indian-playlist/IndianPlaylist";
import type { TrackMap } from "@site/lib/trackMetadata";
import { driverTracks } from "@site/data/tracks.driver";
import { rainyTracks } from "@site/data/tracks.rainy";
import { partyTracks } from "@site/data/tracks.party";
import { ghazalTracks } from "@site/data/tracks.ghazal";

export interface ReelTrack {
  title: string;
  artist: string;
}

const BY_MODE: Record<PlaylistMode, TrackMap> = {
  driver: driverTracks,
  rainy: rainyTracks,
  party: partyTracks,
  ghazal: ghazalTracks,
};

/**
 * The mode's hand-curated Devanagari track list, in map order. These are the
 * real names shown on the site — the reel never invents a track.
 */
export function tracksFor(mode: PlaylistMode): ReelTrack[] {
  return Object.values(BY_MODE[mode]).map((t) => ({ title: t.title, artist: t.artist }));
}

import type { TrackMap } from "../lib/trackMetadata";

/**
 * Hand-curated Hindi title/artist overrides for the बस ड्राइवर playlist,
 * keyed by YouTube video ID. Anything not listed here falls back to a
 * cleaned-up version of its live YouTube title/channel automatically (see
 * resolveTrackMetadata in trackMetadata.ts) — an empty map is a valid,
 * fully working state.
 *
 * To add entries, run:
 *   pnpm --filter @workspace/scripts run fetch-playlist -- \
 *     "https://music.youtube.com/playlist?list=PL0umg_TNpoZTTdZVIi5tfX69pRmoMFGna" \
 *     /tmp/driver-tracks.json
 * then transliterate each { videoId, rawTitle, rawChannel } entry into
 * Devanagari and add it below.
 */
export const driverTracks: TrackMap = {};

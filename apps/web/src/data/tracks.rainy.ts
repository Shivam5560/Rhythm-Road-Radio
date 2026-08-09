import type { TrackMap } from "../lib/trackMetadata";

/**
 * Hand-curated Hindi title/artist overrides for the बारिश का मौसम playlist,
 * keyed by YouTube video ID. See tracks.driver.ts for the fallback
 * behaviour and generation workflow.
 *
 *   pnpm --filter @workspace/scripts run fetch-playlist -- \
 *     "https://music.youtube.com/playlist?list=PL43tsEhYIdTuf-xO_4ZrZtRp1dwulm2SQ" \
 *     /tmp/rainy-tracks.json
 */
export const rainyTracks: TrackMap = {};

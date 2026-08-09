import type { TrackMap } from "../lib/trackMetadata";

/**
 * Hand-curated Hindi title/artist overrides for the ग़ज़ल मोड playlist,
 * keyed by YouTube video ID. See tracks.driver.ts for the fallback
 * behaviour and generation workflow.
 *
 *   pnpm --filter @workspace/scripts run fetch-playlist -- \
 *     "https://music.youtube.com/playlist?list=PL43tsEhYIdTvnK96MqsVkXV90fQFcsdoN" \
 *     /tmp/ghazal-tracks.json
 */
export const ghazalTracks: TrackMap = {};

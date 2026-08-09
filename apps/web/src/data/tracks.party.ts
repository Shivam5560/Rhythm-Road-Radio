import type { TrackMap } from "../lib/trackMetadata";

/**
 * Hand-curated Hindi title/artist overrides for the पार्टी मोड playlist,
 * keyed by YouTube video ID. See tracks.driver.ts for the fallback
 * behaviour and generation workflow.
 *
 *   pnpm --filter @workspace/scripts run fetch-playlist -- \
 *     "https://music.youtube.com/playlist?list=PLfcRxVaMQ7ZM" \
 *     /tmp/party-tracks.json
 */
export const partyTracks: TrackMap = {};

export type TrackInfo = { title: string; artist: string };
export type TrackMap = Record<string, TrackInfo>;

const CLUTTER_PATTERNS: RegExp[] = [
  /\(official\s*(video|audio|lyric video|music video)\)/gi,
  /\[official\s*(video|audio|lyric video|music video)\]/gi,
  /\|\s*t-series/gi,
  /\|\s*zee music company/gi,
  /\(lyrical\)/gi,
  /\[lyrics?\]/gi,
];

export function cleanTitle(rawTitle: string): string {
  let cleaned = rawTitle;
  for (const pattern of CLUTTER_PATTERNS) {
    cleaned = cleaned.replace(pattern, "");
  }
  return cleaned.replace(/\s{2,}/g, " ").trim();
}

export function cleanAuthor(rawAuthor: string): string {
  return rawAuthor.replace(/\s*-\s*Topic$/i, "").trim();
}

export function resolveTrackMetadata(
  videoId: string,
  curated: TrackMap,
  liveTitle: string,
  liveAuthor: string,
): TrackInfo {
  const curatedEntry = curated[videoId];
  if (curatedEntry) return curatedEntry;
  return { title: cleanTitle(liveTitle), artist: cleanAuthor(liveAuthor) };
}

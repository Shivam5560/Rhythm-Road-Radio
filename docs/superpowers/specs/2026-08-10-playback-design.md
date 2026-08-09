# Rhythm Road Radio — Playback Design

Status: approved by user, 2026-08-10
Scope: turn the four-mode `IndianPlaylist` mock into a real, playable single-page site.

## Context

`IndianPlaylist.tsx` / `Scene.tsx` / `indian-playlist.css` currently exist only inside `artifacts/mockup-sandbox`, a Vite preview harness meant for design iteration — it is not a deployable site, and the "songs" it shows are 6 hardcoded fake tracks shared across all four modes.

The user has four real, public YouTube/YouTube Music playlists, one per mode, verified by loading each directly:

| Mode | Playlist name | Owner | Playlist ID | Size |
|---|---|---|---|---|
| driver (बस ड्राइवर) | Indian Bus Driver's Playlist | Kunal Baidya (third-party) | `PL0umg_TNpoZTTdZVIi5tfX69pRmoMFGna` | 77 videos |
| rainy (बारिश का मौसम) | Rain | Shivam 🚀 (user) | `PL43tsEhYIdTuf-xO_4ZrZtRp1dwulm2SQ` | 148 videos |
| party (पार्टी मोड) | 2000s Dance | Shivam 🚀 (user) | `PLfcRxVaMQ7ZM` | 94 videos |
| ghazal (ग़ज़ल मोड) | Slow | Shivam 🚀 + 1 other | `PL43tsEhYIdTvnK96MqsVkXV90fQFcsdoN` | 90 videos |

Reference precedent: saloon.wtf, cited by the user as prior art, was inspected directly (DOM/script/iframe inspection, not assumed). It loads the official YouTube IFrame Player API (`youtube.com/iframe_api`, `window.YT` global) and drives a real `<iframe>` YouTube player wrapped in a visually-hidden container (`position:absolute; width:1px; height:1px; overflow:hidden; opacity:0; pointer-events:none` — not `display:none`, which can pause media in some browsers), with a fully custom UI on top. No `<audio>`/`<video>` tags, no Spotify SDK despite a "Spotify" link — that link is just an outbound link, not in-browser playback. This is the confirmed, adopted mechanism.

## Decisions made during design

- **No backend for v1.** The existing Express API (`artifacts/api-server`) and Postgres/Drizzle setup (`lib/db`) are not touched. YouTube's IFrame Player API handles playback entirely client-side; nothing needs to be streamed or stored server-side. Nothing persists across a page reload (mode, volume, shuffle state all reset).
- **New real app package**, not a repurposed sandbox. `apps/web` (new pnpm workspace package, Vite + React + TS) becomes the actual deployable site. `Scene.tsx`, `IndianPlaylist.tsx`, `indian-playlist.css` are **copied** (not moved) from `mockup-sandbox` into `apps/web/src` as the starting point. From that point on, `apps/web` carries live playback logic; `mockup-sandbox`'s copy stays a frozen visual mock for future design iteration, untouched by this work.
- **Single page, no router.** `apps/web` renders exactly one component tree — `IndianPlaylist` — as the entire app. No client-side routing, no secondary pages.
- **Hybrid metadata: static Hindi file with live fallback**, not a backend-driven database and not fully live-only. See "Track metadata" below.
- **Shuffle**: added as a real feature (see "Shuffle").

## Playback engine

A single hook, `useYouTubePlayer(playlistId: string)`, owns all YouTube interaction. Lives in `apps/web/src/hooks/useYouTubePlayer.ts`.

**Hidden player.** Injects the `https://www.youtube.com/iframe_api` script once (guarded so it only loads once even if the hook re-renders), waits for `window.onYouTubeIframeAPIReady`, then constructs one `YT.Player` instance inside a div using the saloon.wtf visually-hidden pattern described above. The player instance is created once and persists for the life of the app — mode switches call `loadPlaylist()` on the same instance rather than destroying/recreating it.

**Playlist-native — no manual track list.** Loaded via:

```js
player.cuePlaylist({ listType: "playlist", list: playlistId });
```

The player itself enumerates the real, live playlist (77–148 videos per mode). The app never fetches or stores a track list for playback purposes. `next()` / `previous()` map to `player.nextVideo()` / `player.previousVideo()` in non-shuffle mode.

**Live "now playing" data.** On every `onStateChange` event, read `player.getVideoData()` → `{ video_id, title, author }`. This feeds both the metadata-lookup path (below) and the progress/state UI.

**Progress.** A `setInterval` (~500ms, running only while `playerState === PLAYING`) reads `player.getCurrentTime()` / `player.getDuration()` to drive the progress bar and elapsed/total timestamps, replacing the current hardcoded `"01:24" / "03:26"`.

**Controls exposed by the hook:**

```ts
{
  title: string;        // resolved via metadata lookup, see below
  artist: string;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  shuffled: boolean;
  play(): void;
  pause(): void;
  next(): void;
  previous(): void;
  toggleShuffle(): void;
  setVolume(v: number): void;  // 0-100, matches existing UI range
}
```

**Errors.** `onError` (e.g. the 2 already-unavailable videos in the Bus Driver playlist) triggers an automatic `next()` rather than surfacing an error state to the listener.

**Mode switch.** Swiping / dots / edge chevrons change `mode` state in `IndianPlaylist`; an effect calls `player.loadPlaylist(modes[mode].playlistId)` on the existing player instance. Playback continues (autoplaying into the new mode) once the listener has already granted the autoplay gesture (see below) — before that, a mode switch cues but does not play.

## Shuffle

- A shuffle toggle in the player bar, next to repeat.
- **On:** `next()` calls `player.getPlaylist()` (returns the array of video IDs for the currently loaded playlist), picks a random index other than the current one, and calls `player.playVideoAt(index)`. A small in-memory stack records shuffle history so `previous()` can step back through what was actually just played, rather than jumping to native playlist order.
- **Off:** `next()`/`previous()` fall back to `player.nextVideo()`/`player.previousVideo()` (native playlist order) — today's behavior.
- Shuffle state is component state only; it does not persist across reload (consistent with "no backend").

## Track metadata (Hindi, static, code-maintained)

A static TypeScript file per mode under `apps/web/src/data/`, e.g. `tracks.driver.ts`, `tracks.rainy.ts`, `tracks.party.ts`, `tracks.ghazal.ts`, each exporting a `Record<videoId, { title: string; artist: string }>` in Devanagari:

```ts
export const driverTracks: Record<string, { title: string; artist: string }> = {
  "dQw4w9WgXcQ": { title: "एक पल का जीना", artist: "लकी अली" },
  // ...
};
```

**Resolution order at runtime:** when `useYouTubePlayer` reads a new `video_id` from `onStateChange`, look it up in the current mode's static map first.
- **Found** → use the curated Hindi `title`/`artist`.
- **Not found** (a song added to the YouTube playlist since the last code release) → fall back to the live `getVideoData()` title/author, run through a light cleanup pass (strip trailing `" - Topic"` from author; strip common clutter like `"(Official Video)"`, `"| T-Series"`, `"[Official Audio]"` from title via a short regex list). Nothing ever renders blank or breaks.

**Release model:** when the user adds songs to a YouTube playlist, they (or a future session) add corresponding entries to the relevant `tracks.*.ts` file and ship a new build. No database, no admin UI, no backend — exactly the workflow the user asked for.

**Generating the first pass.** The browser player only exposes the *currently playing* video's metadata, not the full playlist up front, so the static files can't be generated by driving the embedded player. The practical approach: run `yt-dlp --flat-playlist -J <playlist-url>` locally (no API key required) to dump each playlist's real video IDs + titles as JSON, then transliterate each into Devanagari as a first-pass draft for the user to review/correct. Most entries are Bollywood song titles already Hindi in substance, just Latin-scripted on YouTube (e.g. "Ek Pal Ka Jeena" → "एक पल का जीना" is close to mechanical transliteration), so a real first draft is achievable, not just a TODO stub. This is ~409 entries across 4 files — called out as its own chunk of implementation work, separate from the playback engineering, given its size.

## UI integration

`IndianPlaylist.tsx` (in `apps/web`) drops the hardcoded `songs` array and `activeIndex` state entirely. Instead:

```ts
const player = useYouTubePlayer(modes[mode].playlistId);
```

`NowCard` and the footer player bar render from `player`'s live fields instead of the mock array — same visual components already built and approved, now fed real data. The mode → playlist ID mapping is a plain constant added to the existing `modes` record (one new field, `playlistId`).

## Autoplay & first interaction

Browsers block audio autoplay until a real user gesture. On load, the player is created and cues the default mode's playlist but does **not** play — the footer shows a "play" icon, not "pause" (a behavior change from today's mock, which defaults `playing: true`). The first tap on the play button is the gesture that unlocks audio for the rest of the session; mode switches after that can autoplay freely.

## Explicitly out of scope for v1

- No backend/persistence of any kind — mode, volume, and shuffle all reset on reload.
- No admin UI for editing track metadata — it's a checked-in source file, edited and shipped like code.
- `mockup-sandbox`'s copy of these components is not wired to real playback; it remains a visual-only mock.

## Testing / verification approach

Because this depends on real external content (live YouTube embeds, playlist data, autoplay policy), verification happens in an actual browser against the dev server for `apps/web`: click through all four modes, confirm playback actually starts on first interaction, confirm next/previous/shuffle/volume work, confirm mode switching loads the correct new playlist, and spot-check title-cleanup/metadata-lookup rendering against a sample of real tracks from each playlist (including at least one video ID deliberately absent from the static map, to confirm the live-fallback path renders correctly).

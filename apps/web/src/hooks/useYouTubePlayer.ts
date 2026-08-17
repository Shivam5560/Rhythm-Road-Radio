import { useEffect, useReducer, useRef, useState } from "react";
import { playerReducer, initialPlayerState } from "./playerReducer";
import { pickShuffleIndex, ShuffleHistory } from "../lib/shuffle";
import { resolveTrackMetadata, type TrackMap } from "../lib/trackMetadata";

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const YT_PLAYING = 1;

// A requested playlist swap is confirmed (or given up on) by polling, see the
// switch effect below for why we can't just trust the API call to have worked.
const SWITCH_POLL_MS = 700;
const SWITCH_MAX_POLLS = 12;
const SWITCH_RETRY_EVERY = 4;
const SWITCH_WEDGED_POLLS = 3;
// How many leading playlist entries we'll skip past when YouTube refuses to
// open a list because its entry video isn't embeddable.
const MAX_ENTRY_SKIPS = 6;

let apiLoadPromise: Promise<void> | null = null;

function loadYouTubeIframeApi(): Promise<void> {
  if (apiLoadPromise) return apiLoadPromise;
  apiLoadPromise = new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve();
      return;
    }
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      resolve();
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(script);
  });
  return apiLoadPromise;
}

// getPlaylistId() is NOT a usable "which list is loaded" signal: it echoes back
// whatever list was last *requested*, even when the player silently ignored the
// request. The playlist array is the only thing that reflects reality.
// Returns "" when the player has no list at all — which happens both mid-load
// and when a failed swap has wedged the instance, so "" means "unknown", never
// "changed".
function playlistFingerprint(player: any): string {
  const list: unknown = player?.getPlaylist?.();
  if (!Array.isArray(list) || list.length === 0) return "";
  return `${list.length}:${list[0] ?? ""}`;
}

export function useYouTubePlayer(playlistId: string, trackMap: TrackMap) {
  const [state, dispatch] = useReducer(playerReducer, initialPlayerState);
  const playerRef = useRef<any>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const historyRef = useRef(new ShuffleHistory());
  const shuffledRef = useRef(false);
  // The playlist the UI currently wants. Kept in a ref so async callbacks
  // (polls, onReady) can tell whether they've been superseded by a later swipe.
  const desiredPlaylistIdRef = useRef(playlistId);
  desiredPlaylistIdRef.current = playlistId;
  // The playlist we have *confirmed* is loaded in the live player. Only written
  // once the player's own playlist array proves the swap landed — never
  // optimistically, or a dropped swap would be recorded as a success and never
  // retried.
  const loadedPlaylistIdRef = useRef<string | null>(null);
  // Bumped for every player instance we build. Events from a torn-down
  // instance can still arrive, so callbacks check their generation is current
  // rather than comparing against playerRef (which isn't assigned yet while
  // the constructor is still running).
  const generationRef = useRef(0);
  const volumeRef = useRef<number | null>(null);
  // Volume to restore after an accent has ducked the music, and the timer that
  // does it. Refs, not state — nothing renders off them.
  const duckedFromRef = useRef<number | null>(null);
  const duckTimerRef = useRef<number | null>(null);
  const [isReady, setIsReady] = useState(false);

  // A YT.Player object exists the instant the constructor returns, but its API
  // methods are only attached once the iframe is ready. Between a rebuild and
  // the new instance's onReady, every call must tolerate their absence.
  function call<T = unknown>(method: string, ...args: unknown[]): T | undefined {
    const player = playerRef.current;
    const fn = player?.[method];
    if (typeof fn !== "function") return undefined;
    return fn.apply(player, args) as T;
  }

  function advanceShuffled() {
    const player = playerRef.current;
    if (typeof player?.playVideoAt !== "function") return;
    const playlist: string[] = player.getPlaylist?.() ?? [];
    const currentIndex = player.getPlaylistIndex?.() ?? 0;
    if (playlist.length === 0) return;
    // ShuffleHistory.popPrevious() treats the top of the stack as "current" —
    // seed it with where we're leaving from the first time we shuffle, then
    // always push the track we're arriving at so the top stays accurate.
    if (historyRef.current.length === 0) {
      historyRef.current.push(currentIndex);
    }
    const nextIndex = pickShuffleIndex(playlist.length, currentIndex);
    historyRef.current.push(nextIndex);
    player.playVideoAt(nextIndex);
  }

  // Builds a player whose playlist is baked into playerVars. This is the only
  // fully reliable way to get a given list into a player instance, so it is
  // used both for the initial mount and to rebuild on a swap the live player
  // refuses (see the switch effect).
  function buildPlayer(mountPoint: HTMLElement, listId: string, autoplay = false, startIndex = 0) {
    const generation = (generationRef.current += 1);
    const isCurrent = () => generationRef.current === generation;

    // A freshly built player cues its first video without ever emitting an
    // onStateChange, so after a rebuild the UI would keep showing the outgoing
    // mode's track until playback starts. Poll getVideoData() until populated.
    const publishVideoData = (player: any, attempt = 0) => {
      if (!isCurrent()) return;
      const data = player.getVideoData?.();
      if (data?.video_id) {
        dispatch({
          type: "YT_STATE_CHANGE",
          ytState: player.getPlayerState?.() ?? -1,
          videoId: data.video_id,
          rawTitle: data.title ?? "",
          rawAuthor: data.author ?? "",
        });
        return;
      }
      if (attempt >= 12) return;
      window.setTimeout(() => publishVideoData(player, attempt + 1), 300);
    };

    return new window.YT!.Player(mountPoint, {
      height: "360",
      width: "640",
      playerVars: { listType: "playlist", list: listId, index: startIndex, playsinline: 1 },
      events: {
        onReady: (event: any) => {
          if (!isCurrent()) return;
          loadedPlaylistIdRef.current = listId;
          if (volumeRef.current !== null) event.target.setVolume(volumeRef.current);
          if (autoplay) event.target.playVideo();
          publishVideoData(event.target);
          setIsReady(true);
        },
        onStateChange: (event: any) => {
          if (!isCurrent()) return;
          const data = event.target.getVideoData();
          dispatch({
            type: "YT_STATE_CHANGE",
            ytState: event.data,
            videoId: data.video_id ?? "",
            rawTitle: data.title ?? "",
            rawAuthor: data.author ?? "",
          });
          if (event.data === 0 && shuffledRef.current) {
            advanceShuffled();
          }
        },
        onError: (event: any) => {
          if (!isCurrent()) return;
          const list = event.target.getPlaylist?.();
          if (Array.isArray(list) && list.length > 0) {
            // Normal case: one bad video inside a loaded list — skip it.
            event.target.nextVideo();
            return;
          }
          // The list never loaded at all. YouTube hard-fails an entire playlist
          // when the entry video can't be embedded (error 150) rather than
          // skipping it, leaving the instance dead with no playlist. The only
          // way past it is a fresh player that starts at a later index.
          if (startIndex >= MAX_ENTRY_SKIPS) return;
          // Deferred: don't destroy the player from inside its own callback.
          window.setTimeout(() => {
            if (!isCurrent()) return;
            rebuildPlayer(listId, autoplay, startIndex + 1);
          }, 0);
        },
      },
    });
  }

  // Throws the current instance away and stands up a fresh one holding
  // `listId` — the only swap that always works. playerVars cues the list
  // without autoplaying, so a paused/never-started player stays quiet;
  // `resumePlayback` re-starts it for a swap that interrupted live playback.
  function rebuildPlayer(listId: string, resumePlayback = false, startIndex = 0) {
    const host = hostRef.current;
    if (!host || !window.YT?.Player) return;
    playerRef.current?.destroy?.();
    playerRef.current = null;
    host.replaceChildren();
    const mountPoint = document.createElement("div");
    host.appendChild(mountPoint);
    setIsReady(false);
    playerRef.current = buildPlayer(mountPoint, listId, resumePlayback, startIndex);
  }

  // create the hidden player once, for the life of the component
  useEffect(() => {
    let cancelled = false;
    const host = document.createElement("div");
    host.style.position = "absolute";
    host.style.width = "1px";
    host.style.height = "1px";
    host.style.overflow = "hidden";
    host.style.opacity = "0";
    host.style.pointerEvents = "none";
    document.body.appendChild(host);
    hostRef.current = host;
    const mountPoint = document.createElement("div");
    host.appendChild(mountPoint);

    loadYouTubeIframeApi().then(() => {
      if (cancelled) return;
      // Use whatever mode is current by the time the API finishes loading, not
      // the one captured at mount — the user may already have swiped away.
      playerRef.current = buildPlayer(mountPoint, desiredPlaylistIdRef.current);
    });

    return () => {
      cancelled = true;
      generationRef.current += 1;
      playerRef.current?.destroy?.();
      playerRef.current = null;
      hostRef.current?.remove();
      hostRef.current = null;
    };
    // Intentionally runs once: initial mount only. Mode/playlist changes are
    // handled by the switch effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Switch playlists on mode change.
  //
  // Verified live against the real IFrame API, because both of the obvious
  // calls are booby-trapped:
  //
  //  * cuePlaylist() NEVER swaps the list on an existing instance. It updates
  //    getPlaylistId(), drops the player into CUED on the *outgoing* video, and
  //    strands the instance with an empty getPlaylist() from which even a
  //    subsequent loadPlaylist() cannot recover. It must not be used here.
  //  * loadPlaylist() does swap the list, but only while the player is actually
  //    PLAYING. Issued from UNSTARTED/CUED/PAUSED it is swallowed and merely
  //    starts/resumes the video that is already loaded — which is exactly the
  //    "playback stuck on the outgoing video" behaviour previously blamed on
  //    loadPlaylist itself.
  //
  // So: swap in place only while playing, and rebuild the instance otherwise.
  // Even on the playing path the call is occasionally dropped (notably when a
  // previous load is still settling), so the swap is polled for confirmation,
  // re-issued, and finally escalated to a rebuild.
  //
  // `isReady` is a dependency (not just a ref check) so mode swipes that land
  // before the player exists aren't silently lost: this re-runs once the player
  // becomes ready and catches up to whatever mode is current by then.
  useEffect(() => {
    if (!isReady) return;
    const player = playerRef.current;
    if (!player) return;
    if (loadedPlaylistIdRef.current === playlistId) return;

    historyRef.current.clear();
    dispatch({ type: "SWITCH_START" });

    // Whether the *user* is listening. Buffering counts: swiping while the
    // outgoing track is still loading must not drop them into a stopped player.
    const shouldKeepPlaying = state.status === "playing" || state.status === "buffering";

    if (player.getPlayerState?.() !== YT_PLAYING) {
      rebuildPlayer(playlistId, shouldKeepPlaying);
      return;
    }

    const outgoing = playlistFingerprint(player);
    const load = () =>
      call("loadPlaylist", { listType: "playlist", list: playlistId, index: 0, startSeconds: 0 });
    load();

    let polls = 0;
    let emptyPolls = 0;
    const timer = window.setInterval(() => {
      const live = playerRef.current;
      // Superseded by a newer swipe, or the player went away: stop.
      if (!live || desiredPlaylistIdRef.current !== playlistId) {
        window.clearInterval(timer);
        return;
      }
      const current = playlistFingerprint(live);
      if (current && current !== outgoing) {
        loadedPlaylistIdRef.current = playlistId;
        window.clearInterval(timer);
        return;
      }
      polls += 1;
      // An empty playlist that persists means the load wedged the instance —
      // it never recovers, not even from another loadPlaylist(), so escalate
      // straight to a rebuild instead of burning the full retry budget.
      emptyPolls = current === "" ? emptyPolls + 1 : 0;
      if (emptyPolls >= SWITCH_WEDGED_POLLS || polls >= SWITCH_MAX_POLLS) {
        window.clearInterval(timer);
        rebuildPlayer(playlistId, true);
        return;
      }
      if (polls % SWITCH_RETRY_EVERY === 0) load();
    }, SWITCH_POLL_MS);

    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlistId, isReady]);

  // progress ticker while playing
  useEffect(() => {
    if (state.status !== "playing") return;
    const interval = window.setInterval(() => {
      const currentTime = call<number>("getCurrentTime");
      const duration = call<number>("getDuration");
      if (currentTime === undefined || duration === undefined) return;
      dispatch({ type: "TICK", currentTime, duration });
    }, 500);
    return () => window.clearInterval(interval);
  }, [state.status]);

  function next() {
    if (state.shuffled) {
      advanceShuffled();
    } else {
      call("nextVideo");
    }
  }

  function previous() {
    if (state.shuffled) {
      const target = historyRef.current.popPrevious();
      if (target !== null) {
        call("playVideoAt", target);
        return;
      }
    }
    call("previousVideo");
  }

  function toggleShuffle() {
    shuffledRef.current = !shuffledRef.current;
    dispatch({ type: "TOGGLE_SHUFFLE" });
  }

  function seekTo(seconds: number) {
    if (typeof playerRef.current?.seekTo !== "function") return;
    const duration = call<number>("getDuration") ?? 0;
    const target = Math.min(Math.max(seconds, 0), duration || Infinity);
    call("seekTo", target, true);
    dispatch({ type: "TICK", currentTime: target, duration });
  }

  const track = resolveTrackMetadata(state.videoId ?? "", trackMap, state.rawTitle, state.rawAuthor);

  return {
    title: track.title,
    artist: track.artist,
    videoId: state.videoId,
    isSwitching: state.switching,
    isPlaying: state.status === "playing",
    currentTime: state.currentTime,
    duration: state.duration,
    shuffled: state.shuffled,
    play: () => call("playVideo"),
    pause: () => call("pauseVideo"),
    next,
    previous,
    seekTo,
    toggleShuffle,
    setVolume: (v: number) => {
      // Remembered so a rebuilt instance comes back at the same volume.
      volumeRef.current = v;
      call("setVolume", v);
    },
    /**
     * Pull the music down for `ms` while a one-shot accent sounds over it, then
     * let it back up. Reads the live volume rather than the remembered one,
     * because the user may never have touched the slider. Overlapping calls
     * extend the duck instead of stacking, so mashing the button does not
     * leave the music stuck quiet.
     */
    duckFor: (ms: number) => {
      const live = call<number>("getVolume");
      if (typeof live !== "number") return;
      if (duckedFromRef.current === null) duckedFromRef.current = live;
      call("setVolume", Math.round(duckedFromRef.current * 0.4));
      if (duckTimerRef.current) window.clearTimeout(duckTimerRef.current);
      duckTimerRef.current = window.setTimeout(() => {
        if (duckedFromRef.current !== null) call("setVolume", duckedFromRef.current);
        duckedFromRef.current = null;
        duckTimerRef.current = null;
      }, ms + 140);
    },
    getQueue: (): string[] => {
      const list = call<string[]>("getPlaylist");
      return Array.isArray(list) ? list : [];
    },
    playIndex: (index: number) => call("playVideoAt", index),
  };
}

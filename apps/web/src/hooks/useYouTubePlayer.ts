import { useEffect, useReducer, useRef } from "react";
import { playerReducer, initialPlayerState } from "./playerReducer";
import { pickShuffleIndex, ShuffleHistory } from "../lib/shuffle";
import { resolveTrackMetadata, type TrackMap } from "../lib/trackMetadata";

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

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

export function useYouTubePlayer(playlistId: string, trackMap: TrackMap) {
  const [state, dispatch] = useReducer(playerReducer, initialPlayerState);
  const playerRef = useRef<any>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const historyRef = useRef(new ShuffleHistory());
  const shuffledRef = useRef(false);
  const readyPlaylistIdRef = useRef<string | null>(null);

  function advanceShuffled() {
    const player = playerRef.current;
    if (!player) return;
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
      playerRef.current = new window.YT!.Player(mountPoint, {
        height: "360",
        width: "640",
        playerVars: { listType: "playlist", list: playlistId, playsinline: 1 },
        events: {
          onReady: () => {
            readyPlaylistIdRef.current = playlistId;
          },
          onStateChange: (event: any) => {
            const data = playerRef.current.getVideoData();
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
          onError: () => {
            playerRef.current?.nextVideo();
          },
        },
      });
    });

    return () => {
      cancelled = true;
      playerRef.current?.destroy?.();
      hostRef.current?.remove();
    };
    // Intentionally runs once: initial mount only. Mode/playlist changes
    // are handled by the loadPlaylist effect below, on the same instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // switch playlists on mode change without recreating the player.
  // loadPlaylist() proved unreliable here — verified live that it updates
  // the player's internal `list` field but leaves playback stuck on the
  // outgoing video indefinitely. cuePlaylist() reliably swaps the loaded
  // video; playVideo() then starts it (autoplay is already unlocked by
  // this point since a real play() only ever happens after a user gesture).
  useEffect(() => {
    if (!playerRef.current?.cuePlaylist) return;
    if (readyPlaylistIdRef.current === null) return;
    if (readyPlaylistIdRef.current === playlistId) return;
    readyPlaylistIdRef.current = playlistId;
    historyRef.current.clear();
    const wasPlaying = state.status === "playing";
    playerRef.current.cuePlaylist({ listType: "playlist", list: playlistId });
    if (wasPlaying) {
      playerRef.current.playVideo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlistId]);

  // progress ticker while playing
  useEffect(() => {
    if (state.status !== "playing") return;
    const interval = window.setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      dispatch({
        type: "TICK",
        currentTime: player.getCurrentTime(),
        duration: player.getDuration(),
      });
    }, 500);
    return () => window.clearInterval(interval);
  }, [state.status]);

  function next() {
    if (state.shuffled) {
      advanceShuffled();
    } else {
      playerRef.current?.nextVideo();
    }
  }

  function previous() {
    if (state.shuffled) {
      const target = historyRef.current.popPrevious();
      if (target !== null) {
        playerRef.current?.playVideoAt(target);
        return;
      }
    }
    playerRef.current?.previousVideo();
  }

  function toggleShuffle() {
    shuffledRef.current = !shuffledRef.current;
    dispatch({ type: "TOGGLE_SHUFFLE" });
  }

  const track = resolveTrackMetadata(state.videoId ?? "", trackMap, state.rawTitle, state.rawAuthor);

  return {
    title: track.title,
    artist: track.artist,
    videoId: state.videoId,
    isPlaying: state.status === "playing",
    currentTime: state.currentTime,
    duration: state.duration,
    shuffled: state.shuffled,
    play: () => playerRef.current?.playVideo(),
    pause: () => playerRef.current?.pauseVideo(),
    next,
    previous,
    toggleShuffle,
    setVolume: (v: number) => playerRef.current?.setVolume(v),
    getQueue: (): string[] => {
      const list = playerRef.current?.getPlaylist?.();
      return Array.isArray(list) ? list : [];
    },
    playIndex: (index: number) => playerRef.current?.playVideoAt?.(index),
  };
}

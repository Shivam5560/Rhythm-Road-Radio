export type PlayerStatus = "idle" | "cued" | "playing" | "paused" | "buffering";

export type PlayerState = {
  status: PlayerStatus;
  videoId: string | null;
  rawTitle: string;
  rawAuthor: string;
  currentTime: number;
  duration: number;
  shuffled: boolean;
  /** A playlist swap is in flight and the track fields are not yet meaningful. */
  switching: boolean;
};

export const initialPlayerState: PlayerState = {
  status: "idle",
  videoId: null,
  rawTitle: "",
  rawAuthor: "",
  currentTime: 0,
  duration: 0,
  shuffled: false,
  switching: false,
};

// Mirrors YT.PlayerState: UNSTARTED=-1, ENDED=0, PLAYING=1, PAUSED=2, BUFFERING=3, CUED=5
export function statusFromYouTubeState(ytState: number): PlayerStatus {
  switch (ytState) {
    case 1:
      return "playing";
    case 2:
      return "paused";
    case 3:
      return "buffering";
    case 5:
      return "cued";
    default:
      return "idle";
  }
}

export type PlayerAction =
  | { type: "YT_STATE_CHANGE"; ytState: number; videoId: string; rawTitle: string; rawAuthor: string }
  | { type: "TICK"; currentTime: number; duration: number }
  | { type: "TOGGLE_SHUFFLE" }
  | { type: "SWITCH_START" };

export function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case "YT_STATE_CHANGE":
      return {
        ...state,
        status: statusFromYouTubeState(action.ytState),
        videoId: action.videoId,
        rawTitle: action.rawTitle,
        rawAuthor: action.rawAuthor,
        switching: false,
      };
    case "TICK":
      // A tick from the outgoing video would undo the progress reset below.
      if (state.switching) return state;
      return { ...state, currentTime: action.currentTime, duration: action.duration };
    case "TOGGLE_SHUFFLE":
      return { ...state, shuffled: !state.shuffled };
    // Drop the outgoing track's identity the moment a swap starts, so the UI
    // never shows the previous mode's song (or its raw English title, which is
    // what the new mode's curated map falls back to) while the swap is in
    // flight.
    case "SWITCH_START":
      return {
        ...state,
        videoId: null,
        rawTitle: "",
        rawAuthor: "",
        currentTime: 0,
        duration: 0,
        switching: true,
      };
    default:
      return state;
  }
}

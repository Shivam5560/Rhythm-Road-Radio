export type PlayerStatus = "idle" | "cued" | "playing" | "paused" | "buffering";

export type PlayerState = {
  status: PlayerStatus;
  videoId: string | null;
  rawTitle: string;
  rawAuthor: string;
  currentTime: number;
  duration: number;
  shuffled: boolean;
};

export const initialPlayerState: PlayerState = {
  status: "idle",
  videoId: null,
  rawTitle: "",
  rawAuthor: "",
  currentTime: 0,
  duration: 0,
  shuffled: false,
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
  | { type: "TOGGLE_SHUFFLE" };

export function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case "YT_STATE_CHANGE":
      return {
        ...state,
        status: statusFromYouTubeState(action.ytState),
        videoId: action.videoId,
        rawTitle: action.rawTitle,
        rawAuthor: action.rawAuthor,
      };
    case "TICK":
      return { ...state, currentTime: action.currentTime, duration: action.duration };
    case "TOGGLE_SHUFFLE":
      return { ...state, shuffled: !state.shuffled };
    default:
      return state;
  }
}

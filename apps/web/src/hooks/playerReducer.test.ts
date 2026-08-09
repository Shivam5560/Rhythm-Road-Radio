import { describe, expect, it } from "vitest";
import { initialPlayerState, playerReducer, statusFromYouTubeState } from "./playerReducer";

describe("statusFromYouTubeState", () => {
  it("maps YouTube's numeric player states to our status strings", () => {
    expect(statusFromYouTubeState(1)).toBe("playing");
    expect(statusFromYouTubeState(2)).toBe("paused");
    expect(statusFromYouTubeState(3)).toBe("buffering");
    expect(statusFromYouTubeState(5)).toBe("cued");
    expect(statusFromYouTubeState(0)).toBe("idle");
    expect(statusFromYouTubeState(-1)).toBe("idle");
  });
});

describe("playerReducer", () => {
  it("updates status and track info on YT_STATE_CHANGE", () => {
    const next = playerReducer(initialPlayerState, {
      type: "YT_STATE_CHANGE",
      ytState: 1,
      videoId: "abc123",
      rawTitle: "Tum Ho",
      rawAuthor: "Mohit Chauhan",
    });
    expect(next.status).toBe("playing");
    expect(next.videoId).toBe("abc123");
    expect(next.rawTitle).toBe("Tum Ho");
  });

  it("updates currentTime/duration on TICK without touching other fields", () => {
    const playing = playerReducer(initialPlayerState, {
      type: "YT_STATE_CHANGE",
      ytState: 1,
      videoId: "abc123",
      rawTitle: "Tum Ho",
      rawAuthor: "Mohit Chauhan",
    });
    const ticked = playerReducer(playing, { type: "TICK", currentTime: 42, duration: 210 });
    expect(ticked.currentTime).toBe(42);
    expect(ticked.duration).toBe(210);
    expect(ticked.status).toBe("playing");
    expect(ticked.videoId).toBe("abc123");
  });

  it("flips shuffled on TOGGLE_SHUFFLE", () => {
    const toggled = playerReducer(initialPlayerState, { type: "TOGGLE_SHUFFLE" });
    expect(toggled.shuffled).toBe(true);
    const toggledBack = playerReducer(toggled, { type: "TOGGLE_SHUFFLE" });
    expect(toggledBack.shuffled).toBe(false);
  });
});

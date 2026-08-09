import { describe, expect, it } from "vitest";
import { pickShuffleIndex, ShuffleHistory } from "./shuffle";

describe("pickShuffleIndex", () => {
  it("never returns the current index when more than one track exists", () => {
    for (let i = 0; i < 50; i++) {
      const result = pickShuffleIndex(5, 2);
      expect(result).not.toBe(2);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(5);
    }
  });

  it("returns 0 when the playlist has one or zero tracks", () => {
    expect(pickShuffleIndex(1, 0)).toBe(0);
    expect(pickShuffleIndex(0, 0)).toBe(0);
  });
});

describe("ShuffleHistory", () => {
  it("steps back to the track before the current one", () => {
    const history = new ShuffleHistory();
    history.push(3);
    history.push(7);
    history.push(1);
    expect(history.popPrevious()).toBe(7);
  });

  it("returns null when there is nowhere to go back to", () => {
    const history = new ShuffleHistory();
    history.push(3);
    expect(history.popPrevious()).toBeNull();
  });

  it("clear() empties the history", () => {
    const history = new ShuffleHistory();
    history.push(3);
    history.push(7);
    history.clear();
    expect(history.popPrevious()).toBeNull();
  });

  it("walks back through more than one step in sequence", () => {
    const history = new ShuffleHistory();
    history.push(3);
    history.push(7);
    history.push(1);
    expect(history.popPrevious()).toBe(7);
    expect(history.popPrevious()).toBe(3);
    expect(history.popPrevious()).toBeNull();
  });

  it("exposes its size via length", () => {
    const history = new ShuffleHistory();
    expect(history.length).toBe(0);
    history.push(3);
    expect(history.length).toBe(1);
    history.push(7);
    expect(history.length).toBe(2);
  });
});

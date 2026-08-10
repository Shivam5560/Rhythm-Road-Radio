import { describe, expect, it } from "vitest";
import { tracksFor } from "./tracks";

const MODES = ["driver", "rainy", "party", "ghazal"] as const;

describe("tracksFor", () => {
  it("returns real curated tracks for every mode", () => {
    for (const m of MODES) {
      expect(tracksFor(m).length, m).toBeGreaterThan(3);
    }
  });

  it("returns Devanagari titles, not raw YouTube titles", () => {
    for (const m of MODES) {
      expect(tracksFor(m)[0].title, m).toMatch(/[ऀ-ॿ]/);
    }
  });

  it("gives every track an artist", () => {
    for (const m of MODES) {
      for (const track of tracksFor(m)) {
        expect(track.artist, `${m}: ${track.title}`).toBeTruthy();
      }
    }
  });
});

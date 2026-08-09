import { describe, expect, it } from "vitest";
import { cleanAuthor, cleanTitle, resolveTrackMetadata } from "./trackMetadata";

describe("cleanTitle", () => {
  it("strips (Official Video) clutter", () => {
    expect(cleanTitle("Ek Pal Ka Jeena (Official Video)")).toBe("Ek Pal Ka Jeena");
  });

  it("strips | T-Series suffix", () => {
    expect(cleanTitle("Kesariya | T-Series")).toBe("Kesariya");
  });

  it("collapses extra whitespace left behind", () => {
    expect(cleanTitle("Tum Ho   (Official Audio)  ")).toBe("Tum Ho");
  });

  it("leaves already-clean titles untouched", () => {
    expect(cleanTitle("Ek Pal Ka Jeena")).toBe("Ek Pal Ka Jeena");
  });
});

describe("cleanAuthor", () => {
  it("strips a trailing - Topic suffix", () => {
    expect(cleanAuthor("Kishore Kumar - Topic")).toBe("Kishore Kumar");
  });

  it("leaves normal channel names untouched", () => {
    expect(cleanAuthor("The Kumar Sanu Official")).toBe("The Kumar Sanu Official");
  });
});

describe("resolveTrackMetadata", () => {
  it("returns the curated entry when the video id is known", () => {
    const curated = { abc123: { title: "एक पल का जीना", artist: "लकी अली" } };
    expect(resolveTrackMetadata("abc123", curated, "Ek Pal Ka Jeena", "Lucky Ali")).toEqual({
      title: "एक पल का जीना",
      artist: "लकी अली",
    });
  });

  it("falls back to cleaned live metadata when the video id is unknown", () => {
    expect(
      resolveTrackMetadata("xyz789", {}, "Tum Ho (Official Audio)", "Mohit Chauhan - Topic"),
    ).toEqual({ title: "Tum Ho", artist: "Mohit Chauhan" });
  });
});

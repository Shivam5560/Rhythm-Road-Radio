import { describe, expect, it } from "vitest";
import { CTA_RAIL, CTA_URL, FEATURE_RAIL, HOOK_RAIL, MODE_RAIL } from "./copy";

const MODES = ["driver", "rainy", "party", "ghazal"] as const;
const all = () => [...Object.values(MODE_RAIL), ...FEATURE_RAIL, HOOK_RAIL, CTA_RAIL];

describe("copy", () => {
  it("has rail copy for every mode", () => {
    for (const m of MODES) {
      expect(MODE_RAIL[m], m).toBeTruthy();
    }
  });

  it("has exactly three feature lines", () => {
    expect(FEATURE_RAIL).toHaveLength(3);
  });

  it("keeps every rail line short enough for one line at rail size", () => {
    for (const line of all()) {
      expect(line.length, line).toBeLessThanOrEqual(40);
    }
  });

  it("sets every rail line in upper case", () => {
    for (const line of all()) {
      expect(line, line).toBe(line.toUpperCase());
    }
  });

  it("never claims the product is ad-free, which would be untrue", () => {
    for (const line of all()) {
      expect(line).not.toMatch(/\bADS?\b|\bAD-FREE\b/);
    }
  });

  it("points at the real domain", () => {
    expect(CTA_URL).toBe("rastaradio.tech");
  });
});

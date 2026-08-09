import { describe, expect, it } from "vitest";
import { formatTime } from "./formatTime";

describe("formatTime", () => {
  it("formats whole minutes and seconds with zero padding", () => {
    expect(formatTime(65)).toBe("01:05");
    expect(formatTime(9)).toBe("00:09");
    expect(formatTime(600)).toBe("10:00");
  });

  it("floors fractional seconds", () => {
    expect(formatTime(65.9)).toBe("01:05");
  });

  it("returns 00:00 for invalid or negative input", () => {
    expect(formatTime(NaN)).toBe("00:00");
    expect(formatTime(-5)).toBe("00:00");
  });
});

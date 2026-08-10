import { describe, expect, it } from "vitest";
import { layoutFor } from "./layout";

describe("layoutFor", () => {
  it("sizes the vertical format for Instagram", () => {
    const l = layoutFor("vertical");
    expect(l.width).toBe(1080);
    expect(l.height).toBe(1920);
  });

  it("sizes the square format for LinkedIn", () => {
    const l = layoutFor("square");
    expect(l.width).toBe(1080);
    expect(l.height).toBe(1080);
  });

  it("keeps every vertical content box inside the Instagram safe area", () => {
    const l = layoutFor("vertical");
    for (const [name, box] of Object.entries(l.boxes)) {
      expect(box.x, `${name}.x`).toBeGreaterThanOrEqual(l.safe.left);
      expect(box.y, `${name}.y`).toBeGreaterThanOrEqual(l.safe.top);
      expect(box.x + box.width, `${name} right edge`).toBeLessThanOrEqual(l.safe.right);
      expect(box.y + box.height, `${name} bottom edge`).toBeLessThanOrEqual(l.safe.bottom);
    }
  });

  it("sizes the horizontal format for Desktop/YouTube", () => {
    const l = layoutFor("horizontal");
    expect(l.width).toBe(1920);
    expect(l.height).toBe(1080);
  });

  it("keeps every horizontal content box inside its own bounds", () => {
    const l = layoutFor("horizontal");
    for (const [name, box] of Object.entries(l.boxes)) {
      expect(box.x + box.width, `${name} right edge`).toBeLessThanOrEqual(l.width);
      expect(box.y + box.height, `${name} bottom edge`).toBeLessThanOrEqual(l.height);
    }
  });
});

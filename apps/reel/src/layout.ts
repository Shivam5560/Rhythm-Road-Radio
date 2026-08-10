export type Format = "vertical" | "square";

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Layout {
  format: Format;
  width: number;
  height: number;
  /** Region Instagram's own UI does not cover. */
  safe: { left: number; top: number; right: number; bottom: number };
  boxes: {
    rollBoard: Box;
    nowCard: Box;
    hero: Box;
    rail: Box;
    player: Box;
  };
  type: {
    hero: number;
    wordmark: number;
    rail: number;
    railTracking: number;
    body: number;
  };
}

const VERTICAL: Layout = {
  format: "vertical",
  width: 1080,
  height: 1920,
  safe: { left: 80, top: 280, right: 1000, bottom: 1560 },
  boxes: {
    rollBoard: { x: 80, y: 300, width: 560, height: 120 },
    nowCard: { x: 620, y: 500, width: 360, height: 460 },
    hero: { x: 80, y: 1000, width: 860, height: 260 },
    rail: { x: 80, y: 1300, width: 860, height: 60 },
    player: { x: 80, y: 1400, width: 860, height: 150 },
  },
  type: { hero: 96, wordmark: 84, rail: 26, railTracking: 6, body: 32 },
};

const SQUARE: Layout = {
  format: "square",
  width: 1080,
  height: 1080,
  safe: { left: 64, top: 64, right: 1016, bottom: 1016 },
  boxes: {
    rollBoard: { x: 64, y: 90, width: 500, height: 104 },
    nowCard: { x: 700, y: 170, width: 280, height: 380 },
    hero: { x: 64, y: 560, width: 620, height: 220 },
    rail: { x: 64, y: 820, width: 800, height: 54 },
    player: { x: 64, y: 900, width: 952, height: 116 },
  },
  type: { hero: 76, wordmark: 68, rail: 22, railTracking: 5, body: 28 },
};

export function layoutFor(format: Format): Layout {
  return format === "vertical" ? VERTICAL : SQUARE;
}

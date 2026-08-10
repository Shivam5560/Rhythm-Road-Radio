export type Format = "vertical" | "square" | "horizontal" | "horizontal2k" | "vertical2k";

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
  /** Region UI content should keep inside. */
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

const HORIZONTAL: Layout = {
  format: "horizontal",
  width: 1920,
  height: 1080,
  safe: { left: 120, top: 80, right: 1800, bottom: 1000 },
  boxes: {
    rollBoard: { x: 120, y: 100, width: 560, height: 120 },
    nowCard: { x: 1400, y: 140, width: 380, height: 480 },
    hero: { x: 120, y: 500, width: 1100, height: 260 },
    rail: { x: 120, y: 800, width: 1100, height: 60 },
    player: { x: 120, y: 880, width: 1680, height: 140 },
  },
  type: { hero: 96, wordmark: 84, rail: 26, railTracking: 6, body: 32 },
};

function scaleLayout(base: Layout, format: Format, targetWidth: number, targetHeight: number): Layout {
  const scaleX = targetWidth / base.width;
  const scaleY = targetHeight / base.height;
  return {
    format,
    width: targetWidth,
    height: targetHeight,
    safe: {
      left: Math.round(base.safe.left * scaleX),
      top: Math.round(base.safe.top * scaleY),
      right: Math.round(base.safe.right * scaleX),
      bottom: Math.round(base.safe.bottom * scaleY),
    },
    boxes: {
      rollBoard: scaleBox(base.boxes.rollBoard, scaleX, scaleY),
      nowCard: scaleBox(base.boxes.nowCard, scaleX, scaleY),
      hero: scaleBox(base.boxes.hero, scaleX, scaleY),
      rail: scaleBox(base.boxes.rail, scaleX, scaleY),
      player: scaleBox(base.boxes.player, scaleX, scaleY),
    },
    type: {
      hero: Math.round(base.type.hero * scaleY),
      wordmark: Math.round(base.type.wordmark * scaleY),
      rail: Math.round(base.type.rail * scaleY),
      railTracking: Math.round(base.type.railTracking * scaleY),
      body: Math.round(base.type.body * scaleY),
    },
  };
}

function scaleBox(b: Box, sx: number, sy: number): Box {
  return {
    x: Math.round(b.x * sx),
    y: Math.round(b.y * sy),
    width: Math.round(b.width * sx),
    height: Math.round(b.height * sy),
  };
}

export function layoutFor(format: Format): Layout {
  if (format === "horizontal2k") return scaleLayout(HORIZONTAL, "horizontal2k", 2560, 1440);
  if (format === "vertical2k") return scaleLayout(VERTICAL, "vertical2k", 1440, 2560);
  if (format === "horizontal") return HORIZONTAL;
  return format === "vertical" ? VERTICAL : SQUARE;
}

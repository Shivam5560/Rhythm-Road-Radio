import { gestureState, type Gesture } from "../lib/gestures";

export interface TouchCueProps {
  gesture: Gesture;
  frame: number;
  accent: string;
}

/**
 * The gesture indicator: a ring in the mode's accent trailing a dashed tail
 * that echoes the road markings in the driver scene. Never a generic cursor.
 */
export function TouchCue({ gesture, frame, accent }: TouchCueProps) {
  const s = gestureState(gesture, frame);
  if (!s.visible) return null;

  const size = s.pressed ? 58 : 74;
  const fade = s.fade;

  return (
    <>
      {gesture.kind !== "tap" && (
        <div
          style={{
            position: "absolute",
            left: Math.min(gesture.from[0], s.x),
            top: s.y - 1,
            width: Math.abs(s.x - gesture.from[0]),
            height: 2,
            borderTop: `2px dashed ${accent}`,
            opacity: 0.5 * fade,
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          left: s.x - size / 2,
          top: s.y - size / 2,
          width: size,
          height: size,
          borderRadius: 999,
          border: `2px solid ${accent}`,
          background: s.pressed ? `${accent}33` : "transparent",
          boxShadow: `0 0 ${s.pressed ? 34 : 18}px ${accent}`,
          opacity: fade,
        }}
      />
    </>
  );
}

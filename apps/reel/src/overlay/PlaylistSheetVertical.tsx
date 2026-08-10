import type { ReelTrack } from "../lib/tracks";

export interface PlaylistSheetVerticalProps {
  heading: string;
  tracks: ReelTrack[];
  currentIndex: number;
  /** 0..1 — the sheet slides up from the bottom edge. */
  progress: number;
  accent: string;
  width: number;
  height: number;
  bodyFamily: string;
  monoFamily: string;
}

export function PlaylistSheetVertical({
  heading, tracks, currentIndex, progress, accent, width, height, bodyFamily, monoFamily,
}: PlaylistSheetVerticalProps) {
  const t = 1 - Math.pow(1 - Math.min(1, Math.max(0, progress)), 3);
  const rows = tracks.slice(0, 6);

  return (
    <div
      style={{
        width,
        height,
        transform: `translateY(${(1 - t) * height}px)`,
        opacity: 0.4 + t * 0.6,
        borderRadius: "28px 28px 0 0",
        background: "linear-gradient(180deg, rgba(20,11,9,.98), rgba(10,6,4,.98))",
        border: "1px solid rgba(255,255,255,.14)",
        borderBottom: 0,
        boxShadow: "0 -26px 74px rgba(0,0,0,.5)",
        padding: "18px 26px 0",
        color: "#fff4e8",
        overflow: "hidden",
      }}
    >
      <div style={{ width: 64, height: 5, borderRadius: 3, background: "rgba(255,255,255,.28)", margin: "0 auto 20px" }} />
      <div style={{ fontFamily: monoFamily, fontSize: 17, letterSpacing: 3, color: accent, marginBottom: 18 }}>
        {heading}
      </div>
      {rows.map((track, i) => (
        <div
          key={`${track.title}-${i}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: "16px 14px",
            borderRadius: 14,
            background: i === currentIndex ? `${accent}26` : "transparent",
          }}
        >
          <span style={{ fontFamily: monoFamily, fontSize: 18, opacity: 0.55, width: 34 }}>
            {String(i + 1).padStart(2, "0")}
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span
              style={{
                display: "block", fontFamily: bodyFamily, fontSize: 27, fontWeight: 600,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                color: i === currentIndex ? accent : "#fff4e8",
              }}
            >
              {track.title}
            </span>
            <span style={{ display: "block", fontFamily: bodyFamily, fontSize: 20, opacity: 0.6 }}>
              {track.artist}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

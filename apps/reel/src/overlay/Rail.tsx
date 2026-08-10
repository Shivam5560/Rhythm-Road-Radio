export interface RailProps {
  text: string;
  /** 0..1 — the rail wipes in from the left and its rules draw outward. */
  progress: number;
  fontFamily: string;
  fontSize: number;
  tracking: number;
  width: number;
  accent: string;
}

/**
 * The English marketing line, set as a bus-timetable rule rather than a
 * caption: mono, upper case, widely tracked, deliberately subordinate to the
 * Devanagari display type above it.
 */
export function Rail({ text, progress, fontFamily, fontSize, tracking, width, accent }: RailProps) {
  const t = Math.min(1, Math.max(0, progress));
  const rule = (
    <div style={{ height: 1, width: `${t * 100}%`, background: "rgba(255,244,232,.34)" }} />
  );

  return (
    <div style={{ width, display: "flex", flexDirection: "column", gap: 12 }}>
      {rule}
      <div style={{ display: "flex", alignItems: "center", gap: 14, opacity: t }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: accent, flexShrink: 0 }} />
        <span
          style={{
            fontFamily,
            fontSize,
            letterSpacing: tracking,
            color: "rgba(255,244,232,.88)",
            whiteSpace: "nowrap",
          }}
        >
          {text}
        </span>
      </div>
      {rule}
    </div>
  );
}

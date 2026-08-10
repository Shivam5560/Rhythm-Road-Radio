import { highlightSweep, rollOffset } from "../lib/rollBoard";

export interface RollBoardProps {
  /** Place name rolling out. */
  from: string;
  /** Place name rolling in. */
  to: string;
  progress: number;
  accent: string;
  width: number;
  height: number;
  fontFamily: string;
  fontSize: number;
}

export function RollBoard({ from, to, progress, accent, width, height, fontFamily, fontSize }: RollBoardProps) {
  const offset = rollOffset(progress, height);
  const sweep = highlightSweep(progress);

  const row: React.CSSProperties = {
    height,
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "0 26px",
    fontFamily,
    fontSize,
    fontWeight: 600,
    letterSpacing: 0.4,
    color: "#fff4e8",
    whiteSpace: "nowrap",
  };

  return (
    <div
      style={{
        width,
        height,
        position: "relative",
        overflow: "hidden",
        borderRadius: 8,
        background: "rgba(10,6,4,.42)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,.18)",
        boxShadow: "inset 0 10px 24px rgba(0,0,0,.45), inset 0 -10px 24px rgba(0,0,0,.45)",
      }}
    >
      <div style={{ transform: `translateY(${offset}px)` }}>
        <div style={row}>
          <Pin accent={accent} />
          {from}
        </div>
        <div style={row}>
          <Pin accent={accent} />
          {to}
        </div>
      </div>

      {/* Specular highlight — sells the strip as curved metal mid-roll. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `linear-gradient(100deg, transparent ${sweep * 100 - 18}%, rgba(255,255,255,.22) ${sweep * 100}%, transparent ${sweep * 100 + 18}%)`,
        }}
      />
    </div>
  );
}

function Pin({ accent }: { accent: string }) {
  return (
    <span
      style={{
        width: 10,
        height: 10,
        borderRadius: 999,
        background: accent,
        boxShadow: `0 0 16px ${accent}`,
        flexShrink: 0,
      }}
    />
  );
}

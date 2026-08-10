import { BusFront, Disc3, Moon, Waves } from "lucide-react";
import { modes, type PlaylistMode } from "@site/components/mockups/indian-playlist/IndianPlaylist";

export interface NowCardVerticalProps {
  mode: PlaylistMode;
  title: string;
  artist: string;
  /** 0..1 — the card flies in from the right and settles with a slight tilt. */
  progress: number;
  width: number;
  bodyFamily: string;
  monoFamily: string;
}

export function NowCardVertical({ mode, title, artist, progress, width, bodyFamily, monoFamily }: NowCardVerticalProps) {
  const current = modes[mode];
  const t = 1 - Math.pow(1 - Math.min(1, Math.max(0, progress)), 3);

  return (
    <div
      style={{
        width,
        padding: "26px 26px 30px",
        borderRadius: 26,
        background: "rgba(10,6,4,.42)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,.16)",
        boxShadow: "0 30px 74px rgba(0,0,0,.45)",
        color: "#fff4e8",
        transform: `translateX(${(1 - t) * 140}px) rotate(${(1 - t) * 6 - 2.5}deg)`,
        opacity: t,
      }}
    >
      <div style={{ fontFamily: monoFamily, fontSize: 15, letterSpacing: 2, opacity: 0.7 }}>
        {current.cardLabel}
      </div>
      <div
        style={{
          margin: "18px 0 20px",
          aspectRatio: "1 / 1",
          borderRadius: 16,
          background: current.accent,
          display: "grid",
          placeItems: "center",
        }}
      >
        {mode === "driver" && <BusFront size={78} strokeWidth={1.2} />}
        {mode === "party" && <Disc3 className="art-spin" size={86} strokeWidth={1.1} />}
        {mode === "rainy" && <Waves size={82} strokeWidth={1.1} />}
        {mode === "ghazal" && <Moon size={78} strokeWidth={1.1} />}
      </div>
      <div style={{ fontFamily: bodyFamily, fontSize: 30, fontWeight: 600, lineHeight: 1.2 }}>{title}</div>
      <div style={{ fontFamily: bodyFamily, fontSize: 22, opacity: 0.66, marginTop: 6 }}>{artist}</div>
    </div>
  );
}

import type { CSSProperties } from "react";
import { ListMusic, Pause, Play, Shuffle, SkipBack, SkipForward } from "lucide-react";
import { formatTime } from "@site/lib/formatTime";

export interface PlayerBarProps {
  title: string;
  artist: string;
  isPlaying: boolean;
  shuffled: boolean;
  /** 0..1 of the track elapsed. */
  fraction: number;
  durationSeconds: number;
  accent: string;
  width: number;
  bodyFamily: string;
  monoFamily: string;
  /** Scale up the button being pressed this frame. */
  pressing?: "play" | "shuffle" | "queue" | "scrub" | null;
}

export function PlayerBar({
  title, artist, isPlaying, shuffled, fraction, durationSeconds,
  accent, width, bodyFamily, monoFamily, pressing = null,
}: PlayerBarProps) {
  const press = (key: string) => (pressing === key ? "scale(0.88)" : "scale(1)");

  return (
    <div
      style={{
        width,
        display: "flex",
        flexDirection: "column",
        gap: 18,
        padding: "22px 26px",
        borderRadius: 22,
        background: "rgba(10,6,4,.52)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,.16)",
        color: "#fff4e8",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            width: 62, height: 62, borderRadius: 16, background: accent, flexShrink: 0,
            display: "grid", placeItems: "center",
          }}
        >
          {isPlaying ? <Pause size={26} fill="currentColor" /> : <Play size={26} fill="currentColor" />}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontFamily: monoFamily, fontSize: 16, letterSpacing: 3, color: accent }}>बज रहा है</div>
          <div
            style={{
              fontFamily: bodyFamily, fontSize: 34, fontWeight: 600,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}
          >
            {title}
          </div>
          <div style={{ fontFamily: bodyFamily, fontSize: 24, opacity: 0.66 }}>{artist}</div>
        </div>
        {isPlaying && <Equaliser accent={accent} />}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <SkipBack size={26} fill="currentColor" />
        <div style={{ transform: press("play"), transition: "none" }}>
          {isPlaying ? <Pause size={34} fill="currentColor" /> : <Play size={34} fill="currentColor" />}
        </div>
        <SkipForward size={26} fill="currentColor" />

        <span style={{ fontFamily: monoFamily, fontSize: 20 }}>
          {formatTime(fraction * durationSeconds)}
        </span>
        <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(255,255,255,.18)", position: "relative" }}>
          <div style={{ width: `${fraction * 100}%`, height: "100%", borderRadius: 3, background: accent }} />
          <div
            style={{
              position: "absolute", left: `${fraction * 100}%`, top: -6,
              width: 18, height: 18, marginLeft: -9, borderRadius: 999,
              background: "#fff4e8", opacity: pressing === "scrub" ? 1 : 0,
            }}
          />
        </div>
        <span style={{ fontFamily: monoFamily, fontSize: 20 }}>{formatTime(durationSeconds)}</span>

        <div style={{ transform: press("shuffle"), color: shuffled ? accent : "#fff4e8" }}>
          <Shuffle size={24} />
        </div>
        <div style={{ transform: press("queue") }}>
          <ListMusic size={24} />
        </div>
      </div>
    </div>
  );
}

function Equaliser({ accent }: { accent: string }) {
  // Real CSS animation from the site's stylesheet, seeked per frame by
  // useCssAnimationSync in SceneLayer. The stylesheet reads the bar color
  // from --mode-accent, so it must be set here for `accent` to take effect.
  const style = { transform: "scale(2)", "--mode-accent": accent } as CSSProperties;
  return (
    <span className="player-eq" aria-hidden style={style}>
      <i /><i /><i />
    </span>
  );
}

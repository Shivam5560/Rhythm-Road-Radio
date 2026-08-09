import { useMemo, useState, type CSSProperties } from "react";
import {
  BusFront,
  ChevronDown,
  Disc3,
  Droplets,
  Gauge,
  Heart,
  ListMusic,
  MapPin,
  Menu,
  Pause,
  Play,
  Plus,
  Radio,
  Repeat2,
  Route,
  SkipBack,
  SkipForward,
  Sparkles,
  Volume2,
  Waves,
  X,
} from "lucide-react";
import "./indian-playlist.css";

export type PlaylistMode = "driver" | "party" | "rainy";

type Song = {
  title: string;
  artist: string;
  duration: string;
  color: string;
};

const songs: Song[] = [
  { title: "Dus Bahane", artist: "Shaan · KK", duration: "03:26", color: "#f4a261" },
  { title: "Aankhon Mein Teri", artist: "KK", duration: "04:04", color: "#ef476f" },
  { title: "It's Magic", artist: "Sonu Nigam", duration: "04:06", color: "#2a9d8f" },
  { title: "Mauja Hi Mauja", artist: "Mika Singh", duration: "04:22", color: "#e9c46a" },
  { title: "Kya Mujhe Pyaar Hai", artist: "KK", duration: "04:26", color: "#457b9d" },
  { title: "Zara Zara Touch Me", artist: "Monali Thakur", duration: "04:31", color: "#9b5de5" },
];

const modes: Record<PlaylistMode, {
  eyebrow: string;
  title: string;
  hindi: string;
  description: string;
  accent: string;
  soft: string;
  playlist: string;
  note: string;
}> = {
  driver: {
    eyebrow: "Route 42 · Control room",
    title: "Keep the city moving.",
    hindi: "चलते रहो",
    description: "A bright, steady set for the wheel, the windshield, and every familiar stop.",
    accent: "#e76f51",
    soft: "#ffe0c2",
    playlist: "Subah Ki Sawari",
    note: "Driver's pick · 18 songs",
  },
  party: {
    eyebrow: "Passenger radio · Full volume",
    title: "Aaj naachenge sab.",
    hindi: "नाचेंगे सब",
    description: "Turn the aisle into a dance floor. Big hooks, bright lights, no quiet seats.",
    accent: "#d7263d",
    soft: "#ffb4b4",
    playlist: "Window Seat Bangers",
    note: "Crowd favourite · 24 songs",
  },
  rainy: {
    eyebrow: "Monsoon radio · After 8 pm",
    title: "Let the rain sing along.",
    hindi: "बारिश की रात",
    description: "Soft headlights, wet roads, and the songs that know every old memory by name.",
    accent: "#2a6f97",
    soft: "#b9d9df",
    playlist: "Khidki Ke Paar",
    note: "Night drive · 16 songs",
  },
};

function ModeIcon({ mode }: { mode: PlaylistMode }) {
  if (mode === "driver") return <BusFront size={16} />;
  if (mode === "party") return <Sparkles size={16} />;
  return <Droplets size={16} />;
}

function Artwork({ mode, active }: { mode: PlaylistMode; active: Song }) {
  return (
    <div className={`artwork artwork-${mode}`} aria-label={`${active.title} cover artwork`}>
      {mode === "driver" && <div className="bus-scene" aria-hidden="true"><div className="bus-window"><i /><i /><i /></div><div className="bus-route-sign">मुंबई • ४२</div><div className="bus-seat seat-one" /><div className="bus-seat seat-two" /><div className="bus-handle handle-one" /><div className="bus-handle handle-two" /><div className="passenger passenger-one" /><div className="passenger passenger-two" /><div className="road-streak streak-one" /><div className="road-streak streak-two" /></div>}
      {mode === "rainy" && <div className="rain-scene" aria-hidden="true"><div className="mountain mountain-back" /><div className="mountain mountain-mid" /><div className="mountain mountain-front" /><div className="mist mist-one" /><div className="mist mist-two" /><div className="trail" /><div className="trekker"><i /><b /></div><div className="rain-lines" /></div>}
      {mode === "party" && <div className="party-scene" aria-hidden="true"><div className="club-beam beam-one" /><div className="club-beam beam-two" /><div className="club-beam beam-three" /><div className="disco-facet facet-one" /><div className="disco-facet facet-two" /><div className="speaker speaker-left" /><div className="speaker speaker-right" /><div className="dancer dancer-one" /><div className="dancer dancer-two" /><div className="dancer dancer-three" /><div className="club-floor" /></div>}
      <div className="art-grid" />
      <div className="art-circle art-circle-one" />
      <div className="art-circle art-circle-two" />
      {mode === "driver" && <BusFront className="art-icon" size={88} strokeWidth={1.2} />}
      {mode === "party" && <Disc3 className="art-icon art-spin" size={112} strokeWidth={1.1} />}
      {mode === "rainy" && <Waves className="art-icon" size={104} strokeWidth={1.1} />}
      <div className="art-label">{mode === "rainy" ? "रात / 2007" : mode === "party" ? "SIDE A / DANCE" : "ROUTE / 42"}</div>
      <div className="art-title">{active.title}</div>
    </div>
  );
}

function SongRow({ song, index, active, playing, onSelect }: {
  song: Song; index: number; active: boolean; playing: boolean; onSelect: () => void;
}) {
  return (
    <button className={`song-row ${active ? "song-active" : ""}`} onClick={onSelect} aria-label={`Play ${song.title}`}>
      <span className="song-index">{active && playing ? <Radio size={16} /> : String(index + 1).padStart(2, "0")}</span>
      <span className="song-color" style={{ background: song.color }} />
      <span className="song-copy"><strong>{song.title}</strong><small>{song.artist}</small></span>
      {active && <span className="playing-bars"><i /><i /><i /></span>}
      <span className="song-time">{song.duration}</span>
      <Heart className="row-heart" size={16} />
    </button>
  );
}

export function IndianPlaylist({ mode: initialMode = "driver" }: { mode?: PlaylistMode }) {
  const [mode, setMode] = useState<PlaylistMode>(initialMode);
  const [playing, setPlaying] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [volume, setVolume] = useState(68);
  const [routeOpen, setRouteOpen] = useState(false);
  const current = modes[mode];
  const active = songs[activeIndex];
  const tint = useMemo(() => ({ "--mode-accent": current.accent, "--mode-soft": current.soft } as CSSProperties), [current]);

  const next = () => setActiveIndex((i) => (i + 1) % songs.length);
  const previous = () => setActiveIndex((i) => (i - 1 + songs.length) % songs.length);

  return (
    <main className={`indian-playlist mode-${mode}`} style={tint}>
      <div className="grain" />
      <header className="topbar">
        <div className="brand-mark"><span>रास्ता</span><b>RADIO</b></div>
        <div className="live-pill"><span className="live-dot" /> LIVE ON THE BUS</div>
        <button className="menu-button" aria-label="Open menu"><Menu size={21} /></button>
      </header>

      <nav className="mode-switcher" aria-label="Listening mode">
        {(Object.keys(modes) as PlaylistMode[]).map((key) => (
          <button key={key} className={`mode-button ${mode === key ? "mode-selected" : ""}`} onClick={() => setMode(key)}>
            <ModeIcon mode={key} /><span>{key === "driver" ? "Bus Driver" : key === "party" ? "Party Mode" : "Rainy Season"}</span>
          </button>
        ))}
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-line" />{current.eyebrow}</p>
          <h1>{current.title}</h1>
          <div className="hindi-title">{current.hindi}</div>
          <p className="description">{current.description}</p>
          <div className="route-chip"><MapPin size={15} /><span>Andheri East</span><ChevronDown size={15} /></div>
        </div>
        <div className="hero-art"><Artwork mode={mode} active={active} /><span className="art-sticker">{mode === "driver" ? "SAFE TRIP" : mode === "party" ? "NO BORING RIDES" : "बारिश / REPEAT"}</span></div>
      </section>

      <section className="dashboard-grid">
        <div className="playlist-panel">
          <div className="panel-heading">
            <div><span className="section-kicker"><ListMusic size={14} /> NOW BOARDING</span><h2>{current.playlist}</h2><p>{current.note}</p></div>
          <button className="small-icon-button" aria-label="Add songs" onClick={() => setPlaying(true)}><Plus size={18} /></button>
          </div>
          <div className="song-list">
            {songs.map((song, index) => <SongRow key={song.title} song={song} index={index} active={index === activeIndex} playing={playing} onSelect={() => { setActiveIndex(index); setPlaying(true); }} />)}
          </div>
          <button className="queue-button" onClick={() => setPlaying(!playing)}><span>{playing ? "Playing for the whole bus" : "Radio paused"}</span><span>{playing ? "Pause set" : "Resume set"} <Play size={14} fill="currentColor" /></span></button>
        </div>

        <aside className="side-stack">
          <div className="journey-card">
            <div className="card-topline"><span><Route size={14} /> CURRENT JOURNEY</span><span className="status-dot">ON TIME</span></div>
            <div className="journey-route"><strong>Andheri East</strong><span className="route-dash" /><strong>Goregaon West</strong></div>
            <div className="journey-meta"><span><Gauge size={15} /> 12 stops left</span><span>ETA 08:42 PM</span></div>
            <div className="route-progress"><span /></div>
            <button className="route-detail" onClick={() => setRouteOpen(!routeOpen)}>{routeOpen ? "Hide route details" : "View route details"} <ChevronDown size={15} className={routeOpen ? "rotate-180" : ""} /></button>
            {routeOpen && <div className="route-popover"><span>Next stop</span><b>Malad Link Road · 4 min</b><span>Road note</span><b>Light rain near Jogeshwari</b></div>}
          </div>
          <div className="memory-card"><div className="memory-mark">“</div><p>{mode === "rainy" ? "Some songs sound better through a fogged-up window." : mode === "party" ? "If the back seats are quiet, turn it up." : "One good song can make a long route feel short."}</p><span>— radio note 04</span></div>
          <div className="sound-card"><div className="card-topline"><span><Volume2 size={14} /> CABIN VOLUME</span><span>{volume}%</span></div><input type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(Number(e.target.value))} /></div>
        </aside>
      </section>

      <footer className="now-playing">
        <div className="now-art" style={{ background: active.color }}><Disc3 size={25} /></div>
        <div className="now-copy"><span>NOW PLAYING</span><strong>{active.title}</strong><small>{active.artist}</small></div>
        <div className="player-controls"><button onClick={previous} aria-label="Previous song"><SkipBack size={19} fill="currentColor" /></button><button className="play-button" onClick={() => setPlaying(!playing)} aria-label={playing ? "Pause" : "Play"}>{playing ? <Pause size={19} fill="currentColor" /> : <Play size={19} fill="currentColor" />}</button><button onClick={next} aria-label="Next song"><SkipForward size={19} fill="currentColor" /></button></div>
        <div className="player-extra"><span>01:24</span><div className="player-progress"><span /></div><span>{active.duration}</span><Repeat2 size={17} /></div>
         <button className="close-player" aria-label="Close player" onClick={() => setPlaying(false)}><X size={17} /></button>
      </footer>
    </main>
  );
}
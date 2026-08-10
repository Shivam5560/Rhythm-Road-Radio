import { useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from "react";
import {
  BusFront,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Disc3,
  Droplets,
  MapPin,
  Menu,
  Moon,
  Pause,
  Play,
  Repeat2,
  SkipBack,
  SkipForward,
  Sparkles,
  Volume2,
  Waves,
  X,
} from "lucide-react";
import "./indian-playlist.css";
import { SceneStage } from "./Scene";

export type PlaylistMode = "driver" | "party" | "rainy" | "ghazal";

type Song = { title: string; artist: string; duration: string; color: string };

const songs: Song[] = [
  { title: "दस बहाने", artist: "शान · केके", duration: "03:26", color: "#f4a261" },
  { title: "आँखों में तेरी", artist: "केके", duration: "04:04", color: "#ef476f" },
  { title: "इट्स मैजिक", artist: "सोनू निगम", duration: "04:06", color: "#2a9d8f" },
  { title: "मौजा ही मौजा", artist: "मीका सिंह", duration: "04:22", color: "#e9c46a" },
  { title: "क्या मुझे प्यार है", artist: "केके", duration: "04:26", color: "#457b9d" },
  { title: "ज़रा ज़रा टच मी", artist: "मोनाली ठाकुर", duration: "04:31", color: "#9b5de5" },
];

const modes: Record<PlaylistMode, {
  label: string;
  eyebrow: string;
  title: string;
  hindi: string;
  description: string;
  accent: string;
  soft: string;
  chip: string;
  sticker: string;
  cardLabel: string;
}> = {
  driver: {
    label: "बस ड्राइवर",
    eyebrow: "पहाड़ी रूट · खुली छत",
    title: "बादलों के पार, सफ़र जारी है",
    hindi: "लद्दाख की राहों में",
    description: "खुली छत, ठंडी हवा और पहाड़ों का हर मोड़ — हर गाना एक नया नज़ारा है।",
    accent: "#e76f51",
    soft: "#ffe0c2",
    chip: "लेह, लद्दाख",
    sticker: "सुरक्षित सफ़र",
    cardLabel: "रूट / लेह-मनाली",
  },
  party: {
    label: "पार्टी मोड",
    eyebrow: "गोवा बीच · ढलते सूरज के साथ",
    title: "आज रेत पर नाचेंगे सब",
    hindi: "समंदर किनारे की धुन",
    description: "लहरों की आवाज़, बोनफायर की चिंगारी और पैरों तले रेत — यहाँ हर रात एक जश्न है।",
    accent: "#d7263d",
    soft: "#ffb4b4",
    chip: "अंजुना बीच, गोवा",
    sticker: "बेफिक्र रातें",
    cardLabel: "साइड ए / डांस",
  },
  rainy: {
    label: "बारिश का मौसम",
    eyebrow: "मानसून रेडियो · रात ८ बजे के बाद",
    title: "बारिश को साथ गाने दो",
    hindi: "बारिश की रात",
    description: "हल्की रोशनी, गीली सड़कें और वो गाने जो हर पुरानी याद को याद रखते हैं।",
    accent: "#2a6f97",
    soft: "#b9d9df",
    chip: "वायनाड, केरल",
    sticker: "बारिश / रिपीट",
    cardLabel: "रात / २००७",
  },
  ghazal: {
    label: "ग़ज़ल मोड",
    eyebrow: "रात की बस · ग़ज़ल की महफ़िल",
    title: "हर शेर में एक कहानी है",
    hindi: "रात की महफ़िल",
    description: "बर्थ की टिमटिमाती बत्ती, शीशे पर बारिश की बूँदें और ग़ज़लें जो नींद से पहले दिल को छू जाएँ।",
    accent: "#c9974a",
    soft: "#f0dcae",
    chip: "आगरा कैंट",
    sticker: "देर रात / ग़ज़ल",
    cardLabel: "बर्थ / सात",
  },
};

const modeOrder: PlaylistMode[] = ["driver", "rainy", "party", "ghazal"];

function ModeIcon({ mode }: { mode: PlaylistMode }) {
  if (mode === "driver") return <BusFront size={16} />;
  if (mode === "party") return <Sparkles size={16} />;
  if (mode === "ghazal") return <Moon size={16} />;
  return <Droplets size={16} />;
}

function NowCard({ mode, active }: { mode: PlaylistMode; active: Song }) {
  const current = modes[mode];
  return (
    <div className="now-card" aria-label={`${active.title} अभी बज रहा है`}>
      <span className="art-sticker">{current.sticker}</span>
      <div className="now-card-top"><span>{current.cardLabel}</span></div>
      <div className="now-card-disc">
        {mode === "driver" && <BusFront className="now-card-icon" size={54} strokeWidth={1.2} />}
        {mode === "party" && <Disc3 className="now-card-icon art-spin" size={62} strokeWidth={1.1} />}
        {mode === "rainy" && <Waves className="now-card-icon" size={58} strokeWidth={1.1} />}
        {mode === "ghazal" && <Moon className="now-card-icon" size={54} strokeWidth={1.1} />}
      </div>
      <div className="now-card-title">{active.title}</div>
      <span className="now-card-sub">{active.artist} · {active.duration}</span>
    </div>
  );
}

export function IndianPlaylist({ mode: initialMode = "rainy" }: { mode?: PlaylistMode }) {
  const [mode, setMode] = useState<PlaylistMode>(initialMode);
  const [playing, setPlaying] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [volume, setVolume] = useState(68);
  const current = modes[mode];
  const active = songs[activeIndex];
  const tint = useMemo(() => ({ "--mode-accent": current.accent, "--mode-soft": current.soft } as CSSProperties), [current]);

  const next = () => setActiveIndex((i) => (i + 1) % songs.length);
  const previous = () => setActiveIndex((i) => (i - 1 + songs.length) % songs.length);

  const modeIndex = modeOrder.indexOf(mode);
  const nextMode = () => setMode(modeOrder[(modeIndex + 1) % modeOrder.length]);
  const prevMode = () => setMode(modeOrder[(modeIndex - 1 + modeOrder.length) % modeOrder.length]);

  const swipeStartX = useRef<number | null>(null);
  const isSwipeGuarded = (target: EventTarget | null) =>
    (target as HTMLElement).closest?.(".now-playing, .now-card, .mode-dots, .edge-nav");

  // touch / mouse-drag swipe
  const onSwipeDown = (e: ReactPointerEvent<HTMLElement>) => {
    if (isSwipeGuarded(e.target)) return;
    swipeStartX.current = e.clientX;
  };
  const onSwipeUp = (e: ReactPointerEvent<HTMLElement>) => {
    if (swipeStartX.current == null) return;
    const dx = e.clientX - swipeStartX.current;
    swipeStartX.current = null;
    if (dx <= -60) nextMode();
    else if (dx >= 60) prevMode();
  };
  const onSwipeCancel = () => { swipeStartX.current = null; };

  // trackpad two-finger swipe fires wheel events with deltaX, not pointer drags
  const wheelLocked = useRef(false);
  const onWheelSwipe = (e: ReactWheelEvent<HTMLElement>) => {
    if (isSwipeGuarded(e.target)) return;
    if (Math.abs(e.deltaX) < 24 || Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
    if (wheelLocked.current) return;
    wheelLocked.current = true;
    if (e.deltaX > 0) nextMode(); else prevMode();
    window.setTimeout(() => { wheelLocked.current = false; }, 550);
  };

  return (
    <main
      className={`indian-playlist mode-${mode}`}
      style={tint}
      onPointerDown={onSwipeDown}
      onPointerUp={onSwipeUp}
      onPointerCancel={onSwipeCancel}
      onWheel={onWheelSwipe}
    >
      <SceneStage mode={mode} />
      <div className="scene-scrim scene-scrim-left" />
      <div className="scene-scrim scene-scrim-edges" />
      <div className="grain" />

      <header className="topbar">
        <div className="brand-mark"><span>रास्ता</span><b>रेडियो</b></div>
        <div className="live-pill"><span className="live-dot" /> बस में लाइव</div>
        <button className="menu-button" aria-label="मेनू खोलें"><Menu size={21} /></button>
      </header>

      <nav className="mode-dots" aria-label="मोड चुनें">
        <span className="mode-current"><ModeIcon mode={mode} />{current.label}</span>
        <span className="mode-dot-row">
          {modeOrder.map((key) => (
            <button key={key} className={`mode-dot ${mode === key ? "mode-dot-active" : ""}`} onClick={() => setMode(key)} aria-label={modes[key].label} />
          ))}
        </span>
      </nav>

      <button className="edge-nav edge-nav-prev" onClick={prevMode} aria-label="पिछला मोड"><ChevronLeft size={20} /></button>
      <button className="edge-nav edge-nav-next" onClick={nextMode} aria-label="अगला मोड"><ChevronRight size={20} /></button>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-line" />{current.eyebrow}</p>
          <h1>{current.title}</h1>
          <div className="hindi-title">{current.hindi}</div>
          <p className="description">{current.description}</p>
          <div className="route-chip"><MapPin size={15} /><span>{current.chip}</span><ChevronDown size={15} /></div>
        </div>
        <div className="hero-art"><NowCard mode={mode} active={active} /></div>
      </section>

      <footer className="now-playing">
        <div className="now-art" style={{ background: active.color }}><Disc3 size={22} /></div>
        <div className="now-copy"><span>अभी बज रहा है</span><strong>{active.title}</strong><small>{active.artist}</small></div>
        {playing && <span className="player-eq" aria-hidden="true"><i /><i /><i /></span>}
        <div className="player-controls">
          <button onClick={previous} aria-label="पिछला गाना"><SkipBack size={18} fill="currentColor" /></button>
          <button className="play-button" onClick={() => setPlaying(!playing)} aria-label={playing ? "रोकें" : "चलाएँ"}>
            {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
          </button>
          <button onClick={next} aria-label="अगला गाना"><SkipForward size={18} fill="currentColor" /></button>
        </div>
        <div className="player-volume">
          <Volume2 size={15} />
          <input type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(Number(e.target.value))} aria-label="आवाज़" />
        </div>
        <Repeat2 className="player-repeat" size={16} />
        <button className="close-player" aria-label="प्लेयर बंद करें" onClick={() => setPlaying(false)}><X size={16} /></button>
      </footer>
    </main>
  );
}

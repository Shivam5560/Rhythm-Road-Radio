import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from "react";
import {
  BusFront,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Droplets,
  ListMusic,
  MapPin,
  Menu,
  Moon,
  Pause,
  Play,
  Shuffle,
  SkipBack,
  SkipForward,
  Sparkles,
  Volume2,
} from "lucide-react";
import "./indian-playlist.css";
import { SceneStage, plates } from "./Scene";
import { PlaylistSheet } from "./PlaylistSheet";
import { useYouTubePlayer } from "../../../hooks/useYouTubePlayer";
import { useOnlineCount } from "../../../hooks/useOnlineCount";
import { formatTime } from "../../../lib/formatTime";
import { toDevanagariDigits } from "../../../lib/devanagariDigits";
import { driverTracks } from "../../../data/tracks.driver";
import { rainyTracks } from "../../../data/tracks.rainy";
import { partyTracks } from "../../../data/tracks.party";
import { ghazalTracks } from "../../../data/tracks.ghazal";

export type PlaylistMode = "driver" | "party" | "rainy" | "ghazal";

/**
 * One Devanagari word carries each mode, with a single quiet line under it.
 *
 * The plates say everything the old eyebrow, second title and paragraph were
 * saying in words — restating it three more ways is what made the hero read
 * busy. Accents are re-pulled from each plate's own dominant light so the
 * chrome tints with the picture instead of against it.
 */
export const modes: Record<PlaylistMode, {
  label: string;
  title: string;
  line: string;
  accent: string;
  soft: string;
  chip: string;
  cardLabel: string;
  playlistId: string;
}> = {
  driver: {
    label: "बस ड्राइवर",
    title: "सफ़र",
    line: "खुली छत, ठंडी हवा, पहाड़ का हर मोड़।",
    accent: "#e2673f",
    soft: "#ffe0c2",
    chip: "लेह–मनाली",
    cardLabel: "रूट",
    playlistId: "PL0umg_TNpoZTTdZVIi5tfX69pRmoMFGna",
  },
  party: {
    label: "पार्टी मोड",
    title: "जश्न",
    line: "ढलता सूरज, जलती आग, पैरों तले रेत।",
    accent: "#f2884b",
    soft: "#ffb4b4",
    chip: "अंजुना, गोवा",
    cardLabel: "साइड ए",
    playlistId: "PLfcRxVaMQ7ZM",
  },
  rainy: {
    label: "बारिश का मौसम",
    title: "बारिश",
    line: "भीगा रास्ता, उतरता कोहरा, धीमी धुन।",
    accent: "#7fa08a",
    soft: "#b9d9df",
    chip: "वायनाड, केरल",
    cardLabel: "मानसून",
    playlistId: "PL43tsEhYIdTuf-xO_4ZrZtRp1dwulm2SQ",
  },
  ghazal: {
    label: "ग़ज़ल मोड",
    title: "महफ़िल",
    line: "बर्थ की बत्ती, शीशे पर बूँदें, एक शेर।",
    accent: "#e0a44f",
    soft: "#f0dcae",
    chip: "आगरा कैंट",
    cardLabel: "बर्थ",
    playlistId: "PL43tsEhYIdTvnK96MqsVkXV90fQFcsdoN",
  },
};

const modeOrder: PlaylistMode[] = ["driver", "rainy", "party", "ghazal"];

const trackMapByMode = {
  driver: driverTracks,
  rainy: rainyTracks,
  party: partyTracks,
  ghazal: ghazalTracks,
};

function ModeIcon({ mode }: { mode: PlaylistMode }) {
  if (mode === "driver") return <BusFront size={16} />;
  if (mode === "party") return <Sparkles size={16} />;
  if (mode === "ghazal") return <Moon size={16} />;
  return <Droplets size={16} />;
}

/* The floating now-card was removed: it covered the best part of every plate
 * and duplicated, in a bigger and worse-looking form, everything the player bar
 * already says. Its one good idea — art cut from the mode's own plate — moved
 * into the player's thumbnail. */

export function IndianPlaylist({ mode: initialMode = "driver" }: { mode?: PlaylistMode }) {
  const [mode, setMode] = useState<PlaylistMode>(initialMode);
  const current = modes[mode];
  const tint = useMemo(() => ({ "--mode-accent": current.accent, "--mode-soft": current.soft } as CSSProperties), [current]);

  const player = useYouTubePlayer(current.playlistId, trackMapByMode[mode]);
  const online = useOnlineCount();

  // While a playlist swap is in flight the player still reports the outgoing
  // mode's video, which the new mode's curated map can't name — showing it
  // would flash the previous song (as a raw English title) mid-switch.
  const trackTitle = player.isSwitching ? "धुन बदल रही है…" : player.title;
  const trackArtist = player.isSwitching ? current.label : player.artist;

  const modeIndex = modeOrder.indexOf(mode);
  const nextMode = () => setMode(modeOrder[(modeIndex + 1) % modeOrder.length]);
  const prevMode = () => setMode(modeOrder[(modeIndex - 1 + modeOrder.length) % modeOrder.length]);

  const [isQueueOpen, setQueueOpen] = useState(false);
  const [queueIds, setQueueIds] = useState<string[]>([]);
  useEffect(() => {
    if (!isQueueOpen) return;
    // The queue can't be read until the mode's playlist has actually landed in
    // the player, which may still be in flight when the sheet opens — so keep
    // asking rather than sampling once and showing an empty list forever.
    const sync = () => {
      const queue = player.getQueue();
      setQueueIds(queue);
      return queue.length > 0;
    };
    if (sync()) return;
    const timer = window.setInterval(() => {
      if (sync()) window.clearInterval(timer);
    }, 400);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isQueueOpen, mode]);
  useEffect(() => {
    setQueueOpen(false);
  }, [mode]);

  const swipeStartX = useRef<number | null>(null);
  const isSwipeGuarded = (target: EventTarget | null) =>
    (target as HTMLElement).closest?.(".now-playing, .now-card, .mode-dots, .edge-nav, .sheet-overlay");

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

  const progressTrackRef = useRef<HTMLDivElement | null>(null);
  const [scrubFraction, setScrubFraction] = useState<number | null>(null);
  const fractionFromPointer = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = progressTrackRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
    return rect.width ? x / rect.width : 0;
  };
  const onProgressPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setScrubFraction(fractionFromPointer(e));
  };
  const onProgressPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (scrubFraction === null) return;
    setScrubFraction(fractionFromPointer(e));
  };
  const onProgressPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (scrubFraction === null) return;
    const fraction = fractionFromPointer(e);
    setScrubFraction(null);
    if (player.duration) player.seekTo(fraction * player.duration);
  };

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
        {/* The count only appears once presence has actually answered. If the
            store is not provisioned the pill quietly stays as it was — an
            invented "online" number would be worse than none. */}
        <div className="live-pill" aria-live="polite">
          <span className="live-dot" />
          {online !== null && <b className="live-count">{toDevanagariDigits(String(online))}</b>}
          रास्ते पर लाइव
        </div>
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
          <h1>{current.title}</h1>
          <p className="hero-line">{current.line}</p>
          <div className="route-chip"><MapPin size={15} /><span>{current.chip}</span><ChevronDown size={15} /></div>
        </div>
      </section>

      <footer className="now-playing">
        <div className="player-row">
          <button
            className="now-art"
            style={{ backgroundImage: `url(${plates[mode]})` }}
            onClick={() => setQueueOpen(true)}
            aria-label="पूरी प्लेलिस्ट देखें"
          />
          <button className={`now-copy ${player.isSwitching ? "is-switching" : ""}`} onClick={() => setQueueOpen(true)} aria-label="पूरी प्लेलिस्ट देखें">
            <strong>{trackTitle}</strong><small>{trackArtist}</small>
          </button>

          <div className="player-controls">
            <button onClick={player.previous} aria-label="पिछला गाना"><SkipBack size={17} fill="currentColor" /></button>
            <button className="play-button" onClick={player.isPlaying ? player.pause : player.play} aria-label={player.isPlaying ? "रोकें" : "चलाएँ"}>
              {player.isPlaying ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}
            </button>
            <button onClick={player.next} aria-label="अगला गाना"><SkipForward size={17} fill="currentColor" /></button>
          </div>

          <div className="player-meta">
            <button className={`player-icon ${player.shuffled ? "is-on" : ""}`} onClick={player.toggleShuffle} aria-label={player.shuffled ? "शफ़ल बंद करें" : "शफ़ल करें"}>
              <Shuffle size={15} />
            </button>
            {/* Volume stays collapsed until the player is hovered — it is the
                least-used control and was taking the most horizontal room. */}
            <div className="player-volume">
              <Volume2 size={15} />
              <input type="range" min="0" max="100" defaultValue={68} onChange={(e) => player.setVolume(Number(e.target.value))} aria-label="आवाज़" />
            </div>
            <button className="player-icon" onClick={() => setQueueOpen(true)} aria-label="पूरी प्लेलिस्ट देखें">
              <ListMusic size={16} />
            </button>
          </div>
        </div>

        {/* Seek sits UNDER the transport, not above the artwork. Floated on top
            it read as a detached line with no owner; anchored beneath the
            controls it belongs to them, which is also where every music player
            has trained people to look for it. Times flank the track on every
            breakpoint — a hover-only hairline gives no readable position and
            never appears at all on touch. */}
        <div className="player-seek-row">
          <span className="player-time">
            {toDevanagariDigits(formatTime(scrubFraction !== null ? scrubFraction * player.duration : player.currentTime))}
          </span>
          <div
            className="player-seek"
            ref={progressTrackRef}
            onPointerDown={onProgressPointerDown}
            onPointerMove={onProgressPointerMove}
            onPointerUp={onProgressPointerUp}
            onPointerCancel={onProgressPointerUp}
            role="slider"
            tabIndex={0}
            aria-label="प्रगति"
            aria-valuemin={0}
            aria-valuemax={player.duration}
            aria-valuenow={player.currentTime}
          >
            <span
              className="player-seek-fill"
              style={{ width: `${scrubFraction !== null ? scrubFraction * 100 : player.duration ? (player.currentTime / player.duration) * 100 : 0}%` }}
            />
          </div>
          <span className="player-time">{toDevanagariDigits(formatTime(player.duration))}</span>
        </div>
      </footer>

      <PlaylistSheet
        open={isQueueOpen}
        onClose={() => setQueueOpen(false)}
        queueIds={queueIds}
        trackMap={trackMapByMode[mode]}
        currentVideoId={player.videoId}
        onSelect={(index) => { player.playIndex(index); setQueueOpen(false); }}
        heading={`प्लेलिस्ट · ${current.label}`}
      />
    </main>
  );
}

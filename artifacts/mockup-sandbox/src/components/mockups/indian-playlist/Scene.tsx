import type { PlaylistMode } from "./IndianPlaylist";

/**
 * Full-bleed cinematic backdrops, doodled rather than flat-vector: every
 * silhouette runs through a hand-wobble filter and carries a visible ink
 * outline, in the spirit of a sketched travel journal, not a geometric icon
 * set. One camera language across all four worlds (eye-level, layered
 * depth, soft distant blur) so switching modes feels like turning a page of
 * the same illustrated diary. Left/upper-left stays quiet for hero copy.
 */

function DoodleDefs() {
  return (
    <defs>
      <filter id="doodle-wobble-lg" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.009" numOctaves="2" seed="7" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="10" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <filter id="doodle-wobble-sm" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="4" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>
  );
}

function Sparkle({ x, y, s = 1, color = "#ffffff" }: { x: number; y: number; s?: number; color?: string }) {
  return (
    <path
      d={`M${x} ${y - 10 * s} L${x + 2.4 * s} ${y - 2.4 * s} L${x + 10 * s} ${y} L${x + 2.4 * s} ${y + 2.4 * s} L${x} ${y + 10 * s} L${x - 2.4 * s} ${y + 2.4 * s} L${x - 10 * s} ${y} L${x - 2.4 * s} ${y - 2.4 * s} Z`}
      fill={color}
      opacity="0.85"
    />
  );
}

/* ================= BUS DRIVER — open-top bus, Leh-Manali highway ================= */

const ladakhPeaks = [
  "M-60 420 L60 200 L180 340 L320 160 L470 360 L620 220 L760 400 L-60 400 Z",
  "M-60 480 L120 300 L260 420 L420 260 L600 440 L800 320 L900 480 L-60 480 Z",
];
const ladakhNearRidge = "M-60 560 L180 380 L360 500 L560 340 L780 520 L1000 400 L1220 540 L1650 420 L1650 900 L-60 900 Z";

const prayerFlags = Array.from({ length: 13 }, (_, i) => i);
const flagHues = ["#3fb6c9", "#ffffff", "#e8534b", "#3f9c5c", "#f6c445"];

const switchbackDots = [
  { x: 260, y: 560 }, { x: 340, y: 596 }, { x: 420, y: 566 },
];

function BusDriverScene() {
  return (
    <svg className="scene-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" role="img" aria-label="Open-top tourist bus on a mountain highway through Ladakh, snow peaks and prayer flags overhead">
      <DoodleDefs />
      <defs>
        <linearGradient id="ld-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bcd6ea" />
          <stop offset="55%" stopColor="#eadfca" />
          <stop offset="100%" stopColor="#f7ecd8" />
        </linearGradient>
        <radialGradient id="ld-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff9ec" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ffe9b8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ld-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8eef4" />
          <stop offset="100%" stopColor="#c3d2e0" />
        </linearGradient>
        <linearGradient id="ld-near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8fa6bb" />
          <stop offset="100%" stopColor="#5c7286" />
        </linearGradient>
        <linearGradient id="ld-road" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d8c9a6" />
          <stop offset="100%" stopColor="#a68f63" />
        </linearGradient>
        <linearGradient id="ld-bus" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8534b" />
          <stop offset="100%" stopColor="#b23a34" />
        </linearGradient>
        <filter id="ld-blur"><feGaussianBlur stdDeviation="4" /></filter>
      </defs>

      <rect width="1600" height="900" fill="url(#ld-sky)" />
      <circle cx="1250" cy="220" r="200" fill="url(#ld-sun)" />

      <g filter="url(#doodle-wobble-lg)" opacity="0.55">
        <path d={ladakhPeaks[0]} fill="url(#ld-far)" />
      </g>
      <g filter="url(#doodle-wobble-lg)">
        <path d={ladakhPeaks[1]} fill="url(#ld-far)" opacity="0.8" />
        {[140, 300, 470, 640].map((x, i) => (
          <path key={i} d={`M${x} ${420 - (i % 2) * 40} l14 -26 l14 26 Z`} fill="#f7fbff" opacity="0.9" />
        ))}
      </g>

      {/* chorten + prayer flags strung across the ridge */}
      <g transform="translate(200,340)" filter="url(#doodle-wobble-sm)">
        <rect x="-16" y="10" width="32" height="26" fill="#e9dfc6" stroke="#8a7a52" strokeWidth="2" />
        <path d="M-20 10 L20 10 L0 -14 Z" fill="#e9dfc6" stroke="#8a7a52" strokeWidth="2" />
        <circle cx="0" cy="-22" r="5" fill="#c9974a" />
        <line x1="0" y1="-27" x2="0" y2="-40" stroke="#8a7a52" strokeWidth="2" />
      </g>
      <path d="M180 320 Q460 260 760 330" stroke="#5c4a2c" strokeWidth="2.5" fill="none" opacity="0.7" />
      {prayerFlags.map((i) => {
        const t = i / (prayerFlags.length - 1);
        const x = 180 + (760 - 180) * t;
        const y = 320 + (330 - 320) * t + Math.sin(t * Math.PI) * 22;
        return <path key={i} d={`M${x} ${y} l-9 16 h18 Z`} fill={flagHues[i % flagHues.length]} opacity="0.85" />;
      })}

      <g filter="url(#doodle-wobble-lg)">
        <path d={ladakhNearRidge} fill="url(#ld-near)" />
      </g>
      {[520, 700, 900].map((x, i) => (
        <path key={i} d={`M${x} ${560 + i * 10} l40 24 l-40 44 l-40 -44 Z`} fill="#4f7fa3" opacity="0.55" filter="url(#doodle-wobble-sm)" />
      ))}

      {/* winding highway with hairpins, small dot-vehicle for scale */}
      <path d="M-60 900 Q260 700 340 620 Q420 540 340 500 Q260 460 380 400 Q480 350 620 320" stroke="url(#ld-road)" strokeWidth="58" fill="none" strokeLinecap="round" filter="url(#doodle-wobble-sm)" />
      <path d="M-60 900 Q260 700 340 620 Q420 540 340 500 Q260 460 380 400 Q480 350 620 320" stroke="#8a7550" strokeWidth="3" strokeDasharray="14 14" fill="none" opacity="0.6" />
      {switchbackDots.map((d, i) => (
        <rect key={i} x={d.x - 5} y={d.y - 4} width="10" height="7" rx="1.5" fill="#3a3020" opacity="0.6" />
      ))}

      {/* === open-top bus, foreground, doodled === */}
      <g transform="translate(430,900)" filter="url(#doodle-wobble-sm)">
        <path d="M-330 0 L-330 -190 Q-330 -216 -300 -216 L260 -216 Q292 -216 292 -186 L292 0 Z" fill="url(#ld-bus)" stroke="#5c1a16" strokeWidth="6" />
        <path d="M-300 -216 L260 -216 Q292 -216 292 -186 L292 -170 L-330 -170 L-330 -190 Q-330 -216 -300 -216 Z" fill="#f3d9a8" opacity="0.9" />
        {[-260, -180, -100, -20, 60, 140, 220].map((x, i) => (
          <rect key={i} x={x} y="-150" width="56" height="70" rx="8" fill="#f3d9a8" stroke="#5c1a16" strokeWidth="4" />
        ))}
        {/* passengers above the open rail, a couple waving */}
        {[-230, -150, -60, 30, 110, 190].map((x, i) => (
          <g key={i} transform={`translate(${x},-216)`}>
            <circle cx="0" cy="-14" r="13" fill="#241814" />
            <path d="M-12 4 Q0 -10 12 4" fill="#241814" />
            {i % 3 === 0 && <path d="M12 -6 L30 -34" stroke="#241814" strokeWidth="6" strokeLinecap="round" />}
          </g>
        ))}
        <rect x="-300" y="-60" width="592" height="70" rx="6" fill="#a12e28" stroke="#5c1a16" strokeWidth="5" />
        {[-260, -180, -100, -20, 60, 140, 220].map((x, i) => (
          <rect key={i} x={x} y="-56" width="56" height="60" rx="6" fill="#f3d9a8" stroke="#5c1a16" strokeWidth="3.5" opacity="0.85" />
        ))}
        <rect x="-330" y="0" width="622" height="26" fill="#3a1310" />
        <circle cx="-230" cy="30" r="34" fill="#1c120f" stroke="#5c1a16" strokeWidth="5" />
        <circle cx="-230" cy="30" r="12" fill="#8a7550" />
        <circle cx="160" cy="30" r="34" fill="#1c120f" stroke="#5c1a16" strokeWidth="5" />
        <circle cx="160" cy="30" r="12" fill="#8a7550" />
        <circle cx="-300" cy="-190" r="16" fill="#f6e6b0" stroke="#5c1a16" strokeWidth="3" />
        {/* route board */}
        <rect x="-260" y="-244" width="120" height="24" rx="4" fill="#241814" stroke="#8a7550" strokeWidth="2" />
        {/* roof rack luggage */}
        <rect x="-40" y="-232" width="70" height="20" rx="4" fill="#5c4a2c" stroke="#3a2c18" strokeWidth="2.5" />
        <rect x="40" y="-236" width="46" height="24" rx="4" fill="#8a5a3a" stroke="#3a2c18" strokeWidth="2.5" />
        {/* spare wheel on the back */}
        <circle cx="270" cy="-90" r="26" fill="#1c120f" stroke="#5c1a16" strokeWidth="4" />
      </g>

      <radialGradient id="ld-vignette" cx="46%" cy="60%" r="80%">
        <stop offset="55%" stopColor="#2a2010" stopOpacity="0" />
        <stop offset="100%" stopColor="#2a2010" stopOpacity="0.4" />
      </radialGradient>
      <rect width="1600" height="900" fill="url(#ld-vignette)" />
    </svg>
  );
}

/* ================= RAINY SEASON — Western Ghats trek, doodled ================= */

const rainForestSpecks = (count: number, xStart: number, xEnd: number, y: number, spread: number) =>
  Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    return { x: xStart + (xEnd - xStart) * t, y: y - Math.sin(t * Math.PI * 3) * spread };
  });

const rainMistBands = [
  { y: 300, w: 1700, h: 40, delay: "0s" },
  { y: 400, w: 1500, h: 34, delay: "2.4s" },
  { y: 470, w: 1650, h: 46, delay: "1.1s" },
];
const rainDrops = Array.from({ length: 16 }, (_, i) => ({ x: (i * 97 + 40) % 1600, delay: `${(i % 8) * 0.18}s`, len: 60 + (i % 4) * 18 }));

function RainyScene() {
  const backSpecks = rainForestSpecks(20, 40, 900, 430, 14);
  const midSpecks = rainForestSpecks(24, 500, 1580, 560, 20);
  return (
    <svg className="scene-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" role="img" aria-label="Misty Western Ghats trail after monsoon rainfall, viewed from a trekking viewpoint">
      <DoodleDefs />
      <defs>
        <linearGradient id="rain-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#b9c9c4" /><stop offset="45%" stopColor="#8fb0ae" /><stop offset="100%" stopColor="#3f6f6b" /></linearGradient>
        <linearGradient id="rain-far" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7fa39f" /><stop offset="100%" stopColor="#628c86" /></linearGradient>
        <linearGradient id="rain-mid" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4c7c76" /><stop offset="100%" stopColor="#325c57" /></linearGradient>
        <linearGradient id="rain-near" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#274946" /><stop offset="100%" stopColor="#122624" /></linearGradient>
        <linearGradient id="rain-trail" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#cbb789" /><stop offset="100%" stopColor="#8f7a52" /></linearGradient>
        <filter id="rain-blur-far"><feGaussianBlur stdDeviation="6" /></filter>
        <filter id="rain-blur-mid"><feGaussianBlur stdDeviation="2.4" /></filter>
        <radialGradient id="rain-ray" cx="30%" cy="0%" r="80%"><stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" /><stop offset="100%" stopColor="#ffffff" stopOpacity="0" /></radialGradient>
      </defs>

      <rect width="1600" height="900" fill="url(#rain-sky)" />
      <polygon points="120,0 620,0 300,560 -80,420" fill="url(#rain-ray)" />

      <g filter="url(#doodle-wobble-lg)" opacity="0.8">
        <path d="M-50 460 L120 300 L340 400 L560 260 L820 380 L1050 280 L1300 400 L1650 300 L1650 900 L-50 900 Z" fill="url(#rain-far)" />
      </g>

      <g filter="url(#doodle-wobble-lg)">
        <path d="M-50 560 L200 400 L420 500 L700 360 L980 480 L1250 380 L1650 470 L1650 900 L-50 900 Z" fill="url(#rain-mid)" />
      </g>
      {backSpecks.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r="4.5" fill="#213f3a" opacity="0.55" />)}
      <path d="M640 380 Q636 460 646 560 Q650 620 636 680" stroke="#eaf5f0" strokeWidth="5" opacity="0.55" fill="none" filter="url(#doodle-wobble-sm)" />

      <g opacity="0.55">
        {rainMistBands.map((m, i) => (
          <rect key={i} className="rain-mist-band" x={-100} y={m.y} width={m.w} height={m.h} rx={m.h / 2} fill="#eef6f2" style={{ animationDelay: m.delay }} filter="url(#rain-blur-far)" />
        ))}
      </g>

      <g filter="url(#doodle-wobble-lg)">
        <path d="M-50 640 L260 520 L520 610 L760 470 L1080 590 L1650 520 L1650 900 L-50 900 Z" fill="url(#rain-near)" />
      </g>
      {midSpecks.map((s, i) => <path key={i} d={`M${s.x} ${s.y} l-9 16 h18 Z`} fill="#0d201d" opacity="0.6" />)}

      <g opacity="0.92" filter="url(#doodle-wobble-sm)">
        <rect x="0" y="700" width="1600" height="14" fill="#4a3722" />
        {Array.from({ length: 17 }, (_, i) => <rect key={i} x={i * 100} y="640" width="12" height="76" fill="#4a3722" />)}
        {[0, 1].map((i) => <rect key={i} x="0" y={648 + i * 26} width="1600" height="6" fill="#3a2c1a" />)}
      </g>

      <path d="M980 900 Q900 760 1020 700 Q1120 650 1060 590 Q1010 540 1080 480" stroke="url(#rain-trail)" strokeWidth="46" fill="none" strokeLinecap="round" opacity="0.85" filter="url(#doodle-wobble-sm)" />
      <g transform="translate(1050,640)" opacity="0.9"><path d="M-10 34 Q-12 8 0 0 Q12 8 10 34 Z" fill="#1d2a28" /><circle cx="0" cy="-8" r="8" fill="#1d2a28" /><path d="M6 0 l14 -20" stroke="#1d2a28" strokeWidth="4" strokeLinecap="round" /></g>
      <g transform="translate(1010,560) scale(0.8)" opacity="0.85"><path d="M-10 34 Q-12 8 0 0 Q12 8 10 34 Z" fill="#1d2a28" /><circle cx="0" cy="-8" r="8" fill="#1d2a28" /></g>

      <g filter="url(#doodle-wobble-sm)">
        <path d="M-40 900 L60 760 L220 820 L120 900 Z" fill="#1a2e2c" />
        <path d="M-10 900 L60 800 L120 900 Z" fill="#eaf5f0" opacity="0.12" />
        <path d="M1400 900 L1500 780 L1650 830 L1650 900 Z" fill="#16302c" />
        {[[70, 800], [110, 830], [1450, 810], [1500, 840]].map((m, i) => <circle key={i} cx={m[0]} cy={m[1]} r="14" fill="#3d5a34" opacity="0.7" />)}
        {[[180, 850], [1560, 860], [40, 870]].map((f, i) => (
          <g key={i} transform={`translate(${f[0]},${f[1]})`}>
            <line x1="0" y1="0" x2="0" y2="26" stroke="#3d5a34" strokeWidth="3" />
            {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx={Math.cos((a * Math.PI) / 180) * 7} cy={-Math.sin((a * Math.PI) / 180) * 7} rx="6" ry="3.4" fill="#e7c8d8" transform={`rotate(${a})`} />)}
          </g>
        ))}
        <g transform="translate(280,760) rotate(-4)"><rect x="-6" y="0" width="12" height="90" fill="#5c4326" /><path d="M-46 -10 L46 -10 L36 34 L-36 34 Z" fill="#7a5c34" stroke="#3a2a14" strokeWidth="3" /><path d="M-24 8 L24 8" stroke="#e9d9b6" strokeWidth="5" /></g>
      </g>

      {rainDrops.map((d, i) => <line key={i} className="rain-drop" x1={d.x} y1={-40} x2={d.x - 26} y2={-40 + d.len} stroke="#eaf5f0" strokeWidth="2.4" opacity="0.55" style={{ animationDelay: d.delay }} />)}

      <radialGradient id="rain-vignette" cx="45%" cy="60%" r="78%"><stop offset="55%" stopColor="#04120f" stopOpacity="0" /><stop offset="100%" stopColor="#04120f" stopOpacity="0.5" /></radialGradient>
      <rect width="1600" height="900" fill="url(#rain-vignette)" />
    </svg>
  );
}

/* ================= PARTY — Goa beach at dusk, doodled ================= */

const goaCrowd = Array.from({ length: 16 }, (_, i) => ({ x: 40 + i * 96 + ((i * 37) % 30), raised: i % 3 === 0 }));
const goaLights = Array.from({ length: 14 }, (_, i) => i);
const goaShells = [{ x: 120, y: 840 }, { x: 260, y: 870 }, { x: 1420, y: 850 }, { x: 1540, y: 820 }];

function PartyScene() {
  return (
    <svg className="scene-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" role="img" aria-label="Goa beach party at dusk with palm trees, bonfire, string lights and dancers on the sand">
      <DoodleDefs />
      <defs>
        <linearGradient id="goa-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2c1b45" /><stop offset="45%" stopColor="#7a3159" /><stop offset="80%" stopColor="#e8734a" /><stop offset="100%" stopColor="#f6b84b" /></linearGradient>
        <radialGradient id="goa-sun" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#ffe9b0" stopOpacity="0.95" /><stop offset="100%" stopColor="#ffb84f" stopOpacity="0" /></radialGradient>
        <linearGradient id="goa-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#c9527a" /><stop offset="100%" stopColor="#3a2450" /></linearGradient>
        <linearGradient id="goa-sand" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2e1c30" /><stop offset="100%" stopColor="#170c1c" /></linearGradient>
        <filter id="goa-blur"><feGaussianBlur stdDeviation="8" /></filter>
      </defs>

      <rect width="1600" height="900" fill="url(#goa-sky)" />
      <circle cx="800" cy="520" r="220" fill="url(#goa-sun)" />
      <circle cx="800" cy="520" r="86" fill="#ffe9b0" opacity="0.92" />

      {/* sea + horizon with doodled wave crests */}
      <rect x="0" y="520" width="1600" height="120" fill="url(#goa-sea)" />
      <path d="M0 540 Q40 528 80 540 T160 540 T240 540 T320 540 T400 540 T480 540 T560 540 T640 540 T720 540 T800 540 T880 540 T960 540 T1040 540 T1120 540 T1200 540 T1280 540 T1360 540 T1440 540 T1520 540 T1600 540" stroke="#ffd9c2" strokeWidth="3" fill="none" opacity="0.5" filter="url(#doodle-wobble-sm)" />

      {/* sand */}
      <path d="M-60 900 L-60 600 Q400 540 800 610 Q1200 680 1660 590 L1660 900 Z" fill="url(#goa-sand)" filter="url(#doodle-wobble-lg)" />

      {/* palm trees */}
      {[{ x: 200, s: 1.1 }, { x: 1420, s: 1.25 }].map((p, i) => (
        <g key={i} transform={`translate(${p.x},760) scale(${p.s})`} filter="url(#doodle-wobble-sm)">
          <path d="M0 0 Q-16 -80 4 -160" stroke="#2a1a18" strokeWidth="13" fill="none" strokeLinecap="round" />
          <path d="M4 -160 Q-66 -186 -112 -146" stroke="#1e3a24" strokeWidth="9" fill="none" strokeLinecap="round" />
          <path d="M4 -160 Q-30 -208 -42 -168" stroke="#25482c" strokeWidth="9" fill="none" strokeLinecap="round" />
          <path d="M4 -160 Q6 -216 10 -176" stroke="#1e3a24" strokeWidth="9" fill="none" strokeLinecap="round" />
          <path d="M4 -160 Q52 -204 80 -164" stroke="#25482c" strokeWidth="9" fill="none" strokeLinecap="round" />
          <path d="M4 -160 Q90 -180 130 -132" stroke="#1e3a24" strokeWidth="9" fill="none" strokeLinecap="round" />
          <circle cx="4" cy="-160" r="12" fill="#3a2820" />
        </g>
      ))}

      {/* beach shack with string lights */}
      <g transform="translate(1200,660)" filter="url(#doodle-wobble-sm)">
        <path d="M-80 0 L-80 -60 L0 -100 L80 -60 L80 0 Z" fill="#2a1a24" stroke="#4a2c34" strokeWidth="4" />
        <path d="M-90 -56 L0 -108 L90 -56" stroke="#4a2c34" strokeWidth="6" fill="none" strokeLinecap="round" />
        <rect x="-30" y="-40" width="34" height="40" fill="#e8734a" opacity="0.5" />
      </g>
      <path d="M320 600 Q760 540 1120 604" stroke="#3a2830" strokeWidth="2.5" fill="none" />
      {goaLights.map((i) => {
        const t = i / (goaLights.length - 1);
        const x = 320 + (1120 - 320) * t;
        const y = 600 + (604 - 600) * t + Math.sin(t * Math.PI) * 16;
        return <circle key={i} cx={x} cy={y} r="5" fill={["#f6c445", "#e8734a", "#3fb6c9", "#e8534b"][i % 4]} opacity="0.9" />;
      })}

      {/* bonfire with dancers around it */}
      <g transform="translate(760,780)" filter="url(#doodle-wobble-sm)">
        <path d="M0 0 Q-30 -20 -18 -60 Q-6 -40 0 -70 Q6 -40 18 -60 Q30 -20 0 0 Z" fill="#f6a341" stroke="#c9532a" strokeWidth="3" />
        <path d="M0 0 Q-14 -14 -6 -34 Q0 -22 0 -40 Q0 -22 6 -34 Q14 -14 0 0 Z" fill="#ffe08a" opacity="0.9" />
        {[0, 60, 120, 200, 280].map((a) => (
          <rect key={a} x={Math.cos((a * Math.PI) / 180) * 44 - 3} y={Math.sin((a * Math.PI) / 180) * 20} width="6" height="20" fill="#3a2416" transform={`rotate(${a} ${Math.cos((a * Math.PI) / 180) * 44} ${Math.sin((a * Math.PI) / 180) * 20})`} />
        ))}
      </g>
      {goaCrowd.map((p, i) => (
        <g key={i} transform={`translate(${p.x},840)`} opacity="0.92" filter="url(#doodle-wobble-sm)">
          <path d="M-14 0 Q-16 -38 0 -46 Q16 -38 14 0 Z" fill="#1a1018" />
          <circle cx="0" cy="-52" r="10" fill="#1a1018" />
          {p.raised && <path d="M10 -40 L26 -66" stroke="#1a1018" strokeWidth="7" strokeLinecap="round" />}
        </g>
      ))}

      {goaShells.map((s, i) => (
        <path key={i} d={`M${s.x} ${s.y} q10 -14 20 0 q-10 6 -20 0 Z`} fill="#f0dcae" opacity="0.7" />
      ))}
      <Sparkle x={200} y={120} s={1.2} color="#ffe08a" />
      <Sparkle x={1360} y={160} s={0.9} color="#ffe08a" />

      {/* foreground: raised hands + surfboard, cropped at the edge */}
      <g opacity="0.97" filter="url(#doodle-wobble-sm)">
        {[{ x: 90, s: 1.1 }, { x: 1500, s: 1 }].map((h, i) => (
          <g key={i} transform={`translate(${h.x},900) scale(${h.s})`}>
            <path d="M0 0 Q-6 -70 -2 -140" stroke="#150a10" strokeWidth="20" strokeLinecap="round" fill="none" />
            {[-16, -4, 8, 20].map((dx, f) => <line key={f} x1={-2 + dx * 0.4} y1="-140" x2={-2 + dx} y2="-190" stroke="#150a10" strokeWidth="9" strokeLinecap="round" />)}
          </g>
        ))}
        <g transform="translate(1600,760) rotate(8)"><path d="M0 -140 Q34 -70 0 0 Q-34 -70 0 -140 Z" fill="#3fb6c9" stroke="#1c5a63" strokeWidth="4" /><line x1="0" y1="-130" x2="0" y2="-10" stroke="#1c5a63" strokeWidth="2" opacity="0.6" /></g>
      </g>

      <radialGradient id="goa-vignette" cx="50%" cy="55%" r="80%"><stop offset="52%" stopColor="#160a1c" stopOpacity="0" /><stop offset="100%" stopColor="#160a1c" stopOpacity="0.5" /></radialGradient>
      <rect width="1600" height="900" fill="url(#goa-vignette)" />
    </svg>
  );
}

/* ================= GHAZAL — overnight sleeper bus, mehfil by lamplight ================= */

const jaaliCells = (() => {
  const cells: { x: number; y: number }[] = [];
  for (let row = 0; row < 6; row++) for (let col = 0; col < 9; col++) cells.push({ x: 960 + col * 46, y: 40 + row * 46 });
  return cells;
})();

function GhazalScene() {
  return (
    <svg className="scene-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" role="img" aria-label="Overnight sleeper bus berth lit by a small lamp, rain on the window, a harmonium and notebook of couplets nearby">
      <DoodleDefs />
      <defs>
        <linearGradient id="gz-night" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#160a1e" /><stop offset="60%" stopColor="#2a0f1e" /><stop offset="100%" stopColor="#3a1218" /></linearGradient>
        <radialGradient id="gz-lamp" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#ffdca0" stopOpacity="0.85" /><stop offset="100%" stopColor="#ffdca0" stopOpacity="0" /></radialGradient>
        <radialGradient id="gz-moon" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#f3e9c9" stopOpacity="0.9" /><stop offset="100%" stopColor="#f3e9c9" stopOpacity="0" /></radialGradient>
        <linearGradient id="gz-curtain" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#4a1420" /><stop offset="100%" stopColor="#7a1f2c" /></linearGradient>
        <filter id="gz-blur"><feGaussianBlur stdDeviation="5" /></filter>
      </defs>

      <rect width="1600" height="900" fill="url(#gz-night)" />

      {/* jaali window with moon + rain beyond */}
      <g opacity="0.9">
        <circle cx="1250" cy="160" r="230" fill="url(#gz-moon)" />
        <circle cx="1250" cy="160" r="52" fill="#f3e9c9" opacity="0.85" />
        {jaaliCells.map((c, i) => (
          <rect key={i} x={c.x} y={c.y} width="34" height="34" rx="6" fill="none" stroke="#5c2230" strokeWidth="5" opacity="0.8" filter="url(#doodle-wobble-sm)" />
        ))}
        {Array.from({ length: 10 }, (_, i) => (
          <line key={i} className="rain-drop" x1={1000 + i * 60} y1={20} x2={980 + i * 60} y2={80} stroke="#e9d7c8" strokeWidth="2" opacity="0.4" style={{ animationDelay: `${(i % 5) * 0.2}s` }} />
        ))}
      </g>

      {/* curtain drawn to the left */}
      <g filter="url(#doodle-wobble-lg)">
        <path d="M-40 0 L360 0 Q300 240 340 480 Q300 700 380 900 L-40 900 Z" fill="url(#gz-curtain)" opacity="0.92" />
        {[60, 140, 220, 300].map((x, i) => <path key={i} d={`M${x} 0 Q${x - 30} 450 ${x} 900`} stroke="#2a0a14" strokeWidth="3" opacity="0.4" fill="none" />)}
        <path d="M-40 0 L360 0 L400 60 L-40 60 Z" fill="#8a2a38" opacity="0.9" />
      </g>

      {/* lamp glow over the berth */}
      <circle cx="620" cy="560" r="260" fill="url(#gz-lamp)" />
      <g transform="translate(600,600)" filter="url(#doodle-wobble-sm)">
        <rect x="-6" y="0" width="12" height="60" fill="#3a2416" />
        <path d="M-30 -40 L30 -40 L18 0 L-18 0 Z" fill="#ffdca0" stroke="#8a5a2a" strokeWidth="3" opacity="0.9" />
      </g>

      {/* harmonium, foreground, doodled with a few keys */}
      <g transform="translate(1120,760)" filter="url(#doodle-wobble-sm)">
        <path d="M-160 0 L-160 -70 Q-160 -90 -140 -90 L140 -90 Q160 -90 160 -70 L160 0 Z" fill="#5c2230" stroke="#2a0a14" strokeWidth="5" />
        <rect x="-140" y="-70" width="280" height="26" fill="#f3e9c9" stroke="#2a0a14" strokeWidth="2" />
        {Array.from({ length: 18 }, (_, i) => <rect key={i} x={-140 + i * 15.5} y="-70" width="14" height="26" fill={i % 3 === 0 ? "#2a0a14" : "#f3e9c9"} stroke="#2a0a14" strokeWidth="1" />)}
        <path d="M-160 -90 Q-190 -110 -160 -130 L-40 -130 Q-10 -110 -40 -90 Z" fill="#7a2c3a" stroke="#2a0a14" strokeWidth="4" />
      </g>

      {/* chai cup with steam + open notebook of couplets */}
      <g transform="translate(420,820)" filter="url(#doodle-wobble-sm)">
        <path d="M-20 0 Q-20 30 0 30 Q20 30 20 0 Z" fill="#e9d7c8" stroke="#8a5a2a" strokeWidth="3" />
        <path d="M20 6 Q36 6 36 16 Q36 26 20 24" fill="none" stroke="#8a5a2a" strokeWidth="3" />
        <path d="M-8 -10 Q-14 -26 -4 -40" stroke="#e9d7c8" strokeWidth="3" fill="none" opacity="0.7" />
        <path d="M6 -10 Q0 -30 10 -46" stroke="#e9d7c8" strokeWidth="3" fill="none" opacity="0.55" />
      </g>
      <g transform="translate(220,860) rotate(-4)" filter="url(#doodle-wobble-sm)">
        <path d="M-70 0 L70 0 L64 -46 L-64 -46 Z" fill="#f3e9c9" stroke="#8a5a2a" strokeWidth="3" />
        <line x1="0" y1="0" x2="0" y2="-46" stroke="#8a5a2a" strokeWidth="2" opacity="0.6" />
        {[-16, -6, 4, 14].map((y, i) => <line key={i} x1={-52} y1={y - 20} x2={-8} y2={y - 20} stroke="#5c2230" strokeWidth="2" opacity="0.6" />)}
        {[-16, -6, 4, 14].map((y, i) => <line key={i} x1={8} y1={y - 20} x2={52} y2={y - 20} stroke="#5c2230" strokeWidth="2" opacity="0.6" />)}
      </g>

      {/* string of small diyas along the lower edge */}
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i} transform={`translate(${60 + i * 190},870)`}>
          <ellipse cx="0" cy="0" rx="14" ry="8" fill="#5c2230" stroke="#2a0a14" strokeWidth="2" />
          <path d="M0 -8 Q-4 -20 0 -28 Q4 -20 0 -8 Z" fill="#ffdca0" opacity="0.9" />
        </g>
      ))}

      <radialGradient id="gz-vignette" cx="42%" cy="60%" r="80%"><stop offset="52%" stopColor="#0c0510" stopOpacity="0" /><stop offset="100%" stopColor="#0c0510" stopOpacity="0.6" /></radialGradient>
      <rect width="1600" height="900" fill="url(#gz-vignette)" />
    </svg>
  );
}

export function SceneStage({ mode }: { mode: PlaylistMode }) {
  return (
    <div className="scene-stage" aria-hidden="true">
      {mode === "driver" && <BusDriverScene />}
      {mode === "rainy" && <RainyScene />}
      {mode === "party" && <PartyScene />}
      {mode === "ghazal" && <GhazalScene />}
    </div>
  );
}

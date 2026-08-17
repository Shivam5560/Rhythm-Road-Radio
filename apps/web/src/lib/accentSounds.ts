/**
 * The four mode accents, synthesised in the browser.
 *
 * These are generated rather than sampled on purpose. The obvious route —
 * lifting the audio out of a YouTube video — is both against YouTube's terms
 * and a copyright problem for the underlying recording, and a music site is the
 * last place that should be casual about either. Synthesis has no licence, no
 * bytes to download, and fires with zero latency, which a one-shot accent needs.
 *
 * If real recordings turn up later (CC0, a library licence, or something the
 * owner recorded), swapping them in means replacing `play()` with an
 * AudioBufferSourceNode — the call site and the hook do not change.
 */

export type AccentKind = "horn" | "thunder" | "octopad" | "sitar";

let ctx: AudioContext | null = null;
let live: GainNode | null = null;

/**
 * iOS gives a page a single audio session. On the default session type, opening
 * a WebAudio context interrupts whatever the YouTube iframe is doing, so the
 * accent and the music end up fighting over the speaker and one of them stops.
 * Declaring the page as media playback asks the OS to let both sound at once.
 * Safari 16.4+; a harmless no-op everywhere else.
 */
try {
  const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
  if (session) session.type = "playback";
} catch {
  /* not supported */
}

/**
 * Browsers refuse to start an AudioContext outside a user gesture, so it is
 * created on the first press rather than at import time, and resumed each time
 * in case the tab was backgrounded while it was suspended.
 */
function audio(): AudioContext | null {
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function noiseBuffer(ac: AudioContext, seconds: number): AudioBuffer {
  const frames = Math.floor(ac.sampleRate * seconds);
  const buffer = ac.createBuffer(1, frames, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

/** Indian truck air horn: a musical triad, not a single tone — that stacked
 *  major chord is what makes it read as a truck rather than a car. */
function horn(ac: AudioContext, out: GainNode, t: number): number {
  const duration = 0.85;
  const shape = ac.createGain();
  shape.gain.setValueAtTime(0.0001, t);
  shape.gain.exponentialRampToValueAtTime(0.9, t + 0.05);
  shape.gain.setValueAtTime(0.9, t + duration - 0.22);
  shape.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  const tone = ac.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.value = 2600;
  shape.connect(tone).connect(out);

  // Eb major, the classic three-trumpet horn stack, with a little detune so it
  // beats slightly instead of sounding like a synth pad.
  [311.1, 392.0, 466.2].forEach((freq, i) => {
    const osc = ac.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq * (1 + (i - 1) * 0.0016), t);
    // Air horns sag a touch as pressure drops.
    osc.frequency.linearRampToValueAtTime(freq * 0.994, t + duration);
    const level = ac.createGain();
    level.gain.value = [0.34, 0.3, 0.22][i];
    osc.connect(level).connect(shape);
    osc.start(t);
    osc.stop(t + duration + 0.05);
  });
  return duration;
}

/** Thunder: a bright crack, then a long filtered rumble that keeps rolling. */
function thunder(ac: AudioContext, out: GainNode, t: number): number {
  const duration = 2.6;
  const src = ac.createBufferSource();
  src.buffer = noiseBuffer(ac, duration);

  // The sweep from a few kHz down to almost nothing is the whole illusion:
  // distance eats high frequencies, so a falling cutoff reads as a rolling away.
  const lp = ac.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(3200, t);
  lp.frequency.exponentialRampToValueAtTime(90, t + duration);
  lp.Q.value = 1.2;

  const shape = ac.createGain();
  shape.gain.setValueAtTime(0.0001, t);
  shape.gain.exponentialRampToValueAtTime(0.95, t + 0.03);
  shape.gain.exponentialRampToValueAtTime(0.28, t + 0.35);
  // Two secondary swells so it rumbles rather than fading off cleanly.
  shape.gain.exponentialRampToValueAtTime(0.42, t + 0.9);
  shape.gain.exponentialRampToValueAtTime(0.16, t + 1.5);
  shape.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  src.connect(lp).connect(shape).connect(out);
  src.start(t);
  src.stop(t + duration);
  return duration;
}

/** Octopad hit: pitch-swept body plus a noise transient, the way an electronic
 *  drum pad is actually built. */
function octopad(ac: AudioContext, out: GainNode, t: number): number {
  const duration = 0.6;

  const body = ac.createOscillator();
  body.type = "sine";
  body.frequency.setValueAtTime(420, t);
  body.frequency.exponentialRampToValueAtTime(52, t + 0.18);
  const bodyGain = ac.createGain();
  bodyGain.gain.setValueAtTime(1.5, t);
  bodyGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  body.connect(bodyGain).connect(out);
  body.start(t);
  body.stop(t + duration);

  const click = ac.createBufferSource();
  click.buffer = noiseBuffer(ac, 0.05);
  const hp = ac.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 1800;
  const clickGain = ac.createGain();
  clickGain.gain.setValueAtTime(0.8, t);
  clickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
  click.connect(hp).connect(clickGain).connect(out);
  click.start(t);

  return duration;
}

/** Sitar: Karplus-Strong. A noise burst into a delay line whose length sets the
 *  pitch, fed back through a gentle lowpass — the standard plucked-string
 *  model, and far more convincing here than stacking oscillators. */
function pluck(ac: AudioContext, out: GainNode, t: number, freq: number, gain: number, decay: number) {
  const delay = ac.createDelay(0.05);
  delay.delayTime.value = 1 / freq;

  const feedback = ac.createGain();
  // Kept clear of 1.0: a loop gain this close to unity accumulates energy,
  // and with six strings summing it drove the master past full scale.
  feedback.gain.setValueAtTime(0.88, t);
  feedback.gain.linearRampToValueAtTime(0.15, t + decay);

  // Damping in the loop is what makes the harmonics die faster than the
  // fundamental, which is how a real string decays.
  const damp = ac.createBiquadFilter();
  damp.type = "lowpass";
  damp.frequency.value = 3600;

  delay.connect(damp).connect(feedback).connect(delay);

  const level = ac.createGain();
  level.gain.setValueAtTime(gain, t);
  level.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  delay.connect(level).connect(out);

  const exciter = ac.createBufferSource();
  exciter.buffer = noiseBuffer(ac, 0.02);
  const exciterGain = ac.createGain();
  exciterGain.gain.value = 0.6;
  exciter.connect(exciterGain).connect(delay);
  exciter.start(t);
}

function sitar(ac: AudioContext, out: GainNode, t: number): number {
  const duration = 2.4;
  // A short descending phrase over a held drone — one note alone reads as a
  // generic guitar, the drone and the run are what say sitar.
  const phrase = [587.33, 523.25, 466.16, 392.0];
  phrase.forEach((freq, i) => pluck(ac, out, t + i * 0.13, freq, 0.32, 1.5));
  pluck(ac, out, t, 146.83, 0.24, duration); // drone string
  pluck(ac, out, t + 0.06, 220.0, 0.16, duration);
  return duration;
}

const players: Record<AccentKind, (ac: AudioContext, out: GainNode, t: number) => number> = {
  horn,
  thunder,
  octopad,
  sitar,
};

/**
 * Fires an accent over whatever else is playing. Returns the length in ms so
 * the caller can time a matching visual, or 0 if audio is unavailable.
 */
export function playAccent(kind: AccentKind, volume = 0.55): number {
  const ac = audio();
  if (!ac) return 0;

  // Retrigger rather than layer: mashing the button should feel like pumping
  // the horn, not like a pile-up of overlapping copies.
  if (live) {
    try {
      live.gain.cancelScheduledValues(ac.currentTime);
      live.gain.setTargetAtTime(0, ac.currentTime, 0.015);
      const dying = live;
      window.setTimeout(() => dying.disconnect(), 200);
    } catch {
      /* already gone */
    }
  }

  const out = ac.createGain();
  out.gain.value = volume;
  // Safety limiter. The synth voices are hand-balanced, but a resonant pluck
  // stack is exactly the kind of thing that can run hot, and clipping over the
  // music sounds far worse than a touch of compression.
  const limiter = ac.createDynamicsCompressor();
  limiter.threshold.value = -6;
  limiter.knee.value = 0;
  limiter.ratio.value = 20;
  limiter.attack.value = 0.002;
  limiter.release.value = 0.15;
  out.connect(limiter).connect(ac.destination);
  live = out;

  const t = ac.currentTime + 0.01;
  const duration = players[kind](ac, out, t);
  // Release the node graph once the tail has run out.
  window.setTimeout(() => {
    out.disconnect();
    limiter.disconnect();
    if (live === out) live = null;
  }, (duration + 0.4) * 1000);
  return Math.round(duration * 1000);
}

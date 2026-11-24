"use client";

export type SfxName =
  | "wind"
  | "whoosh"
  | "descent"
  | "shimmer"
  | "eating"
  | "clock"
  | "chest"
  | "steps"
  | "gavel";

const SFX_BASE = "/sites/www-enigmascult-com-ddb923ee/shared/sfx";
const SFX_FILES: Record<SfxName, string> = {
  wind: "wind.mp3",
  whoosh: "whoosh.mp3",
  descent: "descent.mp3",
  shimmer: "shimmer.mp3",
  eating: "eating.mp3",
  clock: "clock.mp3",
  chest: "chest.mp3",
  steps: "steps.mp3",
  gavel: "gavel.mp3",
};

const CORE_PRELOAD_SFX: SfxName[] = [
  "whoosh",
  "shimmer",
  "wind",
  "descent",
  "chest",
  "steps",
  "clock",
];

const STORAGE_KEY = "enigma-sound";

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let soundEnabled = false;
let visibilityBound = false;

const decodedBuffers: Partial<Record<SfxName, AudioBuffer>> = {};
const inflightFetches: Partial<Record<SfxName, Promise<AudioBuffer>>> = {};
const pendingOneShots: Record<string, { level: number; fadeOut?: number; at: number }> = {};
const listeners = new Set<(on: boolean) => void>();

// ── Ambient Dark-Luxury Background Score State ─────────────────────────────
interface AmbientEngineHandle {
  stop: (immediate?: boolean) => void;
}

let ambientHandle: AmbientEngineHandle | null = null;
let ambientWindLoop: ReturnType<typeof createLoopingSfx> | null = null;

const AMBIENT_CHORD_NOTES = [174.61, 164.81, 146.83, 220.0, 196.0, 155.56];

function bindVisibilityHandler(): void {
  if (visibilityBound || typeof document === "undefined") return;
  visibilityBound = true;
  document.addEventListener("visibilitychange", () => {
    if (!audioCtx) return;
    if (document.hidden) {
      stopAmbientMusic();
    } else if (soundEnabled && audioCtx.state === "running") {
      startAmbientMusic();
    }
  });
}

export function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (audioCtx) return audioCtx;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  audioCtx = new Ctor();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.62;
  masterGain.connect(audioCtx.destination);
  bindVisibilityHandler();
  return audioCtx;
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

export function isAmbientMusicActive(): boolean {
  return Boolean(ambientHandle && soundEnabled && audioCtx?.state === "running");
}

export function subscribeSoundState(cb: (on: boolean) => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function preloadCoreSfx(): void {
  if (!audioCtx) return;
  CORE_PRELOAD_SFX.forEach((name) => {
    loadBuffer(name).catch(() => {});
  });
}

export function startAmbientMusic(): void {
  if (
    !soundEnabled ||
    !audioCtx ||
    !masterGain ||
    audioCtx.state !== "running" ||
    document.hidden
  ) {
    return;
  }
  if (ambientHandle) return;

  const ctx = audioCtx;
  const now = ctx.currentTime;

  const busGain = ctx.createGain();
  busGain.gain.setValueAtTime(1e-4, now);
  busGain.gain.exponentialRampToValueAtTime(0.24, now + 2.2);

  // Warm analog-style lowpass filter with slow breathing LFO
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(440, now);
  filter.Q.setValueAtTime(0.95, now);

  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.type = "sine";
  lfo.frequency.setValueAtTime(0.065, now);
  lfoGain.gain.setValueAtTime(135, now);
  lfo.connect(lfoGain).connect(filter.frequency);

  // Subtle spatial echo tail
  const delay = ctx.createDelay(1.0);
  delay.delayTime.setValueAtTime(0.42, now);
  const feedback = ctx.createGain();
  feedback.gain.setValueAtTime(0.26, now);
  const echoFilter = ctx.createBiquadFilter();
  echoFilter.type = "lowpass";
  echoFilter.frequency.setValueAtTime(860, now);
  const wetGain = ctx.createGain();
  wetGain.gain.setValueAtTime(0.26, now);

  filter.connect(busGain);
  filter.connect(delay);
  delay.connect(echoFilter);
  echoFilter.connect(feedback);
  feedback.connect(delay);
  echoFilter.connect(wetGain);
  wetGain.connect(busGain);
  busGain.connect(masterGain);

  // Voices: D2 sub-drone, A2 fifth body, morphing Phrygian color voice, D4 air harmonic
  const subOsc = ctx.createOscillator();
  const subGain = ctx.createGain();
  subOsc.type = "sine";
  subOsc.frequency.setValueAtTime(73.42, now);
  subGain.gain.setValueAtTime(0.38, now);
  subOsc.connect(subGain).connect(filter);

  const fifthOsc = ctx.createOscillator();
  const fifthGain = ctx.createGain();
  fifthOsc.type = "triangle";
  fifthOsc.frequency.setValueAtTime(110.0, now);
  fifthOsc.detune.setValueAtTime(-5, now);
  fifthGain.gain.setValueAtTime(0.21, now);
  fifthOsc.connect(fifthGain).connect(filter);

  const colorOsc = ctx.createOscillator();
  const colorGain = ctx.createGain();
  colorOsc.type = "triangle";
  colorOsc.frequency.setValueAtTime(AMBIENT_CHORD_NOTES[0], now);
  colorOsc.detune.setValueAtTime(6, now);
  colorGain.gain.setValueAtTime(0.16, now);
  colorOsc.connect(colorGain).connect(filter);

  const airOsc = ctx.createOscillator();
  const airGain = ctx.createGain();
  airOsc.type = "sine";
  airOsc.frequency.setValueAtTime(293.66, now);
  airOsc.detune.setValueAtTime(8, now);
  airGain.gain.setValueAtTime(0.055, now);
  airOsc.connect(airGain).connect(filter);

  subOsc.start(now);
  fifthOsc.start(now);
  colorOsc.start(now);
  airOsc.start(now);
  lfo.start(now);

  let noteIdx = 0;
  let stopped = false;
  const chordTimer = window.setInterval(() => {
    if (stopped || !audioCtx || audioCtx.state !== "running") return;
    noteIdx = (noteIdx + 1) % AMBIENT_CHORD_NOTES.length;
    const nextFreq = AMBIENT_CHORD_NOTES[noteIdx];
    const t = audioCtx.currentTime;
    colorOsc.frequency.cancelScheduledValues(t);
    colorOsc.frequency.setValueAtTime(Math.max(colorOsc.frequency.value, 60), t);
    colorOsc.frequency.exponentialRampToValueAtTime(nextFreq, t + 2.8);
  }, 6800);

  if (!ambientWindLoop) {
    ambientWindLoop = createLoopingSfx("wind", 0.085, 520, {
      in: 3.0,
      out: 1.0,
      random: true,
    });
  }
  ambientWindLoop.start();

  ambientHandle = {
    stop: (immediate = false) => {
      if (stopped) return;
      stopped = true;
      window.clearInterval(chordTimer);
      ambientWindLoop?.stop();
      if (!audioCtx) return;
      const t = audioCtx.currentTime;
      const fade = immediate ? 0.08 : 0.65;
      busGain.gain.cancelScheduledValues(t);
      busGain.gain.setValueAtTime(Math.max(busGain.gain.value, 1e-4), t);
      busGain.gain.exponentialRampToValueAtTime(1e-4, t + fade);
      window.setTimeout(() => {
        [subOsc, fifthOsc, colorOsc, airOsc, lfo].forEach((osc) => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {
            // ignore
          }
        });
        try {
          busGain.disconnect();
          filter.disconnect();
          delay.disconnect();
          feedback.disconnect();
          echoFilter.disconnect();
          wetGain.disconnect();
        } catch {
          // ignore
        }
      }, fade * 1000 + 120);
    },
  };
}

export function stopAmbientMusic(immediate = false): void {
  if (!ambientHandle) return;
  const h = ambientHandle;
  ambientHandle = null;
  h.stop(immediate);
}

export function setSoundEnabled(next: boolean): void {
  soundEnabled = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
  } catch {
    // ignore storage errors
  }
  listeners.forEach((cb) => cb(next));
  if (next) {
    const ctx = getAudioContext();
    if (ctx) {
      ctx
        .resume()
        .then(() => {
          preloadCoreSfx();
          flushPendingOneShots();
          startAmbientMusic();
        })
        .catch(() => {});
    }
  } else {
    stopAmbientMusic();
  }
}

export function initSoundPreference(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.localStorage.getItem(STORAGE_KEY) === "1") {
      soundEnabled = true;
      listeners.forEach((cb) => cb(true));
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

function loadBuffer(name: SfxName): Promise<AudioBuffer> {
  const cached = decodedBuffers[name];
  if (cached) return Promise.resolve(cached);
  const existing = inflightFetches[name];
  if (existing) return existing;
  if (!audioCtx) return Promise.reject(new Error("no audio context"));

  const url = `${SFX_BASE}/${SFX_FILES[name]}`;
  const promise = fetch(url)
    .then((r) => r.arrayBuffer())
    .then((buf) => audioCtx!.decodeAudioData(buf))
    .then((decoded) => {
      decodedBuffers[name] = decoded;
      return decoded;
    });
  inflightFetches[name] = promise;
  return promise;
}

function flushPendingOneShots(): void {
  const now = performance.now();
  Object.keys(pendingOneShots).forEach((key) => {
    const entry = pendingOneShots[key];
    delete pendingOneShots[key];
    if (now - entry.at < 8000) {
      playOneShotSfx(key as SfxName, entry.level, entry.fadeOut);
    }
  });
}

const lastCooldownByKey: Record<string, number> = {};

export function playOneShotSfxCooldown(
  name: SfxName,
  level = 0.85,
  fadeOut?: number,
  cooldownMs = 2200,
  key?: string
): void {
  if (!soundEnabled) return;
  const bucket = key ?? name;
  const now = performance.now();
  if (now - (lastCooldownByKey[bucket] ?? -cooldownMs) < cooldownMs) return;
  lastCooldownByKey[bucket] = now;
  playOneShotSfx(name, level, fadeOut);
}

export function playOneShotSfx(name: SfxName, level = 0.85, fadeOut?: number): void {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx || ctx.state !== "running") {
    pendingOneShots[name] = { level, fadeOut, at: performance.now() };
    return;
  }
  loadBuffer(name)
    .then((buffer) => {
      if (!audioCtx || !masterGain || !soundEnabled) return;
      const src = audioCtx.createBufferSource();
      src.buffer = buffer;
      const gain = audioCtx.createGain();
      gain.gain.value = level;
      if (fadeOut && buffer.duration > fadeOut) {
        const end = audioCtx.currentTime + buffer.duration - fadeOut;
        gain.gain.setValueAtTime(level, end);
        gain.gain.exponentialRampToValueAtTime(1e-4, end + fadeOut);
      }
      src.connect(gain).connect(masterGain);
      src.start();
    })
    .catch(() => {});
}

export interface StoppableSfxHandle {
  stop: (fade?: number) => void;
}

export function startHoldableSfx(
  name: SfxName,
  level: number,
  fadeOut?: number,
  lowpassFreq?: number
): StoppableSfxHandle | null {
  if (!soundEnabled || !audioCtx || audioCtx.state !== "running") return null;
  const handle: {
    src: AudioBufferSourceNode | null;
    gain: GainNode | null;
    dead: boolean;
  } = { src: null, gain: null, dead: false };

  loadBuffer(name)
    .then((buffer) => {
      if (handle.dead || !audioCtx || !masterGain || !soundEnabled) return;
      const src = audioCtx.createBufferSource();
      src.buffer = buffer;
      const gain = audioCtx.createGain();
      gain.gain.value = level;
      if (fadeOut && buffer.duration > fadeOut) {
        const end = audioCtx.currentTime + buffer.duration - fadeOut;
        gain.gain.setValueAtTime(level, end);
        gain.gain.exponentialRampToValueAtTime(1e-4, end + fadeOut);
      }
      let outNode: AudioNode = gain;
      if (lowpassFreq) {
        const filter = audioCtx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = lowpassFreq;
        filter.Q.value = 0.5;
        gain.connect(filter);
        outNode = filter;
      }
      src.connect(gain);
      outNode.connect(masterGain);
      src.start();
      handle.src = src;
      handle.gain = gain;
    })
    .catch(() => {});

  return {
    stop: (fade = 0.18) => {
      handle.dead = true;
      if (!handle.src || !handle.gain || !audioCtx) return;
      const g = handle.gain;
      const s = handle.src;
      g.gain.cancelScheduledValues(audioCtx.currentTime);
      g.gain.setValueAtTime(Math.max(g.gain.value, 1e-4), audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(1e-4, audioCtx.currentTime + fade);
      window.setTimeout(() => {
        try {
          s.stop();
        } catch {
          // ignore
        }
      }, fade * 1000 + 100);
    },
  };
}

export function createLoopingSfx(
  name: SfxName,
  targetGain: number,
  lowpassFreq?: number,
  opts?: { in?: number; out?: number; random?: boolean }
) {
  const fadeIn = opts?.in ?? 1.4;
  const fadeOut = opts?.out ?? 0.9;
  const randomOffset = Boolean(opts?.random);
  let src: AudioBufferSourceNode | null = null;
  let gain: GainNode | null = null;
  let active = false;

  return {
    start: () => {
      if (active || !audioCtx) return;
      active = true;
      loadBuffer(name)
        .then((buffer) => {
          if (!active || src || !audioCtx || !masterGain) return;
          const node = audioCtx.createBufferSource();
          node.buffer = buffer;
          node.loop = true;
          const g = audioCtx.createGain();
          g.gain.setValueAtTime(1e-4, audioCtx.currentTime);
          g.gain.exponentialRampToValueAtTime(targetGain, audioCtx.currentTime + fadeIn);

          let dest: AudioNode = g;
          if (lowpassFreq) {
            const filter = audioCtx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.value = lowpassFreq;
            filter.Q.value = 0.5;
            g.connect(filter);
            dest = filter;
          }
          node.connect(g);
          dest.connect(masterGain);
          node.start(0, randomOffset ? Math.random() * buffer.duration : 0);
          src = node;
          gain = g;
        })
        .catch(() => {});
    },
    stop: () => {
      if (!active) return;
      active = false;
      if (src && gain && audioCtx) {
        const s = src;
        const g = gain;
        g.gain.cancelScheduledValues(audioCtx.currentTime);
        g.gain.setValueAtTime(Math.max(g.gain.value, 1e-4), audioCtx.currentTime);
        g.gain.exponentialRampToValueAtTime(1e-4, audioCtx.currentTime + fadeOut);
        window.setTimeout(() => {
          try {
            s.stop();
          } catch {
            // ignore
          }
        }, fadeOut * 1000 + 150);
      }
      src = null;
      gain = null;
    },
    isOn: () => active,
  };
}

// ── Synthesized Tactile Micro-SFX ───────────────────────────────────────────
let lastHoverTickAt = 0;
let lastClickToneAt = 0;
let lastSlideTickAt = 0;
let lastErrorToneAt = 0;

export function playUiHoverTick(): void {
  if (!soundEnabled || !audioCtx || !masterGain || audioCtx.state !== "running") return;
  const nowMs = performance.now();
  if (nowMs - lastHoverTickAt < 70) return;
  lastHoverTickAt = nowMs;

  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(740, t);
  osc.frequency.exponentialRampToValueAtTime(460, t + 0.032);
  g.gain.setValueAtTime(1e-4, t);
  g.gain.exponentialRampToValueAtTime(0.055, t + 0.005);
  g.gain.exponentialRampToValueAtTime(1e-4, t + 0.038);
  osc.connect(g).connect(masterGain);
  osc.start(t);
  osc.stop(t + 0.045);
}

export function playUiClickTone(): void {
  if (!soundEnabled || !audioCtx || !masterGain || audioCtx.state !== "running") return;
  const nowMs = performance.now();
  if (nowMs - lastClickToneAt < 55) return;
  lastClickToneAt = nowMs;

  const t = audioCtx.currentTime;
  const body = audioCtx.createOscillator();
  const bodyGain = audioCtx.createGain();
  body.type = "triangle";
  body.frequency.setValueAtTime(260, t);
  body.frequency.exponentialRampToValueAtTime(112, t + 0.065);
  bodyGain.gain.setValueAtTime(1e-4, t);
  bodyGain.gain.exponentialRampToValueAtTime(0.11, t + 0.006);
  bodyGain.gain.exponentialRampToValueAtTime(1e-4, t + 0.075);
  body.connect(bodyGain).connect(masterGain);
  body.start(t);
  body.stop(t + 0.085);

  const click = audioCtx.createOscillator();
  const clickGain = audioCtx.createGain();
  click.type = "sine";
  click.frequency.setValueAtTime(1040, t);
  click.frequency.exponentialRampToValueAtTime(520, t + 0.018);
  clickGain.gain.setValueAtTime(1e-4, t);
  clickGain.gain.exponentialRampToValueAtTime(0.045, t + 0.002);
  clickGain.gain.exponentialRampToValueAtTime(1e-4, t + 0.022);
  click.connect(clickGain).connect(masterGain);
  click.start(t);
  click.stop(t + 0.028);
}

export function playSlideTick(): void {
  if (!soundEnabled || !audioCtx || !masterGain || audioCtx.state !== "running") return;
  const nowMs = performance.now();
  if (nowMs - lastSlideTickAt < 105) return;
  lastSlideTickAt = nowMs;

  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(440, t);
  osc.frequency.exponentialRampToValueAtTime(240, t + 0.042);
  g.gain.setValueAtTime(1e-4, t);
  g.gain.exponentialRampToValueAtTime(0.075, t + 0.004);
  g.gain.exponentialRampToValueAtTime(1e-4, t + 0.048);
  osc.connect(g).connect(masterGain);
  osc.start(t);
  osc.stop(t + 0.055);
}

export function playErrorTone(): void {
  if (!soundEnabled || !audioCtx || !masterGain || audioCtx.state !== "running") return;
  const nowMs = performance.now();
  if (nowMs - lastErrorToneAt < 200) return;
  lastErrorToneAt = nowMs;

  const notes: [number, number][] = [
    [196.0, 0],
    [146.83, 0.09],
  ];
  notes.forEach(([freq, offset]) => {
    if (!audioCtx || !masterGain) return;
    const t = audioCtx.currentTime + offset;
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(1e-4, t);
    g.gain.exponentialRampToValueAtTime(0.14, t + 0.015);
    g.gain.exponentialRampToValueAtTime(1e-4, t + 0.16);
    osc.connect(g).connect(masterGain);
    osc.start(t);
    osc.stop(t + 0.18);
  });
}

export function playConfirmChime(): void {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;
  const playNotes = () => {
    if (!audioCtx || !masterGain || !soundEnabled) return;
    const notes: [number, number][] = [
      [293.66, 0],
      [440.0, 0.1],
      [587.33, 0.21],
    ];
    notes.forEach(([freq, offset]) => {
      if (!audioCtx || !masterGain) return;
      const t = audioCtx.currentTime + offset;
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      g.gain.setValueAtTime(1e-4, t);
      g.gain.exponentialRampToValueAtTime(0.18, t + 0.025);
      g.gain.exponentialRampToValueAtTime(1e-4, t + 0.65);
      osc.connect(g).connect(masterGain);
      osc.start(t);
      osc.stop(t + 0.7);
    });
  };
  if (ctx.state === "running") {
    playNotes();
  } else {
    ctx.resume().then(playNotes).catch(() => {});
  }
}

export const SFX_CONFIG: Partial<
  Record<SfxName, { level: number; fade?: number; lowpass?: number; hold?: number }>
> = {
  whoosh: { level: 0.78, fade: 1.3 },
  descent: { level: 0.85, fade: 0.45, hold: 0.5 },
  shimmer: { level: 0.42, fade: 0.7 },
  wind: { level: 0.32, fade: 2.5, lowpass: 700, hold: 6 },
  chest: { level: 0.48, fade: 0.85 },
  steps: { level: 0.34, fade: 0.45 },
  clock: { level: 0.28, fade: 0.55 },
  gavel: { level: 0.5, fade: 0.6 },
};

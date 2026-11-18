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

const STORAGE_KEY = "enigma-sound";

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let soundEnabled = false;

const decodedBuffers: Partial<Record<SfxName, AudioBuffer>> = {};
const inflightFetches: Partial<Record<SfxName, Promise<AudioBuffer>>> = {};
const pendingOneShots: Record<string, { level: number; fadeOut?: number; at: number }> = {};
const listeners = new Set<(on: boolean) => void>();

export function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (audioCtx) return audioCtx;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  audioCtx = new Ctor();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.55;
  masterGain.connect(audioCtx.destination);
  return audioCtx;
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

export function subscribeSoundState(cb: (on: boolean) => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
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
          flushPendingOneShots();
        })
        .catch(() => {});
    }
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

export function playOneShotSfx(name: SfxName, level = 0.85, fadeOut?: number): void {
  if (!soundEnabled) return;
  if (!audioCtx || audioCtx.state !== "running") {
    pendingOneShots[name] = { level, fadeOut, at: performance.now() };
    return;
  }
  loadBuffer(name)
    .then((buffer) => {
      if (!audioCtx || !masterGain) return;
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
      if (handle.dead || !audioCtx || !masterGain) return;
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

export function playConfirmChime(): void {
  if (!soundEnabled || !audioCtx || !masterGain) return;
  const notes: [number, number][] = [
    [329.63, 0],
    [493.88, 0.12],
  ];
  notes.forEach(([freq, offset]) => {
    if (!audioCtx || !masterGain) return;
    const t = audioCtx.currentTime + offset;
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    g.gain.setValueAtTime(1e-4, t);
    g.gain.exponentialRampToValueAtTime(0.22, t + 0.03);
    g.gain.exponentialRampToValueAtTime(1e-4, t + 0.6);
    osc.connect(g).connect(masterGain);
    osc.start(t);
    osc.stop(t + 0.65);
  });
}

export const SFX_CONFIG: Partial<
  Record<SfxName, { level: number; fade?: number; lowpass?: number; hold?: number }>
> = {
  whoosh: { level: 0.85, fade: 1.4 },
  descent: { level: 0.9, fade: 0.45, hold: 0.5 },
  shimmer: { level: 0.4, fade: 0.7 },
  wind: { level: 0.32, fade: 2.5, lowpass: 700, hold: 6 },
};

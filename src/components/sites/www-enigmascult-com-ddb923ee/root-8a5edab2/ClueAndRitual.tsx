"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  isSoundEnabled,
  playOneShotSfx,
} from "@/components/sites/www-enigmascult-com-ddb923ee/shared/sfx";
import {
  disposeThreeScene,
  getGLTFLoader,
  hasWebGL,
} from "@/components/sites/www-enigmascult-com-ddb923ee/shared/threeLoader";
import { CLUE_TEXTS, RITUAL_LINES, SITE_ASSETS } from "./data";

const SECRET_WORDS = ["coexist", "co-exist", "enigma"] as const;
const BLESSED_STORAGE_KEY = "enigma-blessed";
const REWARD_STORAGE_KEY = "enigma-reward";
const KEY_TIMEOUT_MS = 2000;
const SHIMMER_COOLDOWN_MS = 8000;
const HINT_TIMEOUT_FINE_MS = 9000;
const HINT_TIMEOUT_COARSE_MS = 25000;

function readBlessedFromStorage(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(BLESSED_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function subscribeCoarsePointer(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const mql = window.matchMedia("(pointer: coarse)");
  mql.addEventListener("change", onStoreChange);
  return () => mql.removeEventListener("change", onStoreChange);
}

function getCoarsePointerSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

function getCoarsePointerServerSnapshot(): boolean {
  return false;
}

export function ClueAndRitual() {
  const btnRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const coarseInputRef = useRef<HTMLInputElement>(null);

  const [hintOpen, setHintOpen] = useState(false);
  const [ritualOpen, setRitualOpen] = useState(false);
  const [blessed, setBlessed] = useState(false);
  const isCoarse = useSyncExternalStore(
    subscribeCoarsePointer,
    getCoarsePointerSnapshot,
    getCoarsePointerServerSnapshot
  );
  const [coarseValue, setCoarseValue] = useState("");

  const lastShimmerRef = useRef<number>(-SHIMMER_COOLDOWN_MS);
  const hintTimerRef = useRef<number | null>(null);
  const ritualOpenRef = useRef(false);

  useEffect(() => {
    ritualOpenRef.current = ritualOpen;
  }, [ritualOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;
    const isReset = /[?&]ritual=reset/.test(window.location.search);

    if (isReset) {
      try {
        window.localStorage.removeItem(BLESSED_STORAGE_KEY);
        window.localStorage.removeItem(REWARD_STORAGE_KEY);
      } catch {
        // ignore storage errors
      }
      document.querySelector(".cursor-ring")?.classList.remove("is-blessed");
    }

    const nextBlessed = isReset ? false : readBlessedFromStorage();
    queueMicrotask(() => {
      if (!cancelled) {
        setBlessed(nextBlessed);
      }
    });

    const onBlessed = () => {
      setBlessed(true);
    };
    window.addEventListener("enigma:blessed", onBlessed);
    document.addEventListener("enigma:blessed", onBlessed);

    return () => {
      cancelled = true;
      window.removeEventListener("enigma:blessed", onBlessed);
      document.removeEventListener("enigma:blessed", onBlessed);
    };
  }, []);

  const triggerRitual = useCallback(() => {
    if (ritualOpenRef.current) return;
    ritualOpenRef.current = true;

    try {
      window.localStorage.setItem(BLESSED_STORAGE_KEY, "1");
    } catch {
      // ignore storage errors
    }

    setBlessed(true);
    setHintOpen(false);
    setCoarseValue("");
    setRitualOpen(true);

    document.querySelector(".cursor-ring")?.classList.add("is-blessed");

    const blessedWindowEvent = new CustomEvent("enigma:blessed");
    const blessedDocumentEvent = new CustomEvent("enigma:blessed");
    window.dispatchEvent(blessedWindowEvent);
    document.dispatchEvent(blessedDocumentEvent);

    const sfxEvent = new CustomEvent("enigma:sfx", {
      detail: "wind",
      cancelable: true,
    });
    document.dispatchEvent(sfxEvent);
    if (!sfxEvent.defaultPrevented && isSoundEnabled()) {
      playOneShotSfx("wind", 0.32, 2.5);
    }
  }, []);

  // Global keydown listener matching sequential typing of "coexist", "co-exist", or "enigma"
  useEffect(() => {
    let buffer = "";
    let lastKeyAt = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (ritualOpenRef.current) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        typeof target.matches === "function" &&
        (target.matches("input, textarea, select") || target.isContentEditable)
      ) {
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const now = performance.now();
      if (now - lastKeyAt > KEY_TIMEOUT_MS) {
        buffer = "";
      }
      lastKeyAt = now;

      const ch = (e.key || "").toLowerCase();
      if (ch.length !== 1) return;
      buffer = (buffer + ch).slice(-12);
      if (SECRET_WORDS.some((w) => buffer.endsWith(w))) {
        buffer = "";
        triggerRitual();
      }
    };

    const handleCustomRitual = () => {
      triggerRitual();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("enigma:ritual", handleCustomRitual);
    window.addEventListener("enigma:ritual", handleCustomRitual);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("enigma:ritual", handleCustomRitual);
      window.removeEventListener("enigma:ritual", handleCustomRitual);
    };
  }, [triggerRitual]);

  // Ritual close via Escape or Enter
  useEffect(() => {
    if (!ritualOpen) return;

    const handleCloseKeys = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter") {
        e.preventDefault();
        setRitualOpen(false);
      }
    };

    document.addEventListener("keydown", handleCloseKeys, true);
    return () => {
      document.removeEventListener("keydown", handleCloseKeys, true);
    };
  }, [ritualOpen]);

  // Clue hint auto-close, outside click, Escape, and coarse input visualViewport positioning
  const resetHintTimer = useCallback((coarseActive: boolean) => {
    if (hintTimerRef.current !== null) {
      window.clearTimeout(hintTimerRef.current);
    }
    const timeoutMs = coarseActive ? HINT_TIMEOUT_COARSE_MS : HINT_TIMEOUT_FINE_MS;
    hintTimerRef.current = window.setTimeout(() => {
      setHintOpen(false);
      setCoarseValue("");
    }, timeoutMs);
  }, []);

  useEffect(() => {
    if (!hintOpen) {
      if (hintTimerRef.current !== null) {
        window.clearTimeout(hintTimerRef.current);
        hintTimerRef.current = null;
      }
      return;
    }

    const coarseActive = isCoarse && !blessed;
    resetHintTimer(coarseActive);

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (target?.closest(".clue-hint, .clue-keeper")) return;
      setHintOpen(false);
      setCoarseValue("");
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setHintOpen(false);
        setCoarseValue("");
      }
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleEscape, true);

    let focusTimer: number | null = null;
    if (coarseActive) {
      focusTimer = window.setTimeout(() => {
        coarseInputRef.current?.focus({ preventScroll: true });
      }, 350);
    }

    return () => {
      if (hintTimerRef.current !== null) {
        window.clearTimeout(hintTimerRef.current);
        hintTimerRef.current = null;
      }
      if (focusTimer !== null) {
        window.clearTimeout(focusTimer);
      }
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleEscape, true);
    };
  }, [hintOpen, isCoarse, blessed, resetHintTimer]);

  // Adjust clue-hint above virtual keyboard on coarse pointers
  useEffect(() => {
    if (!hintOpen || !isCoarse || blessed) return;
    const inputEl = coarseInputRef.current;
    const hintEl = hintRef.current;
    const vv = window.visualViewport;
    if (!inputEl || !hintEl || !vv) return;

    let baseBottom = 24;
    const updateBottom = () => {
      if (!hintRef.current || !window.visualViewport) return;
      const offset =
        window.innerHeight -
        window.visualViewport.height -
        window.visualViewport.offsetTop;
      hintRef.current.style.bottom = `${Math.max(baseBottom, offset + 24)}px`;
    };

    const onFocus = () => {
      resetHintTimer(true);
      if (hintRef.current) {
        hintRef.current.style.bottom = "";
        baseBottom =
          parseFloat(window.getComputedStyle(hintRef.current).bottom) || 24;
      }
      vv.addEventListener("resize", updateBottom);
      vv.addEventListener("scroll", updateBottom);
      updateBottom();
    };

    const onBlur = () => {
      vv.removeEventListener("resize", updateBottom);
      vv.removeEventListener("scroll", updateBottom);
      if (hintRef.current) {
        hintRef.current.style.bottom = "";
      }
    };

    inputEl.addEventListener("focus", onFocus);
    inputEl.addEventListener("blur", onBlur);

    return () => {
      vv.removeEventListener("resize", updateBottom);
      vv.removeEventListener("scroll", updateBottom);
      inputEl.removeEventListener("focus", onFocus);
      inputEl.removeEventListener("blur", onBlur);
      if (hintEl) {
        hintEl.style.bottom = "";
      }
    };
  }, [hintOpen, isCoarse, blessed, resetHintTimer]);

  // 3D Clue Keeper WebGL scene
  useEffect(() => {
    const canvas = canvasRef.current;
    const btn = btnRef.current;
    if (!canvas || !btn || !hasWebGL()) return;

    let cancelled = false;
    let rafId = 0;
    let renderer: import("three").WebGLRenderer | null = null;
    let scene: import("three").Scene | null = null;
    let envRT: import("three").WebGLRenderTarget | null = null;
    let pmrem: import("three").PMREMGenerator | null = null;
    let roomEnv: import("three/examples/jsm/environments/RoomEnvironment.js").RoomEnvironment | null =
      null;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    (async () => {
      try {
        const [THREE, { RoomEnvironment }, loader] = await Promise.all([
          import("three"),
          import("three/examples/jsm/environments/RoomEnvironment.js"),
          getGLTFLoader(),
        ]);
        if (cancelled) return;

        const r = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
          powerPreference: "low-power",
        });
        const size = btn.clientWidth || 40;
        r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        r.setSize(size, size, false);
        r.toneMapping = THREE.ACESFilmicToneMapping;
        renderer = r;

        const s = new THREE.Scene();
        scene = s;

        const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);

        pmrem = new THREE.PMREMGenerator(r);
        roomEnv = new RoomEnvironment();
        envRT = pmrem.fromScene(roomEnv, 0.04);
        s.environment = envRT.texture;
        roomEnv.dispose();
        roomEnv = null;
        pmrem.dispose();
        pmrem = null;

        const dirLight = new THREE.DirectionalLight(0xffdf90, 2.6);
        dirLight.position.set(2, 3, 4);
        s.add(dirLight);

        const gltf = await loader.loadAsync(SITE_ASSETS.models.clueMark);
        if (cancelled) {
          disposeThreeScene(null, gltf.scene as unknown as import("three").Scene);
          return;
        }

        const group = new THREE.Group();
        group.add(gltf.scene);
        s.add(group);

        const box = new THREE.Box3().setFromObject(group);
        const center = box.getCenter(new THREE.Vector3());
        const dims = box.getSize(new THREE.Vector3());
        gltf.scene.position.sub(center);

        const maxDim = Math.max(dims.x, dims.y, dims.z) || 1;
        camera.position.set(0, 0, 2.1 * maxDim);
        camera.lookAt(0, 0, 0);

        r.render(s, camera);
        if (reducedMotion) return;

        const clock = new THREE.Clock();
        let lastRenderMs = 0;
        const renderLoop = (now: number) => {
          if (cancelled) return;
          rafId = window.requestAnimationFrame(renderLoop);
          if (document.hidden || now - lastRenderMs < 32) return;
          lastRenderMs = now;
          const t = clock.getElapsedTime();
          group.rotation.y = 0.6 * t;
          group.position.y = Math.sin(1.4 * t) * maxDim * 0.03;
          r.render(s, camera);
        };
        rafId = window.requestAnimationFrame(renderLoop);
      } catch {
        // Fallback: keep canvas empty/non-crashing if WebGL or model loading fails
      }
    })();

    return () => {
      cancelled = true;
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      envRT?.dispose();
      roomEnv?.dispose();
      pmrem?.dispose();
      disposeThreeScene(renderer, scene);
    };
  }, []);

  const toggleHint = useCallback(() => {
    setBlessed(readBlessedFromStorage());
    setHintOpen((prev) => {
      if (prev) {
        setCoarseValue("");
      }
      return !prev;
    });
  }, []);

  const handlePointerEnter = useCallback(() => {
    const now = performance.now();
    if (now - lastShimmerRef.current < SHIMMER_COOLDOWN_MS) return;
    lastShimmerRef.current = now;
    playOneShotSfx("shimmer", 0.4, 0.7);
  }, []);

  const handleCoarseChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextVal = e.target.value;
      setCoarseValue(nextVal);
      resetHintTimer(true);
      const normalized = nextVal.trim().toLowerCase();
      if (SECRET_WORDS.some((w) => normalized === w)) {
        e.target.blur();
        setHintOpen(false);
        setCoarseValue("");
        triggerRitual();
      }
    },
    [resetHintTimer, triggerRitual]
  );

  const closeRitual = useCallback(() => {
    setRitualOpen(false);
  }, []);

  const hintLines = blessed ? CLUE_TEXTS.blessed : CLUE_TEXTS.hint;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className="clue-keeper is-near"
        aria-label="A hidden clue"
        onClick={toggleHint}
        onPointerEnter={handlePointerEnter}
      >
        <canvas ref={canvasRef} width={60} height={60} />
      </button>

      {hintOpen && (
        <div ref={hintRef} className="clue-hint is-open" role="note">
          {hintLines.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
          {isCoarse && !blessed && (
            <input
              ref={coarseInputRef}
              type="text"
              className="clue-hint__field"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={12}
              placeholder="· · · · · ·"
              aria-label="Type the word"
              value={coarseValue}
              onChange={handleCoarseChange}
            />
          )}
        </div>
      )}

      {ritualOpen && (
        <div
          className="ritual is-open"
          role="dialog"
          aria-modal="true"
          aria-label="Initiation"
        >
          <button
            type="button"
            className="ritual__close"
            aria-label="Close"
            onClick={closeRitual}
          >
            ×
          </button>
          {RITUAL_LINES.map((line, index) => (
            <p key={index} className={`ritual__line ritual__line--${index + 1}`}>
              {line}
            </p>
          ))}
        </div>
      )}
    </>
  );
}

export default ClueAndRitual;

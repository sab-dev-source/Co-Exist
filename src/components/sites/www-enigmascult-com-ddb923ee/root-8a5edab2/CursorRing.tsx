"use client";

import { useEffect, useRef, useState } from "react";

const HOVER_SELECTOR =
  'a, button, [role="button"], input, select, textarea, label, summary, .swiper';
const MAGNETIC_SELECTOR =
  ".block-hero__cta, button.wpforms-submit, .mb-single__forge, .account__pill, .enigma-auction__bid-btn";
const LERP_FACTOR = 0.22;
const BLESSED_STORAGE_KEY = "enigma-blessed";

export function CursorRing() {
  const [active, setActive] = useState(false);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const fineQuery = window.matchMedia("(pointer: fine)");
    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const syncCapability = () => {
      setActive(fineQuery.matches && !reducedQuery.matches);
    };
    syncCapability();

    fineQuery.addEventListener("change", syncCapability);
    reducedQuery.addEventListener("change", syncCapability);

    return () => {
      fineQuery.removeEventListener("change", syncCapability);
      reducedQuery.removeEventListener("change", syncCapability);
    };
  }, []);

  useEffect(() => {
    if (!active) return;

    const ring = ringRef.current;
    const label = labelRef.current;
    if (!ring || !label) return;

    document.documentElement.classList.add("has-cursor");

    const readBlessedStorage = (): boolean => {
      try {
        return window.localStorage.getItem(BLESSED_STORAGE_KEY) === "1";
      } catch {
        return false;
      }
    };

    const applyBlessed = (blessed: boolean) => {
      ring.classList.toggle("is-blessed", blessed);
    };

    applyBlessed(readBlessedStorage());

    const onBlessed = (event: Event) => {
      const custom = event as CustomEvent<
        { blessed?: unknown } | boolean | undefined
      >;
      if (typeof custom.detail === "boolean") {
        applyBlessed(custom.detail);
        return;
      }
      if (
        custom.detail &&
        typeof custom.detail === "object" &&
        "blessed" in custom.detail
      ) {
        applyBlessed(Boolean(custom.detail.blessed));
        return;
      }
      applyBlessed(readBlessedStorage());
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === BLESSED_STORAGE_KEY) {
        applyBlessed(event.newValue === "1");
      }
    };

    let mx = -100;
    let my = -100;
    let ox = -100;
    let oy = -100;
    let isOn = false;
    let magneticEl: HTMLElement | null = null;
    let rafId = 0;

    const resetMagnetic = () => {
      if (magneticEl) {
        magneticEl.style.translate = "";
        magneticEl = null;
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!isOn) {
        isOn = true;
        ring.classList.add("is-on");
      }
    };

    const onPointerDown = () => {
      ring.classList.add("is-down");
    };

    const onPointerUp = () => {
      ring.classList.remove("is-down");
    };

    const onPointerLeave = () => {
      isOn = false;
      ring.classList.remove(
        "is-on",
        "is-down",
        "is-hover",
        "is-label",
        "is-suppressed"
      );
      resetMagnetic();
    };

    const onPointerOver = (e: PointerEvent) => {
      const target = e.target instanceof Element ? e.target : null;

      const suppressed = target?.closest(".mb-preloader");
      ring.classList.toggle("is-suppressed", Boolean(suppressed));

      const nextMagnetic =
        target?.closest<HTMLElement>(MAGNETIC_SELECTOR) ?? null;
      if (nextMagnetic !== magneticEl) {
        if (magneticEl) {
          magneticEl.style.translate = "";
        }
        magneticEl = nextMagnetic;
      }

      const cursorTarget = target?.closest("[data-cursor]");
      if (cursorTarget) {
        label.textContent = cursorTarget.getAttribute("data-cursor") ?? "";
        ring.classList.add("is-label");
        ring.classList.remove("is-hover");
        return;
      }

      const hoverTarget = target?.closest(HOVER_SELECTOR);
      ring.classList.toggle("is-hover", Boolean(hoverTarget));
      ring.classList.remove("is-label");
    };

    const tick = () => {
      ox += LERP_FACTOR * (mx - ox);
      oy += LERP_FACTOR * (my - oy);
      ring.style.translate = `${ox}px ${oy}px`;

      if (magneticEl) {
        if (!magneticEl.isConnected) {
          magneticEl = null;
        } else {
          const rect = magneticEl.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = mx - cx;
          const dy = my - cy;

          if (Math.abs(dx) < rect.width && Math.abs(dy) < rect.height) {
            const tx = Math.max(-6, Math.min(6, 0.12 * dx));
            const ty = Math.max(-4, Math.min(4, 0.12 * dy));
            magneticEl.style.translate = `${tx}px ${ty}px`;
          } else {
            magneticEl.style.translate = "";
            magneticEl = null;
          }
        }
      }

      rafId = window.requestAnimationFrame(tick);
    };

    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointercancel", onPointerUp);
    document.addEventListener("pointerleave", onPointerLeave);
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("blur", onPointerLeave);
    document.addEventListener("pointerover", onPointerOver, { passive: true });
    document.addEventListener("enigma:blessed", onBlessed);
    window.addEventListener("enigma:blessed", onBlessed);
    window.addEventListener("storage", onStorage);

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      document.documentElement.classList.remove("has-cursor");
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("pointercancel", onPointerUp);
      document.removeEventListener("pointerleave", onPointerLeave);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("blur", onPointerLeave);
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("enigma:blessed", onBlessed);
      window.removeEventListener("enigma:blessed", onBlessed);
      window.removeEventListener("storage", onStorage);
      resetMagnetic();
    };
  }, [active]);

  if (!active) {
    return null;
  }

  return (
    <div ref={ringRef} className="cursor-ring" aria-hidden="true">
      <span ref={labelRef} className="cursor-ring__label" />
    </div>
  );
}

export default CursorRing;

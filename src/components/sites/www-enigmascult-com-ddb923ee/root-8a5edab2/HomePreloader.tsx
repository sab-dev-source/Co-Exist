"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

const COUNTER_DURATION_MS = 2600;
const MIN_DISPLAY_MS = 1700;
const MAX_FALLBACK_MS = 4500;
const READY_SETTLE_DELAY_MS = 450;
const LIFT_UNMOUNT_DELAY_MS = 1000;

interface SavedTitleState {
  html: string;
  dataTitle: string | null;
}

export function HomePreloader() {
  const [count, setCount] = useState(0);
  const [lifting, setLifting] = useState(false);
  const [mounted, setMounted] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrambleTextPlugin);

    const isScrolledPastThreshold = () =>
      window.scrollY > 0.5 * window.innerHeight;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (isScrolledPastThreshold() || prefersReducedMotion) {
      document.documentElement.classList.remove("home-loading");
      let cancelled = false;
      queueMicrotask(() => {
        if (!cancelled) {
          setMounted(false);
        }
      });
      return () => {
        cancelled = true;
      };
    }

    const titleEl = document.querySelector<HTMLElement>("h1.block-hero__title");
    let savedTitle: SavedTitleState | null = null;

    if (titleEl && /\bDecode\b/i.test(titleEl.innerHTML)) {
      savedTitle = {
        html: titleEl.innerHTML,
        dataTitle: titleEl.getAttribute("data-title"),
      };
      const toDecoding = (value: string) =>
        value.replace(/\b(Decod)e\b/i, "$1ing");
      titleEl.innerHTML = toDecoding(titleEl.innerHTML);
      if (savedTitle.dataTitle !== null) {
        titleEl.setAttribute("data-title", toDecoding(savedTitle.dataTitle));
      }
    }

    let disposed = false;
    let finished = false;
    let heroReady = false;
    let currentCount = 0;
    const startTime = performance.now();

    let rafId = 0;
    let intervalId = 0;
    let minDelayTimerId = 0;
    let readyDelayTimerId = 0;
    let fallbackTimerId = 0;
    let unmountTimerId = 0;
    let scrambleTween: gsap.core.Tween | null = null;

    const restoreTitleImmediate = () => {
      if (!savedTitle || !titleEl) return;
      const snapshot = savedTitle;
      savedTitle = null;
      if (snapshot.dataTitle !== null) {
        titleEl.setAttribute("data-title", snapshot.dataTitle);
      }
      titleEl.innerHTML = snapshot.html;
    };

    const descrambleTitle = () => {
      if (!savedTitle || !titleEl) return;
      const snapshot = savedTitle;
      savedTitle = null;

      if (snapshot.dataTitle !== null) {
        titleEl.setAttribute("data-title", snapshot.dataTitle);
      }

      const restoreHtml = () => {
        titleEl.innerHTML = snapshot.html;
      };

      const wrappedHtml = titleEl.innerHTML.replace(
        /\b(Decoding)\b/i,
        "<span data-descramble>$1</span>"
      );
      const originalWordMatch = snapshot.html.match(/\bDecode\b/i);

      if (wrappedHtml !== titleEl.innerHTML && originalWordMatch) {
        titleEl.innerHTML = wrappedHtml;
        const target = titleEl.querySelector<HTMLElement>("[data-descramble]");
        if (target) {
          scrambleTween = gsap.to(target, {
            duration: 0.9,
            scrambleText: {
              text: originalWordMatch[0],
              chars: "upperCase",
              speed: 0.4,
            },
            onComplete: restoreHtml,
          });
          return;
        }
      }

      restoreHtml();
    };

    const updateCounter = () => {
      if (disposed || (finished && currentCount >= 100)) return;
      const progress = (performance.now() - startTime) / COUNTER_DURATION_MS;
      const eased = 1 - Math.pow(1 - Math.min(1, progress), 3);
      const target = heroReady ? 100 : Math.min(92, Math.round(92 * eased));
      if (target > currentCount) {
        currentCount = heroReady ? Math.min(100, currentCount + 4) : target;
        setCount(currentCount);
      }
    };

    const tick = () => {
      if (disposed || finished) return;
      updateCounter();
      rafId = window.requestAnimationFrame(tick);
    };

    const cleanupListeners = () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("enigma:hero-ready", onHeroReady);
      window.removeEventListener("enigma:hero-ready", onHeroReady);
      window.removeEventListener("pageshow", onPageShow);
    };

    const finish = (immediate: boolean) => {
      if (disposed || finished) return;
      const elapsed = performance.now() - startTime;
      if (!immediate && elapsed < MIN_DISPLAY_MS) {
        window.clearTimeout(minDelayTimerId);
        minDelayTimerId = window.setTimeout(
          () => finish(false),
          MIN_DISPLAY_MS - elapsed
        );
        return;
      }

      finished = true;
      heroReady = true;
      currentCount = 100;
      setCount(100);

      window.cancelAnimationFrame(rafId);
      window.clearInterval(intervalId);
      window.clearTimeout(minDelayTimerId);
      window.clearTimeout(readyDelayTimerId);
      window.clearTimeout(fallbackTimerId);
      cleanupListeners();

      if (immediate) {
        restoreTitleImmediate();
        document.documentElement.classList.remove("home-loading");
        setMounted(false);
        return;
      }

      descrambleTitle();
      rootRef.current?.classList.add("is-lifting");
      document.documentElement.classList.remove("home-loading");
      setLifting(true);

      unmountTimerId = window.setTimeout(() => {
        if (!disposed) {
          setMounted(false);
        }
      }, LIFT_UNMOUNT_DELAY_MS);
    };

    function onScroll() {
      if (isScrolledPastThreshold()) {
        finish(true);
      }
    }

    function onHeroReady() {
      if (heroReady || finished || disposed) return;
      heroReady = true;
      readyDelayTimerId = window.setTimeout(
        () => finish(false),
        READY_SETTLE_DELAY_MS
      );
    }

    function onPageShow(e: PageTransitionEvent) {
      if (e.persisted) {
        finish(true);
      }
    }

    rafId = window.requestAnimationFrame(tick);
    intervalId = window.setInterval(updateCounter, 400);

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("enigma:hero-ready", onHeroReady, { once: true });
    window.addEventListener("enigma:hero-ready", onHeroReady, { once: true });
    window.addEventListener("pageshow", onPageShow);
    fallbackTimerId = window.setTimeout(() => finish(false), MAX_FALLBACK_MS);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(rafId);
      window.clearInterval(intervalId);
      window.clearTimeout(minDelayTimerId);
      window.clearTimeout(readyDelayTimerId);
      window.clearTimeout(fallbackTimerId);
      window.clearTimeout(unmountTimerId);
      cleanupListeners();
      if (scrambleTween) {
        scrambleTween.kill();
        scrambleTween = null;
      }
      restoreTitleImmediate();
    };
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div
      ref={rootRef}
      className={lifting ? "home-preloader is-lifting" : "home-preloader"}
      aria-hidden="true"
    >
      <div className="home-preloader__meta">
        <span className="home-preloader__count" data-preloader-count="">
          {count}
        </span>
      </div>
    </div>
  );
}

export default HomePreloader;

"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { playOneShotSfx } from "@/components/sites/www-enigmascult-com-ddb923ee/shared/sfx";
import { FIND_PRICE_QUERIES, SITE_ASSETS } from "./data";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const mql = window.matchMedia(REDUCED_MOTION_QUERY);
  mql.addEventListener("change", onStoreChange);
  return () => mql.removeEventListener("change", onStoreChange);
}

function getReducedMotionSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getReducedMotionServerSnapshot(): boolean {
  return false;
}

export function FindPriceSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLAnchorElement>(null);
  const queryRef = useRef<HTMLSpanElement>(null);
  const lastClockHoverRef = useRef(0);
  const initialQuery = FIND_PRICE_QUERIES[0] ?? "";
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  useEffect(() => {
    const bar = barRef.current;
    const querySpan = queryRef.current;
    const queries = FIND_PRICE_QUERIES;
    if (!bar || !querySpan || queries.length < 2) {
      return;
    }
    if (prefersReducedMotion) {
      querySpan.textContent = initialQuery;
      return;
    }

    let queryIndex = 0;
    let isActive = true;
    let isIntersecting = false;
    let timerId: number | null = null;
    let pendingStep: (() => void) | null = null;
    let disposed = false;

    const schedule = (fn: () => void, delay: number) => {
      if (disposed) return;
      if (timerId !== null) window.clearTimeout(timerId);
      timerId = window.setTimeout(() => {
        timerId = null;
        if (disposed) return;
        if (isActive) {
          fn();
        } else {
          pendingStep = fn;
        }
      }, delay);
    };

    const step = (word: string, len: number, dir: 1 | -1) => {
      if (disposed) return;
      if (queryRef.current) {
        queryRef.current.textContent = word.slice(0, len);
      }
      if (dir > 0 && len === word.length) {
        schedule(() => step(word, len, -1), 2200);
      } else if (dir < 0 && len === 0) {
        queryIndex = (queryIndex + 1) % queries.length;
        schedule(() => step(queries[queryIndex], 0, 1), 350);
      } else {
        schedule(() => step(word, len + dir, dir), dir > 0 ? 65 : 32);
      }
    };

    const updateActive = (visible: boolean) => {
      isActive = visible && !document.hidden;
      if (isActive && pendingStep) {
        const next = pendingStep;
        pendingStep = null;
        next();
      }
    };

    const handleVisibilityChange = () => {
      updateActive("IntersectionObserver" in window ? isIntersecting : true);
    };

    let observer: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      isActive = false;
      observer = new IntersectionObserver(
        (entries) => {
          isIntersecting = entries.some((entry) => entry.isIntersecting);
          updateActive(isIntersecting);
        },
        { rootMargin: "150px" }
      );
      observer.observe(bar);
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    schedule(() => step(queries[0], queries[0].length, -1), 2600);

    return () => {
      disposed = true;
      if (timerId !== null) window.clearTimeout(timerId);
      pendingStep = null;
      observer?.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [prefersReducedMotion, initialQuery]);

  return (
    <section ref={sectionRef} className="find-price alignfull">
      <div className="find-price__decor" aria-hidden="true">
        <img
          className="find-price__angel"
          src={SITE_ASSETS.pageImg.findPriceCupid}
          alt=""
          loading="lazy"
          decoding="async"
        />
      </div>
      <h2 className="find-price__title">{"Sign up for\nearly access"}</h2>
      <a
        ref={barRef}
        className="find-price__bar"
        href="#inner-circle"
        onPointerEnter={() => {
          const now = performance.now();
          if (now - lastClockHoverRef.current > 2200) {
            lastClockHoverRef.current = now;
            playOneShotSfx("clock", 0.25, 0.55);
          }
        }}
        onClick={() => playOneShotSfx("descent", 0.45, 0.5)}
      >
        <span ref={queryRef} className="find-price__query">
          {initialQuery}
        </span>
        <span className="find-price__caret" aria-hidden="true" />
        <img
          decoding="async"
          className="find-price__arrow"
          src={SITE_ASSETS.pageImg.findArrow}
          alt=""
          aria-hidden="true"
        />
      </a>
      <p className="find-price__tagline">
        {"Updates on drops and exclusive meetups."}
      </p>
    </section>
  );
}

export default FindPriceSection;

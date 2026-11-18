"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
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
  const initialQuery = FIND_PRICE_QUERIES[0] ?? "";
  const [typedQuery, setTypedQuery] = useState<string>(initialQuery);
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  useEffect(() => {
    const bar = barRef.current;
    const queries = FIND_PRICE_QUERIES;
    if (!bar || prefersReducedMotion || queries.length < 2) {
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
      setTypedQuery(word.slice(0, len));
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
  }, [prefersReducedMotion]);

  const displayQuery = prefersReducedMotion ? initialQuery : typedQuery;

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
      <h2 className="find-price__title">{"Find it at\nmy price"}</h2>
      <a ref={barRef} className="find-price__bar" href="/find-it-at-my-price/">
        <span className="find-price__query">{displayQuery}</span>
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
        {"You set the price.\nWe hunt the item.\nNo raffles. No Ls. Just results."}
      </p>
    </section>
  );
}

export default FindPriceSection;

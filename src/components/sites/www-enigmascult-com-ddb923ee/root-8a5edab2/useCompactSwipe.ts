"use client";

import type { PointerEvent, TouchEvent } from "react";
import { useEffect, useRef, useState } from "react";

const COMPACT_MEDIA_QUERY = "(max-width: 1023px)";
const SWIPE_THRESHOLD_PX = 36;

interface SwipeState {
  active: boolean;
  handled: boolean;
  startX: number;
  startY: number;
  source: "pointer" | "touch" | null;
}

interface UseCompactSwipeOptions {
  itemCount: number;
  activeIndex: number;
  onSelect: (nextIndex: number) => void;
}

/**
 * Tracks the <=1023px breakpoint and provides horizontal pointer/touch swipe
 * navigation (>=36px) for showcase figures.
 */
export function useCompactSwipe({
  itemCount,
  activeIndex,
  onSelect,
}: UseCompactSwipeOptions) {
  const [isCompact, setIsCompact] = useState(false);
  const swipeRef = useRef<SwipeState>({
    active: false,
    handled: false,
    startX: 0,
    startY: 0,
    source: null,
  });

  useEffect(() => {
    const mql = window.matchMedia(COMPACT_MEDIA_QUERY);
    const sync = () => setIsCompact(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  const startSwipe = (
    clientX: number,
    clientY: number,
    source: "pointer" | "touch",
    target: EventTarget | null
  ) => {
    if (!isCompact || itemCount < 2) return;
    if (target instanceof Element && target.closest("button")) return;
    swipeRef.current = {
      active: true,
      handled: false,
      startX: clientX,
      startY: clientY,
      source,
    };
  };

  const moveSwipe = (
    clientX: number,
    clientY: number,
    source: "pointer" | "touch"
  ) => {
    const state = swipeRef.current;
    if (!state.active || state.handled || state.source !== source) return;
    const dx = clientX - state.startX;
    const dy = clientY - state.startY;
    if (Math.abs(dy) > Math.abs(dx)) {
      state.active = false;
      return;
    }
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return;
    state.handled = true;
    const nextIndex = Math.min(
      itemCount - 1,
      Math.max(0, activeIndex + (dx < 0 ? 1 : -1))
    );
    if (nextIndex !== activeIndex) {
      onSelect(nextIndex);
    }
  };

  const endSwipe = (source: "pointer" | "touch") => {
    if (swipeRef.current.source === source) {
      swipeRef.current.active = false;
    }
  };

  const swipeProps = {
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      startSwipe(e.clientX, e.clientY, "pointer", e.target);
    },
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      if (e.pointerType === "mouse" && e.buttons === 0) {
        endSwipe("pointer");
        return;
      }
      moveSwipe(e.clientX, e.clientY, "pointer");
    },
    onPointerUp: () => endSwipe("pointer"),
    onPointerCancel: () => endSwipe("pointer"),
    onTouchStart: (e: TouchEvent<HTMLElement>) => {
      if (swipeRef.current.active) return;
      const touch = e.touches[0];
      if (!touch) return;
      startSwipe(touch.clientX, touch.clientY, "touch", e.target);
    },
    onTouchMove: (e: TouchEvent<HTMLElement>) => {
      const touch = e.touches[0];
      if (!touch) return;
      moveSwipe(touch.clientX, touch.clientY, "touch");
    },
    onTouchEnd: () => endSwipe("touch"),
    onTouchCancel: () => endSwipe("touch"),
  };

  return { isCompact, swipeProps };
}

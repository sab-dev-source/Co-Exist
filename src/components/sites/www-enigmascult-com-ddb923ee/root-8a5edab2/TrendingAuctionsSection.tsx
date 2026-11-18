"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Swiper from "swiper";
import { A11y, Autoplay, Keyboard, Navigation } from "swiper/modules";
import "swiper/css";
import {
  TrendChevronNextIcon,
  TrendChevronPrevIcon,
} from "@/components/sites/www-enigmascult-com-ddb923ee/shared/icons";
import {
  createLoopingSfx,
  getAudioContext,
  isSoundEnabled,
  subscribeSoundState,
} from "@/components/sites/www-enigmascult-com-ddb923ee/shared/sfx";
import { BidModal } from "./BidModal";
import { SITE_ASSETS, TRENDING_AUCTIONS } from "./data";
import type { AuctionLotItem } from "./types";

interface CountdownParts {
  d: number;
  h: number;
  m: number;
  s: number;
}

const INITIAL_COUNTDOWN: CountdownParts = { d: 7, h: 21, m: 51, s: 46 };

function getCountdownParts(
  endsAtUnix: number,
  nowMs: number | null
): CountdownParts {
  if (nowMs === null) {
    return INITIAL_COUNTDOWN;
  }
  const remainingSec = Math.max(0, Math.floor(endsAtUnix - nowMs / 1000));
  const d = Math.floor(remainingSec / 86400);
  const h = Math.floor((remainingSec % 86400) / 3600);
  const m = Math.floor((remainingSec % 3600) / 60);
  const s = remainingSec % 60;
  return { d, h, m, s };
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function getSliderOffset(): number {
  if (typeof window === "undefined") return 0;
  return Math.max(
    0,
    (window.innerWidth - Math.min(0.89 * window.innerWidth, 1710)) / 2
  );
}

export function TrendingAuctionsSection() {
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);
  const swiperRef = useRef<Swiper | null>(null);
  const clockSfxRef = useRef<ReturnType<typeof createLoopingSfx> | null>(null);
  const isVisibleRef = useRef(false);
  const isHoveredRef = useRef(false);
  const modalOpenRef = useRef(false);

  const [selectedLot, setSelectedLot] = useState<AuctionLotItem | null>(null);
  const [nowMs, setNowMs] = useState<number | null>(null);

  const handleCloseModal = useCallback(() => {
    setSelectedLot(null);
  }, []);

  // Sync live 1s countdown on client mount only so SSR and initial hydration match.
  useEffect(() => {
    const syncClock = () => setNowMs(Date.now());
    const initTimer = window.setTimeout(syncClock, 0);
    const intervalId = window.setInterval(syncClock, 1000);
    return () => {
      window.clearTimeout(initTimer);
      window.clearInterval(intervalId);
    };
  }, []);

  // Clock ticking SFX on timer hover.
  useEffect(() => {
    const clockSfx = createLoopingSfx("clock", 0.35);
    clockSfxRef.current = clockSfx;
    const unsubscribe = subscribeSoundState((on) => {
      if (!on) {
        clockSfx.stop();
      }
    });
    return () => {
      unsubscribe();
      clockSfx.stop();
      clockSfxRef.current = null;
    };
  }, []);

  // Initialize Swiper carousel and viewport-gated autoplay.
  useEffect(() => {
    const sliderEl = sliderRef.current;
    const prevEl = prevRef.current;
    const nextEl = nextRef.current;
    if (!sliderEl || !prevEl || !nextEl) return;

    const initialOffset = getSliderOffset();
    const swiper = new Swiper(sliderEl, {
      modules: [Navigation, Autoplay, Keyboard, A11y],
      slidesPerView: 1,
      spaceBetween: 24,
      watchOverflow: true,
      grabCursor: true,
      rewind: true,
      slidesOffsetBefore: initialOffset,
      slidesOffsetAfter: initialOffset,
      navigation: {
        prevEl,
        nextEl,
      },
      keyboard: {
        enabled: true,
        onlyInViewport: true,
      },
      autoplay: {
        delay: 4000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
        enabled: false,
      },
      breakpoints: {
        768: {
          slidesPerView: 1.4,
          spaceBetween: 96,
        },
        1200: {
          slidesPerView: 2.8,
          spaceBetween: 96,
        },
      },
      on: {
        beforeResize: (instance) => {
          const nextOffset = getSliderOffset();
          instance.params.slidesOffsetBefore = nextOffset;
          instance.params.slidesOffsetAfter = nextOffset;
          instance.originalParams.slidesOffsetBefore = nextOffset;
          instance.originalParams.slidesOffsetAfter = nextOffset;
        },
      },
    });
    swiperRef.current = swiper;

    const syncAutoplay = () => {
      if (isVisibleRef.current && !isHoveredRef.current && !modalOpenRef.current) {
        swiper.autoplay?.start();
      } else {
        swiper.autoplay?.stop();
      }
    };

    const handlePointerEnter = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      isHoveredRef.current = true;
      syncAutoplay();
    };

    const handlePointerLeave = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      isHoveredRef.current = false;
      syncAutoplay();
    };

    sliderEl.addEventListener("pointerenter", handlePointerEnter);
    sliderEl.addEventListener("pointerleave", handlePointerLeave);

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        isVisibleRef.current = entry.isIntersecting;
        syncAutoplay();
      },
      { threshold: 0.35 }
    );
    observer.observe(sliderEl);

    return () => {
      observer.disconnect();
      sliderEl.removeEventListener("pointerenter", handlePointerEnter);
      sliderEl.removeEventListener("pointerleave", handlePointerLeave);
      swiper.destroy(true, true);
      swiperRef.current = null;
    };
  }, []);

  // Pause autoplay while bid modal is open.
  useEffect(() => {
    modalOpenRef.current = Boolean(selectedLot);
    const swiper = swiperRef.current;
    if (!swiper) return;
    if (selectedLot) {
      swiper.autoplay?.stop();
    } else if (isVisibleRef.current && !isHoveredRef.current) {
      swiper.autoplay?.start();
    }
  }, [selectedLot]);

  const handleTimerMouseEnter = useCallback(() => {
    if (!isSoundEnabled()) return;
    const ctx = getAudioContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    clockSfxRef.current?.start();
  }, []);

  const handleTimerMouseLeave = useCallback(() => {
    clockSfxRef.current?.stop();
  }, []);

  return (
    <section className="trend alignfull">
      <h2 className="trend__title" data-graffiti="Trending Auctions">
        Trending Auctions
      </h2>

      <div
        ref={sliderRef}
        className="trend__slider swiper"
        data-trend-slider=""
        data-count={TRENDING_AUCTIONS.length}
      >
        <ul className="trend__grid swiper-wrapper">
          {TRENDING_AUCTIONS.map((lot) => {
            const parts = getCountdownParts(lot.endsAtUnix, nowMs);
            return (
              <li key={lot.id} className="trend__card swiper-slide">
                <a className="trend__media" data-cursor="Bid" href={lot.href}>
                  <img
                    src={lot.imgSrc}
                    width={819}
                    height={1024}
                    alt={lot.title}
                    loading="lazy"
                    decoding="async"
                  />
                  <img
                    decoding="async"
                    className="trend__glow-bar"
                    src={SITE_ASSETS.pageImg.trendGlow}
                    alt=""
                    aria-hidden="true"
                  />
                </a>

                <div className="trend__head">
                  <div className="trend__id">
                    <a className="trend__name" href={lot.href}>
                      {lot.title}
                    </a>
                  </div>
                  <div className="trend__time">
                    <span className="trend__label">Time left</span>
                    <span
                      className="trend__timer js-timer"
                      aria-live="polite"
                      data-end={lot.endsAtUnix}
                      onMouseEnter={handleTimerMouseEnter}
                      onMouseLeave={handleTimerMouseLeave}
                    >
                      <span className="js-timer__seg">
                        <b>{parts.d}</b>
                        <i>D</i>
                      </span>
                      <span className="js-timer__seg">
                        <b>{pad2(parts.h)}</b>
                        <i>H</i>
                      </span>
                      <span className="js-timer__seg">
                        <b>{pad2(parts.m)}</b>
                        <i>M</i>
                      </span>
                      <span className="js-timer__seg">
                        <b>{pad2(parts.s)}</b>
                        <i>S</i>
                      </span>
                    </span>
                  </div>
                </div>

                <p className="trend__current">
                  <span className="trend__label">Current bid:</span>{" "}
                  <span className="trend__amount js-current">
                    {lot.currentBidFormatted}
                  </span>
                </p>

                <div className="trend__cta">
                  <a
                    className="trend__details"
                    href={lot.href}
                    aria-label={`Show details — ${lot.title}`}
                  >
                    Show details
                  </a>
                  <button
                    type="button"
                    className="trend__bid"
                    onClick={() => setSelectedLot(lot)}
                  >
                    Bid now
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        <button
          ref={prevRef}
          type="button"
          className="trend__nav trend__nav--prev"
          aria-label="Previous slide"
        >
          <TrendChevronPrevIcon />
        </button>
        <button
          ref={nextRef}
          type="button"
          className="trend__nav trend__nav--next"
          aria-label="Next slide"
        >
          <TrendChevronNextIcon />
        </button>
      </div>

      <a
        className="trend__viewall"
        href="/auctions/"
        aria-label="Forge yours — Auctions"
      >
        Forge yours
      </a>

      <BidModal lot={selectedLot} onClose={handleCloseModal} />
    </section>
  );
}

export default TrendingAuctionsSection;

"use client";

/* eslint-disable @next/next/no-img-element */

import type { FocusEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import Swiper from "swiper";
import { A11y, FreeMode, Keyboard, Navigation } from "swiper/modules";
import "swiper/css";
import {
  TrendChevronNextIcon,
  TrendChevronPrevIcon,
} from "@/components/sites/www-enigmascult-com-ddb923ee/shared/icons";
import {
  playOneShotSfx,
  playOneShotSfxCooldown,
  playSlideTick,
} from "@/components/sites/www-enigmascult-com-ddb923ee/shared/sfx";
import { KARACHI_PRODUCTS, SITE_ASSETS, TOP_SNEAKERS } from "./data";
import type { KarachiProductCategory, KarachiProductItem } from "./types";
import { useCompactSwipe } from "./useCompactSwipe";

const CATEGORIES: KarachiProductCategory[] = [
  "All",
  "Heavyweight Tees",
  "Hoodies",
  "Long Sleeves",
];

/**
 * Interactive "Karachi Chapter" section:
 * 1. Signature Roman-numeral spotlight stage with ruled 16:9 frame and frosted shelf-drop reveal.
 * 2. Single-row swipeable Co-Exist lookbook product rail (no pricing/buying chrome)
 *    with a single "Request Early Access" CTA and click-to-inspect editorial modal.
 */
export function TopSneakersSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isInstant, setIsInstant] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<KarachiProductCategory>("All");
  const [activeProduct, setActiveProduct] = useState<KarachiProductItem | null>(null);
  const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);

  const sectionRef = useRef<HTMLElement>(null);
  const figureRef = useRef<HTMLElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const prevBtnRef = useRef<HTMLButtonElement>(null);
  const nextBtnRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  const active = TOP_SNEAKERS[activeIndex] ?? TOP_SNEAKERS[0];

  // Warm-cache the 5 spotlight images once idle so hovering rows I-V swaps with 0ms decode hitch
  useEffect(() => {
    const timer = window.setTimeout(() => {
      TOP_SNEAKERS.forEach((item) => {
        const img = new Image();
        img.decoding = "async";
        img.src = item.imgSrc;
      });
    }, 600);
    return () => window.clearTimeout(timer);
  }, []);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All") return KARACHI_PRODUCTS;
    return KARACHI_PRODUCTS.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  // Initialize / refresh single-row swipeable Swiper rail when category changes
  useEffect(() => {
    const sliderEl = sliderRef.current;
    const prevEl = prevBtnRef.current;
    const nextEl = nextBtnRef.current;
    if (!sliderEl || !prevEl || !nextEl) return;

    const swiper = new Swiper(sliderEl, {
      modules: [Navigation, Keyboard, A11y, FreeMode],
      slidesPerView: 1.18,
      spaceBetween: 16,
      grabCursor: true,
      watchOverflow: true,
      freeMode: {
        enabled: true,
        sticky: false,
        momentumRatio: 0.75,
      },
      keyboard: { enabled: true },
      navigation: {
        prevEl,
        nextEl,
      },
      on: {
        slideChange() {
          playSlideTick();
        },
      },
      breakpoints: {
        640: {
          slidesPerView: 2.2,
          spaceBetween: 20,
        },
        1024: {
          slidesPerView: 3.15,
          spaceBetween: 24,
        },
        1360: {
          slidesPerView: 3.6,
          spaceBetween: 28,
        },
      },
    });

    return () => {
      swiper.destroy(true, true);
    };
  }, [selectedCategory]);

  const openProductModal = (product: KarachiProductItem) => {
    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    setActiveProduct(product);
    setActiveGalleryIdx(0);
    playOneShotSfx("chest", 0.36, 0.65);
  };

  const openProductById = (id: string) => {
    const found = KARACHI_PRODUCTS.find((p) => p.id === id);
    if (found) openProductModal(found);
  };

  const closeProductModal = () => {
    setActiveProduct(null);
    playOneShotSfx("whoosh", 0.24, 0.45);
    const prev = lastFocusedRef.current;
    lastFocusedRef.current = null;
    if (prev && document.contains(prev)) {
      prev.focus({ preventScroll: true });
    }
  };

  useEffect(() => {
    if (!activeProduct) return;
    closeBtnRef.current?.focus({ preventScroll: true });
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeProductModal();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [activeProduct]);

  const selectWithReveal = (idx: number) => {
    const clamped = Math.min(TOP_SNEAKERS.length - 1, Math.max(0, idx));
    if (clamped === activeIndex && isRevealed) return;
    playOneShotSfxCooldown("steps", 0.28, 0.4, 140, "karachi-shelf");
    flushSync(() => {
      setIsInstant(true);
      setIsRevealed(false);
      setActiveIndex(clamped);
    });
    void sectionRef.current?.offsetWidth;
    flushSync(() => {
      setIsInstant(false);
      setIsRevealed(true);
    });
  };

  const { isCompact, swipeProps } = useCompactSwipe({
    itemCount: TOP_SNEAKERS.length,
    activeIndex,
    onSelect: selectWithReveal,
  });

  const handleListLeave = () => {
    setIsInstant(false);
    setIsRevealed(false);
  };

  const handleListBlur = (e: FocusEvent<HTMLOListElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setIsInstant(false);
      setIsRevealed(false);
    }
  };

  const sectionClasses = [
    "tsneak",
    "alignfull",
    isInstant ? "is-instant" : "",
    isRevealed ? "is-revealed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const activeGalleryItem =
    activeProduct?.gallery[activeGalleryIdx] ?? activeProduct?.gallery[0] ?? null;

  return (
    <section ref={sectionRef} id="karachi-chapter" className={sectionClasses} data-top-sneakers="">
      <h2
        className="tsneak__title"
        data-graffiti="Karachi Chapter"
        onPointerEnter={() =>
          playOneShotSfxCooldown("shimmer", 0.32, 0.7, 2400, "karachi-title")
        }
      >
        Karachi Chapter
      </h2>

      {/* ── Flagship Spotlight Stage (Preserves Signature Ruled Shelf Reveal) ── */}
      <div className="tsneak__body">
        <ol
          className="tsneak__list"
          onMouseLeave={handleListLeave}
          onBlur={handleListBlur}
        >
          {TOP_SNEAKERS.map((item, i) => (
            <li key={item.id}>
              <a
                className={`tsneak__row${activeIndex === i ? " is-active" : ""}`}
                href={item.href}
                onMouseEnter={() => selectWithReveal(i)}
                onFocus={() => selectWithReveal(i)}
                onClick={(e) => {
                  e.preventDefault();
                  openProductById(item.id);
                }}
              >
                <span className="tsneak__row-name">{item.name}</span>
                <span className="tsneak__row-num">{item.roman}</span>
              </a>
            </li>
          ))}
        </ol>

        <figure
          ref={figureRef}
          className="tsneak__figure"
          data-cursor="View"
          onClick={() => openProductById(active.id)}
          {...swipeProps}
        >
          <span className="tsneak__ruler tsneak__ruler--left" aria-hidden="true" />
          <span className="tsneak__ruler tsneak__ruler--right" aria-hidden="true" />
          <img
            decoding="async"
            className="tsneak__shelf"
            src={SITE_ASSETS.pageImg.tsneakShelf}
            alt=""
            aria-hidden="true"
            draggable={false}
          />
          <img
            className="tsneak__img"
            src={active.imgSrc}
            alt={active.name}
            decoding="async"
            draggable={false}
          />
          <span className="tsneak__num" aria-hidden="true">
            {active.numeral}
          </span>

          {isCompact && (
            <>
              <button
                type="button"
                className="home-swipe home-swipe--prev"
                aria-label="Previous"
                disabled={activeIndex <= 0}
                onClick={(e) => {
                  e.stopPropagation();
                  selectWithReveal(activeIndex - 1);
                }}
              />
              <button
                type="button"
                className="home-swipe home-swipe--next"
                aria-label="Next"
                disabled={activeIndex >= TOP_SNEAKERS.length - 1}
                onClick={(e) => {
                  e.stopPropagation();
                  selectWithReveal(activeIndex + 1);
                }}
              />
            </>
          )}
        </figure>
      </div>

      {/* ── Single-Row Swipeable Co-Exist Product Grid ── */}
      <div id="karachi-chapter-grid" className="kchapter">
        <div className="kchapter__header">
          <div className="kchapter__heading-group">
            <p className="kchapter__eyebrow">DROP 03 // 021-RAW · 24.8607° N 67.0011° E</p>
            <h3 className="kchapter__subtitle">Streetwear Silhouettes</h3>
          </div>

          <div className="kchapter__controls">
            <div className="kchapter__filters" role="tablist" aria-label="Filter Karachi Chapter pieces">
              {CATEGORIES.map((category) => {
                const isSelected = selectedCategory === category;
                const count =
                  category === "All"
                    ? KARACHI_PRODUCTS.length
                    : KARACHI_PRODUCTS.filter((p) => p.category === category).length;
                return (
                  <button
                    key={category}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    className={`kchapter__filter${isSelected ? " is-active" : ""}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    <span>{category}</span>
                    <sup className="kchapter__filter-count">{count}</sup>
                  </button>
                );
              })}
            </div>

            <div className="kchapter__arrows" aria-label="Scroll product row">
              <button
                ref={prevBtnRef}
                type="button"
                className="kchapter__arrow"
                aria-label="Previous pieces"
              >
                <TrendChevronPrevIcon />
              </button>
              <button
                ref={nextBtnRef}
                type="button"
                className="kchapter__arrow"
                aria-label="Next pieces"
              >
                <TrendChevronNextIcon />
              </button>
            </div>
          </div>
        </div>

        <div ref={sliderRef} className="kchapter__slider swiper" data-cursor="Drag">
          <ul className="kchapter__track swiper-wrapper">
            {filteredProducts.map((product) => (
              <li key={product.id} className="kchapter__slide swiper-slide">
                <article className="kchapter__card">
                  <button
                    type="button"
                    className="kchapter__media"
                    data-cursor="View"
                    aria-label={`Inspect ${product.name}`}
                    onClick={() => openProductModal(product)}
                  >
                    <img
                      className="kchapter__img kchapter__img--primary"
                      src={product.imgSrc}
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      style={{ objectPosition: product.objectPosition ?? "center center" }}
                    />
                    {product.altImgSrc && (
                      <img
                        className="kchapter__img kchapter__img--alt"
                        src={product.altImgSrc}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                        style={{ objectPosition: product.altObjectPosition ?? "center center" }}
                      />
                    )}
                    <span className="kchapter__overlay-cta" aria-hidden="true">
                      Inspect Piece · {product.numeral}
                    </span>
                  </button>

                  <div className="kchapter__meta">
                    <div className="kchapter__meta-top">
                      <span className="kchapter__spec">
                        {product.numeral} / {product.dropCode}
                      </span>
                      <span className="kchapter__edition">{product.category}</span>
                    </div>
                    <h4 className="kchapter__name">
                      <button
                        type="button"
                        className="kchapter__name-btn"
                        onClick={() => openProductModal(product)}
                      >
                        {product.name}
                      </button>
                    </h4>
                    <p className="kchapter__subline">{product.fabric}</p>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Single CTA Button ── */}
      <a className="tsneak__cta" href="#inner-circle" aria-label="Request Early Access">
        Request Early Access
      </a>

      {/* ── Editorial Quick-View Modal (No Pricing / No Buy Controls) ── */}
      {activeProduct && (
        <div
          className="kchapter-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="kchapter-modal-title"
        >
          <div className="kchapter-modal__backdrop" onClick={closeProductModal} />
          <div className="kchapter-modal__panel">
            <button
              ref={closeBtnRef}
              type="button"
              className="kchapter-modal__close"
              aria-label="Close preview"
              onClick={closeProductModal}
            >
              ×
            </button>

            <div className="kchapter-modal__gallery">
              <div className="kchapter-modal__stage">
                {activeGalleryItem && (
                  <img
                    className="kchapter-modal__main-img"
                    src={activeGalleryItem.src}
                    alt={`${activeProduct.name} — ${activeGalleryItem.label}`}
                    style={{ objectPosition: activeGalleryItem.objectPosition ?? "center center" }}
                  />
                )}
                <span className="kchapter-modal__num" aria-hidden="true">
                  {activeProduct.numeral}
                </span>
              </div>

              {activeProduct.gallery.length > 1 && (
                <div className="kchapter-modal__thumbs" role="tablist" aria-label="Piece views">
                  {activeProduct.gallery.map((media, idx) => (
                    <button
                      key={`${activeProduct.id}-${media.src}`}
                      type="button"
                      role="tab"
                      aria-selected={idx === activeGalleryIdx}
                      className={`kchapter-modal__thumb${idx === activeGalleryIdx ? " is-active" : ""}`}
                      onClick={() => {
                        setActiveGalleryIdx(idx);
                        playSlideTick();
                      }}
                    >
                      <img
                        src={media.src}
                        alt={media.label}
                        style={{ objectPosition: media.objectPosition ?? "center center" }}
                      />
                      <span>{media.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="kchapter-modal__info">
              <p className="kchapter-modal__eyebrow">
                {activeProduct.dropCode} · {activeProduct.edition}
              </p>
              <h3 id="kchapter-modal-title" className="kchapter-modal__title">
                {activeProduct.name}
              </h3>
              <p className="kchapter-modal__subtitle-line">{activeProduct.subtitle}</p>
              <p className="kchapter-modal__desc">{activeProduct.description}</p>

              <dl className="kchapter-modal__specs">
                <div>
                  <dt>Fabric</dt>
                  <dd>{activeProduct.fabric}</dd>
                </div>
                <div>
                  <dt>Silhouette</dt>
                  <dd>{activeProduct.fit}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>Pre-Release · Inner Circle Only</dd>
                </div>
              </dl>

              <div className="kchapter-modal__actions">
                <a
                  className="kchapter-modal__primary"
                  href="#inner-circle"
                  onClick={() => closeProductModal()}
                >
                  Request Early Access
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default TopSneakersSection;

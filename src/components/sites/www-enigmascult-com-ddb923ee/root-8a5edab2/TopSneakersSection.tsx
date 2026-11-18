"use client";

import type { FocusEvent } from "react";
import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { SITE_ASSETS, TOP_SNEAKERS } from "./data";
import { useCompactSwipe } from "./useCompactSwipe";

/**
 * Interactive "Top Sneakers" showcase with hover/focus shelf-drop reveal on
 * desktop and button + horizontal swipe controls below 1024px.
 */
export function TopSneakersSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isInstant, setIsInstant] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const figureRef = useRef<HTMLElement>(null);

  const active = TOP_SNEAKERS[activeIndex] ?? TOP_SNEAKERS[0];

  const selectWithReveal = (idx: number) => {
    const clamped = Math.min(TOP_SNEAKERS.length - 1, Math.max(0, idx));
    // Snap shelf/grayscale back without transitions before triggering a fresh reveal.
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

  return (
    <section ref={sectionRef} className={sectionClasses} data-top-sneakers="">
      <h2 className="tsneak__title" data-graffiti="Top Sneakers">
        Top Sneakers
      </h2>

      <div className="tsneak__body">
        <ol
          className="tsneak__list"
          onMouseLeave={handleListLeave}
          onBlur={handleListBlur}
        >
          {TOP_SNEAKERS.map((item, i) => (
            <li key={item.href}>
              <a
                className={`tsneak__row${activeIndex === i ? " is-active" : ""}`}
                href={item.href}
                onMouseEnter={() => selectWithReveal(i)}
                onFocus={() => selectWithReveal(i)}
              >
                <span className="tsneak__row-name">{item.name}</span>
                <span className="tsneak__row-num">{item.roman}</span>
              </a>
            </li>
          ))}
        </ol>

        <figure ref={figureRef} className="tsneak__figure" {...swipeProps}>
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
                onClick={() => selectWithReveal(activeIndex - 1)}
              />
              <button
                type="button"
                className="home-swipe home-swipe--next"
                aria-label="Next"
                disabled={activeIndex >= TOP_SNEAKERS.length - 1}
                onClick={() => selectWithReveal(activeIndex + 1)}
              />
            </>
          )}
        </figure>
      </div>

      <a className="tsneak__cta" href="/shop/" aria-label="Forge yours — Shop">
        Forge yours
      </a>
    </section>
  );
}

export default TopSneakersSection;

"use client";

import { useState } from "react";
import { LATEST_REBORN_STORIES } from "./data";
import { useCompactSwipe } from "./useCompactSwipe";

/**
 * Interactive "Latest from Reborn" editorial story list with hover/focus
 * preview switching and compact-viewport swipe/arrow navigation.
 */
export function LatestRebornSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const active = LATEST_REBORN_STORIES[activeIndex] ?? LATEST_REBORN_STORIES[0];

  const selectStory = (idx: number) => {
    const clamped = Math.min(LATEST_REBORN_STORIES.length - 1, Math.max(0, idx));
    setActiveIndex(clamped);
  };

  const { isCompact, swipeProps } = useCompactSwipe({
    itemCount: LATEST_REBORN_STORIES.length,
    activeIndex,
    onSelect: selectStory,
  });

  return (
    <section className="lreborn alignfull" data-latest-reborn="">
      <div className="lreborn__decor" aria-hidden="true">
        <div className="lreborn__glow" />
      </div>

      <h2 className="lreborn__title" data-graffiti="Latest from Reborn">
        Latest from Reborn
      </h2>

      <div className="lreborn__body">
        <ul className="lreborn__list">
          {LATEST_REBORN_STORIES.map((story, i) => (
            <li key={story.href}>
              <a
                className={`lreborn__row${activeIndex === i ? " is-active" : ""}`}
                href={story.href}
                onMouseEnter={() => selectStory(i)}
                onFocus={() => selectStory(i)}
              >
                <span className="lreborn__row-title">{story.title}</span>
                <span className="lreborn__row-meta">{story.authorMeta}</span>
                <span className="lreborn__row-date">{story.dateText}</span>
              </a>
            </li>
          ))}
        </ul>

        <figure className="lreborn__figure" {...swipeProps}>
          <img
            className="lreborn__img"
            src={active.imgSrc}
            alt={active.title}
            decoding="async"
            draggable={false}
          />

          {isCompact && (
            <>
              <button
                type="button"
                className="home-swipe home-swipe--prev"
                aria-label="Previous"
                disabled={activeIndex <= 0}
                onClick={() => selectStory(activeIndex - 1)}
              />
              <button
                type="button"
                className="home-swipe home-swipe--next"
                aria-label="Next"
                disabled={activeIndex >= LATEST_REBORN_STORIES.length - 1}
                onClick={() => selectStory(activeIndex + 1)}
              />
            </>
          )}
        </figure>
      </div>
    </section>
  );
}

export default LatestRebornSection;

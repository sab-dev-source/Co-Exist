# LatestRebornSection Specification

## Overview
- **Target file:** `src/components/sites/www-enigmascult-com-ddb923ee/root-8a5edab2/LatestRebornSection.tsx`
- **Screenshots:** `07-desktop-reborn.png`, `07-desktop-reborn-row2.png`
- **Interaction model:** hover/focus-driven (desktop) + prev/next buttons & swipe (<=1023px)

## DOM Structure
- `<section className="lreborn alignfull" data-latest-reborn="">`
  - `<div className="lreborn__decor" aria-hidden="true"><div className="lreborn__glow" /></div>`
  - `<h2 className="lreborn__title" data-graffiti="Latest from Reborn">Latest from Reborn</h2>`
  - `<div className="lreborn__body">`
    - `<ul className="lreborn__list">` -> 4 `<a className="lreborn__row">`: `.lreborn__row-title`, `.lreborn__row-meta`, `.lreborn__row-date`
    - `<figure className="lreborn__figure"><img className="lreborn__img" src={active.imgSrc} alt={active.title} />{isCompact && <><button className="home-swipe home-swipe--prev" /><button className="home-swipe home-swipe--next" /></>}</figure>`

## Computed Styles & Behaviors
- `.lreborn__glow`: `background: radial-gradient(closest-side, rgba(173,102,70,0.28) 0, transparent 76%); width: 44vw; height: 40vw; right: -8vw; top: 20%`
- `.lreborn__title`: `margin-bottom: clamp(90px, 8.59375vw, 165px)`
- `.lreborn__row`: `grid-template-columns: minmax(0,1.6fr) minmax(0,1.5fr) minmax(0,0.9fr) minmax(0,5.5fr); border-top: 1px solid hsla(0,0%,100%,0.1); color: #828282` (`#f9f9f9` when `.is-active` or hovered)
- `.lreborn__figure`: `position: absolute; right: 0; top: 50%; translate: 0 -50%; width: 48%; aspect-ratio: 720/368; border-radius: 6px; z-index: 2`
- **Responsive (<=1023px):** `.lreborn__figure` moves above list (`order: -1; position: relative; width: 100%; margin-block-end: 24px`), `.lreborn__row` uses 3 columns (`1.8fr 1.4fr auto`), swipe arrows appear.

# TopSneakersSection Specification

## Overview
- **Target file:** `src/components/sites/www-enigmascult-com-ddb923ee/root-8a5edab2/TopSneakersSection.tsx`
- **Screenshots:** `05-desktop-top-sneakers.png`, `05-desktop-top-sneakers-item3.png`
- **Interaction model:** hover/focus-driven (desktop) + prev/next buttons & swipe (<=1023px)

## DOM Structure
- `<section className="tsneak alignfull" data-top-sneakers="">`
  - `<h2 className="tsneak__title" data-graffiti="Top Sneakers">Top Sneakers</h2>`
  - `<div className="tsneak__body">`
    - `<ol className="tsneak__list">` (5 `<li>` rows with `.tsneak__row-name` + Roman numeral `.tsneak__row-num`)
    - `<figure className="tsneak__figure">`
      - `<span className="tsneak__ruler tsneak__ruler--left" />`
      - `<span className="tsneak__ruler tsneak__ruler--right" />`
      - `<img className="tsneak__shelf" src=".../tsneak-shelf.svg" alt="" />`
      - `<img className="tsneak__img" src={active.imgSrc} alt={active.name} />`
      - `<span className="tsneak__num">{active.numeral}</span>`
      - `<button className="home-swipe home-swipe--prev" />` & `<button className="home-swipe home-swipe--next" />` (rendered/visible under `max-width: 1023px`)
  - `<a className="tsneak__cta" href="/shop/">Forge yours</a>`

## Computed Styles & Behaviors
- Hovering/focusing a row activates `.is-active`, updates image & numeral `01`–`05`, adds `.is-revealed` to `.tsneak` (with `.is-instant` reset-reflow trick so shelf drops `translate: 0 120%` and grayscale clears to `0`). Leaving `.tsneak__list` removes `.is-revealed` (re-closing shelf and restoring grayscale).
- **Responsive (<=1023px):** `.tsneak__body` collapses to 1 column with `.tsneak__figure` on row 1, `.tsneak__list` on row 2, and `.home-swipe` arrows + horizontal touch swipe (`>=36px`).

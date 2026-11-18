# TrendingAuctionsSection & BidModal Specification

## Overview
- **Target file:** `src/components/sites/www-enigmascult-com-ddb923ee/root-8a5edab2/TrendingAuctionsSection.tsx` (plus `BidModal.tsx`)
- **Screenshots:** `06-desktop-trending-auctions.png`, `06-desktop-trending-auctions-slide2.png`, `06-bid-modal.png`
- **Interaction model:** Swiper carousel + live 1s countdown + click modal + cursor label `"BID"`

## DOM Structure
- `<section className="trend alignfull">`
  - `<h2 className="trend__title" data-graffiti="Trending Auctions">Trending Auctions</h2>`
  - `<div className="trend__slider swiper" data-trend-slider="" data-count="4">`
    - `<ul className="trend__grid swiper-wrapper">` -> 4 `<li className="trend__card swiper-slide">`:
      - `<a className="trend__media" data-cursor="Bid" href={lot.href}>` (`<img>` + `<img className="trend__glow-bar" src=".../trend-glow.svg" />`)
      - `.trend__head`: `.trend__name` + `.trend__time` (`Time left` + `.js-timer` D/H/M/S segments)
      - `.trend__current`: `Current bid:` + `.trend__amount` (`70.00 €`, etc.)
      - `.trend__cta`: `<a className="trend__details">Show details</a>` + `<button className="trend__bid">Bid now</button>`
    - `<button className="trend__nav trend__nav--prev">` & `--next` with `TrendChevronPrevIcon` / `TrendChevronNextIcon`
  - `<a className="trend__viewall" href="/auctions/">Forge yours</a>`
- `<BidModal lot={selectedLot} onClose={...} />`: `.enigma-bid-modal` (`Confirm bid · Lot #... / Log in to bid` with `Cancel` and `Log in`).

## Computed Styles & Behaviors
- Swiper: `slidesPerView: 1, spaceBetween: 24`, breakpoints `768: { slidesPerView: 1.4, spaceBetween: 96 }`, `1200: { slidesPerView: 2.8, spaceBetween: 96 }`, dynamic `slidesOffsetBefore/After: Math.max(0, (innerWidth - Math.min(0.89 * innerWidth, 1710)) / 2)`, `rewind: true`, `grabCursor: true`, autoplay 4s when >=35% visible.
- Hovering `.js-timer` when Sound is ON loops `clock.mp3`. Hovering `.trend__media` sets cursor ring `.is-label` `"BID"`.

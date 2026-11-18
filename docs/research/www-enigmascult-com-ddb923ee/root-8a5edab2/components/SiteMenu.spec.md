# SiteMenu Specification

## Overview
- **Target file:** `src/components/sites/www-enigmascult-com-ddb923ee/root-8a5edab2/SiteMenu.tsx`
- **Screenshots:** `09-menu-open.png`, `09-menu-hover.png`
- **Interaction model:** click-driven toggle + WebGL shader clouds + hover icons/SFX

## DOM Structure
- `<button className="menu-toggle" type="button" aria-expanded={open} aria-controls="site-menu" aria-label="Menu">`
  - `<span className="menu-toggle__icon"><MenuBarsIcon /></span>`
  - `<span className="menu-toggle__x"><i /><i /></span>`
- `<div id="site-menu" className="site-menu" aria-hidden={!open}>`
  - `<div className="site-menu__bg site-menu__bg--3d" aria-hidden="true"><canvas className="site-menu__mesh" /></div>`
  - `<nav className="site-menu__nav" aria-label="Main"><ul>...6 items with <img className="site-menu__icon" />...</ul></nav>`
  - `<ul className="site-menu__socials">...5 social links...</ul>`

## Computed Styles (exact from theme CSS)
- `.menu-toggle`: `position: fixed; bottom: clamp(20px, 2.5vw, 48px); left: 50%; translate: -50% 0; width: 44px; height: 44px; z-index: 70; filter: drop-shadow(0 0 3px rgba(10,10,10,0.9)) drop-shadow(0 2px 10px rgba(10,10,10,0.65))`
- `.site-menu`: `position: fixed; inset: 0; z-index: 50; background-color: #1a120c; display: grid; place-items: center; padding-block-start: clamp(50px, 6.25vw, 120px); opacity: 0; visibility: hidden; transition: opacity 0.45s ease, visibility 0s linear 0.45s`
- `.site-menu__bg--3d`: `background: radial-gradient(54% 52% at 52% 44%, #dcc19b 0, #c19070 30%, #8a4a33 58%, #4a2418 82%, #2b1a12 100%)`
- `.site-menu__nav ul`: `row-gap: clamp(10px, 0.9375vw, 18px)`
- `.site-menu__nav a`: `font-family: var(--wp--preset--font-family--heading); font-size: clamp(34px, 4.1666666667vw, 80px); font-style: italic; font-weight: 200; letter-spacing: -0.04em; line-height: 1.08; text-transform: uppercase`
- `.site-menu__icon` positions per nth-child(1..6) plus `li:nth-child(5):after` mirrored `scaleX(-1)` hand icon.
- `.site-menu__socials`: `position: absolute; bottom: clamp(20px, 3.125vw, 60px); right: var(--gutter); font-size: clamp(10px, 0.625vw, 12px); gap: clamp(14px, 1.5625vw, 30px)`

## States & Behaviors
- Clicking `.menu-toggle` toggles `html.menu-open`, pauses/resumes `window.__lenis`, traps Tab focus inside menu, closes on `Escape`.
- Three.js shader renders `menu-clouds.glb` + `menu-clouds-atlas.webp` (`aCard` attribute from `color` buffer, layered orbit shear, wind drift, and cursor gust parting).
- Hovering nav items shows floating icon + triggers `chest.mp3` (Mystery Boxes), `steps.mp3` (Sneakers), or `gavel.mp3` (Auctions) after `320ms` when Sound is ON; pointer near left/right edges plays `wind.mp3`.

## Assets & Verbatim Text
- Icons: `icon-chest.png`, `icon-shoes.png`, `icon-gavel.png`, `icon-eye.png`, `icon-hand.png`, `icon-butterfly.png`.
- Links: `Mystery Boxes`, `Sneakers`, `Auctions`, `Find It For Me`, `Reborn`, `Blog`. Socials: `Instagram`, `TikTok`, `Discord`, `WhatsApp`, `Contact`.
- **Mobile (<=782px):** `html.menu-open .menu-toggle { bottom: 96px }`.

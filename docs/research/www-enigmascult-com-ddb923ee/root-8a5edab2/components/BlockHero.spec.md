# BlockHero Specification

## Overview
- **Target file:** `src/components/sites/www-enigmascult-com-ddb923ee/root-8a5edab2/BlockHero.tsx`
- **Screenshots:** `01-desktop-hero.png`, `12-mobile-hero.png`
- **Interaction model:** WebGL shader clouds (time + mouse + scroll + click) + hover graffiti title

## DOM Structure
- `<section className="block-hero alignfull">`
  - `<div className="block-hero__decor" aria-hidden="true">`
    - `<div className="block-hero__grad" />`
    - `<img className="block-hero__lines" src=".../contact-lines.svg" alt="" />`
    - `<img className="block-hero__arc" src=".../hero-arc.svg" alt="" />`
    - `<img className="block-hero__art" src=".../hero-clouds.webp" alt="" />` (opacity 0 once WebGL ready)
    - `<canvas className="block-hero__art3d" aria-hidden="true" />`
  - `<h1 className="block-hero__title" data-title={"Decode\nYour Style"}>{"Decode\nYour Style"}</h1>`
  - `<p className="block-hero__tagline">Created from stunners, for stunners.</p>`
  - `<a className="block-hero__cta" href="/mystery-boxes/" aria-label="Forge Yours — Mystery Boxes">Forge Yours</a>`

## Computed Styles (exact from theme CSS)
- `.block-hero`: `background-color: #000; color: #f9f9f9; min-height: 100svh; display: grid; align-content: start; justify-items: center; text-align: center; overflow: clip; padding-block: clamp(165px, 19.21875vw, 369px) max(clamp(60px, 8.5416666667vw, 164px), 140px)`
- `.block-hero__grad`: `background: linear-gradient(180deg, #000 31.76%, #61392c 75.46%, #ad6646); opacity: 0.72`
- `.block-hero__lines`: `width: 100vw; height: 220.35vw; opacity: 0.5; top: 0; left: 0`
- `.block-hero__art`: `left: calc(50% - 1.72vw); top: 0; translate: -50% 0; width: 74.06vw; mix-blend-mode: lighten; opacity: 0.61`
- `.block-hero__title`: `font-family: var(--wp--preset--font-family--heading); font-size: clamp(44px, 5.2083333333vw, 100px); font-style: italic; font-weight: 200; letter-spacing: -0.04em; line-height: 1.08; text-transform: uppercase`
- `.block-hero__title:after`: Mostwanted font `clamp(59px, 7.03125vw, 135px); line-height: 0.92`; shown on hover while H1 color turns `transparent`.
- `.block-hero__tagline`: `font-size: clamp(14px, 0.9375vw, 18px); margin: clamp(20px, 2.2916666667vw, 44px) 0 0`
- `.block-hero__cta`: `width: min(100%, clamp(220px, 15.6770833333vw, 301px)); height: clamp(38px, 2.5vw, 48px); border: 1px solid #f9f9f9; border-radius: 50%; margin-block-start: clamp(22px, 2.5vw, 48px)`

## States & Behaviors
- Three.js loads `/sites/www-enigmascult-com-ddb923ee/shared/models/hero-clouds.glb` + `hero-clouds.webp` with custom vertex/fragment GLSL shader (`uTime`, `uMouse`, `uMouseAmt`, `uScroll`, `uClick`, `uMotion`), rotating `z = 0.045 * uTime` with `data-3d-contain` scale fit and `data-3d-margin="1.15"`. Dispatches `enigma:hero-ready` on first frame.
- Clicking empty hero space triggers swirl burst (`uClick = 1`) and `wind` loop for 4.5s when Sound is ON.
- **Mobile (<=781px):** `align-content: center; padding-block: 160px 90px`; cloud art `top: calc(50% + 35px - 56.07vw); width: 150vw`.

# HomePreloader Specification

## Overview
- **Target file:** `src/components/sites/www-enigmascult-com-ddb923ee/root-8a5edab2/HomePreloader.tsx`
- **Screenshot:** `docs/design-references/www-enigmascult-com-ddb923ee/root-8a5edab2/00-preloader.png`
- **Interaction model:** time-driven + custom event (`enigma:hero-ready`)

## DOM Structure
- `<div className="home-preloader" aria-hidden="true">`
  - `<div className="home-preloader__meta">`
    - `<span className="home-preloader__count" data-preloader-count="">{count}</span>`
- Controls `document.documentElement.classList`: starts with `home-loading`; removes `home-loading` and adds `is-lifting` on `.home-preloader` before unmounting after `1000ms`.

## Computed Styles (exact from theme CSS)
- `.home-preloader`: `position: fixed; inset: 0; z-index: 9950; background: radial-gradient(115% 85% at 50% 46%, transparent 34%, hsla(0, 0%, 4%, 0.82) 72%, #0a0a0a 100%)`
- `.home-preloader.is-lifting`: `animation: preloader-lift 0.9s ease both; pointer-events: none`
- `.home-preloader__meta`: `position: absolute; inset: 0; display: grid; align-content: start; justify-items: center; padding-block-start: calc(clamp(165px, 19.21875vw, 369px) + clamp(95px, 11.25vw, 216px) + clamp(20px, 2.2916666667vw, 44px))` (plus `+ 128px` under `max-width: 782px`)
- `.home-preloader__count`: `font-family: var(--wp--preset--font-family--heading); font-size: clamp(15px, 1.25vw, 24px); font-style: italic; font-weight: 200; line-height: 1; color: hsla(0,0%,98%,0.85); margin-block-start: clamp(20px, 2.2916666667vw, 44px); text-shadow: 0 1px 18px rgba(0,0,0,0.8)`
- `.home-preloader__count::after`: `content: "%"; font-size: 0.55em; margin-left: 0.08em; opacity: 0.5; vertical-align: super`

## States & Behaviors
- **While loading:** Sets `h1.block-hero__title` text/data-title word `Decode` -> `Decoding` while counter interpolates cubic ease-out `0 -> 92%` over `2600ms`.
- **On `enigma:hero-ready` (or min 1700ms / max 7000ms fallback, or immediate if scrolled >50vh):** Jumps to `100%`, scrambles `"Decoding"` back to `"Decode"` over `0.9s` (`uppercase` random chars), removes `home-loading` on `<html>`, triggers `.is-lifting`, unmounts after `1000ms`.

## Assets & Text
- Verbatim display: `"0"`–`"100"` with superscript `%`; swaps hero title `"Decoding"` -> `"Decode"`.

## Responsive Behavior
- **Desktop (1440px):** `home-preloader__meta` aligns right under hero H1.
- **Mobile (390px, <=782px):** `padding-block-start` adds `+ 128px`.

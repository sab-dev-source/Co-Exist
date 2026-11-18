# CursorRing Specification

## Overview
- **Target file:** `src/components/sites/www-enigmascult-com-ddb923ee/root-8a5edab2/CursorRing.tsx`
- **Screenshot:** `docs/design-references/www-enigmascult-com-ddb923ee/root-8a5edab2/01-desktop-hero.png`
- **Interaction model:** pointer-driven (`pointer: fine` only)

## DOM Structure
- `<div className="cursor-ring" aria-hidden="true"><span className="cursor-ring__label" /></div>`
- Adds `has-cursor` class on `<html>` when `(pointer: fine)` and not `prefers-reduced-motion: reduce`.

## Computed Styles (exact from theme CSS)
- Default: `width: 34px; height: 34px; left: -17px; top: -17px; border: 1px solid hsla(0,0%,98%,0.75); border-radius: 50%; position: fixed; z-index: 100005; pointer-events: none; opacity: 0`
- `.is-on`: `opacity: 1`
- `.is-down`: `scale: 0.8`
- `.is-hover`: `width: 52px; height: 52px; left: -26px; top: -26px; border-color: hsla(0,0%,98%,0.35)`
- `.is-label`: `width: 76px; height: 76px; left: -38px; top: -38px; backdrop-filter: blur(2px); background-color: hsla(0,0%,4%,0.55); border-color: hsla(0,0%,98%,0.9)`
- `.cursor-ring__label`: `font-family: var(--wp--preset--font-family--heading); font-size: 13px; font-style: italic; letter-spacing: 0.14em; text-transform: uppercase`
- `.is-blessed`: `border-color: hsla(0,0%,100%,0.95); box-shadow: 0 0 12px rgba(212, 168, 88, 0.55)`

## States & Behaviors
- Lerps `translate: ${ox}px ${oy}px` at `0.22` per rAF frame.
- `pointerover` checks `[data-cursor]` (`is-label`, displays `"BID"`), or `a, button, [role="button"], input, select, textarea, label, summary, .swiper` (`is-hover`).
- Magnetic pull on `.block-hero__cta, .wpforms-submit`: shifts up to `±6px` X, `±4px` Y (`0.12 * delta`).
- Reads `localStorage['enigma-blessed'] === '1'` and listens to `enigma:blessed` event.
- Touch devices (`pointer: coarse`): unmounted / inactive.

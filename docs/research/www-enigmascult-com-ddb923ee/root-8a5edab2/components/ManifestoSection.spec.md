# ManifestoSection Specification

## Overview
- **Target file:** `src/components/sites/www-enigmascult-com-ddb923ee/root-8a5edab2/ManifestoSection.tsx`
- **Screenshots:** `02-desktop-manifesto-1.png`, `02-desktop-manifesto-2.png`, `02-desktop-manifesto-3.png`, `12-mobile-manifesto-1.png`, `12-mobile-manifesto-2.png`
- **Interaction model:** scroll-driven GSAP ScrollTrigger horizontal pin (`scrub: 1`)

## DOM Structure
- `<section className="manifesto alignfull">`
  - `<div className="manifesto__track">`
    - **Panel A (`.manifesto__panel.manifesto__panel--a`):** `.manifesto__arc` (`hero-arc.svg`), `manifesto-left.webp`, `manifesto-topright.webp`, `manifesto-portrait.webp`, `manifesto-angel.webp`, intro `<p>`, `<h2>Mini Manifesto</h2>`, side `<p>`, `<a href="/mission/">Meet the Cult</a>`
    - **Panel B (`.manifesto__panel.manifesto__panel--b`):** `manifesto-art3.webp`, `manifesto-art5.png`, `manifesto-pill.webp`, `.manifesto__text--b1`, `<h2>Honor the Grind</h2>`, `<a href="/mystery-boxes">Join the Circle</a>`, `.manifesto__text--b2`, `.manifesto__text--b3`
    - **Panel C (`.manifesto__panel.manifesto__panel--c`):** `.manifesto__arc` (`hero-arc.svg`), `manifesto-yellow.png`, `manifesto-greendunk.webp`, `manifesto-bacchus.png`, `.manifesto__text--c-intro`, `<h2>Rarity Is Philosophy</h2>`, `<a href="/shop">See the Drops</a>`

## Computed Styles (exact from theme CSS)
- `.manifesto`: `--pw: min(100vw, 100dvh * 1.681261); --mx0: max(0px, (100vw - var(--pw)) / 2); background: #000; color: #f9f9f9; overflow: clip`
- `.manifesto__panel`: `width: max(100vw, var(--pw)); height: calc(var(--pw) * 0.59479)` with `:before` 1px horizontal line at `top: 47.29%`, color `hsla(0,0%,98%,0.16)`
- `.manifesto__title`: `font-family: heading; font-size: max(40px, 0.0520833333 * var(--pw)); font-style: italic; font-weight: 200; letter-spacing: -0.032em; line-height: 0.92; top: 28.6%; left: calc(var(--mx0) + var(--pw) * 0.5); translate: -50% 0`
- `.manifesto__cta`: `top: 45.2%; width: max(210px, 0.1567708333 * var(--pw)); height: max(38px, 0.025 * var(--pw)); border-radius: 50%; border: 1px solid #f9f9f9`
- All 10 image coordinates/aspect-ratios/filters/rotations and 6 text block widths/offsets match `.manifesto__img--*` and `.manifesto__text--*` in `globals.css`.

## States & Behaviors
- `gsap.to(track, { x: () => -(track.scrollWidth - window.innerWidth), ease: "none", scrollTrigger: { trigger: section, start: "top top", end: () => "+=" + (track.scrollWidth - window.innerWidth), pin: true, scrub: 1, invalidateOnRefresh: true } })`.
- **Mobile (<=781px):** `--pw: calc(100svh * 1.68126 * 0.65)`, `min-height: 100svh`, `.manifesto__text--intro/b1/c-intro` shift to `top: 0`, `width: calc(var(--pw) * 0.36)`.

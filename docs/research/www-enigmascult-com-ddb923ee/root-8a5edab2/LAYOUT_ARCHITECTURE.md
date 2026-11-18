# Layout Architecture — `https://www.enigmascult.com/`

- **Root Canvas:** Full-bleed vertical stack (`overflow-x: clip` on `html`, `#0a0a0a` body background) inside `.wp-site-blocks`.
- **Full-Bleed Alignment:** Every section uses `.alignfull` (`width: 100vw; max-width: none; margin-inline: calc(50% - 50vw)`).
- **Fluid Sizing Paradigm:** Nearly every dimension, font size, and spacing value uses linear viewport interpolation `clamp(minPx, calcAt1920vw, maxPx)` authored against a `1920px` reference frame so desktop proportions scale continuously down to `781px` tablet/mobile breakpoints.
- **Pinning Architecture (GSAP ScrollTrigger + Lenis):**
  - `.manifesto` sits inside a GSAP `.pin-spacer` (`start: "top top"`, `end: "+=" + (track.scrollWidth - innerWidth)`, `pin: true, scrub: 1`).
  - `.mystery-box` (`height: 100svh`) sits inside a GSAP `.pin-spacer` (`start: "top top"`, `end: "+=150%"`, `pin: true, scrub: 1`).
- **Grid Systems:**
  - `.site-header__nav ul`: CSS Grid `1fr auto 1fr`
  - `.tsneak__body`: Desktop CSS Grid `minmax(0,1fr) minmax(0,2.4fr)` -> `<=1023px` single column (`figure` row 1, `list` row 2)
  - `.lreborn__row`: Desktop 4-track Grid `minmax(0,1.6fr) minmax(0,1.5fr) minmax(0,.9fr) minmax(0,5.5fr)` (4th empty track leaves space for the floating `width: 48%` right figure!) -> `<=1023px` 3-track Grid `minmax(0,1.8fr) minmax(0,1.4fr) auto` with figure stacked above via `order: -1`.
  - `.site-footer__bottom`: Desktop 3-column Grid `1fr auto 1fr` with `1/-1` spanning rows below -> `<=781px` single column centered.

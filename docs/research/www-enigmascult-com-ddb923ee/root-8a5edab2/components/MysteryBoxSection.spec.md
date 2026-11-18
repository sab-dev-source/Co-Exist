# MysteryBoxSection Specification

## Overview
- **Target file:** `src/components/sites/www-enigmascult-com-ddb923ee/root-8a5edab2/MysteryBoxSection.tsx`
- **Screenshots:** `03-desktop-mysterybox-1.png`, `03-desktop-mysterybox-2.png`, `03-desktop-mysterybox-80.png`, `03-desktop-mysterybox-100.png`, `12-mobile-mysterybox.png`
- **Interaction model:** scroll-driven GSAP ScrollTrigger two-stage pin (`end: "+=150%", scrub: 1`)

## DOM Structure
- `<section className="mystery-box alignfull">`
  - `<img className="mystery-box__chest" src=".../mystery-chest.webp" alt="" />`
  - `<a className="mystery-box__cta" href="/mystery-boxes/">Join the inner circle</a>`
  - `<div className="mystery-box__cover mystery-box__cover--top">`
    - `<img className="mystery-box__curtain mystery-box__curtain--top" src=".../mystery-curtain-top.svg" alt="" />`
    - `<img className="mystery-box__texture" src=".../mystery-texture.jpg" alt="" />`
    - `<h2 className="mystery-box__title" data-graffiti="Mystery Box">Mystery B<span className="mystery-box__o">o<img className="mystery-box__hand" src=".../mystery-hand.webp" alt="" /></span>x</h2>`
  - `<div className="mystery-box__cover mystery-box__cover--bottom">`
    - `<img className="mystery-box__curtain mystery-box__curtain--bottom" src=".../mystery-curtain-bottom.svg" alt="" />`
    - `<img className="mystery-box__texture" src=".../mystery-texture.jpg" alt="" />`
    - `<div className="mystery-box__copy"><p>...</p><p>...</p></div>`
  - `<button className="mystery-box__zip" type="button" tabIndex={-1} aria-expanded="false" aria-label="Unzip the mystery box">`
    - `<img className="mystery-box__zip-chain" src=".../mystery-zip.svg" alt="" />`
    - `<img className="mystery-box__zip-slider" src=".../mystery-zip.svg" alt="" />`

## Computed Styles & Scroll Timeline
- Section: `height: 100svh; background: #050505; overflow: clip`
- GSAP timeline:
  - `0.0 -> 0.4`: `zipChain` `clipPath: "inset(0% 0% 0% 0%)"` -> `"inset(0% 101% 0% 0%)"`, `zipSlider` `xPercent: -101`, `ease: "none"`.
  - `0.4 -> 0.8`: `coverTop` `yPercent: -89` (`power1.in`), `coverBottom` `yPercent: 89` (`power1.in`), `zipBtn` `autoAlpha: 0` (`duration: 0.06` at `0.4`).
  - `0.8 -> 1.0`: hold `0.2` duration.
- When crossing `progress > 0.4 && progress < 0.75` scrolling down (1.5s cooldown), fires `whoosh` SFX when Sound is ON.
- Hovering `MYSTERY BOX` fades `.mystery-box__hand` (`opacity: 0`) and swaps heading to `Mostwanted` font.
- **Mobile (<=781px):** `.mystery-box__title` at `bottom: 20%; top: auto`, `.mystery-box__copy` at `top: 15%; width: 78vw`.

# FindPriceSection Specification

## Overview
- **Target file:** `src/components/sites/www-enigmascult-com-ddb923ee/root-8a5edab2/FindPriceSection.tsx`
- **Screenshots:** `04-desktop-find-price.png`, `12-mobile-find-price.png`
- **Interaction model:** time-driven typewriter (IntersectionObserver gated) + click link

## DOM Structure
- `<section className="find-price alignfull">`
  - `<div className="find-price__decor" aria-hidden="true"><img className="find-price__angel" src=".../find-price-cupid.webp" alt="" /></div>`
  - `<h2 className="find-price__title">{"Find it at\nmy price"}</h2>`
  - `<a className="find-price__bar" href="/find-it-at-my-price/">`
    - `<span className="find-price__query">{typedText}</span>`
    - `<span className="find-price__caret" aria-hidden="true" />`
    - `<img className="find-price__arrow" src=".../find-arrow.svg" alt="" aria-hidden="true" />`
  - `</a>`
  - `<p className="find-price__tagline">{"You set the price.\nWe hunt the item.\nNo raffles. No Ls. Just results."}</p>`

## Computed Styles & Behaviors
- `.find-price`: `background: linear-gradient(90deg, #ad6646, #61392c 24.54%, #000 68.24%); min-height: 51.5vw; padding-block: clamp(100px, 13.1770833333vw, 253px) clamp(60px, 6.25vw, 120px); text-align: center`
- `.find-price__angel`: `left: 23.5vw; top: 15vw; width: 13vw`
- `.find-price__bar`: `width: min(550px, 84vw); margin: clamp(40px, 5vw, 96px) auto 0; border-bottom: 1px solid hsla(0,0%,98%,0.7); padding-block-end: 12px`
- Typewriter cycles `["Jordan 5 Retro", "SB Dunk Low", "AF1 Mother of Pearl", "Yeezy 700 Wave"]`: starts on `"Jordan 5 Retro"`, pauses `2600ms`, deletes at `32ms/char`, pauses `350ms`, types at `65ms/char`, holds `2200ms`. Hovering shifts arrow `translate: 6px 0`.

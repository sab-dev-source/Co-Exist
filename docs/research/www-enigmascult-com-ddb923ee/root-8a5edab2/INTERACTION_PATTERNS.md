# Interaction Patterns — `https://www.enigmascult-com-ddb923ee\root-8a5edab2`

- **Graffiti Font Hover Swap (`[data-graffiti]` & `.block-hero__title[data-title]`):**
  On hover, base italic Editorial Today text sets `color: transparent` while `::after` reveals `content: attr(data-graffiti)` in `"Mostwanted"` at `opacity: 1` (instant swap, no transition on text fill).
- **Elliptical Pill CTA Buttons (`.block-hero__cta`, `.manifesto__cta`, `.mystery-box__cta`, `.tsneak__cta`, `.trend__viewall`, `button.wpforms-submit`):**
  `border-radius: 50%` (true oval outline), `scale: 0.96` on hover, `scale: 0.94` on active, `0.25s ease` transition; hero & form submit buttons also gain subtle magnetic pointer pull (`translate` clamped to `±6px × ±4px`).
- **Two-Stage Scroll Unzip (`.mystery-box`):**
  Stage `0.0–0.4` drives horizontal `clipPath: inset(0% X% 0% 0%)` on the zipper chain and `xPercent: -101` on the zipper slider; stage `0.4–0.8` fades `.mystery-box__zip` and splits top/bottom covers by `±89%` (`power1.in`), holding `0.8–1.0` so the full chest & CTA remain readable.
- **Shelf Reveal Hover (`.tsneak`):**
  Resting state keeps product grayscale (`filter: grayscale(1)`) behind `.tsneak__shelf` SVG; entering any row adds `.is-instant` briefly, clears `.is-revealed`, swaps `src` + `01–05`, forces reflow, then adds `.is-revealed` so the shelf drops `translate(0, 120%)` (`0.65s cubic-bezier(0.65,0,0.3,1)`) and color fades in (`0.6s ease`). Leaving the list removes `.is-revealed`.
- **Keyboard Sequence Listener (`ec()` / `.ritual`):**
  Rolling `keydown` buffer with `2000ms` inter-key timeout matching `"enigma"`, ignoring form inputs/modifiers. Completion persists `localStorage['enigma-blessed']`, blesses `.cursor-ring`, plays `wind` SFX, and animates `.ritual.is-open` lines with staggered delays (`0.5s`, `1.3s`, `2.1s`).

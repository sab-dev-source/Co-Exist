# Behaviors & Interactive Sweep — `https://www.enigmascult.com/`

## 1. Global Scroll, Smooth Scroll & Cursor Behaviors
- **Smooth Scroll (Lenis):** `<html>` receives `lenis`, `lenis-scrolling`, `lenis-smooth`. GSAP `ScrollTrigger` syncs on `lenis.on('scroll', ScrollTrigger.update)` and `gsap.ticker.add((t) => lenis.raf(1000 * t))` with `gsap.ticker.lagSmoothing(0)`. When the fullscreen menu opens (`html.menu-open`), `lenis.stop()` freezes background scroll; closing restarts it (`lenis.start()`).
- **Custom Cursor Ring (`.cursor-ring`):** Active on `(pointer: fine)` when `prefers-reduced-motion` is not `reduce`. Adds `has-cursor` to `<html>` (`cursor: none !important`).
  - Smooth lerp tracking (`0.22` factor per frame): default `34px × 34px`, `1px solid hsla(0,0%,98%,0.75)`.
  - `.is-down`: `scale: 0.8`.
  - `.is-hover`: over links, buttons, inputs, `.swiper` -> grows to `52px × 52px`, `border-color: hsla(0,0%,98%,0.35)`.
  - `.is-label`: over `[data-cursor="Bid"]` (`.trend__media`) -> grows to `76px × 76px`, frosted dark disc `hsla(0,0%,4%,0.55)` with `backdrop-filter: blur(2px)`, showing uppercase italic `"BID"`.
  - `.is-blessed`: persisted via `localStorage['enigma-blessed'] = '1'` after completing the `enigma` keyboard ritual; brighter white/gilded ring state.
  - Magnetic pull on `.block-hero__cta`: shifts up to `±6px` X, `±4px` Y toward pointer while hovered.

## 2. Preloader (`.home-preloader`)
- On initial load at top of page (`scrollY <= 0.5 * innerHeight`), `html.home-loading` blurs `.block-hero__decor` (`blur(18px) saturate(0.78) scale(1.08)`), hides `.site-header__nav`, `.menu-toggle`, `.sound-toggle`, and `.site-header__logo img`.
- Hero `<h1>` temporarily displays `"Decoding Your Style"` while counter animates smoothly from `0%` to `92%` over 2.6s (cubic ease-out), then `100%` once `enigma:hero-ready` fires (min 1.7s, max 7s fallback).
- On lift (`is-lifting` animation `0.9s ease`): `Decoding` scrambles via GSAP ScrambleText back to `Decode`, hero decor unblurs over `1.5s`, tagline rises (`delay 0.85s`), CTA rises (`delay 1.05s`).

## 3. Fixed Chrome & Overlays
- **`.site-header`:** `position: absolute` at top (`z-index: 10`; switches to `position: fixed; z-index: 60` when `html.menu-open`).
  - **`.site-header__logo`:** Interactive 3D WebGL model (`enigma-logo.glb` via `MeshoptDecoder`, `PerspectiveCamera(18)`, `MeshStandardMaterial` `#f9f9f9` roughness `0.35`, metalness `0.15`), auto-rotates at `0.35 rad/s` on Y axis and supports drag-to-spin with momentum decay (`0.94`).
  - **`.site-header__nav`:** 3-column grid: `My Account` (uppercase italic), `Cart`, `Wishlist`. Underline on hover.
- **`.menu-toggle`:** Fixed bottom-center (`bottom: clamp(20px, 2.5vw, 48px)`, `z-index: 70`), `44px × 44px`. Clicking toggles `html.menu-open`, morphing the 3 horizontal calligraphic bars SVG into a rotating `×`, locking scroll, and revealing `#site-menu`.
- **`.site-menu`:** Fixed fullscreen (`z-index: 50`) with radial warm brown backdrop + Three.js GLSL shader clouds (`menu-clouds.glb` + `menu-clouds-atlas.webp`) featuring layered card drift, wind oscillation, and cursor gust/parting physics.
  - 6 nav items: `Mystery Boxes`, `Sneakers`, `Auctions`, `Find It For Me`, `Reborn`, `Blog`. Hovering any link pops in its positioned 3D icon PNG (`icon-chest.png`, `icon-shoes.png`, `icon-gavel.png`, `icon-eye.png`, `icon-hand.png` mirrored on left/right, `icon-butterfly.png`) and triggers hover SFX after 320ms (`chest.mp3`, `steps.mp3`, `gavel.mp3`) when Sound is ON.
- **`.sound-toggle` & `.sound-hint`:** Fixed bottom-left (`z-index: 70`). Clicking toggles `aria-pressed="true"` / `.is-on`, persists `localStorage['enigma-sound']`, unlocks Web Audio API `AudioContext` (`GainNode` 0.55), shows `"Listen close — sounds hide all over. Find them."` for 6s, and activates spatial/hover SFX (`wind.mp3`, `whoosh.mp3`, `clock.mp3`, `chest.mp3`, `steps.mp3`, `gavel.mp3`, `shimmer.mp3`, `descent.mp3`).
- **`.clue-keeper` & `.clue-hint`:** Fixed bottom-right (`z-index: 60`), Three.js golden `?` (`clue-mark.glb` lit with `RoomEnvironment` PMREM + gold directional light `0xffdf90`, bobbing & spinning on hover / `.is-near`).
  - Clicking opens `.clue-hint` (`"Speak to the website with your keyboard. Six letters, you already know the name."`). On touch devices, also renders `.clue-hint__field` input.
- **Keyboard Easter Egg (`.ritual`):** Typing `enigma` anywhere outside form inputs opens `.ritual.is-open` (`You looked closer. / The cult marks you. / Wear the gilded ring.`), marks `localStorage['enigma-blessed'] = '1'`, and adds `.is-blessed` to `.cursor-ring`.
- **Cookie Consent (`ruler-fortune-cookies`):** Bottom floating dark card (`We use cookies`) with `Accept all`, `Customize`, `Reject all`, `×`. Clicking `Customize` or footer `Cookie Settings` opens `.rfc-modal` white preferences dialog (`Functional [Required]`, `Analytics`, `Marketing`).

## 4. Section-by-Section Interaction Models
1. **Hero (`.block-hero`):** Interactive WebGL shader cloud ring (`hero-clouds.glb` + `hero-clouds.webp`) with `z` rotation, mouse lean/recede, scroll swirl, and click twist burst. Hovering `"DECODE YOUR STYLE"` swaps to `"Mostwanted"` graffiti font via `::after`. `"FORGE YOURS"` oval pill has magnetic cursor offset and inverted hover (`#f9f9f9` bg / `#0a0a0a` text or `scale: 0.96`).
2. **Manifesto (`.manifesto`):** **Scroll-driven GSAP ScrollTrigger horizontal pin.** Pins for `t.scrollWidth - window.innerWidth` px (`start: "top top"`, `scrub: 1`), translating `.manifesto__track` horizontally across 3 full-bleed panels (`Mini Manifesto` -> `Honor the Grind` -> `Rarity Is Philosophy`).
3. **Mystery Box (`.mystery-box`):** **Scroll-driven GSAP ScrollTrigger pin (`end: "+=150%"`, `scrub: 1`).**
   - Progress `0 -> 0.4`: `.mystery-box__zip-chain` clips from `inset(0%)` to `inset(0% 101% 0% 0%)` while `.mystery-box__zip-slider` translates `-101%` horizontally (unzipping leftwards).
   - Progress `0.4 -> 0.8`: `.mystery-box__zip` fades (`autoAlpha: 0`), top cover translates `yPercent: -89`, bottom cover translates `yPercent: 89` (`ease: power1.in`), revealing the *Creation of Adam* chest artwork and centered `"JOIN THE INNER CIRCLE"` pill button. Dispatches `whoosh` SFX when crossing `0.4` forward. Hovering `MYSTERY BOX` swaps to Mostwanted graffiti font & hides Michelangelo's hand overlay.
4. **Find It At My Price (`.find-price`):** **Time-driven typewriter + click navigation.** Not a text input — `<a class="find-price__bar" href="/find-it-at-my-price/">` cycles character-by-character through `["Jordan 5 Retro", "SB Dunk Low", "AF1 Mother of Pearl", "Yeezy 700 Wave"]` (`65ms` type, `2200ms` pause, `32ms` delete, `350ms` pause) only while intersecting viewport. Blinking `1px` caret; arrow translates `6px` right on hover.
5. **Top Sneakers (`.tsneak`):** **Hover/Focus-driven (desktop) & Button/Swipe-driven (<=1023px).** Hovering or focusing any of the 5 rows updates `.is-active`, swaps `.tsneak__img` `src` and `.tsneak__num` (`01`–`05`), and adds `.is-revealed` to `.tsneak` (sliding `.tsneak__shelf` downward `translate: 0 120%` and removing `grayscale(1)` from product image). On `<=1023px`, `.home-swipe--prev/next` buttons and horizontal touch swipe appear. Title has Mostwanted graffiti hover swap.
6. **Trending Auctions (`.trend`):** **Swiper horizontal carousel + live countdowns + modal trigger.**
   - Desktop (`>=1200px`): `slidesPerView: 2.8, spaceBetween: 96`, tablet (`>=768px`): `1.4, spaceBetween: 96`, mobile: `1, spaceBetween: 24`. Dynamic `slidesOffsetBefore/After` matching `min(89vw, 1710px)` container left alignment. Autoplay `4000ms` when `>=35%` visible.
   - Live D/H/M/S countdown (`endsAt`), `"Show details"` + `"Bid now"` buttons. Hovering `.trend__media` engages custom cursor label `"BID"`.
   - Clicking `"Bid now"` opens `.enigma-bid-modal` (`Confirm bid · Lot #... / Log in to bid` with `Cancel` and `Log in`).
7. **Latest from Reborn (`.lreborn`):** **Hover/Focus-driven (desktop) & Button/Swipe-driven (<=1023px).** Hovering any of the 4 story rows activates it and swaps `.lreborn__img` inside the right-hand `16:9`/`720:368` rounded figure.
8. **Footer (`.site-footer`):** **WebGL dual-layer parallax clouds + WPForms newsletter validation.**
   - `IntersectionObserver` reveals dual orthographically projected cloud shaders (`footer-clouds-back.webp` + `footer-clouds-front.webp`) that rise on reveal and parallax-lean on pointer move.
   - Submitting empty email triggers `"This field is required."`; invalid email triggers `"Please enter a valid email address."` (`#fb5711` border & alert); valid email shows inline confirmation box.
   - Clicking `Cookie Settings` opens `.rfc-modal`.

## 5. Responsive Breakpoints Observed
- **Desktop (`1440px` / `>=1200px`):** `.tsneak__body` 2-column (`1fr 2.4fr`), `.lreborn__figure` floating absolute right (`width: 48%`), `.trend__slider` shows `2.8` slides, `.site-footer__bottom` 3-column (`1fr auto 1fr`), `.site-footer__links` 2-column wrapped flex.
- **Tablet (`1023px` & `781px`):**
  - `<=1023px`: `.tsneak` and `.lreborn` stack vertically (`figure` moves above list, `.home-swipe` `<` `>` arrows appear).
  - `<=781px`: `.block-hero` centers vertically (`padding-block: 160px 90px`), `.block-hero__art` widens to `150vw`; `.manifesto` sets `--pw: calc(100svh * 1.68126 * 0.65)` and adjusts text positions (`top: 0`); `.mystery-box__title` moves to `bottom: 20%` and `.mystery-box__copy` widens to `78vw`; `.site-footer__bottom` collapses to 1 column centered.
- **Mobile (`390px`):** Same stacked layout as `<=781px` with `clamp()` min bounds active (`44px` hero title, `34px` menu links, `22px` footer heading, `18px` find-price query).

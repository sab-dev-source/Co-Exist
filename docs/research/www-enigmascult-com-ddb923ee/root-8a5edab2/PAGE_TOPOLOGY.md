# Page Topology — `https://www.enigmascult.com/`

## 1. Document & Overlay Layer Stack (Z-Index Map)
1. **Custom Cursor Ring (`.cursor-ring`):** Fixed, `z-index: 100005`, `pointer-events: none` (above everything except browser UI).
2. **Cookie Consent & Preferences (`.rfc-consent`, `.rfc-modal`):** Fixed (`z-index: 99999` / `100000` with backdrop `99998`).
3. **Ritual Easter Egg Overlay (`.ritual`):** Fixed fullscreen (`z-index: 10000`), shown when typing `enigma`.
4. **Page Transition Veil (`.page-veil` & `body::before`):** Fixed fullscreen (`z-index: 9999`), warm amber/cloud descent transition on internal link clicks.
5. **Preloader (`.home-preloader`):** Fixed fullscreen (`z-index: 9950`), shown on initial load (`html.home-loading`), fades out via `.is-lifting`.
6. **Bid Modal (`.enigma-bid-modal`):** Fixed fullscreen (`z-index: 200`), opened by `.trend__bid`.
7. **Clue Hint Popover (`.clue-hint`):** Fixed bottom-right (`z-index: 75`), anchored above `.clue-keeper`.
8. **Menu Toggle (`.menu-toggle`) & Sound Toggle + Hint (`.sound-toggle`, `.sound-hint`):** Fixed bottom-center & bottom-left (`z-index: 70`).
9. **Clue Keeper (`.clue-keeper`):** Fixed bottom-right (`z-index: 60`), spinning 3D golden `?` canvas.
10. **Site Header (`.site-header`):** `position: absolute` (`z-index: 10`) over Hero; promotes to `position: fixed; z-index: 60` when `html.menu-open`.
11. **Fullscreen Menu Overlay (`#site-menu.site-menu`):** Fixed fullscreen (`z-index: 50`), Three.js cloud canvas + centered nav links + bottom-right socials.

## 2. Main Flow Sections (Top to Bottom inside `<main>`)
1. **`BlockHero` (`.block-hero.alignfull`)** — `min-height: 100svh`, black bg + warm terracotta vertical gradient, sacred geometry SVG lines/arc, interactive Three.js hero clouds ring, `<h1>Decode Your Style</h1>`, tagline, `"Forge Yours"` oval pill CTA. Interaction model: **time/pointer/scroll WebGL + hover graffiti swap**.
2. **`ManifestoSection` (`.manifesto.alignfull`)** — GSAP ScrollTrigger pinned horizontal scroll gallery across 3 panels:
   - Panel A: `"Mini Manifesto"` + `"Meet the Cult"` + Renaissance paintings (`manifesto-left`, `manifesto-topright`, `manifesto-portrait`, `manifesto-angel`) + horizontal 1px rule + SVG arc.
   - Panel B: `"Honor the Grind"` + `"Join the Circle"` + `manifesto-art3`, `manifesto-art5`, circular `manifesto-pill`.
   - Panel C: `"Rarity Is Philosophy"` + `"See the Drops"` + `manifesto-yellow` (mirrored), `manifesto-greendunk`, `manifesto-bacchus` + SVG arc.
   Interaction model: **scroll-driven horizontal translation (`pin: true, scrub: 1`)**.
3. **`MysteryBoxSection` (`.mystery-box.alignfull`)** — `100svh` GSAP ScrollTrigger pinned section (`end: "+=150%"`, `scrub: 1`). Layered dark textured top/bottom curtains with sawtooth SVG edges, `"MYSTERY BOX"` heading with Creation-of-Adam hand inside `"O"`, descriptive copy, central horizontal zipper (`mystery-zip.svg` chain + slider), revealing full-bleed `mystery-chest.webp` artwork and `"Join the inner circle"` oval CTA. Interaction model: **scroll-driven two-stage unzip & curtain split (`pin: true, scrub: 1`)**.
4. **`FindPriceSection` (`.find-price.alignfull`)** — Horizontal warm gradient (`#ad6646 -> #61392c -> #000`), flying cherub (`find-price-cupid.webp`), `"Find it at my price"`, typewriter link bar cycling sneaker queries with blinking caret and long thin arrow SVG, and 3-line tagline. Interaction model: **time-driven typewriter + click navigation**.
5. **`TopSneakersSection` (`.tsneak.alignfull`)** — `"Top Sneakers"`, 2-column grid (5-item Roman numeral list `I–V` on left, `16:9` figure with left/right 16px ruler ticks, sliding frosted shelf SVG, grayscale->color product reveal, outlined hollow `01–05` index at bottom-right), plus `"Forge yours"` oval CTA. Interaction model: **hover/focus-driven (desktop) & click/swipe-driven (<=1023px)**.
6. **`TrendingAuctionsSection` (`.trend.alignfull`)** — `"Trending Auctions"`, full-bleed Swiper horizontal carousel (`2.8` slides desktop, `1.4` tablet, `1` mobile) with custom prev/next chevrons, floating product cutouts above glowing elliptical spotlight (`trend-glow.svg`), live D/H/M/S countdown timers, terracotta bid price, `"Show details"` + `"Bid now"` pill buttons, `"Forge yours"` CTA, and `"Log in to bid"` modal. Interaction model: **Swiper carousel + live 1s countdown + click modal**.
7. **`LatestRebornSection` (`.lreborn.alignfull`)** — Warm right radial glow (`rgba(173,102,70,0.28)`), `"Latest from Reborn"`, 4 full-width hairline-bordered rows (`Title | Author | Date`), floating rounded `720/368` story preview figure on the right (`<=1023px` moves above list with prev/next swipe arrows). Interaction model: **hover/focus-driven (desktop) & click/swipe-driven (<=1023px)**.

## 3. Footer (`SiteFooter` inside `<footer class="wp-block-template-part">`)
- **`.site-footer`:** Dual-layer WebGL parallax clouds (`footer-clouds-back.webp`, `footer-clouds-front.webp`) at bottom, centered `"Updates for the OG’s"` heading, minimalist bottom-border email input, `"Sign up to the OG list"` oval submit button with live validation states, bottom 3-column bar (legal links, `©Enigma 2026 All Rights Reserved`, social links), reCAPTCHA notice, `Cookie Settings` button, `Created by Ruler` credit.

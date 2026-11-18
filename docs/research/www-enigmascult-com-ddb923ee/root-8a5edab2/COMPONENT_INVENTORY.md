# Component Inventory — `https://www.enigmascult.com/`

1. **`SoundSystem` & `SoundToggle`** — Web Audio API buffer loader & spatial hover/scroll SFX manager + fixed bottom-left `.sound-toggle` button + `.sound-hint` live region.
2. **`CursorRing`** — Fixed smooth-lerp circular pointer ring (`.cursor-ring`) with `.is-on`, `.is-down`, `.is-hover`, `.is-label`, `.is-blessed`, plus magnetic button pull on `.block-hero__cta` and `.wpforms-submit`.
3. **`HomePreloader`** — Initial load veil (`.home-preloader`) with blur/lift transition, `0–100%` counter, and GSAP-style `Decoding -> Decode` scramble transition.
4. **`SiteHeader`** — Top absolute (fixed when menu open) header featuring interactive 3D WebGL `enigma-logo.glb` canvas (`.site-header__logo3d`) and 3-column utility navigation (`My Account`, `Cart`, `Wishlist`).
5. **`MenuToggle` & `SiteMenu`** — Bottom-center fixed hamburger/X morph button (`.menu-toggle`) and fullscreen overlay (`#site-menu`) with Three.js GLSL `menu-clouds.glb` shader, 6 nav items with hover-positioned 3D PNG icons, and 5 social links.
6. **`ClueKeeper` & `RitualOverlay`** — Bottom-right fixed 3D golden `?` WebGL canvas (`clue-mark.glb` + `RoomEnvironment`), `.clue-hint` riddle popover (plus touch input), and `.ritual` fullscreen cloud overlay triggered by typing `enigma`.
7. **`CookieConsent`** — Initial `.rfc-consent` dark floating banner (`We use cookies`) + `.rfc-modal` white Cookie Preferences dialog triggered by `Customize` or footer `Cookie Settings`.
8. **`BlockHero`** — `100svh` hero with warm terracotta gradient, SVG sacred geometry (`contact-lines.svg`, `hero-arc.svg`), interactive GLSL `hero-clouds.glb` ring shader, `"Decode Your Style"` with Mostwanted graffiti hover, tagline, and `"Forge Yours"` oval CTA.
9. **`ManifestoSection`** — GSAP ScrollTrigger pinned horizontal scroll showcase across 3 art-collage panels (`Mini Manifesto`, `Honor the Grind`, `Rarity Is Philosophy`).
10. **`MysteryBoxSection`** — GSAP ScrollTrigger pinned 2-stage reveal (`.mystery-box__zip` horizontal unzip -> top/bottom textured sawtooth curtain split) revealing full-bleed chest fresco and `"Join the inner circle"` oval CTA.
11. **`FindPriceSection`** — Warm horizontal gradient section with flying cherub, `"Find it at my price"`, viewport-gated typewriter link bar (`"Jordan 5 Retro"`, `"SB Dunk Low"`, `"AF1 Mother of Pearl"`, `"Yeezy 700 Wave"`), and tagline.
12. **`TopSneakersSection`** — 5-item sneaker showcase with left/right 16px ruler ticks, sliding frosted shelf SVG, grayscale->color reveal, hollow outlined `01–05` watermark, mobile swipe/chevron controls, and `"Forge yours"` oval CTA.
13. **`TrendingAuctionsSection` & `BidModal`** — Swiper horizontal auction carousel (`4` lots) with glowing elliptical spotlight bases, live D/H/M/S countdowns, `"Show details"` / `"Bid now"` actions, `"BID"` cursor label, and `"Confirm bid · Log in to bid"` modal.
14. **`LatestRebornSection`** — Editorial story table (`4` stories) with hairline dividers, floating `720/368` rounded story preview on right, and mobile swipe/chevron controls.
15. **`SiteFooter`** — Dual-layer orthographic Three.js parallax clouds (`footer-clouds-back.webp`, `footer-clouds-front.webp`), `"Updates for the OG’s"` newsletter form with inline email validation, legal/social grid, reCAPTCHA notice, Cookie Settings button, and Ruler credit.

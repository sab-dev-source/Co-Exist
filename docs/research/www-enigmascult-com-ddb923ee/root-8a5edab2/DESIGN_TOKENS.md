# Design Tokens — `https://www.enigmascult.com/`

## 1. Colors
| Token / Usage | Value | Context |
|---|---|---|
| Page Background | `#0a0a0a` | `body.home`, `.tsneak`, `.trend`, `.lreborn`, `.site-footer` |
| Pure Black Background | `#000000` (`#000`) | `.block-hero`, `.manifesto`, gradient stop |
| Mystery Curtain Base | `#050505` | `.mystery-box`, `.mystery-box__zip-chain` |
| Menu Backdrop Base | `#1a120c` | `.site-menu` fallback |
| Elevated Neutral Button | `#1a1b1e` / `#232427` | `.trend__details` default / hover |
| Primary Foreground / Ink | `#f9f9f9` | Headings, borders, active links, primary outlines |
| Pure White | `#ffffff` | `.trend__bid` bg, `.tsneak__row.is-active` text, `.enigma-bid-modal__confirm` bg |
| Muted Row Ink | `#828282` | `.lreborn__row` inactive, `.trend__ended` |
| Subtle Text / Captions | `hsla(0,0%,98%,0.6)` / `0.55` | `.sound-toggle`, `.site-footer__recaptcha` |
| Hairline Borders | `hsla(0,0%,98%,0.16)` / `hsla(0,0%,100%,0.1)` | `.manifesto__panel:before`, `.lreborn__row` |
| Terracotta Accent | `#ad6646` | Current bid price, gradients, `.enigma-bid-modal__eyebrow`, `.clue-hint` border |
| Deep Espresso Accent | `#61392c` | Mid-stop in hero, find-price, veil, and bid modal gradients |
| Form Error / Accent Orange | `#fb5711` | `.wpforms-error`, confirmation border |
| Hero Vertical Gradient | `linear-gradient(180deg, #000 31.76%, #61392c 75.46%, #ad6646)` (opacity `0.72`) | `.block-hero__grad` |
| Find Price Gradient | `linear-gradient(90deg, #ad6646, #61392c 24.54%, #000 68.24%)` | `.find-price` |
| Menu Radial Backdrop | `radial-gradient(54% 52% at 52% 44%, #dcc19b 0, #c19070 30%, #8a4a33 58%, #4a2418 82%, #2b1a12 100%)` | `.site-menu__bg--3d` |
| Bid Modal Panel Gradient | `linear-gradient(-1deg, #ad6646 1.37%, #61392c 25.23%, #000 67.74%)` | `.enigma-bid-modal__panel` |

## 2. Typography
### Font Families (Self-hosted `.woff2`)
- `--wp--preset--font-family--heading`: `"Editorial Today", Georgia, serif`
  - Thin `100 320` normal & italic, Regular `330 500` normal & italic, Semibold `510 650`, Bold `660 900`
- `--wp--preset--font-family--body`: `"Helvena", system-ui, -apple-system, sans-serif`
  - Variable font weight `200 900`
- `--wp--preset--font-family--mostwanted`: `"Mostwanted", serif`
  - Weight `400` normal (used on `[data-graffiti]:after` and `.block-hero__title:after` hover states)

### Type Scale (Fluid `clamp()` at 1920px baseline)
- Hero H1 (`.block-hero__title`): `clamp(44px, 5.2083333333vw, 100px)`, italic, `200`, `line-height: 1.08`, `letter-spacing: -0.04em`
- Section Display H2 (`.tsneak__title`, `.trend__title`, `.lreborn__title`, `.find-price__title`): `clamp(42px, 5.2083333333vw, 100px)` (`40px` on find-price), italic, `200`, `line-height: 0.92`
- Mystery Box H2 (`.mystery-box__title`): `clamp(48px, 6.25vw, 120px)`, italic, `200`, `line-height: 0.92`
- Manifesto H2 (`.manifesto__title`): `max(40px, 0.0520833333 * var(--pw))`, italic, `200`, `letter-spacing: -0.032em`, `line-height: 0.92`
- Graffiti Hover Overlay (`:after`): `~1.35×` heading size (`clamp(56.7px, 7.03125vw, 135px)` / `clamp(64.8px, 8.4375vw, 162px)` on Mystery Box), `line-height: 0.6815` (`0.92` on hero)
- Footer Heading & Copyright: `clamp(22px, 1.8229166667vw, 35px)` heading (`16px` min on copyright)
- Menu Primary Links: `clamp(34px, 4.1666666667vw, 80px)`, italic, `200`, `letter-spacing: -0.04em`, `line-height: 1.08`
- Top Sneakers Watermark Number: `clamp(88px, 9.375vw, 180px)`, italic, `250`, `-webkit-text-stroke: 1px hsla(0,0%,98%,0.55)`, transparent fill
- Auction Card Title: `clamp(20px, 1.875vw, 36px)`, Helvena `700`, `line-height: 1.25`
- Oval CTA Pills: `clamp(13px, 0.9375vw, 18px)` Editorial Today uppercase; `border-radius: 50%` (true geometric ellipse!)

## 3. Layout & Spacing Tokens
- `--container: 1200px`
- `--gutter: clamp(1.25rem, 4vw, 2.5rem)`
- `--radius-pill: 999px`
- Full-bleed wrapper: `width: min(89vw, 1710px)` (`.trend__title`, `.lreborn__body`)
- `.tsneak.alignfull`: `padding-block: clamp(64px, 6.7708333333vw, 130px); padding-inline: clamp(24px, 9.6354166667vw, 185px)`
- `.lreborn.alignfull`: `padding-block: clamp(64px, 6.7708333333vw, 130px)`
- Key Breakpoints: `1200px` (Swiper 2.8 slides), `1023px` (`.tsneak`/`.lreborn` stack & swipe buttons), `781px` (mobile hero, manifesto `--pw`, mystery box copy/title, footer 1-column).

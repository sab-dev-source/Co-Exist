# SiteHeader Specification

## Overview
- **Target file:** `src/components/sites/www-enigmascult-com-ddb923ee/root-8a5edab2/SiteHeader.tsx`
- **Screenshot:** `docs/design-references/www-enigmascult-com-ddb923ee/root-8a5edab2/01-desktop-hero.png`
- **Interaction model:** interactive WebGL 3D spin + drag + link hover

## DOM Structure
- `<header className="wp-block-template-part">`
  - `<div className="site-header">`
    - `<a className="site-header__logo" href="/" aria-label="Enigma">`
      - `<span className="site-header__logo-wordmark">ENIGMA</span>` (fallback hidden when canvas loads)
      - `<canvas className="site-header__logo3d" aria-hidden="true" />`
    - `<nav className="site-header__nav" aria-label="Utility">`
      - `<ul>` -> `My Account` (`/my-account/`), `Cart` (`/cart/`, with `<span className="site-header__cart-count" />`), `Wishlist` (`/my-account/wishlist/`)

## Computed Styles (exact from theme CSS)
- `.site-header`: `position: absolute; inset: 0 0 auto 0; z-index: 10; display: grid; justify-items: center; padding-block-start: clamp(12px, 1.3020833333vw, 25px); padding-inline: clamp(24px, 5.46875vw, 105px); color: #f9f9f9` (becomes `position: fixed; z-index: 60` when `html.menu-open`)
- `.site-header__logo`: `aspect-ratio: 250 / 115; width: clamp(150px, 13.0208333333vw, 250px); overflow: hidden; position: relative`
- `.site-header__nav`: `margin-block-start: clamp(8px, 1.0416666667vw, 20px); width: 100%`
- `.site-header__nav ul`: `display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; font-family: var(--wp--preset--font-family--heading); font-size: clamp(13px, 0.9375vw, 18px)`
- First `<li>` (`My Account`): `font-style: italic; justify-self: start; text-transform: uppercase`; last `<li>` (`Wishlist`): `justify-self: end`

## States & Behaviors
- **3D Logo:** Loads `/sites/www-enigmascult-com-ddb923ee/shared/models/enigma-logo.glb` via `GLTFLoader` + `MeshoptDecoder`. `PerspectiveCamera(18)`, `AmbientLight(0xffffff, 1.5)`, `DirectionalLight(0xffffff, 2.2)` at `(2,3,4)`, `DirectionalLight(0xffffff, 1.1)` at `(-3,-1,2)`, `MeshStandardMaterial({ color: 0xf9f9f9, roughness: 0.35, metalness: 0.15 })`. Fit scale `0.535`. Pauses at `rotation.y = 0` while `html.home-loading` is active; afterward spins at `0.35 rad/s` + drag-to-spin with `0.94` damping.
- **Hover:** Utility links gain underline.
- **Mobile (<=781px):** Expanded tap targets `padding: 12px 8px; margin: -12px -8px`.

# SiteFooter Specification

## Overview
- **Target file:** `src/components/sites/www-enigmascult-com-ddb923ee/root-8a5edab2/SiteFooter.tsx`
- **Screenshots:** `08-desktop-footer-newsletter.png`, `08-desktop-footer-bottom.png`, `08-footer-validation-empty.png`, `08-footer-validation-invalid.png`, `13-tablet-footer.png`
- **Interaction model:** WebGL dual-layer parallax clouds + form validation + modal trigger

## DOM Structure
- `<footer className="wp-block-template-part">` -> `<div className="site-footer">`
  - `<div className="site-footer__clouds" aria-hidden="true"><canvas className="site-footer__clouds3d" /></div>`
  - `<div className="site-footer__newsletter">`
    - `<h2 className="site-footer__heading" data-graffiti="Updates for the OG’s">Updates for the OG’s</h2>`
    - `<div className="site-footer__form site-footer__form--wpforms"><div className="wpforms-container wpforms-container-full">...email input + error alert + "Sign up to the OG list" oval submit...</div></div>`
  - `<div className="site-footer__bottom">`
    - `<ul className="site-footer__links">` (5 legal links)
    - `<p className="site-footer__copyright">©Enigma 2026 All Rights Reserved</p>`
    - `<ul className="site-footer__socials">` (5 social links)
    - `<p className="site-footer__recaptcha">This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.</p>`
    - `<button className="site-footer__cookies" type="button">Cookie Settings</button>`
    - `<p className="site-footer__credit">Created by <a href="https://www.ruler.agency" target="_blank" rel="noopener noreferrer">Ruler</a></p>`

## Computed Styles & Behaviors
- Three.js orthographically projected cloud shaders (`hero-clouds.glb` mesh + `footer-clouds-back.webp` at `z=-0.4, parallax=0.05, scale=1.06` and `footer-clouds-front.webp` at `z=0, parallax=0.1, scale=1.0, drop=0.07`) with `uReveal` rising `0 -> 1` on `IntersectionObserver` and pointer parallax lean. Hovering `.site-footer__clouds` plays `wind.mp3` when Sound is ON.
- Empty email submit shows orange `#fb5711` input border + triangle icon + `"This field is required."`; invalid email shows `"Please enter a valid email address."`; valid email shows `"Thanks for joining the OG list."` inside `.wpforms-confirmation-container-full`.
- **Mobile (<=781px):** `.site-footer__bottom` stacks 1-column centered; `.site-footer__links` switches to horizontal wrapped flex.

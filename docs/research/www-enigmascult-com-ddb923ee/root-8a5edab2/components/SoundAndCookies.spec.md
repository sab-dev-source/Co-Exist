# SoundToggle & CookieConsent Specification

## Overview
- **Target file:** `src/components/sites/www-enigmascult-com-ddb923ee/root-8a5edab2/SoundAndCookies.tsx`
- **Screenshots:** `01-desktop-hero-cookies.png`, `11-cookie-preferences.png`
- **Interaction model:** click-driven Web Audio unlock & cookie consent modal

## DOM Structure
- `<button className="sound-toggle" type="button" data-sound-toggle="" aria-pressed={soundOn}>`
  - `<span className="sound-toggle__wave" aria-hidden="true"><i /><i /><i /></span>`
  - `<span className={soundOn ? "sound-toggle__on" : "sound-toggle__off"}>{soundOn ? "Sound on" : "Sound off"}</span>`
- `<span className="sound-hint" aria-live="polite">...</span>`
- Cookie Banner (`<div className="rfc-consent rfc-pos-modal">`) when consent not yet saved: `"We use cookies"`, `"We use cookies to improve your experience. You can accept all, reject all, or customize your choices. Privacy policy"`, `Accept all` (`#1cce31`), `Customize` (`#2b2b2b`), `Reject all` (`#d11a1a`), `×`.
- Cookie Preferences Modal (`.rfc-modal`) opened by `Customize` or footer `Cookie Settings` event (`enigma:open-cookie-settings`): Functional (Required), Analytics toggle, Marketing toggle, `Accept all`, `Save choices`, `Reject all`.

## Computed Styles & Behaviors
- `.sound-toggle`: `position: fixed; bottom: clamp(20px, 2.5vw, 48px); left: var(--gutter); z-index: 70; font-size: clamp(10px, 0.5729vw, 11px); letter-spacing: 0.14em; text-transform: uppercase; color: hsla(0,0%,98%,0.6)` (white `#f9f9f9` when `.is-on` with animated 3-bar wave).
- Toggling sound ON shows `"Listen close — sounds hide all over. Find them."` for 6s and resumes Web Audio `AudioContext`.
- **Mobile:** `.rfc-consent` uses `left: 5vw; right: 5vw; width: auto`.

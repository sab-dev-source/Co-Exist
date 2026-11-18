# Tech Stack Analysis — `https://www.enigmascult.com/`

| Layer | Live Site Stack | Clone Equivalent (Next.js 16 + React 19) |
|---|---|---|
| Framework | WordPress 7.1.4 Block Theme (`enigma-cult`) + WooCommerce 11.0.1 | Next.js 16.4.6 App Router (`src/app/page.tsx`) |
| Styling | Compiled custom CSS (`style-index.css`) + Tailwind-free CSS fluid `clamp()` | Tailwind CSS v4 + exact CSS rules scoped/defined in `src/app/globals.css` |
| Typography | Self-hosted `.woff2` (`Editorial Today`, `Helvena`, `Mostwanted`) | Local `@font-face` rules serving downloaded `.woff2` files from `public/sites/.../shared/fonts/` |
| 3D / Shaders | Three.js r185 + `GLTFLoader` + `MeshoptDecoder` + `RoomEnvironment` | `three` npm package (`GLTFLoader`, `MeshoptDecoder`, `RoomEnvironment`) with identical GLSL shaders, uniforms, camera math, and `.glb` assets |
| Smooth Scroll | Lenis | `lenis` npm package synced with `gsap` ScrollTrigger ticker |
| Scroll & Text Anim | GSAP + `ScrollTrigger` + `ScrambleTextPlugin` | `gsap` + `ScrollTrigger` (`ScrambleText` implemented natively with identical uppercase scramble logic since `ScrambleTextPlugin` in GSAP Club/v3.15 or `gsap/ScrambleTextPlugin` — let's check if `gsap` 3.13+ includes `ScrambleTextPlugin`!) |
| Carousel | Swiper (`Navigation`, `Autoplay`, `Keyboard`, `A11y`) | `swiper` npm package with identical breakpoints, dynamic offsets, and `35%` visibility observer |
| Audio | Web Audio API `AudioContext` + 9 `.mp3` buffers | Native Web Audio API `AudioContext` + downloaded `.mp3` SFX buffers from `public/sites/.../shared/sfx/` |
| Forms / Auctions | WPForms `#wpforms-215` + `/wp-json/enigma-auctions/v1/state/<id>` polling | Interactive client validation matching exact WPForms error/confirmation states + live client countdown timers |

# ClueKeeper & RitualOverlay Specification

## Overview
- **Target file:** `src/components/sites/www-enigmascult-com-ddb923ee/root-8a5edab2/ClueAndRitual.tsx`
- **Screenshots:** `10-clue-keeper-open.png`, `10-ritual-easter-egg.png`
- **Interaction model:** WebGL 3D hover/click popover + keyboard secret sequence (`"enigma"`)

## DOM Structure
- `<button type="button" className="clue-keeper is-near" aria-label="A hidden clue"><canvas /></button>`
- When hint open: `<div className="clue-hint is-open" role="note"><p>Speak to the website with your keyboard.</p><p>Six letters, you already know the name.</p>{isCoarse && <input className="clue-hint__field" placeholder="· · · · · ·" />}</div>`
- When ritual open: `<div className="ritual is-open" role="dialog" aria-label="Initiation"><button type="button" className="ritual__close" aria-label="Close">×</button><p className="ritual__line ritual__line--1">You looked closer. </p><p className="ritual__line ritual__line--2">The cult marks you. </p><p className="ritual__line ritual__line--3">Wear the gilded ring.</p></div>`

## Computed Styles & 3D Scene
- `.clue-keeper`: `position: fixed; bottom: clamp(20px, 2.5vw, 48px); right: var(--gutter); width: 40px; height: 40px; z-index: 60` (`44×44` on coarse pointers). Hidden when `html.menu-open`.
- 3D scene: loads `clue-mark.glb` via `GLTFLoader` + `MeshoptDecoder`, `PerspectiveCamera(28, 1, 0.1, 50)`, `ACESFilmicToneMapping`, `PMREMGenerator.fromScene(new RoomEnvironment(), 0.04)`, `DirectionalLight(0xffdf90, 2.6)` at `(2, 3, 4)`, camera at `z = 2.1 * maxDim`. Spins `rotation.y = 0.6 * t`, bobs `position.y = Math.sin(1.4 * t) * maxDim * 0.03`.
- Typing `"enigma"` outside inputs (within 2000ms per key) sets `localStorage['enigma-blessed'] = '1'`, adds `.is-blessed` to `.cursor-ring`, plays `wind` SFX, and opens `.ritual.is-open` (`z-index: 10000`) with staggered text lines (`0.5s`, `1.3s`, `2.1s`). Closes on `×`, `Escape`, or `Enter`.

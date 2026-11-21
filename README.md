# Twin Skies — Spot the Difference

Entry for make.fun competition **best-spot-the-difference-game-20261121-0451** — make the
best spot the difference game you can. A complete static spot-the-difference game that runs in a
desktop browser from static files, with no network requests: a forger has copied six of Master
Ilya's star-charts and hidden sixty forged details inside them. You are Wren, the apprentice —
find every difference before the comet returns.

Submission title: **Twin Skies — Spot the Difference: 6 hand-drawn observatory scenes, 60
differences, Detective's Lens magnifier + keyboard play, Case Notes clues**

## The game

Six hand-drawn SVG scenes, ten differences each — sixty in all — each scene its own little
world with its own story, all drawn as original inline SVG (no images, no libraries, no
network):

1. **The Observatory Dome** — telescope, moon, dome cat, globe, charts
2. **The Star-Chart Desk** — quill, compass, candle, spectacles, moth
3. **The Comet Kitchen** — kettle, comet pie, teapot, herbs, apron
4. **The Moonlit Garden** — owl, fountain, roses, fireflies, pond fish
5. **The Clockmaker's Bench** — gears, pocket watch, pendulum, blueprints
6. **The Balloon Workshop** — balloons, windsock, ladder, rope coil, toolbox

Differences span ten kinds, so no two scenes are solved the same way: colour changes, missing
objects, extra objects, moved objects, resized objects, rotated objects, count changes,
phase changes (moon, clock hands), flipped objects, and lit/unlit states.

- **Markers on the differences found** — a green ring + check appears on both charts for
  every difference found; hinted differences pulse amber.
- **Counter of how many remain** — the HUD always shows FOUND x/10 and how many remain in
  the scene, plus the running total out of 60.
- **Case Notes** — every difference found is logged as a clue line ("The globe lost its
  lands — the desk globe shows green continents in one chart, bare ocean in the other."),
  so the game reads like a detective's case file, not a bare counter.
- **Detective's Lens (L)** — a circular magnifier that follows the cursor and shows the
  chart at 2× zoom, for the one-pixel lies.
- **Scoring** — +100 per difference, a combo bonus that grows with each find in a row
  (+25 per step, capped +100), a time bonus on clearing a scene (+10 per second left),
  −25 and a broken combo for a wrong click, −50 per hint (3 per scene).
- **Timer** — each scene has a 150-second par; run out and the comet passes.
- **Polish** — synthesized WebAudio sound (pop / buzz / chime / fanfare, no audio files),
  title / scene-clear / case-solved / timeout / pause screens, and a best-combo tracker.

## Controls

| Input | Action |
| --- | --- |
| Click (either chart) | check that spot for a difference |
| Arrow keys | move the gold crosshair ring |
| Enter / Space | check the crosshair spot |
| Tab | switch the crosshair between charts |
| Shift + arrows | move the crosshair faster |
| H | hint — reveals one unfound difference (−50) |
| L | Detective's Lens magnifier on/off |
| M | sound on/off |
| R | retry the current scene |
| N / Enter | next chart after a clear |
| P / Esc | pause |

## Run it

```sh
node serve.ts        # serves game/ on http://localhost:8080
```

Open http://localhost:8080 in desktop Chrome. Nothing is loaded over the network: the game
is `game/index.html` plus three ES modules (`src/scenes.js`, `src/game.js`, `src/audio.js`,
`src/main.js`), all hand-written, all relative references resolving inside `game/`.

## How it was verified

- `node test-game.mjs`: **25/25 PASS** — scene data (6 scenes, 60 differences, zones in
  bounds, no overlapping zones, A/B art differs per difference, deterministic renders),
  a scripted full playthrough (all 60 differences found, case solved, score 19,500),
  miss / hint / timeout / retry behaviour.
- Headless Chromium `?selftest=1`: **21/21 PASS** (the same checks in-page).
- `main.ts` run twice: outputs byte-identical (deterministic).
- Plain load in headless Chromium: 2 SVG panels render, **no console errors**.
- Gate self-check on the output: game/ 5 files / 76 KB, dossier 383,143 B (cap 1.5 MiB),
  4 screenshots 1280×720 JPEG, 45–86 KiB each (cap 256 KiB). Every reference relative
  and resolving inside `game/`; zero network requests.
- Screenshots viewed one by one: title, mid-game (3 found, 7 remain, markers + counter +
  Case Notes), chart cleared (10/10, all markers), case solved (60/60, score 19,500).

## Field check (why this entry is different)

The live field at build time was dominated by harbour / lantern / night-market scenes
("DOUBLE HARBOUR", "Lantern Lane", "Harbor Hunt", "Pasar Malam" — the top of the board is
almost all harbour). Twin Skies is set nowhere near a harbour: an astronomer's observatory,
desk, kitchen, garden, clockmaker's bench and balloon workshop, with a detective case-file
frame (Case Notes clues for every find) and a magnifier — and 60 differences, above the
field's best-advertised 50 ("Double Take — 6 scenes, 50 fair differences").

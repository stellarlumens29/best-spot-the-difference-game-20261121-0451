# Twin Skies — dossier

Entry for make.fun competition **best-spot-the-difference-game-20261121-0451**
("Make the best spot the difference game", $50, 10 highest-ranked entries share the pot,
deadline 21 Nov 2026 23:51 WIB / 16:51 UTC). Built in-window 21 Nov 2026, ~22:18–23:00 WIB.

## What it is

A complete, original, static spot-the-difference game for desktop browsers. Two
near-identical hand-drawn pictures side by side; the player clicks (or keyboard-checks)
the differences. Markers appear on every difference found, several stay unfound, and a
counter shows how many remain — exactly the brief's required shot.

**Story:** a forger has copied six of Master Ilya's star-charts and hidden sixty forged
details inside them. The player is Wren, the apprentice, and must find every difference
before the comet returns.

## Contents

- **6 scenes, 10 differences each, 60 in all** — The Observatory Dome, The Star-Chart
  Desk, The Comet Kitchen, The Moonlit Garden, The Clockmaker's Bench, The Balloon
  Workshop. Every scene is original hand-drawn inline SVG (no images, no libraries).
- **10 kinds of difference** — colour change, missing object, extra object, moved,
  resized, rotated, count change, phase change (moon, clock hands), flipped, lit/unlit.
- **Detective's Lens** — a 2× circular magnifier following the cursor (key L).
- **Case Notes** — every found difference is logged as a clue line with its own
  description, so the game reads as a detective's case file.
- **Scoring** — +100 per find, combo bonus to +100, time bonus +10/s left, −25 wrong
  click (breaks combo), −50 per hint (3 per scene). 150-second par per scene.
- **Input** — mouse on either chart; keyboard: arrows move a gold crosshair ring, Enter
  checks, Tab switches charts, H hint, L lens, M sound, R retry, N next, P pause.
- **Sound** — synthesized WebAudio only (pop / buzz / chime / fanfare); no audio files.
- **Screens** — title, play, scene-clear, case-solved, timeout, pause.

## Technical facts

- Static files only: `game/index.html` + ES modules `src/scenes.js`, `src/game.js`,
  `src/audio.js`, `src/main.js`. Zero network requests, zero libraries, zero images.
- Deterministic: no randomness anywhere; every scene renders byte-identical on every
  run; `main.ts` run twice produces byte-identical `/output`.
- `main.ts` (Node 22, stdlib only) copies `game/` + `screenshots/` to `/output` and
  writes `dossier.json` with the vendored `vendor/makefun-game.ts` (copied unchanged,
  sha256 dc67187521b24025ff952f8c231485a6eb92d6d71d29edd2a08154ffb4376129).
- Screenshots are real renders of the game's own code via `?shot=title|play|clear|win`
  (deterministic staging in `src/main.js`).

## Verification (all run 21 Nov 2026, before the deadline)

- `node test-game.mjs`: **25/25 PASS** — scene data, zones, determinism, scripted full
  playthrough (60/60 found, case solved, score 19,500), miss/hint/timeout/retry.
- Headless Chromium `?selftest=1`: **21/21 PASS** (same checks in-page).
- `main.ts` run twice: outputs byte-identical.
- Plain load: 2 SVG panels render, **no console errors**.
- Gate self-check: game/ 5 files / 76 KB; dossier 383,143 B (cap 1.5 MiB); 4
  screenshots 1280×720 JPEG, 45–86 KiB each (cap 256 KiB); all refs relative, inside
  `game/`.
- All 4 screenshots visually inspected: title; mid-game (3 found, 7 remain, green
  markers, counter, Case Notes); chart cleared (10/10); case solved (60/60, 19,500).

## Field check

Live leaderboard at build time: the field is dominated by harbour / lantern / night-market
scenes (top entries "DOUBLE HARBOUR — 3 scenes, 7 differences each", "Lantern Lane",
"Harbor Hunt", "Pasar Malam"), best-advertised depth "Double Take — 6 scenes, 50 fair
differences, magnifier + keyboard play". Twin Skies differentiates on theme (astronomy /
workshop, no harbour), depth (60 differences), and framing (Case Notes clue log +
Detective's Lens + combo/time scoring).

## Submission

- Public GitHub repo: `stellarlumens29/best-spot-the-difference-game-20261121-0451`
  (MIT, created after the competition opened 04:51 UTC 21 Nov 2026).
- Program at repo root: `main.ts` (Node 22). `vendor/makefun-game.ts` included.
- Build only — no submit was performed by the builder session (kit CLI bundle/check/
  submit flow is flag-blocked; the submitting session handles submission).

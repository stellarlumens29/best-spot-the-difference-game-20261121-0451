# HANDOFF — Twin Skies (best-spot-the-difference-game-20261121-0451)

Built 21 Nov 2026, ~22:18–22:45 WIB, in-window (competition opened 04:51 UTC / 11:51 WIB,
deadline 23:51 WIB / 16:51 UTC). Builder session A2, batch 2.

## What was built

**Twin Skies — Spot the Difference**: an original static spot-the-difference game.
You are Wren, the apprentice; a forger copied six of Master Ilya's star-charts and hid
sixty forged details in them. 6 hand-drawn SVG scenes × 10 differences = 60, ten kinds
of difference, Detective's Lens 2× magnifier, Case Notes clue log, combo + time scoring,
150s par per scene, mouse + full keyboard play, synthesized WebAudio, zero network
requests, zero libraries.

## Repo (public, MIT, created + pushed in-window)

- https://github.com/stellarlumens29/best-spot-the-difference-game-20261121-0451
- HEAD commit: `d03a8a3` ("LICENSE: standard MIT text first for license detection";
  build commit `9cf4f11`). Branch `main`. About homepage set to
  https://make.fun/bounty/best-spot-the-difference-game-20261121-0451. License detected
  as MIT by GitHub.
- `main.ts` at root (Node 22, stdlib only) + `vendor/makefun-game.ts` (copied unchanged,
  sha256 dc67187521b24025ff952f8c231485a6eb92d6d71d29edd2a08154ffb4376129).
- `game/` (index.html + src/scenes.js, game.js, audio.js, main.js), `screenshots/` (4×
  1280×720 JPEG), README.md, DOSSIER.md, LICENSE, serve.ts, shots.json, test-game.mjs.

## Verification (all run before the deadline)

- `node test-game.mjs`: **25/25 PASS** (scene data, zones, determinism, scripted full
  playthrough 60/60 → case solved, score 19,500; miss/hint/timeout/retry).
- Headless Chromium `?selftest=1`: **21/21 PASS**.
- `main.ts` run twice → outputs byte-identical (deterministic).
- Plain load: 2 SVG panels render, **no console errors**.
- Gate self-check: game/ 5 files / 76 KB; dossier.json 383,143 B (cap 1.5 MiB); 4
  screenshots 45–86 KiB each (cap 256 KiB); all refs relative, inside `game/`.
- All 4 screenshots visually inspected by the builder: title; mid-game (3 found,
  7 remain, green markers, counter, Case Notes); chart cleared (10/10); case solved
  (60/60, 19,500). One defect found and fixed in-session: the first win shot rendered
  the title screen (scene() went out of bounds at the win screen) — fixed by clamping
  scene() to the last scene; re-shot and re-verified.
- Field check done first: the live field is dominated by harbour / lantern /
  night-market scenes; Twin Skies differentiates on theme (astronomy/workshop), depth
  (60 differences vs field-best 50) and framing (Case Notes + Lens + combo scoring).

## What is ready to submit

Everything the brief asks for except the submit step itself: public repo, MIT, main.ts
at root, vendor file, game/, 4 screenshots, dossier (DOSSIER.md + generated
dossier.json via main.ts). **NOT submitted** — the kit CLI bundle/check/submit flow is
flag-blocked and the builder did not submit. The submitting session must run the kit
bundle/check/submit flow (or the approved route) with the transcripts of the sessions
that built it, before 23:51 WIB 21 Nov 2026.

## Blockers / notes

- None blocking. The dev server on :8080 was stopped after verification.
- Submission title to use: "Twin Skies — Spot the Difference: 6 hand-drawn observatory
  scenes, 60 differences, Detective's Lens magnifier + keyboard play, Case Notes clues".

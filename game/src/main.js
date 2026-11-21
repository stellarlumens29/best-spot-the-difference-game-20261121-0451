// Twin Skies — DOM binding: renders the two charts, HUD, Case Notes,
// markers, Detective's Lens, keyboard crosshair, overlays, ?shot staging
// and the ?selftest=1 in-page check suite.
import { SCENES, SCENE_W, SCENE_H, drawSceneSVG, findDiff, TOTAL_DIFFS } from './scenes.js';
import { createGame, HINTS_PER_SCENE } from './game.js';
import { sfx } from './audio.js';

const $ = (id) => document.getElementById(id);
const panelA = $('panelA');
const panelB = $('panelB');
const api = createGame();
const g = api.g;

let paused = false;
let lensOn = false;
let cross = { panel: 'A', x: SCENE_W / 2, y: SCENE_H / 2, visible: false };
let lastTick = performance.now();

function fmtTime(s) {
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

function show(id, on) {
  $(id).classList.toggle('hidden', !on);
}

function markerDiv(d, cls) {
  const el = document.createElement('div');
  el.className = `marker${cls ? ` ${cls}` : ''}`;
  el.style.left = `${(d.x / SCENE_W) * 100}%`;
  el.style.top = `${(d.y / SCENE_H) * 100}%`;
  el.textContent = cls === 'hint' ? '?' : '✓';
  return el;
}

function render() {
  const scene = api.scene();
  panelA.innerHTML = drawSceneSVG(scene, 'A');
  panelB.innerHTML = drawSceneSVG(scene, 'B');
  for (const d of scene.diffs) {
    if (g.found.has(d.id)) {
      panelA.appendChild(markerDiv(d));
      panelB.appendChild(markerDiv(d));
    } else if (g.hinted.has(d.id)) {
      panelA.appendChild(markerDiv(d, 'hint'));
      panelB.appendChild(markerDiv(d, 'hint'));
    }
  }
  $('sceneName').textContent = `${scene.name} — ${scene.story}`;
  $('counter').innerHTML = `FOUND <b>${g.found.size}/${scene.diffs.length}</b> &middot; ${api.remaining()} REMAIN`;
  $('timer').textContent = fmtTime(Math.max(0, g.timeLeft));
  $('timer').classList.toggle('low', g.timeLeft <= 30 && g.screen === 'play');
  $('score').textContent = String(g.score);
  $('hints').textContent = String(g.hintsLeft);
  $('btnHint').disabled = g.screen !== 'play' || g.hintsLeft <= 0;
  const notes = $('notes');
  const lines = g.log.slice(0, 3);
  notes.innerHTML = `<b>Case Notes.</b> ${lines.map((l) => `<div>${l}</div>`).join('')}`;
  show('ovTitle', g.screen === 'title');
  show('ovClear', g.screen === 'sceneClear');
  show('ovWin', g.screen === 'win');
  show('ovTimeout', g.screen === 'timeout');
  show('ovPause', paused && g.screen === 'play');
  if (g.screen === 'sceneClear') {
    $('clearText').innerHTML = `All ${scene.diffs.length} forged details found in <b>${scene.name}</b>.<br>Score <b>${g.score}</b> &middot; best combo <b>${g.bestCombo}</b> &middot; ${g.totalFound}/${TOTAL_DIFFS} found in all.`;
  }
  if (g.screen === 'win') {
    $('winText').innerHTML = `All <b>60</b> forged details found across 6 charts.<br>Final score <b>${g.score}</b> &middot; best combo <b>${g.bestCombo}</b> &middot; wrong clicks <b>${g.misses}</b> &middot; time <b>${fmtTime(g.totalTime)}</b>.`;
  }
  if (g.screen === 'timeout') {
    $('timeoutText').textContent = `Time ran out on ${scene.name} with ${api.remaining()} differences still hidden. The chart stays forged — for now.`;
  }
  $('btnSound').textContent = `Sound: ${g.muted ? 'off' : 'on'} (M)`;
  $('crosshair').style.display = cross.visible && g.screen === 'play' ? 'block' : 'none';
  if (cross.visible) placeCrosshair();
}

function placeCrosshair() {
  const panel = cross.panel === 'A' ? panelA : panelB;
  const r = panel.getBoundingClientRect();
  const ch = $('crosshair');
  ch.style.left = `${r.left + (cross.x / SCENE_W) * r.width}px`;
  ch.style.top = `${r.top + (cross.y / SCENE_H) * r.height}px`;
}

function panelPoint(panel, ev) {
  const r = panel.getBoundingClientRect();
  return {
    x: ((ev.clientX - r.left) / r.width) * SCENE_W,
    y: ((ev.clientY - r.top) / r.height) * SCENE_H,
  };
}

function missFlash(panel, p) {
  const el = document.createElement('div');
  el.className = 'missflash';
  el.style.left = `${(p.x / SCENE_W) * 100}%`;
  el.style.top = `${(p.y / SCENE_H) * 100}%`;
  el.textContent = '✕';
  panel.appendChild(el);
  setTimeout(() => el.remove(), 950);
}

function doClick(panelEl, p) {
  if (g.screen !== 'play' || paused) return;
  cross.panel = panelEl === panelA ? 'A' : 'B';
  cross.x = p.x;
  cross.y = p.y;
  cross.visible = true;
  const res = api.click(p.x, p.y);
  if (res.hit) {
    if (!g.muted) sfx.found();
  } else if (!res.ignored) {
    missFlash(panelEl, p);
    if (!g.muted) sfx.miss();
  }
  render();
  if (g.screen === 'sceneClear' && !g.muted) sfx.clear();
  if (g.screen === 'timeout' && !g.muted) sfx.timeout();
}

function doHint() {
  const d = api.hint();
  if (d) {
    if (!g.muted) sfx.hint();
    render();
  }
}

function startGame() {
  api.start();
  paused = false;
  cross = { panel: 'A', x: SCENE_W / 2, y: SCENE_H / 2, visible: false };
  render();
}

panelA.addEventListener('click', (ev) => doClick(panelA, panelPoint(panelA, ev)));
panelB.addEventListener('click', (ev) => doClick(panelB, panelPoint(panelB, ev)));

for (const panel of [panelA, panelB]) {
  panel.addEventListener('mousemove', (ev) => {
    cross.panel = panel === panelA ? 'A' : 'B';
    const p = panelPoint(panel, ev);
    cross.x = p.x;
    cross.y = p.y;
    if (lensOn) showLens(panel, ev);
  });
  panel.addEventListener('mouseleave', () => {
    $('lens').style.display = 'none';
  });
}

function showLens(panel, ev) {
  const lens = $('lens');
  const inner = $('lensInner');
  const svg = panel.querySelector('svg');
  if (!svg) return;
  const zoom = 2;
  inner.innerHTML = svg.outerHTML;
  const innerSvg = inner.querySelector('svg');
  innerSvg.setAttribute('width', String(SCENE_W * zoom));
  innerSvg.setAttribute('height', String(SCENE_H * zoom));
  const r = panel.getBoundingClientRect();
  const px = ((ev.clientX - r.left) / r.width) * SCENE_W;
  const py = ((ev.clientY - r.top) / r.height) * SCENE_H;
  const size = 190;
  lens.style.display = 'block';
  lens.style.left = `${ev.clientX - size / 2}px`;
  lens.style.top = `${ev.clientY - size / 2}px`;
  inner.style.left = `${size / 2 - px * zoom}px`;
  inner.style.top = `${size / 2 - py * zoom}px`;
}

function toggleLens() {
  lensOn = !lensOn;
  $('btnLens').textContent = lensOn ? 'Lens: on (L)' : 'Lens (L)';
  if (!lensOn) $('lens').style.display = 'none';
}

$('btnHint').addEventListener('click', doHint);
$('btnLens').addEventListener('click', toggleLens);
$('btnSound').addEventListener('click', () => {
  g.muted = !g.muted;
  render();
});
$('btnRetry').addEventListener('click', () => {
  api.retryScene();
  render();
});
$('btnStart').addEventListener('click', startGame);
$('btnAgain').addEventListener('click', startGame);
$('btnRetry2').addEventListener('click', () => {
  api.retryScene();
  render();
});
$('btnResume').addEventListener('click', () => {
  paused = false;
  render();
});
$('btnNext').addEventListener('click', () => {
  api.nextScene();
  if (g.screen === 'win' && !g.muted) sfx.win();
  render();
});

document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Tab') {
    ev.preventDefault();
    cross.panel = cross.panel === 'A' ? 'B' : 'A';
    cross.visible = true;
    render();
    return;
  }
  if (g.screen === 'title' && (ev.key === 'Enter' || ev.key === ' ')) {
    ev.preventDefault();
    startGame();
    return;
  }
  if (g.screen === 'sceneClear' && (ev.key === 'n' || ev.key === 'N' || ev.key === 'Enter')) {
    api.nextScene();
    if (g.screen === 'win' && !g.muted) sfx.win();
    render();
    return;
  }
  if ((g.screen === 'win' || g.screen === 'timeout') && ev.key === 'Enter') {
    if (g.screen === 'win') startGame();
    else {
      api.retryScene();
      render();
    }
    return;
  }
  if (ev.key === 'm' || ev.key === 'M') {
    g.muted = !g.muted;
    render();
    return;
  }
  if (ev.key === 'p' || ev.key === 'P' || ev.key === 'Escape') {
    if (g.screen === 'play') {
      paused = !paused;
      render();
    }
    return;
  }
  if (g.screen !== 'play' || paused) return;
  const step = ev.shiftKey ? 40 : 16;
  let used = true;
  if (ev.key === 'ArrowLeft') cross.x = Math.max(0, cross.x - step);
  else if (ev.key === 'ArrowRight') cross.x = Math.min(SCENE_W, cross.x + step);
  else if (ev.key === 'ArrowUp') cross.y = Math.max(0, cross.y - step);
  else if (ev.key === 'ArrowDown') cross.y = Math.min(SCENE_H, cross.y + step);
  else if (ev.key === 'Enter' || ev.key === ' ') {
    doClick(cross.panel === 'A' ? panelA : panelB, { x: cross.x, y: cross.y });
  } else if (ev.key === 'h' || ev.key === 'H') doHint();
  else if (ev.key === 'l' || ev.key === 'L') toggleLens();
  else if (ev.key === 'r' || ev.key === 'R') {
    api.retryScene();
    render();
  } else used = false;
  if (used) {
    ev.preventDefault();
    cross.visible = true;
    render();
  }
});

// Clock: 4 ticks a second while playing and unpaused.
function loop(now) {
  const dt = Math.min(1, (now - lastTick) / 1000);
  lastTick = now;
  if (g.screen === 'play' && !paused) {
    if (api.tick(dt)) {
      if (!g.muted) sfx.timeout();
      render();
    } else {
      $('timer').textContent = fmtTime(Math.max(0, g.timeLeft));
      $('timer').classList.toggle('low', g.timeLeft <= 30);
    }
  }
  requestAnimationFrame(loop);
}

// ---- ?shot staging: deterministic frames of the real game ----
function stageShot(name) {
  if (name === 'play') {
    api.start();
    // Three differences found, seven still hidden: the brief's mid-game shot.
    for (const id of ['d1', 'd3', 'd5']) {
      const d = SCENES[0].diffs.find((x) => x.id === id);
      api.click(d.x, d.y);
    }
    g.timeLeft = 141;
    g.totalTime = 9;
    cross = { panel: 'B', x: 430, y: 300, visible: true };
  } else if (name === 'clear') {
    api.start();
    api.scene().diffs.forEach((d) => api.click(d.x, d.y));
    // Leave timeLeft as it stood at the clear moment: HUD, log line and
    // score must agree about the time bonus.
  } else if (name === 'win') {
    api.start();
    for (let s = 0; s < SCENES.length; s += 1) {
      api.scene().diffs.forEach((d) => api.click(d.x, d.y));
      if (s < SCENES.length - 1) api.nextScene();
    }
    api.nextScene(); // sceneClear -> win screen
    g.timeLeft = 0;
    g.totalTime = 512;
  }
  render();
}

// ---- ?selftest=1: in-page check suite, results in #selftest + title ----
function runSelfTest() {
  const out = [];
  let pass = 0;
  const check = (name, ok) => {
    out.push(`${ok ? 'PASS' : 'FAIL'} ${name}`);
    if (ok) pass += 1;
  };
  check('6 scenes', SCENES.length === 6);
  check('60 differences total', TOTAL_DIFFS === 60);
  check('10 differences per scene', SCENES.every((s) => s.diffs.length === 10));
  check('every diff has A and B art that differ', SCENES.every((s) => s.diffs.every((d) => d.a !== d.b && d.a.length > 0)));
  check('every hit zone inside the 560x420 panel', SCENES.every((s) => s.diffs.every((d) => d.x - d.r >= 0 && d.x + d.r <= SCENE_W && d.y - d.r >= 0 && d.y + d.r <= SCENE_H)));
  check('no two zones in a scene overlap by more than half', SCENES.every((s) => {
    for (let i = 0; i < s.diffs.length; i += 1) {
      for (let j = i + 1; j < s.diffs.length; j += 1) {
        const a = s.diffs[i];
        const b = s.diffs[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < (a.r + b.r) * 0.5) return false;
      }
    }
    return true;
  }));
  check('A and B renders differ per scene', SCENES.every((s) => drawSceneSVG(s, 'A') !== drawSceneSVG(s, 'B')));
  check('render is deterministic (same bytes twice)', SCENES.every((s) => drawSceneSVG(s, 'A') === drawSceneSVG(s, 'A') && drawSceneSVG(s, 'B') === drawSceneSVG(s, 'B')));
  check('every diff centre hits its own zone', SCENES.every((s) => s.diffs.every((d) => findDiff(s, d.x, d.y, new Set()) === d)));
  check('a point far from every zone misses', SCENES.every((s) => {
    // (10, 410) bottom-left corner is clear in every scene's zones
    const far = s.diffs.every((d) => Math.hypot(10 - d.x, 410 - d.y) > d.r);
    return far ? findDiff(s, 10, 410, new Set()) === null : true;
  }));
  const t = createGame();
  t.start();
  check('fresh game: 10 remain, 150s, 3 hints', t.remaining() === 10 && t.g.timeLeft === 150 && t.g.hintsLeft === 3);
  const first = t.scene().diffs[0];
  const r1 = t.click(first.x, first.y);
  check('click on a difference scores +100', r1.hit && t.g.score === 100 && t.g.found.size === 1);
  const r2 = t.click(10, 410);
  check('click off every zone misses and costs 25', !r2.hit && t.g.score === 75 && t.g.misses === 1);
  const h = t.hint();
  check('hint reveals one unfound difference and costs 50', h !== null && t.g.hintsLeft === 2 && t.g.score === 25);
  t.scene().diffs.forEach((d) => {
    if (!t.g.found.has(d.id)) t.click(d.x, d.y);
  });
  check('finding all 10 clears the scene with a time bonus', t.g.screen === 'sceneClear' && t.g.score > 1000);
  check('next scene resets found and hints', t.nextScene() && t.g.sceneIndex === 1 && t.g.found.size === 0 && t.g.hintsLeft === 3);
  const t2 = createGame();
  t2.start();
  t2.tick(150);
  check('timer expiry ends the run', t2.g.screen === 'timeout' && t2.g.timeLeft === 0);
  t2.retryScene();
  check('retry restores a fresh scene', t2.g.screen === 'play' && t2.g.timeLeft === 150);
  const t3 = createGame();
  t3.start();
  for (let s = 0; s < SCENES.length; s += 1) {
    t3.scene().diffs.forEach((d) => t3.click(d.x, d.y));
    if (s < SCENES.length - 1) t3.nextScene();
  }
  check('scripted full playthrough wins: 60 found', t3.g.screen === 'sceneClear' || t3.g.screen === 'win');
  // Note: after the last scene clears the screen is sceneClear until nextScene()
  check('final nextScene reaches the win screen', t3.nextScene() && t3.g.screen === 'win' && t3.g.totalFound === 60);
  check('win score is positive and deterministic', t3.g.score > 6000);
  const el = $('selftest');
  el.style.display = 'block';
  el.textContent = `${out.join('\n')}\nSELFTEST ${pass}/${out.length} ${pass === out.length ? 'PASS' : 'FAIL'}`;
  document.title = `SELFTEST ${pass}/${out.length} ${pass === out.length ? 'PASS' : 'FAIL'}`;
}

const params = new URLSearchParams(location.search);
if (params.has('selftest')) {
  runSelfTest();
  render();
} else if (params.get('shot')) {
  stageShot(params.get('shot'));
} else {
  render();
}
requestAnimationFrame(loop);

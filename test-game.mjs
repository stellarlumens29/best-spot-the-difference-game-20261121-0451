// Twin Skies — Node test suite (no DOM, no browser): the same scene data
// and game logic the browser plays, checked headlessly.
// Run: node test-game.mjs
import { SCENES, SCENE_W, SCENE_H, drawSceneSVG, findDiff, TOTAL_DIFFS } from './game/src/scenes.js';
import { createGame } from './game/src/game.js';

let pass = 0;
let total = 0;
function check(name, ok, extra = '') {
  total += 1;
  if (ok) pass += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${extra ? ` — ${extra}` : ''}`);
}

check('6 scenes', SCENES.length === 6);
check('60 differences total', TOTAL_DIFFS === 60);
check('10 differences per scene', SCENES.every((s) => s.diffs.length === 10));
check('every diff id unique within its scene', SCENES.every((s) => new Set(s.diffs.map((d) => d.id)).size === 10));
check('every diff has A/B art that differ', SCENES.every((s) => s.diffs.every((d) => d.a !== d.b && d.a.length > 0 && d.b.length >= 0)));
check('every diff has a label and a clue', SCENES.every((s) => s.diffs.every((d) => d.label.length > 5 && d.clue.length > 10)));
check('every hit zone inside the panel', SCENES.every((s) => s.diffs.every((d) => d.x - d.r >= 0 && d.x + d.r <= SCENE_W && d.y - d.r >= 0 && d.y + d.r <= SCENE_H)));
check('no two zones overlap by more than half', SCENES.every((s) => {
  for (let i = 0; i < s.diffs.length; i += 1) {
    for (let j = i + 1; j < s.diffs.length; j += 1) {
      const a = s.diffs[i];
      const b = s.diffs[j];
      if (Math.hypot(a.x - b.x, a.y - b.y) < (a.r + b.r) * 0.5) return false;
    }
  }
  return true;
}));
check('A/B renders differ per scene', SCENES.every((s) => drawSceneSVG(s, 'A') !== drawSceneSVG(s, 'B')));
check('render deterministic (same bytes twice)', SCENES.every((s) => drawSceneSVG(s, 'A') === drawSceneSVG(s, 'A') && drawSceneSVG(s, 'B') === drawSceneSVG(s, 'B')));
check('SVG is well-formed (balanced tags, one root)', SCENES.every((s) => {
  const svg = drawSceneSVG(s, 'A');
  return svg.startsWith('<svg') && svg.endsWith('</svg>') && (svg.match(/<g>/g) || []).length === (svg.match(/<\/g>/g) || []).length;
}));
check('every diff centre hits its own zone', SCENES.every((s) => s.diffs.every((d) => findDiff(s, d.x, d.y, new Set()) === d)));
check('found diffs are no longer hittable', SCENES.every((s) => {
  const found = new Set([s.diffs[0].id]);
  return findDiff(s, s.diffs[0].x, s.diffs[0].y, found) === null;
}));

// Full scripted playthrough: find every difference in every scene, win.
const t = createGame();
t.start();
let clicks = 0;
for (let s = 0; s < SCENES.length; s += 1) {
  for (const d of t.scene().diffs) {
    const r = t.click(d.x, d.y);
    clicks += 1;
    if (!r.hit) {
      check(`playthrough scene ${s + 1} diff ${d.id} hits`, false);
    }
  }
  check(`scene ${s + 1} clears at 10/10`, t.g.screen === 'sceneClear' && t.g.found.size === 10);
  if (s < SCENES.length - 1) t.nextScene();
}
t.nextScene();
check('full playthrough wins after 60 clicks', t.g.screen === 'win' && t.g.totalFound === 60, `${clicks} clicks, score ${t.g.score}`);
check('win score above 6000 (base + combo + time)', t.g.score > 6000, `score ${t.g.score}`);

// Miss / hint / timeout / retry behaviour.
const m = createGame();
m.start();
m.click(10, 410);
check('miss costs 25 and breaks combo', m.g.score === 0 && m.g.misses === 1);
m.click(m.scene().diffs[0].x, m.scene().diffs[0].y);
const before = m.g.score;
const h = m.hint();
check('hint costs 50 and reveals an unfound diff', h !== null && m.g.score === before - 50 && m.g.hintsLeft === 2);
m.tick(150);
check('150s timeout ends the run', m.g.screen === 'timeout');
m.retryScene();
check('retry restores a fresh scene', m.g.screen === 'play' && m.g.timeLeft === 150 && m.g.found.size === 0);

console.log(`\n${pass}/${total} PASS`);
process.exit(pass === total ? 0 : 1);

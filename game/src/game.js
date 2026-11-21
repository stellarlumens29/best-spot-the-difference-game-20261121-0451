// Twin Skies — game logic, DOM-free so Node can test it exactly.
// Scoring: +100 per difference, +25 combo step (capped +100), time bonus on
// scene clear (+10 per second left), hint costs 50, wrong click -25 and
// breaks the combo. A scene lasts its par seconds; timeout ends the run.
import { SCENES, TOTAL_DIFFS, findDiff } from './scenes.js';

export const HINTS_PER_SCENE = 3;
export const HINT_COST = 50;
export const MISS_COST = 25;

export function createGame() {
  const g = {
    screen: 'title', // title | play | sceneClear | win | timeout
    sceneIndex: 0,
    found: new Set(),
    hinted: new Set(),
    score: 0,
    combo: 0,
    bestCombo: 0,
    hintsLeft: HINTS_PER_SCENE,
    misses: 0,
    timeLeft: SCENES[0].par,
    totalFound: 0,
    totalTime: 0,
    muted: false,
    lastFound: null,
    lastMiss: null,
    log: [], // Case Notes: clue lines, newest first
  };

  function scene() {
    // Clamped so the win screen can still show the last chart behind it.
    return SCENES[Math.min(g.sceneIndex, SCENES.length - 1)];
  }

  function start() {
    g.screen = 'play';
    g.sceneIndex = 0;
    g.found = new Set();
    g.hinted = new Set();
    g.score = 0;
    g.combo = 0;
    g.bestCombo = 0;
    g.hintsLeft = HINTS_PER_SCENE;
    g.misses = 0;
    g.timeLeft = SCENES[0].par;
    g.totalFound = 0;
    g.totalTime = 0;
    g.lastFound = null;
    g.lastMiss = null;
    g.log = ['Case opened: six charts, sixty forged details. Find them all before the comet returns.'];
    return g;
  }

  /** Click at panel coords (x, y). Returns { hit, diff?, already? }. */
  function click(x, y) {
    if (g.screen !== 'play') return { hit: false, ignored: true };
    const d = findDiff(scene(), x, y, g.found);
    if (!d) {
      g.combo = 0;
      g.misses += 1;
      g.score = Math.max(0, g.score - MISS_COST);
      g.lastMiss = { x, y, at: g.totalTime };
      return { hit: false, diff: null };
    }
    g.found.add(d.id);
    g.totalFound += 1;
    g.combo += 1;
    g.bestCombo = Math.max(g.bestCombo, g.combo);
    const comboBonus = Math.min(100, (g.combo - 1) * 25);
    g.score += 100 + comboBonus;
    g.lastFound = d;
    g.log.unshift(`Found: ${d.label} — ${d.clue}`);
    if (g.found.size === scene().diffs.length) {
      const timeBonus = Math.round(g.timeLeft) * 10;
      g.score += timeBonus;
      g.log.unshift(`Scene cleared with ${Math.round(g.timeLeft)}s to spare: +${timeBonus} time bonus.`);
      g.screen = 'sceneClear';
    }
    return { hit: true, diff: d, comboBonus };
  }

  function nextScene() {
    if (g.screen !== 'sceneClear') return false;
    g.sceneIndex += 1;
    if (g.sceneIndex >= SCENES.length) {
      g.screen = 'win';
      return true;
    }
    g.found = new Set();
    g.hinted = new Set();
    g.hintsLeft = HINTS_PER_SCENE;
    g.combo = 0;
    g.timeLeft = SCENES[g.sceneIndex].par;
    g.lastFound = null;
    g.lastMiss = null;
    g.screen = 'play';
    g.log.unshift(`New chart: ${SCENES[g.sceneIndex].name}.`);
    return true;
  }

  /** Spend a hint: reveals one unfound difference (pulsed, not auto-found). */
  function hint() {
    if (g.screen !== 'play' || g.hintsLeft <= 0) return null;
    const rest = scene().diffs.filter((d) => !g.found.has(d.id) && !g.hinted.has(d.id));
    if (rest.length === 0) return null;
    const d = rest[0];
    g.hinted.add(d.id);
    g.hintsLeft -= 1;
    g.score = Math.max(0, g.score - HINT_COST);
    g.log.unshift(`Hint: something is wrong near the ${d.label.toLowerCase()}… (−${HINT_COST})`);
    return d;
  }

  /** Advance the clock by dt seconds. Returns true if time ran out. */
  function tick(dt) {
    if (g.screen !== 'play') return false;
    g.timeLeft -= dt;
    g.totalTime += dt;
    if (g.timeLeft <= 0) {
      g.timeLeft = 0;
      g.screen = 'timeout';
      g.log.unshift('Time ran out — the comet passed and the forgeries escaped.');
      return true;
    }
    return false;
  }

  function retryScene() {
    g.found = new Set();
    g.hinted = new Set();
    g.hintsLeft = HINTS_PER_SCENE;
    g.combo = 0;
    g.timeLeft = scene().par;
    g.lastFound = null;
    g.lastMiss = null;
    g.screen = 'play';
  }

  return {
    g, scene, start, click, nextScene, hint, tick, retryScene,
    totalDiffs: TOTAL_DIFFS,
    remaining() {
      return scene().diffs.length - g.found.size;
    },
  };
}

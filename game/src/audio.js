// Twin Skies — synthesized sound, WebAudio only, no audio files.
// A short pop on a found difference, a low buzz on a miss, a chime arpeggio
// on a cleared scene, a fanfare on the solved case. All deterministic.
let ctx = null;

function ac() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(freq, at, dur, type = 'sine', vol = 0.12) {
  const c = ac();
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, c.currentTime + at);
  g.gain.linearRampToValueAtTime(vol, c.currentTime + at + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + at + dur);
  o.connect(g);
  g.connect(c.destination);
  o.start(c.currentTime + at);
  o.stop(c.currentTime + at + dur + 0.05);
}

export const sfx = {
  found() {
    tone(660, 0, 0.12);
    tone(990, 0.08, 0.16);
  },
  miss() {
    tone(140, 0, 0.18, 'sawtooth', 0.07);
  },
  hint() {
    tone(520, 0, 0.1);
    tone(780, 0.07, 0.12);
  },
  clear() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.22));
  },
  win() {
    [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, i * 0.11, 0.3));
  },
  timeout() {
    [392, 330, 262].forEach((f, i) => tone(f, i * 0.14, 0.25, 'triangle', 0.1));
  },
};

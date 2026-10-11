// Tiny procedural sound engine (Web Audio, no asset files). Lazily starts on the
// first user gesture, which also satisfies browser autoplay rules.

let ctx = null;
let master = null;
let muted = false;
let ambient = null;

function ensure() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.45;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone({ freq = 440, to, dur = 0.18, type = 'sine', vol = 0.3, delay = 0 }) {
  const c = ensure();
  if (!c) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function noiseSweep({ dur = 0.6, from = 300, to = 2600, vol = 0.25 }) {
  const c = ensure();
  if (!c) return;
  const t0 = c.currentTime;
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = 6;
  bp.frequency.setValueAtTime(from, t0);
  bp.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.05);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(bp).connect(g).connect(master);
  src.start(t0);
  src.stop(t0 + dur);
}

export const sound = {
  init() {
    ensure();
  },
  tap() {
    tone({ freq: 520, to: 680, dur: 0.08, type: 'triangle', vol: 0.18 });
  },
  pickup() {
    tone({ freq: 660, dur: 0.09, type: 'triangle', vol: 0.25 });
    tone({ freq: 990, dur: 0.12, type: 'triangle', vol: 0.22, delay: 0.07 });
  },
  proximity() {
    tone({ freq: 440, to: 760, dur: 0.22, type: 'sine', vol: 0.18 });
  },
  gate() {
    noiseSweep({ dur: 0.9, from: 240, to: 3200, vol: 0.28 });
    tone({ freq: 160, to: 520, dur: 0.9, type: 'sawtooth', vol: 0.12 });
  },
  win() {
    [523, 659, 784, 1047].forEach((f, i) =>
      tone({ freq: f, dur: 0.22, type: 'triangle', vol: 0.22, delay: i * 0.1 }),
    );
  },
  startAmbient() {
    const c = ensure();
    if (!c || ambient) return;
    const g = c.createGain();
    g.gain.value = 0.06;
    const o1 = c.createOscillator();
    o1.type = 'sine';
    o1.frequency.value = 55;
    const o2 = c.createOscillator();
    o2.type = 'sine';
    o2.frequency.value = 82.5;
    const lfo = c.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = c.createGain();
    lfoGain.gain.value = 0.03;
    lfo.connect(lfoGain).connect(g.gain);
    o1.connect(g);
    o2.connect(g);
    g.connect(master);
    o1.start();
    o2.start();
    lfo.start();
    ambient = { o1, o2, lfo, g };
  },
  toggleMute() {
    muted = !muted;
    if (master) master.gain.value = muted ? 0 : 0.45;
    return muted;
  },
  isMuted() {
    return muted;
  },
};

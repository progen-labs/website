// Tiny procedural sound engine (Web Audio, no asset files). Lazily starts on the
// first user gesture, which also satisfies browser autoplay rules.

let ctx = null;
let master = null;
let muted = false;
let ambient = null;
let music = null;

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

// ---- generative fantasy ambient music -----------------------------------
function padChord(freqs, dur, vol = 0.045) {
  const c = ensure();
  if (!c) return;
  const t0 = c.currentTime;
  freqs.forEach(f => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'sine';
    o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + dur * 0.35);
    g.gain.linearRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(master);
    o.start(t0);
    o.stop(t0 + dur + 0.1);
  });
}

function softNote(f, vol = 0.06) {
  const c = ensure();
  if (!c) return;
  const t0 = c.currentTime;
  // the note plus two quieter echoes for a dreamy tail
  [[vol, 0], [vol * 0.5, 0.3], [vol * 0.25, 0.6]].forEach(([v, d]) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'triangle';
    o.frequency.value = f;
    const s = t0 + d;
    g.gain.setValueAtTime(0.0001, s);
    g.gain.exponentialRampToValueAtTime(v, s + 0.25);
    g.gain.exponentialRampToValueAtTime(0.0001, s + 1.7);
    o.connect(g).connect(master);
    o.start(s);
    o.stop(s + 1.8);
  });
}

function startMusic() {
  const c = ensure();
  if (!c || music) return;
  const scale = [220, 261.63, 293.66, 329.63, 392, 440, 523.25, 587.33]; // A pentatonic-ish
  const chords = [
    [110, 164.81, 220], // Am
    [146.83, 220, 293.66], // Dm
    [130.81, 196, 261.63], // C
    [98, 146.83, 196], // G
  ];
  let ci = 0;
  const pad = () => {
    padChord(chords[ci % chords.length], 9.5, 0.045);
    ci++;
  };
  pad();
  music = {
    padId: setInterval(pad, 9000),
    melId: setInterval(() => {
      if (Math.random() < 0.8) softNote(scale[Math.floor(Math.random() * scale.length)]);
    }, 1800),
  };
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
    startMusic();
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

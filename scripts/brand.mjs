// Generates the animated Progen Labs Seed as self-contained SVG (SMIL, no
// script), so it animates anywhere an SVG is shown, even as an <img>.
//
// The ribbon is real 3D: rungs are placed on a twisting ribbon, turned about
// its spine, tilted toward the viewer and projected with perspective, once
// per keyframe. Faces light up as they turn to the viewer (with a specular
// sheen), a scan pulse climbs the rungs, and an energy dot runs the spine.
// The full emblem adds a hologram emitter, an orbit ring and a reticle.
// Still versions (for reduced motion) and a solid favicon come from the
// same geometry, so every copy of the mark is the same mark.
//
//   node scripts/brand.mjs           writes the SVGs into public/brand/
//   node scripts/brand.mjs --png     also renders the PNGs from them (the
//                                    avatar, touch icon, PNG favicon and a
//                                    PNG mark), with a local Chrome:
//                                    npm i --no-save puppeteer-core first
//
// public/brand/ is served at https://progen-labs.github.io/website/brand/,
// which is where the READMEs of every Progen Labs repository load the logo
// from: regenerate here and they all follow.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '../public/brand');
const TILT = 0.32; // lean toward the viewer (radians)
const FOCAL = 230; // perspective: smaller is stronger
const TURN = 8; // seconds for one full turn about the spine
const PULSES = 2; // scan pulses per turn

const PALETTES = {
  dark: {
    front: ['#5ef0ff', '#38bdf8', '#5b8cff', '#7c83ff'],
    back: ['#d0b4ff', '#a78bfa', '#8b5cf6'],
    hot: '#effdff', edge: '#d8f6ff', hud: '#7fd8ff', min: 0.28,
  },
  light: {
    front: ['#0891b2', '#0284c7', '#2563eb', '#4338ca'],
    back: ['#8b5cf6', '#7c3aed', '#5b21b6'],
    hot: '#0e7490', edge: '#1e1b4b', hud: '#334e7a', min: 0.36,
  },
};

const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const toHex = c => `#${c.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')}`;
const lerp = (a, b, f) => a.map((v, i) => v + (b[i] - v) * f);
const ramp = (stops, t) => {
  const x = Math.max(0, Math.min(1, t)) * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(x));
  return lerp(hex(stops[i]), hex(stops[i + 1]), x - i);
};
const n1 = v => (Math.round(v * 10) / 10).toString();
const n2 = v => (Math.round(v * 100) / 100).toString();

const width = s => 24 * Math.sin(Math.PI * s) ** 0.8 * (0.82 + 0.3 * s); // seed outline, fuller below the middle
const twist = s => -0.7 * Math.PI + 1.25 * Math.PI * s; // a turn and a quarter, tip to tip
const spineY = s => -42 + 84 * s;

function project(x, y, z) {
  const y1 = y * Math.cos(TILT) - z * Math.sin(TILT);
  const z1 = y * Math.sin(TILT) + z * Math.cos(TILT);
  const k = FOCAL / (FOCAL - z1);
  return [x * k, y1 * k];
}
const scanAt = u => 1.15 - 1.3 * ((u * PULSES) % 1); // s of the scan pulse at loop time u (0..1)

/** Every rung at loop time u: projected ends, colour and strength. */
function frame(u, n, p) {
  const phase = 2 * Math.PI * u;
  const scan = scanAt(u);
  const out = [];
  for (let i = 0; i <= n; i++) {
    const s = i / n, th = twist(s) + phase, half = width(s), y = spineY(s);
    const a = project(-half * Math.cos(th), y, -half * Math.sin(th));
    const b = project(half * Math.cos(th), y, half * Math.sin(th));
    const face = Math.cos(th); // >0: the front face is toward the viewer
    const lit = Math.abs(face);
    const boost = Math.exp(-(((s - scan) / 0.07) ** 2));
    let colour = face >= 0 ? ramp(p.front, s) : ramp(p.back, s);
    colour = lerp(colour, hex(p.hot), Math.min(1, 0.22 * lit ** 10 + 0.8 * boost));
    const opacity = Math.min(1, p.min + (1 - p.min) * (0.22 + 0.78 * lit) + 0.55 * boost);
    out.push({ a, b, colour: toHex(colour), opacity });
  }
  return out;
}

// one <animate> per changing attribute; a constant attribute is written once
function animated(tag, attrs, frames, dur) {
  let fixed = '', anims = '';
  for (const [name, values] of Object.entries(attrs)) {
    const list = [...values, values[0]]; // close the loop
    if (list.every(v => v === list[0])) fixed += ` ${name}="${list[0]}"`;
    else anims += `<animate attributeName="${name}" dur="${dur}s" repeatCount="indefinite" values="${list.join(';')}"/>`;
  }
  void frames;
  return `<${tag}${fixed}>${anims}</${tag}>`;
}

function ribbon({ p, n, frames, w }) {
  const F = Array.from({ length: frames }, (_, k) => frame(k / frames, n, p));
  let rungs = '';
  for (let i = 0; i <= n; i++) {
    rungs += animated('line', {
      x1: F.map(f => n1(f[i].a[0])), y1: F.map(f => n1(f[i].a[1])),
      x2: F.map(f => n1(f[i].b[0])), y2: F.map(f => n1(f[i].b[1])),
      stroke: F.map(f => f[i].colour), 'stroke-opacity': F.map(f => n2(f[i].opacity)),
    }, frames, TURN).replace('<line', `<line stroke-width="${w}" stroke-linecap="round"`);
  }
  const edge = side => F.map(f => `M${f.map(r => `${n1(r[side][0])} ${n1(r[side][1])}`).join(' L')}`);
  const edges = ['a', 'b'].map(side => animated('path', { d: edge(side) }, frames, TURN)
    .replace('<path', `<path fill="none" stroke="${p.edge}" stroke-opacity="0.55" stroke-width="${n2(w * 0.55)}" stroke-linejoin="round"`)).join('');
  return rungs + edges;
}

function spine(p, dark, still) {
  const top = project(0, spineY(0), 0)[1], bottom = project(0, spineY(1), 0)[1];
  const core = `<line x1="0" y1="${n1(top)}" x2="0" y2="${n1(bottom)}" stroke="url(#spine)" stroke-width="0.5"/>`;
  if (still) return core;
  const ys = [], ops = [];
  for (let k = 0; k <= 40; k++) {
    const s = scanAt(k / 40 / PULSES); // one pulse
    ys.push(n1(project(0, spineY(Math.max(0, Math.min(1, s))), 0)[1]));
    ops.push(s < 0 || s > 1 ? '0' : '1');
  }
  return `${core}
  <circle cx="0" r="${dark ? 1.3 : 1.1}" fill="${p.hot}"${dark ? ' filter="url(#spark)"' : ''}>
    <animate attributeName="cy" dur="${TURN / PULSES}s" repeatCount="indefinite" values="${ys.join(';')}"/>
    <animate attributeName="opacity" dur="${TURN / PULSES}s" repeatCount="indefinite" values="${ops.join(';')}" calcMode="discrete"/>
  </circle>`;
}

function hud(p) {
  const base = project(0, spineY(1), 0)[1] + 6.5;
  const pulse = (begin) => `<ellipse cx="0" cy="${n1(base)}" fill="none" stroke="${p.hud}" stroke-width="0.5">
      <animate attributeName="rx" dur="3s" begin="${begin}s" repeatCount="indefinite" values="5;26"/>
      <animate attributeName="ry" dur="3s" begin="${begin}s" repeatCount="indefinite" values="1.2;6.2"/>
      <animate attributeName="stroke-opacity" dur="3s" begin="${begin}s" repeatCount="indefinite" values="0.9;0"/>
    </ellipse>`;
  const orbit = { rx: 37, ry: 9.5, rot: -14 };
  const arc = sweep => `M ${sweep ? orbit.rx : -orbit.rx} 0 A ${orbit.rx} ${orbit.ry} 0 0 1 ${sweep ? -orbit.rx : orbit.rx} 0`;
  const behind = `
  <g opacity="0.55">
    <circle r="55" fill="none" stroke="${p.hud}" stroke-width="0.45" stroke-dasharray="58 28.4" stroke-opacity="0.55">
      <animateTransform attributeName="transform" type="rotate" values="0;360" dur="60s" repeatCount="indefinite"/>
    </circle>
    <circle r="51" fill="none" stroke="${p.hud}" stroke-width="1.6" stroke-dasharray="0.4 5.94" stroke-opacity="0.45">
      <animateTransform attributeName="transform" type="rotate" values="360;0" dur="90s" repeatCount="indefinite"/>
    </circle>
    ${[0, 90, 180, 270].map(a => `<line x1="0" y1="-57.5" x2="0" y2="-53" stroke="${p.hud}" stroke-width="0.6" transform="rotate(${a})"/>`).join('')}
  </g>
  <path d="M -16 ${n1(base)} L -7 ${n1(base - 40)} L 7 ${n1(base - 40)} L 16 ${n1(base)} Z" fill="url(#cone)"/>
  <g transform="rotate(${orbit.rot})"><path d="${arc(false)}" fill="none" stroke="${p.hud}" stroke-width="0.5" stroke-opacity="0.35" stroke-dasharray="1.5 1.5"/></g>
  <ellipse cx="0" cy="${n1(base)}" rx="16" ry="3.8" fill="none" stroke="${p.hud}" stroke-width="0.7" stroke-opacity="0.85"/>
  <ellipse cx="0" cy="${n1(base)}" rx="9.5" ry="2.2" fill="${p.hud}" fill-opacity="0.18" stroke="${p.hud}" stroke-width="0.5" stroke-opacity="0.7"/>
  ${pulse(0)}${pulse(1.5)}`;
  const front = `
  <g transform="rotate(${orbit.rot})">
    <path d="${arc(true)}" fill="none" stroke="${p.hud}" stroke-width="0.6" stroke-opacity="0.75"/>
    <circle r="1.5" fill="${p.hot}" filter="url(#spark)">
      <animateMotion dur="6s" repeatCount="indefinite" path="M ${orbit.rx} 0 A ${orbit.rx} ${orbit.ry} 0 1 1 ${-orbit.rx} 0 A ${orbit.rx} ${orbit.ry} 0 1 1 ${orbit.rx} 0"/>
      <animate attributeName="opacity" dur="6s" repeatCount="indefinite" values="1;1;0.18;0.18;1" keyTimes="0;0.47;0.53;0.97;1"/>
    </circle>
  </g>
  ${[[-3, 3.4, 0], [4, 4.2, 0.9], [-6, 3.8, 1.8], [2, 4.6, 2.6], [6, 3.6, 3.3]].map(([dx, d, b]) => `
  <circle cx="0" cy="${n1(project(0, spineY(0), 0)[1])}" r="0.7" fill="${p.hud}">
    <animate attributeName="cy" dur="${d}s" begin="${b}s" repeatCount="indefinite" values="${n1(project(0, spineY(0), 0)[1])};${n1(project(0, spineY(0), 0)[1] - 16)}"/>
    <animate attributeName="cx" dur="${d}s" begin="${b}s" repeatCount="indefinite" values="0;${dx}"/>
    <animate attributeName="opacity" dur="${d}s" begin="${b}s" repeatCount="indefinite" values="0;0.9;0"/>
  </circle>`).join('')}`;
  return { behind, front };
}

/**
 * finish: 'dark' | 'light'. full: the emblem with emitter, orbit and reticle;
 * otherwise just the mark (ribbon, spine and scan), for headers and small sizes.
 */
export function seedAnimated({ finish = 'dark', full = true, rungs = 46, frames = 60, still = false } = {}) {
  const p = PALETTES[finish];
  const dark = finish === 'dark';
  if (still) frames = 1; // one keyframe: every attribute is written as a constant
  const view = full ? '-60 -60 120 120' : '-33 -47 66 94';
  const h = full ? hud(p) : { behind: '', front: '' };
  const body = `<g${dark ? ' filter="url(#bloom)"' : ''}>${ribbon({ p, n: rungs, frames, w: full ? 0.62 : 0.8 })}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${view}" role="img" aria-label="Progen Labs">
<title>Progen Labs</title>
<defs>
  <filter id="bloom" x="-60%" y="-60%" width="220%" height="220%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="${dark ? 2.6 : 0}" result="wide"/>
    <feGaussianBlur in="SourceGraphic" stdDeviation="${dark ? 0.7 : 0}" result="tight"/>
    <feMerge><feMergeNode in="wide"/><feMergeNode in="tight"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="spark" x="-400%" y="-400%" width="900%" height="900%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="1.6" result="glow"/>
    <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <linearGradient id="spine" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.hud}" stop-opacity="0.1"/><stop offset="0.5" stop-color="${p.hud}" stop-opacity="0.55"/><stop offset="1" stop-color="${p.hud}" stop-opacity="0.15"/></linearGradient>
  <linearGradient id="cone" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${p.hud}" stop-opacity="${dark ? 0.22 : 0.1}"/><stop offset="1" stop-color="${p.hud}" stop-opacity="0"/></linearGradient>
</defs>
${h.behind}
${spine(p, dark, still)}
${body}
${h.front}
</svg>
`;
}

/**
 * The favicon: the mark at rest, its rungs merged into solid facets so it
 * stays crisp at 16 px, in mid-tone colours that read on light and dark tab bars.
 */
export function favicon() {
  const front = ['#22d3ee', '#3b82f6', '#4f46e5'], back = ['#a78bfa', '#7c3aed'];
  const F = frame(0, 22, { ...PALETTES.light, front, back, hot: '#22d3ee' });
  let body = '';
  for (let i = 0; i < F.length - 1; i++) {
    const [r0, r1] = [F[i], F[i + 1]];
    const s = i / (F.length - 1), face = Math.cos(twist(s));
    const colour = toHex(face >= 0 ? ramp(front, s) : ramp(back, s));
    const pts = [r0.a, r0.b, r1.b, r1.a].map(q => `${n1(q[0])} ${n1(q[1])}`).join(' L');
    body += `<path d="M${pts} Z" fill="${colour}" stroke="${colour}" stroke-width="0.6" stroke-linejoin="round"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-44 -44 88 88"><title>Progen Labs</title>${body}</svg>\n`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  fs.mkdirSync(OUT, { recursive: true });
  const files = {
    'progen-seed-emblem.svg': seedAnimated({ finish: 'dark', full: true }),
    'progen-seed-emblem-light.svg': seedAnimated({ finish: 'light', full: true }),
    'progen-seed-mark.svg': seedAnimated({ finish: 'dark', full: false, rungs: 34, frames: 48 }),
    'progen-seed-mark-light.svg': seedAnimated({ finish: 'light', full: false, rungs: 34, frames: 48 }),
    'progen-seed-mark-still.svg': seedAnimated({ finish: 'dark', full: false, rungs: 34, still: true }),
    'progen-seed-mark-light-still.svg': seedAnimated({ finish: 'light', full: false, rungs: 34, still: true }),
    'favicon.svg': favicon(),
  };
  for (const [name, svg] of Object.entries(files)) {
    fs.writeFileSync(path.join(OUT, name), svg);
    console.log(name, `${(svg.length / 1024).toFixed(0)} KB`);
  }
  if (process.argv.includes('--png')) await renderPngs();
}

// The bitmaps, rendered by Chrome from the SVGs above at a fixed moment.
async function renderPngs() {
  const { default: puppeteer } = await import('puppeteer-core').catch(() => {
    throw new Error('--png needs puppeteer-core: npm i --no-save puppeteer-core');
  });
  const candidates = [
    process.env.CHROME,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  ].filter(Boolean);
  const executablePath = candidates.find(c => fs.existsSync(c));
  if (!executablePath) throw new Error('no Chrome found: set CHROME to its path');
  const svg = f => fs.readFileSync(path.join(OUT, f), 'utf8');
  const ground = 'radial-gradient(120% 100% at 50% 20%, #10204a 0%, #060b1d 55%, #03050d 100%)';
  const box = (size, bg, inner) => `<div style="width:${size}px;height:${size}px;background:${bg};display:grid;place-items:center">${inner}</div>`;
  const sized = (f, w, h) => svg(f).replace('<svg ', `<svg width="${w}" height="${h}" `);
  const jobs = [
    ['progen-labs-avatar.png', 800, box(800, ground, sized('progen-seed-emblem.svg', 720, 720))], // GitHub org, LinkedIn page
    ['apple-touch-icon.png', 180, box(180, ground, sized('progen-seed-mark-still.svg', 112, 160))],
    ['progen-seed-mark.png', 188, box(188, 'transparent', sized('progen-seed-mark-light-still.svg', 132, 188))], // where SVG is not allowed (VS Code Marketplace)
    ['favicon-32.png', 32, box(32, 'transparent', sized('favicon.svg', 32, 32))],
  ];
  const browser = await puppeteer.launch({ executablePath, headless: true });
  try {
    for (const [name, size, html] of jobs) {
      const page = await browser.newPage();
      await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
      await page.setContent(`<!doctype html><body style="margin:0;background:transparent">${html}</body>`);
      await page.evaluate(() => document.querySelectorAll('svg').forEach(s => { s.pauseAnimations?.(); s.setCurrentTime?.(0.4); }));
      await page.screenshot({ path: path.join(OUT, name), omitBackground: true });
      await page.close();
      console.log(name);
    }
  } finally {
    await browser.close();
  }
}

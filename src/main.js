// ─────────────────────────────────────────────────────────────────────────────
//  ENTRY — load config → loader → build 3D world + DOM → one shared RAF loop
//  that maps scroll position to camera shots along the riverfront.
// ─────────────────────────────────────────────────────────────────────────────
import './style.css';
import * as THREE from 'three';
import { DEFAULT_CONFIG, cloneConfig } from './config.js';
import { World } from './scene.js';
import { renderUI, renderLoader, wireUI, applyTheme } from './ui.js';
import { createEditor, loadSaved } from './editor.js';

// Two modes from one build:
//   live   (/)        — the public site: published content only, no editor
//   editor (/editor)  — the owner's page: published content + local draft + editor panel + Publish
const EDITOR = /^\/editor\/?$/.test(location.pathname) || new URLSearchParams(location.search).has('editor');

// edits are merged over the defaults, so new default keys still appear
function merge(base, over) {
  if (Array.isArray(base) || typeof base !== 'object' || base === null) return over ?? base;
  const out = { ...base };
  for (const key in over) out[key] = key in base ? merge(base[key], over[key]) : over[key];
  return out;
}

// published content lives in /config.json (written by the editor's Publish button)
async function loadPublished() {
  if (location.protocol === 'file:') return null;
  try { const r = await fetch('/config.json', { cache: 'no-store' }); return r.ok ? await r.json() : null; } catch { return null; }
}

let cfg;
(async () => {
  const published = await loadPublished();
  cfg = merge(cloneConfig(DEFAULT_CONFIG), published || {});
  if (EDITOR) cfg = merge(cfg, loadSaved() || {});
  else document.getElementById('edit-toggle')?.remove();
  applyTheme(cfg.theme);
  renderLoader(cfg);
  // let the loader paint before the heavy scene build
  requestAnimationFrame(() => setTimeout(boot, 30));
})();

function boot() {
  const world = new World(document.getElementById('world'), document.getElementById('labels'), cfg);
  let ui = null;
  let editor = null;
  const mountUI = () => { renderUI(cfg); ui = wireUI(cfg, world); editor?.reapplyTextEdit(); };
  mountUI();
  if (EDITOR) {
    document.body.classList.add('editor-page');
    editor = createEditor(cfg, { world, rerenderUI: mountUI, applyTheme });
    setTimeout(() => editor.open(), 3200);   // open the panel once the arrival has played
  }

  // loader counter → then "the awakening"
  const n = document.getElementById('ld-n'), t0 = performance.now();
  const count = () => {
    const p = Math.min(1, (performance.now() - t0) / 2400);
    n.textContent = String(Math.round(p * 100)).padStart(3, '0');
    if (p < 1) requestAnimationFrame(count);
    else setTimeout(() => { document.getElementById('loader').classList.add('done'); world.replayAwakening(); }, 250);
  };
  count();
  world.awakenStart = Infinity; // hold everything flat until the loader finishes
  // pause rendering while the tab is hidden
  document.addEventListener('visibilitychange', () => { if (!document.hidden) world.clock.getDelta(); });

  // ── scroll → camera ──────────────────────────────────────────────────────
  const P = new THREE.Vector3(), T = new THREE.Vector3(), a = new THREE.Vector3(), b = new THREE.Vector3();
  const ease = x => x * x * (3 - 2 * x);
  function shotForScroll() {
    const keys = cfg.scene.camera.keys;
    const ys = keys.map(kk => {
      const el = document.getElementById(kk.anchor);
      return el ? el.getBoundingClientRect().top + scrollY - innerHeight * 0.5 : 0;
    });
    ys[0] = 0;
    const s = scrollY;
    let i = 0;
    while (i < keys.length - 2 && s >= ys[i + 1]) i++;
    const span = Math.max(1, ys[i + 1] - ys[i]);
    // hold each shot for a while, then glide to the next
    const t = ease(THREE.MathUtils.smoothstep((s - ys[i]) / span, 0.2, 0.95));
    const k0 = keys[i], k1 = keys[i + 1];
    P.copy(a.fromArray(k0.pos)).lerp(b.fromArray(k1.pos), t);
    T.copy(a.fromArray(k0.target)).lerp(b.fromArray(k1.target), t);
    world.setShot(P, T, THREE.MathUtils.lerp(k0.dim, k1.dim, t));
    // the floating Proof screens only exist during their own chapter
    const on = kk => (cfg.scene.holoAnchors || []).includes(kk.anchor) ? 1 : 0;
    world.holoGate = on(k0) * (1 - t) + on(k1) * t;
  }

  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (document.hidden) { requestAnimationFrame(loop); return; }
    if (!world.exploring) shotForScroll();
    world.tick();
    ui?.frame(now / 1000, dt);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  window.__godavari = { world, cfg }; // handy in devtools
}

// ─────────────────────────────────────────────────────────────────────────────
//  EDITOR — a lil-gui panel that edits the live config.
//   • Text: toggle "Edit text on page" and click any outlined text to type.
//   • Theme / water / ghats / bridges / zones / billboards / camera shots.
//   • Explore mode + "Capture current view" re-frames any scroll shot.
//   • Changes are a local draft (localStorage) until you press Publish, which
//     commits /config.json to GitHub; Vercel then redeploys the live site.
// ─────────────────────────────────────────────────────────────────────────────
import GUI from 'lil-gui';
import { setPath } from './config.js';

export const STORE_KEY = 'godavari-command-draft-v1';
const PUB_KEY = 'godavari-command-publish-v1';
export function loadSaved() {
  try { const s = localStorage.getItem(STORE_KEY); return s ? JSON.parse(s) : null; } catch { return null; }
}

export function createEditor(cfg, { world, rerenderUI, applyTheme }) {
  let gui = null;
  const save = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(cfg)); } catch { /* storage may be blocked */ } };
  let rebuildT;
  const rebuild = () => { clearTimeout(rebuildT); rebuildT = setTimeout(() => { world.rebuild(); save(); }, 150); };

  // ── on-page text editing ──────────────────────────────────────────────────
  const state = { textEdit: false, ghat: 0, building: 0, bridge: 0, zone: 0, billboard: 0, holo: 0, shot: 0 };
  function setTextEdit(on) {
    document.body.classList.toggle('text-edit', on);
    document.querySelectorAll('[data-k]').forEach(el => { el.contentEditable = on ? 'plaintext-only' : 'false'; });
  }
  document.addEventListener('input', e => {
    const el = e.target.closest?.('[data-k]');
    if (!el || !state.textEdit) return;
    setPath(cfg, el.dataset.k, el.innerText);
    if (el.classList.contains('glitch')) el.dataset.text = el.innerText;
    save();
  });
  document.addEventListener('click', e => { if (state.textEdit && e.target.closest('[data-k]')) e.preventDefault(); }, true);

  // a "pick one, then edit its fields" folder for any list in the scene config
  function listFolder(title, list, stateKey, labelOf, fields, makeNew) {
    const f = gui.addFolder(title); let ctl = [];
    const opts = () => Object.fromEntries(list.map((x, i) => [`${i + 1}. ${labelOf(x)}`, i]));
    const sel = f.add(state, stateKey, opts()).name('select');
    const show = () => {
      ctl.forEach(c => c.destroy()); ctl = [];
      const x = list[state[stateKey]]; if (!x) return;
      fields.forEach(([key, a, z, step]) => {
        if (!(key in x)) return;
        let c;
        if (typeof x[key] === 'boolean') c = f.add(x, key).onChange(rebuild);
        else if (typeof x[key] === 'string' && x[key].startsWith('#')) c = f.addColor(x, key).onFinishChange(rebuild);
        else if (typeof x[key] === 'string') c = f.add(x, key).onFinishChange(() => { sel.options(opts()).setValue(state[stateKey]); rebuild(); });
        else if (Array.isArray(x[key])) { x[key].forEach((_, ax) => ctl.push(f.add(x[key], String(ax), a, z, step || 1).name(`${key}.${'xz'[ax]}`).onChange(rebuild))); return; }
        else c = f.add(x, key, a, z, step || 1).onChange(rebuild);
        ctl.push(c);
      });
    };
    sel.onChange(show);
    if (makeNew) f.add({ add() { list.push(makeNew()); state[stateKey] = list.length - 1; sel.options(opts()).setValue(state[stateKey]); rebuild(); } }, 'add').name('＋ add');
    if (makeNew) f.add({ del() { list.splice(state[stateKey], 1); state[stateKey] = 0; sel.options(opts()).setValue(0); rebuild(); } }, 'del').name('－ delete selected');
    show(); f.close();
  }

  function open() {
    if (gui) return;
    document.body.classList.add('editing');
    gui = new GUI({ title: 'GODAVARI · editor  (E to close)' });
    gui.add(state, 'textEdit').name('✎ Edit text on page').onChange(setTextEdit);

    const th = gui.addFolder('Theme colours');
    Object.keys(cfg.theme).forEach(key => th.addColor(cfg.theme, key).onChange(() => { applyTheme(cfg.theme); save(); }).onFinishChange(rebuild));
    th.add(cfg, 'countdownTo').name('countdown to (ISO)').onFinishChange(save);
    th.close();

    const S = cfg.scene;
    const sc = gui.addFolder('Scene · look');
    sc.add(S, 'exposure', 0.3, 2.5, 0.01).onChange(v => { world.renderer.toneMappingExposure = v; save(); });
    sc.add(S.bloom, 'strength', 0, 3, 0.01).name('bloom strength').onChange(v => { world.bloom.strength = v; save(); });
    sc.add(S.bloom, 'radius', 0, 1.5, 0.01).name('bloom radius').onChange(v => { world.bloom.radius = v; save(); });
    sc.add(S.bloom, 'threshold', 0, 1, 0.01).name('bloom threshold').onChange(v => { world.bloom.threshold = v; save(); });
    sc.add(S, 'grain', 0, 0.3, 0.005).onChange(v => { world.finish.uniforms.uGrain.value = v; save(); });
    sc.add(S, 'aberration', 0, 0.01, 0.0001).onChange(v => { world.finish.uniforms.uAberr.value = v; save(); });
    sc.add(S, 'fog', 0, 0.005, 0.0001).onFinishChange(rebuild);
    sc.addColor(S.sky, 'top').name('sky top').onFinishChange(rebuild);
    sc.addColor(S.sky, 'horizon').name('sky horizon').onFinishChange(rebuild);
    sc.addColor(S.sky, 'glow').name('horizon glow').onFinishChange(rebuild);
    sc.addColor(S, 'ground').onFinishChange(rebuild);
    sc.addColor(S, 'grid').onFinishChange(rebuild);
    sc.add(S, 'windowLit', 0, 1, 0.01).name('lit windows').onFinishChange(rebuild);
    sc.add(S, 'cityCount', 0, 8000, 50).name('city blocks (east)').onFinishChange(rebuild);
    sc.add(S, 'westCount', 0, 3000, 50).name('Kovvur blocks (west)').onFinishChange(rebuild);
    sc.add(S, 'treeCount', 0, 1500, 10).onFinishChange(rebuild);
    sc.add(S, 'starCount', 0, 5000, 50).onFinishChange(rebuild);
    sc.close();

    const wf = gui.addFolder('River · water & diyas');
    wf.addColor(S.water, 'deep').onFinishChange(rebuild);
    wf.addColor(S.water, 'shallow').onFinishChange(rebuild);
    wf.addColor(S.water, 'glint').onFinishChange(rebuild);
    wf.add(S.water, 'grid', 0, 1, 0.01).name('grid on water').onFinishChange(rebuild);
    wf.add(S.water, 'speed', 0, 4, 0.05).name('current speed').onFinishChange(rebuild);
    wf.add(S.diyas, 'count', 0, 1500, 10).name('floating diyas').onFinishChange(rebuild);
    wf.add(S.diyas, 'drift', 0, 10, 0.1).name('diya drift').onFinishChange(rebuild);
    wf.addColor(S.diyas, 'color').name('diya colour').onFinishChange(rebuild);
    wf.close();

    const fx = gui.addFolder('Scene · beam, sigil, arcs');
    fx.add(S.beam, 'on').name('beam on').onChange(rebuild);
    fx.add(S.beam, 'height', 100, 2000).name('beam height').onFinishChange(rebuild);
    fx.add(S.beam, 'width', 0.3, 8).name('beam width').onFinishChange(rebuild);
    fx.addColor(S.beam, 'color').name('beam colour').onFinishChange(rebuild);
    fx.add(S.sigil, 'on').name('sigil on').onChange(rebuild);
    fx.add(S.sigil, 'y', 10, 200).name('sigil height').onFinishChange(rebuild);
    fx.add(S.sigil, 'scale', 0.2, 4).name('sigil scale').onFinishChange(rebuild);
    fx.add(S.sigil, 'spin', 0, 2).name('sigil spin').onFinishChange(rebuild);
    fx.addColor(S.sigil, 'color').name('sigil colour').onFinishChange(rebuild);
    fx.add(S.arcs, 'count', 0, 60, 1).name('light arcs').onFinishChange(rebuild);
    fx.add(S.arcs, 'speed', 0, 2).name('arc speed').onFinishChange(rebuild);
    fx.add(S.focus, '0', -400, 400).name('lit ghat x').onFinishChange(rebuild);
    fx.add(S.focus, '1', -400, 1200).name('lit ghat z').onFinishChange(rebuild);
    fx.close();

    listFolder('Ghats', S.ghats, 'ghat', g => g.name, [['name'], ['sub'], ['label'], ['x', -400, 600], ['z', -1000, 1500], ['len', 10, 200], ['depth', 6, 60], ['steps', 2, 12]],
      () => ({ name: 'NEW GHAT', sub: '', x: 0, z: 200, len: 40, depth: 16, steps: 5, label: true }));
    listFolder('Bridges', S.bridges, 'bridge', b => b.name, [['name'], ['type'], ['from', -1200, 1200], ['to', -1200, 1200], ['spans', 2, 60], ['h', 2, 40], ['w', 2, 20], ['color'], ['train']]);
    listFolder('Crowd zones (PS-01)', S.zones, 'zone', z => `${z.id} · ${(z.count / z.area).toFixed(2)}/m²`, [['id'], ['x', -100, 200], ['z', -200, 200], ['area', 50, 2000], ['count', 0, 4000]]);
    listFolder('Structures', S.buildings, 'building', b => b.name, [['name'], ['label'], ['restricted'], ['x', -400, 800], ['z', -600, 1400], ['w', 2, 120], ['d', 2, 120], ['h', 2, 80], ['rot', -180, 180]],
      () => ({ name: 'New Block', label: true, x: 60, z: 100, w: 12, d: 8, h: 8, rot: 0 }));
    listFolder('Billboards', S.billboards, 'billboard', b => `${b.tier} · ${b.text}`, [['text'], ['heading'], ['sub'], ['x', -900, 900], ['z', -900, 1400], ['y', 5, 300], ['w', 5, 300], ['rot', -180, 180]],
      () => ({ text: 'NEW BOARD', x: 60, z: 0, y: 30, w: 26, rot: 0, tier: 'partner' }));
    listFolder('Proof · floating screens', S.holos, 'holo', h => h.caption.slice(0, 28), [['caption'], ['img'], ['color'], ['x', -900, 400], ['y', 20, 300], ['z', -400, 1400], ['w', 10, 200]]);

    // camera shots per section
    const cf = gui.addFolder('Camera · scroll shots'); let cCtl = [];
    const keys = S.camera.keys;
    cf.add(S.camera, 'fov', 15, 90, 1).onChange(v => { world.camera.fov = v; world.camera.updateProjectionMatrix(); save(); });
    cf.add(S.camera, 'parallax', 0, 30, 0.5).name('mouse parallax').onFinishChange(save);
    const cSel = cf.add(state, 'shot', Object.fromEntries(keys.map((kk, i) => [kk.anchor, i]))).name('section');
    const showC = () => {
      cCtl.forEach(c => c.destroy()); cCtl = [];
      const kk = keys[state.shot];
      ['pos', 'target'].forEach(p => [0, 1, 2].forEach(ax => cCtl.push(cf.add(kk[p], String(ax), -2000, 2000, 1).name(`${p}.${'xyz'[ax]}`).onChange(save))));
      cCtl.push(cf.add(kk, 'dim', 0, 1, 0.01).name('dim world').onChange(save));
      cCtl.push(cf.add({ go() { document.getElementById(kk.anchor)?.scrollIntoView({ behavior: 'smooth' }); } }, 'go').name('↳ scroll to this section'));
      cCtl.push(cf.add({ cap() {
        if (!world.exploring) { alert('Click "Explore the riverfront" in the hero first, frame the shot with the mouse, then capture.'); return; }
        kk.pos = world.camera.position.toArray().map(Math.round); kk.target = world.controls.target.toArray().map(Math.round);
        save(); showC();
      } }, 'cap').name('📷 capture current explore view'));
    };
    cSel.onChange(showC); showC(); cf.close();

    // ── publish to the live site ────────────────────────────────────────────
    const pub = (() => { try { return JSON.parse(localStorage.getItem(PUB_KEY)) || {}; } catch { return {}; } })();
    const P = { token: pub.token || '', repo: pub.repo || 'dhruvv2112-coder/godavari_2027', branch: pub.branch || 'main', path: pub.path || 'dist-standalone/config.json', status: 'draft — not published' };
    const savePub = () => { try { localStorage.setItem(PUB_KEY, JSON.stringify({ token: P.token, repo: P.repo, branch: P.branch, path: P.path })); } catch {} };
    const pf = gui.addFolder('Publish to live site');
    const tokCtl = pf.add(P, 'token').name('GitHub token').onFinishChange(savePub);
    if (tokCtl.$input) tokCtl.$input.type = 'password';
    pf.add(P, 'repo').name('repository').onFinishChange(savePub);
    pf.add(P, 'branch').onFinishChange(savePub);
    pf.add(P, 'path').name('file').onFinishChange(savePub);
    const statusCtl = pf.add(P, 'status').name('status').disable();
    const setStatus = t => { P.status = t; statusCtl.updateDisplay(); };
    pf.add({ async publish() {
      if (!P.token) { alert('Paste a GitHub fine-grained token with Contents: read & write on ' + P.repo + ' first. It stays in this browser only.'); return; }
      if (!confirm('Publish these changes to the live site? Vercel redeploys in about a minute.')) return;
      setStatus('publishing…');
      const api = `https://api.github.com/repos/${P.repo}/contents/${P.path}`;
      const H = { Authorization: `Bearer ${P.token}`, Accept: 'application/vnd.github+json' };
      try {
        const cur = await fetch(`${api}?ref=${encodeURIComponent(P.branch)}`, { headers: H });
        const sha = cur.ok ? (await cur.json()).sha : undefined;
        const bytes = new TextEncoder().encode(JSON.stringify(cfg, null, 2) + '\n');
        let bin = ''; bytes.forEach(b => (bin += String.fromCharCode(b)));
        const r = await fetch(api, { method: 'PUT', headers: H, body: JSON.stringify({ message: 'Update site content from the editor', content: btoa(bin), branch: P.branch, sha }) });
        if (!r.ok) throw new Error(`${r.status} ${(await r.json().catch(() => ({}))).message || ''}`);
        localStorage.removeItem(STORE_KEY);
        setStatus('published ✓ live in ~1 min');
      } catch (err) { setStatus('failed: ' + err.message); }
    } }, 'publish').name('🚀 Publish to live site');
    pf.add({ open() { window.open('/', '_blank'); } }, 'open').name('↗ Open the live site');

    const df = gui.addFolder('Draft');
    df.add({ exp() {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([JSON.stringify(cfg, null, 2)], { type: 'application/json' }));
      a.download = 'config.json'; a.click();
    } }, 'exp').name('⬇ Download config.json');
    df.add({ imp() {
      const i = document.createElement('input'); i.type = 'file'; i.accept = '.json';
      i.onchange = async () => { const j = JSON.parse(await i.files[0].text()); localStorage.setItem(STORE_KEY, JSON.stringify(j)); location.reload(); };
      i.click();
    } }, 'imp').name('⬆ Load a config.json as draft');
    df.add({ re() { rerenderUI(); } }, 're').name('↻ Re-render page text');
    df.add({ reset() { if (confirm('Discard your unpublished draft and reload the published content?')) { localStorage.removeItem(STORE_KEY); location.reload(); } } }, 'reset').name('⟲ Discard draft');
  }

  function close() {
    if (!gui) return;
    gui.destroy(); gui = null;
    state.textEdit = false; setTextEdit(false);
    document.body.classList.remove('editing');
  }

  const toggle = () => (gui ? close() : open());
  document.getElementById('edit-toggle').onclick = toggle;
  addEventListener('keydown', e => {
    if (e.key.toLowerCase() === 'e' && !e.target.closest?.('[contenteditable="plaintext-only"],input,textarea')) toggle();
  });
  return { open, close, toggle, reapplyTextEdit: () => setTextEdit(state.textEdit) };
}

// ─────────────────────────────────────────────────────────────────────────────
//  UI — renders every DOM section from the config and wires the interactions.
//  Any element with data-k="path.to.value" is live-editable in text-edit mode.
// ─────────────────────────────────────────────────────────────────────────────
import { getPath } from './config.js';
import { MEDIA } from './media.js';

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let CFG;
// k('hero.title','h1','cls') → <h1 class="cls" data-k="hero.title">GODAVARI</h1>
const k = (path, tag = 'span', cls = '', extra = '') =>
  `<${tag} class="${cls}" data-k="${path}" ${extra}>${esc(getPath(CFG, path))}</${tag}>`;
const ext = href => (/^https?:/.test(href) ? 'target="_blank" rel="noopener"' : '');

// GiVa Aerotech logos (src/media.js): the wing mark for the nav, the full lockup for the footer
export const MARK = `<img class="mark" src="${MEDIA['giva-mark']}" alt="GiVa" width="40" height="26">`;
const LOCKUP = `<img class="lockup" src="${MEDIA['giva-lockup']}" alt="GiVa Aerotech — AI · Robotics · Unmanned System">`;

const eyebrow = (sec, num = true) => `<div class="eyebrow">
  ${num ? k(`${sec}.num`, 'span', 'num') : `<span class="num">◈</span>`}<span class="line"></span>${k(`${sec}.label`, 'span', 'mono mute')}</div>`;
const h2 = path => `<h2 class="h2 wide glitch" data-text="${esc(getPath(CFG, path))}" data-k="${path}">${esc(getPath(CFG, path))}</h2>`;
const countdown = () => `<div class="countdown" data-countdown><span><b>00</b><small>d</small></span><span><b>00</b><small>h</small></span><span><b>00</b><small>m</small></span><span><b>00</b><small>s</small></span></div>`;
const slideOf = s => (typeof s === 'string' ? { cap: s, img: '' } : s);

// ── templates ────────────────────────────────────────────────────────────────
function navHTML(c) {
  return `<a href="#top" class="nav__mark">${MARK}${k('nav.brand', 'b')}${k('nav.year')}</a>
  <ul>${c.nav.links.map((l, i) => `<li><a href="${l.href}" data-k="nav.links.${i}.label">${esc(l.label)}</a></li>`).join('')}
    <li class="keep"><a class="cta" href="${c.nav.cta.href}" ${ext(c.nav.cta.href)} data-k="nav.cta.label">${esc(c.nav.cta.label)}</a></li>
    <li class="keep"><button class="sound" id="sound"><i><b></b><b></b><b></b><b></b></i><span>SOUND OFF</span></button></li></ul>`;
}

// loader: Andhra Pradesh as a glowing cyan silhouette, the Godavari across it, Rajamahendravaram pinned
const decodeOutline = enc => { let x = 0, y = 0; return enc.trim().split(/\s+/).map(t => { const [a, b] = t.split(',').map(Number); x += a; y += b; return [x / 1000, y / 1000]; }); };
function loaderHTML(c) {
  const L = c.loader, k = Math.cos((16 * Math.PI) / 180);
  const pts = Array.isArray(L.outline) ? L.outline : decodeOutline(L.outline);
  const xs = pts.map(p => p[0] * k), ys = pts.map(p => -p[1]);
  const minX = Math.min(...xs), minY = Math.min(...ys), w = Math.max(...xs) - minX, h = Math.max(...ys) - minY;
  const sc = 1000 / Math.max(w, h);
  const P = ([lon, lat]) => [((lon * k - minX) * sc).toFixed(1), ((-lat - minY) * sc).toFixed(1)];
  const [px, py] = P(L.pin);
  return `<div class="ld">
    <svg class="ap" viewBox="-12 -12 ${(w * sc + 24).toFixed(0)} ${(h * sc + 24).toFixed(0)}" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="ld-glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <linearGradient id="ld-fill" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6bffd2"/><stop offset=".55" stop-color="#48dcff"/><stop offset="1" stop-color="#1d8fbf"/></linearGradient>
      </defs>
      <polygon class="sil" filter="url(#ld-glow)" points="${pts.map(p => P(p).join(',')).join(' ')}"/>
      <polygon class="ol" pathLength="1" points="${pts.map(p => P(p).join(',')).join(' ')}"/>
      <polyline class="rv-ln" pathLength="1" points="${L.river.map(p => P(p).join(',')).join(' ')}"/>
      <circle class="pin-ring" cx="${px}" cy="${py}" r="22"/><circle class="pin" cx="${px}" cy="${py}" r="9"/>
    </svg>
    <div class="mono mute">${esc(L.coords)}</div><div class="mono"><span>${esc(L.word)}</span> <span id="ld-n">000</span></div></div>`;
}

function mainHTML(c) {
  const H = c.hero, A = c.about, TH = c.theme_section, E = c.events, S = c.schedule, L = c.legacy, P = c.partners, TM = c.team, F = c.faq, FT = c.footer;
  const nStations = E.disciplines.reduce((a, d) => a + d.events.length, 0);
  const slides = L.video.slides.map(slideOf);
  return `
<section id="top">
  <div class="hero__meta mono">${H.meta.map((m, i) => `${i ? '<span>—</span>' : ''}<span data-k="hero.meta.${i}">${esc(m)}</span>`).join('')}</div>
  <div class="hero__title">
    <h1 class="hero__esya" style="--len:${[...H.title].length}" aria-label="${esc(H.title)}">${[...H.title].map((ch, i) => `<span class="ch" style="transition-delay:${0.2 + i * 0.07}s">${esc(ch)}</span>`).join('')}${k('hero.year', 'span', 'hero__yr')}</h1>
    ${k('hero.subtitle', 'div', 'hero__sub rv')}
    ${k('hero.lede', 'p', 'hero__lede rv')}
  </div>
  <div class="hero__bar rv">
    <div>${k('hero.countdownLabel', 'div', 'mono mute')}${countdown()}</div>
    <div class="fig">${k('hero.figLabel', 'div', 'mono')}${k('hero.fig', 'p')}<button class="link-rune" id="replay" data-k="hero.replay">${esc(H.replay)}</button></div>
    <button class="pill" id="explore"><span class="dot"></span><span data-k="hero.explore">${esc(H.explore)}</span></button>
    <div class="scrollcue mono">${k('hero.scroll')}</div>
  </div>
</section>

<section id="about"><div class="col">
  ${eyebrow('about')}${h2('about.title')}${k('about.lede', 'p', 'lede rv')}${k('about.body', 'p', 'body rv')}
  <div class="stats rv">${A.stats.map((s, i) => `<div>${k(`about.stats.${i}.n`, 'b')}${k(`about.stats.${i}.l`, 'span', 'mono')}</div>`).join('')}</div>
</div></section>

<section id="theme"><div class="col">
  ${eyebrow('theme_section')}${h2('theme_section.title')}
  <p class="dict rv">${k('theme_section.word', 'span', 'serif')}${k('theme_section.ipa', 'span', 'mono')}${k('theme_section.pos', 'em')} — ${k('theme_section.def')}</p>
</div></section>
${TH.verses.map((v, i) => `<section class="verse" id="verse-${i + 1}"><div class="col">
  ${k(`theme_section.verses.${i}.n`, 'div', 'vn')}${h2(`theme_section.verses.${i}.title`)}${k(`theme_section.verses.${i}.text`, 'p', 'lede rv')}
</div></section>`).join('')}
<section class="quote"><div class="rv">${k('theme_section.quote', 'blockquote')}${k('theme_section.quoteBy', 'div', 'mono mute')}</div></section>

<section id="events" style="height:${Math.max(420, nStations * 30 + 100)}vh"><div class="metro">
  <div class="metro__head">${eyebrow('events')}${h2('events.title')}${k('events.lede', 'p')}</div>
  <div id="metro-map"></div>
  <aside class="board" id="board"></aside>
  <button class="metro__list mono" id="list-open">${esc(E.listToggle)} ↓</button>
</div></section>
<div class="list-modal" id="list-modal"><button class="mono" id="list-close">✕ CLOSE</button>${E.disciplines.map(d => `<h4 class="mono" style="color:${d.color}">${esc(d.name)}</h4><ul>${d.events.map(ev => `<li><b>${esc(ev.name)}</b><span class="mute">${esc(ev.blurb)}</span><a class="link-rune" href="${ev.link}" ${ext(ev.link)}>${esc(E.details)}</a></li>`).join('')}</ul>`).join('')}</div>

<section id="schedule">
  <div class="eyebrow"><span class="num">◷</span><span class="line"></span>${k('schedule.label', 'span', 'mono mute')}</div>${h2('schedule.title')}
  <div class="tabs">${S.days.map((d, i) => `<button data-day="${i}" class="${i ? '' : 'on'}"><b data-k="schedule.days.${i}.name">${esc(d.name)}</b><span class="mono" data-k="schedule.days.${i}.date">${esc(d.date)}</span></button>`).join('')}</div>
  ${S.days.map((d, i) => `<div class="slots" data-slots="${i}" ${i ? 'hidden' : ''}>${d.items.map((it, j) => `<div class="slot">${k(`schedule.days.${i}.items.${j}.time`, 'span', 'mono')}${k(`schedule.days.${i}.items.${j}.title`, 'span', 'wide')}${k(`schedule.days.${i}.items.${j}.venue`, 'span', 'mono mute')}</div>`).join('')}</div>`).join('')}
</section>

<section id="legacy">
  <div class="col">${eyebrow('legacy')}${h2('legacy.title')}${k('legacy.lede', 'p', 'lede rv')}</div>
  <div id="legacy-mid"><div class="fly mono">${k('legacy.fly')}</div></div>
  <div id="legacy-end"></div>
  <div class="reel"><div class="reel__frame">
    <div class="reel__top mono"><span class="rec"><span data-k="legacy.video.label">${esc(L.video.label)}</span> &nbsp; <span id="tc">00:00:00:00</span></span><button id="reel-pause">PAUSE</button></div>
    ${L.video.src ? `<video id="reel-v" src="${esc(L.video.src)}" muted loop playsinline autoplay></video>` : `<canvas id="reel-c" width="1280" height="656"></canvas>`}
    <div class="reel__bot"><span class="mono" id="reel-n">01 / ${String(slides.length).padStart(2, '0')}</span><span class="serif" id="reel-cap">${esc(slides[0]?.cap)}</span></div>
  </div></div>
  <div class="editions">${k('legacy.editionsLabel', 'div', 'mono mute')}<ol style="grid-template-columns:repeat(${L.editions.length},1fr)">${L.editions.map((e, i) => `<li>${k(`legacy.editions.${i}.y`, 'b')}${k(`legacy.editions.${i}.t`, 'span')}</li>`).join('')}</ol></div>
</section>

<section id="sponsors">
  ${eyebrow('partners', false)}${h2('partners.title')}${k('partners.lede', 'p')}
  ${P.tiers.map((t, i) => `<div class="tier">${k(`partners.tiers.${i}.name`, 'div', 'mono')}<div class="slots-grid" style="--n:${t.items.length}">${t.items.map((it, j) => `<div data-k="partners.tiers.${i}.items.${j}">${esc(it)}</div>`).join('')}</div></div>`).join('')}
  <p style="margin-top:44px"><a class="btn" href="${P.ctaHref}" ${ext(P.ctaHref)} data-k="partners.cta">${esc(P.cta)}</a></p>
</section>

<section id="team"><div class="col">
  ${eyebrow('team')}${h2('team.title')}${k('team.lede', 'p', 'lede rv')}
  <div class="roster rv">${TM.members.map((m, i) => `<div>${k(`team.members.${i}.role`, 'div', 'mono')}${k(`team.members.${i}.name`, 'div', 'serif')}</div>`).join('')}</div>
</div></section>

<section id="faq"><div class="col">
  ${eyebrow('faq')}${h2('faq.title')}
  <div class="faq">${F.items.map((f, i) => `<details id="f-${i}" ${i ? '' : 'open'}><summary data-k="faq.items.${i}.q">${esc(f.q)}</summary>${k(`faq.items.${i}.a`, 'p')}</details>`).join('')}</div>
</div></section>

<footer id="contact">
  <div class="threshold">${eyebrow('footer')}${h2('footer.title')}
    <div class="btns"><a class="btn btn--fill" href="${FT.registerHref}" ${ext(FT.registerHref)} data-k="footer.register">${esc(FT.register)}</a><a class="btn" href="${FT.partnerHref}" ${ext(FT.partnerHref)} data-k="footer.partner">${esc(FT.partner)}</a></div>
    ${k('hero.countdownLabel', 'div', 'mono mute')}${countdown()}
  </div>
  ${contactHTML(FT.contact)}
  <div class="fcols">
    <div>${LOCKUP}<dl class="built"><dt class="mono mute">Built By:</dt>${k('footer.builtBy', 'dd')}<dt class="mono mute">Built For:</dt>${k('footer.builtFor', 'dd')}</dl></div>
    <div>${k('footer.whereLabel', 'div', 'mono mute')}${k('footer.where', 'p')}<a class="link-rune" href="${FT.mapsHref}" target="_blank" rel="noopener" data-k="footer.maps">${esc(FT.maps)}</a></div>
    <div class="sig">${k('footer.signalsLabel', 'div', 'mono mute')}${FT.signals.map((s, i) => `<a class="mono" href="${s.href}" ${ext(s.href)}><b data-k="footer.signals.${i}.k">${esc(s.k)}</b><span data-k="footer.signals.${i}.v">${esc(s.v)}</span></a>`).join('')}</div>
    <div>${k('footer.actsLabel', 'div', 'mono mute')}<div class="acts">${c.nav.links.map(l => `<a href="${l.href}">${esc(l.label)}</a>`).join('')}</div></div>
  </div>
  <div class="fbar mono">${k('footer.copyright')}${k('footer.credit')}<a href="#top" data-k="footer.top">${esc(FT.top)}</a></div>
</footer>`;
}

// company contact card on the hand-off page; blank fields are left out
function contactHTML(C) {
  if (!C) return '';
  const row = (key, label, val, href) => val ? `<div class="cc__row"><span class="mono mute">${esc(label)}</span>${href ? `<a href="${href}" ${ext(href)} data-k="footer.contact.${key}">${esc(val)}</a>` : `<span data-k="footer.contact.${key}">${esc(val)}</span>`}</div>` : '';
  return `<div class="cc">
    <div class="cc__co">${k('footer.contact.label', 'div', 'mono mute')}${k('footer.contact.company', 'h3', 'serif')}<div class="mono cc__mail" data-k="footer.contact.short">${esc(C.short).replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, m => `<a href="mailto:${m}">${m}</a>`)}</div></div>
    <div class="cc__reach">
      ${row('offices', 'OFFICES', C.offices)}
      ${row('address', 'ADDRESS', C.address)}
      ${row('email', 'EMAIL', C.email, C.email && `mailto:${C.email}`)}
      ${row('phone', 'PHONE', C.phone, C.phone && `tel:${C.phone.replace(/[^+\d]/g, '')}`)}
      ${C.website ? `<div class="cc__row"><span class="mono mute">WEB</span><a class="link-rune" href="${C.website.href}" ${ext(C.website.href)} data-k="footer.contact.website.label">${esc(C.website.label)}</a></div>` : ''}
    </div>
    <div class="cc__people">${(C.people || []).map((p, i) => `<div>${k(`footer.contact.people.${i}.role`, 'div', 'mono mute')}${k(`footer.contact.people.${i}.name`, 'div', 'serif')}</div>`).join('')}</div>
  </div>`;
}

// ── metro map: six desks leaving the hub ─────────────────────────────────────
function buildMetro(c) {
  const E = c.events, stations = [];
  const gap = 62, R = 22;
  let svg = `<svg viewBox="-470 -270 800 600"><defs><filter id="metro-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    <g class="grid">${Array.from({ length: 15 }, (_, i) => `<line x1="${-480 + i * 60}" y1="-280" x2="${-480 + i * 60}" y2="340"/><line x1="-480" y1="${-280 + i * 50}" x2="340" y2="${-280 + i * 50}"/>`).join('')}</g>`;
  E.disciplines.forEach((d, di) => {
    const a = (d.dir * Math.PI) / 180, ux = Math.cos(a), uy = -Math.sin(a);
    // lines leave straight, then bend after the second stop (like a real transit diagram)
    const bend = d.events.length > 2 ? (di % 2 ? 0.5 : -0.5) : 0;
    const pts = [[0, 0]];
    d.events.forEach((ev, i) => {
      const prev = pts[pts.length - 1];
      const aa = i >= 2 ? a + bend : a;
      pts.push([prev[0] + Math.cos(aa) * (i ? gap : gap + R), prev[1] - Math.sin(aa) * (i ? gap : gap + R)]);
    });
    svg += `<path class="ln" data-d="${di}" stroke="${d.color}" d="M${pts.map(p => p.join(',')).join('L')}"/>`;
    const last = pts[pts.length - 1];
    const lux = last[0] / Math.hypot(...last), luy = last[1] / Math.hypot(...last);
    const anchor = lux > 0.3 ? 'start' : lux < -0.3 ? 'end' : 'middle';
    // terminals near the right edge get their name tucked under the last station instead
    const tuck = last[0] > 150 && lux > 0.3;
    svg += tuck
      ? `<text class="disc" fill="${d.color}" x="${last[0] + (luy > 0.3 ? 0 : 8)}" y="${last[1] + 26}" text-anchor="${luy > 0.3 ? 'middle' : 'end'}">${esc(d.name)}</text>`
      : `<text class="disc" fill="${d.color}" x="${last[0] + lux * 22}" y="${last[1] + luy * 22 + (Math.abs(luy) > .7 ? (luy > 0 ? 10 : -4) : 4)}" text-anchor="${anchor}">${esc(d.name)}</text>`;
    d.events.forEach((ev, i) => {
      const [x, y] = pts[i + 1];
      const horiz = Math.abs(ux) > .7;
      const lx = horiz ? 0 : (ux >= 0 ? 14 : -14), ly = horiz ? (di % 2 ? 22 : -14) : 4;
      const ta = horiz ? 'middle' : ux >= 0 ? 'start' : 'end';
      stations.push({ d, di, ev, x, y, idx: stations.length });
      svg += `<g class="st" data-s="${stations.length - 1}" style="color:${d.color}"><circle cx="${x}" cy="${y}" r="6" stroke="${d.color}"/><text x="${x + lx}" y="${y + ly}" text-anchor="${ta}">${esc(ev.name)}</text></g>`;
    });
  });
  svg += `<g class="hub"><circle r="${R}"/><text y="${R + 18}" text-anchor="middle">${esc(E.hub)}</text></g><circle class="train" id="train" r="5"/></svg>`;
  document.getElementById('metro-map').innerHTML = svg;
  return stations;
}

function flap(text, n = 12) {
  const s = String(text).toUpperCase().padEnd(n, ' ').slice(0, n);
  return `<div class="flap">${[...s].map(ch => `<span class="flip">${ch === ' ' ? '&nbsp;' : esc(ch)}</span>`).join('')}</div>`;
}
function renderBoard(c, st, total) {
  const ev = st.ev, R = c.events.rows || ['NOW AT', 'LINE', 'PLATFORM', 'DEPARTS'];
  document.getElementById('board').innerHTML = `
    <header><span>${esc(c.events.boardTitle)}</span><span>${esc(c.events.boardLine)}</span></header>
    <div class="row"><span>${esc(R[0])}</span>${flap(ev.name, 16)}</div>
    <div class="row"><span>${esc(R[1])}</span><span style="display:flex;gap:8px;align-items:center"><i style="width:8px;height:8px;border-radius:50%;background:${st.d.color};flex:none"></i>${flap(st.d.name.replace(/^PS-\d+ · /, ''), 13)}</span></div>
    <div class="row"><span>${esc(R[2])}</span>${flap(ev.platform, 16)}</div>
    <div class="row"><span>${esc(R[3])}</span>${flap(ev.departs, 16)}</div>
    <p class="blurb">${esc(ev.blurb)}</p>
    <div class="foot"><span>○ ${esc(ev.status)}</span><a href="${ev.link}" ${ext(ev.link)}>${esc(c.events.details || 'DETAILS →')}</a></div>
    <div class="prog">STATION ${String(st.idx + 1).padStart(2, '0')} / ${total}<div class="bar"><i style="width:${((st.idx + 1) / total) * 100}%"></i></div></div>`;
}

// ── public API ───────────────────────────────────────────────────────────────
export function renderUI(config) {
  CFG = config;
  document.title = config.meta.title;
  document.getElementById('nav').innerHTML = navHTML(config);
  document.getElementById('app').innerHTML = mainHTML(config);
  applyTheme(config.theme);
}

export function renderLoader(config) {
  CFG = config;
  document.getElementById('loader').innerHTML = loaderHTML(config);
}

export function applyTheme(t) {
  const r = document.documentElement.style;
  r.setProperty('--ink', t.ink); r.setProperty('--bone', t.bone); r.setProperty('--bone-2', t.bone2);
  r.setProperty('--mute', t.mute); r.setProperty('--rune', t.rune); r.setProperty('--rune-2', t.rune2);
  r.setProperty('--amber', t.amber); r.setProperty('--violet', t.violet);
}

// Everything interactive. Returns hooks main.js needs every frame.
export function wireUI(config, world) {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];

  // hero letters
  requestAnimationFrame(() => $('.hero__esya')?.classList.add('in'));

  // reveal-on-scroll + glitch trigger
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in', 'on'); io.unobserve(e.target); }
  }), { threshold: 0.2 });
  $$('.rv, .glitch').forEach(el => io.observe(el));

  // nav active state
  const links = $$('.nav ul a[href^="#"]');
  const sio = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main > section[id], footer').forEach(s => sio.observe(s));

  // countdown
  const target = new Date(config.countdownTo).getTime();
  const tickCD = () => {
    let d = Math.max(0, target - Date.now()) / 1000;
    const parts = [Math.floor(d / 86400), Math.floor(d / 3600) % 24, Math.floor(d / 60) % 60, Math.floor(d) % 60];
    $$('[data-countdown]').forEach(cd => cd.querySelectorAll('b').forEach((b, i) => (b.textContent = String(parts[i]).padStart(2, '0'))));
  };
  tickCD(); setInterval(tickCD, 1000);

  // hero buttons
  $('#replay').onclick = () => world.replayAwakening();
  $('#explore').onclick = () => { document.body.classList.add('exploring'); $('#exit-explore').hidden = false; world.setExplore(true); };
  $('#exit-explore').onclick = () => { document.body.classList.remove('exploring'); $('#exit-explore').hidden = true; world.setExplore(false); };

  // schedule tabs
  $$('.tabs button').forEach(b => b.onclick = () => {
    $$('.tabs button').forEach(x => x.classList.toggle('on', x === b));
    $$('[data-slots]').forEach(s => (s.hidden = s.dataset.slots !== b.dataset.day));
  });

  // FAQ: one open at a time
  $$('.faq details').forEach(d => d.addEventListener('toggle', () => {
    if (d.open) $$('.faq details').forEach(o => o !== d && (o.open = false));
  }));

  // metro
  const stations = buildMetro(config);
  let current = -1, manual = null;
  const select = i => {
    if (i === current) return; current = i;
    const st = stations[i];
    renderBoard(config, st, stations.length);
    $$('.metro .st').forEach(g => g.classList.toggle('on', +g.dataset.s === i));
    $$('.metro .ln').forEach(l => l.classList.toggle('on', +l.dataset.d === st.di));
    const tr = $('#train'); tr.setAttribute('cx', st.x); tr.setAttribute('cy', st.y);
  };
  $$('.metro .st').forEach(g => g.onclick = () => { manual = +g.dataset.s; select(manual); });
  select(0);
  $('#list-open').onclick = () => $('#list-modal').classList.add('open');
  $('#list-close').onclick = () => $('#list-modal').classList.remove('open');

  // demo reel: slideshow of real screenshots (or a video if legacy.video.src is set)
  const slides = config.legacy.video.slides.map(slideOf);
  const imgs = slides.map(s => { const src = MEDIA[s.img] || s.img; if (!src) return null; const im = new Image(); im.src = src; return im; });
  let paused = false, reelT = 0;
  $('#reel-pause').onclick = e => { paused = !paused; e.target.textContent = paused ? 'PLAY' : 'PAUSE'; const v = $('#reel-v'); if (v) paused ? v.pause() : v.play(); };
  const rc = $('#reel-c'), rg = rc?.getContext('2d');
  const drawImg = (im, t, alpha) => {
    const w = rc.width, h = rc.height, z = 1.04 + t * 0.012;             // slow push-in
    const s = Math.max(w / im.width, h / im.height) * z, iw = im.width * s, ih = im.height * s;
    rg.globalAlpha = alpha; rg.drawImage(im, (w - iw) / 2, (h - ih) / 2 - t * 2, iw, ih); rg.globalAlpha = 1;
  };
  const drawReel = (t, slide) => {
    if (!rg) return;
    const w = rc.width, h = rc.height, local = t % 4, im = imgs[slide], prev = imgs[(slide - 1 + slides.length) % slides.length];
    rg.fillStyle = '#05080c'; rg.fillRect(0, 0, w, h);
    if (im?.complete && im.naturalWidth) {
      if (local < 0.6 && prev?.complete && prev.naturalWidth) drawImg(prev, local + 4, 1);
      drawImg(im, local, Math.min(1, local / 0.6));
      // scanlines + a tinted edge, so screenshots sit inside the page's look
      rg.fillStyle = 'rgba(3,6,12,.18)'; for (let y = 0; y < h; y += 4) rg.fillRect(0, y, w, 1);
      const gr = rg.createLinearGradient(0, h * 0.55, 0, h); gr.addColorStop(0, 'rgba(3,6,12,0)'); gr.addColorStop(1, 'rgba(3,6,12,.7)');
      rg.fillStyle = gr; rg.fillRect(0, 0, w, h);
    } else {
      const hue = (slide * 47) % 360, gr = rg.createLinearGradient(0, 0, w, h);
      gr.addColorStop(0, `hsl(${hue},55%,${18 + Math.sin(t) * 4}%)`); gr.addColorStop(1, `hsl(${hue + 60},60%,8%)`);
      rg.fillStyle = gr; rg.fillRect(0, 0, w, h);
    }
  };

  // cursor
  const cur = $('#cursor'); let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
  addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; });
  document.addEventListener('pointerover', e => cur.classList.toggle('hover', !!e.target.closest('a,button,summary,.st')));

  // ambient sound: a soft river drone (WebAudio, no files)
  let ac = null, gain;
  $('#sound').onclick = e => {
    const btn = e.currentTarget;
    if (!ac) {
      ac = new AudioContext(); gain = ac.createGain(); gain.gain.value = 0; gain.connect(ac.destination);
      const filt = ac.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 600; filt.connect(gain);
      [55, 82.4, 110.2, 164.8].forEach((f, i) => { const o = ac.createOscillator(); o.type = i % 2 ? 'sine' : 'triangle'; o.frequency.value = f; o.detune.value = i * 4; o.connect(filt); o.start(); });
      // the river: filtered noise under the drone
      const buf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const src = ac.createBufferSource(); src.buffer = buf; src.loop = true;
      const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 420; bp.Q.value = 0.6;
      const ng = ac.createGain(); ng.gain.value = 0.35; src.connect(bp).connect(ng).connect(gain); src.start();
    }
    const on = !btn.classList.contains('on');
    btn.classList.toggle('on', on); btn.querySelector('span').textContent = on ? 'SOUND ON' : 'SOUND OFF';
    gain.gain.linearRampToValueAtTime(on ? 0.06 : 0, ac.currentTime + 0.8);
  };

  // per-frame hook from main.js
  return {
    frame(time, dt) {
      cx += (tx - cx) * 0.25; cy += (ty - cy) * 0.25;
      cur.style.transform = `translate(${cx}px,${cy}px)`;

      // scroll through #events drives the train
      const ev = $('#events'), r = ev.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
      if (r.top < innerHeight && r.bottom > 0 && manual === null) select(Math.min(stations.length - 1, Math.floor(p * stations.length)));
      if (r.top > innerHeight || r.bottom < 0) manual = null;

      const reel = $('.reel').getBoundingClientRect();
      if (!paused && reel.top < innerHeight && reel.bottom > 0) {
        reelT += dt;
        const slide = Math.floor(reelT / 4) % slides.length;
        drawReel(reelT, slide);
        const cap = $('#reel-cap');
        if (cap.dataset.i !== String(slide)) { cap.dataset.i = slide; cap.textContent = slides[slide].cap; $('#reel-n').textContent = `${String(slide + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`; }
        const f = Math.floor(reelT * 24);
        $('#tc').textContent = [Math.floor(f / 86400), Math.floor(f / 1440) % 60, Math.floor(f / 24) % 60, f % 24].map(n => String(n).padStart(2, '0')).join(':');
      }
    },
  };
}

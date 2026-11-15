# Godavari Command — scroll walkthrough (ESYA design language) · Three.js + Vite

The front door for **Godavari Command** (RTIH AP Godavari Pushkaralu 2027): a scroll-driven
3D night-time walk along the Rajamahendravaram riverfront, built on the ESYA'26 recreation —
same typography, rune/amber palette, glitch headlines, metro-map, split-flap board, bloom,
grain and the "arrival" build-up — with every word and the whole 3D world replaced.

## Live site and editor

- **Live site:** https://godavari-2027.vercel.app — no editor, shows the published content only.
- **Editor:** https://godavari-2027.vercel.app/editor — same page with the editor panel. Edits are a draft
  in your browser until you press **🚀 Publish to live site**, which commits `dist-standalone/config.json`
  to this repo with your GitHub token; Vercel redeploys in about a minute.
- **Token:** a GitHub fine-grained personal access token limited to this repo, *Contents: Read and write*.
  It is stored only in the browser you paste it into. Without it the editor can preview but not publish.

Deployed on Vercel from this repo: `vercel.json` serves `dist-standalone/` as-is (no build step).
After `npm run standalone`, copy `dist-standalone/godavari-command.html` to `dist-standalone/index.html` before pushing.

Two ways to run it:

1. **Just open it** — `dist-standalone/godavari-command.html` is one self-contained file
   (three.js, screenshots and clip frames bundled in). Double-click it. Fonts load from
   Google Fonts when online.
2. **Develop** — `npm install`, then `npm run dev` (Vite, hot reload).
   `npm run build` → `dist/` for hosting; `npm run standalone` → rebuilds the single file.

## What's on the page

| Chapter | Content | 3D shot |
|---|---|---|
| Hero | GODAVARI ’27 · Command, countdown to 26 June 2027 | downstream over the arch bridge, beam on Kotilingala |
| I · The river | Pushkaralu, the three apps, privacy-first ghats | Kotilingala ghat, zones B1–B4, control room |
| II · The occasion | *push·ka·ra·lu* + three operating rules | the Godavari sigil over the lit ghat |
| III · The desks | six problem statements as metro lines, 21 stations | top-down riverfront, dimmed |
| Programme | Built · Pilot (6 Mar 2027) · Pushkaralu | Kotilingala from upstream |
| IV · Field notes | demo reel (real UI screenshots) + floating test-clip screens | flight downstream over the three bridges |
| Built on | models, runtime and data | RTIH × RMC billboard |
| V · The roles | every seat, with the demo cast | the city and its 221 Atlas pins |
| VI · FAQ / VII · Hand-off | privacy, simulation, offline, running the demo; live links | aerial of the whole riverfront |

## The 3D riverfront (`src/scene.js`)

World units are 4 m; the origin is Kotilingala ghat (81.766° E, 17.0215° N); +x is east, +z downstream.

- **River** — one polygon between `eastBank` and `westBank`, with a flowing shader: current-aligned noise,
  fresnel, glints, a faint grid, and the beam's reflection streak running towards the camera.
- **Ghats** — the five registry ghats (Kotilingala, Pushkar, #3, Saraswati, Gowthami) as stepped terraces
  with glowing step edges, a shrine/gopuram, and twinkling diyas; floating diyas drift downstream.
- **Bridges** — Godavari Arch (28 bowstring spans), Havelock (girder, 1900) and the road-cum-rail truss,
  with deck lamps and trains crossing.
- **Desk layers** — PS-01 zones extruded by density (amber ≥ 2.2, red ≥ 2.5), PS-02 incident pulse and
  approved responder trail, PS-03 desk A ↔ desk B link, PS-05 lot occupancy rings + shuttles on route,
  PS-09 all 221 Atlas assets as light pins (restricted ones ringed in amber).
- Beam, rune circles and the hexagon-with-waves sigil on the lit ghat; light trails from it to assets.

Positions come from the project: ghats and assets from the Atlas registry (OpenStreetMap), zones,
desks, lots and the shuttle route from the walkthrough demo data, bridge ends from public coordinates.
River banks and sandbanks are drawn by hand to fit those points — it is a stylised map, not a survey.

## Where to edit

| What | Where |
|---|---|
| All page text, links, desks, programme, FAQ, roles, colours | `src/config.js` (top half) |
| Ghats, banks, bridges, zones, lots, billboards, floating screens, camera shots | `src/config.js` → `scene` |
| Reel screenshots and clip frames | `src/media.js` (keys referenced from the config) |
| Live, in the browser | press **E** (or ✎ EDIT) → panel; tick *Edit text on page* and click any text |
| Save live edits | Editor → Save/load → *Export config JSON*; paste into `config.js` or re-import |
| Re-frame a section's camera | Hero → *Explore the riverfront* → orbit → Editor → Camera → pick section → *📷 capture* |

Files: `src/scene.js` (3D world), `src/ui.js` (DOM + interactions), `src/editor.js` (panel),
`src/main.js` (scroll → camera loop), `src/style.css`, `src/media.js` (embedded images).

Built by V & G Technologies Pvt Ltd (Vantesh and Ginni Technologies Private Limited · GiVa Aerotech).

The loading screen draws Andhra Pradesh from the 2011-census district TopoJSON in udit-001/india-maps-data, dissolved to the state outline (1,324 points).

Credits: screenshots from the RTIH_UI_01/02 UI packages; floating-screen frames from `godavari-ai/clips`
(Pexels License — test clips, not Godavari footage); ghat positions © OpenStreetMap contributors (ODbL).

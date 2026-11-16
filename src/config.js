// ─────────────────────────────────────────────────────────────────────────────
//  CONFIG — every word, colour, ghat, bridge, label, layer and camera shot on
//  the page comes from this object. Edit here, or live in the browser with the
//  editor panel (press E or click "✎ EDIT"), then "Export config" to save.
//
//  World units: 1 unit = 4 m. Origin = Kotilingala ghat (81.766° E, 17.0215° N).
//  +x = east (the city), −x = west (the river, then Kovvur), +z = south (downstream).
// ─────────────────────────────────────────────────────────────────────────────

const LIVE_COMMAND = 'https://rtih-ui-01.vercel.app';
const LIVE_FIELD = 'https://rtih-ui-02.vercel.app';
const LIVE_YATRA = 'https://rtih-ui-03.vercel.app';

export const DEFAULT_CONFIG = {
  meta: { title: 'Godavari Pushkaralu ’27' },

  // Colours drive both the CSS custom properties and the 3D materials.
  theme: {
    ink: '#03060c', bone: '#e7eeea', bone2: '#b4c2bc', mute: '#6d807a',
    rune: '#6bffd2', rune2: '#48dcff', amber: '#ffb46b', violet: '#a68dff',
  },

  countdownTo: '2027-06-26T00:00:00+05:30',

  nav: {
    brand: 'GIVA VIGILNET', year: '',
    links: [
      { label: 'River', href: '#about' }, { label: 'Principles', href: '#theme' },
      { label: 'Desks', href: '#events' }, { label: 'Programme', href: '#schedule' },
      { label: 'Proof', href: '#legacy' }, { label: 'Stack', href: '#sponsors' },
      { label: 'Roles', href: '#team' }, { label: 'FAQ', href: '#faq' },
      { label: 'Contact', href: '#contact' },
    ],
    cta: { label: 'Enter command', href: LIVE_COMMAND },
  },

  // loader: Andhra Pradesh as a glowing cyan silhouette.
  // outline = state boundary (dissolved from the 2011-census district TopoJSON in udit-001/india-maps-data),
  // 1,324 points, delta-encoded in thousandths of a degree: "lon,lat" of the first point, then "dlon,dlat" steps.
  loader: {
    coords: 'GIVA VIGILNET · 17.02° N 81.77° E', word: 'CONVERGING',
    outline: '83756,18911 -4,15 24,-14 10,8 -18,36 -11,-4 -11,45 34,12 -4,9 17,1 29,-59 5,-44 19,-3 0,-44 45,-54 23,14 34,-23 16,9 40,-5 33,7 52,-58 31,10 15,-6 3,15 19,11 31,-11 5,15 23,-2 8,9 34,-16 26,9 3,12 32,-17 6,12 17,3 -13,16 19,3 15,18 -30,20 -2,23 6,6 23,-27 12,1 10,12 -24,21 32,-18 6,14 -19,13 39,-6 1,20 9,-9 10,12 -14,26 7,22 21,9 -20,17 -11,27 55,-33 7,28 33,31 40,9 17,17 10,-2 -1,-42 19,-5 17,41 43,-3 10,13 -12,18 -34,-9 0,14 -16,2 -14,31 72,-2 2,33 9,4 34,-9 -2,-12 -10,-2 3,-26 63,-44 -88,-107 8,-1 -80,-77 -46,-72 -7,-28 -58,-49 -40,-48 -13,-33 -72,-67 -13,-38 -207,-181 -19,-30 0,-30 -193,-105 -186,-80 -86,-52 -19,30 21,-26 -97,-71 -38,-59 -48,-2 -17,17 -15,-6 15,6 17,-17 28,6 14,-7 -54,-36 -26,-39 -25,-16 -9,-47 -57,-54 -7,-30 -46,-29 7,1 -2,-10 -9,6 -2,-19 -56,-43 -1,-20 -25,-21 -51,-31 -142,-53 -28,-34 -289,-129 -160,-95 -98,-73 -126,-119 -31,-44 -20,-58 10,-4 -29,-16 -1,-59 11,13 7,-19 17,7 0,-12 5,12 4,-13 11,10 11,-28 19,18 21,-13 4,12 3,-8 0,75 -35,61 21,-9 13,-23 6,-80 -22,-131 5,-32 17,-9 -49,-45 13,-49 -16,-54 -81,-17 -277,-146 -106,-23 -132,-66 -7,10 6,42 0,-50 -27,19 -137,20 -1,20 -5,10 -24,3 -28,-11 -25,28 -33,1 -11,20 -14,1 -39,39 -2,41 -38,10 11,20 -12,-19 39,-11 -2,-25 15,-32 41,-23 13,-22 15,7 17,-7 22,-27 54,7 7,-30 -66,8 -95,-13 -127,-65 -51,-70 -23,-105 -45,-90 2,-39 -133,-123 -12,-16 4,-14 -6,11 -6,-29 19,-31 -5,-17 -70,-38 -108,-10 -15,7 -28,46 11,17 -8,-23 31,-43 -43,130 22,-35 2,11 13,-6 -3,21 -39,36 -94,18 -143,-33 -119,-55 -102,-75 -65,-90 -45,-160 -83,-105 -34,-81 0,-76 -42,-127 7,-79 -14,4 -12,-28 -66,42 -28,0 -41,-19 -5,-15 -15,-1 61,35 30,-1 63,-41 13,28 15,-5 55,-265 28,-24 33,-101 17,-9 8,-19 -15,-71 -13,-164 -37,-122 -4,-79 20,-109 108,-258 -17,-61 -4,-65 34,-92 -26,-94 -27,19 -70,1 -6,13 -26,2 -5,-17 -30,0 -1,37 11,9 -7,15 -24,-13 -57,6 1,-17 17,4 9,-16 21,-1 -1,-19 -31,4 -8,-20 -24,2 -12,-11 1,-39 -39,-13 10,-20 19,-5 -5,-13 -13,3 0,-18 -12,-12 -17,8 -1,-12 -32,-15 0,-10 -15,8 -5,-14 -54,0 -17,-23 -32,24 -3,-22 -27,-13 65,-43 0,-14 -31,-7 -4,-12 -10,1 -13,29 -18,-20 -16,5 10,23 -12,8 -5,-14 -12,5 -6,18 18,5 -13,29 -18,-17 -1,11 -22,0 -10,-20 -26,10 3,8 -13,-3 -5,-23 -12,-4 -44,17 9,42 -7,22 -11,5 -16,-9 -15,10 -39,-6 -21,13 -3,-15 -27,-2 -3,-17 -14,0 -6,-11 7,3 1,-13 26,2 4,-10 25,12 -11,-26 -26,-10 14,-14 -4,-8 20,0 -7,-13 22,8 1,-21 -16,3 0,-32 -64,1 14,-11 -18,-5 10,-10 -24,2 5,-42 -16,-1 -4,15 -34,-31 -13,4 18,16 -28,-3 -4,30 -18,-4 -4,12 -13,-23 -2,33 -8,0 -25,-23 23,-9 1,-34 -36,-23 -17,2 11,-17 -14,-8 14,-3 -11,-7 12,-2 -8,-17 -22,-10 -48,19 -34,-13 -18,15 1,12 -69,34 -23,-3 -2,-9 -46,6 -20,-33 25,-2 8,-16 -45,3 -1,64 -16,0 -4,-15 -29,-4 -29,11 -19,-22 -42,-12 -37,14 -10,-54 -49,16 -1,-16 -34,-24 26,-25 -9,-1 19,-33 -23,0 -32,-81 6,-29 -15,-39 -37,-27 7,-5 -8,-12 9,-1 -8,-38 -21,-9 -5,19 14,1 -19,5 -4,20 -7,-11 -21,22 0,-12 27,-23 -17,5 -3,-41 -32,0 7,-28 -10,-24 -38,11 -53,-9 -73,40 -29,39 -27,1 -7,-20 -39,7 42,37 -10,31 14,27 7,73 16,7 44,-9 2,17 23,7 -17,4 3,15 17,1 16,38 33,-34 10,10 13,-14 33,9 20,-45 2,38 -29,24 -19,-7 -8,23 27,19 -3,17 32,-6 8,16 -11,14 -2,38 52,19 -5,30 29,14 -21,26 28,10 5,22 30,3 -4,20 -26,3 0,10 28,13 -12,8 22,60 -10,0 -12,31 -4,-24 -23,0 -7,-21 -18,24 -35,10 4,20 -39,-13 -4,21 -12,2 -27,-16 -24,17 6,12 10,-10 16,9 -44,19 17,35 -8,112 33,68 -6,11 -75,7 -66,-12 -24,16 -3,-12 -13,6 -27,-28 -3,25 13,16 1,22 -36,5 1,21 -13,5 -42,-2 -27,-14 3,16 -24,17 5,22 42,-5 8,23 -29,26 35,46 110,-9 -108,7 -15,22 11,24 -10,31 -33,-2 -3,20 -29,15 -4,-34 -46,11 -24,-43 -23,-3 -4,59 38,17 -7,25 8,28 -20,4 -41,-55 -31,15 0,21 -57,-5 -13,9 -12,-30 18,-19 4,-15 -9,-6 10,-5 -25,-21 -30,-5 7,-14 -8,-12 -62,-18 -1,-59 -10,0 -5,29 -31,-10 8,27 -59,-19 -2,-13 23,-8 -14,-13 -14,18 -14,-1 -40,-28 -13,30 -20,1 -5,-9 15,-14 -12,-40 -13,7 2,15 -29,2 7,-25 -37,-8 -5,29 15,0 6,47 -14,31 8,17 -20,5 -8,-14 -15,2 7,8 -12,2 15,34 -50,-4 -20,15 -37,-21 -14,34 -22,-19 -32,-1 2,16 -13,5 2,33 -12,3 -16,-36 -7,18 -12,-23 -20,7 10,42 -6,13 -23,-18 7,-43 -21,4 -20,-12 41,-26 -12,-24 22,-23 -6,-21 -83,5 -4,-25 -21,2 -22,34 -19,1 -7,-41 -19,7 -13,46 5,22 -14,4 2,10 14,22 22,11 9,43 24,4 -5,27 -48,29 6,27 -69,40 1,24 40,4 5,13 -4,13 -25,8 -2,26 -21,19 -12,-8 -27,9 9,30 47,5 6,25 13,-16 62,-5 3,-52 -11,-25 15,-12 -2,-26 48,-9 3,-10 48,4 22,-46 24,0 1,12 71,-1 25,22 9,-1 -4,-22 32,21 15,-2 14,-34 25,-5 -11,-33 21,-5 -23,-37 10,-12 40,3 1,-19 36,27 -19,9 -4,21 23,3 3,28 -12,10 -45,-10 9,41 -58,14 8,29 20,3 41,56 -10,8 -44,-24 5,28 27,5 15,38 73,-2 37,-15 13,29 -12,8 -12,37 11,29 -6,19 -19,13 -29,-11 -4,36 -15,-4 -3,16 -22,9 -17,-5 -12,-25 10,-37 22,-11 9,-34 0,-17 -25,-10 -14,28 -19,7 4,42 -81,7 4,57 -49,-23 -41,4 -30,21 -28,-2 -29,-72 10,-5 -3,-37 -16,-9 -20,-3 -28,32 -47,-10 -20,11 -46,-2 -15,29 32,21 -11,18 -42,10 -19,24 0,49 14,2 17,23 27,-21 2,51 15,0 15,34 -74,4 -33,-15 -12,36 -25,21 -25,0 -24,66 -17,5 10,79 28,61 -20,44 54,5 1,20 16,-1 -12,27 12,6 3,26 -12,20 19,7 5,42 -1,32 -40,-14 -10,14 -51,6 -6,14 14,3 15,28 -16,38 3,19 23,18 36,-17 30,-19 11,-30 41,6 67,-21 1,11 18,8 45,-1 -5,-23 39,-4 2,25 28,3 7,12 10,55 20,11 8,34 22,-3 8,14 14,3 28,-16 62,-13 -92,29 -24,-18 -38,1 3,15 22,0 6,14 -14,43 -30,12 1,13 18,17 24,1 -1,10 -20,5 4,19 -32,3 -6,39 -49,-6 1,16 -23,18 5,28 -18,15 3,31 -56,57 -1,18 55,-8 0,131 53,25 38,-28 8,35 -50,29 9,20 -9,1 1,12 -31,2 -3,10 21,48 -2,40 -40,9 48,73 79,39 97,16 131,-25 50,9 119,-30 62,-1 48,-33 34,-2 31,13 80,-22 54,10 30,22 49,-22 38,0 34,-22 23,45 13,-3 2,-29 24,-13 13,-21 50,-5 2,19 39,3 15,34 -11,10 5,8 68,25 10,92 50,-15 15,25 38,10 45,28 66,-7 76,-25 50,41 19,4 29,-9 31,-44 60,-26 49,14 30,27 22,35 -9,58 22,6 19,-7 16,-57 31,18 2,24 5,-55 -17,-104 20,125 -26,90 55,26 26,2 23,29 20,2 70,-19 25,8 33,-22 58,17 19,109 -21,17 -5,33 4,63 21,11 -19,26 6,28 25,19 12,34 34,-4 49,21 79,-3 28,40 37,3 20,13 38,-4 57,41 34,-12 49,34 41,-5 22,29 29,12 18,-6 25,-33 34,14 27,-9 29,-61 41,-1 18,11 31,56 33,12 25,31 17,72 33,5 23,-20 20,-78 -7,-16 8,-20 -13,-21 6,-16 111,-41 78,1 37,-23 113,-2 189,-120 -7,-16 12,-8 -1,-17 -9,47 -110,61 -26,29 -57,26 -103,-1 -38,24 -91,3 -100,38 8,72 -31,96 -45,-3 -24,17 -1,20 -48,11 18,50 23,2 11,19 5,36 36,-4 3,23 45,-1 14,17 33,13 9,24 15,-34 15,6 39,-19 17,11 11,-12 -3,-15 17,-7 -2,-20 12,-5 -5,-32 12,-11 -2,-27 22,-5 -3,-14 33,-7 6,-36 24,15 4,16 -29,4 5,13 44,-15 1,-12 35,-18 1,-25 105,-27 27,24 16,2 -50,39 5,36 28,16 -9,19 15,15 -5,5 -62,37 -9,-13 -27,9 -6,-30 -43,28 -86,22 24,32 19,7 -21,52 24,24 9,0 -2,-18 22,-36 26,-8 6,20 20,1 14,17 9,54 49,11 17,20 34,-20 23,-5 34,-27 -14,-11 -1,-22 37,6 7,10 47,-6 98,-38 30,31 21,-7 32,7 30,-20 -16,16 -46,-3 -28,15 8,27 -8,18 10,11 2,26 44,-3 -5,62 22,-1 53,-28 37,-1 24,35 25,-10 94,15 14,25 -11,33 13,37 84,-8 49,57 -11,35 -43,9 -64,32 -2,-16 -10,2 -21,13 4,15 -28,0 12,20 -18,5 -4,27 -11,10 -29,-22 -18,11 -60,5 -51,78 -90,-1 -24,5 -5,19 15,14 74,-2 31,17 29,2 10,-8 -1,-40 9,-6 98,21 21,-38 123,-17 29,-40 7,-28 -12,36 -31,36 -30,-4 -84,17 -27,40 -96,-23 -8,50 -20,6 -48,-21 -28,5 1,20 -14,11 7,8 -19,4 9,22 -9,33 87,44 18,-30 49,-2 18,-15 46,39 -19,26 9,11 72,49 99,-47 90,2 38,-18 4,26 20,-7 19,19 10,-7 30,12 16,-25 72,14 10,12 43,-16 25,19 20,40 26,4 12,17 12,-30 76,53 21,31 95,25 16,15 37,2 20,16 6,-10 13,-5 14,-20 -3,-15 3,15 -32,35 31,17 -2,27 24,11 8,-12 24,-1 12,19 25,-15 32,0 3,-16 32,8 16,-23 -6,-9 27,-2 45,-26 18,6 5,24 -12,20 11,15 29,12 -3,-14 21,-11 3,16 12,-9 9,7 8,19 -16,29 3,41 25,-12 9,13 -19,24 -38,12 -5,20 26,20 -12,7 12,9 8,40 32,0 15,18 -3,30 -33,-12 -17,11 47,40 -6,37 -15,17 67,66 8,28 49,34 -2,-22 18,-14 29,-3 -5,-15 7,-18 -15,-13 19,-21 3,14 20,-9 -26,-43 60,-17 11,-23 15,-6 -19,-8 5,-24 -14,2 -14,-14 18,-11 -11,-28 50,-40 15,14 -10,14 10,17 -10,21 24,-4 108,42 16,23 -8,19 11,4 6,20 -13,4 -5,21 27,19 39,-17 5,-13 44,3 -1,-42 44,-20 31,-1 26,25 25,6 33,-11 33,31 15,1 -26,-42 4,-24 12,-4 -12,4 -4,24 29,42 -26,-10 -16,7 -7,11 10,10 -6,6 -19,-12 -1,17 -20,15 34,30 40,61 -7,6 -24,-12 -19,3 -15,30 23,14 0,11 -27,-10 -12,5 2,11 -15,3 0,12 19,15 -3,15 41,15 15,41 49,52 -7,10 23,17 19,-17 21,3 29,-20 5,-21 16,25 -3,20 47,-11 13,34 24,11 22,-3 -3,12 38,25 14,-12 26,11 9,31 -36,24 15,10 -25,1 -15,22 -1,13 18,0 -3,19 -15,4 -3,-41 -16,0 -9,13 14,9 -4,22 -16,4 -8,26 28,-2 4,21 25,-2 5,-14 28,8 21,-11 -4,-10 23,-14 7,-18 14,-2 6,36 -13,0 -5,19 30,-2 3,25 -21,31 5,16 11,-1 -10,14 18,-2 -3,-14 18,-15 13,7 8,-31 -5,-11 -19,7 5,-14 34,-9 5,30 16,15 -9,24 13,6 2,-26 20,-2 2,29 25,9 -12,34 22,12 6,20 13,-10 -1,-20 18,-4 -8,-11 16,-19 -2,-18 24,-23 15,-33 30,-3 -20,-20 23,-14 23,-77',
    river: [[81.42, 17.78], [81.55, 17.55], [81.66, 17.3], [81.76, 17.02], [81.85, 16.86], [82.02, 16.72], [82.24, 16.6]],
    pin: [81.77, 17.0],
  },

  hero: {
    meta: ['GIVA VIGILNET', 'RTIH × RMC INNOVATION CHALLENGE', 'MMXXVII'],
    title: 'GODAVARI', year: '', subtitle: 'Pushkaralu ’27',
    lede: 'One river. Six problems. One picture — for the twelve days of Godavari Pushkaralu, where every number shows its age and every decision has a name on it.',
    countdownLabel: 'PUSHKARALU BEGINS IN',
    figLabel: 'FIG. 00',
    fig: 'The Rajamahendravaram riverfront: five ghats, three bridges and 221 mapped assets, placed from the Atlas registry. One ghat lit on purpose.',
    replay: '↺ REPLAY THE ARRIVAL',
    explore: 'EXPLORE THE RIVERFRONT',
    scroll: 'SCROLL TO WALK THE RIVER',
  },

  about: {
    num: 'I', label: 'THE RIVER', title: 'Twelve days. One river.',
    lede: 'Crores of pilgrims, a few kilometres of ghats, and no second chance.',
    body: 'Godavari Pushkaralu returns to Rajamahendravaram from 26 June to 7 July 2027. Every ghat, lot and lane on this bank must be watched, decided on and recorded — by different departments, in real time. Godavari Command is that operating picture: three live-linked apps on one hub — Pushkaralu Command for the control room, Godavari Field for marshals, police and vendors, and Godavari Yatra for pilgrims in Telugu, Hindi and English. It is privacy-first by design: the bathing ghats are radar-only zones, with no cameras inside them.',
    stats: [{ n: '5', l: 'GHATS IN THE PILOT' }, { n: '221', l: 'MAPPED ASSETS' }, { n: '6', l: 'PROBLEM STATEMENTS' }],
  },

  theme_section: {
    num: 'II', label: 'THE OCCASION', title: 'Pushkaralu',
    word: 'push·ka·ra·lu', ipa: '/puṣ·ka·rā·lu/', pos: 'noun, Telugu',
    def: 'the twelve-day river festival held once every twelve years, when Jupiter enters Simha, on the banks of the Godavari.',
    verses: [
      { n: 'i.', title: 'Every number shows its age.', text: 'A silent camera turns its zone UNKNOWN, never calm. A stale GPS removes the arrival time instead of guessing. A quiet police feed says so on screen.' },
      { n: 'ii.', title: 'An alert is not a dispatch.', text: 'Fire candidates, crowd episodes, lost-person matches and advisories stay drafts until a named person verifies, approves or releases them.' },
      { n: 'iii.', title: 'Every decision has a name.', text: 'Each step is timestamped, attributed and appended to an audit that the evaluator role can read in full — and never change.' },
    ],
    quote: 'Models suggest. People decide. The audit trail records both.',
    quoteBy: '— GODAVARI COMMAND · OPERATING RULE',
  },

  events: {
    num: 'III', label: 'THE DESKS', title: 'Six desks. One hub.',
    lede: 'Six problem statements, one record contract. Scroll to move along the lines, or click any station for the rule behind it.',
    hub: 'GODAVARI HUB', boardTitle: 'DESK BOARD', boardLine: 'HUB · PORT 8080',
    rows: ['NOW AT', 'DESK', 'RUNS ON', 'THE RULE'],
    details: 'OPEN DESK →',
    listToggle: 'BROWSE ALL 21 AS A LIST',
    // dir = compass direction the line leaves the hub in (degrees, 0 = east, 90 = north)
    disciplines: [
      { name: 'PS-01 · CROWD', color: '#29d9ff', dir: 20, events: [
        { name: 'Zone density', blurb: 'RF-DETR counts people on the ghat cameras; the hub divides by the surveyed area of zones B1–B4.', platform: 'RF-DETR SMALL', departs: '≥ 2.5 /M² · 30 S', status: 'B2 · 2.45 /M²', link: LIVE_COMMAND },
        { name: 'Tiled counts', blurb: 'Whole-frame and 3×3 tiled passes keep the larger count; dense views are shown as lower bounds, ≥ N.', platform: 'RF-DETR · TILES', departs: 'LOWER BOUND ≥ N', status: 'LIVE', link: LIVE_COMMAND },
        { name: 'Silent camera', blurb: 'If a camera stops reporting, its zone turns UNKNOWN — never calm — and an observer task goes to the field app.', platform: 'HUB · SOURCE AGE', departs: 'UNKNOWN ≠ CALM', status: 'OBSERVER TASKED', link: LIVE_FIELD },
        { name: 'Forced re-check', blurb: 'A reviewer verifies and records the intervention; the zone and its neighbours are re-checked two minutes later.', platform: 'REVIEWER', departs: '+2 MIN RE-CHECK', status: 'EPISODE CLEARS < 2.0', link: LIVE_COMMAND },
      ] },
      { name: 'PS-02 · EMERGENCY', color: '#ff8a5c', dir: 80, events: [
        { name: 'Fire candidate', blurb: 'Our D-Fire model must see smoke or flame for two seconds before it speaks. 3 of 3 fire clips alarm; 0 of 3 aarti clips.', platform: 'RF-DETR · D-FIRE', departs: 'HELD 2 S', status: 'mAP@50 0.749', link: LIVE_COMMAND },
        { name: 'Linked, not merged', blurb: 'Two reports of the same event are linked, never silently merged — a second emergency cannot hide in the first.', platform: 'HUB', departs: 'LINK, NEVER MERGE', status: 'INC-0003', link: LIVE_COMMAND },
        { name: 'Accept or escalate', blurb: 'cuOpt proposes the nearest team. Nothing moves until a dispatcher approves, and the responder has 60 seconds to accept.', platform: 'cuOPT', departs: '60 S TO ACCEPT', status: 'ESCALATES', link: LIVE_FIELD },
        { name: 'Two-person close', blurb: 'A second person closes the incident. Field phones queue updates offline without creating duplicate tasks.', platform: 'FIELD APP', departs: 'TWO-PERSON CLOSE', status: 'AUDITED', link: LIVE_FIELD },
      ] },
      { name: 'PS-03 · LOST & FOUND', color: '#ff7aa8', dir: 330, events: [
        { name: 'Words, not faces', blurb: 'Desks record missing and found persons under an opaque reference. No photographs. No face recognition.', platform: 'DESK APP', departs: '0 BIOMETRICS', status: 'LP-7Q2K', link: LIVE_COMMAND },
        { name: 'Explained ranking', blurb: 'Nemotron embeddings and reranking after a time-and-place gate; the caseworker sees every part of the score.', platform: 'NEMOTRON 3.5', departs: 'MATCH 0.66', status: 'DECOY 0.53 REJECTED', link: LIVE_COMMAND },
        { name: 'Witnessed release', blurb: 'Contacts are sealed to the officer. Release needs a safeguarding checklist and a witnessed handover; both cases close together.', platform: 'OFFICER', departs: 'CHECKLIST + WITNESS', status: 'SEALED', link: LIVE_COMMAND },
      ] },
      { name: 'PS-05 · MOBILITY', color: '#ffd27a', dir: 280, events: [
        { name: 'Stall reader', blurb: 'A ResNet-18 we trained on PKLot reads marked stalls — 99.5% on a lot it never saw.', platform: 'RESNET-18 · PKLOT', departs: '99.5% UNSEEN LOT', status: 'NORTH LOT 93%', link: LIVE_COMMAND },
        { name: 'Gate counts', blurb: 'RF-DETR with ByteTrack counts vehicles crossing the gate line; the marshal’s count stays the total, corrections attributed.', platform: 'RF-DETR + BYTETRACK', departs: 'MARSHAL RECONCILES', status: 'IN 13 · OUT 14', link: LIVE_FIELD },
        { name: 'Honest arrivals', blurb: 'Shuttles report position with an age. When GPS goes stale the arrival time is removed and a marshal task is raised.', platform: 'SHUTTLE GPS', departs: 'STALE → NO ETA', status: '3 ON ROUTE', link: LIVE_YATRA },
        { name: 'Approved advisories', blurb: 'Drafted when a lot passes its pressure threshold, published by a reviewer with an expiry — in English, Hindi and Telugu.', platform: 'RIVA · TEMPLATES', departs: 'EN · HI · TE', status: 'EXPIRES 19:30', link: LIVE_YATRA },
      ] },
      { name: 'PS-09 · ATLAS', color: '#6bffd2', dir: 232, events: [
        { name: 'One ID, full history', blurb: 'Every toilet, clinic, police post and ghat keeps one stable ID, an owning department and every version.', platform: 'ATLAS REGISTRY', departs: '221 ASSETS', status: 'AST-0047 · V3', link: LIVE_COMMAND },
        { name: 'Checked imports', blurb: 'Bad geometry and same-category duplicates within 10 m are refused with a reason; a fix needs a note.', platform: 'GEOJSON · CSV', departs: 'DUPLICATE < 10 M', status: '422 · 1 ERROR', link: LIVE_COMMAND },
        { name: 'Restricted layer', blurb: 'The control room and staff assembly points never reach the public layer, and every export is audited.', platform: 'PUBLIC / RESTRICTED', departs: '6 RESTRICTED', status: 'STAFF ONLY', link: LIVE_COMMAND },
      ] },
      { name: 'PS-10 · COMMAND', color: '#a68dff', dir: 190, events: [
        { name: 'Adapters', blurb: 'Police, health and field feeds arrive in their own formats; adapters translate them, keep the raw record and quarantine the malformed.', platform: 'PER-SOURCE ADAPTERS', departs: 'RAW KEPT', status: 'QUARANTINE · 1', link: LIVE_COMMAND },
        { name: 'Feed age', blurb: 'Every source shows how long ago it reported, so a silent feed turns stale instead of looking calm.', platform: 'HUB · LIVE EVENTS', departs: 'POLICE · STALE 4M', status: 'HEALTH · 12 S', link: LIVE_COMMAND },
        { name: 'Cited sitrep', blurb: 'The Nemotron situation report may only cite event IDs that exist; anything else is stripped automatically.', platform: 'NEMOTRON 3.5', departs: '0 UNCITED CLAIMS', status: 'RULE FALLBACK', link: LIVE_COMMAND },
      ] },
    ],
  },

  schedule: {
    label: 'PROGRAMME', title: 'Where it stands, and what’s next.',
    days: [
      { name: 'Built', date: '13–15 NOV 2026', items: [
        { time: '13 NOV', title: 'Handover: three apps and the Godavari Hub', venue: 'RTIH_UI_01–03' },
        { time: '14 NOV', title: 'Fire/smoke and parking models trained', venue: 'NVIDIA RTX GPU' },
        { time: '15 NOV', title: 'Six problem statements submitted', venue: 'RTIH × RMC' },
      ] },
      { name: 'Pilot', date: '6 MAR 2027', items: [
        { time: 'PRE-PILOT', title: 'Site survey: cameras, zones and feeds', venue: 'KOTILINGALA' },
        { time: 'PRE-PILOT', title: 'Training and drill with department staff', venue: 'RMC ICCC' },
        { time: '6 MAR', title: 'Kotilingala compartment, Maha Shivaratri', venue: 'KOTILINGALA GHAT' },
      ] },
      { name: 'Pushkaralu', date: '26 JUN – 7 JUL 2027', items: [
        { time: '26 JUN', title: 'Pushkaralu begins on the riverfront', venue: 'ALL GHATS' },
        { time: '26 JUN – 7 JUL', title: 'Command picture live, round the clock', venue: 'RMC ICCC' },
        { time: 'AFTER', title: 'Data export, configuration and audit to departments', venue: 'DEPARTMENTS' },
      ] },
    ],
  },

  legacy: {
    num: 'IV', label: 'FIELD NOTES', title: 'It already runs.',
    lede: 'Three apps on one local hub, live-linked: a pilgrim SOS lands on Command and rings the Field app. Keep scrolling — the river is showing what the cameras were tested on.',
    fly: '↓ FLYING DOWNSTREAM, OVER THE BRIDGES',
    video: {
      label: 'GODAVARI HUB · DEMO REEL',
      src: '', // put an .mp4 URL here; empty = slideshow of the slides below
      slides: [
        { cap: 'Command: CCTV grid, GIS map and alert queue', img: 'cmd-live' },
        { cap: 'Zones, radar-only ghats and staff on the map', img: 'cmd-map' },
        { cap: 'A pilgrim SOS becomes a critical alert', img: 'cmd-dispatch' },
        { cap: 'Field rings — Ramesh Kumar holds Accept', img: 'field-dispatch' },
        { cap: 'Emergency protocol, announced to pilgrims', img: 'cmd-emergency' },
        { cap: 'Reports and inspections, offline-first', img: 'field-showcase' },
        { cap: 'Replay: scrub back through any zone', img: 'cmd-replay' },
        { cap: 'Night theme for the overnight shift', img: 'cmd-night' },
      ],
    },
    editionsLabel: 'THE BUILD SO FAR',
    editions: [
      { y: 'UI·01', t: 'Pushkaralu Command' }, { y: 'UI·02', t: 'Godavari Field' },
      { y: 'UI·03', t: 'Godavari Yatra' }, { y: 'HUB', t: 'Live link, port 8080' },
      { y: 'AI', t: 'Models on an RTX GPU' }, { y: '15·11', t: 'Submitted' },
      { y: '06·03', t: 'Pilot, Kotilingala' }, { y: '2027', t: 'Pushkaralu' },
    ],
  },

  partners: {
    label: 'BUILT ON', title: 'Nothing here is a black box.',
    lede: 'Open-source and free NVIDIA software, open map data, and models we trained ourselves on public datasets. After the event the running cost is hardware, hosting and support.',
    tiers: [
      { name: 'SUBMITTED TO', items: ['RTIH · ANDHRA PRADESH', 'RMC · RAJAMAHENDRAVARAM'] },
      { name: 'MODELS', items: ['RF-DETR SMALL', 'RESNET-18 · PKLOT', 'NEMOTRON EMBED', 'NEMOTRON RERANK', 'RIVA', 'cuOPT'] },
      { name: 'RUNTIME & DATA', items: ['TENSORRT · TRITON', 'DEEPSTREAM', 'MAPLIBRE GL', 'OPENSTREETMAP', 'D-FIRE', 'PKLOT'] },
    ],
    cta: 'TALK TO V & G TECHNOLOGIES →', ctaHref: '#contact',
  },

  team: {
    num: 'V', label: 'THE ROLES', title: 'Every seat has a name.',
    lede: 'Each role sees its own slice of the record. The names are the demo cast — in the pilot, every seat gets a real one.',
    members: [
      { role: 'OPERATOR', name: 'K. Suresh' }, { role: 'FIELD MARSHAL', name: 'Ramesh Kumar' },
      { role: 'FIRE WATCH', name: 'Naveen J' }, { role: 'PARKING MARSHAL', name: 'R. Prasad' },
      { role: 'REVIEWER', name: 'verifies candidates' }, { role: 'DISPATCHER', name: 'approves the team' },
      { role: 'CASEWORKER', name: 'desk A · desk B' }, { role: 'OFFICER', name: 'opens the sealed record' },
      { role: 'LIAISON', name: 'police · health · fire' }, { role: 'DUTY OFFICER', name: 'reads the sitrep' },
      { role: 'EVALUATOR', name: 'sees all, changes nothing' }, { role: 'PILGRIM', name: 'SOS on every screen' },
    ],
  },

  faq: {
    num: 'VI', label: 'INQUIRIES', title: 'Before you ask.',
    items: [
      { q: 'Does Godavari Command use face recognition?', a: 'No. The bathing ghats are radar-only zones with no cameras inside them, lost persons are matched by description, time and place, and no biometric data is collected at all.' },
      { q: 'Does the AI make the decisions?', a: 'No. Models raise candidates and draft reports; a named person verifies, dispatches, publishes or releases. Dismissals with a reason become training data, and the audit trail records both.' },
      { q: 'What is real, and what is simulated?', a: 'The three apps, the hub and the trained models are real. CCTV, radar, staff GPS, KPIs, Aadhaar e-KYC, OTP, payments and push notifications are simulated for the prototype, and the ₹50 ticket price is a placeholder.' },
      { q: 'What happens when the network drops?', a: 'Field phones queue updates offline without creating duplicates, desks reconcile when they reconnect, and the maps fall back to a built-in offline map.' },
      { q: 'How do I run the demo?', a: 'Double-click START-GODAVARI-HUB.bat (Node.js 18+, internet on the first run only), then open localhost:8080/wall.html to see all three apps side by side.' },
      { q: 'Who keeps the data afterwards?', a: 'The departments. After the event they keep the data export, the configuration and the audit trail.' },
    ],
  },

  footer: {
    num: 'VII', label: 'THE HAND-OFF', title: 'Your shift starts here.',
    register: 'ENTER GODAVARI COMMAND →', registerHref: LIVE_COMMAND,
    partner: 'OPEN THE PILGRIM APP ↗', partnerHref: LIVE_YATRA,
    builtBy: 'Vantesh & Ginni Technologies Pvt Ltd',
    builtFor: 'RTIH AP Godavari Pushkaralu 2027 Innovation Challenge',
    whereLabel: 'WHERE',
    where: 'Kotilingala Ghat, Rajamahendravaram\nEast Godavari, Andhra Pradesh',
    maps: 'OPEN IN MAPS ↗', mapsHref: 'https://www.openstreetmap.org/?mlat=17.0215&mlon=81.766#map=15/17.0100/81.7700',
    signalsLabel: 'LIVE BUILDS',
    signals: [
      { k: 'COMMAND', v: 'RTIH-UI-01 ↗', href: LIVE_COMMAND },
      { k: 'FIELD', v: 'RTIH-UI-02 ↗', href: LIVE_FIELD },
      { k: 'YATRA', v: 'RTIH-UI-03 ↗', href: LIVE_YATRA },
    ],
    // company contact card — empty fields are hidden on the page
    contact: {
      label: 'CONTACT',
      company: 'Vantesh and Ginni Technologies Pvt Limited',
      short: 'contact@givaaerotech.com | info@givaaerotech.com',
      offices: 'Hyderabad | Delhi',
      address: '',
      email: '',
      phone: '',
      website: { label: 'GIVAAEROTECH.COM ↗', href: 'https://givaaerotech.com' },
      people: [
        { role: 'FOUNDER & CEO', name: 'Maj. Vantesh Bakshi (Retd.)' },
        { role: 'CO-FOUNDER', name: 'Sqn. Ldr. Ginni Chaudhary (Retd.)' },
        { role: 'CTO', name: 'Dhruv' },
      ],
    },
    actsLabel: 'CHAPTERS',
    copyright: '© 2026 V & G TECHNOLOGIES PVT LTD',
    credit: 'GHAT POSITIONS © OPENSTREETMAP CONTRIBUTORS · DEMO DATA',
    top: 'BACK TO THE RIVER ↑',
  },

  // ───────────────────────────── 3D WORLD ─────────────────────────────
  scene: {
    exposure: 1.0,
    fog: 0.00125,
    bloom: { strength: 0.8, radius: 0.45, threshold: 0.4 },
    grain: 0.035, aberration: 0.0014, vignette: 0.9,
    sky: { top: '#03060c', horizon: '#1d1a3a', glow: '#7a3a1c' },
    ground: '#04080d', grid: '#1b6b7a',
    water: { deep: '#03101b', shallow: '#0a2a3a', glint: '#8fd8ff', grid: 0.18, speed: 1 },
    windowLit: 0.3,
    windowColors: ['#ffb46b', '#48dcff', '#a68dff', '#6bffd2'],
    cityCount: 3200, westCount: 700, treeCount: 420, starCount: 1500,
    focus: [0, 0],                 // the lit ghat: Kotilingala, the pilot compartment
    beam: { on: true, height: 900, color: '#ffc58f', width: 1.2 },
    sigil: { on: true, y: 70, scale: 1, spin: 0.25, color: '#ffb46b' },
    arcs: { count: 18, color1: '#ffb46b', color2: '#6bffd2', speed: 0.25 },
    diyas: { count: 260, color: '#ffb46b', drift: 1.6 },

    // river banks as polylines [x, z], north → south
    eastBank: [[-210, -1500], [-120, -1000], [-50, -500], [-12, -160], [-4, 0], [6, 180], [24, 362], [50, 460], [74, 552], [102, 650], [127, 740], [180, 815], [242, 880], [330, 990], [450, 1180], [620, 1450], [760, 1700]],
    westBank: [[-520, -1500], [-505, -1000], [-530, -600], [-570, -200], [-605, 240], [-735, 470], [-805, 800], [-790, 1150], [-720, 1450], [-640, 1700]],
    // sandbanks (lankas): centre, radii, rotation in degrees
    islands: [
      { name: 'BRIDGE LANKA', x: -330, z: 560, rx: 170, rz: 55, rot: -62, label: true },
      { name: '', x: -300, z: -420, rx: 210, rz: 48, rot: -80, label: false },
      { name: '', x: -470, z: 1060, rx: 230, rz: 70, rot: -70, label: false },
    ],

    // the five ghats, from the Atlas registry (OpenStreetMap positions)
    ghats: [
      { name: 'KOTILINGALA GHAT', sub: 'PILOT COMPARTMENT', x: 0, z: 0, len: 90, depth: 26, steps: 7, label: true },
      { name: 'PUSHKAR GHAT', sub: 'MAIN BATHING GHAT', x: 25, z: 365, len: 70, depth: 22, steps: 6, label: true },
      { name: 'GHAT #3', sub: '', x: 77, z: 554, len: 46, depth: 16, steps: 5, label: true },
      { name: 'SARASWATI GHAT', sub: '', x: 130, z: 742, len: 56, depth: 18, steps: 5, label: true },
      { name: 'GOWTHAMI GHAT', sub: '', x: 245, z: 882, len: 50, depth: 16, steps: 5, label: true },
    ],

    // PS-01 crowd zones on Kotilingala ghat — count / surveyed area (m²) = persons per m²
    zones: [
      { id: 'B1', x: 14, z: -24, area: 420, count: 820 },
      { id: 'B2', x: 15, z: -6, area: 380, count: 930 },
      { id: 'B3', x: 16, z: 11, area: 510, count: 610 },
      { id: 'B4', x: 18, z: 29, area: 360, count: 240 },
    ],
    zoneWarn: 2.2, zoneLimit: 2.5,

    // PS-02 incident + proposed responder; PS-03 desks; PS-05 lots and shuttle route
    incident: { label: 'INC-0003 · SMOKE NEAR B2', x: 35, z: -8, from: [130, -65], fromLabel: 'FIRE WATCH · NAVEEN J' },
    desks: { a: [45, 15], b: [67, 355], label: 'LP-7Q2K ↔ LP-M8PW · MATCH 0.66' },
    lots: [
      { name: 'NORTH LOT · 112 / 120', x: 138, z: 131, cap: 120, occ: 112, r: 16 },
      { name: 'SOUTH LOT · UNCONFIRMED', x: 208, z: 660, cap: 200, occ: 50, r: 20 },
    ],
    shuttleRoute: [[138, 131], [120, 56], [35, 5], [106, 264], [62, 365], [138, 487], [186, 584], [208, 660]],
    shuttles: 3,

    // labelled structures that rise during the arrival
    buildings: [
      { name: '▣ Control Room', label: true, x: 37, z: 47, w: 16, d: 10, h: 14, rot: 8, restricted: true },
      { name: 'Help Desk A', label: false, x: 47, z: 17, w: 9, d: 7, h: 6, rot: 8 },
      { name: 'Help Desk B', label: true, x: 70, z: 352, w: 9, d: 7, h: 6, rot: 4 },
      { name: 'AST-0047 · Toilets', label: false, x: 75, z: 92, w: 8, d: 6, h: 4, rot: 8 },
      { name: '▣ Staff Assembly', label: true, x: 386, z: 454, w: 18, d: 14, h: 8, rot: 20, restricted: true },
      { name: 'Medical Camp', label: false, x: 60, z: 210, w: 14, d: 10, h: 7, rot: 6 },
      { name: 'Police Post', label: false, x: 104, z: 600, w: 10, d: 8, h: 9, rot: 10 },
    ],

    // three bridges to Kovvur; from = east bank end, to = west bank end
    bridges: [
      { name: 'GODAVARI ARCH BRIDGE', type: 'arch', from: [73, 513], to: [-615, 247], spans: 28, h: 9, w: 5, color: '#6bffd2', train: true },
      { name: 'HAVELOCK BRIDGE · 1900', type: 'girder', from: [84, 560], to: [-645, 298], spans: 30, h: 7, w: 4, color: '#a68dff', train: false },
      { name: 'ROAD-CUM-RAIL BRIDGE', type: 'truss', from: [222, 850], to: [-749, 476], spans: 27, h: 12, w: 7, color: '#ffb46b', train: true },
    ],

    landmarks: [
      { name: 'KOVVUR · WEST BANK', x: -931, z: 125, h: 20 },
      { name: '↑ UPSTREAM', x: -330, z: -1100, h: 10 },
      { name: '↓ DOWNSTREAM · DOWLESWARAM', x: -260, z: 1500, h: 10 },
    ],

    billboards: [
      { text: 'NEMOTRON', x: 70, z: -150, y: 30, w: 30, rot: 10, tier: 'partner' },
      { text: 'RF-DETR', x: 96, z: 250, y: 34, w: 28, rot: 4, tier: 'partner' },
      { text: 'RIVA', x: 170, z: 700, y: 30, w: 24, rot: 12, tier: 'partner' },
      { text: 'cuOPT', x: 38, z: -330, y: 36, w: 26, rot: 14, tier: 'partner' },
      { text: 'RTIH × RMC', x: -420, z: -760, y: 122, w: 120, rot: 0, tier: 'title', heading: 'GODAVARI COMMAND · SUBMITTED TO', sub: 'pushkaralu 2027 innovation challenge' },
    ],

    // floating screens for the Proof fly-through. img = key in media.js, or any image URL
    holos: [
      { caption: 'PS-01 · TEST CLIP · DENSE CROWD, COUNTED IN TILES', x: -365, y: 62, z: 390, w: 60, color: '#29d9ff', img: 'clip-crowd' },
      { caption: 'PS-02 · AARTI LAMP · CORRECTLY QUIET', x: -205, y: 74, z: 575, w: 56, color: '#ffb46b', img: 'clip-aarti' },
      { caption: 'PS-02 · SMOKE, HELD 2 S · RAISED', x: -430, y: 76, z: 740, w: 56, color: '#ff8a5c', img: 'clip-smoke' },
      { caption: 'PS-05 · FULL LOT · STALLS READ BY THE PKLOT MODEL', x: -270, y: 64, z: 910, w: 60, color: '#ffd27a', img: 'clip-parking' },
    ],
    holoAnchors: ['legacy', 'legacy-mid', 'legacy-end'],

    // 221 Atlas assets [x, z, type, restricted]
    assets: [[0,0,"ghat",0],[25,365,"ghat",0],[77,554,"ghat",0],[130,742,"ghat",0],[245,882,"ghat",0],[37,47,"cont",1],[-16,-19,"staf",1],[43,387,"staf",1],[144,726,"staf",1],[386,454,"staf",1],[29,-25,"staf",1],[280,774,"hosp",0],[404,1010,"hosp",0],[400,946,"hosp",0],[396,941,"hosp",0],[263,819,"hosp",0],[260,816,"hosp",0],[265,808,"hosp",0],[294,798,"hosp",0],[217,784,"hosp",0],[258,784,"hosp",0],[254,779,"hosp",0],[209,769,"hosp",0],[270,764,"hosp",0],[187,750,"hosp",0],[279,748,"hosp",0],[250,744,"hosp",0],[170,744,"hosp",0],[153,742,"hosp",0],[292,728,"hosp",0],[175,727,"hosp",0],[143,720,"hosp",0],[315,710,"hosp",0],[162,705,"hosp",0],[328,686,"hosp",0],[440,658,"hosp",0],[447,655,"hosp",0],[247,649,"hosp",0],[154,645,"hosp",0],[271,634,"hosp",0],[105,629,"hosp",0],[233,577,"hosp",0],[270,559,"hosp",0],[370,552,"hosp",0],[476,540,"hosp",0],[65,537,"hosp",0],[253,526,"hosp",0],[439,524,"hosp",0],[487,517,"hosp",0],[253,513,"hosp",0],[27,475,"hosp",0],[401,472,"hosp",0],[381,460,"hosp",0],[46,456,"hosp",0],[373,433,"hosp",0],[415,452,"hosp",0],[411,445,"hosp",0],[404,444,"hosp",0],[461,442,"hosp",0],[447,441,"hosp",0],[76,441,"hosp",0],[448,440,"hosp",0],[409,438,"hosp",0],[447,437,"hosp",0],[423,437,"hosp",0],[381,434,"hosp",0],[479,425,"hosp",0],[417,422,"hosp",0],[411,422,"hosp",0],[462,423,"hosp",0],[503,412,"hosp",0],[404,409,"hosp",0],[480,402,"hosp",0],[473,401,"hosp",0],[476,389,"hosp",0],[413,386,"hosp",0],[480,386,"hosp",0],[400,386,"hosp",0],[482,384,"hosp",0],[476,382,"hosp",0],[411,374,"hosp",0],[255,373,"hosp",0],[451,372,"hosp",0],[415,366,"hosp",0],[262,363,"hosp",0],[235,361,"hosp",0],[402,357,"hosp",0],[234,352,"hosp",0],[177,304,"hosp",0],[172,314,"hosp",0],[151,327,"hosp",0],[170,301,"hosp",0],[166,299,"hosp",0],[265,296,"hosp",0],[122,294,"hosp",0],[142,293,"hosp",0],[186,296,"hosp",0],[152,290,"hosp",0],[195,294,"hosp",0],[157,285,"hosp",0],[167,273,"hosp",0],[156,259,"hosp",0],[156,250,"hosp",0],[150,233,"hosp",0],[178,224,"hosp",0],[180,223,"hosp",0],[304,207,"hosp",0],[487,200,"hosp",0],[281,200,"hosp",0],[149,196,"hosp",0],[288,186,"hosp",0],[403,181,"hosp",0],[395,142,"hosp",0],[185,116,"hosp",0],[246,103,"hosp",0],[217,63,"hosp",0],[177,46,"hosp",0],[451,16,"hosp",0],[223,15,"hosp",0],[176,15,"hosp",0],[286,14,"hosp",0],[477,-2,"hosp",0],[287,-23,"hosp",0],[268,-52,"hosp",0],[260,-53,"hosp",0],[443,-71,"hosp",0],[498,-78,"hosp",0],[278,-85,"hosp",0],[263,760,"hosp",0],[302,805,"clin",0],[305,774,"clin",0],[327,769,"clin",0],[334,738,"clin",0],[145,702,"clin",0],[304,686,"clin",0],[329,681,"clin",0],[349,677,"clin",0],[478,672,"clin",0],[200,605,"clin",0],[496,599,"clin",0],[135,598,"clin",0],[324,573,"clin",0],[371,570,"clin",0],[351,569,"clin",0],[202,565,"clin",0],[472,557,"clin",0],[295,557,"clin",0],[379,552,"clin",0],[253,515,"clin",0],[180,512,"clin",0],[41,481,"clin",0],[419,446,"clin",0],[415,436,"clin",0],[410,431,"clin",0],[415,431,"clin",0],[479,416,"clin",0],[425,409,"clin",0],[402,375,"clin",0],[415,359,"clin",0],[303,309,"clin",0],[263,272,"clin",0],[368,268,"clin",0],[292,242,"clin",0],[287,241,"clin",0],[241,190,"clin",0],[187,144,"clin",0],[122,142,"clin",0],[271,-49,"clin",0],[298,831,"poli",0],[297,828,"poli",0],[135,573,"poli",0],[134,572,"poli",0],[341,439,"poli",0],[334,438,"poli",0],[98,346,"poli",0],[100,344,"poli",0],[258,69,"hosp",0],[200,370,"hosp",0],[376,603,"hosp",0],[501,439,"hosp",0],[418,427,"hosp",0],[384,450,"hosp",0],[140,268,"hosp",0],[423,423,"hosp",0],[133,276,"hosp",0],[154,732,"clin",0],[284,585,"hosp",0],[435,429,"hosp",0],[311,538,"hosp",0],[461,418,"hosp",0],[464,370,"clin",0],[374,206,"hosp",0],[194,729,"hosp",0],[398,346,"hosp",0],[471,370,"clin",0],[212,388,"hosp",0],[420,110,"clin",0],[395,135,"clin",0],[204,61,"hosp",0],[334,62,"clin",0],[418,418,"clin",0],[424,123,"hosp",0],[204,382,"hosp",0],[196,377,"hosp",0],[215,381,"hosp",0],[434,446,"hosp",0],[222,702,"toil",0],[448,451,"hosp",0],[314,42,"hosp",0],[497,453,"hosp",0],[486,447,"clin",0],[481,435,"hosp",0],[265,339,"hosp",0],[343,394,"poli",0],[258,69,"hosp",0],[403,180,"hosp",0],[160,310,"hosp",0],[281,773,"hosp",0],[309,399,"poli",0],[328,406,"poli",0],[75,92,"toil",0]],

    camera: {
      fov: 38, parallax: 6,
      // one shot per scroll anchor (element id). dim = darken the 3D world (0..1)
      keys: [
        { anchor: 'top', pos: [-120, 95, 640], target: [-20, 15, 60], dim: 0 },
        { anchor: 'about', pos: [-150, 46, -110], target: [30, 16, 10], dim: 0.15 },
        { anchor: 'theme', pos: [-210, 34, 90], target: [0, 66, 0], dim: 0 },
        { anchor: 'verse-2', pos: [-58, 24, -58], target: [26, 10, 6], dim: 0.05 },
        { anchor: 'verse-3', pos: [-260, 80, 120], target: [0, 50, -20], dim: 0 },
        { anchor: 'events', pos: [-60, 980, 420], target: [-60, 0, 380], dim: 0.9 },
        { anchor: 'schedule', pos: [-90, 34, -280], target: [30, 12, -40], dim: 0.6 },
        { anchor: 'legacy', pos: [-140, 58, 150], target: [-300, 52, 430], dim: 0 },
        { anchor: 'legacy-mid', pos: [-280, 60, 400], target: [-340, 54, 720], dim: 0 },
        { anchor: 'legacy-end', pos: [-330, 62, 640], target: [-300, 50, 960], dim: 0.15 },
        { anchor: 'sponsors', pos: [-430, 140, -560], target: [-420, 122, -760], dim: 0.1 },
        { anchor: 'team', pos: [160, 70, -160], target: [330, 30, 260], dim: 0.05 },
        { anchor: 'faq', pos: [-620, 300, 160], target: [40, 0, 360], dim: 0.1 },
        { anchor: 'contact', pos: [-900, 520, 360], target: [60, 0, 420], dim: 0.6 },
      ],
    },
  },
};

// deep clone helper (structuredClone is fine in all modern browsers)
export const cloneConfig = c => structuredClone(c);

// read / write a value by "a.b.0.c" path
export function getPath(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
}
export function setPath(obj, path, val) {
  const ks = path.split('.'); const last = ks.pop();
  const tgt = ks.reduce((o, k) => o[k], obj); tgt[last] = val;
}

// ─────────────────────────────────────────────────────────────────────────────
//  WORLD — a procedural night-time Rajamahendravaram riverfront in Three.js,
//  in the ESYA visual language: ink sky, glowing edges, bloom, grain, and an
//  "arrival" build-up. Everything is generated from config.scene, so changing
//  a number in the editor and calling world.rebuild() regenerates the scene.
// ─────────────────────────────────────────────────────────────────────────────
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MEDIA } from './media.js';

const deg = d => (d * Math.PI) / 180;
const C = c => new THREE.Color(c);
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// seeded RNG so the city looks the same on every load
function rng(seed = 7) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// x of a bank polyline at a given z (polylines run north → south, z increasing)
export function bankX(bank, z) {
  if (z <= bank[0][1]) return bank[0][0];
  for (let i = 1; i < bank.length; i++) {
    const [x0, z0] = bank[i - 1], [x1, z1] = bank[i];
    if (z <= z1) return x0 + ((x1 - x0) * (z - z0)) / (z1 - z0);
  }
  return bank[bank.length - 1][0];
}
// unit tangent (north → south) of a bank at z
function bankT(bank, z) {
  const a = bankX(bank, z - 12), b = bankX(bank, z + 12);
  const v = new THREE.Vector2(b - a, 24).normalize();
  return v;
}

// ── canvas textures ──────────────────────────────────────────────────────────
function windowTexture(cols, rows, cfg, rand) {
  const cw = 16, ch = 20;
  const cv = document.createElement('canvas');
  cv.width = cols * cw; cv.height = rows * ch;
  const g = cv.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, cv.width, cv.height);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const lit = rand() < cfg.windowLit;
    g.fillStyle = lit ? cfg.windowColors[Math.floor(rand() * cfg.windowColors.length)] : '#16202b';
    g.globalAlpha = lit ? 0.75 + rand() * 0.25 : 1;
    g.fillRect(c * cw + 4, r * ch + 4, cw - 8, ch - 8);
  }
  g.globalAlpha = 1;
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

function textTexture({ w = 512, h = 128, lines, color = '#6bffd2', bg = 'rgba(3,10,14,0.85)', frame = true, font = 'IBM Plex Mono' }) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const g = cv.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  if (frame) { g.strokeStyle = color; g.lineWidth = Math.max(4, h * 0.04); g.strokeRect(4, 4, w - 8, h - 8); }
  lines.forEach(l => {
    g.font = `${l.weight || 600} ${l.size}px "${l.font || font}", monospace`;
    g.fillStyle = l.color || color; g.textAlign = l.align || 'center'; g.textBaseline = 'middle';
    g.fillText(l.text, l.x ?? w / 2, l.y);
  });
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// shared GLSL helpers
const GLSL_NOISE = `
  float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
  float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
    return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x), mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x), f.y); }
  float grid(vec2 p,float s){ vec2 g=abs(fract(p/s-.5)-.5)/fwidth(p/s); return 1.-min(min(g.x,g.y),1.); }`;
const withFog = (src, kind) => src
  .replace(`#include <fog_pars_${kind}>`, `\n#include <fog_pars_${kind}>\n`)
  .replace(`#include <fog_${kind}>`, `\n#include <fog_${kind}>\n`);

// twinkling lamp sprites (diyas, bridge lamps)
function lampMaterial(color, size) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
    uniforms: { col: { value: C(color) }, t: { value: 0 }, a: { value: 0 }, size: { value: size } },
    vertexShader: `attribute float aSeed; uniform float t,a,size; varying float vA;
      void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); gl_Position=projectionMatrix*mv;
        float tw=.6+.4*sin(t*(2.5+aSeed*4.)+aSeed*40.); vA=tw*a*smoothstep(2400.,300.,-mv.z);
        gl_PointSize=min(size*tw*(320./-mv.z), 26.); }`,
    fragmentShader: `uniform vec3 col; varying float vA;
      void main(){ float d=length(gl_PointCoord-.5); float k=smoothstep(.5,.0,d); k*=k;
        gl_FragColor=vec4(col*1.9, k*vA); }`,
  });
}
function lampPoints(positions, mat, rand) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
  const seeds = new Float32Array(positions.length / 3).map(() => rand());
  g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
  return new THREE.Points(g, mat);
}

// ── post-processing: grain + chromatic aberration + vignette + dim ───────────
const FinishShader = {
  uniforms: {
    tDiffuse: { value: null }, uTime: { value: 0 }, uGrain: { value: 0.05 },
    uAberr: { value: 0.0015 }, uVignette: { value: 0.9 }, uDim: { value: 0 },
  },
  vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uTime,uGrain,uAberr,uVignette,uDim; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
    void main(){
      vec2 d = (vUv-.5)*uAberr*2.;
      vec3 c = vec3(texture2D(tDiffuse,vUv+d).r, texture2D(tDiffuse,vUv).g, texture2D(tDiffuse,vUv-d).b);
      float v = smoothstep(1.2, .2, length(vUv-.5)*uVignette*1.6);
      c *= mix(1., v, .85);
      c *= 1. + (h(vUv*vec2(1920.,1080.)+fract(uTime))-.5)*uGrain*4.;
      c *= 1.-uDim;
      gl_FragColor = vec4(c,1.);
    }`,
};

// a smooth polyline curve (uniform Catmull-Rom) usable by TubeGeometry
class PolyCurve extends THREE.Curve {
  constructor(points) { super(); this.pts = points; }
  getPoint(t, out = new THREE.Vector3()) {
    const P = this.pts, n = P.length - 1, s = Math.min(n - 1e-6, Math.max(0, t * n)), i = Math.floor(s), u = s - i;
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[Math.min(n, i + 1)], p3 = P[Math.min(n, i + 2)];
    const cr = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
    return out.set(cr(p0.x, p1.x, p2.x, p3.x), cr(p0.y, p1.y, p2.y, p3.y), cr(p0.z, p1.z, p2.z, p3.z));
  }
}

// light-trail material: a bright head running along a tube
function trailMaterial(color, rand, base = 0.06) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
    uniforms: { c: { value: C(color) }, t: { value: 0 }, off: { value: rand() }, a: { value: 0 }, base: { value: base } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform vec3 c; uniform float t,off,a,base; varying vec2 vUv;
      void main(){ float p=fract(t+off); float head=smoothstep(p-.25,p,vUv.x)*step(vUv.x,p);
        gl_FragColor=vec4(c*1.6,(base+head*1.1)*a); }`,
  });
}

export class World {
  constructor(container, labelLayer, config) {
    this.cfg = config;
    this.container = container;
    this.clock = new THREE.Clock();
    this.mouse = new THREE.Vector2();
    this.awaken = 0;              // 0 → 1 build-up progress
    this.awakenStart = null;
    this.camPos = new THREE.Vector3(); this.camTgt = new THREE.Vector3();
    this.goalPos = new THREE.Vector3(); this.goalTgt = new THREE.Vector3();
    this.dim = 0; this.goalDim = 0;
    this.exploring = false;
    this.holoGate = 0; this.holoMix = 0;   // 0..1 — how much the Proof screens are shown

    const r = (this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' }));
    r.setPixelRatio(Math.min(devicePixelRatio, matchMedia('(pointer: coarse)').matches ? 1.25 : 1.6));
    r.setSize(innerWidth, innerHeight);
    r.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(r.domElement);

    this.labels = new CSS2DRenderer({ element: labelLayer });
    this.labels.setSize(innerWidth, innerHeight);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(config.scene.camera.fov, innerWidth / innerHeight, 0.5, 7000);

    this.composer = new EffectComposer(r);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth / 2, innerHeight / 2), 1, 0.5, 0.2);
    this.composer.addPass(this.bloom);
    this.finish = new ShaderPass(FinishShader);
    this.composer.addPass(this.finish);
    this.composer.addPass(new OutputPass());

    this.controls = new OrbitControls(this.camera, labelLayer);
    this.controls.enabled = false; this.controls.enableDamping = true;
    this.controls.maxPolarAngle = deg(85);

    addEventListener('resize', () => this.resize());
    addEventListener('pointermove', e => {
      this.mouse.set(e.clientX / innerWidth - 0.5, e.clientY / innerHeight - 0.5);
    });

    this.build();
    const k0 = config.scene.camera.keys[0];
    this.camPos.fromArray(k0.pos); this.camTgt.fromArray(k0.target);
    this.goalPos.copy(this.camPos); this.goalTgt.copy(this.camTgt);
  }

  // ── (re)build everything from config ──────────────────────────────────────
  rebuild() {
    this.scene.traverse(o => { if (o.isCSS2DObject) o.element.remove(); });
    this.scene.clear();
    this.build();
  }

  build() {
    const s = this.cfg.scene, T = this.cfg.theme;
    const rand = rng(11);
    this.anim = [];      // per-frame callbacks: (t, awaken, dt)
    this.risers = [];    // structures that grow during "the arrival"
    this.labelObjs = [];
    this.fadeMats = [];  // materials whose opacity follows the arrival

    this.renderer.toneMappingExposure = s.exposure;
    this.scene.fog = new THREE.FogExp2(C(s.sky.horizon).lerp(C(s.sky.top), 0.4), s.fog);
    this.bloom.strength = s.bloom.strength; this.bloom.radius = s.bloom.radius; this.bloom.threshold = s.bloom.threshold;
    this.finish.uniforms.uGrain.value = s.grain;
    this.finish.uniforms.uAberr.value = s.aberration;
    this.finish.uniforms.uVignette.value = s.vignette;
    this.camera.fov = s.camera.fov; this.camera.updateProjectionMatrix();

    this.scene.add(new THREE.AmbientLight(0x6f86a8, 0.5));
    const moon = new THREE.DirectionalLight(0x8fb2ff, 0.7); moon.position.set(-400, 400, -200);
    this.scene.add(moon);
    const glow = new THREE.PointLight(C(T.amber), 3, 220, 1.2); glow.position.set(s.focus[0] + 20, 18, s.focus[1]);
    this.scene.add(glow);

    this.buildSky(s);
    this.buildGround(s, T);
    this.buildWater(s, T);
    this.buildBanks(s, T, rand);
    this.buildGhats(s, T, rand);
    this.buildStructures(s, T, rand);
    this.buildCity(s, rand);
    this.buildTrees(s, rand);
    this.buildBridges(s, T, rand);
    this.buildLayers(s, T, rand);
    this.buildAssets(s, T, rand);
    if (s.beam.on) this.buildBeam(s);
    if (s.sigil.on) this.buildSigil(s);
    this.buildArcs(s, rand);
    this.buildDiyas(s, rand);
    this.buildLandmarks(s, T);
    this.buildBillboards(s, T);
    this.buildHolos(s);
  }

  label(parent, html, pos, cls = '', far = 700) {
    const el = document.createElement('div'); el.className = 'lbl ' + cls; el.innerHTML = html;
    const o = new CSS2DObject(el); o.position.copy(pos); parent.add(o);
    this.labelObjs.push({ o, el, far });
    return el;
  }

  buildSky(s) {
    const geo = new THREE.SphereGeometry(5000, 32, 16);
    const mat = new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: { top: { value: C(s.sky.top) }, hor: { value: C(s.sky.horizon) }, glow: { value: C(s.sky.glow) } },
      vertexShader: `varying vec3 vP; void main(){ vP=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader: `uniform vec3 top,hor,glow; varying vec3 vP;
        void main(){ float y=vP.y; vec3 c=mix(hor,top,smoothstep(-.02,.35,y));
          float g=pow(max(0.,1.-abs(y)*6.),3.)*smoothstep(-.6,.8,vP.z*.6+vP.x*.4);
          c+=glow*g*.9; gl_FragColor=vec4(c,1.); }`,
    });
    this.scene.add(new THREE.Mesh(geo, mat));

    const n = s.starCount, pos = new Float32Array(n * 3), r = rng(3);
    for (let i = 0; i < n; i++) {
      const th = r() * Math.PI * 2, ph = r() * 0.45 + 0.08;
      pos.set([Math.cos(th) * Math.cos(ph) * 3800, Math.sin(ph) * 3800, Math.sin(th) * Math.cos(ph) * 3800], i * 3);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xbfd4ff, size: 2.2, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.7 })));
  }

  buildGround(s) {
    const mat = new THREE.ShaderMaterial({
      fog: true,
      uniforms: { ...THREE.UniformsLib.fog, base: { value: C(s.ground) }, line: { value: C(s.grid) } },
      vertexShader: withFog(`varying vec3 vW; #include <fog_pars_vertex>
        void main(){ vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; vec4 mvPosition=viewMatrix*w; gl_Position=projectionMatrix*mvPosition; #include <fog_vertex> }`, 'vertex'),
      fragmentShader: withFog(`uniform vec3 base,line; varying vec3 vW; #include <fog_pars_fragment>
        ${GLSL_NOISE}
        void main(){ float d=length(vW.xz-vec2(0.,300.));
          float g=grid(vW.xz,20.)*.35+grid(vW.xz,100.)*.6;
          vec3 c=base+line*g*smoothstep(1700.,100.,d)*.5;
          gl_FragColor=vec4(c,1.); #include <fog_fragment> }`, 'fragment'),
    });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(12000, 12000), mat);
    ground.rotation.x = -Math.PI / 2;
    this.scene.add(ground);
  }

  // the Godavari: one polygon between the banks, with a flowing shader
  buildWater(s, T) {
    const poly = [...s.eastBank, ...[...s.westBank].reverse()];
    const shape = new THREE.Shape(poly.map(([x, z]) => new THREE.Vector2(x, -z)));
    const W = s.water;
    const mat = new THREE.ShaderMaterial({
      fog: true,
      uniforms: {
        ...THREE.UniformsLib.fog,
        deep: { value: C(W.deep) }, shallow: { value: C(W.shallow) }, glint: { value: C(W.glint) },
        gridc: { value: C(T.rune2) }, beamc: { value: C(s.beam.color) }, horc: { value: C(s.sky.horizon).multiplyScalar(0.9) },
        gridAmt: { value: W.grid }, t: { value: 0 }, a: { value: 0 }, focus: { value: new THREE.Vector2(s.focus[0], s.focus[1]) },
      },
      vertexShader: withFog(`varying vec3 vW; #include <fog_pars_vertex>
        void main(){ vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; vec4 mvPosition=viewMatrix*w; gl_Position=projectionMatrix*mvPosition; #include <fog_vertex> }`, 'vertex'),
      fragmentShader: withFog(`uniform vec3 deep,shallow,glint,gridc,beamc,horc; uniform float t,a,gridAmt; uniform vec2 focus;
        varying vec3 vW; #include <fog_pars_fragment>
        ${GLSL_NOISE}
        void main(){
          vec2 p=vW.xz;
          vec2 q=p*vec2(.03,.011)+vec2(0.,-t*.06);
          float n=noise(q)*.6+noise(q*2.7+3.1)*.3+noise(q*6.3-1.7)*.1;
          vec3 c=mix(deep,shallow,n);
          vec3 V=normalize(cameraPosition-vW); float fr=pow(1.-max(V.y,0.),4.);
          c=mix(c,horc,fr*.6);
          // the beam's reflection: a rippling streak from the lit ghat towards the viewer
          vec2 cp=cameraPosition.xz, ab=cp-focus; float h=clamp(dot(p-focus,ab)/max(dot(ab,ab),1.),0.,1.);
          float d=length(p-focus-ab*h), w=3.+h*length(ab)*.05;
          float rip=.5+.5*sin(p.y*.8+p.x*.2+t*2.2+n*7.);
          c+=beamc*exp(-d*d/(w*w))*rip*(1.-h*.6)*a*1.4;
          // glints riding the current
          float dc=length(p-cp);
          float sp=noise(p*vec2(.35,.12)+vec2(t*.2,-t*.7)); c+=glint*pow(sp,22.)*.5*smoothstep(380.,40.,dc);
          float g=grid(p,100.); c+=gridc*g*gridAmt*smoothstep(1500.,150.,dc);
          gl_FragColor=vec4(c,1.); #include <fog_fragment> }`, 'fragment'),
    });
    const water = new THREE.Mesh(new THREE.ShapeGeometry(shape), mat);
    water.rotation.x = -Math.PI / 2; water.position.y = 0.35;
    this.scene.add(water);
    this.anim.push((t, aw) => { mat.uniforms.t.value = t * W.speed; mat.uniforms.a.value = THREE.MathUtils.smoothstep(aw, 0.55, 0.9); });

    // sandbanks (lankas)
    s.islands.forEach(I => {
      const pts = Array.from({ length: 48 }, (_, i) => {
        const a = (i / 48) * Math.PI * 2, wob = 1 + Math.sin(a * 3 + I.x) * 0.08;
        const x = Math.cos(a) * I.rx * wob, z = Math.sin(a) * I.rz * wob, r = deg(I.rot);
        return new THREE.Vector2(I.x + x * Math.cos(r) - z * Math.sin(r), -(I.z + x * Math.sin(r) + z * Math.cos(r)));
      });
      const m = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(pts)), new THREE.MeshStandardMaterial({ color: 0x10181a, roughness: 1 }));
      m.rotation.x = -Math.PI / 2; m.position.y = 0.8; this.scene.add(m);
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([...pts, pts[0]].map(p => V3(p.x, 1, -p.y))),
        new THREE.LineBasicMaterial({ color: C(T.rune2), transparent: true, opacity: 0.35 }));
      this.scene.add(line);
      if (I.label && I.name) this.label(this.scene, I.name, V3(I.x, 14, I.z), 'lbl--sm', 900);
    });
  }

  // embankments: glowing bund line + a parallel road, like the campus outline in ESYA
  buildBanks(s, T) {
    const line = (pts, color, mult, op, y) => {
      const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts.map(([x, z]) => V3(x, y, z))),
        new THREE.LineBasicMaterial({ color: C(color).multiplyScalar(mult), toneMapped: false, transparent: true, opacity: op }));
      this.scene.add(l);
    };
    line(s.eastBank, T.rune2, 1.5, 1, 1.2);
    line(s.eastBank.map(([x, z]) => [x + 14, z]), T.rune, 0.8, 0.55, 0.6);
    line(s.westBank, T.rune2, 1.2, 0.6, 1.2);
    line(s.westBank.map(([x, z]) => [x - 14, z]), T.rune, 0.8, 0.35, 0.6);

    // a low retaining wall along the east bank
    const pos = [];
    for (let i = 0; i < s.eastBank.length - 1; i++) {
      const [x0, z0] = s.eastBank[i], [x1, z1] = s.eastBank[i + 1];
      pos.push(x0, 0, z0, x1, 0, z1, x1, 3, z1, x0, 0, z0, x1, 3, z1, x0, 3, z0);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
    this.scene.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0x0b141a, side: THREE.DoubleSide })));
  }

  // ghats: terraces of steps descending into the water, a shrine behind, diyas on the steps
  buildGhats(s, T, rand) {
    const stone = new THREE.MeshStandardMaterial({ color: 0x1c2630, roughness: 0.85, emissive: 0x0a0f14 });
    this.ghatLamps = [];
    s.ghats.forEach((G, gi) => {
      const t = bankT(s.eastBank, G.z), bx = bankX(s.eastBank, G.z);
      const grp = new THREE.Group(); grp.position.set(bx, 0, G.z);
      grp.rotation.y = Math.atan2(-t.y, t.x);           // local +x runs along the bank, local −z inland
      const sd = G.depth / G.steps, stepH = 0.9, pilot = gi === 0;
      const edgeMats = [];
      for (let i = 0; i < G.steps; i++) {
        const h = (i + 1) * stepH + 0.4;
        const geo = new THREE.BoxGeometry(G.len - i * 1.5, h, sd); geo.translate(0, h / 2, 0);
        const m = new THREE.Mesh(geo, stone); m.position.z = -((i + 0.5) * sd - 4);
        const em = new THREE.LineBasicMaterial({ color: C(pilot ? T.amber : T.rune).multiplyScalar(1.2), toneMapped: false, transparent: true, opacity: 0 });
        const e = new THREE.LineSegments(new THREE.EdgesGeometry(geo), em); e.position.copy(m.position);
        grp.add(m, e); edgeMats.push(em);
      }
      // shrine / gopuram behind the steps
      const top = G.steps * stepH + 0.4, back = -(G.depth - 4 + 8);
      const tiers = pilot ? 6 : 3, base = pilot ? 14 : 9;
      for (let k = 0; k < tiers; k++) {
        const w = base * (1 - k / (tiers + 1)), h = pilot ? 4.2 : 3.4;
        const geo = new THREE.BoxGeometry(w, h, w * 0.8); geo.translate(0, h / 2, 0);
        const m = new THREE.Mesh(geo, stone); m.position.set(0, top + k * h, back);
        const em = new THREE.LineBasicMaterial({ color: C(T.amber).multiplyScalar(1.3), toneMapped: false, transparent: true, opacity: 0 });
        const e = new THREE.LineSegments(new THREE.EdgesGeometry(geo), em); e.position.copy(m.position);
        grp.add(m, e); edgeMats.push(em);
      }
      const finial = new THREE.Mesh(new THREE.ConeGeometry(base * 0.12, 4, 8), new THREE.MeshBasicMaterial({ color: C(T.amber).multiplyScalar(2), toneMapped: false }));
      finial.position.set(0, top + tiers * (pilot ? 4.2 : 3.4) + 2, back); grp.add(finial);
      this.scene.add(grp);
      grp.scale.y = 0.001;
      this.risers.push({ grp, mats: [], edges: edgeMats, edgeOp: 0.75, delay: 0.05 + gi * 0.07 });

      if (G.label) this.label(grp, `${G.name}${G.sub ? `<small>${G.sub}</small>` : ''}`, V3(0, top + tiers * 4 + 16, back), pilot ? 'lbl--pilot' : '', 1100);

      // diyas along the lowest steps
      const L = new THREE.Vector2(t.x, t.y), N = new THREE.Vector2(t.y, -t.x);  // along bank, inland
      const n = pilot ? 60 : 26;
      for (let k = 0; k < n; k++) {
        const i = Math.floor(rand() * 3), u = (rand() - 0.5) * (G.len - 4), v = i * sd - 4 + sd * 0.15;
        this.ghatLamps.push(bx + L.x * u + N.x * v, (i + 1) * stepH + 0.7, G.z + L.y * u + N.y * v);
      }
    });
  }

  // labelled structures (control room, desks…) that rise during the arrival
  buildStructures(s, T, rand) {
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x0b1218, roughness: 0.9 });
    s.buildings.forEach((b, i) => {
      const cols = Math.max(2, Math.round(b.w / 3.4)), sideCols = Math.max(2, Math.round(b.d / 3.4));
      const rows = Math.max(2, Math.round(b.h / 3.6));
      const mk = tex => new THREE.MeshStandardMaterial({ color: 0x1a2733, roughness: 0.8, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0 });
      const longFace = mk(windowTexture(cols, rows, s, rand));
      const shortFace = mk(windowTexture(sideCols, rows, s, rand));
      const geo = new THREE.BoxGeometry(b.w, b.h, b.d); geo.translate(0, b.h / 2, 0);
      const mesh = new THREE.Mesh(geo, [shortFace, shortFace, roofMat, roofMat, longFace, longFace]);
      const grp = new THREE.Group();
      grp.position.set(b.x, 0, b.z); grp.rotation.y = -deg(b.rot);
      grp.add(mesh);
      const em = new THREE.LineBasicMaterial({ color: C(b.restricted ? T.amber : T.rune).multiplyScalar(1.2), toneMapped: false, transparent: true, opacity: 0 });
      grp.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), em));
      this.scene.add(grp);
      grp.scale.y = 0.001;
      this.risers.push({ grp, mats: [longFace, shortFace], edges: [em], edgeOp: 0.55, delay: 0.25 + i * 0.05 + rand() * 0.1 });
      if (b.label) {
        this.label(grp, b.name.toUpperCase(), V3(0, b.h + 12, 0), b.restricted ? 'lbl--warn lbl--sm' : 'lbl--sm', 420);
        grp.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([V3(0, b.h, 0), V3(0, b.h + 11, 0)]),
          new THREE.LineBasicMaterial({ color: C(b.restricted ? T.amber : T.rune).multiplyScalar(1.2), toneMapped: false, transparent: true, opacity: 0.7 })));
      }
    });
  }

  // Rajamahendravaram east of the bund; Kovvur, lower and sparser, beyond the west bank
  buildCity(s, rand) {
    const blocked = (x, z) =>
      s.ghats.some(g => Math.hypot(x - g.x, z - g.z) < g.len * 0.75) ||
      s.buildings.some(b => Math.hypot(x - b.x, z - b.z) < Math.max(b.w, b.d) + 6) ||
      s.lots.some(l => Math.hypot(x - l.x, z - l.z) < l.r + 10) ||
      s.bridges.some(br => Math.hypot(x - br.from[0], z - br.from[1]) < 30);
    const make = (count, side, seedTex, colors) => {
      const tex = windowTexture(4, 4, { ...s, windowLit: s.windowLit * 0.85, windowColors: colors }, rng(seedTex));
      const mat = new THREE.MeshStandardMaterial({ color: 0x141c26, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0, roughness: 0.9 });
      const geo = new THREE.BoxGeometry(1, 1, 1); geo.translate(0, 0.5, 0);
      const mesh = new THREE.InstancedMesh(geo, mat, count);
      const m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), sc = new THREE.Vector3(), up = V3(0, 1, 0);
      let i = 0, guard = 0;
      while (i < count && guard++ < count * 30) {
        const z = -1500 + rand() * 3200;
        const off = 22 + Math.pow(rand(), 1.6) * (side > 0 ? 1100 : 650);
        const x = side > 0 ? bankX(s.eastBank, z) + off : bankX(s.westBank, z) - off;
        if (side > 0 && blocked(x, z)) continue;
        const near = Math.max(0, 1 - off / 500);
        const w = 5 + rand() * 9, dd = 5 + rand() * 9;
        const h = side > 0 ? 3 + Math.pow(rand(), 2.4) * (14 + near * 16) : 2 + Math.pow(rand(), 2.6) * 9;
        p.set(x, 0, z); q.setFromAxisAngle(up, Math.round(rand() * 3) * 0.3 + 0.2); sc.set(w, h, dd);
        mesh.setMatrixAt(i++, m.compose(p, q, sc));
      }
      mesh.count = i;
      this.scene.add(mesh);
      return mat;
    };
    this.cityMats = [
      make(s.cityCount, 1, 21, ['#ffb46b', '#ffd9a8', '#48dcff', '#ffb46b']),
      make(s.westCount, -1, 22, ['#ffb46b', '#ffd9a8', '#ffb46b', '#a68dff']),
    ];
  }

  buildTrees(s, rand) {
    const geo = new THREE.IcosahedronGeometry(1, 1);
    const mat = new THREE.MeshStandardMaterial({ color: 0x2d4c42, roughness: 1, flatShading: true, emissive: 0x0b2a20, emissiveIntensity: 0.6 });
    const mesh = new THREE.InstancedMesh(geo, mat, s.treeCount);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), sc = new THREE.Vector3();
    let i = 0, guard = 0;
    while (i < s.treeCount && guard++ < 20000) {
      let x, z;
      if (rand() < 0.75) {        // a green strip along the bund
        z = -900 + rand() * 2200; x = bankX(s.eastBank, z) + 16 + rand() * 40;
        if (s.ghats.some(g => Math.hypot(x - g.x, z - g.z) < g.len * 0.7) || s.buildings.some(b => Math.hypot(x - b.x, z - b.z) < 14)) continue;
      } else {                    // on the sandbanks
        const I = s.islands[Math.floor(rand() * s.islands.length)], a = rand() * Math.PI * 2, rr = Math.sqrt(rand()) * 0.75, r = deg(I.rot);
        const lx = Math.cos(a) * I.rx * rr, lz = Math.sin(a) * I.rz * rr;
        x = I.x + lx * Math.cos(r) - lz * Math.sin(r); z = I.z + lx * Math.sin(r) + lz * Math.cos(r);
      }
      const r = 2.4 + rand() * 2.6;
      p.set(x, r * 0.9, z); sc.set(r, r * 0.95, r);
      mesh.setMatrixAt(i++, m.compose(p, q, sc));
    }
    mesh.count = i;
    this.scene.add(mesh);
  }

  // the three bridges to Kovvur: arch, girder (Havelock), road-cum-rail truss
  buildBridges(s, T, rand) {
    const pierMat = new THREE.MeshStandardMaterial({ color: 0x1a232c, roughness: 0.9 });
    const deckMat = new THREE.MeshStandardMaterial({ color: 0x121a22, roughness: 0.8 });
    s.bridges.forEach((B, bi) => {
      const [x0, z0] = B.from, [x1, z1] = B.to;
      const L = Math.hypot(x1 - x0, z1 - z0), span = L / B.spans;
      const grp = new THREE.Group(); grp.position.set(x0, 0, z0);
      grp.rotation.y = Math.atan2(-(z1 - z0), x1 - x0);   // local +x runs from east end to west end
      const col = C(B.color);
      const deck = new THREE.Mesh(new THREE.BoxGeometry(L, 1.4, B.w).translate(L / 2, B.h, 0), deckMat);
      grp.add(deck);
      const piers = new THREE.InstancedMesh(new THREE.BoxGeometry(2.2, 1, B.w * 0.8).translate(0, 0.5, 0), pierMat, B.spans + 1);
      const m = new THREE.Matrix4();
      for (let i = 0; i <= B.spans; i++) piers.setMatrixAt(i, m.makeScale(1, B.h, 1).setPosition(i * span, 0, 0));
      grp.add(piers);

      const seg = [];   // glowing structure lines, both sides of the deck
      const sideZ = [-B.w / 2, B.w / 2];
      sideZ.forEach(zz => {
        seg.push(0, B.h + 0.7, zz, L, B.h + 0.7, zz);
        for (let i = 0; i < B.spans; i++) {
          const a = i * span, b = a + span;
          if (B.type === 'arch') {          // a bowstring arch over every span
            const N = 10, rise = span * 0.42;
            for (let k = 0; k < N; k++) {
              const u0 = k / N, u1 = (k + 1) / N;
              seg.push(a + span * u0, B.h + 0.7 + Math.sin(Math.PI * u0) * rise, zz, a + span * u1, B.h + 0.7 + Math.sin(Math.PI * u1) * rise, zz);
            }
            for (let k = 1; k < 4; k++) { const u = k / 4; seg.push(a + span * u, B.h + 0.7, zz, a + span * u, B.h + 0.7 + Math.sin(Math.PI * u) * rise, zz); }
          } else if (B.type === 'truss') {  // Warren truss above the road deck
            const top = B.h + 7, mid = a + span / 2;
            seg.push(a, B.h + 0.7, zz, mid, top, zz, mid, top, zz, b, B.h + 0.7, zz, a + span * 0.1, top, zz, b - span * 0.1, top, zz);
          } else {                          // low girders, decommissioned
            seg.push(a, B.h - 1.6, zz, b, B.h - 1.6, zz);
          }
        }
      });
      const lm = new THREE.LineBasicMaterial({ color: col.clone().multiplyScalar(B.type === 'girder' ? 0.8 : 1.5), toneMapped: false, transparent: true, opacity: 0 });
      const lines = new THREE.LineSegments(new THREE.BufferGeometry(), lm);
      lines.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(seg), 3));
      grp.add(lines);
      this.scene.add(grp);
      grp.scale.y = 0.001;
      this.risers.push({ grp, mats: [], edges: [lm], edgeOp: B.type === 'girder' ? 0.45 : 0.85, delay: 0.3 + bi * 0.08 });

      // road lamps along the deck (world space, for the lamp shader)
      if (B.type !== 'girder') {
        const P = [], dir = V3(x1 - x0, 0, z1 - z0).normalize(), nrm = V3(-dir.z, 0, dir.x);
        for (let d = 0; d <= L; d += 7) sideZ.forEach(zz => {
          P.push(x0 + dir.x * d + nrm.x * zz, B.h + 2.2, z0 + dir.z * d + nrm.z * zz);
        });
        const mat = lampMaterial(B.type === 'truss' ? T.amber : '#cfe8ff', 3.2);
        this.scene.add(lampPoints(P, mat, rand));
        this.anim.push((t, aw) => { mat.uniforms.t.value = t; mat.uniforms.a.value = THREE.MathUtils.smoothstep(aw, 0.6 + bi * 0.05, 0.95); });
      }
      // a train crossing now and then
      if (B.train) {
        const train = new THREE.Mesh(new THREE.BoxGeometry(46, 2.2, 2.6), new THREE.MeshBasicMaterial({ color: col.clone().multiplyScalar(2.2), toneMapped: false }));
        train.position.y = B.h + (B.type === 'truss' ? -0.6 : 2); grp.add(train);
        const period = 34 + bi * 11, off = rand() * period;
        this.anim.push((t, aw) => {
          const u = ((t + off) % period) / period * 1.6 - 0.3;
          train.visible = aw > 0.95 && u > -0.05 && u < 1.05;
          train.position.x = u * L * (bi % 2 ? -1 : 1) + (bi % 2 ? L : 0);
        });
      }
      const mid = V3((x0 + x1) / 2, B.h + (B.type === 'arch' ? 30 : 22), (z0 + z1) / 2);
      this.label(this.scene, B.name, mid, 'lbl--sm', 1300);
    });
  }

  // the desks, drawn on the riverfront: crowd zones, incident, lost & found link, lots, shuttles
  buildLayers(s, T, rand) {
    // PS-01 · zones extruded by density
    s.zones.forEach((Z, i) => {
      const d = Z.count / Z.area, col = d >= s.zoneLimit ? '#ff5a4f' : d >= s.zoneWarn ? T.amber : T.rune2;
      const h = Math.max(1.5, d * 7);
      const geo = new THREE.BoxGeometry(9, h, 16); geo.translate(0, h / 2, 0);
      const fill = new THREE.MeshBasicMaterial({ color: C(col), transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
      const em = new THREE.LineBasicMaterial({ color: C(col).multiplyScalar(1.6), toneMapped: false, transparent: true, opacity: 0 });
      const grp = new THREE.Group(); grp.position.set(Z.x, 6.6, Z.z); grp.rotation.y = -deg(4);
      grp.add(new THREE.Mesh(geo, fill), new THREE.LineSegments(new THREE.EdgesGeometry(geo), em));
      this.scene.add(grp); grp.scale.y = 0.001;
      this.risers.push({ grp, mats: [], edges: [em], fills: [fill], fillOp: 0.22, edgeOp: 0.95, delay: 0.55 + i * 0.05 });
      this.label(grp, `${Z.id} · ${Z.count}<small>${d.toFixed(2)} /m² · limit ${s.zoneLimit}</small>`, V3(0, h + 9, 0), d >= s.zoneWarn ? 'lbl--warn lbl--sm' : 'lbl--sm', 230);
    });

    // PS-02 · incident pulse + the approved responder's route
    const I = s.incident;
    const rings = [0, 1, 2].map(k => {
      const mat = new THREE.MeshBasicMaterial({ color: C('#ff5a4f').multiplyScalar(2), toneMapped: false, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
      const ring = new THREE.Mesh(new THREE.RingGeometry(3, 3.6, 48), mat); ring.rotation.x = -Math.PI / 2; ring.position.set(I.x, 7.5, I.z);
      this.scene.add(ring); return { ring, mat, k };
    });
    this.anim.push((t, aw) => rings.forEach(({ ring, mat, k }) => {
      const u = (t * 0.5 + k / 3) % 1; ring.scale.setScalar(1 + u * 4); mat.opacity = (1 - u) * THREE.MathUtils.smoothstep(aw, 0.85, 1);
    }));
    const from = V3(I.from[0], 6, I.from[1]), to = V3(I.x, 8, I.z);
    const mid = from.clone().lerp(to, 0.5); mid.y = 46;
    const rm = trailMaterial('#ff8a5c', rand, 0.12);
    this.scene.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(from, mid, to), 60, 0.35, 5, false), rm));
    this.anim.push((t, aw) => { rm.uniforms.t.value = t * 0.45; rm.uniforms.a.value = THREE.MathUtils.smoothstep(aw, 0.85, 1); });
    this.label(this.scene, `${I.label}<small>fire candidate · verified by operator</small>`, V3(I.x, 26, I.z), 'lbl--red lbl--sm', 330);
    this.label(this.scene, `${I.fromLabel}<small>proposed by cuOpt · approved</small>`, V3(from.x, 22, from.z), 'lbl--warn lbl--sm', 330);

    // PS-03 · desk A ↔ desk B, linked case
    const a = V3(s.desks.a[0], 8, s.desks.a[1]), b = V3(s.desks.b[0], 8, s.desks.b[1]);
    const dm = trailMaterial('#ff7aa8', rand, 0.1);
    const c = new PolyCurve([a, V3(a.x + 30, 60, a.z + 90), V3(b.x + 30, 60, b.z - 90), b]);
    this.scene.add(new THREE.Mesh(new THREE.TubeGeometry(c, 80, 0.35, 5, false), dm));
    this.anim.push((t, aw) => { dm.uniforms.t.value = t * 0.3; dm.uniforms.a.value = THREE.MathUtils.smoothstep(aw, 0.85, 1); });
    this.label(this.scene, `${s.desks.label}<small>words, time and place · no faces</small>`, V3((a.x + b.x) / 2 + 34, 74, (a.z + b.z) / 2), 'lbl--sm', 600);

    // PS-05 · lots as occupancy rings, the shuttle route and its shuttles
    s.lots.forEach(Lt => {
      const p = Lt.occ / Lt.cap, col = p >= 0.9 ? '#ff5a4f' : T.rune;
      const bg = new THREE.Mesh(new THREE.RingGeometry(Lt.r, Lt.r + 1.6, 72), new THREE.MeshBasicMaterial({ color: C(T.bone), transparent: true, opacity: 0.12, side: THREE.DoubleSide }));
      const fg = new THREE.Mesh(new THREE.RingGeometry(Lt.r, Lt.r + 1.6, 72, 1, Math.PI / 2, -Math.PI * 2 * p),
        new THREE.MeshBasicMaterial({ color: C(col).multiplyScalar(1.8), toneMapped: false, side: THREE.DoubleSide }));
      [bg, fg].forEach(r => { r.rotation.x = -Math.PI / 2; r.position.set(Lt.x, 1.2, Lt.z); this.scene.add(r); });
      this.label(this.scene, `${Lt.name}<small>${Math.round(p * 100)}% full</small>`, V3(Lt.x, 18, Lt.z), p >= 0.9 ? 'lbl--red lbl--sm' : 'lbl--sm', 520);
    });
    const route = s.shuttleRoute.map(([x, z]) => V3(x, 1.6, z));
    this.scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(route),
      new THREE.LineBasicMaterial({ color: C(T.rune2).multiplyScalar(1.4), toneMapped: false, transparent: true, opacity: 0.6 })));
    const lens = [0]; for (let i = 1; i < route.length; i++) lens.push(lens[i - 1] + route[i].distanceTo(route[i - 1]));
    const total = lens[lens.length - 1];
    const sm = new THREE.MeshBasicMaterial({ color: C(T.rune2).multiplyScalar(2.2), toneMapped: false });
    for (let k = 0; k < s.shuttles; k++) {
      const bus = new THREE.Mesh(new THREE.BoxGeometry(4, 2, 2), sm); bus.position.y = 2.6; this.scene.add(bus);
      this.anim.push(t => {
        let d = ((t / 70 + k / s.shuttles) % 1) * total, i = 1;
        while (i < lens.length - 1 && lens[i] < d) i++;
        const u = (d - lens[i - 1]) / (lens[i] - lens[i - 1]);
        bus.position.x = route[i - 1].x + (route[i].x - route[i - 1].x) * u;
        bus.position.z = route[i - 1].z + (route[i].z - route[i - 1].z) * u;
        bus.rotation.y = Math.atan2(-(route[i].z - route[i - 1].z), route[i].x - route[i - 1].x);
      });
    }
  }

  // PS-09 · the 221 Atlas assets as light pins; restricted ones in amber with a ring
  buildAssets(s, T) {
    const COL = { hosp: T.rune2, clin: T.rune, poli: T.violet, ghat: T.amber, toil: T.rune, staf: T.amber, cont: T.amber };
    const list = s.assets.filter(a => a[2] !== 'ghat');
    const pin = new THREE.CylinderGeometry(0.3, 0.3, 1, 5).translate(0, 0.5, 0);
    const head = new THREE.SphereGeometry(1, 8, 6);
    const pins = new THREE.InstancedMesh(pin, new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, opacity: 0.55 }), list.length);
    const heads = new THREE.InstancedMesh(head, new THREE.MeshBasicMaterial({ toneMapped: false }), list.length);
    const m = new THREE.Matrix4(), c = new THREE.Color();
    list.forEach(([x, z, type, restricted], i) => {
      const h = restricted ? 16 : type === 'poli' ? 13 : 9;
      pins.setMatrixAt(i, m.makeScale(1, h, 1).setPosition(x, 0, z));
      heads.setMatrixAt(i, m.makeScale(1.1, 1.1, 1.1).setPosition(x, h, z));
      c.set(restricted ? T.amber : COL[type] || T.rune); pins.setColorAt(i, c); heads.setColorAt(i, c.multiplyScalar(1.8));
      if (restricted) {
        const ring = new THREE.Mesh(new THREE.RingGeometry(5, 5.8, 40), new THREE.MeshBasicMaterial({ color: C(T.amber).multiplyScalar(1.8), toneMapped: false, side: THREE.DoubleSide, transparent: true, opacity: 0.8 }));
        ring.rotation.x = -Math.PI / 2; ring.position.set(x, 1.3, z); this.scene.add(ring);
      }
    });
    this.scene.add(pins, heads);
    pins.scale.y = heads.scale.y = 0.001;
    this.anim.push((t, aw) => { const k = THREE.MathUtils.smoothstep(aw, 0.5, 0.9); pins.scale.y = heads.scale.y = Math.max(0.001, k); });
  }

  buildBeam(s) {
    const [cx, cz] = s.focus;
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false,
      uniforms: { col: { value: C(s.beam.color) }, t: { value: 0 }, a: { value: 0 } },
      vertexShader: `varying vec2 vUv; varying vec3 vN, vV; void main(){ vUv=uv; vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.); vV=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }`,
      fragmentShader: `uniform vec3 col; uniform float t,a; varying vec2 vUv; varying vec3 vN,vV;
        void main(){ float rim=pow(abs(dot(vN,vV)),1.5); float fade=smoothstep(1.,.0,vUv.y)*smoothstep(0.,.02,vUv.y);
          float flick=.85+.15*sin(t*7.+vUv.y*40.); gl_FragColor=vec4(col*1.25,rim*rim*fade*flick*a*.75); }`,
    });
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(s.beam.width, s.beam.width * 1.4, s.beam.height, 24, 1, true), mat);
    beam.geometry.translate(0, s.beam.height / 2, 0);
    beam.position.set(cx, 0, cz);
    this.scene.add(beam);
    const halo = new THREE.Mesh(new THREE.CylinderGeometry(s.beam.width * 4, s.beam.width * 6, s.beam.height * 0.6, 24, 1, true), mat.clone());
    halo.material.uniforms.col.value = C(s.beam.color).multiplyScalar(0.25);
    halo.geometry.translate(0, s.beam.height * 0.3, 0); halo.position.copy(beam.position);
    this.scene.add(halo);

    // rune circles on the water at the foot of the beam
    const T = this.cfg.theme, ringsGrp = new THREE.Group();
    [8, 14, 22, 30].forEach((r, i) => {
      const ring = new THREE.Mesh(new THREE.RingGeometry(r, r + (i % 2 ? 0.4 : 0.8), 96),
        new THREE.MeshBasicMaterial({ color: C(i % 2 ? T.rune2 : T.rune).multiplyScalar(1.6), toneMapped: false, transparent: true, opacity: 0.85, side: THREE.DoubleSide }));
      ring.rotation.x = -Math.PI / 2; ringsGrp.add(ring);
      this.anim.push(t => { ring.rotation.z = t * 0.05 * (i % 2 ? -1 : 1); });
    });
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.6, i % 4 ? 2 : 4),
        new THREE.MeshBasicMaterial({ color: C(T.rune).multiplyScalar(1.4), toneMapped: false, side: THREE.DoubleSide }));
      m.position.set(Math.cos(a) * 26, 0, Math.sin(a) * 26); m.rotation.set(-Math.PI / 2, 0, -a + Math.PI / 2);
      ringsGrp.add(m);
    }
    ringsGrp.position.set(cx - 6, 0.7, cz); this.scene.add(ringsGrp);
    this.anim.push((t, aw) => {
      mat.uniforms.t.value = t; const a = THREE.MathUtils.smoothstep(aw, 0.55, 0.9);
      mat.uniforms.a.value = a; halo.material.uniforms.a.value = a * 0.25; halo.material.uniforms.t.value = t;
      ringsGrp.rotation.y = t * 0.02; ringsGrp.scale.setScalar(Math.max(0.001, THREE.MathUtils.smoothstep(aw, 0.3, 0.8)));
    });
  }

  // the GiVa mark floating over the lit ghat, glowing in the sigil colour (replaces ESYA's hex sigil)
  buildSigil(s) {
    const [cx, cz] = s.focus;
    const tex = new THREE.TextureLoader().load(MEDIA['giva-mark']); tex.colorSpace = THREE.SRGBColorSpace;
    const w = 46, h = w * 334 / 512;
    const grp = new THREE.Group();
    const mk = (color, scale, op, blend) => {
      const mat = new THREE.MeshBasicMaterial({ map: tex, color, transparent: true, opacity: op, depthWrite: false, toneMapped: false, side: THREE.FrontSide });
      if (blend) mat.blending = blend;
      const front = new THREE.Mesh(new THREE.PlaneGeometry(w * scale, h * scale), mat);
      const back = front.clone(); back.rotation.y = Math.PI;       // readable from both sides
      grp.add(front, back);
    };
    mk(C(this.cfg.theme.rune2).multiplyScalar(0.8), 1.07, 0.6, THREE.AdditiveBlending);   // cyan halo
    mk(C(s.sigil.color).multiplyScalar(1.5), 1, 1, undefined);
    grp.scale.setScalar(s.sigil.scale);
    grp.position.set(cx, s.sigil.y, cz);
    this.scene.add(grp);
    this.anim.push((t, aw) => {
      grp.rotation.y = t * s.sigil.spin;
      grp.position.y = s.sigil.y + Math.sin(t * 0.8) * 2;
      const k = THREE.MathUtils.smoothstep(aw, 0.6, 1);
      grp.scale.setScalar(s.sigil.scale * Math.max(0.001, k));
    });
  }

  // light trails from the hub (the sigil) out to registered assets
  buildArcs(s, rand) {
    const [cx, cz] = s.focus;
    const targets = s.assets.filter(a => Math.hypot(a[0] - cx, a[1] - cz) > 120);
    for (let i = 0; i < s.arcs.count && targets.length; i++) {
      const A = targets[Math.floor(rand() * targets.length)];
      const end = V3(A[0], 8, A[1]), start = V3(cx, s.sigil.y, cz);
      const mid = start.clone().lerp(end, 0.5); mid.y = 110 + rand() * 120;
      const mat = trailMaterial(i % 3 ? s.arcs.color1 : s.arcs.color2, rand);
      this.scene.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(start, mid, end), 80, 0.18, 4, false), mat));
      const sp = s.arcs.speed * (0.6 + rand() * 0.8);
      this.anim.push((t, aw) => { mat.uniforms.t.value = t * sp; mat.uniforms.a.value = THREE.MathUtils.smoothstep(aw, 0.7, 1); });
    }
  }

  // diyas on the ghat steps, and floating diyas drifting downstream
  buildDiyas(s, rand) {
    const m1 = lampMaterial(s.diyas.color, 2.6);
    this.scene.add(lampPoints(this.ghatLamps, m1, rand));
    const n = s.diyas.count, P = new Float32Array(n * 3), off = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const z = -300 + rand() * 1300; off[i] = 4 + Math.pow(rand(), 2) * 150;
      P.set([bankX(s.eastBank, z) - off[i], 0.9, z], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(P, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(new Float32Array(n).map(() => rand()), 1));
    const m2 = lampMaterial(s.diyas.color, 2.2);
    this.scene.add(new THREE.Points(g, m2));
    this.anim.push((t, aw, dt) => {
      [m1, m2].forEach((m, k) => { m.uniforms.t.value = t; m.uniforms.a.value = THREE.MathUtils.smoothstep(aw, 0.65 + k * 0.1, 1); });
      for (let i = 0; i < n; i++) {
        let z = P[i * 3 + 2] + s.diyas.drift * dt * (0.6 + (i % 7) * 0.1);
        if (z > 1000) z -= 1300;
        P[i * 3 + 2] = z; P[i * 3] = bankX(s.eastBank, z) - off[i] + Math.sin(t * 0.3 + i) * 0.6;
      }
      g.attributes.position.needsUpdate = true;
    });
  }

  buildLandmarks(s, T) {
    s.landmarks.forEach(L => {
      const pole = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V3(L.x, 0, L.z), V3(L.x, L.h + 20, L.z)]),
        new THREE.LineBasicMaterial({ color: C(T.amber).multiplyScalar(1.3), toneMapped: false, transparent: true, opacity: 0.7 }));
      this.scene.add(pole);
      this.label(this.scene, L.name, V3(L.x, L.h + 28, L.z), 'lbl--sm', 1800);
    });
  }

  buildBillboards(s, T) {
    s.billboards.forEach(b => {
      const title = b.tier === 'title';
      const col = title ? T.amber : T.rune;
      const h = b.w * (title ? 0.42 : 0.28);
      const tex = title
        ? textTexture({ w: 1400, h: 600, color: col, bg: 'rgba(8,8,6,0.55)', lines: [
          { text: b.heading || '', size: 54, y: 70, x: 60, align: 'left' },
          { text: b.text, size: 150, y: 290, font: 'Syncopate', weight: 700, color: '#e7eeea' },
          { text: b.sub || '', size: 46, y: 440, color: 'rgba(231,238,234,.45)', weight: 400 }] })
        : textTexture({ w: 512, h: 150, color: col, lines: [{ text: b.text, size: 50, y: 78, weight: 700 }] });
      const k = title ? 1 : 1.5, mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, toneMapped: false, color: new THREE.Color(k, k, k) });
      mat.side = THREE.FrontSide;   // two front-facing panels, so the text reads from both sides
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(b.w, h), mat);
      const backPanel = panel.clone(); backPanel.rotation.y = Math.PI;
      const g = new THREE.Group(); g.position.set(b.x, b.y, b.z); g.rotation.y = -deg(b.rot);
      g.add(panel, backPanel);
      if (!title) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, b.y), new THREE.MeshBasicMaterial({ color: 0x223038 }));
        pole.position.y = -b.y / 2; g.add(pole);
      }
      this.scene.add(g);
      this.anim.push(t => { mat.opacity = 0.85 + Math.sin(t * 3 + b.x) * 0.05 + (Math.random() < 0.01 ? -0.4 : 0); });
    });
  }

  buildHolos(s) {
    this.holos = [];
    const loader = new THREE.TextureLoader();
    s.holos.forEach((H, i) => {
      const h = H.w * 0.6;
      let tex;
      const src = H.img ? MEDIA[H.img] || H.img : '';
      if (src) { tex = loader.load(src); tex.colorSpace = THREE.SRGBColorSpace; }
      else {
        const cv = document.createElement('canvas'); cv.width = 320; cv.height = 192;
        const g = cv.getContext('2d'), r = rng(40 + i);
        g.fillStyle = '#0a0f1c'; g.fillRect(0, 0, 320, 192);
        for (let k = 0; k < 60; k++) {
          g.fillStyle = `hsla(${180 + r() * 120},70%,${20 + r() * 45}%,${0.25 + r() * 0.5})`;
          g.fillRect(r() * 320, r() * 192, 10 + r() * 80, 6 + r() * 50);
        }
        tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
      }
      const mat = new THREE.ShaderMaterial({
        transparent: true, side: THREE.DoubleSide, depthWrite: false, toneMapped: false,
        uniforms: { map: { value: tex }, tint: { value: C(H.color) }, t: { value: 0 }, op: { value: 1 } },
        vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
        fragmentShader: `uniform sampler2D map; uniform vec3 tint; uniform float t,op; varying vec2 vUv;
          void main(){ vec2 uv=vUv; uv.x+=sin(uv.y*80.+t*6.)*.002;
            vec3 c=texture2D(map,uv).rgb; c=mix(c,c*tint*1.6,.35);
            float scan=.78+.22*sin(uv.y*400.-t*8.);
            float edge=max(smoothstep(.985,1.,max(abs(uv.x-.5),abs(uv.y-.5))*2.),0.);
            gl_FragColor=vec4(c*scan*1.05+tint*edge*1.6,.86*op); }`,
      });
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(H.w, h), mat);
      const back = new THREE.Mesh(new THREE.BoxGeometry(H.w * 1.02, h * 1.02, 6),
        new THREE.MeshBasicMaterial({ color: C(H.color).multiplyScalar(0.25), transparent: true, opacity: 0.25, depthWrite: false }));
      back.position.z = -3.2;
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(back.geometry),
        new THREE.LineBasicMaterial({ color: C(H.color).multiplyScalar(1.4), toneMapped: false, transparent: true }));
      edges.position.z = -3.2;
      const g = new THREE.Group(); g.add(back, plane, edges);
      g.position.set(H.x, H.y, H.z); g.rotation.y = Math.PI + (i % 2 ? -1 : 1) * 0.3;   // face back up-river, towards the camera
      const el = this.label(g, H.caption, V3(0, -h / 2 - 8, 0), 'lbl--cap', 900);
      this.scene.add(g);
      this.holos.push(g);
      const baseOp = back.material.opacity;
      this.anim.push(t => {
        mat.uniforms.t.value = t; g.position.y = H.y + Math.sin(t * 0.6 + i) * 2;
        // only materialise while the page is in the Proof fly-through (main.js sets holoGate)
        const v = this.holoMix;
        g.visible = v > 0.01; mat.uniforms.op.value = v; back.material.opacity = baseOp * v;
        edges.material.opacity = v; el.style.visibility = v > 0.3 ? 'visible' : 'hidden';
      });
    });
  }

  // ── camera rig ────────────────────────────────────────────────────────────
  setShot(pos, target, dim) {
    this.goalPos.copy(pos); this.goalTgt.copy(target); this.goalDim = dim;
  }

  setExplore(on) {
    this.exploring = on;
    this.controls.enabled = on;
    if (on) { this.controls.target.copy(this.camTgt); this.camera.position.copy(this.camPos); }
    else { this.camPos.copy(this.camera.position); this.camTgt.copy(this.controls.target); }
  }

  replayAwakening() { this.awakenStart = this.clock.elapsedTime; }

  resize() {
    this.camera.aspect = innerWidth / innerHeight; this.camera.updateProjectionMatrix();
    this.renderer.setSize(innerWidth, innerHeight); this.composer.setSize(innerWidth, innerHeight);
    this.bloom.setSize(innerWidth / 2, innerHeight / 2);
    this.labels.setSize(innerWidth, innerHeight);
  }

  tick() {
    const dt = Math.min(this.clock.getDelta(), 0.05), t = this.clock.elapsedTime;
    if (this.awakenStart === null) this.awakenStart = t;
    const aw = (this.awaken = Math.min(1, Math.max(0, (t - this.awakenStart) / 4.6)));

    this.risers.forEach(r => {
      const k = THREE.MathUtils.smoothstep(aw, r.delay, r.delay + 0.45);
      r.grp.scale.y = Math.max(0.001, 1 - Math.pow(1 - k, 3));
      const lit = THREE.MathUtils.smoothstep(aw, r.delay + 0.3, r.delay + 0.7);
      r.mats.forEach(m => (m.emissiveIntensity = lit * 0.85));
      r.edges.forEach(m => (m.opacity = Math.min(1, k * 1.4) * r.edgeOp));
      r.fills?.forEach(m => (m.opacity = k * r.fillOp));
    });
    const cityLit = THREE.MathUtils.smoothstep(aw, 0.2, 0.9) * 0.55;
    this.cityMats?.forEach(m => (m.emissiveIntensity = cityLit));
    this.anim.forEach(f => f(t, aw, dt));

    if (this.exploring) {
      this.controls.update();
    } else {
      const k = 1 - Math.pow(0.0015, dt);      // frame-rate independent damping
      this.camPos.lerp(this.goalPos, k); this.camTgt.lerp(this.goalTgt, k);
      const par = this.cfg.scene.camera.parallax;
      this.camera.position.copy(this.camPos).add(V3(this.mouse.x * par, -this.mouse.y * par * 0.6, 0));
      this.camera.lookAt(this.camTgt);
    }
    this.dim += (this.goalDim - this.dim) * Math.min(1, dt * 4);
    this.holoMix += ((this.exploring ? this.holoMix : this.holoGate) - this.holoMix) * Math.min(1, dt * 3);
    this.finish.uniforms.uDim.value = this.exploring ? 0 : this.dim;
    this.finish.uniforms.uTime.value = t;

    // labels fade with distance (per label), with the dim level, and wait for the arrival
    const camP = this.camera.position, wp = new THREE.Vector3();
    const arrived = THREE.MathUtils.smoothstep(aw, 0.75, 1);
    this.labelObjs.forEach(({ o, el, far }) => {
      o.getWorldPosition(wp);
      const d = wp.distanceTo(camP);
      const vis = THREE.MathUtils.clamp(1.6 - (d / far) * 1.6, 0, 1) * (1 - this.dim) * arrived;
      el.style.opacity = vis.toFixed(3);
    });

    this.composer.render();
    this.labels.render(this.scene, this.camera);
  }
}

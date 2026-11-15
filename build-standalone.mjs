// Bundles everything (three.js included) into ONE self-contained HTML file.
import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const r = await build({ entryPoints: ['src/main.js'], bundle: true, minify: true, format: 'esm', write: false, outdir: 'out', loader: { '.css': 'css' } });
const js = r.outputFiles.find(f => f.path.endsWith('.js')).text;
const css = r.outputFiles.find(f => f.path.endsWith('.css')).text;
let html = readFileSync('index.html', 'utf8')
  .replace('<script type="module" src="./src/main.js"></script>', () => `<script type="module">${js.replace(/<\/script/g, '<\\/script')}</script>`)
  .replace('</head>', () => `<style>${css}</style>\n</head>`);
mkdirSync('dist-standalone', { recursive: true });
writeFileSync('dist-standalone/godavari-command.html', html);
console.log('standalone:', (html.length / 1024).toFixed(0), 'KB');

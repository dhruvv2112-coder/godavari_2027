// Writes the default content to dist-standalone/config.json — the file the live site reads
// and the editor's Publish button overwrites. Run once after changing src/config.js defaults
// (it does NOT overwrite a published config unless you pass --force).
import { writeFileSync, existsSync } from 'node:fs';
import { DEFAULT_CONFIG } from '../src/config.js';
const out = new URL('../dist-standalone/config.json', import.meta.url);
if (existsSync(out) && !process.argv.includes('--force')) { console.log('config.json exists — keeping the published content (use --force to reset)'); process.exit(0); }
writeFileSync(out, JSON.stringify(DEFAULT_CONFIG, null, 2) + '\n');
console.log('wrote', out.pathname);

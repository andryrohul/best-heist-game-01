// main.ts — the entrypoint: copies game/ and screenshots/ from this
// repository into the output directory and writes /output/dossier.json
// with buildDossier from vendor/makefun-game.ts. Node standard library
// only; no install, no network, deterministic across runs.

import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

function copyTree(name: string): void {
  const src = join(repoRoot, name);
  const dest = join(outDir, name);
  if (!existsSync(src)) throw new Error(`missing ${name}/ in repository`);
  cpSync(src, dest, { recursive: true });
}

mkdirSync(outDir, { recursive: true });
rmSync(join(outDir, 'game'), { recursive: true, force: true });
rmSync(join(outDir, 'screenshots'), { recursive: true, force: true });
copyTree('game');
copyTree('screenshots');

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);

// Sanity echo so a local run shows what landed in the output.
const gameFiles = readFileSync(join(outDir, 'dossier.json'), 'utf8');
console.log(`dossier.json: ${Buffer.byteLength(gameFiles, 'utf8')} bytes`);
console.log(`output: ${outDir}`);

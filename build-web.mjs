// Builds the offline web bundle into ./www (this is what Capacitor packs into the APK):
//   www/index.html   <- src/index.html
//   www/app.css      <- Tailwind compiled from src/input.css (replaces the Tailwind CDN script)
//   www/fonts/...    <- Cairo + Inter bundled locally (replaces Google Fonts)
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'www');
const require = createRequire(import.meta.url);

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

// 1) HTML
cpSync(join(root, 'src', 'index.html'), join(out, 'index.html'));

// 2) Tailwind CSS (v3, same version the page used from the CDN)
const tailwindCli = require.resolve('tailwindcss/lib/cli.js');
execFileSync(
  process.execPath,
  [tailwindCli, '-c', 'tailwind.config.js', '-i', 'src/input.css', '-o', 'www/app.css', '--minify'],
  { cwd: root, stdio: 'inherit' },
);

// 3) Fonts: copy each fontsource package's index.css + only the font files we need
const fonts = [
  // Cairo: Arabic + Latin (+ Latin-ext) subsets
  { pkg: '@fontsource-variable/cairo', dir: 'cairo', keep: /-wght-normal\.woff2$/ },
  // Inter: Latin subsets only (used for digits and Latin text)
  { pkg: '@fontsource-variable/inter', dir: 'inter', keep: /-latin(-ext)?-wght-normal\.woff2$/ },
];

for (const { pkg, dir, keep } of fonts) {
  const src = join(root, 'node_modules', ...pkg.split('/'));
  if (!existsSync(join(src, 'index.css'))) {
    throw new Error(`Font package ${pkg} is missing - did "npm install" run?`);
  }
  const dest = join(out, 'fonts', dir);
  mkdirSync(join(dest, 'files'), { recursive: true });
  cpSync(join(src, 'index.css'), join(dest, 'index.css'));

  const files = readdirSync(join(src, 'files')).filter((f) => keep.test(f));
  if (files.length === 0) throw new Error(`No matching font files found in ${pkg}/files`);
  for (const f of files) cpSync(join(src, 'files', f), join(dest, 'files', f));
  console.log(`[fonts] ${pkg}: ${files.length} files`);
}

console.log('[build] done -> www/');

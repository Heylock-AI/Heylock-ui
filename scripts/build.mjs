#!/usr/bin/env node
// Build script for @heylock-dev/ui
// - Bundles ESM with esbuild
// - Copies manual type definitions
// - Preserves JSX (React 18) transpilation to modern JS
// - Marks peer deps as externals

import { build } from 'esbuild';
import { mkdir, rm, cp, writeFile, readFile } from 'fs/promises';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outdir = path.join(root, 'dist');

async function clean(){
  await rm(outdir, { recursive: true, force: true });
  await mkdir(outdir, { recursive: true });
}

const isProd = process.argv.includes('--prod');

async function bundle(){
  await build({
    entryPoints: [path.join(root, 'src/components/index.js')],
    outfile: path.join(outdir, 'index.js'),
    format: 'esm',
    platform: 'browser',
    target: ['es2019'],
    bundle: true,
    sourcemap: isProd ? false : true,
    minify: isProd,
    external: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'heylock',
      'framer-motion',
      'tailwind-merge'
    ],
    jsx: 'automatic',
    logLevel: 'info',
    treeShaking: true,
    legalComments: 'none'
  });
}

async function copyTypes(){
  // Single aggregated manual types file at src/types.d.ts
  const srcTypes = path.join(root, 'src/types.d.ts');
  const dstTypes = path.join(outdir, 'types.d.ts');
  const content = await readFile(srcTypes, 'utf8');
  // Append export * convenience if not present
  let augmented = content.trim();
  if(!/declare\s+module/.test(augmented)){
    augmented += '\n';
  }
  await writeFile(dstTypes, augmented, 'utf8');
}

async function writePackageJsonStub(){
  // Ensure package consumers resolving subpath have correct type mapping (already defined at root package.json exports)
  const pkgPath = path.join(root, 'package.json');
  const raw = JSON.parse(await readFile(pkgPath, 'utf8'));
  // Minimal check for correct fields
  if(raw.type !== 'module'){
    console.warn('Warning: root package.json missing type:module');
  }
}

(async () => {
  try {
    console.log('[build] cleaning');
    await clean();
  console.log(`[build] bundling (prod=${isProd})`);
    await bundle();
    console.log('[build] copying types');
    await copyTypes();
    await writePackageJsonStub();
    console.log('[build] done');
  } catch (err){
    console.error('Build failed:', err);
    process.exit(1);
  }
})();

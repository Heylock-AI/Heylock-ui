#!/usr/bin/env node
// Smoke test that validates exported component symbols without loading real 'heylock' package.
// We create an ephemeral bundle that stubs the 'heylock' module via an esbuild plugin.
import path from 'path';
import url from 'url';
import assert from 'assert';
import { build } from 'esbuild';
import { mkdtemp, rm, writeFile, readFile } from 'fs/promises';
import os from 'os';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const distEntry = path.join(root, 'dist/index.js');

async function createTempDir(){
  return await mkdtemp(path.join(os.tmpdir(), 'heylock-ui-smoke-'));
}

async function bundleWithStub(outFile){
  await build({
    entryPoints: [distEntry],
    outfile: outFile,
    format: 'esm',
    bundle: true,
    platform: 'browser',
    target: ['es2019'],
    logLevel: 'silent',
    plugins: [
      {
        name: 'stub-heylock',
        setup(build){
          build.onResolve({ filter: /^heylock$/ }, () => ({ namespace: 'stub', path: 'heylock' }));
          build.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({
            contents: `export default {
  isInitialized: true,
  usageRemaining: { messages: 999 },
  onInitialized(cb){ cb(true); return () => {}; },
  onMessageHistoryChange(){ return () => {}; },
  messageHistory: [],
  messageStream: async function*(){ if(false) yield ''; }
};`,
            loader: 'js'
          }));
        }
      }
    ]
  });
}

(async () => {
  const tmp = await createTempDir();
  const outFile = path.join(tmp, 'bundle.mjs');
  try {
    await bundleWithStub(outFile);
    const mod = await import(url.pathToFileURL(outFile).href);
    assert(typeof mod.HeylockProvider === 'function', 'HeylockProvider export missing');
    assert(typeof mod.HeylockInput === 'function', 'HeylockInput export missing');
    assert(typeof mod.HeylockMessages === 'function', 'HeylockMessages export missing');
    assert(typeof mod.HeylockExpandingChat === 'function', 'HeylockExpandingChat export missing');
    console.log('\x1b[32mSmoke test passed: all expected exports present (stubbed heylock).\x1b[0m');
  } catch (err){
    console.error('\x1b[31mSmoke test failed:\x1b[0m', err);
    process.exit(1);
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
})();

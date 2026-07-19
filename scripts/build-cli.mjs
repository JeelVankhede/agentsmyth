#!/usr/bin/env node
/**
 * Compiles src/cli/ source into bin/ output for the npm package.
 *
 * Outputs:
 *   bin/prompts.mjs — @clack/prompts bundled in; bin/agentsmyth.mjs imports from this file.
 *     Bundled at build time so @clack/prompts stays a devDependency only — consumers never
 *     see it as a runtime dependency, only this self-contained compiled output.
 */

import { build } from 'esbuild';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

await build({
  entryPoints: [join(root, 'src', 'cli', 'prompts.mjs')],
  outfile: join(root, 'bin', 'prompts.mjs'),
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node18',
  logLevel: 'silent',
});

console.log('copied  bin/prompts.mjs');

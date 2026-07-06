#!/usr/bin/env node
// R4 negative test suite — each fixture must be rejected (non-zero exit) by check-artifacts.
// Confirmed validator gaps are reported; any gap here is a contract regression.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const validator = join(repoRoot, '.workflow', 'validators', 'check-artifacts.mjs');

const fixtures = [
  {
    id: 'a',
    dir: 'test/fixtures/lifecycle-violations/a-plan-missing-section',
    description: 'Plan missing required Verification Plan section',
  },
  {
    id: 'b',
    dir: 'test/fixtures/lifecycle-violations/b-manifest-gap',
    description: 'Task manifest_ids reference R99 absent from upstream brief',
  },
  {
    id: 'c',
    dir: 'test/fixtures/lifecycle-violations/c-ready-with-blocker',
    description: 'Ship claims ready-for-next-phase with unresolved blocker Q1',
  },
  {
    id: 'd',
    dir: 'test/fixtures/lifecycle-violations/d-phase-mismatch',
    description: 'Task artifact has orchestration.phase: review (mismatch — lives in tasks/)',
  },
];

let passed = 0;
let gaps = 0;

for (const fixture of fixtures) {
  const result = spawnSync(
    process.execPath,
    [validator, '--dir', fixture.dir],
    { cwd: repoRoot, encoding: 'utf8' }
  );

  const detected = result.status !== 0;

  if (detected) {
    console.log(`[PASS] ${fixture.id}: ${fixture.description}`);
    passed++;
  } else {
    console.error(`[GAP]  ${fixture.id}: ${fixture.description}`);
    console.error(`       validator did not reject this fixture — confirmed gap`);
    if (result.stdout) console.error(`       stdout: ${result.stdout.trim()}`);
    gaps++;
  }
}

console.log(`\n${passed}/${fixtures.length} violations detected`);

if (gaps > 0) {
  console.error(`${gaps} confirmed validator gap(s) — fix before wiring more call sites`);
  process.exit(1);
}

#!/usr/bin/env node
// Regression suite for check-setup-complete.mjs's definitions_root awareness (R1/R2/RI1 of
// wp-r13-setup-validator-definitions-root). check-setup-complete.mjs resolves its own repo root
// via git-toplevel detection (resolveRepoRoot()), which means each fixture needs a real, isolated
// git repo at its own root — otherwise git would climb up and resolve to this repo's own real
// toplevel instead of the fixture. Fixtures are committed here without a nested .git (which this
// repo's own git would treat as a submodule reference); this runner copies each one into an
// isolated OS temp directory and runs `git init` there at test time instead.
import { spawnSync, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { mkdtempSync, cpSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const validator = join(repoRoot, 'src', 'workflow', 'validators', 'check-setup-complete.mjs');
const fixturesRoot = join(repoRoot, 'test', 'fixtures', 'setup-validator-definitions-root');

function runAgainstFixture(fixtureName) {
  const scratchDir = mkdtempSync(join(tmpdir(), `agentsmyth-setup-validator-${fixtureName}-`));
  try {
    cpSync(join(fixturesRoot, fixtureName), scratchDir, { recursive: true });
    execFileSync('git', ['init', '-q'], { cwd: scratchDir });
    return spawnSync(process.execPath, [validator], { cwd: scratchDir, encoding: 'utf8' });
  } finally {
    rmSync(scratchDir, { recursive: true, force: true });
  }
}

const cases = [
  {
    id: 'linked',
    description: 'definitions_root set, no local definitions tree — must pass',
    fixture: 'linked',
    expectPass: true,
  },
  {
    id: 'defensive-fallback',
    description: 'no definitions_root, full local definitions tree present — must pass (unchanged behavior)',
    fixture: 'defensive-fallback',
    expectPass: true,
  },
  {
    id: 'defensive-fallback-broken',
    description: 'no definitions_root, router.md genuinely missing — must still fail (no regression)',
    fixture: 'defensive-fallback-broken',
    expectPass: false,
  },
];

let passed = 0;
let gaps = 0;

for (const testCase of cases) {
  const result = runAgainstFixture(testCase.fixture);
  const actuallyPassed = result.status === 0;
  const ok = actuallyPassed === testCase.expectPass;

  if (ok) {
    console.log(`[PASS] ${testCase.id}: ${testCase.description}`);
    passed++;
  } else {
    console.error(`[GAP]  ${testCase.id}: ${testCase.description}`);
    console.error(`       expected pass=${testCase.expectPass}, got pass=${actuallyPassed}`);
    if (result.stdout) console.error(`       stdout: ${result.stdout.trim()}`);
    if (result.stderr) console.error(`       stderr: ${result.stderr.trim()}`);
    gaps++;
  }
}

console.log(`\n${passed}/${cases.length} setup-validator definitions_root cases correct`);

if (gaps > 0) {
  console.error(`${gaps} confirmed gap(s) in check-setup-complete.mjs's definitions_root handling`);
  process.exit(1);
}

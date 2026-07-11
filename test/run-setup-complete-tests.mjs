#!/usr/bin/env node
// Regression test for the R2 fix (audit-validator-fixture-gaps): check-setup-complete.mjs's
// domain.name/domain.summary regex checks previously lacked the `m` flag and could never match
// real domain.yaml content. Runs the real validator (not a duplicated copy of its regex logic)
// against two minimal fixtures in isolated temp directories, asserting only the two targeted
// error lines behave correctly — every other check-setup-complete.mjs error (missing workflow
// tree, etc.) is expected and irrelevant here.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const validator = join(repoRoot, 'src', 'workflow', 'validators', 'check-setup-complete.mjs');

const NAME_ERROR = 'domain.name must be a non-empty string';
const SUMMARY_ERROR = 'domain.summary must be a non-empty string';

function runAgainstFixture(fixtureFile) {
  const tmp = mkdtempSync(join(tmpdir(), 'setup-complete-test-'));
  mkdirSync(join(tmp, 'workflow', 'config'), { recursive: true });
  copyFileSync(
    join(repoRoot, 'test', 'fixtures', 'setup-complete', fixtureFile),
    join(tmp, 'workflow', 'config', 'domain.yaml')
  );

  const result = spawnSync(process.execPath, [validator], { cwd: tmp, encoding: 'utf8' });
  rmSync(tmp, { recursive: true, force: true });
  return result.stderr ?? '';
}

let passed = 0;
let failed = 0;

function check(id, description, condition) {
  if (condition) {
    console.log(`[PASS] ${id}: ${description}`);
    passed++;
  } else {
    console.error(`[FAIL] ${id}: ${description}`);
    failed++;
  }
}

const validStderr = runAgainstFixture('domain-valid.yaml');
check('valid-name', 'valid fixture does not report domain.name empty', !validStderr.includes(NAME_ERROR));
check('valid-summary', 'valid fixture does not report domain.summary empty', !validStderr.includes(SUMMARY_ERROR));

const emptyStderr = runAgainstFixture('domain-empty.yaml');
check('empty-name', 'empty fixture correctly reports domain.name empty', emptyStderr.includes(NAME_ERROR));
check('empty-summary', 'empty fixture correctly reports domain.summary empty', emptyStderr.includes(SUMMARY_ERROR));

console.log(`\n${passed}/${passed + failed} setup-complete regex checks passed`);

if (failed > 0) {
  console.error(`${failed} check(s) failed`);
  process.exit(1);
}

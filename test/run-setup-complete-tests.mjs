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

// deepen-setup-interview-v1 (R1): definitionsRootIsSet() must also treat AGENTSMYTH_HOME as
// equivalent to a repo-profile.yaml definitions_root field — matching lib.mjs's own two-root
// resolver (definitions_root -> AGENTSMYTH_HOME -> repo-local fallback) — otherwise folding this
// validator into `agentsmyth check` falsely treats this repo's own dev workspace (which uses
// AGENTSMYTH_HOME=src/workflow, never a committed definitions_root) as an unlinked consumer repo
// needing a full local workflow/ tree it was never meant to have. Found live this session.
function runWithHomeEnv(extraEnv) {
  const tmp = mkdtempSync(join(tmpdir(), 'setup-complete-defsroot-test-'));
  mkdirSync(join(tmp, 'workflow', 'config'), { recursive: true });
  mkdirSync(join(tmp, 'workflow', 'artifacts'), { recursive: true });
  mkdirSync(join(tmp, 'workflow', 'learnings'), { recursive: true });
  copyFileSync(
    join(repoRoot, 'test', 'fixtures', 'setup-complete', 'domain-valid.yaml'),
    join(tmp, 'workflow', 'config', 'domain.yaml')
  );
  // No repo-profile.yaml definitions_root field at all — same shape as this repo's own config.
  const result = spawnSync(process.execPath, [validator], {
    cwd: tmp, encoding: 'utf8', env: { ...process.env, ...extraEnv },
  });
  rmSync(tmp, { recursive: true, force: true });
  return result.stderr ?? '';
}

const noHomeStderr = runWithHomeEnv({ AGENTSMYTH_HOME: '' });
check('no-agentsmyth-home', 'without AGENTSMYTH_HOME, no definitions_root: still requires the full local workflow/ tree',
  noHomeStderr.includes('workflow/router.md is missing'));

const withHomeStderr = runWithHomeEnv({ AGENTSMYTH_HOME: 'src/workflow' });
check('with-agentsmyth-home', 'AGENTSMYTH_HOME set is treated as equivalent to a linked definitions_root — no full local tree required',
  !withHomeStderr.includes('workflow/router.md is missing'));

console.log(`\n${passed}/${passed + failed} setup-complete regex checks passed`);

if (failed > 0) {
  console.error(`${failed} check(s) failed`);
  process.exit(1);
}

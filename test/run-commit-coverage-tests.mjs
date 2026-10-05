#!/usr/bin/env node
// Regression test for check-commit-coverage.mjs (mandatory-lifecycle-pre-commit-hook-v1's
// staged-diff coverage validator). Builds a real scratch git repo per scenario, stages real
// files, and runs the validator as a real subprocess against it — not a mock of git or the
// validator's own file-reading, since both are exactly what a real pre-commit invocation exercises.
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, realpathSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const validatorPath = join(repoRoot, 'src', 'workflow', 'validators', 'check-commit-coverage.mjs');

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

function scratchRepo(prefix) {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), prefix)));
  spawnSync('git', ['init', '-q'], { cwd: dir });
  spawnSync('git', ['config', 'user.email', 'test@example.com'], { cwd: dir });
  spawnSync('git', ['config', 'user.name', 'Test'], { cwd: dir });
  mkdirSync(join(dir, 'workflow', 'config'), { recursive: true });
  mkdirSync(join(dir, 'workflow', 'artifacts', 'tasks'), { recursive: true });
  writeFileSync(join(dir, 'workflow', 'config', 'repo-profile.yaml'), 'repository:\n  default_branch: main\n');
  return dir;
}

function writeAndStage(dir, relPath, content) {
  const full = join(dir, relPath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content);
  spawnSync('git', ['add', relPath], { cwd: dir });
}

function writeTaskArtifact(dir, name, { status = 'in-progress', blockedForUser = false, changedFiles = [] }) {
  const frontStatus = `status: ${status}`;
  const orchStatus = blockedForUser ? 'blocked-for-user' : 'in-progress';
  const changedLines = changedFiles.map((f) => `- \`${f}\` — test fixture`).join('\n');
  const content = `---
slug: ${name}
version: 1
artifact: task
${frontStatus}
created: 2026-07-21
updated: 2026-07-21
manifest_ids: [R1]
upstream:
  - workflow/artifacts/briefs/${name}-v1.md
orchestration:
  phase: build
  status: ${orchStatus}
  next_phase: review
  blockers: []
  user_checkpoint: none
---

# ${name} - Task

## Changed Files

${changedLines}
`;
  writeFileSync(join(dir, 'workflow', 'artifacts', 'tasks', `${name}-v1.md`), content);
}

function run(dir) {
  return spawnSync(process.execPath, [validatorPath], { cwd: dir, encoding: 'utf8' });
}

// ── Scenario 1: safe-allowlist-only diff (docs, config, markdown) — passes ─────────────────
{
  const dir = scratchRepo('coverage-safe-');
  writeAndStage(dir, 'docs/notes.md', '# notes\n');
  writeAndStage(dir, 'workflow/config/domain.yaml', 'domain:\n  name: test\n');
  const result = run(dir);
  check('safe-1', 'safe-allowlist-only staged diff exits 0', result.status === 0);
}

// ── Scenario 2: trivial single-file, small diff — passes without any artifact ──────────────
{
  const dir = scratchRepo('coverage-trivial-');
  writeAndStage(dir, 'src/tiny.mjs', 'export const x = 1;\n');
  const result = run(dir);
  check('trivial-1', 'single small (<=15 line) non-safe file passes without a covering artifact', result.status === 0);
}

// ── Scenario 3: gated file covered by a real (in-progress) task artifact — passes ──────────
{
  const dir = scratchRepo('coverage-covered-');
  const bigContent = Array.from({ length: 20 }, (_, i) => `export const v${i} = ${i};`).join('\n') + '\n';
  writeAndStage(dir, 'src/big.mjs', bigContent);
  writeTaskArtifact(dir, 'covered-fixture', { status: 'in-progress', changedFiles: ['src/big.mjs'] });
  const result = run(dir);
  check('covered-1', 'gated file covered by an in-progress task artifact passes', result.status === 0);
}

// ── Scenario 4: gated file with no covering artifact at all — fails ────────────────────────
{
  const dir = scratchRepo('coverage-uncovered-');
  const bigContent = Array.from({ length: 20 }, (_, i) => `export const v${i} = ${i};`).join('\n') + '\n';
  writeAndStage(dir, 'src/big.mjs', bigContent);
  const result = run(dir);
  check('uncovered-1', 'gated file with no covering artifact fails (non-zero exit)', result.status !== 0);
  check('uncovered-2', 'failure message names the uncovered path', (result.stderr ?? '').includes('src/big.mjs'));
}

// ── Scenario 5: gated file only covered by a draft/blocked-for-user task — still fails ─────
{
  const dir = scratchRepo('coverage-stub-only-');
  const bigContent = Array.from({ length: 20 }, (_, i) => `export const v${i} = ${i};`).join('\n') + '\n';
  writeAndStage(dir, 'src/big.mjs', bigContent);
  writeTaskArtifact(dir, 'draft-fixture', { status: 'draft', changedFiles: ['src/big.mjs'] });
  const draftResult = run(dir);
  check('stub-1', 'draft-status task artifact does not count as coverage', draftResult.status !== 0);
}
{
  const dir = scratchRepo('coverage-blocked-only-');
  const bigContent = Array.from({ length: 20 }, (_, i) => `export const v${i} = ${i};`).join('\n') + '\n';
  writeAndStage(dir, 'src/big.mjs', bigContent);
  writeTaskArtifact(dir, 'blocked-fixture', { status: 'in-progress', blockedForUser: true, changedFiles: ['src/big.mjs'] });
  const blockedResult = run(dir);
  check('stub-2', 'orchestration.status: blocked-for-user task artifact does not count as coverage', blockedResult.status !== 0);
}

// WP-R25 F18 — the `--staged` leg must validate a staged council record.
//
// `agentsmyth check` ran check-council-record only when `--staged` was ABSENT, so the one check that
// runs on every commit skipped it. The hook's other leg does invoke it, but skips any artifact whose
// orchestration status is not `ready-for-next-phase` — and a council that terminates
// `user-decision-required` is written `blocked-for-user`, which is the commonest council record
// there is and the shape all three of this chain's fixtures carry. Both legs therefore missed it.
//
// Driven through the real CLI rather than the validator, because the defect was in the WIRING; the
// validator itself was correct and fixture-covered throughout. Same lesson as F1.
{
  const cliPath = join(repoRoot, 'bin', 'agentsmyth.mjs');
  const home = realpathSync(mkdtempSync(join(tmpdir(), 'coverage-council-home-')));
  const dir = scratchRepo('coverage-council-staged-');
  mkdirSync(join(dir, 'workflow', 'artifacts', 'reviews'), { recursive: true });

  // A council-mode record carrying `blocked-for-user` — the status the per-artifact leg skips — and
  // one defect the council validator must catch: `mode: council` with no council log at all.
  const bad = ['---', 'slug: staged-council', 'version: 1', 'artifact: review',
    'status: blocked-for-user', 'created: 2026-10-04', 'updated: 2026-10-04',
    'manifest_ids: [R1]', 'upstream:', '  - workflow/artifacts/tasks/staged-council-v1.md',
    'orchestration:', '  phase: review', '  status: blocked-for-user', '  next_phase: test',
    '  blockers: []', '  user_checkpoint: none',
    'council:', '  mode: council', '---', '', '# Staged Council', '', 'No council log anywhere.', ''];
  writeAndStage(dir, 'workflow/artifacts/reviews/staged-council-v1.md', bad.join('\n'));

  const r = spawnSync(process.execPath, [cliPath, 'check', '--staged'], {
    cwd: dir, encoding: 'utf8', env: { ...process.env, HOME: home, AGENTSMYTH_HOME: join(repoRoot, 'src', 'workflow') },
  });
  const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
  const sawRecord = /staged-council-v1\.md/.test(out) && r.status !== 0;
  // check() already owns the failure branch and the counter; adding a second one here reported this
  // single case as two failures against the pre-fix wiring.
  if (!sawRecord) console.error(`       exit ${r.status}; ${out.trim().split('\n').slice(-4).join(' | ')}`);
  check('f18-staged-council-validated',
    'the --staged leg validates a staged blocked-for-user council record',
    sawRecord);
}

console.log('');
console.log(`${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

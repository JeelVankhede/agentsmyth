#!/usr/bin/env node
// Regression test for the R2 fix (audit-validator-fixture-gaps): check-setup-complete.mjs's
// domain.name/domain.summary regex checks previously lacked the `m` flag and could never match
// real domain.yaml content. Runs the real validator (not a duplicated copy of its regex logic)
// against two minimal fixtures in isolated temp directories, asserting only the two targeted
// error lines behave correctly — every other check-setup-complete.mjs error (missing workflow
// tree, etc.) is expected and irrelevant here.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, copyFileSync, rmSync, writeFileSync } from 'node:fs';
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

// ── Setup-gate rules (OI-82) ──────────────────────────────────────────────────────────────────
// This suite tested the two domain.yaml regexes and nothing else, which is exactly why
// check-setup-complete measured 10 of 10 undefended: a suite that only exercises the happy path,
// plus two regexes, leaves every gate rule free to be deleted. These seven build a scratch repo in
// a state that trips one specific rule and assert its own message.
//
// AGENTSMYTH_HOME is set so definitionsRootIsSet() is true and the fixture is not also asked for a
// full local definitions tree, which would bury the rule under a dozen unrelated errors.
const CONFIGS = ['domain.yaml', 'repo-profile.yaml', 'source-of-truth.yaml', 'verification.yaml', 'release.yaml'];

function setupRepo({ omitConfig = null, placeholderIn = null, defaultBranch = true, map = 'real', agentsmythDir = false, adapter = true } = {}) {
  const tmp = mkdtempSync(join(tmpdir(), 'setup-gate-'));
  mkdirSync(join(tmp, 'workflow', 'config'), { recursive: true });
  for (const name of CONFIGS) {
    if (name === omitConfig) continue;
    let body = `version: 1\nkind: ${name.replace('.yaml', '')}\n`;
    if (name === 'domain.yaml') body += 'domain:\n  name: probe\n  summary: a scratch repo\n';
    if (name === 'repo-profile.yaml') body += `repository:\n  mode: single-repository\n${defaultBranch ? '  default_branch: main\n' : '  default_branch:\n'}`;
    if (name === placeholderIn) body += 'extra: <PLACEHOLDER>\n';
    writeFileSync(join(tmp, 'workflow', 'config', name), body);
  }
  if (map !== 'absent') {
    mkdirSync(join(tmp, 'docs', 'knowledge-map'), { recursive: true });
    writeFileSync(join(tmp, 'docs', 'knowledge-map', 'repo-mental-map.md'),
      map === 'placeholder' ? '# Map\n\nOwner: <PLACEHOLDER>\n' : '# Map\n\nA real mental map.\n');
  }
  if (agentsmythDir) mkdirSync(join(tmp, '.agentsmyth'), { recursive: true });
  if (adapter) writeFileSync(join(tmp, 'AGENTS.md'), '# Probe\n');
  const r = spawnSync(process.execPath, [validator], {
    cwd: tmp, encoding: 'utf8', env: { ...process.env, AGENTSMYTH_HOME: join(repoRoot, 'src', 'workflow') },
  });
  rmSync(tmp, { recursive: true, force: true });
  return `${r.stdout ?? ''}${r.stderr ?? ''}`;
}

check('gate-config-missing', 'a missing config file is reported',
  setupRepo({ omitConfig: 'release.yaml' }).includes('workflow/config/release.yaml is missing'));
check('gate-config-placeholder', 'an unfilled <PLACEHOLDER> in a config is reported',
  setupRepo({ placeholderIn: 'verification.yaml' }).includes('verification.yaml has 1 unfilled <PLACEHOLDER> value(s) — fill all before proceeding'));
check('gate-default-branch', 'a repo-profile with no default_branch value is reported',
  setupRepo({ defaultBranch: false }).includes('repository.default_branch must be set'));
check('gate-map-missing', 'an absent repo-mental-map.md is reported',
  setupRepo({ map: 'absent' }).includes('repo-mental-map.md is missing'));
// Asserted as a WHOLE LINE. The generic placeholder rule emits the same sentence with
// " — fill all before proceeding" appended, so a substring test passes even when this rule is gone.
check('gate-map-placeholder', 'a placeholder in repo-mental-map.md is reported by the map-specific rule',
  setupRepo({ map: 'placeholder' }).split('\n').map((l) => l.trim().replace(/^[-✗\s]+/, ''))
    .includes('docs/knowledge-map/repo-mental-map.md has 1 unfilled <PLACEHOLDER> value(s)'));
check('gate-agentsmyth-dir', 'a leftover .agentsmyth/ directory is reported',
  setupRepo({ agentsmythDir: true }).includes('.agentsmyth/ still exists'));
check('gate-no-adapter', 'a repo with no tool-native adapter is reported',
  setupRepo({ adapter: false }).includes('no tool-native adapter found'));

console.log(`\n${passed}/${passed + failed} setup-complete checks passed`);

if (failed > 0) {
  console.error(`${failed} check(s) failed`);
  process.exit(1);
}

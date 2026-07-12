#!/usr/bin/env node
// OI-19 (WP-R5 T5.2 follow-up) — root-resolution drift detection. Three independent copies of
// the same resolution algorithm exist (lib.mjs's _resolveRepoRoot, check-setup-complete.mjs's
// resolveRepoRoot, bin/agentsmyth.mjs's resolveExistingRepoRoot), each duplicated for a
// documented reason (see each file's own comment), with no automated check that they agree.
// This test spawns all three as real subprocesses (not imports — check-setup-complete.mjs and
// bin/agentsmyth.mjs both have side-effecting top-level/branch logic unsafe to import directly)
// against the same set of scenarios and asserts identical output. A hand-written debug hook
// (AGENTSMYTH_DEBUG_ROOT env var) in each of the two CLI-shaped files prints the resolved root
// and exits before any real side effect runs; lib.mjs's repoRoot is a plain module export.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// mkdtempSync's return value is not resolved through symlinks (macOS's tmpdir() lives under
// /var, itself a symlink to /private/var) — but `git rev-parse --show-toplevel` and
// process.cwd() both resolve the real path. Comparing against the literal mkdtempSync string
// would fail even though all three resolvers correctly agree with each other. Resolve every
// expected path through realpathSync so assertions compare like with like.
function mkScenarioDir(prefix) {
  return realpathSync(mkdtempSync(join(tmpdir(), prefix)));
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const libPath = join(repoRoot, 'src', 'workflow', 'validators', 'lib.mjs');
const setupCompletePath = join(repoRoot, 'src', 'workflow', 'validators', 'check-setup-complete.mjs');
const binPath = join(repoRoot, 'bin', 'agentsmyth.mjs');

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

function resolveViaLib(cwd) {
  const script = `import('${libPath.replace(/\\/g, '/')}').then(m => console.log(m.repoRoot));`;
  const result = spawnSync(process.execPath, ['-e', script], { cwd, encoding: 'utf8' });
  return (result.stdout ?? '').trim();
}

function resolveViaSetupComplete(cwd) {
  const result = spawnSync(process.execPath, [setupCompletePath], {
    cwd, encoding: 'utf8', env: { ...process.env, AGENTSMYTH_DEBUG_ROOT: '1' },
  });
  return (result.stdout ?? '').trim();
}

function resolveViaBin(cwd) {
  const result = spawnSync(process.execPath, [binPath, 'check'], {
    cwd, encoding: 'utf8', env: { ...process.env, AGENTSMYTH_DEBUG_ROOT: '1' },
  });
  return (result.stdout ?? '').trim();
}

function assertAllAgree(scenarioId, description, cwd, expected) {
  const viaLib = resolveViaLib(cwd);
  const viaSetupComplete = resolveViaSetupComplete(cwd);
  const viaBin = resolveViaBin(cwd);

  check(`${scenarioId}-lib`, `${description} — lib.mjs resolves to expected`, viaLib === expected);
  check(`${scenarioId}-setup-complete`, `${description} — check-setup-complete.mjs resolves to expected`, viaSetupComplete === expected);
  check(`${scenarioId}-bin`, `${description} — bin/agentsmyth.mjs resolves to expected`, viaBin === expected);
  check(`${scenarioId}-agree`, `${description} — all three implementations agree with each other`,
    viaLib === viaSetupComplete && viaSetupComplete === viaBin);
}

// ── Scenario 1: non-git directory, no repo-profile.yaml — fresh-init fallback ──────────────
{
  const tmp = mkScenarioDir('root-drift-nongit-');
  assertAllAgree('nongit', 'non-git directory falls back to cwd', tmp, tmp);
  rmSync(tmp, { recursive: true, force: true });
}

// ── Scenario 2: polyrepo-member with an absolute workspace_root ────────────────────────────
{
  const tmp = mkScenarioDir('root-drift-polyrepo-abs-');
  const workspaceRoot = mkScenarioDir('root-drift-workspace-');
  mkdirSync(join(tmp, 'workflow', 'config'), { recursive: true });
  writeFileSync(
    join(tmp, 'workflow', 'config', 'repo-profile.yaml'),
    `version: 1\nkind: repo-profile\nrepository:\n  mode: polyrepo-member\n  root: .\n  workspace_root: ${workspaceRoot}\n`
  );
  assertAllAgree('polyrepo-abs', 'polyrepo-member with absolute workspace_root', tmp, workspaceRoot);
  rmSync(tmp, { recursive: true, force: true });
  rmSync(workspaceRoot, { recursive: true, force: true });
}

// ── Scenario 3: polyrepo-member with a ~/-prefixed workspace_root — the exact bug this test
// was written to catch (check-setup-complete.mjs used process.env.HOME instead of homedir()) ──
{
  const tmp = mkScenarioDir('root-drift-polyrepo-tilde-');
  mkdirSync(join(tmp, 'workflow', 'config'), { recursive: true });
  writeFileSync(
    join(tmp, 'workflow', 'config', 'repo-profile.yaml'),
    `version: 1\nkind: repo-profile\nrepository:\n  mode: polyrepo-member\n  root: .\n  workspace_root: ~/root-drift-tilde-fixture\n`
  );
  const expected = join(homedir(), 'root-drift-tilde-fixture');
  assertAllAgree('polyrepo-tilde', 'polyrepo-member with ~/-prefixed workspace_root', tmp, expected);
  rmSync(tmp, { recursive: true, force: true });
}

// ── Scenario 4: repo-profile.yaml present but mode is not polyrepo-member — must NOT use
// workspace_root even if one happens to be present (stale/leftover field) ─────────────────────
{
  const tmp = mkScenarioDir('root-drift-notpoly-');
  mkdirSync(join(tmp, 'workflow', 'config'), { recursive: true });
  writeFileSync(
    join(tmp, 'workflow', 'config', 'repo-profile.yaml'),
    `version: 1\nkind: repo-profile\nrepository:\n  mode: single-repository\n  root: .\n  workspace_root: /should/not/be/used\n`
  );
  assertAllAgree('notpoly', 'non-polyrepo-member mode ignores a stray workspace_root, falls back to cwd', tmp, tmp);
  rmSync(tmp, { recursive: true, force: true });
}

console.log(`\n${passed}/${passed + failed} root-resolution drift checks passed`);

if (failed > 0) {
  console.error(`${failed} check(s) failed`);
  process.exit(1);
}

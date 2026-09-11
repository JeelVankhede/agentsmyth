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

// ── Scenario 5: resolveGitCwd() end-to-end — the sibling-repo routing that had no fixture ─────
// The scenarios above all pin repoRoot, which is where the shared workflow/ lives. resolveGitCwd is
// a different question: which local git CHECKOUT a git-dependent check (trackedFiles and friends)
// should run against for one artifact. Under polyrepo-member the answer is not repoRoot — it is the
// sibling repo the artifact's `target_repo` names — and nothing exercised it, so the whole
// polyrepo git path rested on having been read rather than run. Asserts the routing AND the two
// fallbacks, because a resolver that silently returns repoRoot is indistinguishable from a working
// one until the day it matters.
{
  const workspaceRoot = mkScenarioDir('root-drift-gitcwd-workspace-');
  const siblingA = join(workspaceRoot, 'service-a');
  const siblingB = join(workspaceRoot, 'service-b');
  mkdirSync(join(workspaceRoot, 'workflow', 'config'), { recursive: true });
  writeFileSync(
    join(workspaceRoot, 'workflow', 'config', 'repo-profile.yaml'),
    `version: 1\nkind: repo-profile\nrepository:\n  mode: polyrepo-member\n  root: .\n`
    + `  workspace_root: ${workspaceRoot}\n  sibling_repos:\n`
    // `path` is relative to workspace_root, per repo-profile.schema.yaml's own description of the
    // field. Writing absolute paths here produced `<workspace_root><absolute path>` and a scenario
    // that failed for a reason having nothing to do with the resolver.
    + `    - name: service-a\n      path: service-a\n`
    + `    - name: service-b\n      path: service-b\n`
  );
  // Two real checkouts, each with a file only it tracks, so "which repo did git run in" is
  // answerable from the output rather than inferred from the path.
  for (const [dir, marker] of [[siblingA, 'only-in-a.txt'], [siblingB, 'only-in-b.txt']]) {
    mkdirSync(dir, { recursive: true });
    spawnSync('git', ['init', '-q'], { cwd: dir });
    writeFileSync(join(dir, marker), 'x\n');
    spawnSync('git', ['add', '-A'], { cwd: dir });
    spawnSync('git', ['-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-qm', 'init'], { cwd: dir });
  }

  const probe = (frontmatter) => {
    const script = `import('${libPath.replace(/\\/g, '/')}').then(m => {`
      + ` const cwd = m.resolveGitCwd(${JSON.stringify(frontmatter)});`
      + ` console.log(JSON.stringify({ cwd, tracked: m.trackedFiles(cwd) })); });`;
    const r = spawnSync(process.execPath, ['-e', script], { cwd: workspaceRoot, encoding: 'utf8' });
    try { return JSON.parse((r.stdout ?? '').trim()); } catch { return { cwd: '', tracked: [] }; }
  };

  const a = probe({ target_repo: 'service-a' });
  check('gitcwd-routes', 'target_repo routes git-dependent checks to the named sibling checkout',
    realpathSync(a.cwd) === realpathSync(siblingA));
  check('gitcwd-tracked', 'trackedFiles run through it lists the sibling\'s files, not the workspace\'s',
    a.tracked.includes('only-in-a.txt') && !a.tracked.includes('only-in-b.txt'));

  const b = probe({ target_repo: 'service-b' });
  check('gitcwd-distinct', 'a different target_repo resolves to a different checkout',
    realpathSync(b.cwd) === realpathSync(siblingB) && b.tracked.includes('only-in-b.txt'));

  const none = probe({});
  check('gitcwd-no-target', 'an artifact with no target_repo stays on repoRoot',
    realpathSync(none.cwd) === realpathSync(workspaceRoot));

  const unknown = probe({ target_repo: 'service-does-not-exist' });
  check('gitcwd-unknown-falls-back', 'an unknown target_repo falls back to repoRoot rather than throwing',
    realpathSync(unknown.cwd) === realpathSync(workspaceRoot));

  rmSync(workspaceRoot, { recursive: true, force: true });
}

console.log(`\n${passed}/${passed + failed} root-resolution drift checks passed`);

if (failed > 0) {
  console.error(`${failed} check(s) failed`);
  process.exit(1);
}

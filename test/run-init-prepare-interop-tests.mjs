#!/usr/bin/env node
// WP-R7 (init/prepare interoperability) — exercises `agentsmyth prepare`, `agentsmyth init`,
// and `agentsmyth check`'s headless bootstrap as real subprocesses (not imports —
// bin/agentsmyth.mjs has side-effecting top-level/branch logic unsafe to import directly, same
// reasoning as test/run-root-resolution-drift-tests.mjs). Every spawn goes through spawnCli()
// below, which *requires* an explicit scratch `home` — there is no fallback to the real
// environment's $HOME, so a bug here cannot write into a developer's actual ~/.agentsmyth.
//
// Scope note: the migration prompt (auditStaleDefinitions/confirmDeletion in bin/agentsmyth.mjs)
// gates its accept/decline branches on `process.stdin.isTTY`. Piped stdin is not a TTY, so it
// cannot exercise those two branches — only the non-TTY fail-closed branch (tested below).
// Confirmed during Build (see workflow/artifacts/tasks/init-prepare-interop-v1.md, Phase 3 log)
// with a throwaway pty-based harness, not part of this suite. The accept/decline branches are
// manual-QA scope, not automatable here without a pty dependency (would violate the zero
// runtime-dependency invariant) — see the Plan's Risk Register for this repo's own
// acknowledgment of that gap.
import { spawnSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

function mkScratchDir(prefix) {
  return realpathSync(mkdtempSync(join(tmpdir(), prefix)));
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const binPath = join(repoRoot, 'bin', 'agentsmyth.mjs');

let passed = 0;
let failed = 0;
const cleanup = [];

function check(id, description, condition) {
  if (condition) {
    console.log(`[PASS] ${id}: ${description}`);
    passed++;
  } else {
    console.error(`[FAIL] ${id}: ${description}`);
    failed++;
  }
}

// Spawns bin/agentsmyth.mjs with an explicitly-required scratch HOME — no default, so a caller
// cannot accidentally omit it and fall through to the real environment.
function spawnCli(args, { cwd, home, input }) {
  if (!home) throw new Error('spawnCli requires an explicit scratch `home` — refusing to run without one');
  return spawnSync(process.execPath, [binPath, ...args], {
    cwd, encoding: 'utf8', input,
    env: { ...process.env, HOME: home },
  });
}

// ── Scenario A: `prepare` populates the global tree, writes zero repo-local files (R1) ──────
{
  const home = mkScratchDir('wpr7-prepare-home-');
  const repo = mkScratchDir('wpr7-prepare-repo-');
  cleanup.push(home, repo);

  const result = spawnCli(['prepare'], { cwd: repo, home });

  check('A1-exit', 'prepare exits 0', result.status === 0);
  check('A2-global-tree', 'prepare populates <home>/.agentsmyth/workflow/router.md',
    existsSync(join(home, '.agentsmyth', 'workflow', 'router.md')));
  check('A3-global-skills', 'prepare populates <home>/.agentsmyth/workflow/skills/',
    existsSync(join(home, '.agentsmyth', 'workflow', 'skills')));
  check('A4-no-repo-files', 'prepare writes zero files under the repo it was run from',
    !existsSync(join(repo, '.agentsmyth')) && !existsSync(join(repo, 'workflow')));
}

// ── Scenario B: `init --system` is rejected, not silently run as bare init (R1) ─────────────
{
  const home = mkScratchDir('wpr7-rejectsys-home-');
  const repo = mkScratchDir('wpr7-rejectsys-repo-');
  cleanup.push(home, repo);

  const result = spawnCli(['init', '--system'], { cwd: repo, home });

  check('B1-exit', 'init --system exits non-zero', result.status !== 0);
  check('B2-message', 'init --system prints a removal message pointing at prepare',
    /was removed/.test(result.stderr) && /prepare/.test(result.stderr));
  check('B3-no-side-effects', 'init --system creates no files',
    !existsSync(join(repo, '.agentsmyth')) && !existsSync(join(repo, 'workflow')));
}

// ── Scenario C: bare `init`, no prior global install — auto-links, no local copy (R2) ───────
{
  const home = mkScratchDir('wpr7-init-home-');
  const repo = mkScratchDir('wpr7-init-repo-');
  cleanup.push(home, repo);

  const result = spawnCli(['init'], { cwd: repo, home });
  const profilePath = join(repo, 'workflow', 'config', 'repo-profile.yaml');

  check('C1-exit', 'init exits 0', result.status === 0);
  check('C2-auto-prepare', 'init auto-ran prepare (visible in output)',
    /Installing global definitions/.test(result.stdout));
  check('C3-global-tree', 'the global tree was actually installed',
    existsSync(join(home, '.agentsmyth', 'workflow', 'router.md')));
  // fix-definitions-root-portability-v1 (OI-52): same fix as Scenario F's F3 — bare `init` must
  // also write the portable literal, not an expanded absolute path.
  const initProfileContent = existsSync(profilePath) ? readFileSync(profilePath, 'utf8') : '';
  check('C4-definitions-root', 'repo-profile.yaml has the portable ~/.agentsmyth/workflow, not an expanded absolute path',
    initProfileContent.includes('definitions_root: ~/.agentsmyth/workflow') &&
    !initProfileContent.includes(`definitions_root: ${join(home, '.agentsmyth', 'workflow')}`));
  check('C5-no-local-skills', 'no local workflow/skills/ was created',
    !existsSync(join(repo, 'workflow', 'skills')));
  check('C6-no-local-router', 'no local workflow/router.md was created',
    !existsSync(join(repo, 'workflow', 'router.md')));
  check('C7-staged', '.agentsmyth/ was staged for the setup skill to continue',
    existsSync(join(repo, '.agentsmyth', 'setup-bundle.md')) && existsSync(join(repo, '.agentsmyth', 'workflow-bundle.md')));
}

// ── Scenario D: a second, independent repo links to the same global tree without
// re-installing it (R2) ──────────────────────────────────────────────────────────────────────
{
  const home = mkScratchDir('wpr7-tworepos-home-');
  const repo1 = mkScratchDir('wpr7-tworepos-repo1-');
  const repo2 = mkScratchDir('wpr7-tworepos-repo2-');
  cleanup.push(home, repo1, repo2);

  const first = spawnCli(['init'], { cwd: repo1, home });
  const second = spawnCli(['init'], { cwd: repo2, home });

  check('D1-first-installs', 'the first repo triggers the global install', /Installing global definitions/.test(first.stdout));
  check('D2-second-links-only', 'the second repo does NOT re-trigger the global install',
    second.status === 0 && !/Installing global definitions/.test(second.stdout));
  check('D3-same-definitions-root', 'both repos point at the same definitions_root',
    readFileSync(join(repo1, 'workflow', 'config', 'repo-profile.yaml'), 'utf8').match(/definitions_root:\s*(.+)/)?.[1]
      === readFileSync(join(repo2, 'workflow', 'config', 'repo-profile.yaml'), 'utf8').match(/definitions_root:\s*(.+)/)?.[1]);
}

// ── Scenario E: a prepare failure during init is surfaced clearly, no partial state (R2) ────
{
  const home = mkScratchDir('wpr7-failhome-');
  const repo = mkScratchDir('wpr7-failrepo-');
  cleanup.push(home, repo);
  chmodSync(home, 0o000);

  const result = spawnCli(['init'], { cwd: repo, home });

  chmodSync(home, 0o755); // restore before cleanup can recurse into it

  check('E1-exit', 'init exits non-zero when prepare cannot install', result.status !== 0);
  check('E2-message', 'init surfaces the underlying error, not a raw stack trace',
    /could not install the global lifecycle definitions/.test(result.stderr) && !/at Object/.test(result.stderr));
  check('E3-no-partial-state', 'the repo directory has no partial .agentsmyth/ or workflow/',
    !existsSync(join(repo, '.agentsmyth')) && !existsSync(join(repo, 'workflow')));
}

// ── Scenario F: `check`'s headless bootstrap links to an existing global install (R3) ───────
{
  const home = mkScratchDir('wpr7-bootstrap-home-');
  const repo = mkScratchDir('wpr7-bootstrap-repo-');
  cleanup.push(home, repo);
  spawnSync('git', ['init', '-q'], { cwd: repo });
  spawnCli(['prepare'], { cwd: repo, home }); // pre-install the global tree

  const result = spawnCli(['check'], { cwd: repo, home });
  const profilePath = join(repo, 'workflow', 'config', 'repo-profile.yaml');
  const profileContent = existsSync(profilePath) ? readFileSync(profilePath, 'utf8') : '';

  check('F1-exit', 'check (headless bootstrap) exits 0', result.status === 0);
  check('F2-stub-written', 'a stub repo-profile.yaml was written', existsSync(profilePath));
  // fix-definitions-root-portability-v1 (OI-52): the stub must carry the portable literal
  // ~/.agentsmyth/workflow, never an expanded, machine-specific absolute path — otherwise any
  // other contributor or CI runner whose home directory differs gets "global definitions root
  // not found". Was previously asserting the expanded form (the bug itself), inverted here.
  check('F3-definitions-root', 'the stub has the portable ~/.agentsmyth/workflow, not an expanded absolute path',
    profileContent.includes('definitions_root: ~/.agentsmyth/workflow') &&
    !profileContent.includes(`definitions_root: ${join(home, '.agentsmyth', 'workflow')}`));
  check('F4-version-stamped', 'the stub has agentsmyth_version stamped', /^agentsmyth_version:/m.test(profileContent));

  const followUp = spawnCli(['check', '--phase', 'think', '--slug', 'wpr7-test'], { cwd: repo, home });
  // deepen-setup-interview-v1 (R1) folded check-setup-complete.mjs into `agentsmyth check`, so
  // the overall exit code is now correctly non-zero here — this scratch repo only ran the
  // headless-bootstrap fallback and never actually completed setup (domain.yaml/source-of-truth.yaml
  // still carry real placeholders). This scenario's own intent is narrower than overall exit
  // code: does check-lifecycle.mjs itself still resolve and run cleanly from the global tree,
  // independent of the separate, new, and correctly-firing setup-completeness gate.
  check('F5-resolves', 'a subsequent check-lifecycle invocation resolves cleanly from the global tree',
    /check-lifecycle --phase think: ok/.test(followUp.stdout));
  check('F6-setup-incomplete-flagged', 'the same invocation also surfaces the (correct, expected) setup-completeness failure',
    followUp.status !== 0 && /check-setup-complete: failed/.test(followUp.stderr));
}

// ── Scenario G: `check`'s headless bootstrap auto-runs prepare when no global install
// exists yet (R3) ────────────────────────────────────────────────────────────────────────────
{
  const home = mkScratchDir('wpr7-bootstrap-auto-home-');
  const repo = mkScratchDir('wpr7-bootstrap-auto-repo-');
  cleanup.push(home, repo);
  spawnSync('git', ['init', '-q'], { cwd: repo });

  const result = spawnCli(['check'], { cwd: repo, home });

  check('G1-auto-prepare', 'check auto-runs prepare when no global install exists',
    /Installing global definitions/.test(result.stdout));
  check('G2-global-tree', 'the global tree ends up installed', existsSync(join(home, '.agentsmyth', 'workflow', 'router.md')));
}

// ── Scenario H: the migration prompt fails closed in a non-TTY context, even with input
// piped in — it must NOT silently confirm or hang (R7, RI5) ─────────────────────────────────
{
  const home = mkScratchDir('wpr7-migration-home-');
  const repo = mkScratchDir('wpr7-migration-repo-');
  cleanup.push(home, repo);
  mkdirSync(join(repo, 'workflow', 'skills'), { recursive: true });
  writeFileSync(join(repo, 'workflow', 'router.md'), 'stale router content\n');

  const result = spawnCli(['init'], { cwd: repo, home, input: 'y\n' });

  check('H1-exit', 'a non-TTY init with a stale local tree exits non-zero (fails closed)', result.status !== 0);
  check('H2-lists-paths', 'the error lists the exact stale paths found',
    result.stderr.includes(join(repo, 'workflow', 'skills')) && result.stderr.includes(join(repo, 'workflow', 'router.md')));
  check('H3-non-interactive-message', 'the error explains why it could not prompt',
    /non-interactive session/.test(result.stderr));
  check('H4-files-untouched', 'piping "y" did not delete anything — fail-closed, not fail-open',
    existsSync(join(repo, 'workflow', 'skills')) && existsSync(join(repo, 'workflow', 'router.md')));
  check('H5-no-link-committed', 'no definitions_root was written since init stopped before linking',
    !existsSync(join(repo, 'workflow', 'config', 'repo-profile.yaml')));
}

// ── Scenario J: appendPendingItems must never corrupt a consumer's pending-setup.yaml ──────────
// External review B1/B2 on PR #65. The append runs inside `agentsmyth check` on version skew, in a
// CONSUMER repo, so a wrong guard leaves a config the user never touched unloadable. Both shapes are
// schema-valid, and the previous guard accepted the first and silently refused the second forever.
{
  const home = mkScratchDir('wpr22-append-home-');
  cleanup.push(home);
  spawnCli(['prepare'], { cwd: home, home });

  const profile = [
    'agentsmyth_version: 1.0.0', 'version: 1', 'kind: repo-profile', 'repository:',
    '  mode: single-repository', '  root: .', '  default_branch: main',
    '  workflow_root: workflow', '  artifacts_root: workflow/artifacts',
    '  definitions_root: ~/.agentsmyth/workflow',
  ].join('\n');

  function runAppend(label, pendingBody) {
    const repo = mkScratchDir(`wpr22-append-${label}-`);
    cleanup.push(repo);
    spawnSync('git', ['init', '-q'], { cwd: repo });
    mkdirSync(join(repo, 'workflow', 'config'), { recursive: true });
    writeFileSync(join(repo, 'workflow', 'config', 'repo-profile.yaml'), `${profile}\n`);
    const pendingPath = join(repo, 'workflow', 'config', 'pending-setup.yaml');
    writeFileSync(pendingPath, pendingBody);
    spawnCli(['check'], { cwd: repo, home });
    const after = readFileSync(pendingPath, 'utf8');
    let parses = true;
    try {
      const r = spawnSync(process.execPath, ['-e',
        `import('${JSON.stringify(join(repoRoot, 'src/workflow/validators/lib.mjs')).slice(1, -1)}')` +
        `.then(m => { m.loadYaml(${JSON.stringify(pendingPath)}); })`,
      ], { encoding: 'utf8', env: { ...process.env, AGENTSMYTH_HOME: 'src/workflow' }, cwd: repoRoot });
      parses = r.status === 0;
    } catch { parses = false; }
    return { after, parses };
  }

  // items: first, then other top-level keys. The old guard said "safe to append" and the appended
  // entries landed after `kind:`, which the parser then rejected.
  const itemsFirst = runAppend('itemsfirst', [
    'items:', '  - id: PS-1', '    config: repo-profile.yaml',
    '    field: "intent.repo_character"', '    question: "q"', '    hint: "h"', '    status: open',
    'version: 1', 'kind: pending-setup', '',
  ].join('\n'));
  check('J1-itemsfirst-parses', 'a pending-setup.yaml with items: first is still parseable after check',
    itemsFirst.parses);
  check('J2-itemsfirst-untouched', 'the append refuses rather than writing into the wrong position',
    !itemsFirst.after.includes('tuning.council.per_phase'));

  // items: [] — the steady state of a repo that resolved and pruned everything. Previously a
  // permanent silent no-op, so such a repo could never be offered a new item family.
  const emptySeq = runAppend('emptyseq',
    'version: 1\nkind: pending-setup\nitems: []\n');
  check('J3-emptyseq-parses', 'an items: [] pending-setup.yaml is still parseable after check',
    emptySeq.parses);
  check('J4-emptyseq-populated', 'items: [] is rewritten into a block rather than silently skipped',
    emptySeq.after.includes('tuning.council.per_phase'));
}

for (const dir of cleanup) {
  try { rmSync(dir, { recursive: true, force: true }); } catch { /* best-effort cleanup */ }
}

console.log(`\n${passed}/${passed + failed} init/prepare interoperability checks passed`);

if (failed > 0) {
  console.error(`${failed} check(s) failed`);
  process.exit(1);
}

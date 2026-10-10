#!/usr/bin/env node
// Consumer sweep: every validator `prepare` installs must be runnable in a repo that is not this one.
//
// check-setup-refs and check-trigger-predicates shipped in every global install from 1.0.0 to 1.1.0
// while reading paths that exist only in agentsmyth's own source tree (src/setup/references/,
// examples/power-skill-sandbox/). In every consumer they failed on every run — two failures nobody
// could fix, next to an `agentsmyth check` that exited 0 because it never ran them. Nothing caught
// it, because every suite here runs from this repo's root, where those paths exist.
//
// So this suite does what a consumer does: installs the definitions into a scratch home with the
// real `prepare`, then runs every installed check-*.mjs from inside an EMPTY git repo. A validator is
// allowed to fail there — an empty repo has no config, and saying so is correct. What it may not do is
// name a path that only agentsmyth's source repo has, because no consumer can ever satisfy that.
//
// It also covers the two ways a stale copy is removed from a tree that already has one: the
// expansion ledger (installs written by 1.1.0+) and the retired-files list (installs last written by
// 1.0.x, which have no ledger at all).
import { spawnSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const binPath = join(repoRoot, 'bin', 'agentsmyth.mjs');
const bundlePath = join(repoRoot, 'dist', 'workflow-bundle.md');

const SOURCE_ONLY = ['check-setup-refs.mjs', 'check-trigger-predicates.mjs'];
// Paths a consumer repo cannot have. `src/workflow/` is agentsmyth's source layout; a consumer's
// tree is `workflow/` at its root, which this pattern does not match.
const SOURCE_REPO_PATH = /(?:^|[\s'"`(/])(?:src\/setup\/|src\/workflow\/|examples\/)/m;
const PER_VALIDATOR_TIMEOUT_MS = 30000;

let passed = 0;
let failed = 0;
const cleanup = [];

function mkScratchDir(prefix) {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), prefix)));
  cleanup.push(dir);
  return dir;
}

function check(id, description, condition, detail = '') {
  if (condition) {
    console.log(`[PASS] ${id}: ${description}`);
    passed++;
  } else {
    console.error(`[FAIL] ${id}: ${description}${detail ? `\n       ${detail}` : ''}`);
    failed++;
  }
}

function prepare(home) {
  return spawnSync(process.execPath, [binPath, 'prepare'], {
    cwd: home, encoding: 'utf8', env: { ...process.env, HOME: home },
  });
}

// ── S1: the bundle itself carries no source-only validator ───────────────────────────────────
{
  const bundle = readFileSync(bundlePath, 'utf8');
  const shipped = SOURCE_ONLY.filter((name) => bundle.includes(`<!-- FILE: workflow/validators/${name} -->`));
  check('S1-bundle-excludes-source-only', 'dist/workflow-bundle.md declares no source-only validator',
    shipped.length === 0, `still bundled: ${shipped.join(', ')}`);
}

// ── S2/S3: a fresh install, swept from an empty consumer repo ─────────────────────────────────
{
  const home = mkScratchDir('consumer-sweep-home-');
  const repo = mkScratchDir('consumer-sweep-repo-');
  spawnSync('git', ['init', '-q'], { cwd: repo });

  const prep = prepare(home);
  const defsRoot = join(home, '.agentsmyth', 'workflow');
  const validatorsDir = join(defsRoot, 'validators');
  check('S2a-prepare', 'prepare installs a definitions tree into the scratch home',
    prep.status === 0 && existsSync(validatorsDir), `${prep.stdout ?? ''}${prep.stderr ?? ''}`.slice(0, 400));

  const installed = existsSync(validatorsDir)
    ? readdirSync(validatorsDir).filter((n) => /^check-.*\.mjs$/.test(n)).sort()
    : [];
  const leaked = SOURCE_ONLY.filter((n) => installed.includes(n));
  check('S2b-not-installed', 'no source-only validator is installed', leaked.length === 0,
    `installed anyway: ${leaked.join(', ')}`);
  // A sweep over nothing would pass vacuously.
  check('S2c-sweep-nonempty', 'the install carries validators to sweep', installed.length >= 10,
    `found ${installed.length}`);

  const offenders = [];
  const timedOut = [];
  for (const name of installed) {
    const r = spawnSync(process.execPath, [join(validatorsDir, name)], {
      cwd: repo,
      encoding: 'utf8',
      timeout: PER_VALIDATOR_TIMEOUT_MS,
      env: { ...process.env, HOME: home, AGENTSMYTH_HOME: defsRoot, AGENTSMYTH_WF: '' },
    });
    if (r.error?.code === 'ETIMEDOUT') { timedOut.push(name); continue; }
    const output = `${r.stdout ?? ''}${r.stderr ?? ''}`;
    if (r.status !== 0 && SOURCE_REPO_PATH.test(output)) {
      const line = output.split('\n').find((l) => SOURCE_REPO_PATH.test(l)) ?? '';
      offenders.push(`${name}: ${line.trim().slice(0, 200)}`);
    }
  }
  check('S3a-no-source-repo-paths', `no installed validator fails on a source-repo-only path (${installed.length} swept)`,
    offenders.length === 0, offenders.join('\n       '));
  check('S3b-no-hangs', 'no installed validator hangs in an empty repo', timedOut.length === 0,
    `timed out: ${timedOut.join(', ')}`);
}

// ── S4: stale copies already in a tree are removed by the next prepare ──────────────────────
// Content is irrelevant; presence is what a sweep trips on.
function plantStale(defsRoot) {
  for (const name of SOURCE_ONLY) writeFileSync(join(defsRoot, 'validators', name), '// stale copy\n');
}

{
  // 1.1.0 shape: the ledger lists both files, because 1.1.0's bundle declared them.
  const home = mkScratchDir('consumer-sweep-ledger-');
  prepare(home);
  const defsRoot = join(home, '.agentsmyth', 'workflow');
  plantStale(defsRoot);
  appendFileSync(join(defsRoot, 'expanded-files.txt'),
    SOURCE_ONLY.map((n) => `workflow/validators/${n}`).join('\n') + '\n');
  // The retired-files list would remove the two above even if the ledger prune were broken, so on its
  // own S4a could not tell the two mechanisms apart. A third stale file the retired list does NOT
  // name can only be removed by the ledger, which is what makes this case a test of the ledger.
  const ledgerOnly = join(defsRoot, 'validators', 'check-retired-by-ledger.mjs');
  writeFileSync(ledgerOnly, '// stale copy\n');
  appendFileSync(join(defsRoot, 'expanded-files.txt'), 'workflow/validators/check-retired-by-ledger.mjs\n');
  const r = prepare(home);
  const left = SOURCE_ONLY.filter((n) => existsSync(join(defsRoot, 'validators', n)));
  check('S4a-ledger-prune', 'a tree whose ledger lists them loses both stale validators on prepare',
    r.status === 0 && left.length === 0, `left: ${left.join(', ')}`);
  check('S4a2-ledger-isolated', 'a stale file only the ledger names is removed too — the ledger path itself works',
    !existsSync(ledgerOnly));
}

{
  // 1.0.x shape: no ledger at all. Only the retired-files list can reach these.
  const home = mkScratchDir('consumer-sweep-noledger-');
  prepare(home);
  const defsRoot = join(home, '.agentsmyth', 'workflow');
  plantStale(defsRoot);
  rmSync(join(defsRoot, 'expanded-files.txt'), { force: true });
  const r = prepare(home);
  const left = SOURCE_ONLY.filter((n) => existsSync(join(defsRoot, 'validators', n)));
  check('S4b-ledgerless-prune', 'a ledgerless (1.0.x) tree loses both stale validators on prepare',
    r.status === 0 && left.length === 0, `left: ${left.join(', ')}`);
  // The retired list is exact files: a user's own validator beside them is untouched.
  const own = join(defsRoot, 'validators', 'check-my-own.mjs');
  writeFileSync(own, '// user file\n');
  prepare(home);
  check('S4c-exact-paths-only', 'a file the retired list does not name survives prepare', existsSync(own));
}

for (const dir of cleanup) {
  try { rmSync(dir, { recursive: true, force: true }); } catch { /* best-effort cleanup */ }
}

console.log(`\nconsumer-sweep: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

#!/usr/bin/env node
// WP-R23 (generic AGENTS.md adapter fallback) — exercises `agentsmyth init`'s root AGENTS.md
// placement as a real subprocess (not an import — bin/agentsmyth.mjs has side-effecting top-level
// logic unsafe to import directly, same reasoning as test/run-init-prepare-interop-tests.mjs).
// Every spawn goes through spawnCli() below, which *requires* an explicit scratch `home`, so a bug
// here cannot write into a developer's actual ~/.agentsmyth.
//
// Two things a reader will otherwise trip over:
//
// 1. `.agentsmyth/` is removed between init runs. `init` refuses to start while that directory is
//    present, and the setup skill deletes it as the final step of its Phase 5 — so a second `init`
//    in a real consumer repo always happens with it absent. Without the removal, scenario B looks
//    like an idempotency bug when it is really an interrupted-setup guard doing its job.
//
// 2. Scenario E (orphan BEGIN) is the case that matters most. Every other scenario feeds
//    well-formed input and all of them passed against an implementation that silently deleted user
//    content: a plain non-greedy block pattern matched from an orphan BEGIN to the *next* block's
//    END, taking the user's own text with it. It is the only scenario here that ever caught a real
//    defect, so treat it as load-bearing rather than an edge case worth trimming.
//
// 3. PAIR_RE below is the UNTEMPERED pattern, deliberately (see its own note) — but that has a
//    consequence worth stating so nobody reads more into a green E3 than it carries. Under the
//    mutation that reverts the implementation's tempering, the second init swallows the orphan
//    BEGIN and the user's text between it and the new block's END; what remains still contains
//    exactly one pair by the untempered count, so E3 PASSES. E3 is therefore not independent
//    evidence of the tempering — E1, E2 and E4 are the three checks that fail under that mutation,
//    and they are the ones to look at when judging whether the guard is still in place.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const binPath = join(repoRoot, 'bin', 'agentsmyth.mjs');
const VERSION = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8')).version;

// Mirrors the pattern bin/agentsmyth.mjs matches with. Deliberately a separate literal: if the
// implementation's pattern is edited, these assertions must be re-derived by hand rather than
// silently agreeing with whatever the implementation now does.
const PAIR_RE = /<!-- agentsmyth:[^\s>]+ BEGIN -->[\s\S]*?<!-- agentsmyth:[^\s>]+ END -->/g;

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

function mkScratchDir(prefix) {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), prefix)));
  cleanup.push(dir);
  return dir;
}

// Spawns bin/agentsmyth.mjs with an explicitly-required scratch HOME — no default, so a caller
// cannot accidentally omit it and fall through to the real environment.
function spawnCli(args, { cwd, home }) {
  if (!home) throw new Error('spawnCli requires an explicit scratch `home` — refusing to run without one');
  return spawnSync(process.execPath, [binPath, ...args], {
    cwd, encoding: 'utf8', env: { ...process.env, HOME: home },
  });
}

function newRepo(tag) {
  const dir = mkScratchDir(`wpr23-${tag}-repo-`);
  const home = mkScratchDir(`wpr23-${tag}-home-`);
  spawnSync('git', ['init', '-q'], { cwd: dir, encoding: 'utf8' });
  return { dir, home };
}

// Same scratch pair, minus the `git init` — the directory scenario F needs. `init` must still run
// here; only the hook install is expected to degrade.
function newNonGitDir(tag) {
  const dir = mkScratchDir(`wpr23-${tag}-dir-`);
  const home = mkScratchDir(`wpr23-${tag}-home-`);
  return { dir, home };
}

function runInit(r) {
  const result = spawnCli(['init'], { cwd: r.dir, home: r.home });
  // See header note 1 — without this, a second runInit() hits the interrupted-setup guard.
  rmSync(join(r.dir, '.agentsmyth'), { recursive: true, force: true });
  return result;
}

const readAgents = (dir) => readFileSync(join(dir, 'AGENTS.md'), 'utf8');
const pairCount = (text) => (text.match(PAIR_RE) || []).length;

// ── Scenario A: no AGENTS.md — init creates one, stamped, with exactly one pair (R1) ────────
{
  const r = newRepo('create');
  runInit(r);
  const exists = existsSync(join(r.dir, 'AGENTS.md'));
  check('A1-created', 'init creates AGENTS.md when the repo has none', exists);
  const text = exists ? readAgents(r.dir) : '';
  check('A2-one-pair', 'the created file carries exactly one marker pair', pairCount(text) === 1);
  check('A3-stamped', `the block is stamped with the package version (${VERSION})`,
    text.includes(`<!-- agentsmyth:${VERSION} BEGIN -->`));
  // Asserts the named path RESOLVES, not that a hardcoded string appears. The original form of this
  // check compared against a literal `.githooks/pre-commit`, which is only correct in agentsmyth's
  // own repository (it sets core.hooksPath); a consumer repo gets `.git/hooks/pre-commit`. The
  // string check passed while every consumer received a block naming a file that did not exist —
  // review finding F2. A test that can only confirm its own hardcoded expectation is not evidence.
  const named = text.match(/pre-commit hook at `([^`]+)`/);
  check('A4-hook-named', 'the block names a pre-commit hook path (R4)', Boolean(named));
  check('A5-hook-resolves', 'the named hook path resolves to a file that actually exists',
    Boolean(named) && existsSync(resolve(r.dir, named[1])));
  check('A6-no-token-leak', 'no unrendered {{TOKEN}} reaches the written block',
    !/\{\{[A-Z_]+\}\}/.test(text));
  check('A7-setup-trigger', 'the block tells an agent to run setup while .agentsmyth/ exists (R4/F1)',
    text.includes('.agentsmyth/setup-bundle.md'));
}

// ── Scenario B: two init runs are byte-identical — replace, never append (R2) ────────────────
{
  const r = newRepo('idempotent');
  runInit(r);
  const first = readAgents(r.dir);
  runInit(r);
  const second = readAgents(r.dir);
  check('B1-identical', 'a second init leaves AGENTS.md byte-identical', first === second);
  check('B2-still-one-pair', 'a second init does not add a second marker pair', pairCount(second) === 1);
}

// ── Scenario C: a block stamped by an older version is replaced in place (R2) ────────────────
// The case that fails under literal marker matching, which is why the version stamp requires
// pattern matching to be a requirement rather than an implementation detail.
{
  const r = newRepo('crossversion');
  writeFileSync(join(r.dir, 'AGENTS.md'), [
    '# Mine', '', 'keep me', '',
    '<!-- agentsmyth:0.0.1 BEGIN -->', 'ANCIENT BLOCK', '<!-- agentsmyth:0.0.1 END -->', '',
    'trailing mine', '',
  ].join('\n'));
  runInit(r);
  const text = readAgents(r.dir);
  check('C1-one-pair', 'an older-stamped block is replaced, not duplicated', pairCount(text) === 1);
  check('C2-old-stamp-gone', 'the old version stamp is gone', !text.includes('agentsmyth:0.0.1'));
  check('C3-old-body-gone', 'the old block body is gone', !text.includes('ANCIENT BLOCK'));
  check('C4-new-stamp', 'the replacement carries the current version stamp',
    text.includes(`<!-- agentsmyth:${VERSION} BEGIN -->`));
  check('C5-above-kept', 'user content above the block survives', text.includes('# Mine') && text.includes('keep me'));
  check('C6-below-kept', 'user content below the block survives', text.includes('trailing mine'));
}

// ── Scenario D: the non-block region is byte-identical across a run (R3) ─────────────────────
{
  const r = newRepo('preserve');
  const above = '# My Project\n\nNotes I wrote.\n\n';
  const below = '\n\n## Appendix\n\nMore of my words.\n';
  writeFileSync(join(r.dir, 'AGENTS.md'),
    `${above}<!-- agentsmyth:0.0.1 BEGIN -->\nold\n<!-- agentsmyth:0.0.1 END -->${below}`);
  runInit(r);
  const stripped = readAgents(r.dir).replace(PAIR_RE, '@@');
  check('D1-outside-untouched', 'every byte outside the markers is unchanged', stripped === `${above}@@${below}`);
}

// ── Scenario E: an orphan BEGIN must not swallow user content (R3) ───────────────────────────
// See header note 2. This is the regression that a plain non-greedy pattern fails.
{
  const r = newRepo('orphan');
  writeFileSync(join(r.dir, 'AGENTS.md'), [
    '# Mine', '',
    '<!-- agentsmyth:1.0.0 BEGIN -->', '',
    'KEEPME', '', '## My section', '', 'words', '',
  ].join('\n'));
  runInit(r);
  runInit(r);
  const text = readAgents(r.dir);
  check('E1-content-survives', 'user content after an orphan BEGIN survives two init runs',
    text.includes('KEEPME'));
  check('E2-section-survives', 'a user heading after an orphan BEGIN survives two init runs',
    text.includes('## My section'));
  check('E3-one-pair', 'exactly one well-formed pair exists alongside the orphan', pairCount(text) === 1);
  check('E4-orphan-kept', 'the orphan BEGIN is left alone rather than absorbed',
    text.includes('<!-- agentsmyth:1.0.0 BEGIN -->'));
}

// ── Scenario F: a non-git directory — the block must not advertise a hook nobody installed ──
// installPreCommitHook() warns and skips outside a git repo, but placeAgentsMd() used to run first
// and resolve the hook path for itself, so the block named `.git/hooks/pre-commit` regardless. The
// path was well-formed and the file did not exist. Scenario A cannot catch this: it runs in a git
// repo, where the hook really is installed and the advertised path really does resolve.
//
// F depends on placeAgentsMd() receiving installPreCommitHook()'s return value, which is why the
// call order in `init` is hook-first. Restoring the old arrangement — placeAgentsMd() first,
// resolving the path itself — makes F2/F3 fail.
{
  const r = newNonGitDir('nongit');
  const result = spawnCli(['init'], { cwd: r.dir, home: r.home });
  rmSync(join(r.dir, '.agentsmyth'), { recursive: true, force: true });

  check('F1-created', 'init still writes AGENTS.md when the directory is not a git repository',
    existsSync(join(r.dir, 'AGENTS.md')));
  const text = existsSync(join(r.dir, 'AGENTS.md')) ? readAgents(r.dir) : '';

  // Premise check: if a hook somehow got installed, F2/F3 would be vacuous rather than wrong.
  check('F2-no-hook-installed', 'no pre-commit hook exists in a non-git directory (scenario premise)',
    !existsSync(join(r.dir, '.git', 'hooks', 'pre-commit')));

  const named = text.match(/pre-commit hook at `([^`]+)`/);
  check('F3-no-phantom-hook', 'the block names no hook path when no hook was installed',
    !named);
  check('F4-no-dangling-path', 'no path the block names in backticks is missing from disk',
    ![...text.matchAll(/`([^`]*pre-commit)`/g)].some((m) => !existsSync(resolve(r.dir, m[1]))));
  check('F5-no-token-leak', 'no unrendered {{TOKEN}} reaches the block on the non-git path',
    text.length > 0 && !/\{\{[A-Z_]+\}\}/.test(text));
  check('F6-init-survives', 'init exits 0 rather than failing on the absent hook', result.status === 0);
}

// ── Scenario G: a real git repo whose hooks path cannot be created (R4) ─────────────────────
// installPreCommitHook() returns null from three places, not one. Scenario F covers the first (no
// git repo); this covers the second — core.hooksPath pointing at a regular file, so mkdirSync()
// throws EEXIST and the hook install warns and skips INSIDE a repo that is unambiguously a git
// repo. The absent gate paragraph used to hardcode "found no git repository here" and tell the
// reader to re-run once the directory is a git repo, which it already was: a true "no hook" claim
// wrapped around a false cause. Review finding F8.
//
// F cannot catch this and neither can A: F has no .git at all, so the hardcoded cause happened to
// be right there, and A installs the hook successfully. The defect lived in the gap between them.
{
  const r = newRepo('badhooks');
  // A regular file where git will look for the hooks DIRECTORY. resolveHooksDir() returns it, and
  // mkdirSync(..., { recursive: true }) throws EEXIST rather than quietly succeeding.
  const hooksFile = join(r.dir, 'hooksfile');
  writeFileSync(hooksFile, 'not a directory\n');
  spawnSync('git', ['config', 'core.hooksPath', 'hooksfile'], { cwd: r.dir, encoding: 'utf8' });

  const result = spawnCli(['init'], { cwd: r.dir, home: r.home });
  rmSync(join(r.dir, '.agentsmyth'), { recursive: true, force: true });

  check('G1-init-survives', 'init exits 0 when the hooks path cannot be created', result.status === 0);
  check('G2-created', 'init still writes AGENTS.md when the hook install fails',
    existsSync(join(r.dir, 'AGENTS.md')));
  const text = existsSync(join(r.dir, 'AGENTS.md')) ? readAgents(r.dir) : '';

  // Premises: this IS a git repo, and no hook was installed. Without both, G4/G5 are vacuous.
  check('G3-is-a-git-repo', 'the scenario really is a git repository (scenario premise)',
    existsSync(join(r.dir, '.git')));
  check('G4-no-hook-installed', 'no pre-commit hook was installed (scenario premise)',
    !existsSync(join(hooksFile, 'pre-commit')) && !existsSync(join(r.dir, '.git', 'hooks', 'pre-commit')));

  check('G5-no-phantom-hook', 'the block names no hook path when the install failed',
    !/pre-commit hook at `([^`]+)`/.test(text));
  // The F8 assertion. The block may say no hook exists; it may not say WHY, because the value it
  // renders from carries no cause. Reverting to the old wording fails here and nowhere else.
  check('G6-no-false-cause', 'the block does not claim this is not a git repository',
    text.length > 0 && !/no git repository|not a git repo|once this directory is a git repo/i.test(text));
  check('G7-no-token-leak', 'no unrendered {{TOKEN}} reaches the block on the failed-install path',
    text.length > 0 && !/\{\{[A-Z_]+\}\}/.test(text));
}

for (const dir of cleanup) {
  try { rmSync(dir, { recursive: true, force: true }); } catch { /* best-effort cleanup */ }
}

console.log(`\n${passed}/${passed + failed} AGENTS.md fallback checks passed`);

if (failed > 0) {
  console.error(`${failed} check(s) failed`);
  process.exit(1);
}

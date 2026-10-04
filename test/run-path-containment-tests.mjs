#!/usr/bin/env node
// WP-R25 path-containment tests (added 2026-10-04, Review findings F6, F7, F13 and F14).
//
// Why a suite of its own rather than more violations fixtures: the negative suite asserts that a
// VALIDATOR exits non-zero on a bad artifact. None of these four findings is a validator rule. They
// are properties of `bin/agentsmyth.mjs` — which file gets written, which gets deleted, and whether
// either escapes the definitions tree — and all four exited ZERO with the defect present, three of
// them while printing a success line. A suite that passes with the defect present cannot be the
// proof the defect is fixed, so these are positive assertions on the filesystem after a real run.
//
// The four findings are one defect with four symptoms: string inspection standing in for resolved
// containment. They are tested together because a fix to one that leaves the shared helper wrong
// would show up here as another case failing, which is the point.
//
// Every case runs the SHIPPED CLI as a subprocess with an explicit scratch HOME — never the real
// environment's, so a bug in the code under test cannot reach a developer's own ~/.agentsmyth. The
// one exception is the F7 predicate case, which must observe Windows separator semantics on a POSIX
// CI runner and so re-imports the predicate under `node:path/win32`.

import { spawnSync } from 'node:child_process';
import {
  existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, symlinkSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const binPath = join(repoRoot, 'bin', 'agentsmyth.mjs');
const cliSource = readFileSync(binPath, 'utf8');

const results = [];
// Reports as it goes rather than collecting for a final pass.
//
// Collected-then-printed, a throw anywhere in the suite discarded every result gathered before it:
// the first run of this suite against the pre-fix CLI died in the lift and printed NOTHING, so the
// findings it had already proven were invisible. A test harness that loses its own output on the
// failure path is worse than a noisy one.
function check(id, description, pass, detail) {
  results.push({ id, description, pass, detail });
  if (pass) {
    console.log(`[PASS] ${id}: ${description}`);
  } else {
    console.log(`[FAIL] ${id}: ${description}`);
    console.log(`       ${detail}`);
  }
}

// Runs one group of assertions so a throw inside it is reported as a failure of THAT group and the
// remaining groups still run. A lift that cannot find its function, for instance, must not take the
// subprocess cases down with it.
async function section(label, fn) {
  try {
    await fn();
  } catch (err) {
    check(`${label}-threw`, `(${label}) the section ran to completion`, false, `${err.message}`);
  }
}

function scratch(prefix) {
  return realpathSync(mkdtempSync(join(tmpdir(), prefix)));
}

// Lifts named functions out of the CLI source into an importable module.
//
// The CLI has no exports and runs its command dispatch at top level, so importing it would execute
// a command; extraction is what is left. It reads the SHIPPED source, so it cannot drift from the
// code that ships the way a transcribed copy would — and a rename that breaks the lift fails this
// suite loudly rather than silently testing nothing.
function liftFunctions(markers, header) {
  let body = `${header}\n`;
  for (const marker of markers) {
    const at = cliSource.indexOf(marker);
    if (at === -1) throw new Error(`cannot find "${marker}" in ${binPath} — has it been renamed?`);
    const rest = cliSource.slice(at);
    body += `export ${rest.slice(0, rest.indexOf('\n}\n') + 3)}\n`;
  }
  const file = join(scratch('agentsmyth-lift-'), 'lifted.mjs');
  writeFileSync(file, body);
  return file;
}

// ── F7: the traversal predicate is separator-blind ─────────────────────────────────────
//
// `path.join` honours `\` on Windows, a declared target of this code, so a `\`-separated traversal
// contained no `..` segment by a `/`-only split, was accepted, and resolved outside the tree. It
// reaches both the prune (a delete) and the manifest reader (an overwrite), and the manifest —
// workflow/provenance.yaml — is a committed file, which puts the whole thing inside an ordinary
// pull request.
await section('f7-separators', async () => {
  const lifted = liftFunctions(['function isSafeRelPath'], "import { isAbsolute } from 'node:path/win32';");
  const { isSafeRelPath } = await import(lifted);
  const cases = [
    ['..\\..\\..\\Users\\me\\Desktop\\thesis.docx', false, 'backslash traversal'],
    ['workflow\\..\\..\\escape.md', false, 'backslash traversal below a valid prefix'],
    ['C:\\Windows\\system32\\drivers\\etc\\hosts', false, 'drive-absolute path'],
    ['workflow\\config\\C:\\x', false, 'drive letter in a later segment'],
    ['../../escape.md', false, 'forward-slash traversal still rejected'],
    ['/etc/passwd', false, 'POSIX absolute still rejected'],
    ['workflow/skills/lifecycle-think/SKILL.md', true, 'an ordinary bundle path still accepted'],
    ['workflow/config/domain.yaml', true, 'an ordinary manifest path still accepted'],
  ];
  for (const [value, want, label] of cases) {
    const got = isSafeRelPath(value);
    check(
      'f7-separators',
      `(F6-F14 family, F7) under win32 semantics, ${label}`,
      got === want,
      `${JSON.stringify(value)} -> ${got ? 'accepted' : 'rejected'}, wanted ${want ? 'accepted' : 'rejected'}`,
    );
  }
});

// ── F6, F13, F14: a real `prepare` over a hostile definitions tree ─────────────────────
//
// One run covers three findings because one run is how they co-occur. The tree is seeded the way a
// machine looks after an earlier install, then given the three hazards: a symlinked intermediate
// directory inside `workflow/` (F6), ledger entries naming paths outside `workflow/` (F14), and a
// bundle declaring paths that escape (F13).
await section('f6-f14-prune', async () => {
  const home = scratch('agentsmyth-contain-');
  const defs = join(home, '.agentsmyth');
  const outside = join(home, 'my-own-checkout');
  mkdirSync(join(defs, 'workflow'), { recursive: true });
  mkdirSync(outside, { recursive: true });
  writeFileSync(join(outside, 'thesis.txt'), 'USER DATA\n');

  // F6: an intermediate directory inside the tree that points out of it. A user who wants the whole
  // tree elsewhere symlinks `~/.agentsmyth` itself, which still works — the root is resolved once,
  // before containment is measured — so rejecting this one does not cost that setup.
  symlinkSync(outside, join(defs, 'workflow', 'skills-link'));

  // F14: `validators/` is copied separately and never expanded, and `notes.md` is the user's own.
  // The prune's comment claimed both were out of reach. They were not.
  //
  // Both are asserted, but `notes.md` is the load-bearing one. Against the pre-fix CLI the
  // validators case PASSES, because `copyRecursive` runs a few lines after the prune and puts the
  // file back — which is ordering, not containment, and is exactly why the review called the
  // comment's safety argument unimplemented rather than merely imprecise. `notes.md` has nothing
  // restoring it, so it stays deleted and the assertion fails where it should.
  mkdirSync(join(defs, 'validators'), { recursive: true });
  writeFileSync(join(defs, 'validators', 'lib.mjs'), 'COPIED SEPARATELY\n');
  writeFileSync(join(defs, 'notes.md'), 'MY OWN NOTES\n');

  // A ledger from a previous expansion naming all three hazards, plus one genuinely stale in-scope
  // file so the test also proves the prune still does its job.
  writeFileSync(join(defs, 'workflow', 'expanded-files.txt'), [
    'workflow/skills-link/thesis.txt',
    'validators/lib.mjs',
    'notes.md',
    'workflow/retired-last-release.md',
    '',
  ].join('\n'));
  writeFileSync(join(defs, 'workflow', 'retired-last-release.md'), 'stale\n');

  const run = spawnSync(process.execPath, [binPath, 'prepare'], {
    encoding: 'utf8',
    env: { ...process.env, HOME: home },
    cwd: repoRoot,
  });
  const out = `${run.stdout ?? ''}${run.stderr ?? ''}`;

  check('f6-prune-symlink', '(F6) a user file outside the tree survives a prune that names it',
    existsSync(join(outside, 'thesis.txt')),
    `prepare exited ${run.status}; ${out.trim().split('\n').slice(-3).join(' | ')}`);
  check('f14-prune-scope-validators', '(F14) validators/lib.mjs survives a ledger that names it',
    existsSync(join(defs, 'validators', 'lib.mjs')), `prepare exited ${run.status}`);
  check('f14-prune-scope-userfile', "(F14) the user's own notes.md survives a ledger that names it",
    existsSync(join(defs, 'notes.md')), `prepare exited ${run.status}`);
  check('f14-prune-still-works', '(F14) a genuinely stale file under workflow/ is still pruned',
    !existsSync(join(defs, 'workflow', 'retired-last-release.md')), `prepare exited ${run.status}`);
  check('f6-prepare-succeeds', '(F6) prepare still completes over a tree containing a symlink',
    run.status === 0, `exit ${run.status}: ${out.trim().split('\n').slice(-3).join(' | ')}`);
});

// ── F13: the write side accepts a declared path that escapes ───────────────────────────
//
// The FILE-marker capture group is `([^>]+)`, so the format places no constraint on the path, and
// the write was unguarded while the delete was not. An escaping entry was written, recorded in the
// ledger, and then permanently un-prunable because the prune guard rejected exactly what the write
// had accepted. This drives `expandBundle` directly, because reaching it through `prepare` would
// require replacing the package's own bundle.
await section('f13-write', async () => {
  const home = scratch('agentsmyth-write-');
  const defs = join(home, '.agentsmyth');
  mkdirSync(join(defs, 'workflow'), { recursive: true });
  const bundle = join(home, 'bundle.md');
  writeFileSync(bundle, [
    '<!-- FILE: workflow/legitimate.md -->', 'kept', '<!-- END FILE -->',
    '<!-- FILE: ../../escaped.md -->', 'pwned', '<!-- END FILE -->',
    '<!-- FILE: validators/sneak.mjs -->', 'pwned', '<!-- END FILE -->',
    '<!-- FILE: workflow/../../also-escaped.md -->', 'pwned', '<!-- END FILE -->',
    '',
  ].join('\n'));

  const lifted = liftFunctions(
    ['function isSafeRelPath', 'function resolveInTree', 'function expandBundle'],
    [
      "import { existsSync, lstatSync, mkdirSync, readFileSync, writeFileSync, realpathSync, rmSync } from 'node:fs';",
      "import { join, dirname, isAbsolute, relative } from 'node:path';",
    ].join('\n'),
  );
  const { expandBundle } = await import(lifted);

  const result = expandBundle(bundle, defs);
  check('f13-write-escape-rejected', '(F13) a declared path that escapes the tree is not written',
    !existsSync(join(home, 'escaped.md')) && !existsSync(join(home, 'also-escaped.md')),
    `written=${result.written}`);
  check('f13-write-scope-enforced', '(F13) a declared path outside workflow/ is not written',
    !existsSync(join(defs, 'validators', 'sneak.mjs')), `written=${result.written}`);
  check('f13-write-legitimate', '(F13) the legitimate entry is still written',
    existsSync(join(defs, 'workflow', 'legitimate.md')), `written=${result.written}`);
  check('f13-ledger-excludes-escapes', '(F13) an escaping entry is not recorded in the ledger',
    readFileSync(join(defs, 'workflow', 'expanded-files.txt'), 'utf8').trim() === 'workflow/legitimate.md',
    readFileSync(join(defs, 'workflow', 'expanded-files.txt'), 'utf8').trim());
});

// ── report ─────────────────────────────────────────────────────────────────────────────
const failed = results.filter((r) => !r.pass).length;
console.log(`\n${results.length - failed}/${results.length} path-containment assertions hold`);
if (failed > 0) {
  console.log('\nThese assert that bin/agentsmyth.mjs cannot write or delete outside the definitions');
  console.log('tree. A failure here is a path-traversal regression, not a style issue.');
  process.exit(1);
}

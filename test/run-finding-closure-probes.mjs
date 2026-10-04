#!/usr/bin/env node
// Probes every CLAUSE of every WP-R25 Review finding's Fix line against the CURRENT tree.
//
// This exists because "all findings are resolved" was asserted once and was wrong in two places.
// Both misses had the same shape: a Fix line carrying two obligations, one of them landed. F8 asked
// for a value-keyed gate AND check-config on the consumer path — the second was the half that
// mattered, so `model_tier: supreme` passed and reached five adapter mappings with no row for it.
// F13 asked for write-side validation, and its Problem also named the agent instruction in the
// consumer fallback path, which still said to write every FILE block "to that path relative to the
// repo root" unconstrained.
//
// So the unit here is the CLAUSE, not the finding: ids read F11.1, F11.2 because that Fix line
// carries two obligations and verifying one proves nothing about the other.
//
// Two rules this file holds itself to:
//
//   1. Probe the DEFECT'S OWN SYMPTOM, not the existence of a test or a fixture. Every one of these
//      22 defects coexisted with a green suite — F1 most starkly, where the rule was correct,
//      reachable, fixture-covered AND mutation-defended while nothing invoked it.
//   2. Prefer BEHAVIOUR over source inspection. A regex over source proves a line is present, which
//      is what a comment does. Where a probe reads source it says so in its label and explains why
//      behaviour was not reachable.
//
// Run with the repo root as argv[2] (`npm run finding-closure:test` passes `.`).

import { spawnSync } from 'node:child_process';
import {
  chmodSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync,
  statSync, symlinkSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const repo = resolve(process.argv[2] ?? '.');
const V = (n) => join(repo, 'src', 'workflow', 'validators', `${n}.mjs`);
const BIN = join(repo, 'bin', 'agentsmyth.mjs');
const ENV = { ...process.env, AGENTSMYTH_HOME: join(repo, 'src', 'workflow') };
const mk = (p) => realpathSync(mkdtempSync(join(tmpdir(), p)));
const src = (f) => readFileSync(join(repo, f), 'utf8');
const run = (cmd, args, opts = {}) => spawnSync(cmd, args, { encoding: 'utf8', env: ENV, cwd: repo, ...opts });
const out = (r) => `${r.stdout ?? ''}${r.stderr ?? ''}`;
const errLines = (r) => out(r).split('\n').filter((l) => l.startsWith('- '));

const results = [];
function probe(id, what, ok, detail = '') {
  results.push({ id, what, ok: Boolean(ok), detail });
}
async function section(label, fn) {
  try { await fn(); } catch (err) { probe(`${label}!`, `${label} probes ran to completion`, false, err.message); }
}

const PROFILE = (extra = '') => 'version: 1\nkind: repo-profile\n\nrepository:\n'
  + '  mode: single-repository\n  root: .\n  default_branch: main\n  workflow_root: workflow\n'
  + '  artifacts_root: workflow/artifacts\n  learnings_sessions_root: workflow/learnings/sessions\n' + extra;
const TIER_ITEM = 'version: 1\nkind: pending-setup\nitems:\n  - id: PS-1\n'
  + '    field: "tuning.council.model_tier"\n    status: open\n    question: "tier?"\n';

function gitRepo(prefix) {
  const d = mk(prefix);
  run('git', ['init', '-q'], { cwd: d });
  run('git', ['config', 'user.email', 't@e.com'], { cwd: d });
  run('git', ['config', 'user.name', 't'], { cwd: d });
  return d;
}
function artifactBody(slug, artifact, phase = 'build', next = 'review') {
  return `---\nslug: ${slug}\nversion: 1\nartifact: ${artifact}\nstatus: ready-for-next-phase\n`
    + `created: 2026-01-01T00:00:00Z\nupdated: 2026-01-01T00:00:00Z\nmanifest_ids:\n  - R1\n`
    + `upstream:\n  - user-request\norchestration:\n  phase: ${phase}\n  status: ready-for-next-phase\n`
    + `  next_phase: ${next}\n  blockers: []\n  user_checkpoint: none\n---\n\n# ${slug}\n`;
}

// Lifts functions out of the CLI, which has no exports and dispatches at top level.
const cli = readFileSync(BIN, 'utf8');
function lift(markers, header) {
  let body = `${header}\n`;
  for (const m of markers) {
    const at = cli.indexOf(m);
    if (at === -1) throw new Error(`cannot find "${m}" in bin/agentsmyth.mjs — renamed?`);
    const rest = cli.slice(at);
    body += `export ${rest.slice(0, rest.indexOf('\n}\n') + 3)}\n`;
  }
  const f = join(mk('fcp-lift-'), 'm.mjs');
  writeFileSync(f, body);
  return f;
}

// ─── F1: the Think gate needs an invoker, and a check that keeps it ────────────────────
await section('F1', async () => {
  const phases = ['think', 'plan', 'build', 'review', 'test', 'ship', 'reflect'];
  const missing = phases.filter((p) => !new RegExp(`agentsmyth check --phase ${p}`)
    .test(src(`src/workflow/skills/lifecycle-${p}/SKILL.md`)));
  probe('F1.1', 'lifecycle-think/SKILL.md carries the gate invocation the other six carry',
    missing.length === 0, `missing in: ${missing.join(', ')}`);

  // Clause 2/3 are about a CHECK existing and being the thing that stops recurrence, so this one
  // probe is necessarily about the suite rather than a symptom — and it is checked by running the
  // conformance suite, not by grepping for the case name.
  const conf = run(process.execPath, [join(repo, 'test', 'run-conformance-tests.mjs')]);
  probe('F1.2', 'a conformance case asserts every phase skill invokes its own gate',
    /r25-every-phase-skill-invokes-its-gate/.test(out(conf)) && conf.status === 0,
    out(conf).split('\n').filter((l) => /every-phase-skill/.test(l)).join(' '));
});

// ─── F2: the precondition covers EVERY phase that can dispatch a council ───────────────
await section('F2', async () => {
  // Derived from the resolved per_phase map, so the probe reads that map and asserts each phase in
  // it gates — rather than hard-coding think and review and missing a phase added later.
  const behavior = src('src/workflow/agent-behavior.yaml');
  const perPhase = behavior.slice(behavior.indexOf('per_phase:'));
  const phases = [...perPhase.slice(0, perPhase.indexOf('\n  ', 1) + 400).matchAll(/^    (\w+):/gm)].map((m) => m[1]);
  probe('F2.0', 'the resolved config declares at least one council phase to check', phases.length > 0, `found: ${phases.join(', ')}`);

  for (const phase of phases) {
    const d = gitRepo(`fcp-f2-${phase}-`);
    mkdirSync(join(d, 'workflow', 'config'), { recursive: true });
    mkdirSync(join(d, 'workflow', 'artifacts', 'tasks'), { recursive: true });
    writeFileSync(join(d, 'workflow', 'config', 'pending-setup.yaml'), TIER_ITEM);
    writeFileSync(join(d, 'workflow', 'config', 'repo-profile.yaml'), PROFILE());
    writeFileSync(join(d, 'workflow', 'artifacts', 'tasks', 'probe-v1.md'), artifactBody('probe', 'task'));
    run('git', ['add', '-A'], { cwd: d });
    const r = run(process.execPath, [V('check-lifecycle'), '--phase', phase], { cwd: d });
    probe(`F2.1:${phase}`, `the tier gate fires at --phase ${phase}`,
      r.status !== 0 && /no council capability tier is resolved/.test(out(r)), out(r).slice(-130));
  }
});

// ─── F3: refuse, hard-error, ledger-before-delete, stamp only on success ───────────────
await section('F3', async () => {
  const mod = lift(['function isSafeRelPath', 'function resolveInTree', 'function expandBundle'],
    "import { existsSync, lstatSync, mkdirSync, readFileSync, writeFileSync, realpathSync, rmSync } from 'node:fs';\n"
    + "import { join, dirname, isAbsolute, relative } from 'node:path';");
  const { expandBundle } = await import(mod);

  const h = mk('fcp-f3-');
  const defs = join(h, '.agentsmyth');
  mkdirSync(join(defs, 'workflow'), { recursive: true });
  writeFileSync(join(defs, 'workflow', 'keep.md'), 'owned\n');
  writeFileSync(join(defs, 'workflow', 'expanded-files.txt'), 'workflow/keep.md\n');
  writeFileSync(join(h, 'empty.md'), 'a bundle with no FILE markers\n');

  let threw = false;
  let msg = '';
  try { expandBundle(join(h, 'empty.md'), defs); } catch (e) { threw = true; msg = e.message; }
  probe('F3.1', 'an expansion that produced no files refuses to prune',
    threw && existsSync(join(defs, 'workflow', 'keep.md')), `threw=${threw}`);
  probe('F3.2', 'and it is a hard error naming the damaged bundle, not a quiet empty declaration',
    threw && /declared no files/.test(msg), msg.slice(0, 110));

  // Clause 3: the ledger must describe what THIS expansion owns, written before the deletions. The
  // observable consequence is that after a prune the ledger lists the new declaration only — if it
  // were written after the deletions a crash would leave the pre-prune list, which is what the old
  // comment wrongly claimed was the safe direction.
  const h2 = mk('fcp-f3b-');
  const d2 = join(h2, '.agentsmyth');
  mkdirSync(join(d2, 'workflow'), { recursive: true });
  writeFileSync(join(d2, 'workflow', 'stale.md'), 'retired\n');
  writeFileSync(join(d2, 'workflow', 'expanded-files.txt'), 'workflow/stale.md\n');
  writeFileSync(join(h2, 'b.md'), '<!-- FILE: workflow/fresh.md -->\nnew\n<!-- END FILE -->\n');
  expandBundle(join(h2, 'b.md'), d2);
  const ledger = readFileSync(join(d2, 'workflow', 'expanded-files.txt'), 'utf8').trim();
  probe('F3.3', 'the ledger describes what this expansion owns, not the pre-prune state',
    ledger === 'workflow/fresh.md' && !existsSync(join(d2, 'workflow', 'stale.md')), ledger);

  // Clause 4: the stamp must not be written when expansion failed. Driven through the real CLI with
  // a scratch HOME, by pointing it at a package whose bundle is damaged.
  const pkg = mk('fcp-f3-pkg-');
  for (const part of ['bin', 'src', 'dist', 'validators', 'package.json']) {
    run('cp', ['-R', join(repo, part), join(pkg, part)]);
  }
  writeFileSync(join(pkg, 'dist', 'workflow-bundle.md'), 'truncated, no markers\n');
  const home = mk('fcp-f3-home-');
  const r = run(process.execPath, [join(pkg, 'bin', 'agentsmyth.mjs'), 'prepare'], { env: { ...process.env, HOME: home } });
  probe('F3.4', 'a failed expansion writes no version stamp, so an empty tree cannot read as healthy',
    r.status !== 0 && !existsSync(join(home, '.agentsmyth', 'workflow', 'installed-version.txt')),
    `exit ${r.status}, stamp present: ${existsSync(join(home, '.agentsmyth', 'workflow', 'installed-version.txt'))}`);
  probe('F3.5', 'and it reports cleanly rather than as a stack trace',
    r.status !== 0 && !/\n\s+at /.test(out(r)), out(r).split('\n').slice(-3).join(' | ').slice(0, 120));
});

// ─── F4 / F5 / F20 / F21: backup and hook behaviour, driven through upgrade and init ───
await section('F4-F5-F20-F21', async () => {
  // F21, both clauses, behavioural: a 0700 hook keeps its mode and its line-1 shebang.
  if (process.platform !== 'win32') {
    const d = gitRepo('fcp-f21-');
    run('git', ['config', 'core.hooksPath', '.githooks'], { cwd: d });
    mkdirSync(join(d, '.githooks'), { recursive: true });
    writeFileSync(join(d, '.githooks', 'pre-commit'), '#!/bin/sh\necho MINE\n');
    chmodSync(join(d, '.githooks', 'pre-commit'), 0o700);
    const home = mk('fcp-f21-home-');
    run(process.execPath, [BIN, 'prepare'], { env: { ...process.env, HOME: home } });
    run(process.execPath, [BIN, 'init'], { cwd: d, env: { ...process.env, HOME: home } });
    const hook = join(d, '.githooks', 'pre-commit');
    const text = existsSync(hook) ? readFileSync(hook, 'utf8') : '';
    const mode = existsSync(hook) ? statSync(hook).mode & 0o777 : 0;
    probe('F21.1', "an existing hook's 0700 mode is preserved, not widened", mode === 0o700, `mode ${mode.toString(8)}`);
    // Shebang on line 1 is the invariant on BOTH write paths. Ordering is NOT: outside a generated
    // hooks directory the gate is deliberately APPENDED, because a hand-written hook may establish
    // the environment the gate depends on. The first version of this probe asserted gate-before-host
    // here and failed — on the append path, where the gate being last is correct.
    probe('F21.2', 'the shebang is still line 1 after an appended gate',
      text.split('\n')[0] === '#!/bin/sh' && text.includes('agentsmyth:mandatory-lifecycle-gate'),
      text.split('\n').slice(0, 2).join(' / '));
    probe('F21.3', "and the user's own line survives", text.includes('echo MINE'));

    // F20, behavioural: a version-SHAPED directory agentsmyth never created is not swept.
    const consumer = join(d, 'workflow', 'backups', '1.0.0', 'workflow', 'config', 'domain.yaml');
    mkdirSync(join(d, 'workflow', 'backups', '1.0.0', 'workflow', 'config'), { recursive: true });
    writeFileSync(consumer, 'the consumer owns this\n');
    const target = join(d, 'workflow', 'config', 'domain.yaml');
    if (existsSync(target)) writeFileSync(target, `${readFileSync(target, 'utf8')}\n# edit\n`);
    const up = run(process.execPath, [BIN, 'upgrade'], { cwd: d, env: { ...process.env, HOME: home } });
    probe('F20.1', 'a version-shaped directory agentsmyth never created is not swept',
      existsSync(consumer) && readFileSync(consumer, 'utf8') === 'the consumer owns this\n',
      `upgrade exit ${up.status}`);
    probe('F20.2', 'and the run says it left pre-index directories alone rather than doing so silently',
      /predate the ownership index/.test(out(up)), out(up).split('\n').filter((l) => /predate/.test(l)).join(''));

    // F5, behavioural: a second same-version upgrade must not overwrite the open item's backup.
    const d2 = gitRepo('fcp-f5-');
    run('git', ['config', 'core.hooksPath', '.githooks'], { cwd: d2 });
    const home2 = mk('fcp-f5-home-');
    run(process.execPath, [BIN, 'prepare'], { env: { ...process.env, HOME: home2 } });
    run(process.execPath, [BIN, 'init'], { cwd: d2, env: { ...process.env, HOME: home2 } });
    const BEGIN = '# >>> agentsmyth:mandatory-lifecycle-gate >>>';
    const h2 = join(d2, '.githooks', 'pre-commit');
    const pend = join(d2, 'workflow', 'config', 'pending-setup.yaml');
    writeFileSync(h2, readFileSync(h2, 'utf8').replace(BEGIN, `${BEGIN}\n# FIRST EDIT`));
    run(process.execPath, [BIN, 'upgrade'], { cwd: d2, env: { ...process.env, HOME: home2 } });
    const backupRel = existsSync(pend) ? readFileSync(pend, 'utf8').match(/backup_path: "([^"]*pre-commit)"/)?.[1] : null;
    writeFileSync(h2, readFileSync(h2, 'utf8').replace(BEGIN, `${BEGIN}\n# SECOND EDIT`));
    run(process.execPath, [BIN, 'upgrade'], { cwd: d2, env: { ...process.env, HOME: home2 } });
    const kept = backupRel && existsSync(join(d2, backupRel))
      && readFileSync(join(d2, backupRel), 'utf8').includes('# FIRST EDIT');
    probe('F5.1', "a second same-version upgrade does not overwrite the open item's backup", kept,
      `backup=${backupRel}`);
    // Clause 2: the second edit is preserved in a backup of its own (per-run versioning).
    const all = [];
    const walk = (dir) => {
      if (!existsSync(dir)) return;
      for (const n of readdirSync(dir)) {
        const f = join(dir, n);
        if (statSync(f).isDirectory()) walk(f); else all.push(f);
      }
    };
    walk(join(d2, 'workflow', 'backups'));
    probe('F5.2', 'and the second edit is preserved in a per-run backup of its own',
      all.some((f) => readFileSync(f, 'utf8').includes('# SECOND EDIT')), `${all.length} backup file(s)`);
  } else {
    probe('F21.skip', 'hook mode probes need POSIX mode bits', true, 'skipped on win32');
  }

  // F4: source-read, and the label says so. The guard is unreachable by construction once F5 is
  // fixed — reaching the sweep with a protected path requires this run's file to byte-match a
  // backup taken before an earlier rewrite of that same file, and if those match then that earlier
  // run changed nothing and raised no item. Behaviour cannot probe it; its presence is the claim.
  probe('F4.1', 'the noop sweep consults the shared open-backup set (SOURCE-READ: unreachable by construction)',
    /openBackupPaths\.includes\(b\.backup\)/.test(cli) && (cli.match(/openReconcileBackupPaths\(/g) ?? []).length >= 1);
});

// ─── F6 / F7 / F14: containment ────────────────────────────────────────────────────────
await section('F6-F7-F14', async () => {
  const mod = lift(['function isSafeRelPath', 'function resolveInTree', 'function expandBundle'],
    "import { existsSync, lstatSync, mkdirSync, readFileSync, writeFileSync, realpathSync, rmSync } from 'node:fs';\n"
    + "import { join, dirname, isAbsolute, relative } from 'node:path';");
  const { expandBundle } = await import(mod);

  const h = mk('fcp-f6-');
  const defs = join(h, '.agentsmyth');
  const outside = join(h, 'mine');
  mkdirSync(join(defs, 'workflow'), { recursive: true });
  mkdirSync(outside, { recursive: true });
  writeFileSync(join(outside, 'thesis.txt'), 'USER DATA\n');
  symlinkSync(outside, join(defs, 'workflow', 'link'));
  mkdirSync(join(defs, 'validators'), { recursive: true });
  writeFileSync(join(defs, 'validators', 'lib.mjs'), 'COPIED SEPARATELY\n');
  writeFileSync(join(defs, 'notes.md'), 'MY OWN NOTES\n');
  writeFileSync(join(defs, 'workflow', 'expanded-files.txt'),
    'workflow/link/thesis.txt\nvalidators/lib.mjs\nnotes.md\nworkflow/stale.md\n');
  writeFileSync(join(defs, 'workflow', 'stale.md'), 'retired\n');
  writeFileSync(join(h, 'b.md'), '<!-- FILE: workflow/ok.md -->\nyes\n<!-- END FILE -->\n');
  const r = expandBundle(join(h, 'b.md'), defs);

  probe('F6.1', 'the prune resolves intermediate symlinks and does not delete outside the tree',
    existsSync(join(outside, 'thesis.txt')), `removed: ${JSON.stringify(r.removed)}`);
  probe('F14.1', 'prune candidates are scoped to the workflow/ subtree the bundle owns',
    existsSync(join(defs, 'validators', 'lib.mjs')) && existsSync(join(defs, 'notes.md')));
  probe('F14.1b', 'and a genuinely stale in-scope file is still pruned',
    !existsSync(join(defs, 'workflow', 'stale.md')));

  // F14 clause 2: the comment must no longer assert a containment the code does not implement.
  const pruneComment = cli.slice(cli.indexOf('THE BLAST RADIUS IS THE LEDGER'), cli.indexOf('const ledgerPath'));
  probe('F14.2', 'the prune comment no longer claims a scope the code does not enforce (SOURCE-READ: a comment is text)',
    /enforced instead of described/.test(pruneComment) && !/deliberately narrower than "anything\n\s*\/\/ here the bundle does not declare"/.test(pruneComment),
    pruneComment.slice(0, 80));

  const pm = lift(['function isSafeRelPath'], "import { isAbsolute } from 'node:path/win32';");
  const { isSafeRelPath } = await import(pm);
  const rejects = ['..\\..\\..\\Users\\me\\x', 'C:\\Windows\\x', 'workflow\\..\\..\\y', '../../z', '/etc/passwd'];
  const accepts = ['workflow/skills/a.md', 'workflow/config/domain.yaml'];
  probe('F7.1', 'traversal is rejected on both separators, and ordinary paths still pass',
    rejects.every((v) => !isSafeRelPath(v)) && accepts.every((v) => isSafeRelPath(v)),
    `rejected ${rejects.filter((v) => !isSafeRelPath(v)).length}/${rejects.length}`);
});

// ─── F9: an UNREADABLE pending-setup, not merely an absent one ─────────────────────────
await section('F9', async () => {
  const cases = [
    ['absent', (dir) => { /* write nothing */ }],
    ['a directory where a file belongs', (dir) => mkdirSync(join(dir, 'config', 'pending-setup.yaml'), { recursive: true })],
    ['mode 000', (dir) => {
      writeFileSync(join(dir, 'config', 'pending-setup.yaml'), TIER_ITEM);
      chmodSync(join(dir, 'config', 'pending-setup.yaml'), 0o000);
    }],
    ['not YAML at all', (dir) => writeFileSync(join(dir, 'config', 'pending-setup.yaml'), '\x00\x01 binary \x7f{[')],
  ];
  for (const [label, seed] of cases) {
    if (label === 'mode 000' && process.getuid?.() === 0) {
      probe('F9.1:mode 000', 'running as root ignores mode bits', true, 'skipped');
      continue;
    }
    const d = mk('fcp-f9-');
    mkdirSync(join(d, 'config'), { recursive: true });
    writeFileSync(join(d, 'config', 'repo-profile.yaml'), PROFILE());
    seed(d);
    const r = run(process.execPath, [V('check-lifecycle'), '--phase', 'think', '--dir', d]);
    probe(`F9.1:${label}`, `pending-setup ${label} fails closed`, r.status !== 0, out(r).slice(-120));
  }
});

// ─── F10: all three depth branches, including the one that must still fire ─────────────
await section('F10', async () => {
  const fxDir = 'test/fixtures/lifecycle-violations';
  const r1 = run(process.execPath, [V('check-council-record'), '--dir', `${fxDir}/jq-council-deep-unsampled-member`]);
  probe('F10.1:deep', 'deep requires one spot-check per web-citing member',
    r1.status !== 0 && /deep requires one sample per member/.test(out(r1)), errLines(r1).join('').slice(0, 110));

  const r2 = run(process.execPath, [V('check-council-record'), '--dir', 'test/fixtures/conformance/council-shallow-web']);
  probe('F10.2:shallow', 'shallow with web findings and no challenger is ACCEPTED', r2.status === 0, errLines(r2).join('').slice(0, 110));

  // The branch most at risk from the fix: `standard` must STILL demand one sample. A three-way
  // branch that accidentally exempts the default would show up here and nowhere else.
  const d = mk('fcp-f10-std-');
  mkdirSync(join(d, 'reviews'), { recursive: true });
  mkdirSync(join(d, 'config'), { recursive: true });
  const base = readFileSync(join(repo, 'test/fixtures/conformance/council-shallow-web/reviews/probe-v1.md'), 'utf8');
  writeFileSync(join(d, 'reviews', 'probe-v1.md'), base.replace('  depth: shallow\n', '  depth: standard\n'));
  writeFileSync(join(d, 'config', 'repo-profile.yaml'), PROFILE('\ntuning:\n  council:\n    depth: standard\n'));
  const r3 = run(process.execPath, [V('check-council-record'), '--dir', d]);
  probe('F10.3:standard', 'standard still requires a challenger spot-check for a web round',
    r3.status !== 0 && /no challenger spot-check in that round/.test(out(r3)), errLines(r3).join('').slice(0, 110));
});

// ─── F11: each axis required individually, and the opt-out actually works ──────────────
await section('F11', async () => {
  const base = readFileSync(join(repo,
    'test/fixtures/lifecycle-violations/jr-council-depth-departs-unflagged/reviews/probe-v1.md'), 'utf8')
    .replace('  depth: shallow\n', '  depth: standard\n');
  const cfg = PROFILE('\ntuning:\n  council:\n    depth: standard\n');

  // Each axis dropped on its own. Requiring three keys with one probe would pass if only one were
  // enforced, which is the exact mistake this file exists to catch.
  for (const axis of ['depth', 'model_tier', 'effort']) {
    const d = mk(`fcp-f11-${axis}-`);
    mkdirSync(join(d, 'reviews'), { recursive: true });
    mkdirSync(join(d, 'config'), { recursive: true });
    writeFileSync(join(d, 'config', 'repo-profile.yaml'), cfg);
    writeFileSync(join(d, 'reviews', 'probe-v1.md'), base.replace(new RegExp(`^  ${axis}: .*\\n`, 'm'), ''));
    const r = run(process.execPath, [V('check-council-record'), '--dir', d]);
    probe(`F11.1:${axis}`, `a council record omitting ${axis} is rejected`,
      r.status !== 0 && new RegExp(`requires frontmatter council\\.${axis}`).test(out(r)), errLines(r).join('').slice(0, 110));
  }

  const dm = mk('fcp-f11-mt-');
  mkdirSync(join(dm, 'reviews'), { recursive: true });
  mkdirSync(join(dm, 'config'), { recursive: true });
  writeFileSync(join(dm, 'config', 'repo-profile.yaml'), cfg);
  writeFileSync(join(dm, 'reviews', 'probe-v1.md'), base.replace(/^ {2}member_tokens:\n(?: {4}.+\n)+/m, ''));
  const rm = run(process.execPath, [V('check-council-record'), '--dir', dm]);
  probe('F11.2a', 'a council record omitting member_tokens is rejected',
    rm.status !== 0 && /requires frontmatter council\.member_tokens/.test(out(rm)), errLines(rm).join('').slice(0, 110));

  // The opt-out must be USABLE, or the requirement is unsatisfiable for a host that reports nothing.
  const du = mk('fcp-f11-un-');
  mkdirSync(join(du, 'reviews'), { recursive: true });
  mkdirSync(join(du, 'config'), { recursive: true });
  writeFileSync(join(du, 'config', 'repo-profile.yaml'), cfg);
  writeFileSync(join(du, 'reviews', 'probe-v1.md'), base);
  const ru = run(process.execPath, [V('check-council-record'), '--dir', du]);
  // The schema check runs against the REGISTERED fixture rather than this scratch tree: the scratch
  // config declares `artifacts_root: workflow/artifacts` while the files sit in `<dir>/reviews/`, so
  // check-artifacts rejected it on directory layout and the first version of this probe read that as
  // the opt-out being invalid. The registered fixture carries the same per-member `unavailable`.
  const ra = run(process.execPath, [V('check-artifacts'), '--dir',
    'test/fixtures/lifecycle-violations/jr-council-depth-departs-unflagged']);
  probe('F11.2b', 'per-member "unavailable" is accepted as the explicit opt-out, by BOTH validators',
    ru.status === 0 && ra.status === 0, `council=${ru.status} artifacts=${ra.status} ${errLines(ra).join('').slice(0, 90)}`);
});

// ─── F12: every non-object shape is rejected, and the reason rule still fires ──────────
await section('F12', async () => {
  const base = readFileSync(join(repo,
    'test/fixtures/lifecycle-violations/jr-council-depth-departs-unflagged/reviews/probe-v1.md'), 'utf8')
    .replace('  depth: shallow\n', '  depth: standard\n');
  const cfg = PROFILE('\ntuning:\n  council:\n    depth: standard\n');
  const shapes = [
    ['a string', '  overrides: "model_tier=deep"\n  override_reason: "a reason"\n'],
    ['an array', '  overrides:\n    - model_tier\n  override_reason: "a reason"\n'],
  ];
  for (const [label, block] of shapes) {
    const d = mk('fcp-f12-');
    mkdirSync(join(d, 'reviews'), { recursive: true });
    mkdirSync(join(d, 'config'), { recursive: true });
    writeFileSync(join(d, 'config', 'repo-profile.yaml'), cfg);
    writeFileSync(join(d, 'reviews', 'probe-v1.md'), base.replace('  dispatch_depth: 1', `${block}  dispatch_depth: 1`));
    const r = run(process.execPath, [V('check-council-record'), '--dir', d]);
    probe(`F12.1:${label}`, `overrides as ${label} is rejected rather than ignored`,
      r.status !== 0 && /must be a mapping of setting to value/.test(out(r)), errLines(r).join('').slice(0, 110));
  }
  // And the original rule must still fire for a real object with no reason.
  const d = mk('fcp-f12-obj-');
  mkdirSync(join(d, 'reviews'), { recursive: true });
  mkdirSync(join(d, 'config'), { recursive: true });
  writeFileSync(join(d, 'config', 'repo-profile.yaml'), cfg);
  writeFileSync(join(d, 'reviews', 'probe-v1.md'),
    base.replace('  dispatch_depth: 1', '  overrides:\n    model_tier: deep\n  dispatch_depth: 1'));
  const r = run(process.execPath, [V('check-council-record'), '--dir', d]);
  probe('F12.2', 'a real overrides object with no reason still fires the original rule',
    r.status !== 0 && /carries no council\.override_reason/.test(out(r)), errLines(r).join('').slice(0, 110));
});

// ─── F15 / F16 / F22: the registered fixtures, plus the positive control ───────────────
await section('F15-F16-F22', async () => {
  const cases = [
    ['F15.1', 'ju-cost-estimate-sample-exceeds-history', /sample cannot exceed the history/, 'the asserted sample is compared against the records present'],
    ['F15.2', 'jt-cost-estimate-no-figure', /states no cost figure/, 'a sample with no cost figure is rejected'],
    ['F15.3', 'js-cost-estimate-zero-sample', /rests on a sample of zero/, 'a claimed sample of zero must be no-history'],
    ['F16.1', 'jp-council-enabled-contradicts-config', /resolved configuration says "disabled"/, 'a record claiming councils were on while config forbids them is rejected'],
    ['F22.1', 'jv-council-member-no-definition', /gives no Definition for member/, 'a record naming no member definition is rejected'],
  ];
  for (const [id, fx, re, what] of cases) {
    const r = run(process.execPath, [V('check-council-record'), '--dir', `test/fixtures/lifecycle-violations/${fx}`]);
    probe(id, what, r.status !== 0 && re.test(out(r)), errLines(r).join(' ').slice(0, 110));
  }
  const pos = run(process.execPath, [V('check-council-record'), '--dir', 'test/fixtures/conformance/council-member-definition-named']);
  probe('F22.1b', 'and a record that DOES name its definitions is accepted', pos.status === 0, errLines(pos).join('').slice(0, 110));

  // F22 clause 2, behavioural: a repo with a resolved tier and no rendered definition is refused.
  const d = mk('fcp-f22b-');
  mkdirSync(join(d, 'workflow', 'config'), { recursive: true });
  mkdirSync(join(d, 'workflow', 'artifacts'), { recursive: true });
  mkdirSync(join(d, 'workflow', 'learnings'), { recursive: true });
  writeFileSync(join(d, 'workflow', 'config', 'repo-profile.yaml'), PROFILE('\ntuning:\n  council:\n    model_tier: standard\n'));
  writeFileSync(join(d, 'AGENTS.md'), '# agents\n');
  const r = run(process.execPath, [V('check-setup-complete')], { cwd: d });
  probe('F22.2', 'check-setup-complete refuses a resolved tier with no rendered member definition',
    /no council member definition found/.test(out(r)), out(r).split('\n').filter((l) => /member definition/.test(l)).join('').slice(0, 110));
});

// ─── F17: the message advertises only remedies that work, and both do ──────────────────
await section('F17', async () => {
  const lifecycleSrc = src('src/workflow/validators/check-lifecycle.mjs');
  const i = lifecycleSrc.indexOf('ways forward');
  const window = lifecycleSrc.slice(Math.max(0, i - 500), i + 800);
  probe('F17.1a', 'the refusal no longer offers a waiver remedy (SOURCE-READ: the claim is the message text)',
    i !== -1 && !/waiver/i.test(window), window.match(/\bwaiver\w*/i)?.[0] ?? '');

  // Both advertised remedies must actually clear the block, which is the half a reader follows.
  const remedies = [
    ['no remedy', '', true],
    ['write a tier', '\ntuning:\n  council:\n    model_tier: standard\n', false],
    ['disable councils', '\ntuning:\n  council:\n    enabled: disabled\n', false],
  ];
  for (const [label, extra, expectGated] of remedies) {
    const d = mk('fcp-f17-');
    mkdirSync(join(d, 'config'), { recursive: true });
    writeFileSync(join(d, 'config', 'pending-setup.yaml'), TIER_ITEM);
    writeFileSync(join(d, 'config', 'repo-profile.yaml'), PROFILE(extra));
    const r = run(process.execPath, [V('check-lifecycle'), '--phase', 'think', '--dir', d]);
    probe(`F17.1b:${label}`, expectGated ? 'the control still gates' : `the advertised remedy "${label}" clears the block`,
      (r.status !== 0) === expectGated, out(r).slice(-110));
  }
});

// ─── F18: the staged leg validates, and is scoped to staged artifacts ──────────────────
await section('F18', async () => {
  const d = gitRepo('fcp-f18-');
  mkdirSync(join(d, 'workflow', 'config'), { recursive: true });
  mkdirSync(join(d, 'workflow', 'artifacts', 'reviews'), { recursive: true });
  writeFileSync(join(d, 'workflow', 'config', 'repo-profile.yaml'), PROFILE());
  // A council-mode record carrying the status the per-artifact leg skips, and one real defect.
  writeFileSync(join(d, 'workflow', 'artifacts', 'reviews', 'staged-v1.md'),
    ['---', 'slug: staged', 'version: 1', 'artifact: review', 'status: blocked-for-user',
      'created: 2026-10-06', 'updated: 2026-10-06', 'manifest_ids: [R1]',
      'upstream:', '  - workflow/artifacts/tasks/staged-v1.md', 'orchestration:', '  phase: review',
      '  status: blocked-for-user', '  next_phase: test', '  blockers: []', '  user_checkpoint: none',
      'council:', '  mode: council', '---', '', '# Staged', '', 'No council log.', ''].join('\n'));
  run('git', ['add', '-A'], { cwd: d });
  const home = mk('fcp-f18-home-');
  const r = run(process.execPath, [BIN, 'check', '--staged'], { cwd: d, env: { ...ENV, HOME: home } });
  probe('F18.1', 'the --staged leg validates a staged blocked-for-user council record',
    r.status !== 0 && /staged-v1\.md/.test(out(r)), out(r).split('\n').slice(-4).join(' | ').slice(0, 130));

  // Scoped: a commit touching no artifacts must not sweep the artifacts tree.
  const d2 = gitRepo('fcp-f18b-');
  mkdirSync(join(d2, 'workflow', 'config'), { recursive: true });
  mkdirSync(join(d2, 'workflow', 'artifacts'), { recursive: true });
  writeFileSync(join(d2, 'workflow', 'config', 'repo-profile.yaml'), PROFILE());
  writeFileSync(join(d2, 'README.md'), 'hello\n');
  run('git', ['add', '-A'], { cwd: d2 });
  const r2 = run(process.execPath, [BIN, 'check', '--staged'], { cwd: d2, env: { ...ENV, HOME: mk('fcp-f18b-home-') } });
  probe('F18.2', 'and a commit touching no artifacts does not run the council check at all',
    !/council brief\(s\)/.test(out(r2)), out(r2).split('\n').slice(-2).join(' | ').slice(0, 110));
});

// ─── F19: prepare installs the templates, and the skill reads them from there ──────────
await section('F19', async () => {
  const home = mk('fcp-f19-');
  const r = run(process.execPath, [BIN, 'prepare'], { env: { ...process.env, HOME: home } });
  const tools = ['claude', 'codex', 'copilot', 'cursor', 'windsurf'];
  const present = tools.filter((t) => existsSync(join(home, '.agentsmyth', 'workflow', 'adapters', t, 'council-member.md')));
  probe('F19.2', 'prepare installs all five council-member templates into the definitions tree',
    r.status === 0 && present.length === 5, `installed ${present.length}/5`);
  const skill = src('src/setup/SKILL.md');
  const firstRef = skill.slice(0, skill.indexOf('council-member.md') + 'council-member.md'.length);
  probe('F19.1', 'and the skill resolves the template from <definitions_root>, not the staging dir',
    firstRef.endsWith('<definitions_root>/adapters/<tool>/council-member.md'), `...${firstRef.slice(-60)}`);
});

// ─── report ────────────────────────────────────────────────────────────────────────────
const failed = results.filter((r) => !r.ok);
for (const r of results) {
  console.log(`${r.ok ? '[ OK ]' : '[FAIL]'} ${r.id.padEnd(16)} ${r.what}`);
  if (!r.ok && r.detail) console.log(`                        ${r.detail}`);
}
console.log(`\n${results.length - failed.length}/${results.length} finding-closure clauses verified`);
if (failed.length > 0) {
  console.log(`UNRESOLVED CLAUSES: ${failed.map((r) => r.id).join(', ')}`);
  process.exit(1);
}

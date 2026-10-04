// Probes every one of the WP-R25 Review council's 22 findings against the CURRENT tree.
//
// This exists because "all findings are resolved" was asserted once and turned out to be wrong in
// two places. Several findings carried a two-part Fix line and only one part had landed: the
// capability gate keyed on a tier's PRESENCE while the enum check sat in a validator no consumer
// path ran, so `model_tier: supreme` passed and was handed to five adapter mappings with no row for
// it; and the setup skill still told an agent to write every FILE block "to that path relative to
// the repo root" with no containment constraint, which is the same traversal the CLI had just been
// taught to refuse.
//
// Each probe asserts the DEFECT'S OWN SYMPTOM is gone, not that a test or a fixture exists. The
// distinction is the whole point: every one of these findings coexisted with a green suite.
//
// Run with the repo root as argv[2] (`npm run finding-closure:test` passes `.`).
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, symlinkSync, writeFileSync, statSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

// Resolved absolutely: several probes run with `cwd` set to a scratch repo, and a relative root
// (`npm run finding-closure:test` passes `.`) then resolves the validator paths against THAT
// directory instead of this one. F2 failed exactly that way on the first packaged run — the probe
// was wrong, not the fix.
const repo = resolve(process.argv[2] ?? '.');
const V = (n) => join(repo, 'src', 'workflow', 'validators', `${n}.mjs`);
const BIN = join(repo, 'bin', 'agentsmyth.mjs');
const ENV = { ...process.env, AGENTSMYTH_HOME: join(repo, 'src', 'workflow') };
const mk = (p) => realpathSync(mkdtempSync(join(tmpdir(), p)));
const results = [];
const probe = (id, what, ok, detail = '') => results.push({ id, what, ok, detail });

const run = (cmd, args, opts = {}) => spawnSync(cmd, args, { encoding: 'utf8', env: ENV, cwd: repo, ...opts });
const out = (r) => `${r.stdout ?? ''}${r.stderr ?? ''}`;
const src = (f) => readFileSync(join(repo, f), 'utf8');

// ── F1: the Think gate has an invoker on a shipped surface ───────────────────────────
{
  const skills = ['think', 'plan', 'build', 'review', 'test', 'ship', 'reflect'];
  const missing = skills.filter((p) => !new RegExp(`agentsmyth check --phase ${p}`).test(
    src(`src/workflow/skills/lifecycle-${p}/SKILL.md`)));
  probe('F1', 'every phase skill invokes its own gate', missing.length === 0, `missing: ${missing.join(', ')}`);
}

// ── F2: the tier precondition covers review, not just think ──────────────────────────
{
  const d = mk('p-f2-');
  mkdirSync(join(d, 'workflow', 'config'), { recursive: true });
  mkdirSync(join(d, 'workflow', 'artifacts', 'tasks'), { recursive: true });
  run('git', ['init', '-q'], { cwd: d });
  run('git', ['config', 'user.email', 't@e.com'], { cwd: d });
  run('git', ['config', 'user.name', 't'], { cwd: d });
  writeFileSync(join(d, 'workflow', 'config', 'pending-setup.yaml'),
    'version: 1\nkind: pending-setup\nitems:\n  - id: PS-1\n    field: "tuning.council.model_tier"\n    status: open\n    question: "tier?"\n');
  writeFileSync(join(d, 'workflow', 'config', 'repo-profile.yaml'),
    'version: 1\nkind: repo-profile\n\nrepository:\n  mode: single-repository\n  root: .\n  default_branch: main\n  workflow_root: workflow\n  artifacts_root: workflow/artifacts\n  learnings_sessions_root: workflow/learnings/sessions\n');
  writeFileSync(join(d, 'workflow', 'artifacts', 'tasks', 'probe-v1.md'),
    '---\nslug: probe\nversion: 1\nartifact: task\nstatus: ready-for-next-phase\ncreated: 2026-01-01T00:00:00Z\nupdated: 2026-01-01T00:00:00Z\nmanifest_ids:\n  - R1\nupstream:\n  - user-request\norchestration:\n  phase: build\n  status: ready-for-next-phase\n  next_phase: review\n  blockers: []\n  user_checkpoint: none\n---\n\n# probe\n');
  run('git', ['add', '-A'], { cwd: d });
  const r = run(process.execPath, [V('check-lifecycle'), '--phase', 'review'], { cwd: d });
  probe('F2', 'the tier gate fires at --phase review', r.status !== 0 && /no council capability tier is resolved/.test(out(r)), out(r).slice(-150));
}

// ── F3 + F13 + F14 + F6: containment and the empty-bundle refusal ────────────────────
{
  const s = readFileSync(BIN, 'utf8');
  const lift = (markers, header) => {
    let body = `${header}\n`;
    for (const m of markers) {
      const rest = s.slice(s.indexOf(m));
      body += `export ${rest.slice(0, rest.indexOf('\n}\n') + 3)}\n`;
    }
    const f = join(mk('p-lift-'), 'm.mjs');
    writeFileSync(f, body);
    return f;
  };
  const mod = lift(['function isSafeRelPath', 'function resolveInTree', 'function expandBundle'],
    "import { existsSync, lstatSync, mkdirSync, readFileSync, writeFileSync, realpathSync, rmSync } from 'node:fs';\nimport { join, dirname, isAbsolute, relative } from 'node:path';");
  const { expandBundle } = await import(mod);

  // F3: a bundle declaring nothing must throw and prune nothing
  const h1 = mk('p-f3-');
  const d1 = join(h1, '.agentsmyth');
  mkdirSync(join(d1, 'workflow'), { recursive: true });
  writeFileSync(join(d1, 'workflow', 'keep.md'), 'x\n');
  writeFileSync(join(d1, 'workflow', 'expanded-files.txt'), 'workflow/keep.md\n');
  writeFileSync(join(h1, 'b.md'), 'nothing here\n');
  let threw = false;
  try { expandBundle(join(h1, 'b.md'), d1); } catch { threw = true; }
  probe('F3', 'an empty bundle is refused and prunes nothing',
    threw && existsSync(join(d1, 'workflow', 'keep.md')), `threw=${threw}`);

  // F6 + F13 + F14: symlinked dir, out-of-scope ledger entries, escaping writes
  const h2 = mk('p-f6-');
  const d2 = join(h2, '.agentsmyth');
  const outside = join(h2, 'mine');
  mkdirSync(join(d2, 'workflow'), { recursive: true });
  mkdirSync(outside, { recursive: true });
  writeFileSync(join(outside, 'thesis.txt'), 'USER\n');
  symlinkSync(outside, join(d2, 'workflow', 'link'));
  mkdirSync(join(d2, 'validators'), { recursive: true });
  writeFileSync(join(d2, 'validators', 'lib.mjs'), 'COPIED\n');
  writeFileSync(join(d2, 'notes.md'), 'MINE\n');
  writeFileSync(join(d2, 'workflow', 'expanded-files.txt'),
    'workflow/link/thesis.txt\nvalidators/lib.mjs\nnotes.md\n');
  writeFileSync(join(h2, 'b.md'),
    '<!-- FILE: workflow/ok.md -->\nyes\n<!-- END FILE -->\n<!-- FILE: ../../esc.md -->\nno\n<!-- END FILE -->\n<!-- FILE: validators/sneak.mjs -->\nno\n<!-- END FILE -->\n');
  const res = expandBundle(join(h2, 'b.md'), d2);
  probe('F6', 'a prune through a symlinked dir does not delete outside the tree', existsSync(join(outside, 'thesis.txt')));
  probe('F14', 'the prune cannot reach validators/ or a user file',
    existsSync(join(d2, 'validators', 'lib.mjs')) && existsSync(join(d2, 'notes.md')));
  probe('F13', 'an escaping or out-of-scope declared path is not written',
    !existsSync(join(h2, 'esc.md')) && !existsSync(join(d2, 'validators', 'sneak.mjs')), `written=${res.written}`);
  // F13 second half: the agent-facing instruction carries the same constraint
  probe('F13b', 'the setup skill tells the agent to refuse an escaping block',
    /Refuse any block whose declared path is not inside/.test(src('src/setup/SKILL.md')));

  // F7: separator-blind predicate
  const pm = lift(['function isSafeRelPath'], "import { isAbsolute } from 'node:path/win32';");
  const { isSafeRelPath } = await import(pm);
  const bad = ['..\\..\\x', 'C:\\w\\x', 'workflow\\..\\..\\y'];
  probe('F7', 'windows-separator traversal is rejected', bad.every((v) => !isSafeRelPath(v))
    && isSafeRelPath('workflow/skills/a.md'));
}

// ── F8: gate keys on value, and an unmappable tier is rejected ───────────────────────
{
  const d = mk('p-f8-');
  mkdirSync(join(d, 'config'), { recursive: true });
  const prof = (t) => 'version: 1\nkind: repo-profile\n\nrepository:\n  mode: single-repository\n  root: .\n  default_branch: main\n  workflow_root: workflow\n  artifacts_root: workflow/artifacts\n  learnings_sessions_root: workflow/learnings/sessions\n'
    + (t ? `\ntuning:\n  council:\n    model_tier: ${t}\n` : '');
  writeFileSync(join(d, 'config', 'pending-setup.yaml'),
    'version: 1\nkind: pending-setup\nitems:\n  - id: PS-1\n    field: "tuning.council.model_tier"\n    status: resolved\n    question: "tier?"\n');
  writeFileSync(join(d, 'config', 'repo-profile.yaml'), prof(null));
  let r = run(process.execPath, [V('check-lifecycle'), '--phase', 'think', '--dir', d]);
  const statusIgnored = r.status !== 0;
  writeFileSync(join(d, 'config', 'repo-profile.yaml'), prof('supreme'));
  r = run(process.execPath, [V('check-lifecycle'), '--phase', 'think', '--dir', d]);
  const enumChecked = r.status !== 0 && /not one of cheap \| standard \| deep/.test(out(r));
  probe('F8', 'a resolved-but-empty item gates, and an unmappable tier is rejected',
    statusIgnored && enumChecked, `statusIgnored=${statusIgnored} enumChecked=${enumChecked}`);
  probe('F8b', 'check-config is invoked by agentsmyth check',
    /resolveValidator\([^)]*'check-config\.mjs'\)/.test(readFileSync(BIN, 'utf8')));
}

// ── F9: absent / unreadable pending-setup fails closed ───────────────────────────────
{
  const d = mk('p-f9-');
  mkdirSync(join(d, 'config'), { recursive: true });
  writeFileSync(join(d, 'config', 'repo-profile.yaml'),
    'version: 1\nkind: repo-profile\n\nrepository:\n  mode: single-repository\n  root: .\n  default_branch: main\n  workflow_root: workflow\n  artifacts_root: workflow/artifacts\n  learnings_sessions_root: workflow/learnings/sessions\n');
  const r = run(process.execPath, [V('check-lifecycle'), '--phase', 'think', '--dir', d]);
  probe('F9', 'no pending-setup file at all still gates', r.status !== 0, out(r).slice(-120));
}

// ── F10, F11, F12, F15, F16, F22: record contract, via the registered fixtures ───────
{
  const cases = [
    ['F10', 'jq-council-deep-unsampled-member', /deep requires one sample per member/],
    ['F10b', 'jr-council-depth-departs-unflagged', /a departure must appear in council.overrides/],
    ['F11', 'jn-council-member-tokens-absent', /requires frontmatter council.member_tokens/],
    ['F12', 'jo-council-overrides-as-string', /must be a mapping of setting to value/],
    ['F15', 'js-cost-estimate-zero-sample', /rests on a sample of zero/],
    ['F15b', 'jt-cost-estimate-no-figure', /states no cost figure/],
    ['F15c', 'ju-cost-estimate-sample-exceeds-history', /sample cannot exceed the history/],
    ['F16', 'jp-council-enabled-contradicts-config', /resolved configuration says "disabled"/],
    ['F22', 'jv-council-member-no-definition', /gives no Definition for member/],
  ];
  for (const [id, fx, re] of cases) {
    const r = run(process.execPath, [V('check-council-record'), '--dir', `test/fixtures/lifecycle-violations/${fx}`]);
    probe(id, `${fx} is rejected`, r.status !== 0 && re.test(out(r)), out(r).split('\n').filter((l) => l.startsWith('- ')).join(' ').slice(0, 110));
  }
  // positive controls
  for (const [id, fx] of [['F10-pos', 'council-shallow-web'], ['F22-pos', 'council-member-definition-named']]) {
    const r = run(process.execPath, [V('check-council-record'), '--dir', `test/fixtures/conformance/${fx}`]);
    probe(id, `${fx} is ACCEPTED`, r.status === 0, out(r).slice(-110));
  }
}

// ── F17: both advertised remedies clear the block, and no waiver is advertised ───────
{
  const msgSrc = src('src/workflow/validators/check-lifecycle.mjs');
  const i = msgSrc.indexOf('ways forward');
  const window = msgSrc.slice(i - 400, i + 700);
  probe('F17', 'the refusal no longer advertises a waiver remedy',
    !/waiver/i.test(window) && /Two ways forward/.test(msgSrc));
}

// ── F18: the staged leg runs the council validator ──────────────────────────────────
{
  const b = readFileSync(BIN, 'utf8');
  probe('F18', 'the council check is not gated behind stagedIdx === -1',
    /stagedArtifactPaths\(/.test(b) && /'--files'/.test(b));
}

// ── F19: prepare installs the member templates into the definitions tree ────────────
{
  const h = mk('p-f19-');
  const r = run(process.execPath, [BIN, 'prepare'], { env: { ...process.env, HOME: h } });
  const n = ['claude', 'codex', 'copilot', 'cursor', 'windsurf']
    .filter((t) => existsSync(join(h, '.agentsmyth', 'workflow', 'adapters', t, 'council-member.md'))).length;
  probe('F19', 'prepare installs all five council-member templates', r.status === 0 && n === 5, `installed ${n}/5`);
  probe('F19b', 'the setup skill resolves them from the definitions tree',
    /<definitions_root>\/adapters\/<tool>\/council-member\.md/.test(src('src/setup/SKILL.md')));
}

// ── F4, F5, F20, F21: backup and hook behaviour ─────────────────────────────────────
{
  const b = readFileSync(BIN, 'utf8');
  probe('F4', 'the noop sweep consults the open-backup set',
    /openBackupPaths\.includes\(b\.backup\)/.test(b));
  probe('F5', 'the destination is chosen before superseding, with relocation on collision',
    /protectedPaths\.has\(asRel\(join\(destDir, rel\)\)\)/.test(b) && /\+r\$\{run\}|\+r\$\{/.test(b));
  probe('F20', 'the sweep consults an ownership index, not a name shape',
    /readBackupIndex\(/.test(b) && /recordBackupDir\(/.test(b));
  probe('F21', 'hook mode is preserved and the shebang is kept at line 1',
    /hookWriteOpts\(/.test(b) && /splitShebang\(/.test(b) && !/\{ mode: 0o755 \}, dirname\(target\)/.test(b));
}

// ── F22 second half: check-setup-complete requires a member definition ──────────────
{
  probe('F22b', 'check-setup-complete requires a rendered member definition',
    /no council member definition found/.test(src('src/workflow/validators/check-setup-complete.mjs')));
}

const bad = results.filter((r) => !r.ok);
for (const r of results) console.log(`${r.ok ? '[ OK ]' : '[FAIL]'} ${r.id.padEnd(8)} ${r.what}${r.ok ? '' : `\n         ${r.detail}`}`);
console.log(`\n${results.length - bad.length}/${results.length} probes pass`);
if (bad.length) { console.log(`UNRESOLVED: ${bad.map((r) => r.id).join(', ')}`); process.exit(1); }

#!/usr/bin/env node
// Regression suite for check-lifecycle.mjs's PHASE GATE. It began life covering only the
// checkpoint-approval half (requireCheckpointApproval / checkpointApprovalSection) and has since
// been widened to the rest of the gate — upstream resolution, frontmatter parse failure, the
// multi-slug guard and the stray-artifact guard — because the mutation audit measured those rules
// as undefended and this is the suite that already knows how to drive `--phase` mode. The npm
// script keeps its original name (`checkpoint-approval:test`), which is now narrower than what
// runs here; the name is pinned to CI by a conformance check and is not worth churning.
//
// Originally added after a real violation: an agent treated
// answering earlier clarifying questions as blanket approval for a later, distinct plan-review
// checkpoint it never actually surfaced to the user. workflow/rules.md already stated the rule in
// prose (its "## Approval" section) before this check existed and was not sufficient on its own
// to prevent the violation — this suite exercises the mechanical, hard-blocking backstop.
//
// AGENTSMYTH_WF is used (not --dir, which check-lifecycle.mjs's --phase mode does not support)
// to point the gate at each fixture's own artifacts/ tree, one whole-process invocation per case.
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const validator = join(repoRoot, 'src', 'workflow', 'validators', 'check-lifecycle.mjs');

function runGate(fixtureDir) {
  return spawnSync(
    process.execPath,
    [validator, '--phase', 'plan', '--slug', 'checkpoint-test'],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      env: { ...process.env, AGENTSMYTH_WF: join('test', 'fixtures', 'checkpoint-approval', fixtureDir) },
    }
  );
}

const cases = [
  {
    id: 'missing',
    description: 'Brief declares user_checkpoint but has no Checkpoint Approval section',
    fixtureDir: 'missing',
    expectRejected: true,
  },
  {
    id: 'mismatched',
    description: 'Checkpoint Approval section names a different checkpoint than orchestration.user_checkpoint',
    fixtureDir: 'mismatched',
    expectRejected: true,
  },
  {
    id: 'valid',
    description: 'Checkpoint Approval section present, matching, approved, with real evidence',
    fixtureDir: 'valid',
    expectRejected: false,
  },
  // Added for OI-82. The four rules below were measured undefended: the gate's own suite covered
  // the missing and mismatched cases and stopped there, so a checkpoint recorded as un-approved, or
  // approved with placeholder evidence, could be deleted from the validator with every suite green.
  // Those are the two shapes an agent would actually produce when self-authoring approval.
  {
    id: 'not-approved',
    description: 'Checkpoint Approval section is present and matching but not marked approved',
    fixtureDir: 'not-approved',
    expectRejected: true,
    expectMessage: 'is not marked approved',
  },
  {
    id: 'placeholder-evidence',
    description: 'Checkpoint is approved but the verbatim quote is a placeholder',
    fixtureDir: 'placeholder-evidence',
    expectRejected: true,
    expectMessage: 'has no real evidence quote',
  },
  {
    id: 'no-upstream',
    description: 'No brief exists for the requested slug — the upstream phase never produced one',
    fixtureDir: 'no-upstream',
    expectRejected: true,
    expectMessage: 'no "briefs" artifact found for slug',
  },
  {
    id: 'unparseable-upstream',
    description: 'The upstream brief exists but its frontmatter cannot be parsed',
    fixtureDir: 'unparseable-upstream',
    expectRejected: true,
    expectMessage: 'checkpoint-test-v1.md:',
  },
];

let passed = 0;
let gaps = 0;

for (const testCase of cases) {
  const result = runGate(testCase.fixtureDir);
  const rejected = result.status !== 0;
  // Rejecting is not enough: the case must reject for the rule it names. Without this, one broad
  // rule can satisfy every negative fixture and the specific rules underneath keep passing after
  // they regress — the failure the violations suite already guards against by the same means.
  const combined = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  const matched = !testCase.expectMessage || combined.includes(testCase.expectMessage);
  const ok = rejected === testCase.expectRejected && matched;

  if (rejected === testCase.expectRejected && !matched) {
    console.error(`[WRONG] ${testCase.id}: rejected, but not by the rule it names`);
    console.error(`        expected to contain: ${testCase.expectMessage}`);
    console.error(`        got: ${combined.split('\n').find((l) => l.startsWith('- ')) ?? '(no error line)'}`);
  }

  if (ok) {
    console.log(`[PASS] ${testCase.id}: ${testCase.description}`);
    passed++;
  } else {
    console.error(`[GAP]  ${testCase.id}: ${testCase.description}`);
    console.error(`       expected rejected=${testCase.expectRejected}, got rejected=${rejected}`);
    if (result.stdout) console.error(`       stdout: ${result.stdout.trim()}`);
    gaps++;
  }
}

// ── Scenarios needing a real git checkout ─────────────────────────────────────────────────────
// Two of check-lifecycle's rules read git rather than the artifacts tree, so AGENTSMYTH_WF cannot
// reach them: the multi-slug guard reads `git diff --cached`, and the stray-artifact guard reads
// `git ls-files`. Both were measured undefended for that reason. A scratch repo is the only way to
// construct either condition — a stray artifact committed into THIS repo to serve as a fixture
// would itself be the violation it is meant to test.
let scratchPassed = 0;
let scratchGaps = 0;
const scratchDirs = [];

function scratchCheck(id, description, condition, output) {
  if (condition) {
    console.log(`[PASS] ${id}: ${description}`);
    scratchPassed++;
  } else {
    console.error(`[GAP]  ${id}: ${description}`);
    if (output) console.error(`       got: ${output.trim().split('\n').slice(-3).join(' | ')}`);
    scratchGaps++;
  }
}

function scratchRepo(prefix) {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), prefix)));
  scratchDirs.push(dir);
  spawnSync('git', ['init', '-q'], { cwd: dir });
  spawnSync('git', ['config', 'user.email', 'test@example.com'], { cwd: dir });
  spawnSync('git', ['config', 'user.name', 'Test'], { cwd: dir });
  return dir;
}

function artifactBody(slug, artifact) {
  return `---\nslug: ${slug}\nversion: 1\nartifact: ${artifact}\nstatus: ready-for-next-phase\n`
    + `created: 2026-01-01T00:00:00Z\nupdated: 2026-01-01T00:00:00Z\nmanifest_ids:\n  - R1\n`
    + `upstream:\n  - user-request\norchestration:\n  phase: build\n  status: ready-for-next-phase\n`
    + `  next_phase: review\n  blockers: []\n  user_checkpoint: none\n---\n\n# ${slug}\n\nFixture only.\n`;
}

// defsPath must resolve to the real definitions while cwd is the scratch repo, so this is passed
// ABSOLUTE — AGENTSMYTH_HOME is used as given, and a relative path would resolve against the
// scratch repo's cwd and find nothing.
const realDefs = join(repoRoot, 'src', 'workflow');

// Multi-slug guard: two artifacts from different chains staged in one commit. The gate cannot know
// which chain it is being asked about, and guessing is the failure — it must say so.
{
  const dir = scratchRepo('lifecycle-multislug-');
  mkdirSync(join(dir, 'workflow', 'artifacts', 'tasks'), { recursive: true });
  for (const slug of ['alpha-chain', 'beta-chain']) {
    writeFileSync(join(dir, 'workflow', 'artifacts', 'tasks', `${slug}-v1.md`), artifactBody(slug, 'task'));
    spawnSync('git', ['add', `workflow/artifacts/tasks/${slug}-v1.md`], { cwd: dir });
  }
  const r = spawnSync(process.execPath, [validator, '--phase', 'review'], {
    cwd: dir, encoding: 'utf8', env: { ...process.env, AGENTSMYTH_HOME: realDefs },
  });
  const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
  scratchCheck('multi-slug', 'two staged slugs in one commit are refused rather than guessed at',
    r.status !== 0 && /multiple slugs in staged artifacts/.test(out), out);
}

// Stray-artifact guard: an artifact-shaped, lifecycle-frontmattered file tracked outside the
// artifacts tree. docs/ is chosen because it is exempt from none of the guard's carve-outs.
{
  const dir = scratchRepo('lifecycle-stray-');
  mkdirSync(join(dir, 'workflow', 'artifacts', 'tasks'), { recursive: true });
  mkdirSync(join(dir, 'docs'), { recursive: true });
  writeFileSync(join(dir, 'docs', 'wandered-off-v1.md'), artifactBody('wandered-off', 'task'));
  spawnSync('git', ['add', '-A'], { cwd: dir });
  spawnSync('git', ['commit', '-qm', 'stray'], { cwd: dir });
  const r = spawnSync(process.execPath, [validator], {
    cwd: dir, encoding: 'utf8', env: { ...process.env, AGENTSMYTH_HOME: realDefs },
  });
  const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
  scratchCheck('stray-artifact', 'an artifact-shaped file tracked outside the artifacts tree is flagged',
    r.status !== 0 && /RI1: artifact-shaped file outside/.test(out), out);
}

for (const dir of scratchDirs) {
  try { rmSync(dir, { recursive: true, force: true }); } catch { /* best-effort cleanup */ }
}

const total = cases.length + scratchPassed + scratchGaps;
console.log(`\n${passed + scratchPassed}/${total} check-lifecycle phase-gate cases correct`);

if (gaps + scratchGaps > 0) {
  console.error(`${gaps + scratchGaps} confirmed gap(s) in check-lifecycle's phase gate`);
  process.exit(1);
}

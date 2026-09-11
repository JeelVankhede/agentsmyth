#!/usr/bin/env node
// Mutation audit. Disables one validator rule at a time and runs the suites; a rule whose removal
// leaves everything green is a rule the suite does not defend, however carefully it was written.
//
// Why this exists. Every other suite here answers "does it pass". This one answers "would it
// notice" — and the two turned out to be very different questions. The first run measured 106 of
// 217 rules as undefended: ten validators at 100%, including `check-lifecycle`, the phase gate
// `agentsmyth check` runs in every consumer repo, at 16 of 17.
//
// The cause was structural rather than careless. This repo validates its own artifacts, and its
// artifacts are healthy, so a rule that only fires on malformed input had never executed. Validators
// with dedicated violation fixtures scored zero survivors; validators exercised only through
// `npm run validate` against the real corpus scored near-total. `check-setup-complete` had its own
// suite and still measured 10 of 10, because that suite tested the happy path.
//
// That gap is now closed: every validator measures 0 undefended over 221 rules. Three things came
// out of closing it that are worth keeping in mind when reading a future number here.
//
// 1. A fifth of the original figure was measurement error. This list named three of eleven suites,
//    so rules that WERE tested scored as gaps. Check SUITES before believing a count.
// 2. A rule can be defended by accident. Repairing the grandfathered artifact violations removed
//    the only thing exercising check-artifacts' next_phase rule, and the count went UP. A rule
//    whose only exercise is a real violation in this repo's own artifacts stops being defended the
//    moment someone fixes the artifact.
// 3. Two fixtures passed while leaving their rule undefended, both by asserting something broader
//    than the rule — one matched a message that was a prefix of another rule's message, one matched
//    a filename while a different rule produced the output. Assert the rule's own wording.
//
// NOT a per-commit gate: a full run mutates every rule and re-runs three suites for each, which
// takes tens of minutes. It is named `mutation:audit` rather than `:test` deliberately, so the
// conformance check requiring every `:test` script to run in CI does not force a half-hour job onto
// every push. Run it when changing a validator, and before a release.
//
// It IS a ratchet. test/mutation-baseline.json records the per-validator survivor count; exceeding
// a baseline fails. The number can shrink and never grow, which is the same mechanism
// workflow/config/artifact-baseline.yaml uses for the 96 grandfathered artifact violations.
//
// It mutates a COPY of the tree, never the working tree. The earlier version wrote the mutant to the
// tracked validator and restored it in a `finally`, which does not run on a signal: an interrupted
// run left a live mutant in a TRACKED file, with `errors.push(` replaced by `void (` on some rule.
// That state does not announce itself. It reads as a fixture defect — one violation fixture silently
// dropping to zero errors — and the pre-commit hook has no reason to stop it. It cost a reviewer an
// hour bisecting a regression in an unrelated validator that did not exist. The isolation is
// structural rather than handler-dependent because the reproduction used SIGKILL, which no handler
// can catch; signal handlers here only tidy the temp directory, and are not what makes the working
// tree safe.
import { readFileSync, writeFileSync, readdirSync, existsSync, cpSync, mkdtempSync, rmSync, lstatSync, unlinkSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASELINE = join(repoRoot, 'test/mutation-baseline.json');
const VALIDATORS = join(repoRoot, 'src/workflow/validators');

const args = process.argv.slice(2);
const onlyIdx = args.indexOf('--only');
const only = onlyIdx !== -1 ? args[onlyIdx + 1] : null;
const writeBaseline = args.includes('--write-baseline');

// Sweep any `.mutation-backup` left by a version of this script that mutated in place. Its presence
// means a previous run died mid-mutation, so the tracked file beside it may still be a live mutant —
// and the backup is the pristine original, which makes repair mechanical rather than a bisect. Run
// before the fail-fast below: a leftover mutant would otherwise be measured as the baseline tree.
for (const name of readdirSync(VALIDATORS).filter((f) => f.endsWith('.mutation-backup'))) {
  const backup = join(VALIDATORS, name);
  const target = backup.replace(/\.mutation-backup$/, '');
  const pristine = readFileSync(backup, 'utf8');
  const restored = existsSync(target) && readFileSync(target, 'utf8') !== pristine;
  if (restored) writeFileSync(target, pristine);
  unlinkSync(backup);
  console.warn(`mutation-audit: found a stale ${name} — a previous run was interrupted mid-mutation.`);
  console.warn(restored
    ? `  ${target} was still MUTATED and has been restored from it. Re-run any suite you ran since.`
    : `  ${target} already matched it; only the stale backup was removed.`);
}

// The tree the mutants are written to. Copied once (~2s), thrown away at the end, and never the
// repository you are working in. `.git` is included because check-domain-placeholders and
// check-lifecycle read `git ls-files`; without it validate-template fails and the audit cannot start.
// Sockets are skipped (git's fsmonitor IPC endpoint lives in .git and cpSync refuses to copy it),
// and node_modules is skipped because none of the three suites import from it.
const workRoot = mkdtempSync(join(tmpdir(), 'agentsmyth-mutation-'));
const WORK_VALIDATORS = join(workRoot, 'src/workflow/validators');
let workRootRemoved = false;
function removeWorkRoot() {
  if (workRootRemoved) return;
  workRootRemoved = true;
  try { rmSync(workRoot, { recursive: true, force: true }); } catch { /* best-effort */ }
}
// Tidiness only. Nothing in the repository depends on these firing — that is the point of copying.
process.on('exit', removeWorkRoot);
for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => { removeWorkRoot(); process.exit(130); });
}
cpSync(repoRoot, workRoot, {
  recursive: true,
  filter: (src) => !/(^|[/\\])node_modules$/.test(src) && !lstatSync(src).isSocket(),
});

// A rule may be exercised by the fixture suites or by validate-template running the validator over
// this repo's real artifacts. Both must run, or a survivor is an artefact of the harness rather than
// a gap in the suite.
// EVERY suite that exercises a validator, not the three that happened to be here first. The audit
// reports a rule as undefended when deleting it leaves "every suite" green — so a suite missing from
// this list turns tested rules into phantom gaps. check-lifecycle's four checkpoint rules were the
// clearest case: run-checkpoint-approval-tests.mjs drives them directly through `--phase` mode and
// kills every one of those mutants, yet all four scored undefended because this list did not name
// it. The seven additions below cost ~1.7s combined against ~8.8s for the original three; the
// measurement was wrong for no meaningful saving.
//
// run-init-prepare-interop-tests.mjs is deliberately NOT here: it takes ~2 minutes because it does
// real global npm installs, which at one run per mutation site would push the audit past two hours,
// and it exercises the CLI installer rather than validator rules. That is a stated boundary — rules
// reachable only through it will read as undefended.
const SUITES = [
  ['scripts/validate-template.mjs'],
  ['scripts/validate-example.mjs'],
  ['test/run-violation-tests.mjs'],
  ['test/run-conformance-tests.mjs'],
  ['test/run-checkpoint-approval-tests.mjs'],
  ['test/run-setup-complete-tests.mjs'],
  ['test/run-setup-refs-tests.mjs'],
  ['test/run-tuning-merge-tests.mjs'],
  ['test/run-commit-coverage-tests.mjs'],
  ['test/run-setup-validator-definitions-root-tests.mjs'],
  ['test/run-root-resolution-drift-tests.mjs'],
  ['test/run-domain-placeholders-tests.mjs'],
];

// Run against the COPY. Every suite resolves its own root from `import.meta.url`, and the validators
// they invoke resolve theirs from `git rev-parse --show-toplevel`, so a suite living in workRoot
// checks workRoot — no path plumbing and no env override is needed for the redirection to hold.
// fsmonitor is disabled for the copy: the audit spawns these suites once per mutation site, and a
// per-run daemon started against a throwaway directory is cost with no benefit.
const suiteEnv = {
  ...process.env,
  GIT_CONFIG_COUNT: '1',
  GIT_CONFIG_KEY_0: 'core.fsmonitor',
  GIT_CONFIG_VALUE_0: 'false',
};
function suitesPass() {
  for (const suiteArgs of SUITES) {
    if (spawnSync(process.execPath, suiteArgs, { cwd: workRoot, encoding: 'utf8', env: suiteEnv }).status !== 0) return false;
  }
  return true;
}

// FAIL FAST if the unmutated tree is not green. Without this the audit is worse than useless: a
// suite failing for an unrelated reason makes every mutant look "killed", and the run reports total
// coverage. That happened on the first real run — a fixture's expected error had baked in
// `package.json has 63 lines`, adding a script made it 64, violations:test failed, and the audit
// cheerfully reported 0 undefended rules across all 217. A green audit that means "everything is
// broken" is far more dangerous than no audit.
if (!suitesPass()) {
  console.error('mutation-audit: the suites do not pass on the UNMUTATED tree.');
  console.error('Every mutant would be scored "killed" and the audit would report perfect coverage.');
  console.error('Fix the failing suite first, then re-run.');
  process.exit(1);
}

// Enumerated from the copy, so the file that is read for mutation sites is byte-identical to the
// file that runs. Reading the real tree here would let a mid-run edit shift line numbers under the
// audit and silently mutate the wrong statement.
const targets = readdirSync(WORK_VALIDATORS)
  .filter((f) => f.endsWith('.mjs'))
  .filter((f) => !only || f === only)
  .filter((f) => readFileSync(join(WORK_VALIDATORS, f), 'utf8').includes('errors.push('));

if (targets.length === 0) {
  console.error(only ? `mutation-audit: no validator named ${only}` : 'mutation-audit: no targets');
  process.exit(1);
}

const results = {};
let mutants = 0;
const survivorDetail = [];

for (const name of targets) {
  // The mutated path is inside workRoot. There is no backup file and no restore step, because the
  // file being overwritten is a throwaway copy: interrupt the run at any point, by any signal, and
  // the repository is exactly as it was. The write-back below is only so the next mutant starts from
  // a clean file, not a safety mechanism.
  const file = join(WORK_VALIDATORS, name);
  const original = readFileSync(file, 'utf8');
  const lines = original.split('\n');
  const sites = lines.map((l, i) => [l, i]).filter(([l]) => l.includes('errors.push('));
  let survived = 0;

  for (const [line, idx] of sites) {
    mutants++;
    const mutated = [...lines];
    // Keep the statement syntactically valid; remove only its effect.
    mutated[idx] = line.replace('errors.push(', 'void (');
    writeFileSync(file, mutated.join('\n'));
    const green = suitesPass();
    writeFileSync(file, original);
    if (green) {
      survived++;
      survivorDetail.push(`${name}:${idx + 1}`);
    }
  }

  results[name] = { rules: sites.length, undefended: survived };
  const flag = survived === 0 ? 'defended' : survived === sites.length ? 'ALL undefended' : '';
  console.log(`  ${name.padEnd(38)} ${String(sites.length).padStart(3)} rules  ${String(survived).padStart(3)} undefended  ${flag}`);
}

const totalUndefended = Object.values(results).reduce((a, r) => a + r.undefended, 0);
console.log(`\n${totalUndefended}/${mutants} rules undefended`);

// The survivor list was collected and then thrown away, which made the audit able to say HOW MANY
// rules were undefended but not WHICH — so acting on the number meant re-running the audit by hand
// per validator to rediscover what it already knew. Each entry is `file:line` of an `errors.push(`
// that can be deleted with every suite still green; that line is the rule needing a fixture.
if (survivorDetail.length > 0) {
  console.log('\nundefended rules (file:line of an errors.push that no fixture kills):');
  for (const entry of survivorDetail) console.log(`  ${entry}`);
}

if (writeBaseline) {
  writeFileSync(BASELINE, `${JSON.stringify({ generated: new Date().toISOString().slice(0, 10), results }, null, 2)}\n`);
  console.log(`baseline written to ${BASELINE}`);
  process.exit(0);
}

if (!existsSync(BASELINE)) {
  console.error('mutation-audit: no baseline; run with --write-baseline to record the current state');
  process.exit(1);
}

const baseline = JSON.parse(readFileSync(BASELINE, 'utf8')).results;
const regressions = [];
const improvements = [];
for (const [name, r] of Object.entries(results)) {
  const was = baseline[name]?.undefended;
  if (was === undefined) {
    // A new validator starts at zero: it has no grandfathered debt, so every rule it ships needs a
    // fixture. This is the whole point of a ratchet — new code does not inherit the old allowance.
    if (r.undefended > 0) regressions.push(`${name}: ${r.undefended} undefended, and it is not in the baseline — a new validator starts at zero`);
  } else if (r.undefended > was) {
    regressions.push(`${name}: ${r.undefended} undefended, baseline allows ${was}`);
  } else if (r.undefended < was) {
    improvements.push(`${name}: ${was} → ${r.undefended}`);
  }
}

for (const line of improvements) console.log(`  improved  ${line}`);
if (regressions.length > 0) {
  console.error('\nmutation-audit: undefended rules increased');
  for (const line of regressions) console.error(`- ${line}`);
  console.error('\nA rule with no fixture is a rule the suite does not defend. Add a fixture, or');
  console.error('re-record the baseline deliberately with --write-baseline and say why.');
  process.exit(1);
}
if (improvements.length > 0) {
  console.log('\nBaseline can be lowered: re-record with --write-baseline.');
}
console.log('mutation-audit: ok');

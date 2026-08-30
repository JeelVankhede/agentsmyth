#!/usr/bin/env node
// Mutation audit. Disables one validator rule at a time and runs the suites; a rule whose removal
// leaves everything green is a rule the suite does not defend, however carefully it was written.
//
// Why this exists. Every other suite here answers "does it pass". This one answers "would it
// notice" — and the two turned out to be very different questions. The first run measured 106 of
// 217 rules as undefended: ten validators at 100%, including `check-lifecycle`, the phase gate
// `agentsmyth check` runs in every consumer repo, at 16 of 17.
//
// The cause is structural rather than careless. This repo validates its own artifacts, and its
// artifacts are healthy, so a rule that only fires on malformed input has never executed. Validators
// with dedicated violation fixtures score zero survivors; validators exercised only through
// `npm run validate` against the real corpus score near-total. `check-setup-complete` has its own
// suite and still measured 10 of 10, because that suite tests the happy path.
//
// NOT a per-commit gate: a full run mutates every rule and re-runs three suites for each, which
// takes tens of minutes. It is named `mutation:audit` rather than `:test` deliberately, so the
// conformance check requiring every `:test` script to run in CI does not force a half-hour job onto
// every push. Run it when changing a validator, and before a release.
//
// It IS a ratchet. test/mutation-baseline.json records the per-validator survivor count; exceeding
// a baseline fails. The number can shrink and never grow, which is the same mechanism
// workflow/config/artifact-baseline.yaml uses for the 96 grandfathered artifact violations.
import { readFileSync, writeFileSync, copyFileSync, unlinkSync, readdirSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASELINE = join(repoRoot, 'test/mutation-baseline.json');
const VALIDATORS = join(repoRoot, 'src/workflow/validators');

const args = process.argv.slice(2);
const onlyIdx = args.indexOf('--only');
const only = onlyIdx !== -1 ? args[onlyIdx + 1] : null;
const writeBaseline = args.includes('--write-baseline');

// A rule may be exercised by the fixture suites or by validate-template running the validator over
// this repo's real artifacts. Both must run, or a survivor is an artefact of the harness rather than
// a gap in the suite.
const SUITES = [
  ['scripts/validate-template.mjs'],
  ['test/run-violation-tests.mjs'],
  ['test/run-conformance-tests.mjs'],
];

function suitesPass() {
  for (const suiteArgs of SUITES) {
    if (spawnSync(process.execPath, suiteArgs, { cwd: repoRoot, encoding: 'utf8' }).status !== 0) return false;
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

const targets = readdirSync(VALIDATORS)
  .filter((f) => f.endsWith('.mjs'))
  .filter((f) => !only || f === only)
  .filter((f) => readFileSync(join(VALIDATORS, f), 'utf8').includes('errors.push('));

if (targets.length === 0) {
  console.error(only ? `mutation-audit: no validator named ${only}` : 'mutation-audit: no targets');
  process.exit(1);
}

const results = {};
let mutants = 0;
const survivorDetail = [];

for (const name of targets) {
  const file = join(VALIDATORS, name);
  const original = readFileSync(file, 'utf8');
  const backup = `${file}.mutation-backup`;
  copyFileSync(file, backup);
  const lines = original.split('\n');
  const sites = lines.map((l, i) => [l, i]).filter(([l]) => l.includes('errors.push('));
  let survived = 0;

  try {
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
  } finally {
    // Restore from the backup even if the run is interrupted — a half-mutated validator committed
    // by accident is a far worse outcome than an incomplete audit.
    copyFileSync(backup, file);
    unlinkSync(backup);
  }

  results[name] = { rules: sites.length, undefended: survived };
  const flag = survived === 0 ? 'defended' : survived === sites.length ? 'ALL undefended' : '';
  console.log(`  ${name.padEnd(38)} ${String(sites.length).padStart(3)} rules  ${String(survived).padStart(3)} undefended  ${flag}`);
}

const totalUndefended = Object.values(results).reduce((a, r) => a + r.undefended, 0);
console.log(`\n${totalUndefended}/${mutants} rules undefended`);

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

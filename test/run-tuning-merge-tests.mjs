#!/usr/bin/env node
// WP-R8 tuned-map merge tests (added 2026-08-14, Review finding F1).
//
// Why this file exists rather than another violations fixture: the negative suite only asserts that
// a validator exits non-zero. F1 was the opposite shape — both check-config.mjs and
// check-trigger-predicates.mjs exited ZERO while the resolved config was wrong, because the sandbox
// scenario cannot distinguish a NaN complexity_score from a legitimately low one. A suite that
// already passes with the defect present cannot be the proof that the defect is fixed. These are
// positive assertions on the merge itself, and case 2 fails against the pre-fix shallow spread.
import { mergeTunedMap } from '../src/workflow/validators/lib.mjs';

const results = [];

function check(id, description, actual, expected) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  results.push({ id, description, pass, actual, expected });
}

// The real global weights from agent-behavior.yaml, in shape.
const globalWeights = {
  files_touched: { per_unit: 3, cap: 30 },
  ri_count: { per_unit: 4, cap: 24 },
  touches_protected: 15,
  touches_contract: 15,
  new_surface: 10,
  task_class: { trivial: 0, standard: 6, complex: 6 },
};

// 1 — absent tuning changes nothing. The back-compat guarantee (RI9) at the merge level.
check('m1', 'no tuning leaves the global map identical',
  mergeTunedMap(globalWeights, undefined), globalWeights);

// 2 — THE F1 REGRESSION TEST. A partial nested edit must keep the sub-keys it did not name.
// Pre-fix (shallow spread) this yielded { per_unit: 5 } with cap undefined, so
// Math.min(n * 5, undefined) === NaN, and every score-driven skill silently stopped firing.
check('m2', 'partial nested weight edit preserves unnamed sub-keys (F1)',
  mergeTunedMap(globalWeights, { files_touched: { per_unit: 5 } }).files_touched,
  { per_unit: 3, cap: 30, ...{ per_unit: 5 } });

// 3 — the merge must not leak into siblings the repo never mentioned.
check('m3', 'tuning one weight leaves the others at global values',
  mergeTunedMap(globalWeights, { files_touched: { per_unit: 5 } }).ri_count,
  { per_unit: 4, cap: 24 });

// 4 — scalar weights still replace wholesale.
check('m4', 'scalar weight is replaced, not merged',
  mergeTunedMap(globalWeights, { touches_contract: 25 }).touches_contract, 25);

// 5 — arrays replace, never concatenate. A tuned ui_globs means "these are this repo's UI globs",
// not "add these to the defaults", or a repo could never narrow a category.
check('m5', 'array value replaces wholesale rather than concatenating',
  mergeTunedMap({ ui_globs: ['**/components/**', '**/*.tsx'] }, { ui_globs: ['ui/**'] }).ui_globs,
  ['ui/**']);

// 6 — unnamed categories survive, which is the B-2 fix at the top level.
check('m6', 'unnamed glob categories keep their global value',
  mergeTunedMap({ ui_globs: ['a'], schema_globs: ['b'] }, { ui_globs: ['ui/**'] }).schema_globs,
  ['b']);

// 7 — a tuned key with no global counterpart is added, not dropped.
check('m7', 'new tuned key with no global counterpart is kept',
  mergeTunedMap({ a: 1 }, { b: 2 }), { a: 1, b: 2 });

// 8 — the derived score is finite for the case that broke. Guards the actual consequence, not just
// the merge shape, using the same formula check-trigger-predicates.mjs applies.
const merged = mergeTunedMap(globalWeights, { files_touched: { per_unit: 5 } });
const raw = { files_touched: 3, ri_count: 2, touches_contract: true, new_surface: true, task_class: 'standard' };
const score =
  Math.min(raw.files_touched * merged.files_touched.per_unit, merged.files_touched.cap) +
  Math.min(raw.ri_count * merged.ri_count.per_unit, merged.ri_count.cap) +
  (raw.touches_contract ? merged.touches_contract : 0) +
  (raw.new_surface ? merged.new_surface : 0) +
  merged.task_class[raw.task_class];
check('m8', 'complexity_score stays finite under a partial nested edit (F1 consequence)',
  Number.isFinite(score) && score === 54, true);

// ── Wiring tests (WP-R8 Test T1) ───────────────────────────────────────────
// m1–m8 test mergeTunedMap in isolation. That is not enough: the function can be perfect while
// nothing calls it. check-trigger-predicates.mjs is its only production consumer, and this repo's
// own repo-profile.yaml carries no `tuning:` block, so every CI run resolves the overlay to
// undefined and the merge returns the global map unchanged. Delete all three mergeTunedMap calls
// from that validator, read the global maps directly, and m1–m8 plus every other suite stay green.
//
// These spawn the real validator against fixtures that DO carry tuning, so the assertion is that
// repo-local tuning actually reaches predicate evaluation and changes the outcome.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
// AGENTSMYTH_HOME (not AGENTSMYTH_WF) is what validate-template.mjs uses for this validator: defs
// resolve to src/workflow while the data root stays workflow/. Same shape here so the test
// exercises the configuration CI actually runs.
const env = { ...process.env, AGENTSMYTH_HOME: 'src/workflow' };

function runValidator(dir) {
  const args = [join(repoRoot, 'src', 'workflow', 'validators', 'check-trigger-predicates.mjs')];
  if (dir) args.push('--dir', dir);
  return spawnSync(process.execPath, args, { cwd: repoRoot, encoding: 'utf8', env });
}

// 9 — a tuned threshold must reach predicate evaluation. The fixture lowers
// domain.clean-code-architect to 0, forcing a pure-score predicate the sandbox expects to be
// `skipped` into `ran`. If the overlay is not applied the validator exits 0 and this fails.
const r9 = runValidator('test/fixtures/tuning-resolution/thresholds-applied');
check('m9', 'repo-local tuned threshold reaches predicate evaluation (T1 wiring)',
  r9.status !== 0 && /domain\.clean-code-architect/.test(r9.stdout + r9.stderr), true);

// 10 — same for the weights call site, and it doubles as an end-to-end F1 guard: the fixture tunes
// files_touched.per_unit only. Merged correctly, cap survives, the score is 69 and the predicate
// flips. Merged shallowly, cap is lost, Math.min(90, undefined) is NaN, the comparison goes false,
// and the fixture would be ACCEPTED — so a green m10 requires the merge to be both wired and deep.
const r10 = runValidator('test/fixtures/tuning-resolution/weights-applied');
check('m10', 'repo-local tuned weights reach the derived score, cap preserved (T1 + F1 wiring)',
  r10.status !== 0 && /domain\.clean-code-architect/.test(r10.stdout + r10.stderr), true);

// 11 — control. Without a tuning fixture the validator must still pass, so m9/m10 are proving the
// overlay rather than just proving the validator can fail.
const r11 = runValidator(null);
check('m11', 'control — no repo-local tuning leaves the sandbox expectations satisfied',
  r11.status === 0, true);

let passed = 0;
for (const r of results) {
  if (r.pass) {
    console.log(`[PASS] ${r.id}: ${r.description}`);
    passed++;
  } else {
    console.error(`[FAIL] ${r.id}: ${r.description}`);
    console.error(`       expected: ${JSON.stringify(r.expected)}`);
    console.error(`       actual:   ${JSON.stringify(r.actual)}`);
  }
}

console.log(`\n${passed}/${results.length} tuning-merge assertions passed`);
if (passed !== results.length) process.exit(1);

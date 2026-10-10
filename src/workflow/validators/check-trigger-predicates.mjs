#!/usr/bin/env node
// Mechanically checks skill_scoring.triggers predicate evaluation — the one part of "does a
// power skill trigger correctly" that doesn't require an LLM to judge. Evaluates every real
// predicate string in agent-behavior.yaml against examples/power-skill-sandbox/'s fixed scenario
// (expected-triggers.yaml's signals + touched_paths) and compares the computed ran/skipped
// outcome against that fixture's declared `expected` map. A predicate typo, an edited
// path_glob_categories entry, or a new/renamed skill with no corresponding trigger stays
// undetected by every other validator in this repo — this is the structural regression check for
// that specific residual risk (named in workflow/artifacts/plans/power-skills-domain-experts-v1.md's
// Risk Register).
//
// SOURCE-REPO-ONLY. Excluded from the workflow bundle by scripts/build-bundle.mjs's SOURCE_ONLY list,
// so `prepare` never installs it. The sandbox fixture lives only in this repo, and its `expected`
// map is computed from the GLOBAL globs, so even with the fixture present it could not judge a
// consumer that tunes path_glob_categories: it would fail exactly the repos that use the feature.
//
// Added 2026-08-12: `weights` and `path_glob_categories` are two of the five keys a repo may
// override in repo-profile.yaml under `tuning:`, so this validator no longer reads them from the
// global agent-behavior.yaml alone — it resolves the same merged effective value the agent will
// act on. Without that, a repo tuning path_glob_categories would get a green validator checking a
// glob set its agent never uses: a silent divergence in the one mechanical trigger-regression
// check this repo has. `triggers` is deliberately NOT merged — it is a locked key, and merging it
// would open per-repo predicate rewriting through the back door.
import { dataPath, defsPath, finish, loadYaml, mergeTunedMap, pathExists } from './lib.mjs';

const errors = [];
const details = [];

const sandboxDir = 'examples/power-skill-sandbox';
const fixturePath = `${sandboxDir}/expected-triggers.yaml`;

if (!pathExists(fixturePath)) {
  finish('check-trigger-predicates', [`${fixturePath} not found`], []);
}

const fixture = loadYaml(fixturePath);
const behavior = loadYaml(defsPath('agent-behavior.yaml'));

// Repo-local tuning overlay. Absent `tuning:` — the overwhelmingly common case, including this
// repo's own profile — leaves every value exactly as the global file defines it.
//
// `--dir <path>` reads the profile from <path>/config/repo-profile.yaml instead, matching the
// convention check-config.mjs and check-artifacts.mjs already use for fixture trees. It exists so
// the merge below can be regression-tested: this repo's own profile has no
// `tuning:` block, so every CI run resolves `tunedScoring` to undefined and
// `mergeTunedMap(global, undefined)` returns the global map unchanged. The wiring is genuinely
// reachable — validate-template.mjs invokes this validator with AGENTSMYTH_HOME, not
// AGENTSMYTH_WF, so defs come from src/workflow while the data root stays workflow/ — but
// "reachable" is not "exercised". Without a fixture carrying real tuning, deleting the three
// mergeTunedMap calls below and reading the global maps directly would leave every suite green.
const dirArgIdx = process.argv.slice(2).indexOf('--dir');
const profilePath = dirArgIdx !== -1
  ? `${process.argv.slice(2)[dirArgIdx + 1]}/config/repo-profile.yaml`
  : dataPath('config', 'repo-profile.yaml');
const tunedScoring = pathExists(profilePath)
  ? loadYaml(profilePath)?.tuning?.skill_scoring
  : undefined;

// Per-entry merge, not whole-map replace (resolved 2026-08-13). A tuned entry
// replaces that entry only; entries the repo never mentioned keep their global value. Whole-map
// replacement looked like the literal reading of "override", but it silently deletes what the
// author did not name: a repo tuning one weight to make scoring *stricter* measured 48 -> 15
// against the sandbox scenario and switched off every score-driven skill, the exact opposite of
// the intent. Per-entry gives 48 -> 54. The same trap applies to path_glob_categories, where
// naming ui_globs alone discarded schema_globs, contract_globs and hotpath_globs.
const triggers = behavior?.skill_scoring?.triggers ?? {};
const globCategories = mergeTunedMap(
  behavior?.skill_scoring?.path_glob_categories,
  tunedScoring?.path_glob_categories,
);
const weights = mergeTunedMap(
  behavior?.skill_scoring?.complexity_score?.weights,
  tunedScoring?.complexity_score?.weights,
);
const thresholds = mergeTunedMap(
  behavior?.skill_scoring?.thresholds,
  tunedScoring?.thresholds,
);

if (tunedScoring?.path_glob_categories) {
  details.push(`using repo-local tuning.skill_scoring.path_glob_categories from ${profilePath}`);
}
if (tunedScoring?.complexity_score?.weights) {
  details.push(`using repo-local tuning.skill_scoring.complexity_score.weights from ${profilePath}`);
}
if (tunedScoring?.thresholds) {
  details.push(`using repo-local tuning.skill_scoring.thresholds from ${profilePath}`);
}

const rawSignals = fixture.signals ?? {};
const touchedPaths = fixture.touched_paths ?? [];
const expected = fixture.expected ?? {};

// complexity_score is derived, not a raw signal — the fixture only stores the raw inputs
// (files_touched, ri_count, ...). Compute it the same way agent-behavior.yaml's own
// complexity_score.weights formula defines it, so a weights edit is exercised by this
// validator too, not just a hardcoded expectation.
function computeComplexityScore(raw) {
  let score = 0;
  if (weights.files_touched) {
    score += Math.min(Number(raw.files_touched ?? 0) * weights.files_touched.per_unit, weights.files_touched.cap);
  }
  if (weights.ri_count) {
    score += Math.min(Number(raw.ri_count ?? 0) * weights.ri_count.per_unit, weights.ri_count.cap);
  }
  if (raw.touches_protected) score += weights.touches_protected ?? 0;
  if (raw.touches_contract) score += weights.touches_contract ?? 0;
  if (raw.new_surface) score += weights.new_surface ?? 0;
  if (weights.task_class) score += weights.task_class[raw.task_class] ?? 0;
  return score;
}

const computedScore = computeComplexityScore(rawSignals);

// Defence in depth for the same defect class (2026-08-14). mergeTunedMap now preserves
// unnamed sub-keys, so a partial weight edit no longer produces `undefined` operands — but a
// non-finite score is catastrophic in a uniquely quiet way: every `complexity_score >= N`
// comparison silently becomes false, so every score-driven skill stops firing and both this
// validator and check-config.mjs still report ok. Failing loudly here means any future path to a
// malformed weight surfaces as a named error rather than as skills that quietly stop running.
if (!Number.isFinite(computedScore)) {
  errors.push(
    `computed complexity_score is ${computedScore}, not a finite number — check skill_scoring.complexity_score.weights ` +
    `(and any tuning.skill_scoring.complexity_score.weights override) for a missing or non-numeric per_unit/cap. ` +
    `Left unchecked this makes every "complexity_score >= N" predicate false, silently disabling every score-driven skill.`
  );
  finish('check-trigger-predicates', errors, details);
}

const signals = { ...rawSignals, complexity_score: computedScore };

// Minimal glob-to-regex: supports "**" (any depth) and "*" (single segment) — sufficient for the
// path_glob_categories patterns actually in use. No external dependency, per repo invariant.
// Sentinels are printable, deliberately. An earlier version used NUL bytes here, which made every
// text tool treat this file as binary: `grep` silently returns nothing without -a, so a repo-wide
// search reports this file clean no matter what it contains. That produced two false-clean audits
// before anyone noticed. Any placeholder works; one that keeps the file greppable is strictly
// better. The sequences below cannot occur in a glob, since `<` and `>` are not glob syntax.
const GLOB_DOUBLESTAR = '<<DOUBLESTAR>>';
const GLOB_STAR = '<<STAR>>';

function globToRegex(glob) {
  const escaped = glob
    .split('**').join(GLOB_DOUBLESTAR)
    .split('*').join(GLOB_STAR)
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .split(GLOB_DOUBLESTAR).join('.*')
    .split(GLOB_STAR).join('[^/]*');
  return new RegExp(`^${escaped}$`);
}

function pathMatchesCategory(category) {
  const globs = globCategories[category] ?? [];
  if (globs.length === 0) return false;
  return touchedPaths.some((p) => globs.some((g) => globToRegex(g).test(p)));
}

// Evaluates a single predicate term against signals/touched_paths.
function evalTerm(term) {
  const t = term.trim();

  // The right-hand side of a `>=` is either a literal or a `thresholds.<name>` symbol.
  // Symbol names carry dots and hyphens (`thresholds.domain.clean-code-architect`), so the RHS is
  // captured whole and classified after, rather than trying to express both forms in one pattern.
  // An unresolvable symbol throws rather than defaulting: a typo silently becoming 0 would make
  // every predicate referencing it fire unconditionally, which is exactly the kind of quiet
  // wrong-answer this validator exists to catch.
  let m = t.match(/^(\w+)\s*>=\s*(\S+)$/);
  if (m) {
    const [, signal, rhs] = m;
    let threshold;
    if (/^\d+$/.test(rhs)) {
      threshold = Number(rhs);
    } else if (rhs.startsWith('thresholds.')) {
      const name = rhs.slice('thresholds.'.length);
      if (!(name in thresholds)) {
        throw new Error(`predicate references unknown threshold "${name}" — not present in skill_scoring.thresholds`);
      }
      threshold = Number(thresholds[name]);
    } else {
      throw new Error(`unrecognized right-hand side in ">=" term: "${rhs}"`);
    }
    return Number(signals[signal] ?? 0) >= threshold;
  }

  m = t.match(/^(\w+)\s*!=\s*(\w+)$/);
  if (m) {
    const [, signal, value] = m;
    return String(signals[signal]) !== value;
  }

  m = t.match(/^path~(\w+)$/);
  if (m) {
    return pathMatchesCategory(m[1]);
  }

  m = t.match(/^(\w+)$/);
  if (m) {
    return Boolean(signals[m[1]]);
  }

  throw new Error(`unrecognized predicate term: "${t}"`);
}

// Predicates observed in this repo only ever combine terms with OR — documented, not assumed;
// an AND or an unrecognized combinator throws rather than silently mis-evaluating.
function evalPredicate(predicate) {
  if (/\bAND\b/.test(predicate)) {
    throw new Error(`predicate uses AND, which this evaluator does not support: "${predicate}"`);
  }
  const terms = predicate.split(/\s+OR\s+/);
  return terms.some((term) => evalTerm(term));
}

let checked = 0;

for (const [skill, predicate] of Object.entries(triggers)) {
  if (!(skill in expected)) {
    errors.push(`${fixturePath} has no expected outcome for trigger "${skill}" (present in agent-behavior.yaml but not in this fixture)`);
    continue;
  }

  let actual;
  try {
    actual = evalPredicate(predicate) ? 'ran' : 'skipped';
  } catch (e) {
    errors.push(`${skill}: ${e.message}`);
    continue;
  }

  checked++;
  if (actual !== expected[skill]) {
    errors.push(`${skill}: predicate "${predicate}" evaluates to "${actual}" against the sandbox scenario, but ${fixturePath} expects "${expected[skill]}"`);
  }
}

for (const skill of Object.keys(expected)) {
  if (!(skill in triggers)) {
    errors.push(`${fixturePath} declares an expected outcome for "${skill}", but agent-behavior.yaml's skill_scoring.triggers has no such entry (renamed or removed skill?)`);
  }
}

details.push(`checked ${checked} trigger predicate(s) against ${fixturePath}`);

finish('check-trigger-predicates', errors, details);

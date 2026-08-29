#!/usr/bin/env node
// R4 + WP-R4 Wave 1 negative test suite — each fixture must be rejected (non-zero exit) by its
// named validator. Confirmed validator gaps are reported; any gap here is a contract regression.
//
// FIX (2026-07-10, discovered while wiring WP-R4 Wave 1 fixtures): the validator path below was
// `.workflow/validators/check-artifacts.mjs` — a path that has not existed since the src/
// restructure (commit 5c6d3fe). Every prior "[PASS]" from this suite was actually Node's
// MODULE_NOT_FOUND error (a non-zero exit for an unrelated reason) being misread as a correct
// rejection — the suite was not actually testing anything. Corrected to the real path,
// src/workflow/validators/<name>.mjs, below.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');

// AGENTSMYTH_HOME points definitions reads (agent-behavior.yaml, schemas) at src/workflow — the
// canonical source in this repo — while artifact/data reads stay on the --dir override below.
// Required by check-waivers.mjs and check-skill-triggers.mjs; harmless for the others.
const env = { ...process.env, AGENTSMYTH_HOME: 'src/workflow' };

function validatorPath(name) {
  return join(repoRoot, 'src', 'workflow', 'validators', name);
}

const fixtures = [
  {
    id: 'a',
    dir: 'test/fixtures/lifecycle-violations/a-plan-missing-section',
    description: 'Plan missing required Verification Plan section',
    validator: validatorPath('check-artifacts.mjs'),
  },
  {
    id: 'b',
    dir: 'test/fixtures/lifecycle-violations/b-manifest-gap',
    description: 'Task manifest_ids reference R99 absent from upstream brief',
    validator: validatorPath('check-artifacts.mjs'),
  },
  {
    id: 'b2',
    dir: 'test/fixtures/lifecycle-violations/b-manifest-gap',
    description: '(extended, R6) Review does not declare R99 though task touches it — check-manifest-coverage',
    validator: validatorPath('check-manifest-coverage.mjs'),
  },
  {
    id: 'c',
    dir: 'test/fixtures/lifecycle-violations/c-ready-with-blocker',
    description: 'Ship claims ready-for-next-phase with unresolved blocker Q1',
    validator: validatorPath('check-artifacts.mjs'),
  },
  {
    id: 'c2',
    dir: 'test/fixtures/lifecycle-violations/c-ready-with-blocker',
    description: '(extended, R6) Ship Status declares no ship/hold/hold-with-waiver — check-release-readiness',
    validator: validatorPath('check-release-readiness.mjs'),
  },
  {
    id: 'd',
    dir: 'test/fixtures/lifecycle-violations/d-phase-mismatch',
    description: 'Task artifact has orchestration.phase: review (mismatch — lives in tasks/)',
    validator: validatorPath('check-artifacts.mjs'),
  },
  {
    id: 'e',
    dir: 'test/fixtures/lifecycle-violations/e-waiver-missing-field',
    description: '(R6) Waivers row missing residual_risk — check-waivers',
    validator: validatorPath('check-waivers.mjs'),
  },
  {
    id: 'f',
    dir: 'test/fixtures/lifecycle-violations/f-coverage-dropped-no-waiver',
    description: '(R6) Coverage row marked dropped with no Waivers entry — check-coverage-ledger',
    validator: validatorPath('check-coverage-ledger.mjs'),
  },
  {
    id: 'g',
    dir: 'test/fixtures/lifecycle-violations/g-claim-without-evidence',
    description: '(R6) Automated Checks row with an empty cell — check-evidence-citations',
    validator: validatorPath('check-evidence-citations.mjs'),
  },
  {
    id: 'j',
    dir: 'test/fixtures/lifecycle-violations/j-file-outside-scope',
    description: '(R6) Changed file outside plan Touches — check-scope-fence',
    validator: validatorPath('check-scope-fence.mjs'),
  },
  {
    id: 'l',
    dir: 'test/fixtures/lifecycle-violations/l-skipped-check-no-risk',
    description: '(R6) Skipped Checks row missing risk field — check-skipped-accounting',
    validator: validatorPath('check-skipped-accounting.mjs'),
  },
  {
    id: 'n',
    dir: 'test/fixtures/lifecycle-violations/n-triggered-skill-unlogged',
    description: '(R6) skill_trigger_log entry missing reason — check-skill-triggers',
    validator: validatorPath('check-skill-triggers.mjs'),
  },
  {
    id: 'o',
    dir: 'test/fixtures/lifecycle-violations/o-ship-with-open-p1',
    description: '(R6, post-review fix) Ship declares ship with an open P1 in a real Severity Summary table — check-release-readiness',
    validator: validatorPath('check-release-readiness.mjs'),
  },
  {
    id: 'p',
    dir: 'test/fixtures/lifecycle-violations/p-unstructured-waiver-claim',
    description: '(R6, P2 strengthening) Waiver claimed in prose, never moved into the Waivers table — check-waivers',
    validator: validatorPath('check-waivers.mjs'),
  },
  {
    id: 'q',
    dir: 'test/fixtures/lifecycle-violations/q-phase-map-orphan',
    description: '(Wave 2, B1) Active manifest ID never covered by any phase — check-phase-map',
    validator: validatorPath('check-phase-map.mjs'),
  },
  {
    id: 'r',
    dir: 'test/fixtures/lifecycle-violations/r-assumptions-missing',
    description: '(Wave 2, B2) Plan has no Assumptions Verified section though brief declares assumptions — check-assumptions',
    validator: validatorPath('check-assumptions.mjs'),
  },
  {
    id: 's',
    dir: 'test/fixtures/lifecycle-violations/s-verify-matrix-no-evidence',
    description: '(Wave 2, B6) Manifest Coverage row claims pass with empty evidence — check-verify-matrix',
    validator: validatorPath('check-verify-matrix.mjs'),
  },
  {
    id: 't',
    dir: 'test/fixtures/lifecycle-violations/t-followup-tbd-owner',
    description: '(Wave 2, B9) Follow-Ups row has owner TBD — check-followups',
    validator: validatorPath('check-followups.mjs'),
  },
  {
    id: 'u',
    dir: 'test/fixtures/lifecycle-violations/u-open-items-malformed',
    description: '(Wave 2, E2) open-items.yaml item missing required owner field — check-open-items',
    validator: validatorPath('check-open-items.mjs'),
  },
  {
    id: 'o1',
    dir: 'test/fixtures/lifecycle-violations/o1-constraint-conflict-bad-id',
    description: '(Wave 3, C3) Brief cites a constraint ID absent from domain.yaml — check-constraint-conflicts',
    validator: validatorPath('check-constraint-conflicts.mjs'),
  },
  {
    id: 'v',
    dir: 'test/fixtures/lifecycle-violations/v-id-range-shorthand',
    description: 'Plan Requirement Coverage row uses range shorthand ("R1-R4") as its Manifest ID cell — check-coverage-range-shorthand',
    validator: validatorPath('check-coverage-range-shorthand.mjs'),
  },
  {
    id: 'w',
    dir: 'test/fixtures/lifecycle-violations/w-tuning-unknown-key',
    description: '(WP-R8, R2) repo-profile tuning: declares a key outside the five-key allowlist — check-config',
    validator: validatorPath('check-config.mjs'),
  },
  {
    id: 'x',
    dir: 'test/fixtures/lifecycle-violations/x-tuning-locked-key',
    description: '(WP-R8, RI5) repo-profile tuning: reaches a locked key (task_classes) — check-config',
    validator: validatorPath('check-config.mjs'),
  },
  {
    id: 'y',
    dir: 'test/fixtures/lifecycle-violations/y-tuning-looser-value',
    description: '(WP-R8, R3) repo-profile tuning sets dispatch.enabled: required, the forbidden looser direction — check-config',
    validator: validatorPath('check-config.mjs'),
  },
  {
    id: 'z',
    dir: 'test/fixtures/lifecycle-violations/z-tuning-checkpoint-dropped',
    description: '(WP-R8, R3) repo-profile tuning drops a globally-required checkpoint from the append-only list — check-config',
    validator: validatorPath('check-config.mjs'),
  },
  {
    id: 'aa',
    dir: 'test/fixtures/lifecycle-violations/aa-intent-floor-constraints',
    description: '(WP-R8, RI7) intent.concerns.constraints_safety set to not-applicable, below its floor — check-config',
    validator: validatorPath('check-config.mjs'),
  },
  {
    id: 'ab',
    dir: 'test/fixtures/lifecycle-violations/ab-intent-floor-alignment',
    description: '(WP-R8, RI7) intent.concerns.repo_alignment set to not-applicable, below its floor — check-config',
    validator: validatorPath('check-config.mjs'),
  },
  {
    id: 'ac',
    dir: 'test/fixtures/lifecycle-violations/ac-intent-stale-provenance',
    description: '(WP-R8, RI8) intent.derived_keys names a key absent from tuning: — stale provenance — check-config',
    validator: validatorPath('check-config.mjs'),
  },
  {
    id: 'ad',
    dir: 'test/fixtures/lifecycle-violations/ad-tuning-trigger-rewrite',
    description: '(WP-R8, R6) repo-profile tuning attempts to rewrite a trigger predicate rather than its threshold — check-config',
    validator: validatorPath('check-config.mjs'),
  },
  // WP-R21 RI9 — one fixture per mechanical rule in check-council-record. Each is the well-formed
  // base (test/fixtures/conformance/council-wellformed) with exactly one mutation, so a rejection
  // is attributable to the rule under test rather than to incidental breakage. The positive control
  // lives in the conformance suite so this suite stays purely negative.
  { id: 'ca', dir: 'test/fixtures/lifecycle-violations/ca-unattributed-finding', description: '(WP-R21, R3) council finding has no source member — check-council-record', validator: validatorPath('check-council-record.mjs') },
  { id: 'cb', dir: 'test/fixtures/lifecycle-violations/cb-empty-rejection-reason', description: '(WP-R21, R4) rejected-with-reason carries an empty reason — check-council-record', validator: validatorPath('check-council-record.mjs') },
  { id: 'cc', dir: 'test/fixtures/lifecycle-violations/cc-fanout-growth', description: '(WP-R21, R13) round 2 fan-out exceeds round 1 — non-increasing invariant — check-council-record', validator: validatorPath('check-council-record.mjs') },
  { id: 'cd', dir: 'test/fixtures/lifecycle-violations/cd-incoherent-taper', description: '(WP-R21, R13) council shrank after a round that closed nothing — check-council-record', validator: validatorPath('check-council-record.mjs') },
  { id: 'ce', dir: 'test/fixtures/lifecycle-violations/ce-resolved-with-survivor', description: '(WP-R21, R13) terminated resolved while a declared surviving item closed in no round — check-council-record', validator: validatorPath('check-council-record.mjs') },
  { id: 'cf', dir: 'test/fixtures/lifecycle-violations/cf-repo-citation-unresolvable', description: '(WP-R21, R10) repo citation names a path that does not exist — check-council-record', validator: validatorPath('check-council-record.mjs') },
  { id: 'cg', dir: 'test/fixtures/lifecycle-violations/cg-web-citation-incomplete', description: '(WP-R21, R10) web citation missing retrieval date and verbatim quote — check-council-record', validator: validatorPath('check-council-record.mjs') },
  { id: 'ch', dir: 'test/fixtures/lifecycle-violations/ch-missing-conflicts-entry', description: '(WP-R21, RI1) shared surface holds accepted and rejected findings with no Conflicts entry — check-council-record', validator: validatorPath('check-council-record.mjs') },
  { id: 'ci', dir: 'test/fixtures/lifecycle-violations/ci-web-no-spotcheck', description: '(WP-R21, R3) round has web findings but no challenger spot-check — check-council-record', validator: validatorPath('check-council-record.mjs') },
  { id: 'cj', dir: 'test/fixtures/lifecycle-violations/cj-recall-only-recommendation', description: '(WP-R21, R10) surviving Q rests only on recall findings — check-council-record', validator: validatorPath('check-council-record.mjs') },
  { id: 'ck', dir: 'test/fixtures/lifecycle-violations/ck-dispatch-depth-not-one', description: '(WP-R21, RI4) dispatch depth 2 — council members must not dispatch — check-council-record', validator: validatorPath('check-council-record.mjs') },
  { id: 'cl', dir: 'test/fixtures/lifecycle-violations/cl-refused-without-reason', description: '(WP-R21, R12) council mode refused with no refusal_reason — check-council-record', validator: validatorPath('check-council-record.mjs') },
  { id: 'cm', dir: 'test/fixtures/lifecycle-violations/cm-stage-cap-exceeded', description: '(WP-R21, R2) stage fan-out exceeds the resolved cap — check-council-record', validator: validatorPath('check-council-record.mjs') },
  { id: 'cn', dir: 'test/fixtures/lifecycle-violations/cn-log-without-council-block', description: '(WP-R21, RI4) Council Log body section with no council frontmatter block — check-council-record', validator: validatorPath('check-council-record.mjs') },
  { id: 'co', dir: 'test/fixtures/lifecycle-violations/co-missing-conflicts-section', description: '(WP-R21, RI1) Conflicts subsection absent entirely — "no conflicts" must be asserted — check-council-record', validator: validatorPath('check-council-record.mjs') },
  // Added after a self-audit found these acceptance criteria documented but unenforced — the exact
  // drift this package exists to prevent, committed while building it.
  { id: 'cp', dir: 'test/fixtures/lifecycle-violations/cp-missing-classification', description: '(WP-R21, R9) active manifest ID has no Requirement Classification entry — check-council-record', validator: validatorPath('check-council-record.mjs') },
  { id: 'cq', dir: 'test/fixtures/lifecycle-violations/cq-classification-no-class', description: '(WP-R21, R9) classification entry names zero evidence classes — check-council-record', validator: validatorPath('check-council-record.mjs') },
  { id: 'cr', dir: 'test/fixtures/lifecycle-violations/cr-carveout-outward-capability', description: '(WP-R21, R2) carve-out member declares outward-action capability — check-council-record', validator: validatorPath('check-council-record.mjs') },
  { id: 'cs', dir: 'test/fixtures/lifecycle-violations/cs-sandbox-inside-repo', description: '(WP-R21, R11) declared sandbox path does not resolve outside the repository — check-council-record', validator: validatorPath('check-council-record.mjs') },
  { id: 'ct', dir: 'test/fixtures/lifecycle-violations/ct-shared-sandbox-path', description: '(WP-R21, R11) two members share a sandbox subpath in the same round — check-council-record', validator: validatorPath('check-council-record.mjs') },
  { id: 'cu', dir: 'test/fixtures/lifecycle-violations/cu-q-without-recommendation', description: '(WP-R21, R5) surviving Q reaches the user with no recommendation — check-council-record', validator: validatorPath('check-council-record.mjs') },
  { id: 'cv', dir: 'test/fixtures/lifecycle-violations/cv-q-unresolvable-reference', description: '(WP-R21, R5) Q cites a finding ID absent from the Findings table — check-council-record', validator: validatorPath('check-council-record.mjs') },
  { id: 'cw', dir: 'test/fixtures/lifecycle-violations/cw-trial-without-sandbox', description: '(WP-R21, R11) trial finding whose member declares no sandbox path — check-council-record', validator: validatorPath('check-council-record.mjs') },
  { id: 'cx', dir: 'test/fixtures/lifecycle-violations/cx-finding-unknown-member', description: '(WP-R21, R3) finding attributed to a member absent from Members — check-council-record', validator: validatorPath('check-council-record.mjs') },
  // Added when Review's P1 findings were fixed — each closes a hole the earlier suite could not see.
  { id: 'cy', dir: 'test/fixtures/lifecycle-violations/cy-sandbox-outside-root', description: '(WP-R21, R11) sandbox is outside the repo but not under the resolved council.sandbox_root — check-council-record', validator: validatorPath('check-council-record.mjs') },
  { id: 'cz', dir: 'test/fixtures/lifecycle-violations/cz-escalation-no-survivor-line', description: '(WP-R21, R13) user-decision-required termination omits its surviving-items declaration — check-council-record', validator: validatorPath('check-council-record.mjs') },
  { id: 'da', dir: 'test/fixtures/lifecycle-violations/da-no-questions-section', description: '(WP-R21, R5) council brief with no Questions For User section — escalation checks would pass vacuously — check-council-record', validator: validatorPath('check-council-record.mjs') },
  // Review residuals R-1 and R-2, closed. R-1 makes the firing decision re-derivable rather than
  // merely asserted; R-2 asserts repo integrity filesystem-scoped, since git status is blind to
  // dist/ — the one artifact consumers actually install.
  { id: 'db', dir: 'test/fixtures/lifecycle-violations/db-resolution-mismatch', description: '(WP-R21, R7/R-1) council fired though its recorded resolution inputs require a refusal — check-council-record', validator: validatorPath('check-council-record.mjs') },
  { id: 'dc', dir: 'test/fixtures/lifecycle-violations/dc-refusal-reason-wrong', description: '(WP-R21, R7/R-1) refusal_reason contradicts the recorded resolution precedence — check-council-record', validator: validatorPath('check-council-record.mjs') },
  { id: 'dd', dir: 'test/fixtures/lifecycle-violations/dd-sandbox-without-integrity', description: '(WP-R21, R11/R-2) sandbox-using run records no before/after repo digest — check-council-record', validator: validatorPath('check-council-record.mjs') },
  { id: 'de', dir: 'test/fixtures/lifecycle-violations/de-integrity-mismatch', description: '(WP-R21, R11/R-2) repo digest differs across the council run — the repo changed — check-council-record', validator: validatorPath('check-council-record.mjs') },
  // External PR review findings 2, 4 and 6.
  { id: 'df', dir: 'test/fixtures/lifecycle-violations/df-missing-reconcile-contract', description: '(WP-R21, RI1) members overlap on a surface with no declared reconcile contract — check-council-record', validator: validatorPath('check-council-record.mjs') },
  { id: 'dg', dir: 'test/fixtures/lifecycle-violations/dg-council-without-resolution', description: '(WP-R21, R7) council mode with no resolution block — the firing decision cannot be re-derived — check-council-record', validator: validatorPath('check-council-record.mjs') },
  { id: 'dh', dir: 'test/fixtures/lifecycle-violations/dh-round2-web-no-spotcheck', description: '(WP-R21, R3) a later round has web findings with no spot-check in that round — check-council-record', validator: validatorPath('check-council-record.mjs') },
  // Second external PR review: the termination enum lost the two values no valid record could
  // carry, and the Round column — which drives the per-round duties — gained the cross-checks that
  // make it answerable to the Rounds and Members tables rather than merely authoritative.
  { id: 'di', dir: 'test/fixtures/lifecycle-violations/di-termination-not-in-enum', description: '(WP-R21, R14) termination_reason max-rounds is no longer a value any record may carry — check-council-record', validator: validatorPath('check-council-record.mjs') },
  { id: 'dj', dir: 'test/fixtures/lifecycle-violations/dj-finding-round-not-declared', description: '(WP-R21, R3) finding attributed to a member in a round Members never declares it for — check-council-record', validator: validatorPath('check-council-record.mjs') },
  { id: 'dk', dir: 'test/fixtures/lifecycle-violations/dk-finding-without-round', description: '(WP-R21, R3) finding carries no Round, so it answers to no row in the Rounds table — check-council-record', validator: validatorPath('check-council-record.mjs') },
  { id: 'dl', dir: 'test/fixtures/lifecycle-violations/dl-vacuous-reconcile-contract', description: '(WP-R21, RI1) reconcile contract states neither dedupe nor disagreement handling — check-council-record', validator: validatorPath('check-council-record.mjs') },
  // Third external PR review: with max-rounds gone, `resolved` is the cheapest way to record an
  // unfinished run, so both halves of the termination claim are now corroborated by the record
  // itself — the Rounds table's own Open out, and a survivor line that names something.
  { id: 'dm', dir: 'test/fixtures/lifecycle-violations/dm-resolved-with-open-items', description: '(WP-R21, R13) terminated resolved while the final round still records open items — check-council-record', validator: validatorPath('check-council-record.mjs') },
  { id: 'dn', dir: 'test/fixtures/lifecycle-violations/dn-escalation-survivors-none', description: '(WP-R21, R13) escalation whose surviving-items line names no item ID — check-council-record', validator: validatorPath('check-council-record.mjs') },
  // WP-R22 RI10 (OI-81) — the repo-shaped evidence rule joins per question now, so both halves of
  // the join need a fixture: a question whose OWN bucket names repo, and one that declares no
  // bucket at all and therefore cannot be judged.
  { id: 'dp', dir: 'test/fixtures/lifecycle-violations/dp-q-web-only-repo-bucket', description: '(WP-R22, RI10) Q rests on web alone while its own bucket names repo — check-council-record', validator: validatorPath('check-council-record.mjs') },
  { id: 'dq', dir: 'test/fixtures/lifecycle-violations/dq-q-no-bucket-reference', description: '(WP-R22, RI10) Q rests on web alone and names no bucket to judge it against — check-council-record', validator: validatorPath('check-council-record.mjs') },
];

let passed = 0;
let gaps = 0;

for (const fixture of fixtures) {
  const result = spawnSync(
    process.execPath,
    [fixture.validator, '--dir', fixture.dir],
    { cwd: repoRoot, encoding: 'utf8', env }
  );

  const detected = result.status !== 0;

  if (detected) {
    console.log(`[PASS] ${fixture.id}: ${fixture.description}`);
    passed++;
  } else {
    console.error(`[GAP]  ${fixture.id}: ${fixture.description}`);
    console.error(`       validator did not reject this fixture — confirmed gap`);
    if (result.stdout) console.error(`       stdout: ${result.stdout.trim()}`);
    gaps++;
  }
}

console.log(`\n${passed}/${fixtures.length} violations detected`);

if (gaps > 0) {
  console.error(`${gaps} confirmed validator gap(s) — fix before wiring more call sites`);
  process.exit(1);
}

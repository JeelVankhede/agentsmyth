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
  { id: 'ca', dir: 'test/fixtures/lifecycle-violations/ca-unattributed-finding', description: '(WP-R21, R3) council finding has no source member — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'finding F1 has no source member — unattributed findings are invalid'},
  { id: 'cb', dir: 'test/fixtures/lifecycle-violations/cb-empty-rejection-reason', description: '(WP-R21, R4) rejected-with-reason carries an empty reason — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'finding F3 is rejected-with-reason but its reason is empty — "rejected'},
  { id: 'cc', dir: 'test/fixtures/lifecycle-violations/cc-fanout-growth', description: '(WP-R21, R13) round 2 fan-out exceeds round 1 — non-increasing invariant — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'round 2 fan-out (5) exceeds round 1 (4)'},
  { id: 'cd', dir: 'test/fixtures/lifecycle-violations/cd-incoherent-taper', description: '(WP-R21, R13) council shrank after a round that closed nothing — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'round 2 reduced fan-out after round 1 closed no items'},
  { id: 'ce', dir: 'test/fixtures/lifecycle-violations/ce-resolved-with-survivor', description: '(WP-R21, R13) terminated resolved while a declared surviving item closed in no round — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'terminated "resolved" while Q5 appear as surviving items closed in no '},
  { id: 'cf', dir: 'test/fixtures/lifecycle-violations/cf-repo-citation-unresolvable', description: '(WP-R21, R10) repo citation names a path that does not exist — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'finding F1 cites repo path "src/does-not-exist.mjs" which does not exi'},
  { id: 'cg', dir: 'test/fixtures/lifecycle-violations/cg-web-citation-incomplete', description: '(WP-R21, R10) web citation missing retrieval date and verbatim quote — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'finding F2 is evidence_class web but its citation is missing: retrieva'},
  { id: 'ch', dir: 'test/fixtures/lifecycle-violations/ch-missing-conflicts-entry', description: '(WP-R21, RI1) shared surface holds accepted and rejected findings with no Conflicts entry — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'surface "package.json" has both accepted and rejected findings but no '},
  { id: 'ci', dir: 'test/fixtures/lifecycle-violations/ci-web-no-spotcheck', description: '(WP-R21, R3) round has web findings but no challenger spot-check — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'round 1 has web finding(s) but no challenger spot-check in that round'},
  { id: 'cj', dir: 'test/fixtures/lifecycle-violations/cj-recall-only-recommendation', description: '(WP-R21, R10) surviving Q rests only on recall findings — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'Q5\'s recommendation rests only on recall findings (F3)'},
  { id: 'ck', dir: 'test/fixtures/lifecycle-violations/ck-dispatch-depth-not-one', description: '(WP-R21, RI4) dispatch depth 2 — council members must not dispatch — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'council.dispatch_depth is 2'},
  { id: 'cl', dir: 'test/fixtures/lifecycle-violations/cl-refused-without-reason', description: '(WP-R21, R12) council mode refused with no refusal_reason — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'records council mode "refused" without a refusal_reason — silence cann'},
  { id: 'cm', dir: 'test/fixtures/lifecycle-violations/cm-stage-cap-exceeded', description: '(WP-R21, R2) stage fan-out exceeds the resolved cap — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'round 1 dispatched 3 researchers against a resolved cap of 2'},
  { id: 'cn', dir: 'test/fixtures/lifecycle-violations/cn-log-without-council-block', description: '(WP-R21, RI4) Council Log body section with no council frontmatter block — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'has a "## Council Log" section but no council: block in frontmatter'},
  { id: 'co', dir: 'test/fixtures/lifecycle-violations/co-missing-conflicts-section', description: '(WP-R21, RI1) Conflicts subsection absent entirely — "no conflicts" must be asserted — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'council log has no "### Conflicts" subsection'},
  // Added after a self-audit found these acceptance criteria documented but unenforced — the exact
  // drift this package exists to prevent, committed while building it.
  { id: 'cp', dir: 'test/fixtures/lifecycle-violations/cp-missing-classification', description: '(WP-R21, R9) active manifest ID has no Requirement Classification entry — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'manifest ID R1 has no Requirement Classification entry'},
  { id: 'cq', dir: 'test/fixtures/lifecycle-violations/cq-classification-no-class', description: '(WP-R21, R9) classification entry names zero evidence classes — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'Requirement Classification for R1 names no evidence class (expected on'},
  { id: 'cr', dir: 'test/fixtures/lifecycle-violations/cr-carveout-outward-capability', description: '(WP-R21, R2) carve-out member declares outward-action capability — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'member m1 was fired under authorization "carve-out" but declares outwa'},
  { id: 'cs', dir: 'test/fixtures/lifecycle-violations/cs-sandbox-inside-repo', description: '(WP-R21, R11) declared sandbox path does not resolve outside the repository — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'member m1 declares sandbox "test/fixtures/scratch/m1" which does not r'},
  { id: 'ct', dir: 'test/fixtures/lifecycle-violations/ct-shared-sandbox-path', description: '(WP-R21, R11) two members share a sandbox subpath in the same round — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'members m1 and m2 share sandbox path "~/.agentsmyth/sandbox/agentsmyth'},
  { id: 'cu', dir: 'test/fixtures/lifecycle-violations/cu-q-without-recommendation', description: '(WP-R21, R5) surviving Q reaches the user with no recommendation — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'Q5 reaches the user with no recommendation'},
  { id: 'cv', dir: 'test/fixtures/lifecycle-violations/cv-q-unresolvable-reference', description: '(WP-R21, R5) Q cites a finding ID absent from the Findings table — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'Q5 references finding(s) F9 that do not exist in the Findings table'},
  { id: 'cw', dir: 'test/fixtures/lifecycle-violations/cw-trial-without-sandbox', description: '(WP-R21, R11) trial finding whose member declares no sandbox path — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'finding F3 is evidence_class trial but member "m3" declares no sandbox'},
  { id: 'cx', dir: 'test/fixtures/lifecycle-violations/cx-finding-unknown-member', description: '(WP-R21, R3) finding attributed to a member absent from Members — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'finding F1 names source member "m9" which is not declared in Members'},
  // Added when Review's P1 findings were fixed — each closes a hole the earlier suite could not see.
  { id: 'cy', dir: 'test/fixtures/lifecycle-violations/cy-sandbox-outside-root', description: '(WP-R21, R11) sandbox is outside the repo but not under the resolved council.sandbox_root — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'member m1 declares sandbox "/tmp/somewhere-else/m1" which is outside t'},
  { id: 'cz', dir: 'test/fixtures/lifecycle-violations/cz-escalation-no-survivor-line', description: '(WP-R21, R13) user-decision-required termination omits its surviving-items declaration — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'terminated "user-decision-required" without declaring its surviving it'},
  { id: 'da', dir: 'test/fixtures/lifecycle-violations/da-no-questions-section', description: '(WP-R21, R5) council brief with no Questions For User section — escalation checks would pass vacuously — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'declares council mode but has no "## Questions For User" section'},
  // Review residuals R-1 and R-2, closed. R-1 makes the firing decision re-derivable rather than
  // merely asserted; R-2 asserts repo integrity filesystem-scoped, since git status is blind to
  // dist/ — the one artifact consumers actually install.
  { id: 'db', dir: 'test/fixtures/lifecycle-violations/db-resolution-mismatch', description: '(WP-R21, R7/R-1) council fired though its recorded resolution inputs require a refusal — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'council.mode is "council" but its recorded resolution inputs (dispatch'},
  { id: 'dc', dir: 'test/fixtures/lifecycle-violations/dc-refusal-reason-wrong', description: '(WP-R21, R7/R-1) refusal_reason contradicts the recorded resolution precedence — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'council.refusal_reason is "not-complex" but the recorded resolution in'},
  { id: 'dd', dir: 'test/fixtures/lifecycle-violations/dd-sandbox-without-integrity', description: '(WP-R21, R11/R-2) sandbox-using run records no before/after repo digest — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'declares sandbox-using member(s) but records no council.repo_integrity'},
  { id: 'de', dir: 'test/fixtures/lifecycle-violations/de-integrity-mismatch', description: '(WP-R21, R11/R-2) repo digest differs across the council run — the repo changed — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'council.repo_integrity before (sha256:aaaaaaaaaaaa) and after (sha256:'},
  // External PR review findings 2, 4 and 6.
  { id: 'df', dir: 'test/fixtures/lifecycle-violations/df-missing-reconcile-contract', description: '(WP-R21, RI1) members overlap on a surface with no declared reconcile contract — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'has members overlapping on surface "package.json" but records no "### '},
  { id: 'dg', dir: 'test/fixtures/lifecycle-violations/dg-council-without-resolution', description: '(WP-R21, R7) council mode with no resolution block — the firing decision cannot be re-derived — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'declares council mode but records no council.resolution'},
  { id: 'dh', dir: 'test/fixtures/lifecycle-violations/dh-round2-web-no-spotcheck', description: '(WP-R21, R3) a later round has web findings with no spot-check in that round — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'round 2 has web finding(s) but no challenger spot-check in that round'},
  // Second external PR review: the termination enum lost the two values no valid record could
  // carry, and the Round column — which drives the per-round duties — gained the cross-checks that
  // make it answerable to the Rounds and Members tables rather than merely authoritative.
  { id: 'di', dir: 'test/fixtures/lifecycle-violations/di-termination-not-in-enum', description: '(WP-R21, R14) termination_reason max-rounds is no longer a value any record may carry — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'council.termination_reason "max-rounds" is not one of resolved, user-d'},
  { id: 'dj', dir: 'test/fixtures/lifecycle-violations/dj-finding-round-not-declared', description: '(WP-R21, R3) finding attributed to a member in a round Members never declares it for — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'finding F6 is attributed to member "m3" in round 2, but Members declar'},
  { id: 'dk', dir: 'test/fixtures/lifecycle-violations/dk-finding-without-round', description: '(WP-R21, R3) finding carries no Round, so it answers to no row in the Rounds table — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'finding F1 declares round (none) which is not a row in the Rounds tabl'},
  { id: 'dl', dir: 'test/fixtures/lifecycle-violations/dl-vacuous-reconcile-contract', description: '(WP-R21, RI1) reconcile contract states neither dedupe nor disagreement handling — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'has members overlapping on surface "package.json" and its "### Reconci'},
  // Third external PR review: with max-rounds gone, `resolved` is the cheapest way to record an
  // unfinished run, so both halves of the termination claim are now corroborated by the record
  // itself — the Rounds table's own Open out, and a survivor line that names something.
  { id: 'dm', dir: 'test/fixtures/lifecycle-violations/dm-resolved-with-open-items', description: '(WP-R21, R13) terminated resolved while the final round still records open items — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'terminated "resolved" but round 2 records "Open out" of 1'},
  { id: 'dn', dir: 'test/fixtures/lifecycle-violations/dn-escalation-survivors-none', description: '(WP-R21, R13) escalation whose surviving-items line names no item ID — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'terminated "user-decision-required" but its surviving-items line names'},
  // WP-R22 RI10 (OI-81) — the repo-shaped evidence rule joins per question now, so both halves of
  // the join need a fixture: a question whose OWN bucket names repo, and one that declares no
  // bucket at all and therefore cannot be judged.
  { id: 'dp', dir: 'test/fixtures/lifecycle-violations/dp-q-web-only-repo-bucket', description: '(WP-R22, RI10) Q rests on web alone while its own bucket names repo — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'Q5\'s recommendation (F2) rests on no repo or trial finding, while its '},
  { id: 'dq', dir: 'test/fixtures/lifecycle-violations/dq-q-no-bucket-reference', description: '(WP-R22, RI10) Q rests on web alone and names no bucket to judge it against — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'Q5 rests on no repo or trial finding and declares no bucket'},
  // WP-R22 RI9 — one fixture per Review-only mechanical rule, each a single mutation off
  // test/fixtures/conformance/council-review-wellformed. These exist because Phase 9 silently
  // deleted the Phase 7 rules they cover and every suite stayed green: the rules had been proven by
  // probe and locked by nothing. A probe demonstrates a rule works once; a fixture keeps it working.
  { id: 'dr', dir: 'test/fixtures/lifecycle-violations/dr-review-input-is-transcript', description: '(WP-R22, R2) reviewer declares the Build session transcript as its input — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'member m1 declares input "build session transcript"'},
  { id: 'ds', dir: 'test/fixtures/lifecycle-violations/ds-review-input-undeclared', description: '(WP-R22, R2) reviewer declares no input at all — omission must not evade the fence — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'member m2 records no declared input'},
  { id: 'dt', dir: 'test/fixtures/lifecycle-violations/dt-risk-categories-overlap', description: '(WP-R22, RI17) two reviewers assigned the same risk category — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'risk category "contract" is assigned to both m1 and m2 in round 1'},
  { id: 'du', dir: 'test/fixtures/lifecycle-violations/du-failed-member-no-skipped-check', description: '(WP-R22, RI18) member recorded failed with no skipped-check entry — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'member m2 is recorded "failed" but no "### Skipped Checks" entry recor'},
  { id: 'dv', dir: 'test/fixtures/lifecycle-violations/dv-review-without-repo-integrity', description: '(WP-R22, RI19) council-mode review records no repo digest — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'is a council-mode review but records no council.repo_integrity'},
  { id: 'dw', dir: 'test/fixtures/lifecycle-violations/dw-council-finding-carries-fix', description: '(WP-R22, RI2) council-log Findings table declares a fix-recommendation column — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'council-log Findings table declares a "fix recommendation" column'},
  // The two-file ledger: rotation in both directions, and the archive's closed-only rule.
  { id: 'dx', dir: 'test/fixtures/lifecycle-violations/dx-closed-row-not-rotated', description: '(WP-R22, RI6) closed row left in the active ledger — check-finding-quality', validator: validatorPath('check-finding-quality.mjs') , expect: 'row FQ-1 has closed outcome "proved-real" but is still in the active l'},
  { id: 'dy', dir: 'test/fixtures/lifecycle-violations/dy-row-in-both-files', description: '(WP-R22, RI6) row present in both ledger files — copied rather than moved — check-finding-quality', validator: validatorPath('check-finding-quality.mjs') , expect: 'row FQ-1 names finding F1 of workflow/artifacts/reviews/probe-v1.md, w'},
  { id: 'dz', dir: 'test/fixtures/lifecycle-violations/dz-pending-row-in-archive', description: '(WP-R22, RI6) pending row sitting in the archive, where nothing will return to it — check-finding-quality', validator: validatorPath('check-finding-quality.mjs') , expect: 'row FQ-1 has outcome "pending", which is not closed'},
  { id: 'ea', dir: 'test/fixtures/lifecycle-violations/ea-archive-missing', description: '(WP-R22, RI6) archive absent while the active ledger exists — a figure from one file is not a baseline — check-finding-quality', validator: validatorPath('check-finding-quality.mjs') , expect: 'exists but test/fixtures/lifecycle-violations/ea-archive-missing/findi'},
  // R5's two escapes: no ledger at all, and a ledger that omits a finding.
  { id: 'eb', dir: 'test/fixtures/lifecycle-violations/eb-council-review-without-ledger', description: '(WP-R22, R5) council review exists with no finding-quality ledger — check-finding-quality', validator: validatorPath('check-finding-quality.mjs') , expect: 'no finding-quality ledger exists, but 3 council finding(s) are recorde'},
  { id: 'ec', dir: 'test/fixtures/lifecycle-violations/ec-council-finding-unrecorded', description: '(WP-R22, R5) council finding has no finding-quality row — check-finding-quality', validator: validatorPath('check-finding-quality.mjs') , expect: 'council finding F3 has no finding-quality row'},
  { id: 'ed', dir: 'test/fixtures/lifecycle-violations/ed-ship-with-pending-finding', description: '(WP-R22, RI7) ship declared while a finding-quality row is still pending, with no waiver — check-release-readiness', validator: validatorPath('check-release-readiness.mjs') , expect: 'declares "ship" but the finding-quality ledger has 1 row(s) still pend'},
  // Review council findings P2-6/P3-10: rules that rejected under probe and were locked by nothing.
  { id: 'ee', dir: 'test/fixtures/lifecycle-violations/ee-q-bucket-unresolvable', description: '(WP-R22, RI10) Q declares a bucket with no Requirement Classification row — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'Q5 names bucket(s) R9 with no Requirement Classification entry'},
  { id: 'ef', dir: 'test/fixtures/lifecycle-violations/ef-skipped-check-missing-field', description: '(WP-R22, RI18) skipped-check entry covering a failed member omits a required field — check-council-record', validator: validatorPath('check-council-record.mjs') , expect: 'skipped-check entry for failed member m2 is missing owner'},
  { id: 'eg', dir: 'test/fixtures/lifecycle-violations/eg-active-ledger-missing', description: '(WP-R22, RI6) archive exists while the active ledger does not — check-finding-quality', validator: validatorPath('check-finding-quality.mjs') , expect: 'exists but test/fixtures/lifecycle-violations/eg-active-ledger-missing'},
  { id: 'eh', dir: 'test/fixtures/lifecycle-violations/eh-ledger-wrong-kind', description: '(WP-R22, RI16) ledger declares the wrong kind — check-finding-quality', validator: validatorPath('check-finding-quality.mjs') , expect: 'missing or wrong kind field (expected "finding-quality")'},
  { id: 'ei', dir: 'test/fixtures/lifecycle-violations/ei-ledger-duplicate-row-id', description: '(WP-R22, RI16) two ledger rows share an id — check-finding-quality', validator: validatorPath('check-finding-quality.mjs') , expect: 'duplicate row id FQ-1'},
  { id: 'ej', dir: 'test/fixtures/lifecycle-violations/ej-closed-row-missing-resolution', description: '(WP-R22, RI15) closed row without closed_in_phase or resolution — check-finding-quality', validator: validatorPath('check-finding-quality.mjs') , expect: 'is required'},
  { id: 'ek', dir: 'test/fixtures/lifecycle-violations/ek-waived-without-waiver-ref', description: '(WP-R22, RI15) waived row without a waiver_ref — check-finding-quality', validator: validatorPath('check-finding-quality.mjs') , expect: 'is required'},
  { id: 'el', dir: 'test/fixtures/lifecycle-violations/el-noise-without-reason', description: '(WP-R22, RI15) noise row without a reason — check-finding-quality', validator: validatorPath('check-finding-quality.mjs') , expect: 'is required'},
  { id: 'em', dir: 'test/fixtures/lifecycle-violations/em-classification-section-absent', description: '(WP-R21, R9) Requirement Classification subsection absent entirely — check-council-record', validator: validatorPath('check-council-record.mjs'), expect: 'council log has no "### Requirement Classification" subsection' },
  // Written after mutation testing showed 26 rules could be deleted with every suite green.
  // A rule with no fixture is a rule the suite does not defend, however carefully it was written.
  { id: 'en', dir: 'test/fixtures/lifecycle-violations/en-repo-citation-no-path', description: '(WP-R21, R10) repo citation contains no path token at all — check-council-record', validator: validatorPath('check-council-record.mjs'), expect: 'finding F1 is evidence_class repo but its citation names no file path' },
  { id: 'eo', dir: 'test/fixtures/lifecycle-violations/eo-citation-range-not-a-file', description: '(WP-R21, R10) line range cited against something that is not a readable file — check-council-record', validator: validatorPath('check-council-record.mjs'), expect: 'finding F1 cites "src/workflow/validators" with a line range, but it i' },
  { id: 'ep', dir: 'test/fixtures/lifecycle-violations/ep-citation-range-past-eof', description: '(WP-R21, R10) cited line range runs past the end of the file — check-council-record', validator: validatorPath('check-council-record.mjs'), expect: 'finding F1 cites package.json lines 1-99999 but the file has' },
  { id: 'eq', dir: 'test/fixtures/lifecycle-violations/eq-trial-citation-no-command', description: '(WP-R21, R10) trial citation carries no command or observed output — check-council-record', validator: validatorPath('check-council-record.mjs'), expect: 'finding F1 is evidence_class trial but its citation lacks a command an' },
  { id: 'er', dir: 'test/fixtures/lifecycle-violations/er-council-key-missing', description: '(WP-R21, R14) council mode missing a required frontmatter key — check-council-record', validator: validatorPath('check-council-record.mjs'), expect: 'council mode requires frontmatter council.cap_source' },
  { id: 'es', dir: 'test/fixtures/lifecycle-violations/es-council-mode-no-log', description: '(WP-R21, RI4) council mode declared with no Council Log section — check-council-record', validator: validatorPath('check-council-record.mjs'), expect: 'declares council mode "council" but has no "## Council Log" section' },
  { id: 'et', dir: 'test/fixtures/lifecycle-violations/et-no-rounds-recorded', description: '(WP-R21, R14) council log records no rounds — check-council-record', validator: validatorPath('check-council-record.mjs'), expect: 'council log has no rounds recorded' },
  { id: 'eu', dir: 'test/fixtures/lifecycle-violations/eu-rounds-run-mismatch', description: '(WP-R21, R14) rounds_run disagrees with the Rounds table — check-council-record', validator: validatorPath('check-council-record.mjs'), expect: 'council.rounds_run is 5 but the Rounds table has 2 row(s)' },
  { id: 'ev', dir: 'test/fixtures/lifecycle-violations/ev-max-rounds-exceeded', description: '(WP-R21, R13) more rounds than the resolved max_rounds allows — check-council-record', validator: validatorPath('check-council-record.mjs'), expect: 'ran 2 round(s) against a resolved council.max_rounds of 1' },
  { id: 'ew', dir: 'test/fixtures/lifecycle-violations/ew-no-members-subsection', description: '(WP-R21, R3) council log has no Members subsection — check-council-record', validator: validatorPath('check-council-record.mjs'), expect: 'council log has no "### Members" subsection' },
  { id: 'ex', dir: 'test/fixtures/lifecycle-violations/ex-challenger-cap-exceeded', description: '(WP-R21, R2) challenger stage exceeds the resolved cap — check-council-record', validator: validatorPath('check-council-record.mjs'), expect: 'round 1 dispatched 9 challengers against a resolved cap of 3' },
  { id: 'ey', dir: 'test/fixtures/lifecycle-violations/ey-round-without-rationale', description: '(WP-R21, R13) round after the first records no sizing rationale — check-council-record', validator: validatorPath('check-council-record.mjs'), expect: 'round 2 has no recorded sizing rationale — every round after the first' },
  { id: 'ez', dir: 'test/fixtures/lifecycle-violations/ez-digest-algorithm-unrecognised', description: '(WP-R21, R11) repo_integrity algorithm is not a recognised digest — check-council-record', validator: validatorPath('check-council-record.mjs'), expect: 'council.repo_integrity.algorithm "md5-of-something" is not a recognise' },
  { id: 'fa', dir: 'test/fixtures/lifecycle-violations/fa-invalid-evidence-class', description: '(WP-R21, R10) finding declares an evidence class outside the enum — check-council-record', validator: validatorPath('check-council-record.mjs'), expect: 'finding F5 has evidence_class "hunch" (expected one of repo, trial, we' },
  { id: 'fb', dir: 'test/fixtures/lifecycle-violations/fb-invalid-disposition', description: '(WP-R21, R4) finding declares a disposition outside the enum — check-council-record', validator: validatorPath('check-council-record.mjs'), expect: 'finding F1 has disposition "maybe" (expected one of accepted, merged, ' },
  { id: 'fc', dir: 'test/fixtures/lifecycle-violations/fc-q-without-finding-refs', description: '(WP-R21, R5) surviving Q carries a recommendation citing no findings — check-council-record', validator: validatorPath('check-council-record.mjs'), expect: 'Q5 carries a recommendation with no finding references' },
  { id: 'fd', dir: 'test/fixtures/lifecycle-violations/fd-evidence-class-undeclared', description: '(WP-R21, R12) a finding uses a class with no recorded availability — check-council-record', validator: validatorPath('check-council-record.mjs'), expect: 'has a recall finding but council.evidence_classes records no status fo' },
  { id: 'fe', dir: 'test/fixtures/lifecycle-violations/fe-review-no-risk-assignment', description: '(WP-R22, RI17) council review omits the Risk Category Assignment subsection — check-council-record', validator: validatorPath('check-council-record.mjs'), expect: 'is a council-mode review but has no "### Risk Category Assignment" sub' },
  { id: 'ff', dir: 'test/fixtures/lifecycle-violations/ff-consolidation-empty', description: '(WP-R22, R3) accepted council findings reach an empty consolidation — check-council-record', validator: validatorPath('check-council-record.mjs'), expect: 'records 2 accepted or merged council finding(s) but its "## Findings" ' },
  { id: 'fg', dir: 'test/fixtures/lifecycle-violations/fg-consolidation-omits-member', description: '(WP-R22, R3) consolidation omits a member that produced a finding — check-council-record', validator: validatorPath('check-council-record.mjs'), expect: 'consolidation does not cite member(s) m2, each of which produced an ac' },
  { id: 'fh', dir: 'test/fixtures/lifecycle-violations/fh-ship-without-status-section', description: '(WP-R21 inherited) ship artifact has no Ship Status section — check-release-readiness', validator: validatorPath('check-release-readiness.mjs'), expect: 'has no "Ship Status" section — cannot determine recommendation' },
  { id: 'fi', dir: 'test/fixtures/lifecycle-violations/fi-ship-declared-with-blockers', description: '(WP-R21 inherited) ship declared while blockers remain — check-release-readiness', validator: validatorPath('check-release-readiness.mjs'), expect: 'declares "ship" but orchestration.blockers is non-empty: Q1' },
  { id: 'fj', dir: 'test/fixtures/lifecycle-violations/fj-fq-schema-absent', description: '(WP-R22, RI16) finding-quality schema absent from the registry — check-finding-quality', validator: validatorPath('check-finding-quality.mjs'), env: { AGENTSMYTH_WF: 'test/fixtures/definitions/no-fq-schema' }, expect: 'finding-quality schema ($id: finding-quality) not found in schema registry' },
  { id: 'fk', dir: 'test/fixtures/definitions/no-kind', description: '(WP-R22, RI21) definitions file carries no kind — check-definitions', validator: validatorPath('check-definitions.mjs'), env: { AGENTSMYTH_WF: 'test/fixtures/definitions/no-kind' }, expect: 'missing kind — cannot select a schema to validate it against' },
  { id: 'fl', dir: 'test/fixtures/definitions/unknown-kind', description: '(WP-R22, RI21) definitions kind has no matching schema — check-definitions', validator: validatorPath('check-definitions.mjs'), env: { AGENTSMYTH_WF: 'test/fixtures/definitions/unknown-kind' }, expect: 'but no matching schema exists at' },
  { id: 'fm', dir: 'test/fixtures/definitions/empty', description: '(WP-R22, RI21) check-definitions validated nothing and must not report ok — check-definitions', validator: validatorPath('check-definitions.mjs'), env: { AGENTSMYTH_WF: 'test/fixtures/definitions/empty' }, expect: 'validated no definitions file' },
  // External review pass on PR #65: B3 — row ids were unique per file, not across the split.
  { id: 'fn', dir: 'test/fixtures/lifecycle-violations/fn-ledger-id-reused-across-files', description: '(WP-R22, RI6) the same row id names different findings in the two ledger files — check-finding-quality', validator: validatorPath('check-finding-quality.mjs'), expect: 'row id FQ-1 is already used in' },
  { id: 'fo', dir: 'test/fixtures/lifecycle-violations/fo-risk-category-unaccounted', description: '(WP-R22, RI17) a risk category is neither assigned to a reviewer nor recorded as skipped — check-council-record', validator: validatorPath('check-council-record.mjs'), expect: 'risk category "security" is neither assigned to a reviewer nor named in the Check column' },
  { id: 'fp', dir: 'test/fixtures/lifecycle-violations/fp-finding-outside-member-assignment', description: '(WP-R22, RI17) a finding declares a risk category its own member was never assigned — check-council-record', validator: validatorPath('check-council-record.mjs'), expect: 'finding F1 declares risk category "lifecycle" but member m1 was assigned' },
  { id: 'fq', dir: 'test/fixtures/definitions/per-phase-review-missing', description: '(WP-R22) council.per_phase declares think but not review — check-definitions', validator: validatorPath('check-definitions.mjs'), env: { AGENTSMYTH_WF: 'test/fixtures/definitions/per-phase-review-missing' }, expect: 'council.per_phase.review is required' },
  { id: 'fr', dir: 'test/fixtures/lifecycle-violations/fr-assignment-no-round-column', description: '(WP-R22, RI17) the Risk Category Assignment table omits the Round column — check-council-record', validator: validatorPath('check-council-record.mjs'), expect: 'has no Round column; disjointness is a per-round property' },
  { id: 'fs', dir: 'test/fixtures/lifecycle-violations/fs-fix-column-empty-table', description: '(WP-R22, RI2) a Fix column declared on a Findings table with no rows — check-council-record', validator: validatorPath('check-council-record.mjs'), expect: 'council-log Findings table declares a "fix recommendation" column' },
  // Second external review pass on PR #65: B4/B5 — both rules read the right idea out of the wrong
  // structure, and both were found by mutating the council-review conformance fixture. `fo` and `fr`
  // cover the plain forms (a category named nowhere, a Round column simply absent); these two cover
  // the forms an honest record actually takes, where ordinary review prose satisfies a scan that was
  // never anchored to a column. Each differs from its wellformed base in exactly one place.
  { id: 'ft', dir: 'test/fixtures/lifecycle-violations/ft-skipped-check-prose-not-check-column', description: '(WP-R22, RI17) a skipped-check row names a category in its prose but not in the Check column — check-council-record', validator: validatorPath('check-council-record.mjs'), expect: 'risk category "security" is neither assigned to a reviewer nor named in the Check column' },
  { id: 'fu', dir: 'test/fixtures/lifecycle-violations/fu-assignment-round-in-rationale-only', description: '(WP-R22, RI17) the Round column is absent and only a rationale cell says "round" — check-council-record', validator: validatorPath('check-council-record.mjs'), expect: 'has no Round column; disjointness is a per-round property' },
  // N12 — the coverage rule used to disable itself when the categories list was unreadable, so the
  // one condition under which coverage cannot be established reported the same green as full
  // coverage. AGENTSMYTH_WF points the definitions root at the fixture's own directory, which has no
  // skills/ tree: the artifact is well-formed, only the list it is measured against is missing.
  { id: 'fv', dir: 'test/fixtures/lifecycle-violations/fv-risk-categories-doc-unreadable', description: '(WP-R22, RI17) the risk-category list is unreadable and coverage must gate, not skip — check-council-record', validator: validatorPath('check-council-record.mjs'), env: { AGENTSMYTH_WF: 'test/fixtures/lifecycle-violations/fv-risk-categories-doc-unreadable' }, expect: 'could not be read; coverage is claimed against that list' },
  // OI-66 — the second instance of the versioned-artifact selection bug that made
  // check-release-readiness cross-check the OLDEST review. check-assumptions read briefCandidates[0]
  // over a `-v<N>` set, so a brief revised to v2 with a new assumption was judged against v1. Two
  // brief versions, and a plan that covers exactly what v1 declared: the fixture passes under the
  // old selection and rejects under the fix, which is the only shape that pins it.
  { id: 'fw', dir: 'test/fixtures/lifecycle-violations/fw-brief-revision-assumption-uncovered', description: '(OI-66) a plan is judged against a superseded brief version, hiding an unverified assumption — check-assumptions', validator: validatorPath('check-assumptions.mjs'), expect: 'brief assumption A2 has no row in Assumptions Verified' },
  // OI-82 — check-lifecycle's static contract check. These eight rules pin agent-behavior.yaml's
  // artifact_chain and the frontmatter schema's enums to lib.mjs's artifactContracts, and every one
  // of them could be deleted with the whole suite green: the contract has simply never been wrong,
  // so the rules that guard it had never executed. Each fixture is a minimal definitions root with
  // exactly one field diverged, reached through AGENTSMYTH_WF.
  { id: 'fx', dir: 'test/fixtures/definitions/fx-chain-length-mismatch', description: '(OI-82) agent-behavior artifact_chain has too few entries — check-lifecycle', validator: validatorPath('check-lifecycle.mjs'), env: { AGENTSMYTH_WF: 'test/fixtures/definitions/fx-chain-length-mismatch' }, expect: 'artifact_chain expected 7 entries, got 6' },
  { id: 'fy', dir: 'test/fixtures/definitions/fy-chain-artifact-mismatch', description: '(OI-82) artifact_chain entry names the wrong artifact — check-lifecycle', validator: validatorPath('check-lifecycle.mjs'), env: { AGENTSMYTH_WF: 'test/fixtures/definitions/fy-chain-artifact-mismatch' }, expect: 'artifact_chain[2].artifact expected task' },
  { id: 'fz', dir: 'test/fixtures/definitions/fz-chain-phase-mismatch', description: '(OI-82) artifact_chain entry names the wrong phase — check-lifecycle', validator: validatorPath('check-lifecycle.mjs'), env: { AGENTSMYTH_WF: 'test/fixtures/definitions/fz-chain-phase-mismatch' }, expect: 'artifact_chain[2].phase expected build' },
  { id: 'ga', dir: 'test/fixtures/definitions/ga-chain-next-phase-mismatch', description: '(OI-82) artifact_chain entry names the wrong next_phase — check-lifecycle', validator: validatorPath('check-lifecycle.mjs'), env: { AGENTSMYTH_WF: 'test/fixtures/definitions/ga-chain-next-phase-mismatch' }, expect: 'artifact_chain[2].next_phase expected review' },
  { id: 'gb', dir: 'test/fixtures/definitions/gb-chain-path-mismatch', description: '(OI-82) artifact_chain entry names the wrong artifact path — check-lifecycle', validator: validatorPath('check-lifecycle.mjs'), env: { AGENTSMYTH_WF: 'test/fixtures/definitions/gb-chain-path-mismatch' }, expect: 'artifact_chain[2].path expected workflow/artifacts/tasks/' },
  { id: 'gc', dir: 'test/fixtures/definitions/gc-schema-missing-artifact', description: '(OI-82) frontmatter schema omits an artifact the contract requires — check-lifecycle', validator: validatorPath('check-lifecycle.mjs'), env: { AGENTSMYTH_WF: 'test/fixtures/definitions/gc-schema-missing-artifact' }, expect: 'schema missing artifact reflect' },
  { id: 'gd', dir: 'test/fixtures/definitions/gd-schema-missing-phase', description: '(OI-82) frontmatter schema omits a phase the contract requires — check-lifecycle', validator: validatorPath('check-lifecycle.mjs'), env: { AGENTSMYTH_WF: 'test/fixtures/definitions/gd-schema-missing-phase' }, expect: 'schema missing phase reflect' },
  { id: 'ge', dir: 'test/fixtures/definitions/ge-schema-missing-next-phase', description: '(OI-82) frontmatter schema omits a next_phase the contract requires — check-lifecycle', validator: validatorPath('check-lifecycle.mjs'), env: { AGENTSMYTH_WF: 'test/fixtures/definitions/ge-schema-missing-next-phase' }, expect: 'schema missing next_phase done' },
  // OI-82 — check-pending-setup, previously 8 of 8 undefended for a structural reason rather than
  // an oversight: it was the one validator without `--dir`, resolving a hardcoded repoRoot path, so
  // no fixture could reach any of its rules. Adding the flag every other validator already carries
  // made all eight reachable at once.
  { id: 'gf', dir: 'test/fixtures/lifecycle-violations/gf-pending-wrong-kind', description: '(OI-82) pending-setup.yaml declares the wrong kind — check-pending-setup', validator: validatorPath('check-pending-setup.mjs'), expect: 'missing or wrong kind field' },
  { id: 'gg', dir: 'test/fixtures/lifecycle-violations/gg-pending-items-not-array', description: '(OI-82) pending-setup items is not a list — check-pending-setup', validator: validatorPath('check-pending-setup.mjs'), expect: 'items must be an array' },
  { id: 'gh', dir: 'test/fixtures/lifecycle-violations/gh-pending-item-no-id', description: '(OI-82) a pending-setup item has no id — check-pending-setup', validator: validatorPath('check-pending-setup.mjs'), expect: 'item missing id' },
  { id: 'gi', dir: 'test/fixtures/lifecycle-violations/gi-pending-item-no-config', description: '(OI-82) a pending-setup item names no config file — check-pending-setup', validator: validatorPath('check-pending-setup.mjs'), expect: 'missing config' },
  { id: 'gj', dir: 'test/fixtures/lifecycle-violations/gj-pending-item-no-field', description: '(OI-82) a pending-setup item names no field — check-pending-setup', validator: validatorPath('check-pending-setup.mjs'), expect: 'missing field' },
  { id: 'gk', dir: 'test/fixtures/lifecycle-violations/gk-pending-item-no-question', description: '(OI-82) a pending-setup item carries no question — check-pending-setup', validator: validatorPath('check-pending-setup.mjs'), expect: 'missing question' },
  { id: 'gl', dir: 'test/fixtures/lifecycle-violations/gl-pending-bad-status', description: '(OI-82) a pending-setup item has a status outside the enum — check-pending-setup', validator: validatorPath('check-pending-setup.mjs'), expect: 'invalid status "nearly-done"' },
  { id: 'gm', dir: 'test/fixtures/lifecycle-violations/gm-pending-resolved-no-resolved-by', description: '(OI-82) a resolved pending-setup item records no resolved_by — check-pending-setup', validator: validatorPath('check-pending-setup.mjs'), expect: 'status is resolved but resolved_by is not set' },
  // OI-82 — check-open-items, 3 of 3 undefended. The ledger this repo keeps has always been
  // well-formed, so none of these had ever run.
  { id: 'gn', dir: 'test/fixtures/lifecycle-violations/gn-open-items-wrong-kind', description: '(OI-82) open-items.yaml declares the wrong kind — check-open-items', validator: validatorPath('check-open-items.mjs'), expect: 'missing or wrong kind field' },
  { id: 'go', dir: 'test/fixtures/lifecycle-violations/go-open-items-schema-absent', description: '(OI-82) open-items schema absent from the registry — check-open-items', validator: validatorPath('check-open-items.mjs'), env: { AGENTSMYTH_WF: 'test/fixtures/definitions/no-open-items-schema' }, expect: 'not found in schema registry' },
  { id: 'gp', dir: 'test/fixtures/lifecycle-violations/gp-open-items-duplicate-id', description: '(OI-82) two open-items entries share one id — check-open-items', validator: validatorPath('check-open-items.mjs'), expect: 'duplicate item id OI-1' },
  // OI-82 — check-verify-matrix, 3 of 4 undefended. Only the pass-with-empty-evidence rule had ever
  // fired against the real corpus; the three that catch a missing section, a missing row and an
  // unnamed method had not.
  { id: 'gq', dir: 'test/fixtures/lifecycle-violations/gq-verify-no-matrix-section', description: '(OI-82) verify artifact declares manifest IDs but has no Manifest Coverage section — check-verify-matrix', validator: validatorPath('check-verify-matrix.mjs'), expect: 'has no "## Manifest Coverage" section' },
  { id: 'gr', dir: 'test/fixtures/lifecycle-violations/gr-verify-id-no-row', description: '(OI-82) a declared manifest ID has no Manifest Coverage row — check-verify-matrix', validator: validatorPath('check-verify-matrix.mjs'), expect: 'manifest ID R1 has no row in Manifest Coverage' },
  { id: 'gs', dir: 'test/fixtures/lifecycle-violations/gs-verify-method-empty', description: '(OI-82) a Manifest Coverage row names no verification method — check-verify-matrix', validator: validatorPath('check-verify-matrix.mjs'), expect: 'has no named verification method' },
  // OI-82 — one rule each from four more validators whose real corpus has never been malformed in
  // the shape they guard against.
  { id: 'gt', dir: 'test/fixtures/lifecycle-violations/gt-phase-no-exit-gate', description: '(OI-82) a plan phase declares manifest IDs but no exit gate — check-phase-map', validator: validatorPath('check-phase-map.mjs'), expect: 'declares manifest IDs but has no exit gate content' },
  { id: 'gu', dir: 'test/fixtures/lifecycle-violations/gu-coverage-id-no-row', description: '(OI-82) a declared manifest ID has no coverage-table row — check-coverage-ledger', validator: validatorPath('check-coverage-ledger.mjs'), expect: 'manifest ID R1 has no row in the coverage table' },
  { id: 'gv', dir: 'test/fixtures/lifecycle-violations/gv-skipped-missing-value', description: '(OI-82) a Skipped Checks row leaves a required field empty — check-skipped-accounting', validator: validatorPath('check-skipped-accounting.mjs'), expect: 'missing value for "risk"' },
  { id: 'gw', dir: 'test/fixtures/lifecycle-violations/gw-automated-not-run-unaccounted', description: '(OI-82) an Automated Check is "not run" with no Skipped Checks entry — check-skipped-accounting', validator: validatorPath('check-skipped-accounting.mjs'), expect: 'has no matching Skipped Checks entry' },
  { id: 'gx', dir: 'test/fixtures/lifecycle-violations/gx-waiver-short-row', description: '(OI-82) a Waivers row has fewer columns than the contract requires — check-waivers', validator: validatorPath('check-waivers.mjs'), expect: 'Waivers row 1 has 2 column(s), expected 6' },
];

let passed = 0;
let gaps = 0;

for (const fixture of fixtures) {
  const result = spawnSync(
    process.execPath,
    [fixture.validator, '--dir', fixture.dir],
    // Some rules only fire against a crafted DEFINITIONS root — a missing schema, a file with no
    // kind — which `--dir` cannot express, since it scopes artifacts rather than definitions.
    // Without a per-fixture env those rules had no fixture at all, and mutation testing showed they
    // could be deleted with every suite green.
    { cwd: repoRoot, encoding: 'utf8', env: { ...env, ...(fixture.env ?? {}) } }
  );

  const combined = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  // Rejecting is not enough: the fixture must reject for the rule it names. `cp` rejected for a
  // whole-subsection rule while its description named a per-ID rule, so the per-ID rule had no
  // fixture at all and mutation testing showed it could be deleted with every suite green. Counting
  // errors cannot see that; matching the error can.
  const matched = !fixture.expect || combined.includes(fixture.expect);
  const detected = result.status !== 0 && matched;

  if (result.status !== 0 && !matched) {
    console.error(`[WRONG] ${fixture.id}: rejected, but not by the rule it names`);
    console.error(`        expected to contain: ${fixture.expect}`);
    console.error(`        got: ${combined.split('\n').find((l) => l.startsWith('- ')) ?? '(no error line)'}`);
  }

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

// Attribution sweep, in the harness rather than in a person's terminal. RI9's acceptance says every
// council fixture emits exactly one error; until now that was verified by hand, which means it was
// true on the day someone checked and unverified every day after. A fixture rejected for TWO reasons
// keeps passing when the rule it targets regresses — the failure this suite exists to prevent.
const councilFixtures = fixtures.filter((f) => /check-(council-record|finding-quality)\.mjs$/.test(f.validator));
let multi = 0;
for (const fixture of councilFixtures) {
  const result = spawnSync(process.execPath, [fixture.validator, '--dir', fixture.dir],
    { cwd: repoRoot, encoding: 'utf8', env: { ...env, ...(fixture.env ?? {}) } });
  const combined = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  const count = combined.split('\n').filter((l) => l.startsWith('- ')).length;
  if (count !== 1) {
    console.error(`[ATTR] ${fixture.id}: emitted ${count} error(s), expected exactly 1`);
    multi++;
  }
}
console.log(`attribution sweep: ${councilFixtures.length - multi}/${councilFixtures.length} council fixtures emit exactly one error`);
if (multi > 0) {
  console.error(`${multi} fixture(s) reject for more than one reason — each would keep passing if its own rule regressed`);
  process.exit(1);
}

if (gaps > 0) {
  console.error(`${gaps} confirmed validator gap(s) — fix before wiring more call sites`);
  process.exit(1);
}

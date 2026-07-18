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

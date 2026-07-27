#!/usr/bin/env node
// Contract-conformance tests (audit-remediation R10/R11/R12). Runs the REAL validators against
// static fixtures to prove the whole "validator ↔ documented contract" bug class stays fixed:
//   R12 — check-starter-blocks validates every real starter block, and fails a seeded broken one.
//   R11 — check-artifacts accepts the documented `-p<P>` task filename.
//   R10 — check-waivers suppresses enum/table false-positives yet still catches a real prose claim.
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const V = (name) => join(repoRoot, 'src', 'workflow', 'validators', `${name}.mjs`);

function run(validator, args, env = {}) {
  const r = spawnSync(process.execPath, [validator, ...args], {
    cwd: repoRoot, encoding: 'utf8',
    env: { ...process.env, AGENTSMYTH_WF: 'src/workflow', ...env },
  });
  return { status: r.status, out: (r.stdout ?? '') + (r.stderr ?? '') };
}

let passed = 0, failed = 0;
const check = (id, desc, cond) => {
  if (cond) { console.log(`[PASS] ${id}: ${desc}`); passed++; }
  else { console.error(`[FAIL] ${id}: ${desc}`); failed++; }
};

// R12 positive — all real starter blocks validate.
const sbAll = run(V('check-starter-blocks'), []);
check('r12-all', 'every real starter block frontmatter validates', sbAll.status === 0);

// R12 negative — seeded broken starter block (map-form upstream) is rejected.
const sbBad = run(V('check-starter-blocks'), ['--file', 'test/fixtures/conformance/broken-output-schema.md']);
check('r12-bad', 'seeded map-form starter block is rejected',
  sbBad.status !== 0 && /upstream/.test(sbBad.out));

// R13/R12 body-format guard — the plan starter block's phase labels must be the bold
// `**Manifest IDs:**` / `**Exit gate:**` that check-phase-map parses, so a plan authored from it
// isn't orphaned. Closes the review P3 "body-format is unguarded" for the concrete instance found.
const planSchema = readFileSync(join(repoRoot, 'src/workflow/skills/lifecycle-plan/references/output-schema.md'), 'utf8');
const planStarter = (planSchema.split('## Starter Block')[1] || '').match(/```markdown\n([\s\S]*?)```/)?.[1] || '';
check('r13-format', 'plan starter block uses bold phase labels check-phase-map requires',
  /- \*\*Manifest IDs:\*\*/.test(planStarter) && /- \*\*Exit gate:\*\*/.test(planStarter));

// R11 — `-p<P>` task filename is accepted (no filename error for the probe).
const art = run(V('check-artifacts'), ['--dir', 'test/fixtures/conformance/tasks-dir']);
check('r11-psuffix', '-p<P> task filename not rejected',
  !/probe-v1-p1\.md filename must match/.test(art.out));

// R11 aggregation — when a slug has multiple `-p<P>` tasks at the same version, the phase gate must
// require EVERY part ready, not pass on one arbitrarily. Fixture: p1 ready, p2 in-progress.
const agg = run(V('check-lifecycle'), ['--phase', 'review', '--slug', 'multi'],
  { AGENTSMYTH_WF: 'test/fixtures/conformance/multipart' });
check('r11-aggregate', 'phase gate fails when a sibling -p task is not ready',
  agg.status !== 0 && /multi-v1-p2\.md has status "in-progress"/.test(agg.out));

// R10 negative — a real prose waiver claim is still caught.
const wv = run(V('check-waivers'), ['--dir', 'test/fixtures/conformance/waivers-dir'], { AGENTSMYTH_HOME: 'src/workflow' });
check('r10-detect', 'genuine prose waiver claim still flagged',
  /unstructured waiver claim/.test(wv.out) && /waived the R5 gate/.test(wv.out));

// R10 — an action claim inside a TABLE cell is still caught (enum cells stay exempt).
const wvt = run(V('check-waivers'), ['--dir', 'test/fixtures/conformance/table-claim'], { AGENTSMYTH_HOME: 'src/workflow' });
check('r10-table', 'action waiver claim in a table cell still flagged',
  /unstructured waiver claim/.test(wvt.out) && /waived R7's verification gate/.test(wvt.out));

// R4 — a waived-Test verify is a well-formed, ship-gate-ready artifact: its ## Waivers table passes
// completeness (6 fields), and it declares ready-for-next-phase + hold-with-waiver (so
// check-lifecycle --phase ship accepts it and the waiver stays visible).
const wt = run(V('check-waivers'), ['--dir', 'test/fixtures/conformance/waived-test'], { AGENTSMYTH_HOME: 'src/workflow' });
check('r4-waiver-complete', 'waived-Test verify passes waiver completeness (no false-positive)',
  wt.status === 0);
import { readFileSync } from 'node:fs';
const wtDoc = readFileSync(join(repoRoot, 'test/fixtures/conformance/waived-test/verify/probe-v1.md'), 'utf8');
check('r4-gate-ready', 'waived-Test verify is ready-for-next-phase + hold-with-waiver',
  /status: ready-for-next-phase/.test(wtDoc) && /Recommendation: hold-with-waiver/.test(wtDoc));

// Manifest-ID parser hardening — check-manifest-coverage.mjs's structured-tag scan must not
// treat an incidental compound-token mention (e.g. "WP-R7-T7.2") or unrelated prose ("...so R6
// has...") as a manifest ID claim, while still crediting a real "— ID:" tag.
const mid = run(V('check-manifest-coverage'), ['--dir', 'test/fixtures/conformance/manifest-id-false-positive']);
check('mid-false-positive', 'compound-token and incidental prose mentions are not treated as manifest ID claims',
  mid.status === 0);

// Manifest-ID parser hardening — check-phase-map.mjs must parse a `**Manifest IDs:**` line
// carrying a parenthetical annotation (e.g. "RI2 (partial)", "RI1 (infra supporting R2, R3, R4,
// R7 verification)"), crediting only the intended ID without orphaning it or spuriously
// extracting the IDs named inside the parenthetical prose.
const pmp = run(V('check-phase-map'), ['--dir', 'test/fixtures/conformance/phase-map-parenthetical']);
check('phase-map-parenthetical', 'parenthetical annotation on a Manifest IDs line is parsed correctly',
  pmp.status === 0);

// Manifest-ID parser hardening (Review follow-up) — check-coverage-ledger.mjs's waiverIds()
// must credit a base ID mentioned only via a hyphenated sub-label (e.g. "RI5-a" crediting
// "RI5"), while still excluding a genuine WP-R#-style compound-token mention ("WP-R7-T7.2")
// as a real waiver claim for the ID it happens to contain.
const cls = run(V('check-coverage-ledger'), ['--dir', 'test/fixtures/conformance/coverage-ledger-sublabel']);
check('coverage-ledger-sublabel', 'hyphenated sub-label credits base ID; compound-token mention still excluded',
  cls.status !== 0 &&
  /manifest ID R7 is marked dropped\/removed with no matching Waivers entry/.test(cls.out) &&
  !/manifest ID RI5 is marked dropped/.test(cls.out));

// R14 (OI-29) — check-waivers.mjs's negation regex must exempt "rather than ... a waiver"
// prose, the exact construction that caused a genuine CI failure on PR #41 (see
// workflow/artifacts/open-items.yaml OI-29), while still catching a real prose claim.
const rt = run(V('check-waivers'), ['--dir', 'test/fixtures/conformance/waiver-rather-than'], { AGENTSMYTH_HOME: 'src/workflow' });
check('r14-rather-than', '"rather than ... a waiver" prose is not flagged as an unstructured claim',
  rt.status === 0);

// R16 (OI-38) — lifecycle-test's Skipped Checks Starter Block must show all 6 columns
// check-skipped-accounting.mjs actually requires (driven by verification.yaml's
// skipped_checks.required_fields), not the stale 5-column shape that omitted Manifest IDs.
const schemaText = readFileSync(join(repoRoot, 'src/workflow/skills/lifecycle-test/references/output-schema.md'), 'utf8');
const skippedChecksHeader = schemaText.match(/## Skipped Checks\n\n(\| [^\n]+ \|)/)?.[1] ?? '';
check('r16-skipped-checks-columns', 'Skipped Checks Starter Block table has all 6 required columns',
  /Manifest IDs/.test(skippedChecksHeader) && skippedChecksHeader.split('|').length - 2 === 6);

// R15 (OI-37) — check-scope-fence.mjs's phaseTouches() boundary regex must recognize a
// bullet-dash-prefixed "- Work:"/"- Exit gate:" label (this repo's own plan convention),
// not just a whitespace-only-prefixed one, so a phase's Touches capture stays bounded
// instead of silently absorbing a later, unrelated backtick-quoted path as covered.
const sfb = run(V('check-scope-fence'), ['--dir', 'test/fixtures/conformance/scope-fence-bullet-boundary']);
check('r15-scope-fence-bullet', 'bullet-dash-prefixed phase boundary keeps Touches correctly bounded',
  sfb.status !== 0 && /outside Phase 1's declared Touches/.test(sfb.out));

console.log(`\n${passed}/${passed + failed} conformance checks passed`);
process.exit(failed === 0 ? 0 : 1);

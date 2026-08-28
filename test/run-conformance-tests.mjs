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

// R19 (OI-63/OI-68) — the plan starter block must carry the `## Assumptions Verified` table that
// check-assumptions requires whenever the upstream brief declares A IDs. It was absent, so a plan
// copied verbatim from the starter block failed `npm run validate`. Lock the section AND its three
// parsed columns (id, status, evidence/question) so the pair can't drift apart again.
check('r19-assumptions-section', 'plan starter block carries ## Assumptions Verified',
  /^## Assumptions Verified$/m.test(planStarter));
check('r19-assumptions-columns', 'Assumptions Verified table has the 3 columns check-assumptions parses',
  /\| Assumption ID \| Status \| Evidence \/ Question \|/.test(planStarter));

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
import { readFileSync, readdirSync } from 'node:fs';
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
// WP-R21 positive control — a well-formed council brief must PASS check-council-record, and must
// print the summary line. Without this, the 15 rejection fixtures in the violations suite would be
// satisfied by a validator that rejects everything.
const cwf = run(V('check-council-record'), ['--dir', 'test/fixtures/conformance/council-wellformed']);
check('r21-council-wellformed', 'well-formed council brief passes check-council-record',
  cwf.status === 0);
check('r21-council-summary', 'check-council-record reports texture, not a bare pass',
  /summary: \d+ council brief\(s\), \d+ round\(s\), \d+ finding\(s\)/.test(cwf.out) &&
  /\d+ recall-only hypothes\(es\) accepted without corroboration/.test(cwf.out) &&
  /\d+ citation\(s\) mechanically resolved vs \d+ shape-checked only/.test(cwf.out));

// WP-R21 R15 anti-drift — lifecycle-think's SKILL.md must keep naming the eight pipeline stages the
// validator and council skill are written against. Same doc-drift class as R12/R13/R16/R19: the
// contract and its documentation rot apart unless something pins them together.
const thinkSkill = readFileSync(join(repoRoot, 'src/workflow/skills/lifecycle-think/SKILL.md'), 'utf8');
check('r21-think-stages', 'lifecycle-think SKILL.md names all eight pipeline stages in order',
  ['Stage 1 — Classify and locate', 'Stage 2 — Frame requirements and assign evidence classes',
   'Stage 3 — Fan out', 'Stage 4 — Challenge', 'Stage 5 — Consolidate',
   'Stage 6 — Assess and decide', 'Stage 7 — Write the brief', 'Stage 8 — Log the run']
    .every((s, i, arr) => {
      const idx = thinkSkill.indexOf(s);
      return idx !== -1 && (i === 0 || idx > thinkSkill.indexOf(arr[i - 1]));
    }));

// WP-R21 R8 — the preserved single-agent path must stay a verbatim copy, not a paraphrase. A
// "preserved" path that drifts into a reconstruction is not a rollback surface.
const sap = readFileSync(join(repoRoot, 'src/workflow/skills/lifecycle-think/references/single-agent-path.md'), 'utf8');
check('r21-single-agent-verbatim', 'preserved single-agent path retains the pre-R21 workflow steps verbatim',
  /1\. Classify task as Trivial, Standard, or Complex\./.test(sap) &&
  /11\. Set `orchestration\.status` to `blocked-for-user` when questions remain, otherwise `ready-for-next-phase` with `next_phase: plan`\./.test(sap) &&
  /skill_trigger_log` entry for every evaluated trigger \(ran or skipped, with reason\)\./.test(sap));

// The council validator is only reachable in a consumer repo if a skill names it. `agentsmyth
// check` hardcodes two validator filenames, and scripts/validate-template.mjs — where it is
// registered here — is not in package.json "files", so it never ships. The skill's Exit Gate is
// therefore the only route a consumer has to it, and an unpinned mention rots silently.
check('r21-validator-named', 'lifecycle-think Exit Gate names check-council-record.mjs',
  /check-council-record\.mjs/.test(thinkSkill));

// Taper coherence is stated in three places and implemented in one. The implementation gates on the
// previous round's `Items closed` cell; the prose said "a decrease in open items", which is a
// different test and one the validator has never run — items also open mid-run. Same anti-drift
// shape as r21-validator-named: pin the wording to the implementation, since a README that argues
// for the validator while describing a rule it does not enforce undoes its own argument.
const validatorsReadme = readFileSync(join(repoRoot, 'src/workflow/validators/README.md'), 'utf8');
check('r21-taper-wording', 'skill and validators README describe taper coherence as the Items closed test',
  /Items closed/.test(thinkSkill) && /Items closed/.test(validatorsReadme) &&
  !/decrease in open items/.test(thinkSkill) && !/decrease in open items/.test(validatorsReadme));

// The termination enum lives in two places that must agree: TERMINATIONS in the validator, and
// termination_reason.enum in the artifact schema. Pinning the prose instead only pinned the
// SENTENCES — both negatives were literal strings from the superseded text, so any paraphrase
// reintroducing max-rounds walked through, and a blanket token ban is unavailable because the skill
// legitimately names it in the paragraph explaining its removal. Compare the two lists directly:
// string-independent, and there is no wording that satisfies it while the contracts disagree.
const councilValidatorSrc = readFileSync(join(repoRoot, 'src/workflow/validators/check-council-record.mjs'), 'utf8');
const validatorTerminations = (councilValidatorSrc.match(/const TERMINATIONS = \[([^\]]*)\]/)?.[1] ?? '')
  .split(',').map((t) => t.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
const artifactSchema = readFileSync(join(repoRoot, 'src/workflow/schemas/artifact-frontmatter.schema.yaml'), 'utf8');
const schemaTerminations = (artifactSchema.match(/termination_reason:[\s\S]*?enum:\n((?:\s*- [^\n]+\n)+)/)?.[1] ?? '')
  .split('\n').map((l) => l.replace(/^\s*-\s*/, '').trim()).filter(Boolean);
check('r21-termination-enum', 'validator TERMINATIONS and schema termination_reason.enum are the same list',
  validatorTerminations.length > 0 &&
  schemaTerminations.length > 0 &&
  validatorTerminations.join('|') === schemaTerminations.join('|'));

// Coverage-ledger drop detection must read a STATUS, not a keyword. A row whose prose merely
// mentions "dropped" or "removed" — "availability recorded, never silently dropped" — is not a drop
// claim, and rejecting it made the validator assert the opposite of what the cell said. The
// positive case still has to fail (coverage-ledger-sublabel, above), so both directions are pinned.
const prose = run(V('check-coverage-ledger'), ['--dir', 'test/fixtures/conformance/coverage-ledger-prose-drop']);
check('coverage-ledger-prose-drop', 'prose mentioning dropped/removed is not read as a drop claim',
  prose.status === 0);

// Shipped-neutrality — src/ is copied verbatim into consumer repos and into ~/.agentsmyth, so a
// consumer reading their own installed agent-behavior.yaml, schema, skill or validator must not be
// shown agentsmyth's internal tracker IDs. "WP-R21", "OI-74", "Review F5", "brief A5" mean nothing
// outside this repo's own Notion and workflow/artifacts, and their presence makes shipped files
// read as internal notes rather than as a product.
//
// Reasoning about WHY a rule exists is welcome and should stay; only the ticket reference goes.
// This was a real defect: 47 such references had accumulated across 19 shipped files before anyone
// checked, because nothing looked.
const NEUTRALITY_ALLOWLIST = new Set([
  // Illustrates the open-items ledger's own ID format. OI-1/OI-2 here are sample data in a format
  // example, not references to this repo's tracker.
  'src/workflow/skills/follow-up-owner-assigner/references/ledger-format.md',
]);

function walkSrc(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walkSrc(full, out);
    else if (/\.(md|mjs|ya?ml)$/.test(entry.name) || entry.name === 'pre-commit') out.push(full);
  }
  return out;
}

const neutralityHits = [];
for (const file of walkSrc(join(repoRoot, 'src'))) {
  const rel = file.slice(repoRoot.length + 1);
  if (NEUTRALITY_ALLOWLIST.has(rel)) continue;
  for (const m of readFileSync(file, 'utf8').matchAll(/\bWP-R\d+|\bOI-\d+|\bReview F\d+\b|\bRI\d+ \(WP/g)) {
    neutralityHits.push(`${rel}: ${m[0]}`);
  }
}
check('shipped-neutrality', 'no internal tracker IDs (WP-R#, OI-#, Review F#) in shipped src/',
  neutralityHits.length === 0);
if (neutralityHits.length) {
  console.error(`       ${neutralityHits.length} reference(s):`);
  for (const h of neutralityHits.slice(0, 12)) console.error(`         ${h}`);
}

check('r15-scope-fence-bullet', 'bullet-dash-prefixed phase boundary keeps Touches correctly bounded',
  sfb.status !== 0 && /outside Phase 1's declared Touches/.test(sfb.out));

console.log(`\n${passed}/${passed + failed} conformance checks passed`);
process.exit(failed === 0 ? 0 : 1);

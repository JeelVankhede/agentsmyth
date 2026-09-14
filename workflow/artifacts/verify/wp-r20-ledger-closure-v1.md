---
slug: wp-r20-ledger-closure
version: 1
artifact: verify
status: ready-for-next-phase
created: 2026-09-13
updated: 2026-09-13
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, R8, RI1, RI2, RI3, RI4, RI5, RI6, RI7, RI8]
upstream:
  - workflow/artifacts/briefs/wp-r20-ledger-closure-v1.md
  - workflow/artifacts/plans/wp-r20-ledger-closure-v1.md
  - workflow/artifacts/tasks/wp-r20-ledger-closure-v1.md
  - workflow/artifacts/reviews/wp-r20-ledger-closure-v1.md
orchestration:
  phase: test
  status: ready-for-next-phase
  next_phase: ship
  blockers: []
  user_checkpoint: none
---

# WP-R20 — Open-Items Ledger Closure Lifecycle - Verification

## Inputs

Full chain through Review: brief (approved at brief-review 2026-09-13), plan (approved at plan-review,
amended twice during Build and Review), task (seven phases, all complete), review (`pass-with-risk`,
three findings all resolved in place).

**Every automated check below was re-run at this phase, not carried over from Build.** Review's
downstream note required it: findings F1 and F3 changed `src/workflow/skills/lifecycle-ship/SKILL.md`
and `src/workflow/validators/check-open-items.mjs` *after* Build's suite run, so Build's evidence
described a tree that no longer existed. `npm run build` was re-run first, so the bundle under test is
the one the source now produces.

## Automated Checks

| Command | Outcome | Evidence |
|---|---|---|
| `npm run build` | pass | exit 0 |
| `npm run validate` | pass | exit 0 — `validate-example: ok` |
| `npm run violations:test` | pass | `215/215 violations detected` (210 at Plan time; five new fixtures) |
| `npm run conformance:test` | pass | `49/49 conformance checks passed` (48 at Plan time; one new positive control) |
| `npm run root-resolution:test` | pass | `21/21 root-resolution drift checks passed` |
| `npm run setup-checks:test` | pass | `13/13 setup-complete checks passed` |
| `npm run setup-refs:test` | pass | `5/5 setup-refs checks passed` |
| `npm run init-prepare-interop:test` | pass | `38/38 init/prepare interoperability checks passed` |
| `npm run checkpoint-approval:test` | pass | `9/9 check-lifecycle phase-gate cases correct` |
| `npm run setup-validator-definitions-root:test` | pass | `3/3 setup-validator definitions_root cases correct` |
| `npm run tuning-merge:test` | pass | `15/15 tuning-merge assertions passed` |
| `npm run commit-coverage:test` | pass | exit 0 |
| `npm run domain-placeholders:test` | pass | `5/5 domain-placeholder checks passed` |
| `npm run agents-md:test` | pass | `20/20 AGENTS.md fallback checks passed` |
| `node test/run-mutation-audit.mjs` (full) | pass | `0/226 rules undefended`, 30 validators. Run at Build; re-run targeted after F3 (`0/8`, rule count unchanged, so F3 added no assertion) |
| `AGENTSMYTH_HOME=src/workflow node …/check-open-items.mjs` | pass | live `25 open, 0 done, 0 blocked, 0 deferred`; archive `70 archived — 95 item(s) across both files` |

Fourteen suites plus the ledger check and the ratchet. Thirteen of the fourteen are the exact set
`.github/workflows/release.yml` invokes; `npm run build` is the fourteenth and is what makes the rest
describe the shipped bundle rather than the source alone.

## Manifest Coverage

| Manifest ID | How Verified | Evidence | Result | Notes |
|---|---|---|---|---|
| R1 | command | `check-open-items.mjs` → `25 open, 0 done` | pass | Non-`done` counts are the 22 measured pre-sweep plus Phase 4's 3. |
| R2 | command | `check-open-items.mjs` validates `open-items-archive.yaml` as `kind: open-items-archive`, 70 items | pass | Flat file per Q1; no `archive/` directory exists and no second schema file was added. |
| R3 | command | `npm run validate` exit 0 with the closed object in force; probe rejects `made_up_key` | pass | All 39 pre-existing `resolution` values validate; an undeclared key now fails. |
| R4 | review | `follow-up-owner-assigner/SKILL.md` Workflow 7–8, Exit Gate, Determinism Rules | pass | Structural — no validator reads skill prose for this. Reviewed in the review artifact. |
| R5 | command | `violations:test` 215/215 (5 new rejection fixtures); `conformance:test` 49/49 (1 positive control) | pass | Each fixture asserts its own rule's wording, not a shared prefix or a filename. |
| R6 | manual | `verify-sweep.mjs` — see Manual QA | pass | The one requirement no configured command can settle. |
| R7 | command | `grep -rn "append-only" src/workflow/skills/follow-up-owner-assigner/` → no output | pass | Seven surfaces swept. The one surviving repo-wide hit is about the checkpoint union list. |
| R8 | command | `check-open-items.mjs` → `25 open`; OI-1..OI-95 contiguous, no duplicates | pass | OI-95 filed `source: requirement` with `manifest_ids: [RI6]`. |
| RI1 | command | `ls src/workflow/schemas/*.yaml` → 12, unchanged | pass | One schema, two-value `kind`; `schemaRegistry()` unmodified. |
| RI2 | command | full audit `0/226 rules undefended`; targeted `0/8` after F3 | pass | 221 → 226 = exactly the five new errors. Nothing regressed. |
| RI3 | command + manual | `npm run validate` and `npm run violations:test` exit 0, plus the Manual QA item | pass | Both commands `verification.yaml` marks required, at the phases it names. |
| RI4 | command | `git diff --stat package.json` → 0 lines; `r22-every-suite-runs-in-ci` passes | pass | No new `*:test` script, so neither workflow file needed editing. |
| RI5 | command | `validate` green against the un-swept ledger at Phase 2; `r20-open-items-legacy-no-archive-ok` passes | **partial** | Delivered except F2's tightening — see Findings and Skipped Checks. Does not block ship. |
| RI6 | command | `gt-open-items-archive-holds-open` rejects an unresolved item in the archive | pass | Never-read-for-work is prose, as assumption A4 scoped it. |
| RI7 | command | `diff` source vs build-synced schema → identical; `open-items-archive` ×15 in `dist/workflow-bundle.md` | pass | Re-run after F1/F3, so the bundle matches the final source. |
| RI8 | review | `git diff package.json` → empty; CHANGELOG carries the entry, date untouched at 2026-09-08 | pass | Date deliberately not corrected — a release-dispatch step, not this chain's. |

Sixteen rows, one per active ID. Fifteen `pass`, one `partial`, none `fail`, none `skip`, none `waived`.

## Manual QA

One item. `verification.yaml` sets `manual_qa.use_when_commands_cannot_prove_requirement: true`, and R6
is exactly that case: no configured command can establish that rewriting a 95 KB durable record lost
nothing.

- **Scenario**: the Phase 5 sweep moves 70 closed items out of the live ledger and into a new archive,
  splitting closure prose out of `next_action` for 24 of them. Verify that no item, field or character
  was lost, invented, or altered other than the two changes the requirement sanctions.
- **Environment**: `feat/wp-r20-ledger-closure` at the post-Review tree; Node v24.11.0; a pre-sweep copy
  of `open-items.yaml` taken before any write; the repository's own `lib.mjs` `loadYaml` as the parser,
  so the comparison is made by the same code the validators use rather than by a second implementation.
- **Steps**: (1) load the pre-sweep copy, the live ledger and the archive; (2) assert the id sets
  partition exactly — every id in exactly one file, none appearing from nowhere, none lost; (3) assert
  `done` routes to the archive and every other status to the live file; (4) assert every non-`done` item
  is byte-for-byte identical to its pre-sweep self; (5) for each archived item, assert every field is
  unchanged except the sanctioned pair, and that `closed_in_run` is present; (6) for the 24 split items,
  rejoin `next_action` with `resolution` and assert the result equals the original `next_action`
  character-for-character.
- **Expected**: 95 items before; 25 live and 70 archived after; 39 carried with an existing
  `resolution`, 24 split, 7 with neither; zero characters consumed; no failures.
- **Observed**:

```
items before            : 95
live after              : 25
archive after           : 70
archived, resolution carried unchanged : 39
archived, closure prose split out      : 24
archived, closure never recorded       : 7
separator chars consumed by splits     : 0
no loss detected: every id accounted for, every field preserved, every split reconstitutes
```

- **Outcome**: pass.
- **Evidence**: the script is `verify-sweep.mjs` in this session's scratchpad, re-run against the final
  post-Review files and exiting 0. Its assertions were read as part of Review rather than trusted from
  its summary line — a checker that prints "no loss detected" while asserting nothing would look
  identical. Two earlier revisions of the sweep were rejected by inspection rather than by this script:
  a marker matching `Done` used as a Notion status value, and a trim dropping the full stop on 21 of 24
  entries. Both are recorded in the task artifact's Phase 5 section.
- **Manifest IDs**: R6, RI3.

## Generated Output Evidence

`generated_output_policy.require_regeneration_or_waiver_when_source_changes: true`, and `src/workflow/`
changed, so regeneration is owed rather than optional.

| Generated path | Source | Method | Result |
|---|---|---|---|
| `workflow/schemas/open-items.schema.yaml` | `src/workflow/schemas/open-items.schema.yaml` | `npm run build`, then `diff` | identical — pass |
| `dist/workflow-bundle.md` | `src/workflow/**` | `npm run build`, then `grep -c "open-items-archive"` → 15 | pass — the change reached the shipped bundle, not only the source |

Both are gitignored, so neither appears in `git status` and a source-only inspection would have proven
nothing about what a consumer installs. `release.yml` rebuilds at publish time, so the local build is a
development convenience; the grep is what confirms the bundle actually carries the new content.

## Findings

One, carried from Review rather than newly found here.

- **F2 (P2, resolved-as-documented)** — `additionalProperties: false` on the item object is a tightening.
  A consumer ledger carrying an agent-invented key other than `resolution` will now fail where it
  previously passed, and RI5's acceptance was that upgrade is a no-op. Not eliminable: removing the
  closure undoes the central defect fix, and `lib.mjs`'s `x_enforcement: warn-until-<version>` deferral
  is honoured only on a schema-valued `additionalProperties`, never the boolean form. Named in the
  CHANGELOG so a consumer meets it as documentation. This is why RI5 is `partial` above and why Sign-Off
  is not a clean `ship` on a clean sheet.

## Skipped Checks

| Check | Why Skipped | Risk | Owner | Blocks Ship | Manifest IDs |
|---|---|---|---|---|---|
| An upgrade rehearsal against a real consumer ledger carrying an undeclared key other than `resolution` | No such ledger exists to test against. The only real corpus is this repository's own, and its one invented key is `resolution`, which is now declared — so the fixture would have to be hand-authored, and a hand-authored ledger only proves the schema rejects what it says it rejects, which the `made_up_key` probe already shows | F2's tightening remains unquantified beyond "expected nil". A consumer hitting it sees a clear error naming the key, not silent corruption | user | no | RI5 |
| Independent review by a second reader over a disjoint risk-category partition | The Review council was applicable (`on-for-complex`, task class Complex) and refused, because this session's `dispatch.enabled` resolves to `disabled`. One reader held all ten categories | The three findings were all raised by the same reader who wrote the diff. That is the specific weakness a council exists to remove, and it is not measurable from inside | user | no | all |

Two skipped checks, each with all six fields `verification.yaml` requires. Neither blocks ship, and
neither is presented as covered.

## Architecture Notes

- role: Senior QA
- decision: every automated check was re-run at this phase rather than cited from Build. Review changed
  two source files after Build's suite run, so Build's green was evidence about a tree that no longer
  existed. Citing it would have been the "assertion that can only confirm what it already assumes"
  failure this chain already hit once at Phase 1.
- decision: `npm run build` is recorded as an automated check in its own right, not as setup. Without it
  the other thirteen describe source rather than the bundle a consumer installs — and `dist/` is
  gitignored, so nothing else would have caught a stale bundle.
- constraint: the manual QA item is the *only* evidence for R6, and its value rests on its assertions,
  not its summary line. Read them before trusting the outcome; a script printing "no loss detected"
  while asserting nothing is indistinguishable from one that works.
- constraint: RI5 is `partial`, not `pass`. The temptation is to call it `pass` because the documented
  behaviour is now correct, but the requirement said no-op and the outcome is no-op-with-one-exception.
- downstream — Ship: recommendation is `ship`. Four outward actions remain unperformed and unauthorized
  (commit, push, PR into `release/1.1.0`, Notion). This merge does **not** close 1.1.0 — WP-R24 is still
  outstanding. Do not pre-bump `package.json`: `release.yml` runs `npm version` itself.
- downstream — Reflect: five residual-risk items and three ledger candidates are carried in the review
  artifact. The `check-waivers` double false positive, the bare-invocation trap, and the `schema_globs`
  glob near-miss all need open items, or they stay in closed artifacts with no owner.

## Sign-Off

- Verifier: agent (Senior QA role), single-agent — Review council refused, `dispatch-disabled`
- Date: 2026-09-13
- Recommendation: `ship`

Fifteen of sixteen requirements `pass` and one is `partial` with its shortfall documented, owned and
non-blocking. Every configured required command passed at this phase against the final tree, the
mutation ratchet is unmoved at 0 undefended, and the one requirement no command can settle has a manual
item with all seven fields and a zero-loss result.

`ship` rather than `hold-with-waiver`: nothing here needs waiving. RI5's shortfall is a documented,
accepted tightening recorded as a finding and a skipped check, not an unmet gate — and no waiver would
make the two skipped checks performable.

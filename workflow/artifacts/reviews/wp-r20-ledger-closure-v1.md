---
slug: wp-r20-ledger-closure
version: 1
artifact: review
status: ready-for-next-phase
created: 2026-09-13
updated: 2026-09-13
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, R8, RI1, RI2, RI3, RI4, RI5, RI6, RI7, RI8]
upstream:
  - workflow/artifacts/briefs/wp-r20-ledger-closure-v1.md
  - workflow/artifacts/plans/wp-r20-ledger-closure-v1.md
  - workflow/artifacts/tasks/wp-r20-ledger-closure-v1.md
orchestration:
  phase: review
  status: ready-for-next-phase
  next_phase: test
  blockers: []
  user_checkpoint: none
council:
  mode: refused
  refusal_reason: dispatch-disabled
  resolution:
    dispatch_enabled: disabled
    council_enabled: on-for-complex
    task_class: complex
---

# WP-R20 — Open-Items Ledger Closure Lifecycle - Review

## Findings

Three findings, all **resolved in place** during Review and re-verified. Ordered by severity.

### F1 — P2 — `lifecycle-ship` step 4b now greps half the `OI-<n>` space

- Path: `src/workflow/skills/lifecycle-ship/SKILL.md`, step 4b
- Manifest ID: R7
- Risk category: contract, maintainability
- Problem: Ship's identifier-reconciliation step tells the agent to "grep the identifier spaces the
  merge touched, confirm each ID still names one thing", naming `open-items` entries claiming one
  `OI-<n>` as its first example. With the ledger split, grepping `open-items.yaml` alone leaves every
  rotated ID unchecked — and the mechanism this change introduces makes that *more* likely to matter,
  not less: the live file is now the lean working file, which is precisely why a number gets taken
  twice. R7 covers any doc describing this ledger, and this one describes how to search it, so this is
  a missed sweep surface rather than a scope expansion. The surrounding files were swept; this one was
  not reached because the earlier grep for `open-items` matched it on a different line.
- Fix: step 4b now states the ledger is two files and both must be grepped together, with the reason.
- **Resolved.** Plan amended to add the file to Phase 6's Touches and the Repo Impact Map, with the
  amendment and its reason recorded beside both — the plan carries an approval, so the addition is
  visible rather than absorbed.

### F2 — P2 — the closed object is a tightening, and RI5 promised a no-op upgrade

- Path: `src/workflow/schemas/open-items.schema.yaml`, `CHANGELOG.md`
- Manifest IDs: RI5, R3
- Risk category: compatibility
- Problem: RI5's acceptance is that upgrade is a no-op for a repo that has never rotated, and the
  change delivers that for every part of itself *except one*. `additionalProperties: false` on the item
  object means a consumer ledger carrying any agent-invented key now fails where it previously passed.
  This is not hypothetical: `resolution` reached 39 of this repo's own 92 entries precisely because
  agents invent keys when the schema gives them nowhere to write something, and that is the evidence
  that another repo could have invented a different one. `lib.mjs`'s `x_enforcement: warn-until-<version>`
  deferral exists for exactly this class of upgrade break — but it is honoured only on a *schema-valued*
  `additionalProperties`, never on the boolean form, so it cannot be used here. The CHANGELOG described
  the closure as a fix and did not name it as the one behavioural tightening in the release.
- Fix: the CHANGELOG bullet now names it explicitly — what changes, why the expected impact is nil
  (`resolution` was the only such key in practice and is now declared), and that a failure names the
  offending key exactly.
- **Resolved as documented, not eliminated.** Removing the closure would undo the central defect fix,
  and deferring it is not available. Carried as residual risk below.

### F3 — P3 — the upgrade conditional keyed on parse success, not on the file existing

- Path: `src/workflow/validators/check-open-items.mjs`
- Manifest IDs: R5, RI5
- Risk category: verification
- Problem: the rule is documented, in the validator's own header and in `validators/README.md`, as
  firing "only once an archive file exists". The code read `if (archive)` — the *parsed document*. With
  an archive present but malformed, `loadLedger` returns `null`, so the un-rotated items went
  unreported. Nothing passed wrongly, because the kind error already failed the run; the cost is
  diagnostic. A reader saw one problem, fixed it, re-ran, and was handed a second that had been true
  all along. Verified before fixing: the probe reported 1 issue where 2 were present.
- Fix: `if (pathExists(archivePath))`. Re-probed: the same fixture now reports both.
- **Resolved.** Confirmed no new rule was introduced — the mutation audit still measures
  `check-open-items.mjs` at 8 rules, 0 undefended, so this changed a condition rather than adding an
  assertion needing its own fixture.

## Severity Summary

| Severity | Open | Found | IDs | Status |
|---|---|---|---|---|
| P0 | 0 | 0 | — | — |
| P1 | 0 | 0 | — | — |
| P2 | 0 | 2 | F1, F2 | both resolved in place; F2 resolved as documented, carried as residual risk |
| P3 | 0 | 1 | F3 | resolved in place, fix re-probed |

**Council refused, not absent.** `council.enabled` is `on-for-complex` and this chain is Complex, so a
two-reviewer council was applicable. The operating session forbids subagent dispatch, which resolves
`dispatch.enabled` to `disabled` — the first check in the mode-resolution order. Recorded as
`mode: refused` with `refusal_reason: dispatch-disabled` rather than left silent. All ten risk
categories in `references/review-risk-categories.md` were therefore held by one reviewer; the coverage
consequence is stated under Residual Risk rather than presented as equivalent to a council.

## Requirement Coverage

| Manifest ID | Evidence | Status | Notes |
|---|---|---|---|
| R1 | `check-open-items.mjs` reports `25 open, 0 done, 0 blocked, 0 deferred` | covered | Non-`done` counts unchanged from the 22 measured pre-sweep, plus the 3 filed in Phase 4. |
| R2 | `workflow/artifacts/open-items-archive.yaml`, `kind: open-items-archive`, 70 items | covered | Flat file per Q1. No `archive/` directory, no second schema file. |
| R3 | `npm run validate`; probe rejecting an undeclared key | covered | All 39 pre-existing `resolution` values validate under a closed object; the 40th would fail. |
| R4 | `src/workflow/skills/follow-up-owner-assigner/SKILL.md` Workflow 7–8, Exit Gate, Determinism Rules | covered | Sweep added after the append. Never-sets-`status` asserted at three sites. |
| R5 | 5 rejection fixtures + 1 positive control, `violations:test` 215/215, `conformance:test` 49/49 | covered | Each fixture asserts its own rule's wording. F3 corrected the conditional's guard. |
| R6 | `verify-sweep.mjs` via `lib.mjs` `loadYaml`: 0 characters consumed | covered | 70 moved, 0 lost, every field preserved, every split reconstitutes. |
| R7 | `grep -rn "append-only"` over the skill and its references returns nothing | covered | Seven surfaces swept, including `lifecycle-ship/SKILL.md` added via F1. |
| R8 | `check-open-items.mjs` `25 open`; OI-1..OI-95 contiguous | covered | OI-95 filed as `source: requirement` with `manifest_ids: [RI6]`, per the schema's own enum semantics. |
| RI1 | `ls src/workflow/schemas/*.yaml` → 12, unchanged | covered | One schema, two-value `kind`. `schemaRegistry()` needed no change. |
| RI2 | Full audit `0/226 rules undefended`, 30 validators | covered | 221 → 226 = exactly the five new errors. Nothing regressed despite the sweep removing 70 entries. |
| RI3 | `npm run validate`, `npm run violations:test`, plus the manual no-loss item | covered | Both configured commands, at the phases `verification.yaml` names. |
| RI4 | `git diff package.json` empty; `r22-every-suite-runs-in-ci` passes | covered | No new `*:test` script, so neither workflow file needed touching. |
| RI5 | `npm run validate` green against the un-swept ledger at Phase 2; `r20-open-items-legacy-no-archive-ok` | partial | Delivered except for F2's tightening. Documented, not eliminated — see Residual Risk. |
| RI6 | `gt-open-items-archive-holds-open` fixture; schema description | covered | The archive-holds-closed-only rule is mechanical; never-read-for-work is prose, as A4 scoped it. |
| RI7 | `diff` source vs build-synced schema → identical; `open-items-archive` ×14 in `dist/workflow-bundle.md` | covered | Rebuilt after the F1/F3 edits as well, not only the first time. |
| RI8 | `git diff package.json` empty; CHANGELOG entry with date untouched | covered | Entry reads 2026-09-08 and today is 2026-09-13 — deliberately left; correcting it is a release-dispatch step. |

Sixteen of sixteen have a row. **RI5 is `partial`**, and that is a finding (F2) rather than a silent
gap: it is the only requirement this change does not fully satisfy, the shortfall is one narrow
tightening, and it is recorded in the CHANGELOG so a consumer meets it as documentation rather than as
a surprise.

## Architecture Notes

- role: Staff Reviewer
- decision: F2 is resolved *as documented* rather than by removing the closure. The closure is the
  central defect fix — the cause of 39 undeclared keys is that the object was open — and the engine's
  deferral mechanism is unavailable on the boolean form. Undoing it to protect a hypothetical consumer
  key would trade the actual defect for a possible one.
- constraint: the `done`-in-live conditional must not be made symmetric with
  `check-finding-quality.mjs`. Now stated in the validator's header, in `validators/README.md`, and
  defended by `r20-open-items-legacy-no-archive-ok`. Three places, because a comment alone did not stop
  the analogous rule drifting before.
- constraint: F3's guard is `pathExists`, not the parsed document. A later refactor that "tidies" it
  back to `if (archive)` reintroduces a diagnostic gap no fixture catches, because both forms fail the
  run — only the error count differs.
- downstream — Test: R6 is the one requirement no configured command settles. The manual-QA item needs
  all seven `verification.yaml` fields; "the validator passed" is not evidence that nothing was lost.
  Test should also re-run the full suite list rather than trusting Build's run, since F1 and F3 changed
  source after it.
- downstream — Ship: this merge does not close 1.1.0 — WP-R24 remains outstanding. Do not pre-bump
  `package.json`. The Notion page move and recording that Q1 superseded the page's R2 are user actions.
- downstream — Reflect: three items belong in the ledger — the `check-waivers` double false positive,
  the bare-invocation trap, and the `schema_globs` glob near-miss. All three are recorded in upstream
  artifacts, and a risk that lives only in a closed artifact has no owner.

## Verification Reviewed

| Item | Outcome | Notes |
|---|---|---|
| `npm run validate` | pass | Exit 0, re-run after the F1/F3 fixes and the rebuild, not only at Build handoff. |
| `npm run violations:test` | pass | 215/215, up from 210. Five new fixtures, each matched on its own rule's wording. |
| `npm run conformance:test` | pass | 49/49, up from 48. Includes the RI5 positive control. |
| Full mutation audit | pass | `0/226 rules undefended`, 30 validators. Re-run targeted after F3: still 8 rules / 0 undefended, so no rule was added. |
| All 13 `release.yml` suites | pass | Every one exit 0 at Build handoff. Test must re-run them, since F1/F3 landed after. |
| `verify-sweep.mjs` no-loss check | pass | Independent reconstruction through `lib.mjs` `loadYaml`; 0 characters consumed. Inspected the script, not just its output. |
| Split-boundary inspection, 24 cases | pass | Two genuine errors caught by inspection and both fixed before the final run — a loose marker matching `Done` as a status value, and a trim dropping 21 full stops. Recorded honestly in the task artifact rather than presented as first-time-right. |
| Bare vs `AGENTSMYTH_HOME` validator invocation | pass | The void first result is recorded in Command Results as "void — not a result" rather than deleted. Reviewed as the right call: a green line proving nothing is the failure this phase produced. |
| `git status --short` | pass | 25 paths, all mapping to a Repo Impact Map row or this chain's own artifacts. Nothing staged or committed. |

## Residual Risk

1. **F2's tightening (RI5 `partial`).** `additionalProperties: false` will fail a consumer ledger
   carrying an agent-invented key other than `resolution`. Expected impact nil — `resolution` is the
   only such key observed, across the one real corpus available — but it is a real behavioural change
   in a release whose own work plan constrains it to "new optional fields with safe defaults, no
   required-schema change". Now named in the CHANGELOG. Owner: user, at release. Does not block ship.
2. **One reviewer held all ten risk categories.** The council was applicable and refused, so the
   coverage a second independent reviewer over a disjoint partition would have given does not exist.
   The three findings here were all found by the same reader who wrote the code, which is the specific
   weakness a council addresses. Not recorded as a skipped check, because no category went unassigned —
   but it is not equivalent to a council and is not presented as one.
3. **Two validator false positives worked around rather than fixed.** `check-waivers` rejected this
   chain's own prose twice, once for quoting a schema enum description and once for a sentence whose
   entire content is that there are no waivers. Both worked around by rewording. The heuristic has
   previously caused a real CI failure, so this is a third and fourth data point. Owner: workflow owner.
4. **A bare validator invocation silently validates against the global install.** Recorded in full in
   the task artifact. `validators/README.md` documents the bare form, so in this repo a developer
   following the README can get a green result that says nothing about their edit. Owner: workflow owner.
5. **`closed_in_run` is `unrecorded` for 65 of 70 archived items.** True rather than convenient — the
   closing chain is not recoverable from the prose for most of them — but it means the field's migration
   value is unproven until entries closed under the new contract accumulate. Owner: workflow owner.

## Recommendation

`pass-with-risk`

Three findings, all resolved and re-verified; no finding is open. The qualifier is F2: RI5's acceptance
was that upgrade is a no-op, and it is a no-op in every respect but one narrow tightening that cannot be
deferred with the mechanism the engine provides and should not be removed, because it is the fix. A clean
`pass` would report a promise as fully kept when it is kept with a documented exception.

The second reason for the qualifier is item 2 above. A single reader reviewed their own diff across all
ten risk categories. That found three real defects, which is better than nothing and is not the same as
independent review.

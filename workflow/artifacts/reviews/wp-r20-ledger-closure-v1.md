---
slug: wp-r20-ledger-closure
version: 1
artifact: review
status: ready-for-next-phase
created: 2026-09-13
updated: 2026-09-15
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
  deferral exists for exactly this class of upgrade break, and it **is** reachable here: written as
  `additionalProperties: {x_enforcement: warn-until-1.2.0, enum: []}` the sub-schema is unsatisfiable for
  every value (`lib.mjs:671`) and the marker is honoured (`lib.mjs:825`), so every undeclared key would
  land in `deferredWarnings` instead of `errors`. It is declined rather than unavailable. A warn window
  reopens the precise hole this change closes: `resolution` reached 39 of 92 entries **by validating
  silently**, and a key that only warns is a key that validates silently for another release. The
  CHANGELOG described the closure as a fix and did not name it as the one behavioural tightening in the
  release.
- Fix: the CHANGELOG bullet now names it explicitly — what changes, why the expected impact is nil
  (`resolution` was the only such key in practice and is now declared), and that a failure names the
  offending key exactly.
- **Resolved as documented, not eliminated.** Removing the closure would undo the central defect fix,
  and deferring it is available but self-defeating. Carried as residual risk below.

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

## Review Pass 2 (2026-09-15)

An independent pass ran the full suite, a scoped mutation audit, and a from-scratch migration
reconstruction against `86b4e7b`. It confirmed the change and the numbers, and returned five items.
Design was explicitly not reopened: the two-file split, the flat archive, the optional
`resolution`/`closed_in_run`, and the boolean `additionalProperties: false` all stand.

One of the five is a correction to **this artifact's own F2**, which is recorded below rather than
appended to F2 as a caveat — F2's *finding* was right and its *reason* was wrong, and a reason that
is wrong is rewritten, not annotated.

### R1 — BLOCKING — the base advanced and OI-93 collided

- Path: `workflow/artifacts/open-items.yaml`
- Risk category: process / data integrity
- Problem: `release/1.1.0` moved to `c54d719` when PR #68 merged. Both branches had independently
  allocated `OI-93`, each with `first_seen_run: wp-r23-agents-md-fallback-v1` — this branch to the
  OI-87 scope reconciliation, the base to the `check-setup-complete.mjs` marker-stamp item raised by
  the WP-R23 review pass 2.
- Fix: merged (not rebased). This branch's OI-93 through OI-104 are unchanged; the base's OI-93 is
  taken in full as **OI-105**, appended after OI-104 with its `next_action` preserved verbatim
  including the WP-R18 filing note. Nothing already issued was renumbered. `OI-106` files the
  follow-up on step 4b itself.
- Evidence: `check-open-items` reports `36 open, 0 done, 0 blocked, 0 deferred` live, 70 archived,
  `106 item(s) across both files`, no duplicate-id error. Merge commit `1ff5a3d`.
- **Note on the expected figure.** The pass asked for confirmation of **47 live items**. The measured
  number is **36**, and 36 is correct: the merge base carried 92 items, this branch rotated 70 of them
  into the archive and added OI-93..OI-104, and the merge added OI-105 and OI-106 — 34 + 2 live, 70
  archived, 106 total. 47 does not correspond to any state of either side. Recorded rather than
  quietly satisfied, because a count nobody can reconstruct is the failure mode this whole change
  exists to remove.
- **What step 4b got wrong, and it is in this PR.** F1 amended step 4b to grep both ledger files. The
  step also asserts that this collision class "merges clean and silently". Here git *did* raise a
  content conflict — both sides appended at the same offset in the same file. That is placement luck,
  not detection: a base appending elsewhere, or an ID allocated into the archive half, merges clean
  exactly as the step warns. OI-106 carries the question of whether step 4b should separate the two
  cases, so a reader does not generalise from this instance that git catches the class.

### R2 — `check-open-items` printed a detail that contradicted its own error

- Path: `src/workflow/validators/check-open-items.mjs`
- Manifest IDs: R5, RI5
- Problem: F3 moved the *rotation rule* from the parsed `archive` object to `pathExists(archivePath)`.
  The **details block** was left keyed on the parsed object. An archive that exists but fails its kind
  or schema check therefore produced a run that said, in order: the archive is present with the wrong
  kind; this repo has never rotated, so a `done` entry is not an error here; and this `done` entry is
  an error. Two of those three cannot both hold, and the false one was the reassuring one.
- Reproduced before fixing, with a wrong-`kind` archive beside `gu`'s live ledger — all three lines
  present in one run.
- Fix: the details block is now guarded on `pathExists(archivePath)`, matching the rule it explains.
  A file that exists but did not parse reports `read <path> but it did not parse as an archive (its
  own error is reported below), so its items are uncounted: 0 archived` — the same `archiveItems.size`
  the healthy branch reports, without claiming a schema check that did not happen.
- No new error, so `check-open-items` stays at **8 rules**.
- Fixture: `gu2-open-items-done-not-rotated-malformed-archive`. It needed a capability the violations
  harness did not have — `expect` can only assert that a string is *present*, and the contradiction
  was an *extra* line alongside a correct error, so every existing fixture passed throughout. The
  harness now takes a `reject` field, a substring the output must not contain. Confirmed as a real
  regression test: with the guard reverted to `archive`, `gu2` fails `[WRONG] ... the output also
  contradicts it` and the suite drops to 215/216.

### R3 — the `follow-up-owner-assigner` refusal condition was unevaluable

- Path: `src/workflow/skills/follow-up-owner-assigner/SKILL.md`, `references/output-schema.md`
- Manifest IDs: R4, R7
- Problem: the condition read "the live ledger holds a `done` item whose `status` you cannot confirm
  was set by someone else." Nothing in the schema records *who* set a `status`; the skill reads both
  files fresh at step 4 and never writes `done`. So the rule was either dead (every `done` was set
  elsewhere) or total (attribution is never confirmable) — and the total reading contradicts Workflow
  step 7, which says to move every `done`. OI-103 records that the sweep has never moved a real item,
  which makes an agent hitting Refusal before Workflow the most likely first-run failure.
- Fix: the condition is scoped to the invocation and anchored to the step 4 read — refuse only when
  moving an item would require *setting* `status: done` first. "Who closed it" is replaced by "was it
  already `done` when I read the file", which the read answers. Workflow step 7 is anchored to the
  same read and now says so explicitly. The Determinism Rule "Never change an item's `status`" is
  untouched.
- `references/ledger-format.md` needed no change — "It moves items whose `status` is already `done`;
  it never sets that value, in either direction" was already the correct framing. `output-schema.md`
  did not carry the old framing either, but its `overall: fail` list named only two of the four
  refusal conditions, so an unmovable item had no way to be *reported*: the same defect one level out.
  Added.

### R4 — the one upgrade-breaking change was untested in both directions

- Path: `test/fixtures/conformance/open-items-legacy-no-archive/`, `test/fixtures/lifecycle-violations/gv-open-items-undeclared-key/`
- Manifest IDs: RI5
- Problem: `additionalProperties: false` is enforced by the schema engine, not by a rule in this
  validator. `check-open-items` has no `errors.push(` for it, so its `0/8` says nothing about the one
  change in this PR that can break a consumer.
- Fix, positive direction: the legacy no-archive conformance fixture now carries `resolution` on a
  `done` item. It is the key that made this change necessary and it was absent from the fixture that
  proves the change is a no-op — a legacy ledger cleaner than any that actually exists. The existing
  assertion `1 open, 2 done, 0 blocked, 0 deferred` is unchanged and still passes.
- Fix, rejection direction: `gv-open-items-undeclared-key` carries an invented `outcome` key and
  asserts the exact wording, `items[0].outcome is not allowed`. The wording is the mitigation — it
  names the offending key, which is what makes a consumer's failure a one-line fix.
- **Whether the audit counts it as a rule: it does not, for this validator.** `run-mutation-audit.mjs`
  enumerates `errors.push(` sites per file. The boolean-`additionalProperties` error is
  `lib.mjs:766`, inside `lib.mjs`'s own 13-rule set, which the baseline already records at 0
  undefended. `check-open-items.mjs` stays at **8**, `lib.mjs` stays at **13**, and `gv2` adds a
  second defender for an already-defended rule rather than a new one.

### R5 — "cannot be deferred" was false, and it was load-bearing

- Path: `CHANGELOG.md`, `workflow/artifacts/open-items.yaml` (OI-102), this artifact (F2),
  `workflow/artifacts/verify|ship|reflect/wp-r20-ledger-closure-v1.md`
- Manifest IDs: RI5
- Problem: F2, OI-102, the verify finding and the reflect "surprise" all stated that
  `x_enforcement: warn-until-<version>` is honoured only on a schema-valued `additionalProperties`
  and therefore could not be used here. The first half is true; the conclusion is not. Written as
  `additionalProperties: {x_enforcement: warn-until-1.2.0, enum: []}` the sub-schema is unsatisfiable
  for every value (`lib.mjs:671`) under a marker the engine honours (`lib.mjs:825`), so every
  undeclared key routes through `deferredWarnings` instead of `errors`. That is a warn window in
  every respect that matters.
- Verified directly rather than argued: calling `validateSchema` on an object with an undeclared key
  gives `["probe.outcome is not allowed"]` for `additionalProperties: false`, and `[]` for
  `{x_enforcement: warn-until-1.2.0, enum: []}` — the same sub-schema without the marker returns
  `probe.outcome expected one of , got "invented key"`, which is what confirms the empty `enum` is
  what rejects and the marker is what defers.
- Fix: the schema does not change — the boolean form stays. Every statement of the claim is rewritten
  to say that deferral is **mechanically available and was declined on design grounds**: a warn window
  reopens the exact hole this change closes, because `resolution` reached 39 of 92 entries *by
  validating silently*, and a key that only warns is a key that validates silently for another
  release. That reason is stronger than the one it replaces, which is the point — the chain defended
  a correct decision with an impossibility that was not one.
- RI5 stays `partial`. The acceptance was a no-op upgrade; a declined deferral is still a tightening.
- The CHANGELOG bullet named the tightening and then closed with a bold **"Upgrade is a no-op"**,
  which is the sentence a skimmer keeps. Now **"Upgrade is a no-op except for the tightening above"**.

### Review Pass 2 — Severity Summary

| ID | Severity | Disposition |
|---|---|---|
| R1 | P1 (blocking) | Fixed — merged, OI-105/OI-106 allocated, expected-count discrepancy recorded |
| R2 | P2 | Fixed — guard corrected, `gu2` fixture + `reject` harness support, verified by reversion |
| R3 | P2 | Fixed — refusal scoped to the step 4 read; `output-schema.md` made able to report it |
| R4 | P2 | Fixed — both directions covered; baseline unchanged, and why is recorded |
| R5 | P2 | Fixed — claim rewritten in six places; mechanism verified by direct probe |

### Review Pass 2 — Recommendation

`ship`. No design change, no schema change, no new validator error, and the mutation ratchet is
unmoved. The material residual risk is still F2's tightening, now carrying a reason that is true.

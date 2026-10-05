---
slug: wp-r23-agents-md-fallback
version: 1
artifact: reflect
status: done
created: 2026-09-13
updated: 2026-09-13
manifest_ids: [R1, R2, R3, R4, R5, R6, RI1, RI2, RI3, RI4, RI5, RI6, RI7]
upstream:
  - workflow/artifacts/briefs/wp-r23-agents-md-fallback-v1.md
  - workflow/artifacts/plans/wp-r23-agents-md-fallback-v1.md
  - workflow/artifacts/tasks/wp-r23-agents-md-fallback-v1.md
  - workflow/artifacts/reviews/wp-r23-agents-md-fallback-v1.md
  - workflow/artifacts/verify/wp-r23-agents-md-fallback-v1.md
  - workflow/artifacts/ship/wp-r23-agents-md-fallback-v1.md
orchestration:
  phase: reflect
  status: done
  next_phase: done
  blockers: []
  user_checkpoint: none
---

# WP-R23 — Generic AGENTS.md Adapter Fallback - Reflect

## Inputs

Full chain for `wp-r23-agents-md-fallback-v1`: brief (approved at brief-review), plan (approved at
plan-review, amended once during Build), task (six phases plus one post-Review fix pass), review
(`pass`, two findings both resolved), verify (`ship`, 12 pass / 1 skip / 0 fail), ship (`ship`,
approved at ship-review for the decision and transition only).

## Outcome

`init` now owns root `AGENTS.md`, writing a version-stamped block it locates by pattern so a later
release can find, replace and migrate a block an earlier release wrote. Codex's per-repo adapter
placement is subsumed by the same block. The block names the pre-commit hook — resolved per repo, so
it names the file that exists — and tells a freshly-initialised repo to run setup first.

**Nothing has been committed, pushed, merged or released.** The ship-review approval covered the ship
decision and the transition to Reflect. All four outward actions remain open and are carried as
follow-ups below.

Chain shape worth recording: seven phases of work for a change of 166 insertions across 8 files. The
cost was not in writing the code — it was in the two defects that a green gate did not catch, and both
of those were found by pressure applied from outside the gate (a user question, and the full release
suite list).

## What Worked

- **Mutation-testing every new assertion.** Both the tempered block pattern and the hardened hook-path
  check were proven load-bearing by reverting the fix and watching specific checks fail, then
  restoring and confirming byte-identical source. Without that step, "20/20 passed" would have carried
  the same weight as the earlier "13/13 passed" — which was true while user data was being destroyed.
- **Fixing the structural cause rather than the instance.** F2's cause was two places independently
  deciding where the hook lives. Extracting `resolveHooksDir()` means the writer and the advertiser
  cannot disagree again. Correcting one copy would have left the drift mechanism intact.
- **Verifying against a consumer-shaped repo rather than this one.** F2 existed precisely because
  agentsmyth sets `core.hooksPath`; verifying in-repo would have reproduced the blind spot. Test ran
  its manual QA in a scratch repo with a hand-authored `AGENTS.md` for that reason.
- **Refusing to add coverage that would not have covered anything.** The plan proposed an example
  fixture for RI6. Checking first showed `check-domain-placeholders` excludes `^examples/` and
  `validate-example.mjs` has no `AGENTS.md` handling, so the file would have been validated by
  nothing. Recorded as a skipped check with six fields instead of shipping a green tick backed by air.
- **The repo's own conformance rule caught what every per-phase gate missed.** `r22-every-suite-runs-in-ci`
  is the only reason a registered-but-unwired suite did not ship.

## What Did Not Work

- **Phase 2 was recorded complete on evidence that could not have detected the defect it contained.**
  Four exit conditions, all fed well-formed input, all passing, while an orphan `BEGIN` marker caused
  silent deletion of user content. The gate was not wrong; it was narrow, and I read a narrow gate as
  a broad one.
- **An assertion derived from the development environment.** `text.includes('.githooks/pre-commit')`
  compared against a value true only here. It is the same error shape as the above: a check that can
  only confirm what it already assumes.
- **Two plan gates that could not fail.** RI3's "`git status --porcelain dist/` is empty" on an
  ignored path, and R4's acceptance satisfied by *a* path rather than the *right* path. Both read as
  strict and measured nothing.
- **A brief that was internally complete and still had a hole.** R5 enumerated four concerns for the
  block; setup detection was not among them, so Build bounded the block exactly as specified and
  produced F1. Worse, this work is what made that instruction reachable for the first time — the old
  placement wrote it after setup had already finished.
- **A question that offered an out-of-scope detour as an option.** Assumption A3 was correctly recorded
  as non-blocking and out of scope, then presented as "does that hold, or shall I resolve them first?"
  The user took the option; the detour was built and then reverted in full. Already captured in agent
  memory as durable feedback.
- **Guessed validator filenames twice**, producing two `FAIL` lines that were not failures. Running the
  whole `src/workflow/validators/check-*.mjs` set is both faster and incapable of producing a phantom.

## Surprises

- **The old block's setup trigger had been dead text.** The pre-existing `src/assets/AGENTS.md`
  carried "if `.agentsmyth/` exists, run setup" — but the setup skill placed that file at Step 5a,
  *after* setup completed and `.agentsmyth/` was removed. The instruction could never fire in the
  arrangement that shipped it. Moving the write into `init` is what first made it meaningful, and the
  rewrite dropped it in the same change. Two separate mistakes that happened to cancel to "no worse
  than before" while looking like a regression in review.
- **A build-time edit script hit the exact hazard the runtime code was being written to guard
  against.** `String.replace` with a string replacement expands `$'` to "everything after the match";
  a comment containing that sequence spliced the rest of `bin/agentsmyth.mjs` into a function body.
- **`dist/` is gitignored and rebuilt in CI**, so the local build is a development convenience and the
  publish-time guarantee lives entirely in `release.yml` line 51. Worth knowing before writing any
  future gate that assumes `dist/` is diffable.

## Manifest Coverage Retrospective

| Manifest ID | Outcome | Evidence path | Notes |
|---|---|---|---|
| R1 | shipped | `workflow/artifacts/verify/wp-r23-agents-md-fallback-v1.md` | Creation path; `agents-md:test` A1–A2. |
| R2 | shipped | same | Idempotency and cross-version replace; the tempered pattern is the load-bearing line. |
| R3 | shipped | same | Byte preservation, including the orphan case that was genuinely broken mid-Build. |
| R4 | shipped | same | Resolved via review finding F2; hook path now resolved per repo. |
| R5 | shipped | same | 23 lines against ≤ 25; setup trigger restored inside the bound via F1. |
| R6 | shipped | same | Convention change: the one enumerated placement that is create-or-replace. |
| RI1 | shipped | same | Single writer; Codex row collapsed. Residual risk on `check-setup-complete` accepted at Q2. |
| RI2 | shipped | same | Marker convention extended, not replaced. |
| RI3 | shipped | same | Two builds, identical md5. Plan's stated gate was unfalsifiable; corrected in the task log. |
| RI4 | shipped | same | 13 suites; mutation baseline unmoved. |
| RI5 | shipped | same | Manual QA against a consumer-shaped repo. |
| RI6 | **deferred** | `workflow/artifacts/verify/wp-r23-agents-md-fallback-v1.md` Skipped Checks | Example coverage; six-field record, owner user, does not block ship. |
| RI7 | shipped | same | CHANGELOG entry; version deliberately not pre-bumped; date left for dispatch. |

Twelve shipped, one deferred, none blocked, none waived, none dropped.

## Deferred

- **RI6 — example-repo regression coverage for the marker block.** Closing it honestly requires
  teaching `validate-example.mjs` about `AGENTS.md`, which is a validator change needing its own
  rejection fixture under the mutation ratchet. Out of scope here and not proposed.

## Source-of-Truth Outcome

not applicable. `source-of-truth.yaml` declares `mode: optional` with `providers: []`, so no external
source held authority and no update was owed. The Notion WP-R23 row still reads `🟡 Ready`; moving it
is a user action, carried as a follow-up rather than claimed.

## Learning Candidates

- **Candidate learning**: A passing exit gate is evidence about the cases it encodes and nothing more.
  When a gate is derived from acceptance criteria, it inherits their blind spot — criteria describe
  intended behaviour, so malformed, interrupted and partial inputs are absent by construction, which
  is exactly where silent data loss lives. — source: `workflow/artifacts/tasks/wp-r23-agents-md-fallback-v1.md` — propose-only.
- **Candidate learning**: An assertion that compares against a value taken from the development
  repository cannot detect environment-specific defects. Prefer "extract what the artefact claims and
  check the claim holds" over "check the artefact contains the string I expect". — source: `workflow/artifacts/reviews/wp-r23-agents-md-fallback-v1.md` — propose-only.
- **Candidate learning**: Every per-phase gate can be green while the whole is broken. Run the full
  release suite list at Build handoff, not only per-phase checks. — source: `workflow/artifacts/tasks/wp-r23-agents-md-fallback-v1.md` — propose-only.
- **Candidate learning**: Before writing an exit gate, ask what observable state would make it fail. A
  gate over a gitignored path, or one satisfied by any value rather than the correct value, reads
  strict and measures nothing. — source: `workflow/artifacts/plans/wp-r23-agents-md-fallback-v1.md` — propose-only.
- **Candidate learning**: A requirement set complete against its own criteria can still have a hole.
  When a change makes a previously-unreachable instruction reachable, the brief should be re-read for
  what that new reachability now requires. — source: `workflow/artifacts/reviews/wp-r23-agents-md-fallback-v1.md` — propose-only.
- **Candidate learning**: Adding a fixture that no validator reads is negative value — it reports
  coverage that does not exist. Verify something actually inspects a fixture before writing it. — source: `workflow/artifacts/verify/wp-r23-agents-md-fallback-v1.md` — propose-only.


## Follow-Ups

| Action | Owner | Suggested Artifact Or Ticket | Status |
|---|---|---|---|
| Commit the working tree on `feat/wp-r23-agents-md-fallback` | user | Ship artifact Blocked Handoff #1 | open |
| Push the branch | user | Ship artifact Blocked Handoff #2 | open |
| Open a PR into `release/1.1.0` (never `main`) | user | Ship artifact Blocked Handoff #3 | open |
| Move the Notion WP-R23 row to Done with the PR reference | user | Ship artifact Blocked Handoff #4 | open |
| Reconcile OI-87: it describes 1.1.0 as four work packages; the user scoped it to seven (Q3), so it under-describes the release by three | user | new open item — "OI-87 under-describes 1.1.0 scope" | open |
| Resolve the Requirement Classification schema tension: the Think Exit Gate requires the table for every brief, but the starter block nests it under `## Council Log`, which single-agent briefs omit entirely | workflow owner | new open item — "Requirement Classification section is unreachable in single-agent briefs" | open |
| Decide whether `validate-example.mjs` should inspect example `AGENTS.md` files, closing RI6 properly | user | new open item — "example-repo coverage for the AGENTS.md marker block" | open |
| Have WP-R18 consume the version stamp; nothing reads it today, so its migration value is unverified | workflow owner | existing WP-R18 | open |
| Stale Notion Work Packages rows: WP-R8, WP-R11, WP-R19, WP-R22 all show statuses contradicting what is merged | user | tracker hygiene | open |

## Raw Session Entry

See `workflow/learnings/sessions/2026-09-13-wp-r23-agents-md-fallback.md`.

## Architecture Notes

- role: Project Manager
- **decision**: recording F1's origin as a brief-level gap rather than a Build defect. Build bounded
  the block to exactly the four concerns R5 named. Attributing it to Build would obscure the actual
  lesson, which is that a requirement set can be internally complete and still leave a hole.
- **constraint**: nothing in this chain was committed. Every follow-up that moves code is owned by the
  user and none was inferred from the ship-review approval — that approval was explicitly scoped to
  the decision and the phase transition.
- **downstream**: three of the nine follow-ups are new open items rather than actions, and they should
  be filed into `workflow/artifacts/open-items.yaml` before the next chain reads that ledger at its own
  Reflect. Filing them is not done here; it is listed, with owners, so it is visible rather than
  assumed.

## Exit Gate

- [x] Manifest Coverage Retrospective has one row per active R and RI.
- [x] Every follow-up has a named owner and suggested artifact title.
- [x] Learning candidates tagged propose-only.
- [x] orchestration.status: done, next_phase: done.

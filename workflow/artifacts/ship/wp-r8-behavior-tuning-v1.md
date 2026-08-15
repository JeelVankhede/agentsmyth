---
slug: wp-r8-behavior-tuning
version: 1
artifact: ship
status: blocked-for-user
created: 2026-08-15
updated: 2026-08-15
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, R8, RI1, RI2, RI3, RI4, RI5, RI6, RI7, RI8, RI9]
upstream:
  - workflow/artifacts/briefs/wp-r8-behavior-tuning-v1.md
  - workflow/artifacts/plans/wp-r8-behavior-tuning-v1.md
  - workflow/artifacts/tasks/wp-r8-behavior-tuning-v1.md
  - workflow/artifacts/reviews/wp-r8-behavior-tuning-v4.md
  - workflow/artifacts/verify/wp-r8-behavior-tuning-v2.md
orchestration:
  phase: ship
  status: blocked-for-user
  next_phase: reflect
  blockers: []
  user_checkpoint: ship-review
---

# WP-R8 — Per-Repo Behavior Tuning - Ship

## Inputs

- Verify v2 — recommendation `ship`, 17/17 requirements pass, no open findings.
- Review v4 — recommendation `pass`, F1–F9 all resolved.
- `workflow/config/release.yaml` — `release.required: false`,
  `default_recommendation_when_no_release_gate: ship`. Only two gates are required:
  `branch` (required: true) and `generated_output` (required when changed).
- `workflow/config/source-of-truth.yaml` — `mode: optional`, `default_required: false`,
  `providers: []`. No provider is configured, and
  `require_user_request_or_config_for_external_write: true`.
- Phase gate: `agentsmyth check --phase ship --slug wp-r8-behavior-tuning` → exit 0.

## Ship Status

- Recommendation: **ship** — every required gate has evidence and no unwaived blocker remains.
  `orchestration.blockers` is empty by design: what holds this artifact at `blocked-for-user` is the
  unapproved `ship-review` checkpoint, which `check-lifecycle --phase reflect` enforces separately
  and which only the user can clear. Two decisions below are the user's, and neither is a defect in
  the work.
- Review result: `pass` (v4).
- Verification recommendation: `ship` (verify v2).
- PR / CI: not required by config; none created.
- Source-of-truth: **blocked** — copy-ready handoff below. Not required by config
  (`providers: []`), but the WP-R8 Notion page is materially out of date with what shipped.
- Release: not required by config. No version bump, tag, or publish is in scope for this work
  package; 1.1.0 is released as a whole, not per work package.

The technical work is complete and verified. What stands between here and Reflect is
authorization, not engineering:

1. **The `ship-review` checkpoint is unapproved.** Per `rules.md`'s Approval section and
   `check-lifecycle --phase reflect`, this artifact cannot declare `ready-for-next-phase` until the
   user has responded to this specific ship decision in their own words.
2. **Nothing is committed.** All 49 paths are uncommitted working-tree state. Commit authorization
   has not been given at any point in this chain, and the branch strategy the user set
   (everything merges into `release/1.1.0`, `main` gets one merge at the end) has a step here that
   is theirs to trigger.

## Requirement Coverage

Every requirement's code is complete and verified locally. "Shipped" below means implemented,
verified, and present in the working tree — not committed, not merged, not published. That
distinction is the whole of blocker 2 and is stated once here rather than repeated per row.

| Manifest ID | Status | Evidence | Notes |
|---|---|---|---|
| R1 | shipped (uncommitted) | verify v2 — `check-config: ok`; unknown key rejected | — |
| R2 | shipped (uncommitted) | fixture `w-tuning-unknown-key` rejected by name | Enumeration lives in the schema, not a validator constant — see Source-of-Truth. |
| R3 | shipped (uncommitted) | fixtures `y`, `z` rejected | Union rule for `user_checkpoint_required_for`. |
| R4 | shipped (uncommitted) | `required:` array untouched; MQ-3 consumer exits 0 | The minor-bump guarantee. |
| R5 | shipped (uncommitted) | intent block accepted; `aa`/`ab` floor fixtures rejected | Not represented on the Notion page at all. |
| R6 | shipped (uncommitted) | m9 flips a symbolic threshold; `ad` fixture rejected | Adds a sixth tunable, `skill_scoring.thresholds`. |
| R7 | shipped (uncommitted) | MQ-1 — fresh `init` emits PS-1…PS-11 | Verified against the packed tarball. |
| R8 | shipped (uncommitted) | MQ-2 — skew appends PS-9/10/11, idempotent, exit 0 | Non-blocking upgrade path. |
| RI1 | shipped (uncommitted) | six tunables traced to consumption points | — |
| RI2 | shipped (uncommitted) | m9/m10/m11, mutation-tested (verify v2 MQ-6) | Was verify v1's single fail. |
| RI3 | shipped (uncommitted) | ratchet wired into `validate`; MQ-4 | 96 grandfathered, 0 new, 0 stale. |
| RI4 | shipped (uncommitted) | 29/29 violation fixtures | — |
| RI5 | shipped (uncommitted) | `x-tuning-locked-key` rejected | — |
| RI6 | shipped (uncommitted) | `config-map.md`, `validators/README.md`, `repo-mental-map.md` | Repo docs current; Notion is not. |
| RI7 | shipped (uncommitted) | `aa`/`ab` rejected | Both concern floors enforced. |
| RI8 | shipped (uncommitted) | `ac-intent-stale-provenance` rejected | — |
| RI9 | shipped (uncommitted) | MQ-3 — 1.0.0-era config exits 0 with deferred warnings | — |

17/17 covered. None deferred, blocked, or waived.

## PR / CI Readiness

**Not applicable by config.** `release.yaml` sets `pull_request.required: false` with
`create_policy: user_requested_or_configured`, and `ci.required: false` with `provider: none`.
No PR has been created and no CI run has been triggered or claimed.

Branch evidence (the one gate that *is* required — `branch.required: true`, evidence "git status
and branch name"):

| Ref | Commit | Note |
|---|---|---|
| `origin/main` | `3401a28` | Remote default branch. |
| `release/1.1.0` | `3401a28` | **Local only** — not present on the remote. |
| `feat/wp-r8-behavior-tuning` | `3401a28` | Current branch. 0 commits ahead of `origin/main`. |
| local `main` | `514d478` | Stale, behind `origin/main`. Unrelated to this chain; noted so it is not mistaken for divergence caused by this work. |

- Working tree: 49 paths — 28 modified, 21 untracked (the count includes this artifact).
- Divergence check (workflow step 4a): `git fetch origin` then
  `git rev-list --left-right --count origin/main...HEAD` → `0 0`. The base has **not** advanced
  since work started, so there is no merge/rebase decision point to surface.
- Branch policy satisfied: `repo-profile.yaml` requires a non-default branch for changes, and the
  work is on `feat/wp-r8-behavior-tuning`. Nothing was committed to `main`.
- The task artifact's claim that the branch was cut from `release/1.1.0` rather than `main` is
  confirmed — though the two are the same commit, so the distinction is currently only intent.

## Release Readiness

`release.required: false`, so `default_recommendation_when_no_release_gate: ship` applies.

| Gate | Required | Status | Evidence |
|---|---|---|---|
| branch | yes | pass | Table above; non-default branch, no divergence. |
| generated_output | when changed | pass | Changed and rebuilt. `npm run build` → `build-bundle: ok`; `render-adapters: adapter shims are current`. Evidence is the verify artifact, per config. |
| pull_request | no | not applicable | `create_policy: user_requested_or_configured`; neither. |
| ci | no | not applicable | `provider: none`. |
| release | no | not applicable | Version bump and publish belong to the 1.1.0 release as a whole. |
| deployment | no | not applicable | No runtime service — repo invariant. |
| docs | no | pass anyway | `config-map.md`, `validators/README.md`, `repo-mental-map.md` all updated (RI6). |
| package | no | not applicable | No version bump in this work package. `package.json` was touched only to register test scripts. |
| source_of_truth | when configured | blocked | No provider configured, so not required — but see below. |
| rollback | when release or external handoff is in scope | in scope | External handoff (Notion) is in scope; rollback defined below. |

No required gate is failing. `npm run validate` exits 0 across 25 validators and the ten test
suites total 128 assertions, all green.

## Source-of-Truth Status

**blocked** — external write requires user request or config, and neither exists.
`source-of-truth.yaml` has `providers: []` and
`require_user_request_or_config_for_external_write: true`. The Notion workspace is therefore not a
configured source of truth, and I have not written to it.

That said, the WP-R8 Notion page is now materially wrong in four ways, not the two carried forward
from Review. Reading the page produced the corrected list:

1. **Class is `Standard`; the work was reclassified to `Complex`** during Plan and every phase
   since has been run under Complex rules (no phase skippable without a waiver — which is why Test
   ran at all).
2. **The allowlist's home is described wrongly.** The page states *"`check-config.mjs` carries this
   list as a constant and rejects any key under `tuning:` that is not on it."* Resolved question Q1
   put the enumeration in `repo-profile.schema.yaml` and deliberately **nowhere else** —
   `check-config.mjs` carries no key list, and adding one would reverse that decision. The page
   currently instructs a future reader to do the opposite of what shipped.
3. **The allowlist has five entries; six shipped.** `skill_scoring.thresholds` was added by R6,
   which split numeric thresholds out of `skill_scoring.triggers` so predicates reference them
   symbolically. `skill_scoring.triggers` itself remains locked, so the page's locked-set statement
   is still correct — but incomplete without the split.
4. **The intent layer (R5) is absent entirely.** `intent.repo_character`, `intent.surface_map`,
   `intent.concerns` with two non-negotiable floors, and `intent.derived_keys` provenance are a
   substantial user-facing surface added after the page was last written, along with the
   setup-negotiation and upgrade-skew reconciliation behavior (R7, R8).

Status: **blocked**, with the copy-ready handoff below. Not a `hold` for Ship, because config does
not require the update.

## Risk And Rollback

**Residual risk** (unchanged from verify v2 and Review v4 — accepted, not resolved):

- 96 grandfathered artifact violations. Visible, schema-validated, can only shrink, but nothing
  schedules their repair and no owner is assigned.
- `lifecycle-artifact.schema.yaml` remains unwired; its 16 extra section requirements are
  unenforced. Deliberately out of scope.
- No live consumer repo has exercised the upgrade path against a genuinely *published* 1.0.0
  tarball — the v1.0.0 consumer in MQ-2 was simulated by editing a 1.0.1-generated repo down to
  1.0.0 shape.
- The `warn-until-1.2.0` deprecation window has no expiry mechanism; nothing fails when 1.2.0 ships
  with markers still present.
- The Notion page is stale in the four ways above until the handoff is applied.

**Rollback**

| Field | Value |
|---|---|
| Area | `src/workflow/` schema + validators, `test/`, `bin/agentsmyth.mjs`, and the four chain artifacts. |
| Risk | A consumer on 1.1.0 hits an unforeseen rejection in a config that validated under 1.0.x. |
| Rollback trigger | Any previously-valid consumer `repo-profile.yaml` or `verification.yaml` failing `check-config` after upgrade, or the skew branch blocking a repo rather than warning. |
| Rollback action | Nothing is committed, so rollback today is `git checkout -- .` plus removing the untracked paths — no history to revert. **Once committed**, revert the WP-R8 commit(s) on `release/1.1.0` before it merges to `main`; the change is additive (no `required:` field added, no existing key's meaning altered), so a revert cannot strand a consumer config that already validated. |
| Owner | Jeel Vankhede |
| Evidence required to execute | The failing config plus `check-config` output naming the rejected key. |
| Limits | Rollback does not undo a `~/.agentsmyth` global refreshed by `agentsmyth prepare`; that is re-run from whichever version is installed and is not covered by reverting this repo. |

## Blocked Handoff

**Provider / source type:** Notion (not configured in `source-of-truth.yaml`; workspace reachable).
**Source item:** WP-R8 — Per-Repo Behavior Tuning —
`https://app.notion.com/p/3a1972bdebbb81fdad2cee228a1ec707`
**Owner:** Jeel Vankhede
**Affected manifest IDs:** R1, R2, R5, R6, R7, R8, RI6
**Ship impact:** none — config does not require a source-of-truth update. Documentation accuracy
only.
**Risk if not applied:** the page instructs a future reader to put the allowlist in
`check-config.mjs`, which is the opposite of what shipped and would reverse resolved question Q1.

**Exact handoff — four edits:**

1. Property `Class`: change `Standard` → `Complex`.

2. Under "Tunable Key Allowlist (resolved 2026-08-09)", replace:

   > `check-config.mjs` carries this list as a constant and rejects any key under `tuning:` that is
   > not on it.

   with:

   > `repo-profile.schema.yaml` carries this list as an explicit enumeration of closed objects and
   > rejects any key under `tuning:` that is not on it. The enumeration lives in the schema and
   > nowhere else (resolved question Q1) — `check-config.mjs` deliberately carries no key list, so
   > there is exactly one place to change when the allowlist changes. `check-config.mjs` handles
   > only the one cross-file rule the schema cannot express: the append-only union for
   > `pause_resume.user_checkpoint_required_for`.

3. Add a sixth bullet to the tunable list:

   > - `skill_scoring.thresholds` — map of integers, one per score-driven skill. Split out of
   >   `skill_scoring.triggers` so predicates reference thresholds symbolically
   >   (`complexity_score >= thresholds.domain.clean-code-architect`) instead of embedding literals.
   >   `skill_scoring.triggers` itself stays locked: a repo may move a threshold, never rewrite a
   >   predicate.

4. Add a new section after the governing rule:

   > ## Intent Layer (added during implementation, 2026-08-14)
   >
   > The six tunables above are the *mechanism*. Repo owners answer intent instead, and the
   > mechanism is derived from it: `intent.repo_character`, `intent.surface_map`, and
   > `intent.concerns` — a map of 8 concern areas covering all 10 scored skills, each
   > `not-applicable`, `light`, `standard`, or `strict`. `constraints_safety` and `repo_alignment`
   > have a schema-enforced floor and may never be `not-applicable`. `intent.derived_keys` records
   > provenance so a later upgrade can safely re-derive a derived value and never silently
   > overwrite one set by hand.
   >
   > Setup and upgrade: `init` seeds intent items into `pending-setup.yaml` (PS-9…PS-11). On
   > detected version skew, `agentsmyth check` appends the same items and reports them as
   > informational — idempotent, and non-blocking, so a repo keeps working with values resolved
   > from the global install until its owner completes the repo-level config.

## Architecture Notes

- role: Senior DevOps
- **decision — recommend `ship` while holding the artifact at `blocked-for-user`.** These are not
  in tension. The DevOps judgment is that every required gate has evidence and no unwaived blocker
  remains; the hold is the `ship-review` checkpoint, which by design only the user can clear. Per
  `rules.md`, the Checkpoint Approval section must quote the user's real words verbatim, so writing
  `ready-for-next-phase` now would be fabricating an approval.
- **decision — do not write to Notion.** `require_user_request_or_config_for_external_write: true`,
  `providers: []`, and no user request. Copy-ready text is recorded instead. This is the
  determinism rule about not treating handoff text as completion, and it is also the right default
  for an outward-facing write.
- **finding during Ship — S1, fixed in Build Phase 19: `check-release-readiness.mjs` read the
  oldest review, not the latest.** Ship could not validate its own artifact. The validator
  cross-checked upstream P0/P1 findings using `reviewCandidates[0]`, and `listFiles` returns sorted
  paths, so it always read v1 — which recorded P1:1 — while v4 records P1:0 with every finding
  resolved. The failure mode is not a false alarm but a permanently unshippable chain: once a first
  review raises a P1, no amount of fixing clears it, because the validator never reads the review
  that records the fix. The only workaround was editing a historical review to insert a `(fixed)`
  marker, i.e. rewriting the record to satisfy a check pointed at the wrong file. Per the Ship
  determinism rules I did not fix it in this phase — it went back to Build as Phase 19, verified in
  both directions (v1's P1 no longer trips it; an injected P1 in v4 does), then Ship resumed.
- **decision — `orchestration.blockers` is empty even though two user decisions are outstanding.**
  My first draft listed the pending checkpoint and the commit decision as blockers alongside a
  `ship` recommendation, which `check-release-readiness` correctly rejects as self-contradictory.
  The checkpoint is enforced by `check-lifecycle --phase reflect`, separately and more precisely;
  duplicating it as a blocker would have made the recommendation lie about itself.
- **finding during Ship — the Notion page is stale in four ways, not two.** Review and Test carried
  two corrections forward. Reading the page produced two more: the allowlist is five entries where
  six shipped, and the entire intent layer is missing. Neither was visible from inside the repo,
  which is the argument for Ship actually opening the source of truth rather than trusting the
  running list.
- **constraint — "shipped" in Requirement Coverage means implemented and verified, not
  committed.** Nothing in this chain has ever been committed. Recording the rows as `shipped`
  without that qualifier would be the exact overclaim the determinism rules forbid, so the
  qualifier is stated once at the top of the table and carried in every row.
- **constraint — `release/1.1.0` is local-only.** It exists at `3401a28` and has never been pushed.
  Whoever merges this work needs to know the release branch is not yet a shared ref, so nothing is
  visible to anyone else until it is pushed.
- **assumption Reflect must preserve:** that the defect class count is **six**, not seven. Verify
  v1 raised it to seven on an analysis it later withdrew; verify v2 corrected it. Reflect's central
  lesson depends on the accurate count.
- **downstream:** Reflect should carry the six-instance defect class, the mutation-testing lesson
  from verify v2, the 96-violation debt, the unwired `lifecycle-artifact.schema.yaml`, and
  `CLAUDE.md`'s stale "4 fixtures" line (now 29). The `warn-until-1.2.0` marker removal belongs on
  the 1.2.0 release checklist, which is a Notion edit on the 1.2.0 page, not this one.

## Checkpoint Approval

- Checkpoint: ship-review
- Status: **pending** — the user has not yet responded to this ship decision.
- User's own words (verbatim, this turn): _not yet given._

This section must not be completed by the agent. It is filled in only after the user responds, with
their actual message quoted.

## Exit Gate

- [x] Recommendation is ship / hold / hold-with-waiver — `ship`.
- [x] Every R and RI has a coverage row — 17/17.
- [x] Rollback trigger and action defined.
- [x] All configured gates checked or marked not applicable with config reference.
- [ ] `ship-review` checkpoint approved by the user.
- [ ] Commit authorization given (or explicitly declined, leaving the work uncommitted by choice).

## Next Phase

**blocked** — pending the `ship-review` checkpoint. Reflect may start once the user approves this
ship decision; `check-lifecycle --phase reflect` will hard-block until this artifact carries an
approved, evidenced Checkpoint Approval section.

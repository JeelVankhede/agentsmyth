---
slug: wp-r20-ledger-closure
version: 1
artifact: brief
status: ready-for-next-phase
created: 2026-09-13
updated: 2026-09-13
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, R8, RI1, RI2, RI3, RI4, RI5, RI6, RI7, RI8]
upstream:
  - user-request
orchestration:
  phase: think
  status: ready-for-next-phase
  next_phase: plan
  blockers: []
  user_checkpoint: brief-review
council:
  mode: refused
  refusal_reason: dispatch-disabled
  resolution:
    dispatch_enabled: disabled
    council_enabled: on-for-complex
    task_class: complex
skill_trigger_log:
  - skill: repo-alignment-scan
    decision: ran
    reason: "complexity_score 70 >= threshold 40; also new_surface true and task_class complex != trivial. Ran: mapped all seven page requirements onto real repo surfaces and found the decisive misalignment — this repo already shipped the archive pattern the page proposes to invent (RI1, Q1)."
  - skill: architecture-decision-advisor
    decision: ran
    reason: "complexity_score 70 >= threshold 60; also new_surface true (a second cross-run persistent file kind). Ran: archive shape decided against the WP-R22 precedent with two named rejected alternatives — see Architecture Notes. Recorded as Q1 rather than assumed, because the page specifies the alternative the evidence argues against."
  - skill: constraint-conflict-scan
    decision: ran
    reason: "task_class complex != trivial. Ran: all three domain.yaml constraint arrays and repo-profile paths.protected read this session. One material constraint ([safety-2], destructive action) shapes R6 and RI5 — the sweep deletes 70 entries from a durable record. No protected-path match: .git/**, .env*, **/*secret* are untouched."
---

# WP-R20 — Open-Items Ledger Closure Lifecycle - Brief

## Source Links

- Notion WP-R20 — Open-Items Ledger Closure Lifecycle: https://app.notion.com/p/3b6972bdebbb81ba9860d55c1288bccf (Status ⚪ Not Started, Class Complex, Priority P2, Type Chore, Target Version relation → "1.1.0 — Minor Release Work Plan"). R1–R7, the compatibility hinge, both contract amendments, out-of-scope, verification and acceptance are written there and are carried into this manifest rather than re-derived.
- Notion 1.1.0 — Minor Release Work Plan: https://app.notion.com/p/3ab972bdebbb81ef88b7f3cf7e500d79 — "WP-R20 (open-items ledger closure) carries over"; sequencing says it has no dependency on the council work. The page's release-level acceptance list does not name WP-R20, so this package is in the release by scope decision, not as a release gate.
- `workflow/artifacts/reflect/wp-r23-agents-md-fallback-v1.md` → `## Follow-Ups` and `## Architecture Notes` → `downstream`: three follow-ups are recorded as new open items that were listed rather than filed, with the explicit instruction that they be filed "before the next chain reads that ledger at its own Reflect". This chain is that next chain, and R8 is that filing.
- `src/workflow/schemas/finding-quality.schema.yaml` — the in-repo precedent, and the file that already names this defect in prose: the open-items ledger "accepts a `resolution` key that 22 of its entries depend on and that its schema never declares, because nothing closed the object."
- `src/workflow/schemas/pending-setup.schema.yaml:39-46` — the `resolved_by: unrecorded` precedent for honestly marking a field that could not be backfilled.

## Problem

`workflow/artifacts/open-items.yaml` is a single append-only cross-run ledger and nothing ever
removes an entry. Measured at this branch's head: **92 items, 594 lines, 92,060 bytes — 70 of them
`done`.** Those 70 closed entries account for **67,457 bytes, 73% of the file**, and the file is
read at every Reflect exit gate by `follow-up-owner-assigner`. The cost is not disk. It is that
three-quarters of what every future Reflect loads is settled business.

Two defects sit alongside it, and both have grown since the page was written.

The schema has no field for closure prose, so agents cram it into `next_action` as `"Done: ..."`
paragraphs. The page records this as a single instance of an undeclared `resolution` key on OI-23;
`finding-quality.schema.yaml` recorded it as 22. **It is now 39 of 92 entries.** The cause is that
the item object is not closed: `open-items.schema.yaml` declares no `additionalProperties: false`,
so an undeclared key passes silently. `resolution` is in fact the *only* undeclared key in the live
file — every other key in use is declared — so closing the object and declaring the field legalizes
the whole of the existing drift and makes the next undeclared key fail instead of pass.

Duplicate `OI-N` IDs have occurred twice, documented inside OI-45 itself. `check-open-items.mjs`
checks uniqueness within the one file it reads, which is sufficient only while there is one file.
Splitting the ledger is exactly what makes reuse likely — the live file becomes the working file, so
an author appending to a lean file reaches for the next number it shows rather than the next number
ever issued. `check-finding-quality.mjs` had to close this same hole for `FQ-N` and says so in a
comment.

## Goals

- Take closed items out of the file that every Reflect loads, without losing the reasoning they
  carry — later chains cite OI-22's self-correction, OI-45's assessment, OI-23's reconciliation
  sweep.
- Give closure a declared place to live (`resolution`, `closed_in_run`) so `next_action` means only
  the pending action again.
- Close the item object so the next undeclared key fails loudly instead of accumulating to 39.
- Make ID uniqueness hold across the split, not within one half of it.
- Move the sweep from a human habit into the Reflect exit gate, without giving any mechanism the
  authority to decide that an item is closed.
- Leave a consumer repo that has never swept passing, on upgrade, with no action required.

## Non-Goals

- Any mechanical auto-closer that decides an item is `done`. Closure stays a human or agent
  judgement; this package moves already-closed items and never closes one.
- WP-R18's provenance manifest and migration descriptors. This is an agent-written artifact data
  file, not a shipped template, and the sweep is idempotent and self-healing on first run.
- The seven lifecycle artifact contracts. Untouched.
- Re-triaging the 22 live open items. R6 moves the 70 that are already `done`; it does not judge
  whether any of the 22 should have been.
- Closing, reconciling or acting on OI-87, OI-90, OI-92 or any other live item. R8 files three new
  entries; it resolves none.

## User Impact

For this repo: every subsequent Reflect loads a ledger of ~25 live items instead of 92, and closure
reasoning stays greppable in a sibling file rather than being deleted or buried.

For a consumer repo on upgrade: **nothing changes and nothing breaks.** R5's conditional is the
hinge — with no archive file present, a `done` entry in the live ledger is not an error, matching
`check-open-items.mjs`'s existing "no file, exit 0" precedent. The gate becomes hard only once the
repo is actually on the new model, which happens the first time its own Reflect sweeps.

## Success Metrics

- Live `workflow/artifacts/open-items.yaml` contains zero `status: done` entries, and its byte size
  falls from 92,060 to roughly 24,500 plus the three new R8 entries — a ~73% reduction in what
  Reflect loads. Measured by `wc -c`, before and after, both recorded.
- The archive holds exactly 70 items and validates against its own `kind`.
- Every one of the 39 existing `resolution` keys validates against a declared field, with
  `additionalProperties: false` in force.
- `check-open-items.mjs` rejects each of its new failure directions against a fixture, and
  `test/mutation-baseline.json` records 0 undefended for it at the new, higher rule count.
- `npm run build && npm run validate && npm run violations:test && npm run conformance:test` green,
  zero regressions elsewhere.

## Requirements

Carried from the Notion page as R1–R7, verbatim in intent. R8 is the WP-R23 Reflect handoff folded
into this chain because it writes to the same file the sweep rewrites, and doing it in a separate
change would mean two chains editing one ledger in the same release.

Each requirement's acceptance criteria are in the Requirement Manifest below.

## Constraints

- **[safety-2] destructive action requires explicit user approval.** R6 removes 70 entries from a
  durable cross-run record. Mitigated structurally rather than by promise: rotation is a *move*, so
  every entry is present in exactly one file afterwards, and R5 checks both directions of that
  invariant (present in both = copied not moved; closed and still live = not rotated). The sweep is
  still a rewrite of a durable file and is called out in Risks.
- **No new runtime dependency** (`CLAUDE.md` rule 4). Hand-rolled ESM only.
- **Edit source, never generated output** (`CLAUDE.md` rule 1), and rebuild after any
  `src/workflow/` change (rule 2). `workflow/schemas/` is a build-synced, gitignored copy.
- **The mutation ratchet is at 0 undefended for all 30 validators** (`test/mutation-baseline.json`,
  generated 2026-09-01; `check-open-items.mjs` at 3 rules / 0 undefended). An added error is an
  added rule, so every new rejection needs its own fixture in the same change.
- **`r22-every-suite-runs-in-ci`** requires every `package.json` `*:test` script to be invoked by
  both `.github/workflows/ci.yml` and `.github/workflows/release.yml`. Adding a suite without
  wiring both fails conformance.
- **`council.enabled: on-for-complex` and this is Complex, so a Think council was applicable and did
  not fire.** The operating session forbids subagent dispatch, which resolves `dispatch.enabled` to
  `disabled` — the first check in the mode-resolution order, and per `AGENTS.md` → `## Source
  Priority` the current user request outranks `src/workflow/`. Recorded as
  `council.mode: refused`, `refusal_reason: dispatch-disabled` rather than left silent, because
  silence cannot distinguish "not applicable" from "failed to fire". Research for every bucket
  below was performed by the parent against the repo.
- **Release position.** 1.1.0 is unreleased and gated on this package and WP-R24 (WP-R23 brief Q3,
  user decision 2026-09-13). `package.json` must NOT be pre-bumped — `release.yml` runs
  `npm version` itself.

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| The sweep loses or corrupts closure reasoning while rewriting a 92KB durable file | low | high | Rotation is a move checked in both directions by R5; byte-level before/after accounting of the 70 moved entries is a Test requirement (RI3), not a Build claim |
| `closed_in_run` cannot be derived for the 70 backfilled items, and is guessed instead | high | medium | Q2. `unrecorded` sentinel, following `pending-setup.schema.yaml`'s own precedent and its stated rule: never for a new resolution |
| The archive shape is built to the page's spec, then has to be rebuilt when it meets the precedent | medium | high | Q1, blocking. It decides the schema, the validator, every fixture and the sweep — discovering it in Build means redoing all of them |
| A new validator error lands without a rejection fixture, and the ratchet's 0-undefended reads as coverage it does not have | medium | medium | RI2: fixture-per-error in the same change, mutation audit re-run and baseline updated |
| A consumer repo's Reflect gate breaks on upgrade | low | high | RI5: R5's conditional; verified by a positive fixture — `done` entries, no archive, must pass |
| The archive is claimed to be "never loaded by any phase" and nothing enforces it | medium | low | RI6 makes the claim checkable rather than asserted |
| Two chains edit `open-items.yaml` in one release (WP-R23's unfiled handoff vs this sweep) | certain | low | R8 folds the filing into this chain; A2 stacks the branch on the R23 branch so the sweep sees the R23 chain's own entries |

## Open Questions

Q1 was blocking and is **resolved** (2026-09-13, by the user); `orchestration.blockers` is now
empty. Q2 and Q3 carry recommendations and do not block Plan. All three are stated in full in
`## Questions For User`.

## Requirement Manifest

### Explicit (R)

- **R1** (page R1) — The live `open-items.yaml` holds only `open`, `blocked` and `deferred`.
  `deferred` stays live because it is unresolved, not closed. Only `done` leaves.
  - Acceptance: after the chain, `grep -c "status: done"` on the live ledger is 0, and the counts of
    `open`, `blocked` and `deferred` are unchanged from the pre-sweep measurement (22 / 0 / 0).

- **R2** (page R2) — A new archive file kind holding the swept entries, same item shape, never
  loaded by any phase. Path and segmentation settled by Q1 on 2026-09-13: flat
  `workflow/artifacts/open-items-archive.yaml`, `kind: open-items-archive`, declared in the existing
  `open-items.schema.yaml` `kind` enum. This supersedes the page's
  `workflow/artifacts/archive/open-items-<YYYY>.yaml`.
  - Acceptance: `workflow/artifacts/open-items-archive.yaml` exists, declares
    `kind: open-items-archive`, validates against `$id: open-items`, and holds exactly 70 items. No
    `archive/` directory is created and no second schema file is added.

- **R3** (page R3) — Add `resolution` (how and why it closed) and `closed_in_run` (slug-vN) to the
  item schema, restoring `next_action` to meaning only the pending action. This also legalizes the
  existing undeclared-key drift.
  - Acceptance: both fields are declared in `src/workflow/schemas/open-items.schema.yaml` with
    descriptions; all 39 existing `resolution` values validate; no swept item's `next_action` still
    carries closure prose; `check-schema-keywords.mjs` passes on the edited schema.

- **R4** (page R4) — `follow-up-owner-assigner` gains a sweep step at the Reflect exit gate, running
  after its existing append: any item already marked `done` moves to the archive. The skill still
  never decides closure on its own authority.
  - Acceptance: `SKILL.md`'s `## Workflow` has the sweep as a numbered step after the append step,
    its `## Exit Gate` carries the matching assertion, and both state that the skill moves
    already-closed items and never sets `status: done` itself.

- **R5** (page R5) — `check-open-items.mjs` validates the archive against the schema when present,
  enforces ID uniqueness across live plus archive combined, and errors on a `done` entry in the live
  ledger **only when an archive file already exists**.
  - Acceptance: four fixtures pass — (a) a `done` entry in a live ledger *with* an archive present
    fails; (b) the same ledger *without* an archive passes; (c) an ID colliding across live and
    archive fails; (d) an entry present in both files fails as copied-not-moved. Each is registered
    in `test/run-violation-tests.mjs` with an `expect` string.

- **R6** (page R6) — A one-time sweep of this repo's own ledger, performed by this chain.
  - Acceptance: 70 items moved, 0 lost; live + archive item counts sum to 92 plus R8's 3; a
    before/after byte accounting is recorded in the verify artifact.

- **R7** (page R7) — Terminology sweep across the skill, its references, and any doc describing the
  ledger as append-only. **Both contract amendments land in this same chain** — the page is explicit
  that splitting them is the silent-drift class this repo keeps catching.
  - Acceptance: `follow-up-owner-assigner/SKILL.md`'s Determinism Rule "Never overwrite
    open-items.yaml wholesale" and `references/ledger-format.md`'s "This file is append-only from
    this skill's perspective" (with its note that status transitions are a future concern) are both
    rewritten, not merely softened; `references/output-schema.md`, `validators/README.md` and
    `docs/release-checklist.md` describe the two-file model; a repo-wide grep for the append-only
    claim about *this* ledger returns nothing outside historical artifacts.

- **R8** (user request, 2026-09-13) — File the three open items WP-R23's Reflect listed but did not
  write: OI-87's under-description of the 1.1.0 scope, the Requirement Classification section being
  unreachable in single-agent briefs, and example-repo coverage for the `AGENTS.md` marker block
  (RI6 deferred).
  - Acceptance: three new entries exist with `status: open`, the next free sequential IDs
    (OI-93..OI-95 — highest in use is OI-92), `first_seen_run: wp-r23-agents-md-fallback-v1` since
    that is the chain whose Reflect created them, and the owners Reflect named (user, workflow
    owner, user). Being `open`, none is touched by the R6 sweep.

### Implicit (RI)

- **RI1** (repo precedent) — The archive must follow `finding-quality`'s shipped shape rather than
  invent a second convention: **one schema file with a two-value `kind` enum**, not a new schema
  file. `schemaRegistry()` keys by `$id`, so reusing `$id: open-items` means no registry change, no
  build change, and no second file to keep in sync.
  - Acceptance: no new `.schema.yaml` file is added; `open-items.schema.yaml`'s `kind` is an enum of
    the live and archive kinds with a description saying why they are distinct; the registry
    resolves both without modification.

- **RI2** (mutation ratchet) — Every new error added to `check-open-items.mjs` is a new rule under
  the audit, and the baseline is 0 undefended for all 30 validators.
  - Acceptance: each new error has a fixture that provokes exactly it; `npm run mutation:audit`
    reports `check-open-items.mjs` at its new rule count with 0 undefended; `mutation-baseline.json`
    is regenerated in the same change, with its `generated` date updated.

- **RI3** (verification config) — `workflow/config/verification.yaml` requires `npm run validate` and
  `npm run violations:test` at review and ship. The sweep additionally needs evidence that no
  reasoning was lost, which no configured command can supply.
  - Acceptance: both configured commands recorded with current output; plus a manual-QA item with
    all seven required fields showing the 70 moved entries are byte-identical in the archive to what
    the live file held, and that live + archive together still contain every OI-1..OI-95.

- **RI4** (CI contract) — New coverage lands in the **existing** `violations:test` and
  `conformance:test` harnesses rather than a new `*:test` script, so `r22-every-suite-runs-in-ci`
  stays satisfied without touching two workflow files.
  - Acceptance: `package.json` gains no new `*:test` script; if one is added anyway, both `ci.yml`
    and `release.yml` invoke it and `conformance:test` passes.

- **RI5** (consumer compatibility) — Upgrade must be a no-op for a repo that has never swept, and no
  field this package adds may be unconditionally required.
  - Acceptance: a positive fixture with `done` entries and no archive file passes; neither
    `resolution` nor `closed_in_run` is added to the item object's `required` list; the release stays
    a minor bump under the 1.1.0 work plan's "new optional fields with safe defaults, no
    required-schema change" constraint.

- **RI6** (checkable claims) — "Never loaded by any phase" and "the archive is closed rows only" are
  both assertions today. At least the second must be mechanically enforced, and the first must be
  stated somewhere a reader will look.
  - Acceptance: `check-open-items.mjs` rejects a non-`done` entry in the archive (it is unreachable
    there — nothing scans the archive for work to finish, so it would read as accounted for
    forever); the never-loaded rule is written into the schema description and
    `references/ledger-format.md`.

- **RI7** (generated output) — `CLAUDE.md` rule 2 and `generated_output_policy.require_regeneration_or_waiver_when_source_changes`.
  - Acceptance: `npm run build` run after the `src/workflow/` edits; `workflow/schemas/open-items.schema.yaml`
    matches its source byte-for-byte; the verify artifact records the regeneration rather than
    inferring it.

- **RI8** (release) — 1.1.0 is unreleased and this package is in it.
  - Acceptance: `CHANGELOG.md`'s existing 1.1.0 entry gains a WP-R20 line under the right heading;
    the entry's date is not touched by this chain; `package.json` version is unchanged; the ship
    artifact does not report this merge as closing 1.1.0, since WP-R24 remains outstanding.

### Assumptions (A)

- **A1** — Slug `wp-r20-ledger-closure`, version 1. New chain, no prior artifacts for this slug
  (`find workflow/artifacts -name "*r20*"` returns nothing). Low risk, reversible before Plan.
- **A2** — Branch `feat/wp-r20-ledger-closure`, created from `feat/wp-r23-agents-md-fallback` at
  `881441d`, because PR #68 is open into `release/1.1.0` and not yet merged, and both chains write
  `workflow/artifacts/open-items.yaml`. The eventual PR bases on `release/1.1.0`, never `main`
  (`branch_policy.require_non_default_branch_for_changes: true`). Reversible by rebase if #68 merges
  first.
- **A3** — The three R8 entries take IDs OI-93, OI-94, OI-95 in the order WP-R23's Reflect listed
  them. Sequential and never renumbered per `ledger-format.md`; highest ID in use is OI-92.
- **A4** — "Never loaded by any phase" is satisfied by no phase skill or validator *reading* the
  archive for work, not by making the file unreadable. `check-open-items.mjs` reads it to validate
  it, which is not a phase load.

### Open Questions (Q)

- **Q1** — Archive path and segmentation: the page's `workflow/artifacts/archive/open-items-<YYYY>.yaml`
  with yearly segmentation, or a flat `workflow/artifacts/open-items-archive.yaml` matching the
  shipped `finding-quality-archive.yaml`?
  - Owner: user. Blocking: yes. Blocked phase: plan. **RESOLVED 2026-09-13 — no longer blocking.**
  - Answer: the user chose the flat file matching the precedent. The page's yearly-directory spec is
    superseded; R2's acceptance now names the settled path.
  - Recommendation offered and taken: **flat, matching the precedent.** Rested on `repo` evidence,
    not preference — see `## Questions For User`.

- **Q2** — `closed_in_run` for the 70 backfilled items: allow an `unrecorded` sentinel, or derive
  from each item's `resolution` prose where it names a chain?
  - Owner: user. Blocking: no. **RESOLVED 2026-09-13 — the user answered "Q2: Proceed", taking the
    recommendation.**
  - Recommendation, taken: **declare `unrecorded` as valid for backfill only**, carrying
    `pending-setup.schema.yaml`'s own wording ("never use it for a new resolution"), and derive a
    real slug-vN wherever the existing prose states one unambiguously. Rests on `repo` evidence.

- **Q3** — Does the sweep's first run in *this* repo count as the destructive action
  `[safety-2]` requires approval for, over and above approving this brief?
  - Owner: user. Blocking: no — it gates Build's R6 step, not Plan. **RESOLVED 2026-09-13 — the
    user answered "Q3: Approved".**
  - Recommendation, taken: **the brief approval covers the sweep's design, and Build asks again
    before R6 actually rewrites the file**, which is the same separation WP-R23 kept between
    approving a ship decision and authorizing the commit. Rests on `repo` evidence. Build must still
    surface the sweep before executing it; "Approved" here is approval of the design and of that
    two-step arrangement, not a pre-authorization of the rewrite.

### Requirement Classification

Written at stage 2, before research. This chain is single-agent by refusal, so `## Council Log` is
omitted; this sub-section is retained because the Think Exit Gate requires a classification entry for
every active `R` and `RI` regardless of mode. (That the section's starter-block position makes it
reachable only inside `## Council Log` is itself one of the three items R8 files.)

| Manifest ID | Question bucket | Evidence classes |
|---|---|---|
| R1, R6 | What is actually in this ledger today, and what does removing the closed half leave? | repo, trial |
| R2, RI1 | Does this repo already have an archive convention, and what shape is it? | repo |
| R3, RI5 | Which keys does the live file really use, and what breaks if the object is closed? | repo, trial |
| R4, R7 | Which shipped statements about this ledger become false, and where are they? | repo |
| R5, RI2, RI6 | What failure directions exist across two files, and what does the ratchet demand of each new one? | repo, trial |
| R8 | Which follow-ups did WP-R23's Reflect leave unfiled, with which owners and IDs? | repo |
| RI3, RI4, RI7 | Which commands and CI contracts govern this change? | repo |
| RI8 | What does the release position require, and forbid? | repo |

Every bucket is repo-shaped; `web` appears nowhere and `recall` supports nothing. No `Q` rests on
`recall`.

## Questions For User

**Q1 — archive path and segmentation. RESOLVED 2026-09-13 by the user: flat file, matching the precedent.**

The page specifies `workflow/artifacts/archive/open-items-<YYYY>.yaml`, yearly, "so the archive
itself never becomes one unbounded file". Two pieces of repo evidence argue for a flat
`workflow/artifacts/open-items-archive.yaml` instead (bucket R2/RI1 — `repo`):

1. **Yearly segmentation is not derivable from the data.** Page R4 says the sweep moves an item "to
   the archive file for its `closed_in_run` year". `closed_in_run` is a slug-vN — `wp-r23-agents-md-fallback-v1`
   — and carries no date. There is **no date field anywhere in `open-items.schema.yaml`**: the
   properties are `id`, `source`, `owner`, `next_action`, `status`, `first_seen_run`, `manifest_ids`.
   Segmenting by year therefore requires inventing a date per item, and for the 70 already-closed
   ones that date is not recoverable. The page's own mechanism cannot run as written.
2. **The unboundedness it guards against costs nothing, by the page's own reasoning.** The page
   states the cost plainly: "The cost is not disk. It is context: the ledger is read at every
   Reflect exit gate." R2 also says the archive is never loaded by any phase. A file no phase loads
   has no context cost at any size, so the one motivation for splitting it does not apply to it.
3. **This repo already shipped the flat shape.** WP-R22 landed `workflow/artifacts/finding-quality-archive.yaml`
   with `kind: finding-quality-archive` declared in the *same* schema's `kind` enum. Matching it
   means no new schema file, no `schemaRegistry()` change (it keys by `$id`), and one validator
   reading two files — the shape `check-finding-quality.mjs` already proves works.

Recommendation: flat `workflow/artifacts/open-items-archive.yaml`, `kind: open-items-archive`,
declared in the existing schema's `kind` enum. Rejected alternatives are recorded in Architecture
Notes. This was the user's call, not the agent's — the page is the user's spec and it said
otherwise; the agent reported that the page's stated derivation cannot execute rather than
overruling the scope.

**Outcome: the user took the recommendation on 2026-09-13.** The alternative offered alongside it —
yearly segmentation plus either a new `closed_on` field stamped from the run date (with all 70
backfilled `unknown`) or a single `-2026.yaml` on the grounds that this repo's history begins in
2026 — was not taken. No `closed_on` field is added, and no `archive/` directory is created.

**Q2 — `closed_in_run` for 70 backfilled items. RESOLVED 2026-09-13: "Q2: Proceed".**

`pending-setup.schema.yaml:39-46` already solved this exact problem for `resolved_by`, and this
repo's own `pending-setup.yaml` carries `resolved_by: unrecorded` on PS-1..PS-3. Its wording:
"`unrecorded` is only valid for items resolved before this field was required and whose provenance is
genuinely not recoverable — it exists so such an item can be marked honestly rather than backfilled
with a guess. Never use it for a new resolution." Recommendation: reuse that rule verbatim for
`closed_in_run`, and derive a real slug-vN for the subset whose `resolution` prose names one
unambiguously (OI-29 and OI-73 do; most do not). **Taken.**

**Q3 — approval scope for the sweep itself. RESOLVED 2026-09-13: "Q3: Approved".**

`[safety-2]` requires explicit approval for destructive actions, and R6 rewrites a 92KB durable
record. Recommendation: approving this brief approves the *design*; I ask again at Build before R6
rewrites the file, mirroring the separation WP-R23 kept between the ship decision and the commit.
**Taken.** Build's R6 step therefore carries a second, narrower ask before it rewrites
`open-items.yaml`; this approval does not stand in for it.

## Architecture Notes

- **role**: Architect

- **decision (architecture-decision-advisor, triggered)**: the archive is **one more file beside the
  ledger, described by the same schema through a two-value `kind` enum** — not a new schema, not a
  directory, not a per-year split. **Ratified by the user 2026-09-13 via Q1**, against the Notion
  page, which specifies the alternative. Two rejected alternatives:
  - *A new `open-items-archive.schema.yaml`.* Rejected: `schemaRegistry()` keys by `$id`, so a
    second file is a second thing to keep in sync for zero gain, and `finding-quality.schema.yaml`
    already states why one schema with a two-value `kind` is preferable — "distinct kinds rather
    than one, so a file cannot be mistaken for the other by a reader or a validator".
  - *Yearly segmentation per the page.* Rejected on the evidence in Q1: the derivation it specifies
    has no date to derive from, and the unboundedness it prevents is free for a file no phase loads.

- **decision**: `additionalProperties: false` on the item object lands **with** R3, not after it.
  Declaring `resolution` without closing the object fixes 39 instances of a defect whose cause is
  that the object is open, leaving the 40th to arrive silently. `finding-quality.schema.yaml`
  already made this argument against this exact file.

- **constraint**: R5's conditional (`done` in live is an error only once an archive exists) is the
  one place this package deliberately diverges from `check-finding-quality.mjs`, which rejects a
  closed row in the active file unconditionally. finding-quality shipped new with no legacy data;
  open-items has consumer repos in the field. Plan must not "tidy" this into symmetry.

- **constraint**: the two contract amendments (`SKILL.md`'s wholesale-overwrite Determinism Rule and
  `ledger-format.md`'s append-only claim) are load-bearing, not documentation. A sweep step that
  ships while the skill still forbids rewriting the file is a contradiction inside one skill, and
  the page names that as the silent-drift class. Both land in the same commit as R4.

- **tradeoff**: folding R8 (WP-R23's three unfiled items) into this chain rather than a separate
  Trivial change. Accepted because both write `open-items.yaml` and the sweep must see the final
  set; the cost is that this chain's diff mixes a ledger restructure with three content entries, and
  Review should read them as separate concerns.

- **assumption Plan must preserve**: A4 — "never loaded by any phase" means no phase skill or
  validator reads the archive *for work*. `check-open-items.mjs` reads it to validate it. Plan must
  not attempt to make the file unreadable.

- **downstream — Plan**: the sweep, the schema change and the validator change are one atomic unit;
  a plan phase that ships the validator's hard `done`-in-live rule before the sweep runs fails this
  repo's own tree. Order: schema → validator + fixtures → sweep → contract amendments → docs.
- **downstream — Build**: every new validator error needs its fixture in the same phase, not a
  later one (RI2). Ask before R6 rewrites the ledger (Q3).
- **downstream — Review**: read R8's three entries as content, separate from the restructure.
- **downstream — Test**: no configured command can prove nothing was lost; that needs the manual-QA
  item in RI3 with all seven fields.
- **downstream — Ship**: this merge does not close 1.1.0 — WP-R24 is still outstanding (WP-R23
  brief Q3). Do not pre-bump `package.json`.

## Checkpoint Approval

- Checkpoint: brief-review
- Status: approved
- User's own words (verbatim, this turn): "Q2: Proceed
Q3: Approved
Continue to plan"

Scope of this approval: the brief's content, the Q2 and Q3 recommendations as written, and the
transition to Plan. It does not authorize a commit, a push, a PR, or the R6 sweep itself — Q3's
answer explicitly preserves a second ask before Build rewrites the ledger.

## Exit Gate

- [x] Every active R and RI has acceptance criteria.
- [x] Blocking Q IDs appear in orchestration.blockers — Q1 resolved 2026-09-13, blockers now empty.
- [x] All three mandated skill triggers evaluated and recorded in `skill_trigger_log`.
- [x] Every active R and RI has a Requirement Classification entry naming at least one evidence class.
- [x] Council refusal recorded with its reason rather than left silent.
- [x] User approved — brief-review approved 2026-09-13, recorded verbatim in `## Checkpoint Approval`. All three Q IDs resolved; `orchestration.status: ready-for-next-phase`, `next_phase: plan`.

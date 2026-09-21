---
slug: wp-r20-ledger-closure
version: 1
artifact: plan
status: ready-for-next-phase
created: 2026-09-13
updated: 2026-09-13
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, R8, RI1, RI2, RI3, RI4, RI5, RI6, RI7, RI8]
upstream:
  - workflow/artifacts/briefs/wp-r20-ledger-closure-v1.md
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: plan-review
skill_trigger_log:
  - skill: data-schema-designer
    decision: ran
    reason: "Trigger is `path~schema_globs`. Mechanically FALSE — the glob set is `**/schema/**` and this change touches `src/workflow/schemas/`, which does not match (schemas ≠ schema). Ran anyway: the change adds fields to a schema shipped to consumer repos, which is the migration boundary the skill exists for, and declining on a glob near-miss would be letting a typo decide. The near-miss is itself worth filing — recorded under Open Questions."
  - skill: interface-contract-designer
    decision: ran
    reason: "Trigger is `path~contract_globs OR touches_contract`. Both mechanically false — `repo-profile.yaml` declares `public_contracts: []`. Ran anyway: two shipped contract statements are being made false on purpose (the skill's append-only Determinism Rule and ledger-format.md's append-only claim), which is a contract change whatever the config declares. Result is Phase 6's both-or-neither rule."
  - skill: system-design-advisor
    decision: skipped
    reason: "Trigger is `complexity_score >= 60 OR new_surface`, so it fires. Skipped deliberately: the whole-repo architecture read it would produce was already performed at Think by architecture-decision-advisor and settled by the user at Q1. Re-running it here would re-open a ratified decision, not inform one. Think's Architecture Notes carry the result."
  - skill: quality-gates-validator
    decision: ran
    reason: "Trigger is `task_class != trivial`; complex. Ran: judged the quality bar against the mutation ratchet (0 undefended, 30 validators) and found the default bar insufficient — a fixture per new error is required in the SAME phase that adds the error, which is why Phase 3 exists rather than folding fixtures into Phase 2."
  - skill: ui-ux-designer
    decision: skipped
    reason: "Trigger is `path~ui_globs`. No file in the Repo Impact Map matches; this package has no user interface surface."
  - skill: performance-optimizer
    decision: skipped
    reason: "Trigger is `path~hotpath_globs OR complexity_score >= 60`. Score fires it. Skipped: the change makes the hot path (Reflect's ledger read) 73% smaller by construction, and no other path is affected. There is no optimization question left to answer."
---

# WP-R20 — Open-Items Ledger Closure Lifecycle - Plan

## Summary

Seven ordered phases turning the append-only open-items ledger into a rotating two-file ledger,
following the shape WP-R22 already shipped for `finding-quality`.

The ordering is load-bearing and is not a matter of taste. The schema must accept the archive kind
before a validator can read one; the validator's new rules must exist before fixtures can prove they
fire; the three WP-R23 entries must be filed before the sweep runs, so the sweep sees the final set
and the item accounting closes; and the sweep must run before the contract amendments, because
`follow-up-owner-assigner`'s current Determinism Rule forbids the rewrite the sweep performs.

**The tree stays green at every phase boundary**, and R5's conditional is what buys that: until
Phase 5 creates the archive, a `done` entry in the live ledger is not an error, so Phases 1–4 can
land against a ledger still holding 70 of them.

## Inputs

- `workflow/artifacts/briefs/wp-r20-ledger-closure-v1.md` — approved at brief-review 2026-09-13,
  `orchestration.status: ready-for-next-phase`, blockers empty, all three Q IDs resolved. Gate
  confirmed: `agentsmyth check --phase plan --slug wp-r20-ledger-closure` → `checkpoint
  "brief-review" → approved ✓`.
- `workflow/config/repo-profile.yaml` — `branch_policy`, `paths.protected`, `generated_output_policy`.
- `workflow/config/verification.yaml` — `validate` and `violations-test` required at review and ship;
  `manual_qa.required_fields` (7); `skipped_checks.required_fields` (6).
- `workflow/config/release.yaml` — `pull_request.create_policy: user_requested_or_configured`;
  `generated_output.required: when_changed_or_configured`.
- `src/workflow/schemas/finding-quality.schema.yaml` and
  `src/workflow/validators/check-finding-quality.mjs` — the shipped precedent this plan copies.
- `test/mutation-baseline.json` — `check-open-items.mjs` at 3 rules / 0 undefended, generated
  2026-09-01.

## Requirement Coverage

`coverage-tracer` ledger. One row per active `R`/`RI`, state at Plan time, with the citation that
establishes it. Every ID is `covered`; none is deferred, waived or dropped at this phase.

| Manifest ID | Covered by phases | Notes |
|---|---|---|
| R1 | P5 | covered — live ledger holds no `done` after the sweep. Cited: brief R1 acceptance; `grep -c` baseline of 22/70/0/0 recorded this session. |
| R2 | P1 (kind), P5 (file) | covered — `workflow/artifacts/open-items-archive.yaml`, flat, per Q1. Cited: brief R2 acceptance as amended 2026-09-13. |
| R3 | P1 | covered — `resolution` and `closed_in_run` declared. Cited: brief R3; 39 live uses of the undeclared key measured this session. |
| R4 | P6 | covered — sweep step in the skill's Workflow and Exit Gate. Cited: brief R4; `follow-up-owner-assigner/SKILL.md`. |
| R5 | P2 | covered — validator reads both files. Cited: brief R5; `check-finding-quality.mjs` as the precedent for each direction. |
| R6 | P5 | covered — the one-time sweep. Cited: brief R6; Q3's second ask governs its execution. |
| R7 | P6 | covered — terminology sweep, same phase as the contract amendments by brief constraint. Cited: brief R7. |
| R8 | P4 | covered — three entries OI-93..OI-95. Cited: `workflow/artifacts/reflect/wp-r23-agents-md-fallback-v1.md` `## Follow-Ups`. |
| RI1 | P1 | covered — one schema, two-value `kind` enum, no new file. Cited: `schemaRegistry()` keys by `$id` (`lib.mjs:884-893`). |
| RI2 | P3 | covered — fixture per new error, then the targeted audit. Cited: `test/mutation-baseline.json`; `run-mutation-audit.mjs --only`. |
| RI3 | P7 | covered — configured commands plus the manual-QA item no command can supply. Cited: `verification.yaml` commands + `manual_qa.required_fields`. |
| RI4 | P3 | covered — no new `*:test` script; coverage lands in the existing harnesses. Cited: conformance rule `r22-every-suite-runs-in-ci`. |
| RI5 | P1 (schema), P2 (conditional), P3 (fixture) | covered — cross-cutting by design; the upgrade guarantee is made in three places and is only real if all three hold. Stated cross-cutting per `requirement-phase-mapper`. |
| RI6 | P2 | covered — the archive-holds-closed-rows-only rule is mechanical; the never-loaded rule is written into the schema description. Cited: brief RI6, A4. |
| RI7 | P7 | covered — `npm run build`, then byte-compare the synced schema. Cited: `CLAUDE.md` rule 2; `build-bundle.mjs:109-113`. |
| RI8 | P7 | covered — CHANGELOG line, no version bump. Cited: brief RI8; `release.yml` runs `npm version` itself. |

## Assumptions Verified

`plan-assumption-verifier`. Every `A` ID from the brief, cross-checked against repo evidence this
session. None required conversion to a `Q`.

| Assumption ID | Status | Evidence / Question |
|---|---|---|
| A1 | evidence-backed | `find workflow/artifacts -iname "*r20*" -o -iname "*ledger-closure*"` returns only `briefs/wp-r20-ledger-closure-v1.md` — no prior chain for this slug, so version 1 is correct and no ID renumbering is in play. |
| A2 | evidence-backed | `git merge-base --is-ancestor 881441d HEAD` → true; `git log --oneline -1 881441d` → `feat(init): generic AGENTS.md fallback (WP-R23)`. `gh pr list` → PR #68, head `feat/wp-r23-agents-md-fallback`, base `release/1.1.0`, still open. Stacking is therefore required, not preferred. |
| A3 | evidence-backed | Highest ID in the live ledger is OI-92 (`grep -oE "^  - id: OI-[0-9]+" \| sort -n \| tail -1`), so OI-93..OI-95 are the next free sequential IDs. |
| A4 | evidence-backed | `grep -rln "finding-quality-archive" src/workflow/` shows the precedent archive IS named by four phase skills (reflect, review, test, ship) because rotation is written there. So "never loaded" cannot mean "never named". A4's reading — no phase skill or validator reads the archive *for work*, while `check-open-items.mjs` reads it to validate it — is the only reading consistent with the precedent, and Phase 1 writes it into the schema description rather than leaving it as prose. |

## Repo Impact Map

| File | Change type | Manifest IDs | Notes |
|---|---|---|---|
| `src/workflow/schemas/open-items.schema.yaml` | modify | R2, R3, RI1, RI5, RI6 | `kind` → enum of two; `resolution` + `closed_in_run` declared; `additionalProperties: false`; neither new field added to `required`. |
| `src/workflow/validators/check-open-items.mjs` | modify | R5, RI6 | Grows from one-file to two-file. Currently 3 rules; every added error is an added rule under the ratchet. |
| `test/fixtures/lifecycle-violations/gq-…` … `gt-…` | new (4 dirs) | RI2 | One rejection fixture per new error. IDs continue the existing `gn`/`go`/`gp` sequence. |
| `test/fixtures/conformance/open-items-legacy-no-archive/` | new | RI5 | The positive control: `done` entries, no archive, must pass. A rejection-only set would leave the upgrade guarantee untested in the direction that matters. |
| `test/run-violation-tests.mjs` | modify | RI2 | Register each new fixture with its own `expect` string asserting that rule's own wording. |
| `test/run-conformance-tests.mjs` | modify | RI5 | Register the positive control. |
| `test/mutation-baseline.json` | modify | RI2 | `check-open-items.mjs` rule count rises from 3; `undefended` must stay 0; `generated` date updated. |
| `workflow/artifacts/open-items.yaml` | modify | R1, R6, R8 | Three entries appended (P4), then 70 removed (P5). |
| `workflow/artifacts/open-items-archive.yaml` | new | R2, R6 | 70 items, `kind: open-items-archive`. |
| `src/workflow/skills/follow-up-owner-assigner/SKILL.md` | modify | R4, R7 | Sweep step in Workflow + Exit Gate; the wholesale-overwrite Determinism Rule rewritten. |
| `src/workflow/skills/follow-up-owner-assigner/references/ledger-format.md` | modify | R7 | The append-only claim and its "future concern" note rewritten; archive shape documented. |
| `src/workflow/skills/follow-up-owner-assigner/references/output-schema.md` | modify | R4, R7 | Return shape gains the swept count. |
| `src/workflow/skills/lifecycle-reflect/SKILL.md` | modify | R7 | Two references (lines 77, 149) describe the ledger; extend to the two-file model. |
| `src/workflow/skills/README.md` | modify | R7 | One-line skill description no longer complete once the skill rotates. |
| `src/workflow/validators/README.md` | modify | R7 | Line 75's one-line description of `check-open-items.mjs` is made false by P2. |
| `docs/release-checklist.md` | modify | R7 | The triage line names only the live ledger; a reader triaging a release must know closed items moved. |
| `src/workflow/skills/lifecycle-ship/SKILL.md` | modify | R7 | **Added during Review, 2026-09-13 (finding F1).** Step 4b tells Ship to grep the identifier spaces for duplicate `OI-<n>`; with the ledger split, grepping the live file alone leaves the rotated half of that space unchecked. A missed R7 surface, not a scope expansion — R7 covers any doc describing this ledger, and this one describes how to search it. |
| `CHANGELOG.md` | modify | RI8 | Line under the existing 1.1.0 entry. Date untouched. |
| `dist/workflow-bundle.md`, `workflow/schemas/open-items.schema.yaml` | regenerated | RI7 | Build products, both gitignored. Never hand-edited. |

Protected-path check: `repo-profile.yaml` `paths.protected` is `.git/**`, `.env*`, `**/*secret*`.
No file above matches. No public contract is declared in config (`public_contracts: []`), and no
declared generated output (`generated_outputs: []`) — the `dist/` and `workflow/schemas/` entries are
generated in fact, which is why RI7 requires regeneration evidence rather than relying on the config.

## Source-of-Truth Strategy

`workflow/config/source-of-truth.yaml` declares `mode: optional` with `providers: []`. No external
source holds authority over this work and no update is owed.

The Notion WP-R20 page is the requirement source and is cited in the brief, but it is not a
configured provider, so `require_user_request_or_config_for_external_write: true` means no agent
writes to it. Moving the page to Done, and recording that Q1 superseded its R2, is a **user action**
and is carried as a Ship blocked handoff, not claimed.

Status: `not required`.

## Approach

Copy the shipped `finding-quality` two-file design rather than inventing a second convention, and
diverge from it in exactly one place, deliberately: `check-finding-quality.mjs` rejects a closed row
in the active file unconditionally, because it shipped with no legacy data. `check-open-items.mjs`
must reject one **only when an archive file exists**, because consumer repos have ledgers full of
`done` entries and no archive. That single conditional is the entire upgrade story, and Phase 3's
positive control is what stops a later tidying pass from "simplifying" it into symmetry.

Everything else is the precedent, followed closely: one schema with a two-value `kind`, one
validator reading both files, rotation checked in both directions, and IDs unique across the pair
rather than within each half.

## Phases

### Phase 1 - Schema: closure fields, archive kind, closed object

- **Manifest IDs:** R2 (kind only), R3, RI1, RI5 (schema half)
- Touches: `src/workflow/schemas/open-items.schema.yaml`
- Work: `kind` becomes `enum: [open-items, open-items-archive]` with a description stating why the
  kinds are distinct and that the archive is never read for work (A4). Declare `resolution` (how and
  why it closed) and `closed_in_run` (slug-vN, with `unrecorded` allowed for backfill only, carrying
  `pending-setup.schema.yaml`'s wording verbatim per Q2). Set `additionalProperties: false` on the
  item object. Add neither new field to `required`.
- **Exit gate:** `node src/workflow/validators/check-open-items.mjs` exits 0 against the unmodified
  live ledger, `node src/workflow/validators/check-schema-keywords.mjs` exits 0, and
  `grep -c "additionalProperties: false" src/workflow/schemas/open-items.schema.yaml` is ≥ 1 while
  `required:` for the item object still lists exactly the six pre-existing fields.

### Phase 2 - Validator: two files, uniqueness across both, rotation both directions

- **Manifest IDs:** R5, RI5 (conditional half), RI6
- Touches: `src/workflow/validators/check-open-items.mjs`
- Work: read `open-items-archive.yaml` when present and validate it against `$id: open-items` with
  the archive kind. Add: ID uniqueness across live+archive combined; an entry present in both files
  is copied-not-moved; a non-`done` entry in the archive is unreachable; a `done` entry in the live
  ledger is an error **only when the archive file exists**; an archive present with no live ledger is
  an error (the reverse is legal and is the un-swept repo). Report counts over both files.
- **Exit gate:** `npm run validate` exits 0 against the still-unswept live ledger (70 `done`, no
  archive) — this is the upgrade guarantee executing against real data, not a fixture — and the
  validator's `details` line names both paths.

### Phase 3 - Fixtures and the ratchet

- **Manifest IDs:** RI2, RI4
- Touches: `test/fixtures/lifecycle-violations/` (4 new dirs),
  `test/fixtures/conformance/open-items-legacy-no-archive/`, `test/run-violation-tests.mjs`,
  `test/run-conformance-tests.mjs`, `test/mutation-baseline.json`
- Work: one rejection fixture per error added in Phase 2, each registered with an `expect` string
  asserting that rule's own wording — not a prefix of another rule's message, and not a filename
  (both are recorded failure modes in `run-mutation-audit.mjs`'s header). One positive control for
  the un-swept repo. No new `package.json` script.
- **Exit gate:** `npm run violations:test` and `npm run conformance:test` both exit 0 with counts
  strictly greater than this session's baselines of 210 and 48; `node test/run-mutation-audit.mjs
  --only check-open-items.mjs` reports 0 undefended at the new rule count; `git diff --stat
  package.json` is empty.

### Phase 4 - File the three WP-R23 handoff items

- **Manifest IDs:** R8
- Touches: `workflow/artifacts/open-items.yaml`
- Work: append OI-93, OI-94, OI-95 with `status: open`,
  `first_seen_run: wp-r23-agents-md-fallback-v1`, and the owners WP-R23's Reflect named (user,
  workflow owner, user). Ordered as that Reflect listed them: OI-87's under-description of the 1.1.0
  scope; Requirement Classification being unreachable in single-agent briefs; example-repo coverage
  for the `AGENTS.md` marker block.
- **Exit gate:** `check-open-items.mjs` reports exactly `25 open, 70 done, 0 blocked, 0 deferred`,
  and no ID between OI-1 and OI-95 is absent or duplicated.

### Phase 5 - The sweep

- **Manifest IDs:** R1, R2 (file), R6
- Touches: `workflow/artifacts/open-items.yaml`, `workflow/artifacts/open-items-archive.yaml`
- Work: **Ask the user before the first write** — Q3's answer approved the design and preserved a
  second, narrower ask before the ledger is rewritten, and `[safety-2]` is the reason. Then move all
  70 `done` entries into the archive, carrying each entry byte-identically apart from the added
  `closed_in_run`. Derive a real slug-vN only where the existing `resolution` prose states one
  unambiguously; everything else is `unrecorded` (Q2). Move any closure prose still sitting in
  `next_action` into `resolution` for swept items.
- **Exit gate:** live ledger reports `25 open, 0 done, 0 blocked, 0 deferred`; archive holds exactly
  70; `npm run validate` exits 0; live + archive together contain each of OI-1..OI-95 exactly once;
  live ledger `wc -c` is under 30,000 bytes, against the 92,060 measured at Plan time.

### Phase 6 - Contract amendments and terminology sweep

- **Manifest IDs:** R4, R7
- Touches: `src/workflow/skills/follow-up-owner-assigner/SKILL.md`,
  `src/workflow/skills/follow-up-owner-assigner/references/ledger-format.md`,
  `src/workflow/skills/follow-up-owner-assigner/references/output-schema.md`,
  `src/workflow/skills/lifecycle-reflect/SKILL.md`, `src/workflow/skills/README.md`,
  `src/workflow/validators/README.md`, `docs/release-checklist.md`,
  `src/workflow/skills/lifecycle-ship/SKILL.md`
- **Amended during Build, 2026-09-13.** This line originally read "`SKILL.md` + both references",
  which names two real files in prose rather than as paths — so `check-scope-fence` could not resolve
  them and reported both as outside the declared Touches. No scope changed: the same two files were
  always intended and are the ones the Repo Impact Map already listed individually. Recorded rather
  than silently edited, because the plan carries an approval.
- Work: add the sweep to the skill's Workflow (after the existing append step) and to its Exit Gate,
  stating in both that the skill moves already-closed items and never sets `status: done` itself.
  Rewrite — not soften — the "Never overwrite open-items.yaml wholesale" Determinism Rule and
  `ledger-format.md`'s "append-only from this skill's perspective" claim with its "future concern"
  note. Update the four descriptive surfaces to the two-file model.
- **Exit gate:** `grep -rn "append-only" src/workflow/skills/follow-up-owner-assigner/` returns no
  line asserting it of this ledger; `grep -n "never sets\|never decides" src/workflow/skills/follow-up-owner-assigner/SKILL.md`
  returns at least one line in Workflow and one in Exit Gate; `npm run validate` exits 0.

### Phase 7 - Rebuild, changelog, full suite

- **Manifest IDs:** RI3, RI7, RI8
- Touches: `CHANGELOG.md`; regenerates `dist/` and `workflow/schemas/`
- Work: `npm run build`. Add one WP-R20 line to the existing 1.1.0 CHANGELOG entry without touching
  its date and without bumping `package.json`. Run every suite the release runs.
- **Exit gate:** `diff src/workflow/schemas/open-items.schema.yaml workflow/schemas/open-items.schema.yaml`
  is empty; `git diff --stat package.json` shows no `version` change; all thirteen suites named in
  `.github/workflows/release.yml` exit 0.

## Dependency Order

```text
P1 (schema)
 └─> P2 (validator)          needs the archive kind to exist before it can validate one
      └─> P3 (fixtures)      needs the rules to exist before it can prove they fire
           └─> P4 (file OI-93..95)   before the sweep, so the sweep sees the final set
                └─> P5 (sweep)       needs P2's conditional already in place, or the tree
                │                    goes red the instant the archive appears
                └─> P6 (contracts)   AFTER P5: the skill currently forbids the rewrite P5
                     │               performs, so amending first would ship a licence for
                     │               a change that has not happened
                     └─> P7 (build, changelog, suites)
```

Two orderings are the ones that actually matter, and both are one-directional:

- **P2 before P5.** The conditional must be in the validator before the archive exists. Reversed,
  the first sweep creates an archive that the old validator does not know how to read.
- **P5 before P6.** The contract amendment is what makes the sweep legal. Landing it first would
  publish a rule change with nothing behind it; landing it later than P6 means P5 violates a rule
  still in force. The brief records both amendments as same-chain by the page's own instruction.

P4 could in principle run at any point before P5, but is placed immediately before it so the item
accounting in P5's exit gate has one fixed number to close against.

## Branch Strategy

- Branch: `feat/wp-r20-ledger-closure`, created from `feat/wp-r23-agents-md-fallback` at `881441d`.
  Not from `release/1.1.0`, and not from `main`.
- Why stacked: PR #68 (`feat/wp-r23-agents-md-fallback` → `release/1.1.0`) is open and unmerged, and
  both chains write `workflow/artifacts/open-items.yaml`. Branching from `release/1.1.0` would give
  this chain a ledger that does not contain the WP-R23 chain's own entries, and the sweep would then
  be performed against a file that is about to change underneath it.
- Base for the eventual PR: `release/1.1.0`, never `main`
  (`repo-profile.yaml` `branch_policy.require_non_default_branch_for_changes: true`;
  `default_branch_commit_requires_user_approval: true`). If #68 merges before this chain ships,
  rebase onto `release/1.1.0` rather than retargeting a stale base.
- Commits: one per phase, so a phase that has to be reverted is one revert. Staging is scoped to the
  phase's declared Touches (`stage_only_approved_scope: true`).
- Commit, push and PR are **Ship-owned and user-authorized**. `release.yaml` sets
  `pull_request.create_policy: user_requested_or_configured`, and no request exists. Nothing is
  committed during Build without being asked for.

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner | Manifest IDs |
|---|---|---|---|---|---|
| The sweep loses or corrupts closure reasoning while rewriting a 92KB durable record | low | high | P5's exit gate checks item-level identity across both files, not just counts; RI3's manual-QA item byte-compares the 70 moved entries. Rotation is a move, and P2 ships the check for both failure directions before P5 runs | agent | R6, RI3 |
| A new validator error lands with no fixture, so the ratchet's 0-undefended reports coverage that does not exist | medium | medium | P3 is a separate phase with its own exit gate, precisely so fixtures cannot be folded into the phase that adds the errors and silently skipped | agent | RI2 |
| A consumer repo's Reflect gate breaks on upgrade | low | high | RI5 is cross-cutting across P1/P2/P3 by design. P2's exit gate runs the real un-swept ledger through the new validator; P3 adds the positive control so a later refactor cannot quietly drop the conditional | agent | RI5 |
| `closed_in_run` is guessed rather than marked honestly for the 70 backfilled items | medium | medium | Q2, answered: `unrecorded` is valid for backfill only, carrying `pending-setup.schema.yaml`'s "never use it for a new resolution". Derivation only where the prose states a chain unambiguously | agent | R3, R6 |
| P6's contract amendment ships without P5, or vice versa, leaving a skill whose rules contradict its own workflow | low | high | Dependency Order fixes them adjacent and one-directional; P6's exit gate greps for the removed claim rather than trusting the edit | agent | R4, R7 |
| The full mutation audit is too slow to run per phase, so the ratchet is checked only at release | high | low | `run-mutation-audit.mjs --only check-open-items.mjs` scopes it to the changed validator for P3; the full audit already runs in `release.yml` | agent | RI2 |
| The sweep is executed without the second ask Q3 preserved | low | high | P5's Work step opens with the ask, and its exit gate cannot be reached without it having happened. Recorded here so Review can check it was asked, not just claimed | user | R6 |
| This merge is reported as closing 1.1.0 | medium | medium | WP-R24 is still outstanding (WP-R23 brief Q3). RI8's acceptance forbids the claim, and Ship must state the release stays open | agent | RI8 |

No risk is unmitigated, and none requires a waiver.

## Verification Plan

Built from `workflow/config/verification.yaml`. `validate` and `violations-test` are the two
configured required commands (phases: review, ship). Everything else is either a discovered command
(`allow_discovered_commands: true`) or manual QA where no command can prove the requirement.

| Manifest ID | Evidence | Owner phase | Notes |
|---|---|---|---|
| R1 | command — `check-open-items.mjs` details line reports `0 done` | P5 | The validator already prints the per-status tally; no new tooling needed. |
| R2 | command — `npm run validate` with the archive present and validating | P5 | Plus `test -f workflow/artifacts/open-items-archive.yaml` and absence of an `archive/` directory. |
| R3 | command — `npm run validate` + `check-schema-keywords.mjs` | P1 | The 39 existing `resolution` values validating under `additionalProperties: false` is the real proof. |
| R4 | review — the skill's Workflow and Exit Gate read against each other | P6 | Structural; no validator reads skill prose for this. Recorded as `review` evidence, not asserted as a command. |
| R5 | command — 4 rejection fixtures via `npm run violations:test` | P3 | Each fixture's `expect` asserts that rule's own wording. |
| R6 | manual — byte-level before/after accounting of the 70 moved entries, all 7 `manual_qa.required_fields` | P5 | No configured command can prove nothing was lost. This is the one place the chain depends on manual QA. |
| R7 | command — `grep` assertions in P6's exit gate | P6 | Absence of the append-only claim is checkable; correctness of the replacement prose is `review`. |
| R8 | command — `check-open-items.mjs` reports `25 open` and no duplicate ID | P4 | |
| RI1 | command — `ls src/workflow/schemas/*.yaml` count unchanged; registry resolves both kinds | P1 | The negative is the point: no new schema file. |
| RI2 | command — `run-mutation-audit.mjs --only check-open-items.mjs` → 0 undefended | P3 | Baseline regenerated with `--write-baseline` in the same phase. |
| RI3 | command — `npm run validate`, `npm run violations:test`; plus the R6 manual-QA item | P7 | The two configured required commands, run at the phases config names. |
| RI4 | command — `npm run conformance:test` green, `r22-every-suite-runs-in-ci` passing | P3 | Trivially satisfied if no script is added; checked rather than assumed. |
| RI5 | command — positive control fixture passes; `npm run validate` green against the un-swept ledger at P2 | P2, P3 | Verified twice, in both the fixture and the real corpus. |
| RI6 | command — rejection fixture for a non-`done` entry in the archive | P2, P3 | The never-loaded half is `review` evidence against the schema description. |
| RI7 | command — `diff` of source vs build-synced schema is empty | P7 | Regeneration evidence, per `generated_output_policy`. |
| RI8 | review — CHANGELOG entry, `package.json` version unchanged | P7 | `git diff` is the citation. |

Skipped checks: none planned. If any arises, it carries all six
`verification.yaml` `skipped_checks.required_fields` and is recorded in the verify artifact.

## Architecture Notes

- **role**: Principal Engineer

- **decision**: fixtures are their own phase (P3) rather than part of P2. The quality-gates-validator
  read is what forced this: the mutation ratchet makes "added error" and "added rule" the same event,
  and a phase that both adds errors and is judged by whether it added fixtures can report itself
  complete on the half that is easy to see. Separating them means P2's exit gate cannot be satisfied
  by a fixture that does not exist yet.

- **decision**: P5 before P6, against the more natural reading that a contract should be amended
  before it is relied on. Chosen because the alternative publishes a rule change describing a
  behavior that has not shipped, and this repo has now twice recorded that shape as its own
  silent-drift class. The window in which the skill's prose and the repo's data disagree is one
  phase long and is closed inside the same chain.

- **constraint**: R5's conditional must not be made symmetric with `check-finding-quality.mjs`.
  Written into the Approach, the P2 work item, and RI5's cross-cutting mapping, because it is the
  single line whose "simplification" silently breaks every consumer repo on upgrade.

- **constraint**: `additionalProperties: false` lands in P1, with the field declarations, not later.
  Declaring `resolution` without closing the object fixes 39 instances of a defect whose cause is
  that the object is open.

- **tradeoff**: the targeted mutation audit (`--only`) in P3 rather than a full run. Accepted: a full
  run is tens of minutes and `release.yml` already carries one. The cost is that a regression in a
  *different* validator caused by this change would not be seen until release; mitigated because P7
  runs every suite the release runs, which is what would surface it.

- **assumption Build must preserve**: A4. "Never loaded by any phase" means no phase skill or
  validator reads the archive *for work*. `check-open-items.mjs` reads it to validate it, and
  `follow-up-owner-assigner` writes to it at the Reflect gate. Build must not attempt to make the
  file unreachable.

- **downstream — Build**: ask before P5 writes (Q3). Commit per phase; commit, push and PR are not
  authorized by this plan's approval.
- **downstream — Review**: read P4's three entries as content, separate from the restructure; check
  that P5's second ask was actually made rather than recorded as made.
- **downstream — Test**: R6 is the one requirement no configured command can settle. The manual-QA
  item needs all seven fields, and "the validator passed" is not evidence that nothing was lost.
- **downstream — Ship**: WP-R24 is outstanding, so this merge does not close 1.1.0. The Notion page
  move, and recording that Q1 superseded the page's R2, are user actions and belong in a blocked
  handoff.
- **downstream — Reflect**: this chain is the first to run `follow-up-owner-assigner` under the new
  contract. Its own Reflect exercises the sweep step P6 adds — the first real test of R4, and worth
  recording as such.

## Open Questions

No blocking questions. `orchestration.blockers` is empty.

Two items carried forward, neither gating Build:

- **Q3's second ask** is not an open question about scope — it is a scheduled step inside P5, already
  answered and already placed. Listed here so it is not mistaken for a resolved item that needs no
  further action.
- **Non-blocking observation, for filing at Reflect rather than acting on here**: the
  `schema_globs` trigger category is `**/schema/**`, which does not match this repo's own
  `src/workflow/schemas/` directory. The `data-schema-designer` trigger is therefore mechanically
  false for every schema change agentsmyth makes to itself. Out of scope for WP-R20 — changing a
  glob category is a behavior change to `agent-behavior.yaml` with its own conformance surface — and
  recorded rather than fixed in passing.

## Checkpoint Approval

- Checkpoint: plan-review
- Status: approved
- User's own words (verbatim, this turn): "Plan is approved"

Scope of this approval: the seven-phase breakdown, the dependency order, the branch strategy and the
verification plan. It does not authorize a commit, a push or a PR — those stay Ship-owned and
user-requested per `release.yaml` — and it does not replace the second, narrower ask that Q3
preserved before Phase 5 rewrites the ledger.

## Exit Gate

- [x] Every active R and RI mapped to a phase — 16 IDs, `requirement-phase-mapper` run: no orphans; RI5 and R2 are multiply-mapped and both are explicitly declared cross-cutting in Requirement Coverage.
- [x] Every phase has a binary exit gate — all seven state a command, a grep, a count or a diff whose result is observable.
- [x] Verification plan covers every R and RI — 16 rows, each naming command, manual QA or review evidence; no row says "test it".
- [x] Dependency order is explicit, with the two load-bearing orderings stated and justified.
- [x] Risks have mitigation — 8 rows, none unmitigated, none requiring a waiver.
- [x] Source-of-truth handling explicit — `not required`; the Notion write is a user action in a Ship handoff.
- [x] Branch strategy explicit and does not target the default branch.
- [x] Every brief `A` ID has an `## Assumptions Verified` row — 4 of 4 evidence-backed, none converted to a Q.
- [x] User approved the plan — plan-review approved 2026-09-13, recorded verbatim in `## Checkpoint Approval`. `orchestration.status: ready-for-next-phase`, `next_phase: build`.

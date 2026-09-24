---
slug: wp-r18-delta-upgrades
version: 1
artifact: ship
status: ready-for-next-phase
created: 2026-09-24
updated: 2026-09-24
manifest_ids: [R1, R2, R3, R4, R5, R6, RI1, RI2, RI3, RI4, RI5, RI6, RI7, RI8, RI9, RI10, RI11, RI12, RI13, RI14, RI15, RI16, RI17, RI18, RI19, RI20, RI21]
upstream:
  - workflow/artifacts/briefs/wp-r18-delta-upgrades-v1.md
  - workflow/artifacts/plans/wp-r18-delta-upgrades-v1.md
  - workflow/artifacts/tasks/wp-r18-delta-upgrades-v1.md
  - workflow/artifacts/reviews/wp-r18-delta-upgrades-v1.md
  - workflow/artifacts/verify/wp-r18-delta-upgrades-v1.md
orchestration:
  phase: ship
  status: ready-for-next-phase
  next_phase: reflect
  blockers: []
  user_checkpoint: ship-review
---

# WP-R18 Version-Aware Delta Upgrades - Ship

## Inputs

- Review: `hold`, remediated. 77 council findings; 6 P0 and 17 P1 fixed under the user's
  "Fix them all" scope approval.
- Verify: `ship`. 26 of 27 manifest IDs pass, 1 partial (RI18, platform-bound), 0 fail.
- `workflow/config/release.yaml`: `pr.create_policy: user_requested_or_configured`,
  `evidence: pr_url_or_blocked_handoff`; `ci.required: false`.
- Scope for this ship, set by the user: **Notion, CHANGELOG, PR. No version bump.**
- Base check (ship step 4a): `git rev-list --left-right --count origin/release/1.1.0...HEAD` →
  `0 20`. The base has not advanced, so no identifier reconciliation was required under step 4b.

## Ship Status

- Recommendation: **ship**
- Review result: `hold`, fully remediated; every P0 and P1 closed and pinned
- Verification recommendation: `ship`
- PR / CI: **PR #72 open** against `release/1.1.0` —
  https://github.com/JeelVankhede/agentsmyth/pull/72. CI is `required: false` in release config;
  `ci.yml` runs the full suite set on the PR.
- Source-of-truth: **updated** — both Notion pages corrected, see below
- Release: **not dispatched, deliberately.** No version bump, no merge, no `release.yml`.

## Requirement Coverage

| Manifest ID | Status | Evidence | Notes |
|---|---|---|---|
| R1 | shipped | verify R1 | digests recomputed independently of the CLI's own implementation |
| R2 | shipped | `upgrade-path:test` | six states, all fixtured |
| R3 | shipped | verify R3 | backup byte-identical before any overwrite |
| R4 | shipped | `upgrade-path:test` | one item per drifted file per upgrade |
| R5 | shipped | W6/W7 | descriptors validate at load; unknown op is a hard error |
| R6 | shipped | `conformance:test` | host is CLI-invoked and wired |
| RI1 | shipped | `npm run validate` | additive for fields; the enum widening is stated as forward-only, not claimed additive |
| RI2 | shipped | `git diff package.json` | `dependencies` byte-identical |
| RI3 | shipped | `mutation:audit` 0/234 | every new validator error carries its own fixture |
| RI4 | shipped | X2/X3 | atomic write, with the containment the first version lacked |
| RI5 | shipped | S1-S5b, Y1 | including `newly-governed`, the sixth state the requirement originally omitted |
| RI6 | shipped | verify RI6 | corrupted global tree refreshed before the upgrade proceeded |
| RI7 | shipped | `npm run validate` | backups outside every recursive sweep |
| RI8 | shipped | verify RI8 | a foreign file in `workflow/config/` is never copied |
| RI9 | shipped | I1-I4 | marker survives pruning; no id re-issue |
| RI10 | shipped | inspection | item names its true target config |
| RI11 | shipped | `check-pending-setup` | router step 9 plus the new `resolved_by` value |
| RI12 | shipped | `conformance:test` | CLI-invoked, schema-capable host |
| RI13 | shipped | verify RI13 | four line-ending variants, one digest. Windows half modelled not run — see Risk |
| RI14 | shipped | verify V1 | enforcement now fires on a skipped step 5f; the first attempt could not |
| RI15 | shipped | inspection | no shipped surface names `init` as the upgrade action |
| RI16 | shipped | verify V2 | comparison fires with the validator run from the global tree, as a consumer runs it |
| RI17 | shipped | 252/252 bundle blocks | generated output verified by comparison, not by having run a build |
| RI18 | **partial** | verify RI18 | six and seven verified by execution; the eight branch needs a non-darwin platform |
| RI19 | shipped | verify RI19, Y3 | content outside markers survives; inside is replaced |
| RI20 | shipped | X6, verify RI20 | an open item's backup survives a second upgrade |
| RI21 | shipped | Z1 | polyrepo backup lands inside the member repo, visible to `git status` |

## PR / CI Readiness

PR #72, `feat/wp-r18-delta-upgrades` → `release/1.1.0`, 20 commits, 0 behind base.

Full suite set, all run on this tree before the PR was opened:

| Gate | Result |
|---|---|
| `npm run validate` | exit 0, 26 checks |
| `upgrade-path:test` | 138/138 |
| `violations:test` | 223/223, attribution sweep 107/107 |
| `conformance:test` | 49/49 |
| `setup-checks:test` | 20/20 |
| `root-resolution:test` | 24/24 |
| `agents-md:test` | 33/33 |
| `mutation:audit` | 0/234 undefended |
| published-tarball rehearsal | 9/9 against real `@jeelvankhede/agentsmyth@1.0.1` |

## Release Readiness

**Not dispatched, and that is the instruction rather than an omission.** The user scoped this ship
to Notion, CHANGELOG and PR, explicitly excluding the version bump.

- `package.json` stays at **1.0.1**. `release.yml` owns the bump and `docs/release-checklist.md`
  forbids pre-bumping.
- The `[1.1.0]` CHANGELOG heading keeps its placeholder date **2026-09-08**. The checklist requires
  the real dispatch date, and dispatch has not happened; writing today's date would assert a
  dispatch that did not occur.
- No merge to `release/1.1.0`; the PR is the merge request.
- `warn-until-<version>` strip step is a no-op for this release — zero `warn-until-1.1.0` markers
  exist in `src/`.

**Consequence worth carrying, not hidden in a footnote:** every version-stamp behaviour this
package ships was exercised at 1.0.1 → 1.0.1, because the bump is absent by design. The *mechanism*
is proven — descriptor span selection, the format-version hard stop, stamp refresh — and a real
version step is not. The first genuine step happens at dispatch.

## Source-of-Truth Status

**Updated.** The Review recorded this as `not required` in the plan, which was the wrong status —
`source-of-truth.yaml` reserves that value for work with no external record to update, and the same
paragraph described two pages known to be stale. Corrected here by doing the update rather than by
re-statusing and handing it on.

| Field | Value |
|---|---|
| provider_or_source_type | Notion |
| source_item_or_lookup | WP-R18 page `3ab972bdebbb81b7bd4ef20bd97377a3`; 1.1.0 release plan `3ab972bdebbb81ef88b7f3cf7e500d79` |
| fields_or_sections_to_update | WP-R18: Resolved, Approach, spike scope, Status, PR, Notes. Release plan: Open-before-Build checkbox, Release Status table, Remaining-to-dispatch |
| exact_handoff | performed directly, not handed off |
| affected_manifest_ids | R1, R3, R5, RI7, RI18 |
| owner | this chain |
| risk_if_not_updated | the page recorded a manifest format, location and validator host that never shipped |
| ship_impact | none remaining |

**What was actually wrong on the WP-R18 page**, all now corrected in place with the superseded text
struck rather than deleted, so the decision history survives:

1. Manifest recorded as **JSON at `workflow/config/provenance.json`**. Shipped as **YAML at
   `workflow/provenance.yaml`** — deliberately outside `config/`, which `check-config` walks
   recursively and would schema-validate anything parked in, including a backup of an old-shape
   config.
2. Backups recorded at **`.agentsmyth/backups/`**. Shipped at **`workflow/backups/`**, resolved
   through the git working tree. `.agentsmyth/` is the setup scaffold sentinel and is deleted when
   setup completes, so a backup there would not survive.
3. Validator host recorded as **`check-config`**. It is **`check-lifecycle`** — `check-config` is
   never invoked from a consumer's `agentsmyth check`, so a rule placed there would never run.
4. "A file whose hash matches is **overwritten silently**" — superseded by the user's Q1 decision:
   **key-level delta**, never whole-file replace.

The research spike page is left as written. It is a dated record of what was known on 2026-09-21,
not a live contract, and the three questions it left open are answered on the work-package page.

## Risk And Rollback

- Residual risk: **RI18's eight-governed-artifact branch is unexercised.** Needs a non-darwin
  platform with a tracked hook and the Copilot adapter placed. Six and seven are verified by
  execution; eight by code reading. Owner: a CI matrix job or an explicit waiver, before the 1.1.0
  tag.
- Residual risk: **RI13's Windows half was modelled, not run** — CRLF constructed on darwin rather
  than through git's own checkout filter under `core.autocrlf`.
- Residual risk: **the version step is untested**, per Release Readiness above.
- Rollback trigger: a consumer reports a governed file overwritten without a backup, or a backup
  that a still-open reconcile item names failing to resolve.
- Rollback action: the PR is not merged, so rollback before merge is closing it. After merge:
  revert the merge commit on `release/1.1.0`. The feature is inert for any repo with no
  `workflow/provenance.yaml`, so a consumer who has not run `init` or `upgrade` on the new version
  is unaffected by construction.
- Rollback owner: workflow owner.
- Evidence required to execute: the reported repo's `workflow/provenance.yaml` and
  `workflow/config/pending-setup.yaml`, plus the `upgrade` output that produced the state.

## Waivers

Two finding-quality rows stay `pending` past Ship. Both are waived by ID here rather than left open,
and neither waives false evidence — both are real, recorded gaps with an owner and a next action.

The other three pending rows are **not** waived: FQ-57, FQ-58 and FQ-59 were the Notion handoff, and
this phase settled them by doing the update. A handoff waived at the phase that owns it is just a
deferral with paperwork.

| waived_gate_or_requirement_id | reason | residual_risk | owner | follow_up_action | approval_evidence |
|---|---|---|---|---|---|
| FQ-80 (council finding F24) / RI18 | RI18's eight-governed-artifact branch needs a non-darwin platform with a tracked hook and the Copilot adapter placed. Every environment available to Review, Test and Ship was darwin. Six and seven are verified by execution; eight by code reading only | One of three counts in an acceptance restated mid-chain rests on nobody having run it. Bounded: the conditional logic is shared with the two branches that were executed, so a defect specific to the eight branch would have to live in the platform predicate itself | workflow owner — a CI matrix job on a non-darwin runner, or explicit acceptance before the 1.1.0 tag | Add a non-darwin job to `ci.yml` asserting the manifest entry count, or accept the branch as code-read-only and record that on the release page | User instruction this turn scoping ship to Notion, CHANGELOG and PR, which excludes the platform work; the gap is carried forward rather than silently closed |
| FQ-63 (council finding F7) / RI16 | OI-105's ledger closure is a Reflect duty by convention — the live ledger holds no closed item — and it had to follow the RI16 fix rather than precede it. Closing it at Review would have recorded a repair that had not happened, and Ship is still the wrong phase | `open-items.yaml` continues to carry OI-105 as `open` with an imperative next action while its fix has shipped, so a reader of the ledger alone is told work remains that does not | Reflect | Rotate OI-105 to `open-items-archive.yaml` during Reflect, citing the RI16 fix and the Test-phase V2 finding that made it real | Recorded in the Review artifact's routing and in Verify's Finding Quality Closure section; carried here rather than closed early |

## Blocked Handoff

none

## Architecture Notes

- role: Senior DevOps
- decision: Ship the PR without the version bump, as instructed. The two are genuinely separable —
  `release.yml` owns the bump and reads it at dispatch — so nothing in this PR depends on the
  version having moved. The cost is that the version-step path stays untested until dispatch, which
  is recorded above rather than absorbed.
- decision: Perform the Notion update rather than re-status it to `blocked` and hand it to a later
  phase. The Review routed it to Ship as a handoff; Ship is the phase, and a handoff to nobody is
  just a deferral. The corrections were four factual errors about what shipped, which is exactly
  what a stale source-of-truth record looks like.
- constraint: `release.yaml` sets `pr.create_policy: user_requested_or_configured`. The PR was
  opened on the user's explicit instruction in this turn, which is the "user_requested" half.
- constraint: CHANGELOG date and `package.json` version are both dispatch-time values. Writing
  either now would assert a release that has not happened.
- downstream: Reflect owns the OI-105 ledger closure (after the marker-check fix, not before), the
  council process defects, two enum gaps found while working (`cap_source` has no value for a
  user-raised cap; `closed_in_phase` has no member for a return to Build), and the question of
  whether the three marker-bounded writers want one shared primitive rather than three hand-rolled
  implementations of the same idea — two of this chain's four late bugs were in that pattern.

## Checkpoint Approval

- Checkpoint: ship-review
- Status: approved
- User's own words (verbatim, this turn): "Continue to reflect"
- Approved: 2026-09-24, after the ship result was presented — PR #72 open, both Notion pages
  corrected, CHANGELOG closed, two waivers recorded by ID, and the version step explicitly noted as
  untested. Directing the chain past Ship is acceptance of that state.
- **What this approval does and does not cover.** It accepts the ship decision and releases Reflect.
  It is not approval of the PR's contents — PR #72 is still open and unreviewed, and merging it is a
  separate act. It does not accept the two waivers as closed: FQ-80 and FQ-63 remain waived-with-
  owner, and FQ-80 in particular still needs a non-darwin runner or an explicit acceptance before
  the 1.1.0 tag.
- The earlier instruction, "Ship it, no version bump yet. Notion, changelog and PR. That's it", is
  what SCOPED this phase. It is recorded separately from the approval above because scoping work and
  accepting its result are different acts, and collapsing them is how a checkpoint stops meaning
  anything.

## Exit Gate

- [x] Recommendation is ship / hold / hold-with-waiver — **ship**.
- [x] Every R and RI has a coverage row — 27 rows, 26 `shipped` and 1 `partial` (RI18), none
      `deferred`, `blocked` or `waived`.
- [x] Rollback trigger and action defined — and the useful part is that the feature is inert for any
      repo without `workflow/provenance.yaml`, so a consumer who has not upgraded is unaffected by
      construction rather than by procedure.
- [x] All configured gates checked or marked not applicable with config reference.
      `release.yaml` `pr.required: true`, `create_policy: user_requested_or_extended` — satisfied by
      PR #72, opened on the user's explicit instruction. `ci.required: false` — `ci.yml` still runs
      the full suite set on the PR. Release/deployment gates not exercised: dispatch is deliberately
      out of this ship's scope, recorded under Release Readiness.

## Next Phase

Reflect — after PR #72 merges.

Reflect's queue is already written down rather than left to be reconstructed: the OI-105 ledger
closure (which had to follow the RI16 fix rather than precede it), the two council process defects
from the brief, the two enum gaps found while working (`cap_source` has no value for a cap the user
raised in session; `closed_in_phase` has no member for a return to Build), the premature `resolution`
lines on three archived finding-quality rows, and the question of whether the three marker-bounded
writers want one shared tested primitive — two of this chain's four late bugs lived in that pattern.

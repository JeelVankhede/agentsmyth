---
slug: wp-r25-prerelease-hardening
version: 1
artifact: ship
status: ready-for-next-phase
created: 2026-10-05
updated: 2026-10-05
manifest_ids:
  - R1
  - R2
  - R3
  - R4
  - R5
  - R6
  - R7
  - R8
  - R9
  - R10
  - R11
  - RI1
  - RI2
  - RI3
  - RI4
  - RI5
  - RI6
  - RI7
  - RI8
  - RI9
  - RI10
  - RI11
  - RI12
upstream:
  - workflow/artifacts/briefs/wp-r25-prerelease-hardening-v2.md
  - workflow/artifacts/plans/wp-r25-prerelease-hardening-v1.md
  - workflow/artifacts/tasks/wp-r25-prerelease-hardening-v1.md
  - workflow/artifacts/reviews/wp-r25-prerelease-hardening-v1.md
  - workflow/artifacts/verify/wp-r25-prerelease-hardening-v1.md
orchestration:
  phase: ship
  status: ready-for-next-phase
  next_phase: reflect
  blockers: []
  user_checkpoint: ship-review
---

# WP-R25 Pre-Release Hardening - Ship

## Inputs

- Verify `workflow/artifacts/verify/wp-r25-prerelease-hardening-v1.md` — recommendation `ship`,
  23 of 23 active IDs pass, 4 skipped checks none of which blocks Ship.
- Review `workflow/artifacts/reviews/wp-r25-prerelease-hardening-v1.md` — recommendation `hold`,
  22 findings. **All 22 were remediated in Phase 8 before Test ran**, and
  `workflow/artifacts/finding-quality.yaml` carries no pending row for this run. Review's `hold` is
  therefore satisfied rather than overridden; the ship gate's "unresolved blocking findings" stop
  condition does not apply.
- `workflow/config/release.yaml` — `release.required: false`, `owner: user`,
  `default_recommendation_when_no_release_gate: ship`. The only gate marked `required: true` is
  `branch`.
- `workflow/config/source-of-truth.yaml` — `mode: optional`, `default_required: false`,
  `providers: []`.
- Gate at entry: `agentsmyth check --phase ship --slug wp-r25-prerelease-hardening` → exit 0,
  `verify → ready-for-next-phase ✓`.

## Ship Status

- Recommendation: **ship**
- Review result: `hold`, fully remediated — 22 of 22 findings fixed with evidence, no waiver used
- Verification recommendation: `ship`
- PR / CI: not created, not required (`pull_request.required: false`,
  `create_policy: user_requested_or_configured`; the user has not requested one). CI provider is
  `none` in config, though `.github/workflows/ci.yml` runs on push and would exercise all seventeen
  suites once this branch is pushed.
- Source-of-truth: **not required** by config. One recommended-but-unconfigured handoff is recorded
  below rather than silently dropped.
- Release: **not performed, and not this phase's to perform.** The release is a `workflow_dispatch`
  on `.github/workflows/release.yml` with a `bump` input, owned by the user.

## Requirement Coverage

| Manifest ID | Status | Evidence | Notes |
|---|---|---|---|
| R1 | shipped | verify R1; `init-prepare-interop:test` 56/56 | Stale-tree detection is stamp-based. Residual recorded, not closed: rebuilt source at an unchanged version is invisible to a stamp, reachable only in development. |
| R2 | shipped | verify R2; `upgrade-path:test` husky blocks, six real `git commit` runs | |
| R3 | shipped | verify R3; `tuning-merge:test` 18/18; nine rejection fixtures | |
| R4 | shipped | verify R4; `checkpoint-approval:test` 13/13 incl. both advertised remedies | |
| R5 | shipped | verify R5; `prepare` installs 5/5 templates into the definitions tree | **Host honouring is NOT shipped-and-proven** — see Residual risk. |
| R6 | shipped | this artifact; `CHANGELOG.md` `[1.1.0]` dated and extended to cover the remediation | Release copy was Review's one unread surface; closed here. |
| R7 | shipped | verify R7 | |
| R8 | shipped | verify R8; linked-worktree scenario | |
| R9 | shipped | verify R9; `path-containment:test` 21/21 | |
| R10 | shipped | verify R10; `commit-coverage:test` 8/8 incl. the `--staged` leg | |
| R11 | shipped | verify R11; OI-69 re-derived against the published 1.0.1 | |
| RI1 | shipped | `validate` over 33 historical ship artifacts and 4 examples | Carve-out went unused — no required field was added anywhere. |
| RI2 | shipped | `init-prepare-interop:test` K–O | |
| RI3 | shipped | `render-adapters: adapter shims are current` | |
| RI4 | shipped | `npm run build` leaves no diff in generated paths | |
| RI5 | shipped | `violations:test` 239/239, attribution 123/123 | Every rule added this chain carries its own fixture. |
| RI6 | shipped | `dependencies: {}`; `npm ls --omit=dev --depth=0` prints `(empty)` | |
| RI7 | shipped | `upgrade-path:test` X5, X5b, X6, X7, X8, HM1–HM5 | |
| RI8 | shipped | `conformance:test`; the CLI records and never prompts | |
| RI9 | shipped | `violations:test` fixture `fv` | |
| RI10 | shipped | `agents-md:test` 33/33; 4 global gate files installed in the consumer trial | OI-115 (delivery parity) stays open by design. |
| RI11 | shipped | `upgrade-path:test` HM1 and HM5 | |
| RI12 | shipped | `conformance:test`; four callers exercised by the husky blocks | |

23 of 23 shipped. None deferred, none blocked, none waived.

## PR / CI Readiness

**No PR exists, and none was created.** `pull_request.required: false` and
`create_policy: user_requested_or_configured`; the user has not requested one, and opening a PR is
not an action this phase takes on its own initiative.

Repository state, inspected rather than assumed:

| Fact | Value |
|---|---|
| Current branch | `feat/wp-r25-prerelease-hardening` (non-default — satisfies `require_non_default_branch_for_changes`) |
| Working tree | clean |
| Upstream tracking branch | **none — this branch exists only locally** |
| Commits not on any remote | 27 |
| `origin/main` vs local | local 150 ahead, `origin/main` 0 ahead |
| Has `origin/main` advanced since divergence? | **No.** `git log origin/main --not HEAD` is empty |
| Open PRs | none |

Step 4a of the ship skill requires the remote comparison unconditionally, and that is why it was
run: whether the base advanced is the thing being checked, so making the check conditional on the
answer leaves it to be triggered by someone noticing. It has not advanced, so the identifier-collision
sweep of step 4b has nothing to reconcile — no `OI-<n>`, `WP-R<n>` or `-v<N>` space was touched by a
merge, because there was no merge.

**Nothing is pushed.** Everything below depends on the user pushing this branch; until then CI has
not run on this work, which is the single largest piece of evidence this artifact does not have.

## Release Readiness

`release.required: false` with `default_recommendation_when_no_release_gate: ship`, so the
recommendation is not contingent on a release having happened. What the release *will* need, in order:

1. **Push the branch.** CI (`.github/workflows/ci.yml`) then runs all seventeen suites including the
   two added this chain. Nothing in this artifact substitutes for that.
2. **Merge to `main`**, or accept that `release.yml` pushes the dispatched ref to `main` itself —
   `git push origin HEAD:main` is one of its steps.
3. **Leave `package.json` at `1.0.1`.** `release.yml` runs `npm version <bump>` as its own step, so
   the committed version must be the one being released FROM. Pre-bumping double-bumps and the
   intended version never exists. This is recorded because an earlier statement of mine in this
   chain's session got it backwards.
4. **Dispatch `release.yml`** with `bump: minor` to produce 1.1.0.

Done in this phase:

- `CHANGELOG.md` `[1.1.0]` date set from the placeholder `2026-09-08` to **2026-10-05**.
  **Assumption, stated because it is an assumption:** dispatch happens on 2026-10-05. If it slips,
  this date is wrong and must be corrected before dispatch — the workflow does not write it.
- `CHANGELOG.md` `[1.1.0]` extended with seven `Fixed` entries covering the Review remediation.
  Review's skipped-check table named release copy as its one unread surface and warned it "may
  overstate what shipped"; the opposite was true — it described Phases 1–3 and said nothing about the
  22 findings fixed before release. Understating is the kinder failure and still a wrong changelog.
- Deprecation windows checked: `grep -rn "warn-until-1.1.0" src/` is empty, so this release closes
  none. Six `warn-until-1.2.0` declarations remain open and are correctly untouched.
- `npm pack --dry-run`: 45 files, 439.9 kB packed. The five council-member templates ship both as
  files under `src/assets/adapters/` and inside `dist/workflow-bundle.md`.

## Source-of-Truth Status

**not required** — `source_of_truth.mode: optional`, `default_required: false`, `providers: []`.

One handoff is recorded anyway, because "not required by config" is not the same as "nothing to do",
and this chain began with the user asking about exactly this surface:

| Field | Value |
|---|---|
| provider_or_source_type | Notion (not a configured provider; `providers: []`) |
| source_item_or_lookup | The release/roadmap pages tracking 1.1.0 and WP-R25 |
| fields_or_sections_to_update | WP-R25 status → shipped; the 22-finding Review remediation and its Phase 8; OI-112, OI-113 and OI-114 → done |
| owner | user |
| exact_handoff | WP-R25 pre-release hardening is complete and verified. Review returned `hold` with 22 findings (4 critical); all 22 were fixed before Test, with each of the four criticals carrying a regression case that fails when its fix alone is reverted. OI-112 (stale global definitions tree), OI-113 (gate hook in husky's regenerated directory) and OI-114 (council model/effort parameter) are resolved and closed. OI-115 (gate delivery parity) remains open by design. Still outstanding and not automatable: whether a host actually honours the rendered council-member definition, the four non-Claude hosts, and Windows — see `docs/release-checklist.md`. |
| risk | The tracker says less than the repository does, so a reader planning the next release under-counts what 1.1.0 contains and may re-derive work already done. |
| ship_impact | no |
| affected_manifest_ids | R6, R11 |

Not performed here: writing to Notion is an external write, and
`update_policy.require_user_request_or_config_for_external_write: true` with no provider configured.
The copy above is ready to paste.

## Risk And Rollback

**Residual risk**, in the order I would worry about it:

1. **Whether a host honours the rendered council-member definition is unverified.** This is R5's
   central claim — that a capability tier is a parameter rather than a wish. Two validators enforce
   that the definition exists and that the record names it; neither can observe the host resolving
   it. If Claude Code ignores `model` and `effort`, every mechanical check still passes and the
   feature is decorative. Unobservable from this repository by construction; first entry in
   `docs/release-checklist.md`'s manual section. **Not waived** — nobody has accepted this risk; it
   is stated so the user can decide before or after dispatch.
2. **Four of five supported tools have never run a council member.** Templates install and are
   required; execution on Codex, Copilot, Cursor and Windsurf is untested.
3. **Windows is untested end to end.** The traversal fix is proven under `node:path/win32`
   semantics, not on Windows. Carried from Review as a skipped check.
4. **CI has not run on this work.** 27 commits are local-only. Every suite result in the verify
   artifact comes from this machine.
5. **OI-115 (gate delivery parity) remains open**, pre-existing and by design.

**Rollback**

| Field | Value |
|---|---|
| area | the published npm package `@jeelvankhede/agentsmyth` |
| risk | a consumer's `upgrade` damages their repository, or `init` links to an unusable definitions tree |
| rollback_trigger | any report of data loss under `upgrade`, or a definitions tree that `check` cannot resolve after `prepare` |
| rollback_action | `npm deprecate @jeelvankhede/agentsmyth@1.1.0 "<reason>"` to stop new installs resolving to it, then publish a patch. NOT unpublish: npm restricts it after 72 hours, and it breaks every consumer who already installed. |
| owner | user |
| evidence | the deprecation notice visible on the registry entry, and the patch version published |
| limits | Deprecation stops new resolution; it does not remove the version and does not touch installed copies. A repo already upgraded recovers from its own `workflow/backups/` and `workflow/provenance.yaml` rather than from the registry — which is the design, and is why those two exist. |

No rollback command was run, and none is claimed to have been.

## Blocked Handoff

none — the Notion update above is recorded as a recommended handoff, not a blocked one. It is not
required by config, so nothing is blocked on it.

## Architecture Notes

- role: Senior DevOps
- decision: recommend `ship` rather than `hold-with-waiver`. No waiver is recorded because no
  unresolved risk needed one: all 22 Review findings are fixed with evidence, all 23 IDs ship, and
  the four residual risks above are either unobservable from here (host behaviour, Windows, other
  hosts) or pre-existing and already tracked (OI-115). Step 6a of the skill is explicit that an
  already-fixed item must not be presented to the user as pending risk-acceptance, and a waiver for
  a risk nobody has accepted would be exactly that.
- decision: closed OI-112, OI-113 and OI-114 in this phase and rotated them to the archive. They are
  this chain's entire reason for existing and are fixed with independent evidence, so they are
  resolved scope notes rather than waivers. OI-115 stays open — it predates this chain.
- decision: edited `CHANGELOG.md` — release copy, which `update_policy.updates_belong_to_phase: ship`
  assigns here, not product code.
- constraint: the release itself is a `workflow_dispatch` owned by the user. This phase cannot and
  does not perform it, push the branch, or open a PR.
- constraint: `ci.provider: none` in config while `.github/workflows/ci.yml` exists and runs on
  push. The config understates the real CI, and the honest reading is that no CI evidence exists yet
  because nothing is pushed.
- tradeoff: the CHANGELOG date is set to 2026-10-05 rather than left as a placeholder. A placeholder
  ships a wrong date silently; a real date is wrong only if dispatch slips, and visibly so.
- assumption Reflect must preserve or call out: dispatch on 2026-10-05; the four residual risks are
  stated and unwaived; `package.json` must stay at 1.0.1 until the workflow bumps it.
- downstream: Reflect should examine two things this chain surfaced about its own process — that the
  Phase 8 completion claim was wrong when first made and was corrected only because the user asked,
  and that 154 ledger rows have settled proved-real with zero noise, which says as much about how
  findings are recorded as about their quality.

## Checkpoint Approval

- Checkpoint: ship-review
- Status: approved
- User's own words (verbatim, this turn): "Continue to reflect"
- Approved: 2026-10-05, after the ship result was presented — recommendation `ship`, 23 of 23
  requirements shipped with no waiver, OI-112/113/114 closed, the CHANGELOG dated 2026-10-05 and
  extended to cover the remediation, and four residual risks stated and explicitly unwaived.
  Directing the chain past Ship is acceptance of that state.

**What this approval does and does not cover.** It accepts the ship decision and releases Reflect.
It does NOT authorize pushing the branch, opening a pull request, or dispatching `release.yml` —
those were named as explicit user actions when the decision was presented, and nothing in "continue
to reflect" speaks to them. The branch remains local with 27 unpushed commits and no CI run against
this work.

It also does not convert the four residual risks into accepted risk. They are unwaived by design:
whether a host honours the rendered council-member definition, the four non-Claude hosts, Windows,
and the absent CI run all remain open questions recorded in `docs/release-checklist.md`. Approving
the ship decision is not the same as having answered them, and no waiver claims otherwise.

## Exit Gate

Checked against `lifecycle-ship`'s own list rather than asserted:

- Ship artifact exists at `workflow/artifacts/ship/wp-r25-prerelease-hardening-v1.md`. ✓
- Recommendation is exactly `ship`. ✓
- Requirement coverage lists every active `R` and `RI` — 23 rows for 23 ids,
  `check-manifest-coverage: ok`. ✓
- `ship` has evidence for every configured required gate: `branch` is the only gate marked
  `required: true` and is satisfied by a clean tree on a non-default branch;
  `generated_output` is `when_changed_or_configured` and is evidenced by the verify artifact's
  regeneration-and-diff check. No active unwaived blocked handoff. ✓
- Source-of-truth status is explicit: **not required**, with a recommended handoff recorded. ✓
- PR/CI status is explicit, including that nothing is pushed and no CI has run. ✓
- Rollback trigger, action, owner, evidence and limits are explicit, and no rollback command was
  run. ✓
- `orchestration.phase` is `ship`, status is `ready-for-next-phase`, `next_phase` is `reflect`. ✓
- The recommendation matches `release-readiness-gate`'s aggregation — `check-release-readiness: ok`
  across every ship artifact in the tree. ✓
- `check-waivers: ok` — trivially, since this artifact records no waiver. No waiver was needed: all
  22 Review findings are fixed, and a waiver for a risk nobody has accepted would misrepresent the
  four residual risks as settled. ✓
- `check-evidence-citations: ok` over 627 evidence rows across the tree. ✓

Not satisfied, and deliberately so: the `ship-review` checkpoint is `pending`, which is why
`check-lifecycle --phase reflect` currently exits 1. That is the gate doing its job, not a defect.

## Next Phase

Reflect — after this checkpoint is approved. It does not wait on the release: Reflect examines the
chain, and the dispatch is the user's to time.

Reflect's queue, written down rather than left to be reconstructed:

- **The Phase 8 completion claim was wrong when first made.** I reported all 22 findings resolved
  while F8's and F13's second halves had never landed, and it was caught because the user asked
  "are you sure", not by any step in the process. The durable fix was auditing each Fix line at
  CLAUSE level, which then found four more untested clauses. Reflect should decide whether that
  decomposition belongs in the Review or Test contract rather than in one chain's memory.
- **154 finding-quality rows have settled `proved-real` with zero `noise`.** A 100% rate across the
  whole history says as much about how findings are recorded as about how good they are. Either the
  councils are unusually accurate, or `noise` is a verdict nobody reaches for.
- **A checklist entry is not coverage until something executes it.** `docs/release-checklist.md`
  described F5's double-edit rehearsal before 1.0.1 shipped and the defect shipped anyway. The new
  manual section states the rule; Reflect should consider whether anything enforces it.
- **The mutation ratchet is hostile to concurrent work**, and I created that hazard twice in one
  phase. It mutates validator source in place, so any edit or commit alongside it can clobber a fix
  and invalidates the result either way. A guard — a lock file, or a refusal on a dirty tree — would
  cost less than the two discarded runs did.
- **`agentsmyth doctor` is a verb with a help entry and no implementation.** It is the natural home
  for the stale-global-install diagnosis that currently has to be done by hand, and this chain gave
  it a second customer: explaining a `check-config` failure caused by old schemas rather than bad
  config.
- **Two enum gaps carried from WP-R18 and still unfixed:** `cap_source` has no value for a cap the
  user raised in session, and `closed_in_phase` has no member for work that returns to Build. This
  chain's Phase 8 was exactly that shape and had to record `review`.
- **`ci.provider: none` in `release.yaml` while `.github/workflows/ci.yml` runs on every push.** The
  config understates the real CI, which made this artifact's PR/CI section read as thinner than the
  truth.

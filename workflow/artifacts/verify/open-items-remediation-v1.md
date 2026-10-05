---
slug: open-items-remediation
version: 1
artifact: verify
status: ready-for-next-phase
created: 2026-09-08
updated: 2026-09-08
manifest_ids:
  - R1
  - R2
  - R3
  - R4
  - R5
  - R6
  - R7
  - R8
upstream:
  - workflow/artifacts/briefs/open-items-remediation-v1.md
  - workflow/artifacts/plans/open-items-remediation-v1.md
  - workflow/artifacts/tasks/open-items-remediation-v1.md
  - workflow/artifacts/reviews/open-items-remediation-v1.md
orchestration:
  phase: test
  status: ready-for-next-phase
  next_phase: ship
  blockers: []
  user_checkpoint: none
---

# Open-Items Remediation (pre-1.1.0) — Verification

## Inputs

- Review v1 — recommendation `pass`, six findings, zero open.
- Task artifact — Build complete across Phases 1–8, R1–R8.
- `workflow/config/verification.yaml` — two required commands for this phase (`npm run validate`,
  `npm run violations:test`); `record_not_run_as_risk: true`.
- Branch `chore/open-items-triage-1.1.0` at `ea15131`, 21 commits ahead of `release/1.1.0`,
  PR #66 open. Working tree clean.

This chain is Standard, so Test was skippable with a waiver. It was not skipped. The evidence was
already in hand and a waiver would have bought nothing but a weaker record — and R6 and R7 have
never been through a Test phase at all, having been recorded retroactively.

Every row below was produced by running the check named in it during this phase. Where a result
was established earlier in the chain and not re-run, the row says so rather than restating it as
though it were fresh.

## Automated Checks

| Command | Outcome | Evidence |
|---|---|---|
| `npm run validate` | pass, exit 0 | Required by `verification.yaml` for this phase. Includes `check-artifacts` against the real corpus with an empty baseline. |
| `npm run violations:test` | pass — 210/210, attribution 93/93 | Required by `verification.yaml` for this phase. 209 → 210 is fixture `jd` (R8). |
| `npm run conformance:test` | pass — 48/48 | 46 → 48 is `r8-source-precedence` and `r8-consumer-precedence` (R8). |
| `npm run mutation:audit` (full) | pass — `0/221 rules undefended` across 30 validators, `mutation-audit: ok` | R7's central claim, re-measured at head rather than read from `test/mutation-baseline.json`. |
| `npm run root-resolution:test` | pass — 21/21 | Includes the four `gitcwd-*` assertions (R5). |
| `npm run commit-coverage:test` | pass — 7/7 | Covers the rule that failed to execute on two commits (Review F2), including that a draft or blocked-for-user task artifact does not count as coverage. |
| `npm run domain-placeholders:test` | pass — 5/5 | The suite R7 added. |
| `npm run setup-checks:test` | pass — 13/13 | `check-setup-complete`, the gate the upgrade rehearsal exercised for real in Manual QA. |
| `npm run setup-refs:test` | pass — 5/5 | Setup token/config maps still resolve to their intended fields. |
| `npm run tuning-merge:test` | pass — 15/15 | Per-repo tuning merge, the feature whose four pending-setup items appended cleanly in Manual QA. |
| `npm run checkpoint-approval:test` | pass — 9/9 | Phase-gate cases for `check-lifecycle`, the validator the pre-commit hook runs per staged artifact. |
| `npm run init-prepare-interop:test` | pass — 38/38 | The suite covering the `init`/`prepare` split that Manual QA exercised against a real published tarball. |
| `npm run setup-validator-definitions-root:test` | pass — 3/3 | `definitions_root` resolution, the same two-root mechanism Review F3 reordered for the source repo. |
| `npm run build` | pass, exit 0 | No drift in tracked generated output — see Generated Output Evidence. |
| `sh -n .githooks/pre-commit`, `sh -n src/assets/hooks/pre-commit` | pass, both parse | R1 — run in this phase against both copies at head. |
| `agentsmyth check --phase test --slug open-items-remediation` | pass, exit 0 | Phase entry gate, run from the repo's own `bin/`. |
| `npm audit` | **not run** — see Skipped Checks | Belongs to the release, not to this chain. |

## Manifest Coverage

| Manifest ID | How Verified | Evidence | Result | Notes |
|---|---|---|---|---|
| R1 | command + observation | `sh -n` passes on both hook copies; `sh -c 'set -e; status=0; if ! false; then status=1; fi'` reaches the line after the failing check with `status=1`; both copies contain the `if ! run_agentsmyth check --staged` form and the `[ -f "./bin/agentsmyth.mjs" ]` preference exactly once each | pass | Also observed live: the three commits on this branch each ran the gate, and the output carried the skew wording that exists **only** in the repo's own `bin/`, which is direct evidence the repo binary ran rather than a PATH copy. |
| R2 | command + probe | Fixture `fw` rejects under the fix inside `violations:test` (210/210); the selection expression run against `probe-v2, probe-v10, probe-v1` picks `v10` | pass | The probe is the point: `v10` beats `v2` only under numeric comparison, which is the specific bug. |
| R3 | inspection + command | Ship `4a` (unconditional) and `4b` present; Build `8a` present; Review Workflow preamble present — one occurrence each; `conformance:test` 48/48 including the byte-lock `r22-review-single-agent-verbatim` | pass | Prose with nothing mechanical behind it. Recorded as residual risk and owned by OI-89, not asserted as enforced. |
| R4 | manual QA + inspection | `docs/release-checklist.md` present; its `warn-until-1.2.0` claim independently counted (1 in `verification.schema.yaml`, 5 in `agent-behavior.schema.yaml` — the 6 it states); `release.yml` does run `npm version`, and `package.json` is still `1.0.1` as the do-not-pre-bump rule requires; full upgrade rehearsal re-run against the published 1.0.0 tarball — see Manual QA | pass | The rehearsal found F6, which is the strongest evidence that this requirement is worth what it costs. |
| R5 | command | `root-resolution:test` 21/21, including `gitcwd-routes`, `gitcwd-distinct`, `gitcwd-no-target`, `gitcwd-unknown-falls-back` | pass | Routing plus both fallbacks, against two real sibling checkouts. |
| R6 | command + inspection | `workflow/config/artifact-baseline.yaml` carries `entries: []`; `check-artifacts` exits 0 against the real corpus with no baseline to lean on | pass | Confirms the 96 were repaired at source rather than re-accepted. First Test phase this requirement has had. |
| R7 | command | Full `mutation:audit` — `0/221 undefended`, 30 validators, `mutation-audit: ok`; `violations:test` 210/210; `domain-placeholders` named in `package.json`, `ci.yml`, `release.yml` and the audit's own `SUITES` | pass | The zero is measured here, not inherited. First Test phase this requirement has had. |
| R8 | command + observation | Review's six findings each carry a Fixed line with its own evidence; `r8-source-precedence` and `r8-consumer-precedence` pass; fixture `jd` rejects with the rule's own wording; the corrected skew message verified against the rehearsal consumer with its stamp reset to 1.0.0 | pass | F6 was found *by* this chain's own R4 rehearsal and fixed in the same phase. |

## Manual QA

**Scenario** — a real 1.0.0 consumer upgrading to the 1.1.0 candidate (R4, OI-69).

- **Environment:** macOS; isolated `HOME` under the session scratchpad so the machine's real
  `~/.agentsmyth` was neither read nor written; `npm pack @jeelvankhede/agentsmyth@1.0.0` (the
  genuinely published artifact, not a repo edited backwards into 1.0.0 shape); candidate built from
  this branch with `npm pack`.
- **Steps:** 1.0.0 `prepare` into the isolated HOME → 1.0.0 `init` in an empty git repo → inspect
  the resulting consumer → candidate `prepare` over the top → candidate `check` in the consumer →
  parse every config with the candidate's own YAML parser → complete setup as a setup agent would
  (fill placeholders, write the knowledge map, delete `.agentsmyth/`) → `check` again.
- **Expected:** version skew detected; new pending-setup item families append without corrupting the
  file; configs still parse; `prepare` refreshes the global tree; `check` exits 0 after setup.
- **Observed:** consumer initialised at `agentsmyth_version: 1.0.0` with PS-1..PS-8 and 27 global
  validators; candidate `prepare` took the global tree to 32 validators; skew detected naming
  v1.0.0 → v1.0.1; four per-repo tuning items appended as PS-9..PS-12 with PS-1..PS-8 intact; all
  six configs parsed (`domain`, `pending-setup`, `release`, `repo-profile`, `source-of-truth`,
  `verification`); `check` exited 0 once setup was completed.
- **Outcome:** pass, with one defect found — the skew warning's remedy could not clear the warning
  (Review F6). Fixed in this chain and re-verified against the same consumer.
- **Evidence:** transcript in this session; the rehearsal tree remains under the session scratchpad.
- **Manifest IDs:** R4, R8

## Generated Output Evidence

`npm run build` regenerates `dist/workflow-bundle.md`, `dist/setup-bundle.md`, `workflow/schemas/`
and the five adapter shims from `src/`. Run after this chain's `src/workflow/` change
(`check-council-record.mjs`): exit 0, and `git status` shows no tracked generated output modified —
`dist/`, `validators/` and `workflow/schemas/` are gitignored build products, and
`src/assets/adapters/` is tracked and unchanged, so the shims were already current. `npm run
validate`'s `render-adapters` step independently reports `adapter shims are current`.

The candidate tarball used in Manual QA was built from that same output, so the rehearsal exercised
the real bundle rather than the source tree.

## Findings

none

## Skipped Checks

| Check | Why Skipped | Risk | Owner | Blocks Ship | Manifest IDs |
|---|---|---|---|---|---|
| `npm audit` re-derivation | It is a release gate, not a requirement of this chain; OI-35 owns it and the release checklist requires it before dispatch | The 1.1.0 waiver position is stale — the set grew from 3 to 8, two are now high severity, and four report `fixAvailable`, so re-asserting the old waiver would misstate it | user / repo maintainer | no for this chain; yes for the 1.1.0 release | none — release gate, not a chain requirement |
| Live-tool verification of the global `/agentsmyth` invocation command | Cursor, Windsurf, VS Code + Copilot and Codex CLI are not reachable from this environment | The command is verified for file placement, content and idempotency but has never been watched firing in a real tool | user | no | none — OI-42 owns it |

## Architecture Notes

- role: Senior QA
- decision: ran Test rather than taking the Standard-class waiver. R6 and R7 were recorded
  retroactively and had never been through a Test phase; waiving would have shipped them with no
  independent verification at all.
- decision: re-ran the full mutation audit rather than citing the baseline file. It is the one
  claim thirteen of this branch's commits exist to produce, and a ratchet that is never re-measured
  is a number, not evidence.
- decision: re-ran R4's upgrade rehearsal end to end rather than citing Build's record of it. That
  choice is what surfaced F6 — a defect invisible to anyone reading the previous run's summary.
- constraint: `npm audit` and live-tool verification are release-level checks this environment or
  this chain cannot settle; both are in Skipped Checks with owners rather than absent.
- assumption Ship must preserve: `package.json` stays at `1.0.1`. `release.yml` runs
  `npm version <bump>` itself, so a pre-bumped repo publishes the version after the intended one.
- downstream: Ship inherits two open release actions (OI-35's audit re-derivation, and the
  CHANGELOG date if the dispatch slips past 2026-09-08) and three carried open items (OI-83, OI-88,
  OI-89), none of which is a defect in this branch.

## Sign-Off

- Verifier: Senior QA (agent), lifecycle-test
- Date: 2026-09-08
- Recommendation: ship

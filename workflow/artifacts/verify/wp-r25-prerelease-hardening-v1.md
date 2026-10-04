---
slug: wp-r25-prerelease-hardening
version: 1
artifact: verify
status: ready-for-next-phase
created: 2026-10-04
updated: 2026-10-04
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
orchestration:
  phase: test
  status: ready-for-next-phase
  next_phase: ship
  blockers: []
  user_checkpoint: none
---

# WP-R25 Pre-Release Hardening - Verification

## Inputs

- Brief `workflow/artifacts/briefs/wp-r25-prerelease-hardening-v2.md` (approved).
- Plan `workflow/artifacts/plans/wp-r25-prerelease-hardening-v1.md`, 8 phases, Phase 8 added by
  explicit plan update after Review returned `hold`.
- Task `workflow/artifacts/tasks/wp-r25-prerelease-hardening-v1.md`, all 8 phases `complete`.
- Review `workflow/artifacts/reviews/wp-r25-prerelease-hardening-v1.md` — council mode, 22 findings,
  4 critical, recommendation `hold`. Every finding was remediated in Phase 8 before this phase ran.
- `workflow/config/verification.yaml` — two configured commands (`validate`, `violations:test`),
  `allow_discovered_commands: true`.
- Gate at entry: `agentsmyth check --phase test --slug wp-r25-prerelease-hardening` → exit 0,
  `review → ready-for-next-phase ✓`.

## Automated Checks

Both configured commands ran. The remaining fourteen are discovered commands, permitted by
`command_policy.allow_discovered_commands`, and are recorded because this chain added four of them
and a suite that runs in no workflow is not coverage.

| Command | Outcome | Evidence |
|---|---|---|
| `npm run validate` (configured) | pass | exit 0; `check-scope-fence: ok`, `validate-example: ok`, `render-adapters: adapter shims are current` |
| `npm run violations:test` (configured) | pass | exit 0; `239/239 violations detected`, `attribution sweep: 123/123 council and lifecycle fixtures emit exactly one error` |
| `npm run conformance:test` | pass | exit 0; `55/55 conformance checks passed` |
| `npm run upgrade-path:test` | pass | exit 0; `178 passed, 0 failed, 1 skipped (platform-conditional)` |
| `npm run init-prepare-interop:test` | pass | exit 0; `56/56 init/prepare interoperability checks passed` |
| `npm run path-containment:test` | pass | exit 0; `21/21 path-containment assertions hold` |
| `npm run finding-closure:test` | pass | exit 0; `53/53 finding-closure clauses verified` |
| `npm run tuning-merge:test` | pass | exit 0; `18/18 tuning-merge assertions passed` |
| `npm run setup-checks:test` | pass | exit 0; `20/20 setup-complete checks passed` |
| `npm run setup-refs:test` | pass | exit 0; `5/5 setup-refs checks passed` |
| `npm run root-resolution:test` | pass | exit 0; `24/24 root-resolution drift checks passed` |
| `npm run checkpoint-approval:test` | pass | exit 0; `13/13 check-lifecycle phase-gate cases correct` |
| `npm run commit-coverage:test` | pass | exit 0; `8 passed, 0 failed` |
| `npm run domain-placeholders:test` | pass | exit 0; `5/5 domain-placeholder checks passed` |
| `npm run agents-md:test` | pass | exit 0; `33/33 AGENTS.md fallback checks passed` |
| `npm run setup-validator-definitions-root:test` | pass | exit 0; `3/3 cases correct` |
| `npm run mutation:audit` | pass | exit 0; `0/248 rules undefended`, with `check-council-record` 85, `check-lifecycle` 23, `check-setup-complete` 14 — each matching `test/mutation-baseline.json`. Re-run after the F8/F11 closures changed two validators; see Findings for why an earlier run of this command was discarded rather than cited. |

Nothing was recorded as not-run. No command was blocked.

## Manifest Coverage

One row per active ID. "Suite" names the command above that carries the evidence.

| Manifest ID | How Verified | Evidence | Result | Notes |
|---|---|---|---|---|
| R1 | command + end-to-end | `init-prepare-interop:test` 56/56 (scenarios K–O); consumer trial below shows `definitions_root` linked and the stamp written | pass | Stale-tree detection is stamp-based; the residual (rebuilt source at an unchanged version) is recorded in the task, not closed. |
| R2 | command | `upgrade-path:test` husky v9 / v8 / tracked-hooks blocks, six assertions being real `git commit` runs; consumer trial shows the hook at `.githooks/pre-commit` mode 755 | pass | HK2 now asserts shebang-on-line-1 AND gate-before-host (F21). |
| R3 | command | `tuning-merge:test` 18/18; `violations:test` fixtures jn–jv; `finding-closure:test` F10.1–F10.3, F11.1×3, F11.2 | pass | Depth is branched three ways and each branch is probed, including `standard`. |
| R4 | command + end-to-end | `checkpoint-approval:test` 13/13 including both advertised remedies and the no-remedy control; consumer trial blocks on `PS-13` | pass | The gate now keys on the resolved VALUE and rejects a tier no adapter can map. |
| R5 | command + end-to-end | `finding-closure:test` F19.1/F19.2, F22.1/F22.2; consumer trial shows 5/5 templates in the definitions tree | pass | This repo's own member definition is rendered and conformance-asserted (F22). |
| R6 | command | `validate` (`check-release-readiness`), `conformance:test` 55/55 | pass | CHANGELOG `[1.1.0]` date is still the placeholder — see Skipped Checks. |
| R7 | command | `upgrade-path:test` HK-block assertions; `Y3` hook-drift reconcile case | pass | |
| R8 | command | `init-prepare-interop:test` linked-worktree scenario | pass | |
| R9 | command | `path-containment:test` 21/21 (F3, F6, F7, F13, F14); `upgrade-path:test` prune assertions | pass | New suite; wired into `ci.yml` and `release.yml`. |
| R10 | command | `commit-coverage:test` 8/8 including the `--staged` leg case; `finding-closure:test` F18.1/F18.2 | pass | Both legs now run the council check (F18). |
| R11 | command + review | OI-69 re-derived against the published 1.0.1 (recorded in the task, Phase 5); `validate` | pass | |
| RI1 | command | `validate` over 33 historical ship artifacts and 4 examples; `check-artifacts: ok` | pass | RI1's carve-out went unused — no required field was added to any historical artifact. |
| RI2 | command | `init-prepare-interop:test` scenarios K–O | pass | |
| RI3 | command | `validate` → `render-adapters: adapter shims are current`; `conformance:test` adapter-sync checks | pass | |
| RI4 | command | `npm run build` then `git status` shows no diff in `dist/`, `validators/`, `src/assets/`, `workflow/schemas/` | pass | Build is reproducible from committed source. |
| RI5 | command | `violations:test` 239/239 with `attribution sweep: 123/123`; every rule added this chain has its own fixture | pass | Twelve rules added across F8/F10/F11/F12/F15/F16/F22, each with a fixture. |
| RI6 | command | `node -e` on package.json reports `dependencies: {}`; `npm ls --omit=dev --depth=0` prints `(empty)`; `validate` | pass | Zero-dependency invariant intact. |
| RI7 | command | `upgrade-path:test` X5, X5b, X6, X7, X8, HM1–HM5 | pass | F5 and F20 both closed with cases that fail pre-fix. |
| RI8 | command | `conformance:test`; the CLI records and never prompts (one existing prompt fails closed on non-TTY) | pass | |
| RI9 | command | `violations:test` fixture `fv`; `init-prepare-interop:test` | pass | Redesigned after the first approach removed a validator's ability to gate. |
| RI10 | command + end-to-end | `agents-md:test` 33/33; consumer trial installed 4 global gate files and printed the Cursor paste block | pass | OI-115 (delivery parity) stays open by design. |
| RI11 | command | `upgrade-path:test` HM5 (`0755` on a hook agentsmyth creates) and HM1 (`0700` preserved) | pass | RI11 was satisfied by assertion in Phase 2; F21 then made it a real branch. |
| RI12 | command | `conformance:test`; `resolveHooksDir`'s four callers named in source and exercised by the husky blocks | pass | |

23 of 23 active IDs pass. None failed, none skipped, none waived.

## Manual QA

| Scenario | Environment | Steps | Expected | Observed | Outcome | Evidence | Manifest IDs |
|---|---|---|---|---|---|---|---|
| A consumer installs from scratch and upgrades | darwin 25.5.0, node v24.11.0, scratch `HOME` and scratch git repo with `core.hooksPath=.githooks` | `agentsmyth prepare` → `agentsmyth init` → `agentsmyth upgrade` | prepare and init exit 0; upgrade reports no drift on a fresh init; the gate blocks on the unanswered capability tier | prepare exit 0; init exit 0; upgrade exit 0 reporting `7 unchanged, 0 edited, 0 missing, 0 superseded, 0 newly governed`; `check --phase think` refused with `no council capability tier is resolved (PS-13 names it)` and named both working remedies | pass | scratch repo at `scratchpad/e2e-repo`, scratch home at `scratchpad/e2e-home` | R1, R2, R4, R5, RI10 |
| The definitions tree carries what the setup skill tells a consumer to read | same | after `prepare`, list `~/.agentsmyth/workflow/adapters/*/council-member.md` | all five templates present | 5/5 present; hook at the durable `.githooks/pre-commit`, mode 755; `definitions_root` written to `repo-profile.yaml` | pass | same scratch home | R5, R2, R1 |

This is recorded as manual QA rather than folded into the suites because it is the one check that
exercises `prepare → init → upgrade` as a consumer actually meets them, in order, against a tree
nothing in this repo pre-seeded. The chain's dominant defect class was a correct mechanism that
nothing invoked, and no in-repo suite can disprove that about the consumer path.

## Generated Output Evidence

| Artifact | Source | Method | Result |
|---|---|---|---|
| `dist/workflow-bundle.md` | `src/workflow/` + `src/adapters/*/council-member.md` | `npm run build`, then `git status --short` filtered to generated paths | reproducible — no diff |
| `dist/setup-bundle.md` | `src/setup/` | same | reproducible — no diff |
| `validators/` (root), `src/assets/adapters/`, `workflow/schemas/` | `src/workflow/validators/`, `src/adapters/`, `src/workflow/schemas/` | same | reproducible — no diff |
| council-member templates in the bundle | `src/adapters/*/council-member.md` | `grep -c 'FILE: workflow/adapters/.*council-member.md' dist/workflow-bundle.md` → 5 | pass — synced from the single source, not duplicated into `src/workflow/` |

Checked by regeneration and diff, not by inspecting source: `generated_output.source_only_inspection_is_not_enough`.

## Findings

Three, all recorded rather than carried silently.

**V1 — an earlier `mutation:audit` result was discarded, not cited.** The first run reporting
`0/248` overlapped a second audit process, and `check-lifecycle.mjs` was reverted mid-run for the F2
regression test. That command mutates those files in place. The figures matched the tree and were
almost certainly correct; a ratchet measured against a moving tree is not evidence, least of all when
what it measures is whether tests notice changes to those files. The cited figure is from a single
run with nothing else touching the repo, tree verified clean against HEAD afterwards. No action for
Ship; recorded because the discarded run is in this session's history and a reader would otherwise
find two numbers.

**V2 — the completion claim for Phase 8 was wrong when first made, and was corrected under
challenge.** Two findings (F8, F13) had two-part Fix lines with one part landed; both were closed and
the audit was then redone at CLAUSE level, which found four further clauses that had never been
tested (each of F11's three axes individually, F10's `standard` branch, F9's "unreadable" as distinct
from absent, F12's array shape). All pass. The durable outcome is
`test/run-finding-closure-probes.mjs`. No action for Ship, but Reflect should note that the thing
which caught the error was being asked, not any step in the process.

**V3 — no council finding in this repo's history has ever settled as `noise`.** 154 proved-real, 0
noise, 0 waived across both ledger files. That is as likely to say something about how findings are
recorded as about how good they are. Reflect-owned; not a Ship blocker.

## Skipped Checks

| Check | Why Skipped | Risk | Owner | Blocks Ship | Manifest IDs |
|---|---|---|---|---|---|
| F7's traversal consequence on a real Windows host | No Windows host available to this chain. The predicate is exercised under `node:path/win32` semantics, which observes the separator behaviour but not the end-to-end filesystem consequence. | The Windows outcome is inferred from the predicate rather than observed. The payload path (`workflow/provenance.yaml`, a committed file) is reachable through an ordinary pull request, so the inference matters. | workflow owner | no | R9 |
| `H1-eight-governed` upgrade-path assertion | Platform-conditional; skips on darwin and runs on ubuntu in CI. Pre-existing, covered by waiver FQ-80. | None new — CI runs it on every push. | workflow owner | no | RI7 |
| CHANGELOG `[1.1.0]` release date | Deliberately left as the placeholder `2026-09-08`; the real date is not knowable until Ship. | A release shipped with a wrong date in its own changelog. | release owner | no | R6 |
| Live `npm publish` / registry behaviour | Test does not publish. Packaging is verified by `npm pack` content and the release workflow's own gates. | Registry-side behaviour is unverified until Ship runs. | release owner | no | R6, R11 |

Every row names reason, risk, owner, Ship impact and IDs, per
`verification.yaml.skipped_checks.required_fields`.

## Architecture Notes

- role: Senior QA
- decision: verify by command for all 23 IDs, and add one end-to-end consumer trial, because this
  chain's defects were wiring defects — a mechanism that is correct, reachable, fixture-covered and
  mutation-defended while nothing invokes it (F1) passes every in-repo suite.
- decision: treat `finding-closure:test` as primary evidence for the Review remediation. It is the
  only check that probes each finding's own symptom rather than the existence of a test for it.
- constraint: F7's Windows consequence is not observable on this host; carried from Review as a
  skipped check rather than restated as a pass.
- constraint: one upgrade-path assertion is platform-conditional and skips on darwin while CI runs it
  on ubuntu (waiver FQ-80), so the darwin run reports 178 passed and 1 skipped rather than 179.
- constraint: `architecture_notes` is recorded here in the body and NOT in frontmatter. The phase
  skill says to use the frontmatter block "when the artifact schema supports it", and
  `artifact-frontmatter.schema.yaml` does not declare it — writing it there failed
  `check-artifacts` with "unexpected trailing YAML", because the hand-rolled parser does not fold
  multi-line list entries. Recorded so the next verify artifact does not retry it.
- tradeoff: two of 53 closure clauses are source-reads (F4's unreachable-by-construction guard,
  F14's "correct the comment"). Both are labelled in the suite with the reason.
- assumption Ship must preserve or settle: the CHANGELOG date placeholder; OI-112/113/114 fixed but
  still `open`; OI-115 open by design.
- downstream: release readiness unblocked; `mutation:audit` and the two new suites are wired into
  `release.yml`, so Ship re-runs them rather than trusting this artifact.

## Sign-Off

- Verifier: Claude Opus 5 (Senior QA, lifecycle-test)
- Date: 2026-10-04
- Recommendation: ship

All 23 active manifest IDs carry pass evidence from commands that ran in this phase. The four skipped
checks are recorded with owner and risk and none blocks Ship: one is a platform limitation carried
from Review, one is a pre-existing CI-covered platform skip, and two are Ship's own work by
definition. `mutation:audit` is at 0/248 undefended against the current baseline, and generated
output is reproducible from committed source.

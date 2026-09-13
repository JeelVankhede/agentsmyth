---
slug: wp-r23-agents-md-fallback
version: 1
artifact: verify
status: ready-for-next-phase
created: 2026-09-13
updated: 2026-09-13
manifest_ids: [R1, R2, R3, R4, R5, R6, RI1, RI2, RI3, RI4, RI5, RI6, RI7]
upstream:
  - workflow/artifacts/briefs/wp-r23-agents-md-fallback-v1.md
  - workflow/artifacts/plans/wp-r23-agents-md-fallback-v1.md
  - workflow/artifacts/tasks/wp-r23-agents-md-fallback-v1.md
  - workflow/artifacts/reviews/wp-r23-agents-md-fallback-v1.md
orchestration:
  phase: test
  status: ready-for-next-phase
  next_phase: ship
  blockers: []
  user_checkpoint: none
---

# WP-R23 — Generic AGENTS.md Adapter Fallback - Verification

## Inputs

- Brief, plan, task and review artifacts for `wp-r23-agents-md-fallback-v1`, all
  `ready-for-next-phase`. Review recommendation `pass` after both findings were closed in a Build fix
  pass.
- `workflow/config/verification.yaml` — `npm run validate` and `npm run violations:test` are the two
  commands marked `required: true` for the `review` and `ship` phases. `manual_qa.enabled: true`.
  `generated_output.source_only_inspection_is_not_enough: true`.
- Branch `feat/wp-r23-agents-md-fallback`, nothing committed.

Every command below was run in this phase against current working-tree state. None is carried over
from Build's log — Build's evidence is cited only where this phase deliberately re-ran the same check
and got the same answer.

## Automated Checks

| Command | Outcome | Evidence |
|---|---|---|
| `npm run validate` | pass | exit 0. Configured required command. |
| `npm run violations:test` | pass | exit 0; suite reports its own count — `93/93 council fixtures emit exactly one error`. Configured required command. |
| `npm run conformance:test` | pass | exit 0; `48/48 conformance checks passed`. Includes `r22-every-suite-runs-in-ci`, which is what caught the new suite being registered but unwired during Build. |
| `npm run agents-md:test` | pass | exit 0; `20/20 AGENTS.md fallback checks passed`. The suite this work added. |
| `npm run setup-refs:test` | pass | exit 0; `5/5 setup-refs checks passed`. |
| `npm run setup-checks:test` | pass | exit 0; `13/13 setup-complete checks passed`. |
| `npm run root-resolution:test` | pass | exit 0; `21/21 root-resolution drift checks passed`. |
| `npm run init-prepare-interop:test` | pass | exit 0; `38/38 init/prepare interoperability checks passed`. The suite most likely to notice an `init` regression. |
| `npm run checkpoint-approval:test` | pass | exit 0; `9/9 check-lifecycle phase-gate cases correct`. |
| `npm run setup-validator-definitions-root:test` | pass | exit 0; `3/3 setup-validator definitions_root cases correct`. |
| `npm run tuning-merge:test` | pass | exit 0; `15/15 tuning-merge assertions passed`. |
| `npm run commit-coverage:test` | pass | exit 0; `7 passed, 0 failed`. |
| `npm run domain-placeholders:test` | pass | exit 0; `5/5 domain-placeholder checks passed`. |
| `node src/workflow/validators/check-scope-fence.mjs` | pass | exit 0 against the amended plan. |
| `npm run mutation:audit` | **not run** | Deliberate. Costs tens of minutes and `release.yml` runs it at dispatch. See Skipped Checks. |

`test/mutation-baseline.json` is unchanged — no validator rule was added by this work, so the ratchet
must not move, and it did not.

## Manifest Coverage

| Manifest ID | How Verified | Evidence | Result | Notes |
|---|---|---|---|---|
| R1 | command | `agents-md:test` A1–A2; manual QA STEP 2 | pass | File created when absent; exactly one marker pair. |
| R2 | command | `agents-md:test` B1–B2, C1–C4; manual QA STEP 3 | pass | Two runs byte-identical; older-stamped block replaced in place, not duplicated. |
| R3 | command + manual | `agents-md:test` D1, E1–E4; manual QA STEP 4 | pass | Non-block region byte-identical, including across an orphan `BEGIN`. |
| R4 | command + manual | `agents-md:test` A4–A5; manual QA STEP 5 | pass | Block names `.git/hooks/pre-commit` and a file exists there. Verified in a consumer-shaped repo, not this one. |
| R5 | command | `wc -l` = 23 against a ≤ 25 gate; `agents-md:test` A7 | pass | Bound met, and the setup trigger F1 restored is inside it. |
| R6 | source | Placement in `bin/agentsmyth.mjs`; absent from `src/setup/SKILL.md`; `setup-refs:test` | pass | Both halves. |
| RI1 | source | `src/setup/SKILL.md` diff; `setup-checks:test` 13/13 | pass | Single writer. Codex row collapsed. Residual risk unchanged and recorded below. |
| RI2 | source | Marker pair documented beside the global-gate table; HTML-comment form retained | pass | Consistent with the claude/copilot gate convention. |
| RI3 | generated-output | Two consecutive builds, identical md5 for both bundles; bundle content greps | pass | See Generated Output Evidence. |
| RI4 | command | All 13 suites green; `mutation-baseline.json` unchanged | pass | |
| RI5 | manual | Manual QA scenario below, full transcript | pass | A hand-authored `AGENTS.md` with real content above and below survived two `init` runs verbatim. |
| RI6 | waiver | Skipped Checks row below | **skip** | Deliberate. Nothing validates example `AGENTS.md` files, so a fixture would be coverage theatre. Owner: user. Does not block ship. |
| RI7 | source | `CHANGELOG.md` 1.1.0 entry contains the fallback item; `git diff package.json` is one added script line | pass | Entry date deliberately unchanged — corrected at dispatch per `docs/release-checklist.md`. |

Twelve pass, one skip. No fails.

## Manual QA

**Scenario.** A consumer repo that already has a hand-written `AGENTS.md` — the case the whole work
package exists for, and the one `[safety-2]` makes risky — runs `agentsmyth init` twice.

**Environment.** Fresh `git init` repo in an isolated scratch directory, with an isolated scratch
`HOME` so nothing could touch the developer's real `~/.agentsmyth`. Package version 1.0.1.

**Steps and observations.**

| Step | Expected | Observed |
|---|---|---|
| 1. Seed a user-authored `AGENTS.md` (200 bytes: title, House rules with two real constraints, Contact section) plus a README | no agentsmyth markers present | 0 marker pairs |
| 2. `init` | exactly one pair added; every authored line intact | exit 0; 1 pair; every authored line present; the `src/ledger/` house rule intact verbatim |
| 3. `init` again, modelling a later upgrade | byte-identical file | `true`; still 1 pair |
| 4. Compare the non-block region across both runs | unchanged, authored text verbatim | unchanged; authored text preserved verbatim |
| 5. Inspect what the block actually claims | hook path resolves; setup trigger present; no token leak | names `.git/hooks/pre-commit`, file exists; setup trigger present; no unrendered `{{TOKEN}}` |

**Outcome.** pass.

**Evidence.** Full transcript captured in this session. The non-block region after two runs reproduced
the seeded file exactly:

```
# Acme Payments Service

## House rules

- Never touch `src/ledger/` without a second reviewer.
- Migrations are append-only. Ask before editing one.

## Contact

Ping #payments-eng before a release.
```

**Manifest IDs.** RI5, and corroborating R1, R2, R3, R4.

## Generated Output Evidence

| Check | Command / path | Result |
|---|---|---|
| Build determinism | `npm run build` twice, `md5 -q` on both bundles | identical hashes |
| Bundle carries the new Step 5a.1 subsection | `grep -c 'Repo-local marker' dist/setup-bundle.md` | 1 |
| Bundle carries the corrected Step 5c log line | `grep -c 'owned by init — marked block already written' dist/setup-bundle.md` | 1 |
| Bundle no longer carries the removed append rule | `grep -c 'Append the agentsmyth section' dist/setup-bundle.md` | 0 |
| Asset ships as a file, not via a bundle | `package.json` `files` includes `src/assets/`; asset text in bundles | `true`; 0 occurrences, as expected |

`dist/` is gitignored and untracked, so no diff can demonstrate freshness. The guarantee that no stale
bundle ships is structural and lives in `.github/workflows/release.yml` line 51, which runs
`node scripts/build-bundle.mjs` inside the Verify step before `npm pack` and `npm publish`. Recorded
because the plan's original RI3 gate — "`git status --porcelain dist/` is empty" — could never fail on
an ignored path and therefore proved nothing.

## Findings

none

Review findings F1 (P1) and F2 (P2) were closed in the Build fix pass before this phase and were
re-verified here rather than taken on trust: R4 and R5 above are backed by this phase's own manual QA
and suite runs, not by the fix description.

## Skipped Checks

| Check | Why Skipped | Risk | Owner | Blocks Ship | Manifest IDs |
|---|---|---|---|---|---|
| Example-repo regression coverage for the marker block | No validator reaches example `AGENTS.md` files: `check-domain-placeholders.mjs` excludes `^examples/` and `scripts/validate-example.mjs` has no `AGENTS.md` handling. A fixture would produce the appearance of coverage with none behind it. | A regression in block placement would not be caught by the example corpus. Narrow in practice: `agents-md:test` exercises all five behaviours against real scratch repos, which is stronger than a static fixture. What goes unchecked is the shape of a shipped example, not the behaviour. | user | no | RI6 |
| `npm run mutation:audit` | Costs tens of minutes by design, and `release.yml` runs it as its own step at dispatch. Running it here would duplicate that without changing the answer: this work added no validator rule, so the ratchet has nothing new to measure. | If this work had silently weakened an existing validator rule, the audit would be the check that noticed. Mitigated by the baseline being unchanged and by the audit running unconditionally at release. | agent | no | RI4 |

## Architecture Notes

- role: Senior QA
- **decision**: RI5 was verified by a manual trial against a *consumer-shaped* repo rather than
  against agentsmyth's own. That distinction is the whole reason F2 existed — this repo sets
  `core.hooksPath`, so verifying here would have reproduced the same blind spot that let a wrong hook
  path through Build with a green gate.
- **decision**: the review's findings were re-verified rather than accepted as closed. A fix pass
  self-reporting success is the weakest form of evidence available, and F2 in particular was a case of
  a check agreeing with its own hardcoded expectation.
- **constraint**: `verification.yaml` `generated_output.source_only_inspection_is_not_enough` — RI3 is
  backed by two builds and hash comparison, not by reading `build-bundle.mjs`.
- **tradeoff**: `mutation:audit` not run here. Recorded as a skipped check with an owner rather than
  quietly omitted, because a coverage ratchet nobody ran is indistinguishable from one that passed.
- **downstream**: Ship must not present this merge as closing 1.1.0 — WP-R20 and WP-R24 are in the
  release too (brief Q3). Rollback scope is this branch alone. The RI6 skipped check carries an owner
  of `user` and needs to survive into the ship artifact rather than being dropped as resolved.

## Sign-Off

- Verifier: agent (Senior QA), single-agent mode — councils are Complex-only and this chain is Standard
- Date: 2026-09-13
- Recommendation: ship

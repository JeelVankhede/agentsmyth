---
slug: src-audit-remediation
version: 1
artifact: ship
status: blocked-for-user
created: 2026-07-16T09:00:00Z
updated: 2026-07-16T09:00:00Z
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
  - R12
  - R13
  - RI1
  - RI2
  - RI3
  - RI4
upstream:
  - workflow/artifacts/briefs/src-audit-remediation-v1.md
  - workflow/artifacts/plans/src-audit-remediation-v1.md
  - workflow/artifacts/tasks/src-audit-remediation-v1.md
  - workflow/artifacts/reviews/src-audit-remediation-v1.md
  - workflow/artifacts/verify/src-audit-remediation-v1.md
orchestration:
  phase: ship
  status: blocked-for-user
  next_phase: reflect
  blockers: []
  user_checkpoint: ship-review
---

# Src Audit Remediation - Ship

## Inputs

- Review (`pass`, 0 open findings) and verify (`ship`, full run, one out-of-scope skipped check).
- `release.yaml`: `required: false`, `owner: user`, `default_recommendation_when_no_release_gate: ship`.
- `source-of-truth.yaml`: `mode: optional`, `providers: []` — no external source update in scope.
- `repo-profile.yaml` branch policy: non-default branch required (satisfied: `fix/src-audit-remediation`).

## Ship Status

- Recommendation: ship
- Review result: pass (0 P0/P1)
- Verification recommendation: ship
- PR / CI: prepared, **not yet executed** — awaiting user go-ahead at the ship-review checkpoint
- Source-of-truth: not applicable (no provider configured)
- Release: not applicable (`release.required: false`)

## Requirement Coverage

| Manifest ID | Status | Evidence | Notes |
|---|---|---|---|
| R1 | shipped | `setup-refs:test`; `check-setup-refs: ok` | pending commit |
| R2 | shipped | `setup-refs:test` token-semantics | pending commit |
| R3 | shipped | `check-setup-refs`; schema grep | pending commit |
| R4 | shipped | `conformance:test` r4-* | pending commit |
| R5 | shipped | adapters diff identical | pending commit |
| R6 | shipped | presence+completeness; 9 briefs pass | pending commit |
| R7 | shipped | `check-phase-map: ok` | pending commit |
| R8 | shipped | `setup-refs:test` bad + semantic | pending commit |
| R9 | shipped | `check-starter-blocks` 7/7 | pending commit |
| R10 | shipped | r10-detect + r10-table; violations 20/20 | pending commit |
| R11 | shipped | r11-psuffix + r11-aggregate | pending commit |
| R12 | shipped | r12-all + r12-bad | pending commit |
| R13 | shipped | r13-format; `check-phase-map` | pending commit |
| RI1 | shipped | `npm run build`; no drift | pending commit |
| RI2 | shipped | full suite green | pending commit |
| RI3 | shipped | role/manifest_ids notes; date-time deferred | pending commit |
| RI4 | shipped | deps `{}` | pending commit |

"shipped" here means ready-to-ship and staged for the pending commit; nothing has been pushed. No
external action is claimed as done.

## PR / CI Readiness

- Branch `fix/src-audit-remediation` (non-default — branch policy satisfied); no upstream set; 0
  commits yet; 46 files changed (source + regenerated build products + lifecycle artifacts).
- CI: no repo CI gate configured for this change beyond the local suite, which is green.
- Pending external actions (each requires explicit user go-ahead — global rule "commit/push only when
  asked"; not performed by this artifact):
  1. `git add -A && git commit` on `fix/src-audit-remediation`
  2. `git push -u origin fix/src-audit-remediation`
  3. open a PR to `main` per `~/.claude/PULL_REQUEST_TEMPLATE.md`
- Copy-ready commit message and PR body are provided in the agent's ship-review response, not
  auto-executed.

## Release Readiness

Not applicable — `release.required: false` and no deployment/publish gate configured. Publishing a new
npm version of the package (if desired) is a separate, later decision, out of this chain's scope.

## Source-of-Truth Status

Not applicable — `source-of-truth.yaml` has `providers: []`; no external tracker to update. The
lifecycle artifacts under `workflow/artifacts/` are this chain's own record.

## Risk And Rollback

- Residual risk: only the out-of-scope `date-time` enforcement (low, owner user) and the narrow R10
  heuristic bound — both recorded in verify/review, non-blocking. No unresolved risk gates ship.
- Rollback trigger: any suite failure surfaced after merge, or a consumer-repo regression report.
- Rollback action: revert the merge commit (single squashed PR) or `git revert` the range on `main`;
  the change is self-contained (validators + docs + fixtures), no data migration.
- Rollback owner: user.

## Blocked Handoff

Awaiting user decision at ship-review before any external action. Not a defect blocker — the change is
ship-ready; the pause is the required `ship-review` checkpoint for outward-facing git actions.

## Architecture Notes

- role: Senior DevOps
- decision: Recommend `ship`; hold at `blocked-for-user` because the remaining steps (commit, push,
  PR) are outward-facing and gated on explicit user approval per repo rules — not because of any
  unresolved risk.
- constraint: non-default branch satisfied; no external provider/release gate; nothing pushed.
- downstream: on user go-ahead, execute the three git steps, then Reflect. If the user prefers to
  drive git themselves, this artifact + the copy-ready text is the complete handoff.

## Exit Gate

- [x] Recommendation is ship / hold / hold-with-waiver → `ship`.
- [x] Every R and RI has a coverage row.
- [x] Rollback trigger and action defined.
- [x] All configured gates checked or marked not applicable with config reference.
- [ ] User approves the outward-facing git actions at ship-review (pending).

## Next Phase

Reflect — on user go-ahead for the commit/push/PR (or on the user confirming they will drive git
themselves). Held at ship-review until then.

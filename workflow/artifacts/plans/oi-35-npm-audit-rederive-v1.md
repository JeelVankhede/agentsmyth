---
slug: oi-35-npm-audit-rederive
version: 1
artifact: plan
status: ready-for-next-phase
created: 2026-09-09
updated: 2026-09-11
manifest_ids:
  - R1
  - R2
  - R3
  - RI1
  - RI2
  - RI3
  - RI4
  - RI5
  - RI6
upstream:
  - workflow/artifacts/briefs/oi-35-npm-audit-rederive-v1.md
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: approved
---

# OI-35 npm audit Re-derivation (pre-1.1.0) - Plan

## Summary

Three sequential phases. Phase 1 takes the four semver-compatible fixes and proves the docs site
survives them. Phase 2 re-derives the residual waiver from post-fix measurement and records it where
Ship can cite it. Phase 3 updates the open item. The ordering is forced: the waiver cannot be written
until the fixes establish what is actually left to waive.

The only file of consequence outside `workflow/artifacts/` is `package-lock.json`. That is the whole
code-level footprint — this chain is mostly about producing an accurate record.

## Inputs

- `workflow/artifacts/briefs/oi-35-npm-audit-rederive-v1.md` — R1-R3, RI1-RI6, A1-A2, Q1.
- `workflow/artifacts/open-items.yaml` → `OI-35` — the item under change.
- `workflow/config/release.yaml` → `waivers.required_fields`, `waivers.approvers`.
- `workflow/config/verification.yaml` → `commands` (`validate`, `violations-test` are `required: true`).
- Baseline evidence already captured this session: pre-change `npm audit --json` (8 vulns: 6 moderate,
  2 high), `npm audit --omit=dev` (0), `npm view vitepress dist-tags` (`latest: 1.6.4`), and a
  pre-change `npm run site:build` at exit 0.

## Requirement Coverage

| Manifest ID | Covered by phases | Notes |
|---|---|---|
| R1 | Phase 1 | The four fixable advisories; measured before and after. |
| R2 | Phase 2 | Residual waiver rewritten from post-fix measurement, not inherited. |
| R3 | Phase 3 | `OI-35` resolution note; status per Q1's recorded disposition. |
| RI1 | Phase 1 | Zero-runtime-dependency invariant re-proven, not assumed. |
| RI2 | Phase 1 | `site:build` before/after — before already captured. |
| RI3 | Phase 1 | Repo contract checks re-run after the lockfile moves. |
| RI4 | Phase 1 | Declared ranges checked against post-fix resolved versions. |
| RI5 | Phase 1 | Negative check — `version` field must not move. |
| RI6 | Phase 2 | Six required waiver fields; `check-waivers.mjs`. |

## Assumptions Verified

| Assumption ID | Status | Evidence / Question |
|---|---|---|
| A1 | evidence-backed | `npm view vitepress dist-tags` returns `{"latest":"1.6.4","next":"2.0.0-alpha.20"}`, and `npm audit --json` marks `esbuild`/`vite`/`vitepress`/`vitepress-plugin-mermaid` as `fixAvailable: false` while the other four are semver-reachable. `--force` could therefore only reach a pre-release major, which the brief lists as a Non-Goal. |
| A2 | evidence-backed | `npm audit --omit=dev` re-run this session reports `found 0 vulnerabilities`; `package.json` declares no `dependencies` key. Both re-measured, not inherited from the wp-r11 waiver. |

## Repo Impact Map

| File | Change type | Manifest IDs | Notes |
|---|---|---|---|
| `package-lock.json` | modify | R1, RI1, RI4 | The only functional change in the chain. Written by `npm audit fix`, then diff-reviewed. |
| `package.json` | inspect-only (modify only if RI4 requires) | RI4, RI5 | Expected to be unchanged — all four fixes should land inside existing ranges. Any edit is deliberate and called out. |
| `workflow/artifacts/tasks/oi-35-npm-audit-rederive-v1.md` | create | R1, RI1, RI2, RI3, RI4, RI5 | Build's own artifact. |
| `workflow/artifacts/reviews/oi-35-npm-audit-rederive-v1.md` | create | R2, RI6 | Review's own artifact. |
| `workflow/artifacts/verify/oi-35-npm-audit-rederive-v1.md` | create | R1, RI1, RI2, RI3 | Test's own artifact; carries the before/after measurement matrix. |
| `workflow/artifacts/ship/oi-35-npm-audit-rederive-v1.md` | create | R2, RI6 | Where the re-derived waiver actually lives. |
| `workflow/artifacts/reflect/oi-35-npm-audit-rederive-v1.md` | create | R3 | Reflect's own artifact. |
| `workflow/artifacts/open-items.yaml` | modify | R3 | `OI-35` only. No other entry is in scope. |

## Source-of-Truth Strategy

`workflow/config/source-of-truth.yaml` declares `mode: optional`, `default_required: false`,
`providers: []` — no external tracker is configured for this repo. The source of truth for this
chain is therefore repo-local: `OI-35` in `workflow/artifacts/open-items.yaml` for the requirement,
and live `npm` tool output for every claim about the advisory set. No external handoff is in scope.

Per `[safety-3]`, every severity, count, and fix-availability claim in the downstream artifacts must
cite tool output captured in this chain. The wp-r11 waiver is cited only as *the thing being
replaced*, never as evidence for the new position.

## Approach

Fix first, then waive what is left, then record — which is OI-35's own stated order. The alternative
considered and rejected: re-derive the waiver over the full set of eight without fixing anything,
which would be a faithful record of a state we had no reason to stay in. Taking the four fixes first
means the waiver covers only genuinely unfixable advisories, which is what makes it defensible.

Measurement is captured as `npm audit --json` rather than the human-readable form, so before/after
counts and per-package severities come from structured data instead of prose parsing.

## Phases

### Phase 1 - Take the four available fixes

- **Manifest IDs:** R1, RI1, RI2, RI3, RI4, RI5
- Touches: `package-lock.json`, `package.json`
- Work: Run `npm audit fix` without `--force`. Capture post-fix `npm audit --json` and
  `npm audit --omit=dev`. Diff `package-lock.json` and confirm the moved packages are the four
  targets plus their own transitive pins, nothing else. Confirm `package.json` is unchanged (or, if a
  range genuinely had to move for RI4, record exactly which and why). Re-run `npm run site:build`,
  `npm run validate`, `npm run violations:test`, `npm run conformance:test`.
- **Exit gate:** `npm audit --json` reports `total: 4` (3 moderate + the 1 unfixable `high`, `vite`);
  `dompurify`, `mermaid`, `nanoid`, `postcss` absent from `vulnerabilities`; `npm audit --omit=dev` still 0; `site:build`,
  `validate`, `violations:test`, `conformance:test` all exit 0; `git diff package.json` shows no
  `version` change.

### Phase 2 - Re-derive the residual waiver

- **Manifest IDs:** R2, RI6
- Touches: `workflow/artifacts/reviews/oi-35-npm-audit-rederive-v1.md`, `workflow/artifacts/verify/oi-35-npm-audit-rederive-v1.md`, `workflow/artifacts/ship/oi-35-npm-audit-rederive-v1.md`
- Work: Write the residual waiver over exactly the post-Phase-1 set, at its measured severity, citing
  `npm view vitepress dist-tags` for the no-stable-fix claim. Carry all six
  `release.yaml` `waivers.required_fields`. Present it for user approval rather than self-approving —
  `waivers.approvers` is `[user, configured_decision_owner]`.
- **Exit gate:** `check-waivers.mjs` passes; the waiver's named set matches Phase 1's post-fix
  measurement exactly; `approval_evidence` records the real approval state, including "pending" if
  the user has not answered.

### Phase 3 - Update the open item

- **Manifest IDs:** R3
- Touches: `workflow/artifacts/open-items.yaml`, `workflow/artifacts/reflect/oi-35-npm-audit-rederive-v1.md`
- Work: Write `OI-35`'s resolution note with the post-fix numbers and a pointer to the Ship artifact's
  waiver. Set `status: done` per Q1 user decision (2026-09-11).
- **Exit gate:** `check-open-items.mjs` passes; `OI-35` is the only entry whose diff is non-empty.

## Dependency Order

Phase 1 → Phase 2 → Phase 3, strictly sequential. Phase 2 cannot name the residual set before
Phase 1 establishes it, and Phase 3's resolution note cites both. No parallelism available or wanted
in a three-phase chain whose whole content is a measurement and its record.

## Branch Strategy

- Branch: `chore/oi-35-npm-audit-rederive`, cut from `chore/open-items-triage-1.1.0` per the user's
  explicit instruction ("on a new branch based off of current branch"), not from `main`.
- Satisfies `repo-profile.yaml` `branch_policy.require_non_default_branch_for_changes: true`.
- Working tree was clean at branch creation, so `dirty_state_policy: record-and-preserve` has nothing
  to preserve.
- Per CLAUDE.md rule 8 and `branch_policy`, no commit or push happens without the user asking. The
  1.1.0 dispatch itself is explicitly out of scope.

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner | Manifest IDs |
|---|---|---|---|---|---|
| A semver-compatible `mermaid` bump breaks diagram rendering in the docs site | low | medium | `site:build` before and after; before-state already captured at exit 0 | agent | RI2 |
| `npm audit fix` rewrites more of the lockfile than the four targets | medium | low | Diff the lockfile and report exactly which packages moved; lockfile is version-controlled and revertible | agent | R1, RI4 |
| Residual waiver drifts again as upstream moves | medium | medium | `OI-35` closed per Q1 user decision (2026-09-11); follow_up_action in the waiver carries the revisit trigger | user | R3 |
| Waiver gets self-approved rather than user-approved | low | high | `approval_evidence` records the true state; "pending" is written plainly when unanswered | agent | RI6 |
| Chain silently re-asserts an inherited claim | low | high | Every count/severity/fix-availability claim cites this chain's own tool output, per `[safety-3]` | agent | R2 |

## Verification Plan

| Manifest ID | Evidence | Owner phase | Notes |
|---|---|---|---|
| R1 | `npm audit --json` before/after; `metadata.vulnerabilities` totals | test | Structured, not prose-parsed. |
| R2 | Ship artifact waiver text vs. post-fix `npm audit --json`; `npm view vitepress dist-tags` | review | Set-equality check between waiver and measurement. |
| R3 | `git diff workflow/artifacts/open-items.yaml`; `check-open-items.mjs` | test | Confirms `OI-35`-only scope. |
| RI1 | `npm audit --omit=dev`; absence of `dependencies` in `package.json` | test | Re-measured this chain. |
| RI2 | `npm run site:build` exit codes, before and after | test | Before-log captured pre-change. |
| RI3 | `npm run validate`, `npm run violations:test`, `npm run conformance:test` | test | First two are `required: true` in `verification.yaml`. |
| RI4 | `package.json` ranges vs. `package-lock.json` resolved versions | test | Per-package comparison. |
| RI5 | `git diff package.json` | test | Negative check — `version` stays `1.0.1`. |
| RI6 | `check-waivers.mjs`; six-field presence in the Ship artifact | review | Field-by-field. |

## Architecture Notes

- role: Principal Engineer
- decision: Sequence as fix → measure → waive → record, so the waiver is derived from a state we
  chose rather than a state we inherited. Structured `npm audit --json` is the measurement instrument
  throughout, so before/after claims are comparable rather than re-narrated.
- constraint: `waivers.approvers` does not include the agent. Phase 2 can compose the waiver but
  cannot approve it; the artifact must be able to say "pending" without the chain stalling.
- tradeoff: Three phases for what is mechanically one command. Justified because the deliverable here
  is the record, not the lockfile change — OI-35 exists precisely because the last record was allowed
  to go stale, and a thin chain would reproduce that failure.
- downstream: Ship hands the 1.1.0 release checklist a re-derived audit position it can cite directly.
  Q1 answered (2026-09-11): OI-35 closes once the residual waiver is re-derived; the waiver's follow_up_action carries the revisit trigger for when vitepress ships stable 2.x.

## Open Questions

- **Q1** (from the brief) — **Answered (2026-09-11): close `OI-35`** once the four fixes are taken and the residual waiver is re-derived. Phase 3 writes `status: done`.

## Provenance Correction (2026-09-09)

Same correction as the brief, and the same withdrawal. This plan was written with
`user_checkpoint: none` and `status: ready-for-next-phase`, justified "on the same basis as the
brief" — which means it inherited a justification that was already invalid, and compounded it. The
schema default for this field is `plan-review`.

Setting `none` here is what allowed Build to start. Build, Review, and Test carry no user checkpoint
of their own by default, so the two `none` values in this chain — brief and plan — are the entire
reason the work ran from Think to Ship without stopping. There was no third bypass; there did not
need to be one.

The field is now set to its real value and the status to its real state.

Tracked as `OI-92` in `workflow/artifacts/open-items.yaml`.

## Exit Gate

- [x] Every active R and RI mapped to a phase.
- [x] Every phase has a binary exit gate.
- [x] Verification plan covers every R and RI.
- [x] User approved — **2026-09-11.** User reviewed the plan via walkthrough and approved.

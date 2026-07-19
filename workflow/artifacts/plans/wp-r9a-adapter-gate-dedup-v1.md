---
slug: wp-r9a-adapter-gate-dedup
version: 1
artifact: plan
status: ready-for-next-phase
created: 2026-07-19
updated: 2026-07-19
manifest_ids: [R1, R2, RI1, RI2]
upstream:
  - workflow/artifacts/briefs/wp-r9a-adapter-gate-dedup-v1.md
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: approved
---

# WP-R9a — Redundant Adapter-Gate Fix - Plan

## Summary

Single-file, instruction-only fix: `src/setup/SKILL.md` Step 5a.1 gains a per-tool global-gate
presence check before placing a repo-local adapter. 2 phases — implement, then verify — since
the fix is small enough that splitting further would add process overhead with no review
benefit.

## Inputs

- Brief: `workflow/artifacts/briefs/wp-r9a-adapter-gate-dedup-v1.md`
  (`orchestration.status: ready-for-next-phase`, approved).
- Manifest IDs: R1, R2, RI1, RI2.
- Re-read this Plan: `src/setup/SKILL.md` lines 169–183 (Step 5a.1's current table) and
  `bin/agentsmyth.mjs` lines 257–268 (`installGateSection()`) and 330–384 (`runPrepare()`'s
  per-tool global paths and begin/end marker strings) — confirmed unchanged since Think.

## Requirement Coverage

| Manifest ID | Covered by phases | Notes |
|---|---|---|
| R1 | Phase 1 | New dedup-check instruction precedes the existing placement table |
| R2 | Phase 1 | Reuses `installGateSection()`'s exact marker strings, no new convention |
| RI1 | Phase 1 (by construction) | Only `src/setup/SKILL.md` touched; verified in Phase 2 |
| RI2 | Phase 2 | Build + jargon grep + full suite |

## Repo Impact Map

| File | Change type | Manifest IDs | Notes |
|---|---|---|---|
| `src/setup/SKILL.md` | runtime (shipped via dist/setup-bundle.md) | R1, R2, RI1 | New dedup-check paragraph + per-tool global path/marker table inserted immediately before the existing Step 5a.1 placement table |

## Source-of-Truth Strategy

No external source-of-truth involved. Self-contained instruction change within
`src/setup/SKILL.md`.

## Approach

2 phases, strictly sequential (Phase 2 verifies Phase 1's diff): implement the dedup check,
then verify it — build, jargon-grep the rebuilt output, and manually trace the new instruction
against representative scenarios (this fix has no executable code path to run; verification is
worked-example tracing, matching the precedent WP-R7's own agent-executed adapter-gate fixes
used).

## Phases

### Phase 1 - Dedup check instruction

- **Manifest IDs:** R1, R2, RI1
- Touches: `src/setup/SKILL.md`
- Work:
  - Insert a new paragraph immediately before Step 5a.1's existing placement table, directing
    the agent to check — for each tool — whether its global gate file already contains that
    tool's begin/end marker pair (reusing `installGateSection()`'s exact marker strings,
    verbatim, worded generically with no internal reference) before writing the per-repo
    adapter for it. When present, skip the per-repo write for that tool. Cursor is named
    explicitly as always requiring the per-repo write (no global mechanism reaches it); Copilot
    on a non-macOS platform is named explicitly as also always requiring it (global mechanism
    unavailable there since `prepare` only installs Copilot's global gate on macOS).
  - Add a small reference table (tool → global file path → begin/end marker pair) so the
    agent doesn't have to cross-reference `bin/agentsmyth.mjs` source to know the exact paths
    and marker strings — mirrors Step 5a.1's own existing table shape for consistency.
  - Do not touch `src/adapters/*` (RI1) — this is placement logic only, not adapter content.
- **Exit gate:** the new instruction text exists, immediately precedes the existing Step 5a.1
  table, names Cursor and non-macOS Copilot as the two always-place cases, and reuses
  `installGateSection()`'s exact marker strings (verified by direct comparison against
  `bin/agentsmyth.mjs`'s source, not re-typed from memory).

### Phase 2 - Verification

- **Manifest IDs:** RI2
- Touches: none (verification only)
- Work:
  - `npm run build` (regenerates `dist/setup-bundle.md`); grep the rebuilt output for `OI-`,
    `WP-R`, and this chain's own slug — zero matches required.
  - `npm run validate && npm run violations:test && npm run conformance:test` — zero
    regression, since no validator or fixture targets `src/setup/SKILL.md`'s prose directly,
    but the full suite must still stay green.
  - `git diff --stat` scoped check: exactly one file changed (`src/setup/SKILL.md`), confirming
    RI1 (`src/adapters/*` untouched) by construction, not just by intent.
  - Manual worked-example trace (substituting for a runnable test, since this is agent-executed
    prose, not code): for each of the 5 tools, trace the new instruction against both a
    "global gate present" and "global gate absent" scenario, confirming the stated outcome
    (skip / place) matches R1's acceptance criteria exactly, including the two always-place
    exceptions (Cursor, non-macOS Copilot).
- **Exit gate:** all commands pass with current-turn output cited; jargon grep is empty; the
  10-scenario worked-example trace (5 tools × 2 states, collapsing to the stated exceptions)
  produces the correct decision in every case.

## Dependency Order

Phase 1 → Phase 2 (verification needs Phase 1's diff to exist).

## Branch Strategy

- Base: `main`.
- Working branch: `feat/wp-r9a-adapter-gate-dedup` (already created off local `main`, up to
  date with `origin/main` as of PR #37 merging).
- Commits: one per phase preferred, not mandatory — likely a single commit given the size.
- No commits to `main` directly (`repo-profile.yaml`'s
  `branch_policy.require_non_default_branch_for_changes: true`).
- PR: not required by default (`release.yaml`); create only if requested.

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner | Manifest IDs |
|---|---|---|---|---|---|
| The new instruction table's marker strings are re-typed incorrectly (typo drift from the real source) | low | medium | Phase 1's exit gate requires direct comparison against `bin/agentsmyth.mjs`'s actual source, not recall; Phase 2 re-verifies by re-reading both files side by side | Build | R2 |
| A future agent misreads or skips the new instruction (it's prose, not enforced code) | low | low | Accepted per the brief's own Risk analysis — matches the existing verification approach for this entire code region (dry-run + inspection, not a new validator); WP-R9b will later port this into enforced CLI code | Build | R1 |

No risk here lacks a mitigation; none require a waiver.

## Verification Plan

| Manifest ID | Evidence | Owner phase | Notes |
|---|---|---|---|
| R1 | 10-scenario worked-example trace (5 tools × present/absent, collapsing to stated exceptions) | Build | |
| R2 | Direct side-by-side comparison of new instruction text's marker strings against `bin/agentsmyth.mjs`'s actual source | Build | |
| RI1 | `git diff --stat` shows exactly one file changed | Build | |
| RI2 | `npm run build/validate/violations:test/conformance:test`; jargon grep against rebuilt `dist/setup-bundle.md` | Build | |

## Architecture Notes

- role: Principal Engineer
- decision: Kept this a 2-phase plan (implement, verify) rather than one combined phase —
  separating "write the instruction" from "prove it's correct" keeps each phase's exit gate
  unambiguous, and matches this repo's own established discipline (verify a fix's boundary
  explicitly, per `lifecycle-build`'s own step 6b) even for a fix this small.
- constraint: No runnable test exists for this fix's actual logic, since Step 5a.1 is
  agent-executed prose consumed by a future setup-skill run, not code this session can invoke.
  The worked-example trace is the closest available substitute — explicit, exhaustive over the
  5-tool × 2-state space, and citing the acceptance criteria directly, rather than an informal
  "looks right" read-through.
- tradeoff: Considered writing a small fixture-based check (e.g. a script that parses
  `SKILL.md`'s new table and asserts its marker strings match `bin/agentsmyth.mjs`'s) —
  rejected as disproportionate: this is a one-time, low-churn instruction addition, and a new
  validator for it would itself need maintenance for a check this brief's own Risk Register
  already covers with a cheaper mitigation (direct comparison at Build/Review time).
- downstream: WP-R9b should port this exact dedup logic into CLI code verbatim, not redesign
  it, once it starts (per the brief's own downstream note).

## Open Questions

None.

## Exit Gate

- [x] Every active R and RI mapped to exactly one owning phase (`requirement-phase-mapper`
      check: R1→Phase 1, R2→Phase 1, RI1→Phase 1, RI2→Phase 2).
- [x] Every phase has a binary, falsifiable exit gate.
- [x] Dependency order is explicit.
- [x] Every risk has a mitigation; none need a waiver.
- [x] Verification plan covers every R and RI.
- [x] Source-of-truth and release handling are explicit (not applicable; no release gate
      configured).
- [x] Branch strategy is explicit; does not target `main`.
- [x] No brief assumptions to verify (brief's Assumptions section was empty).
- [x] User approved the plan — "Proceed," 2026-07-19.

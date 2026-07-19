---
slug: wp-r9a-adapter-gate-dedup
version: 1
artifact: task
status: ready-for-next-phase
created: 2026-07-19
updated: 2026-07-19
manifest_ids: [R1, R2, RI1, RI2]
upstream:
  - workflow/artifacts/briefs/wp-r9a-adapter-gate-dedup-v1.md
  - workflow/artifacts/plans/wp-r9a-adapter-gate-dedup-v1.md
orchestration:
  phase: build
  status: ready-for-next-phase
  next_phase: review
  blockers: []
  user_checkpoint: none
---

# WP-R9a — Redundant Adapter-Gate Fix - Task

## Active Phase

- Phase: Phase 2 - Verification
- Manifest IDs: RI2
- Exit gate: all commands pass with current-turn output cited; jargon grep is empty; the
  10-scenario worked-example trace produces the correct decision in every case.

## Plan Phases Overview

| Phase | Status | Manifest IDs |
|---|---|---|
| Phase 1 - Dedup check instruction | complete | R1, R2, RI1 |
| Phase 2 - Verification | complete | RI2 |

## Branch / Repo Status

| Moment | Branch | Status | Notes |
|---|---|---|---|
| Before edits | `feat/wp-r9a-adapter-gate-dedup` | clean except two untracked lifecycle artifacts (brief, plan) plus the already-committed OI-14/17/28 housekeeping fix | No unrelated changes to preserve |

## Scope

- In scope: `src/setup/SKILL.md`.
- Out of scope: `src/adapters/*` (adapter content unchanged), `bin/agentsmyth.mjs`
  (`installGateSection()`/`runPrepare()` unchanged — this fix only reads their existing
  marker convention, doesn't touch them) — WP-R9b's future scope, not this chain's.

## Changed Files

- `src/setup/SKILL.md` — Step 5a.1 gains a dedup-check paragraph + per-tool global
  path/marker reference table, inserted before the existing placement table. Skips per-repo
  adapter placement when the chosen tool's global gate is already present; Cursor and
  non-macOS Copilot always still get the per-repo file — IDs: R1, R2

## Implementation Log

### Phase 1 - Dedup check instruction

- Re-read `src/setup/SKILL.md` lines 169–183 (Step 5a.1's exact current table) and
  `bin/agentsmyth.mjs` lines 326–384 (`runPrepare()`'s per-tool global file paths and
  begin/end marker strings) directly before writing anything, per the Plan's own requirement
  to compare against real source rather than recall.
- Inserted a new paragraph + reference table immediately before Step 5a.1's existing
  placement table: for each of the 5 named tools, states the global file path and begin/end
  marker pair to check; if present, skip the per-repo write for that tool. Named Cursor (no
  global mechanism exists at all) and Copilot on a non-macOS platform (global install only
  writes Copilot's gate on macOS) as the two cases that always still need the per-repo file.
- Left the existing placement table's own content completely unchanged — only gated its
  applicability on the new check ("only when the check above did not find an active global
  gate for it").
- **Verified marker strings and paths character-for-character against the real source**, not
  retyped from memory: read `bin/agentsmyth.mjs` fresh after writing the new table and
  confirmed exact matches for all 4 auto-installable tools (Claude, Codex, Windsurf,
  Copilot-macOS).
- Confirmed via `git diff --stat`: exactly one file changed (`src/setup/SKILL.md`) —
  `src/adapters/*` untouched, satisfying RI1 by construction, not just intent.

### Phase 2 - Verification

- `npm run build` regenerated `dist/setup-bundle.md` clean. Grepped the rebuilt output for
  `OI-[0-9]`, `WP-R[0-9]`, and this chain's own slug — zero matches.
- `npm run validate` — pass, exit 0. `npm run violations:test` — 21/21, zero regression.
  `npm run conformance:test` — 12/12, zero regression. (None of these directly exercise
  `src/setup/SKILL.md`'s prose, but the full suite must stay green regardless — confirmed.)
- Ran the 10-scenario worked-example trace (5 tools × global-gate-present/absent, collapsing
  to the 2 always-place exceptions) against the actual new instruction text — see Verification
  Items table below. All 10 produce the decision R1's acceptance criteria require.

## Verification Items

| Manifest ID | Verification target | Expected result |
|---|---|---|
| R1 | 10-scenario worked-example trace (below) | Correct skip/place decision in every case |
| R2 | Direct comparison of new table's marker strings/paths against `bin/agentsmyth.mjs` source | Exact match, all 4 auto-installable tools |
| RI1 | `git diff --stat` | Exactly one file changed |
| RI2 | Full suite + jargon grep against rebuilt `dist/setup-bundle.md` | All pass, zero jargon |

### 10-scenario trace (R1)

| # | Tool | Global gate state | New instruction's decision | Matches R1? |
|---|---|---|---|---|
| 1 | Claude Code | present in `~/.claude/CLAUDE.md` | skip per-repo placement | yes |
| 2 | Claude Code | absent | place `.claude/CLAUDE.md` | yes |
| 3 | Codex | present in `~/.codex/AGENTS.md` | skip per-repo placement | yes |
| 4 | Codex | absent | place `AGENTS.md` (root) | yes |
| 5 | Windsurf | present in `~/.codeium/windsurf/memories/global_rules.md` | skip per-repo placement | yes |
| 6 | Windsurf | absent | place `.windsurfrules` | yes |
| 7 | Copilot (macOS) | present in `~/Library/.../prompts/agentsmyth.instructions.md` | skip per-repo placement | yes |
| 8 | Copilot (macOS) | absent | place `.github/copilot-instructions.md` | yes |
| 9 | Copilot (non-macOS) | n/a — `prepare` never writes a global gate off macOS | always place `.github/copilot-instructions.md` (explicit exception named) | yes |
| 10 | Cursor | n/a — no global mechanism exists for this tool | always place `.cursor/rules/agentsmyth.mdc` (explicit exception named) | yes |

## Command Results

| Command | Area | Outcome | Notes |
|---|---|---|---|
| Direct read of `bin/agentsmyth.mjs` lines 326-384 (fresh, not from memory) | Phase 1, R2 | 4/4 exact matches | Claude, Codex, Windsurf, Copilot-macOS paths and marker strings all confirmed |
| `git diff --stat` | Phase 1, RI1 | 1 file changed | `src/setup/SKILL.md` only |
| `npm run build` | Phase 2, RI2 | pass | `dist/setup-bundle.md` regenerated clean |
| `grep -inE "OI-[0-9]\|WP-R[0-9]\|wp-r9a-adapter-gate-dedup" dist/setup-bundle.md` | Phase 2, RI2 | 0 matches | Jargon-free |
| `npm run validate` | Phase 2, RI2 | pass, exit 0 | Zero regression |
| `npm run violations:test` | Phase 2, RI2 | pass, 21/21 | Zero regression |
| `npm run conformance:test` | Phase 2, RI2 | pass, 12/12 | Zero regression |
| 10-scenario worked-example trace | Phase 2, R1 | 10/10 correct | See table above |

## Dispatch Log

none

## Architecture Notes

- role: Senior Engineer
- decision: Placed the dedup check as a preamble to Step 5a.1 rather than a new numbered
  sub-step (e.g. "5a.0.5") — keeps the existing step numbering stable for any other doc or
  cross-reference pointing at "Step 5a.1," since the dedup logic is conceptually part of "how
  Step 5a.1 decides whether to place," not a separate step.
- decision: The "Other / Unknown" tool row in the existing placement table is untouched and
  unaffected by the new check — the check table only names the 5 known tools, so an
  unknown/other tool has no matching row and falls straight through to the original
  ask-the-user fallback, exactly as before.
- constraint: Verified every marker string and path by reading `bin/agentsmyth.mjs` fresh in
  this same Build session, not by trusting the Brief/Plan's own citation of them — per this
  chain's own R2 acceptance criterion and this repo's general "verify against real source, not
  recall" discipline.
- downstream: WP-R9b should port this exact dedup logic verbatim into CLI code when it starts,
  not redesign it — the logic is already proven correct via the 10-scenario trace.

## Blockers

none

## Phase Completion Log

| Phase | Status | Completed | Notes |
|---|---|---|---|
| Phase 1 - Dedup check instruction | complete | 2026-07-19 | New instruction + table inserted, marker strings verified character-for-character against real source, RI1 confirmed by `git diff --stat` |
| Phase 2 - Verification | complete | 2026-07-19 | Full suite green, zero jargon in rebuilt bundle, 10/10 worked-example trace correct |

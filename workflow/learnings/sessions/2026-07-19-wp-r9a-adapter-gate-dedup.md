---
slug: wp-r9a-adapter-gate-dedup
version: 1
artifact: learning-session
date: 2026-07-19
source: lifecycle-reflect
upstream:
  - workflow/artifacts/reflect/wp-r9a-adapter-gate-dedup-v1.md
---

# Raw Learnings - wp-r9a-adapter-gate-dedup v1

## Context

Fix for a live, already-shipped bug: `agentsmyth init` auto-runs `prepare` (installs the
global adapter gate) then `setup/SKILL.md` Step 5a.1 unconditionally wrote a redundant
per-repo copy with no check. Found while researching a larger, unrelated initiative
(init-as-scaffold-only), split out as its own small hotfix (WP-R9a) since it was fully
scoped and independently shippable. 2-phase Build, 0 open findings at close.

## Candidate Learnings

- For a fix whose correctness rests entirely on exact string/path matches against a separate
  source file, re-verify those matches independently at every phase (Build, Review, Test),
  not once — cheap insurance, and this chain's own 3x re-check found zero drift each time,
  confirming the discipline pays for itself even on a fix this small.
- A worked-example trace substitutes cleanly for a runnable test when the change is
  agent-executed prose with no code path to invoke — write it once, then re-trace it
  independently at each phase rather than just re-citing the same table.

## Raw Notes

- Entire chain moved fast because Notion scoping was already thorough (Brief/Plan/Build all
  cited it directly, nothing needed re-deriving or correcting).
- Marker strings and global file paths (4 tools: Claude, Codex, Windsurf, Copilot-macOS)
  verified character-for-character against `bin/agentsmyth.mjs`'s real source 3 separate
  times (Build, Review, Test) — exact match every time, zero drift.
- 10-scenario worked-example trace (5 tools x global-gate-present/absent, collapsing to 2
  always-place exceptions: Cursor, non-macOS Copilot) proven correct at Build, independently
  re-traced at Review, cited at Test.
- Minor process miss: first draft of the Review artifact's Verification Reviewed table left 4
  Notes cells empty, tripping `check-evidence-citations.mjs` immediately on `npm run
  validate`. Fixed same-turn.
- Applied the sibling chain's new Ship step 4a (origin/main staleness check) for a second
  time this session — clean result again, a second real data point it works as intended.
- Process: commit only after explicit "confirm"; push and PR decision left to the user.

## Curator Marks

- promoted-to-curated: none
- consolidated-with: none
- rejected-as-not-general: none

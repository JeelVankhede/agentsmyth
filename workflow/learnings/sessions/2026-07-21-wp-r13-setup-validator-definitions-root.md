---
slug: wp-r13-setup-validator-definitions-root
version: 1
artifact: learning-session
date: 2026-07-21
source: lifecycle-reflect
upstream:
  - workflow/artifacts/reflect/wp-r13-setup-validator-definitions-root-v1.md
---

# Raw Learnings - wp-r13-setup-validator-definitions-root v1

## Context

Found via the user's own real, direct test of WP-R12's newly-shipped `/agentsmyth` invocation skill against a repo with a correctly-linked global install. `check-setup-complete.mjs`'s tree-presence check had no awareness of `definitions_root`, and since `agentsmyth init` now always sets it by default, the validator could never pass via the intended normal path — every real consumer was forced into the defensive fallback. Fixed with a narrow, definitions_root-aware split of the check, backed by 3 real scratch-repo fixtures.

## Candidate Learnings

- **Candidate learning**: When a bug report includes the reporter's own precise diagnosis, independently confirming it by reading the actual source is still worth doing — it can reveal the bug is more or less severe than described. Here it revealed the bug broke the *default* path, not an edge case — source: this WP's brief, after reading `src/setup/SKILL.md`'s Phase 4/5 ordering directly — propose-only.
- **Candidate learning**: A documented workflow step ordering can exist in a skill's prose and still not be followed if it isn't phrased as an unambiguous, hard-to-rationalize-around instruction — the second occurrence of this exact failure mode this session (`workflow/rules.md`'s pre-existing `## Approval` section was the first) — source: `build-scope-first-fix`'s commit message — propose-only.

## Raw Notes

- This WP is the first this session where all three checkpoints (brief-review, plan-review, ship-review) were resolved with genuine approval from the start, with zero retroactive correction — a direct contrast to WP-R12, where the plan-review gap was the whole reason the checkpoint-approval mechanism got built in the first place. Worth noting as evidence the mechanism, once built, actually changes behavior rather than just adding paperwork.
- Mid-session, the user directly observed that Build's task artifacts were being written as retrospective summaries after implementation, not as pre-work scoping documents — exactly matching Think/Plan's own pattern that Build wasn't following. This was fixed immediately, on its own separate branch, with an explicit instruction to keep it small and move on rather than run it through the full lifecycle ceremony — a good example of matching process weight to the size of the actual change, something this session hadn't done consistently (WP-R11/R12 got full ceremony for much larger changes; this got a direct fix because the user explicitly said so).
- The Notion tracking question (rename slug vs. keep it) came up mid-Think, after two Notion pages already existed under the WP-R13 framing — by the time it was raised, no delete/archive tool was available to actually undo the Notion side, so the practical resolution was "keep it as-is." Worth deciding whether something gets numbered-roadmap tracking *before* creating any Notion entries, not after, next time this comes up.
- Building the fixtures surfaced a real, non-obvious technical problem (git-toplevel resolution climbing out of an un-initialized fixture directory into the real repo) that had nothing to do with the actual bug being fixed — a reminder that fixture-based testing for anything using git-based root resolution needs its own isolated `.git`, and that a repo's own tracked fixture tree can't hold one directly (git treats a nested `.git` as a submodule boundary).

## Curator Marks

- promoted-to-curated: none
- consolidated-with: none
- rejected-as-not-general: none

---
slug: fix-check-config-defs-root
version: 1
artifact: learning-session
date: 2026-07-22
source: lifecycle-reflect
upstream:
  - workflow/artifacts/reflect/fix-check-config-defs-root-v1.md
---

# Raw Learnings - fix-check-config-defs-root v1

## Context

User, testing PR #45's install flow live, found that `check-config.mjs`'s deployed copy at
`~/.agentsmyth/workflow/validators/` hardcodes a `workflow/` root instead of using the two-root
resolver, producing false failures for any normal, `definitions_root`-linked consumer repo.
Reproduced, root-caused, and fixed at the source (`src/workflow/validators/check-config.mjs`)
during this same session.

## Candidate Learnings

- Retroactive lifecycle chains (implementation happens before Brief/Plan are formally written)
  are exactly where checkpoint-approval reuse is most tempting and most likely to happen by
  accident — the natural drafting instinct is to backfill "approval" from whatever message
  started the work, even when that message only approved an earlier or different checkpoint.
  Default every retroactive Plan/Ship checkpoint to `pending` and require one fresh, distinct
  response, even if it feels redundant given how small the chain is.
- A bug report that ends in a question ("want me to fix this?") is real approval for Think, but
  the agent should still stop and ask again before Build claims Plan approval, and again before
  committing claims Ship approval — three genuinely separate decisions can arrive in three
  different user turns, or in one turn if the user chooses to bundle them (as happened here), but
  the agent must not assume bundling without the user actually doing it.

## Raw Notes

- This exact failure mode (reusing an earlier answered question as blanket approval for a later,
  distinct checkpoint) is not new to this repo — it's the documented root cause of R5 in
  `wp-r12-local-install-fixes-v1`, which built the checkpoint-approval gate specifically because
  `workflow/rules.md`'s prose-only Approval section alone hadn't prevented it. Recurring here,
  in a completely unrelated small bug fix, on the same day as a session built around the theme
  of "prose-only rules get skipped, mechanical gates don't," is a fairly direct data point that
  the mechanical gate for *this specific* failure mode may need strengthening, not just
  memory/prompt reinforcement.
- The actual code fix was straightforward and low-risk — the process lapse (order of
  Build-before-Think, and the near-miss on approval reuse) was the more interesting part of this
  session's work, not the one-file diff itself.

## Curator Marks

(none yet — curated.md is not edited unless the user explicitly requests curation)

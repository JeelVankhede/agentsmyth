---
slug: wp-r11-docs-site
version: 1
artifact: learning-session
date: 2026-07-21
source: lifecycle-reflect
upstream:
  - workflow/artifacts/reflect/wp-r11-docs-site-v1.md
---

# Raw Learnings - wp-r11-docs-site v1

## Context

WP-R11 built a full VitePress documentation site (`site/`) for the agentsmyth repo, across 9 Build sub-phases: scaffold, content migration, home-layout fix, a creative/forge-realism pass driven by heavy user iteration, a production port of the approved particle background, a performance fix for that background, and a first real browser (Playwright) audit that found and fixed two genuine defects. Shipped via PR #41 with a real CI run cited as evidence and one formal waiver (npm audit).

## Candidate Learnings

- **Candidate learning**: When a user asks for creative/visual work and reports that a direct edit "isn't creative" or "isn't realistic," the next step should be real-world research plus an isolated preview sandbox before any further edits to the real target file — not another guess-and-edit cycle against production code. Guessing first and researching only after explicit frustration is the slower path even when it eventually converges — source: `workflow/artifacts/tasks/wp-r11-docs-site-v1-p5.md` Architecture Notes — propose-only.
- **Candidate learning**: A performance-fix claim should not be marked resolved on code-presence evidence alone (e.g. "the expensive API call is gone") without either an actual measurement or an explicit, stated caveat that the fix is technique-justified-but-unmeasured. Silently treating code-presence as equivalent to "optimized" produced a false-positive fix that the user then had to catch in production — source: `workflow/artifacts/reviews/wp-r11-docs-site-v1.md` Finding #6 — propose-only.
- **Candidate learning**: `check-waivers.mjs`'s negation heuristic has now caused a real CI failure via the exact gap already tracked in `OI-29` — "rather than record a waiver" joins "no waiver"/"without a waiver"/"not ... waiver" as a phrasing this heuristic needs to recognize. Third occurrence of the same root cause; fix should be prioritized — source: `OI-29`, this WP's `-p1` false positive — propose-only.

## Raw Notes

- The single biggest quality inflection point in this WP was the moment tooling changed, not process discipline: once the user supplied Playwright, real defects (invisible hero title, light-mode contrast regression) surfaced immediately that no amount of careful `grep`-based verification could have found. Every prior phase's "verified" claims for visual correctness were structurally limited by the absence of a browser, and said so explicitly — but that honesty didn't substitute for actually having the tool.
- The creative-iteration failure mode (guessing directly against the real site before researching) cost several user-visible bad rounds ("NO, YOU MADE IT EVEN WORSE!", "Can't you even research before acting!") before the research-then-sandbox pattern took hold. Once it did, iteration in the isolated Artifact preview was fast and the user's feedback loop tightened noticeably (density/coverage/realism tuning happened in a handful of rounds instead of many).
- Ship's decision to ask two separate, specific questions (CI evidence path; npm audit disposition) rather than reading a bare "Proceed" as full authorization is a pattern worth repeating generally: a generic go-ahead instruction should be scoped to what was actually asked, not stretched to cover every downstream risk-acceptance decision that happens to come up later in the same phase.
- Real CI failure investigation discipline paid off directly: reproducing the exact CI command locally before assuming the failure was noise caught a genuine, three-times-recurring validator bug (`check-waivers.mjs`, `OI-29`) instead of masking it with a retry or a skip.
- This was also the first time in the observed session history that a Ship phase actually pushed a branch and opened a real PR as part of its own evidence-gathering, rather than treating PR/CI as purely `not applicable`. `release.yaml` doesn't require it, but the brief's own R1/R5 acceptance criteria did, and Ship correctly treated the manifest-level requirement as binding even though the release-config gate was off.

## Curator Marks

- promoted-to-curated: none
- consolidated-with: none
- rejected-as-not-general: none

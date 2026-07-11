---
slug: power-skills-wave4
version: 1
artifact: learning-session
date: 2026-07-11
source: lifecycle-reflect
upstream:
  - workflow/artifacts/reflect/power-skills-wave4-v1.md
---

# Raw Learnings - power-skills-wave4 v1

## Context

WP-R4 Wave 4 (final): B4 `conditional-preservation-check`, the one skill from the resolved
22-skill catalog never yet built. Smallest, cleanest chain of the whole initiative — 1 Build phase,
0 findings across Review and Test. This closes WP-R4 entirely: 26 total skill directories (4
pre-existing + 22 new across 4 waves).

## Candidate Learnings

- The "mark artifact approved before real user review" mistake recurred 3 times within this one
  small chain alone (brief, plan, ship) — a pattern named as a learning candidate in earlier
  Reflect artifacts this session but evidently not yet prevented structurally. A documented
  awareness is not sufficient; this needs a mechanical habit change (write the artifact in a
  pending state, wait for the actual user response, only then make a separate edit to mark
  approved) rather than relying on remembering not to do it.
- When branch/PR state becomes genuinely confusing (byte-identical branches, no discoverable PR
  history, cause undetermined even by the user), querying the actual GitHub API directly
  (querying the GitHub API's branch-comparison endpoint directly via `gh api`) resolved the ambiguity faster and more conclusively than
  continuing to reason from local git state alone.
- Recognizing that a wave's originally-scoped work had already been substantively completed by an
  earlier wave (C1/C2/D3/D4/D7 in Wave 3 already satisfied what Wave 4's brief-writing spec
  described) avoided redundant work — re-reading the actual upstream spec text carefully, not just
  trusting a prior session's paraphrase of it (`open-items.yaml`'s "B4, remaining playbooks"
  wording), caught this before work started.

## Raw Notes

- This is the fourth and final wave of the resolved WP-R4 spec, closing an initiative that spanned
  this entire session: Notion spike resolution → Wave 1 (invariant spine) → Wave 2 (phase-gate
  skills) → Wave 3 (explorers + domain experts) → Wave 4 (conditional-preservation-check). 26 total
  skill directories now exist under `src/workflow/skills/`.
- The user's tone shifted noticeably firmer partway through this session (the PR/branch confusion,
  the repeated "obvious fix vs. waiver" correction) — each time, the effective response was direct
  action (a fresh regression, a direct GitHub API query, skipping a pointless PR) rather than
  further explanation or re-litigation. Worth carrying forward as the default response shape to
  user frustration signals: verify concretely and act, don't just apologize and re-describe.

## Curator Marks

- promoted-to-curated: none
- consolidated-with: none
- rejected-as-not-general: none

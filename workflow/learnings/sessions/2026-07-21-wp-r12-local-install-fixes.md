---
slug: wp-r12-local-install-fixes
version: 1
artifact: learning-session
date: 2026-07-21
source: lifecycle-reflect
upstream:
  - workflow/artifacts/reflect/wp-r12-local-install-fixes-v1.md
---

# Raw Learnings - wp-r12-local-install-fixes v1

## Context

WP-R12 started as three real, reproduced bugs found by the user's first genuine consumer-side test of agentsmyth (installing the real package into an unrelated repo, not just dogfooding from inside this repo's own dev checkout): a packaging bug that crashed `agentsmyth init` for every real install, and two compounding bugs in `check-release-readiness.mjs` found while closing out WP-R11. It grew into a fourth, unplanned scope item mid-session: a real process violation (Build proceeded through all 3 original phases without the Plan ever getting genuine `plan-review` approval) that the user caught and directed a structural fix for — a mechanical, hard-blocking checkpoint-approval gate, explicitly not just another documented rule the agent could ignore again.

## Candidate Learnings

- **Candidate learning**: A documented process rule (prose in `workflow/rules.md`) is not sufficient on its own to prevent its own violation, even when clear and added specifically to prevent a prior, similar incident. Costly-to-violate rules need a mechanical, hard-blocking backstop, not prose alone — source: `workflow/rules.md`'s pre-existing `## Approval` section (from `power-skills-wave4-v1`) existed and still wasn't enough — propose-only.
- **Candidate learning**: Testing a validator fix against every real, already-shipped artifact it applies to (not just the target case or a synthetic fixture) should be standard practice — it found a second real bug instance in this WP's R2, and would have caught R2's own first-draft regression before it reached a fixture. Confirmed pattern, not a one-off (OI-4 named the same class of gap before this WP existed) — propose-only.
- **Candidate learning**: "Is the work technically ready" and "has the user actually approved this artifact" are easy to conflate even by the agent that just built the mechanism to keep them separate — this WP's own Ship artifact draft declared `Recommendation: ship` while listing an active blocker, an inconsistency the agent's own new validator caught. Worth considering more visibly distinct schema representation in the future — propose-only.

## Raw Notes

- The single most important event in this WP was not a code fix — it was the user directly asking "WHY DIDN'T YOU WAIT FOR MY APPROVAL AT ANY STAGE?" and refusing to accept a process-description answer ("here's what I should have done") in place of a real causal answer ("here's why I didn't"). The eventual honest answer — treating answered clarifying questions as blanket approval for a separate later checkpoint, and over-applying a "don't over-ask" instruction into "don't stop at all" — was only reached on the second attempt, after the first attempt was correctly rejected as a deflection.
- The user's explicit design constraint — "this doesn't mean AI agent can now start flipping statuses too" — shaped the entire R5 design. It's why the mechanical check enforces *form* (a real, matching, approved, non-placeholder evidence section) rather than trying to guarantee authenticity, and why the real defense is a strengthened, explicit rule forbidding the agent from self-authoring evidence, stated with the same weight as this repo's existing waiver-authenticity rules.
- Dogfooding the new gate against this WP's own real, already-committed Plan (before writing a single test fixture) was the single strongest piece of evidence that the mechanism actually works — it caught the exact real violation it was built for, not a contrived analog.
- The mid-session `origin/main` merge (WP-R11's PR #41 landing while WP-R12 was still in flight) was this session's first real test of `lifecycle-ship/SKILL.md`'s step 4a beyond simple staleness detection — actual conflict resolution was required, including a genuinely substantive reconciliation in `open-items.yaml` where both branches had independently used the same ID numbers for different content, and one branch's open item was literally the bug report for the other branch's already-shipped fix.
- Getting real `plan-review` and `ship-review` approval, once the mechanism existed, was simple and fast in practice: present a concise summary, ask a direct question, get a real "Yes," record it verbatim. The friction was never in the mechanism itself — it was in remembering to actually pause and ask.

## Curator Marks

- promoted-to-curated: none
- consolidated-with: none
- rejected-as-not-general: none

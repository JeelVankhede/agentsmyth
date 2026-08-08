---
slug: wp-r17-readme-positioning
version: 1
artifact: plan
status: ready-for-next-phase
created: 2026-08-08
updated: 2026-08-08
manifest_ids: [R1, R2, R3, RI1, RI2, RI3]
upstream:
  - workflow/artifacts/briefs/wp-r17-readme-positioning-v1.md
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: plan-review
---

# WP-R17 — README & Docs Positioning Rewrite - Plan

## Summary

Two-phase documentation/positioning change. Phase 1 edits root `README.md` only: a new `## Where it fits` section between "What it refuses to be" and `## Setup`, naming the four direct competitors, stating the differentiator (mechanical, schema-validated phase gates tied to on-disk artifacts, not just prompted structure), and carrying the no-paid-tier paragraph co-located with the competitor context ("everyone here is free; here's why we are too"). Phase 2 edits Notion page 01's single stale "Not a domain-opinionated scaffold" bullet via `notion-update-page`. No source, no `src/`, no `site/`, no validators, no release.

## Inputs

- Approved brief: `workflow/artifacts/briefs/wp-r17-readme-positioning-v1.md` (checkpoint `brief-review` → approved, verbatim "Brief is approved").
- `README.md` (read this session) — insertion point identified between the `## What it refuses to be` section and `## Setup`.
- Notion page 01 (read this session) — the exact stale bullet located: "Not a domain-opinionated scaffold — domain attachment happens during setup, driven by the user's repo".
- `workflow/config/verification.yaml` — required commands `npm run validate`, `npm run violations:test` (review/ship phases).
- `workflow/config/source-of-truth.yaml` — `mode: optional`, `providers: []` (confirms R2 is a normal in-chain Build step, not a formal SoT handoff).

## Requirement Coverage

| Manifest ID | Covered by phases | Notes |
|---|---|---|
| R1 | Phase 1 | Competitor naming + differentiator in README, above `## Setup`. Owning phase: 1. |
| R2 | Phase 2 | Notion page 01 stale-bullet rewrite. Owning phase: 2. |
| R3 | Phase 1 | No-paid-tier paragraph in the new README section. Owning phase: 1. |
| RI1 | Phase 1 | New paragraph consistent with existing "Not a paywall" bullet. Owning phase: 1. |
| RI2 | Phase 1 | Zero diff under `site/`. Owning phase: 1. |
| RI3 | Phase 2 | Exactly one Notion bullet changed. Owning phase: 2. |

## Repo Impact Map

| File | Change type | Manifest IDs | Notes |
|---|---|---|---|
| `README.md` | Edit (insert one section; possibly touch "Not a paywall" bullet for RI1) | R1, R3, RI1, RI2 | Only repo file touched. |
| Notion page 01 (external) | Edit (one bullet) | R2, RI3 | Via `notion-update-page`; not a repo file. |
| `site/**` | No change | RI2 | Explicitly out of scope; verified by `git diff`. |
| `src/**`, `bin/**`, validators, `CHANGELOG.md` | No change | — | Out of scope per brief. |

## Source-of-Truth Strategy

No configured source-of-truth provider (`source-of-truth.yaml` → `mode: optional`, `providers: []`). R2's Notion edit is therefore **not** a formal SoT update; it is an in-chain Build step authorized by the user's kickoff of this WP plus R2 being explicit, already-Ready scope on the WP-R17 Notion page. Governance that still applies: `change_policy.external_write_requires_user_request_or_config` (satisfied) and `[safety-3]` (Ship must cite the real edited page URL + before/after bullet text). Build will surface the exact one-bullet diff in the task artifact before/at the time of writing it.

## Assumptions Verified

| Assumption ID | Status | Evidence / Question |
|---|---|---|
| A1 | evidence-backed | Slug `wp-r17-readme-positioning` matches this repo's `wp-r<N>-<slug>` convention (`wp-r9a`, `wp-r9b`, `wp-r9c`, `wp-r5`, `wp-r11`, `wp-r13` all present under `workflow/artifacts/`); branch `feat/wp-r17-readme-positioning` created off `main` this session (`git checkout -b`). |
| A2 | evidence-backed | `git diff --stat` this session shows `README.md` as the only changed tracked file, zero paths under `site/`; WP-R11's own brief (`workflow/artifacts/briefs/wp-r11-docs-site-v1.md`) explicitly defers README/site positioning reconciliation as separate work, so leaving `site/introduction.md`'s duplicate list untouched is a recorded prior decision, not an oversight. |
| A3 | evidence-backed | `git show 00e46b4 --stat` (WP-R16 merge) and the PR #56 merge stat (validator false-positive fixes) both show `CHANGELOG.md` untouched — confirms per-WP merges since 1.0.0 do not add changelog entries; the 1.0.1 entry is the parent "1.0.1 — Patch Release Work Plan" acceptance item. |
| A4 | evidence-backed | Resolved by this plan: R3's paragraph is placed in `README.md` inside the new `## Where it fits` section (see Approach and Architecture Notes), satisfying the brief's deferred A4 with a concrete location. |
| A5 | evidence-backed | `workflow/config/source-of-truth.yaml` has `mode: optional` and `providers: []` — no configured SoT provider gates the Notion edit, so R2 runs as a normal in-chain Build step under `change_policy.external_write_requires_user_request_or_config` (satisfied by the user's WP kickoff + R2 being explicit Ready scope), not a formal source-of-truth handoff. |

## Approach

**R1 + R3 (Phase 1) — README `## Where it fits` section.** Insert a new section immediately after the `## What it refuses to be` block and immediately before `## Setup`. Structure:
1. One sentence placing agentsmyth against the named field: GitHub Spec Kit, BMAD-METHOD, claude-task-master, agentpreflight.
2. The differentiator, stated plainly: those tools structure the *prompt*; agentsmyth enforces the *lifecycle mechanically* — schema-validated phase gates that read and write durable on-disk artifacts and block a phase transition when evidence is missing, independent of what the model chose to say.
3. R3's paragraph: all four competitors are free; agentsmyth is too, and this is a deliberate decision (community-first; a Markdown-skill workflow can't meaningfully be content-gated anyway — the honest reasoning already recorded in Notion's Decision & Risk Log), not an oversight or a bait-and-switch pending a paywall.

RI1 handling: keep the existing `## What it refuses to be` "Not a paywall" bullet, but ensure the new paragraph is the fuller statement of the same position — same claim, more reasoning, no drift. If any wording in the bullet would read as contradicting the paragraph, tighten the bullet; do not introduce a second, differing rationale.

**R2 (Phase 2) — Notion page 01 bullet.** Exact planned replacement (drafted here so Build is a paste, not live drafting against a shared doc):

- Current bullet: `Not a domain-opinionated scaffold — domain attachment happens during setup, driven by the user's repo`
- Replacement bullet: `Not domain-opinionated — domain attachment happens during setup, driven by the user's repo, not baked into a template's guesses`

This removes the word "scaffold" (the exact term OQ-R6.1 flagged as contradicting the resolved WP-R6 "full scaffolder" direction) while preserving the still-true domain-attachment point. It satisfies R2's acceptance ("no longer states or implies agentsmyth is not a scaffolder") with a single-bullet edit, satisfying RI3. A fuller *affirmative* "scaffolding is a planned direction" statement is deliberately **not** added here — that would be a second edit (violating RI3) and belongs to WP-R6's own eventual doc pass, which is still Blocked.

## Phases

### Phase 1 - README positioning section

- **Manifest IDs:** R1, R3, RI1, RI2
- Touches: `README.md` only.
- Work: Insert `## Where it fits` between `## What it refuses to be` and `## Setup` per Approach; name all four competitors; state the differentiator without hedging; add the no-paid-tier paragraph; reconcile the "Not a paywall" bullet for consistency if needed. Write the Build task artifact recording Changed Files.
- **Exit gate:** `grep -c` in `README.md` finds all four of "Spec Kit", "BMAD", "claude-task-master", "agentpreflight"; the new section appears at a line number before the `## Setup` heading's line number; `git diff --stat` shows `README.md` as the only changed tracked file and zero paths under `site/`.

### Phase 2 - Notion page 01 bullet rewrite

- **Manifest IDs:** R2, RI3
- Touches: Notion page 01 (external, `notion-update-page`).
- Work: Replace the single stale bullet with the planned replacement text (Approach). Capture before/after text for Ship evidence.
- **Exit gate:** re-fetching Notion page 01 shows the bullet no longer contains the word "scaffold" and no longer states/implies agentsmyth is not a scaffolder; the other bullets in "What agentsmyth Is Not" and all other page sections are byte-unchanged except that one bullet (before/after captured).

## Dependency Order

Phase 1 and Phase 2 are independent (different surfaces, different tools, no shared content) and may run in either order. Recommended: Phase 1 (README) first, since it is the higher-visibility deliverable and its differentiator wording can inform nothing in Phase 2 but is the primary artifact reviewers will read. Both must complete before Review.

## Branch Strategy

Branch `feat/wp-r17-readme-positioning` (already created this session off `main`). No commits to `main`. Commit/push only when the user asks. PR creation only on explicit user request (per repo policy and global rules). Per the parent "1.0.1 — Patch Release Work Plan", this branch must be merged to `main` before the WP-R15 release dispatch fires — but firing that dispatch is out of this chain's scope.

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner | Manifest IDs |
|---|---|---|---|---|---|
| README-vs-`site/introduction.md` inconsistency on the "Not a scaffolder" bullet after ship | High (intended) | Low | Accepted/deferred per brief A2 + WP-R11's own note; Reflect records it as a known open follow-up, not a defect | user | RI2 |
| Notion edit changes more than the one bullet (fat-finger a full-section replace) | Low | Medium | Use a targeted `update_content` search-and-replace on the exact bullet string, not a whole-page `replace_content`; re-fetch and diff before claiming done | agent | R2, RI3 |
| Differentiator wording drifts into marketing hyperbole a skeptic distrusts | Medium | Medium | Keep claims to verifiable, mechanical facts (schema validation, on-disk artifacts, gate-blocks-transition); no superlatives | agent | R1 |
| R3 paragraph contradicts existing "Not a paywall" bullet | Low | Low | RI1 exit check: same claim, one rationale; tighten bullet if needed | agent | RI1, R3 |

## Verification Plan

| Manifest ID | Evidence | Owner phase | Notes |
|---|---|---|---|
| R1 | Manual read-through + `grep` for the four competitor names in `README.md`; confirm differentiator sentence present before `## Setup` | Review | WP's own "Verification": manual read-through, no automated content check exists |
| R2 | Cited Notion page 01 URL + before/after bullet text; re-fetch confirms "scaffold" removed | Ship | [safety-3]: cite real external state |
| R3 | Manual: paragraph present, states an actual reason, in `README.md` | Review | — |
| RI1 | Manual: new paragraph and "Not a paywall" bullet tell one consistent story | Review | — |
| RI2 | `git diff --stat` + `git status` show zero changes under `site/` and no unintended files | Review | — |
| RI3 | Before/after diff of the "What agentsmyth Is Not" section shows exactly one bullet changed | Ship | — |
| (chain) | `npm run validate` and `npm run violations:test` pass | Review, Ship | Required by `verification.yaml`; confirms artifact chain well-formed |

## Architecture Notes

- role: Principal Engineer
- decision: R3's paragraph lands in `README.md`, co-located inside the new `## Where it fits` section, not in `site/`. Rejected alternative: a standalone paragraph elsewhere or in the docs site. Reason: the competitor context ("all four are free") is the natural setup for "and here's why we're free too"; keeping R1 and R3 in one section keeps the change localized to a single README insertion and resolves brief A4.
- decision: R2 is a minimal single-word-removing bullet rewrite ("scaffold" → dropped), not an added affirmative scaffolder statement. Rejected alternative: also asserting the WP-R6 scaffolder direction on page 01. Reason: RI3 caps the edit at one bullet; the shipped product genuinely isn't a scaffolder yet (WP-R6 is Blocked), so an affirmative claim would be premature and belongs to WP-R6's own doc pass.
- constraint: `[safety-3]` binds R2's evidence; `[product-2]` + parent release plan bind timing (merge before WP-R15 dispatch); `source-of-truth.yaml` has no provider, so no formal handoff.
- constraint: Brief Non-Goals are binding — `site/**`, `src/**`, `CHANGELOG.md`, and WP-R6 implementation are out of scope; drift is a stop condition.
- tradeoff: Two phases split by surface/tool rather than one combined phase — chosen because the README edit (repo, git-tracked, `grep`/`diff`-verifiable) and the Notion edit (external, re-fetch-verifiable) have different evidence mechanisms and independent exit gates; splitting keeps each gate binary.
- assumption: Brief A1–A5 carried forward; all evidence-backed (A1 convention+branch, A2 WP-R11 note, A3 git-show of merges, A4 resolved here to README, A5 `providers: []`). None converted to a Q.
- downstream: Review focuses on manual read-through of the README section and the one-bullet Notion diff (no automated content check exists); Ship must cite the Notion URL + before/after per [safety-3] and record the merge-before-R15-dispatch sequencing; Reflect records the accepted README/site inconsistency (RI2 risk) as an open follow-up for the eventual WP-R11/site reconciliation.

## Open Questions

None. R3 placement (A4) and R2's exact wording — the two items the brief deferred to Plan — are resolved above.

## Checkpoint Approval

- Checkpoint: plan-review
- Status: approved
- User's own words (verbatim, this turn): "Plan looks good"

## Exit Gate

- [x] Every active R and RI mapped to a phase.
- [x] Every phase has a binary exit gate.
- [x] Verification plan covers every R and RI.
- [x] User approved or waiver recorded. — user approved this plan verbatim this turn.

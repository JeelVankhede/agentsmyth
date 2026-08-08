---
slug: wp-r17-readme-positioning
version: 1
artifact: task
status: ready-for-next-phase
created: 2026-08-08
updated: 2026-08-08
manifest_ids: [R1, R2, R3, RI1, RI2, RI3]
upstream:
  - workflow/artifacts/briefs/wp-r17-readme-positioning-v1.md
  - workflow/artifacts/plans/wp-r17-readme-positioning-v1.md
orchestration:
  phase: build
  status: ready-for-next-phase
  next_phase: review
  blockers: []
  user_checkpoint: none
---

# WP-R17 — README & Docs Positioning Rewrite - Task

## Active Phase

- Phase: Phase 2 — Notion page 01 bullet rewrite (last of 2; both build phases now complete — ready for Review).
- Manifest IDs: R1, R2, R3, RI1, RI2, RI3
- Exit gate: both phase gates met (see Phase Completion Log).

## Plan Phases Overview

| Phase | Status | Manifest IDs |
|---|---|---|
| Phase 1 - README positioning section | complete | R1, R3, RI1, RI2 |
| Phase 2 - Notion page 01 bullet rewrite | complete | R2, RI3 |

## Branch / Repo Status

| Moment | Branch | Status | Notes |
|---|---|---|---|
| Before edits | `feat/wp-r17-readme-positioning` | clean except `workflow/artifacts/briefs/wp-r17-readme-positioning-v1.md` and `workflow/artifacts/plans/wp-r17-readme-positioning-v1.md` (this chain's own artifacts) | No unrelated dirty files to preserve. |
| At handoff | `feat/wp-r17-readme-positioning` | ` M README.md` + this chain's three untracked artifacts (briefs/plans/tasks) | Only `README.md` modified in the repo; Notion edit is external. Scope confirmed. |

## Scope

- In scope: `README.md` (Phase 1 — insert `## Where it fits` section between `## What it refuses to be` and `## Setup`; reconcile the "Not a paywall" bullet only if needed for RI1); Notion page 01 (Phase 2 — one-bullet rewrite).
- Out of scope: `site/**`, `src/**`, `bin/**`, validators, `CHANGELOG.md`, WP-R6 implementation, firing the WP-R15 release dispatch.

## Changed Files

- `README.md` — insert `## Where it fits` section (four competitors named + differentiator + no-paid-tier paragraph); reconcile "Not a paywall" bullet if needed — IDs: R1, R3, RI1
- Notion page 01 (external, not a repo file) — one-bullet rewrite — IDs: R2, RI3 _(Phase 2)_

## Implementation Log

**Phase 1 — README (`README.md`).** Inserted a `## Where it fits` section between `## What it refuses to be` and `## Setup`:
- Names all four competitors — GitHub Spec Kit (marked GitHub-backed), BMAD-METHOD, claude-task-master, agentpreflight — in plain text (no hyperlinks, to avoid fabricating unverified repo URLs; naming is backed by the repo's own Notion Decision & Risk Log / OQ-M2 record).
- States the differentiator with only verifiable, mechanical claims: competitors shape the prompt, agentsmyth shapes the lifecycle mechanically; each phase reads/writes an on-disk artifact and a schema validator gates the transition (no brief→no plan, no plan→no build, missing requirement ID or evidence-free claim fails the check).
- `### Why there's no paid tier` sub-section (R3): free-by-decision, community-first; a Markdown-skill workflow can't be content-gated at inference time; any future paid surface would be a service, not a wall around the skills. Consistent with the existing "Not a paywall" bullet (RI1) — same claim, fuller reasoning; the bullet was left as-is since it needed no change to stay consistent.
- Existing "Not a paywall" bullet left unchanged (RI1 satisfied without editing it).

**Post-review fix (2026-08-08, user-requested "fix all").** Linked all four competitor names in `README.md:32` to web-search-verified sources (Spec Kit → github.com/github/spec-kit; BMAD-METHOD → github.com/bmad-code-org/BMAD-METHOD; claude-task-master → github.com/eyaltoledano/claude-task-master; agentpreflight → agent-preflight.szybnev.cc). Resolves the review's "unlinked plain text" residual risk. Still `README.md`-only; no `site/`/`src/` change.

**Phase 2 — Notion page 01 (external).** Targeted single-bullet `update_content` search-and-replace (not a whole-page replace, per plan risk mitigation):
- Before: `Not a domain-opinionated scaffold — domain attachment happens during setup, driven by the user's repo`
- After: `Not domain-opinionated — domain attachment happens during setup, driven by the user's repo, not baked into a template's guesses`
- Re-fetch confirmed: word "scaffold" removed; other three "What agentsmyth Is Not" bullets and all other page sections byte-unchanged (RI3 — exactly one bullet changed).
- Edited page: https://app.notion.com/p/384972bdebbb814aba61d2cccff9d2e2

## Verification Items

| Manifest ID | Verification target | Expected result |
|---|---|---|
| R1 | `grep` README for the four competitor names; new section before `## Setup` | All four present; section precedes `## Setup` |
| R3 | README paragraph stating a reason for no paid tier | Present, gives an actual reason |
| RI1 | New paragraph vs. existing "Not a paywall" bullet | One consistent story, no drift |
| RI2 | `git diff --stat` / `git status` for `site/` | Zero changes under `site/` |
| R2 | Notion page 01 re-fetch after edit | "scaffold" removed from the bullet |
| RI3 | Before/after of "What agentsmyth Is Not" section | Exactly one bullet changed |

## Command Results

| Command | Area | Outcome | Notes |
|---|---|---|---|
| `git status --short --branch` | repo | pass | Recorded before edits and at handoff |
| `grep -c` for the 4 competitor names in `README.md` | R1 | pass | All four present (1 each) |
| section-order check (`## Where it fits` line 30 < `## Setup` line 40) | R1 | pass | Section precedes Setup |
| `git diff --stat` + `git status \| grep site/` | RI2 | pass | Only `README.md` changed; 0 changes under `site/` |
| Notion re-fetch of page 01 | R2, RI3 | pass | "scaffold" removed; exactly one bullet changed |
| `npm run validate`, `npm run violations:test` | chain | not run — deferred to Review | Required by `verification.yaml` for review/ship phases; Review owns them |

## Dispatch Log

none

## Architecture Notes

- role: Senior Engineer
- decision: Place the new README content in a single `## Where it fits` section so R1 and R3 land as one localized insertion (per plan).
- constraint: Brief Non-Goals binding — no `site/`, `src/`, `CHANGELOG.md` touches; [safety-3] governs Phase 2 Notion evidence.
- tradeoff: Two build phases split by surface/tool (README vs. Notion) to keep each exit gate binary.
- downstream: Review does a manual read-through (no automated content check exists); Ship cites the Notion URL + before/after per [safety-3].

## Blockers

none

## Phase Completion Log

| Phase | Status | Completed | Notes |
|---|---|---|---|
| Phase 1 - README positioning section | complete | 2026-08-08 | R1/R3/RI1/RI2 gate met: 4 competitors named, differentiator before `## Setup`, no `site/` changes, "Not a paywall" bullet consistent |
| Phase 2 - Notion page 01 bullet rewrite | complete | 2026-08-08 | R2/RI3 gate met: "scaffold" removed via one-bullet edit, all else unchanged (verified by re-fetch) |

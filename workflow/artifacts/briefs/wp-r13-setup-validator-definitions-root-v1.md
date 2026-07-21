---
slug: wp-r13-setup-validator-definitions-root
version: 1
artifact: brief
status: ready-for-next-phase
created: 2026-07-21
updated: 2026-07-21
manifest_ids: [R1, R2, RI1, RI2]
upstream:
  - user-request
  - notion-wp-r13-setup-validator-definitions-root
orchestration:
  phase: think
  status: ready-for-next-phase
  next_phase: plan
  blockers: []
  user_checkpoint: brief-review
skill_trigger_log:
  - skill: repo-alignment-scan
    decision: ran
    reason: task_class=standard, but a real cross-file contradiction was reported (setup skill's documented design vs. a shipped validator's actual behavior) — scanned `src/setup/SKILL.md` and `src/workflow/validators/check-setup-complete.mjs` directly to confirm the contradiction and locate its exact boundary before writing this brief.
  - skill: architecture-decision-advisor
    decision: skipped
    reason: new_surface=false — this is a bug fix to an existing validator's existing check, not a new architectural surface; the design being enforced (definitions_root linking) already exists and is already documented.
  - skill: constraint-conflict-scan
    decision: skipped
    reason: task_class=standard and no domain/provider/protected-path constraint is implicated — this is an internal validator-logic fix with no external provider, hosting, or release-process dependency.
---

# WP-R13 — Setup Validator Ignores definitions_root - Brief

## Source Links

- Notion: [WP-R13 — Setup Validator Ignores definitions_root](https://app.notion.com/p/3a4972bdebbb81309654eb5820c4593d) — the work package spec this brief implements.
- Notion: [Work Packages database row](https://app.notion.com/p/3a4972bdebbb814397ecfb3f523febc5) — status tracking.
- User's own real testing report (this session): ran the newly-shipped `/agentsmyth` invocation skill (WP-R12's own R4) against a real repo with a linked global install, hit the contradiction directly, and diagnosed it precisely before reporting.
- `src/setup/SKILL.md` Step 5b and its "Global Install Note" — ground truth for the documented, intentional design.
- `src/workflow/validators/check-setup-complete.mjs` — ground truth for the validator's actual (incorrect) behavior, confirmed by direct read.
- `src/workflow/validators/check-config.mjs` — confirmed via direct read (`grep` for any `workflow/router`, `workflow/skills`, `workflow/validators`, `workflow/schemas`, `definitions_root` reference) to have zero dependency on any of these paths — not affected by this bug.

## Problem

`src/setup/SKILL.md`'s Step 5b has two branches, both correct and intentional: when `repo-profile.yaml` has `definitions_root` set (the default outcome of `agentsmyth init` since WP-R7/WP-R9b — the skill's own "Global Install Note" confirms `init` always links before the agent-driven setup skill starts), the full definitions tree (`workflow/router.md`, `lifecycle.md`, `rules.md`, `glossary.md`, `skills/`, `validators/`, `schemas/`) is deliberately **not** expanded locally — it resolves from the global install at runtime, keeping the consumer repo thin. Only `workflow/artifacts/` and `workflow/learnings/` are required locally in both branches (already created by `init`'s own mechanical scaffold before this skill even starts).

`check-setup-complete.mjs`'s "full workflow tree presence" check was never updated to know about this distinction — it unconditionally requires the entire definitions tree to exist locally, with `Waivers are not permitted during setup` backing it with a hard fail.

This is not a rare edge case. Setup's own Phase 4 (Verify, runs both validators) happens **before** Phase 5 (Copy and Cleanup, which contains Step 5b — the only step that could ever populate these files locally). Since `definitions_root` is now set by `init` by default, the validator as shipped **cannot pass via the intended normal path at all** — every real consumer with a correctly linked global install is currently forced into the defensive, no-`definitions_root` fallback just to satisfy a validator that was never taught about the design it's supposed to be checking. Found by the user during real, direct testing of WP-R12's own newly-shipped invocation skill (R4) — the first time in this observed session history that a shipped feature was used exactly as an end consumer would, immediately, and surfaced a real defect.

## Goals

- `check-setup-complete.mjs` correctly recognizes a `definitions_root`-linked repo as fully set up without requiring a local copy of the definitions tree.
- The defensive, no-`definitions_root` fallback path continues to correctly require the full local tree — no regression to that case.
- `workflow/artifacts/` and `workflow/learnings/` remain required in both cases, matching Step 5b's own stated invariant.

## Non-Goals

- Changing `src/setup/SKILL.md`'s Step 5b design — it is correct as documented; only the validator needs to catch up to it.
- Changing `check-config.mjs` — confirmed unaffected.
- Reordering Phase 4/Phase 5 in the setup skill, or otherwise restructuring setup's own sequencing — the fix is scoped to the validator's check content, not the skill's phase order.
- Retroactively auditing every consumer repo that may have already gone through the broken defensive-fallback path unnecessarily — out of this repo's reach; the fix prevents it going forward.

## User Impact

Every future `agentsmyth init` run on a repo that correctly links to a global install (the default, intended path) will pass setup verification without unnecessarily duplicating the full definitions tree locally — restoring the "thin repo" design goal WP-R7/WP-R9b built, which this validator has been silently defeating since it shipped.

## Success Metrics

- A scratch repo with `definitions_root` set and no local definitions tree passes `check-setup-complete.mjs` cleanly.
- The same validator still correctly fails for a genuinely incomplete defensive-fallback repo (no regression).

## Requirements

See Requirement Manifest below; every `R`/`RI` carries its own acceptance criterion.

## Constraints

- `repo-profile.yaml` → `paths.protected`: `.git/**`, `.env*`, `**/*secret*` — this WP's only file surface (`src/workflow/validators/check-setup-complete.mjs`, plus test coverage) doesn't match; no conflict.
- No domain, provider, or release constraint is implicated — this is a self-contained validator-logic fix with no external dependency.

## Risks

- **Low risk of over-correcting**: if the `definitions_root` check is read too loosely (e.g. treating any non-empty string as valid without confirming the global install actually exists at that path), a repo could falsely pass setup while pointing at a broken or missing global install. Mitigated by scoping this fix narrowly to skipping the *local* existence checks specifically when `definitions_root` is set — not asserting the global path itself is valid, which is a separate concern already owned by `lib.mjs`'s own resolver (module-level guard, deliberately not imported into this validator per its own code comment, to avoid an unwanted `process.exit(1)` side effect during setup verification itself).
- **Retroactive impact is real but out of reach**: any consumer who already ran setup and got forced into the local-copy fallback unnecessarily now has a local snapshot that won't auto-update if the global install changes later (exactly the situation the user's own bug report described). This WP does not attempt to detect or fix already-affected repos — flagged as a known, accepted limitation, not silently ignored.

## Open Questions

All resolved this turn — see the Q entries below.

## Requirement Manifest

### Explicit (R)

- **R1**: `check-setup-complete.mjs`'s "full workflow tree presence" check reads `workflow/config/repo-profile.yaml`, and when `definitions_root` is set to a non-empty value, skips the existence checks for `workflow/router.md`, `lifecycle.md`, `rules.md`, `glossary.md`, `skills/lifecycle-*/SKILL.md`, `validators/check-*.mjs`, and `schemas/*.yaml`.
  Acceptance: a scratch repo with `definitions_root` set and none of the above files present locally passes `check-setup-complete.mjs` with zero errors related to tree presence.
- **R2**: The defensive, no-`definitions_root` fallback path is unaffected — the full tree-presence check still runs exactly as before when `definitions_root` is absent or empty.
  Acceptance: a scratch repo with no `definitions_root` and a genuinely missing definitions file (e.g. `workflow/router.md` absent) still fails `check-setup-complete.mjs` with the same error it produces today.

### Implicit (RI)

- **RI1**: `workflow/artifacts/` and `workflow/learnings/` remain required regardless of `definitions_root`, matching Step 5b's own documented invariant ("must always exist... regardless of link state").
  Acceptance: both scratch-repo test cases (R1, R2) still fail if `workflow/artifacts/` or `workflow/learnings/` is missing, independent of the `definitions_root` branch taken.
- **RI2**: No change to `check-config.mjs` or any other validator — confirmed unaffected by direct read; must stay that way.
  Acceptance: `git diff` for this WP touches only `check-setup-complete.mjs` and its own test coverage, nothing else under `src/workflow/validators/`.

### Assumptions (A)

- **A1**: Slug `wp-r13-setup-validator-definitions-root`, following this repo's `wp-r<N>-<slug>` convention.
- **A2**: `definitions_root`'s presence check treats any non-empty string value as "set" (matching how `lib.mjs`'s own resolver treats it) — this WP does not add new validation of whether the path itself resolves to a real, populated global install; that is `lib.mjs`'s existing, separate concern.

### Open Questions (Q)

None — this WP is a narrow, well-diagnosed bug fix with no user-authority decision pending.

## Questions For User

None outstanding.

## Architecture Notes

- role: Architect
- decision: Fix targets `check-setup-complete.mjs`'s content only, not `src/setup/SKILL.md`'s phase ordering (Phase 4 before Phase 5) — the ordering itself is a reasonable design (verify configs are complete before touching the filesystem for the collision-handling copy step), and this WP's own diagnosis confirms the *validator's content*, not the ordering, is the actual defect: a definitions_root-aware validator would correctly pass at Phase 4 without needing Phase 5's Step 5b to have run first, since Step 5b's whole point (when definitions_root is set) is to do nothing for these files.
- decision: Reused the user's own precise bug report as primary evidence rather than re-deriving the diagnosis from scratch — independently confirmed by reading both `src/setup/SKILL.md` and `check-setup-complete.mjs` directly before writing this brief, but the report's own framing (which branch is "right," what the two possible resolutions are) was already correct and is preserved here.
- tradeoff: Not attempting to detect/remediate already-affected consumer repos (Risks) — out of this repo's own reach (no visibility into consumer repos), and retroactive detection would require a new mechanism of its own, disproportionate to this WP's narrow scope.
- downstream: Reflect should note this as the first bug found via genuine end-to-end consumer testing of a feature this same session shipped (WP-R12's R4) — a different discovery mode than the "test against every real shipped artifact" pattern used for the `check-release-readiness.mjs` fixes, and possibly worth encouraging more of once the invocation command is live in real tools.

## Exit Gate

- [x] Every active R and RI has acceptance criteria.
- [x] Blocking Q IDs appear in orchestration.blockers. (None — no blocking Qs.)
- [x] User approved or waiver recorded. — approved this turn, see Checkpoint Approval below.

## Checkpoint Approval

- Checkpoint: brief-review
- Status: approved
- User's own words (verbatim, this turn): the agent asked directly, "Do you approve this brief (root cause, scope, R1/R2/RI1/RI2 requirements) as written?" The user responded: "Yes".

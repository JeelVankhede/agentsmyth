---
slug: wp-r9a-adapter-gate-dedup
version: 1
artifact: brief
status: ready-for-next-phase
created: 2026-07-19
updated: 2026-07-19
manifest_ids: [R1, R2, RI1, RI2]
upstream:
  - user-request
  - notion-wp-r9a
orchestration:
  phase: think
  status: ready-for-next-phase
  next_phase: plan
  blockers: []
  user_checkpoint: approved
skill_trigger_log:
  - skill: repo-alignment-scan
    decision: ran
    reason: "task_class = Standard (single file, agent-executed instruction change, but a real live compounding bug across every consumer repo) satisfies task_class != trivial. Re-read src/setup/SKILL.md Step 5a.1 and bin/agentsmyth.mjs's runPrepare()/installGateSection() directly this Think, confirming exact current table content, global file paths, and marker strings per tool before drafting requirements."
  - skill: architecture-decision-advisor
    decision: skipped
    reason: "complexity_score well under 60 — no new architectural pattern, no new surface. This adds a conditional check to an existing agent-executed instruction table; the marker-detection logic already exists and ships (installGateSection()'s begin/end marker replacement), only being reused as a read-check by the agent rather than introduced fresh."
  - skill: constraint-conflict-scan
    decision: ran
    reason: "task_class = Standard satisfies task_class != trivial. Checked domain.yaml/repo-profile.yaml — no protected paths match src/setup/SKILL.md; no constraint conflict. This file ships via dist/setup-bundle.md, so the hard no-internal-jargon constraint applies — checked explicitly in Constraints below."
---

# WP-R9a — Redundant Adapter-Gate Fix - Brief

## Source Links

- Notion: [WP-R9a — Redundant Adapter-Gate Fix](https://app.notion.com/p/3a1972bdebbb8135b816d135a5f8fe1d) — the approved, fully-scoped work package this brief converts into a lifecycle chain. 🟡 Ready, P1, "ship first."
- Notion: [WP-R9 Research Spike](https://app.notion.com/p/3a0972bdebbb8160b9c2d2cacb246cae) §8 — the original evidence-gathering that found this bug, done by re-reading the actual shipped code rather than assuming, while researching a separate, larger initiative (init-as-scaffold-only).
- User's own diagnosis, quoted verbatim on the spike page: *"I guess this is not the work of init since init is repo specific and these adapter files are global... this is a real blunder."* — confirmed correct against the real source.
- `workflow/artifacts/open-items.yaml` OI-21 — the original tracked follow-up this whole initiative traces back to.

## Problem

`agentsmyth init` always auto-runs `agentsmyth prepare` first if no global install exists yet (`src/setup/SKILL.md`'s "Global Install Note"). `runPrepare()` (`bin/agentsmyth.mjs:312`) unconditionally installs the **global** gate into `~/.claude/CLAUDE.md`, `~/.codex/AGENTS.md`, `~/.codeium/windsurf/memories/global_rules.md`, and (macOS only) Copilot's global prompts file — all four, every single `prepare` run, idempotently (`installGateSection()` at `bin/agentsmyth.mjs:257` uses begin/end marker detection and replacement, safe to re-run).

Moments later, in that same `init` run, `src/setup/SKILL.md` Step 5a.1 (lines 169–183) writes **another**, fully redundant, per-repo adapter file for whichever single tool the Phase 2 interview named — with **zero check** for whether the global gate covering that exact tool was just installed two steps earlier in the same run.

Net effect: every repo a user runs `init` in accumulates a duplicate gate file doing a job the global install (installed automatically on the very first `init` ever run on a machine) already does. This compounds across every repo the user touches. It is a live bug in already-shipped, already-merged code (WP-R7, PR #35) — not a hypothetical.

The one tool where per-repo placement is still genuinely necessary: **Cursor**. It has no programmatically-writable global config — `prepare` only prints paste-text for it (manual Settings → Rules entry required). Everything else is redundant once `prepare` has run once, which it always has by the time Step 5a.1 executes.

## Goals

- Step 5a.1 does not write a per-repo adapter file for a tool whose global gate is already present and active.
- Step 5a.1 still writes the per-repo adapter for Cursor (always) and for any tool where the global install is genuinely unavailable (non-macOS Copilot).
- No behavior change to adapter *content* — this is placement logic only, `src/adapters/*` files are untouched.

## Non-Goals

- Relocating adapter placement into CLI code (`bin/agentsmyth.mjs`) — that is WP-R9b's scope (it needs `init` itself to know the chosen tool, which requires WP-R9c's prompt work to land first). This brief keeps the fix in the agent-executed `SKILL.md` instructions, as an isolated hotfix.
- Any change to `runPrepare()`, `installGateSection()`, or the global gate file paths/markers themselves — all already correct and unchanged by this brief.
- The TUI/distribution work (WP-R9c/WP-R10) — unrelated, tracked separately.

## User Impact

Every future `agentsmyth init` run stops accumulating a redundant per-repo adapter file for Claude/Codex/Windsurf/Copilot-macOS once the global gate already covers that tool — less repo clutter, one less duplicated instruction source to keep in sync per repo. No change for Cursor users (still gets the per-repo file, since that's the only mechanism that reaches it).

## Success Metrics

- A fresh `init` run (global gate already installed for the chosen tool) writes no per-repo adapter file for Claude, Codex, Windsurf, or Copilot-macOS.
- A fresh `init` run for Cursor still writes the per-repo adapter file, unconditionally.
- A fresh `init` run for Copilot on a non-macOS platform still writes the per-repo adapter file (global mechanism unavailable there).

## Requirements

- R1: `src/setup/SKILL.md` Step 5a.1 checks whether the global gate is already present and active for the chosen tool before writing a per-repo adapter file, skipping the write when present.
- R2: The check reuses the same begin/end marker pairs `installGateSection()` already writes (per tool, documented in `runPrepare()`), applied as a read-check against the tool's global file path — not a new marker convention.

## Constraints

- `[safety-2]`/`[safety-3]` not implicated — read-only-until-Build instruction change, no destructive action, no external state claims.
- **Hard constraint from this session's standing user feedback**: `src/setup/SKILL.md` ships via `dist/setup-bundle.md` to every consumer. The new instruction text must describe the behavior/reasoning generically — no internal work-package ID (`WP-R9a`, `OI-21`), no chain slug, no reference to this repo's own dogfooding history. Verified by grepping the rebuilt `dist/setup-bundle.md` at Build/Ship, per this repo's own established two-layer check (source + rebuilt output) that caught the original WP-R7 jargon-leak incident.
- CLAUDE.md golden rules: edit source only; `npm run build` after the change; `npm run validate` before shipping; no new runtime dependency (none needed — this is prose/instruction logic only, no code touched).

## Risks

- A future skill author adds a 6th adapter tool without updating both `runPrepare()`'s global-gate-path table and this dedup check — mitigated by keeping the dedup instruction's per-tool table structurally parallel to Step 5a.1's existing table, so the two stay visually easy to keep in sync (same mitigation shape as the existing 5a/5a.1 tables already use).
- The dedup check is agent-executed prose, not mechanically enforced code — a future agent session could misread or skip the instruction. Accepted: `src/setup/SKILL.md`'s entire Step 5/5a/5a.1 apparatus is already agent-executed by the same nature (matches this repo's existing verification approach — scripted agent dry-run + inspection, per WP-R7's own precedent for agent-executed instruction changes).

## Open Questions

None. Scope, evidence, and fix approach are fully resolved on the WP-R9a Notion page and the spike's §8 finding — no product/policy decision required.

## Requirement Manifest

### Explicit (R)

- **R1** - Step 5a.1 skips the per-repo adapter write when the global gate is present and active for the chosen tool.
  - Acceptance: for each of Claude/Codex/Windsurf/Copilot-macOS, when that tool's global gate file already contains the begin/end marker pair, a fresh `init`'s Step 5a.1 does not write a per-repo adapter file for that tool. For Cursor, the per-repo file is still written unconditionally.

- **R2** - The dedup check reuses `installGateSection()`'s existing begin/end marker convention, not a new one.
  - Acceptance: the instruction text names the exact begin/end marker strings already used per tool in `runPrepare()` (`<!-- agentsmyth global gate BEGIN/END -->` for Claude/Copilot, `# agentsmyth global gate BEGIN/END` for Codex/Windsurf) — no new marker format introduced.

### Implicit (RI)

- **RI1** - No behavior change to adapter content.
  - Acceptance: `git diff` shows zero changes under `src/adapters/`; only `src/setup/SKILL.md`'s Step 5a.1 instructions change.

- **RI2** - Zero internal jargon in the shipped instruction text; no regression elsewhere.
  - Acceptance: `npm run build` regenerates `dist/`; a grep of the rebuilt `dist/setup-bundle.md` for `OI-`, `WP-R`, and this chain's own slug finds zero matches; `npm run validate && npm run violations:test && npm run conformance:test` all pass unchanged.

### Assumptions (A)

none

### Open Questions (Q)

none

## Questions For User

None outstanding.

## Architecture Notes

- role: Architect
- decision: Kept the fix entirely inside `src/setup/SKILL.md` (agent-executed instructions), matching WP-R9a's own Notion decision — not moved into `bin/agentsmyth.mjs` CLI code. Relocating to CLI code is explicitly WP-R9b's scope, which needs `init` to know the chosen tool (only true once WP-R9c's interactive prompt exists). Building that dependency into this brief would violate WP-R9a's own reason for being split out: an isolated, immediately shippable hotfix.
- constraint: This file ships via `dist/setup-bundle.md` — the jargon constraint applies with the same severity as any `src/workflow/` file, even though `src/setup/` is a technically separate build input (per CLAUDE.md's source/workspace/global table, both compile into artifacts in package.json's `files` list).
- tradeoff: Considered writing the dedup check as a small new validator (mechanically enforceable) instead of agent-executed prose — rejected: Step 5a.1 is inherently agent-executed (the agent is the one placing files during the setup skill, not a CLI script), so there is no artifact for a validator to check after the fact that wouldn't also require trusting the agent followed the instruction correctly in the first place. Matches the existing verification approach for this exact code region (WP-R7's own adapter-gate fixes were verified the same way — dry-run + inspection, not a new validator).
- downstream: WP-R9b, when it starts, should treat this brief's Step 5a.1 dedup instruction as the exact behavior to port into CLI code — not redesign it. WP-R9c is unaffected by this brief (different file, no shared logic).

## Exit Gate

- [x] Every active R and RI has acceptance criteria.
- [x] No blocking Q IDs; `orchestration.blockers` is empty.
- [x] User approved the brief — "Approved," 2026-07-19.

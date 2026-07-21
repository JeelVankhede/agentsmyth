---
slug: wp-r12-local-install-fixes
version: 1
artifact: plan
status: ready-for-next-phase
created: 2026-07-21
updated: 2026-07-21
manifest_ids: [R1, R2, R3, R4, RI1, RI2, RI3, RI4, RI5]
upstream:
  - workflow/artifacts/briefs/wp-r12-local-install-fixes-v1.md
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: plan-review
---

# WP-R12 — Local Install Fixes - Plan

## Summary

Three independent, well-diagnosed fixes to `bin/agentsmyth.mjs` and `src/workflow/validators/check-release-readiness.mjs`, plus one new feature (a 5-adapter global invocation command). Sequenced as 3 Build phases matching the brief's own natural boundaries: packaging fix (already implemented and locally verified this session — Phase 1 documents it), validator fixes (Phase 2), invocation command (Phase 3). No cross-phase file overlap, so phases can be built and verified independently, matching WP-R11's own `-p1`..`-pN` sub-versioning pattern if any phase needs its own iteration.

## Inputs

- Brief: `workflow/artifacts/briefs/wp-r12-local-install-fixes-v1.md`
- Manifest IDs: R1, R2, R3, R4, RI1, RI2, RI3, RI4, RI5
- No active blockers — all brief-stage Qs resolved.
- Existing regression fixture found during Plan: `test/fixtures/lifecycle-violations/o-ship-with-open-p1/` — a real negative-case fixture for `check-release-readiness.mjs`'s P0/P1 check that Phase 2 must not break. Inspected during Plan: its Findings section uses a `### P1 — ...` heading format (not the `**P1, confirmed and fixed**` bold-inline format R3 is designed around), and its "Fix recommendation: fixture only." field is a reminder that a naive "contains the word fix" detector would false-positive on every finding, resolved or not — R3's design must key off the *severity label's own position*, not any occurrence of the word "fix" in a finding's body.

## Assumptions Verified

| Assumption ID | Status | Evidence |
|---|---|---|
| A1 | evidence-backed | Matches this repo's existing `wp-r<N>-<slug>` convention (`wp-r9a-adapter-gate-dedup`, `wp-r9b-scaffold-init-resolution`, `wp-r9c-tui-polish`, `wp-r11-docs-site`). |
| A2 | evidence-backed | Phase 2's Work section scopes the fix to exactly `declaredRecommendation()` and the P0/P1 cross-check inside `check-release-readiness.mjs` — no other function or file is touched. |
| A3 | evidence-backed | Plan discovered the real `o-ship-with-open-p1` fixture (see Inputs) and confirmed the narrow, position-anchored design does not match its heading-based Findings format or its "Fix recommendation:" field — the fixture keeps failing correctly under the new logic by design, not by luck. |
| A4 | evidence-backed | Stated explicitly in this Plan's Risk Register and Verification Plan (R4 row: "Live in-tool `/agentsmyth` invocation is NOT verifiable in this environment") — not silently assumed working. |
| A5 | evidence-backed | Cited to the brief's own Risks section; carried into this Plan's Risk Register and into RI5's Verification Plan row (Ship must name the risk explicitly). |

## Requirement Coverage

| Manifest ID | Covered by phases | Notes |
|---|---|---|
| R1 | Phase 1 | Already implemented and locally verified this session; Phase 1 documents the fix and its evidence in the task artifact. |
| R2 | Phase 2 | `declaredRecommendation()` rewritten to parse the actual `- Recommendation:` line. |
| R3 | Phase 2 | `openP0P1Counts()`/caller logic extended to recognize resolved findings in the established bold-inline position only; falls back to existing (safe) behavior for any other Findings format. |
| RI1 | Phase 2 | Full regression re-run against every shipped Ship artifact plus the existing `o-ship-with-open-p1` violation fixture. |
| R4 | Phase 3 | 5 new `readFileSync`'d templates + 5 new `writeFileSync` calls in `runPrepare()`. |
| RI2 | Phase 1, 2, 3 | No `package.json` change in any phase — verified per phase. |
| RI3 | Phase 3 | Scratch-repo `git status` check after `agentsmyth prepare`. |
| RI4 | Phase 3 | Shared instructional content documented once, confirmed present (adapted per format) in all 5 files. |
| RI5 | Phase 3 | Ship artifact names the Codex deprecation risk explicitly. |

## Repo Impact Map

| File | Change type | Manifest IDs | Notes |
|---|---|---|---|
| `bin/agentsmyth.mjs` | modify | R1 | 6 call sites: `src/adapters` → `src/assets/adapters`. Already done. |
| `src/workflow/validators/check-release-readiness.mjs` | modify | R2, R3, RI1 | `declaredRecommendation()` rewritten; new resolved-finding recognition added to the P0/P1 cross-check. |
| `bin/agentsmyth.mjs` | modify | R4, RI2, RI3, RI4, RI5 | `runPrepare()` gains 5 new file writes (one per adapter), each rendering the shared instructional content into that tool's own required format. |
| `src/adapters/claude/invocation-skill.md` | new | R4, RI4 | Claude Code personal Skill content (build-synced to `src/assets/adapters/claude/`). |
| `src/adapters/codex/invocation-prompt.md` | new | R4, RI4, RI5 | Codex custom-prompt content. |
| `src/adapters/cursor/invocation-command.md` | new | R4, RI4 | Cursor global-command content. |
| `src/adapters/windsurf/invocation-workflow.md` | new | R4, RI4 | Windsurf global-workflow content. |
| `src/adapters/copilot/invocation-prompt.md` | new | R4, RI4 | Copilot (VS Code) prompt-file content. |
| `workflow/artifacts/open-items.yaml` | modify | R2, R3 | OI-40 marked done once Phase 2 ships; new follow-ups added if Phase 3 surfaces any (e.g. Codex deprecation watch). |

## Source-of-Truth Strategy

No source-of-truth updates required. `workflow/config/source-of-truth.yaml` has no provider configured for this repo.

## Approach

Three phases, each independently verifiable, in the order the brief's own Risks section implies increasing uncertainty: Phase 1 (packaging fix) is already done and has the strongest evidence (a real packed-install repro). Phase 2 (validator fixes) is pure logic with a real existing fixture to regression-test against. Phase 3 (invocation command) has the least first-hand verifiability (A4 — no live tool access in this environment) and depends on nothing from Phase 1/2, so it's sequenced last to keep the highest-confidence, highest-severity fix (R1) landing first regardless of how Phase 3 turns out.

## Phases

### Phase 1 — Packaging path fix (already implemented)

- **Manifest IDs:** R1, RI2
- Touches: `bin/agentsmyth.mjs`
- Work: Swap all 6 `join(pkgRootDir, 'src', 'adapters', ...)` reads to `join(pkgRootDir, 'src', 'assets', 'adapters', ...)` in `placeDeterministicAdapters()` and `runPrepare()`. Already implemented this session; Build's task artifact documents the fix plus its real verification evidence (npm pack, install `--install-links` into a scratch consumer repo, isolated `$HOME`, `prepare` + `init` both completing with zero ENOENT, gate/adapter file content spot-checked).
- **Exit gate:** zero remaining `'src', 'adapters'` references in `bin/agentsmyth.mjs`; the scratch packed-install test passes with real command output cited.

### Phase 2 — `check-release-readiness.mjs` fixes

- **Manifest IDs:** R2, R3, RI1
- Touches: `src/workflow/validators/check-release-readiness.mjs`
- Work:
  1. Rewrite `declaredRecommendation()` to extract the `- Recommendation: <value>` line specifically (regex anchored to that line, not a whole-section substring scan), falling back to the existing "declares none of ship/hold/hold-with-waiver explicitly" error only if that specific line is genuinely missing or unparsable.
  2. Extend the P0/P1 cross-check: for each of P0/P1 with a non-zero Severity Summary count, search the review body for bold-inline severity spans matching that severity in the established real position (`**P0`/`**P1` at the start of a bolded span); if at least one such span is found and *every* matching span contains an established resolved-marker (`(fixed)`, `confirmed and fixed`, case-insensitive), treat that severity as resolved and do not require a Waivers entry for it. If zero matching spans are found, or any matching span lacks the marker, fall back to today's existing behavior (require `## Waivers`).
  3. Re-run against every file under `workflow/artifacts/ship/` and the `o-ship-with-open-p1` violation fixture; confirm no regression.
- **Exit gate:** `node src/workflow/validators/check-release-readiness.mjs` reports the correct `recommendation:` for every existing Ship artifact (human-spot-checked against each artifact's own declared value); `npm run violations:test` still correctly rejects `o-ship-with-open-p1`; a new synthetic positive fixture (a Ship artifact declaring "ship" against a Review with a resolved-and-marked P1) passes without a fabricated waiver.

### Phase 3 — 5-adapter global invocation command

- **Manifest IDs:** R4, RI2, RI3, RI4, RI5
- Touches: `bin/agentsmyth.mjs`, `src/adapters/claude/invocation-skill.md`, `src/adapters/codex/invocation-prompt.md`, `src/adapters/cursor/invocation-command.md`, `src/adapters/windsurf/invocation-workflow.md`, `src/adapters/copilot/invocation-prompt.md`
- Work: In `runPrepare()`, after the existing global-gate installs, add 5 new writes (Claude, Codex, Cursor, Windsurf, Copilot — Copilot gated by the same `process.platform === 'darwin'` condition the existing Copilot gate already uses), each rendering one shared instructional-content string into that adapter's own required file format/frontmatter (see brief R4 acceptance for exact paths). Content: bootstrap-if-`workflow/config/`-absent (mirroring the existing passive-gate instruction's own wording), then load `~/.agentsmyth/workflow/router.md` + `agent-behavior.yaml`. Never overwrite an existing file at the target path (same "strictly additive" rule `placeDeterministicAdapters()` already follows for Cursor/Copilot per-repo files) — treat a pre-existing user-authored file at that path as user content, skip silently.
- **Exit gate:** a scratch-repo run of `agentsmyth prepare` (isolated `$HOME`) writes all 5 new files with correct paths and content; `git status` in the scratch consumer repo shows zero new repo-level files; re-running `prepare` a second time does not duplicate or corrupt any of the 5 files (idempotency check, same pattern `installGateSection()` already uses for the existing gates).

## Dependency Order

Phase 1 → Phase 2 → Phase 3, but only by convention (highest-confidence fix first) — no phase's file changes depend on another's. Any could ship independently if the user wants partial progress reviewed before the rest continues.

## Branch Strategy

Single branch `wp-r12-local-install-fixes`, already created off `origin/main` (not off `feat/wp-r11-docs-site`) — this WP's own branch hygiene was corrected earlier this session after an initial mistake (packaging fix work started directly on the WP-R11 branch, then stashed and moved). All 3 phases land on this one branch; no sub-branch per phase, matching WP-R11's own single-branch-multi-phase precedent.

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner | Manifest IDs |
|---|---|---|---|---|---|
| R4's 5 file formats are WebSearch-researched, not live-tool-verified | medium | medium | State plainly in Verify/Ship (A4); verify what's actually verifiable (file placement, content, frontmatter shape) | Build/Test | R4 |
| Codex's custom-prompts mechanism is documented as deprecated | low (no removal timeline known) | medium if removed | Disclosed risk (RI5), not silently built as permanent; follow-up owner named in Ship | user/workflow owner | R4, RI5 |
| R3's resolved-finding detection could theoretically mask a genuinely open P0/P1 | low | high if it happened | Conservative design: only recognizes established real phrasing in the established real position; falls back to blocking whenever ambiguous (verified against `o-ship-with-open-p1` fixture, which is NOT in the recognized format and must keep blocking) | Build/Test | R3, RI1 |
| Phase 2's fix could regress an existing correctly-passing Ship artifact | low | high (silent false pass) | Full re-run against every real shipped Ship artifact, not just the fixture, before Phase 2 is considered done | Build | R2, R3, RI1 |

## Verification Plan

| Manifest ID | Evidence | Owner phase | Notes |
|---|---|---|---|
| R1 | `grep -c "'src', 'adapters'" bin/agentsmyth.mjs` → 0; real `npm pack` + `--install-links` scratch-repo `prepare`+`init` run, zero ENOENT, gate file content spot-checked | Phase 1 (done) | Already executed this session; Test re-verifies independently. |
| R2 | `node src/workflow/validators/check-release-readiness.mjs` output, human-checked per Ship artifact against its own declared `- Recommendation:` line | Phase 2 | |
| R3 | Same command; `o-ship-with-open-p1` fixture still correctly flagged; new synthetic resolved-P1 fixture correctly passes | Phase 2 | |
| RI1 | `npm run violations:test` full pass; re-run `check-release-readiness.mjs` against every file in `workflow/artifacts/ship/`, zero newly-introduced errors | Phase 2 | |
| R4 | Scratch-repo `agentsmyth prepare` run (isolated `$HOME`), all 5 files exist at their documented paths with correct frontmatter/content | Phase 3 | Live in-tool `/agentsmyth` invocation is NOT verifiable in this environment (A4) — file placement/content is the verifiable ceiling. |
| RI2 | `git diff package.json` empty, all 3 phases | Phase 1, 2, 3 | |
| RI3 | Scratch consumer repo `git status`/`ls` after `prepare`, zero new repo-level files | Phase 3 | |
| RI4 | Task artifact quotes the shared instructional content once and confirms its presence (adapted per format) in all 5 files | Phase 3 | |
| RI5 | Ship artifact's Risk And Rollback names the Codex deprecation risk with owner/follow-up | Ship | |

## Architecture Notes

- role: Principal Engineer
- decision: Phase 2's resolved-finding detection is deliberately narrow (bold-inline position only) rather than a general Findings-list parser, after Plan discovered a real second Findings-list format (`### P1 — ...` heading style) already in use in the existing `o-ship-with-open-p1` fixture. Building a parser that tried to handle every observed format would have either missed this fixture's format (fine, safe) or risked over-matching on generic "fix" mentions in body text like "Fix recommendation:" (unsafe — would break the fixture). Narrow-and-conservative was chosen specifically because Plan caught this risk before Build started, not after.
- decision: Phase 3's 5 file writes are added to `runPrepare()`, not a new function — keeps all "global, personal-level AI-tool file" writes in one place, consistent with how the existing 4 gate installs are already structured there.
- constraint: `src/workflow/validators/` is in-scope for Phase 2 only, per the brief's own Constraints section — Build must not touch any other validator file even if a similar bug is noticed in passing (record it as a new open item instead, per this repo's own established pattern this session).
- tradeoff: Phase 3 ships without live-tool verification (A4) — accepted because the alternative (blocking on manual multi-tool testing this environment cannot perform) would leave R4 undone indefinitely for a real, user-requested gap; the tradeoff is fully disclosed in Verify/Ship rather than silently assumed working.
- downstream: Reflect should assess whether Phase 2's "narrow position, conservative fallback" design pattern for teaching a validator to recognize an established artifact convention (rather than building a general-purpose parser) is worth naming as a reusable principle for future validator-hardening work — this is the same shape of decision `check-waivers.mjs`'s own negation heuristic already made (deliberately narrow, documented false-positive risk accepted).

## Open Questions

None — all resolved at Think.

## Exit Gate

- [x] Every active R and RI mapped to a phase.
- [x] Every phase has a binary exit gate.
- [x] Verification plan covers every R and RI.
- [x] User approved or waiver recorded. (Brief and its resolved Qs were answered directly by the user this turn.)

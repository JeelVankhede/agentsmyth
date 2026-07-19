---
slug: wp-r9b-scaffold-init-resolution
version: 1
artifact: review
status: ready-for-next-phase
created: 2026-07-19
updated: 2026-07-19
manifest_ids: [R1, R2, R3, R4, R5, RI1, RI2]
upstream:
  - workflow/artifacts/briefs/wp-r9b-scaffold-init-resolution-v1.md
  - workflow/artifacts/plans/wp-r9b-scaffold-init-resolution-v1.md
  - workflow/artifacts/tasks/wp-r9b-scaffold-init-resolution-v1.md
orchestration:
  phase: review
  status: ready-for-next-phase
  next_phase: test
  blockers: []
  user_checkpoint: none
---

# WP-R9b — Scaffold-Only Init + Resolution-Pass Setup - Review

## Findings

All 3 findings below were found and fixed within this Review cycle, re-verified against the
full regression suite (57/57 CLI-specific tests + `validate` + `violations:test` 21/21 +
`conformance:test` 12/12, zero regression). None remain open.

- **P2 (fixed) — `bin/agentsmyth.mjs`'s `extractYamlList()` (R5)**: did not handle YAML
  flow-style arrays (`commands: []`), only block-style (`- item` on its own line). The regex
  `^commands:\s*$` did not match `commands: []` — confirmed directly (`node -e` test): the
  function fell into its "key not found" path and returned `[]`, which happened to produce the
  *correct* output for the shipped stub by coincidence, but would have silently misrendered
  real flow-style content (e.g. `commands: [a, b]`) as `"(none defined)"`. **Fix**: the
  terminal key's regex now captures trailing content on the same line; if it matches
  `[...]`, the inline items are parsed directly (comma-split, quote-stripped) instead of
  falling through to the block-style walker. **Verified**: re-tested both the untouched empty
  case (`commands: []` still renders `"(none defined)"`) and a new flow-style-with-content case
  (`commands: [npm test, npm run lint]` in a scratch repo now correctly renders both commands
  in the shipped Cursor adapter).
- **P2 (fixed) — `bin/agentsmyth.mjs`'s `buildAdapterTokens()` `BRANCH_POLICY` false-branch
  (R5)**: when `require_non_default_branch_for_changes: false` and `DEFAULT_BRANCH` was
  unresolved, the rendered string interpolated a literal `` `<USER-TODO>` `` directly into the
  shipped adapter file instead of the standard `<!-- TODO: see pending-setup.yaml -->`
  fallback marker every other unresolved token uses. **Fix**: replaced the literal
  `'<USER-TODO>'` default with `ADAPTER_TODO_FALLBACK`, matching the convention used
  everywhere else in the same function and in `renderAdapterTemplate()`.
- **P3 (fixed) — `README.md`'s "Running setup" section**: stated the agent "places the adapter
  for whichever of the other four tools (Claude Code, Codex, Copilot on macOS, Windsurf) you
  use." Verified against `runPrepare()`'s own gate list: Copilot's *global* gate installs
  automatically on macOS (same as Claude/Codex/Windsurf), and R5 places Copilot's adapter
  mechanically on non-macOS — so Copilot's per-repo placement in `SKILL.md` Step 5a.1 is dead
  in both branches post-R9b. **Fix**: corrected to "the other three tools (Claude Code, Codex,
  Windsurf)," with a clause explaining Copilot's dual coverage.

## Severity Summary

| Severity | Count |
|---|---|
| P0 | 0 |
| P1 | 0 |
| P2 | 0 (2 found, both fixed same-cycle) |
| P3 | 0 (1 found, fixed same-cycle) |

## Requirement Coverage

| Manifest ID | Evidence | Status | Notes |
|---|---|---|---|
| R1 | `bin/agentsmyth.mjs`'s `headlessBootstrap()` confirmed generic (no `check`-specific coupling); scratch-repo `check` run reproduces byte-identical config-stub/`pending-setup.yaml` output plus new scaffolding (Task Command Results) | covered | |
| R2 | Scratch-repo `init` runs (×3) produce config stubs, `pending-setup.yaml`, 7 artifact dirs, `workflow/learnings/`; never-overwrite confirmed on re-run with a real domain value | covered | |
| R3 | `src/setup/SKILL.md` Phase 2 rewritten, checked side-by-side against `router.md`'s 7 steps (this review re-verified: steps 1–8 in SKILL.md map 1-for-1 to `router.md`'s 7, plus one clearly-marked addition for the config-map.md fallback case). User's "final call from interview setup only" constraint present verbatim. | covered | |
| R4 | README's 3 sections updated; `docs/knowledge-map/repo-mental-map.md` stale reference fixed; repo-wide grep re-run this review (see Verification Reviewed) confirms no other live doc references the old flow | covered | the P3 finding (README's tool-count claim) was found and fixed same-cycle |
| R5 | `placeDeterministicAdapters()` verified on real macOS (Cursor only) and platform-mocked non-macOS (both Cursor and Copilot, correctly rendered, 5/8 tokens real); never-overwrite confirmed | covered | the 2 P2 findings were found and fixed same-cycle, re-verified against both the untouched empty-array case and a new flow-style-with-content scratch-repo test |
| RI1 | `git diff --stat package.json` — no output, confirmed no dependency change | covered | |
| RI2 | `npm run validate`, `violations:test` (21/21), `conformance:test` (12/12), and 4 CLI suites (32+4+5+16 = 57/57) — this review re-ran `npm run validate` and `npm run setup-refs:test` directly rather than trusting Task's citation alone; both reproduced clean | covered | |

## Architecture Notes

- role: Staff Reviewer
- decision: Classified both code findings as P2, not P1 or P0 — neither caused a crash, a
  validator failure, or an incorrect result in any path this chain's own scratch-repo testing
  had actually exercised (both required config content that didn't exist anywhere in this
  repo's real templates or examples). They were real latent gaps in a genuinely new
  deterministic code path, not defects that manifested under the previously-shipped conditions.
- decision: Initially recorded all 3 findings without modifying any file, per Review's own
  Determinism Rule ("do not modify product files unless the user explicitly switches to a
  fix/build pass") — then applied the fix pass in this same review cycle once the user
  explicitly authorized it ("yes fix them"). All 3 fixes are cheap, well-understood,
  single-line-or-near changes, each independently re-verified (regex-level unit check for the
  flow-style parser, a new scratch-repo test with real flow-style content, a direct grep for
  `ADAPTER_TODO_FALLBACK`'s presence at the fixed call site) before re-running the full
  regression suite.
- constraint: Re-verified R3's `router.md` parity claim independently in this review (not just
  trusting Build's Task artifact) by re-reading both files side-by-side — confirmed accurate.
- downstream: Test/Ship can treat all 3 findings as closed, not residual risk — each has
  independent re-verification evidence in this artifact, not just a claim that a fix was
  applied.

## Verification Reviewed

| Item | Outcome | Notes |
|---|---|---|
| `npm run validate` (re-run this review, pre- and post-fix) | pass, exit 0 (both) | Reproduced independently, not just cited from Task |
| `npm run setup-refs:test` (re-run this review) | pass, 5/5 | Reproduced independently |
| `extractYamlList` flow-style regex behavior — pre-fix | fail (confirmed) | `node -e` test directly against the actual regex — see P2 finding 1 |
| `extractYamlList` flow-style regex behavior — post-fix | pass | Same `node -e` test re-run against the fixed regex; new scratch-repo test with `commands: [npm test, npm run lint]` correctly rendered both commands in the shipped Cursor adapter; untouched empty-array case (`commands: []`) still renders `"(none defined)"` |
| `ADAPTER_TODO_FALLBACK` present at the `BRANCH_POLICY` call site — post-fix | pass | `grep -n "ADAPTER_TODO_FALLBACK" bin/agentsmyth.mjs` confirms the literal `'<USER-TODO>'` was replaced |
| README "four tools" claim vs. `runPrepare()`'s actual gate list — pre-fix | fail (confirmed) | Cross-checked against `bin/agentsmyth.mjs`'s Copilot gate install list — confirmed inaccurate, see P3 finding |
| README wording — post-fix | pass | Re-read the corrected sentence; now states 3 tools with the Copilot dual-coverage explanation |
| `src/setup/SKILL.md` Phase 2 vs. `router.md`'s 7 steps | inspected, side-by-side | Confirmed 1-for-1 parity, independently re-verified |
| Full regression suite — post-fix | pass | `npm run validate`, `violations:test` (21/21), `conformance:test` (12/12), and all 4 CLI suites (32+4+5+16 = 57/57), zero regression from the 3 fixes |
| Scratch-repo `init`/`check` runs from Build (R1, R2, R5) | inspected (Task's Command Results + rendered file contents cited in the conversation) | Not re-executed this review — Task's evidence (exact commands, exact rendered output shown) was concrete enough to trust directly rather than re-running identical scratch-repo scenarios |

## Residual Risk

None outstanding. All 3 findings were fixed and independently re-verified within this Review
cycle — see Findings and Verification Reviewed above.

## Recommendation

pass

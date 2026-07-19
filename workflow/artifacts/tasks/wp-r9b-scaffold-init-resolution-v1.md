---
slug: wp-r9b-scaffold-init-resolution
version: 1
artifact: task
status: ready-for-next-phase
created: 2026-07-19
updated: 2026-07-19
manifest_ids: [R1, R2, R3, R4, R5, RI1, RI2]
upstream:
  - workflow/artifacts/briefs/wp-r9b-scaffold-init-resolution-v1.md
  - workflow/artifacts/plans/wp-r9b-scaffold-init-resolution-v1.md
orchestration:
  phase: build
  status: ready-for-next-phase
  next_phase: review
  blockers: []
  user_checkpoint: none
---

# WP-R9b — Scaffold-Only Init + Resolution-Pass Setup - Task

## Active Phase

- Phase: Phase 5 - Doc sweep and full regression
- Manifest IDs: R1, R2, R3, R4, R5, RI1, RI2
- Exit gate: all 5 phases' exit gates met, full regression suite green.

## Plan Phases Overview

| Phase | Status | Manifest IDs |
|---|---|---|
| Phase 1 - Extend the shared bootstrap function | complete | R1, R2, RI1 |
| Phase 2 - Wire bare `init` to the shared bootstrap function | complete | R1, R2 |
| Phase 3 - Deterministic Cursor / non-macOS-Copilot adapter placement | complete | R5 |
| Phase 4 - Rewrite SKILL.md's Phase 2 into a Pending Setup Resolution pass | complete | R3 |
| Phase 5 - Doc sweep and full regression | complete | R4, RI1, RI2 |

## Branch / Repo Status

| Moment | Branch | Status | Notes |
|---|---|---|---|
| Before edits | `feat/wp-r9b-scaffold-init-resolution` | clean, rebased onto `origin/main` (byte-identical) | No unrelated changes present |
| At handoff | `feat/wp-r9b-scaffold-init-resolution` | 4 files modified, 1 new dir (`src/assets/workflow/learnings/`), 2 new artifact files | All changes attributable to this chain's R1–R5/RI1–RI2; nothing unrelated staged |

## Scope

- In scope: `bin/agentsmyth.mjs` (shared bootstrap extension, `init` wiring, deterministic adapter placement), `src/assets/workflow/learnings/{README.md,curated.md}` (new templates), `src/setup/SKILL.md` (resolution-pass rewrite), `README.md` + `docs/knowledge-map/repo-mental-map.md` (doc sweep).
- Out of scope: WP-R9c's already-shipped TUI polish (untouched), WP-R10 (deferred), any change to the other four adapters' interview-driven placement (Step 5a.1 unchanged for Claude/Codex/Windsurf/macOS-Copilot), any change to `pending-setup.yaml`'s stale `commands[0].run` field-name reference in `headlessBootstrap()` (pre-existing, unrelated to this chain's R1–R5 — noted for a future Reflect follow-up, not fixed here).

## Changed Files

- `bin/agentsmyth.mjs` — extended `headlessBootstrap()` with artifacts/learnings scaffolding; wired `init` to call it (replacing `init`'s own standalone `writeDefinitionsRoot()` call, which was found to race ahead of `headlessBootstrap()`'s full-template write — see Implementation Log); added `placeDeterministicAdapters()`, `buildAdapterTokens()`, `extractYamlList()`, `renderAdapterTemplate()`. — IDs: R1, R2, R5
- `src/assets/workflow/learnings/README.md` (new) — lifted verbatim from this repo's own generic file. — IDs: R2
- `src/assets/workflow/learnings/curated.md` (new) — lifted verbatim from this repo's own generic file. — IDs: R2
- `src/setup/SKILL.md` — Purpose, When To Run, Phase 1, Phase 2 (Interview → Pending Setup Resolution), Phase 3 intro, Step 3.x, Step 5a.1 cross-references, new Step 5a.2 (adapter re-render), Step 5b. — IDs: R3
- `README.md` — "What `init` does" / "Running setup" / "What ends up in the target repo" sections. — IDs: R4
- `docs/knowledge-map/repo-mental-map.md` — corrected a stale "before the setup skill's interview even starts" reference; added a new paragraph describing the mechanical-scaffold + resolution-pass split. — IDs: R4

## Implementation Log

- Phase 1: confirmed `headlessBootstrap()` already generic (no `check`-specific coupling) — no restructuring needed, R1 satisfied by extension + Phase 2's new call site. Extended it to mkdir the 7 `workflow/artifacts/` phase dirs, `workflow/learnings/sessions/`, and copy the two new template files (skip-if-exists). Verified in a scratch repo: `check` still produces identical config-stub/`pending-setup.yaml` output, plus the new scaffolding.
- Phase 2: wired `init` to call `headlessBootstrap(cwd, pkgRoot)`. **Found and fixed a real bug during Build, not anticipated by Plan**: `init` already had its own direct `writeDefinitionsRoot()` call (pre-existing code, from before this chain). Calling it before `headlessBootstrap()` pre-creates a *minimal* `repo-profile.yaml` (just `definitions_root`), which then makes `headlessBootstrap()`'s own per-file skip-if-exists check skip writing the *full* template — silently dropping `default_branch`, `branch_policy`, `paths.protected`, and every other default field. Fixed by removing `init`'s standalone `writeDefinitionsRoot()` call entirely, since `headlessBootstrap()` already performs the full write-template-then-inject-definitions_root sequence correctly, in the right order. Verified via scratch-repo `init` run: full template now present with real defaults; re-run with a manually-set real domain value confirmed untouched (never-overwrite holds).
- Phase 3: implemented `placeDeterministicAdapters()` reusing the exact 8-token map. Verified real 5-of-8-tokens-resolvable / 3-TODO split matches Plan's corrected Approach exactly (`DEFAULT_BRANCH`, `BRANCH_POLICY`, `PROTECTED_PATHS`, `VERIFICATION_CMDS`, `CONSTRAINTS` real; `REPO_NAME`/`REPO_PURPOSE`/`DOMAIN_NAME` TODO). Verified macOS behavior directly (real platform, only Cursor placed) and non-macOS behavior via a `process.platform` override wrapper script (both Cursor and Copilot placed, correctly rendered). Verified never-overwrite by hand-editing the placed Cursor file and re-running `init`.
- Phase 4: rewrote SKILL.md's Phase 2 into the resolution pass, matching `router.md`'s 7 steps 1-for-1 (plus one clearly-marked addition, step 8, for the rare config-map.md fallback case). Carried the user's "final call is from interview setup only" constraint in verbatim. Added Step 5a.2 for adapter re-render. Corrected two other stale passages found while rewriting: the Phase 3 intro (previously said only `repo-profile.yaml` pre-existed with 2 fields; now all 5 files pre-exist with full templates) and Step 5b's "expand FILE blocks under workflow/artifacts/workflow/learnings" claim (verified via grep this Plan already found: no such FILE blocks actually exist in the bundle — corrected to state these dirs are now guaranteed to exist already, created by `init`).
- Phase 5: updated README's 3 relevant sections; grep swept the repo for stale interview-flow framing (`interviews you`, `5-phase`, `from scratch`) — found and fixed one real stale reference in `docs/knowledge-map/repo-mental-map.md`; all other grep hits were either my own new (correct) text or unrelated uses of "from scratch". Ran full regression.

## Verification Items

| Manifest ID | Verification target | Expected result |
|---|---|---|
| R1 | Scratch-repo `check` run, before/after comparison | Byte-identical config-stub/`pending-setup.yaml` output, plus new scaffolding |
| R2 | Scratch-repo `init` run, direct file listing + re-run never-overwrite test | Config stubs, `pending-setup.yaml`, 7 artifact dirs, `workflow/learnings/` present; real values survive re-run |
| R3 | Side-by-side comparison of SKILL.md's Phase 2 against `router.md`'s 7 steps | Matches 1-for-1 plus one marked addition |
| R4 | README + repo-wide grep sweep | README accurate; grep sweep found and fixed 1 additional stale reference (`repo-mental-map.md`) |
| R5 | Scratch-repo `init` run (macOS, real) + platform-mocked run (Linux) + never-overwrite test | Cursor always placed; Copilot only on non-macOS; 5/8 tokens real, 3/8 TODO; re-run never overwrites |
| RI1 | `git diff --stat package.json` | No changes at all |
| RI2 | Full suite | `npm run validate`, `violations:test` (21/21), `conformance:test` (12/12), 4 CLI suites (32+4+5+16 = 57/57) |

## Command Results

| Command | Area | Outcome | Notes |
|---|---|---|---|
| `node bin/agentsmyth.mjs check` (scratch repo) | R1 | pass | 7 artifact dirs + `workflow/learnings/` produced alongside unchanged config-stub output |
| `node bin/agentsmyth.mjs init` (scratch repo, ×3 runs across phases) | R2, R5 | pass | Full scaffold + adapter placement each time; never-overwrite confirmed on re-run |
| Platform-mocked `init` run (`process.platform` override) | R5 | pass | Both Cursor and Copilot placed on simulated non-macOS; correctly rendered |
| `npm run validate` | RI2 | pass, exit 0 | |
| `npm run violations:test` | RI2 | pass | 21/21 |
| `npm run conformance:test` | RI2 | pass | 12/12 |
| `npm run setup-checks:test` | RI2 | pass | 4/4 |
| `npm run setup-refs:test` | RI2 | pass | 5/5 |
| `npm run root-resolution:test` | RI2 | pass | 16/16 |
| `npm run init-prepare-interop:test` | RI2 | pass | 32/32 |
| `git diff --stat package.json` | RI1 | no output | Confirms zero dependency change |
| `grep -rln "interviews you\|5-phase\|from scratch" --include="*.md" .` (excl. `workflow/artifacts/`) | R4 | 5 hits, 1 real (fixed) | `docs/knowledge-map/repo-mental-map.md` fixed; other 4 were unrelated or my own new correct text |

## Dispatch Log

none

## Architecture Notes

- role: Senior Engineer
- decision: Removed `init`'s pre-existing standalone `writeDefinitionsRoot()` call rather than working around the ordering bug it caused — the real fix is structural (let `headlessBootstrap()` own the entire config-writing sequence in the correct order), not a patch on top of a known-bad call order.
- decision: Kept `extractYamlList()`/`buildAdapterTokens()` deliberately narrow (indentation-based, not a general YAML parser) — sufficient for this repo's own hand-authored config shape, consistent with the zero-runtime-dependency invariant and this file's existing regex-based style.
- constraint: The user's "final call is from interview setup only" instruction is now encoded twice — once in `bin/agentsmyth.mjs`'s comments (only `DEFAULT_BRANCH`/`os.platform()` are ever finalized mechanically) and once in `SKILL.md`'s Phase 2 (verbatim paragraph).
- tradeoff: Considered leaving `init`'s own `writeDefinitionsRoot()` call in place and instead making `headlessBootstrap()`'s repo-profile.yaml write ignore the skip-if-exists rule specifically for that one file — rejected, since that would special-case the one config file most in need of the never-overwrite guarantee (it carries `definitions_root`), trading a narrow bug for a narrower but more dangerous one.
- downstream: `placeDeterministicAdapters()` and its token-substitution helpers are a second real precedent (after R9c's `src/cli/` bundling) for moving agent-only prose logic into deterministic CLI code — reusable by any future work touching adapter rendering.

## Blockers

none

## Phase Completion Log

| Phase | Status | Completed | Notes |
|---|---|---|---|
| Phase 1 - Extend the shared bootstrap function | complete | 2026-07-19 | Scratch-repo verified |
| Phase 2 - Wire bare `init` to the shared bootstrap function | complete | 2026-07-19 | Real ordering bug found and fixed |
| Phase 3 - Deterministic Cursor / non-macOS-Copilot adapter placement | complete | 2026-07-19 | Verified real (macOS) + mocked (non-macOS) |
| Phase 4 - Rewrite SKILL.md's Phase 2 into a Pending Setup Resolution pass | complete | 2026-07-19 | Matches router.md 1-for-1 |
| Phase 5 - Doc sweep and full regression | complete | 2026-07-19 | 1 additional stale doc reference found and fixed |

---
slug: wp-r9b-scaffold-init-resolution
version: 1
artifact: brief
status: ready-for-next-phase
created: 2026-07-19
updated: 2026-07-19
manifest_ids: [R1, R2, R3, R4, R5, RI1, RI2]
upstream:
  - user-request
orchestration:
  phase: think
  status: ready-for-next-phase
  next_phase: plan
  blockers: []
  user_checkpoint: brief-review
skill_trigger_log:
  - skill: repo-alignment-scan
    decision: ran
    reason: "task_class = Complex (cross-cutting: merges two CLI entry paths, restructures the setup skill's phase model, touches README) satisfies task_class != trivial. Re-read bin/agentsmyth.mjs's full init/check/headlessBootstrap() implementation, src/setup/SKILL.md's all 5 phases, router.md's Pending Setup Resolution section, and README.md's consumer-facing setup description directly this Think, rather than trusting the Notion spike's §1-§2/§5 summary alone."
  - skill: architecture-decision-advisor
    decision: ran
    reason: "complexity_score crosses the threshold — this changes which CLI command owns config-stub writing (check-only today, both check+init after) and restructures an agent-executed skill's phase model (Interview -> Resolution pass). Performed the whole-repo architecture read directly (see Architecture Notes) given full context already in hand from this session's grounding pass."
  - skill: constraint-conflict-scan
    decision: ran
    reason: "task_class = Complex satisfies task_class != trivial. Checked CLAUDE.md golden rule 4 (zero runtime dependency) — no risk, this is a refactor of existing CLI logic, no new dependency. Checked repo-profile.yaml/domain.yaml protected paths — none touch this work's files. No conflict found."
---

# WP-R9b — Scaffold-Only Init + Resolution-Pass Setup - Brief

## Source Links

- Notion: [WP-R9b — Scaffold-Only Init + Resolution-Pass Setup](https://app.notion.com/p/3a1972bdebbb8178aed8e5a9539cc0e4) (Status: ⚪ Not Started at Think start, Class: Complex, Depends On: R9a)
- Notion: [WP-R9 — Research Spike](https://app.notion.com/p/3a0972bdebbb8160b9c2d2cacb246cae) §1 (requirement as stated by user), §2 (current-state findings), §3 (adapter-placement tension), §5 (draft requirements T9.1–T9.5), §6 (edge cases), §8 (R9a's shipped fix), §11 (scope split)
- `bin/agentsmyth.mjs` — read in full this Think (`headlessBootstrap()` lines 147–226, `check` command lines 59–117, `init` command lines 444–519)
- `src/setup/SKILL.md` — read in full this Think (all 5 phases, including R9a's shipped Step 5a.1 marker-check table)
- `src/workflow/router.md` — read in full this Think (Pending Setup Resolution, lines 5–27)
- `README.md` lines 100–118 ("What init does" / "Running setup")
- `workflow/artifacts/{briefs,ship,reflect}/wp-r9a-adapter-gate-dedup-v1.md` — **shipped and merged to `main`** (PR #38, merged 2026-07-19T12:59:39Z)
- `workflow/artifacts/reflect/wp-r9c-tui-polish-v1.md` — **shipped and merged to `main`** (PR #39, merged 2026-07-19T13:02:00Z). Follow-Ups row: "Start WP-R9b when ready — reuses R9a's dedup logic and R9c's `src/cli/` bundling pattern verbatim."
- This branch (`feat/wp-r9b-scaffold-init-resolution`) was created from `feat/wp-r9c-tui-polish`, then rebased onto `origin/main` once both #38 and #39 merged (confirmed the branch tip was byte-identical to `origin/main` before rebasing — a clean, non-destructive fast-forward, not a real rebase conflict resolution).

## Problem

`agentsmyth init` today does the minimum possible: link the repo to a global definitions install, stage `.agentsmyth/{setup-bundle.md, workflow-bundle.md, validators/, assets/}`, and tell the user to invoke the agent. **Nothing in `workflow/config/` is written by the CLI.** All five config files stay blank until the agent runs a full, from-scratch 5-phase interview (`src/setup/SKILL.md`).

Grounded in this session's direct reading of the code: `agentsmyth check` already has a working, tested mechanism for almost exactly this — `headlessBootstrap()` writes all 5 config stubs from templates, infers the default branch, and writes `pending-setup.yaml` naming every field it couldn't determine (each with `id`/`question`/`hint`). It is wired to the wrong trigger (`check`, only when `repo-profile.yaml` is absent) instead of `init`. Separately, `router.md`'s "Pending Setup Resolution" section already defines the two-step resolution model (inspect first, batch remaining as one question block) this initiative needs — it is not new mechanism to build, it is an existing pattern `init`'s output should route through.

The user's original framing (`init` should "just run the scaffold... make sure global agentsmyth is setup and local repo has all that it needs with placeholder where needed"; the agent's `agentsmyth setup` should "finish the actual scaffolding with real repo mapping and data") is not met by the current split.

## Goals

- Bare `init` performs the full mechanical scaffold itself: link to the global install (already does this), write all 5 config stubs + `pending-setup.yaml` + empty `workflow/artifacts/`/`workflow/learnings/` (does not yet do this), and — for the two tools the global gate can never cover — place their adapter file mechanically too (does not yet do this).
- The agent's `setup` skill becomes a **resolution pass** over `pending-setup.yaml` (reusing `router.md`'s existing inspect-then-batch-ask pattern), not a from-scratch interview.
- `check` and `init` share one implementation of the stub-writing logic — no forked/duplicated behavior between the two entry points.
- Documentation (`README.md` and anywhere else describing the old "say 'run the agentsmyth setup', full interview" flow) matches the corrected model.

## Non-Goals

- WP-R9c's TUI polish (already shipped separately; this branch builds on top of its merged output but does not re-scope it).
- WP-R10's compiled-binary distribution (deferred to post-v1 per Notion page 02 decision #11).
- Building a new interactive question-asking mechanism beyond what `router.md`'s Pending Setup Resolution pattern already defines — this brief reuses that pattern, it does not redesign it.
- Asking the user which AI agent tool they use, at any point in this flow. Confirmed by the user's Q1 answer: `init` never runs an interview, so tool-specific adapter placement at `init` time is scoped to only the tools where placement is *deterministic without asking* (see R5) — everything else still waits for the agent's later resolution pass, same as today's Step 5a.1 (unchanged by this brief).

## User Impact

A user running `npx agentsmyth init` in a fresh repo gets real, inspectable config stubs, a concrete list of open questions, and (for Cursor / non-macOS-Copilot repos) a working adapter file — all before ever opening an AI agent. When they do say "run the agentsmyth setup," the agent's job shrinks to resolving a known, bounded list of items (inspect first, ask only what's left) instead of conducting an open-ended interview from a blank slate.

## Success Metrics

Not applicable in the small-scale sense (no user-facing metrics infra) — success is structural: `init` writes real stub content (verifiable via direct file inspection after a test run in a scratch repo), `check`'s existing behavior is unchanged (regression-tested), and the setup skill's resolution pass correctly reuses `pending-setup.yaml` items `init` already created.

## Requirements

See Requirement Manifest below for the authoritative, acceptance-criteria-bound list. Summary:

1. Extract `headlessBootstrap()`'s stub-writing logic into a function shared by `check` and `init` — no duplicated logic between the two entry points.
2. Bare `init` calls that shared function directly: writes all 5 config stubs, `pending-setup.yaml`, and empty `workflow/artifacts/`/`workflow/learnings/` — never overwriting a config a prior agent session already filled with real values.
3. Rewrite `src/setup/SKILL.md`'s Phase 2 ("Interview") into a Pending Setup Resolution pass reusing `router.md`'s existing pattern; adjust Phase 1 (Inspect) and Phase 3 (Write Configs) to reflect that `init` now performs the mechanical writing.
4. Update `README.md` (and any other doc found describing the old from-scratch interview flow) to match the corrected two-step model.
5. `init` mechanically places the adapter file for the two tools the global gate structurally can never cover (Cursor always; Copilot on non-macOS) — deterministic, no question asked, never overwriting an existing file.

## Constraints

- Zero-runtime-dependency invariant (CLAUDE.md golden rule 4) — this is a refactor of existing CLI/skill logic, introduces no new dependency.
- `headlessBootstrap()`'s existing "never overwrite an existing file" per-file discipline must be preserved and extended to `init`'s new call paths (config stubs and the R5 adapter placement alike) — re-running `init`, or the agent later revisiting a repo, must never clobber a config field or adapter file a prior session already filled with real content.
- No waiver permitted for Setup-skill validator failures per `src/setup/SKILL.md` Phase 4 ("Waivers are not permitted during setup") — any change to Phase 3/Phase 4 boundaries must preserve that rule.
- This branch is based directly on `origin/main` (post-#38/#39 merge) — no stacked-branch PR-targeting concern remains.
- **User-confirmed on R3**: the "final call" on any judgment-based or ambiguous config item belongs exclusively to the agent's resolution pass — never to `init`'s mechanical logic. `init` may only finalize values that are genuinely deterministic (git-inferred default branch, R5's `os.platform()`-based adapter detection); anything requiring inspection judgment or a real choice (domain name, verification commands, which config value is "correct" when ambiguous) must go through `pending-setup.yaml` and wait for the resolution pass — `init` must never auto-resolve or guess at those to skip a pending item. Build must not introduce any shortcut where `init`'s stub-writing silently finalizes a judgment call under the guise of "inference."

## Risks

- **Merge/behavior-divergence risk**: extracting `headlessBootstrap()`'s logic into a shared function could subtly change `check`'s existing, already-shipped headless-bootstrap behavior if the extraction isn't purely mechanical. Mitigation: reproduce existing `check`-triggered bootstrap test coverage (`init-prepare-interop`, `root-resolution` suites) unchanged, plus a direct before/after diff of `check`'s bootstrap output in a scratch repo.
- **Doc drift beyond README**: other docs (`docs/knowledge-map/`, possibly adapter-facing instructions) may also describe the old from-scratch interview flow. Requires a repo-wide grep sweep at Plan/Build time, not just a README edit.
- **R5's adapter content will mostly be TODO placeholders at `init` time** — since config values (`domain.yaml`, `verification.yaml`, etc.) aren't resolved yet when `init` runs, the Cursor/non-macOS-Copilot adapter it places will render most `{{TOKEN}}` values as `<!-- TODO: see pending-setup.yaml -->` (the existing, already-shipped Step 5a.1 fallback rule for unresolved tokens — reused here, not new behavior). R3's resolution-pass rewrite must include re-rendering that same adapter file once real values are resolved — this is safe to overwrite in place (its content was deterministically generated by `init`, never user-authored) and must be scoped explicitly in Plan, not left implicit.

## Open Questions

None outstanding. Q1 (below) is resolved.

## Requirement Manifest

### Explicit (R)

- **R1** — Extract `headlessBootstrap()`'s stub-writing logic (config stubs, `pending-setup.yaml`, default-branch inference, `definitions_root` linking) into a function directly callable from both the `check` and `init` command branches in `bin/agentsmyth.mjs`, with zero duplicated logic between them.
  Acceptance: `check`'s existing headless-bootstrap call path and `init`'s new call path both route through the same function; a scratch-repo test run of `check` (on a repo with no `workflow/config/`) produces byte-identical output to before this change; no logic is copy-pasted between the two entry points.

- **R2** — Bare `agentsmyth init` writes all five `workflow/config/*.yaml` stub files (real structure, `<USER-TODO>` placeholders where not inferrable), `workflow/config/pending-setup.yaml`, and empty `workflow/artifacts/` + `workflow/learnings/` directories itself, before staging `.agentsmyth/` for the agent — never overwriting a config file a prior agent session already populated with real (non-placeholder) values.
  Acceptance: running `init` in a fresh repo produces populated config stubs, `pending-setup.yaml`, and the two empty artifact directories without any agent involvement; re-running `init` in a repo where the agent already filled in real config values leaves those values untouched (per-file "never overwrite" check, same discipline `headlessBootstrap()` already has).

- **R3** — Rewrite `src/setup/SKILL.md`'s Phase 2 ("Interview") into a Pending Setup Resolution pass that reuses `router.md`'s existing inspect-then-batch-ask pattern (`package.json`/`.github/workflows/`/`Makefile`/`README.md` inspection first, then a single batched question block for anything still open) instead of a from-scratch, topic-ordered 9-question interview. Re-read and adjust Phase 1 (Inspect) and Phase 3 (Write Configs) to reflect that `init` now performs the mechanical config-writing — collapsing or removing steps that become redundant, not leaving stale prose that contradicts R1/R2's new behavior. Include re-rendering R5's `init`-placed adapter file (Cursor / non-macOS-Copilot) once real config values are resolved, replacing its TODO placeholders — this is a safe in-place overwrite (deterministically-generated content, not user-authored).
  Acceptance: SKILL.md's entry-point behavior for a repo where `pending-setup.yaml` already exists (written by `init`) is the resolution pass, not the old interview; the resolution pass logic matches `router.md`'s documented steps exactly (inspect-based resolution first, batched user prompt second, `waived` items never surfacing); Phase 4 (Verify)/Phase 5 (Copy & Cleanup) reviewed for any step that duplicates work `init` now does (e.g. config-writing, R5's adapter placement) and adjusted accordingly; the resolution pass re-renders R5's adapter file when it exists and still has unresolved TODO markers.

- **R4** — Update `README.md`'s "What `init` does" / "Running setup" sections, and any other doc found (via repo-wide grep) describing the old from-scratch 5-phase interview, to describe the corrected two-step model: mechanical scaffold at `init` time (config stubs + `pending-setup.yaml` + Cursor/non-macOS-Copilot adapter already present), resolution pass at agent `setup` time.
  Acceptance: README no longer states that init only stages `.agentsmyth/` and waits for a full interview from a blank slate; a repo-wide grep for the old framing (e.g. "interviews you", "5-phase", "from scratch") in doc files finds no remaining stale description.

- **R5** — `init` mechanically places the adapter file for exactly the two cases where no global gate mechanism can ever cover a repo, regardless of which tool the user actually uses there: **Cursor** (unconditional — no global config mechanism exists for this tool at all, confirmed in R9a's own Step 5a.1 table) and **Copilot on a non-macOS platform** (the global install only writes Copilot's gate on macOS, confirmed in `runPrepare()`). Detection is deterministic — `os.platform()` for the Copilot case, unconditional for Cursor — never an interview question. Placement is strictly additive: `init` never overwrites an existing adapter file at the target path (`.cursor/rules/agentsmyth.mdc`, `.github/copilot-instructions.md`), skipping entirely if it's already there. Token substitution uses whatever config values exist at `init` time — since R2 has typically just written stub configs, most tokens render as the existing `<!-- TODO: see pending-setup.yaml -->` fallback (Step 5a.1's already-shipped rule, reused unchanged). This absorbs R9a's SKILL-side marker-check logic for these two specific cases into deterministic CLI code; R9a's SKILL-side check remains as-is for the three tools it already fully covers (Claude, Codex, Windsurf) plus Copilot-on-macOS, and continues to serve as the correctness backstop if `init`'s R5 step is ever bypassed (e.g. a repo whose `workflow/config/` predates this change).
  Acceptance: a fresh `init` run on a non-macOS platform writes both `.cursor/rules/agentsmyth.mdc` and `.github/copilot-instructions.md` if neither exists yet; on macOS, only `.cursor/rules/agentsmyth.mdc` is written; re-running `init` when either file already exists writes nothing to that path (verified via file-mtime or content-diff check); SKILL.md's Step 5a.1 table and its "skip if global gate covers it" logic are otherwise unchanged — R5 supplements it, does not replace it.

### Implicit (RI)

- **RI1** — Preserve the zero-runtime-dependency invariant (CLAUDE.md golden rule 4). This work is a refactor/relocation of existing CLI and skill logic, not a new external dependency.
  Acceptance: `git diff package.json` shows no dependency changes attributable to this work.

- **RI2** — No regression in existing CLI-specific test suites, since `bin/agentsmyth.mjs`'s `init`/`check` paths are directly touched.
  Acceptance: `npm run validate`, `npm run violations:test`, `npm run conformance:test`, and the 4 CLI-specific suites (`setup-checks:test`, `setup-refs:test`, `root-resolution:test`, `init-prepare-interop:test`) all pass with zero regression.

### Assumptions (A)

- **A1** — R9a's shipped fix (marker-check-before-per-repo-adapter-placement in `src/setup/SKILL.md` Step 5a.1) is the landed baseline for this work. **User-confirmed**: PR #38 is shipped and merged to `main` (verified via `gh pr view 38`, `mergedAt: 2026-07-19T12:59:39Z`). This branch is based directly on the post-merge `origin/main`.
- **A2** — "Empty `workflow/artifacts/`/`workflow/learnings/` directories" means the same output Phase 5b's bundle-expansion already produces today (empty phase dirs, learnings README + sessions dir) — R2 moves *when* this happens (to `init` time) not *what* gets written. **User-confirmed.**

### Open Questions (Q)

- **Q1** — **Resolved by the user.** R9b's own Notion Notes state this work package "owns moving adapter placement into the CLI as the deterministic primary, absorbing R9a's interim SKILL-side check, which then demotes to a Cursor / non-macOS-Copilot backstop." User's answer: this does not change what the agent's `setup` skill does later — it gives `init` a mechanical, non-interview-based step to prepare adapter placeholders ahead of that later cycle, strictly non-destructive (skip if the file already exists). Combined with R9a's own explicit naming of "Cursor / non-macOS-Copilot" as the only two cases the global gate can never reach, this resolves to R5 above: `init` places those two adapters deterministically (platform-detected, never interview-driven), everything else is unchanged from R9a's shipped Step 5a.1 behavior.
  Owner: user. Status: resolved, 2026-07-19. No longer blocking.

## Questions For User

None outstanding — Q1, A1, and A2 are all resolved. Ready for Plan once you confirm this updated brief.

## Architecture Notes

- role: Architect
- decision: Resolved Q1 into a concrete, narrowly-scoped requirement (R5) rather than leaving it as an abstract relocation goal — grounded in R9a's own table, which already names Cursor and non-macOS-Copilot as the only two cases with no global-gate coverage. This keeps R5 deterministic and interview-free, matching the user's explicit "init can never run an interview" framing.
- decision: Rebased this branch directly onto `origin/main` once confirmed both #38 and #39 had merged (user's A1 answer prompted the check) — the branch tip was byte-identical to `origin/main` beforehand, so this was a clean, non-destructive fast-forward, not a real conflict-resolution rebase. Removes the three-deep stacked-branch risk this brief originally carried.
- decision: Flagged the adapter-re-render timing gap (R5's placeholder-heavy output at `init` time vs. R3's resolution pass needing to fill it in later) explicitly in Risks and folded it into R3's acceptance criteria, rather than letting it surface as a surprise at Build time.
- tradeoff: Considered leaving R5 unscoped (just "move placement into the CLI, details TBD at Plan") — rejected, since the user's answer contained enough concrete constraint (mechanical, non-interview, non-destructive) to derive a specific, testable requirement now, and doing so respects the user's own stated preference for locking things down before implementation starts.
- downstream: R3's SKILL.md rewrite and R4's doc pass are the natural hand-off points for WP-R9c's `@clack/prompts` work, if a future work package ever wants to turn the "which agent tool" question into an actual interactive prompt — out of scope here, noted only as a possible future hook.

## Exit Gate

- [x] Every active R and RI has acceptance criteria.
- [x] Blocking Q IDs appear in orchestration.blockers.
- [x] User approved or waiver recorded — "R5 makes sense. R3 is fine but final call is from interview setup only," 2026-07-19.

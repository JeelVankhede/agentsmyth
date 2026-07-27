---
slug: wp-r9b-scaffold-init-resolution
version: 1
artifact: plan
status: ready-for-next-phase
created: 2026-07-19
updated: 2026-07-19
manifest_ids: [R1, R2, R3, R4, R5, RI1, RI2]
upstream:
  - workflow/artifacts/briefs/wp-r9b-scaffold-init-resolution-v1.md
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: plan-review
---

# WP-R9b — Scaffold-Only Init + Resolution-Pass Setup - Plan

## Summary

Merges `agentsmyth init`'s mechanical scaffold with the already-shipped `headlessBootstrap()`
logic `check` uses today, extends it to also create `workflow/artifacts/`/`workflow/learnings/`
and — deterministically, for exactly the two tools no global gate can ever reach (Cursor,
non-macOS Copilot) — place an adapter file, then rewrites the agent's `setup` skill's Phase 2
from a from-scratch interview into a resolution pass over what `init` already produced. Five
phases, in dependency order: shared-bootstrap extension → wire `init` to it → deterministic
adapter placement → SKILL.md rewrite → doc sweep + full regression.

## Inputs

- `workflow/artifacts/briefs/wp-r9b-scaffold-init-resolution-v1.md` — `ready-for-next-phase`,
  all Q/A items resolved, user confirmed R5 and R3 (with the "final call is from interview
  setup only" constraint, carried into Phase 4 below).
- `bin/agentsmyth.mjs` (519 lines, read in full) — `headlessBootstrap()` (147–226), `check`
  (59–117), `init` (444–519), `runPrepare()` (312–402).
- `src/setup/SKILL.md` (318 lines, read in full).
- `src/workflow/router.md` (92 lines, read in full) — Pending Setup Resolution, lines 5–27.
- `src/setup/references/token-map.md` — the 8-token adapter substitution map.
- `src/assets/workflow/config/{repo-profile,verification,domain}.yaml` — the actual stub
  templates `headlessBootstrap()` copies, read this Plan to determine which of the 8 adapter
  tokens are genuinely resolvable at `init` time vs. must fall back to the TODO marker (see
  Approach — this refines the brief's Risk section, which assumed most tokens stay TODO).
- `src/adapters/cursor/rules/index.mdc`, `src/adapters/copilot/copilot-instructions.md` — both
  use the identical 8-token set.
- `workflow/learnings/{README.md,curated.md}` (this repo's own) — confirmed fully generic, no
  repo-specific content, safe to lift verbatim as the new shipped templates for R2 (a gap the
  brief's A2 assumption did not anticipate: no such template exists in `src/assets/` today —
  Phase 5b's bundle expansion never actually produced this content mechanically, it was always
  agent-hand-authored prose with no backing file).
- `README.md` lines 100–118.

## Requirement Coverage

| Manifest ID | Covered by phases | Notes |
|---|---|---|
| R1 | Phase 1 | `headlessBootstrap()` confirmed already generic/shared (no `check`-specific coupling); Phase 1 extends it, Phase 2 adds the second call site |
| R2 | Phase 1 (artifacts/learnings scaffolding), Phase 2 (wiring `init` to call it) | Config-stub writing itself was already in `headlessBootstrap()`; the two real gaps were the missing artifact/learnings scaffolding and `init` never calling the function at all |
| R3 | Phase 4 | SKILL.md Phase 2 rewrite, with the adapter re-render step and the user's "final call from interview setup only" constraint carried through explicitly |
| R4 | Phase 5 | README + repo-wide doc grep |
| R5 | Phase 3 | Deterministic Cursor / non-macOS-Copilot placement, `init`-time, no interview |
| RI1 | Phase 1 (introduced — no new dependency), Phase 5 (verified) | Pure refactor/relocation; `git diff package.json` confirms no change |
| RI2 | Phase 5 | Full CLI-specific suite re-run after all 4 code phases land |

## Repo Impact Map

| File | Change type | Manifest IDs | Notes |
|---|---|---|---|
| `bin/agentsmyth.mjs` | modify | R1, R2, R5 | `headlessBootstrap()` extended (Phase 1); `init` command branch calls it + calls new adapter-placement function (Phase 2, Phase 3) |
| `src/assets/workflow/learnings/README.md` | new | R2 | Lifted verbatim from this repo's own generic file |
| `src/assets/workflow/learnings/curated.md` | new | R2 | Lifted verbatim from this repo's own generic file |
| `src/setup/SKILL.md` | modify | R3 | Phase 1/2/3 rewritten; new adapter re-render step added |
| `README.md` | modify | R4 | "What init does" / "Running setup" sections |
| any doc file the Phase 5 grep sweep surfaces | modify (conditional) | R4 | Not predictable in advance — Build/Phase 5 must run the grep and report exact hits |

## Source-of-Truth Strategy

Not applicable — `workflow/config/source-of-truth.yaml` has `mode: optional`,
`providers: []`. No external source-of-truth read or update is required for this work.

## Assumptions Verified

| Assumption ID | Status | Evidence / Question |
|---|---|---|
| A1 | evidence-backed | `gh pr view 38 --json state,mergedAt` and `gh pr view 39 --json state,mergedAt` both return `state: MERGED` (confirmed at Think). This branch was subsequently rebased onto `origin/main`, confirmed byte-identical to the branch tip beforehand — no lingering stacked-branch dependency. |
| A2 | evidence-backed | Read this repo's own `workflow/artifacts/`'s 7 phase directories and `workflow/learnings/{README.md,curated.md,sessions/}` directly this Plan — confirms the *shape* R2 must produce. One correction found: no template for this content exists in `src/assets/` today (Phase 5b's bundle expansion never mechanically produced it — always agent-hand-authored). Plan's Phase 1 adds the missing templates rather than assuming reuse of already-existing bundle content. |

## Approach

Two structural corrections from the brief's assumptions, found this Plan by reading the actual
stub templates rather than assuming:

1. **`headlessBootstrap()` is already a generic, shared function** (`repoDir`/`pkgRootDir`
   parameters, no `check`-specific branching inside it) — R1 is largely satisfied by the
   existing extraction; the real work is (a) extending its behavior (Phase 1) and (b) adding
   the second call site from `init` (Phase 2), not restructuring already-clean code.
2. **The brief's Risk section overstated how much of R5's adapter content stays TODO.**
   Reading the actual stub templates: `repo-profile.yaml`'s `branch_policy` and
   `paths.protected` ship real, non-placeholder defaults; `verification.yaml`'s `commands: []`
   is a real (empty) value, not a placeholder. Per `token-map.md`, this means `DEFAULT_BRANCH`,
   `BRANCH_POLICY`, `PROTECTED_PATHS`, and `VERIFICATION_CMDS` (renders "(none defined)") are
   all genuinely resolvable at `init` time — only `REPO_NAME`, `REPO_PURPOSE`, `DOMAIN_NAME`
   (all sourced from `domain.yaml`'s `name`/`summary`, which stay literal `<PLACEHOLDER>` until
   the resolution pass) fall back to the TODO marker. 5 of 8 tokens render real content
   immediately; 3 correctly wait for the resolution pass. This does not change any
   requirement's scope, only the accuracy of what Build/Test should expect to see.

Sequencing: Phase 1 must land before Phase 2 (needs the extended function to call). Phase 2
must land before Phase 3 (adapter placement reads `repo-profile.yaml`/`verification.yaml`/
`domain.yaml` values that only exist once `init` calls the bootstrap function). Phase 4 depends
on Phases 1–3 being real and shipped (SKILL.md's rewritten prose must describe what `init`
actually now does, not aspirational behavior). Phase 5 is last, since a doc sweep is only
accurate once behavior is final, and full regression only means something once all code phases
have landed.

## Phases

### Phase 1 - Extend the shared bootstrap function

- **Manifest IDs:** R1, R2, RI1
- Touches: `bin/agentsmyth.mjs` (`headlessBootstrap()`), `src/assets/workflow/learnings/README.md`
  (new), `src/assets/workflow/learnings/curated.md` (new)
- Work:
  - Confirm (do not restructure) that `headlessBootstrap()` has no `check`-specific coupling —
    it already takes generic `repoDir`/`pkgRootDir` parameters and performs no branching on
    which command invoked it. R1 is satisfied by this confirmation plus Phase 2's new call
    site; no code motion needed here beyond the extension below.
  - Extend `headlessBootstrap()` to additionally: `mkdirSync(..., { recursive: true })` the 7
    phase directories under `workflow/artifacts/` (`briefs`, `plans`, `tasks`, `reviews`,
    `verify`, `ship`, `reflect`) and `workflow/learnings/sessions/`; copy the two new template
    files into `workflow/learnings/{README.md,curated.md}`, applying the same per-file
    skip-if-exists rule the config-stub loop already uses (never overwrite).
  - Add the two new template files under `src/assets/workflow/learnings/`, copied verbatim from
    this repo's own `workflow/learnings/{README.md,curated.md}` (both confirmed fully generic —
    no repo-specific content, no `<PLACEHOLDER>` needed).
- **Exit gate:** a scratch-repo `agentsmyth check` run (no `workflow/config/` present) produces
  byte-identical config-stub and `pending-setup.yaml` output to a pre-Phase-1 run (regression
  check), and additionally produces the 7 empty `workflow/artifacts/` phase directories plus
  `workflow/learnings/{README.md,curated.md,sessions/}`; re-running in a repo where these
  already exist leaves them untouched (verified via mtime or content diff).

### Phase 2 - Wire bare `init` to the shared bootstrap function

- **Manifest IDs:** R1, R2
- Touches: `bin/agentsmyth.mjs` (`init` command branch, lines ~444–519)
- Why after Phase 1: needs Phase 1's extended function to exist before calling it.
- Work:
  - Call `headlessBootstrap(cwd, pkgRoot)` directly from `init`'s command flow — after the
    existing global-install link (`runPrepare()` when missing) and `auditStaleDefinitions()`
    call, before staging `.agentsmyth/` for the agent. No new stub-writing logic: this phase is
    pure wiring, reusing Phase 1's already-tested function.
  - Confirm the existing "never overwrite" per-file discipline inside `headlessBootstrap()`
    correctly extends to this new call path with no additional code — it already is per-file
    (`if (existsSync(dest)) continue;`), so calling it from a second entry point changes
    nothing about that guarantee.
  - Update `init`'s closing console output (currently "Next step: open your AI agent and say:
    'run the agentsmyth setup'... The agent will inspect this repo, interview you...") to
    reflect that config stubs and `pending-setup.yaml` already exist — the agent now resolves
    a known list, it does not interview from a blank slate. (Small, in-scope text change;
    R4's larger doc sweep is separate and covers `README.md`/other docs, not this CLI output
    string.)
- **Exit gate:** running `agentsmyth init` in a fresh scratch repo produces populated config
  stubs, `pending-setup.yaml`, the 7 artifact phase directories, and `workflow/learnings/` —
  all without any agent involvement — verified by direct file listing; re-running `init` in a
  repo where the agent already filled in real (non-placeholder) config values leaves those
  values untouched.

### Phase 3 - Deterministic Cursor / non-macOS-Copilot adapter placement

- **Manifest IDs:** R5
- Touches: `bin/agentsmyth.mjs` (new function, called from `init`'s command flow after Phase 2's
  bootstrap call)
- Why after Phase 2: reads `repo-profile.yaml`/`verification.yaml`/`domain.yaml` values that
  only exist in the repo once Phase 2's bootstrap call has run.
- Work:
  - New function reusing the exact 8-token map from `setup/references/token-map.md` and the
    existing `<!-- TODO: see pending-setup.yaml -->` fallback rule (already shipped, used by
    SKILL.md Step 5a.1 — not new policy, a new deterministic implementation of existing policy).
  - Render `DEFAULT_BRANCH` (from `repository.default_branch`, just written by Phase 2's
    bootstrap call), `BRANCH_POLICY` (from `branch_policy.require_non_default_branch_for_changes`),
    `PROTECTED_PATHS` (from `paths.protected[]`), and `VERIFICATION_CMDS` (from `commands[]`,
    rendering "(none defined)" when empty per the existing array-token rule) from real,
    just-written config values. `REPO_NAME`/`REPO_PURPOSE`/`DOMAIN_NAME` render the TODO
    fallback, since `domain.yaml`'s `name`/`summary` remain `<PLACEHOLDER>` at this point.
  - Place `.cursor/rules/agentsmyth.mdc` unconditionally (create `.cursor/rules/` if missing);
    place `.github/copilot-instructions.md` only when `os.platform() !== 'darwin'` (create
    `.github/` if missing). Both writes skip entirely — no append, no overwrite — if the target
    path already exists. This is deliberately narrower than SKILL.md Step 5a.1's existing
    append-on-collision rule for the same paths — per the user's explicit "skip if file already
    exists" instruction for this specific new, non-interview-driven path.
- **Exit gate:** a fresh `init` run on a non-macOS platform (platform check exercised via a test
  double, not requiring an actual non-macOS machine) writes both adapter files with
  `DEFAULT_BRANCH`/`BRANCH_POLICY`/`PROTECTED_PATHS`/`VERIFICATION_CMDS` rendered to real values
  and `REPO_NAME`/`REPO_PURPOSE`/`DOMAIN_NAME` rendered to the TODO fallback; on macOS, only
  `.cursor/rules/agentsmyth.mdc` is written; re-running `init` when either file already exists
  writes nothing to that path (content unchanged, verified via diff); SKILL.md's Step 5a.1
  table and its global-gate marker-check logic are unmodified by this phase — R5 supplements
  it, Phase 4 is what touches SKILL.md.

### Phase 4 - Rewrite SKILL.md's Phase 2 into a Pending Setup Resolution pass

- **Manifest IDs:** R3
- Touches: `src/setup/SKILL.md`
- Why after Phase 3: the rewritten prose must accurately describe what `init` now does
  (Phases 1–3), including the fact that a Cursor/non-macOS-Copilot adapter may already exist
  and need re-rendering, not aspirational behavior written ahead of the code.
- Work:
  - Replace Phase 2 ("Interview") with a Pending Setup Resolution pass mirroring `router.md`'s
    documented 7 steps exactly: load `pending-setup.yaml`, filter `status: open` items,
    inspect-based resolution first (`package.json`, `.github/workflows/`, `Makefile`,
    `README.md`), then a single batched question block for anything still open, update
    `pending-setup.yaml` per resolved item, never surface `waived` items, proceed without
    hard-stopping on anything still open after both steps.
  - **User-confirmed constraint, carried in verbatim**: the resolution pass retains sole
    authority over any judgment-based or ambiguous item. Nothing in this rewrite may let `init`'s
    mechanical output (Phases 1–3) silently finalize a value that required inspection judgment
    or a real choice — only genuinely deterministic values (git-inferred branch, R5's
    `os.platform()` check) are ever finalized outside this pass.
  - Adjust Phase 1 (Inspect): note that config stubs, `pending-setup.yaml`, artifact/learnings
    directories, and (conditionally) a Cursor/non-macOS-Copilot adapter already exist by the
    time this skill starts — inspection confirms and orients around existing state, it does not
    discover a blank slate.
  - Adjust Phase 3 (Write Configs): fill remaining `<USER-TODO>` fields in the already-existing
    stub files (not write them from scratch); mark corresponding `pending-setup.yaml` items
    `status: resolved`, `resolved_by: user` or `inspect` per `router.md`'s convention.
  - Add an explicit new step: once real config values are known, re-render and overwrite in
    place the `init`-placed Cursor/non-macOS-Copilot adapter file if it still contains any TODO
    fallback markers — stated explicitly as a safe overwrite (the file's prior content was
    deterministically generated by `init`, never user-authored), scoped only to that one file,
    not a license to overwrite any other adapter path Step 5a.1 already governs.
- **Exit gate:** SKILL.md's Phase 1/2/3 prose no longer describes discovering a blank-slate repo
  or conducting a from-scratch topic-ordered interview; the resolution-pass steps are checked
  side-by-side against `router.md`'s 7 numbered steps and match; the adapter re-render step is
  present, scoped only to the `init`-placed file, and does not alter Step 5a.1's own table or
  marker-check logic for the other four tools.

### Phase 5 - Doc sweep and full regression

- **Manifest IDs:** R4, RI1, RI2
- Touches: `README.md`, `docs/knowledge-map/repo-mental-map.md` (added retroactively 2026-07-27:
  the original free-text "any other doc file the grep sweep in Work below surfaces" was a
  deliberate no-enumeration-in-advance disclaimer, but `check-scope-fence.mjs` only recognizes
  a backtick-quoted path, not narrative prose, so the file the sweep actually found needs its
  own explicit token; found while fixing OI-37's scope-fence boundary bug, which had been
  separately masking the gap); any other doc file the grep sweep in Work below surfaces
- Why last: a doc sweep is only accurate once Phases 1–4's behavior is final; full regression
  only means something once every code phase has landed.
- Work:
  - Update `README.md`'s "What `init` does" / "Running setup" sections (lines 100–118) to
    describe the corrected two-step model: config stubs, `pending-setup.yaml`, artifact/
    learnings directories, and (conditionally) a Cursor/non-macOS-Copilot adapter already exist
    after `init`; the agent's `setup` run is a bounded resolution pass, not a from-scratch
    interview.
  - Run `grep -rln "interviews you\|5-phase\|from scratch" --include="*.md" .` (excluding
    `workflow/artifacts/` — those are point-in-time historical records, not living docs) and
    update any live doc file found describing the old flow. Report the exact grep result as
    evidence (files found and fixed, or a clean "no hits beyond README" result) — not asserted
    without the command's actual output.
  - `git diff package.json` — confirm no dependency change (RI1).
  - Run `npm run validate`, `npm run violations:test`, `npm run conformance:test`, and the 4
    CLI-specific suites (`setup-checks:test`, `setup-refs:test`, `root-resolution:test`,
    `init-prepare-interop:test`) — all touched by Phases 1–3's changes to `bin/agentsmyth.mjs`
    and Phase 4's changes to `src/setup/SKILL.md` (RI2).
- **Exit gate:** README accurately reflects Phases 1–4's shipped behavior; grep sweep result
  cited with actual command output; `git diff package.json` shows no dependency change; all 6
  verification commands pass with zero regression, current-turn output cited.

## Dependency Order

Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5. Strictly linear: each phase either extends
code the next phase calls, or (Phase 4/5) documents/verifies behavior that must already be real.
No phase can run out of order without invalidating its own exit gate.

## Branch Strategy

Continue on `feat/wp-r9b-scaffold-init-resolution`, based directly on `origin/main` (confirmed
byte-identical before this Plan started — PR #38 and #39 both merged). `repo-profile.yaml`'s
`branch_policy.require_non_default_branch_for_changes: true` — this satisfies that policy. PR
opened against `main` directly once shipped (no stacked-branch concern, unlike the R9a/R9c
chains this session).

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner | Manifest IDs |
|---|---|---|---|---|---|
| Extending `headlessBootstrap()` (Phase 1) subtly changes `check`'s existing, already-shipped bootstrap output | low | medium — would regress a shipped, tested code path | Phase 1's exit gate explicitly requires byte-identical config-stub/`pending-setup.yaml` output before/after, not just "still works" | Build | R1, R2 |
| No template previously existed for `workflow/learnings/` content (a gap the brief's A2 assumption didn't anticipate) — risk of inventing repo-specific-sounding boilerplate | low | low | Lifted verbatim from this repo's own confirmed-generic `README.md`/`curated.md`, not authored fresh | Build | R2 |
| R5's platform-conditional Copilot placement (`os.platform() !== 'darwin'`) can't be exercised on a real non-macOS machine in this session's environment | medium | low | Exit gate uses a test double / mocked platform check rather than claiming a real cross-platform run; documented as a Skipped Check at Test if still unresolved by then | Test | R5 |
| SKILL.md rewrite (Phase 4) could accidentally let `init`'s mechanical output be treated as authoritative for a judgment-based field, contradicting the user's explicit "final call is from interview setup only" | low | high — would silently violate a direct user instruction | Constraint carried verbatim into Phase 4's Work; Review must specifically check this against SKILL.md's final wording, not just skim for structural correctness | Review | R3 |
| Doc sweep (Phase 5) misses a stale-flow description outside `README.md`/`.md` files (e.g. a code comment, or `docs/knowledge-map/repo-mental-map.md`) | low | low | Grep pattern is broad (`--include="*.md" .`, repo-wide); Build should also directly check `docs/knowledge-map/repo-mental-map.md` given CLAUDE.md's own reference to it as a living doc | Build | R4 |

## Verification Plan

| Manifest ID | Evidence | Owner phase | Notes |
|---|---|---|---|
| R1 | command — scratch-repo `check` run, before/after diff | Phase 1 | Byte-identical bootstrap output |
| R2 | command — scratch-repo `init` run, direct file listing | Phase 2 | Config stubs, `pending-setup.yaml`, 7 artifact dirs, `workflow/learnings/` all present |
| R3 | manual — side-by-side check of SKILL.md's rewritten steps against `router.md`'s 7 steps | Phase 4 | No fully-executable code path (agent-executed prose) |
| R4 | command — grep sweep result cited + manual README review | Phase 5 | |
| R5 | command — scratch-repo `init` run with platform test double, content diff of rendered adapter files | Phase 3 | 5-of-8-tokens-real / 3-of-8-TODO split verified explicitly, not assumed |
| RI1 | command — `git diff package.json` | Phase 5 | |
| RI2 | command — `npm run validate`, `violations:test`, `conformance:test`, 4 CLI suites | Phase 5 | |

## Architecture Notes

- role: Principal Engineer
- decision: Kept `headlessBootstrap()` as the single shared implementation rather than forking
  a separate `init`-specific stub-writer — the brief's R1 already pointed this direction, and
  reading the actual function confirmed it needs no restructuring, only extension (Phase 1) and
  a second call site (Phase 2).
- decision: Scoped R5's token rendering precisely against the real stub template contents
  (5 of 8 tokens resolvable at `init` time, not "mostly TODO" as the brief's Risk section
  assumed) — this Plan's own grounding pass found the more accurate picture; corrected here
  rather than carried forward as an unexamined assumption into Build.
- constraint: The user's own words on R3 — "final call is from interview setup only" — are
  carried into Phase 4's Work verbatim, not paraphrased or softened, and named as a
  Risk-Register item Review must specifically check.
- tradeoff: Considered generating the Cursor/Copilot adapter's TODO-heavy content lazily (only
  when the resolution pass runs) instead of writing a partially-TODO file at `init` time —
  rejected, since the brief's R5 (and the user's own answer) explicitly calls for `init` to
  place the file mechanically now, with re-rendering as a separate, later Phase 4 step; a
  lazily-generated file would not satisfy R5's "init places it" requirement.
- downstream: Phase 3's new token-substitution function is a second, real precedent (after
  R9c's `src/cli/` → `bin/` bundling pattern) for moving previously agent-only prose logic into
  deterministic CLI code — future work packages touching adapter rendering should reuse this
  function rather than re-deriving token substitution from `token-map.md` again.

## Open Questions

None. All Q/A items from the brief are resolved; the user's Phase-4 constraint is captured
verbatim in Work and the Risk Register.

## Checkpoint Approval

- Checkpoint: plan-review
- Status: approved
- User's own words (verbatim, this turn, 2026-07-27): "Plan is approved"

Backfilled 2026-07-27: this section did not exist as a formal requirement when this plan was
originally approved (this chain shipped via PR #40 before `wp-r12-local-install-fixes-v1`'s R5
added the `check-lifecycle.mjs` checkpoint gate). No contemporaneous verbatim quote for this
specific plan's own approval was found recorded elsewhere in this file. The user explicitly
authorized this backfilled approval text this turn, after being told plainly that no such
record exists, rather than have it fabricated.

## Exit Gate

- [x] Every active R and RI mapped to a phase.
- [x] Every phase has a binary exit gate.
- [x] Verification plan covers every R and RI.
- [x] User approved or waiver recorded — brief already carries the user's approval; this plan
      is presented for a final go-ahead before Build starts.

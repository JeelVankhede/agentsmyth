---
slug: init-prepare-interop
version: 1
artifact: plan
status: draft
created: 2026-07-17
updated: 2026-07-17
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, RI1, RI2, RI3, RI4, RI5]
upstream:
  - workflow/artifacts/briefs/init-prepare-interop-v1.md
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: plan-review
---

# WP-R7 — System-Install ↔ Per-Repo Init Interoperability - Plan

## Summary

Replace `agentsmyth init --system` with a standalone `agentsmyth prepare` command (removed
outright, no deprecated alias). `agentsmyth init` (bare) then always auto-runs `prepare` when
no global install exists, links the repo to it via `definitions_root`, and surfaces any
prepare failure as a clear error instead of silently copying definitions locally or
continuing partway. `headlessBootstrap()` gets the same treatment. A new migration path
audits a pre-existing local definitions tree, prompts the user with the exact paths, and
deletes only on confirmation. Version-skew stays a plain warning. The definitions/data-split
invariant gets written into this repo's own docs, WP-R2's RI3 gets annotated superseded (not
deleted), and — once everything above is built and verified — Ship updates the two source
Notion pages directly, per the user's explicit authorization in this conversation.

## Inputs

- Brief: `workflow/artifacts/briefs/init-prepare-interop-v1.md` (`orchestration.status:
  ready-for-next-phase`, `user_checkpoint: approved`).
- Manifest IDs: R1–R7, RI1–RI5.
- No active blockers; brief's Q1 was resolved directly by the user, folded into R2's
  acceptance criteria (error-surfacing, no opt-out).

## Requirement Coverage

| Manifest ID | Covered by phases | Notes |
|---|---|---|
| R1 | Phase 1 | New `prepare` command; `--system` branch deleted, not aliased |
| R2 | Phase 2 | `init` auto-runs `prepare`, writes `definitions_root`, surfaces failures |
| R3 | Phase 4 | `headlessBootstrap()` gets the same link + error-surfacing treatment |
| R4 | Phase 5 | Skew check confirmed unchanged; resolution path documented |
| R5 | Phase 6 | Local invariant doc + WP-R2 artifact-trail annotation |
| R6 | Phase 8 (Ship, not a Build phase) | Direct Notion updates once R1–R7 are verified |
| R7 | Phase 3 | Migration audit/prompt/delete-on-confirmation |
| RI1 | Phase 7 + Ship | `npm run build && validate && violations:test` pass |
| RI2 | Phase 1, Phase 5 | Stale `--system` message text updated; adapters already clean |
| RI3 | Phase 1 (structural — no dependency added) | Verified at Review |
| RI4 | Phase 1 (structural — no schema touched) | Verified at Review |
| RI5 | Phase 3 | Same coverage as R7 — same mechanism resolves both |

## Repo Impact Map

| File | Change type | Manifest IDs | Notes |
|---|---|---|---|
| `bin/agentsmyth.mjs` | runtime | R1, R2, R3, R7, RI2 | Extract global-install logic into a `prepare` command handler; delete the `isSystem` branch entirely (no alias); bare `init` gains auto-run-`prepare`-then-link with error surfacing; `headlessBootstrap()` gains the same; new migration audit/prompt/delete logic; skew-warning text (`bin/agentsmyth.mjs:93`) and `help` output updated to mention `prepare` instead of `--system` |
| `src/setup/SKILL.md` | docs/skill | R2 | Phase 4's expansion step gains a "skip expanding definitions when `definitions_root` is already set" branch, mirroring the existing `workflow/config/` carve-out at line 200 |
| `src/workflow/validators/lib.mjs` | runtime | RI2 | Line 81's RI1 guard message (`Run "agentsmyth init --system"...`) updated to reference `prepare` |
| `src/adapters/*/global-gate.md` | docs | RI2 | Inspected — none of the 5 adapter gate files mention `--system` today; no change expected. Review re-confirms this after Build in case Build's diff introduces new references |
| `docs/knowledge-map/repo-mental-map.md` | docs | R5, RI2 | Two existing `--system` mentions (lines ~52–53) updated to `prepare`; new invariant line added (definitions system-side, config+artifacts repo-local) |
| `CLAUDE.md` | docs | R5, RI2 | Three existing `--system` mentions updated to `prepare`; invariant cross-referenced if not already stated in repo-mental-map.md |
| `workflow/artifacts/briefs/system-level-install-v1.md` | docs (lifecycle artifact) | R5 | RI3 entry (lines ~180–182) annotated `superseded-by-WP-R7-T7.2`, wording preserved not deleted |
| `workflow/artifacts/plans/system-level-install-v1.md` | docs (lifecycle artifact) | R5 | RI3 references (Phase 2 and Phase 4 sections) annotated the same way |
| `test/run-init-prepare-interop-tests.mjs` | tests | R2, R3, R4, R7 (verification infra) | New subprocess-based test harness, following `test/run-root-resolution-drift-tests.mjs`'s pattern: spawns `bin/agentsmyth.mjs` with an overridden `HOME` env var to sandbox `~/.agentsmyth`, asserts on `definitions_root` writes, zero-local-copy, prepare-failure error surfacing, and the migration prompt (piped stdin for accept/decline) |
| `package.json` | tooling | verification infra | Add `"init-prepare-interop:test": "node test/run-init-prepare-interop-tests.mjs"` script, matching the existing `*:test` script convention |
| Notion page 02 (roadmap RI3 annotation) | source-of-truth (external) | R6 | Ship-owned direct edit, not a Build touch — see Source-of-Truth Strategy |
| Notion page 10 (Sandbox Testing & Verification Plan) | source-of-truth (external) | R6 | Ship-owned direct edit, not a Build touch — see Source-of-Truth Strategy |

No public contracts are declared in `repo-profile.yaml` (`paths.public_contracts: []`), but
`bin/agentsmyth.mjs`'s command surface is treated as a de facto public contract for this plan
(consistent with Think's `architecture-decision-advisor` judgment) — `interface-contract-designer`
and `system-design-advisor`'s triggers both evaluate true here (`new_surface`, `touches_contract`
by agent judgment, `complexity_score` well above 60 from files-touched + RI-count + new-surface
weights). Neither surfaced a stop condition: this repo is a single package with no
service/module boundary to reverse, and the one breaking change (`--system` removal) was
already explicitly accepted by the user with no back-compat requirement — recorded here rather
than re-litigated.

## Source-of-Truth Strategy

- Provider: Notion (no standing entry in `workflow/config/source-of-truth.yaml`'s
  `providers` — this specific update is authorized by the user's explicit request in this
  conversation, which satisfies `update_policy.require_user_request_or_config_for_external_write:
  true` for this instance only).
- Source items: the "06 — Roadmap & Work Packages" page (RI3-superseded annotation, WP-R7
  status) and the "WP-R7 — Research Spike" page's cross-referenced page 10 (Sandbox Testing &
  Verification Plan) — Current Machine State table, install command block, Scenarios A/B/E.
- Fields/sections to update: exactly the ones named in the brief's R5/R6 and the spike's
  T7.5/T7.6 acceptance criteria — no broader edit to either page.
- Owning phase: Ship, after R1–R7 are built and Test has produced verification evidence —
  not before, so the Notion pages reflect what actually shipped, not what was planned.
- Not blocked: the user has already granted access and authorization; no handoff needed.
- Ship must re-fetch current page content immediately before editing (not rely on this
  plan's snapshot) and pause to ask if the pages changed materially since this brief, per
  the brief's Risks section.

## Approach

Seven Build phases, ordered so the core link mechanism (`prepare` existing, then `init` using
it) lands before anything that depends on it (migration handling, `headlessBootstrap`, tests).
Documentation and artifact-trail annotation come after the code is stable, since they describe
the shipped behavior rather than shape it. The new test harness comes after the code phases it
exercises, but before Review, so Review has something concrete to check against. Notion updates
are explicitly Ship-owned and excluded from Build per `rules.md` ("Source updates belong to
Ship unless configured otherwise") and the brief's Non-Goals.

## Phases

### Phase 1 - `prepare` command; remove `--system`

- **Manifest IDs:** R1, RI2, RI3, RI4
  (RI2 only partially — the rest lands in Phase 5)
- Touches: `bin/agentsmyth.mjs`
- Work:
  - Extract the current `isSystem` branch's body (global-tree expansion, validator copy, 5
    adapters' global-gate install, Cursor paste-text) into a `prepare` command handler,
    reachable as `agentsmyth prepare`, keeping the existing `expandBundle()`/
    `installGateSection()` helpers as-is.
  - Delete the repo-level write (`writeDefinitionsRoot(cwd, ...)` call currently inside
    `isSystem`) from `prepare` — `prepare` writes nothing repo-local, per its definition in
    the brief.
  - Remove the `isSystem`/`--system` flag check entirely; `agentsmyth init --system` is no
    longer a recognized invocation (falls through to ordinary bare-`init` argument handling,
    or errors — Build's choice, since the brief treats the exact UX as an implementation
    detail, not a locked requirement).
  - Update `bin/agentsmyth.mjs:93`'s skew-warning text and the `help` command's command list
    to reference `prepare` instead of `--system`.
  - Do not add a new npm dependency; do not touch `writeDefinitionsRoot()`'s signature (it is
    reused as-is by Phase 2 and Phase 4).
- **Exit gate:** `node bin/agentsmyth.mjs prepare` (run with `HOME` pointed at a scratch
  dir) creates `<scratch-home>/.agentsmyth/workflow/` and installs the 5 adapters' gate
  files/paste-text, writes zero files under the current working directory. `node
  bin/agentsmyth.mjs init --system` no longer runs the old global-install code path (confirmed
  by reading the diff — the `isSystem` branch and its condition are gone).

### Phase 2 - `init` links to the global install, surfaces failures

- **Manifest IDs:** R2
- Touches: `bin/agentsmyth.mjs`, `src/setup/SKILL.md`
- Why after Phase 1: needs `prepare`'s handler to exist and be callable in-process.
- Work:
  - In `bin/agentsmyth.mjs`'s bare-`init` path: before copying bundles into `.agentsmyth/`,
    check whether `~/.agentsmyth/workflow/` exists; if not, invoke the Phase 1 `prepare`
    handler directly (in-process, not a subprocess) and capture any thrown error.
  - On a captured error: print a clear message naming the failure (e.g. permission denied,
    disk full, or whatever the underlying `fs` error reports) and exit non-zero — do not
    fall back to copying `workflow-bundle.md` locally, do not continue the interview.
  - On success (global install now confirmed present): call the existing
    `writeDefinitionsRoot(cwd, defsRootValue, version)` so `definitions_root` is set in this
    repo's `repo-profile.yaml` as part of the same `init` invocation, not deferred to the
    agent-driven setup skill.
  - In `src/setup/SKILL.md`'s Phase 4 (bundle expansion) instructions: add a branch mirroring
    the existing `workflow/config/` carve-out at line 200 — when
    `workflow/config/repo-profile.yaml` already has `definitions_root` set (written by the
    Phase 2 code change above), skip expanding every `<!-- FILE: -->` block whose path is
    under `skills/`, or is `router.md`, `lifecycle.md`, `rules.md`, or under `schemas/` or
    `validators/` — only `workflow/config/*` and `workflow/artifacts/**` still get created
    locally.
- **Exit gate:** `init` in a fresh scratch repo (scratch `HOME`, no prior global install)
  results in `<scratch-home>/.agentsmyth/workflow/` existing (auto-`prepare`d) and
  `<repo>/workflow/` containing only `config/*.yaml` + `artifacts/` +
  `repo-profile.yaml` with `definitions_root` set — no `skills/`, `router.md`,
  `lifecycle.md`, `schemas/`, or `validators/` under `<repo>/workflow/`. A second,
  independent scratch repo run the same way links to the same global tree without
  re-installing it. Simulating a `prepare` failure (e.g. an unwritable scratch `HOME`)
  produces a non-zero exit and a message naming the failure, with no partial
  `repo-profile.yaml` write.

### Phase 3 - Migration audit/prompt/clean

- **Manifest IDs:** R7, RI5
- Touches: `bin/agentsmyth.mjs`
- Why after Phase 2: needs the link-decision point (Phase 2's "global install confirmed,
  about to write `definitions_root`") to exist as an insertion point.
- Work:
  - Before the Phase 2 link step commits, check the target repo's `workflow/` for a
    pre-existing full local definitions copy: any of `skills/`, `router.md`, `lifecycle.md`,
    `rules.md`, `schemas/`, `validators/` present at the workflow root.
  - If found: list the exact paths that would be deleted, prompt for confirmation using a
    Node core module (`node:readline/promises` — no new dependency, per RI3).
  - In a non-TTY context (`process.stdin.isTTY` false, e.g. CI): do not hang waiting for
    input — fail closed, surfacing the pending-confirmation state as a blocking error with
    the exact paths listed, same error-surfacing principle as Phase 2's prepare-failure
    handling.
  - On explicit "yes": delete exactly the audited paths, nothing else, then continue linking
    (Phase 2's `definitions_root` write).
  - On explicit "no" or non-interactive decline: leave the local files in place, still
    complete the link (`definitions_root` is written regardless — the stale local tree is a
    known, visible risk, not a blocker to linking).
- **Exit gate:** a scratch repo pre-seeded with a full local `workflow/skills/` tree plus a
  resolvable global install, run through `init` with piped stdin `"n\n"`, leaves every
  seeded path in place and still completes the link (`definitions_root` written). The same
  fixture run with piped stdin `"y\n"` deletes exactly the seeded paths and no others. A
  non-TTY run with no piped input produces a blocking error listing the paths, not a hang.

### Phase 4 - `headlessBootstrap()` gets the same treatment

- **Manifest IDs:** R3
- Touches: `bin/agentsmyth.mjs`
- Why after Phase 1 (can run in parallel with Phase 2/3, sequenced here for review clarity):
  reuses the Phase 1 `prepare` handler.
- Work:
  - In `headlessBootstrap()`: before or alongside writing stub configs, ensure a global
    install exists — auto-run `prepare` if `~/.agentsmyth/workflow/` is absent, with the same
    captured-error-surfaced-not-swallowed behavior as Phase 2.
  - Add `definitions_root: <resolved global path>` to the stub `repo-profile.yaml` content
    this function already writes (alongside the existing `agentsmyth_version` stamp).
- **Exit gate:** `agentsmyth check` in a repo with no `workflow/config/` (scratch `HOME`, no
  prior global install) produces stub configs whose `repo-profile.yaml` has both
  `agentsmyth_version` and `definitions_root` set, and a subsequent
  `check-lifecycle.mjs` invocation against that repo resolves skills/schemas from the
  global tree without a missing-file error.

### Phase 5 - Version-skew confirmation + message-text cleanup

- **Manifest IDs:** R4, RI2
  (RI2's remainder, completing Phase 1's partial coverage)
- Touches: `bin/agentsmyth.mjs` (inspection only, per A3 no code change expected),
  `docs/knowledge-map/repo-mental-map.md` and/or `CLAUDE.md`,
  `src/workflow/validators/lib.mjs`, `scripts/render-adapters.mjs` (amended during Build,
  2026-07-17: a repo-wide `--system` grep swept up two stale references this list hadn't
  enumerated at Plan time — `lib.mjs:81`'s RI1 guard message and one `render-adapters.mjs`
  comment — same RI2 message-cleanup intent, not a scope expansion; see the task artifact's
  Phase 5 Implementation Log for the full grep evidence),
  `workflow/artifacts/plans/init-prepare-interop-v1.md` (added retroactively 2026-07-27: this
  file's own task artifact already documented this exact self-amendment as "for traceability,
  not implementation," but the path was never added here — found while fixing OI-37's
  scope-fence boundary bug, which had been masking the gap)
- Work:
  - Re-read the skew-check block (post-Phase-1 line numbers) and confirm it still fires
    correctly comparing `repo-profile.yaml`'s stamped `agentsmyth_version` against the
    running CLI's `package.json` version — no behavior change expected (A3).
  - Document the resolution path (plain warning, re-run `prepare` to update) in
    `docs/knowledge-map/repo-mental-map.md` or `CLAUDE.md`, next to wherever the R5
    invariant note lands (Phase 6) so both live in one place.
  - Grep `src/adapters/*/global-gate.md` for any `--system` text Build may have
    inadvertently introduced; expected result is still zero matches (confirmed absent at
    Plan time).
- **Exit gate:** the skew-check block, read in full, still compares stamped-vs-running
  version with a `console.warn` (no new enforcement code added). The documented resolution
  path exists in at least one of the two named doc files. `grep -r "\-\-system"
  src/adapters/*/global-gate.md` returns no matches.

### Phase 6 - Local invariant doc + WP-R2 artifact-trail annotation

- **Manifest IDs:** R5
- Touches: `docs/knowledge-map/repo-mental-map.md` and/or `CLAUDE.md`,
  `workflow/artifacts/briefs/system-level-install-v1.md`,
  `workflow/artifacts/plans/system-level-install-v1.md`
- Why after Phase 1–5: describes final shipped behavior, not a design input to it.
- Work:
  - Add the definitions/data-split invariant (skill definitions may live system-side and
    are read at runtime; repo-specific config + artifacts are always repo-local) as a
    clearly labeled statement in `docs/knowledge-map/repo-mental-map.md` and/or `CLAUDE.md`.
  - In `workflow/artifacts/briefs/system-level-install-v1.md`, annotate the RI3 entry
    (current wording at lines ~180–182) with a `superseded-by-WP-R7-T7.2` note — append,
    do not delete or rewrite the original wording.
  - Apply the same annotation to RI3's mentions in
    `workflow/artifacts/plans/system-level-install-v1.md` (Phase 2 and Phase 4 sections).
- **Exit gate:** both artifact files contain a `superseded-by-WP-R7-T7.2` annotation next to
  every RI3 mention, with the original wording still present verbatim. The invariant
  statement exists in at least one of the two named doc files, stated as a standalone,
  labeled sentence (not buried in unrelated prose).

### Phase 7 - New test harness

- **Manifest IDs:** RI1
  (infra supporting R2/R3/R4/R7 verification — R2/R3/R4/R7 themselves are covered by their
  own owning phases above; RI1 is the only ID this phase adds new coverage for)
- Touches: `test/run-init-prepare-interop-tests.mjs` (new), `package.json`
- Why last among Build phases: exercises the behavior built in Phases 1–4; writing it earlier
  would mean testing against code that doesn't exist yet.
- Work:
  - Follow `test/run-root-resolution-drift-tests.mjs`'s structure: spawn
    `bin/agentsmyth.mjs` as a real subprocess (not an import — same reasoning as the
    existing file, since `init`/`prepare`/`check` all have side-effecting top-level logic).
  - Set `HOME` explicitly in every spawned subprocess's `env` to a per-test scratch
    directory, so `os.homedir()`-based `~/.agentsmyth` writes never touch the real
    developer machine's home directory.
  - Cover: `prepare` populates the scratch global tree and nothing repo-local (R1); bare
    `init` links without local copy, and surfaces a simulated `prepare` failure clearly
    (R2); `headlessBootstrap` writes `definitions_root` (R3); the migration prompt's
    accept/decline paths via piped stdin, and the non-TTY fail-closed path (R7).
  - Add `"init-prepare-interop:test": "node test/run-init-prepare-interop-tests.mjs"` to
    `package.json`'s `scripts`, matching the existing `*:test` naming convention.
- **Exit gate:** `npm run init-prepare-interop:test` exits zero and its own internal
  assertions (mirroring the `check()` helper pattern in the existing root-resolution test)
  report every named scenario as passing. No test in the file writes to the real,
  un-overridden `$HOME`.

### Phase 8 - Ship handoff (not a Build phase)

- **Manifest IDs:** R6
- Touches: none locally — the two external Notion pages (roadmap page 02, page 10)
- Why listed here despite being Ship-owned, not Build: R6 is an active brief requirement and
  the output schema requires every active R/RI to appear in `## Phases`; per `rules.md`
  ("Source updates belong to Ship unless configured otherwise") and the brief's Non-Goals,
  this phase's actual work happens in the Ship lifecycle phase, not during Build — Build
  performs no file changes for R6. This block exists purely so R6 has an explicit,
  non-orphaned home in the plan's phase map, consistent with how the rest of the phases are
  tracked.
- Work: none during Build. At Ship, once R1–R5 and R7 are verified: fetch current content of
  both Notion pages, update page 02's RI3-superseded annotation and page 10's Current Machine
  State table / install command block / Scenarios A/B/E, per the brief's R6 acceptance
  criteria and this conversation's explicit authorization.
- **Exit gate:** Ship's ship artifact cites the resulting Notion page URLs and a summary of
  what was edited on each, as evidence of the direct update (not a copy-ready handoff block).

### Phase 9 - Review fix: adapter gates resolve `definitions_root` when unlinked locally

- **Manifest IDs:** R2, R5
- Touches: `src/adapters/claude/CLAUDE.md`, `src/adapters/codex/AGENTS.md`,
  `src/adapters/copilot/copilot-instructions.md`, `src/adapters/cursor/rules/index.mdc`,
  `src/adapters/windsurf/.windsurfrules`, `src/assets/AGENTS.md`, `bin/agentsmyth.mjs`
- Why added post-Review: Review (2026-07-17) found P1-01 — none of the 5 per-repo adapter
  gate templates or the root `AGENTS.md` template know about `definitions_root`; they
  hardcode `workflow/router.md` as a bare repo-relative path, which Phase 2's Step 5b change
  means never gets created locally once a repo is linked. This phase fixes the actual
  defect: R2/R5's acceptance criteria were never about the CLI mechanism in isolation, they
  were about the repo actually working once linked — this closes that gap rather than
  revising the requirement.
- Work:
  - Add a runtime-conditional fallback to each of the 6 gate templates: "read
    `workflow/router.md`; if absent, read `definitions_root` from
    `workflow/config/repo-profile.yaml` and load `<definitions_root>/router.md` instead,"
    with the same treatment for `agent-behavior.yaml` (and, in `src/assets/AGENTS.md`,
    `lifecycle.md` and the `skills/` tree, since that template references them too).
    Chosen over a build-time `{{TOKEN}}` substitution (the alternative Review's finding
    named) because the conditional text is identical for every repo regardless of link
    state — no per-repo rendering is needed, so no `token-map.md`/`config-map.md` change is
    required either.
  - Remove `runPrepare()`'s unused `{ globalDir, version }` return value and its now-stale
    comment (P3-01) — neither call site (`init`'s auto-link block, `headlessBootstrap()`)
    can rely on it exclusively, since the "global install already present" branch always
    needs its own independent computation regardless of whether `runPrepare()` ran.
- **Exit gate:** all 6 templates contain `definitions_root` fallback instructions (`grep -c
  definitions_root` on each returns ≥ 2); `runPrepare()` no longer has a `return` statement;
  `npm run build && npm run validate && npm run violations:test` plus the full existing test
  matrix and the new `init-prepare-interop:test` suite all still pass.

## Dependency Order

Phase 1 → Phase 2 (needs `prepare` callable) → Phase 3 (needs Phase 2's link-decision
insertion point) → Phase 4 (needs Phase 1's `prepare` handler; independently reviewable from
Phase 2/3, ordered after for reviewer continuity) → Phase 5 (inspection + doc, needs Phases
1–4's final line numbers/behavior settled) → Phase 6 (doc/artifact annotation, describes the
finished behavior) → Phase 7 (tests exercise Phases 1–4, written last among Build phases).
Phase 8 (R6, Ship's direct Notion update) happens after Test, outside Build's actual
execution order — listed last in `## Phases` purely so R6 has an explicit phase-map entry;
it depends on every other phase's work being verified first.

## Branch Strategy

- Base: `main`.
- Working branch: `feat/init-prepare-interop` (renamed from the Think-time
  `think/init-prepare-interop` per user request during Plan review, 2026-07-17; same branch,
  same history, off `main`, containing the brief and this plan). Continue Build on this
  branch — `repo-profile.yaml`'s `branch_name_pattern: <slug-or-phase>` is satisfied by
  `<phase>/<slug>` (`feat` read as phase-equivalent), and there is no unrelated work on it to
  conflict with.
- Commits: one commit per Build phase is preferred for reviewability, but not mandatory;
  Review will see the full diff regardless.
- No commits to `main` directly — `repo-profile.yaml`'s
  `branch_policy.require_non_default_branch_for_changes: true` and
  `default_branch_commit_requires_user_approval: true` both apply.
- PR: not required by default (`release.yaml`'s `gates.pull_request.required: false`,
  `create_policy: user_requested_or_configured`) — create one only if the user asks.
- Dirty state: working tree was clean at Think; record any drift before Build starts.

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner | Manifest IDs |
|---|---|---|---|---|---|
| `bin/agentsmyth.mjs` and `src/setup/SKILL.md` drift out of sync (one updated, not the other) | medium | high — repo ends up linked with no definitions, or vice versa | Phase 2's exit gate requires both files' diffs together; Phase 7's harness exercises the full `init` flow end-to-end, not just unit-level | Build | R2 |
| New interactive prompt (R7) hangs in a non-TTY/CI context | medium | medium | Phase 3 explicitly requires `process.stdin.isTTY`-gated fail-closed behavior | Build | R7 |
| Test harness's `HOME` override isn't threaded through every spawned subprocess, polluting the real developer's `~/.agentsmyth` | low | high | Phase 7 requires explicit per-test `env.HOME`; Review re-checks the test file's `spawnSync`/`spawn` calls for this before sign-off | Build, Review | RI1 |
| Direct Notion writes (R6) at Ship overwrite content the user edited independently since this plan | low | medium | Ship re-fetches current page content immediately before editing, pauses to ask if pages changed materially | Ship | R6 |
| `--system` removal (R1) breaks an existing local install that already ran it | low | low | User already accepted no-back-compat; Ship's summary calls it out as a breaking CLI change | Ship | R1 |
| No prior automated coverage for CLI install/link behavior — Phase 7 is net-new infrastructure, early gaps possible | medium | medium | Test phase manually exercises the golden path (`prepare` then `init` in a second scratch repo) once beyond the automated suite, recorded as manual QA evidence | Test | R2, R3, R7 |
| Scope creep into WP-R8 (per-repo behavior tuning) via `agent-behavior.yaml` | low | medium | Explicitly rejected per the brief's Non-Goals; `agent-behavior.yaml` stays global-only, untouched by this plan | Build | — |

No risk here lacks a mitigation; none require a waiver.

## Verification Plan

| Manifest ID | Evidence | Owner phase | Notes |
|---|---|---|---|
| R1 | Command: `node bin/agentsmyth.mjs prepare` (scratch `HOME`) → assert global tree populated, zero repo-local files. Command: `node bin/agentsmyth.mjs init --system` → assert it no longer runs the old global-install path | Test | Via Phase 7 harness |
| R2 | Command: scratch repo + scratch `HOME`, no global install → `init` → assert `definitions_root` set, no local skills/router/lifecycle/schemas/validators. Command: simulated `prepare` failure → assert non-zero exit + clear message, no partial state | Test | Via Phase 7 harness |
| R3 | Command: scratch repo, no `repo-profile.yaml` → `agentsmyth check` → assert stub configs + `definitions_root` set; subsequent `check-lifecycle.mjs` resolves cleanly | Test | Via Phase 7 harness |
| R4 | Manual inspection: read the skew-check block, confirm it fires on mismatched `agentsmyth_version`; confirm the resolution path is documented | Test | No command output needed — code inspection, per A3 |
| R5 | Manual inspection: grep both WP-R2 artifact files for the `superseded-by-WP-R7-T7.2` annotation; grep the doc file(s) for the invariant statement | Test | |
| R6 | Source: Ship performs the Notion edits and cites the resulting page URLs / edit confirmation | Ship | Not verifiable before Ship — behavior must exist first |
| R7 | Command: seeded-fixture scratch repo, piped `"n\n"` → assert files remain, link still completes. Same fixture, piped `"y\n"` → assert exact deletion. Non-TTY, no stdin → assert blocking error, no hang | Test | Via Phase 7 harness |
| RI1 | Command: `npm run build && npm run validate && npm run violations:test`, current-turn output cited | Ship | Final gate, matches WP-R2 precedent |
| RI2 | Manual inspection: grep `src/adapters/*/global-gate.md` and `src/workflow/validators/lib.mjs` for stale `--system`-only wording — expect zero matches | Test | |
| RI3 | Manual inspection: `git diff` on `package.json` `dependencies` is empty | Review | |
| RI4 | Manual inspection: `git diff` on `src/workflow/schemas/repo-profile.schema.yaml` is empty | Review | |
| RI5 | Same evidence as R7 — one mechanism resolves both | Test | |

## Architecture Notes

- role: Principal Engineer
- decision: Split the link decision across two files by responsibility — deterministic
  install/error-handling/`definitions_root`-write logic in `bin/agentsmyth.mjs` (Node code,
  no judgment calls), and the "skip local expansion when linked" carve-out in
  `src/setup/SKILL.md` (agent-executed interview step), mirroring the existing
  `workflow/config/` carve-out already present in that file at line 200.
- decision: The migration prompt (R7) uses `node:readline/promises` — a Node core module —
  to keep the zero-runtime-dependency invariant intact; no new package.
- decision: `--system`'s removal is a genuine breaking change, accepted deliberately by the
  user (no deprecation window) because the flag never shipped in a published release.
- constraint: `repo-profile.yaml`'s `paths.public_contracts: []` means no config-declared
  contract exists to mechanically trigger `interface-contract-designer`/
  `system-design-advisor` — both were still evaluated by agent judgment (per
  `skill_scoring`'s documented "no runtime to evaluate mechanically" caveat) because the CLI
  command surface and `definitions_root` write policy are de facto contracts; neither
  surfaced a stop condition (single-package repo, no reversed dependency direction, no
  undefined cross-boundary integration).
- tradeoff: Considered doing the "skip local expansion when linked" logic entirely in
  `bin/agentsmyth.mjs` (skip copying `workflow-bundle.md` into `.agentsmyth/` at all when
  linking) instead of adding a carve-out to `src/setup/SKILL.md` — rejected because the
  agent-driven setup skill is what currently performs the actual `FILE:`-marker expansion
  into `workflow/`, and `bin/agentsmyth.mjs`'s bare `init` doesn't perform that expansion
  itself (confirmed in Think's shipped-code verification); changing only the CLI side would
  leave the agent skill still trying to expand files that were never copied, an inconsistent
  half-state. The two-file split matches where each piece of logic actually lives today.
- tradeoff: Considered ordering Phase 4 (`headlessBootstrap`) immediately after Phase 1
  (parallel to Phase 2/3, since both only depend on Phase 1's `prepare` handler) — kept it
  sequential/after Phase 3 in this plan purely for reviewer continuity (one migration-audit
  code path at a time), not because of a real code dependency; Build may reorder Phase 3/4
  if that's more convenient, as long as both land before Phase 7's tests.
- assumptions: A3 (plain warning suffices for R4) verified — see Assumptions Verified below.
  No other brief assumption remains active (A1, A2, A4 were replaced by R7, R6, R1
  respectively during Think's revision).
- downstream: Review must re-confirm RI2's near-zero adapter-file impact (grep after Build's
  actual diff, not just this plan's grep) and RI3/RI4's no-new-dependency/no-schema-change
  claims. Test owns the bulk of the verification evidence (R1–R5, R7, RI2, RI5) since almost
  nothing here is verifiable before the code exists. Ship owns R6 (Notion) and the final
  RI1 gate, and must re-fetch Notion page content immediately before editing per the
  Source-of-Truth Strategy above.

### Assumptions Verified

| Brief ID | Status | Evidence |
|---|---|---|
| A3 | evidence-backed | `bin/agentsmyth.mjs:85-96` (read in full during Think and again during Plan): the version-skew check compares `repo-profile.yaml`'s stamped `agentsmyth_version` against the running CLI's `package.json` version and emits `console.warn` only — no re-link or version-pin enforcement exists today. The user additionally confirmed this directly in conversation, 2026-07-17, so this assumption is both evidence-backed and explicitly user-confirmed. |

## Open Questions

None. All decisions were resolved by the user during Think; nothing new surfaced during
Plan.

## Checkpoint Approval

- Checkpoint: plan-review
- Status: approved
- User's own words (verbatim, 2026-07-17, from this chain's own original session): "Working branch: feat/init-prepare-interop, rest of plan looks good"

Backfilled 2026-07-27: this section did not exist as a formal requirement when this plan was
originally approved. The quote above is the real, contemporaneous approval already recorded in
this plan's own Exit Gate below (not a new or retroactive approval) — moved into the structured
section the `check-lifecycle.mjs` checkpoint gate (added later, by `wp-r12-local-install-fixes-v1`'s
R5) now requires. `orchestration.user_checkpoint` corrected from the literal string `approved`
(a status, not a checkpoint name) to `plan-review`, matching this repo's actual convention.

## Exit Gate

- [x] Every active R and RI is mapped to exactly one owning phase (`requirement-phase-mapper`
      check: R1→Phase 1, R2→Phase 2, R3→Phase 4, R4→Phase 5, R5→Phase 6, R7→Phase 3,
      RI1→Phase 7, RI2→Phase 1 & 5 — explicitly cross-cutting, both phases touch distinct
      message-text locations, not a duplicate; RI3/RI4→Phase 1 structurally, verified at
      Review; RI5→Phase 3, same mechanism as R7. R6 is explicitly Ship-owned, not a Build
      phase, per the brief's Non-Goals and `rules.md`'s source-update-belongs-to-Ship rule —
      not an orphan, a deliberate phase-boundary decision).
- [x] Every phase has a binary, falsifiable exit gate (no "done"/"works" language).
- [x] Dependency order is explicit (see Dependency Order).
- [x] Every risk has a mitigation; none need a waiver.
- [x] Verification plan covers every R and RI (`coverage-tracer` ledger: all 12 IDs are
      `covered`, citing a phase or Ship).
- [x] Source-of-truth and release handling are explicit (Notion, Ship-owned, user-authorized;
      no release/CI gate configured).
- [x] Branch strategy is explicit; does not target `main`.
- [x] `plan-assumption-verifier`: A3 is evidence-backed (see Assumptions Verified); no other
      brief assumption remains to verify.
- [x] User approved the plan, 2026-07-17 ("Working branch: feat/init-prepare-interop, rest
      of plan looks good") — the one change requested (working branch renamed from
      `think/init-prepare-interop` to `feat/init-prepare-interop`) is applied above; the
      rest of the phase breakdown, file touches, and test-harness design stand as written.

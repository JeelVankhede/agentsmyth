---
slug: wp-r9c-tui-polish
version: 1
artifact: brief
status: ready-for-next-phase
created: 2026-07-19
updated: 2026-07-19
manifest_ids: [R1, R2, R3, RI1, RI2, RI3]
upstream:
  - user-request
  - notion-wp-r9c
orchestration:
  phase: think
  status: ready-for-next-phase
  next_phase: plan
  blockers: []
  user_checkpoint: approved
skill_trigger_log:
  - skill: repo-alignment-scan
    decision: ran
    reason: "task_class = Standard (new build tool, new source directory convention, one real refactored function) satisfies task_class != trivial. Re-read bin/agentsmyth.mjs's actual interactive code, package.json's current scripts/files, and src/'s existing directory layout directly this Think, rather than assuming the Notion page's draft requirements mapped cleanly onto real code."
  - skill: architecture-decision-advisor
    decision: ran
    reason: "complexity_score crosses the threshold — this introduces the repo's first bundler and a new generated-file provenance pattern (src/cli/ -> bin/prompts.mjs), which will be reused by future work (WP-R9b's later prompts, WP-R10's compiled binary, per Notion page 02 decision #12's own note that esbuild is shared infrastructure). Performed the whole-repo architecture read directly (see Architecture Notes) rather than dispatching a subagent, given full context already in hand from this session's own prior investigation of bin/agentsmyth.mjs and the build pipeline."
  - skill: constraint-conflict-scan
    decision: ran
    reason: "task_class = Standard satisfies task_class != trivial. Checked CLAUDE.md golden rule 4 (zero runtime dependency) and domain.yaml/repo-profile.yaml protected paths — no conflict; devDependency addition is explicitly the correct mechanism, already precedented by page 02 decision #12's approval."
---

# WP-R9c — Node TUI Polish (clack + esbuild) - Brief

## Source Links

- Notion: [WP-R9c — Node TUI Polish](https://app.notion.com/p/3a1972bdebbb8188b7c3ea54b401d02f) — 🟡 Ready, P2. Draft requirements T9c.1–T9c.3.
- Notion: [WP-R9 Research Spike](https://app.notion.com/p/3a0972bdebbb8160b9c2d2cacb246cae) §9 — the original `@clack/prompts`/esbuild research and decision.
- Notion: [02 — Technical Decisions](https://app.notion.com/p/384972bdebbb81d38b4dec9c4bdd67eb) decision #12 — esbuild adoption already formally logged as an invariant-adjacent decision.
- **Scoping correction, found this session by re-reading the actual current code rather than
  assuming the Notion page's framing:** WP-R9c's own notes say "sequence after R9b so the
  prompts land on the finished scaffold-only `init` flow" — implying R9b's future interview
  work would be what gets the clack treatment. The user explicitly directed skipping R9b for
  now and building R9c directly on top of R9a. Checked what's actually interactive in the CLI
  today: exactly **one** existing prompt exists — `confirmDeletion()` in `bin/agentsmyth.mjs`
  (a `[y/N]` migration-delete confirmation, using raw `node:readline/promises`, added in
  WP-R7). This brief's real, buildable-now scope is converting *that* real prompt to
  `@clack/prompts`, plus building the reusable bundling/wrapper infrastructure R9b will need
  later for its own prompts — not inventing a hypothetical prompt that doesn't exist yet.
- **Architectural finding requiring a real decision, not previously surfaced on the Notion
  page:** `bin/agentsmyth.mjs` ships as raw, unbundled hand-written source today — no build
  step touches it (`package.json`'s `"bin"` field points directly at it, and `"files"` ships
  the whole `bin/` directory verbatim). Bundling a third-party library directly into it would
  require either restructuring where its source lives, or a narrower alternative — resolved in
  Architecture Notes below.

## Problem

`bin/agentsmyth.mjs`'s one interactive prompt (`confirmDeletion()`, the migration-delete
confirmation) uses a bare `readline` `[y/N]` text line — functional but not the polished
experience the user wants for AI-agent-tooling UX going forward. There is currently no
mechanism in this repo for shipping a bundled third-party library alongside hand-written CLI
source while preserving the zero-runtime-dependency invariant — this needs to exist before
`@clack/prompts` (or any future interactive library) can be used anywhere in the CLI.

## Goals

- The existing migration-delete confirmation prompt uses `@clack/prompts` for a polished,
  styled confirmation instead of a bare `[y/N]` readline line, with identical accept/decline
  semantics.
- A reusable bundling mechanism exists (new `src/cli/` source directory, esbuild build step,
  generated `bin/` output) that `WP-R9b`'s future interactive prompts can reuse without
  redesigning the pattern.
- The existing non-TTY fail-closed behavior is preserved exactly — no regression in CI or
  scripted-install safety.
- `dependencies` in `package.json` stays empty; `@clack/prompts` and `esbuild` are
  `devDependencies` only.

## Non-Goals

- Building any NEW interactive prompt beyond converting the one that already exists — no
  speculative UX for WP-R9b's future interview flow, since that flow doesn't exist yet and
  designing for it now would be guessing at requirements Plan/Build can't verify.
- Restructuring `bin/agentsmyth.mjs` itself into bundled/generated output — the minimal,
  surgical design (Architecture Notes) keeps it as hand-written source, only the new prompts
  module is generated.
- WP-R10's compiled-binary distribution — unrelated, tracked separately, deferred to v0.2.0
  per page 02 decision #11.

## User Impact

The one existing interactive moment in `agentsmyth init` becomes a genuinely polished
experience instead of a bare text prompt — and every future interactive prompt this repo adds
(WP-R9b's interview resolution, or anything else) gets the same infrastructure for free,
without re-deciding how bundling works each time.

## Success Metrics

- `agentsmyth init`'s migration-delete confirmation renders via `@clack/prompts`'s styled
  confirm UI, not a bare `[y/N]` line.
- A non-TTY `init` run (CI, scripted install) still fails closed with the exact same behavior
  as today — no hang, no silent skip, same error message shape.
- `git diff` on `package.json`'s `dependencies` field is empty; `esbuild` and `@clack/prompts`
  appear only under `devDependencies`.
- The built, shipped `bin/` directory contains no `node_modules` reference and runs standalone.

## Requirements

- R1: The migration-delete confirmation in `bin/agentsmyth.mjs` uses `@clack/prompts` instead
  of raw `readline`, with identical accept/decline semantics.
- R2: A new `src/cli/` source directory + esbuild build step compiles a prompts module into a
  committed, dependency-free `bin/` output file — the reusable pattern future prompt work
  reuses.
- R3: The existing non-TTY fail-closed guard is preserved exactly (same check, same behavior),
  wrapping the new clack-based prompt the same way it wraps the current readline one today.

## Constraints

- `[safety-2]`/`[safety-3]` not implicated — no destructive action beyond what already exists
  (the migration-delete confirmation already guards a real deletion; this brief changes only
  its presentation layer, not its safety logic).
- **Hard constraint**: no internal work-package jargon in any file that ships — `bin/`,
  `src/cli/`, and any new build script are all shipped/build-adjacent; verified via the
  established two-layer grep (source + rebuilt output) at Build/Ship.
- CLAUDE.md golden rule 4 (zero runtime dependency): `devDependencies` is the correct,
  already-precedented mechanism (page 02 decision #12) — `dependencies` must stay absent.
- `npm run build` must still regenerate all existing outputs (`dist/`, `src/assets/adapters/`,
  `validators/`, `workflow/schemas/`) unchanged, plus the new `bin/prompts.mjs` (or equivalent)
  output.

## Risks

- A bundled `@clack/prompts` module could behave differently once compiled (e.g. ESM/CJS
  interop issues, missing terminal capability detection) than it does when imported directly
  in development — mitigated by requiring Build to manually exercise both the accept and
  decline paths against the actual built `bin/` output, not just the pre-build source.
- `@clack/prompts` does not self-detect non-TTY (confirmed via real research on the Notion
  page) — mitigated by R3's explicit requirement to preserve the existing guard unchanged, not
  trust the library's own behavior.
- Introducing `src/cli/` as a new source-to-`bin/`-output pattern sets a precedent other work
  will follow — mitigated by designing it consistently with the existing `src/workflow/` →
  `dist/`, `src/setup/` → `dist/`, `src/adapters/` → `src/assets/adapters/` conventions rather
  than inventing a new shape.

## Open Questions

None. The scoping correction and architecture decision are both resolved in this brief with
concrete reasoning, grounded in the real current source — no product/policy decision required.

## Requirement Manifest

### Explicit (R)

- **R1** - The migration-delete confirmation uses `@clack/prompts`.
  - Acceptance: running the migration-delete path (interactively) shows a styled clack confirm
    prompt, not a bare `[y/N]` line; accepting deletes the paths exactly as today; declining
    leaves them in place exactly as today.

- **R2** - A reusable `src/cli/` → `bin/` bundling pattern exists.
  - Acceptance: a new source file under `src/cli/` compiles via a new esbuild-based build step
    into a committed `bin/` output file with zero external imports at runtime; `npm run build`
    regenerates it alongside all existing outputs.

- **R3** - The non-TTY fail-closed guard is preserved exactly.
  - Acceptance: a non-TTY `init` run (piped stdin) produces the identical error message and
    exit behavior as the current, pre-this-brief implementation.

### Implicit (RI)

- **RI1** - Zero runtime dependency.
  - Acceptance: `git diff package.json` shows `esbuild` and `@clack/prompts` added only under
    `devDependencies`; `dependencies` remains absent/empty.

- **RI2** - No internal jargon in any shipped or build-adjacent file.
  - Acceptance: `npm run build`; grep of `bin/`, `dist/`, and the new `src/cli/` output for
    `OI-`, `WP-R`, and this chain's own slug finds zero matches.

- **RI3** - No regression in the existing build/validate/test suite.
  - Acceptance: `npm run build && npm run validate && npm run violations:test &&
    npm run conformance:test` all pass unchanged.

### Assumptions (A)

none

### Open Questions (Q)

none

## Questions For User

None outstanding.

## Architecture Notes

- role: Architect
- decision: **Bundling design** — `bin/agentsmyth.mjs` stays hand-written, unbundled source
  (unchanged in nature from today); a new source file `src/cli/prompts.mjs` is compiled by a
  new `scripts/build-cli.mjs` (esbuild, following `scripts/build-bundle.mjs`'s existing
  precedent as a plain Node script invoked from `npm run build`) into a committed
  `bin/prompts.mjs` — a single, dependency-free file with `@clack/prompts` inlined.
  `bin/agentsmyth.mjs` imports the small wrapper it needs (e.g. a `confirm()` function
  matching `confirmDeletion()`'s existing call shape) via a relative import
  (`./prompts.mjs`). This is the minimal-blast-radius option: `bin/agentsmyth.mjs`'s own
  source doesn't move, `package.json`'s `"bin"` field is unchanged, and the new generated file
  follows the exact same "hand-written source in `src/`, generated output shipped in the
  package" shape every other build output in this repo already uses.
- decision (rejected alternative): compiling `bin/agentsmyth.mjs` itself as a build output
  (moving its true source to e.g. `src/cli/agentsmyth.mjs`, having `npm run build` write the
  bundled result to `bin/agentsmyth.mjs`) — rejected as unnecessarily broad for this brief's
  actual need (one small prompt function), and it would make every future `bin/agentsmyth.mjs`
  edit require a rebuild step to test locally, a real workflow-friction cost for a change this
  narrow. Revisit only if a second, larger reason to bundle the whole CLI entrypoint appears
  (e.g. WP-R10's compiled-binary work, which is deferred and separate).
- decision (rejected alternative): a runtime dependency (listing `@clack/prompts` directly in
  `package.json`'s `dependencies`) — rejected outright per the zero-runtime-dependency
  invariant; not seriously considered, listed here only for completeness since this brief's
  Constraints section treats it as a hard rule.
- constraint: `src/cli/` becomes a fourth "source that compiles into shipped output"
  directory, alongside `src/workflow/`, `src/setup/`, `src/adapters/` — Build should follow
  those three's existing conventions (a clear header comment stating what compiles to what,
  matching `scripts/build-bundle.mjs`'s own doc-comment style) rather than inventing new
  documentation conventions.
- tradeoff: Scoped this brief to the one real, existing prompt rather than also speculatively
  building whatever WP-R9b's future interview UX might need — the infrastructure (R2) is
  reusable either way, but inventing prompt *content* for a flow that doesn't exist yet would
  mean Plan/Build guessing at requirements only WP-R9b's own brief can actually specify.
- downstream: WP-R9b, when it starts, should reuse `src/cli/` → `bin/` bundling verbatim for
  its own interview-resolution prompts, not redesign the pattern. WP-R10 (compiled binary,
  deferred) also reuses this same esbuild infrastructure per Notion page 02 decision #12's own
  note that it's shared, not R9c-only.

## Exit Gate

- [x] Every active R and RI has acceptance criteria.
- [x] No blocking Q IDs; `orchestration.blockers` is empty.
- [x] User approved the brief — "continue," 2026-07-19.

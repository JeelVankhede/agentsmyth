---
slug: wp-r9c-tui-polish
version: 1
artifact: plan
status: ready-for-next-phase
created: 2026-07-19
updated: 2026-07-19
manifest_ids: [R1, R2, R3, RI1, RI2, RI3]
upstream:
  - workflow/artifacts/briefs/wp-r9c-tui-polish-v1.md
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: approved
---

# WP-R9c — Node TUI Polish (clack + esbuild) - Plan

## Summary

3 phases: build the new `src/cli/` → `bin/` bundling infrastructure first (R2), then refactor
the one real existing prompt to use it (R1, R3), then verify end-to-end. Sequenced this way
because Phase 2 needs Phase 1's compiled output to exist before it can import from it.

## Inputs

- Brief: `workflow/artifacts/briefs/wp-r9c-tui-polish-v1.md` (`ready-for-next-phase`, approved,
  including its architecture decision on bundling design and its scoping correction to the one
  real existing prompt).
- Manifest IDs: R1, R2, R3, RI1, RI2, RI3.
- Re-read this Plan: `bin/agentsmyth.mjs`'s exact `confirmDeletion()` implementation (lines
  405-422), `package.json`'s current `scripts`/`files`/absence of any dependency blocks, and
  `scripts/build-bundle.mjs`'s doc-comment style (to match for the new build script).

## Requirement Coverage

| Manifest ID | Covered by phases | Notes |
|---|---|---|
| R1 | Phase 2 | `confirmDeletion()`'s TTY branch swaps readline for the new clack wrapper |
| R2 | Phase 1 | New `src/cli/prompts.mjs` + `scripts/build-cli.mjs`, wired into `npm run build` |
| R3 | Phase 2 | Non-TTY branch left byte-for-byte unchanged |
| RI1 | Phase 1 (added), Phase 3 (verified) | `devDependencies` only |
| RI2 | Phase 3 | Jargon grep across `bin/`, `dist/`, new `src/cli/` output |
| RI3 | Phase 3 | Full suite, zero regression |

## Repo Impact Map

| File | Change type | Manifest IDs | Notes |
|---|---|---|---|
| `package.json` | config | R2, RI1 | Adds `esbuild` and `@clack/prompts` under a new `devDependencies` block; `dependencies` stays absent |
| `src/cli/prompts.mjs` | runtime (new source) | R2 | Hand-written wrapper around `@clack/prompts`'s confirm prompt |
| `scripts/build-cli.mjs` | runtime (new build script) | R2 | esbuild invocation compiling `src/cli/prompts.mjs` -> `bin/prompts.mjs` |
| `scripts/build-bundle.mjs` or `package.json`'s `build` script | runtime | R2 | Wire the new build step into `npm run build` (exact mechanism — new script call or combined — is Build's call once it re-reads the existing `build` script entry) |
| `bin/prompts.mjs` | generated output (new, committed) | R2, RI1 | esbuild-bundled, zero external imports at runtime |
| `bin/agentsmyth.mjs` | runtime (shipped) | R1, R3 | `confirmDeletion()`'s TTY branch imports and calls the new wrapper; non-TTY branch untouched |

## Source-of-Truth Strategy

No external source-of-truth involved. Self-contained addition of a new build pipeline stage
within this repo's own source tree.

## Approach

3 phases, strictly sequential: infrastructure first (nothing to refactor against without it),
then the refactor (the one real behavior change), then full verification (needs both prior
phases' diffs to exist).

## Phases

### Phase 1 - Bundling infrastructure

- **Manifest IDs:** R2, RI1
- Touches: `package.json`, `package-lock.json` (new), `.gitignore`, `src/cli/prompts.mjs`
  (new), `scripts/build-cli.mjs` (new), `scripts/build-bundle.mjs` or `package.json`'s `build`
  script entry
- **Amended during Build, before implementation**: this is this repo's first-ever dependency
  (dev or runtime) — `npm install` creates `node_modules/` and `package-lock.json`, neither of
  which `.gitignore` currently anticipates (it has no `node_modules/` entry at all, since
  nothing has ever needed one). `.gitignore` needs a `node_modules/` entry (never commit it);
  `package-lock.json` should be committed (standard practice for reproducible installs). Added
  to Touches before either file was touched, per this repo's own scope-fence discipline.
- Work:
  - `npm install --save-dev esbuild @clack/prompts` — creates `package.json`'s
    `devDependencies` block (currently absent) and `package-lock.json`.
  - `src/cli/prompts.mjs`: a small hand-written module exporting one wrapper function whose
    contract matches what `confirmDeletion()` needs — given a message, render a clack-styled
    yes/no confirm, return a boolean, treating an explicit cancel (Ctrl+C) as decline (`false`)
    for the same fail-closed reasoning the existing non-TTY guard already uses. Include a
    doc-comment header matching `scripts/build-bundle.mjs`'s existing style, stating this
    compiles to `bin/prompts.mjs` and why (mirrors the brief's Architecture Notes).
  - `scripts/build-cli.mjs`: invokes esbuild (via its JS API, not shelling out) with `bundle:
    true`, `platform: 'node'`, `format: 'esm'`, entry `src/cli/prompts.mjs`, output
    `bin/prompts.mjs`. Follows `scripts/build-bundle.mjs`'s existing doc-comment and plain-Node
    script conventions.
  - Wire `scripts/build-cli.mjs` into the `npm run build` chain (`package.json`'s `"build"`
    script) so a single `npm run build` produces every output, old and new.
- **Exit gate:** `npm run build` produces `bin/prompts.mjs`; the file contains no `require(...)`
  or `import ... from '@clack/prompts'` (i.e., genuinely bundled, not just copied); `npm run
  build`'s other existing outputs (`dist/`, `src/assets/adapters/`, `validators/`,
  `workflow/schemas/`) are byte-identical to a pre-Phase-1 build except for expected content
  drift from unrelated already-landed work (none expected here, but Build should diff to
  confirm rather than assume).

### Phase 2 - Refactor the real prompt

- **Manifest IDs:** R1, R3
- Touches: `bin/agentsmyth.mjs`
- Why after Phase 1: needs `bin/prompts.mjs` to exist to import from.
- Work:
  - `confirmDeletion()`'s TTY branch (the `createInterface`/`rl.question` block) is replaced
    with a call into the new wrapper from `./prompts.mjs`, preserving the function's existing
    external contract (same parameters, same return type, same caller sites unchanged).
  - `confirmDeletion()`'s non-TTY branch (the `if (!process.stdin.isTTY)` block, including its
    exact error message text) is **not touched** — copy-paste identical, per R3.
  - Remove the now-unused `createInterface` import from `node:readline/promises` if nothing
    else in `bin/agentsmyth.mjs` still uses it (check before removing — do not assume).
- **Exit gate:** manual exercise of the built `bin/` output (not the pre-build source) against
  3 scenarios — TTY-accept, TTY-decline, non-TTY — each producing the exact same outcome
  (delete / don't delete / fail-closed error) as the pre-Phase-2 implementation, with only the
  TTY-path's rendering changed.

### Phase 3 - Full verification

- **Manifest IDs:** RI1, RI2, RI3
- Touches: none (verification only)
- Work: `git diff package.json` (confirm `devDependencies`-only, `dependencies` absent);
  `npm run build`; grep `bin/`, `dist/`, and `src/cli/` for jargon; `npm run validate &&
  npm run violations:test && npm run conformance:test` against the full existing
  `workflow/artifacts/` tree.
- **Exit gate:** all commands pass with current-turn output cited; jargon grep is empty;
  `git diff package.json`'s `dependencies` field shows no change (stays absent).

## Dependency Order

Phase 1 → Phase 2 (needs `bin/prompts.mjs` to import) → Phase 3 (needs both prior diffs to
exist for meaningful verification).

## Branch Strategy

- Base: `feat/wp-r9a-adapter-gate-dedup` (this branch, `feat/wp-r9c-tui-polish`, was created on
  top of R9a's committed work per the user's explicit sequencing instruction — not off `main`,
  since R9a hasn't merged yet).
- Working branch: `feat/wp-r9c-tui-polish`.
- Commits: one per phase preferred, not mandatory.
- No commits to `main` directly (`repo-profile.yaml`'s
  `branch_policy.require_non_default_branch_for_changes: true`).
- PR: not required by default (`release.yaml`); create only if requested. When a PR is opened,
  it should target whatever `feat/wp-r9a-adapter-gate-dedup` itself is merged into (or be
  retargeted at that point) — since this branch's history includes R9a's own commits until
  R9a lands on `main` first.

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner | Manifest IDs |
|---|---|---|---|---|---|
| esbuild's bundled output behaves differently than `@clack/prompts` does when imported directly in dev (ESM/CJS interop, terminal capability detection) | medium | medium | Phase 2's exit gate requires exercising the actual **built** `bin/` output, not the pre-build source, across all 3 scenarios | Build | R1 |
| `@clack/prompts` doesn't self-detect non-TTY (confirmed via the original spike's own research) | low | high (could hang in CI) | R3 explicitly preserves the existing guard unchanged rather than trusting the library; Phase 2 never routes the non-TTY path through clack at all | Build | R3 |
| This branch's history includes R9a's own commits (built on top of it) — a PR opened from here would show both chains' diffs combined until R9a merges first | low | low | Named explicitly in Branch Strategy; not a code risk, a sequencing note for whoever opens a PR | user | — |

No risk here lacks a mitigation; none require a waiver.

## Verification Plan

| Manifest ID | Evidence | Owner phase | Notes |
|---|---|---|---|
| R1 | Manual exercise of the built `bin/` output, TTY-accept and TTY-decline scenarios | Build | |
| R2 | `bin/prompts.mjs` exists, contains no unresolved imports, produced by `npm run build` | Build | |
| R3 | Manual exercise of the built `bin/` output, non-TTY scenario, diffed against pre-Phase-2 behavior | Build | |
| RI1 | `git diff package.json` shows `devDependencies`-only | Build | |
| RI2 | Jargon grep across `bin/`, `dist/`, `src/cli/` | Build | |
| RI3 | Full `npm run build/validate/violations:test/conformance:test` | Build | |

## Architecture Notes

- role: Principal Engineer
- decision: Kept Phase 1 (infrastructure) and Phase 2 (the actual behavior change) separate
  rather than combined — Phase 1's exit gate (bundled output exists, is genuinely
  dependency-free) is independently verifiable before any real CLI behavior changes, isolating
  "did the new build pipeline work" from "did the refactor preserve behavior" as two distinct,
  separately falsifiable questions.
- decision: `scripts/build-cli.mjs` uses esbuild's JS API programmatically (not a shelled-out
  `esbuild` CLI invocation) — matches `scripts/build-bundle.mjs`'s own convention of being a
  plain importable/runnable Node script, not a wrapper around a separate CLI tool's own flags.
- constraint: This branch's own history includes `feat/wp-r9a-adapter-gate-dedup`'s commits,
  since it was created on top of that branch per the user's explicit sequencing choice — noted
  in Branch Strategy as a real, if non-code, consideration for whoever eventually opens a PR.
- downstream: WP-R9b should reuse `src/cli/` → `bin/` bundling verbatim, adding its own new
  source files under `src/cli/` and new entries to `scripts/build-cli.mjs`'s esbuild
  invocation (or a sibling script, Build's call at that time) rather than duplicating the
  pattern.

## Open Questions

None.

## Exit Gate

- [x] Every active R and RI mapped to exactly one owning phase (`requirement-phase-mapper`
      check: R1→Phase 2, R2→Phase 1, R3→Phase 2, RI1→Phase 1/3, RI2→Phase 3, RI3→Phase 3).
- [x] Every phase has a binary, falsifiable exit gate.
- [x] Dependency order is explicit.
- [x] Every risk has a mitigation; none need a waiver.
- [x] Verification plan covers every R and RI.
- [x] Source-of-truth and release handling are explicit (not applicable; no release gate
      configured).
- [x] Branch strategy is explicit; does not target `main`; the base-off-R9a sequencing is
      named explicitly, not silently assumed.
- [x] No brief assumptions to verify (brief's Assumptions section was empty).
- [x] User approved the plan — "proceed," 2026-07-19.

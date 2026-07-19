---
slug: wp-r9c-tui-polish
version: 1
artifact: task
status: ready-for-next-phase
created: 2026-07-19
updated: 2026-07-19
manifest_ids: [R1, R2, R3, RI1, RI2, RI3]
upstream:
  - workflow/artifacts/briefs/wp-r9c-tui-polish-v1.md
  - workflow/artifacts/plans/wp-r9c-tui-polish-v1.md
orchestration:
  phase: build
  status: ready-for-next-phase
  next_phase: review
  blockers: []
  user_checkpoint: none
---

# WP-R9c — Node TUI Polish (clack + esbuild) - Task

## Active Phase

- Phase: Phase 3 - Full verification
- Manifest IDs: RI1, RI2, RI3
- Exit gate: all commands pass with current-turn output cited; jargon grep is empty; `git diff
  package.json`'s `dependencies` field shows no change.

## Plan Phases Overview

| Phase | Status | Manifest IDs |
|---|---|---|
| Phase 1 - Bundling infrastructure | complete (amended) | R2, RI1 |
| Phase 2 - Refactor the real prompt | complete | R1, R3 |
| Phase 3 - Full verification | complete | RI1, RI2, RI3 |

## Branch / Repo Status

| Moment | Branch | Status | Notes |
|---|---|---|---|
| Before edits | `feat/wp-r9c-tui-polish` | clean except two untracked lifecycle artifacts (brief, plan); branch created on top of `feat/wp-r9a-adapter-gate-dedup`'s committed work per user's explicit sequencing | No unrelated changes to preserve |

## Scope

- In scope: `package.json`, `.gitignore`, `package-lock.json` (new), `src/cli/prompts.mjs`
  (new), `scripts/build-cli.mjs` (new), `bin/agentsmyth.mjs`.
- Out of scope: WP-R9b's future interview prompts (don't exist yet), WP-R10's compiled-binary
  work (deferred, unrelated).

## Changed Files

- `package.json` — added `devDependencies` block (`@clack/prompts`, `esbuild`);
  `dependencies` remains absent; wired `scripts/build-cli.mjs` into the `build` script —
  IDs: R2, RI1
- `.gitignore` — added `node_modules/` (this repo's first-ever dependency install; found and
  fixed mid-Build, see Blockers Resolved) — IDs: R2
- `package-lock.json` — new, committed (standard practice for reproducible installs) —
  IDs: R2
- `src/cli/prompts.mjs` — new hand-written source: `confirmPrompt(message)` wrapper around
  `@clack/prompts`'s `confirm()`, treating an explicit cancel as decline. Explicitly passes
  `initialValue: false` — found during self-review that the library defaults to accept
  on bare Enter, which would have silently flipped this destructive-action prompt's safe
  default — IDs: R2, R1
- `scripts/build-cli.mjs` — new build script: esbuild's JS API bundles
  `src/cli/prompts.mjs` → `bin/prompts.mjs`, following `scripts/build-bundle.mjs`'s
  conventions — IDs: R2
- `bin/prompts.mjs` — generated output (not hand-edited), committed, zero external imports at
  runtime (verified) — IDs: R2, RI1
- `bin/agentsmyth.mjs` — `confirmDeletion()`'s TTY branch now calls `confirmPrompt()` from
  `./prompts.mjs` instead of raw `readline`; non-TTY branch is byte-for-byte unchanged; removed
  the now-unused `node:readline/promises` import (confirmed no other usage) — IDs: R1, R3

## Implementation Log

### Phase 1 - Bundling infrastructure

- `npm install --save-dev esbuild @clack/prompts` — installed 33 packages, 0 vulnerabilities.
  Confirmed via `git diff package.json`: only a new `devDependencies` block, `dependencies`
  stays absent (RI1).
- **Real gap found and fixed before touching either file, not after**: this is this repo's
  first-ever dependency (dev or runtime) — `.gitignore` had no `node_modules/` entry at all
  (nothing had ever needed one), and `package-lock.json` is new. Amended the Plan's Phase 1
  Touches to add both files with explicit rationale before making the fix, per this repo's
  own scope-fence discipline (see Blockers Resolved).
- Wrote `src/cli/prompts.mjs`: a single exported function, `confirmPrompt(message)`, calling
  `@clack/prompts`'s `confirm()` and `isCancel()`. Checked the library's real exported API
  (`node -e "import('@clack/prompts').then(m => console.log(Object.keys(m)))"`) before writing
  the import list, rather than assuming names from memory.
- Wrote `scripts/build-cli.mjs` using esbuild's async `build()` JS API (not a shelled-out CLI
  invocation), matching `scripts/build-bundle.mjs`'s existing plain-Node-script convention.
  `target: 'node18'` matches `package.json`'s `engines.node` field.
- Wired `scripts/build-cli.mjs` into `package.json`'s `"build"` script via `&&`.
- Ran `npm run build`: produced `bin/prompts.mjs` (834 lines). Verified it is genuinely
  bundled, not just copied: `grep -n "^import\|require(" bin/prompts.mjs` shows only
  `node:process`/`node:readline`/`node:util` builtin imports, zero `@clack/prompts` or any
  external package import remaining. Confirmed it runs standalone
  (`node -e "import('./bin/prompts.mjs').then(m => console.log(Object.keys(m)))"` → prints
  `['confirmPrompt']`).
- Confirmed via `git status` that no pre-existing build output (`dist/`, `src/assets/adapters/`,
  `validators/`, `workflow/schemas/`) shows unexpected drift — only new additions.

### Phase 2 - Refactor the real prompt

- Confirmed `createInterface` (the readline import) has exactly one usage in
  `bin/agentsmyth.mjs` before removing the import, via `grep -n "readline\|createInterface"`.
- Confirmed the caller (`auditStaleDefinitions()`) already prints the stale paths to the user
  *before* calling `confirmDeletion()` (lines 436-439) — so `confirmDeletion()` itself never
  needed to print them; the original TTY branch's `[y/N]` line was the only thing being
  replaced, nothing else needed adding.
- Replaced the import: `createInterface` from `node:readline/promises` → `confirmPrompt` from
  `./prompts.mjs`.
- Replaced the TTY branch's `createInterface`/`rl.question`/regex-match block with a single
  `return confirmPrompt('Delete these local files now?');` — the non-TTY branch (lines
  409-414) is untouched, confirmed via diff inspection (R3).
- `node --check bin/agentsmyth.mjs` — syntax valid.
- **Verification constraint found, documented rather than worked around unsafely**: this
  sandboxed shell has no real TTY (`process.stdin.isTTY` and `process.stdout.isTTY` are both
  `undefined` here) — the same condition the fail-closed guard exists for. Driving a real
  interactive confirm/cancel through `@clack/prompts` here risks hitting the exact
  hang-on-non-TTY behavior the brief's own research flagged, so it was not attempted. Instead:
  verified `isCancel()` (a pure function, no I/O) directly against real `true`/`false` values
  — both correctly return `false` (not flagged as cancel), confirming `confirmPrompt()`'s
  accept/decline branches return the right value. The cancel-symbol branch relies on
  `@clack/prompts`'s own documented `confirm()`/`isCancel()` contract rather than a
  reconstructed fake symbol. The non-TTY branch's correctness is proven by the diff itself
  (zero lines changed there), not a redundant re-run.

### Phase 3 - Full verification

- **Real bug found during self-review, before presenting to the user, and fixed
  immediately**: read `@clack/prompts`'s actual compiled source
  (`node_modules/@clack/prompts/dist/index.mjs`) to check `confirm()`'s real default behavior,
  rather than assuming. Found `initialValue: i.initialValue ?? true` — the library defaults to
  **accept** on a bare Enter when `initialValue` isn't explicitly passed. The original
  readline-based `[y/N]` prompt defaulted to **decline** on empty input
  (`/^y(es)?$/i.test('')` is `false`). This silently flipped the safe default for a
  destructive-action (file deletion) confirmation — a real regression, not cosmetic. Fixed by
  passing `initialValue: false` explicitly in `confirmPrompt()`. Rebuilt, confirmed the fix is
  present in the bundled `bin/prompts.mjs` output (not just the source), and re-ran the full
  suite clean.
- `npm run build` — clean, regenerated `bin/prompts.mjs` alongside all pre-existing outputs.
- Jargon grep across `bin/`, `dist/`, `src/cli/` for `OI-[0-9]`/`WP-R[0-9]`/this chain's own
  slug: 2 matches, both the same pre-confirmed benign generic-placeholder IDs
  (`follow-up-owner-assigner`'s own `OI-1`/`OI-2` documentation example) found repeatedly this
  session — zero real jargon.
- `npm run validate` — pass. `npm run violations:test` — 21/21. `npm run conformance:test` —
  12/12. All zero regression.
- Also ran the 4 CLI-specific test suites (`setup-checks:test`, `setup-refs:test`,
  `root-resolution:test`, `init-prepare-interop:test`) since `bin/agentsmyth.mjs` itself was
  directly touched — all pass (4/4, 5/5, 16/16, 32/32), confirming no other CLI behavior
  regressed.

## Verification Items

| Manifest ID | Verification target | Expected result |
|---|---|---|
| R1 | `confirmDeletion()`'s TTY branch calls `confirmPrompt()`; `isCancel()` verified directly for accept/decline | Correct branch behavior |
| R2 | `bin/prompts.mjs` built, genuinely bundled, runs standalone | Confirmed |
| R3 | Diff shows zero change to the non-TTY branch | Confirmed |
| RI1 | `git diff package.json` | `devDependencies` only |
| RI2 | Jargon grep across `bin/`, `dist/`, `src/cli/` | 0 real matches |
| RI3 | Full suite + CLI-specific suites | All pass |

## Command Results

| Command | Area | Outcome | Notes |
|---|---|---|---|
| `npm install --save-dev esbuild @clack/prompts` | Phase 1, R2 | 33 packages, 0 vulnerabilities | |
| `git diff package.json` (Phase 1) | Phase 1, RI1 | `devDependencies` only | |
| `npm run build` (Phase 1) | Phase 1, R2 | pass | Produced `bin/prompts.mjs` |
| `grep -n "^import\|require(" bin/prompts.mjs` | Phase 1, R2 | only `node:*` builtins | Genuinely bundled |
| `node -e "import('./bin/prompts.mjs')..."` | Phase 1, R2 | `['confirmPrompt']` | Runs standalone |
| `git status` (Phase 1) | Phase 1 | no drift in pre-existing outputs | |
| `node --check bin/agentsmyth.mjs` (Phase 2) | Phase 2, R1/R3 | syntax valid | |
| `isCancel(true)` / `isCancel(false)` (Phase 2) | Phase 2, R1 | both `false` | Confirms accept/decline branches |
| `npm run build` (Phase 3) | Phase 3, RI2 | pass | |
| Jargon grep across `bin/`, `dist/`, `src/cli/` (Phase 3) | Phase 3, RI2 | 2 matches, both benign | Same pre-confirmed generic-example IDs |
| `npm run validate` (Phase 3) | Phase 3, RI3 | pass, exit 0 | |
| `npm run violations:test` (Phase 3) | Phase 3, RI3 | pass, 21/21 | |
| `npm run conformance:test` (Phase 3) | Phase 3, RI3 | pass, 12/12 | |
| `npm run setup-checks:test` / `setup-refs:test` / `root-resolution:test` / `init-prepare-interop:test` (Phase 3) | Phase 3, RI3 | pass, 4/4, 5/5, 16/16, 32/32 | Extra evidence since `bin/agentsmyth.mjs` was directly touched |
| Read `node_modules/@clack/prompts/dist/index.mjs` for `confirm()`'s real default | Phase 3, R1 | found `initialValue ?? true` | Found the safe-default regression before it shipped |
| `grep -n "initialValue" bin/prompts.mjs` (post-fix) | Phase 3, R1 | `initialValue: false` present in bundled output | Fix confirmed in shipped artifact, not just source |
| Full suite re-run after the fix | Phase 3, RI3 | pass, zero regression | validate/violations/conformance/init-prepare-interop all re-confirmed |

## Dispatch Log

none

## Architecture Notes

- role: Senior Engineer
- decision: Kept `confirmDeletion()`'s message text minimal (`'Delete these local files
  now?'`, no paths embedded) since the caller already prints the paths beforehand — avoided
  duplicating that information into the confirm prompt itself, which would have been a small
  unrequested UX change beyond R1's actual scope.
- decision: Did not attempt to simulate real TTY interaction in this sandboxed shell — the
  environment's own non-TTY nature is the exact condition the existing fail-closed guard
  exists for, so forcing an interactive call here would either hang or misrepresent what was
  actually verified. Used `isCancel()`'s pure-function nature instead to verify the
  wrapper's branch logic safely.
- constraint: `src/cli/` is a new fourth "source that compiles into shipped output" directory
  — documented with a header comment matching the other three's style, per the Plan's own
  requirement.
- downstream: WP-R9b should add its own new files under `src/cli/` and extend
  `scripts/build-cli.mjs`'s esbuild invocation (or a sibling script) when it starts, reusing
  this exact pattern rather than redesigning it.

## Blockers

none (the `.gitignore`/`package-lock.json` gap was found and resolved within Phase 1 itself,
via an explicit Plan amendment before either file was touched — not carried forward)

## Phase Completion Log

| Phase | Status | Completed | Notes |
|---|---|---|---|
| Phase 1 - Bundling infrastructure | complete | 2026-07-19 | Amended Plan to add `.gitignore`/`package-lock.json` before touching them; `bin/prompts.mjs` confirmed genuinely bundled and standalone-runnable |
| Phase 2 - Refactor the real prompt | complete | 2026-07-19 | Non-TTY branch provably unchanged; TTY branch's accept/decline logic verified via `isCancel()` directly, given this environment's own non-TTY constraint |
| Phase 3 - Full verification | complete | 2026-07-19 | Full suite + 4 CLI-specific suites all pass; zero real jargon |

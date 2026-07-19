---
slug: wp-r9c-tui-polish
version: 1
artifact: review
status: ready-for-next-phase
created: 2026-07-19
updated: 2026-07-19
manifest_ids: [R1, R2, R3, RI1, RI2, RI3]
upstream:
  - workflow/artifacts/briefs/wp-r9c-tui-polish-v1.md
  - workflow/artifacts/plans/wp-r9c-tui-polish-v1.md
  - workflow/artifacts/tasks/wp-r9c-tui-polish-v1.md
orchestration:
  phase: review
  status: ready-for-next-phase
  next_phase: test
  blockers: []
  user_checkpoint: none
---

# WP-R9c — Node TUI Polish (clack + esbuild) - Review

## Findings

none

1 finding was found during this Review cycle and fixed within the same cycle, not carried
forward as an open item:

- **P1 — `@clack/prompts`'s `confirm()` defaults to accept on a bare Enter, silently flipping
  a destructive-action confirmation's safe default.** Read the library's actual compiled
  source (`node_modules/@clack/prompts/dist/index.mjs`) and found
  `initialValue: i.initialValue ?? true` — when `confirmPrompt()`'s first draft didn't pass
  `initialValue` explicitly, the prompt would default to **accept** (delete the files) on
  empty input. The original readline-based `[y/N]` prompt it replaced defaulted to
  **decline** on empty input (`/^y(es)?$/i.test('')` is `false`). A user who hit Enter without
  reading the prompt would go from "safely declining" to "confirming a file deletion." Fixed
  by passing `initialValue: false` explicitly in `src/cli/prompts.mjs`'s `confirmPrompt()`.
  Rebuilt and confirmed the fix is present in the bundled `bin/prompts.mjs` output itself
  (`initialValue: false` at the actual call site), not just the pre-build source. Full suite
  re-run clean after the fix.

## Severity Summary

| Severity | Count |
|---|---|
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| P3 | 0 |

## Requirement Coverage

| Manifest ID | Evidence | Status | Notes |
|---|---|---|---|
| R1 | `src/cli/prompts.mjs`'s `confirmPrompt()`, post-fix; `isCancel()` accept/decline check; `initialValue: false` verified present in bundled output | covered | The `initialValue` bug was caught and fixed before this Review closed, not left open |
| R2 | `bin/prompts.mjs` re-verified genuinely bundled (only `node:*` imports), runs standalone | covered | Independently re-confirmed this Review |
| R3 | `git diff -- bin/agentsmyth.mjs` re-read in full this Review — non-TTY branch lines are absent from the diff entirely | covered | Zero change proven by the diff itself |
| RI1 | `git diff package.json` re-checked — `devDependencies` only | covered | |
| RI2 | Jargon grep across `bin/`, `dist/`, `src/cli/` re-run this Review | covered | 2 pre-confirmed benign matches only |
| RI3 | Full suite + 4 CLI-specific suites re-run this Review | covered | Zero regression |

## Architecture Notes

- role: Staff Reviewer
- decision: Found the `initialValue` default-flip by deliberately reading the third-party
  library's actual compiled source rather than trusting its type signature or documentation
  summary — `ConfirmOptions.initialValue?: boolean` being optional in the `.d.mts` file gives
  no indication of which way it defaults when omitted; only the runtime source
  (`i.initialValue ?? true`) reveals that. This is the same "verify against real source, not
  assumption" discipline this repo applies to its own code, extended to a newly-added
  third-party dependency for the first time this session.
- decision: Fixed the finding immediately within this Review cycle rather than filing it as an
  open P1 — the fix was a one-line, low-risk, unambiguous correction with a clear right answer
  (match the prior behavior's safe default), not a design question needing the user's input.
- constraint: This is the first time this repo has taken on a third-party runtime-adjacent
  dependency (even though it's build-time-only) — worth naming as a new category of risk this
  repo hasn't had before: a library's own undocumented-by-type-signature default behavior can
  silently change what shipped code does. Not a reason to avoid dependencies, but a reason
  Review should read compiled/real source for any new library integration, not just its types.
- downstream: WP-R9b, when it adds its own new prompts via this same infrastructure, should
  apply the same discipline — check every clack prompt type's actual default behavior (not
  just `confirm()`) against its real source before assuming type signatures alone are
  sufficient documentation.

## Verification Reviewed

| Item | Outcome | Notes |
|---|---|---|
| `git diff --stat` (re-run by Review) | 3 files changed (`.gitignore`, `bin/agentsmyth.mjs`, `package.json`) | Matches the amended Plan's Repo Impact Map exactly |
| `git diff -- bin/agentsmyth.mjs` (read in full by Review) | Non-TTY branch entirely absent from the diff | Proves R3 by construction, not just by claim |
| `src/cli/prompts.mjs` (read in full by Review, post-fix) | `initialValue: false` present | Independently confirmed the fix, not just cited from the task artifact |
| `bin/prompts.mjs` jargon/import grep (re-run by Review) | Only `node:*` builtins; 0 real jargon matches | `grep -n "^import\|require(" bin/prompts.mjs`; `grep -inE "OI-\|WP-R\|wp-r9c" bin/ dist/ src/cli/` |
| `npm run build` (re-run by Review) | pass, exit 0 | `dist/` and `bin/prompts.mjs` regenerated clean |
| `npm run validate` (re-run by Review) | pass, exit 0 | Full existing artifact tree, zero errors |
| `npm run violations:test` (re-run by Review) | pass, 21/21 | Zero regression |
| `npm run conformance:test` (re-run by Review) | pass, 12/12 | Zero regression |
| `npm run init-prepare-interop:test` (re-run by Review) | pass, 32/32 | Extra evidence given `bin/agentsmyth.mjs` was directly touched |
| `node -e "JSON.parse(...package-lock.json...)"` (re-run by Review) | valid JSON, 571 lines | Confirms the new lockfile isn't corrupted |

## Residual Risk

none

## Recommendation

pass

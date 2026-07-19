---
slug: wp-r9c-tui-polish
version: 1
artifact: learning-session
date: 2026-07-19
source: lifecycle-reflect
upstream:
  - workflow/artifacts/reflect/wp-r9c-tui-polish-v1.md
---

# Raw Learnings - wp-r9c-tui-polish v1

## Context

Converted the one real existing interactive CLI prompt (migration-delete confirmation) from
raw readline to `@clack/prompts`, bundled at build time via a new esbuild-based pipeline
(`src/cli/` -> `bin/`). Built directly on top of WP-R9a's committed work per the user's
explicit sequencing (skipping WP-R9b for now). 3-phase Build, 1 P1 found and fixed during
Review, 0 open findings at close.

## Candidate Learnings

- Verify a new third-party library's default behavior from its real compiled source, not just
  its type signature — `@clack/prompts`'s `confirm()` defaulting to accept-on-Enter (opposite
  of the safe-decline default it replaced) was invisible from `initialValue?: boolean` alone
  and would have shipped as a real safety regression on a destructive-action prompt.
- The "empty evidence-citation cell" mistake recurred in 2 consecutive chains this session —
  worth a lighter local habit (visual scan before validate) rather than relying solely on the
  validator catch-and-fix cycle every time.

## Raw Notes

- Scoping correction at Think: R9c's Notion page assumed sequencing after R9b's future
  prompts; since R9b was skipped, checked what's actually interactive today (`grep -n
  "readline\|createInterface" bin/agentsmyth.mjs`) — exactly one prompt exists
  (`confirmDeletion()`). Scoped the brief around that real prompt, not speculative future UX.
- Architecture decision at Think: `bin/agentsmyth.mjs` ships unbundled; chose a minimal,
  surgical design (new `src/cli/prompts.mjs` -> generated `bin/prompts.mjs`, imported via
  relative path) over bundling the whole CLI entrypoint, matching this repo's existing
  `src/workflow/`/`src/setup/`/`src/adapters/` -> shipped-output convention.
- Found a real gap mid-Build: this repo's first-ever dependency meant `.gitignore` had no
  `node_modules/` entry and `package-lock.json` was new — amended the Plan's Phase 1 Touches
  before touching either file, per this repo's own scope-fence discipline.
- `bin/prompts.mjs` confirmed genuinely bundled (only `node:*` builtin imports remain) and
  runs standalone.
- Non-TTY branch of `confirmDeletion()` left byte-for-byte unchanged; only the TTY branch's
  readline mechanism was swapped for the new `confirmPrompt()` call.
- Real TTY interaction couldn't be driven in this sandboxed shell (`process.stdin.isTTY` is
  `undefined` here too) — verified what was safely testable instead: `isCancel()`'s
  pure-function behavior on real true/false values, the non-TTY branch's unchanged-ness via
  diff inspection, and (after the fix) `initialValue: false`'s presence in the actual shipped
  bundle. Documented the gap explicitly as a Skipped Check (`blocks_ship: no`), not hidden.
- Review found the `initialValue` bug by reading `node_modules/@clack/prompts/dist/index.mjs`
  directly (`initialValue: i.initialValue ?? true`) rather than trusting the `.d.mts` type
  signature, which gave no hint of the default direction. Fixed same-cycle, verified in the
  rebuilt bundle, full suite re-run clean.
- Process: user replied "2" to a 2-part question (commit? / proceed to Reflect?) — treated as
  answering only the second part, not implicitly approving both.

## Curator Marks

- promoted-to-curated: none
- consolidated-with: none
- rejected-as-not-general: none

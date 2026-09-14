# 2026-09-13 — wp-r23-agents-md-fallback

## Context

WP-R23, Standard class, single-agent throughout (councils are Complex-only). Full chain
Think → Plan → Build → Review → Test → Ship in one session, with one Build fix pass after Review.
Moved root `AGENTS.md` from agent-driven placement to mechanical placement by `init`, under
version-stamped markers matched by pattern.

Two defects reached Review. One — silent deletion of user content — was found only because the user
asked whether the phase was actually implemented properly, after it had already been recorded
complete on a green gate.

## Candidate Learnings

### A passing gate is evidence about the cases it encodes, and nothing more

Phase 2 closed on 13/13 checks across four conditions. All four fed **well-formed input**. The
implementation was simultaneously deleting user content whenever the file carried an orphan `BEGIN`
marker with no `END`: the non-greedy pattern matched from the orphan to the *next* block's `END` and
took everything between. Every one of the 13 checks passed while that was true.

The tell was available and I did not read it: the four conditions were derived from the requirement's
happy path, so they could only ever confirm the happy path. Nothing in the set described malformed
input, which is where the defect lived.

Concretely useful form: when a gate is built from acceptance criteria, the criteria describe intended
behaviour. Malformed, interrupted and partial inputs are not in them by construction, so a gate
derived only from criteria has a systematic blind spot in exactly the region where data loss happens.

### A test that compares against a value derived from the dev repo cannot see environment-specific bugs

Review finding F2: the block advertised the pre-commit hook at `.githooks/pre-commit`. That path is
correct *only in agentsmyth's own repository*, which sets `core.hooksPath`. Every consumer gets
`.git/hooks/pre-commit`. The assertion was `text.includes('.githooks/pre-commit')` — a comparison
against a string taken from the development environment. It passed while shipping a block naming a
file that did not exist for anyone else.

Replacing it with "extract the path the block names, assert a file exists there" made it catch the
bug — and mutation-testing confirmed it: reverting the fix fails the new assertion, and would have
passed the old one.

### Per-phase gates can all be green while the whole is broken

`agents-md:test` was registered in `package.json` in Phase 4 and wired into neither CI nor release.
Every per-phase exit gate passed. The repo shipped a suite that ran nowhere. Only running the full
release suite list at handoff surfaced it, via the conformance rule that exists for exactly this
(`r22-every-suite-runs-in-ci`).

### A requirement set can be complete against its own criteria and still have a hole

Review F1: the rewritten block dropped the instruction to run setup when `.agentsmyth/` is present.
Build bounded the block to exactly the four concerns R5 named, and R5 did not name setup detection —
so Build implemented the specification correctly and produced a gap anyway. The defect originated in
the brief, not the implementation.

Sharper still: the gap became *newly reachable* because of this work. Previously the setup skill wrote
the block after setup finished, so the instruction was dead text. `init` writing it beforehand is the
first arrangement in which that instruction could do anything — and that is the version that omitted
it.

### An exit gate can be unfalsifiable without looking like it

The plan's RI3 gate read: "`npm run build` followed by `git status --porcelain dist/` is empty". It
reads strict. `dist/` is gitignored (`.gitignore:2`), so an ignored path can never appear in
`git status` and the gate could never fail. The real guarantee lives in `release.yml` line 51, which
rebuilds the bundles in CI before publish.

### A question with an option attached is a proposal, not a check

Walking the brief's assumptions, A3 correctly recorded that pending-setup items stay unresolved — the
router says they are non-blocking and the brief itself recorded resolving them as out of scope. The
question asked was "does that hold, or do you want them resolved first?" The user took the offered
option; two config files were edited and two unrelated gaps were surfaced as problems before the whole
detour was reverted. The framing, not the work, was the error. Already captured in agent memory.

## Raw Notes

- `init` refuses to run while `.agentsmyth/` exists. A second `init` in a real consumer repo therefore
  always happens with that directory absent, because the setup skill deletes it. A naive idempotency
  test hits the guard and looks like an idempotency bug. Documented in the suite header so the next
  reader does not re-derive it.
- `String.prototype.replace` with a **string** replacement expands `$'` to "everything after the
  match". A build-time edit script containing that sequence in a comment spliced the rest of
  `bin/agentsmyth.mjs` into the middle of a function. Caught by `node --check`; localised by running
  `--check` against the `HEAD` copy, which passed. The runtime code being written at that moment
  already guarded against the same hazard.
- Two validator names were guessed wrong during the chain (`check-evidence`, `check-skipped-checks`;
  the real ones are `check-evidence-citations`, `check-skipped-accounting`). Both produced a `FAIL`
  line that looked like a real failure. Listing `src/workflow/validators/*.mjs` once and running the
  whole set is faster and cannot produce a phantom failure.
- `check-scope-fence` parses a phase number out of `## Active Phase`. Replacing that line with prose
  fails the gate. `wp-r22-review-council-v1.md` documents having hit the same thing, in its own
  artifact, which is what made it cheap to fix here.
- `resolveHooksDir()` was extracted rather than correcting one of two copies. The structural cause of
  F2 was two places independently deciding where the hook lives; fixing one copy would have left them
  able to drift again.

## Curator Marks

<!-- empty on first write; curation is a separate user-approved action -->

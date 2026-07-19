---
slug: wp-r9b-scaffold-init-resolution
version: 1
artifact: learning-session
date: 2026-07-19
source: lifecycle-reflect
upstream:
  - workflow/artifacts/reflect/wp-r9b-scaffold-init-resolution-v1.md
---

# Raw Learnings - wp-r9b-scaffold-init-resolution v1

## Context

Merged `agentsmyth init`'s mechanical scaffold with `headlessBootstrap()` (previously
`check`-only), extended it with `workflow/artifacts/`/`workflow/learnings/` scaffolding and
deterministic Cursor/non-macOS-Copilot adapter placement, then rewrote the agent's `setup`
skill's Phase 2 from a from-scratch interview into a resolution pass over `pending-setup.yaml`.
5-phase Build, 0 findings at Review close (2 P2 + 1 P3 found and fixed same-cycle), full
regression clean at every checkpoint. Built directly on `origin/main` after WP-R9a/R9c both
merged mid-chain (branch was rebased, confirmed byte-identical, zero conflict).

## Candidate Learnings

- Sharing one mechanical function between two CLI entry points (`check` and `init`, via
  `headlessBootstrap()`) can silently interact with *pre-existing* code at either call site in
  ways code review alone won't catch — `init`'s own standalone `writeDefinitionsRoot()` call,
  present before this chain touched anything, pre-created a minimal `repo-profile.yaml` that
  then made `headlessBootstrap()`'s own skip-if-exists check silently skip writing the full
  config template. Only a real, fresh scratch-repo end-to-end run surfaced this — the two
  functions individually looked correct in isolation.
- Verifying a new deterministic reimplementation of previously-agent-only prose logic (here:
  YAML token extraction for adapter rendering) against real edge-case input, not just the
  shipped default, caught two real gaps (`extractYamlList()`'s flow-style-array blind spot, a
  fallback-marker inconsistency in `BRANCH_POLICY`'s false branch). This is the second time
  this exact lesson has surfaced this session (the first was WP-R9c's `@clack/prompts`
  `initialValue` finding) — worth treating as a general Review habit for any new
  agent-logic-to-code port, not a one-off catch.
- A Notion research spike page can go stale relative to the very shipped work it cites — this
  chain's own brief had to correct the spike's "Option A/B/C adapter-placement tension" framing
  against the *actually-shipped* R9a fix (which the spike itself documented in a later section)
  before Plan could safely proceed. Re-verifying "current state" claims against real source at
  Think time, not trusting a research page's own prior summary, avoided building on a
  now-outdated premise.

## Raw Notes

- Think: grounded every real-code claim in the brief against actual source
  (`bin/agentsmyth.mjs`, `src/setup/SKILL.md`, `router.md`, `README.md`) rather than the Notion
  spike's own §2/§5 summary, which predated R9a's shipped fix.
- Think: resolved Q1 (adapter-placement-into-CLI relocation) into a concrete R5 by combining
  the user's literal answer ("mechanical... skip if file already exists... init can never run
  an interview") with R9a's own table naming Cursor/non-macOS-Copilot as the only two
  global-gate-uncovered cases — avoided guessing at an abstract "move it to the CLI" goal.
  User confirmed the reading correct without correction.
- Plan: found `headlessBootstrap()` was already structurally shared (no `check`-specific
  coupling) — R1's real work was extension + a second call site, not restructuring.
- Plan: discovered no `workflow/learnings/` template existed anywhere in `src/assets/` — the
  brief's own A2 assumption ("same output Phase 5b's bundle-expansion already produces") turned
  out to be about *timing*, not an existing mechanically-copyable template; Phase 5b's
  expansion never actually produced this content via the bundle (verified: zero matching FILE
  blocks), it was always agent-hand-authored prose.
- Plan: corrected the brief's own Risk estimate (adapter tokens "mostly TODO" at init time) by
  reading the actual stub templates — 5 of 8 tokens are genuinely resolvable immediately
  (`repo-profile.yaml`'s `paths.protected`/`branch_policy` ship real, non-placeholder defaults).
- Build: found and fixed the `writeDefinitionsRoot()` ordering bug (see Candidate Learnings)
  via a fresh scratch-repo test, not via reading the diff.
- Build: verified the non-macOS `os.platform()` branch using a `process.platform`
  `Object.defineProperty` override wrapper script, since no real non-macOS machine was
  available in this session's environment — documented as the closest available substitute at
  Test (Skipped Check, `blocks_ship: no`), not silently omitted.
- Review: found 2 P2 + 1 P3 by directly tracing `extractYamlList()`/`buildAdapterTokens()`
  against real YAML edge cases (flow-style arrays, unresolved-branch fallback) and cross-
  checking a README claim against `runPrepare()`'s actual gate-install list — none were caught
  by the automated suite, since none of the shipped templates or examples exercise flow-style
  YAML or the specific branch-inference-failure-plus-non-default-policy combination.
- Review: user authorized a same-cycle fix pass explicitly ("yes fix them") before any product
  file was touched during Review itself, per the phase's own Determinism Rule.
- Test: ran a 5th independent scratch-repo reproduction rather than re-citing Build/Review's
  existing scratch outputs.
- Ship: step 4a (origin/main staleness check) and step 6a (resolved-fix vs. waiver
  classification) — both from WP-R9a's own Ship-phase additions — exercised for the third time
  this session, both still genuinely useful rather than ceremony.

## Curator Marks

- promoted-to-curated: none
- consolidated-with: none
- rejected-as-not-general: none

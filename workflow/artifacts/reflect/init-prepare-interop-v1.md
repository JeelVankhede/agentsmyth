---
slug: init-prepare-interop
version: 1
artifact: reflect
status: done
created: 2026-07-17
updated: 2026-07-17
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, RI1, RI2, RI3, RI4, RI5]
upstream:
  - workflow/artifacts/briefs/init-prepare-interop-v1.md
  - workflow/artifacts/plans/init-prepare-interop-v1.md
  - workflow/artifacts/tasks/init-prepare-interop-v1.md
  - workflow/artifacts/reviews/init-prepare-interop-v1.md
  - workflow/artifacts/verify/init-prepare-interop-v1.md
  - workflow/artifacts/ship/init-prepare-interop-v1.md
orchestration:
  phase: reflect
  status: done
  next_phase: done
  blockers: []
  user_checkpoint: none
---

# WP-R7 — System-Install ↔ Per-Repo Init Interoperability - Reflect

## Inputs

Full chain: brief → plan (9 phases, 2 amended post-hoc for mechanical validator fixes) →
task → review (1 P1 + 1 P3 found and fixed in-chain) → verify (`ship`) → ship (`ship`,
R6 executed directly). Commit `4bb61cd` on `feat/init-prepare-interop`, pushed to origin by
the user.

## Outcome

Shipped. All 12 active manifest IDs (R1–R7, RI1–RI5) delivered and verified. Release: not
applicable (`release.yaml` `release.required: false`). Source-of-truth: updated (Notion
pages 02 and 10, direct writes, both re-fetched post-edit to confirm). Rollback: defined for
both tracks (git revert for code — nothing merged to `main` yet at Reflect time; Notion page
history for the two doc edits). No waivers were needed anywhere in this chain.

## What Worked

- **Review reading files outside the diff.** P1-01 (the adapter-gate `definitions_root` gap)
  was only found because Review deliberately re-read all 5 adapter templates plus root
  `AGENTS.md` even though none of them appeared in `git diff --stat` — the absence of an
  expected touch was itself the finding. A review that only checks `verify-manifest-coverage`
  style (declared IDs vs. changed files) would never have caught this.
- **Agent-in-the-loop manual QA.** Test closed Review's flagged "no script can prove an agent
  follows the gate instruction" risk by literally acting as a fresh agent session — reading
  the rendered gate file, checking for the local path, falling back to `definitions_root`,
  and reading the resolved file — using the same Read tool any real session would use. Real
  evidence, not a simulation, and directly answerable in-session without external tooling.
- **`writeDefinitionsRoot()` reuse.** The same function (originally written for the old
  `--system` flow) now backs three call sites (`prepare`'s successor logic, bare `init`,
  `headlessBootstrap()`) with zero duplication — confirmed by testing that it correctly
  handles both "file doesn't exist yet" and "file exists, insert near the right anchor"
  cases without new code.
- **The user's mid-chain counter-argument invitation on P3.** Being explicitly told "you can
  challenge the decision" led to the actually-better outcome (remove the dead return value
  entirely) instead of the originally-favored one (wire it through, adding an `if`/`else`
  split for a trivial saving).
- **Re-fetch-before-and-after for the Notion writes.** Caught zero drift this time, but the
  discipline itself (confirmed via direct re-fetch, not assumed) is what makes that a real
  check rather than a formality.

## What Did Not Work

- **`AGENTSMYTH_WF=src/workflow` silently redirects both roots, not one.** Per CLAUDE.md this
  env var is documented as pointing validators at source-level definitions — but this
  repo's hand-rolled resolver (`lib.mjs`) derives *both* `defsRoot` and `dataRoot` from the
  same `_wf` value when no `definitions_root`/`AGENTSMYTH_HOME` is set. Early in Think, this
  caused `check-lifecycle --phase think` to report `ok` while silently checking an empty
  `src/workflow/artifacts/` directory instead of the real `workflow/artifacts/briefs/`. The
  false-positive was only caught by chance (noticing `check-lifecycle --phase plan` failing
  to find an artifact that definitely existed). This is a repo-wide footgun for any future
  validator invocation, not specific to this chain.
- **Think/Plan's own architecture checks missed the adapter-gate gap entirely.** Both
  `architecture-decision-advisor` (Think) and the Plan's own repo-impact-map pass concluded
  the design was sound, without ever asking "what else reads `workflow/router.md` as a bare
  path, besides the validators." The gap wasn't found until Review manually re-read files
  nobody had scoped as in-scope. The power skills meant to catch exactly this kind of
  cross-cutting blind spot (system-design-advisor, repo-alignment-scan) ran and recorded
  "no issue found" — they didn't actually surface it.
- **The Manifest-ID parser's naive regex produced 3 separate false positives/negatives in
  this one chain alone** — parenthetical qualifiers on a Manifest IDs line
  (`RI2 (partial)`), a `\bR7\b` match inside `WP-R7-T7.2`, and a `\bR6\b` match inside plain
  prose ("so R6 has an explicit phase-map entry"). Each required a same-session artifact
  rewording rather than a structural fix, because the underlying regex (`\b(R(?:I)?[0-9]+)\b`
  across whole sections) has no way to distinguish a real coverage claim from incidental text.
- **A wrong assumption about testability made it into the Plan.** Phase 3/7's exit-gate
  wording assumed piped stdin could exercise the migration prompt's accept/decline branches —
  it can't (piped ≠ TTY), discovered only when actually writing the automated test in Build.

## Surprises

- Piped stdin failing closed even with `y` explicitly piped in was unexpected — a genuinely
  good surprise, since it means the fail-closed property is stronger than the design
  intended to require (it wasn't deliberately engineered to resist "accidentally piped
  input," it just does, as a side effect of gating on `isTTY`).
- Page 10 (Sandbox Testing Plan)'s Scenario B needed a far more substantial rewrite than the
  brief anticipated — R6 was scoped as "update the Current Machine State table, install
  command block, Scenarios A/B/E," but reading the actual page revealed Scenario B's entire
  premise (a distinct "system-level install" act, run against `JeelVankhede.github.io`) had
  been quietly obsoleted by R2's own default-linking behavior, requiring a real redesign of
  that scenario's targets and sequencing, not just a text-level `--system`→`prepare` swap.

## Manifest Coverage Retrospective

| Manifest ID | Outcome | Evidence path | Notes |
|---|---|---|---|
| R1 | shipped | `workflow/artifacts/ship/init-prepare-interop-v1.md` Requirement Coverage | `prepare` command; `--system` removed outright |
| R2 | shipped | Same, + `workflow/artifacts/verify/init-prepare-interop-v1.md` Manual QA | Fixed post-Review (P1-01) — closed with direct evidence |
| R3 | shipped | Ship Requirement Coverage | |
| R4 | shipped | Ship Requirement Coverage | A3 confirmed, no code change |
| R5 | shipped | Ship Requirement Coverage + Notion page 02 | Local doc + external invariant record both updated |
| R6 | shipped | Ship Source-of-Truth Status | Notion pages 02 + 10 updated directly at Ship |
| R7 | shipped | Ship Requirement Coverage | Migration audit/prompt/clean, pty-verified + automated (non-TTY branch) |
| RI1 | shipped | Ship Release Readiness (fresh re-run) | Full suite green at every phase transition |
| RI2 | shipped | Ship Requirement Coverage | Fixed post-Review — adapters substantively consistent, not just textually clean |
| RI3 | shipped | Ship Requirement Coverage | No new dependency |
| RI4 | shipped | Ship Requirement Coverage | No schema change |
| RI5 | shipped | Ship Requirement Coverage | Same mechanism as R7 |

No post-ship issues to date — too early in the chain's life (not yet merged to `main`) for
any to have surfaced.

## Deferred

none — every manifest ID in scope for this chain shipped. (OI-21, the separate
`init`-as-scaffold-only idea the user raised during Review, was never in this chain's scope —
tracked independently, see Follow-Ups.)

## Source-of-Truth Outcome

Updated. Notion page 02 ("02 — Technical Decisions (Invariants)",
`https://app.notion.com/p/384972bdebbb81d38b4dec9c4bdd67eb`) and page 10 ("10 — Sandbox
Testing & Verification Plan", `https://app.notion.com/p/39b972bdebbb818fac26f3be928dc403`)
both edited directly this chain's Ship phase, re-fetched post-edit to confirm. Full detail in
`workflow/artifacts/ship/init-prepare-interop-v1.md`'s Source-of-Truth Status section.

## Learning Candidates

- **Candidate learning**: When a Build phase changes which files a gate/entrypoint mechanism
  expands or stops expanding, Think or Plan must explicitly enumerate every *downstream
  reader* of the affected path — not just the mechanism producing/consuming it. The adapter
  gate templates were a downstream reader of "does `workflow/router.md` exist locally" that
  no architecture check in this chain's Think/Plan enumerated; only Review's direct
  file-by-file re-read caught it. — source: `workflow/artifacts/reviews/init-prepare-interop-v1.md`
  P1-01 — propose-only.
- **Candidate validator update**: `check-phase-map.mjs` and `check-scope-fence.mjs`'s
  manifest-ID extraction (`\b(R(?:I)?[0-9]+)\b` scanned across whole prose sections) produced
  3 separate false positives/negatives in this one chain — matching inside `WP-R7-T7.2`,
  inside plain prose ("...R6 has..."), and failing on `RI2 (partial)`'s parenthetical. Worth
  hardening to require the ID token to be the whole line-item or explicitly delimited,
  rather than any substring match. — source: `workflow/artifacts/tasks/init-prepare-interop-v1.md`
  Blockers (resolved), `workflow/artifacts/reviews/init-prepare-interop-v1.md` Verification
  Reviewed — propose-only.
- **Candidate learning**: a single-session, first-person "agent literally follows the written
  instruction, using the same tools a real session would use" dry run is legitimate,
  reproducible manual QA evidence for gate/instruction-following claims — worth naming as a
  recognized pattern in `manual-qa-policy.md` (e.g. "agent-in-the-loop dry run") rather than
  reinventing it ad hoc the next time an instruction-following claim needs closing.
  — source: `workflow/artifacts/verify/init-prepare-interop-v1.md` Manual QA — propose-only.

## Follow-Ups

| Action | Owner | Suggested Artifact Or Ticket | Status |
|---|---|---|---|
| Run Sandbox Testing Plan (Notion page 10) Scenarios A–E for real, now that WP-R7's blocking gap (P1-01) is fixed and the page itself has been updated to match | user | Notion page 10 itself — no new artifact needed, it's ready to execute | open |
| Harden `check-phase-map.mjs`/`check-scope-fence.mjs`'s manifest-ID extraction regex to avoid the 3 false-positive/negative classes found this chain | user/agent | New Trivial/Standard brief scoped to `src/workflow/validators/` only | open |
| Pick up OI-21 (init-as-scaffold-only + TUI questionnaire spike) | user | Notion research spike, mirroring the WP-R7 spike page's format | open (already in `open-items.yaml`, referenced here for chain-narrative completeness) |

## Raw Session Entry

See `workflow/learnings/sessions/2026-07-17-init-prepare-interop.md`.

## Architecture Notes

- role: Project Manager
- decision: Recorded two new follow-ups (Sandbox Testing unblock, validator regex hardening)
  as new `open-items.yaml` entries rather than only narrating them here — both are concrete,
  actionable, and would otherwise only live in this one reflect artifact's prose.
- constraint: Did not promote any of the 3 learning candidates into
  `workflow/learnings/curated.md` — no curation request was made this session.
- tradeoff: Considered folding the validator-regex-hardening follow-up into the Sandbox
  Testing one (both are "housekeeping found during this chain") — kept separate since they
  have different owners in practice (validator hardening is squarely `agent`-executable;
  Sandbox Testing requires the user's own machine and real external repos).
- downstream: Whoever picks up the validator-hardening follow-up should treat this chain's
  task/review artifacts as the fixture — the exact 3 false-positive strings are already
  documented there, no need to re-derive them.

## Exit Gate

- [x] Manifest Coverage Retrospective has one row per active R and RI (12 of 12).
- [x] Every follow-up has a named owner and suggested artifact title.
- [x] Learning candidates tagged propose-only (all 3).
- [x] orchestration.status: done, next_phase: done.

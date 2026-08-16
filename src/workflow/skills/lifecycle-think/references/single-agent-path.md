# Single-Agent Path (preserved)

The pre-WP-R21 Think workflow, preserved **verbatim** as a rollback surface for one release.

## Why this file exists

WP-R21 restructured Think into a staged pipeline with a council and a round loop. If that pipeline
turns out to be broken, disabling the council is not a rollback — a mode of a broken pipeline is
still the broken pipeline. This file is the actual fallback: the workflow exactly as it ran before
R21, so it can be followed directly without reconstructing it from memory or from git history.

Reconstruction is the failure this guards against. A "preserved" path that is re-derived rather than
copied silently drifts into a paraphrase, and a paraphrase is not a rollback either. A conformance
check byte-compares the numbered steps below against the pre-R21 text; if they diverge, that check
fails.

## When to use it

- `council.enabled` resolves to `disabled`, or `dispatch.enabled` resolves to `disabled`
- the task class is Trivial or Standard — these never ran a council and are unaffected by R21
- the staged pipeline is malfunctioning and you need Think to produce a valid brief anyway

Using this path is not a waiver and needs no approval. It produces the same artifact against the same
output schema; only the route differs. Record which path ran in the brief's council log, so a reader
can tell a single-agent brief from a council one.

## Removal

Scheduled for **1.2.0** (brief A5, user-approved 2026-08-16). Ship must carry this onto the 1.2.0
release checklist alongside OI-67's `warn-until-1.2.0` marker cleanup. A preserved path nobody
removes becomes permanent dead weight, and the reason it was kept expires when the pipeline has a
release of real use behind it.

## The preserved workflow

1. Classify task as Trivial, Standard, or Complex.
2. Determine slug and version. Reuse the active slug where possible; bump version for material scope change.
3. Inspect available source, repo, and config context before asking questions. Evaluate the
   `repo-alignment-scan`, `architecture-decision-advisor`, and `constraint-conflict-scan` trigger
   predicates against recorded signals; run each that evaluates true and record a
   `skill_trigger_log` entry for every evaluated trigger (ran or skipped, with reason).
4. Extract explicit requirements as `R` IDs.
5. Derive implicit requirements as `RI` IDs from repo contracts, domain config, source-of-truth expectations, compatibility, generated output, verification, release, and safety.
6. Record assumptions as `A` IDs only when proceeding is safe.
7. Record open decisions as `Q` IDs. Copy blocking `Q` IDs into `orchestration.blockers`.
8. Define concrete acceptance criteria for every active `R` and `RI`.
9. Add architecture notes covering role, decisions, constraints, tradeoffs, assumptions, and downstream impact.
10. Write or update `workflow/artifacts/briefs/<slug>-v<N>.md`.
11. Set `orchestration.status` to `blocked-for-user` when questions remain, otherwise `ready-for-next-phase` with `next_phase: plan`.

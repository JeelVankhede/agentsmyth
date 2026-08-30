# Single-Agent Path (preserved)

The Review workflow as it stood before councils were introduced, preserved **verbatim** as a
rollback surface for one release.

## Why this file exists

Review was restructured into a two-mode phase with a council and a challenge pass. If that pipeline
turns out to be broken, disabling the council is not a rollback — a mode of a broken pipeline is
still the broken pipeline. This file is the actual fallback: the workflow exactly as it ran before
the Review council, so it can be followed directly without reconstructing it from memory or from git
history.

Reconstruction is the failure this guards against. A "preserved" path that is re-derived rather than
copied silently drifts into a paraphrase, and a paraphrase is not a rollback either. A conformance
check byte-compares the numbered steps below against the pre-council text; if they diverge, that
check fails.

## When to use it

- `council.enabled` resolves to `disabled`, or `dispatch.enabled` resolves to `disabled`
- the task class is Trivial or Standard — these never ran a council and are unaffected
- the diff is unavailable, or the risk categories cannot be assigned disjointly
- the staged pipeline is malfunctioning and you need Review to produce a valid verdict anyway

Using this path is not a waiver and needs no approval. It produces the same artifact against the
same output schema; only the route differs.

**Record the mode in FRONTMATTER, not in a Council Log.** Write `council: {mode: single-agent}` and
omit the `## Council Log` section entirely — the output schema requires that section only in council
mode, and a Council Log with no council block is rejected. Frontmatter is what makes the two modes
distinguishable without reading the body, which is the property the requirement actually asks for.

## Removal

Scheduled for removal in the next minor release, alongside the other deprecation-marker cleanup. A
preserved path nobody removes becomes permanent dead weight, and the reason it was kept expires once
the pipeline has a release of real use behind it.

## The preserved workflow

1. Ground the review in the active manifest IDs, plan phase, task evidence, and diff target.
2. Inspect actual changed files and relevant unchanged context.
3. Review generated-output changes against their configured source or regeneration path.
4. Review source-of-truth handling against configured source policy and task evidence.
5. Review verification evidence: exact commands, manual QA, generated-output checks, skipped checks, and not-run risks.
6. Run a blocking pass for missing requirements, contract mismatch, data loss, security risk, compatibility break, generated-output drift, release risk, and invalid lifecycle state.
7. Run a non-blocking pass for maintainability, docs gaps, unclear evidence, and follow-up-worthy cleanup.
8. Map every active `R` and `RI` to `covered`, `partial`, or `missing`.
9. Write `workflow/artifacts/reviews/<slug>-v<N>.md` with findings first, severity summary, requirement coverage, architecture notes, verification reviewed, residual risk, and recommendation.
10. Set `orchestration.status` to `blocked` when findings require Build changes, otherwise `ready-for-next-phase` with `next_phase: test`.

# Chain Walker

Walk the lifecycle chain in canonical order:

1. `.workflow/artifacts/briefs/<slug>-v<N>.md`
2. `.workflow/artifacts/plans/<slug>-v<N>.md`
3. `.workflow/artifacts/tasks/<slug>-v<N>.md`
4. `.workflow/artifacts/reviews/<slug>-v<N>.md`
5. `.workflow/artifacts/verify/<slug>-v<N>.md`
6. `.workflow/artifacts/ship/<slug>-v<N>.md`
7. `.workflow/artifacts/reflect/<slug>-v<N>.md`

For each artifact, capture:

- exists/missing
- status
- `orchestration.phase`
- `orchestration.status`
- `orchestration.next_phase`
- blockers
- user checkpoint
- upstream links
- manifest IDs

Prefer frontmatter over filename inference. Missing artifacts are state evidence, not an error by themselves.

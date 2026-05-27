# Review Exit Gate

- [ ] Durable review artifact exists at `.workflow/artifacts/reviews/<slug>-v<N>.md`.
- [ ] Findings lead the artifact and say `none` when no findings exist.
- [ ] Findings are ordered by severity, then path or area.
- [ ] Every finding includes severity, path or area, affected manifest ID when applicable, problem, and fix recommendation.
- [ ] Requirement Coverage has one row per active `R` and `RI`.
- [ ] Missing or partial coverage appears as a finding or residual risk.
- [ ] Verification Reviewed names exact evidence inspected and outcome.
- [ ] Residual risk is explicit even when no findings exist.
- [ ] Recommendation is `pass`, `pass-with-risk`, or `hold`.
- [ ] `orchestration.next_phase` is `test` when unblocked.

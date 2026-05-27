# Verify Exit Gate

- [ ] Verify artifact exists at `.workflow/artifacts/verify/<slug>-v<N>.md`.
- [ ] Manifest Coverage has one row per active `R` and `RI`.
- [ ] Each active `R` and `RI` has pass, fail, skip, or waived evidence.
- [ ] Automated Checks lists every command run or intentionally not run.
- [ ] Manual QA states `not applicable` when unused.
- [ ] Generated Output Evidence states `not applicable` when unused.
- [ ] Skipped Checks name reason, risk, owner, and Ship impact.
- [ ] Findings say `none` when no findings exist.
- [ ] Sign-Off includes verifier, date, and recommendation.
- [ ] Recommendation is `ship`, `hold`, or `hold-with-waiver`.
- [ ] `orchestration.next_phase` is `ship` when unblocked.

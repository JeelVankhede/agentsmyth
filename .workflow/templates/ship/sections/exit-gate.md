# Ship Exit Gate

- [ ] Ship artifact exists at `.workflow/artifacts/ship/<slug>-v<N>.md`.
- [ ] Recommendation is `ship`, `hold`, or `hold-with-waiver`.
- [ ] Requirement Coverage has one row per active `R` and `RI`.
- [ ] `ship` has evidence for every configured required gate and no active unwaived blocked handoff.
- [ ] `hold` records blocker, owner, risk, and exact next action.
- [ ] `hold-with-waiver` records explicit user acceptance of risk, owner, and follow-up.
- [ ] PR, CI, release, deployment, docs, and source status are explicit when configured or marked not applicable.
- [ ] Rollback trigger, action, and owner are explicit or marked not applicable.
- [ ] No external action is claimed without evidence.
- [ ] `orchestration.next_phase` is `reflect` only for `ship` or accepted `hold-with-waiver`.

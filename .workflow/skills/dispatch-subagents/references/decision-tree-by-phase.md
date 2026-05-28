# Decision Tree By Phase

Use this phase decision tree:

- Think: allow read-only exploration only with explicit authorization and independent context questions.
- Plan: allow read-only exploration only with explicit authorization and independent requirement/risk buckets.
- Build: allow write workers only with explicit authorization and disjoint ownership.
- Review: allow read-only review workers only with explicit authorization and independent risk categories.
- Test: do not dispatch; evidence is state-dependent.
- Ship: do not dispatch; release/source state is authoritative and sequential.
- Reflect: do not dispatch; synthesis and learning capture stay with the parent agent.

If a phase is not listed or the phase is unclear, do not dispatch.

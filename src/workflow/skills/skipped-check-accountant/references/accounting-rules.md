# Accounting Rules

What counts as "actually run" versus "assumed" for a verification row.

**Actually run (evidenced):**

- Current-turn command output pasted or cited in the artifact.
- Manual QA with all `verification.yaml`-required fields filled (`scenario`, `environment`,
  `steps`, `expected`, `observed`, `outcome`, `evidence`, `manifest_ids`) — `observed` must
  describe what actually happened, not what was expected to happen.
- Generated-output verification with a cited source mapping and inspection method.

**Assumed (not evidenced) — must be accounted as skipped/blocked, not passed:**

- "This should still work since nothing related changed."
- A row carrying only the requirement description with no distinct evidence field.
- A command shown without its output, or with output from a prior session not re-confirmed.
- A manual QA row missing `observed` or where `observed` merely restates `expected`.

**`blocks_ship` consistency:**

A skipped check whose `risk` field describes a high-impact scenario (data loss, security,
breaking change) but sets `blocks_ship: no` is an inconsistency worth flagging — not automatically
wrong (a low-likelihood high-impact risk can be legitimately non-blocking with the right
justification), but it must not pass through unexamined.

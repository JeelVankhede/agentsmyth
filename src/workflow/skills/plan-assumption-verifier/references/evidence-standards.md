# Evidence Standards

What counts as sufficient evidence to mark an assumption `evidence-backed`.

Acceptable:

- A file's existence and content, inspected this session (`Read`/`cat`, not recalled).
- A config value read directly from `workflow/config/*.yaml`.
- A command's real, current-turn output.
- A schema constraint read directly from the relevant `.schema.yaml`.

Not acceptable:

- "This is probably how it works" without inspection.
- A citation to a prior session's memory, not re-verified this turn.
- An assumption about user intent or product policy — these are never safe assumptions regardless
  of evidence; they must be raised as a `Q` ID with `owner: user` (matches the existing Think-phase
  `assumption-policy.md` rule, applied identically here).

When evidence contradicts the original assumption, do not quietly correct the assumption text and
mark it backed — raise a `Q` ID noting the discrepancy, since the contradiction itself may be
material to scope or approach.

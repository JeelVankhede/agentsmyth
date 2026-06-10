# Exemplar

## Good Example

A good Ship status is evidence-based:

```markdown
## Ship Status

- Recommendation: hold
- Review result: pass-with-risk, `.workflow/artifacts/reviews/example-v1.md`
- Verification recommendation: hold-with-waiver requested, `.workflow/artifacts/verify/example-v1.md`
- PR / CI: required by release config, no PR URL available
- Source-of-truth: blocked, exact update target missing
- Release: not ready
```

A good blocked handoff is copy-ready:

```markdown
## Blocked Handoff

- Blocker: Source-of-truth update target is unknown.
  Owner: user
  Exact handoff: Provide the source item URL or confirm that source updates are waived for this lifecycle run.
  Risk: Reflect cannot claim external tracking is current.
```

Do not mark `ship` when required evidence is missing. Use `hold` until the gate is satisfied or the user accepts a waiver.

## Bad Example

```markdown
## Ship Status

- Recommendation: ship
- Review result: pass, `.workflow/artifacts/reviews/example-v1.md`
- Verification recommendation: ship, `.workflow/artifacts/verify/example-v1.md`
- PR / CI: required by release config, no PR URL available
- Source-of-truth: update pending
- Release: ready
```

## Why The Bad Is Bad

- `ship` is set while "no PR URL available" — release config requires a PR gate but no evidence exists. The correct recommendation is `hold`. Setting `ship` here means Reflect will record a shipped outcome that no gate supported, and a future restore-context invocation will find a claimed `ship` contradicted by missing PR evidence.
- "Source-of-truth: update pending" is not a gate status — it does not say whether the update happened, was blocked, or was waived. Reflect inherits an ambiguous handoff that it cannot resolve from evidence alone.
- "Release: ready" without citing branch name, version string, deployment config reference, or any inspected file is a claim without proof. If the release config names specific gates, each one must appear with evidence or a recorded waiver — not a summary assertion.

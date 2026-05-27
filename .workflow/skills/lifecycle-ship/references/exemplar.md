# Exemplar

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

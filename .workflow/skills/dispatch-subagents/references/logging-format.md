# Logging Format

Log every actual dispatch in the active phase artifact.

Default table:

```markdown
## Dispatch Log

| Work Delegated | Agent Type | Cap Slot | Ownership | Result | Merged Into |
|---|---|---:|---|---|---|
| <work> | explorer / worker / worker-readonly | 1 of N | <files/risk/requirement> | <summary> | <artifact section or path> |
```

For refused dispatch that affects the artifact:

```markdown
Dispatch decision: do-not-spawn
Reason: <reason>
Local execution path: <what parent will do>
```

Rules:

- Log dispatch before relying on output.
- Parent agent updates Result and Merged Into after integration.
- Unsupported output is logged as not merged.

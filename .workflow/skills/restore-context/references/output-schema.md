# Output Schema

Restore output is read-only and chat-facing. Do not write files.

```markdown
## Context Header

- Slug:
- Version:
- Resolved from:
- Confidence: high / medium / low

## Lifecycle Chain

| Artifact | Path | Status | Orchestration | Notes |
|---|---|---|---|---|
| Brief | `.workflow/artifacts/briefs/<slug>-v<N>.md` |  |  |  |
| Plan | `.workflow/artifacts/plans/<slug>-v<N>.md` |  |  |  |
| Task | `.workflow/artifacts/tasks/<slug>-v<N>.md` |  |  |  |
| Review | `.workflow/artifacts/reviews/<slug>-v<N>.md` |  |  |  |
| Verify | `.workflow/artifacts/verify/<slug>-v<N>.md` |  |  |  |
| Ship | `.workflow/artifacts/ship/<slug>-v<N>.md` |  |  |  |
| Reflect | `.workflow/artifacts/reflect/<slug>-v<N>.md` |  |  |  |

## Current State

- Current phase:
- Status:
- Next phase:
- User checkpoint:
- Last recorded action:
- Latest evidence:

## Requirement Coverage

- Brief manifest:
- Downstream coverage:
- Missing or deferred IDs:

## Blockers

- Questions:
- Exit gate:
- Repo:
- Source/release:
- User answer status:

## Repo Status

| Branch | Status | Notes |
|---|---|---|
|  | clean / dirty / not checked / inaccessible |  |

## External / Source Context

- Source-of-truth:
- GitHub/PR/CI:
- Release:
- Docs:

## Learning Context

- Curated learnings:
- Raw sessions:

## Inconsistencies

- none

## Recommended Next Action

- Action: lifecycle-think / lifecycle-plan / lifecycle-build / lifecycle-review / lifecycle-test / lifecycle-ship / lifecycle-reflect / complete / blocked
- Reason:
- Before continuing:
```

Acceptance criteria:

- slug/version confidence is explicit
- artifact chain includes every lifecycle artifact type
- current phase is evidence-derived
- blockers and inconsistencies are surfaced before recommendation
- external state is not claimed without evidence
- no files are edited

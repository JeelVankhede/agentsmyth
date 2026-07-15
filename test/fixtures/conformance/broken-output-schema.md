# Output Schema (fixture — seeded broken starter block)

## Starter Block

```markdown
---
slug: <slug>
version: 1
artifact: plan
status: draft
created: <YYYY-MM-DD>
updated: <YYYY-MM-DD>
manifest_ids: []
upstream:
  brief: workflow/artifacts/briefs/<slug>-v<N>.md
orchestration:
  phase: plan
  status: blocked-for-user
  next_phase: build
  blockers: []
  user_checkpoint: plan-review
---

# <Title> - Plan
```

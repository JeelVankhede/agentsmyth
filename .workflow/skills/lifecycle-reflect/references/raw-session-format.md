# Raw Session Format

Write raw learning sessions to:

```text
.workflow/learnings/sessions/<YYYY-MM-DD>-<slug>.md
```

Required frontmatter:

```yaml
slug:
version:
artifact: learning-session
date:
source: lifecycle-reflect
upstream:
  - .workflow/artifacts/reflect/<slug>-v<N>.md
```

Required sections:

```markdown
# Raw Learnings - <slug> v<N>

## Context

## Candidate Learnings

## Raw Notes

## Curator Marks

- promoted-to-curated: none
- consolidated-with: none
- rejected-as-not-general: none
```

Rules:

- Raw sessions are append-only.
- Do not edit prior sessions to rewrite history.
- Use a unique filename if the date/slug already exists.
- Curator Marks remain empty unless a later curation pass updates them.

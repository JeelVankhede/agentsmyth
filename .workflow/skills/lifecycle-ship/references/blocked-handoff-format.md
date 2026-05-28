# Blocked Handoff Format

Use blocked handoff when Ship cannot complete a required external action.

Required format:

```markdown
- Blocker: <what is blocked>
  Owner: <person, role, team, or configured owner>
  Exact handoff: <copy-ready action, command, source update text, or request>
  Risk: <what remains unsafe or stale>
  Affected IDs: <R/RI IDs>
  Blocks Ship: yes / no / waiver-required
```

Rules:

- Be specific enough that a human can act without rereading the whole chain.
- Include source links, PR branch, release item, or config path when known.
- Do not use vague handoff such as "update tracking".
- If the handoff blocks an active requirement, recommendation is `hold` unless waived.

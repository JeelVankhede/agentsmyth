# Artifact Reader

Read artifacts for state, not narrative memory.

Extract:

- frontmatter values
- Requirement Manifest IDs
- acceptance criteria
- coverage tables
- findings and severities
- verification outcomes
- skipped checks and waivers
- ship recommendation
- blocked handoff entries
- reflect follow-ups

Rules:

- Do not assume body text is current when frontmatter says blocked or draft.
- Treat unresolved `Q` IDs as blockers unless waived.
- Treat missing acceptance criteria as an inconsistency.
- Treat mismatched upstream links as an inconsistency.
- Cite exact artifact paths in the restore summary.

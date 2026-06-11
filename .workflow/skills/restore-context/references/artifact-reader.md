# Artifact Reader

Read artifacts for state, not narrative memory.

## Read Order

Walk the artifact chain in this sequence. Stop when an artifact is missing and record the gap.

1. brief
2. plan
3. task (all `-p<N>` variants when present)
4. review
5. verify
6. ship
7. reflect

## Extract

From every artifact:

- frontmatter values (`slug`, `version`, `artifact`, `status`, `manifest_ids`, `upstream`, `orchestration`)
- Requirement Manifest IDs and acceptance criteria (brief only)
- coverage tables (review, verify, reflect)
- findings and severities (review)
- verification outcomes and skipped checks (verify)
- ship recommendation and gate statuses (ship)
- blocked handoff entries (ship)
- follow-up table and learning candidates (reflect)
- architecture notes role and key decisions

## Do Not Extract

Do not treat the following as current durable state — they are narrative and may be outdated:

- prose in the Problem, Goals, or Approach sections
- human-readable phase descriptions in Plan
- implementation notes in the Build task's Implementation Log
- commit messages or branch names inferred from prose
- any text that contradicts the frontmatter `status` field

## Rules

- Do not assume body text is current when frontmatter says `blocked` or `draft`.
- Treat unresolved `Q` IDs with no waiver as active blockers.
- Treat missing acceptance criteria on active `R` or `RI` IDs as an inconsistency.
- Treat mismatched `upstream` links as an inconsistency.
- Treat `manifest_ids` in frontmatter as authoritative; cross-check against body coverage tables.
- Cite exact artifact paths in the restore summary.

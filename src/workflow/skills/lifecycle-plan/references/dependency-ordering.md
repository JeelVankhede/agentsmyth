# Dependency Ordering

Plan phases should be ordered so later work depends on earlier decisions, not guesses.

Preferred ordering:

1. Source-of-truth alignment and blocker resolution.
2. Contract or schema changes.
3. Implementation changes.
4. Generated-output updates or regeneration.
5. Tests, docs, and evidence collection.
6. Release, handoff, and closure planning.

Ordering rules:

- Put high-risk or contract-setting changes before dependent edits.
- Keep each Build phase independently reviewable and value-bearing.
- Do not create a phase with no manifest IDs.
- Do not put PR/CI/release/source publication into Build unless the user explicitly approved that lifecycle exception.
- If two changes can be parallelized, still define a deterministic integration order.

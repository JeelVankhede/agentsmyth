# Method Taxonomy

Recognized verification method types, matching `verification.yaml`'s `evidence_types`.

- **command** — a configured or discovered shell command with current-turn output.
- **manual** — manual QA with environment, steps, expected, observed, outcome, evidence.
- **generated-output** — a generated file checked against its source or regeneration path.
- **review** — a Review finding or coverage statement, cited by artifact path/section.
- **source** — a source-of-truth read/update check.
- **release** — a release or rollback readiness check.
- **waiver** — an explicit, complete waiver (all 6 fields), not a bare "skipped."

A row naming anything outside this taxonomy (e.g. "tested", "checked", "verified" with no further
detail) is treated as method-less — the taxonomy exists precisely so "how verified" always answers
a concrete question, not a vague assertion.

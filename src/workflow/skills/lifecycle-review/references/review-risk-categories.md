# Review Risk Categories

Consider these categories during Review:

- requirement: explicit or implicit requirement not implemented
- contract: public API, documented behavior, config contract, schema, or artifact contract break
- generated-output: generated files, snapshots, examples, adapter output, or derived artifacts drift from source
- verification: missing, failed, skipped, vague, or untrusted evidence
- source-of-truth: source read/update/handoff mismatch
- release: PR, CI, deployment, publishing, rollback, or handoff risk
- security: secrets, unsafe defaults, destructive operations, permissions, or untrusted input
- compatibility: behavior or file layout breaks existing users
- maintainability: excessive complexity, unclear ownership, fragile coupling, or hard-to-review scope
- lifecycle: invalid artifact state, blockers not mirrored, wrong next phase, or missing architecture notes

Use categories to guide review coverage; do not include category labels unless they make findings clearer.

## Assignment in council mode

These ten are the assignment surface for a Review council's reviewers. They are not re-derived per
run, and a council does not invent its own.

**Categories are partitioned disjointly across reviewers.** Two reviewers holding the same category
read the same ground twice and leave another category unread — the cost of overlap here is a gap
somewhere else, not merely duplicated effort. The assignment is recorded in the review's Council Log
so coverage is auditable rather than asserted.

**Files are not partitioned.** Two reviewers may read the same file through different categories — a
schema change is `contract` to one and `compatibility` to another — and that overlap is the design
working, not a violation of independence. Only the categories are exclusive.

A category assigned to nobody, whether because the cap is smaller than ten or because a member
failed, is recorded as a skipped check with the fields `verification.yaml` requires. A council that
covered six categories and says nothing reports the same coverage as one that covered ten.

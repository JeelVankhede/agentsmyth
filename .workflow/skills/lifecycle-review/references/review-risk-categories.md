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

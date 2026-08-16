# Validators

Validator scripts provide lightweight contract checks using plain Node.js and repository-local files.

Run from the repository root:

```text
node workflow/validators/check-config.mjs
node workflow/validators/check-starter-blocks.mjs
agentsmyth check --phase <phase> --slug <slug>
node workflow/validators/check-artifacts.mjs
node workflow/validators/check-domain-placeholders.mjs
node workflow/validators/check-waivers.mjs
node workflow/validators/check-coverage-ledger.mjs
node workflow/validators/check-evidence-citations.mjs
node workflow/validators/check-scope-fence.mjs
node workflow/validators/check-manifest-coverage.mjs
node workflow/validators/check-skipped-accounting.mjs
node workflow/validators/check-release-readiness.mjs
node workflow/validators/check-skill-triggers.mjs
node workflow/validators/check-phase-map.mjs
node workflow/validators/check-assumptions.mjs
node workflow/validators/check-verify-matrix.mjs
node workflow/validators/check-followups.mjs
node workflow/validators/check-open-items.mjs
node workflow/validators/check-constraint-conflicts.mjs
```

Most of the artifact-scanning checks above accept a `--dir <path>` override (matching
`check-artifacts.mjs`) for fixture testing, e.g. `node workflow/validators/check-waivers.mjs --dir test/fixtures/lifecycle-violations/e-waiver-missing-field`.

The lifecycle phase gate (`check-lifecycle.mjs`) is invoked via `agentsmyth check` so that
the CLI can resolve the validator from either the repo-local or global definitions root.

## Checks

- `check-config.mjs` checks config files against their matching schema contracts.
- `check-starter-blocks.mjs` checks that each lifecycle skill's `references/output-schema.md` contains a Starter Block section.
- `check-lifecycle.mjs` checks lifecycle chain consistency across config, artifacts contracts, and frontmatter schema enums.
- `check-artifacts.mjs` checks any real artifacts under `workflow/artifacts/`.
- `check-domain-placeholders.mjs` scans tracked active files for placeholder markers and reference-specific leakage.
- `check-waivers.mjs` checks every `## Waivers` table row carries all 6 fields required by `agent-behavior.yaml`'s `waivers.required_fields`.
- `check-coverage-ledger.mjs` checks every manifest ID in a plan/review/ship/reflect artifact's frontmatter has a row in its coverage table.
- `check-evidence-citations.mjs` checks evidence-bearing tables (Command Results, Automated Checks, Verification Items, Verification Reviewed) have no empty cells.
- `check-scope-fence.mjs` checks a task artifact's Changed Files are covered by its upstream plan's declared Touches.
- `check-manifest-coverage.mjs` checks a review artifact's declared `manifest_ids` match its upstream task's Changed Files coverage.
- `check-skipped-accounting.mjs` checks Skipped Checks rows are complete and cross-references not-run/blocked Automated Checks against them.
- `check-release-readiness.mjs` checks a ship artifact's Ship Status declares one of ship/hold/hold-with-waiver consistently with blockers and review severity.
- `check-skill-triggers.mjs` checks `skill_trigger_log` frontmatter entries are complete (skill, decision, reason).
- `check-phase-map.mjs` checks every active `R`/`RI` in a plan's `manifest_ids` is covered by exactly one `### Phase N` block's stated Manifest IDs (directly or via a hyphenated sub-label), and that every phase declaring manifest IDs has exit-gate content.
- `check-assumptions.mjs` checks every brief-declared `A` ID has a corresponding `## Assumptions Verified` row in the downstream plan, with a non-empty evidence-backed or raised-as-question status.
- `check-council-record.mjs` validates the **record** a council run leaves behind (WP-R21). Checks: presence symmetry between the frontmatter `council:` block and the body `## Council Log`; a `refused` mode carries a refusal reason; council mode carries authorization, resolved cap, `cap_source`, dispatch depth, rounds run, and termination reason; dispatch depth is 1; per-stage fan-out is within the resolved cap; fan-out is non-increasing across rounds; a round that shrank fan-out is corroborated by a decrease in open items; every round after the first records a sizing rationale; a run that terminated `max-rounds` with an item that survived every round is rejected; every finding is attributed and carries a valid evidence class and disposition; `rejected-with-reason` has a non-empty reason; `repo` citations resolve on disk and any line range is within bounds; `trial` citations carry a command and observed output; `web` citations carry URL, retrieval date, and a verbatim quote; a `### Conflicts` subsection exists even when empty; a surface holding both accepted and rejected findings has a Conflicts entry; a round containing `web` findings records a challenger spot-check; a recommendation resting only on `recall` is rejected; and every finding's class has a recorded availability status. Emits a summary line on success — rounds, findings, rejections, uncorroborated `recall`, and citations mechanically resolved versus shape-checked only.

  **What `check-council-record.mjs` does not check.** Stated plainly, because a validator this specific invites the assumption that it guarantees more than it does:

  - whether a finding is **correct**. Disposition and evidence class describe provenance, not truth.
  - whether the council found what a **human would have found**. Absent research is invisible to a record of research that happened.
  - whether a rejection reason is a **good** reason. Only that one was given.
  - whether a `web` quote was genuinely **present** at the cited URL. agentsmyth ships no HTTP client and cannot fetch it. A fabricated quote on an external fact that the challenger did not sample passes every check in this system.
  - whether a resolving `repo` citation actually **informed** the finding it is attached to. Resolution raises the cost of fabrication; it does not eliminate it.
  - whether a member wrote **outside both the repo and its configured sandbox**. agentsmyth is a workflow contract, not a sandbox runtime, and cannot confine a process it does not spawn.

  A green result means the record is well-formed and internally consistent. It does not mean the thinking was good.
- `check-verify-matrix.mjs` checks a verify artifact's `## Manifest Coverage` has a row with a named method for every active manifest ID, and no `pass` row with empty evidence.
- `check-followups.mjs` checks every row in a reflect artifact's `## Follow-Ups` table has a non-empty, non-`TBD` owner.
- `check-open-items.mjs` checks `workflow/artifacts/open-items.yaml` against its schema when present; exits 0 with an informative message when absent.
- `check-constraint-conflicts.mjs` checks every constraint-ID citation in a brief's `## Open Questions (Q)` section resolves to a real ID present in `domain.yaml`'s bracket-prefixed constraint arrays.

`check-config.mjs` does two things beyond plain schema validation, both for per-repo behavior
tuning (WP-R8). It enforces the **checkpoint union rule** — a repo's
`tuning.pause_resume.user_checkpoint_required_for` must contain every checkpoint the global
`agent-behavior.yaml` requires, since that list is append-only and resolves by union rather than
override; a repo may add checkpoints, never remove one. And it checks **`intent.derived_keys`
provenance**: every dotted key listed there must still exist under `tuning:`, so a later upgrade can
tell a derived value it may safely re-derive from a hand-set one it must not overwrite. A stale
entry means the two have drifted, which nothing else in the system would notice.

Neither check carries a list of tunable keys. The enumeration lives solely in
`repo-profile.schema.yaml`, under closed objects — anything not named there is rejected as an
unknown property. Keeping one enumeration in one place is deliberate: a second copy here would be
free to drift from the first.

`check-schema-keywords.mjs` fails when a shipped schema uses a JSON Schema keyword that
`validateSchema` does not implement. It exists because three engine gaps surfaced by accident in a
single work package: `maximum` was parsed and ignored (a schema declaring `maximum: 10` accepted
99), schema-valued `additionalProperties` was parsed and ignored (three open maps were never
validated at all), and `if`/`then` was parsed and ignored (seven conditional branches in
`lifecycle-artifact.schema.yaml` were decoration). In every case an author wrote a declaration in
good faith, it silently had no effect, and nothing reported it — the declaration looked like a
contract and was not one. A documented list of supported keywords would drift the moment someone
edited the engine; this check cannot. Adding a keyword to `validateSchema` means adding it to this
validator's `SUPPORTED` set, and that deliberate step is the point.

These validators are conservative contract checks. They do not replace code tests, manual QA, source-of-truth verification, release evidence, or human review.

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
```

The WP-R4 Wave 1 checks above all accept a `--dir <path>` override (matching `check-artifacts.mjs`)
for fixture testing, e.g. `node workflow/validators/check-waivers.mjs --dir test/fixtures/lifecycle-violations/e-waiver-missing-field`.

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

These validators are conservative contract checks. They do not replace code tests, manual QA, source-of-truth verification, release evidence, or human review.

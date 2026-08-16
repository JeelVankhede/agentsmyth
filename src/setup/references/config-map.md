# Config Map

Maps interview topics to the config fields they populate. Use this during Phase 3 (Write Configs) to
route each answer to the correct file and field.

Field paths are written **relative to each config file's own schema root** (the file's top-level
keys), e.g. `domain.name` is the `name` key inside the `domain:` block of `domain.yaml`. A trailing
`[]` marks an array field. `check-setup-refs.mjs` verifies every field named here exists in the
matching `workflow/schemas/*.schema.yaml`, so keep these in sync with the schemas.

---

## Repo Identity → `domain.yaml` + `repo-mental-map.md`

| Interview answer | Target field |
|---|---|
| Repo name | `domain.name` |
| Repo purpose (1–3 sentences) | `domain.summary` and `repo-mental-map.md` §What This Repo Does |
| Regulated environment (yes/no) | `domain.regulated` |
| Key domain terms | `domain.glossary[]` |
| Preferred terms | `domain.preferred_terms[]` |
| Terms to avoid | `domain.discouraged_terms[]` |

---

## Source-of-Truth → `source-of-truth.yaml`

Each tracked source is one entry in `source_of_truth.providers[]` (fields: `id`, `type`, `enabled`,
`read`, `update`, `owner`, `location`). There is no separate `kind` or `resolution_order` field —
priority is the array order of `providers[]`.

| Interview answer | Target field |
|---|---|
| Requirements tracker (Linear, Jira, GitHub Issues, etc.) | `source_of_truth.providers[].type`, `source_of_truth.providers[].location` |
| Decision record location (ADR folder, Notion, wiki) | `source_of_truth.providers[].type`, `source_of_truth.providers[].location` |
| Public API contract location | `source_of_truth.providers[].type`, `source_of_truth.providers[].location` |
| Priority order among sources | order of entries in `source_of_truth.providers[]` |

Also populate `repo-mental-map.md` §Source-of-Truth Hierarchy.

---

## Key Paths → `repo-profile.yaml` + `repo-mental-map.md`

| Interview answer | Target field |
|---|---|
| Source root(s) | `paths.source_roots[]` |
| Test root(s) | `paths.test_roots[]` |
| Docs root(s) | `paths.docs_roots[]` |
| Generated output directories | `paths.generated_outputs[]` |
| Public contract files/dirs | `paths.public_contracts[]` |

Also populate `repo-mental-map.md` §Key Paths.

---

## Protected Paths → `repo-profile.yaml` + `repo-mental-map.md`

`paths.protected[]` entries carry a `path` and a `reason`.

| Interview answer | Target field |
|---|---|
| Paths requiring security review | `paths.protected[]` |
| Paths requiring special approval | `paths.protected[]` |

Also populate `repo-mental-map.md` §Protected Paths.

---

## Verification → `verification.yaml` + `repo-mental-map.md`

Each command is one entry in `commands[]` (fields: `id`, `command`, `cwd`, `required`, `phases[]`,
optional `covers[]`, `env`, `timeout_seconds`). There is no `commands.build`/`commands.lint` map and
no `required_before_ship[]` — "required before ship" is `commands[].required: true` with `ship` in
that command's `commands[].phases[]`.

| Interview answer | Target field |
|---|---|
| Build command | `commands[].id`, `commands[].command`, `commands[].phases[]` |
| Unit test command | `commands[].id`, `commands[].command`, `commands[].phases[]` |
| Integration test command | `commands[].id`, `commands[].command`, `commands[].phases[]` |
| Lint/static analysis command | `commands[].id`, `commands[].command`, `commands[].phases[]` |
| Required checks before ship | `commands[].required`, `commands[].phases[]` |
| Evidence requirements | `command_policy.record_not_run_as_risk`, `evidence_types[]` |

Also populate `repo-mental-map.md` §Verification Defaults.

---

## Branch and Release Policy → `repo-profile.yaml` + `release.yaml`

| Interview answer | Target field |
|---|---|
| Default branch name | `repository.default_branch` |
| Direct-to-main allowed? | `branch_policy.require_non_default_branch_for_changes` |
| PR required? | `branch_policy.default_branch_commit_requires_user_approval` |
| Release process (tag, CI deploy, manual) | `release.required`, `gates.release` |
| Rollback approach | `rollback.required_fields[]` |
| Deployment targets | `gates.deployment` |

---

## Risks and Non-Goals → `domain.yaml` + `repo-mental-map.md`

| Interview answer | Target field |
|---|---|
| Things the AI must not do | `constraints.safety[]` or `constraints.product[]` |
| Out-of-scope topics | `constraints.product[]` |

Also populate `repo-mental-map.md` §Known Risks and Non-Goals.

---

## Package Manager / Commands → `repo-profile.yaml`

| Interview answer | Target field |
|---|---|
| Package managers in use | `commands.package_managers[]` |

---

## Per-Repo Behavior Tuning → `repo-profile.yaml`

Two layers, one purpose. **`intent:`** is what a person can answer; **`tuning:`** holds the numbers
the agent derives from those answers. Both are stored — the numbers are what the agent and
validators read, and the intent is what a later version upgrade re-negotiates against.

**Omitting both is always valid.** Every value then resolves from the global install and behavior
is exactly what it was before. Nothing here gates lifecycle work: until the interview items
(PS-9..PS-11) resolve, work proceeds on global defaults.

### The interview questions

| Interview answer | Target field |
|---|---|
| What kind of repo is this (frontend-app, backend-service, library, cli, monorepo, infrastructure, mixed) | `intent.repo_character` |
| Where UI / API / schema / hot-path files live | `intent.surface_map` |
| How much scrutiny each concern area deserves | `intent.concerns` |
| Whether the agent may delegate to sub-agents, and how widely | `intent.parallelism_appetite` |
| Which phases must stop for sign-off | `intent.review_ceremony` |
| Which tuning values the agent derived rather than the user setting by hand | `intent.derived_keys[]` |

### The eight concerns

Each is `not-applicable`, `light`, `standard`, or `strict`. **`standard` reproduces current
behavior exactly**, so it is the safe answer everywhere and the right default when unsure.

| Concern | Skills it governs | Commonly `not-applicable` when |
|---|---|---|
| `intent.concerns.architecture` | architecture-decision-advisor, system-design-advisor | — |
| `intent.concerns.code_quality` | clean-code-architect, quality-gates-validator | — |
| `intent.concerns.api_contracts` | interface-contract-designer | the repo exposes no API or contract |
| `intent.concerns.data_schema` | data-schema-designer | the repo has no persistence |
| `intent.concerns.ui_ux` | ui-ux-designer | a CLI, library, or service with no UI |
| `intent.concerns.performance` | performance-optimizer | no hot paths worth tracking |
| `intent.concerns.repo_alignment` | repo-alignment-scan | **never** — floored at `light` |
| `intent.concerns.constraints_safety` | constraint-conflict-scan | **never** — floored at `light` |

The two floors are not style preferences. `repo_alignment` checks that proposed work matches repo
reality; `constraints_safety` cross-checks work against declared domain constraints and protected
paths. `not-applicable` is absent from their permitted values, so the schema rejects it outright.

### The derived numbers

Set these directly only when the derived value is wrong for your repo. Anything set by hand must be
left out of `intent.derived_keys[]`, which is what stops a later upgrade from overwriting it.

| Value | Field | Notes |
|---|---|---|
| Parallel sub-agent cap | `tuning.dispatch.max_parallel_workstreams` | 0–10. Capacity only; independence rules still apply to every dispatch. |
| Delegation on/off | `tuning.dispatch.enabled` | `optional` or `disabled`. `required` is deliberately not permitted per-repo. |
| Scoring weights | `tuning.skill_scoring.complexity_score.weights` | Merged per entry — naming one weight leaves the rest global. |
| Repo path vocabulary | `tuning.skill_scoring.path_glob_categories` | Merged per entry. Derived from `intent.surface_map`. |
| Skill firing thresholds | `tuning.skill_scoring.thresholds` | Lower a number to make that skill fire more often. Derived from `intent.concerns`. |
| Extra sign-off phases | `tuning.pause_resume.user_checkpoint_required_for[]` | **Union** with the global list — you may add checkpoints, never remove one. |

### How values resolve

**Per entry, repo over global.** Naming one weight, one glob category, or one threshold changes
that one thing; everything you did not name keeps its global value. A partial map is not a
replacement map — writing `path_glob_categories.ui_globs` alone does not delete `schema_globs`.

`user_checkpoint_required_for` is the one exception: it resolves by **union**, never override, so a
repo can only ever add a checkpoint. `check-config.mjs` rejects a list that drops a globally
required one.

A repo value may make behavior **stricter or unchanged, never looser**. `max_parallel_workstreams`
and `path_glob_categories` are exempt because capacity and vocabulary have no looser direction.

### What cannot be tuned, and why

Everything else in `agent-behavior.yaml` — `lifecycle`, all of `task_classes` (including
`classification_signals`), `evidence_policy`, `change_policy`, `waivers`, `canonical_source`, the
rest of `pause_resume`, `dispatch.require_independent_file_ownership`,
`dispatch.require_dispatch_log`, `dispatch.merge_owner`, and `skill_scoring.triggers`.

These are the machinery that makes the gate real. A repo that could edit `task_classes` could
classify all work as trivial and skip every phase; one that could edit `waivers.required_fields`
could waive anything with an empty waiver. The schema makes them structurally unreachable under
`tuning:` rather than merely undocumented.

`skill_scoring.triggers` is the subtle one: the numeric thresholds were split out into
`skill_scoring.thresholds` precisely so the numbers could be tuned while the boolean structure
stays locked. You can change how often a skill fires; you cannot rewrite the condition that decides
whether it can fire at all.

Fourteen non-lifecycle skills are likewise absent from the concern map by design — scope-fence,
waiver-completeness-check, evidence-auditor, verify-manifest-coverage, skipped-check-accountant,
release-readiness-gate, coverage-tracer, requirement-phase-mapper, plan-assumption-verifier,
conditional-preservation-check, verification-matrix-builder, follow-up-owner-assigner,
decompose-requirements, and restore-context. They are gate-bound or utility, not matters of taste.
dispatch-subagents is governed by `intent.parallelism_appetite` instead.

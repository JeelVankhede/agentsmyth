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

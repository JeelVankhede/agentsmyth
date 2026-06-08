# Config Map

Maps interview topics to the config fields they populate. Use this during Phase 3 (Write Configs) to route each answer to the correct file and field.

---

## Repo Identity → `domain.yaml` + `repo-mental-map.md`

| Interview answer | Target field |
|---|---|
| Repo name | `domain.domain.name` |
| Repo purpose (1–3 sentences) | `domain.domain.summary` and `repo-mental-map.md` §What This Repo Does |
| Regulated environment (yes/no) | `domain.domain.regulated` |
| Key domain terms | `domain.domain.glossary[]` |
| Terms to avoid | `domain.domain.discouraged_terms[]` |

---

## Source-of-Truth → `source-of-truth.yaml`

| Interview answer | Target field |
|---|---|
| Requirements tracker (Linear, Jira, GitHub Issues, etc.) | `sources[].kind`, `sources[].location` |
| Decision record location (ADR folder, Notion, wiki) | `sources[].kind: decision`, `sources[].location` |
| Public API contract location | `sources[].kind: contract`, `sources[].location` |
| Priority order among sources | `resolution_order[]` |

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

| Interview answer | Target field |
|---|---|
| Paths requiring security review | `paths.protected[]` with `reason` |
| Paths requiring special approval | `paths.protected[]` with `reason` |

Also populate `repo-mental-map.md` §Protected Paths.

---

## Verification → `verification.yaml` + `repo-mental-map.md`

| Interview answer | Target field |
|---|---|
| Build command | `commands.build` |
| Unit test command | `commands.test_unit` |
| Integration test command | `commands.test_integration` |
| Lint/static analysis command | `commands.lint` |
| Required checks before ship | `required_before_ship[]` |
| Evidence requirements | `evidence_policy.*` |

Also populate `repo-mental-map.md` §Verification Defaults.

---

## Branch and Release Policy → `repo-profile.yaml` + `release.yaml`

| Interview answer | Target field |
|---|---|
| Default branch name | `repository.default_branch` |
| Direct-to-main allowed? | `branch_policy.require_non_default_branch_for_changes` |
| PR required? | `branch_policy.default_branch_commit_requires_user_approval` |
| Release process (tag, CI deploy, manual) | `release.process` |
| Rollback approach | `release.rollback` |
| Deployment targets | `release.targets[]` |

---

## Risks and Non-Goals → `domain.yaml` + `repo-mental-map.md`

| Interview answer | Target field |
|---|---|
| Things the AI must not do | `domain.constraints.safety[]` or `constraints.product[]` |
| Out-of-scope topics | `domain.constraints.product[]` |

Also populate `repo-mental-map.md` §Known Risks and Non-Goals.

---

## Package Manager / Commands → `repo-profile.yaml`

| Interview answer | Target field |
|---|---|
| Package managers in use | `commands.package_managers[]` |

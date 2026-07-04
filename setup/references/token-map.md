# Adapter Token Map

Used by setup Phase 5 Step 5a.1 to render adapter templates before placement.

| Token | Config | Field |
|---|---|---|
| `{{REPO_NAME}}` | `workflow/config/repo-profile.yaml` | `repository.root` |
| `{{REPO_PURPOSE}}` | `workflow/config/domain.yaml` | `domain.summary` |
| `{{DOMAIN_NAME}}` | `workflow/config/domain.yaml` | `domain.name` |
| `{{DEFAULT_BRANCH}}` | `workflow/config/repo-profile.yaml` | `repository.default_branch` |
| `{{BRANCH_POLICY}}` | `workflow/config/repo-profile.yaml` | `branch_policy.require_non_default_branch_for_changes` |
| `{{PROTECTED_PATHS}}` | `workflow/config/repo-profile.yaml` | `paths.protected[]` (array) |
| `{{VERIFICATION_CMDS}}` | `workflow/config/verification.yaml` | `commands[].run` (array) |
| `{{CONSTRAINTS}}` | `workflow/config/domain.yaml` | `domain.constraints[]` (array) |

Fallback for unresolvable tokens: `<!-- TODO: see pending-setup.yaml -->`

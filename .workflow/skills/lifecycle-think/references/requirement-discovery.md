# Requirement Discovery

Use the Requirement Manifest to prevent hidden scope.

ID types:

- `R`: explicit user requirements.
- `RI`: implicit requirements discovered from repo, domain, source-of-truth, release, verification, compatibility, generated-output, security, or safety context.
- `A`: assumptions that are safe enough to proceed with.
- `Q`: unresolved decisions that need a user, owner, source-of-truth, or waiver.

Discovery sources:

- user request and follow-up corrections
- `.workflow/config/domain.yaml`
- `.workflow/config/repo-profile.yaml`
- `.workflow/config/source-of-truth.yaml`
- `.workflow/config/verification.yaml`
- `.workflow/config/release.yaml`
- existing lifecycle artifacts for the active slug
- repo files that reveal public contracts, generated outputs, protected paths, commands, or compatibility requirements

Rules:

- Every Standard or Complex brief must include at least one `R`.
- Every active `R` and `RI` needs concrete acceptance criteria.
- Do not renumber IDs once downstream artifacts exist.
- When scope changes materially, create a new artifact version instead of reshaping prior IDs.
- Do not bury implicit requirements in prose.

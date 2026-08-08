# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - <SET AT RELEASE: the day release.yml publishes>

### Added
- Forge-ring brand asset set (`src/assets/brand/`) — lockup and icon marks now ship with the package.

### Changed
- README leads with competitive positioning: names the four direct alternatives
  (GitHub Spec Kit, BMAD-METHOD, claude-task-master, agentpreflight) and states the
  differentiator — mechanical, schema-validated phase gates tied to on-disk artifacts,
  not just prompted structure — plus an explicit community-first, no-paid-tier rationale.
- First release published through the automated `release.yml` Trusted Publishing (OIDC)
  path end-to-end, rather than a manual `npm publish`.

### Fixed
- `agentsmyth check` now treats a `repo-profile.yaml` with no `agentsmyth_version` field
  as version skew instead of silently exempting it — the exact pre-stamping case the check
  exists to catch. Warning message corrected to name the real cause (no stamp vs. stamp mismatch).
- Three validator false-positive / mismatch bugs (OI-29, OI-37, OI-38) in scope-fence and
  waiver checks that rejected valid artifacts.
- Consumer-side validators now honor `AGENTSMYTH_WF` / `AGENTSMYTH_HOME` environment
  overrides ahead of `repo-profile.yaml`'s `definitions_root`.

### Docs
- Documentation site: added Uninstall, Troubleshooting, and Updating pages; restructured the
  README to lead with the pitch; added Mermaid architecture diagrams, per-page meta descriptions
  and an OG image, footer LICENSE/CHANGELOG links, and a sweep of content-correctness fixes
  across site and README.

## [1.0.0] - 2026-07-23

### Added
- First public release: package published to the public npm registry, GitHub repository made public.
- `release.yml` publishes to npm via Trusted Publishing (OIDC) — no long-lived npm token stored in CI.

### Changed
- 7-phase lifecycle (`brief -> plan -> task -> review -> verify -> ship -> reflect`), 34 skills, 5 tool adapters
  (Claude Code, Codex, Copilot, Cursor, Windsurf), mechanical `init` scaffold with resolution-pass `setup`,
  system-level (`prepare`) and per-repo (`init`) install split, single-repo/monorepo/polyrepo support, and a
  mandatory local pre-commit lifecycle gate — all verified in sandbox testing outside this repo before this release.
- README and docs site updated to lead with `npx @jeelvankhede/agentsmyth@latest init` as the primary install path.

## [0.1.1] - 2026-07-05

### Changed
- Bump version to 0.1.1 on main after npm package shipping branch merge

## [0.1.0] - 2026-06-14

### Added
- `bin/agentsmyth.mjs` — CLI `init` command; drops workflow files into a consumer repo
- `scripts/build-bundle.mjs` — bundles setup and workflow Markdown into `dist/` for the package
- `assets/` — static files (adapters, workflow configs) shipped with the npm package
- `package.json` / `.npmignore` — package metadata and publish config (`@jeelvankhede/agentsmyth`)
- `check-setup-complete.mjs` — validator that verifies consumer setup is fully wired before agent proceeds
- YAML block scalar support (`>` and `|`) in the config parser
- `pending-setup` schema and validator for tracking incomplete setup state
- Mandatory workflow gate enforced across all adapters (Claude, Codex, Copilot, Cursor, Windsurf)
- Consumer `workflow/` directory rename and adapter token alignment

### Changed
- All adapter shims rebuilt with mandatory gate content
- Setup skill (`setup/SKILL.md`) updated with Phase 4 and Phase 5 content
- `render-adapters.mjs` updated to reflect new asset structure

### Fixed
- `npx` syntax for local tarball install (`file:` prefix required)
- All Pass 3 audit findings resolved (validators, adapters, docs)

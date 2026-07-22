# Inspection Checklist

Run these inspections before starting the interview. Record what you find; use it to pre-fill interview answers where the answer is obvious from the code.

## Repo Identity

- [ ] Read `README.md` if it exists. Extract: purpose, primary user, tech stack.
- [ ] Check `package.json`, `Cargo.toml`, `go.mod`, `pyproject.toml`, or equivalent for language, name, and dependencies.
- [ ] Note if the repo is a library, service, CLI tool, or application.

## Directory Structure

- [ ] List top-level directories (one level deep).
- [ ] Identify likely: source root, test root, docs root, scripts root, generated output directories.
- [ ] Note any `src/`, `lib/`, `app/`, `pkg/`, `cmd/`, `tests/`, `spec/`, `docs/`, `scripts/`, `generated/`, `migrations/` directories.

## Config and Tooling

- [ ] Check for CI config: `.github/workflows/`, `.circleci/`, `Jenkinsfile`, `.gitlab-ci.yml`, `Makefile`.
  `agentsmyth init`'s headless bootstrap already does this presence-based detection automatically
  (`.github/workflows/` → `github-actions`, `.circleci/config.yml` → `circleci`, `.gitlab-ci.yml` →
  `gitlab-ci`, `Jenkinsfile` → `jenkins`) and sets `release.yaml`'s `gates.ci.required`/`provider`
  accordingly — re-confirm it matches reality rather than re-deriving it from scratch.
- [ ] Check for linting: `.eslintrc*`, `.prettierrc*`, `ruff.toml`, `.golangci.yml`, `.rubocop.yml`.
- [ ] Check for test runners: `jest.config.*`, `pytest.ini`, `go test`, `rspec`.
- [ ] Check for a `Makefile` or `scripts/` with common commands. `agentsmyth init` already
  enumerates `package.json`'s `test`/`build`/`lint` scripts (or the equivalent `Makefile` targets
  if no `package.json` exists) into `verification.yaml`'s `commands[]` automatically — confirm the
  detected set is complete rather than assuming only one command matters.

## Branch and Git Policy

- [ ] Check `git log --oneline -10` for commit message style and branching patterns.
- [ ] Check if `main`, `master`, `develop`, or another branch is the default.
- [ ] Check for `.github/CODEOWNERS`, `CONTRIBUTING.md`, or PR template.

## Existing Workflow State

- [ ] Check if `workflow/` exists. If it does, check which config files have placeholder values vs. populated values.
- [ ] Check if `docs/knowledge-map/repo-mental-map.md` exists and is populated.
- [ ] Note which `workflow/config/` files still need filling in.

## Secrets and Sensitive Paths

- [ ] Check for `.env*`, `secrets/`, `credentials/`, `certs/`, `keys/` — note their presence without reading contents.
- [ ] Check `.gitignore` for patterns that suggest sensitive file locations.

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
- [ ] Check for linting: `.eslintrc*`, `.prettierrc*`, `ruff.toml`, `.golangci.yml`, `.rubocop.yml`.
- [ ] Check for test runners: `jest.config.*`, `pytest.ini`, `go test`, `rspec`.
- [ ] Check for a `Makefile` or `scripts/` with common commands.

## Branch and Git Policy

- [ ] Check `git log --oneline -10` for commit message style and branching patterns.
- [ ] Check if `main`, `master`, `develop`, or another branch is the default.
- [ ] Check for `.github/CODEOWNERS`, `CONTRIBUTING.md`, or PR template.

## Existing Workflow State

- [ ] Check if `.workflow/` exists. If it does, check which config files have placeholder values vs. populated values.
- [ ] Check if `docs/knowledge-map/repo-mental-map.md` exists and is populated.
- [ ] Note which `.workflow/config/` files still need filling in.

## Secrets and Sensitive Paths

- [ ] Check for `.env*`, `secrets/`, `credentials/`, `certs/`, `keys/` — note their presence without reading contents.
- [ ] Check `.gitignore` for patterns that suggest sensitive file locations.

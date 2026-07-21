---
slug: mandatory-lifecycle-pre-commit-hook
version: 1
artifact: plan
status: ready-for-next-phase
created: 2026-07-21
updated: 2026-07-21
manifest_ids: [R1, R2, R3, R4, R5, RI1, RI2, RI3, RI4]
upstream:
  - workflow/artifacts/briefs/mandatory-lifecycle-pre-commit-hook-v1.md
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: plan-review
---

# Mandatory Local Lifecycle Pre-Commit Hook - Plan

## Summary

Add a mandatory (non-opt-in) local git pre-commit hook, installed by `agentsmyth init`, that
blocks a commit when staged files outside a safe allowlist aren't covered by any lifecycle task
artifact. Resolves brief Q1 (the mechanical coverage rule) concretely below. No CI is added
(explicit non-goal). Enforcement is git-native — tool-agnostic across all five supported adapters
by construction.

## Inputs

- `workflow/artifacts/briefs/mandatory-lifecycle-pre-commit-hook-v1.md` (approved)
- `bin/agentsmyth.mjs` (`init`, `runPrepare`, existing `check` command's validator resolution)
- `src/workflow/validators/check-scope-fence.mjs` (existing Touches/Changed-Files parsing logic to reuse, not duplicate wholesale)
- `src/workflow/validators/lib.mjs` (`repoRoot`, `wf`, `listFiles`, `readText`, `parseFrontmatter`)
- `.githooks/pre-commit` (this repo's own separate, unaffected, opt-in dev hook — precedent only)
- `scripts/build-bundle.mjs` (confirms `src/workflow/validators/**` is bundled wholesale into `dist/workflow-bundle.md`, so a new validator file ships automatically via `prepare` with no extra bundling step)

## Requirement Coverage

| Manifest ID | Covered by phases | Notes |
|---|---|---|
| R1 | Phase 3 | `init` installs the hook automatically, no opt-in step |
| R2 | Phase 1, Phase 2 | New validator implements the coverage rule; CLI wires `--staged` to it |
| R3 | Phase 3, Phase 4 | No CI file written anywhere; docs state this explicitly |
| R4 | Phase 3 | Hook is a thin call-out; no bypass flag beyond git's native `--no-verify` |
| R5 | Phase 1, Phase 3 | Hook script and validator contain no tool-detection branching |
| RI1 | Phase 3 | `.githooks/pre-commit` untouched; new hook source lives at `src/assets/hooks/pre-commit` |
| RI2 | Phase 3 | Installer detects an existing non-agentsmyth hook and appends/chains instead of overwriting |
| RI3 | Phase 3 | Hook installation logic added only to the `init` path, not `runPrepare()` |
| RI4 | Phase 3 | Installer catches non-git/non-writable cases and warns instead of failing `init` |

## Repo Impact Map

| File | Change type | Manifest IDs | Notes |
|---|---|---|---|
| `src/workflow/validators/check-commit-coverage.mjs` | new | R2, R5 | Staged-diff coverage validator (Q1's mechanical rule) |
| `bin/agentsmyth.mjs` | modify | R1, R2, R3, R4, RI1, RI2, RI3, RI4 | `--staged` routing in `check`; new `installPreCommitHook()` called from `init` only |
| `src/assets/hooks/pre-commit` | new | R1, R4, R5, RI1 | Shell template the installer writes/appends into the consumer repo |
| `test/run-commit-coverage-tests.mjs` | new | R2 | Fixture-driven regression test for the coverage rule, mirroring existing `test/run-*-tests.mjs` harness style |
| `test/fixtures/commit-coverage/` | new | R2 | Covered / uncovered / safe-allowlist / trivial-escape fixture cases |
| `README.md`, `site/under-hood.md` | modify | R1, R3 | Document the mandatory local hook and its local-only scope (no CI) |
| `package.json` | modify | R2 | New `commit-coverage:test` script entry, mirroring existing test scripts |

No changes to `.githooks/pre-commit`, `bin/agentsmyth.mjs`'s `runPrepare()`, or any `.github/workflows/*` file — confirmed non-goals stay untouched.

## Source-of-Truth Strategy

`src/assets/hooks/pre-commit` is the single source of truth for the shipped hook template (parallel to `src/assets/adapters/`, already build-synced by `scripts/build-bundle.mjs`'s existing `src/adapters` → `src/assets/adapters` copy step — this new file needs no separate build step since `bin/agentsmyth.mjs` will read it directly from `src/assets/hooks/`, the already-published location, same pattern as `placeDeterministicAdapters()` reading from `src/assets/adapters/`). `check-commit-coverage.mjs` ships via the existing wholesale `src/workflow/validators/**` → `dist/workflow-bundle.md` bundling — already confirmed to work for `check-lifecycle.mjs` reaching `~/.agentsmyth/workflow/validators/` via `prepare`, so no new bundling logic is needed, only the new file itself.

## Approach

**Q1 resolved — mechanical coverage rule** (`check-commit-coverage.mjs`, invoked as `agentsmyth check --staged`):

1. Read staged files: `git diff --cached --name-only --diff-filter=ACM` (cwd = `repoRoot`).
2. If `workflow/config/repo-profile.yaml` doesn't exist (repo was never `agentsmyth init`'d — shouldn't happen since only `init` installs the hook, but defensive): exit 0.
3. Partition staged files: **safe** = anything under `workflow/**`, `docs/**`, `.cursor/**`, `.claude/**`, `.github/**` (excluding workflow files themselves, which don't exist per non-goal), or any path ending `.md`. Everything else is **gated**.
4. **Trivial escape**: if the gated set is empty, pass. If the gated set is exactly one file and `git diff --cached --numstat -- <file>` totals ≤ 15 changed lines, pass (mirrors the router's own "single-location, no architectural impact" heuristic).
5. Otherwise, for each remaining gated file: it is **covered** if some task artifact under `${wf}/artifacts/tasks/*.md` (a) is not `status: draft` and not `orchestration.status: blocked-for-user` (i.e. actual planned work, not a stub), and (b) declares that path in its "Changed Files" section (exact match or directory-prefix match), reusing the existing `namedSection`/path-extraction approach already in `check-scope-fence.mjs` (extracted, not copy-pasted verbatim, into a small shared helper in `lib.mjs` if that's a clean lift; otherwise duplicated narrowly, consistent with this codebase's existing tolerance for small intentional duplication at CLI/validator boundaries — see `bin/agentsmyth.mjs`'s own documented triple-duplication of `resolveRepoRoot`).
6. If every gated file is covered: exit 0. If any is uncovered: exit 1, printing each uncovered path plus: `"No task artifact's Changed Files covers this path. Add it to an existing task's scope, run the agentsmyth lifecycle to create one, or bypass intentionally with 'git commit --no-verify'."`

This rule intentionally checks **existence of a real, non-stub covering task artifact** — not full chain-status validation (blockers resolved, Ship declared, etc.). Full chain correctness is `check-lifecycle.mjs`'s job at Review/Ship time; this hook's job is narrower and faster: did *any* real planning happen for this file at all. That scope boundary is what keeps the hook fast enough to run on every commit without re-running the whole validator suite.

**Hook installation** (`installPreCommitHook()` in `bin/agentsmyth.mjs`, called only from the `init` command path, after existing repo-file writes):

1. Resolve target: read `git config core.hooksPath` (via `execFileSync`, cwd = repo root); if set, target = `<hooksPath>/pre-commit` (relative to repo root); else target = `.git/hooks/pre-commit`.
2. If the repo has no `.git` directory and no resolvable hooksPath (not a git repo, or `git config` fails): print a clear warning and return — never fail `init` itself (RI4).
3. Read the shipped template from `src/assets/hooks/pre-commit`. It contains a marked block:
   ```sh
   # >>> agentsmyth:mandatory-lifecycle-gate >>>
   ...
   # <<< agentsmyth:mandatory-lifecycle-gate <<<
   ```
4. If the target file doesn't exist: write the full template (with shebang), `chmod 755`.
5. If it exists and already contains the marker block: no-op (idempotent across repeated `init`/upgrade runs).
6. If it exists and does **not** contain the marker: append the marker block to the end of the existing file (preserving the user's own hook content and shebang), ensure the file stays executable. This satisfies RI2 without silently clobbering a user's own hook.

The hook body itself (thin, tool-agnostic, R5):
```sh
if command -v agentsmyth >/dev/null 2>&1; then
  agentsmyth check --staged
else
  npx --yes @jeelvankhede/agentsmyth check --staged
fi
```
`exit $?` implied by the marker block being the last thing in the file (or explicit exit if appended mid-file — appended case must capture and `exit` with the sub-block's own status rather than falling through to whatever follows).

## Phases

### Phase 1 - Coverage validator

- **Manifest IDs:** R2, R5
- Touches: `src/workflow/validators/check-commit-coverage.mjs`
- Work: Implement the 6-step rule above as a standalone validator following this repo's existing validator conventions (`lib.mjs` imports, `finish()` reporting pattern used by sibling `check-*.mjs` files). No tool-detection logic anywhere in the file (R5).
- **Exit gate:** Validator runs standalone (`node src/workflow/validators/check-commit-coverage.mjs`) against a real staged diff in this repo and produces a correct pass/fail with actionable output.

### Phase 2 - CLI wiring

- **Manifest IDs:** R2
- Touches: `bin/agentsmyth.mjs`
- Work: Extract the existing `check` command's candidate-path validator resolution (definitions_root → AGENTSMYTH_HOME → repo-local → source-repo dev fallback) already fixed earlier this session into a small reusable function parameterized by validator filename. Add a `--staged` arg branch that resolves `check-commit-coverage.mjs` through the same function instead of `check-lifecycle.mjs`.
- **Exit gate:** `agentsmyth check --staged` runs correctly from the real globally-installed CLI (not just the dev tree), matching how `agentsmyth check`'s existing fix was verified earlier this session.

### Phase 3 - Hook template + installer

- **Manifest IDs:** R1, R3, R4, R5, RI1, RI2, RI3, RI4
- Touches: `src/assets/hooks/pre-commit`, `bin/agentsmyth.mjs` (`installPreCommitHook()`, wired into `init` only)
- Work: Add the marked shell template; implement `installPreCommitHook()` with the hooksPath-detection, idempotent-marker, chain-append, and non-fatal-warning behavior described in Approach. Call it from the `init` command path, never from `runPrepare()`.
- **Exit gate:** In a scratch test repo: (a) fresh `agentsmyth init` installs a working hook with no extra step; (b) re-running `init` doesn't duplicate the marker block; (c) a repo with a pre-existing custom `pre-commit` gets the marker block appended, original content intact; (d) a non-git directory gets a warning, `init` still completes; (e) no `.github/workflows/*` file is written anywhere in this phase.

### Phase 4 - Tests + docs

- **Manifest IDs:** R2, R1, R3
- Touches: `test/run-commit-coverage-tests.mjs`, `test/fixtures/commit-coverage/**`, `package.json`, `README.md`, `site/under-hood.md`
- Work: Fixture-driven regression test covering: safe-allowlist-only diff (pass), trivial single-file small diff (pass), gated file with a covering non-draft task artifact (pass), gated file with no covering artifact (fail), gated file only covered by a `draft`/`blocked-for-user` task (fail — not real planned work). Document the mandatory local hook in README/under-hood docs, explicitly noting it is local-only with no CI counterpart shipped.
- **Exit gate:** `npm run commit-coverage:test` passes all fixture cases; `npm run validate` and `npm run violations:test` still pass unchanged; docs updated.

## Dependency Order

Phase 1 → Phase 2 (needs the validator to exist) → Phase 3 (installer doesn't depend on 1/2 functionally but is tested together) → Phase 4 (needs 1-3 complete to write meaningful fixtures and docs). Sequential; no parallel workstreams.

## Branch Strategy

Already on `mandatory-lifecycle-pre-commit-hook` (branched off `main` per CLAUDE.md golden rule 8). All phases land on this branch; no separate per-phase branches.

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner | Manifest IDs |
|---|---|---|---|---|---|
| Coverage rule proxy (existence of a non-stub covering task artifact) is weaker than full chain validation and could pass work that later fails Review/Ship | Medium | Low | Explicitly scoped as a fast pre-commit proxy, not a replacement for `check-lifecycle.mjs`'s full validation at Review/Ship — documented in Approach and docs | agent | R2 |
| First-run friction for existing consumer repos upgrading agentsmyth versions, suddenly gated on next `init`/`prepare` | Medium | Medium | Idempotent install only triggers via `init` (not `prepare`), and warning/error text names the exact uncovered files plus the `--no-verify` escape hatch | agent | R1, RI4 |
| Hook installation fails in non-writable or non-git environments (sandboxes, CI running `init` for example/test purposes) | Low | Medium | Non-fatal warning path (RI4), verified in Phase 3 exit gate case (d) | agent | RI4 |
| Appended chaining onto a pre-existing custom hook breaks that hook's own exit-code semantics | Low | Medium | Marker block computes and returns its own exit status explicitly rather than relying on shell fallthrough | agent | RI2 |

## Verification Plan

| Manifest ID | Verification method | Command / Scenario |
|---|---|---|
| R1 | Manual QA | Fresh scratch repo, run `agentsmyth init`, confirm hook file exists and is executable with no extra step |
| R2 | Command + Manual QA | `npm run commit-coverage:test`; manual staged-diff pass/fail cases in a scratch repo |
| R3 | Command (inspection) | `git diff` for this work contains no `.github/workflows/*` addition |
| R4 | Manual QA | `git commit --no-verify` still bypasses in a scratch repo; grep confirms no new bypass flag in the hook/installer |
| R5 | Command (inspection) | Grep hook script and validator for tool-name branching — none present |
| RI1 | Command (inspection) | `git diff` shows `.githooks/pre-commit` unchanged |
| RI2 | Manual QA | Scratch repo with a pre-existing custom `pre-commit`; confirm append behavior, original content intact |
| RI3 | Command (inspection) | `git diff` shows no hook-install call added to `runPrepare()` |
| RI4 | Manual QA | `agentsmyth init` against a non-git directory; confirm warning, non-fatal |

## Architecture Notes

- role: Architect
- decision: New validator (`check-commit-coverage.mjs`) is deliberately narrower in scope than `check-lifecycle.mjs` — existence-of-real-artifact, not full chain-status correctness — to keep it fast and simple enough to run on every commit.
- constraint: Zero runtime dependencies; hook template is POSIX shell calling into the already-installed `agentsmyth` CLI (or `npx` fallback, mirroring the existing pattern noted in `bin/agentsmyth.mjs`'s own `check` command comment).
- tradeoff: A conservative existence-only proxy accepts some risk of a covered-but-incomplete artifact slipping a commit through, in exchange for a rule simple enough to explain in one error message and fast enough not to slow down every commit.
- downstream: `check-lifecycle.mjs` and the rest of the Review/Ship validator chain are unaffected — this hook is a new, independent, additive gate, not a replacement for existing ones.

## Open Questions

None blocking — Q1 from the brief is resolved above.

## Checkpoint Approval

- Checkpoint: plan-review
- Status: approved
- User's own words (verbatim, this turn): "Yes"

## Exit Gate

- [x] Every active R and RI appears in Requirement Coverage, Phases, and Verification Plan.
- [x] User approved or waiver recorded.

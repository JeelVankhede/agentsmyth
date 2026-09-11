---
slug: mandatory-lifecycle-pre-commit-hook
version: 1
artifact: brief
status: ready-for-next-phase
created: 2026-07-21
updated: 2026-07-21
manifest_ids: [R1, R2, R3, R4, R5, RI1, RI2, RI3, RI4]
upstream:
  - user-request
orchestration:
  phase: think
  status: ready-for-next-phase
  next_phase: plan
  blockers: []
  user_checkpoint: brief-review
skill_trigger_log:
  - skill: repo-alignment-scan
    decision: ran
    reason: new_surface=true (agentsmyth has never shipped a mandatory, non-opt-in git hook to consumer repos before — the existing `.githooks/pre-commit` is opt-in and scoped to this repo's own dev contract) and task_class=complex — scanned `bin/agentsmyth.mjs` init/runPrepare, `.githooks/pre-commit`, and the validator set under `src/workflow/validators/` to confirm no existing mechanism already does this.
  - skill: architecture-decision-advisor
    decision: ran
    reason: new_surface=true — this raises a whole-repo-consistent decision about where mechanical lifecycle enforcement lives (git, not per-tool adapters) and how it composes with the existing opt-in dev hook; recorded in Architecture Notes below.
  - skill: constraint-conflict-scan
    decision: ran
    reason: task_class=complex — checked domain.yaml constraints (no runtime dependency added, no provider mandated) and repo-profile.yaml protected paths (`.git/**` is protected for direct edits, but installing a hook via git's own `core.hooksPath`/`.git/hooks/` mechanism at `init` time is the standard, expected way tooling does this — not a violation of "don't touch `.git/**` ad hoc"). No conflict found.
---

# Mandatory Local Lifecycle Pre-Commit Hook - Brief

## Source Links

- Conversation this session: user reported that inline-invoking `/agentsmyth` did not by itself force lifecycle phases (brief/plan/task/review/verify/ship) to be followed for two real bug fixes made earlier in the same session — the adapter gate text and skill instructions are prompt-level only, and were skipped.
- `~/.agentsmyth/workflow/router.md` — Task Classes / Pre-Action Gate — the rule that was skipped.
- `.githooks/pre-commit` (this repo) — existing, opt-in, dev-contract-only hook; precedent for the mechanism, not the target.
- `bin/agentsmyth.mjs` — `runPrepare()` (global-only, writes zero repo files) and the `init` command path — where hook installation must be wired.
- `src/workflow/validators/check-lifecycle.mjs`, `check-scope-fence.mjs` — existing validators; `check-scope-fence.mjs` already matches a task artifact's declared "Changed Files" against a plan's "Touches", but only within an artifact's own text — neither validator today reads the actual `git diff --cached` and cross-checks it against artifact state.

## Problem

agentsmyth's lifecycle gate is enforced entirely by prompt content: adapter files (`CLAUDE.md`, `AGENTS.md`, `.cursor/rules/*.mdc`, etc.) and skill instructions that an AI agent is expected to read and voluntarily obey. Nothing stops an agent from skipping the router's classification step and the Pre-Action Gate and just editing files directly — which is exactly what happened this session. Because agentsmyth supports five different AI tools (Claude Code, Codex, Copilot, Cursor, Windsurf) with no shared "block this tool call" mechanism between them, no per-tool fix can close this gap consistently. The one action every one of those tools' output must eventually pass through, regardless of which tool produced it, is `git commit`. Today, nothing hooks that for consumer repos: the only pre-commit hook that exists (`.githooks/pre-commit`) is opt-in (`npm run hooks:install`) and scoped to this repo's own `src/`/`scripts/`/`examples/` contract — it is never installed into a consumer repo, and it does not check whether a change has a matching lifecycle artifact chain.

## Goals

- A commit to a consumer repo (one that has run `agentsmyth init`) that touches source in a way that should have gone through Standard/Complex lifecycle phases, but has no matching artifact chain with evidence, is mechanically rejected by git itself — not dependent on which AI tool (or a human) staged the change.
- The check runs automatically after `agentsmyth init`, with no separate opt-in step required.
- Enforcement stays entirely local — no CI workflow template is shipped or required (explicit user instruction this session).
- The existing bypass mechanism is git's own `--no-verify` — visible in the commit's context/history norms — not a new silent toggle.

## Non-Goals

- Any CI/GitHub Actions template shipped to or required in consumer repos — explicitly ruled out by the user this session.
- Changing this repo's own existing `.githooks/pre-commit` (dev-contract validation) — a separate, pre-existing mechanism that stays as-is.
- Building tool-specific enforcement (e.g., a Claude Code `PreToolUse` hook) — considered and rejected as the primary mechanism because it cannot cover Codex/Copilot/Cursor/Windsurf, which expose no equivalent interception point; per-tool adapters remain the advisory nudge layer only.
- Solving classification (Trivial vs. Standard vs. Complex) with full router-level judgment inside the hook — a git hook is a fast, non-interactive script, not an LLM; Plan must define a mechanical, conservative proxy (see Open Questions / Q1).

## User Impact

Once `agentsmyth init` has been run in a repo, an agent (or human) cannot commit a non-trivial, artifact-worthy change without either (a) a real matching lifecycle artifact chain existing on disk, or (b) explicitly typing `git commit --no-verify`, which is a visible, deliberate act, not a silent skip. This closes the exact gap demonstrated this session: an agent choosing not to follow the lifecycle no longer goes unnoticed at the point the change is committed.

## Success Metrics

- A test repo with `agentsmyth init` run: staging a multi-file, non-trivial change with no artifact chain and running `git commit` is rejected with a clear, actionable message (non-zero exit, no partial commit).
- The same repo: staging an equivalent change that does have a complete, evidenced artifact chain covering the changed paths commits successfully.
- `git commit --no-verify` still bypasses the hook, unchanged from git's own behavior — no new bypass flag is introduced.
- No `.github/workflows/*.yml` or other CI file is written by `init`/`prepare` as part of this work.
- This repo's own `.githooks/pre-commit` is unchanged and still opt-in.

## Requirements

See Requirement Manifest below; every `R`/`RI` carries its own acceptance criterion.

## Constraints

- CLAUDE.md golden rule 4 (no runtime dependencies) — the hook script must be a plain Node/shell script using only Node built-ins already relied on elsewhere in this codebase.
- CLAUDE.md's source-vs-published-package split — the hook template's source of truth must live under `src/` (e.g. `src/assets/hooks/`) and be build-synced, not hand-maintained only in a generated location.
- `repo-profile.yaml` → `paths.protected`: `.git/**` — installing into `.git/hooks/` (or setting `core.hooksPath`) at `init` time is the standard tooling pattern for this, not an ad hoc edit under this protected pattern; still worth flagging explicitly since it is the one path in this work that touches `.git/**`.
- Must not silently overwrite a user's own pre-existing custom pre-commit hook — must detect and chain/append or clearly refuse, consistent with the "never clobber user content" pattern already used for adapter placement.

## Risks

- **Mechanical classification is inherently a weaker proxy than the router's own LLM-driven Trivial/Standard/Complex judgment.** A hook that is too strict blocks legitimate small changes and trains users/agents toward `--no-verify` as a habit, which defeats the point. A hook that is too lax lets real Standard/Complex work slip through uncommented. Plan must pick a concrete, conservative, explainable rule (see Q1) and this risk must be carried into Verify as something to explicitly test both directions of.
- **First-run friction.** A repo with `workflow/` already full of history but no hook yet (like this repo, or any existing agentsmyth consumer upgrading versions) will suddenly start blocking commits it didn't block before, the first time `agentsmyth init`/`prepare` is re-run post-upgrade. Needs a clear one-time message explaining what changed and why, not a silent new failure mode.
- **Hook installation itself must not break repos that don't use git**, or where `.git/hooks/` isn't writable (permissions, read-only mounts, CI sandboxes running `init` for test/example purposes) — must degrade to a clear warning, never a fatal `init` failure.

## Open Questions

- Q1 (blocking): What is the concrete mechanical rule the hook uses to decide "this staged change needed a lifecycle artifact chain and doesn't have one"? Candidate: reuse `check-scope-fence.mjs`'s existing Touches-matching logic in reverse — for every staged file, check whether it falls under any task artifact's declared Changed Files scope that is part of a chain with `orchestration.status: ready-for-next-phase` (or `complete`) through at least Build; if a staged file matches no such scope and isn't in an explicit small-and-safe allowlist (e.g. `workflow/config/**`, docs-only, single-file diffs under N lines), block. This needs to be decided and detailed in Plan, not guessed here.

## Requirement Manifest

### Explicit (R)

- **R1**: `agentsmyth init` installs a local git pre-commit hook into the consumer repo automatically, with no separate opt-in command required.
  Acceptance: running `agentsmyth init` in a fresh test repo results in a working hook wired via `.git/hooks/pre-commit` or `core.hooksPath`, with no additional command run by the user.
- **R2**: The hook blocks `git commit` when staged changes are not covered by a complete, evidenced lifecycle artifact chain, per the mechanical rule Plan defines for Q1.
  Acceptance: a staged non-trivial change with no matching artifact chain causes the commit to fail with a non-zero exit and a clear stderr message naming the missing coverage; a staged change with a matching chain commits successfully.
- **R3**: Enforcement is local-only — no CI workflow file is added to or required by a consumer repo as part of this work.
  Acceptance: repo diff for this work contains no `.github/workflows/*.yml` addition; `init`/`prepare` write no such file.
- **R4**: The only bypass is git's own `--no-verify` — no new custom bypass flag, env var, or config toggle is introduced.
  Acceptance: code review of the hook and its installer shows no new bypass mechanism beyond what `--no-verify` already provides natively.
- **R5**: The hook works identically regardless of which AI tool (or a human) staged the commit — no per-tool branching logic in the hook itself.
  Acceptance: hook script contains no tool-detection logic; enforcement point is git, which is tool-agnostic by construction.

### Implicit (RI)

- **RI1**: This repo's own existing `.githooks/pre-commit` (opt-in, dev-contract-only) must remain unchanged and untouched by this work — a different, pre-existing mechanism for a different purpose.
  Acceptance: `.githooks/pre-commit` has no diff in this work; the new consumer-facing hook's source lives at a separate path (e.g. `src/assets/hooks/pre-commit`).
- **RI2**: The hook installer must not silently overwrite a user's own pre-existing custom pre-commit hook.
  Acceptance: if `.git/hooks/pre-commit` (or the configured hooksPath file) already exists and isn't agentsmyth's own marker-tagged content, the installer chains/appends or refuses with a clear message, rather than clobbering it.
- **RI3**: `agentsmyth prepare` (global-only, writes zero repo-level files per existing CLAUDE.md invariant) must not attempt hook installation — only `init`, which operates on a specific repo, does.
  Acceptance: `runPrepare()` has no diff related to hook installation; the new logic lives only in the `init` command path.
- **RI4**: Hook installation must degrade gracefully (clear warning, non-fatal) when `.git/hooks/` doesn't exist or isn't writable, rather than failing `init` itself.
  Acceptance: `init` run against a non-git directory, or a directory where hook installation fails for permissions reasons, still completes with a visible warning, not a crash.

## Questions For User

- Q1 is recorded above and is blocking for Plan — it will be resolved as a Plan-phase design decision (mechanical rule for "needed an artifact chain and doesn't have one"), not by asking you to specify the algorithm yourself, unless you have a strong preference now.

## Architecture Notes

- role: Architect
- decision: Enforcement lives at the git-hook layer (installed at `init` time into the consumer repo), not at any single AI tool's own hook/extension mechanism. This is the only layer common to all five supported tools.
- constraint: Zero runtime dependencies; hook script must be plain Node (reusing already-existing validator/parsing code where possible) or POSIX shell calling into it — consistent with the rest of this codebase's hand-rolled, dependency-free stack.
- tradeoff: A git hook is necessarily coarser than the router's own LLM-driven classification — it trades some precision (it cannot truly "understand" whether a change is Trivial) for being mechanically inescapable, which is the entire point of this work per the user's explicit request.
- downstream: Existing adapters (CLAUDE.md, AGENTS.md, `.cursor/rules/*.mdc`, etc.) are unaffected in mechanism — they remain the advisory, in-session nudge; this work adds a second, independent, mechanical backstop rather than replacing them.

## Checkpoint Approval

- Checkpoint: brief-review
- Status: approved
- User's own words (verbatim, this turn): "Approved"

## Exit Gate

- [x] Every active R and RI has acceptance criteria.
- [x] Blocking Q IDs appear in orchestration.blockers.
- [x] User approved or waiver recorded.

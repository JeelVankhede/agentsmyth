---
name: setup
description: One-time porting skill. Run this skill once, pointed at a new target repository, to resolve the pending setup items agentsmyth init already scaffolded and finish the lifecycle workflow configs for that repo.
---

# Setup Skill

## Purpose

This skill finishes setting up a target repository to use the agentsmyth lifecycle workflow. `agentsmyth init` already performs the mechanical half before this skill ever runs: it writes config stubs (real structure, `<USER-TODO>` placeholders where a value isn't inferrable), `workflow/config/pending-setup.yaml` (every open item, with a question and inspection hint), the `workflow/artifacts/`/`workflow/learnings/` directories, and — for Cursor and non-macOS Copilot specifically, the two cases no global gate mechanism can ever cover — an adapter file. This skill's job is a **resolution pass**: resolve `pending-setup.yaml`'s open items (inspect first, ask only what's left), fill in the remaining config fields, and finish what `init` couldn't do mechanically.

This skill lives in `setup/` and is **not** copied to the target repository.

## Context Loading

Load only:

1. This file.
2. `setup/references/inspection-checklist.md`
3. `setup/references/config-map.md`
4. `setup/references/token-map.md`

Do not load any `workflow/` skill files. Those belong to the target repo after setup is complete.

## When To Run

Run this skill when:

- `agentsmyth init` has just staged `.agentsmyth/` and the user says "run the agentsmyth setup" (the normal path — `workflow/config/pending-setup.yaml` already exists, listing exactly what's left to resolve).
- The user says "set up this repo" or "port the workflow to this repo" and `workflow/config/` still has `<USER-TODO>`/`<PLACEHOLDER>` values but no `pending-setup.yaml` (defensive fallback — see the Global Install Note; should not normally happen since `init` always scaffolds first).

Do not run this skill on a repo that already has a populated `docs/knowledge-map/repo-mental-map.md` and non-placeholder config files — inspect first and confirm with the user.

## Inputs

- The target repository root path or current working directory.
- `workflow/config/pending-setup.yaml` — the bounded list of open items this pass resolves.
- User answers to any batched questions still open after inspection.

## Workflow

### Phase 1 — Inspect

By the time this skill starts, `init` has already scaffolded `workflow/config/*.yaml` (real structure, `<USER-TODO>` placeholders where not inferrable), `pending-setup.yaml`, `workflow/artifacts/`, `workflow/learnings/`, and — conditionally, for Cursor or non-macOS Copilot — an adapter file. Read the existing state to confirm what's already there and orient around it — this phase confirms and extends a real starting point, it does not discover a blank slate. Follow `setup/references/inspection-checklist.md` for anything `pending-setup.yaml` doesn't already cover.

Concisely summarise what you found and confirm with the user before moving on. Do not assume; flag gaps.

### Phase 2 — Pending Setup Resolution

Resolve `workflow/config/pending-setup.yaml`'s open items using the exact pattern `workflow/router.md`'s "Pending Setup Resolution" section already defines — this phase does not re-derive that pattern, it applies it:

1. If `pending-setup.yaml` does not exist: skip to the defensive-fallback branch of Step 3.x below (should not normally happen — `init` always writes it).
2. Load the file. Filter `items` where `status: open`.
3. If no open items: nothing to resolve here — proceed to Phase 3 with whatever config values already exist.
4. **Inspect-based resolution first** — for each open item, read its `hint` field and inspect the repo (`package.json` scripts, `.github/workflows/*.yml`, `Makefile`, `README.md`/`CONTRIBUTING.md`). If the answer is determinable: update the target config field, set `resolved_by: inspect`, `status: resolved`, record the value in `resolution`.
5. **Batched user prompt** — for items still open after inspection: surface them as a single batched question block (one question per item, 2–4 at a time if the list is long — do not ask one at a time and do not ask everything in one wall of text). Apply each answer to the config, set `resolved_by: user`, `status: resolved`, record in `resolution`. Update `pending-setup.yaml`.
6. `waived` items: never surface, never block on them.
7. Items still open after steps 4–5: same as `router.md` — do not hard-stop. Leave the field as `<USER-TODO>` and note the open item in this skill's final Output report; Phase 4's validators treat a remaining `<USER-TODO>` as a warning, not a failure (see Phase 4 below), so an unresolved item does not block reaching Phase 5.
8. If the target repo needs a config field `pending-setup.yaml` doesn't already cover (rare — `init`'s stub-writing covers the common cases), fall back to `setup/references/config-map.md` and ask about it directly, following the same batching discipline.

**User-confirmed constraint — the final call on any judgment-based or ambiguous item belongs exclusively to this pass, never to `init`'s mechanical output.** `init` only ever finalizes genuinely deterministic values (a git-inferred default branch; the Cursor/non-macOS-Copilot adapter's `os.platform()` check) — anything requiring inspection judgment or a real choice (domain name, verification commands, which value is "correct" when ambiguous) reaches this repo only as an open `pending-setup.yaml` item, never as an `init`-finalized guess. If a config field looks pre-filled with something other than a real `<USER-TODO>` placeholder and it isn't one of those two deterministic cases, treat it as suspicious and confirm with the user before trusting it — do not assume `init` made a silent judgment call, since it never should.

Agent tool identity (which adapter to place, beyond what `init` already placed for Cursor/non-macOS-Copilot) is asked here if still relevant — Step 5a.1 below still governs placement for the other four tools.

### Phase 3 — Write Configs

Fill in the remaining `<USER-TODO>`/`<PLACEHOLDER>` fields in the config files `init` already wrote, using resolved `pending-setup.yaml` items and the mapping in `setup/references/config-map.md`. These files already exist with real structure — do not overwrite them wholesale from the placeholder template, which would silently drop whatever `init` or a prior session already resolved.

| File | What it controls |
|---|---|
| `workflow/config/domain.yaml` | Domain name, summary, glossary, constraints |
| `workflow/config/repo-profile.yaml` | Repo structure, branch policy, key paths |
| `workflow/config/source-of-truth.yaml` | Requirement and decision tracking locations |
| `workflow/config/verification.yaml` | Verification commands, evidence requirements |
| `workflow/config/release.yaml` | Release process, deployment, rollback policy |
| `docs/knowledge-map/repo-mental-map.md` | Human-readable orientation map |

Replace all `<PLACEHOLDER>` values. Do not invent values the user did not provide — leave a clearly marked `<USER-TODO: describe X>` instead.

All five `workflow/config/*.yaml` files already exist at this point, written by `agentsmyth init`
(`agentsmyth_version`, `definitions_root`, and every field the shipped templates default to a
real value — see the Global Install Note below Step 5b for the linking details). Read each
existing file and fill in only what's still `<USER-TODO>`/`<PLACEHOLDER>` — do not overwrite
any file wholesale from the placeholder template, which would silently drop `definitions_root`
and every other value `init` or a prior session already resolved.

Note: `workflow/agent-behavior.yaml` is shipped as a workflow invariant (it encodes lifecycle task classes, artifact chain, evidence policy, and waiver schema) and is **not** written or edited by setup. A consumer should rarely need to modify it.

#### Step 3.x — Maintain pending-setup.yaml

`pending-setup.yaml` already exists at this point (written by `init`'s mechanical scaffold) and
was the input to Phase 2's resolution pass — this step is about keeping it accurate, not
creating it from scratch. Two cases:

- **Normal case**: Phase 2 already updated every item it resolved (`status: resolved`,
  `resolved_by`, `resolution`). Nothing further to do here.
- **A config field needs resolution that `pending-setup.yaml` didn't already cover** (rare —
  `init`'s stub-writing covers `domain.name`, `domain.summary`, `verification.yaml`'s first
  command, and `repository.default_branch` when git inference fails; anything else surfaces
  here instead): add a new entry using the next sequential `id` (never reuse or renumber),
  following the same shape — `config`, `field` (dot-notation, relative to the config file's
  schema root), `question`, `hint`, `status: open` — then resolve it the same way Phase 2
  resolves any other item (inspect first, batch-ask if still open) before writing the real
  value into its target config field.
- **Defensive fallback**: if `pending-setup.yaml` does not exist at all (should not normally
  happen — see the Global Install Note), create it following the shape below for every field
  left as `<USER-TODO:...>` after Phase 3.

Example:

```yaml
version: 1
kind: pending-setup
items:
  - id: PS-1
    config: verification.yaml
    field: commands[0].command
    question: "What command runs the test suite?"
    hint: "Check package.json scripts.test or .github/workflows/ for test job steps"
    status: open
    resolved_by: ~
    resolution: ~
  - id: PS-2
    config: source-of-truth.yaml
    field: source_of_truth.providers[0].location
    question: "Where are requirements tracked — URL or file path?"
    hint: "Check README.md, CONTRIBUTING.md, or any linked project management tool"
    status: open
    resolved_by: ~
    resolution: ~
```

### Phase 4 — Verify

Run both validators before touching anything else. Both must exit cleanly. There are no waivers during setup.

```bash
node .agentsmyth/validators/check-setup-complete.mjs
node .agentsmyth/validators/check-config.mjs
```

**If either validator fails:**
- Read the error output carefully.
- Fix the root cause in the config file(s).
- Re-run the validator.
- Do not proceed to Phase 5 until both pass.
- Do not re-run and claim pass without actually fixing what failed.
- `<USER-TODO>` items are warnings, not failures — they are values the user explicitly said they do not know yet. Do not invent values to clear them.

**Waivers are not permitted during setup.** There is no waiver field in setup output. Every check must pass before Phase 5 begins.

### Phase 5 — Copy and Cleanup

Expand the workflow into the repo root, handle collisions, then remove the isolated directory.

#### Step 5a — Copy static assets

For each item in `.agentsmyth/assets/`, apply the collision rule:

| Target path | Rule |
|---|---|
| `workflow/config/` (no existing populated configs) | Copy placeholder YAMLs — agent already filled them in Phase 3, so this is a no-op (configs were written directly to `workflow/config/`) |
| `AGENTS.md` does not exist | Copy `.agentsmyth/assets/AGENTS.md` to repo root |
| `AGENTS.md` exists | Read the existing file. Append the agentsmyth section from `.agentsmyth/assets/AGENTS.md` under a `## agentsmyth Workflow` heading. Never overwrite. |
| `adapters/` does not exist | Copy `.agentsmyth/assets/adapters/` to repo root |
| `adapters/<tool>/` exists | Copy only missing subdirs. Skip what is already there. |
| `docs/knowledge-map/` does not exist | Create it and write `repo-mental-map.md` (already written in Phase 3) |
| `docs/knowledge-map/repo-mental-map.md` exists | Confirm with user before overwriting |

#### Step 5a.1 — Place adapter at tool-native path

Before placing anything, check whether the chosen tool's **global** gate is already installed and active — `agentsmyth prepare` (which `init` always runs before this skill starts) installs a global gate for most tools automatically, and writing a per-repo copy on top of an active global one is pure duplication. Read the tool's global file at the path below and check whether it already contains that tool's begin/end marker pair:

| Agent tool | Global file | Begin / end marker |
|---|---|---|
| Claude Code | `~/.claude/CLAUDE.md` | `<!-- agentsmyth global gate BEGIN -->` / `<!-- agentsmyth global gate END -->` |
| Codex | `~/.codex/AGENTS.md` | `# agentsmyth global gate BEGIN` / `# agentsmyth global gate END` |
| Windsurf | `~/.codeium/windsurf/memories/global_rules.md` | `# agentsmyth global gate BEGIN` / `# agentsmyth global gate END` |
| Copilot (macOS only) | `~/Library/Application Support/Code/User/prompts/agentsmyth.instructions.md` | `<!-- agentsmyth global gate BEGIN -->` / `<!-- agentsmyth global gate END -->` |
| Cursor | none — no global mechanism exists for this tool | not applicable |

If the marker pair is present in the tool's global file, **skip the per-repo placement below for that tool** — the global gate already covers it. Two cases always still need the per-repo placement, since no global mechanism reaches them: **Cursor** (no global file exists for it at all) and **Copilot on a non-macOS platform** (the global install only writes Copilot's gate on macOS). `agentsmyth init` already places both of these mechanically and deterministically before this skill starts (see Step 5a.2 below) — check whether the target path already exists before treating either as unplaced.

Based on the agent tool identified during Phase 2's resolution pass, and only when the check above did not find an active global gate for it and the target path isn't already populated by `init` (Cursor / non-macOS Copilot), place the adapter at the path the tool reads automatically:

| Agent tool | Source adapter | Target path in repo | Notes |
|---|---|---|---|
| Claude Code | `adapters/claude/CLAUDE.md` | `.claude/CLAUDE.md` | Create `.claude/` if missing. If `.claude/CLAUDE.md` exists, append agentsmyth gate under a `## agentsmyth` heading. |
| Codex | `adapters/codex/AGENTS.md` | `AGENTS.md` (root) | Handled by Step 5a above — AGENTS.md placement already covers this. |
| Copilot | `adapters/copilot/copilot-instructions.md` | `.github/copilot-instructions.md` | Create `.github/` if missing. Append if file exists. |
| Cursor | `adapters/cursor/rules/index.mdc` | `.cursor/rules/agentsmyth.mdc` | Create `.cursor/rules/` if missing. |
| Windsurf | `adapters/windsurf/.windsurfrules` | `.windsurfrules` (root) | Append if file exists. |
| Other / Unknown | `adapters/claude/CLAUDE.md` | Ask user where their agent reads instructions from, then place it there. |

This step is what enforces the workflow gate. Without the adapter at the tool-native path (or an active global gate covering it), the agent will not load the mandatory gate instructions on session start.

##### Token substitution

Before writing the adapter to its target path, render all `{{TOKEN}}` values:

1. Load `workflow/config/domain.yaml`, `workflow/config/repo-profile.yaml`,
   `workflow/config/verification.yaml`.
2. Substitute each `{{TOKEN}}` using the token map in `setup/references/token-map.md`.
3. List tokens (`{{PROTECTED_PATHS}}`, `{{VERIFICATION_CMDS}}`, `{{CONSTRAINTS}}`):
   render each array item as a `- ` markdown bullet on its own line. If the list is
   empty: render as `- (none defined)`.
4. `{{BRANCH_POLICY}}`: if `require_non_default_branch_for_changes: true`, render as
   "All changes via non-default branch required."; if `false`, render as
   "Direct commits to `{{DEFAULT_BRANCH}}` permitted."
5. Any token whose source field is absent, `<USER-TODO:...>`, or maps to an open entry
   in `pending-setup.yaml`: substitute with `<!-- TODO: see pending-setup.yaml -->`.
   Do not remove the section line itself — the consumer must see what is missing.

Write the **rendered output** — not the raw template — to the tool-native path.

#### Step 5a.2 — Re-render the `init`-placed Cursor / non-macOS-Copilot adapter, if present

`agentsmyth init` places `.cursor/rules/agentsmyth.mdc` unconditionally and
`.github/copilot-instructions.md` on non-macOS platforms, mechanically, before this skill ever
runs — see R5 in `workflow/artifacts/briefs/wp-r9b-scaffold-init-resolution-v1.md`. At `init`
time, most config values aren't resolved yet, so that file's `{{REPO_NAME}}`,
`{{REPO_PURPOSE}}`, and `{{DOMAIN_NAME}}` tokens (the only ones sourced from `domain.yaml`,
which stays `<PLACEHOLDER>` until this skill's Phase 2/3) render as the
`<!-- TODO: see pending-setup.yaml -->` fallback.

If `.cursor/rules/agentsmyth.mdc` or `.github/copilot-instructions.md` exists and still contains
that TODO fallback marker after Phase 2/3 resolve the config values it depends on: re-render it
using the same Token substitution rules above and **overwrite it in place**. This is a safe
overwrite, not a violation of the "never overwrite" discipline elsewhere in this skill — the
file's prior content was deterministically generated by `init`, never user-authored. Do not
re-render (and do not touch) either file if it no longer contains the TODO marker, or if it
wasn't placed by `init` in the first place (e.g. a user's own pre-existing Cursor rule) — Step
5a.1's normal append-on-collision handling governs that case instead.

This step does not apply to the other four tools (Claude Code, Codex, Windsurf, macOS Copilot)
— `init` never places their adapters; Step 5a.1's resolution-and-global-check flow is unchanged
for them.

#### Step 5b — Expand workflow bundle

Read `workflow/config/repo-profile.yaml` (written in Phase 3). Check whether it has
`definitions_root:` set — this is the default outcome of `agentsmyth init` (see
the Global Install Note below): the CLI links the repo to a global definitions install
before Phase 1 of this skill ever runs.

- If `definitions_root` **is** set: skills, router, lifecycle, rules, glossary, schemas, and
  validators are **not** expanded locally — they resolve from the global install at runtime.
  `workflow/artifacts/` and `workflow/learnings/` already exist — `init`'s mechanical scaffold
  created both (7 empty phase directories; README, `curated.md`, and an empty `sessions/`)
  before this skill started. Nothing to expand for either.
- If `definitions_root` is **not** set (defensive fallback — should not normally happen,
  since `init` always links before this skill starts): read
  `.agentsmyth/workflow-bundle.md`. For each `<!-- FILE: <path> -->` block, write the content
  to that path relative to the repo root. Create parent directories as needed. Do not expand
  files under `workflow/config/` — those were already written by the agent in Phase 3.
  `workflow/artifacts/` and `workflow/learnings/` should already exist too (same reason as
  above — `init` runs before this skill regardless of link state); if somehow absent, create
  the same 7 empty phase directories and copy `workflow/learnings/{README.md,curated.md}` from
  `.agentsmyth/assets/workflow/learnings/` plus an empty `sessions/` dir.

After expansion, the following must always exist in the repo, regardless of link state:

- `workflow/artifacts/` (empty phase dirs)
- `workflow/learnings/` (README and sessions dir)

The following exist locally only in the defensive (no-`definitions_root`) fallback above:

- `workflow/router.md`
- `workflow/lifecycle.md`
- `workflow/rules.md`
- `workflow/glossary.md`
- `workflow/skills/` (full skill tree)
- `workflow/validators/` (all validator scripts)
- `workflow/schemas/` (all schema files)

#### Step 5c — Produce copy-log

Before removing `.agentsmyth/`, output a one-line summary for each file written or skipped:

```
copied   workflow/router.md
copied   workflow/lifecycle.md
...
skipped  AGENTS.md (exists — appended agentsmyth section instead)
```

Show the log to the user and wait for acknowledgement before proceeding.

#### Step 5d — Remove isolated directory

Delete `.agentsmyth/` in its entirety.

```bash
rm -rf .agentsmyth
```

#### Step 5e — Lifecycle pre-commit gate (already installed, nothing to do here)

`agentsmyth init` already installed a mandatory, automatic pre-commit hook before this skill
ever ran (`installPreCommitHook()`, writing `.git/hooks/pre-commit` or the repo's configured
`core.hooksPath` file) — there is no opt-in question to ask and nothing to install here. The hook
runs `agentsmyth check --staged` on every commit: safe paths (`workflow/`, `docs/`, adapter
dirs, Markdown) and small single-file diffs pass automatically; anything else must be covered by
a real lifecycle task artifact, or the commit is rejected. The only bypass is git's own
`git commit --no-verify` — no new flag or config toggle exists. If the repo already had a custom
`pre-commit` hook, `init` appended this check to the end of it rather than overwriting.

This is the final step.

## Global Install Note

`agentsmyth init` always ends with the repo linked to a global lifecycle-definitions install
at `~/.agentsmyth/workflow/` — the CLI runs `agentsmyth prepare` automatically before this
skill starts if no global install exists yet, then writes `definitions_root:
~/.agentsmyth/workflow` into `workflow/config/repo-profile.yaml` itself, before Phase 1 of
this skill even begins. Validators and the agent resolve skills and schemas from that global
location instead of a per-repo `workflow/` copy — see Step 5b above.

This skill does not need to manage `definitions_root` or run any global-install step itself
— that already happened by the time this skill starts. Run `agentsmyth prepare` standalone
(without `init`) only to install or refresh the global definitions on a machine ahead of
time, with no repo-level effect.

## Stop Conditions

Stop and ask when:

- A required piece of information is not available from inspection or prior answers.
- The user's answer contradicts an earlier answer or what was found in the repo.
- A config file already has non-placeholder values (do not overwrite without confirmation).
- A validator fails and the fix is not clear from the error output.

## Output

No lifecycle artifact is created. Report to the user:

- What was inspected (brief bullet list).
- What was written (file list with one-line summary of changes).
- What is still pending (any `<USER-TODO>` items that need follow-up).
- Confirmation that `.agentsmyth/` was removed.

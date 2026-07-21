---
title: "Setup: the resolution pass"
---

# Setup: the resolution pass

Setup happens once in the life of a repo, and everything downstream depends on it being right. So it is the one place agentsmyth is strict to the point of stubbornness. A lifecycle run can record a skipped check as risk and move on. Setup cannot. Every check passes, or setup does not finish.

It is also not a from-scratch interview. `agentsmyth init` already did the mechanical half before this skill ever runs — it writes config stubs with real structure, a `pending-setup.yaml` listing every open item with a question and an inspection hint, and the empty artifacts/learnings tree. This phase's job is a **resolution pass**: close out what `init` could not fill in mechanically.

## Phase 1: Inspect

The agent reads what `init` already scaffolded — the config stubs, `pending-setup.yaml`, and, for Cursor or non-macOS Copilot, an adapter already placed — to confirm and orient around a real starting point. This is not a blank slate: it summarizes what is already there and flags gaps, rather than pretending to discover the repo fresh.

## Phase 2: Pending setup resolution

For every open item in `pending-setup.yaml`, the agent tries inspection first — `package.json` scripts, CI workflow files, a Makefile, the README — and resolves anything determinable without asking. Only what's left after that becomes a question, and even then it surfaces in small batches, two to four at a time, never a thirty-item wall of text.

Not knowing an answer is allowed. Say so, and the item stays a marked `<USER-TODO>` rather than a guess. A guessed config is worse than an admitted gap — and the only values `init` is ever allowed to finalize on its own are genuinely deterministic ones, like a git-inferred default branch. Everything judgment-based reaches you as an open item here, never as a silent guess upstream.

## Phase 3: Write configs

The agent fills in whatever is still `<USER-TODO>` in the five YAML configs under `workflow/config/` — which already exist with real structure, so nothing here is overwritten wholesale — plus a `repo-mental-map.md` that captures the orientation any future agent needs.

| Config | Captures |
|---|---|
| `domain.yaml` | Domain, stack, terminology |
| `repo-profile.yaml` | Repo shape, primary language, single vs mono vs poly |
| `source-of-truth.yaml` | Authoritative sources for requirements and decisions |
| `verification.yaml` | Test strategy, coverage expectations, CI commands |
| `release.yaml` | Release process, environments, deploy targets |
| `agent-behavior.yaml` | Enforcement stance and waiver policy — a shared invariant, not written per repo |

`agent-behavior.yaml` is special: it lives in the shared definitions tree, identical for every repo. Setup does not write it and neither do you. It is the constitution the other five configs operate under.

## Phase 4: Verify (the hard stop)

The agent runs the setup validators. Both must exit clean:

```bash
node .agentsmyth/validators/check-setup-complete.mjs
node .agentsmyth/validators/check-config.mjs
```

If either fails, the agent reads the error, fixes the root cause, and re-runs. It does not proceed. Pending items you explicitly left unknown surface as warnings, not failures, and the agent will not invent values to clear them. This asymmetry is what makes the whole system trustworthy: setup is load-bearing, so setup is uncompromising.

## Phase 5: Copy and clean up

- Before placing anything per-repo, it checks whether your tool's **global gate** is already active. If it is, the per-repo adapter is skipped — writing one would be pure duplication. Cursor and non-macOS Copilot are the two exceptions, since no global mechanism reaches them; `init` already placed those adapters mechanically before this phase starts.
- No existing `AGENTS.md`? It writes one. Already have one? It appends the agentsmyth section under its own heading and never overwrites yours.
- It writes only your repo-specific files — config, an empty artifacts tree, and learnings — then deletes `.agentsmyth/`.

::: tip One last, opt-in offer
After cleanup, the agent asks once whether you want a pre-commit hook that blocks commits where the upstream lifecycle artifact isn't ready — a Build without an approved Plan, for example. Say no and it is skipped without comment. Say yes later and `git commit --no-verify` always gets you out of it.
:::

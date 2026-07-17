---
slug: init-prepare-interop
version: 1
artifact: brief
status: draft
created: 2026-07-17
updated: 2026-07-17
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, RI1, RI2, RI3, RI4, RI5]
upstream:
  - user-request
  - notion-roadmap-wp-r7-block
  - notion-wp-r7-research-spike
orchestration:
  phase: think
  status: ready-for-next-phase
  next_phase: plan
  blockers: []
  user_checkpoint: approved
skill_trigger_log:
  - skill: repo-alignment-scan
    decision: ran
    reason: "task_class = Complex (per Notion WP-R7 classification and cross-cutting scope) satisfies `task_class != trivial`. Explored bin/agentsmyth.mjs, src/workflow/validators/lib.mjs, and src/setup/SKILL.md to verify the Notion spike's three current-state findings against actually-shipped code rather than trusting the doc at face value."
  - skill: architecture-decision-advisor
    decision: ran
    reason: "`new_surface` (new `agentsmyth prepare` top-level command) and `touches_contract` (CLI command surface, `definitions_root` write policy) both satisfy the trigger. Recorded chosen approach vs. rejected alternatives in Architecture Notes below."
  - skill: constraint-conflict-scan
    decision: ran
    reason: "task_class = Complex satisfies `task_class != trivial`. Checked domain.yaml's product/safety/provider-neutrality constraints and repo-profile.yaml's protected paths — no conflicts found; [safety-2] and [provider-neutrality-1] directly shaped A1/A2 below."
---

# WP-R7 — System-Install ↔ Per-Repo Init Interoperability - Brief

## Source Links

- User request: run the lifecycle for the Notion block at
  `https://app.notion.com/p/393972bdebbb81e4ac24cb7d4e4bbf61#5450ecc496464f25b9e7acf373bb33c8`,
  confirmed via block fetch to resolve to **WP-R7 — System-Install ↔ Per-Repo Init
  Interoperability** on the "06 — Roadmap & Work Packages" page.
- Full resolved design: Notion page **"WP-R7 — Research Spike (init/prepare
  interoperability)"** (`https://app.notion.com/p/39f972bdebbb81b692b6f788fa462eca`),
  status "Resolved — dev-ready", author Claude (Opus 4.8), dated 2026-07-17. Contains
  locked decisions, requirements T7.1–T7.6 with acceptance criteria, a "what lives where"
  table, and edge cases. Treated as the authoritative spec for this brief; T7.1–T7.6 map
  directly to R1–R6 below.
- Roadmap classification (06 page): WP-R7 is `Class: Complex`, `Priority: P0 (blocks
  Sandbox Testing Scenario B, page 10)`, `Depends on: WP-R2 (shipped)`.
- Shipped-code verification performed during this brief (evidence, not just doc trust):
  - `bin/agentsmyth.mjs:272-368` — bare `init` (no `--system`) never calls
    `writeDefinitionsRoot()`; only the `isSystem` branch does (line 353). Confirms spike
    finding #1.
  - `src/setup/SKILL.md:198-200` — the agent-driven setup skill expands
    `.agentsmyth/workflow-bundle.md`'s `FILE:` blocks to `workflow/` at repo root for a
    bare `init`, i.e. a full local definitions copy. Confirms spike finding #1's net effect.
  - `bin/agentsmyth.mjs:134-192` (`headlessBootstrap`) — writes stub `workflow/config/*.yaml`
    from `src/assets/workflow/config/` templates and stamps `agentsmyth_version`, but never
    writes `definitions_root`. Confirms spike finding #3.
  - `workflow/artifacts/briefs/system-level-install-v1.md:180-182` — original RI3 wording:
    *"Per-repo install (no `--system`) works unchanged. `npx agentsmyth init` (bare)
    continues to write `workflow/` + per-repo adapter, producing a fully self-contained
    repo install with no `definitions_root` set. All existing consumers are unaffected."*
    This is the rule R5 supersedes.

## Problem

`agentsmyth init` (bare) and `agentsmyth init --system` don't interoperate. Bare `init`
always does a full local `expandBundle()`-equivalent copy of every skill/router/lifecycle
file into the target repo's `workflow/`, and is explicitly forbidden (WP-R2's RI3) from
writing `definitions_root` — so even on a machine that already has a global install at
`~/.agentsmyth/workflow/`, every `init` redundantly re-copies the full definitions tree and
never links to the global one. `--system` writes `definitions_root` but never runs the
5-phase interview, so it can't produce repo-level config alone. `headlessBootstrap()` (fired
by `agentsmyth check` when config is absent) writes stub configs but never sets
`definitions_root` either. No single command links a repo to an already-installed global
definitions tree and runs the interview to fill in the rest. This blocks Sandbox Testing
Scenario B (Notion page 10), which needs that exact flow to produce a meaningful signal.

## Goals

- One command path (`init`) always ends with a repo linked to a global definitions tree —
  auto-installing that global tree first if one doesn't exist yet — while still running the
  full 5-phase interview to produce repo-level config and an empty artifacts tree.
- A new `agentsmyth prepare` command owns the global-only install action (current
  `--system` logic minus the repo write), callable standalone from any directory.
- `headlessBootstrap()` gets the same link treatment as `init` — no more stub configs with a
  `defsRoot` that silently falls back to an empty local `workflow/`.
- The version-skew check is confirmed correct under the live-reference model (a repo now has
  a real runtime dependency on the global tree's version, not just a stamped-then-forgotten
  value).
- RI3 (WP-R2's "bare `init` must never write `definitions_root`") is explicitly superseded,
  not silently contradicted — annotated in the WP-R2 artifact trail and captured as a
  numbered invariant in this repo's own documentation.
- `--system` is removed outright (not deprecated) — it has never shipped to a published
  release, so there is no back-compat obligation (user decision, 2026-07-17).
- Any failure in the auto-run-`prepare`-during-`init` path (global install not found, not
  writable, or otherwise not possible) is captured and surfaced to the user as a clear
  error — never silently swallowed, never silently falls back to a local copy (user
  decision on Q1, 2026-07-17). No CI/env-var opt-out is provided; `init` always attempts
  `prepare` by default.
- A pre-WP-R7 repo's stale local definitions tree is audited, and the user is prompted
  before any deletion — never silently left in place, never silently deleted (user decision
  on A1, 2026-07-17, supersedes the warn-and-leave default originally proposed here).
- Notion pages 02 and 10 are updated directly by this lifecycle chain once the work is
  verified — not left as a copy-ready handoff (user decision on A2, 2026-07-17).

## Non-Goals

- WP-R8 (per-repo behavior tuning / a second `agent-behavior.yaml`) — split from WP-R7,
  explicitly out of scope; `agent-behavior.yaml` stays global-only.
- WP-R6 (public repo bootstrapping, fare/bare) — unrelated, blocked on a separate
  dependency.
- A deprecation period for `--system` — removed outright per user decision; no alias, no
  notice period.
- Adding a new `repo-profile.schema.yaml` field — `definitions_root` already exists
  (shipped in WP-R2); this brief only changes which code paths write/read it.
- A configured, standing source-of-truth provider for Notion — the direct writes in R6 are
  authorized by this specific explicit user request, not by adding `notion` to
  `source-of-truth.yaml`'s `providers` list. Future lifecycle chains without an equivalent
  explicit request still default to handoff-only per `[provider-neutrality-1]`.

## User Impact

A consumer who has already run `agentsmyth prepare` (or the legacy `--system`) once can run
plain `agentsmyth init` in any number of repos afterward and get a fast, linked install
instead of a redundant full copy. A consumer with no global install yet still gets a working
`init` — it bootstraps the global tree automatically, with no extra flag or manual step.

## Success Metrics

- After `init` in a fresh repo, `<repo>/workflow/` contains only `config/*.yaml` +
  `artifacts/` + a `repo-profile.yaml` with `definitions_root` set — no local `skills/`,
  `router.md`, `lifecycle.md`, `schemas/`, `validators/`.
- A second, independent repo links to the same global tree without re-copying it.
- `agentsmyth check --phase plan --slug <x>` resolves skills/schemas from the global tree
  and passes in a repo that only ever ran the new `init`.
- `npm run build && npm run validate && npm run violations:test` all pass on this branch
  before Ship.

## Requirements

- R1 (T7.1): Add `agentsmyth prepare` as a new top-level command — the current `--system`
  global-install logic, minus the repo-level write. The `--system` flag is removed outright
  (no deprecated alias, no notice period — it has never shipped to a published release).
- R2 (T7.2): `agentsmyth init` (bare) still runs the full 5-phase interview, but instead of
  a local `expandBundle()`-equivalent copy: (a) auto-runs the `prepare` action by default
  when `~/.agentsmyth/workflow/` is absent; if that auto-run fails or is otherwise not
  possible (no write permission, or any other prepare-time failure), `init` captures the
  error and surfaces it clearly to the user — it does not silently fall back to a local copy
  and does not silently continue; (b) on success, writes `definitions_root` into the repo's
  `repo-profile.yaml` (RI3-superseding change); (c) runs the interview and writes the 5
  `workflow/config/*.yaml` files; (d) creates the empty `workflow/artifacts/` tree.
  Skills/router/lifecycle/schemas/validators are never copied locally — they resolve to the
  global tree via the existing `defsPath()` resolver.
- R3 (T7.3): `headlessBootstrap()` (in `bin/agentsmyth.mjs`, fired from `agentsmyth check`
  when `repo-profile.yaml` is absent) gets the same link-and-surface-errors treatment as R2:
  ensure a global install exists (auto-run `prepare` if absent, surface any failure clearly),
  write stub configs **and** `definitions_root` into the stub `repo-profile.yaml`.
- R4 (T7.4): Confirm the existing `agentsmyth check` version-skew check
  (`agentsmyth_version` vs. current CLI version, `bin/agentsmyth.mjs:85-96`) fires correctly
  under the live-reference model. A plain warning (current behavior) is sufficient — no new
  auto-re-link or version-pin enforcement is required (user decision on A3).
- R5 (T7.5 + local invariant): Annotate RI3 in `workflow/artifacts/briefs/
  system-level-install-v1.md` (and its paired plan artifact) as superseded-by-WP-R7-T7.2 —
  not deleted. Add the definitions/data-split invariant (skill *definitions* may live
  system-side and be read at runtime; repo-specific *config + artifacts* are always
  repo-local) to this repo's own documentation
  (`docs/knowledge-map/repo-mental-map.md` and/or `CLAUDE.md`).
- R6 (T7.6, direct update — see revised A2): Once the shipped behavior (R1–R5, R7) is built
  and verified, update Notion pages 02 (RI3-superseded annotation on the invariant) and 10
  (Current Machine State table, install command block, and Scenarios A/B/E) directly via the
  Notion tools available in this environment. This is explicitly authorized by the user's
  direct instruction in this conversation, which satisfies `source-of-truth.yaml`'s
  `require_user_request_or_config_for_external_write: true` clause for this case without
  adding a standing provider.
- R7 (new — migration audit/prompt/clean, supersedes the originally-proposed warn-and-leave
  default): When `init` runs in a repo whose `workflow/` already holds a full pre-WP-R7 local
  definitions copy (any of `skills/`, `router.md`, `lifecycle.md`, `rules.md`, `schemas/`,
  `validators/` at the workflow root) alongside a resolvable global install, `init` audits
  for exactly those paths, prompts the user with the specific list that would be deleted, and
  deletes them only on explicit confirmation. No silent deletion; no silent leave-in-place —
  the user is always shown the state and asked.

## Constraints

- `[safety-2]` No destructive action without explicit user approval — satisfied by R7's
  audit-then-prompt-then-delete-on-confirmation flow (deletion never happens silently).
- `[provider-neutrality-1]` / `[provider-neutrality-2]` — no source/tracking provider is
  mandatory *by default*; R6's direct Notion writes are compliant specifically because this
  conversation carries an explicit user request for them, not because a provider is
  configured (see the Non-Goals note on this).
- CLAUDE.md golden rules: edit `src/`, not generated output; rebuild (`npm run build`) after
  any `src/workflow/` or `bin/agentsmyth.mjs`-adjacent change; keep all 5 adapters in sync
  if gate-facing messaging changes (RI2); no new runtime dependency (RI3) — R7's interactive
  prompt must use a Node core module (e.g. `node:readline/promises`), not a new package; run
  `npm run validate` and `npm run violations:test` before Ship (RI1).
- `repo-profile.schema.yaml` already has an optional `definitions_root` field (WP-R2) — no
  schema change required (RI4).

## Risks

- Migration data loss: mitigated by R7's audit/prompt/confirm flow — deletion never happens
  without the user seeing the exact path list and confirming.
- Portability regression: a linked repo is no longer self-contained across machines — CI or
  a teammate machine without `~/.agentsmyth/` will hit the existing RI1 resolver guard.
  Message text must point at `prepare` (part of R1/R3), and this must be documented, not
  silently accepted. Relatedly, `init`'s default (no opt-out, per Q1's resolution) means a
  CI run with no global install and no write access will fail loudly rather than degrade
  gracefully — this is the user's explicit choice (Q1) and must be called out in Ship's
  summary, not silently accepted as a side effect.
- Direct Notion writes (R6) could go stale if the user edits pages 02/10 between this brief
  and Ship — Ship must re-fetch current page content immediately before editing rather than
  relying on this brief's snapshot.
- `--system` removal (R1) is a breaking CLI change for anyone who already ran it locally —
  low risk per the user's confirmation that it isn't in real use yet, but worth a one-line
  callout in Ship's summary.
- Scope creep into WP-R8 territory (per-repo behavior tuning) via `agent-behavior.yaml` —
  explicitly rejected per the spike's locked decision 4; `agent-behavior.yaml` stays
  global-only.

## Open Questions

None open. Q1 was resolved directly by the user (see Requirement Manifest → Open Questions
(Q) below for the recorded resolution).

## Requirement Manifest

### Explicit (R)

- **R1** - Add `agentsmyth prepare` as a new top-level command (global-only install);
  `--system` is removed outright, no deprecated alias.
  - Acceptance: `agentsmyth prepare` from any directory installs/refreshes
    `~/.agentsmyth/workflow/` and the 5 adapters' global gate files, creates zero repo-level
    files. `agentsmyth init --system` is no longer a recognized invocation.

- **R2** - `agentsmyth init` links to an existing (or auto-installed) global definitions
  tree instead of copying definitions locally, while still running the full interview;
  any failure in the auto-install step is surfaced to the user, never silently absorbed.
  - Acceptance: after `init` in a fresh repo, `<repo>/workflow/` contains only
    `config/*.yaml` + `artifacts/` + `repo-profile.yaml` with `definitions_root` set — no
    local `skills/`, `router.md`, `lifecycle.md`, `schemas/`, `validators/`. A subsequent
    `agentsmyth check --phase plan --slug X` resolves skills/schemas from the global tree
    and passes. A second, independent repo links to the same global tree. A simulated
    prepare-failure (e.g. an unwritable `~/.agentsmyth/`) produces a clear, non-zero-exit
    error naming the failure — not a silent local-copy fallback.

- **R3** - `headlessBootstrap()` writes `definitions_root` into the stub `repo-profile.yaml`
  instead of leaving `defsRoot` pointing at an unpopulated local `workflow/`, with the same
  error-surfacing behavior as R2.
  - Acceptance: in a never-`init`'d repo, `agentsmyth check` produces stub configs with
    `definitions_root` set, and a subsequent `check-lifecycle.mjs` resolves skills/schemas
    from the global tree without a missing-file error.

- **R4** - Version-skew check confirmed correct under the live-reference model; a plain
  warning is the documented resolution (no new enforcement).
  - Acceptance: a repo whose `repo-profile.yaml` stamps vX, run on a machine whose
    `~/.agentsmyth/` is vY, produces the documented skew warning; this is written down where
    a consumer would find it.

- **R5** - RI3 annotated as superseded (not deleted) in the WP-R2 artifact trail; the
  definitions/data-split invariant documented in this repo's own docs.
  - Acceptance: `workflow/artifacts/briefs/system-level-install-v1.md`'s RI3 entry carries a
    superseded-by-WP-R7-T7.2 annotation; `docs/knowledge-map/repo-mental-map.md` and/or
    `CLAUDE.md` states the definitions-system-side / config-and-artifacts-repo-local
    invariant in one place.

- **R6** - Ship directly updates Notion pages 02 and 10 once the shipped behavior is
  verified, per the user's explicit authorization in this conversation.
  - Acceptance: pages 02 and 10 are edited via the available Notion tools (not just a
    copy-ready block), and the ship artifact cites the resulting page URLs/edit
    confirmation as evidence.

- **R7** - Migration case: audit a pre-WP-R7 repo's local definitions tree, prompt the user
  with the exact paths that would be deleted, delete only on explicit confirmation.
  - Acceptance: a repo fixture with a full local `workflow/skills/` tree plus a resolvable
    global install, run through `init`, produces a prompt listing the exact stale paths;
    declining leaves them in place and the link still completes (`definitions_root`
    written); accepting deletes exactly the audited paths and no others.

### Implicit (RI)

- **RI1** - `npm run build && npm run validate && npm run violations:test` must pass before
  Ship (repo-wide contract; matches WP-R2's own Ship evidence precedent).
  - Acceptance: Ship artifact cites current-turn command output for all three, not a claim.

- **RI2** - All 5 adapters (claude, codex, copilot, cursor, windsurf) stay in sync wherever
  gate-facing messaging (e.g. the RI1 resolver's "run `agentsmyth init --system`" guard
  text) changes to reference `prepare` instead.
  - Acceptance: a grep for the old `--system`-only guard wording across
    `src/adapters/*/global-gate.md` and `src/workflow/validators/lib.mjs` returns no stale
    references once R1/R3 ship.

- **RI3** - No new runtime dependency is introduced (zero-dep invariant).
  - Acceptance: `package.json` `dependencies` is unchanged by this work.

- **RI4** - The existing optional `definitions_root` field in
  `repo-profile.schema.yaml` is reused as-is; no schema change is required for R1–R4.
  - Acceptance: `git diff` on `src/workflow/schemas/repo-profile.schema.yaml` is empty
    unless a genuinely new field is discovered necessary during Plan/Build.

- **RI5** - The migration case (pre-WP-R7 repo with a full local `workflow/` definitions
  copy, re-running `init` after a global install exists) must not silently leave two
  divergent definition trees that could shadow the global one at runtime.
  - Acceptance: resolved via R7 — audit, prompt, delete-on-confirmation.

### Assumptions (A)

- **A3** - R4 is satisfied by confirming and documenting the existing warn-only skew check
  (`bin/agentsmyth.mjs:85-96`); no new enforcement mechanism (auto re-link or version pin)
  is required. Confirmed by the user, 2026-07-17.

### Open Questions (Q)

- **Q1** - Should `init`'s auto-run-of-`prepare` have a CI/locked-down-environment opt-out?
  - Owner: user
  - Blocking: no
  - **Resolved (2026-07-17):** No opt-out. `init` always attempts `prepare` by default when
    no global install exists. If that attempt fails or isn't possible for any reason, `init`
    captures the error and surfaces it clearly to the user rather than silently proceeding
    or falling back. See R2/R3.

## Questions For User

None outstanding — Q1 was resolved directly (see above). A1, A2, and A4 as originally
proposed were rejected by the user and replaced by R7, R6, and R1 respectively; A3 was
confirmed as-is.

## Architecture Notes

- role: Architect
- decision: Adopt the spike's live-reference model — skill *definitions* live once at
  `~/.agentsmyth/workflow/` and are read at runtime via `definitions_root`; repo-specific
  *config + artifacts* stay repo-local, written by the interview. `init` always auto-runs
  `prepare` when no global install exists, then links; no opt-out, no fallback-to-local-copy
  path. Any failure surfaces as a clear, non-zero-exit error (user decision on Q1).
- decision: `--system` is removed outright, not deprecated (user decision, overturning this
  brief's original A4 proposal) — it was never in a published release.
- decision: Migration is audit → prompt → delete-on-confirmation (R7), not warn-and-leave
  (user decision, overturning this brief's original A1 proposal). This still satisfies
  `[safety-2]` (deletion requires explicit approval) while giving the user positive control
  instead of leaving stale trees to silently accumulate.
- decision: Notion pages 02 and 10 are updated directly by this chain at Ship (R6), not left
  as a handoff (user decision, overturning this brief's original A2 proposal). Compliant
  with `update_policy.require_user_request_or_config_for_external_write: true` because this
  conversation is the explicit request — it does not require adding a standing provider to
  `source-of-truth.yaml`.
- constraint: `[safety-2]`, `[provider-neutrality-1]`, `[provider-neutrality-2]` from
  `domain.yaml`; zero-dependency and edit-source-not-generated-output rules from `CLAUDE.md`.
- tradeoff: Considered (a) keep RI3 as-is and add a separate explicit `link` command instead
  of changing `init`'s default behavior — rejected because it doesn't satisfy the actual
  goal ("run `init` in any number of repos afterward... without a separate linking step");
  (b) fall back silently to a full local copy when no global install exists — rejected
  because it reintroduces the exact redundant-copy problem this brief exists to remove; (c)
  hard-refuse `init` when no global install exists — rejected as unnecessarily hostile to a
  first-time user. Auto-run-then-link with errors surfaced (not swallowed) is the option
  consistent with the goal, Q1's resolution, and existing repo safety constraints.
- tradeoff: Considered warn-and-leave for the migration case (this brief's original
  proposal) vs. audit-prompt-delete-on-confirmation (R7, user's choice) — the user
  explicitly preferred the latter for positive cleanup rather than accumulating stale
  trees indefinitely; both satisfy `[safety-2]`, R7 is simply more proactive.
- tradeoff: Considered handoff-only Notion updates (this brief's original proposal, citing
  no configured provider) vs. direct writes (R6, user's choice) — the user's explicit
  authorization in this conversation is itself the "user request" `source-of-truth.yaml`
  requires for an external write, so direct writes are policy-compliant without a config
  change.
- assumptions: A3 (plain warning suffices for R4) is the only original assumption the user
  confirmed as-is; Plan should not reintroduce warn-and-leave, a `--system` alias, or
  handoff-only Notion updates without flagging the change back to the user.
- downstream: Plan should follow the spike's own sequencing, extended with the new pieces —
  T7.1/R1 (`prepare` exists, `--system` removed) → T7.2/R2 (`init` links + surfaces errors —
  the core fix) → R7 (migration audit/prompt/delete, same code path as R2) → T7.3/R3
  (bootstrap gets the same treatment) → T7.4/R4 (confirm skew check) → R5 (local invariant
  doc) → R6 (direct Notion updates, last, once behavior is verified). R7's interactive
  prompt is new architecture surface for this CLI (no existing prompt mechanism in
  `bin/agentsmyth.mjs`) — Plan should specify the mechanism (e.g. `node:readline/promises`,
  a core module, per RI3) and how it behaves in a non-TTY/CI context (fail closed — surface
  the pending-confirmation state as an error rather than hang or silently skip, consistent
  with Q1's error-surfacing principle). Build will touch `bin/agentsmyth.mjs` directly (not
  `src/workflow/`), so the "rebuild after `src/workflow/` change" rule may not strictly
  apply to every task, but `npm run validate`/`violations:test` still gate Ship per RI1.

## Exit Gate

- [x] Every active R and RI has acceptance criteria.
- [x] No open Q; `orchestration.blockers` is empty.
- [x] User approved the brief (checkpoint: `brief-review`) — resolved via the user's direct
      answers to Q1 and A1/A2/A3/A4 in this conversation, 2026-07-17.

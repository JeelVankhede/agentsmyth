---
slug: wp-r8-behavior-tuning
version: 1
artifact: brief
status: ready-for-next-phase
created: 2026-08-11
updated: 2026-08-14
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, R8, RI1, RI2, RI3, RI4, RI5, RI6, RI7, RI8, RI9]
upstream:
  - user-request
  - notion-wp-r8
orchestration:
  phase: think
  status: ready-for-next-phase
  next_phase: plan
  blockers: []
  user_checkpoint: brief-review
skill_trigger_log:
  - skill: repo-alignment-scan
    decision: ran
    reason: "task_class = Standard satisfies task_class != trivial. Read src/workflow/schemas/repo-profile.schema.yaml, src/workflow/validators/check-config.mjs, src/workflow/validators/check-trigger-predicates.mjs, src/workflow/agent-behavior.yaml, and src/workflow/skills/dispatch-subagents/references/phase-caps.md directly this Think rather than trusting the Notion spike page. That scan produced RI1 and RI2, neither of which appears on the WP page."
  - skill: architecture-decision-advisor
    decision: ran
    reason: "new_surface = true — `tuning:` is a config surface that does not exist today anywhere in the repo, and it introduces the first cross-file config-resolution rule (repo-profile.yaml read against agent-behavior.yaml). Decision, rejected alternatives, and rationale recorded in Architecture Notes."
  - skill: constraint-conflict-scan
    decision: ran
    reason: "task_class = Standard satisfies task_class != trivial. Checked workflow/config/domain.yaml constraints and repo-profile.yaml protected paths: no protected pattern (.git/**, .env*, **/*secret*) matches any file in scope. provider-neutrality-1/2 unaffected — no provider becomes mandatory. No conflict found."
---

# WP-R8 — Per-Repo Behavior Tuning - Brief

## Source Links

- Notion: [WP-R8 — Per-Repo Behavior Tuning](https://app.notion.com/p/3a1972bdebbb81fdad2cee228a1ec707) — the work package this brief converts into a lifecycle chain. 🟡 Ready, P2, targeted 1.1.0. Listed there as Standard; reclassified **Complex** on 2026-08-13 by the scope expansion below, which the Notion page still needs updating to reflect (a Ship-phase task alongside the Q1 correction).
- Notion: [WP-R8 — Research Spike (per-repo behavior tuning)](https://app.notion.com/p/3a0972bdebbb81a8bc1ef201be7e1b89) — scope, non-goals, and the original tunable-vs-locked split.
- Notion: [1.1.0 — Minor Release Work Plan](https://app.notion.com/p/3ab972bdebbb81ef88b7f3cf7e500d79) — names WP-R8 as one of the two packages in the minimum ship bar, and binds the whole release to additive-only changes.
- The **Tunable Key Allowlist (resolved 2026-08-09)** section on the WP page — the enumerated five tunable keys, the locked list, and the governing stricter-or-unchanged rule. Treated as settled input, not re-litigated here.

## Problem

A consumer repo has exactly one place to influence lifecycle behavior today: nothing. `agent-behavior.yaml` lives at `~/.agentsmyth/workflow/agent-behavior.yaml`, shared across every repo on the machine, and `repo-profile.yaml` carries only repo shape (paths, branch policy, ownership) — no behavior knobs.

That is wrong for a handful of values that are genuinely repo-shaped rather than universal. A small repo has no use for `dispatch.max_parallel_workstreams: 3`. A repo where "frontend" means `ui/` rather than `**/components/**` needs `skill_scoring.path_glob_categories` to say so, or every path-glob trigger misfires. A repo with a stricter review culture wants extra entries in `pause_resume.user_checkpoint_required_for`.

The obvious fix — let a repo drop its own `agent-behavior.yaml` and merge-layer it — is the one that must not happen. It re-opens the WP-R2 config-straddle and lets a repo silently weaken the WP-R1 enforcement gates by editing `task_classes`, `evidence_policy`, or `lifecycle`. `repo-profile.yaml` physically cannot hold a gate rule, which is exactly why the tunables belong there.

Two things the repo scan found that the WP page does not state, and that materially shape the work:

1. **Nothing in the codebase consumes these values as behavior.** `dispatch.max_parallel_workstreams`, `pause_resume.user_checkpoint_required_for`, and `skill_scoring.complexity_score.weights` are read by the *agent* out of the YAML, per skill prose (`src/workflow/skills/dispatch-subagents/references/phase-caps.md:5,19` is explicit: "Read `agent-behavior.yaml` to get the current cap"). A `tuning:` block that only a schema validates is **inert** — the agent will keep reading the global file and never look at `repo-profile.yaml`.
2. **One validator does consume two of the five tunables, from the global file only.** `check-trigger-predicates.mjs:24-27` loads `skill_scoring.complexity_score.weights` and `skill_scoring.path_glob_categories` via `defsPath('agent-behavior.yaml')`. If a repo tunes either and that validator does not resolve the merged value, the validator evaluates predicates against global values while the agent evaluates them against tuned values — a silent divergence in the one check that exists to catch trigger regressions.

## Scope Expansion — 2026-08-13

This brief was chartered as Standard and expanded in place (no v2 — nothing downstream is
committed, the chain is incomplete, and no existing manifest ID is renumbered). **Task class is now
Complex**: new architectural pattern, cross-cutting, multiple callers. Test therefore stops being
skippable without a waiver.

Three decisions from the user, all binding:

1. **Absorb, don't split.** The intent layer, the threshold split, setup negotiation, and
   upgrade-skew reconciliation all land inside WP-R8 rather than becoming separate packages.
2. **Non-blocking, with global fallback.** Unreconciled repo config never stops work. Until a repo
   completes its own config, every value resolves from the global install. This is what keeps 1.1.0
   a minor: a repo that ignores the prompt behaves byte-for-byte as it does today.
3. **Per-entry merge** (resolves Build blocker B-2). A tuned entry replaces that entry only;
   unnamed entries keep their global value, at every level of nesting. `user_checkpoint_required_for`
   remains the single union exception.

Coverage of the skill surface, which drove the intent design: 33 skills total, 8 lifecycle
(non-negotiable). Of the remaining 25, **10 are scored** and form the negotiable surface; 14 are
gate-bound or utility and are locked by design (a repo that can dial down `scope-fence` or
`waiver-completeness-check` can weaken enforcement); the 15th, `dispatch-subagents`, is covered by
`dispatch.enabled`. Nothing is unaccounted for.

## Goals

- A repo can set the allowlisted tunables (the original five, plus `skill_scoring.thresholds` added by R6) in `workflow/config/repo-profile.yaml` under a new optional `tuning:` block, and the human-facing `intent:` block that derives them.
- Any key under `tuning:` that is not on the enumerated allowlist is rejected by `npm run validate`, with the offending key named.
- A tuned value may make behavior stricter or leave it unchanged, never looser — enforced, not just documented.
- The tuned value is the one actually used at the point of consumption, for every allowlisted key.
- Everything is additive: no new required field anywhere, and a `repo-profile.yaml` with no `tuning:` block validates exactly as it does today.

## Non-Goals

Four of these were narrowed by the 2026-08-13 scope expansion. They are restated below as they now
stand, with the original wording and what changed, because a Non-Goal that silently stopped being
one is worse than no Non-Goal at all.

- A repo-local `agent-behavior.yaml`, in any form, merge-layered or otherwise. Explicitly rejected — see Problem. **Unchanged.**
- Arbitrary per-repo rewriting of `skill_scoring.triggers` **predicate structure**. *Originally: "Opening `skill_scoring.triggers` for per-repo override."* **Narrowed 2026-08-13 (R6):** the numeric thresholds were split out into `skill_scoring.thresholds`, which is tunable; the boolean structure of every predicate stays locked and global. A repo changes how often a skill fires, never whether its condition can be satisfied at all.
- Re-deriving the tunable-vs-locked split wholesale. *Originally: "Any change to the locked key set."* **Narrowed 2026-08-13:** exactly one key moved, and only partly — the thresholds inside `triggers`, per R6 above. The 2026-08-09 WP-page split is otherwise consumed unchanged, and every other locked key named there remains structurally unreachable under `tuning:`.
- Migrating or rewriting existing repos' config values on upgrade. *Originally: "A migration path for existing consumer repos."* **Narrowed 2026-08-13 (R8):** an upgrade now *proposes* new config via `pending-setup.yaml` items, non-blocking, and never edits an existing value. Absent `tuning:` and `intent:` still means today's behavior exactly.
- WP-R18's provenance **manifest** and its conflict-resolution machinery — versioned migration descriptors, backup-and-pending-item, reconciling user-edited definition files. *Originally: "WP-R18's provenance manifest or upgrade reconciliation. Out of 1.1.0 entirely."* **Narrowed 2026-08-13 (R8, RI8):** this package does carry a minimal upgrade path (propose-only, via the existing pending-setup mechanism) and a minimal provenance record (`intent.derived_keys`, a flat list of derived dotted keys). Neither is WP-R18's design, and WP-R18 remains in 1.2.0 — but the overlap is real and Reflect should record it so WP-R18 is re-scoped against what actually shipped rather than what it assumed.

## User Impact

A consumer repo gains five knobs that were previously machine-global, without gaining any ability to weaken the gate that makes agentsmyth worth installing. The failure mode this prevents is the more important half: a repo owner who wants "fewer parallel agents" today has no legitimate route, and the illegitimate route (hand-editing the global `agent-behavior.yaml`) silently changes behavior for every other repo on that machine.

Repos that set nothing see zero change.

## Success Metrics

- `repo-profile.yaml` with a valid `tuning:` block containing every allowlisted key passes `npm run validate`.
- `repo-profile.yaml` with a sixth, non-allowlisted key under `tuning:` fails `npm run validate`, and the message names the rejected key.
- `repo-profile.yaml` attempting `tuning: { dispatch: { enabled: required } }` fails — the looser direction is closed.
- `repo-profile.yaml` attempting to remove a checkpoint present in the global `pause_resume.user_checkpoint_required_for` fails, or is unioned away; either is acceptable, silently honouring the removal is not.
- Every existing `repo-profile.yaml` in `examples/` and this repo's own `workflow/config/` validates unchanged.
- `npm run build && npm run validate && npm run violations:test` all pass.

## Requirements

Numbered in the Requirement Manifest below. R1–R4 come from the user request and the WP page; RI1–RI6 are derived from the repo scan, config, and release constraints.

## Constraints

- **Additive only.** The 1.1.0 release plan binds every package: new optional fields with safe defaults, no required-schema change, all pre-1.1.0 artifacts still validating. A required field escalates 1.1.0 to a major bump. `repo-profile.schema.yaml` has `additionalProperties: false` at its root, so `tuning:` must be added as a named optional property — it cannot ride in on permissiveness.
- **Zero runtime dependencies.** The schema engine, YAML parser, and validators are hand-written Node ESM and stay that way. Any allowlist or merge logic is hand-rolled.
- **Edit source, rebuild.** `src/workflow/schemas/` and `src/workflow/validators/` are the source of truth; `workflow/schemas/` and root `validators/` are build products. `npm run build` after every source change.
- **`repo-profile.yaml` must remain incapable of holding a gate rule.** This is the load-bearing safety property of the whole design. Any implementation that lets a `tuning:` key reach `lifecycle`, `task_classes`, `evidence_policy`, `change_policy`, or `waivers` defeats WP-R8's reason for existing.
- **Adapters stay in sync** if any gate text changes. Not expected in this package, but checked before ship.
- Domain constraints checked via `constraint-conflict-scan`: no conflict (see frontmatter).

## Risks

- **Inert-config risk (highest).** If RI1 is descoped, the feature ships as a schema that validates a block nothing reads. This is the most likely way WP-R8 "ships" without working, because the schema and validator work is visible and the skill-prose work is not.
- **Two-source-of-truth drift.** ~~If the allowlist is enumerated in both `repo-profile.schema.yaml` and as a constant in `check-config.mjs`, the two can diverge.~~ **Closed by Q1's resolution** — one enumeration, in the schema. Residual: the Notion WP page still says the constant lives in `check-config.mjs` and is now stale; correcting it is a Ship-phase task, tracked so the next reader does not implement from the outdated page.
- **Validator/agent divergence** on `path_glob_categories` and `weights` (RI2). Silent, and it degrades the one mechanical trigger-regression check in the repo.
- **Append-only semantics for `user_checkpoint_required_for`** are the only tunable needing a real merge rather than an override. A resolver that treats it like the other four (replace) silently deletes a checkpoint — a looser outcome from a rule that exists to prevent looser outcomes.
- Scope creep into a general config-merge layer. The keys are enumerated precisely so this stays a fixed, small surface — six as built, each added deliberately and none by pattern.

## Open Questions

Q1, Q2, and Q3 were raised as blocking and were answered by the user on 2026-08-12. All three are resolved below and `orchestration.blockers` is now empty. No open question remains.

## Requirement Manifest

### Explicit (R)

- **R1** — Add an optional top-level `tuning:` block to `repo-profile.yaml`, carrying exactly the allowlisted keys: `dispatch.max_parallel_workstreams`, `dispatch.enabled`, `skill_scoring.complexity_score.weights`, `skill_scoring.path_glob_categories`, `pause_resume.user_checkpoint_required_for` — the five settled on 2026-08-09 — plus `skill_scoring.thresholds`, a **sixth** added by R6 on 2026-08-13. Read "five" elsewhere in this brief as the original five; the allowlist is six keys as built.
  - Acceptance: a `repo-profile.yaml` setting all five passes `npm run validate`; a `repo-profile.yaml` with no `tuning:` block passes unchanged.
- **R2** — Enforce the allowlist by explicit enumeration, not a shape check. Any key under `tuning:` outside the five is rejected.
  - Acceptance: a negative fixture with a non-allowlisted key under `tuning:` fails `npm run validate` with a message naming the rejected key. A fixture tuning a locked key (e.g. `task_classes`, `evidence_policy`, `dispatch.require_independent_file_ownership`) fails the same way.
- **R3** — Enforce the governing rule: stricter-or-unchanged, never looser. `dispatch.enabled` restricted to `optional` or `disabled`; `pause_resume.user_checkpoint_required_for` append-only, resolved by union with the global list, never replacement. `max_parallel_workstreams` (0–10) and `path_glob_categories` are exempt — capacity and vocabulary have no looser direction.
  - Acceptance: `tuning.dispatch.enabled: required` fails validation. A `tuning` list omitting a globally-required checkpoint does not result in that checkpoint being dropped — proven by a fixture asserting the resolved list is a superset of the global one.
- **R4** — The change is additive across the release: no new required field, and every pre-1.1.0 `repo-profile.yaml` still validates.
  - Acceptance: `repo-profile.schema.yaml`'s `required:` array is byte-identical before and after; all `examples/` repo profiles and this repo's own `workflow/config/repo-profile.yaml` validate with no edits.

- **R5** — Add an intent layer: repo-owned, human-answerable config that *derives* the mechanism tunables. Keys: `repo_character`, `surface_map`, `concerns` (a map of the 8 concern areas covering all 10 scored skills), `parallelism_appetite`, `review_ceremony`. Concern levels are `not-applicable | light | standard | strict`.
  - Acceptance: a repo profile setting only `intent.concerns` validates and yields derived mechanism values; `standard` on every concern reproduces today's threshold literals exactly, proven by a fixture whose computed trigger outcomes match the current sandbox expectations unchanged.
- **R6** — Split numeric thresholds out of `skill_scoring.triggers` into a tunable `skill_scoring.thresholds` map, with predicates referencing them symbolically (`complexity_score >= thresholds.clean-code-architect`). Predicate *structure* stays locked; only the numbers move.
  - Acceptance: `check-trigger-predicates.mjs` resolves symbolic thresholds and its 10 predicates evaluate identically to today against the existing sandbox fixture; a fixture attempting to rewrite a predicate's boolean structure via `tuning:` is rejected.
- **R7** — Setup negotiation: `init` seeds intent items into `pending-setup.yaml`; the router's existing session-start pass resolves them by inspection first, then a single batched ask carrying a recommendation.
  - Acceptance: a fresh init produces open `PS-N` items for every intent key; items inferable from repo inspection (`repo_character`, `surface_map`) are resolved without asking; the rest are surfaced in one batch, never blocking.
- **R8** — Upgrade-skew reconciliation: on detected skew, enumerate config surfaces the new version introduces, scan the repo, and write `pending-setup.yaml` items proposing values. Non-blocking; until resolved, values resolve from the global install.
  - Acceptance: a repo stamped with an older `agentsmyth_version` gets intent items written on `agentsmyth check` and can continue all lifecycle work with those items still open, behaving exactly as the global config dictates.

### Implicit (RI)

- **RI1** — Each tunable must be honoured at its point of consumption. The consumption points are agent-read prose, not code: `src/workflow/skills/dispatch-subagents/references/phase-caps.md` (lines 5 and 19 name `agent-behavior.yaml` directly), `src/workflow/agent-behavior.yaml`'s `skill_scoring` block comments, and wherever `pause_resume.user_checkpoint_required_for` is read for checkpoint enforcement. Each must instruct the agent to resolve the effective value as *global, then repo-local `tuning:` override* rather than reading the global file alone.
  - Acceptance: no remaining instruction in `src/workflow/` tells an agent to read one of the five tunables from `agent-behavior.yaml` without also resolving `repo-profile.yaml`'s `tuning:`. Verified by grep over `src/workflow/` for each of the five key names.
- **RI2** — `check-trigger-predicates.mjs` reads `skill_scoring.complexity_score.weights` and `skill_scoring.path_glob_categories` from `defsPath('agent-behavior.yaml')` only (lines 24–27). Per Q2's resolution it must resolve the **merged** effective value — global overridden by repo-local `tuning:` — before evaluating any predicate.
  - Acceptance: with a `tuning.skill_scoring.path_glob_categories` override in place, the validator evaluates `path~<category>` terms against the tuned glob set, proven by a fixture whose expected outcome differs between tuned and untuned config; the file's header comment describes the merge; `npm run validate` still passes against `examples/power-skill-sandbox/`.
- **RI3** — Source-to-build discipline: `src/workflow/` changes require `npm run build`, which re-syncs `src/workflow/schemas/` → `workflow/schemas/` and recompiles `dist/workflow-bundle.md`.
  - Acceptance: `npm run build` run and its output cited in the verify artifact; no hand-edit to `dist/`, root `validators/`, or `workflow/schemas/` appears in the diff.
- **RI4** — Negative fixtures, per the 1.1.0 release plan's combined-verification block, which names "a negative fixture for a non-allowlisted key under `repo-profile.yaml` tuning:".
  - Acceptance: the fixture exists alongside the existing violation fixtures and `npm run violations:test` rejects it; every pre-existing fixture still fails as expected. (Corrected 2026-08-13: this originally read "the pre-existing 4 fixtures", a number inherited from `CLAUDE.md`'s stale "all 4 fixtures rejected" line. The suite held 21 cases before this package and holds 29 after. No count is asserted here, since the suite grows.)
- **RI5** — Locked keys stay unreachable. The locked set (all of `lifecycle`, `task_classes` including `classification_signals`, `evidence_policy`, `change_policy`, `waivers`, `version`, `kind`, `canonical_source`, the rest of `pause_resume`, `dispatch.require_independent_file_ownership`, `dispatch.require_dispatch_log`, `dispatch.merge_owner`, `skill_scoring.triggers`) must be rejected under `tuning:`.
  - Acceptance: covered by R2's fixture; additionally, a reviewer can trace from the enumerated allowlist to the assertion that rejects everything else, in one file.
- **RI6** — Full consumer-facing documentation of per-repo tuning: all five keys, their value domains, the global-then-local resolution rule (including the union exception for `user_checkpoint_required_for`), the locked-key set and why it is locked, and a worked example. Per Q3's resolution this is in scope at full width — not narrowed to schema `description:` fields, and not deferred to WP-R11.
  - Acceptance: a repo owner can configure all five tunables correctly from the documentation alone, without opening `repo-profile.schema.yaml`; the locked set and the stricter-or-unchanged rule are both stated explicitly; `npm run validate` passes including `check-setup-refs.mjs` (no broken cross-references introduced).

- **RI7** — Floors on two concerns: `constraints_safety` and `repo_alignment` may never be set to `not-applicable`. One checks domain constraints and protected paths; the other checks that work matches repo reality. Neither is taste.
  - Acceptance: a fixture setting either to `not-applicable` is rejected by `npm run validate`, naming the concern and the floor.
- **RI8** — Derived-vs-explicit provenance: a mechanism value derived from intent must be distinguishable from one the user set by hand, so a later upgrade may safely re-derive the former and must never silently overwrite the latter.
  - Acceptance: the profile records which mechanism values were derived; a re-derivation run leaves hand-set values untouched, proven by a fixture carrying both kinds.
- **RI9** — Backward compatibility under absence: a repo with no `tuning:` and no `intent:` resolves every value from the global install and behaves byte-for-byte as it does today. This is what holds 1.1.0 to a minor bump.
  - Acceptance: this repo's own profile and all four `examples/` profiles validate unedited, and `check-trigger-predicates.mjs` reports the same 10 predicate outcomes as before the package.

### Assumptions (A)

- **A1** — The five tunable keys, the locked list, and the stricter-or-unchanged governing rule are settled input from the WP page (resolved 2026-08-09). This brief does not re-derive or re-litigate them.
- **A2** — WP-R8 stays a minor bump. Every requirement above is additive; nothing changes a required field. If Plan finds a required-field change is unavoidable, that is an escalation back to the user, not an assumption to absorb.
- **A3** — This repo's own `workflow/config/repo-profile.yaml` gains no `tuning:` block. agentsmyth's own settings are already the defaults, so dogfood coverage comes from fixtures and `examples/`, not from live self-configuration. Plan should not treat "the repo uses it" as evidence.
- **A4** — Work proceeds on `feat/wp-r8-behavior-tuning`, branched from `release/1.1.0`, and merges back into `release/1.1.0` rather than `main`. Per the user's stated 1.1.0 integration model.

### Open Questions (Q)

- **Q1** — Where does the enumerated allowlist live? The WP page says `check-config.mjs` carries it as a constant. But `repo-profile.schema.yaml` with `additionalProperties: false` plus five named properties *is* an explicit enumeration, and it also gets value-domain checks (`dispatch.enabled` enum, `max_parallel_workstreams` 0–10) for free. Carrying the list in both places creates the drift hazard WP-R19 is fixing elsewhere this release.
  - Owner: user. Blocking: yes. **Status: resolved 2026-08-12 — "Schema owns it".**
  - Resolution: `repo-profile.schema.yaml` is the single home for the key enumeration and value domains. `check-config.mjs` carries only the cross-file rule the schema cannot express — the union/superset check for `pause_resume.user_checkpoint_required_for` against the global `agent-behavior.yaml`. This supersedes the WP page's "constant in `check-config.mjs`" wording; the WP page should be updated at Ship so Notion and code do not disagree.
- **Q2** — Does `check-trigger-predicates.mjs` resolve merged tuning (RI2)? Making it merge keeps validator and agent seeing the same predicates. Leaving it global-only is less code but means a repo that tunes `path_glob_categories` gets a validator checking a scenario that no longer reflects how its agent will actually evaluate triggers.
  - Owner: user. Blocking: yes. **Status: resolved 2026-08-12 — "Yes, merge".**
  - Resolution: `check-trigger-predicates.mjs` resolves the merged effective values for `skill_scoring.complexity_score.weights` and `skill_scoring.path_glob_categories` before evaluating predicates. The accepted cost is a second config read and a definitions-side validator reading repo-local data; the rejected cost was a silent validator/agent divergence in the repo's only mechanical trigger-regression check.
- **Q3** — Is the skill-prose work (RI1) and consumer documentation (RI6) in scope for WP-R8, or split out? If RI1 is descoped, `tuning:` ships inert — validated by the schema, read by nothing.
  - Owner: user. Blocking: yes. **Status: resolved 2026-08-12 — "RI1 and RI6 both fully in".**
  - Resolution: both are in scope at full width. RI1 (skill prose resolving global-then-repo-local for all five tunables) and RI6 (complete consumer-facing documentation, not narrowed to schema `description:` fields) ship inside WP-R8. Nothing defers to WP-R11. Plan must size for this — it is the larger of the two options offered, and RI6 in full is the single biggest driver of this package's footprint.

## Questions For User

All three blocking questions were answered on 2026-08-12; resolutions are recorded under Open Questions (Q) above. Nothing further is outstanding for Plan.

One item remains for the user, non-blocking: **the brief itself has not been approved.** Answering Q1–Q3 resolved the blockers, which is not the same as signing off on the brief's scope, and `workflow/rules.md`'s Approval section forbids treating the former as the latter. `orchestration.status` stays `blocked-for-user` and `## Checkpoint Approval` stays pending until a real approval message exists.

## Architecture Notes

- **role:** Architect
- **decision:** Tunables live in `repo-profile.yaml` under a single new optional `tuning:` block, mirroring the shape of the corresponding `agent-behavior.yaml` paths, with resolution defined as *global value, overridden by repo-local `tuning:` value*, except `pause_resume.user_checkpoint_required_for`, which is resolved by union rather than override.
- **rejected alternative — repo-local `agent-behavior.yaml`, merge-layered.** Rejected on the WP page and confirmed here. It re-opens the WP-R2 config-straddle and gives a repo a direct route to weakening `task_classes`, `evidence_policy`, and `lifecycle` — the WP-R1 enforcement gates. The whole value of putting tunables in `repo-profile.yaml` is that the file has no structural place to put a gate rule.
- **rejected alternative — shape check (`tuning:` accepts any key matching a known-path pattern).** Rejected because it accepts keys never intended to be tunable. `classification_signals` is the sharp example: tuning it is an indirect route to reclassifying all work as trivial and skipping every phase, and a shape check has no way to tell that apart from a legitimate weights edit.
- **rejected alternative — a general per-repo config-merge layer.** Rejected as unbounded. Five enumerated keys is a surface a reviewer can hold in their head; "merge anything" is not, and it would require a locked-key denylist that grows every time `agent-behavior.yaml` does.
- **decision (Q1, user, 2026-08-12):** the enumeration is expressed **once**, in `repo-profile.schema.yaml`. `check-config.mjs` holds no key list — only the union/superset rule against the global `agent-behavior.yaml` that a schema cannot express. Rejected: a validator constant (the WP page's original wording) and a both-plus-sync-check arrangement; both create a second place for a five-key list to drift, which is the defect class WP-R19 is fixing elsewhere in this same release. Consequence: the Notion WP page is now stale on this point and must be corrected at Ship.
- **decision (Q2, user, 2026-08-12):** `check-trigger-predicates.mjs` merges tuned values before evaluating predicates. Rejected: global-only with an explanatory comment — cheaper, but it leaves a repo that tunes `path_glob_categories` with a green validator checking a glob set its agent will not use.
- **decision (Q3, user, 2026-08-12):** RI1 and RI6 both land in full inside WP-R8. Rejected: the narrower option that deferred fuller documentation to WP-R11's docs site, and the schema-plus-validator-only option that would have shipped `tuning:` inert. Consequence: this package is larger than the WP page implies, and Plan must size RI6 as real work rather than a doc touch-up.
- **constraint:** `repo-profile.schema.yaml` root is `additionalProperties: false`, so `tuning:` must be a named property. Its `required:` array must not change, or the release stops being a minor.
- **tradeoff:** `check-trigger-predicates.mjs` merging tuned values (Q2) costs a second config read and couples a definitions-side validator to repo-local data. Accepted in the recommendation because the alternative is a silent validator/agent divergence in the repo's only mechanical trigger-regression check.
- **assumption Plan must verify:** that no consumption point for the five tunables exists outside the ones this Think found. The grep in RI1's acceptance criterion is the mechanism; Plan should not take this brief's list on faith.
- **downstream:** Plan sequences schema → validator → skill prose → fixtures, with the skill-prose step (RI1) load-bearing rather than cosmetic. Build touches `src/workflow/schemas/repo-profile.schema.yaml`, `src/workflow/validators/check-config.mjs`, possibly `check-trigger-predicates.mjs`, and several `src/workflow/skills/**` reference files, then rebuilds. Review must check the locked-key surface specifically. Test needs the negative fixtures named in RI4 and the 1.1.0 release verification block. Ship merges into `release/1.1.0`, not `main`, and does not tag.

## Checkpoint Approval

- Checkpoint: brief-review
- Status: approved
- User's own words (verbatim, this turn): "Brief is approved"
- Date: 2026-08-12

## Exit Gate

- [x] Every active R and RI has acceptance criteria.
- [x] Blocking Q IDs appear in orchestration.blockers. (Q1–Q3 resolved 2026-08-12; blockers now empty.)
- [x] User approved or waiver recorded.

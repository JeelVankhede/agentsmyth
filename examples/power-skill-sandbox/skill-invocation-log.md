# Skill Invocation Log

Dated entries recording a manual dogfood run of `SCENARIO.md` (order cancellation: REST endpoint +
migration + UI dialog) through the real `## Workflow` of each passive/scored power skill in
`skill_scoring.triggers`. See `README.md` for why this log exists and when to add to it.

Each entry is produced by loading the skill's actual `SKILL.md` and applying its workflow to this
scenario's stub files by hand — not a description of the skill, but what it would actually surface
given this input. Trigger outcomes (ran/skipped) come from `check-trigger-predicates.mjs`, which
evaluates the real predicates mechanically; the content underneath "ran" entries is the manual,
non-automatable part.

---

## 2026-07-12 — baseline run, WP-R4 Wave 3 catalog (10 skills)

Signals: `files_touched=3, ri_count=2, touches_protected=false, touches_contract=true,
touches_generated=false, new_surface=true, task_class=standard` → `complexity_score=48`.

### repo-alignment-scan — ran

Trigger: `complexity_score >= 40 OR new_surface OR task_class != trivial` (new_surface=true).
Applied to the scenario: the repo has no existing `orders` resource or cancellation flow, so this
would be flagged as a genuinely new surface rather than an extension of an existing pattern —
the skill would ask whether an existing "soft-delete" or "status transition" convention exists
elsewhere in the repo (e.g. for other order-state changes) before treating `PATCH
/orders/:id/cancel` as the right shape, rather than assuming REST conventions from scratch.

### architecture-decision-advisor — ran

Trigger: `complexity_score >= 60 OR touches_contract OR new_surface` (touches_contract=true,
new_surface=true). Applied: would force a recorded decision on where cancellation eligibility
logic lives (endpoint handler vs. a domain/service layer) and name the rejected alternative
(inline validation in the route handler) — since this is exactly the kind of local decision that
looks fine in isolation but conflicts with a service-layer convention elsewhere in a larger repo.

### constraint-conflict-scan — ran

Trigger: `task_class != trivial OR touches_protected` (task_class=standard). Applied: would cross-
check the new `cancel_reason` migration and the cancellation endpoint against any configured
`domain.yaml` safety/product constraints — e.g. a constraint like "cancellations require an audit
trail" would surface here as a conflict with a migration that only adds a free-text reason column
with no audit table.

### domain.interface-contract-designer — ran

Trigger: `path~contract_globs OR touches_contract` (both true: `src/api/routes/orders.ts` matches,
touches_contract=true). Applied: would specify the cancel endpoint's contract — `POST
/orders/:id/cancel` request/response shape, the error contract for an already-cancelled or
already-shipped order (409 vs 422), idempotency (repeat-cancel should not error), and whether
`cancel_reason` is required or optional in the request body.

### domain.data-schema-designer — ran

Trigger: `path~schema_globs` (`migrations/003_add_cancel_reason.sql` matches). Applied: would flag
the migration-safety question this scenario is built to surface — is `cancel_reason` nullable
(safe, additive) or does the migration also backfill/constrain existing rows (lock risk on a large
`orders` table)? Would also ask whether `cancel_reason` should be a free-text column or a
constrained enum, given it is queryable/reportable data.

### domain.system-design-advisor — ran

Trigger: `complexity_score >= 60 OR new_surface` (new_surface=true). Applied: would check whether
order cancellation should be synchronous (the request handler flips the status) or should emit an
event/side-effect (e.g. inventory release, refund trigger) — a boundary question a locally-scoped
review of just `orders.ts` would not surface.

### domain.ui-ux-designer — ran

Trigger: `path~ui_globs` (`src/components/CancelOrderDialog.tsx` matches). Applied: would specify
the confirmation dialog's interaction states (loading during the cancel request, error state on
409/422, success state), keyboard/focus handling for a modal, and whether the dialog needs to
distinguish "cancelling" from "cancelled" for screen readers.

### domain.clean-code-architect — skipped

Trigger: `complexity_score >= 50` (48 < 50 → false, no other OR term). Not applied — this scenario
was deliberately sized so this skill sits just under its threshold, giving the sandbox a
real "skipped" case for `check-trigger-predicates.mjs` to guard, not just an all-"ran" fixture.

### domain.quality-gates-validator — ran

Trigger: `task_class != trivial` (task_class=standard). Applied: would judge whether "add a unit
test for the cancel endpoint" is sufficient coverage, or whether the migration also needs an
integration test against a non-empty `orders` table to catch the lock-risk question raised by
`data-schema-designer` above — i.e. judging adequacy, not just presence, of the test plan.

### domain.performance-optimizer — skipped

Trigger: `path~hotpath_globs OR complexity_score >= 60` (no touched path matches `hotpath_globs`;
48 < 60). Not applied — correctly excluded, since nothing in this scenario touches a declared hot
path and the change is not complex enough to warrant a performance pass on its own.

---

## Updating this log

When a new passive/scored skill is added, or an existing skill's `## Workflow` changes in a way
that could change its output: add a new dated section above (don't overwrite this one), re-run the
skill's real workflow against `SCENARIO.md`'s stub files, and record what it actually surfaced —
not a restatement of its purpose. If a change to `agent-behavior.yaml` flips a trigger's expected
ran/skipped outcome, update `expected-triggers.yaml` first (see `SCENARIO.md`) so the mechanical
check and this log stay consistent.

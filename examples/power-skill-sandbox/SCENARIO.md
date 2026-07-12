# Scenario: Order Cancellation

A fictional, deliberately multi-surface feature request, used only to give
`skill_scoring.triggers`' predicates real signals to evaluate against. **No file in this directory
is meant to run** — every source file here is a 1-line stub whose only purpose is occupying a path
that matches one of `agent-behavior.yaml`'s `path_glob_categories`.

> "Add order cancellation: a REST endpoint to cancel an order, a DB migration adding a
> `cancel_reason` column, and a UI confirmation dialog before cancelling."

## Why this scenario

It was chosen to exercise a representative, non-trivial mix of Wave 3 trigger predicates in one
pass — enough diversity to catch a predicate regression, small enough to reason about by hand.

## Signals (see `expected-triggers.yaml` for the machine-readable version)

| Signal | Value | Basis |
|---|---|---|
| `files_touched` | 3 | `src/api/routes/orders.ts`, `migrations/003_add_cancel_reason.sql`, `src/components/CancelOrderDialog.tsx` |
| `ri_count` | 2 | implicit: migration-safety, existing-REST-convention |
| `touches_protected` | false | no protected path touched |
| `touches_contract` | true | REST endpoint is a public contract |
| `touches_generated` | false | no generated output touched |
| `new_surface` | true | new endpoint + new component |
| `task_class` | standard | multi-file feature within existing patterns |

`complexity_score` = files_touched(3×3=9, cap 30) + ri_count(2×4=8, cap 24) +
touches_protected(0) + touches_contract(15) + new_surface(10) + task_class.standard(6) = **48**

## What this sandbox is for

1. **Mechanical regression check** (`npm run validate`, via `check-trigger-predicates.mjs`):
   evaluates every `skill_scoring.triggers` predicate in `agent-behavior.yaml` against this
   scenario's fixed signals + this directory's real file paths, and compares the result against
   `expected-triggers.yaml`. A predicate typo, a glob-category edit, or a new/renamed skill with no
   corresponding trigger update will show up here as a mismatch — this is the one part of
   skill-trigger correctness that doesn't require an LLM to evaluate (no runtime exists to check
   *judgment quality*, only *predicate evaluation*).

2. **Manual dogfood log** (`skill-invocation-log.md`): when a new passive/scored skill is added, or
   an existing one's `SKILL.md` changes meaningfully, run this scenario through the skill's real
   `## Workflow` by hand (load the skill, apply it to these stub files + this scenario) and append
   an entry recording what it produced. This is not automatable (skill judgment requires an agent),
   but keeping a dated log means future changes to a skill's behavior can be diffed against past
   runs of the same fixed scenario.

## Updating this scenario

If `agent-behavior.yaml`'s trigger predicates or `path_glob_categories` change, or a new
passive/scored skill is added:
1. Re-derive the expected trigger outcome for each affected skill against this scenario's fixed
   signals (by hand — the logic is simple boolean/OR evaluation, see `SCENARIO.md`'s signal table).
2. Update `expected-triggers.yaml` to match the new, intentional behavior.
3. Run `node src/workflow/validators/check-trigger-predicates.mjs` to confirm it now passes.
4. If the skill actually ran (its trigger fired), consider adding a dogfood entry to
   `skill-invocation-log.md`.

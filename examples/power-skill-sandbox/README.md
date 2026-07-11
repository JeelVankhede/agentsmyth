# Power Skill Sandbox

A fixed, checked-in scenario used to sanity-check agentsmyth's passive/scored power skills
(`skill_scoring.triggers` in `agent-behavior.yaml`) without doing any real build work. See
`SCENARIO.md` for the fictional feature request and its derived signals.

## What's here

| Path | Role |
|---|---|
| `SCENARIO.md` | The fictional request, its signal derivation, and update instructions. |
| `expected-triggers.yaml` | Golden fixture: signals, touched paths, and the expected ran/skipped outcome per trigger. |
| `src/api/routes/orders.ts`, `migrations/003_add_cancel_reason.sql`, `src/components/CancelOrderDialog.tsx` | 1-line stub files whose only purpose is occupying real, glob-matchable paths. Never meant to run. |
| `skill-invocation-log.md` | Dated log of manual dogfood runs — what a skill actually produced when applied to this scenario. |

## Two ways this sandbox is used

1. **Mechanical**: `node src/workflow/validators/check-trigger-predicates.mjs` (wired into
   `npm run validate`) evaluates every real `skill_scoring.triggers` predicate in
   `agent-behavior.yaml` against this scenario's fixed signals and touched paths, and fails if the
   result doesn't match `expected-triggers.yaml`. This catches predicate typos, glob-category
   edits, and new/renamed skills with no corresponding trigger — the one part of skill-trigger
   correctness a validator can check without judgment.
2. **Manual**: when a new passive/scored skill is added, or an existing one's workflow changes
   meaningfully, run this scenario through the skill by hand and append a dated entry to
   `skill-invocation-log.md`. This is not automatable — it requires an agent to actually apply the
   skill's judgment — but keeping a log means future changes can be diffed against past runs of the
   same fixed input.

## Updating this sandbox

See `SCENARIO.md`'s "Updating this scenario" section.

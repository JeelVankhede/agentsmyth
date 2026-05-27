# Repo Impact Map

The impact map identifies how the single target repo will change.

Required columns or fields:

- path or surface
- change type: docs, config, schema, runtime, tests, generated output, release, source handoff, or tooling
- summary of intended change
- manifest IDs
- public contract impact
- generated-output impact
- protected-path or ownership concerns
- dependencies or ordering notes

Rules:

- Inspect repo context before naming a path as touched.
- Mark unknown surfaces as blockers instead of guessing.
- Do not create separate rows for secondary repositories or external control-plane repositories.
- Include docs and source-of-truth handoff surfaces when they are part of the requirement.

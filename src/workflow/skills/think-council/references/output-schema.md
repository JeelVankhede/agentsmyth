# Output Schema

`think-council` does not write its own artifact. It returns one round's result, which
`lifecycle-think` records into the brief's council log (see `lifecycle-think/references/output-schema.md`).

## Round Result

```text
skill: think-council
round: <N>
authorization: carve-out | explicit
cap_resolved: <integer>
cap_source: configured | council-default
depth: shallow | standard | deep
evidence_classes:
  repo: used | unused | unavailable
  trial: used | unused | unavailable
  web: used | unused | unavailable
  recall: used | unused | unavailable
members:
  - id: <member id>
    role: researcher | challenger
    stage: 1 | 2
    bucket: <question bucket, researchers only>
    sandbox: <resolved sandbox path, when the member ran a trial>
findings:
  - id: <finding id>
    source_member: <member id>
    surface: <file, config, or topic inspected>
    evidence_class: repo | trial | web | recall
    citation: <per-class citation, see council-contracts.md>
    disposition: accepted | merged | rejected-with-reason
    reason: <required and non-empty when rejected-with-reason>
    merged_into: <finding id, when merged>
conflicts:
  - surface: <shared surface>
    finding_ids: [<id>, <id>]
    resolution: <how it was resolved, and on what basis>
open_items_closed: [<item id>, ...]
open_items_remaining: [<item id>, ...]
```

Rules:

- `cap_source` is `council-default` only when no `max_parallel_workstreams` was declared globally or
  per-repo. Any declared value makes it `configured`.
- `stage: 1` members and `stage: 2` members are capped separately; neither stage may exceed
  `cap_resolved`.
- A member with `role: challenger` has no `bucket` — it reviews output, not a question bucket.
- `sandbox` is present whenever the member produced a `trial` finding, and the path must resolve
  under `council.sandbox_root`.
- Every entry in `findings` names a `source_member` that exists in `members`. Unattributed findings
  are invalid.
- `conflicts` is required — as an empty list when there were none — so that "no conflicts" is an
  assertion rather than an omission. Two findings on the same `surface` with incompatible
  conclusions and no `conflicts` entry is invalid.
- `open_items_closed` lists **which** items closed, not how many. A count cannot distinguish closing
  three easy items from closing the one that mattered.

## Refusal Result

```text
skill: think-council
decision: refused
reason: dispatch-disabled | council-disabled | not-complex | cannot-log | buckets-not-independent | bucket-dependency
detail: <one line — what specifically blocked it>
fallback: single-agent
```

Rules:

- A refusal is recorded in the artifact whenever the trigger condition was met and the council did
  not run. Silence is not an acceptable record of a refusal — a reader cannot distinguish "the
  council was not applicable" from "the council failed to fire" without it.
- `reason: dispatch-disabled` is the resolved `dispatch.enabled` kill switch, and it outranks every
  council setting.

## Acceptance Criteria

- Authorization mode recorded on every run, refusal included.
- Resolved cap and `cap_source` recorded on every run.
- Every finding carries source member, surface, evidence class, citation, and disposition.
- Every `rejected-with-reason` carries a non-empty reason.
- Per-class evidence availability recorded for every class the classification requested; a requested
  class with no recorded status is invalid.
- `conflicts` present, empty list included.
- At least one challenger spot-check finding for any round containing `web` findings.
- `open_items_closed` and `open_items_remaining` are item ID lists, never counts.
- No verdict, recommendation-as-decision, or exit-gate claim appears in the result. The council
  produces findings and questions; the parent decides.

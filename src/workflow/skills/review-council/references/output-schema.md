# Output Schema

`review-council` does not write its own artifact. It returns one round's result, which
`lifecycle-review` records into the review artifact's council log (see
`lifecycle-review/references/output-schema.md`).

## Round Result

```text
skill: review-council
round: <N>
authorization: carve-out | explicit
cap_resolved: <integer>
cap_source: configured | council-default
depth: shallow | standard | deep
repo_integrity:
  before: <digest>
  after: <digest>
  algorithm: <algorithm string printed by validators/repo-digest.mjs>
evidence_classes:
  repo: used | unused | unavailable
  trial: used | unused | unavailable
  web: used | unused | unavailable
  recall: used | unused | unavailable
members:
  - id: <member id>
    role: reviewer | challenger
    stage: 1 | 2
    risk_categories: [<category>, ...]   # reviewers only, disjoint across members
    input: diff+manifest                 # never the Build session transcript
    status: ran | failed
    sandbox: <resolved sandbox path, when the member ran a trial>
findings:
  - id: <finding id>
    source_member: <member id>
    risk_category: <one of the member's assigned categories>
    surface: <file, config, or area inspected>
    evidence_class: repo | trial | web | recall
    citation: <per-class citation, see council-contracts.md>
    disposition: accepted | merged | rejected-with-reason
    reason: <required and non-empty when rejected-with-reason>
    merged_into: <finding id, when merged>
conflicts:
  - surface: <shared surface>
    finding_ids: [<id>, <id>]
    resolution: <how it was resolved, and on what basis>
skipped_checks:
  - check: <the risk categories left unread>
    why_skipped: <member failure, cap exhaustion>
    risk: <what could go unnoticed as a result>
    owner: <who picks it up>
    blocks_ship: yes | no | waiver-required
    manifest_ids: [<id>, ...]
```

Rules:

- `cap_source` is `council-default` only when no `max_parallel_workstreams` was declared globally or
  per-repo. Any declared value makes it `configured`. The Review council's default comes from
  `council.per_phase.review.default_fan_out`, never from Think's.
- `stage: 1` and `stage: 2` members are capped separately; neither stage may exceed `cap_resolved`.
- **`stage` and `round` are different axes, and the recorded log has a column for only one of them.**
  `round` is the outer loop `max_rounds` bounds; `stage` separates the reviewer pass from the
  challenger pass *within* one round. The markdown tables `lifecycle-review` writes carry a `Round`
  column and no `Stage` column, because stage is a function of role — a reviewer is stage 1, a
  challenger is stage 2 — and a column that restates another column is a column that can disagree
  with it. So a challenger in round 1 records `Round` 1, never 2. Reading the `Round` column as
  this block's `stage` is the one mapping error the two names invite; it inverts the disjointness
  check, which is per round.
- A member with `role: challenger` has no `risk_categories` — it reviews findings, not a category.
- `risk_categories` are drawn from `lifecycle-review/references/review-risk-categories.md` and are
  **disjoint across reviewers**. Two reviewers sharing a category means another category went
  unread.
- `input` is recorded for every member. `diff+manifest` is the only valid value for a council
  member; a value naming the Build transcript is invalid, not merely discouraged.
- `status: failed` requires a matching `skipped_checks` entry naming the categories that member was
  assigned. A council that lost a member and records nothing reports the same coverage as one that
  did not.
- `repo_integrity.before` and `.after` must match. A Review council reads the repository it is
  judging; a digest that moved means a member wrote to it.
- Every entry in `findings` names a `source_member` that exists in `members`, and a `risk_category`
  that member was assigned.
- **No finding carries a fix recommendation.** This binds council-log findings only; the parent's
  consolidated `## Findings` entries still carry one, as `lifecycle-review`'s output schema
  requires.
- `conflicts` is required — as an empty list when there were none — so that "no conflicts" is an
  assertion rather than an omission.

## Refusal Result

```text
skill: review-council
decision: refused
reason: dispatch-disabled | council-disabled | not-complex | cannot-log | diff-unavailable | categories-not-disjoint
detail: <one line — what specifically blocked it>
fallback: single-agent
```

Rules:

- A refusal is recorded in the artifact whenever the trigger condition was met and the council did
  not run. A reader cannot distinguish "not applicable" from "failed to fire" without it.
- `reason: dispatch-disabled` is the resolved kill switch and outranks every council setting.

## Acceptance Criteria

- Authorization mode, resolved cap, and `cap_source` recorded on every run, refusal included.
- Repository digest recorded before and after, and unchanged.
- Every member records its role, stage, input, and status; reviewers also record disjoint risk
  categories.
- Every finding carries source member, risk category, surface, evidence class, citation, and
  disposition.
- Every `rejected-with-reason` carries a non-empty reason.
- No council-log finding carries a fix recommendation.
- Every `status: failed` member has a `skipped_checks` entry with all six configured fields.
- Per-class evidence availability recorded for every class the assignment requested.
- `conflicts` present, empty list included.
- At least one challenger spot-check finding for any round containing `web` findings.
- No verdict, severity ruling, recommendation-as-decision, or exit-gate claim appears in the result.
  The council produces findings; the parent decides.

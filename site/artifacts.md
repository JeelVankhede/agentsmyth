---
title: Artifacts
---

# Artifacts

The phases do the work. Artifacts are what the work leaves behind. Everything else in agentsmyth exists to produce them and to keep them honest.

An artifact is not a summary written after the fact. It is the working surface of the phase itself. The agent fills it while it works, and when the phase closes, the file is both the record and the handoff.

## Where they live

Each phase writes into its own directory, versioned by slug:

```text
workflow/artifacts/briefs/<slug>-v<N>.md
workflow/artifacts/plans/<slug>-v<N>.md
workflow/artifacts/tasks/<slug>-v<N>.md
workflow/artifacts/reviews/<slug>-v<N>.md
workflow/artifacts/verify/<slug>-v<N>.md
workflow/artifacts/ship/<slug>-v<N>.md
workflow/artifacts/reflect/<slug>-v<N>.md
```

Read top to bottom and you have the entire life of a change, from the first requirement to the final follow-up, in order.

## Frontmatter is a contract, not decoration

Every artifact opens with YAML frontmatter, and it is schema-enforced. A validator rejects an artifact whose frontmatter is malformed or incomplete. Here is the head of a Build-phase `task` artifact:

```yaml
---
slug: rate-limiting
version: 1
artifact: task
manifest_ids: [R1, R2, RI1]
upstream:
  brief: workflow/artifacts/briefs/rate-limiting-v1.md
  plan: workflow/artifacts/plans/rate-limiting-v1.md
orchestration:
  phase: build
  status: in-progress
  next_phase: review
---
```

Three fields carry most of the weight. `manifest_ids` ties this work back to specific requirements. `upstream` points at the approved artifacts this phase depends on. `orchestration` is how the router knows where the work is and where it goes next.

## The body carries the evidence

Below the frontmatter, each phase has a required set of sections. A `task` artifact must contain its scope, changed files with the requirement IDs they satisfy, an implementation log, verification items, command results, an architecture-decision note, and a blockers list. A validator checks they are present and populated.

::: tip Evidence, not assertion
A command result that says "tests pass" without the actual output is a violation. Anything skipped is written down as risk with a reason, a level, and an owner, never quietly dropped.
:::

## Requirement IDs never move

Within a version, the identifiers a requirement is given (`R`, `RI`, `A` for assumptions, `Q` for open questions) are never renumbered. This is what lets Review check Build against Plan mechanically.

## Why this is the payoff

A durable, traceable, evidence-bearing chain is the entire reason the workflow exists. It is what a new agent restores context from. It is what tells you, three months later, exactly why line 40 is the way it is. Chat gave you an answer. Artifacts give you a record.

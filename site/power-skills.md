---
title: Power skills
---

# Power skills

Each of the seven phases has a base skill: the playbook the agent follows to move the work forward and write the artifact. That base skill is enough to run the whole lifecycle.

Power skills are the specialists you call in when a phase needs more than the general playbook. They attach to a phase, load only when that phase invokes them, and do one focused job well.

## What a power skill looks like

Every skill, base or power, follows the same anatomy, which is what keeps them composable:

```text
Purpose → Invocation Context → What To Load → Inputs → Refusal / Stop → Workflow → Exit Gate → Determinism Rules → Output
```

Two parts make power skills trustworthy rather than just clever. The **Exit Gate** defines the concrete condition that proves the skill did its job. The **Output** names exactly which file or section the skill writes to, so its effect is inspectable, not vibes.

## Examples of the shape

| Power skill | Phase | What it does |
|---|---|---|
| `requirement-phase-mapper` | Plan | Confirms every active requirement lands in exactly one plan phase |
| `plan-assumption-verifier` | Plan | Confirms every assumption has a citation or a raised open question |
| `verification-matrix-builder` | Test | Builds the coverage matrix tying each requirement to how it was verified |
| `follow-up-owner-assigner` | Reflect | Ensures every open follow-up leaves Reflect with a named owner |

The set grows over time. New power skills are authored to the same anatomy and wired into their owning phase's load points.

## They are all free

There is no premium tier of skills. Every skill ships in the package, and the phase playbooks are also published openly. agentsmyth is community-first: the deep capability is not the thing behind a paywall, because there is no paywall.

## Writing your own

Because the anatomy is fixed and the wiring is explicit, adding a power skill is a bounded job: author it against the standard anatomy, give it an honest Exit Gate and a named Output, then reference it from the owning phase's load list. The validators hold your new skill to the same evidence standard as everything else.

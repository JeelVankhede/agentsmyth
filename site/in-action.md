---
title: agentsmyth in action
---

# agentsmyth in action

::: warning Illustrative walkthrough
This page is an illustrative, fabricated-but-faithful example — the repo, the feature, and the specific findings below are not a real transcript. Every artifact shape, gate, and rule shown is exactly how the workflow actually produces them.
:::

One feature walking the whole road, from a one-line request to a reflected-on ship. The repo is a fictional payments API, the agent is Claude Code, the change is real-sized: add rate limiting to the public endpoints.

## The request

You type one line. The adapter routes it to `workflow/router.md`, which classifies it against the rules.

```text
> add rate limiting to the public API endpoints
router verdict: Complex — full loop mandatory, no shortcuts
```

## The seven gates

1. **Think — the brief.** Requirements captured with stable IDs. `Q1` is a blocker, so the agent stops and asks. → `briefs/rate-limiting-v1.md`
2. **Plan — the decisions.** Token-bucket limiter in middleware, backed by Redis. Verification criteria written before any code. → `plans/rate-limiting-v1.md`
3. **Build — the task.** Changed files logged against the IDs they satisfy. Nothing outside scope is touched. → `tasks/rate-limiting-v1.md`
4. **Review — against the plan.** Every active requirement confirmed; hardcoded `Retry-After` flagged. Verdict: pass-with-risk.
5. **Test — the evidence.** The one phase that cannot be faked. Real command output recorded. No untested requirement reaches Ship.
6. **Ship — the risk signed.** Deploy evidence recorded, rollback stated. The Review risk travels here visibly, not buried.
7. **Reflect — the loose ends.** Learnings captured; the open follow-up refuses to leave without a named owner. It gets one.

## The task artifact

As the agent implements, the artifact fills in real time. Its frontmatter is the machine-readable orchestration state:

```yaml
---
manifest_ids: [R1, R2, RI1]
orchestration:
  phase: build
  status: in-progress
  next_phase: review
---
```

```text
$ npm test -- rate-limit
PASS enforces 100 req/min per API key (R1)
PASS returns 429 over limit (R2)
PASS limit reload without restart (RI1)
verdict: ship
```

## What you are left with

Seven files. The complete story of the change, in order, with the reasoning and the evidence attached.

```text
workflow/artifacts/
briefs/rate-limiting-v1.md      R1 R2 RI1, A1 confirmed, Q1 answered
plans/rate-limiting-v1.md       token bucket, Redis, config-driven
tasks/rate-limiting-v1.md       2 files, mapped to IDs, evidence logged
reviews/rate-limiting-v1.md     pass-with-risk, Retry-After flagged
verify/rate-limiting-v1.md      three tests, real output
ship/rate-limiting-v1.md        deployed, risk signed, rollback stated
reflect/rate-limiting-v1.md     one learning, one owned follow-up
```

Send a different agent in next week to fix that Retry-After follow-up, and it will read this chain, know exactly what was decided and why, and pick up without asking you a single question. That is the difference between an answer and a record. That is loop engineering.

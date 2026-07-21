---
title: Vibe, engineering, loop
---

# Vibe, engineering, loop

There is a progression happening in how people build software with AI. Three stages, each a reaction to the pain of the one before it. agentsmyth is a bet on the third.

## Stage one: vibe coding

You describe what you want. The model produces code. You run it. If it breaks, you paste the error back and try again. Andrej Karpathy named this "vibe coding," and the name is honest: you are steering on feel, accepting output you have not fully read, trusting the vibe.

It is genuinely fast, and for a throwaway script it is the right tool. The wheels come off the moment the thing has to live. Vibe coding optimizes for the next five minutes and quietly borrows against every hour after that.

## Stage two: vibe engineering

The correction, described by Simon Willison, is to keep the speed of agents but put an engineer's discipline back around them. You demand tests, you review the diff, you treat the agent's output as a junior's pull request rather than an oracle's decree.

::: warning The catch
The rigor lives in your attention. Look away, hand the repo to a teammate, or come back in a month, and the discipline does not travel with the code. It was never written down.
:::

## Stage three: loop engineering

Loop engineering takes the discipline out of the human's head and encodes it as a loop the work must physically pass through. The loop is the seven-phase lifecycle, and it is not advice — it is a track with gates. A request cannot reach Build without an approved Plan.

### Where the discipline lives

| Stage | What it looks like | Discipline | Survives session |
|---|---|---|---|
| Vibe coding | Prompt, accept, hope it holds | None | No |
| Vibe engineering | Prompt, review, hold it in your head | In the human | Partly |
| Loop engineering | Request enters a gated loop; each gate leaves steel | On disk | Fully |

::: tip The one-line version
Vibe coding trusts the model. Vibe engineering trusts the engineer. Loop engineering trusts the loop, so it does not matter who or what shows up next.
:::

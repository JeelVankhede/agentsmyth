---
title: Introduction
description: Why agentsmyth exists — three questions about AI-assisted engineering it's built to answer.
---

# Introduction

Picture the last thing an AI agent built for you. The diff landed. It probably worked. Now answer three questions without scrolling back: which requirement did line 40 satisfy, what did you decide against and why, and what evidence proved it worked. If you cannot, you did not lose the code. You lost everything around it.

**agentsmyth exists to keep everything around it.**

It is a portable AI engineering lifecycle, shipped as an npm package. You run one command, say one sentence to your agent, and the agent installs a gated seven-phase workflow into your repository. From then on, every non-trivial change moves through the same loop: requirements captured, plan written, code built, reviewed, tested, shipped, and reflected on, each phase leaving a durable file on disk.

Those files are the point. Chat memory is smoke. It looks solid, then it is gone. An artifact is steel: cold, inspectable, and still there when a different agent picks up the work three weeks later.

## The contract

The whole thing reduces to a single promise you can hold in one hand:

::: tip
One `npx` command plus one instruction to your agent equals a fully configured, domain-aware workflow living in your repo.
:::

No service to run. No account. No runtime dependency. The CLI is deliberately almost stupid: it copies a staging folder and leaves. The intelligence lives where it belongs, in the agent, guided by the workflow contract.

## What it refuses to be

Knowing what a tool is not is usually more honest than knowing what it is.

- **Not a framework.** It adds no library, no import, no build step to your code.
- **Not an agent.** It brings no model. It rides the agent you already run: Claude Code, Codex, Copilot, Cursor, or Windsurf.
- **Not a scaffolder.** It does not generate your project. It attaches a lifecycle to the project you have.
- **Not opinionated about your domain.** The workflow learns your domain during setup, from your repo and your answers, not from a template's guesses.
- **Not a paywall.** Every skill ships free. There is no gated tier, no premium content fetched from a server. Community-first, by decision.

## Who it is for

Two audiences, one workflow. The engineers who direct AI agents and want the work to survive the session. And the agents themselves, which behave far better when the rules are written on disk instead of implied in a prompt. If you have ever inherited a codebase an AI half-built and had no idea why any of it was the way it was, you already understand the problem.

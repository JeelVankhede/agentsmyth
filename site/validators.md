---
title: Validators
description: The Node scripts that enforce agentsmyth's lifecycle contracts and refuse to pass on drift.
---

# Validators

A workflow that only asks nicely gets ignored the moment things get busy. Validators are small Node scripts that check the workflow's contracts and fail loudly when something is off — the quality control at the end of the line.

## Setup validators (the uncompromising ones)

These gate Phase 4 of setup's resolution pass. There are no waivers here. `check-setup-complete` and `check-config` must both exit clean before setup can finish.

| Validator | Refuses to pass if |
|---|---|
| `check-setup-complete` | Setup left required steps unfinished |
| `check-config` | Any config file is malformed or missing a required field |
| `check-pending-setup` | Non-blocking — reports open/resolved/waived counts from `pending-setup.yaml` and only fails on malformed entries, never on open items themselves |

Schema validation runs underneath the first two, checking every config against its YAML contract.

## Lifecycle validators (the everyday ones)

Unlike setup, lifecycle work may record a waiver — visible residual risk, signed and logged, never a silent pass. The validators guard, broadly:

- **Config integrity.** Configs still match their schemas and hold no leftover placeholder values.
- **Artifact shape.** Each artifact's frontmatter and required sections are present and populated.
- **Lifecycle state.** The phase transitions recorded in the chain are legal ones, not illegal jumps.
- **Starter-block correctness.** New artifacts were created from the real template, not improvised.
- **Requirement coverage.** Every active requirement maps to a plan phase and a verification method; follow-ups carry an owner.

## They are tested against themselves

A validator that never fails is worthless. agentsmyth ships negative fixtures: deliberately broken artifacts, one per validator, each a genuine minimal violation. The test suite runs every validator against its fixture and confirms it actually rejects the bad case.

## What this buys you

The validators are why "the workflow was followed" is a checkable fact rather than a hope. An agent cannot claim a phase complete while its artifact is malformed, mark a requirement done that no artifact covers, or clear setup with a guessed config.

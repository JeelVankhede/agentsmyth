---
slug: upgrade-hardening-1-1-1
version: 1
artifact: learning-session
date: 2026-10-11
source: lifecycle-reflect
upstream:
  - workflow/artifacts/reflect/upgrade-hardening-1-1-1-v1.md
---

# Raw Learnings - upgrade-hardening-1-1-1 v1

## Context

Two field findings from a repository upgraded to 1.1.0 became one Standard chain on `fix/1.1.1-upgrade-hardening`:
- the council tier question was silently skipped because setup questions were appended all-or-nothing per group;
- two source-repo-only validators shipped in every install and failed in every consumer.

Net: 12 requirements shipped, 5 Review findings fixed (one a shipped 1.1.0 defect found by a new guard), no waivers, and no open items, by user direction. Committed as `76bc3b6`. The version bump is left to CI.

## Candidate Learnings

**LC-1: bug-fix releases accept nothing.**
Two findings were first marked "accepted / residual risk". The user rejected that for a bug-fix version. Fixing the first one uncovered F4, a defect that had already shipped. An acceptance made on judgement is a question for the user.

**LC-2: guard restated instructions against their subject.**
The render instruction exists in three places. A check comparing the copies would have passed, because all three shared the same wrong phrase ("template's first line"). Deriving the expectations from the templates is what caught it.

**LC-3: reproduce installer bugs on released code.**
`git archive <tag>` → build → `prepare` into a scratch `HOME` reproduced both reports verbatim and proved the ledgerless 1.0.1 shape is real. It is cheap, needs no network, and touches no real home.

## Friction

- Unquoted plan Touches parsed as empty scope in check-scope-fence. Copy the plan schema's backtick form.
- A new `:test` script must be wired into ci.yml and release.yml at authoring time (conformance r22).
- Keep comparison copies of source files in the scratchpad, never inside `src/`; avoid `rm -rf` in scratch commands.
- The mutation audit takes ~55 minutes for 248 rules; start it in the background at the beginning of Test.

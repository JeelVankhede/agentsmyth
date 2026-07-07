# Architecture Notes Guide

Architecture notes preserve why the brief is shaped the way it is.

Required fields:

- role: `Architect`
- decisions: scoping decisions made from user/source/repo context
- constraints: domain, repo, source-of-truth, release, verification, or safety limits
- tradeoffs: options considered and why they were accepted or rejected
- assumptions: `A` IDs or concise summaries that later phases must preserve
- downstream_impact: what Plan, Build, Review, Test, Ship, or Reflect must account for

Use architecture notes for:

- requirement boundaries
- source-of-truth ambiguity or handoff needs
- config-driven domain or repo constraints
- generated output or public contract concerns
- release or verification implications

Do not use architecture notes as a dumping ground for implementation details. Keep them decision-oriented.

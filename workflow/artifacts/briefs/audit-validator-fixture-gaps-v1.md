---
slug: audit-validator-fixture-gaps
version: 1
artifact: brief
status: ready-for-next-phase
created: 2026-07-10T13:22:06Z
updated: 2026-07-10T13:22:06Z
manifest_ids:
  - R1
  - R2
  - R3
  - RI1
  - RI2
  - RI3
upstream:
  - workflow/artifacts/reflect/power-skills-spine-v1.md
  - user-request
orchestration:
  phase: think
  status: ready-for-next-phase
  next_phase: plan
  blockers: []
  user_checkpoint: approved
---

# Audit Validator Fixture Gaps — Brief

## Source Links

- Follow-up from `workflow/artifacts/reflect/power-skills-spine-v1.md`: "Audit other shipped validators for the same 'passed its fixture, never tested against a real artifact' risk class found in `check-scope-fence`/`check-manifest-coverage`/`check-release-readiness`."
- User request (this session): serves as the real, independent task satisfying the resolved WP-R4 spec's §8 checkpoint ("run on a real Standard task; measure drift") before Wave 2–4 design begins — this chain deliberately, actively invokes the Wave 1 invariant-spine skills (`waiver-completeness-check`, `coverage-tracer`, `evidence-auditor`, `scope-fence`, `verify-manifest-coverage`, `skipped-check-accountant`, `release-readiness-gate`) throughout, not just at a nominal mention.
- Classification: **Standard** — multi-file audit + targeted fixes within an existing, bounded module (`src/workflow/validators/`); no new architectural pattern.

## Problem

`check-config.mjs`, `check-domain-placeholders.mjs`, `check-setup-complete.mjs`, and
`check-pending-setup.mjs` are documented as this repo's validator suite, but — unlike the 8 Wave-1
validators and `check-artifacts.mjs`/`check-lifecycle.mjs` — none of them are actually invoked by
`npm run validate`, any CI job, or any test runner. `check-domain-placeholders.mjs` is not invoked
anywhere at all beyond documentation; `check-config.mjs` and `check-setup-complete.mjs` are only
referenced as content bundled for consumer repos (`scripts/build-bundle.mjs`'s `setupValidators`
list), never actually run by this repo's own automation.

Running all four manually surfaced two real, previously-undetected bugs:

1. `check-domain-placeholders.mjs`'s `leakagePatterns` list matches the ordinary English word "Bare"
   (via the pattern intended to catch the old internal "fare/bare" starter naming) and the
   legitimate architecture term "multi-repo", both hit false-positive inside
   `workflow/artifacts/**` — this repo's own dev-workspace dogfood lifecycle artifacts, which are
   never shipped and should not be scanned by a check whose stated purpose is "must never appear in
   this template" (shipped content).
2. `check-setup-complete.mjs`'s `domain.name`/`domain.summary` non-empty checks use `^`-anchored
   regex without the `m` (multiline) flag, so they can only ever match content at the literal start
   of the file string — which `domain.yaml`'s `name`/`summary` fields never are, since `version:`
   and `kind:` always precede the `domain:` block per the schema. **This means the check always
   false-fails for every real consumer repo running `npx agentsmyth init`, not just this dev repo.**

## Goals

- Fix both confirmed regressions so each validator's real detection logic actually works.
- Wire `check-config.mjs` and `check-domain-placeholders.mjs` (both correctly scoped to check this
  dev repo's own real state) into `npm run validate`'s automated chain, so this class of
  never-actually-run defect cannot recur silently.
- Add a minimal, targeted regression fixture for `check-setup-complete.mjs`'s two regex checks
  specifically (not a full synthetic consumer-repo tree — disproportionate for this Standard task;
  see Non-Goals).
- Actively invoke the Wave 1 invariant-spine skills while doing this work, and record in the Build
  task artifact and Reflect whether they functioned correctly and whether they meaningfully reduced
  drift — this **is** the real-task checkpoint the resolved WP-R4 spec's §8 calls for.

## Non-Goals

- Do not build a full synthetic "fully-initialized consumer repo" fixture tree — `check-setup-complete.mjs`
  legitimately requires the complete expanded `workflow/` tree (router.md, lifecycle.md, skills/,
  validators/) that only exists post-`npx agentsmyth init`; building and maintaining a full synthetic
  copy of that tree as a fixture is disproportionate scope for this audit. A narrower, targeted
  fixture covering just the two buggy regex checks is in scope instead.
- Do not change `check-setup-complete.mjs`'s behavior in this dev repo — it correctly reports the
  dev workspace as "not a completed consumer setup" (which is true; this repo intentionally keeps
  `workflow/` thin and `src/workflow/` as the real source). That is not a bug to fix.
- Do not audit `check-artifacts.mjs`, `check-lifecycle.mjs`, or the 8 Wave-1 validators — already
  covered by the prior chain (`power-skills-spine-v1`).

## User Impact

Consumer repos running `npx agentsmyth init` currently hit a false failure on `check-setup-complete`
for `domain.name`/`domain.summary` no matter how correctly they fill in `domain.yaml` — this directly
blocks real setup completion today, for every consumer, and nobody has caught it because the check is
never run by this repo's own CI. Fixing it removes a real, live blocker to the product's own
onboarding flow.

## Success Metrics

- `check-domain-placeholders.mjs` passes cleanly against this repo's real tracked files.
- `check-setup-complete.mjs`'s regex checks correctly detect non-empty `domain.name`/`domain.summary`
  regardless of their position in the file, verified by a fixture.
- `check-config.mjs` and `check-domain-placeholders.mjs` run automatically inside `npm run validate`.
- Wave 1 skills were actively used during this Build and the Reflect artifact records whether they
  worked as intended.

## Requirements

See Requirement Manifest below.

## Constraints

- Zero runtime dependencies (repo invariant).
- `check-setup-complete.mjs`'s consumer-repo-only scope must be preserved, not weakened to also
  pass against this dev repo.
- Must not remove or weaken `check-domain-placeholders.mjs`'s real leakage detection for genuinely
  shipped content (`src/workflow/`, `src/setup/`, `src/adapters/`) — only fix the false-positive
  scope (dev-workspace artifacts) and the overly-broad "Bare" pattern.

## Risks

- Narrowing `check-domain-placeholders.mjs`'s scan scope could hide a genuine future leakage if not
  narrowed precisely — mitigated by excluding only `workflow/artifacts/**` (dev-only, documented as
  never-shipped) rather than broadening the exclusion generally.
- Fixing the "Bare" pattern to be more specific (e.g. requiring the old "fare/bare" pairing) could
  reduce real detection power if not done carefully — mitigated by keeping "Fa" + "re" style split
  patterns for the actual old scheme names intact, only removing/narrowing the standalone "Bare"
  half that collides with ordinary English.

## Open Questions

None — scope was resolved via `AskUserQuestion` earlier this session (real task vs. CI-green-is-enough;
this option chosen).

## Requirement Manifest

### Explicit (R)

- **R1** - Fix `check-domain-placeholders.mjs` so it does not false-positive on ordinary English
  usage of "Bare" or on legitimate architecture terms like "multi-repo" inside
  `workflow/artifacts/**` (dev-workspace dogfood content, never shipped).
  - Acceptance: `node src/workflow/validators/check-domain-placeholders.mjs` exits 0 against this
    repo's current real tracked files; a fixture with genuine "fare"+"bare" leakage in shipped
    content (`src/workflow/`) still correctly fails.

- **R2** - Fix `check-setup-complete.mjs`'s `domain.name`/`domain.summary` regex checks to correctly
  match non-empty values regardless of position in the file.
  - Acceptance: a fixture `domain.yaml` with valid, non-empty `name`/`summary` fields (preceded by
    `version`/`kind`, matching the real schema shape) passes those two specific checks; a fixture
    with genuinely empty values still correctly fails them.

- **R3** - Wire `check-config.mjs` and `check-domain-placeholders.mjs` into `npm run validate`'s
  automated chain.
  - Acceptance: `npm run validate` output shows both validators executing and passing.

### Implicit (RI)

- **RI1** - No regression to `scripts/build-bundle.mjs`'s existing `setupValidators` bundling
  behavior for consumer-repo-shipped content.
  - Acceptance: `npm run build` still copies `check-config.mjs` and `check-setup-complete.mjs` into
    the shipped `validators/` bundle unchanged in role.

- **RI2** - `check-setup-complete.mjs` continues to correctly report this dev repo as an incomplete
  consumer setup (that report is accurate, not a bug).
  - Acceptance: `node src/workflow/validators/check-setup-complete.mjs` still exits non-zero against
    this dev repo's real state, with the missing-workflow-tree errors unchanged; only the
    domain.name/summary false-positive is fixed.

- **RI3** - No new runtime dependency introduced.
  - Acceptance: `package.json` `dependencies` unchanged; any new fixture-test script uses only
    `node:*` builtins and existing `lib.mjs` helpers.

### Assumptions (A)

- **A1** - The targeted fixture for R2 (rather than a full synthetic consumer-repo tree) is
  sufficient regression coverage for the specific regex bug found — reversible, low-risk, matches
  the Non-Goals scoping decision already made.

### Open Questions (Q)

None — all resolved via `AskUserQuestion` prior to this brief being written.

## Questions For User

None outstanding.

## Architecture Notes

- role: Lead Architect
- decisions:
  - Scope tightly to the 2 confirmed real bugs + minimal wiring, not a full audit-everything pass —
    matches the Standard classification and avoids the Complex-scope creep this repo's own CLAUDE.md
    warns against.
  - `check-setup-complete.mjs`'s dev-repo failure is correct behavior, explicitly preserved (RI2) —
    the fix target is narrower than "make all 4 validators pass everywhere."
- constraints: zero-dep invariant; must not weaken real leakage detection for shipped content.
- tradeoffs: a targeted fixture for R2 over a full synthetic consumer-repo tree — smaller
  maintenance surface, slightly less comprehensive coverage of `check-setup-complete.mjs`'s other
  ~13 checks (workflow-tree-presence, `.agentsmyth/` cleanup, adapter presence), which remain
  untested by an automated fixture after this chain. Named as a Reflect follow-up candidate.
- downstream: Plan should sequence the 2 bug fixes before the wiring step (fix first, then wire,
  mirroring the Wave 1 precedent's "don't wire a validator with a known bug into an automated gate").

## Exit Gate

- [x] Every active R and RI has acceptance criteria.
- [x] No blocking Q IDs; `orchestration.blockers` is empty.
- [x] User approved proceeding via `AskUserQuestion`; `status` set to `ready-for-next-phase`.

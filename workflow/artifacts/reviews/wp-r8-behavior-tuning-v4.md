---
slug: wp-r8-behavior-tuning
version: 4
artifact: review
status: ready-for-next-phase
created: 2026-08-14
updated: 2026-08-14
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, R8, RI1, RI2, RI3, RI4, RI5, RI6, RI7, RI8, RI9]
upstream:
  - workflow/artifacts/briefs/wp-r8-behavior-tuning-v1.md
  - workflow/artifacts/plans/wp-r8-behavior-tuning-v1.md
  - workflow/artifacts/tasks/wp-r8-behavior-tuning-v1.md
  - workflow/artifacts/reviews/wp-r8-behavior-tuning-v3.md
orchestration:
  phase: review
  status: ready-for-next-phase
  next_phase: test
  blockers: []
  user_checkpoint: none
---

# WP-R8 — Per-Repo Behavior Tuning - Review v4 (final)

Final review for this chain. v1–v3 stand as the record of two holds and one pass-with-risk. **All
nine findings raised across every review round (F1–F9) are fixed, and every fix has been
independently re-verified in one consolidated pass.** No open findings remain, so this artifact is
closed here rather than superseded by another version.

## Findings

### F9 — P3 — RESOLVED 2026-08-14 — the baseline matcher compared the message by substring, so a hand-broadened entry could absorb a different violation of the same shape

- **Area:** `src/workflow/validators/check-artifacts.mjs` (baseline matching)
- **Manifest IDs:** RI3
- **Problem:** An entry matches when `error.startsWith(entry.file) && error.includes(entry.message)`. The generated entries carry full exact messages, so nothing is mis-suppressed today. But the matcher permits a shorter message, and a shorter message matches more.

  Demonstrated by broadening one entry from `.frontmatter.upstream is required` to `is required`, then fixing the original violation and introducing a *different* required-field violation in the same file. The broad entry absorbed the substitute, and `stale` stayed 0 — so the mechanism that is supposed to force an entry out when its violation is fixed did not fire.

  In this test the run still failed, because the same edit produced other, unmatched errors. That is luck, not design: a substitution that produced only the one same-shaped error would have passed silently with the baseline reporting `0 new, 0 stale`.

  The one-to-one consumption (`seen`) does bound the blast radius — one entry can only ever absorb one violation, so this cannot mass-suppress. That is why it is P3 rather than P2, along with the fact that reaching it requires hand-editing a generated file.
- **Fixed:** the matcher now strips `entry.file` from the front of the violation and requires strict equality with `entry.message`. Re-verified both directions: the real baseline still matches all 96 exactly (`96 grandfathered, 0 new, 0 stale`), and the same broadening that previously absorbed a substitute violation now yields `95 grandfathered, 1 new, 1 stale` — the entry surfaces as stale *and* the unmatched violation surfaces as new. An over-broad entry is now impossible to write usefully rather than merely unlikely.

## Severity Summary

| Severity | Count |
|---|---|
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| P3 | 1 (resolved) |

## Requirement Coverage

| Manifest ID | Evidence | Status | Notes |
|---|---|---|---|
| R1 | full `tuning:` block accepted; unknown key rejected by name | covered | — |
| R2 | `w-tuning-unknown-key` rejected by name | covered | — |
| R3 | looser-value and checkpoint-omission fixtures rejected | covered | — |
| R4 | `required:` untouched; consumer with non-string `env` exits 0 with warning | covered | — |
| R5 | intent block accepted; both floors rejected | covered | — |
| R6 | 10 predicates identical; predicate-rewrite fixture rejected | covered | — |
| R7 | fresh bootstrap emits PS-1..PS-11; file validates | covered | — |
| R8 | skew adds 3 items, idempotent, gate completes with items open | covered | — |
| RI1 | grep across all six tunables | covered | — |
| RI2 | `mergeTunedMap` 8/8; `m2`/`m8` fail pre-fix | covered | — |
| RI3 | keyword audit + artifact ratchet both wired into `validate` and both proven to fire | covered | F9's matcher fix re-verified; no residual. |
| RI4 | 29/29 violations | covered | — |
| RI5 | locked-key fixture rejected; `tuning:` objects closed | covered | — |
| RI6 | `config-map.md`; 69 field refs schema-checked | covered | — |
| RI7 | floor fixtures rejected | covered | — |
| RI8 | stale-provenance fixture rejected | covered | — |
| RI9 | previously-valid consumer config no longer fails; no consumer surface touched by the Phase 16 gate change | covered | — |

All 17 covered. No partial, missing, deferred, or removed rows.

## Architecture Notes

- role: Staff Reviewer
- **decision — F7's resolution is the right shape.** The filed finding was a symptom; Build diagnosed the cause (`check-artifacts.mjs` invoked only against fixtures, never real artifacts) and fixed that instead of the surface. The ratchet's three properties were each verified rather than assumed: per-file-and-message granularity (a bogus key injected into a grandfathered file still fails), stale-entry rejection (a fabricated entry fails with a removal instruction), and no self-grandfathering (`grep` for this chain's slug in the baseline returns 0 — the package's own work is enforced, not excused).
- **decision — the blast-radius check before wiring was the right instinct and correctly concluded.** `scripts/` is absent from `package.json` `files`, so `validate-template.mjs` never ships; consumers run `agentsmyth check`, which resolves `check-lifecycle` and `check-setup-complete` only. Confirmed independently this review. No consumer impact, therefore no version-bump question — which is what distinguishes this from F4, where the same instinct was skipped and cost a round.
- **constraint — 96 grandfathered violations are real debt, not noise.** The baseline is honest about this in its own note. Two shapes dominate: `status: complete` used where the enum allows only `done` (42), and structural type drift in `upstream` / `user_checkpoint` (16). Neither is a false positive; both are genuine divergence between what artifacts do and what the schema says. Nothing in this package is obliged to fix them, but nothing should pretend they are resolved either.
- **observation — the defect class count is now six**, and the sixth is different in kind. `maximum`, schema-valued `additionalProperties`, `if`/`then`, `format`, and `x_enforcement` were all *declarations that did nothing*. F7 was a *validator that ran nowhere*. Same failure mode one level up: something written to enforce a contract, wired to nothing, with no signal. Worth carrying to Reflect as one lesson rather than six.
- **decision — closed in place rather than versioned again.** Four review artifacts already record the chain's history; a fifth to record a single P3 fix would add ceremony, not evidence. v1–v3 remain the durable record of both holds. This version records the final state.
- **assumption Test must verify:** that `npm run validate` fails when an artifact this chain produced is broken — the ratchet's value rests entirely on new work being enforced, and that should be demonstrated on a real artifact rather than an injected fixture.
- **downstream:** Test may start with no outstanding fixes. Ship still owes the two Notion corrections (Q1 allowlist home; Standard→Complex reclassification) and should add the `warn-until-1.2.0` marker removal to the release checklist. Reflect should carry the six-instance defect-class lesson, the 96-violation debt, and the still-unwired `lifecycle-artifact.schema.yaml`.

## Verification Reviewed

| Item | Outcome | Notes |
|---|---|---|
| `npm run build` | pass | Deterministic. |
| `npm run validate` | pass | 25 validators, now including `check-artifacts` and `check-schema-keywords`. |
| `npm run violations:test` | pass | 29/29 — the fixture path invokes `check-artifacts` without `--baseline` and is unaffected. |
| `npm run tuning-merge:test` | pass | 8/8. |
| `npm run setup-checks:test` | pass | 6/6. |
| `npm run init-prepare-interop:test` | pass | 33/33. |
| F6 — misplaced `x_enforcement` | pass | Injected at a schema root: rejected naming the required position and the reason. |
| F7 — baseline run | pass | 96 grandfathered, 0 new, 0 stale. |
| F7 — new violation in a grandfathered file | pass | Bogus frontmatter key injected into an already-baselined file: fails. |
| F7 — stale entry | pass | Fabricated entry fails with an explicit removal instruction. |
| F7 — no self-grandfathering | pass | 0 baseline entries reference this chain's slug. |
| F7 — consumer surface | pass | `scripts/` not in `package.json` `files`; consumer path is `agentsmyth check` only. |
| F8 — drift note | pass | Present in `check-schema-keywords.mjs`, stating the unguarded direction. |
| Baseline matcher breadth (pre-fix) | fail | A hand-broadened entry absorbed a different same-shaped violation with `stale` reporting 0. Basis for F9. |
| F9 — exact matcher (post-fix) | pass | Real baseline: 96 grandfathered, 0 new, 0 stale. Broadened entry: 95/1/1 — stale *and* new both surface. |
| **Consolidated re-verification of F1–F9** | **pass** | Single pass over every fix: merge suite 8/8; finite-score guard fires with its named message on a non-numeric weight; malformed glob rejected at the config gate; consumer `env` exits 0 with deferred warnings; keyword audit ok; ratchet 96/0/0; exact matcher as above. |

## Residual Risk

No open findings. The items below are accepted risks and follow-ups, not defects in this package.

- **96 grandfathered violations remain real debt.** They are visible, schema-validated, and can only shrink — but nothing schedules their repair. Without an owner they will sit indefinitely.
- **`if`/`then` still has no production exercise.** Implemented and unit-verified; its only consumer schema (`lifecycle-artifact.schema.yaml`) is still unwired. That schema's 16 extra section requirements therefore remain unenforced — deliberately out of scope, and now the *only* part of the original F7 left open.
- **The deprecation window has no expiry mechanism.** `warn-until-1.2.0` is matched by string prefix; nothing fails when 1.2.0 ships with markers still present. Belongs on the release checklist.
- **Carried from v1–v3:** intent→tuning derivation has no mechanical correctness check; no live consumer repo has exercised the upgrade path; `skill_scoring.triggers`' locked/tunable boundary is prose; `mergeTunedMap` is one level deep by design; two Notion pages stale.

## Recommendation

pass

F1 through F9 — every finding raised across all four review rounds — are resolved and independently
re-verified in a single consolidated pass. The tuning surface is sound, the
upgrade path is non-blocking for repos that never touched the feature, the schema engine no longer
accepts declarations it silently ignores, and the artifact validator that was wired to nothing now
runs on every `npm run validate` behind a ratchet that grandfathers old debt while failing
everything new — including new violations in old files, and including this package's own artifacts,
none of which appear in the baseline.

Final suite: build ok, validate clean across 25 validators, 29/29 violation fixtures, 8/8
tuning-merge assertions, 6/6 setup-complete checks, 33/33 init/prepare interop checks.

Review is closed. Test may start.

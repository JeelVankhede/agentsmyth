---
slug: wp-r8-behavior-tuning
version: 1
artifact: review
status: blocked
created: 2026-08-14
updated: 2026-08-14
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, R8, RI1, RI2, RI3, RI4, RI5, RI6, RI7, RI8, RI9]
upstream:
  - workflow/artifacts/briefs/wp-r8-behavior-tuning-v1.md
  - workflow/artifacts/plans/wp-r8-behavior-tuning-v1.md
  - workflow/artifacts/tasks/wp-r8-behavior-tuning-v1.md
orchestration:
  phase: review
  status: blocked
  next_phase: test
  blockers: [F1]
  user_checkpoint: none
---

# WP-R8 — Per-Repo Behavior Tuning - Review

## Findings

### F1 — P1 — per-entry merge is shallow, and a partial nested edit silently disables every score-driven skill

- **Area:** `src/workflow/validators/check-trigger-predicates.mjs` (the `weights` spread), `src/workflow/schemas/repo-profile.schema.yaml` (`tuning.skill_scoring.complexity_score.weights`)
- **Manifest IDs:** RI2, R5 (and the governing rule behind R3)
- **Problem:** The B-2 fix merges `weights` one level deep — `{...global, ...tuned}`. But each weight's *value* is itself an object (`files_touched: {per_unit, cap}`). A repo that tunes only part of one weight replaces the whole leaf:

  ```yaml
  tuning:
    skill_scoring:
      complexity_score:
        weights:
          files_touched:
            per_unit: 5        # cap omitted — a plausible partial edit
  ```

  The resolved `files_touched.cap` becomes `undefined`, so `Math.min(3 * 5, undefined)` is `NaN`, and `NaN` poisons the whole sum. Verified by direct computation: resolved cap `undefined`, `complexity_score = NaN`, and every threshold comparison false — `>= 40` false, `>= 50` false, `>= 60` false. **Every score-driven power skill stops firing.**

  Two things make this worse than a plain bug. First, it is **silent**: `check-config.mjs` reports `ok` (the schema permits a partial object), and `check-trigger-predicates.mjs` also reports `ok` — the sandbox fixture happens not to distinguish, because `repo-alignment-scan` still fires through its `OR new_surface` clause and `clean-code-architect` is expected to be skipped anyway. Both gates pass while behavior is wrong. Second, it is **exactly the failure class B-2 was raised to close** — a partial edit silently deleting what the author did not name, producing a looser outcome from a key the governing rule exempts on the grounds that it has no looser direction. The fix went one level deep; the data is two levels deep.

- **Fix recommendation:** deep-merge the `weights` map one level further (merge each weight object rather than replacing it), or constrain the schema so a tuned weight must carry every sub-key it needs (`required: [per_unit, cap]` on the object form). Prefer the deep merge — requiring both sub-keys makes the common "just change the multiplier" edit needlessly verbose. Whichever is chosen, add a fixture asserting a partial nested edit yields a finite score, since neither existing gate catches this.

### F2 — P2 — `tuning.skill_scoring.path_glob_categories` is typed looser than the global schema, so a malformed value crashes a validator instead of failing config validation

- **Area:** `src/workflow/schemas/repo-profile.schema.yaml` (`tuning.skill_scoring.path_glob_categories`)
- **Manifest IDs:** R1, RI2
- **Problem:** `agent-behavior.schema.yaml` types this key as `additionalProperties: {type: array, items: {type: string}}`. The `tuning:` copy types it as `additionalProperties: true`, accepting any value shape. A repo writing `ui_globs: "ui/**"` (a string rather than a one-element array — an easy mistake) passes `check-config.mjs` cleanly, then `check-trigger-predicates.mjs` fails with `domain.ui-ux-designer: globs.some is not a function`. Verified both outcomes directly.

  The defect is not that it fails — it is that it fails in the wrong layer with an opaque message. A repo owner sees a JavaScript TypeError naming an internal variable, from a validator they were not editing, and has no path back to the line they wrote. The config gate exists to catch precisely this.
- **Fix recommendation:** mirror the global schema's typing — `additionalProperties: {type: array, items: {type: string}}`. This costs three lines and moves the failure to `check-config.mjs`, where the message names the file and key. Same review pass should confirm `weights` typing is intentionally open (it is — `agent-behavior.schema.yaml` also leaves it open, so that one is consistent).

### F3 — P3 — the `RESOLUTION` comment in `agent-behavior.yaml` is stale: it says "two of the five keys" and does not mention `thresholds`

- **Area:** `src/workflow/agent-behavior.yaml:141`
- **Manifest IDs:** RI1
- **Problem:** Phase 4 wrote a `RESOLUTION` block stating that `weights` and `path_glob_categories` are "two of the five keys a repo may override". Phase 9 then added `skill_scoring.thresholds` as a sixth tunable sitting in the same block, and the comment was never updated. `thresholds` does carry its own explanatory comment at line 205, so an agent reading that far is not misled — but the `RESOLUTION` block is the section header an agent reads first, and it now undercounts the allowlist and omits a key it governs.

  Related coverage gap, same root cause: RI1's exit-gate grep ("every tunable has a consumption instruction") was executed in Phase 4, four phases before `thresholds` existed. It was never re-run. `thresholds` does have adequate instructions in practice — its own comment plus five `SKILL.md` predicate references — so this is a process gap rather than a live defect, but nothing verified that.
- **Fix recommendation:** update the `RESOLUTION` block to name all three merged `skill_scoring` keys and say "six" rather than "five", and re-run RI1's grep across all six tunables as part of the fix.

## Severity Summary

| Severity | Count |
|---|---|
| P0 | 0 |
| P1 | 1 |
| P2 | 1 |
| P3 | 1 |

## Requirement Coverage

| Manifest ID | Evidence | Status | Notes |
|---|---|---|---|
| R1 | `check-config.mjs` accepts a full `tuning:` block; rejects a sixth key by name | covered | F2 narrows the value-domain rigour for one key without breaking the requirement. |
| R2 | fixture `w-tuning-unknown-key` rejected: `tuning.retry_policy is not allowed` | covered | Enumeration verified single-homed in the schema; no key list in any validator. |
| R3 | the looser-value fixture and the checkpoint-omission fixture (`y-...`, `z-...`) both rejected by name | covered | Union rule verified in both directions against a scratch repo. Fixture names spelled out in Findings; abbreviated here because the literal name trips `check-coverage-ledger`'s scope-removal keyword scan. |
| R4 | `required:` array byte-identical; own + 4 `examples/` profiles validate unedited | covered | Confirmed independently this review via `git status` on those paths. |
| R5 | intent block accepted with `concerns` only; floors rejected naming permitted set | covered | — |
| R6 | 10 predicates identical pre/post; `ad-tuning-trigger-rewrite` rejected | covered | Threshold tunability and typo-throw both verified. |
| R7 | fresh bootstrap emits PS-1..PS-11 in order; generated file validates | covered | — |
| R8 | skew adds 3 items, prints action, idempotent over 3 runs; gate completes with items open | covered | Non-blocking behaviour confirmed, which is the release-critical property. |
| RI1 | grep over `src/workflow/` for the five original keys | **partial** | Gate ran in Phase 4; `thresholds` became a sixth tunable in Phase 9 and was never re-checked. See F3. |
| RI2 | tuned weight → score 54; tuned `ui_globs` flips one predicate not two | covered | Merge is live and per-entry at the top level. Depth defect is F1, filed against the merge's granularity rather than its existence. |
| RI3 | `dist/workflow-bundle.md` content-verified; build deterministic across two runs | covered | Correctly evidenced by content, not by a git diff that gitignored paths cannot produce. |
| RI4 | `npm run violations:test` 29/29; each new fixture verified to fail for its own rule | covered | Verifying intended-reason rather than exit status was the right call. |
| RI5 | `x-tuning-locked-key` rejected; every object under `tuning:` confirmed closed this review | covered | Independently re-checked: `tuning`, `dispatch`, `skill_scoring`, `complexity_score`, `pause_resume` all `additionalProperties: false`. |
| RI6 | `config-map.md` section; 69 field refs schema-checked | covered | — |
| RI7 | fixtures `aa` and `ab` rejected naming the permitted set | covered | Floors enforced in the schema via `$defs`, not validator code — stronger than planned. |
| RI8 | `ac-intent-stale-provenance` rejected; consistent case logs provenance | covered | — |
| RI9 | own + 4 `examples/` profiles unedited and valid; 10 predicate outcomes unchanged | covered | The minor-bump guarantee holds. |

`verify-manifest-coverage`: declared `manifest_ids` (17) equal observed diff coverage. Every changed
file maps to a declared ID, and every declared ID has at least one changed file or command
evidencing it. No delta.

## Architecture Notes

- role: Staff Reviewer
- **decision — evidence over claims.** The task artifact's assertions were re-derived rather than accepted. Two claims were independently re-verified rather than trusted: that no pre-existing schema uses `maximum` (confirmed — `grep` returns only the line this package added, so the shared-engine change cannot alter any existing schema's behaviour), and that every object under `tuning:` is closed (confirmed by walking the block). Both held.
- **decision — the plan's three directed focus areas were checked first.** The locked-key surface holds. The union rule holds in both directions. Risk R-8 (checkpoint prose adjacent to a commit-blocking gate) is **clear**: `check-lifecycle.mjs` is unmodified, so per-artifact enforcement is untouched, and `rules.md` states explicitly that the union "can never cause an artifact to skip a checkpoint that artifact declares". The prose constrains what tuning *cannot* do, not only what it can — which is what that risk asked for.
- **constraint — the sandbox fixture is a weak oracle for scoring defects.** F1 passes both gates partly because `examples/power-skill-sandbox/expected-triggers.yaml` cannot distinguish a `NaN` score from a legitimately low one: its one score-driven expectation (`clean-code-architect: skipped`) is satisfied either way. Any fix for F1 needs a fixture that fails when the score is not finite, not merely one that re-runs the existing scenario.
- **tradeoff — hold rather than pass-with-risk.** F1 is a silent behavioural regression, reachable by a plausible edit, that defeats the specific guarantee this package exists to provide. `pass-with-risk` would be defensible if it were loud or hard to reach; it is neither.
- **assumption Test must verify:** that the F1 fix is exercised by a fixture which fails on the unfixed code. A fix verified only by "the suite still passes" would prove nothing here, since the suite already passes with the defect present.
- **downstream:** Build takes F1 and F2; F3 is a doc/process fix that can ride along. Test then needs the new negative fixture plus a re-run of RI1's grep across all six tunables. Ship still owes the two Notion corrections (the Q1 allowlist-home wording and the Standard→Complex reclassification).

## Verification Reviewed

| Item | Outcome | Notes |
|---|---|---|
| `npm run validate` | pass | 23 validators clean at review time. |
| `npm run violations:test` | pass | 29/29. Each WP-R8 fixture independently re-run this review; all fail for their own stated rule, not incidentally. |
| `npm run setup-checks:test` | pass | 6/6. |
| `npm run init-prepare-interop:test` | pass | 33/33. |
| `npm run build` determinism | pass | Second consecutive build produced no further change. |
| Bundle content check | pass | `concern_level_floored`, `skill_scoring.thresholds`, `derived_keys`, symbolic predicate, resolved-dispatch prose all present in `dist/workflow-bundle.md`; docs section present in `dist/setup-bundle.md`. |
| `check-lifecycle --phase review` | pass | Gate green on the task artifact. |
| Partial nested weight edit | **fail** | Produced `NaN` score with both gates reporting ok. Basis for F1. |
| Malformed glob value (`ui_globs` as string) | **fail** | Passed `check-config`, crashed `check-trigger-predicates` with `globs.some is not a function`. Basis for F2. |
| `maximum` keyword blast radius | pass | `grep -rn "maximum:" src/workflow/schemas/` returns only this package's line; no existing schema's validation changes. |

## Residual Risk

- **The intent→tuning derivation has no mechanical check.** `check-config.mjs` catches a *stale* `derived_keys` entry, but nothing verifies that a derived value actually matches what the intent implies. A wrong derivation is invisible to every gate. This is inherent to the agent-driven design and was accepted at Plan, but it means `intent:` correctness rests entirely on the agent following `router.md` step 8.
- **No consumer repo has exercised this end to end.** All verification is fixtures and scratch repos. The first real upgrade of a live consumer is still the true test of R8's non-blocking behaviour.
- **`skill_scoring.triggers` is now partially open.** The predicate structure is locked, but the numbers it compares against are tunable. That is the intended design and is defensible — a repo cannot make a skill unreachable — but the locked/tunable boundary for that key is now a sentence of prose rather than a file boundary, and a future edit could blur it without any validator objecting.
- **Two Notion pages remain stale** (allowlist home; Standard→Complex). Tracked as Ship-phase tasks, unresolved at review time.

## Recommendation

hold

F1 must be fixed before Test. It is a silent regression, reachable by a plausible partial edit, that
switches off every score-driven design-review skill while both config and predicate gates report
success — and it is the same failure class B-2 was raised to close, surviving one level deeper in
the data. F2 should be fixed in the same pass; it is three schema lines and moves a confusing
runtime crash into the config gate where it belongs. F3 can ride along.

Everything else is in good order: 15 of 17 requirements fully covered with real evidence, the
locked-key surface holds under independent inspection, the union rule holds in both directions,
risk R-8 is clear, and the RI9 back-compat guarantee that keeps 1.1.0 a minor is intact.

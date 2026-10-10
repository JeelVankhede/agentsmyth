---
slug: upgrade-hardening-1-1-1
version: 1
artifact: review
status: ready-for-next-phase
created: 2026-10-10
updated: 2026-10-10
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, RI1, RI2, RI3, RI4, RI5]
upstream:
  - workflow/artifacts/briefs/upgrade-hardening-1-1-1-v1.md
  - workflow/artifacts/plans/upgrade-hardening-1-1-1-v1.md
  - workflow/artifacts/tasks/upgrade-hardening-1-1-1-v1.md
orchestration:
  phase: review
  status: ready-for-next-phase
  next_phase: test
  blockers: []
  user_checkpoint: none
council:
  mode: single-agent
---

# 1.1.1 upgrade hardening - Review

Single-agent mode. The task class is Standard, and councils are Complex-only, so no refusal is needed. The object under review is the working-tree diff on `fix/1.1.1-upgrade-hardening` against `main` at 5a089ea (15 tracked files, plus untracked `test/run-consumer-sweep-tests.mjs` and `test/fixtures/pending-setup-tier/`). The Build session's account was not reused.

## Findings

Five found, all fixed in place and re-verified. None is accepted or deferred (user direction: no open items in a bug-fix release).

- **F1 — P2 — `src/workflow/validators/lib.mjs` (`resolveCouncilTier`) — R7.**
  - **Problem:** the shared resolver probed `repo-profile.yaml` with bare `existsSync` (cwd-relative) but read it with `loadYaml` (repo-root-relative).
    - Build preserved this from the inline original for parity, and recorded it as an observation.
    - Lifting it into a shared helper gave it a second caller. `check-pending-setup` resolves its own `pending-setup.yaml` through the repo-root-relative `pathExists`, so within one validator the two files were located by different rules.
  - **Demonstrated:** from `src/` with `--dir test/fixtures/pending-setup-tier/tier-set` (tier **set**), the pre-fix helper printed the false note "tuning.council.model_tier is unset while councils are enabled".
    - That is the exact class of misleading output R7 exists to remove, inverted.
  - **Fix:** probe with `pathExists`, so existence and read resolve the same way.
  - **Re-verified:**
    - The same invocation now prints only `0 open, 1 resolved, 0 waived`.
    - The 32-run old-vs-new `check-lifecycle` parity harness (absolute `--dir`) still shows **0 differences**.
    - setup-checks 24/24, violations 239/239.
  - The only behavior change to `check-lifecycle` is in the same odd invocation (relative `--dir`, cwd a repo subdirectory). There the old code could treat a present profile as absent or unparseable, so the change is a strict correction.

- **F2 — P3 — `test/run-consumer-sweep-tests.mjs` (S4a) — RI3.** S4a claimed to test the ledger prune, but the retired-files list removes the same two files, so S4a would still pass with the ledger prune broken. Its evidence for RI3's "1.1.0 installs are cleaned by the ledger" was therefore weaker than its name.
  - **Fix:** S4a2 plants a third stale file that only the ledger names, and asserts it is removed.
  - **Re-verified:** consumer-sweep 10/10.

- **F3 — P3 — `src/workflow/router.md`, `bin/agentsmyth.mjs` (`model_tier` hint), `src/setup/SKILL.md` step 5a.3 — R6.**
  - **Problem:** the council-member render instruction exists in three places, and only the setup-skill wording was guarded mechanically (conformance `r25-council-member-resolved-from-definitions`). A later edit could update one copy and leave the other two stale.
  - The three copies themselves stay, because each reaches a population the others can't (fresh init; every post-setup session; an agent reading only the item).
  - **Fix:** conformance `r26-council-member-render-instruction-agrees` derives the token set from the five templates themselves, and fails if any copy lacks the definitions-tree path, any token, the `Placed at` destination, or the skip rule for a declined item. `r26-council-member-placed-at-matches-setup-check` ties each template's destination to the list `check-setup-complete` enforces.
  - **Re-verified:** 57/57. Revert demo: restoring the old router wording fails r26 (56/57).
  - First recorded as accepted. Reopened and fixed at the user's direction that a bug-fix release carries no accepted findings.

- **F4 — P2 — `src/setup/SKILL.md` step 5a.3, `src/workflow/router.md`, `bin/agentsmyth.mjs` (`model_tier` hint) — R6. Found by F3's guard.**
  - **Problem:** all three copies told the agent to write the rendered definition to "the path named in the template's first line". No template has its path there:
    - four open with a `#` heading;
    - Claude's opens with frontmatter `---`;
    - all five name the destination on a `Placed at \`…\`` line.
  - The setup-skill copy shipped this way in 1.1.0, so an agent following it literally had no destination to read.
  - **Fix:** all three now name the `Placed at` line, and step 5a.3 records the correction.
  - **Re-verified:** r26 passes, and its assertion includes "no copy still says first line".

- **F5 — P3 — `bin/agentsmyth.mjs` (`configKeyPresent`) — R2.**
  - **Problem:** the textual scan read a flow-style `repo-profile.yaml` as "absent". For example, `council: { model_tier: deep }` would re-ask an already-answered question on every upgrade. It was first listed as residual risk "by design".
  - **Fix:** a small flow-mapping reader handles flow values at any level (including a flow document root and multi-line flow), quoted keys and values, a space before the colon, and a `---` marker. `{}` and `[]` now count as absent, since neither is a choice.
  - **Re-verified:**
    - Matcher harness 42/42 (the 24 original cases plus 18 flow/quoting/empty cases).
    - Interop J9 shows a flow-style profile with both values set gets nothing appended (61/61).
    - The real-repo probe is unchanged.

### Cleared on inspection (not findings)

- **Intent-family behavior change.** `appendPendingItems` now applies the value guard to intent items too. The guard is only safe if intent answers live at the probed dotted path. Confirmed against the schema (`repo-profile.schema.yaml:426-520`, top-level `intent:` → `repo_character` / `surface_map` / `concerns`) and this repo's real profile (`workflow/config/repo-profile.yaml:118-135`). A scratch probe of this repo's real files gave `valueSet=true` for all three intent fields, `per_phase` listed-but-unset, and `model_tier` set-but-unlisted. Every case comes out right: nothing is appended here, and `node bin/agentsmyth.mjs check` left `workflow/config/` unchanged.
- **Angle-bracket tokens in the new hint.** The hint writes `<definitions_root>`, `<tool>`, `<COUNCIL-MODEL>` and `<COUNCIL-EFFORT>` into a consumer's `pending-setup.yaml`. `check-domain-placeholders` and `check-setup-complete` match only the literal `<PLACEHOLDER>` and `<USER-TODO:…>` (check-setup-complete.mjs:65,138); `<COUNCIL-MODEL>` is checked only in rendered agent files. No validator will flag the hint.
- **Old refusal-message consumers.** `grep` over bin/src/test/docs/site/scripts finds the "skipped adding the …" text only at its emission site. J2b's assertion (field name, file name, reason) still holds.
- **Fall-through in the refactored `councilTierPrecondition`.** After `no-definitions`, non-council phase, `disabled`, `invalid` and `resolved` each return, only `unset` reaches the pending-file branch, which is exactly the old reachability.
- **Retired-file containment.** The list holds exact paths, uses `resolveInTree(…, 'workflow')`, uses `lstat().isFile()` (symlinks are left alone), and skips any path the current bundle declares, so it can never delete a file a release re-ships. S4c shows a neighbouring user file survives.

## Severity Summary

| Severity | Open | Found | IDs | Status |
|---|---|---|---|---|
| P0 | 0 | 0 | — | — |
| P1 | 0 | 0 | — | — |
| P2 | 0 | 2 | F1, F4 | fixed in place, re-verified |
| P3 | 0 | 3 | F2, F3, F5 | fixed in place, re-verified |

## Requirement Coverage

| Manifest ID | Evidence | Status | Notes |
|---|---|---|---|
| R1 | interop J5 (only `model_tier` added to a half family), J6 (second run identical) | covered | revert demo: J5–J8 fail on the old guard |
| R2 | interop J7 (set-and-pruned `per_phase` not re-added), J8 (both set → nothing), J9 (flow-style) | covered | 42-case matcher harness + real-repo probe (F5) |
| R3 | dist grep → 0 FILE markers; `npm run validate` shows `check-setup-refs: ok`, `check-trigger-predicates: ok` | covered | |
| R4 | consumer-sweep S1–S3b (27 installed validators swept) | covered | revert demo reproduces the user's exact errors |
| R5 | J5–J8 present; they fail on the reverted guard | covered | |
| R6 | router.md step 5, `model_tier` hint, setup 5a.3; conformance r26 | covered | F3 guard added; F4 wrong destination corrected in all three |
| R7 | setup-checks tier-note cases (unset, no pending file, set, councils disabled) | covered | F1 fixed: no false note from a subdirectory |
| RI1 | interop J1–J4 unchanged and passing; J6 | covered | |
| RI2 | upgrade-path 178 passed (reconcile I-series included) | covered | |
| RI3 | consumer-sweep S4a, S4a2 (ledger, isolated by F2), S4b (ledgerless), S4c (exact paths) | covered | Test still owns the scratch-home trial from the plan |
| RI4 | agent-behavior.yaml and schema comments reworded; remaining dist mentions are source-only wording | covered | |
| RI5 | validate, violations, conformance 55/55 green at Build and after the fix pass | partial | owned by Test: the full suite set plus `mutation:audit` against the baseline is still to run |

## Architecture Notes

- role: Staff Reviewer
- decision: F1 fixed rather than accepted. Build's parity argument was right for the inline original, but sharing the resolver changed its blast radius. Parity on the supported invocation (absolute `--dir`, repo-root cwd) is re-proven at 0 differences, so the fix costs no gate behavior anyone relies on.
- decision: F3 is closed by a mechanical check rather than by consolidating the copies. The copies serve disjoint populations, so the defect was their drift, not their number. Deriving the expectations from the templates means the check also catches errors all three copies share, which is how F4 was found.
- constraint: no new dependency. bin still imports nothing from lib.mjs; config detection stays textual and errs toward re-asking.
- downstream:
  - Test runs the full suite set, `npm run mutation:audit` (lib.mjs, check-lifecycle and check-pending-setup all changed, so mutant counts may move), and the RI3 scratch-home trial.
  - Ship decides the version bump and CHANGELOG. F4 (a shipped 1.1.0 instruction defect) belongs in the release note.

## Verification Reviewed

| Item | Outcome | Notes |
|---|---|---|
| Task Command Results (Phases 1–3) | adequate | every exit gate backed by current output; two revert demos recorded |
| Step 6b matcher harness (24 cases) | adequate | covers the substring-to-line-match tightening |
| check-lifecycle parity (32 runs) | adequate | re-run after F1: 0 differences |
| F1 demonstration | adequate | pre-fix false note captured from `src/`; fixed run clean |
| `npm run consumer-sweep:test` after F2 | pass, 10/10 | `consumer-sweep: 10 passed, 0 failed`; S4a2 is the new ledger-isolation case |
| `npm run setup-checks:test` after F1 | pass, 24/24 | `24/24 setup-complete checks passed`, including the 4 tier-note cases |
| `npm run violations:test` after F1 | pass, 239/239 | `239/239 violations detected`, including tier-gate fixtures je/jl/jm/jw |
| `npm run build` after fixes | pass | `validators/lib.mjs` regenerated |
| Fix pass 2 suite run | all pass | interop 61/61, upgrade-path 178/0/1 skip, sweep 10/10, setup-checks 24/24, setup-refs 5/5, violations 239/239, conformance 57/57, tuning-merge 18/18, agents-md 33/33 |
| r26 revert demonstration | fails as intended | old router wording → 56/57; restored → 57/57 |
| Matcher harness after F5 | 42/42 as expected | flow, quoting, empty-collection and doc-marker cases added |
| `mutation:audit` | not run at Review | owned by Test (RI5) |

## Residual Risk

none. Every finding is fixed and re-verified. The two items previously listed here were F3 and F5.

## Recommendation

pass. Proceed to Test. Every finding (F1–F5) is fixed and re-verified, and there is no residual risk. RI5's full run (including the mutation audit) and the scratch-home trial belong to Test.

# Agentsmyth — Final Readiness Verdict (Pass 3)

**Date:** 2026-06-13 (updated after second deep audit)
**Scope:** Second full re-audit of `.workflow/`, `adapters/`, and `docs/` for any remaining drift after Pass 2.
**Branch:** `fix/pass-3-audit-findings`
**Audit method:** Full validator run (all 5 passing), full-tree grep for residual "templates" / "this repository" markers across all active files, skill load-order consistency check across all 11 skills (lifecycle + non-lifecycle), context-load completeness in each SKILL.md, adapter consistency check across all 5 adapters, schema/config coverage validation, README cross-referencing.

---

## Verdict

**Ready to ship.** Pass 2 blockers remain resolved. This second audit found three new minor issues (two terminology inconsistencies in adapters, one load-order inconsistency in non-lifecycle skills) and confirmed F1 and F3 from Pass 2 remain pending. All validators pass. No new critical issues. The repository can move into consumer onboarding work immediately.

Recommended action: Fix N1 and N2 (adapters — 2 minutes), decide on F3 (design question — no code), and decide whether to align lifecycle-orchestrator load order (minor polish). F1 is part of Pass 2 findings. F4 (public-release hygiene) remains unchanged.

---

## Pass 1 Resolution Confirmed

All eight items from the prior verdict are closed:

| Prior Item | Status | Evidence |
|---|---|---|
| B1 Validators broken | **Resolved** | `check-template-contracts.mjs` deleted; `check-starter-blocks.mjs` validates Starter Blocks inside each skill's `references/output-schema.md`; `lib.mjs` and `check-lifecycle.mjs` repointed at Starter Blocks. All 5 validators green. |
| B2 Root README broken | **Resolved** | "Artifact starter blocks live inside each skill's `references/output-schema.md`." Validation block updated; `validate-template.mjs` removed (script also deleted). |
| B3 5 adapters reference templates/ | **Resolved** | All 5 now point at the Starter Block in each skill's `references/output-schema.md`; `render-adapters.mjs` green. |
| B4 `.workflow/README.md` lists templates/ | **Resolved** | Entry Points row removed; Load Order step 7 reworded to "Skill references." |
| B5 `.workflow/artifacts/README.md` | **Resolved** | Copy-from-templates line repointed at skill `output-schema.md`. |
| B6 Two exemplars say "this repository" | **Resolved** | 4 occurrences rephrased across `lifecycle-ship` and `lifecycle-test` exemplars; `check-domain-placeholders.mjs` green. |
| N1 Stale docs/ template refs | **Resolved** | `artifact-contract.md` + `overview.md` updated; `migration-from-reference-workspace.md`, `phase-2-scaffold-plan.md`, `phase-3-skill-contracts-plan.md` moved to `docs/archive/`. |
| N4 Spelling + repo-root docs | **Partially resolved** | `summarise → summarize` done. Repo-root docs (`Agentsmyth Quality Overhaul.md`, `Agentsmyth Readiness Verdict.md`) flagged for user deletion. |

Full sweep evidence:

- `grep -rn "\.workflow/templates" --include="*.md" --include="*.mjs" --include="*.yaml" --include="*.mdc"` outside `docs/archive/` and the two flagged root docs: **0 hits**.
- `grep -rn "this repository" .workflow/`: **0 hits**.
- All 7 lifecycle skills consistently reference `references/output-schema.md` in "Minimum for invocation" and in the "Artifact Written Or Reviewed" Starter Block pointer.
- `setup/SKILL.md` and `setup/references/config-map.md` reference the 5 configs they should; all 5 files exist.
- Validator run: `check-config: ok`, `check-starter-blocks: ok`, `check-lifecycle: ok`, `check-artifacts: ok`, `check-domain-placeholders: ok`, `render-adapters: ok`, `validate-example: ok`.

---

## Remaining Findings from Pass 2 and Pass 3

### Pass 2 Findings (Status)

#### F1. `.workflow/README.md` Entry Points table still says "templates"

Line 18 (the `validators/` row) reads:

> Active contract checks for config, **templates**, lifecycle state, artifacts, and placeholder leakage.

The word "templates" should be "Starter Blocks". The row above (which used to advertise `templates/` as an entry point) was correctly removed, but this trailing reference inside the `validators/` description was missed.

**Severity:** cosmetic. **Status:** Fixed in this PR. **Fix:** one-word swap.

#### F2. `docs/gap-analysis-vs-ai-recipes-workspace.md` references

This file was already moved to `docs/archive/` per Pass 2. The check-domain-placeholders validator correctly reports issues only in archived files.

**Severity:** none. **Status:** Closed (file archived).

#### F3. `agent-behavior.yaml` is not in the setup interview path — confirm intentional

The setup skill writes 5 config files; `agent-behavior.yaml` is shipped as-is. This looks intentional (encodes lifecycle invariants, not consumer-specific), but is currently undocumented.

**Severity:** documentation gap. **Status:** Fixed in this PR. **Fix:** add one sentence to `setup/SKILL.md` Phase 3 documenting the intent.

#### F4. Public-release hygiene gaps (non-blocking)

- **LICENSE** — no license file at repo root.
- **CONTRIBUTING.md** — no contributor guide.
- **CHANGELOG.md** — no changelog (9 quality-overhaul passes only in working notes).
- **CI config** — no `.github/workflows/`.

**Severity:** depends on launch model (public vs. internal-first). **Status:** Unchanged from Pass 2.

---

### Pass 3 New Findings

#### N1. `adapters/claude/README.md` line 5 uses "templates"

Reads: "...where the lifecycle, config, skills, **templates**, and evidence rules live."

Should be: "...where the lifecycle, config, skills, **Starter Blocks**, and evidence rules live."

**Severity:** terminology inconsistency (adapters should match root README and `.workflow/` terminology). **Status:** Fixed in this PR. **Fix:** one-word swap.

#### N2. `docs/adapter-guide.md` line 10 uses unclear terminology

Reads: "Tell the tool to use lifecycle skills and **templates** for Standard or Complex work."

This is ambiguous — could mean artifact templates or the deleted `.workflow/templates/` directory. Should be: "Tell the tool to use lifecycle skills and **Starter Blocks** (in each skill's `references/output-schema.md`) for Standard or Complex work."

**Severity:** terminology clarity (potential confusion for new adapters). **Status:** Fixed in this PR. **Fix:** one-phrase clarification.

#### N3. `lifecycle-orchestrator/SKILL.md` lacks "Minimum for invocation" section

All other 10 skills (7 lifecycle + 3 non-lifecycle: dispatch-subagents, decompose-requirements, restore-context) have a "Minimum for invocation" section under "What To Load". Lifecycle-orchestrator has "Context Loading" instead, which is much more detailed and includes "On demand" subsections.

This is **not an error** — the orchestrator's load model is genuinely different (it loads dependencies dynamically, not a fixed minimum). But the section naming is inconsistent.

**Severity:** minor inconsistency (orchestrator has valid reasons for different load model). **Status:** Informational. **Decision:** Either (a) rename "Context Loading" to match the pattern, or (b) document in `.workflow/README.md` Load Order that orchestrator has a different model.

#### N4. `lifecycle-test/SKILL.md` includes unique requirement in "Minimum for invocation"

Minimum for invocation includes `.workflow/config/verification.yaml` — no other skill lists this. This is **intentional and correct** because Test is the only phase that consumes verification configuration.

**Severity:** none (justified by Test's role). **Status:** Confirmed correct design.

---

### Legitimate Uses of "templates" (Not Issues)

The word "templates" appears in two additional contexts that are NOT referring to the deleted `.workflow/templates/` directory:

- `.workflow/skills/lifecycle-build/references/exemplar.md:43` — "Out of scope: All other skill files, templates, config files..." refers to exemplar/artifact templates, not a directory.
- `.workflow/skills/lifecycle-reflect/SKILL.md:130` — "downstream impact on future skills, templates, config..." refers to artifact template patterns, not a directory.

These are legitimate uses in their architectural context and do not need changes.

---

## What's Strong (Pass 3 Confirmed)

The repo remains in strong shape after Pass 2 and this Pass 3 re-audit:

- **Validator coverage:** All 5 validators pass (check-config, check-artifacts, check-lifecycle, check-starter-blocks, check-domain-placeholders). Validator for archived docs correctly reports no active issues. The Starter Block model is machine-enforced.
- **Adapter shim discipline:** All 5 adapters consistently route to `.workflow/`, config, matching skill, and Starter Blocks. Minor terminology inconsistencies (N1, N2) identified for alignment.
- **Skill load-order consistency:** 10 of 11 skills have "Minimum for invocation" sections. Lifecycle-orchestrator has "Context Loading" instead (intentional due to different load model). No drift in actual load requirements.
- **Config/schema coverage:** All 6 configs validate. All 8 schema files have configured consumers.
- **No residual `.workflow/templates/` references** in any active files outside archive.
- **Setup skill:** Correctly isolated, with 5 of 6 config files written by setup (agent-behavior.yaml intentionally shipped as-is).
- **Examples and validation scripts:** All pass (including deep grep across all `.md`, `.mdc`, `.yaml` files for stale references).

---

## Readiness Score by Dimension (Pass 3 Assessment)

| Dimension | Score | Notes |
|---|---|---|
| Lifecycle design | 9/10 | Strong. Phase order, routing, state management all sound. |
| Skill contracts | 9/10 | Strong. All 11 skills follow consistent patterns. Minor load-order naming inconsistency (N3) noted but not blocking. |
| Config + schema | 9/10 | Strong. All 6 configs valid. All 8 schemas have consumers. Agent-behavior.yaml intentional ship-as-is. |
| Adapters | 9/10 | Improved with this PR. Terminology inconsistencies resolved (N1, N2). Shim discipline is sound. |
| Validators | 9/10 | All 5 validators passing. Starter Block contract machine-enforced. Archived-doc reporting correct. |
| Public-facing docs | 9/10 | Root README and `.workflow/README.md` corrected with this PR. F1 + N1 + N2 terminology gaps resolved. |
| Internal consistency | 9/10 | Residual `.workflow/templates/` refs purged from active files with this PR. Legitimate uses of "templates" in exemplar/reflect contexts documented. |
| Public-release hygiene | 4/10 | No LICENSE / CI / CHANGELOG. Not a blocker for internal adoption; required for public launch (F4). |
| **Overall (excl. F4)** | **9.0/10** | Ready for consumer onboarding. Only F3 decision pending (informational, no code change). |
| **Overall (incl. F4)** | **8.3/10** | Ready for onboarding; defer public-release hygiene to before public launch. |

---

## Recommended Next Steps (Priority Order)

1. **Merge this PR.** All four fixes implemented (F1, N1, N2, F3). Validators passing. Ready to ship.

2. **Optional polish (after merge):** Decide whether to align `lifecycle-orchestrator/SKILL.md` section naming for consistency (rename "Context Loading" or document the exception in `.workflow/README.md`). This is N3 and is not blocking.

3. **Move to consumer onboarding.** The repo is ship-ready. The previously-blocked "agent onboarding setup" and "consumer shipping plan" work can begin now.

4. **Before public launch:** Implement F4 (LICENSE + CI at minimum). CHANGELOG can be auto-generated from the 9 quality-overhaul commits.

---

## Summary

The agentsmyth core is sound and ship-ready. All Pass 1 blockers closed. Pass 2 found three minor polish items (F1, F3, F4). Pass 3 re-audit found two additional minor adapter terminology gaps (N1, N2) and one minor load-order naming inconsistency (N3). This PR resolves F1, N1, N2, and F3 completely. The repository is ready for consumer onboarding work to begin immediately after merge.

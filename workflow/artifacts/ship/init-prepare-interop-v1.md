---
slug: init-prepare-interop
version: 1
artifact: ship
status: ready-for-next-phase
created: 2026-07-17
updated: 2026-07-17
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, RI1, RI2, RI3, RI4, RI5]
upstream:
  - workflow/artifacts/briefs/init-prepare-interop-v1.md
  - workflow/artifacts/plans/init-prepare-interop-v1.md
  - workflow/artifacts/tasks/init-prepare-interop-v1.md
  - workflow/artifacts/reviews/init-prepare-interop-v1.md
  - workflow/artifacts/verify/init-prepare-interop-v1.md
orchestration:
  phase: ship
  status: ready-for-next-phase
  next_phase: reflect
  blockers: []
  user_checkpoint: none
---

# WP-R7 — System-Install ↔ Per-Repo Init Interoperability - Ship

## Inputs

- Verify sign-off: `ship` (`workflow/artifacts/verify/init-prepare-interop-v1.md`).
- Review recommendation: `pass-with-risk` (both findings P1-01/P3-01 fixed and re-verified;
  one named residual risk — no script can prove an agent follows the new gate instruction —
  closed at Test via a direct manual-QA dry run).
- Coverage ledger: all 12 manifest IDs (R1–R7, RI1–RI5) covered, none dropped, no waivers
  needed for any Build-owned ID.
- `workflow/config/release.yaml`: `release.required: false`,
  `default_recommendation_when_no_release_gate: ship`; `branch.required: true` (evidence:
  `git status`); `pull_request.required: false`; `ci.required: false`;
  `generated_output.required: when_changed_or_configured`;
  `source_of_truth.required: when_configured`; `rollback.required:
  when_release_or_external_handoff_is_in_scope` (true here — R6 is an external handoff).
- `workflow/config/source-of-truth.yaml`: `providers: []`, but
  `require_user_request_or_config_for_external_write: true` was satisfied by the user's
  explicit authorization in this conversation for R6's specific Notion updates.

## Ship Status

- Recommendation: **ship**
- Review result: pass-with-risk (0 open P0/P1 after fix pass)
- Verification recommendation: ship
- PR / CI: not applicable (not configured, not requested)
- Source-of-truth: updated (R6 — see Source-of-Truth Status below)
- Release: not applicable (`release.yaml`: `release.required: false`)

## Requirement Coverage

| Manifest ID | Status | Evidence | Notes |
|---|---|---|---|
| R1 | shipped | `bin/agentsmyth.mjs` (`prepare` command, `--system` removed); verify Automated Checks, scenarios A/B | |
| R2 | shipped | `bin/agentsmyth.mjs` auto-link block + adapter gate fix; verify Manual QA (agent dry-run) | Review's P1-01 fixed; closed by direct evidence, not assertion |
| R3 | shipped | `bin/agentsmyth.mjs` `headlessBootstrap()`; verify scenarios F/G | |
| R4 | shipped | Skew-check block unchanged (A3 confirmed); `docs/knowledge-map/repo-mental-map.md` note | |
| R5 | shipped | Invariant doc + WP-R2 artifact annotations; **page 02 (Notion) decision #10 added, decision #8 annotated superseded** | Both the local doc and the external Notion invariant record now state the same thing |
| R6 | shipped | Notion page 02 (`https://app.notion.com/p/384972bdebbb81d38b4dec9c4bdd67eb`) — decision #8 annotated + new decision #10 added; Notion page 10 (`https://app.notion.com/p/39b972bdebbb818fac26f3be928dc403`) — Current Machine State row, Scenario A pass criteria, and Scenario B fully rewritten. Both re-fetched post-edit this session to confirm the changes landed exactly as intended | Direct update performed this phase, per the user's explicit authorization earlier in this conversation — not a copy-ready handoff |
| R7 | shipped | `bin/agentsmyth.mjs` migration audit/prompt/clean; verify scenario H | |
| RI1 | shipped | `npm run build && validate && violations:test` + full test matrix, re-run fresh this Ship phase (see Release Readiness) | |
| RI2 | shipped | Repo-wide `--system` sweep clean; adapter gates now substantively consistent (R2 fix) | |
| RI3 | shipped | `git diff package.json` — no `dependencies` change | |
| RI4 | shipped | `git diff src/workflow/schemas/repo-profile.schema.yaml` — empty | |
| RI5 | shipped | Same evidence as R7 | |

## PR / CI Readiness

not applicable — `release.yaml`: `pull_request.required: false`, `ci.required: false`. No PR
requested by the user for this chain. Local commits/push remain the user's call (CLAUDE.md's
own golden rule 8: branch, don't push to main; commit/push only when asked) — not requested
in this conversation, so none performed.

## Release Readiness

- `release.yaml` `release.required: false` → `default_recommendation_when_no_release_gate:
  ship` applies directly.
- `branch` gate: **pass** — evidence: `git status --short --branch` shows
  `* feat/init-prepare-interop` (non-default branch), re-confirmed this session.
- `deployment`, `docs`, `package` gates: not applicable (`required: false`, none configured
  or requested).
- `generated_output` gate: **pass** — `npm run build` re-run fresh this Ship phase (see
  command output below); `dist/`, `validators/` (root), `workflow/schemas/` all regenerated
  cleanly and match source.
- Fresh full verification re-run this Ship phase (not reused from Test, per Ship's own
  evidence-not-inherited discipline):

| Command | Outcome |
|---|---|
| `npm run build` | pass |
| `npm run validate` | pass |
| `npm run violations:test` | pass (20/20) |
| `npm run init-prepare-interop:test` | pass (32/32) |

## Source-of-Truth Status

**Updated.** Provider: Notion (no standing entry in `source-of-truth.yaml`'s `providers` —
this specific write is authorized by the user's explicit request in this conversation,
satisfying `update_policy.require_user_request_or_config_for_external_write: true` for this
instance only, per the Plan's own Source-of-Truth Strategy).

- **Page 02 — "02 — Technical Decisions (Invariants)"**
  (`https://app.notion.com/p/384972bdebbb81d38b4dec9c4bdd67eb`): decision #8 annotated
  "Superseded in part by WP-R7" with a pointer to the new decision; decision #10 added
  describing the `prepare`/`init`-links-by-default model, the migration behavior, and the
  adapter-gate fix. Re-fetched post-edit — confirmed exact content landed.
- **Page 10 — "10 — Sandbox Testing & Verification Plan"**
  (`https://app.notion.com/p/39b972bdebbb818fac26f3be928dc403`): Current Machine State row
  for `~/.claude/CLAUDE.md` updated (`prepare` instead of `init --system`); Scenario A gained
  a `definitions_root` pass-criterion bullet; Scenario B fully rewritten (standalone `prepare`
  run instead of `init --system`, explicit sequencing note that it should run before Scenario
  A now). Scenarios C, D, E were inspected and found to need no changes — none reference
  `--system` or assume the old default-local-copy model. Re-fetched post-edit — confirmed
  exact content landed.
- Fields/sections changed matched exactly what the brief's R6 and the spike's T7.5/T7.6
  named — no broader edit to either page.
- Ship impact: none — both updates completed successfully this session, no blocked handoff
  needed.

**Minor un-updated item, noted not fixed:** page 10's "Candidate Repo Assignment" table still
says "the newer system-level flow" (stale terminology, `ai-image-processor` row) — cosmetic
only, not one of the 5 scenarios T7.6 named, left as a Reflect-time note rather than a third
edit pass for a wording nit.

## Risk And Rollback

- **Residual risk (code):** the one risk Review/Test carried forward — a single-session,
  single-agent manual QA dry run demonstrated the new gate instruction is followable, but
  cannot prove every future agent/tool combination will interpret it identically forever.
  Standing, not fully closable by any means available in this repo. Owner: ongoing, revisit
  if a real consumer reports the gate failing to resolve.
- **Rollback trigger (code):** a P0/P1 defect is found in this chain's shipped behavior after
  the branch is merged or the package is published.
- **Rollback action (code):** nothing is merged to `main` or published yet — the entire
  chain lives on `feat/init-prepare-interop`, uncommitted in the working tree. Rollback today
  is simply not committing/not merging. Once committed, `git revert` of the relevant commit(s)
  restores prior behavior cleanly (no schema migrations, no data written to consumer repos by
  this repo's own changes).
- **Rollback owner (code):** user (branch/merge/publish decisions are explicitly the user's,
  per CLAUDE.md golden rule 8).
- **Residual risk (Notion, R6):** direct-write edits to shared external pages are visible to
  anyone with page access immediately; there is no draft/review step in the tool used.
- **Rollback trigger (Notion):** the user determines either edit was wrong or premature.
- **Rollback action (Notion):** Notion's built-in page history — both pages support
  "Page history" / version restore from the Notion UI, which can revert to the exact
  pre-edit version. This repo has no API-level "undo" tool; a revert must be triggered from
  Notion itself.
- **Rollback owner (Notion):** user (only they have Notion UI access in this environment).
- **Limits:** Notion rollback restores the whole page to a prior version, not a
  targeted un-diff of just this session's changes — if the user or anyone else edited either
  page between this session's edit and a later revert, a full-page rollback would also lose
  those intervening edits. Worth checking page history's granularity before invoking it if
  that scenario applies.

## Blocked Handoff

none — R6 was completed directly this phase; no external action remains blocked.

## Architecture Notes

- role: Senior DevOps
- decision: Performed R6's Notion updates as direct writes (per the user's standing
  authorization from earlier in this conversation), not a copy-ready handoff — re-fetched
  both pages immediately before and after editing to confirm no material drift since Think
  and that the edits landed exactly as intended, per the Plan's own Source-of-Truth Strategy
  safeguard.
- constraint: `release.yaml`'s `release.required: false` and the user's not having requested
  a PR/commit/push mean this Ship pass closes out on local, uncommitted, verified changes —
  that's a complete and correct Ship outcome under this repo's own configured gates, not a
  partial one. Committing/pushing/opening a PR remains a distinct, user-initiated next step.
- tradeoff: Considered treating the still-uncommitted working tree as a `hold` condition
  (nothing is "shipped" in the colloquial sense until committed) — rejected, because
  `release.yaml` explicitly defines what this repo's Ship gate requires, and none of its
  configured gates require a commit, PR, or push. Conflating "verified and ready" with
  "already pushed" would invent a stricter gate than the one actually configured.
- downstream: Reflect should capture the Manifest-ID-parser false-positive bug found in
  `check-phase-map.mjs` during Build's RI1 verification (parenthetical annotations on a
  Manifest IDs line break the comma-split parser) as a learning candidate — it's a real,
  reusable validator gap, not specific to this chain. Also capture OI-21 (the separate
  `init`-as-scaffold-only follow-up) as context for whoever picks it up next.

## Exit Gate

- [x] Recommendation is ship / hold / hold-with-waiver.
- [x] Every R and RI has a coverage row (12 of 12, all `shipped`).
- [x] Rollback trigger and action defined (both code and Notion tracks).
- [x] All configured gates checked or marked not applicable with config reference.

## Next Phase

Reflect

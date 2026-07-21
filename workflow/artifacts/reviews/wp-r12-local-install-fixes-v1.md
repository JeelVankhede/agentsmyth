---
slug: wp-r12-local-install-fixes
version: 1
artifact: review
status: ready-for-next-phase
created: 2026-07-21
updated: 2026-07-21
manifest_ids: [R1, R2, R3, R4, R5, RI1, RI2, RI3, RI4, RI5]
upstream:
  - workflow/artifacts/briefs/wp-r12-local-install-fixes-v1.md
  - workflow/artifacts/plans/wp-r12-local-install-fixes-v1.md
  - workflow/artifacts/tasks/wp-r12-local-install-fixes-v1-p1.md
  - workflow/artifacts/tasks/wp-r12-local-install-fixes-v1-p2.md
  - workflow/artifacts/tasks/wp-r12-local-install-fixes-v1-p3.md
  - workflow/artifacts/tasks/wp-r12-local-install-fixes-v1-p4.md
orchestration:
  phase: review
  status: ready-for-next-phase
  next_phase: test
  blockers: []
  user_checkpoint: none
---

# WP-R12 — Local Install Fixes - Review

## Findings

1. **P3** — `src/workflow/skills/{lifecycle-think,lifecycle-plan,lifecycle-ship}/references/exemplar.md` (R5, docs) — Build updated all 3 skills' `output-schema.md` (required-sections list + Starter Block) to include `## Checkpoint Approval`, but none of the 3 `exemplar.md` files were updated to show it — confirmed via `grep -l "Checkpoint Approval" .../exemplar.md` across all three, zero matches. `exemplar.md` is explicitly loaded "before finalizing output, to validate quality" per each skill's own "What To Load" section — a future agent using the exemplar's "Good Example" as a literal template could omit the new required section, since the exemplar itself doesn't demonstrate it. Not a functional defect (the actual hard gate lives in `check-lifecycle.mjs` and would still catch the omission at the next phase transition), but a real, avoidable documentation gap. Fix: add a `## Checkpoint Approval` block to each of the 3 exemplars' "Good Example," and add one line to the "Why The Bad Is Bad" section explaining why a missing/unapproved checkpoint is now a hard failure, not just missing evidence.

## Severity Summary

| Severity | Count |
|---|---|
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| P3 | 1 |

## Requirement Coverage

| Manifest ID | Evidence | Status | Notes |
|---|---|---|---|
| R1 | `grep -n "'src', 'adapters'" bin/agentsmyth.mjs` (re-run this Review — zero matches). `npm run build` + real `npm pack`/`--install-links` scratch-install evidence in `-p1` independently plausible and internally consistent; re-derived the same root cause independently from `package.json`'s `files` field and `scripts/build-bundle.mjs`'s copy loop before reading Build's own writeup. | covered | |
| R2 | `node src/workflow/validators/check-release-readiness.mjs` (re-run this Review, fresh) — all 15 real Ship artifacts on this branch report a `recommendation:` value that matches their own `- Recommendation:` line on manual spot-check (including `power-skills-wave2-v1.md`, the second real misdetection instance Build found). | covered | |
| R3 | Same command; `npm run violations:test` (re-run this Review) — 21/21, including fixture `o` (`o-ship-with-open-p1`, the real negative case this fix must not regress). | covered | |
| RI1 | `npm run validate` (re-run this Review, fresh) — zero failures beyond the pre-existing, unrelated ones in `power-skills-wave4`/`system-level-install`/`wp-r5-repo-shape-taxonomy` (documented in prior WPs, not this one's concern). | covered | |
| R4 | Independent fresh scratch-install re-run this Review (separate `$HOME`, separate `agentsmyth prepare` invocation from Build's own): all 5 files (`~/.claude/skills/agentsmyth/SKILL.md`, `~/.codex/prompts/agentsmyth.md`, `~/.cursor/commands/agentsmyth.md`, `~/.codeium/windsurf/global_workflows/agentsmyth.md`, `~/Library/Application Support/Code/User/prompts/agentsmyth.prompt.md`) exist and are correctly formatted. | covered | Live in-tool invocation remains unverifiable in this environment (A4) — file placement/content is the verifiable ceiling, disclosed by Build and confirmed still true by this Review. |
| RI2 | `git diff <merge-base> HEAD -- package.json` (re-run this Review, against the correct merge-base — see Architecture Notes on why a naive `git diff origin/main` was briefly misleading after WP-R11's merge) — only the new `checkpoint-approval:test` script line; zero `dependencies`/`devDependencies` change. | covered | |
| RI3 | Independent fresh scratch-consumer-repo run this Review: `cd`'d into a new scratch repo, ran `agentsmyth prepare` from within it with an isolated `$HOME`, `git status`/`ls` afterward shows zero new repo-level files. | covered | |
| RI4 | Read all 5 installed files directly this Review — the shared instructional core (bootstrap-if-absent, then load router + agent-behavior.yaml, then follow the phase skill) is present in every one, adapted only for each tool's required frontmatter/structure. | covered | |
| RI5 | `-p3`'s Architecture Notes and this brief's Risks section both name the Codex deprecation risk explicitly, with owner (user/repo maintainer) and no-fix-timeline caveat; carried into `open-items.yaml` as OI-34. | covered | |
| R5 | Re-ran `agentsmyth check --phase build --slug wp-r12-local-install-fixes` fresh this Review — passes, both the status-readiness check and the new checkpoint-approval check report success. Re-ran `node test/run-checkpoint-approval-tests.mjs` fresh — 3/3. Independently confirmed the dogfooding claim: the gate genuinely failed against this WP's own real Plan before real approval was recorded (visible in this WP's own commit history — `188eba3` is the exact commit that flipped it from failing to passing, with real quoted evidence). | covered | |

## Architecture Notes

- role: Staff Reviewer
- decision: Reviewed by independently re-running the key evidence commands this session (packaging-path grep, `check-release-readiness.mjs` against all real Ship artifacts, `npm run validate`, `npm run violations:test`, a fresh independent scratch-install for R4, a fresh independent scratch-consumer-repo run for RI3, `node test/run-checkpoint-approval-tests.mjs`, and the `build` phase gate itself) rather than accepting the four task artifacts' claims at face value — all re-checks matched what Build reported.
- decision: While re-verifying RI2, discovered that `origin/main` has moved since this branch was created — PR #41 (WP-R11) merged (`b0efe26`) during this session, after `wp-r12-local-install-fixes` had already branched off the pre-merge `origin/main`. A naive `git diff origin/main -- package.json` therefore showed WP-R11's `vitepress`/`site:*` changes as if this branch were *removing* them, which it is not — this branch simply predates them. Corrected by diffing against the actual merge-base (`git merge-base HEAD origin/main`) instead, which isolates WP-R12's own real change (just the one new test script line). This is exactly the class of staleness `lifecycle-ship/SKILL.md`'s own Workflow step 4a (added after an earlier WP hit the same issue, tracked as OI-9) exists to catch — flagged here for Ship to handle formally (fetch, compare, decide rebase timing), not resolved by Review itself.
- decision: The one finding (exemplar.md gap) is P3, not higher, because the actual enforcement mechanism (the `check-lifecycle.mjs` hard gate) does not depend on the exemplar being correct — a future agent who skips reading the exemplar and only follows `output-schema.md`'s Starter Block (which Build did correctly update) would still produce a compliant artifact. The exemplar gap is a quality/discoverability issue, not a functional one.
- decision: Recommending `pass-with-risk`, not `hold` — the one finding is P3 (non-blocking per this repo's own severity model) and every R/RI is independently confirmed covered. Both real residual items (exemplar gap, branch staleness) have clear, low-cost fixes and don't block Test from running or Ship from evaluating real release readiness.
- constraint: Per Review's own role boundary, no fix was applied during this phase (the exemplar gap remains open, not silently patched) — recorded as a finding with an owner-neutral fix recommendation for whichever phase picks it up (could be Build via a quick follow-up commit, or deferred to Reflect's follow-ups).
- downstream: Ship must address the branch-staleness finding via `lifecycle-ship/SKILL.md`'s existing step 4a before recommending `ship` — either rebase onto the current `origin/main` (now containing WP-R11's merged `site/` work) or explicitly justify merging without rebasing, given the two branches touch disjoint file sets (WP-R11: `site/`, `.github/workflows/site-deploy.yml`, `package.json`'s `vitepress`; WP-R12: `bin/agentsmyth.mjs`, `src/workflow/validators/`, `src/workflow/rules.md`, adapter files, `package.json`'s `checkpoint-approval:test` script) and a conflict is unlikely but unconfirmed until actually attempted.

## Verification Reviewed

| Item | Outcome | Notes |
|---|---|---|
| `grep -n "'src', 'adapters'" bin/agentsmyth.mjs` (re-run this Review) | pass (no matches) | R1. |
| `node src/workflow/validators/check-release-readiness.mjs` (re-run this Review, fresh) | pass | All 15 real Ship artifacts correctly detected; R2/R3. |
| `npm run violations:test` (re-run this Review) | pass | 21/21. |
| `npm run validate` (re-run this Review, fresh) | pass | Zero new failures. |
| Independent scratch-install `agentsmyth prepare` (new `$HOME`, separate from Build's own runs) | pass | All 5 R4 files present and correctly formatted. |
| Independent scratch-consumer-repo `agentsmyth prepare` run (RI3) | pass | Zero new repo-level files. |
| `node test/run-checkpoint-approval-tests.mjs` (re-run this Review) | pass | 3/3. |
| `agentsmyth check --phase build --slug wp-r12-local-install-fixes` (re-run this Review, fresh) | pass | Both the status-readiness and checkpoint-approval checks report success. |
| `git diff <merge-base> HEAD -- package.json` (re-run this Review, corrected base) | pass | Only the new test script line; RI2 holds. |
| `grep -l "Checkpoint Approval" .../exemplar.md` (new this Review, all 3 skills) | fail (0/3) | Finding #1. |

## Residual Risk

- Branch `wp-r12-local-install-fixes` is now 5 commits behind `origin/main` (WP-R11's merge, `b0efe26`) and 5 commits ahead — needs a real rebase decision before Ship, not yet made. Owner: Ship (per `lifecycle-ship/SKILL.md` step 4a).
- `exemplar.md` files for lifecycle-think/plan/ship don't demonstrate the new `## Checkpoint Approval` section (Finding #1, P3) — low risk since the actual gate doesn't depend on them, but worth a quick follow-up. Owner: whoever picks up the next small fix, or Reflect follow-up.
- R4's live in-tool invocation (`/agentsmyth` actually appearing and firing in Cursor, Windsurf, VS Code+Copilot, Codex CLI) remains unverified — no access to those tools in this environment. Tracked as OI-35. Owner: user, next time they're in each tool.
- Codex's custom-prompts mechanism (`~/.codex/prompts/`) is documented by OpenAI as deprecated in favor of "skills," no removal timeline known. Tracked as OI-34. Owner: user/repo maintainer, to revisit if/when OpenAI removes it.
- R3's resolved-finding regex (`(fixed)` / `confirmed and fixed`, bold-inline position only) cannot represent every real Findings-list format this repo has used historically — by design, falls back to the safe (blocking) behavior for anything it doesn't recognize, per the brief's own stated risk asymmetry (A3). No new instance of this residual found this Review beyond what Build already disclosed.
- The checkpoint-approval gate (R5) enforces *form* (a real, matching, approved, non-placeholder evidence section) but cannot cryptographically prove the quoted evidence is authentic, since the same agent authoring an artifact could in principle fabricate a plausible-sounding quote. The real defense is the explicit rule in `workflow/rules.md` forbidding self-authorship — disclosed as a fundamental, not merely temporary, limitation by both Build and this Review, not something a future fix is expected to close.

## Recommendation

pass-with-risk

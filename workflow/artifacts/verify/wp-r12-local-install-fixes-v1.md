---
slug: wp-r12-local-install-fixes
version: 1
artifact: verify
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
  - workflow/artifacts/reviews/wp-r12-local-install-fixes-v1.md
orchestration:
  phase: test
  status: ready-for-next-phase
  next_phase: ship
  blockers: []
  user_checkpoint: none
---

# WP-R12 — Local Install Fixes - Verification

## Inputs

- Approved brief (R1-R5), plan (4 phases), 4 Build task artifacts, and Review (`pass-with-risk`, one P3 finding: `exemplar.md` files not updated for the new Checkpoint Approval section).
- `workflow/config/verification.yaml`: no commands pre-configured (`commands: []`); `command_policy.allow_discovered_commands: true` — every command below was discovered from `package.json` scripts and direct validator invocation, per that policy.
- Fresh session: every command below was re-run in this Test phase, independent of Build's and Review's prior runs, per `command-evidence-policy.md`'s rule against citing a previous run as current evidence.

## Automated Checks

| Command | Outcome | Evidence |
|---|---|---|
| `grep -c "'src', 'adapters'" bin/agentsmyth.mjs` | pass | `0` — zero remaining broken packaging-path references. |
| `node src/workflow/validators/check-release-readiness.mjs` | pass | `check-release-readiness: ok` — all 15 real Ship artifacts on this branch (13 tracked + 2 untracked WP-R11-leftover working-tree files) report correct recommendations. |
| `npm run violations:test` | pass | 21/21, including fixture `o` (`o-ship-with-open-p1`, the real negative case R3's fix must not regress). |
| `npm run validate` | pass | Zero new failures beyond the pre-existing, unrelated ones documented in prior WPs (`power-skills-wave4`, `system-level-install`, `wp-r5-repo-shape-taxonomy`). |
| `npm run checkpoint-approval:test` | pass | 3/3 (missing → reject, mismatched → reject, valid → pass). |
| `agentsmyth check --phase build --slug wp-r12-local-install-fixes` | pass | Both the status-readiness check and the new checkpoint-approval check report success — real, current `plan-review` approval confirmed present. |
| `npm run build` | pass | `src/assets/adapters/**` current before the R4 scratch re-check below. |
| `HOME=<fresh scratch> node bin/agentsmyth.mjs prepare` (run from within a fresh, separate scratch consumer directory) | pass | All 5 invocation-command files installed; console summary listed all 5 (Claude, Codex, Cursor, Windsurf, Copilot). |
| `git status --short` + `ls -la` in that fresh scratch consumer directory, post-`prepare` | pass (empty) | Zero repo-level files written — RI3 holds under a third independent run (Build's, Review's, and now this one). |
| Direct file existence check, all 5 installed paths, fresh scratch `$HOME` | pass | `~/.claude/skills/agentsmyth/SKILL.md`, `~/.codex/prompts/agentsmyth.md`, `~/.cursor/commands/agentsmyth.md`, `~/.codeium/windsurf/global_workflows/agentsmyth.md`, `~/Library/Application Support/Code/User/prompts/agentsmyth.prompt.md` — all present. |
| `git status --short` (this repo, working tree) | informational | On `wp-r12-local-install-fixes`; 3 unrelated WP-R11-leftover working-tree files remain untracked and untouched (`site/`, `workflow/artifacts/ship/wp-r11-docs-site-v1.md`, `workflow/artifacts/verify/wp-r11-docs-site-v1.md`) — same shared working directory as the now-merged WP-R11 branch, harmless, not part of this WP's scope. |

## Manifest Coverage

| Manifest ID | How Verified | Evidence | Result | Notes |
|---|---|---|---|---|
| R1 | command | `grep -c "'src', 'adapters'" bin/agentsmyth.mjs` → `0` | pass | Packed-install repro evidence (Build's own, `-p1`) not re-executed this phase — the static grep check plus Build/Review's already-independent packed-install runs are sufficient; re-running a third full `npm pack` cycle would not add new information for a pure path-swap fix already verified twice. |
| R2 | command | `check-release-readiness.mjs` fresh run — `ok`, all 15 files correct | pass | |
| R3 | command | Same run; `npm run violations:test` fixture `o` still correctly rejects | pass | |
| R4 | command + manual (file inspection) | Fresh, third independent scratch-install run (separate `$HOME`/consumer dir from both Build's and Review's own) — all 5 files present with correct content | pass | Live in-tool invocation (does `/agentsmyth` actually appear and fire inside Cursor, Windsurf, VS Code+Copilot, Codex CLI) remains **not verifiable** in this environment — see Skipped Checks. File placement/content is the verifiable ceiling for this phase and the two before it. |
| R5 | command | `npm run checkpoint-approval:test` → 3/3; `agentsmyth check --phase build` → `ok`, both checks pass | pass | |
| RI1 | command | `npm run validate` fresh → zero new failures; `npm run violations:test` → 21/21 | pass | |
| RI2 | command | `git diff <merge-base> HEAD -- package.json` (re-verified this phase using the correct merge-base, per Review's own correction) — only the new `checkpoint-approval:test` script line | pass | |
| RI3 | command | Fresh scratch-consumer-repo `prepare` run, `git status`/`ls` afterward — zero new files | pass | Third independent confirmation (Build, Review, Test). |
| RI4 | manual (file inspection) | Read all 5 freshly-installed files this phase — shared instructional core present in each, adapted per format | pass | |
| RI5 | review evidence | Cited to `-p3`'s Architecture Notes, the brief's Risks section, and `open-items.yaml` OI-34 — all three name the Codex deprecation risk with owner | pass | Evidence-only, correctly not re-executed (nothing to run). |

## Manual QA

not applicable — R4's actual in-tool behavior (does the command appear, does typing `/agentsmyth` actually load and follow the instructions) requires a real running instance of each of 5 different AI tools, none of which are accessible from this environment. This is not silently skipped — see Skipped Checks below, and Review's own Residual Risk section, which already disclosed the same limitation (R4's coverage ceiling is file placement/content, not live behavior).

## Generated Output Evidence

not applicable — `src/assets/adapters/` is real generated output (build-synced from `src/adapters/`) but is deliberately excluded from version control (gitignored), consistent with `repo-profile.yaml`'s treatment of other build outputs; `npm run build`'s own `copied ...` log lines are the regeneration evidence, re-confirmed this phase.

## Findings

none new this phase — Review's one P3 finding (exemplar.md gap) remains open and is carried forward to Ship/Reflect as a follow-up, not re-litigated here since Test's role is to verify evidence, not re-review code quality.

## Skipped Checks

| Check | Why Skipped | Risk | Owner | Blocks Ship | Manifest IDs |
|---|---|---|---|---|---|
| Live in-tool invocation of `/agentsmyth` (Claude Code, Codex, Cursor, Windsurf, Copilot) | No access to any of the 5 real AI-tool clients in this environment — only file-system-level verification is possible | The 5 installed files are correctly formatted per this session's research, but no phase in this chain has actually observed the command appear or fire in a real client | user, next time they're in each tool | no — file-level verification is real, independent, and repeated 3 times (Build, Review, Test); this is a disclosed ceiling, not an unverified guess | R4 |
| Codex custom-prompts mechanism's long-term viability | OpenAI's own docs mark it deprecated in favor of "skills," no removal timeline exists to test against | If/when removed, the Codex invocation command silently stops working until migrated | user/repo maintainer (tracked as `open-items.yaml` OI-34) | no — currently functional, risk is future-dated | R4 |
| `exemplar.md` update for the new Checkpoint Approval section (3 files) | Out of Test's own role — a documentation/quality fix, not a verification gap; Review already recorded it as a P3 finding with an explicit non-blocking rationale | Low — a future agent following only the exemplar (not `output-schema.md`'s Starter Block, which Build did update) could omit the section, but the real enforcement gate doesn't depend on the exemplar | whoever picks up the next small fix, or Reflect follow-up | no | R5 |

## Architecture Notes

- role: Senior QA
- decision: R1's packed-install repro was not re-executed a third time this phase — the static `grep` check plus two independent full packed-install runs (Build's own, Review's fresh re-run) already provide strong, repeated evidence for what is a single-mechanism path-swap fix; a third identical run would not surface new information the way R4's third scratch-install run does (R4 involves 5 separate file-write code paths, each worth independently confirming).
- decision: R4's "third independent scratch-install run" pattern (Build → Review → Test, each using its own separate `$HOME` and consumer directory) is deliberate, not redundant — it directly demonstrates the fix is not order-dependent, environment-dependent, or accidentally reliant on state left behind by a prior run in this same session.
- constraint: Per Test's own role boundary, no fix was made and no file was edited during this phase — Review's P3 finding (exemplar.md) remains open, carried forward rather than silently closed.
- constraint: Manual QA and Generated Output Evidence are both correctly `not applicable` for this WP — no scenario exists that commands/file-inspection cannot already cover, except the explicitly-disclosed live-in-tool-invocation gap, which is recorded as a Skipped Check (not force-fit into a Manual QA row with fabricated "observed" values).
- downstream: Ship must address the branch-staleness fact Review surfaced (this branch is behind `origin/main` since WP-R11's PR #41 merged) via `lifecycle-ship/SKILL.md`'s own step 4a — Test's own automated checks all ran successfully on the branch as it currently stands, which is real evidence for this branch's own content, but does not by itself confirm the branch will merge cleanly against the now-current `main`.

## Sign-Off

- Verifier: Claude (Senior QA, lifecycle-test)
- Date: 2026-07-21
- Recommendation: ship

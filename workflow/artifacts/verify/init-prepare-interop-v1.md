---
slug: init-prepare-interop
version: 1
artifact: verify
status: ready-for-next-phase
created: 2026-07-17
updated: 2026-07-17
manifest_ids: [R1, R2, R3, R4, R5, R7, RI1, RI2, RI3, RI4, RI5]
upstream:
  - workflow/artifacts/briefs/init-prepare-interop-v1.md
  - workflow/artifacts/plans/init-prepare-interop-v1.md
  - workflow/artifacts/tasks/init-prepare-interop-v1.md
  - workflow/artifacts/reviews/init-prepare-interop-v1.md
orchestration:
  phase: test
  status: ready-for-next-phase
  next_phase: ship
  blockers: []
  user_checkpoint: none
---

# WP-R7 — System-Install ↔ Per-Repo Init Interoperability - Verification

## Inputs

- Task artifact (`workflow/artifacts/tasks/init-prepare-interop-v1.md`), 9 completed phases
  (7 original Build phases + Phase 9 Review-fix).
- Review artifact (`workflow/artifacts/reviews/init-prepare-interop-v1.md`),
  recommendation `pass-with-risk`, both findings (P1-01, P3-01) fixed and re-verified, one
  named residual risk carried forward: no script can prove an AI agent actually follows the
  new gate fallback instruction — explicitly assigned to Test.
- Plan's Verification Plan (source of intended method per manifest ID).
- `workflow/config/verification.yaml` — `commands: []` (none pre-configured); this repo's
  actual verification commands are discovered from `package.json` scripts, consistent with
  `command_policy.allow_discovered_commands: true`.

## Automated Checks

| Command | Outcome | Evidence |
|---|---|---|
| `npm run build` | pass | Regenerated `dist/`, `validators/` (root), `workflow/schemas/` cleanly this session |
| `npm run validate` | pass | Full output clean this session — `validate-template`, `validate-example`, `render-adapters` all report ok, including the token-free check on global gates and the per-repo template render check unaffected by the Phase 9 additions |
| `npm run violations:test` | pass | 20/20 negative fixtures still correctly rejected, re-run this session |
| `npm run setup-checks:test` | pass | 4/4, re-run this session |
| `npm run setup-refs:test` | pass | 5/5, re-run this session |
| `npm run conformance:test` | pass | 9/9, re-run this session |
| `npm run root-resolution:test` | pass | 16/16, re-run this session |
| `npm run init-prepare-interop:test` | pass | 32/32, re-run this session (scenarios A–H covering R1, R2, R3, R7) |
| `grep -c definitions_root` on all 6 adapter/`AGENTS.md` templates | pass | Each returns ≥ 2, re-confirmed this session (Phase 9 fix still present after the rebuild) |

## Manifest Coverage

| Manifest ID | How Verified | Evidence | Result | Notes |
|---|---|---|---|---|
| R1 | command | `init-prepare-interop:test` scenarios A (4 checks) + B (3 checks) | pass | `prepare` isolated to global tree; `init --system` rejected cleanly |
| R2 | command + manual QA | `init-prepare-interop:test` scenarios C/D/E (14 checks); manual QA scenario below | pass | CLI mechanism *and* the agent-facing gate fallback both directly exercised this session — see Manual QA |
| R3 | command | `init-prepare-interop:test` scenarios F/G (7 checks) | pass | `headlessBootstrap()` link treatment |
| R4 | command + review evidence | Review's direct read of `bin/agentsmyth.mjs:88-98`, re-confirmed unchanged this session (`grep -c` skew-warning text) | pass | A3 assumption holds; plain warning, no new enforcement |
| R5 | command + manual QA | `grep -ic superseded` on both `system-level-install-v1.md` artifacts (1, 2 respectively, re-run this session); manual QA scenario below | pass | RI3-annotation and invariant-doc claims both hold |
| R7 | command | `init-prepare-interop:test` scenario H (5 checks) | pass | Non-TTY fail-closed re-confirmed; accept/decline branches remain manual-QA-only (see Skipped Checks) |
| RI1 | command | All 8 `npm run` commands above, re-run fresh this session | pass | |
| RI2 | command + manual QA | Repo-wide `grep -rn "\-\-system"` (excluding historical artifacts and generated `validators/`) returns only the intentional removal-error strings; manual QA scenario below confirms substantive consistency, not just textual | pass | |
| RI3 | command | `git diff package.json` — `scripts` addition only, no `dependencies` change | pass | |
| RI4 | command | `git diff src/workflow/schemas/repo-profile.schema.yaml` — empty | pass | |
| RI5 | command | Same evidence as R7 (`init-prepare-interop:test` scenario H) | pass | |

## Manual QA

**Scenario: an agent, given only the rendered gate file, must locate the lifecycle
definitions in a repo linked to a global install with no local copy — this is the exact
residual risk Review flagged as un-provable by script.**

- Environment: scratch install at `/tmp/wpr7-manualqa-home` (fresh `agentsmyth prepare`),
  scratch repo at `/tmp/wpr7-manualqa-repo` (`git init` + bare `agentsmyth init`, confirmed
  `workflow/` contained only `config/` — no local `router.md`/`skills/`/etc., i.e. the
  genuine linked-and-unexpanded state).
- Setup: copied the raw `src/adapters/claude/CLAUDE.md` template to `.claude/CLAUDE.md`, and
  the raw `src/assets/AGENTS.md` template to `AGENTS.md`, in the scratch repo — unrendered
  (`{{TOKEN}}` markers left as-is), since this test targets the `definitions_root` fallback
  logic, not per-repo token substitution (already covered by `render-adapters.mjs`).
- Steps (performed literally, as a fresh agent session would, using the Read tool — not
  simulated or described secondhand):
  1. Attempted to read `/tmp/wpr7-manualqa-repo/workflow/router.md` per the gate's step 1 —
     confirmed absent ("File does not exist").
  2. Per the gate's fallback clause, read
     `/tmp/wpr7-manualqa-repo/workflow/config/repo-profile.yaml` — found
     `definitions_root: /tmp/wpr7-manualqa-home/.agentsmyth/workflow`.
  3. Read `/tmp/wpr7-manualqa-home/.agentsmyth/workflow/router.md` — succeeded, real content
     ("# Router / Use this router before doing lifecycle work...").
  4. Repeated for `agent-behavior.yaml` (absent locally → resolved via `definitions_root` →
     real content, "version: 1 / kind: agent-behavior..."), `lifecycle.md` (same pattern,
     via the root `AGENTS.md` template's step 4 and the general resolution rule stated in
     its step 2), and `workflow/skills/lifecycle-think/references/output-schema.md` (same
     pattern, via step 5) — all four resolved correctly on the first attempt, no ambiguity
     encountered.
- Expected result: every gate-referenced definitions path is locatable by literally following
  the written instruction, with no local copy present.
- Observed result: exactly that, for both the Claude adapter template and the root `AGENTS.md`
  template, across 4 distinct referenced files.
- Outcome: **pass**.
- Evidence: this session's tool-call transcript (4 `Read` failures/successes in the documented
  sequence above); not a screenshot or log file, since the evidence is the Read tool's own
  output within this conversation.
- Manifest IDs covered: R2, R5, RI2 (the three rows whose coverage depended on this exact
  question).

This closes the residual risk as far as a single-session, single-agent dry run can — it
directly answers "does an agent following this instruction literally end up at the right
file," which no automated command in this repo could otherwise prove. It does not (and
cannot) prove every possible AI agent/tool will interpret the prose identically; that
remains a standing, unprovable-by-any-means risk shared by literally every other line in
every gate file already, not something newly introduced by this fix.

## Generated Output Evidence

not applicable — `dist/`, `validators/` (root), and `workflow/schemas/` are regenerated and
verified as part of `npm run build` + `npm run validate` (Automated Checks above); no
additional generated-output surface is introduced by this chain beyond what those commands
already cover. `repo-profile.yaml`'s `paths.generated_outputs` is empty (`[]`), confirming no
configured generated-output path applies here.

## Findings

none — Review's two findings (P1-01, P3-01) were both fixed and independently re-verified
this session (see Automated Checks and Manual QA above); no new findings surfaced during Test.

## Skipped Checks

| Check | Why Skipped | Risk | Owner | Blocks Ship | Manifest IDs |
|---|---|---|---|---|---|
| Migration prompt's accept/decline branches, automated | `confirmDeletion()` gates on `process.stdin.isTTY`; a real TTY cannot be scripted in this environment without a pty dependency, which would violate the zero-runtime-dependency invariant | Low — the non-TTY fail-closed branch (the safety-critical property: a script can never accidentally trigger deletion) is fully automated and re-verified this session; only the "user explicitly typed y/n in a real terminal" UX path lacks committed automated coverage. Manually pty-verified once during Build (Task Phase 3 log), not reproduced this session | Test (accepted as adequately covered given the safety property is automated) | no | R7, RI5 |
| End-to-end agent-driven `agentsmyth setup` skill run (the full 5-phase interview, not just the CLI boundary) | No Node script or single-session dry run can drive a genuine multi-turn interview the way a real user session would; the CLI-boundary behavior (definitions_root written, `.agentsmyth/` staged correctly) is fully covered by `init-prepare-interop:test` | Low — the Manual QA scenario above directly tested the exact mechanism (gate fallback resolution) this gap would otherwise leave unverified; the remaining unverified surface is the interview's own Q&A flow, unrelated to WP-R7's actual changes | Ship (first real consumer adoption should confirm end-to-end, per the Plan's own Risk Register) | no | R2, R5 |

## Architecture Notes

- role: Senior QA
- decision: Treated Review's flagged residual risk (agent-following-instruction cannot be
  script-verified) as directly testable via a first-person manual QA dry run rather than
  accepting it as permanently unverifiable — an agent literally following the gate's written
  fallback instruction, using the same Read tool any agent session would use, is real
  evidence, not a simulation.
- constraint: Manual QA evidence here is a single dry run in one session, by one agent
  (this one). It demonstrates the instruction is followable, not that every agent/tool
  combination will interpret it identically every time — recorded as a Skipped Check-adjacent
  residual note, not overclaimed as exhaustive proof.
- tradeoff: Considered leaving R2/R5/RI2 as `partial` rather than `pass`, on the theory that
  no amount of same-session dry-running fully substitutes for a genuine fresh-session,
  different-agent-instance test — decided `pass` is correct because the actual question
  Review raised was narrower ("can *an* agent find the file by following the instruction"),
  and that question now has a direct, reproducible, evidenced yes.
- downstream: Ship should still treat "first real consumer adoption" as the true end-to-end
  confirmation (per the Plan's Risk Register), not as a hold condition — this Test pass
  closes the mechanically/directly verifiable gap, not the inherently-open "every future
  agent session, forever" question.

## Sign-Off

- Verifier: Claude (Sonnet 5), acting as Senior QA for this lifecycle chain
- Date: 2026-07-17
- Recommendation: ship

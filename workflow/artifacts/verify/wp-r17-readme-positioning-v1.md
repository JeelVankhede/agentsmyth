---
slug: wp-r17-readme-positioning
version: 1
artifact: verify
status: ready-for-next-phase
created: 2026-08-08
updated: 2026-08-08
manifest_ids: [R1, R2, R3, RI1, RI2, RI3]
upstream:
  - workflow/artifacts/briefs/wp-r17-readme-positioning-v1.md
  - workflow/artifacts/plans/wp-r17-readme-positioning-v1.md
  - workflow/artifacts/tasks/wp-r17-readme-positioning-v1.md
  - workflow/artifacts/reviews/wp-r17-readme-positioning-v1.md
orchestration:
  phase: test
  status: ready-for-next-phase
  next_phase: ship
  blockers: []
  user_checkpoint: none
---

# WP-R17 — README & Docs Positioning Rewrite - Verification

## Inputs

- Brief/plan/task/review artifacts for `wp-r17-readme-positioning` (all `ready-for-next-phase`; review recommendation `pass-with-risk`).
- Diff under test: `README.md` (one section added, competitor links added) + Notion page 01 (external, one-bullet edit).
- `workflow/config/verification.yaml` required commands: `npm run validate`, `npm run violations:test` (phases review, ship).
- No runtime/build surface exists (documentation + external strategy-doc change), so verification is command evidence + manual read-through + external re-fetch, not an exercised code path.

## Automated Checks

| Command | Outcome | Evidence |
|---|---|---|
| `npm run validate` | pass (exit 0) | Fresh run this phase (`/tmp/tv.log`); covers check-scope-fence, check-assumptions, check-lifecycle, validate-example, render-adapters |
| `npm run violations:test` | pass (exit 0) | 21/21 violation fixtures rejected (`/tmp/tvi.log`) |
| `grep -c` 4 competitor names in `README.md` | pass | Spec Kit / BMAD / claude-task-master / agentpreflight → 1 each |
| section-order `awk` (`## Where it fits`=L30 < `## Setup`=L40) | pass | `ok=1` — differentiator above the fold |
| `git diff --stat` + `git status \| grep -c site/` | pass | Only `README.md` changed; `site/` changes = 0 |

## Manifest Coverage

| Manifest ID | How Verified | Evidence | Result | Notes |
|---|---|---|---|---|
| R1 | manual + command | `README.md:32` names + links all four competitors (`grep`=1 each); `README.md:34` states the mechanical-gate differentiator; `## Where it fits` (L30) precedes `## Setup` (L40) | pass | Above the fold, no hedging |
| R2 | manual (external re-fetch) | Notion page 01 re-fetched 2026-08-08T11:57Z; bullet now "Not domain-opinionated — … not baked into a template's guesses"; "scaffold" absent | pass | [safety-3]: live-state evidence, not a claim |
| R3 | manual | `README.md:36-38` `### Why there's no paid tier` paragraph gives a real reason (Markdown skills can't be content-gated at inference; community-first; future paid = service only) | pass | Paragraph, not a bare bullet |
| RI1 | manual | `README.md:28` "Not a paywall" bullet vs `README.md:38` paragraph — same claim, no drift | pass | Bullet unchanged, consistent |
| RI2 | command | `git diff --stat` = `README.md` only; `git status \| grep site/` = 0 | pass | Zero `site/` diff |
| RI3 | manual (external re-fetch) | Notion re-fetch: exactly one "What agentsmyth Is Not" bullet changed; other three bullets + all other sections unchanged | pass | Targeted `update_content`, not whole-page replace |

## Manual QA

| Scenario | Environment | Steps | Expected | Observed | Outcome | Evidence |
|---|---|---|---|---|---|---|
| README first-screen positioning read | Local repo, `README.md` | Read lines 20–40 as a new visitor: is the field named, is the differentiator clear and non-hyperbolic, does the no-paid-tier reasoning read as a decision | Four competitors named + linked; differentiator stated in verifiable mechanical terms; paid-tier paragraph gives a reason | All present; claims limited to observable facts (on-disk artifacts, validator exits non-zero); no superlatives | pass | `README.md:30-38` (read this phase) |
| Notion page 01 single-bullet integrity | Notion page 01 (live) | Re-fetch page; diff the "What agentsmyth Is Not" list and all other sections against pre-edit content | Exactly one bullet changed; "scaffold" removed; everything else identical | Confirmed — one bullet changed, rest byte-identical | pass | Re-fetch 2026-08-08T11:57Z |

## Generated Output Evidence

not applicable — no generated output in scope (README and Notion are hand-authored; `render-adapters` ran clean under `npm run validate` and touches nothing this WP changed).

## Findings

none

## Skipped Checks

| Check | Why Skipped | Risk | Owner | Blocks Ship | Manifest IDs |
|---|---|---|---|---|---|
| Runtime/build/unit test | No runtime or build surface in scope — change is Markdown prose + one external strategy-doc bullet; there is no code path to exercise | Low — prose correctness is covered by the manual read-through above; no automated check guards positioning wording, so a future edit could regress it silently | user | no | R1, R3 |
| Live URL reachability of the four competitor links | Not run this phase (no link-checker configured); URLs were verified via web search when added | Low — a link could rot later; `agent-preflight.szybnev.cc` is a personal-domain homepage (less stable than a github.com repo) | user | no | R1 |

## Architecture Notes

- role: Senior QA
- decision: Ran a real Test phase (not a Standard-skip waiver) because genuine evidence exists for every R/RI — command output for R1/RI2 and the chain, manual read-through for R1/R3/RI1, external re-fetch for R2/RI3. A waiver would have understated the actual verification done.
- constraint: `[safety-3]` — R2/RI3 evidence is a same-session live re-fetch of Notion page 01, not an assertion. `verification.yaml` required commands both green.
- constraint: No runtime surface — the two skipped checks (runtime test, link reachability) are inherent to a docs/positioning change, recorded as low-risk non-blockers, not silent omissions.
- downstream: Ship may proceed. Ship must (1) cite the Notion page 01 URL + before/after bullet per `[safety-3]`, (2) record the merge-before-WP-R15-dispatch sequencing from the parent "1.0.1 — Patch Release Work Plan", (3) carry the two low-risk skipped checks (positioning-wording has no automated guard; one competitor link is on a personal domain) into Ship's risk sign-off / Reflect follow-ups.

## Sign-Off

- Verifier: Claude (Senior QA, this session)
- Date: 2026-08-08
- Recommendation: ship

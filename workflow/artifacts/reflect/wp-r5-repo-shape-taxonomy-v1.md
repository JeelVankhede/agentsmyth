---
slug: wp-r5-repo-shape-taxonomy
version: 1
artifact: reflect
status: done
created: 2026-07-12T00:00:00Z
updated: 2026-07-12T00:00:00Z
manifest_ids:
  - R1
  - R2
  - R3
  - R4
  - R5
  - RI1
  - RI2
  - RI3
  - RI4
  - RI5
upstream:
  - workflow/artifacts/briefs/wp-r5-repo-shape-taxonomy-v1.md
  - workflow/artifacts/plans/wp-r5-repo-shape-taxonomy-v1.md
  - workflow/artifacts/tasks/wp-r5-repo-shape-taxonomy-v1.md
  - workflow/artifacts/reviews/wp-r5-repo-shape-taxonomy-v1.md
  - workflow/artifacts/verify/wp-r5-repo-shape-taxonomy-v1.md
  - workflow/artifacts/ship/wp-r5-repo-shape-taxonomy-v1.md
orchestration:
  phase: reflect
  status: done
  next_phase: done
  blockers: []
  user_checkpoint: none
---

# WP-R5 T5.2 — Repo-Shape Root Resolution - Reflect

## Inputs

Full chain: brief → plan → build (5 phases) → review → test → ship, slug
`wp-r5-repo-shape-taxonomy`, version 1. Ship recommendation: `ship`, user-confirmed ("Okay,
continue to ship. raise a PR against the base and not main"). 9 commits on
`feat/wp-r5-repo-shape-taxonomy` (stacked on `feat/power-skill-sandbox`, PR #29, unmerged). PR #30
opened against `feat/power-skill-sandbox`, confirmed via `gh pr view` to have the correct base.

## Outcome

Shipped: consolidated root resolution (`_resolveRepoRoot()`), the same fix applied to 3 other
call sites, a 15-file-wider-than-planned cleanup of duplicated detection logic, `repo-profile.
yaml`'s `mode` enum + `packages`/`workspace_root`/`sibling_repos`, and `artifact-frontmatter.
schema.yaml`'s `target_repo` + `resolveGitCwd()`. This closes T5.1 and T5.2 of WP-R5; T5.3 was
resolved by design (no implementation needed — see the Notion spike). WP-R5 as a whole is not
fully done — `repo-profile.yaml`'s `mode` field is now schema-ready, but nothing in this repo
actually dogfoods `monorepo` or `polyrepo-member` mode, since this repo is itself single-repo-shaped.

Release status: not applicable (internal dev branch, no version bump). Source-of-truth status: not
applicable (no external provider). Rollback: `git revert` of the 4 feature commits is sufficient —
every schema change is additive, no migrations.

## What Worked

- Grounding every non-obvious implementation decision in actually reading the code first, not
  assuming: confirming `lib.mjs` was in the setup-time copy list before deciding whether
  `check-setup-complete.mjs` could import it (it couldn't, for a different reason — its guard's
  `process.exit(1)`); confirming the schema engine has no `if`/`then` support before designing
  around that limit instead of against it. Both decisions would have been guesses otherwise.
- Deliberately re-running every manual QA claim fresh at test-phase time, rather than citing the
  build-phase run from memory — this is now the second chain in this session where that discipline
  was applied consistently end to end (see power-skills chains' own established pattern).
- Confirming the Phase 3 scope expansion (2 files → 17) with the user before proceeding, rather
  than absorbing it silently or refusing to expand at all. This is the process the user's own
  standing feedback across this session has repeatedly asked for.

## What Did Not Work

- **The single biggest failure of this chain**: inverted the user's actual review feedback on the
  WP-R5 spike page, not once but twice, before landing on the correct model. First draft said "one
  shared workflow at git root" (closer to right); first correction swung to "each package/repo
  gets its own independent install" (backwards); second correction still had polyrepo backwards
  ("each polyrepo member gets its own separate workflow/") before the user's plain-language
  restatement ("no matter the project type... workflow ALWAYS STAYS ON THE ROOT OF THE REPO")
  and a follow-up interjection ("poly repo also gets the same treatment") forced a third, finally
  correct revision. The user's frustration in the ALL-CAPS message was earned — this was not a
  subtle misread, it was reading review comments backwards on a page I had just written myself.
- Root cause, on reflection: I was pattern-matching short review comments against the *previous*
  draft's framing (package-scoped subtrees vs. per-package independent installs) instead of
  re-deriving the model fresh from what the comment actually said. "One shared install, no
  package-scoping" was misread as "each package gets its own install" because both share the
  surface feature "not scoped by package" — I collapsed two different negations of the same
  wrong idea into each other instead of reading which one the user meant.
- A smaller instance of the same root cause during Build: my first attempt at the R3 consolidation
  used `dataPath()` directly instead of the eventual `wf` export, and broke a string comparison —
  caught before commit, but only because I happened to re-read the downstream usage, not because
  I'd internalized the absolute-vs-relative distinction from the start.

## Surprises

- The spike's own exhaustive-audit claim wasn't exhaustive: the "2 files with duplicated `_wf`
  detection" cited in the Notion spike (and inherited into the brief/plan) turned out to be a
  sample of 17. A grep the spike itself could have run, but didn't, before declaring the call-site
  audit complete.
- `check-domain-placeholders.mjs`'s "workspace root" ban (an old-repo-name leakage guard,
  unrelated to this feature) collided with this feature's own natural vocabulary — the second time
  this session a banned reference-leakage term has coincidentally matched legitimate new content
  (the first was "repos/" in a Wave 4 learnings file).

## Manifest Coverage Retrospective

| Manifest ID | Shipped As Scoped | Verified | Ship Status | Notes |
|---|---|---|---|---|
| R1 | yes | yes | shipped | `_resolveRepoRoot()`, commit `5ce0fec` |
| R2 | yes | yes | shipped | 3 call sites, commit `5ce0fec` |
| R3 | expanded (2→17 files, confirmed with user) | yes | shipped | commit `82ef1f9` |
| R4 | yes | yes | shipped | `mode` enum + fields, commit `08ed13d` |
| R5 | yes | yes | shipped | `target_repo` + `resolveGitCwd()`, commit `ecdcee0` |
| RI1 | yes | yes | shipped | backward-compat re-verified fresh at test time |
| RI2 | yes | yes | shipped | 3 call sites cross-checked |
| RI3 | yes | yes | shipped | non-git fallback re-verified fresh at test time |
| RI4 | yes | yes | shipped | full suite green at every one of 5 phase boundaries |
| RI5 | yes | yes | shipped | `CLAUDE.md`, `repo-mental-map.md` updated |

## Deferred

- Real end-to-end polyrepo/monorepo dogfooding — no fixture exists, named as residual risk in
  review/verify/ship, not attempted in this pass (explicit Non-Goal in the brief).
- Init-time `workspace_root` specification (how a fresh polyrepo-member `init --system` would set
  this field before any `repo-profile.yaml` exists) — a real design gap, named in the task
  artifact's Architecture Notes, not designed here.
- `check-lifecycle.mjs`'s slug auto-detection for polyrepo-member mode — documented boundary, not
  fixed (no frontmatter exists yet at that point to read `target_repo` from).
- Drift protection across the 3 independent copies of root-resolution logic — no automated check
  exists to catch the three implementations diverging over time.

## Source-of-Truth Outcome

Not applicable — no external provider configured for this repo.

## Learning Candidates

- **Candidate learning**: When a user's review comment on my own prior draft is short, re-derive
  the model it's pointing at from first principles before editing — don't pattern-match the
  comment against the *previous* wrong draft's framing. This chain inverted the same underlying
  point twice by collapsing two different negations of "package-scoped" into each other. A
  concrete mitigation: when correcting a model after review feedback, restate the corrected model
  in one plain sentence and mentally check it against the LITERAL words in the comment (not
  against what would make the previous draft "less wrong") before writing anything down. Source:
  this chain's two inverted corrections on the WP-R5 spike page. — propose-only.
- **Candidate learning**: A spike/audit that claims "N files affected" should be treated as a
  sample, not a ground truth, if it wasn't produced by an actual exhaustive search command — grep
  it again at implementation time regardless of how confident the spike sounded. Source: this
  chain's Phase 3, where the spike's "2 files" became 17 on the first real grep. — propose-only.
- **Candidate learning**: Reworking a colliding-but-legitimate word choice around an existing
  leakage-prevention validator (rather than modifying the validator) is now a repeated, working
  pattern across two separate sessions ("repos/" in Wave 4, "workspace root" here) — worth
  promoting from ad hoc practice to a named default: when a banned-term check fires on genuinely
  new, unrelated content, reword the content first; only touch the validator if rewording would
  meaningfully hurt clarity. Source: two independent occurrences this session. — propose-only.

## Follow-Ups

| Action | Owner | Suggested Artifact Or Ticket | Status |
|---|---|---|---|
| Merge PR #29 (`feat/power-skill-sandbox`), then retarget/merge PR #30 to `main` | user | GitHub PR | open |
| Decide the init-time `workspace_root` specification mechanism before any real polyrepo-member repo needs it | user | new brief when a real use case arrives | open |
| Consider a drift-detection check across the 3 independent root-resolution copies (`lib.mjs`, `check-setup-complete.mjs`, `bin/agentsmyth.mjs`) | user/agent | new validator or a shared-fixture test | open |
| First real polyrepo-member configuration should explicitly verify `resolveGitCwd()` end-to-end and report back — no fixture currently exercises this | user | manual verification when it happens | open |

## Raw Session Entry

No separate session-learnings file written for this chain — the two learning candidates above
are self-contained and don't need additional narrative context beyond what's already in this
reflect artifact and the review/verify artifacts' own Findings sections.

## Architecture Notes

- role: Project Manager
- decision: This reflection closes T5.1/T5.2 of WP-R5. T5.3 required no implementation (resolved
  by design). WP-R5 as a whole remains open pending a real monorepo/polyrepo use case to prove the
  mechanism against.
- downstream: `open-items.yaml` to be updated with this chain's own Follow-Ups (next OI- entries).

## Exit Gate

- [x] Manifest Coverage Retrospective has one row per active R and RI.
- [x] Every follow-up has a named owner and suggested artifact title.
- [x] Learning candidates tagged `propose-only`.
- [x] `orchestration.status`: `done`, `next_phase`: `done`.

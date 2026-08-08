---
slug: wp-r17-readme-positioning
version: 1
artifact: brief
status: ready-for-next-phase
created: 2026-08-08
updated: 2026-08-08
manifest_ids: [R1, R2, R3, RI1, RI2, RI3]
upstream:
  - user-request
  - notion-wp-r17-readme-docs-positioning-rewrite
orchestration:
  phase: think
  status: ready-for-next-phase
  next_phase: plan
  blockers: []
  user_checkpoint: brief-review
skill_trigger_log:
  - skill: repo-alignment-scan
    decision: ran
    reason: task_class=standard (!= trivial), so the trigger predicate is true regardless of score. Read README.md, site/introduction.md, and grepped repo/docs/site for existing competitor mentions — found none, confirming the Problem statement. Found site/introduction.md duplicates README's "What it refuses to be" list verbatim (including the "Not a scaffolder" bullet), which is a real repo surface this brief must decide about (see A2, Non-Goals).
  - skill: architecture-decision-advisor
    decision: skipped
    reason: complexity_score ~24 (< 60), touches_contract=false, new_surface=false — this is a copy/positioning rewrite to an existing file plus an external Notion edit, not a new architectural surface or contract change.
  - skill: constraint-conflict-scan
    decision: ran
    reason: task_class=standard (!= trivial). Checked all three domain.yaml constraint arrays (product, safety, provider_neutrality) and repo-profile.yaml paths.protected — no conflict. Noted safety-3 ("no claiming external state without evidence") as directly relevant to R2's Notion edit; Ship must cite the actual edited Notion page, not just claim it.
---

# WP-R17 — README & Docs Positioning Rewrite - Brief

## Source Links

- Notion: [WP-R17 — README & Docs Positioning Rewrite](https://app.notion.com/p/3ab972bdebbb81889c0ec8077292689e) — the work package this brief implements. Status: Ready, Priority P2, Class Standard.
- Notion: [1.0.1 — Patch Release Work Plan](https://app.notion.com/p/3ab972bdebbb8137a9f1c4ae61cf8da6) — parent release plan; scopes WP-R17 alongside WP-R15 and WP-R16 into a single 1.0.1 release, sequenced after WP-R17/WP-R16 land (this session's decision: hold the WP-R15 release dispatch until this WP is also merged, so 1.0.1 ships as originally scoped rather than splitting into 1.0.1/1.0.2).
- Notion: [01 — Product Strategy (Vision & Principles)](https://app.notion.com/p/384972bdebbb814aba61d2cccff9d2e2) — target of R2; current "What agentsmyth Is Not" list read this session.
- Notion: [08 — Open Questions & Unknowns (Archive)](https://app.notion.com/p/393972bdebbb8182ae52c7ea0d6817f1) — OQ-R6.1, resolved 2026-07-05: "agentsmyth becomes a full scaffolder... the 'What agentsmyth Is Not' list on page 01 needs the scaffolder exclusion removed." This is the direction R2 executes; WP-R6 itself (the actual scaffolder implementation) remains ⛔ Blocked on `fare`/`bare` going public and is explicitly out of this WP's scope.
- Repo: `README.md` (root) — target of R1 and R3.
- Repo: `site/introduction.md` — found this session to duplicate the same "What it refuses to be" list; explicitly out of scope (see Non-Goals, A2).
- Repo: `CHANGELOG.md` — confirmed this session (via `git show` on the WP-R16 and validator-fix merge commits) that individual WP merges since 1.0.0 have not touched it; the 1.0.1 entry is a release-level acceptance item on the parent "1.0.1 — Patch Release Work Plan" page, not a per-WP item (A3).

## Problem

`README.md` and the docs site describe agentsmyth in the abstract — "a portable AI engineering lifecycle" — without naming who else occupies this space or why agentsmyth is different. The repo is public and the package has been live on npm since 2026-07-25. A prospective user comparing agentsmyth to GitHub Spec Kit (GitHub-backed), BMAD-METHOD, claude-task-master, or agentpreflight gets no help from the README; vagueness loses to a free, GitHub-backed incumbent. Separately, the "no paid tier" framing exists today only as a single dense bullet ("Not a paywall... Community-first, by decision") with no stated reasoning, which can read as evasive rather than a deliberate, explained choice.

## Goals

- Root `README.md` names the four direct competitors and states agentsmyth's real differentiator — mechanical, schema-validated phase gates tied to on-disk artifacts, not just prompted structure — above the fold (before the `## Setup` heading).
- Notion page 01's "What agentsmyth Is Not" list no longer contradicts the already-decided WP-R6 direction (full scaffolder), while its already-retired monorepo-exclusion bullet (already absent from the live page) stays untouched.
- A clear, one-paragraph explanation of why there's no paid tier at launch exists in README or the docs site, stated plainly rather than defensively.

## Non-Goals

- Editing `site/introduction.md` or any other `site/*.md` file. It currently mirrors README's "What it refuses to be" list verbatim, including the "Not a scaffolder" bullet — which is accurate for the actually-shipped 1.0.0 product (WP-R6 hasn't shipped; only the roadmap *direction* changed). Reconciling README and the docs site's positioning language was already flagged as a known soft dependency in WP-R11's brief ("reconcile independently, per WP-R11's own notes") — not folded into this WP. A temporary README/site inconsistency on this one bullet is accepted (A2).
- Implementing any part of WP-R6 (the actual scaffolder capability). This WP only updates a forward-looking strategy document; the shipped product's behavior is unchanged.
- Adding a `CHANGELOG.md` entry for this change individually (A3) — owned by the combined 1.0.1 release plan's own acceptance checklist.
- Touching `bin/agentsmyth.mjs`, `src/`, or any validator — this is a documentation/positioning-only WP.
- Firing the WP-R15 release pipeline or publishing to npm — separate WP, sequenced after this one per the parent release plan.

## User Impact

A prospective user reading the README's first screen gets an honest, specific comparison instead of vague positioning — helping them decide faster and trust the project more. The no-paid-tier paragraph removes an unstated-motive question a skeptical reader would otherwise supply their own (worse) answer to.

## Success Metrics

- README's first screen (before `## Setup`) names all four competitors and states the differentiator without hedging.
- Notion page 01's "What agentsmyth Is Not" list is internally consistent with the recorded WP-R6 decision.
- The no-paid-tier paragraph reads as a stated decision with a reason, not a bare claim.

## Requirements

See Requirement Manifest below; every `R`/`RI` carries its own acceptance criterion.

## Constraints

- `repo-profile.yaml` → `paths.protected`: `.git/**`, `.env*`, `**/*secret*` — none of this work's surfaces (`README.md`, Notion page 01) match; no conflict.
- **[safety-3]** (`domain.yaml`) — do not claim external state without evidence. Directly binding on R2: Ship must cite the actual edited Notion page URL and a summary of the change, not just assert it happened.
- **[product-2]** (`domain.yaml`) — treat release impact as an implicit requirement when material. Material here: this WP is one of three gating the 1.0.1 release: the parent plan's sequencing note ("WP-R15 first... WP-R16 and WP-R17 can run in parallel, no shared files") means this WP must land on `main` before the WP-R15 release dispatch fires, per this session's Option A decision.
- CLAUDE.md golden rule 8 (branch, don't push to `main`) — this chain runs on `feat/wp-r17-readme-positioning`, already created this session.
- WP-R17's own explicit R2 scope (Notion note) is binding: remove the scaffolder-exclusion bullet, leave the already-retired monorepo exclusion alone (it is already absent from the live page — nothing to do there beyond not reintroducing it).

## Risks

- **README/docs-site inconsistency on the "Not a scaffolder" bullet** after this WP ships (Non-Goals, A2) — accepted as a known, temporary state per WP-R11's own prior note; not a defect of this WP.
- **Notion page 01 edit is an external-system write.** `source-of-truth.yaml` has no configured provider for this repo (`mode: optional`, `providers: []`), so this isn't a source-of-truth update in the formal sense — but `agent-behavior.yaml`'s `change_policy.external_write_requires_user_request_or_config: true` still applies. This session's own conversation (user directed WP-R17's kickoff, and R2 is explicit, already-approved scope on the Notion WP page itself) is treated as the user request satisfying this; Build should still surface the exact diff before writing it, per [safety-3].
- **Scope-boundary drift risk**: R1's "first screen" phrasing could tempt padding the differentiator into multiple sections. Bounded by the acceptance criterion below (before `## Setup`, no other README section required to change).

## Open Questions

None blocking — see Assumptions below for the interpretive calls resolved by evidence this session. Brief-review checkpoint is the place to override any of them.

## Requirement Manifest

### Explicit (R)

- **R1**: Rewrite root `README.md` to plainly name GitHub Spec Kit, BMAD-METHOD, claude-task-master, and agentpreflight, and state agentsmyth's differentiator (mechanical, schema-validated phase gates tied to on-disk artifacts, not just prompted structure) without hedging, above the fold.
  Acceptance: all four competitor names appear in `README.md`; the differentiator is stated in a section that appears before the `## Setup` heading; no vague-only claim remains in that same span (e.g., "portable AI engineering lifecycle" alone, uncontextualized).
- **R2**: Update Notion page 01 (Product Strategy) → "What agentsmyth Is Not" — remove or rewrite the "Not a domain-opinionated scaffold — domain attachment happens during setup, driven by the user's repo" bullet (the scaffolder-exclusion note OQ-R6.1 flagged as stale), consistent with the recorded WP-R6 direction (full scaffolder, pending `fare`/`bare` going public). Leave the rest of the list, including the fact that no monorepo-exclusion bullet exists (already retired), untouched.
  Acceptance: the live Notion page 01 no longer states or implies agentsmyth is not a scaffolder; the other three bullets in the list are unchanged; Ship cites the edited page URL and the before/after bullet text as evidence.
- **R3**: Add one paragraph (README or docs site) plainly stating why there's no paid tier at launch — community-first framing, not evasive.
  Acceptance: a paragraph (not a single bullet) exists in `README.md` or a `site/*.md` file, gives an actual reason (not just "there is no paid tier"), and does not contradict the existing "Not a paywall" bullet already in `README.md`/`site/introduction.md`.

### Implicit (RI)

- **RI1**: R3's paragraph must not contradict or duplicate-with-drift the existing "Not a paywall... Community-first, by decision" bullet already present in both `README.md` and `site/introduction.md`.
  Acceptance: the new paragraph and the existing bullet tell the same story; if the bullet is superseded by the paragraph, the bullet is updated to match rather than left stale.
- **RI2**: `site/introduction.md` and every other `site/*.md` file receive zero unintended diff from this WP (Non-Goals).
  Acceptance: `git diff` shows changes only in `README.md` (repo-side) plus the cited Notion page (external); `git status` shows no modification under `site/` unless R3 is deliberately placed there instead of README, in which case only that one targeted file changes.
- **RI3**: The Notion page 01 edit (R2) touches only the one stale bullet — no other content on the page (Core Product Bets, Distribution Intent, the other three "Is Not" bullets) is altered.
  Acceptance: a before/after diff of the "What agentsmyth Is Not" section, cited in Ship, shows exactly one bullet changed.

### Assumptions (A)

- **A1**: Slug `wp-r17-readme-positioning` is used for this lifecycle chain, matching this repo's `wp-r<N>-<slug>` convention (`wp-r9a`, `wp-r9b`, `wp-r9c`, `wp-r5`, `wp-r11`, `wp-r13`).
- **A2**: `site/introduction.md`'s identical "What it refuses to be" list (including its own "Not a scaffolder" bullet) is left untouched by this WP, per WP-R11's own prior note that README/site positioning reconciliation is a separate, deferred concern. The resulting README-vs-site inconsistency on that one bullet is accepted, not a defect (repo-alignment-scan finding).
- **A3**: `CHANGELOG.md` is not touched by this WP's own Ship — confirmed by inspecting the WP-R16 and validator-false-positive-fixes merge commits, neither of which touched it. The 1.0.1 entry is the parent release plan's own acceptance item, added once all three WPs (R15/R16/R17) are on `main`.
- **A4**: R3's paragraph placement (README vs. `site/*.md`) is left to Plan/Build to decide concretely — the WP's own Notion notes say "README or site," not both, and the requirement is satisfied by either.
- **A5**: R2 (the Notion edit) is executed as a normal Build-phase step in this chain, not deferred to a separate handoff — `source-of-truth.yaml` has no configured provider gating this (Constraints), and R2 is explicit, already-approved WP scope, not a new external commitment being introduced by this brief.

### Open Questions (Q)

None recorded — all interpretive gaps this session were resolvable by evidence (see Assumptions).

## Questions For User

None outstanding. Plan may start once this brief is approved.

## Architecture Notes

- role: Architect
- decision: Scope R1 strictly to `README.md`, not `site/introduction.md`, even though the latter duplicates the same content today (A2). Rejected alternative: updating both files in this WP for consistency. Reason: WP-R17's own Notion requirement text names only "root README.md" for R1; WP-R11's brief already flagged README/site reconciliation as a deliberately separate, deferred concern — folding it in here would be undirected scope creep past what was actually approved as Ready.
- decision: R2 executes now, as part of this chain's Build phase, rather than being written up as a source-of-truth handoff. Reason: `source-of-truth.yaml` has no configured provider for this repo, so the formal handoff machinery doesn't apply; R2 is itself the explicit, already-Ready scope of the Notion work package this brief implements — there is no separate approval to seek beyond what already exists on the WP-R17 page.
- constraint: [safety-3] binds R2 — Ship must cite the real edited page and before/after text, not assert the edit happened.
- constraint: [product-2] and the parent "1.0.1 — Patch Release Work Plan" sequencing note bind this chain's timing: it must land on `main` before WP-R15's release dispatch fires (this session's Option A decision), though firing that dispatch is out of this WP's own scope.
- tradeoff: Placing R3's paragraph in README vs. the docs site (A4) — left open to Plan, since either location satisfies the WP's own acceptance criteria and the answer depends on which file Plan decides R1's rewrite naturally extends.
- assumption: A1–A5 above.
- downstream: Plan should (1) decide R3's concrete placement (README section vs. `site/introduction.md`'s existing "Not a paywall" bullet), (2) draft the exact replacement bullet text for R2 before Build touches Notion, so Build is a direct copy-paste rather than live drafting against a shared external document, (3) confirm Build's Notion edit is done via the same `notion-update-page` tool path already used and available this session, citing the resulting URL in the review/ship artifacts.

## Checkpoint Approval

- Checkpoint: brief-review
- Status: approved
- User's own words (verbatim, this turn): "Brief is approved"

## Exit Gate

- [x] Every active R and RI has acceptance criteria.
- [x] Blocking Q IDs appear in orchestration.blockers. (None recorded; none blocking.)
- [x] User approved or waiver recorded. — user approved this brief verbatim this turn.

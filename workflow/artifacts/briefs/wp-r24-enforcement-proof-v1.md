---
slug: wp-r24-enforcement-proof
version: 1
artifact: brief
status: ready-for-next-phase
created: 2026-09-16
updated: 2026-09-16
manifest_ids: [R1, R2, R3, R4, RI1, RI2, RI3, RI4, RI5, RI6, RI7]
upstream:
  - user-request
orchestration:
  phase: think
  status: ready-for-next-phase
  next_phase: plan
  blockers: []
  user_checkpoint: brief-review
council:
  mode: single-agent
  resolution:
    dispatch_enabled: optional
    council_enabled: on-for-complex
    task_class: standard
skill_trigger_log:
  - skill: repo-alignment-scan
    decision: ran
    reason: "complexity_score 55 >= threshold 40; also task_class standard != trivial. Ran: every requirement mapped to real surfaces (README.md, site/index.md, CHANGELOG.md, src/assets/hooks/pre-commit, src/workflow/skills/). Two misalignments found and recorded — RI3 (a capture taken in this repo carries a version-skew banner) and RI6 (both published skill counts are stale, and the 22 is a category mismatch rather than an error)."
  - skill: architecture-decision-advisor
    decision: ran
    reason: "new_surface true — this repo has never shipped a terminal-capture asset or a regeneration path for one. complexity_score 55 is BELOW the threshold of 60, so new_surface is load-bearing here: without it this trigger would not fire. Ran: capture-format decision recorded in Architecture Notes with two named rejected alternatives; the residual choice is escalated as Q1 because it decides whether a devDependency enters the repo."
  - skill: constraint-conflict-scan
    decision: ran
    reason: "task_class standard != trivial. Ran: all three domain.yaml constraint arrays and repo-profile.yaml paths.protected read this session. Two constraints shape the work ([safety-1]/[safety-4] on the capture's contents, [provider-neutrality-1] on naming a competitor), no blocking conflict, no protected-path match."
---

# WP-R24 — Enforcement Proof & Competitive Positioning Content - Brief

## Source Links

- Notion WP-R24 — Enforcement Proof & Competitive Positioning Content: https://app.notion.com/p/3b7972bdebbb81c394edec6286e182c2 (Status 🟡 Ready, Class Standard, Priority P2, Type Chore, Target Version relation → "1.1.0 — Minor Release Work Plan"). R1–R4 below are carried from that page's Requirements section rather than re-derived.
- Notion 1.1.0 — Minor Release Work Plan: https://app.notion.com/p/3ab972bdebbb81ef88b7f3cf7e500d79 — release-level acceptance names this package explicitly: "WP-R24's hook-refusal capture is live on the docs site home and in the README". This is the seventh and last package in the release.
- Notion 04 — Reference: https://app.notion.com/p/3ae972bdebbb8194b788cf78cd8c5700 — declares itself canonical for counts: "If a number here disagrees with a number on another page, this page is correct — fix the other page." Last reviewed 2026-07-31.
- `workflow/config/source-of-truth.yaml` declares `mode: optional` with `providers: []`. Notion is **not** a configured source of truth for this repo; the pages above are cited as the requirement's origin, not as governing authority. Repo artifacts win on conflict per root `AGENTS.md` → Source Priority.

## Problem

WP-R17 rewrote positioning onto the enforcement axis. The claim is still an assertion.

"Mechanical enforcement" reads identically to a competitor's "quality gates" until a reader sees a gate actually refuse something, and the reader's real question is whether the gate is code or prompt text. README.md's "Where it fits" section currently makes the argument in prose — "enforced outside the model — in files you can read and a validator that exits non-zero" — and then shows the reader neither the file nor the non-zero exit.

The comparison has the same shape. It names four competitors and asserts they "shape the prompt" while agentsmyth "shapes the lifecycle". That is an adjective, and an unfriendly reader dismisses it as marketing. A file path cannot be dismissed the same way.

## Goals

- Put a real, verbatim capture of the pre-commit gate refusing a commit on the two surfaces a prospective user actually reads first: the docs site home and the root README.
- Restate the Spec Kit comparison in verifiable terms — upstream file paths at a pinned reference — so each claim can be checked by a reader rather than believed.
- Name Spec Kit explicitly and generously, including where it is genuinely stronger.
- Publish a skill count that is derived from the repo and states what it counts, replacing two stale public numbers.

## Non-Goals

- Any Spec Kit interop implementation. That is WP-R25, parked post-1.1.0.
- Re-litigating WP-R17's positioning axis. This package proves that axis, it does not redefine it.
- Reconciling README's "Not a scaffolder" bullet against `site/introduction.md` — that is OI-60, tied to WP-R6, and is untouched here.
- Changing the gate's behavior, output, or exit codes. This work captures the gate; it does not modify it.
- Dispatching the 1.1.0 release. Merging this package unblocks the release; firing `release.yml` is a separate user action.

## User Impact

A reader evaluating agentsmyth against Spec Kit currently has to take the central differentiator on faith. After this change the same reader sees the gate refuse a commit in the first screen of both the site and the README, and can verify every comparative claim against a named file at a named commit in a public repo. The change is entirely on public documentation surfaces — no consumer repo behavior changes, and nothing in the shipped package changes.

## Success Metrics

- A reader can reach a hook-refusal capture without scrolling past the fold on `site/index.md` and without scrolling past the "Where it fits" section in `README.md`.
- Every comparative claim about Spec Kit resolves to `<upstream repo>/<path>` at a pinned ref that a reader can open.
- `src/workflow/skills/` is the derivation source for every published skill count, and the count states its counting rule.
- No claim about a competitor survives into the published text without a citation that was re-executed during Build.

## Requirements

Carried from the Notion WP-R24 page and expanded into R1–R4 below, with RI1–RI7 derived from repo, config, verification, release, and safety sources. The full manifest, with acceptance criteria for every active ID, is in the Requirement Manifest section below.

## Constraints

- **[safety-1] / [safety-4]** (`domain.yaml`) — the capture is terminal output taken on a developer machine. It must contain no local absolute path, no environment value, and no credential. A capture taken in this working tree today would embed `/Users/<user>/...`-shaped paths in some error modes.
- **[provider-neutrality-1]** (`domain.yaml`) — naming Spec Kit generously is required by R3 and is compatible with this constraint: the content compares tools, it does not make any provider mandatory or default.
- **CLAUDE.md rule 4 (no runtime dependencies)** — the zero-dep stack is a deliberate invariant. A capture toolchain must not add a runtime dependency; whether it may add a *devDependency* is Q1.
- **CLAUDE.md rule 1 (edit source, never generated output)** — `site/.vitepress/dist/` is a build product. Content changes land in `site/*.md` and `README.md`.
- **`verification.yaml` `generated_output.source_only_inspection_is_not_enough`** — if the capture is generated, inspecting the generator is not sufficient evidence; the generated artefact itself must be verified.
- **`release.yaml`** — `pull_request.required: false` with `create_policy: user_requested_or_configured`; `ci.provider: none`. No PR is created without the user asking.
- **`repo-profile.yaml` `branch_policy.require_non_default_branch_for_changes: true`** — satisfied: work is on `feat/wp-r24-enforcement-proof`, **stacked on `feat/wp-r20-ledger-closure` at `22412f2`** (PR #69) per the user's decision of 2026-09-16, not on `release/1.1.0` directly.

## Risks

| Risk | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|
| A capture is fabricated or drifts from real output, making the enforcement proof itself unverifiable | medium | high | RI2 requires a recorded regeneration path and a Build-phase re-run; the capture's own provenance is what this package is selling | agent |
| A Spec Kit claim is stale or subtly wrong on a public surface, handing a critic an easy correction | medium | high | RI1 pins every claim to a path at a ref and requires per-claim re-verification at Build; one claim already looks shaky (see RI1) | agent |
| The capture leaks a local path or environment value | low | high | RI3 requires capture in a scratch consumer repo, plus an explicit scan before publish | agent |
| Site home restructuring pushes the existing hero/features layout around and regresses the page | low | medium | Q2 records the placement decision; `npm run site:build` is a CI-run suite | agent |
| A devDependency enters the repo for tooling and erodes the zero-dep posture by precedent | medium | medium | Q1 is blocking precisely so this is the user's decision, not an inference | user |
| PR #69 is revised in review, forcing this branch to rebase onto the revision | medium | low | Accepted cost of the stacking decision (A2). The rebase is mechanical while this chain holds no commits, and cheap while it holds few | user |
| The script and the documented steps drift apart, leaving two disagreeing descriptions of one procedure | medium | low | RI2 acceptance (b) forbids the steps from re-deriving the procedure manually — they invoke the script and state what to check, so there is one source of truth | agent |
| This PR is opened against the wrong base, merging WP-R20's commits into `release/1.1.0` a second time or stranding them | low | medium | PR base is `feat/wp-r20-ledger-closure`, retargeted to `release/1.1.0` only once #69 merges — the exact pattern WP-R19/PR #63 used when stacked on PR #62 | user |

## Open Questions

All three questions were answered by the user on 2026-09-16 and are resolved in place below; `orchestration.blockers` is now empty. The brief remains `blocked-for-user` on the `brief-review` checkpoint alone — the questions are settled, the approval is not yet given. See `## Questions For User`.

## Requirement Manifest

### Explicit (R)

- **R1** — Terminal capture of the pre-commit hook refusing a commit because Build has no approved Plan, placed above the fold on the docs site home and in the README. The Notion page states this is an acceptance criterion, not a stretch item.
  - Acceptance: a capture of a **real** refusal appears on the site home between the hero actions and the `features` grid (via the `home-hero-actions-after` layout slot in `site/.vitepress/theme/Layout.vue`, per Q2) and in `README.md` inside the "Where it fits" argument (per A3); the captured text is byte-identical on both surfaces and to output produced by running the gate, and the command that produces it is recorded alongside.
- **R2** — Comparison content stated with file paths, not adjectives. Verified 2026-09-16 at `github/spec-kit@1d5106f`; all four claims hold, two require re-wording (see RI1 for evidence and exact quotes):
  1. `scripts/bash/check-prerequisites.sh` gates on **existence only** — `[[ -f ]]`, `[[ -d ]]`, `ls -A` — and never opens the artifacts it gates on. **Re-word**: the script does read content on one path (`--template NAME` → `resolve_template_content`), so "never opens a file" unqualified is false; "never opens the artifacts it gates on" is exact.
  2. `templates/commands/analyze.md` is declared **STRICTLY READ-ONLY** and recommends rather than edits.
  3. `templates/commands/implement.md`'s checklist gate is a literal yes/no prompt the user can override.
  4. No **git** hook is installed into a consumer repo. **Re-word required**: Spec Kit does install things called hooks (see RI1.4); the distinction is git-enforced vs agent-dispatched, and the claim is indefensible unless it says so.
  - Acceptance: every published claim carries its upstream path and the pinned SHA; the two re-wordings above are applied; no claim is published in the Notion page's original phrasing where verification showed that phrasing to be imprecise.
- **R3** — Name Spec Kit explicitly and generously; its Think-phase requirements engineering is deeper, and the content says so.
  - Acceptance: the published comparison contains at least one concrete, non-grudging statement of where Spec Kit is stronger, naming the capability rather than gesturing at it.
- **R4** — Publish a current, self-describing skill count. Re-scoped 2026-09-16 on evidence: the Notion page frames this as "one is wrong on a public surface", and verification showed neither number was wrong in its own context (see Q3 and RI6). The work is to state the current count and its counting rule where none is stated, not to correct a falsehood.
  - Acceptance: (a) the **1.1.0** CHANGELOG entry states the current count with its counting rule; (b) the `## [1.0.0]` entry is **not** edited — it was accurate on 2026-07-23 and a Keep-a-Changelog entry is a historical record, not a live figure; (c) Notion 04 — Reference, which declares itself canonical and is stale at 34 (last reviewed 2026-07-31), is updated from the Build-evidenced derivation per Q3; (d) the derivation runs against `src/workflow/skills/` at Build rather than reusing this brief's numbers; (e) the unlocated SPEC.md is filed as an open item, not silently dropped.

### Implicit (RI)

- **RI1** (verification / compatibility) — **SATISFIED AT THINK 2026-09-16.** Claims about an external repository need a pinned citation, because `main` moves. All four were verified by direct file read against `github/spec-kit` at SHA `1d5106f59e1b148ee23ab136638932dd790ff1b6`:
  - **RI1.1 — `scripts/bash/check-prerequisites.sh` — claim holds, phrasing does not.** Every validation is an existence test: `[[ ! -d "$FEATURE_DIR" ]]`, `[[ ! -f "$IMPL_PLAN" ]]`, `[[ ! -f "$FEATURE_SPEC" ]]`, `[[ ! -f "$TASKS" ]]`, and `[[ -f ... ]]` / `ls -A` for the optional-docs list. It never reads the contents of the artifacts it gates on. One counter-path exists: `--template NAME` calls `resolve_template_content` and emits `TEMPLATE_CONTENT`, which does read a file — template resolution, not artifact validation.
  - **RI1.2 — `templates/commands/analyze.md` — claim holds, strongly.** Frontmatter: "Perform a **non-destructive** cross-artifact consistency and quality analysis". Operating Constraints: "**STRICTLY READ-ONLY**: Do **not** modify any files." Step 8: "Ask the user … (Do NOT apply them automatically.)" Analysis Guidelines: "**NEVER modify files**". This is the best-evidenced of the four.
  - **RI1.3 — `templates/commands/implement.md` — claim holds verbatim.** Outline step 2: "Treat checklist markers as a **read-only gate**"; on unchecked items, "**STOP** and ask: 'Some checklists have unchecked items. Do you want to proceed with implementation anyway? (yes/no)'" and "If user says 'yes' or 'proceed' or 'continue', proceed to step 3." This also resolves the tension recorded when the brief was drafted: the checkbox *reading* belongs to `implement`, not to `check-prerequisites.sh`, so RI1.1's premise survives intact.
  - **RI1.4 — "no git hook" — claim holds, phrasing is a liability.** A repo-wide code search for `"pre-commit"` or `".git/hooks"` returns **zero** results, so no git hook is installed. But Spec Kit installs agent-level event hooks into consumer repos (`.cursor/hooks.json`, `.devin/hooks.v1.json`, `.vibe/hooks.toml` per `src/specify_cli/integrations/*`) and reads an extension-hook system from `.specify/extensions.yml` (`hooks.before_analyze`, `hooks.before_implement`, `hooks.after_implement`). Publishing "no hooks" invites a one-screenshot rebuttal.
  - Acceptance: satisfied — each claim is recorded above with its path and pinned SHA. Build's remaining obligation is narrowed to citing this SHA accurately and applying R2's two re-wordings; it does not re-derive the verdicts.
- **RI2** (generated output) — The capture is generated output. `repo-profile.yaml` `generated_output_policy` requires source mapping and a regeneration method, and `verification.yaml` sets `generated_output.source_only_inspection_is_not_enough`. Per Q1's resolved residue the regeneration path is **both** an executable script under `scripts/` and documented steps.
  - Acceptance: (a) a script under `scripts/` regenerates the capture from a real gate refusal in a scratch repo under `sandbox_root`, and running it twice produces identical output; (b) documented steps accompany it and describe *invoking that script and what to verify*, never a parallel manual procedure — one source of truth, two presentations; (c) Test verifies the **published block** in `README.md` and `site/index.md`, not only the script, per `source_only_inspection_is_not_enough`.
- **RI3** (safety / capture hygiene) — Trial evidence, this session: running `node bin/agentsmyth.mjs check --phase build --slug wp-r24-enforcement-proof` in this working tree produced the intended refusal (`no "plans" artifact found for slug … the upstream phase must complete before build can begin`, exit 1) — but preceded by a six-line version-skew warning (`repo-profile.yaml was written by v1.0.0, CLI is v1.0.1`) and an `adapters present:` line. A capture taken here would publish that noise as if it were the product's normal output.
  - Acceptance: the capture is taken in a clean scratch consumer repo outside this working tree; the published text contains no local absolute path, no environment value, and no version-skew banner unrelated to the demonstration.
- **RI4** (docs parity) — README and the site are two surfaces that have drifted before (OI-60 records an existing README ↔ `site/introduction.md` duplicate). `site/public/` already carries a `logo-light.svg` / `logo-dark.svg` pair, so the site has an established light/dark convention any visual asset inherits.
  - Acceptance: the same capture content and the same comparative claims land on both surfaces in one change. Because Q2 places the site copy in a Vue slot rather than in `index.md`, the capture text necessarily exists twice — so the RI2 script writes **both** copies between markers in one run, and Test asserts the two blocks are byte-identical. Hand-editing either copy is out of contract. The marker convention follows WP-R23's shipped `<!-- agentsmyth:<version> BEGIN/END -->` pattern rather than a new one.
- **RI5** (repo invariant) — CLAUDE.md rule 4 forbids runtime dependencies, and rule 2 requires `npm run build` after any `src/workflow/`, `src/setup/`, or `src/adapters/` change.
  - Acceptance: `package.json` `dependencies` is unchanged; if the chain touches `src/`, the build is re-run and the rebuild is evidenced.
- **RI6** (repo evidence, supersedes the page's framing of R4) — Derived this session: `src/workflow/skills/` holds **35** directories = 7 lifecycle phase skills + 28 power skills. Notion 04 — Reference, the self-declared canonical page, records **34 total** as 7 phase + 4 original power + 22 WP-R4 power + 1 setup skill (the setup skill lives in `src/setup/`, outside `skills/`). Under that same convention the repo today totals **36** — the delta is `think-council` and `review-council`, added by WP-R21 and WP-R22. The "twenty-two" the WP page attributes to SPEC.md matches the WP-R4 power-skill row exactly, so the likeliest reading is a **category mismatch, not an error**: one number counts a subset, the other counts a total. SPEC.md itself could not be located in this repo or in Notion this session.
  - Acceptance: the published fix states the counting rule alongside the number; Notion 04 — Reference is updated from the Build-evidenced derivation (Q3); the `## [1.0.0]` CHANGELOG entry is left intact as a historical record; and the finding that 22 and 34 were both correct in context — a subset count and a point-in-time total — is stated in the chain's record rather than left as an implied error.
- **RI7** (release) — 1.1.0 is gated on this package. `docs/release-checklist.md` requires the CHANGELOG entry for the version being released to be committed **before** dispatch, and forbids pre-bumping `package.json`.
  - Acceptance: the 1.1.0 CHANGELOG entry gains this change; the entry's date is not edited to a guess (it currently carries the placeholder 2026-09-08 and is corrected at dispatch time); `package.json` is not bumped; Ship reports what remains between this merge and a dispatchable release rather than declaring the release closed.

### Assumptions (A)

- **A1** — ~~The four Spec Kit claims are hypotheses to verify, not facts to publish.~~ **CLOSED 2026-09-16 — verified during Think at the user's instruction, against `github/spec-kit` at pinned SHA `1d5106f59e1b148ee23ab136638932dd790ff1b6` (default branch head, 2026-09-15).** All four claims survive; two need re-wording before publication. Per-claim verdicts are in RI1. The assumption is retired: R2 now names verified facts with citations, not hypotheses.
- **A2** — ~~Branching from `origin/release/1.1.0` (`c54d719`) rather than stacking on the unmerged WP-R20 branch is correct.~~ **SUPERSEDED BY USER DECISION 2026-09-16: stack on PR #69.** The branch was fast-forwarded onto `feat/wp-r20-ledger-closure` at `22412f2`; `git merge-base --is-ancestor` confirms the R20 tip is contained in HEAD. The assumption is retired rather than deleted because its reasoning still holds — the file sets *are* disjoint apart from `CHANGELOG.md` — the user simply chose to absorb the ordering cost here rather than leave it for PR #69. Three consequences now hold instead:
  - The `CHANGELOG.md` 1.1.0 entry is edited on a base that already contains WP-R20's edit to the same entry, so the conflict is resolved at authoring time rather than at merge.
  - This chain inherits WP-R20's **two-file ledger contract** — `open-items.yaml` plus `open-items-archive.yaml`, guarded by `check-open-items` — which binds Reflect when it files follow-ups, and binds any step that searches for an existing `OI-N`.
  - If PR #69 is revised in review, this branch rebases onto the revision. That cost is accepted as part of the stacking decision.
- **A3** — "Above the fold" for the README means within the first screen of the enforcement argument rather than above the project title and badges. **CONFIRMED BY THE USER 2026-09-16: inside the argument.** The capture lands in or adjacent to README's "Where it fits" section as the proof of the claim the reader has just read, not as a cold open above the project title and badges. The site half was settled structurally by Q2 (after the hero `actions`, above `features`), so both surfaces now have an explicit placement and neither rests on inference.

### Open Questions (Q)

- **Q1** — Capture format, and whether a devDependency may enter the repo to produce it.
  - Owner: user. Blocking: yes.
  - **ANSWERED 2026-09-16 by the user: fenced code block carrying a real, verbatim transcript, produced by a recorded regeneration procedure. No new dependency of any kind.** The recommendation was taken. Consequence: `package.json` is untouched in this chain, and the capture is reviewable as text in the diff.
  - **RESIDUE RESOLVED 2026-09-16 by the user: BOTH a script and documented steps.** The regeneration path ships as an executable script under `scripts/`, and as human-readable steps alongside it. The scratch repo it runs against lives under the already-declared `tuning.council.sandbox_root` (`~/.agentsmyth/sandbox/agentsmyth`), which `repo-profile.yaml` places outside every repository by construction — satisfying RI3 without inventing a new location. Guard attached at RI2: the steps must document *how to run the script and what to check*, not a parallel manual re-derivation, or the repo acquires two descriptions of one procedure that can silently disagree.
- **Q2** — Placement of the capture on `site/index.md`, which uses VitePress `layout: home` with a `hero` block and a four-item `features` array before any prose.
  - Owner: user. Blocking: no.
  - **ANSWERED 2026-09-16 by the user: immediately after the hero `actions`, above the `features` array.** The recommendation was taken.
  - **RESIDUE RESOLVED 2026-09-16 — placement held, at no structural cost.** The brief originally predicted this would force `site/index.md` out of pure-frontmatter form, and offered the user a choice between restructuring the home page or accepting lower placement. That prediction was wrong, and the correction is recorded rather than quietly dropped: it holds for plain markdown, which VitePress renders *after* the whole hero-plus-features unit, but the default theme exposes layout slots that bypass it. Verified against the installed package (`node_modules/vitepress/dist/client/theme-default/`): `home-hero-actions-after`, `home-features-before`, `home-hero-after` and six others exist. `home-hero-actions-after` is literally the position the user chose. This repo's `site/.vitepress/theme/Layout.vue` already wraps `DefaultTheme.Layout` and already uses one slot (`#layout-top` for `ForgeBackground`), so adding a second is additive — frontmatter, the `features` array, and the existing prose block are all untouched.
  - Consequence: the site-side capture lives in a **Vue slot, not in `index.md` markdown**, so the same capture text exists on two surfaces (README and the site component). RI4 now requires the regeneration script to write both, between markers — reusing the marker-block convention WP-R23 shipped rather than inventing a second one. `npm run site:build` becomes a load-bearing check for this chain rather than a formality.
- **Q3** — Scope of the R4 fix on non-repo surfaces: Notion 04 — Reference and the unlocated SPEC.md.
  - Owner: user. Blocking: no.
  - **ANSWERED 2026-09-16 by the user: update Notion 04 — Reference as part of this chain, in addition to the repo surfaces.** The recommendation was NOT taken — the user chose the wider scope, which is theirs to choose. Consequence: the chain now performs an external write to a page that declares itself canonical, so that write is an owned, evidenced action (see Architecture Notes → downstream — Build) rather than a side effect. SPEC.md remains unlocated.
  - **RESIDUE RESOLVED 2026-09-16 — SPEC.md is abandoned as a target, and the premise behind it is retired.** Origin of the reference, for the record: the Notion WP-R24 page's own Requirements section — "Fix the skill-count discrepancy: SPEC.md states twenty-two, CHANGELOG 1.0.0 states thirty-four. One is wrong on a public surface." No `SPEC.md` exists in this repository, and a Notion search did not surface one. The user has no recollection of it and instructed the chain to act accordingly, so R4 closes against the surfaces that demonstrably exist and the dead reference is filed as an open item at Reflect rather than chased.
  - **The page's premise — "one is wrong" — is itself false, which changes what R4 fixes.** Verified this session: the `34 skills` claim sits at `CHANGELOG.md` line 136, inside the **`## [1.0.0] - 2026-07-23`** entry, and 34 was *correct* on that date under 04 — Reference's counting rule (7 phase + 4 original power + 22 WP-R4 + 1 setup). `think-council` and `review-council` did not exist until 1.1.0 (PRs #64, #65). And 22 is exactly the WP-R4 power-skill row on 04 — Reference, i.e. a subset count, not a competing total. Neither published number was an error; they counted different things at different times. The real defect is that **no surface states the current count together with its counting rule**, which is a gap to fill rather than a mistake to correct.

### Requirement Classification

Written at stage 2, before research. Single-agent mode, so `## Council Log` is omitted; this sub-section is retained because the Think Exit Gate requires a classification entry for every active R and RI regardless of mode (the contract gap is recorded as OI-94).

| Manifest ID | Question bucket | Evidence classes |
|---|---|---|
| R1, RI2, RI3 | What does the gate actually print when it refuses, and can that be captured cleanly and repeatably? | trial, repo |
| R2, R3, RI1 | What does Spec Kit actually do, at which file, and at which ref? | web, repo |
| R4, RI6 | How many skills ship, under which counting rule, and which public surfaces state a number? | repo, web |
| RI4 | Where do README and the site state this argument today, and what asset conventions already exist? | repo |
| RI5 | What invariants does this repo hold about dependencies and rebuilds? | repo |
| RI7 | What does the release checklist require of a CHANGELOG entry before dispatch? | repo |

## Questions For User

**Q1 — Capture format. BLOCKING. ANSWERED — fenced code block, real transcript, no new dependency.**

The capture has to be simultaneously convincing and *checkable* — a demo that a skeptic can dismiss as fabricated does not solve the problem WP-R24 exists to solve.

- **Recommendation: a real captured transcript published as a fenced code block on both surfaces, produced by a recorded regeneration procedure, with no new dependency of any kind.** GitHub and VitePress both render fenced blocks natively in light and dark, the text is diffable in review, a reader can copy the command and reproduce the refusal themselves, and it satisfies RI2 without new tooling.
- Rejected alternative: an animated SVG via asciinema plus `svg-term-cli`. It looks better and proves less — it adds a devDependency (Q1's real cost), produces a binary-ish asset nobody reviews line by line, and makes the "is this real?" question *harder* to answer, not easier.
- Rejected alternative: a PNG screenshot. Same provenance problem, plus no light/dark story and no accessible text.
- Evidence: RI3 (trial — the real refusal and its exit code, run this session), RI4 (repo — the existing `logo-light.svg`/`logo-dark.svg` theme convention), RI5 (repo — CLAUDE.md rule 4).
- Blocking because it decides whether a devDependency enters the repo, and because Build produces a materially different artefact under each answer.

**Q2 — Site home placement. Non-blocking. ANSWERED — after the hero `actions`, above `features`.**

- **Recommendation: place the capture immediately after the hero `actions` and before the `features` array**, which requires converting the top of `site/index.md` from pure frontmatter into frontmatter plus a leading content block. The four-item features grid otherwise pushes any prose below the fold, which would fail R1 on the exact surface the release-level acceptance names.
- Alternative, if you prefer not to restructure the home layout: place it at the top of the existing `<div class="vp-doc">` prose block, accepting that it sits below the features grid.
- Evidence: RI4 (repo — `site/index.md` structure read this session).

**Q3 — R4's reach beyond the repo. Non-blocking. ANSWERED — the repo surfaces AND Notion 04 — Reference.** (bucket R4, RI6)

- **Recommendation: fix the repo surfaces in this chain (derive the count, state the counting rule, update CHANGELOG and any README/site statement), and hand you the Notion 04 — Reference update with the derived figures rather than editing it as part of Build.** That page declares itself canonical, so it should change deliberately, and `source-of-truth.yaml` gives Notion no authority here anyway.
- Note the finding first: the "22 vs 34" on the WP page is most likely **not** one number being wrong. 22 is exactly 04 — Reference's WP-R4 power-skill row; 34 is its total as of 1.0.0. Today the same convention gives 36, and `src/workflow/skills/` on disk holds 35. If you already know what SPEC.md is and where it lives, say so — I could not find it in this repo or in Notion this session.
- Evidence: RI6 (repo — directory count derived this session; web — Notion 04 — Reference fetched this session).

## Architecture Notes

- role: Architect
- **decision (architecture-decision-advisor, triggered on `new_surface`)**: the enforcement proof is published as **verifiable text with a recorded regeneration path**, not as a rendered media asset. The named rejected alternatives are the asciinema/`svg-term-cli` animated SVG and a PNG screenshot; both were rejected on the same rationale, which is that this package's product is *credibility*, and a media asset moves the reader's question from "does the gate refuse?" to "did they stage this?". Text a reader can re-run answers both. Secondary rationale: RI5's zero-dependency invariant, and RI4's two-theme requirement, are satisfied for free by text and cost effort for every media format. This decision is recorded here as the ADA output and simultaneously escalated as Q1, because it is the user who owns whether a devDependency is acceptable.
- **constraint**: the gate must not be modified to make the demo prettier. The capture's value is that it is the real output of the shipped hook; any edit to `src/assets/hooks/pre-commit` for presentation reasons would invert the package's purpose. Recorded as an explicit non-goal.
- **constraint**: `source-of-truth.yaml` `mode: optional`, `providers: []` — Notion holds no authority over this chain. The WP-R24 page is the requirement's origin; where it conflicts with the repo, the repo wins, which is exactly what RI6 acts on.
- **tradeoff**: text over motion trades visual appeal for provability. Accepted deliberately. If the user answers Q1 in favour of an animated capture, RI2's regeneration requirement becomes materially harder to satisfy, not easier, and Plan must carry that cost explicitly.
- **assumption Plan must preserve**: A1 — every Spec Kit claim is a hypothesis until re-verified at a pinned ref. Plan must not schedule the comparison copy as a writing task with the claims treated as settled inputs.
- **decision (Q1 answered, 2026-09-16)**: the ADA recommendation stands as the user's decision — verifiable text, no new dependency. `package.json` is out of scope for this chain, which also removes CLAUDE.md rule 2's rebuild obligation unless Plan finds a reason to touch `src/`.
- **decision (Q3 answered, 2026-09-16)**: the chain writes to Notion 04 — Reference. This is an external write to a page that declares itself canonical for counts, so it is performed once the derived figures are evidenced in the task artifact, never from the brief's own numbers. `source-of-truth.yaml` gives Notion no authority over the repo; this write is the user's explicit instruction, recorded here so it is auditable rather than inferred.
- **downstream — Build**: the Notion 04 — Reference update carries the derived counts and the counting rule, and its evidence is the same directory derivation R4 publishes. If the derivation and the page disagree at Build time, the repo wins and the page is corrected — that is the direction this package exists to enforce.
- **decision (A1 verification, 2026-09-16)**: the comparison is re-framed around **git-enforced versus agent-dispatched**, not "hooks versus no hooks". RI1.4 showed the original framing is factually defensible and rhetorically fragile; the verified evidence supplies a stronger line. Spec Kit's strongest enforcement language is an instruction to a model — `implement.md`: "**STOP** and ask … (yes/no)", and "you MUST actually invoke the hook" — which holds exactly as well as the model's compliance. agentsmyth's gate is `.git/hooks/pre-commit`, which git runs whether or not the agent cooperates. That contrast is sharper than the original claim and rests entirely on quotes from their own files.
- **decision (R3 evidence, 2026-09-16)**: R3's "generous" statement now has a concrete subject rather than a gesture. `analyze.md` carries severity heuristics, a requirements-to-task coverage map, duplication and ambiguity detection, and constitution-alignment checks — genuinely deeper artifact analysis than anything agentsmyth performs at Think. Naming that specifically is both more honest and more persuasive than conceding depth in the abstract.
- **downstream — Plan**: the Touches list must name `README.md`, `site/.vitepress/theme/Layout.vue` (the `home-hero-actions-after` slot — **not** `site/index.md`, which Q2's resolution leaves untouched), `CHANGELOG.md`, and the capture's regeneration script plus its documented steps; whether `src/` is touched at all depends on Q1, and if it is, CLAUDE.md rule 2 forces a rebuild into the chain.
- **downstream — Test**: `verification.yaml` makes `npm run validate` and `npm run violations:test` required at review and ship. `npm run site:build` is CI-run and is the check that catches a broken home-layout edit. The generated-output rule means the published capture is verified directly, not via its generator.
- **downstream — Reflect**: two follow-ups are owed to the ledger, under the two-file contract this branch inherits from WP-R20 (search `open-items.yaml` *and* `open-items-archive.yaml` before allocating an `OI-N`): (1) the unlocated `SPEC.md` referenced by the Notion WP-R24 page, so a future reader does not re-derive the same dead end; (2) the fact that 04 — Reference goes stale on counts by construction — it is hand-maintained, declares itself canonical, and nothing derives it from `src/workflow/skills/`.
- **downstream — Ship**: this branch is **stacked on PR #69**, so its own PR opens against `feat/wp-r20-ledger-closure` and is retargeted to `release/1.1.0` only after #69 merges — the pattern WP-R19/PR #63 followed when stacked on PR #62. Opening it against `release/1.1.0` while #69 is unmerged would present WP-R20's commits as part of this package. This merge makes 1.1.0 dispatchable but does not dispatch it. Ship reports what remains: #69 merged, this merged, `release/1.1.0` merged into `main`, then `release.yml` fired with `bump: minor`. Confirmed this session: zero `warn-until-1.1.0` markers exist in `src/`, so the checklist's marker-stripping step is a no-op for this release.

## Checkpoint Approval

- Checkpoint: brief-review
- Status: approved
- User's own words (verbatim, this turn): "Continue to plan"
- Approved: 2026-09-16, following an item-by-item review of this brief's own content at the user's
  request. The user worked through all three assumptions and all three questions and answered each
  before directing the chain forward, so the approval responds to this artifact rather than being
  inferred from silence or carried over from an earlier phase. Several of those answers changed the
  artifact — A1's verification, A2's rebase, R4's re-scoping and the Touches correction under Q2 —
  and this approval covers the brief as it stands after those edits.
- Decisions recorded during that review, each carried into the manifest above: verify the Spec Kit claims during Think rather than at Build (A1); stack on PR #69 (A2); place the README capture inside the enforcement argument (A3); ship both a script and documented steps (Q1 residue); hold the site placement (Q2 residue); abandon SPEC.md and act on the surfaces that exist (Q3 residue).

## Exit Gate

- [x] Every active R and RI has acceptance criteria — 4 R, 7 RI, 11 rows.
- [x] Blocking Q IDs appear in orchestration.blockers — Q1.
- [x] User approved or waiver recorded — approved 2026-09-16, verbatim words recorded in `## Checkpoint Approval`.
- [x] `skill_trigger_log` records all three mandated skills with decision and reason.
- [x] Every active R and RI has a Requirement Classification entry naming at least one evidence class.
- [x] Every surviving Q carries a recommendation resting on non-`recall` evidence; Q3, whose recommendation is not repo-settled, names its bucket.
- [x] Single-agent mode recorded in frontmatter `council.mode`; `## Council Log` omitted per the output schema.

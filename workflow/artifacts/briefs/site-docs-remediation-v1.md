---
slug: site-docs-remediation
version: 1
artifact: brief
status: ready-for-next-phase
created: 2026-07-26
updated: 2026-07-26
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, R8, R9, RI1]
upstream:
  - user-request
  - "notion - Site Docs Remediation Backlog (audit 2026-07-26)"
orchestration:
  phase: think
  status: ready-for-next-phase
  next_phase: plan
  blockers: []
  user_checkpoint: brief-review
skill_trigger_log:
  - skill: repo-alignment-scan
    decision: ran
    reason: grepped bin/agentsmyth.mjs and src/setup/SKILL.md directly to ground-truth D-1 and D-2 rather than trusting either doc's prose
  - skill: architecture-decision-advisor
    decision: skipped
    reason: no architectural decision in scope — this is a content-correctness fix, no code paths change
  - skill: constraint-conflict-scan
    decision: ran
    reason: checked the Notion page's "Do not touch" list against the target sections to make sure none of the flagged edits overlap protected prose
---

# Site docs remediation (Tier 1) - Brief

## Source Links

- Notion: "Site Docs Remediation Backlog (audit 2026-07-26)" — a content audit of the live VitePress site and repo README, done 2026-07-26.
- `bin/agentsmyth.mjs` (ground truth for D-1: repo-root writes, and D-2: pre-commit hook installation).
- `src/setup/SKILL.md` Step 5e (ground truth: hook is already mandatory in the source skill; the site's setup page is what's stale).

## Problem

A content audit of the live docs site and README found nine correctness defects: two are contradictions between pages that assert opposite facts about how `init` behaves, and seven are factual drift (stale counts, stale paths, mismatched descriptions) between the README, the docs site, and the actual shipped behavior in `bin/agentsmyth.mjs` and `src/adapters/`. Each defect ships confusing or actively wrong instructions to a real installer reading these pages.

## Goals

- Resolve the two BLOCKED decisions (D-1: does `init` write to the repo root; D-2: is the pre-commit hook mandatory) against actual source behavior, not by guessing.
- Fix all nine Tier 1 correctness defects (T-D1 through T-D8, T-D18) so no two pages in `site/` or `README.md` assert contradictory facts about the same behavior.
- Each fix is a targeted edit anchored on an exact string named in the audit, verified by the audit's own grep-based verification step.

## Non-Goals

- Tier 2 (T-D9 through T-D12: new Uninstall, Troubleshooting, Updating pages, and a footer/LICENSE/CHANGELOG link) is out of scope for this brief — genuinely new content, not a correctness fix, and belongs in its own brief.
- Tier 3 (T-D13 through T-D17: README restructure, sweeping four unreviewed pages, `/in-action` disclaimer placement, per-page meta descriptions, conceptual diagrams) is out of scope for the same reason — positioning and polish work, not anchored corrections.
- No change to `src/workflow/`, `src/setup/`, `agent-behavior.yaml`, or any compiled `dist/` bundle. `src/setup/SKILL.md` already has the correct (mandatory-hook) behavior; only the doc site's prose is stale.

## User Impact

A person following the site's install or setup instructions today will hit two directly contradictory claims about whether `init` touches their repo root, and a stale "opt-in" framing for a hook that is actually installed unconditionally. Both erode trust in the rest of the docs the moment either is noticed.

## Success Metrics

- Every Tier 1 grep-based verification (as specified per task in the Notion backlog) passes.
- `npm run build` and `npm run site:build` still pass after the edits (no accidental markdown/frontmatter breakage).

## Requirements

Every anchor below was located by grep and read in context before being written up here — none are assumed from the audit's prose alone.

- **R1**: `site/install.md:43` reads: "The command never writes to your repo root directly, so a collision with an existing `AGENTS.md` or `workflow/` is impossible until the agent makes deliberate, file-by-file decisions later." This directly contradicts `README.md:118-131` ("What `init` does"), which the code confirms is the accurate version — `init` writes `workflow/config/*.yaml`, `workflow/artifacts/` (7 dirs), `workflow/learnings/`, and, deterministically, `.cursor/rules/agentsmyth.mdc` / `.github/copilot-instructions.md`, all gated by `existsSync` skip-if-exists (`bin/agentsmyth.mjs:687-698`). Fix: delete the false sentence, replace with the correctly scoped promise ("never overwrites an existing file at any path it touches"), and add a short list of the actual repo-root writes to `site/install.md`'s "What init actually does" section, mirroring README's already-correct list.
- **R2**: `site/setup.md:53-54` has a `::: tip One last, opt-in offer` callout: "the agent asks once whether you want a pre-commit hook... Say no and it is skipped without comment." This is stale. `README.md:138-149` ("Mandatory local lifecycle gate") already correctly describes it as automatic, no opt-in, `--no-verify` the only bypass — confirmed against `bin/agentsmyth.mjs`'s `installPreCommitHook()` (called unconditionally during `init`, no prompt) and `src/setup/SKILL.md:297-306` (Step 5e, already says "already installed... nothing to do here, no opt-in question to ask"). Fix: delete the `site/setup.md` callout, replace with a short note pointing at `init`'s mandatory install (matching Step 5e's own framing), and add a one-line hook mention to `site/install.md`'s "What init actually does" section since that's where the rest of `init`'s mechanical behavior is documented.
- **R3**: `README.md:66` — the descriptive sentence directly below the `### Config Files` heading (line 64) — reads "Six YAML files in `workflow/config/`..." and the table at `README.md:68-75` includes an `agent-behavior.yaml` row. This contradicts `README.md:120` ("Writes all five `workflow/config/*.yaml` files"), which is already correct — the drift is only in this sentence and table, not the actual `### Config Files` heading text itself, which never said a number. Fix: change "Six" to "Five" in that sentence, delete the `agent-behavior.yaml` table row, and add the sentence (matching `site/setup.md:34`'s already-correct framing): "`agent-behavior.yaml` lives in the shared definitions tree at `~/.agentsmyth/workflow/`, is identical for every repo, and is never written by setup or edited by consumers."
- **R4**: `site/setup.md:23` prose already says "five YAML configs," but the table at `site/setup.md:25-32` has 6 rows, including `agent-behavior.yaml` (row 32). The explanatory paragraph at `site/setup.md:34` is already correct and already reads as standalone prose below the table. Fix: delete just the `agent-behavior.yaml` table row; leave line 34 untouched.
- **R5**: `README.md:61` (adapter table) says `.cursor/rules/index.mdc`; `README.md:126` (What init does) says `.cursor/rules/agentsmyth.mdc`. Ground truth confirmed in `bin/agentsmyth.mjs:686`: the actual write destination is `join(repoDir, '.cursor', 'rules', 'agentsmyth.mdc')` — `index.mdc` is only the *source template's* filename inside `src/adapters/cursor/rules/index.mdc`, not the path it lands at in a consumer repo. Fix: change `README.md:61`'s table cell to `.cursor/rules/agentsmyth.mdc`. (`site/under-hood.md:49` has the same stale value but is explicitly out of scope — one of the four pages T-D14 sweeps, not this brief.)
- **R6**: `README.md:59` ties `AGENTS.md` to Codex only in the adapter table. `site/setup.md:50` says, with no tool qualifier: "No existing `AGENTS.md`? It writes one. Already have one? It appends the agentsmyth section under its own heading and never overwrites yours" — reading as if every tool uses this file. Ground truth (`bin/agentsmyth.mjs:795-803`, global-gate code): `AGENTS.md` is Codex-specific (`~/.codex/AGENTS.md`); no other tool's adapter is named `AGENTS.md` anywhere in `bin/agentsmyth.mjs` or `src/adapters/`. Fix: reword `site/setup.md:50` to scope it explicitly to Codex, e.g. "Using Codex? No existing `AGENTS.md`?..." so it reads as one tool's case within Phase 5's per-tool adapter placement, not a universal rule.
- **R7**: `site/install.md:39`'s table row for `workflow-bundle.md` reads "The workflow compiled into one file, used to seed local artifacts and learnings" — but `workflow/artifacts/` and `workflow/learnings/` are created directly and mechanically by `init` itself (`bin/agentsmyth.mjs:465-473`), not derived from expanding `workflow-bundle.md`. README's own bullet at `README.md:130` already has the accurate description: "the full workflow (router, lifecycle, all skills) the agent expands." Fix: replace `site/install.md:39`'s cell with wording matching README's version.
- **R8**: `site/validators.md:11` says "Both must exit clean before setup can finish" naming only `check-setup-complete` and `check-config` (lines 15-16) as the setup gate — this part is actually already accurate (`site/setup.md:36-43`'s "Phase 4: Verify" independently confirms only these two are the hard gate). The real drift is against `README.md:189-193`, which lists a third command, `check-pending-setup.mjs`, under "Post-setup validation" with the comment `# shows any open items` — i.e. advisory, not blocking. `site/validators.md` doesn't mention it at all, so a reader who runs all three commands from the README and sees `validators.md` only ever discuss two has no way to know the third is intentionally non-blocking rather than missing from the page. Fix: add a `check-pending-setup` row to `site/validators.md`'s setup-validators table, explicitly marked as advisory/non-blocking (surfaces remaining open items, does not fail setup), leaving "Both must exit clean" scoped to the other two as-is. Do not add a hard count of the 22 lifecycle validators — the existing unnumbered "guard, broadly" framing for that section stays.
- **R9** (T-D18): `site/public/logo.svg` (a copy of `assets/brand/mark-auto.svg`) uses an embedded `<style>@media (prefers-color-scheme: dark)` block. VitePress renders `themeConfig.logo` as an `<img src>`, a separate document context the site's own `.dark`-class theme toggle can't reach — so the logo's ink color follows the OS setting, not the site's actual theme, and can end up near-invisible (`site/.vitepress/config.ts:10` sets `appearance: 'dark'`, so the common failure is a light-OS visitor seeing dark-on-dark). Fix: create `site/public/logo-light.svg` / `logo-dark.svg` (hardcoded ink, `#17171A` / `#F5F4F0`, no `<style>` block — same pattern already used correctly in `assets/brand/lockup-light.svg` / `lockup-dark.svg`), set `site/.vitepress/config.ts`'s `themeConfig.logo` to `{ light: '/logo-light.svg', dark: '/logo-dark.svg', alt: 'agentsmyth', width: 24, height: 24 }`, and remove the old single `logo.svg` only after confirming the favicon `head` link (`config.ts:14`) points at `favicon.svg`, not `logo.svg` (it does — no conflict).

Acceptance criteria for R1-R9 are recorded once, in the Requirement Manifest below — not restated here.

## Constraints

- Do not alter anything on the Notion page's "Do not touch" list (the two taglines, the Introduction's opening, "What it refuses to be", the vibe-coding arc, two specific quoted lines, the router classification table, and the fact that `/in-action` is labeled as fabricated).
- Anchors are exact prose fragments from the rendered site; source `.md` filenames were not given in the audit and must be found by grep.
- No CHANGELOG entry (this is docs-only, and the standing note already records `1.0.0` as launched).

## Risks

- R5/R6 ground truth is now settled by direct read of `bin/agentsmyth.mjs` (see Requirements above) — no remaining ambiguity, the fix is a plain text correction.
- T-D18's logo split touches `site/.vitepress/config.ts` and `site/public/logo.svg`, both already modified in the still-open PR #49 (base path fix + brand asset set) on branch `fix/docs-site-base-path`. This work continues on that same branch to avoid a merge conflict between the two efforts, per direction already given this session to keep site-related work on that branch.
- R5's fix is intentionally narrow (README only) — `site/under-hood.md:49` carries the same stale `.cursor/rules/index.mdc` value but is one of the four pages explicitly out of scope for this audit (T-D14 sweep). Leaving it inconsistent with README until T-D14 is a known, accepted gap for this brief, not an oversight.

## Open Questions

None blocking — D-1 and D-2 are resolved against source, see Requirement Manifest below.

## Requirement Manifest

### Explicit (R)

- **R1** (T-D1): `site/install.md:43`'s false repo-root-write claim → correctly scoped promise + repo-root write list.
  Acceptance: `grep -r "never writes to your repo root" site/ README.md` returns zero hits.
- **R2** (T-D2): `site/setup.md:53-54`'s stale opt-in hook callout → deleted, replaced with mandatory framing; `site/install.md` gets a one-line hook mention.
  Acceptance: `grep -rn "pre-commit" site/ README.md` shows one consistent (mandatory) story; zero hits for "opt-in" adjacent to "pre-commit".
- **R3** (T-D3): `README.md:66`'s "Six YAML files" sentence and its 6-row table → "Five", `agent-behavior.yaml` row dropped, shared-definitions-tree sentence added.
  Acceptance: README's Config Files section says "five"; table has exactly 5 rows.
- **R4** (T-D4): `site/setup.md:25-32`'s 6-row config table → `agent-behavior.yaml` row dropped, explanatory paragraph at line 34 left untouched.
  Acceptance: table has exactly five rows.
- **R5** (T-D5): `README.md:61`'s stale `.cursor/rules/index.mdc` → `.cursor/rules/agentsmyth.mdc`, matching the actual write path in `bin/agentsmyth.mjs:686`.
  Acceptance: `grep -n "\.cursor/rules/" README.md` returns one distinct path across both mentions.
- **R6** (T-D6): `site/setup.md:50`'s unscoped `AGENTS.md` sentence → reworded to name Codex explicitly.
  Acceptance: both README and setup page describe `AGENTS.md` as Codex-specific only.
- **R7** (T-D7): `site/install.md:39`'s wrong `workflow-bundle.md` description ("used to seed local artifacts and learnings") → replaced with README's own accurate wording ("the full workflow... the agent expands").
  Acceptance: `grep -n "seed local artifacts and learnings"` returns zero hits.
- **R8** (T-D8): `site/validators.md`'s setup-gate table (2 rows) → add a third, explicitly non-blocking `check-pending-setup` row, reconciling with README's 3-command post-setup list.
  Acceptance: `site/validators.md` names all three post-setup checks from `README.md:189-193`, with `check-pending-setup` marked non-blocking; no new hard validator count added anywhere on the page.
- **R9** (T-D18): `site/public/logo.svg`'s `prefers-color-scheme`-driven single file → split into `logo-light.svg`/`logo-dark.svg` (hardcoded ink, no `<style>` block), `config.ts`'s `themeConfig.logo` set to `{ light, dark, alt, width, height }`.
  Acceptance: `grep -r "prefers-color-scheme" site/` returns nothing; logo visible in all four OS-theme × site-theme combinations by actual rendering, not just grep.

### Implicit (RI)

- **RI1**: Every edit must not touch anything on the Notion "Do not touch" list. Acceptance: diff review confirms no touched line falls inside a "do not touch" quoted block.

### Assumptions (A)

- A1: D-1's Notion "Answer" ("Both are correct... confirm the actual functionality") is read as an instruction to ground-truth against `bin/agentsmyth.mjs` rather than a real answer in itself — confirmed by direct source read: `init` does write to the repo root (config stubs, `workflow/artifacts/`, `workflow/learnings/`, deterministic adapters, git hook), and never overwrites an existing file at any path it touches (every write site in `bin/agentsmyth.mjs` is gated by `existsSync` skip-if-exists or append-not-clobber logic).
- A2: D-2's Notion answer ("init installs it automatically now") is treated as authoritative and further confirmed by `src/setup/SKILL.md` Step 5e, which already documents this as "already installed, nothing to do here" — the site's setup page just hasn't caught up.

### Open Questions (Q)

None.

## Questions For User

None — both prior BLOCKED decisions resolved against source per Assumptions A1/A2 above.

## Architecture Notes

- role: Architect
- decision: Scope this brief to the nine Tier 1 anchor-and-verify tasks only; treat Tier 2/3 as a separate future brief.
- constraint: T-D18 continues on branch `fix/docs-site-base-path` (already open, already touches the same two files) rather than a new branch.
- tradeoff: Splitting Tier 1 vs Tier 2/3 into separate lifecycle passes means this fix ships faster and reviews cleaner, at the cost of the new-page work (Uninstall, Troubleshooting, Updating) staying undone a while longer.
- downstream: None — purely additive doc fixes, no code or schema callers affected.

## Checkpoint Approval

- Checkpoint: brief-review
- Status: approved
- User's own words (verbatim, this turn): "Yes, I approve this brief"

## Exit Gate

- [x] Every active R and RI has acceptance criteria. (R1-R9 and RI1 each carry a standalone `Acceptance:` line under Requirement Manifest.)
- [x] Blocking Q IDs appear in orchestration.blockers. (none blocking)
- [x] User approved or waiver recorded. (see Checkpoint Approval above)

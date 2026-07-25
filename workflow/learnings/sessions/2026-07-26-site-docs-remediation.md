---
slug: site-docs-remediation
version: 1
artifact: learning-session
date: 2026-07-26
source: lifecycle-reflect
upstream:
  - workflow/artifacts/reflect/site-docs-remediation-v1.md
---

# Raw Learnings - site-docs-remediation v1

## Context

Full brief→plan→task→review→verify→ship→reflect chain for a Tier 1 docs-correctness pass: nine anchored fixes across `README.md` and four `site/` pages, resolving two page-vs-page contradictions (repo-root writes, mandatory pre-commit hook) and seven cases of factual drift against `bin/agentsmyth.mjs`'s actual behavior, plus a logo theme-desync split (T-D18). Shipped as PR #51 against `main`, after a mid-Ship branch-strategy pivot when the originally-planned branch (`fix/docs-site-base-path`) turned out to have already merged via PR #49.

## Candidate Learnings

- **Candidate learning**: When a plan's Branch Strategy depends on external state that can change between phases (an open PR, a feature flag, a package version), treat Ship's step 4a (fetch + compare against remote) as mandatory to run proactively before acting on that assumption, not just as a reaction to the user mentioning a change — propose-only.
- **Candidate learning**: Run the repo's configured `npm run validate` (or equivalent) immediately after writing each lifecycle artifact, not just once during Test — this run caught two real artifact-prose issues (`check-coverage-ledger` false-positive from ambiguous wording, `check-scope-fence` phase-number format) only because validate was run proactively a phase earlier than strictly required — propose-only.

## Raw Notes

- Ground truth for every one of the nine requirements was independently re-derived from `bin/agentsmyth.mjs` and `src/adapters/` during both Review and Test, not just trusted from the brief's own citations — no discrepancies found, but the re-derivation is what makes that "no discrepancies" claim mean anything.
- R9 (logo theme split) was the one requirement Review couldn't fully close — it flagged that a live browser render across all 4 OS-theme × site-theme combinations hadn't been captured. Test closed it by reading VitePress's own `node_modules/vitepress/dist/client/theme-default/components/VPImage.vue` source directly: the light/dark toggle is scoped CSS keyed purely on `html:not(.dark) .VPImage.dark{display:none}` / `.dark .VPImage.light{display:none}` — the site's own `.dark` class, never `prefers-color-scheme`. That's stronger evidence than a screenshot because the mechanism literally has no OS-conditional branch to differ across the four combinations.
- Two validator false positives were found and fixed in this chain's own artifacts, both wording-only, not verdict changes:
  - `check-coverage-ledger`'s `droppedPattern` (`/dropped|removed from scope|out of scope/i`) matched free prose in the review's Notes column describing unrelated things (a deleted table row, a deferred separate page, a distinct favicon file) — not the manifest ID itself being dropped. Fixed by rewording those three cells.
  - `check-scope-fence`'s `activePhaseNumber()` regex (`/Phase\s+(\d+)/`) needs the literal token "Phase" immediately followed by whitespace then digits; "Phase: 5 (final)" broke on the colon. Fixed by writing "Phase: Phase 5 (final)" to match the convention already documented in the validator's own comment.
- Checkpoint-approval evidence (the `PLACEHOLDER_EVIDENCE`/length-floor check in `check-lifecycle.mjs`) rejected the brief's and plan's original "Approved" / "Continue" quotes (8 chars each) as placeholder-like, even though they were real user words. Resolved by asking the user to restate approval in a fuller sentence rather than self-authoring longer text — this preserved the "never self-author evidence" rule while still clearing the gate honestly.
- Mid-Ship, the user reported "All PRs are already merged" — read correctly as a state report requiring a decision, not an instruction, since the plan's Branch Strategy explicitly assumed `fix/docs-site-base-path`/PR #49 was still open. Verified via `git merge-base --is-ancestor da55855 origin/main` (confirmed: fully merged, zero tree drift) before asking the user to choose a new branch strategy, rather than guessing or silently proceeding on the stale assumption.
- Per explicit user choice, bundled a second, unrelated pre-existing dirty-state change (mandatory pre-commit hook install + `repo-profile.yaml` version/`definitions_root` bump — this repo's own `agentsmyth init`/`prepare` run on itself) into the same branch/PR as a separate commit, rather than discarding it or deferring it silently.

## Curator Marks

- promoted-to-curated: none
- consolidated-with: none
- rejected-as-not-general: none

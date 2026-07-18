---
slug: init-prepare-interop
version: 1
artifact: learning-session
date: 2026-07-17
source: lifecycle-reflect
upstream:
  - workflow/artifacts/reflect/init-prepare-interop-v1.md
---

# Raw Learnings - init-prepare-interop v1

## Context

Full brief → plan → build → review → verify → ship → reflect chain for WP-R7 (System-Install
↔ Per-Repo Init Interoperability). Replaced `agentsmyth init --system` with a standalone
`agentsmyth prepare` command; made bare `agentsmyth init` link to a global definitions
install by default instead of redundantly copying the full definitions tree per repo; added
a migration audit/prompt/clean path for repos that ran the old model; found and fixed a real
P1 gap during Review (adapter gate templates had no way to find `workflow/router.md` once it
stopped being expanded locally); shipped, including two direct Notion page updates.

## Candidate Learnings

- **Candidate learning**: When a Build phase changes which files a gate/entrypoint mechanism
  expands or stops expanding, Think or Plan must explicitly enumerate every *downstream
  reader* of the affected path — not just the mechanism producing/consuming it. — propose-only.
- **Candidate validator update**: `check-phase-map.mjs`/`check-scope-fence.mjs`'s manifest-ID
  extraction regex needs hardening — 3 false positives/negatives found in one chain (matched
  inside `WP-R7-T7.2`, matched inside plain prose, failed on a parenthetical qualifier).
  — propose-only.
- **Candidate learning**: a single-session, first-person "agent literally follows the written
  instruction" dry run is legitimate manual QA evidence for gate/instruction-following
  claims — worth naming as a recognized pattern in `manual-qa-policy.md`. — propose-only.

## Raw Notes

- The `AGENTSMYTH_WF=src/workflow` env var trick (documented in CLAUDE.md as pointing
  validators at source-level definitions) actually redirects *both* `defsRoot` and
  `dataRoot` in `lib.mjs`, since both derive from the same `_wf` value when no
  `definitions_root`/`AGENTSMYTH_HOME` override exists. This produced a false-positive
  `check-lifecycle --phase think: ok` early in this chain (silently checking an empty
  `src/workflow/artifacts/` instead of the real `workflow/artifacts/briefs/`). Worth a
  CLAUDE.md clarification or a `lib.mjs` warning when `AGENTSMYTH_WF` is set but no
  `--dir`/explicit data-root override accompanies it, so a future session doesn't hit the
  same silent false-positive.
- Piped stdin is not a TTY — `process.stdin.isTTY` correctly stays falsy even with
  `echo "y" | command`, so any prompt gated on `isTTY` fails closed regardless of what's
  piped in. This is good (a script can't accidentally trigger a destructive confirmation)
  but means "pipe the answer" is never a valid test strategy for a TTY-gated prompt — only a
  real terminal or a pty can exercise the accept path. Should be documented somewhere
  central (`manual-qa-policy.md` or `command-evidence-policy.md`) so a future Plan doesn't
  make the same wrong assumption about testability that this chain's Plan made.
- Review's most valuable move this chain was reading files that were *absent* from the diff
  (the 5 adapter templates + root AGENTS.md) rather than only reviewing what changed. Worth
  reinforcing in `lifecycle-review/references/role.md` or a review checklist: "for any
  mechanism whose behavior changed, explicitly list every file that reads/depends on the
  changed thing, and confirm each was either updated or is provably unaffected — don't only
  review the diff."
- The user explicitly inviting a counter-argument on a low-stakes decision (P3, the dead
  return-value question) produced a better outcome than either silently complying or
  silently overriding would have — worth remembering as a collaboration pattern the user
  seems to value: presenting a recommendation with reasoning, then letting the user decide
  whether to accept the pushback, rather than either blindly following their stated default
  or unilaterally overriding it.
- Notion source-of-truth writes: re-fetching the target page immediately before editing (to
  check for drift since the brief snapshot) and again immediately after (to confirm the edit
  landed as intended) is cheap and caught nothing wrong this time, but is exactly the kind of
  discipline that would catch a real problem next time — worth keeping as a standing habit
  for any future direct external write, not just this chain's.

## Curator Marks

- promoted-to-curated: none
- consolidated-with: none
- rejected-as-not-general: none

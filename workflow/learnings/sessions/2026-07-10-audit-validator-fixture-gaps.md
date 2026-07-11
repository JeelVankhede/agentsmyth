---
slug: audit-validator-fixture-gaps
version: 1
artifact: learning-session
date: 2026-07-10
source: lifecycle-reflect
upstream:
  - workflow/artifacts/reflect/audit-validator-fixture-gaps-v1.md
---

# Raw Learnings - audit-validator-fixture-gaps v1

## Context

Real-task checkpoint for the resolved WP-R4 spec's §8 requirement, run before Wave 2-4 design
begins. Audited `check-config.mjs`, `check-domain-placeholders.mjs`, `check-setup-complete.mjs`,
`check-pending-setup.mjs` — none were ever actually invoked by this repo's own automation, only
documented or bundled for consumer shipping. Found and fixed 3 real bugs; Wave 1's own
`check-scope-fence` caught real drift live during this chain's own Test phase.

## Candidate Learnings

- Naming a Plan-vs-execution divergence as a learning candidate does not prevent recurrence by
  itself — the same pattern (unplanned file, Plan not updated) recurred one chain later. Needs to
  become a Build-phase habit (check Changed Files against Plan Touches before claiming a phase
  done), not just a recorded intention.
- `grep`-ing for a validator's filename across `scripts/`, `package.json`, and hooks is a fast,
  reliable signal for "is this actually wired to run anywhere" — found 2 of 4 audited validators
  were effectively dead code (never invoked) in under a minute each.
- Wave 1 validators may be more valuable run manually at natural Build checkpoints than only as a
  final automated gate — the most convincing evidence this session produced (`check-scope-fence`
  catching live drift) came from exactly that kind of incidental, mid-work invocation.

## Raw Notes

- The severity asymmetry between the two confirmed validator bugs was notable: one
  (`check-domain-placeholders`) only affected this repo's own dev-workspace content (low stakes,
  never shipped); the other (`check-setup-complete`) blocks every real consumer's
  `npx agentsmyth init` completion check, and had been silently broken with nobody noticing because
  nothing ever ran it.
- Found a third bug (`\s` matching across line boundaries in the summary check) only because the
  fixture built to verify the *first* fix (missing `m` flag) was adversarial enough — a genuinely
  empty field, not just a differently-positioned one — to expose a second, independent flaw in the
  same two lines of code. A less adversarial fixture (e.g. only testing the "valid" case) would have
  shipped with the summary bug intact.
- No fixture anywhere in this codebase represents a fully-initialized consumer repo — `check-setup-complete.mjs`
  appears to have never been exercised against realistic data by anyone before this session.
- This chain's own scope drifted mid-Build (a fixture file created, Plan not updated) and was caught
  by `check-scope-fence` during Test, not during Build itself — worth noting Test caught it later
  than ideal; earlier self-checking during Build would have been better.

## Curator Marks

- promoted-to-curated: none
- consolidated-with: none
- rejected-as-not-general: none

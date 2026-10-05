---
slug: oi-35-npm-audit-rederive
version: 1
artifact: review
status: ready-for-next-phase
created: 2026-09-09
updated: 2026-09-11
manifest_ids:
  - R1
  - R3
  - RI1
  - RI2
  - RI3
  - RI4
  - RI5
upstream:
  - workflow/artifacts/briefs/oi-35-npm-audit-rederive-v1.md
  - workflow/artifacts/plans/oi-35-npm-audit-rederive-v1.md
  - workflow/artifacts/tasks/oi-35-npm-audit-rederive-v1.md
orchestration:
  phase: review
  status: ready-for-next-phase
  next_phase: test
  blockers: []
  user_checkpoint: none
council:
  mode: single-agent
---

# OI-35 npm audit Re-derivation (pre-1.1.0) - Review

## Provenance

**This artifact was written before the chain's upstream approval gates were satisfied.** The brief's
`brief-review` and the plan's `plan-review` checkpoints were both set to `none` by the agent rather
than being taken to the user — that is what allowed this phase to run without approval. Both have
since been corrected; the user reviewed and approved both artifacts on 2026-09-11.

The work and evidence recorded below were really performed and the tool output is real. The order of
events was wrong — this phase ran before the gates were satisfied — and that fact is preserved here
as a permanent record even though the gates have since been satisfied.

Tracked as `OI-92` in `workflow/artifacts/open-items.yaml`.

## Findings

- **P2 — `workflow/artifacts/open-items.yaml` / release record — IDs: R2, R3.**
  *Problem:* `OI-35`'s own text, written at the 2026-08-31 triage, says the waiver "should not be
  re-asserted verbatim at 1.1.0 Ship" and that four packages "report `fixAvailable`". After this
  chain, three of the four numbers in that description are stale in the other direction — the set is
  now 4, not 8; nothing left reports `fixAvailable`; and the fixable high (`nanoid`) is gone. If
  Phase 3 appends a resolution note without correcting the body, the entry will describe a state
  that no longer exists, which is the exact failure mode OI-35 was opened to fix.
  *Fix recommendation:* Phase 3 must make the post-fix numbers unmissable in the entry itself, not
  only in a trailing note — and the Ship waiver must name the residual four explicitly rather than
  pointing at "the OI-35 set".

- **P3 — `package-lock.json` — IDs: RI5.**
  *Problem:* The lockfile diff contains two lines that read like deliberate changes but are not:
  root `version` `1.0.0 → 1.0.1` and `engines.node` `>=18.0.0 → >=20.0.0`. Both are `npm audit fix`
  re-syncing stale mirrors of `package.json` fields. A reviewer at 1.1.0 dispatch scanning for an
  accidental pre-bump — which the release notes explicitly warn against, since `release.yml` runs
  `npm version` itself — could reasonably read the first line as exactly that mistake.
  *Fix recommendation:* No code change. Already documented in the task artifact's Implementation Log
  and carried into Ship's Risk section so the 1.1.0 dispatch is not surprised by it. `package.json`
  is byte-identical, which is the fact that settles it.

- **P3 — `package-lock.json` — IDs: R1, RI1.**
  *Problem:* `mermaid` 11.17.2 pulled in two packages that were not previously in the tree at all
  (`fastdom` 1.0.12, `strictdom` 1.0.1). New transitive packages are a supply-chain surface, and a
  vulnerability fix that quietly widens the tree deserves to be noticed rather than absorbed.
  *Fix recommendation:* No change. Verified acceptable: both are `dev: true`, both MIT, and neither
  is reachable from a published artifact (`files` in `package.json` ships only `bin/`, `dist/`,
  `src/assets/`, `validators/`, and there is no `dependencies` key at all). Recorded here so the
  widening is a decision rather than an oversight.

## Severity Summary

| Severity | Open | Found | IDs | Status |
|---|---|---|---|---|
| P0 | 0 | 0 | — | — |
| P1 | 0 | 0 | — | — |
| P2 | 0 | 1 | F1 | resolved after review — Phase 3 rewrote the `OI-35` body rather than appending, exactly as F1 directed |
| P3 | 0 | 2 | F2, F3 | both resolved in review: F2 documented, F3 verified acceptable |

## Requirement Coverage

| Manifest ID | Evidence | Status | Notes |
|---|---|---|---|
| R1 | `npm audit --json` before/after set difference: cleared `dompurify`, `mermaid`, `nanoid`, `postcss`; added none; 8 → 4 | covered | Lockfile diff independently re-read this phase; every moved entry is one of the four or a transitive consequence. |
| R2 | Residual set fixed at `esbuild`, `vite`, `vitepress`, `vitepress-plugin-mermaid`; `npm view vitepress dist-tags` → `latest: 1.6.4` | partial | The measurement and its basis are settled; the waiver text itself is Ship's to write. Not a gap — Phase 2 is downstream of this review by design. |
| R3 | `OI-35` `next_action` replaced (not appended) with the post-fix position; `resolution` added; `check-open-items.mjs` ok; `git diff --stat` = 2 insertions / 1 deletion, `OI-35` only | covered | Was `missing` when this review was written, and raised as finding F1. Phase 3 ran afterwards and closed it; this row and the Severity Summary were updated then. |
| RI1 | All 7 touched lockfile entries carry `dev: true`; no `dependencies` key in `package.json` or lockfile root; `npm audit --omit=dev` → 0 | covered | Verified at the lockfile level this phase, which is stronger than the `--omit=dev` summary alone. |
| RI2 | `site:build` exit 0; real-DOM render under correct base path → `under-hood` svg=2, `lifecycle` svg=1, 0 empty mermaid divs | covered | The pre-fix rebuild comparison is what makes this conclusive rather than merely reassuring. |
| RI3 | `validate`, `violations:test` (93/93), `conformance:test` (48/48) all exit 0 | covered | First two are `required: true` in `verification.yaml`. |
| RI4 | `git diff package.json` empty; `mermaid: ^11.16.0` admits 11.17.2; other three are transitive/undeclared | covered | Satisfied by nothing needing correction. |
| RI5 | `git diff package.json` empty; `version` still `1.0.1` | covered | The lockfile's mirrored `version` line is F2, not a violation. |
| RI6 | `release.yaml` `waivers.required_fields` read; six fields enumerated for Ship | partial | Field presence is checkable only once Ship writes the waiver; `check-waivers.mjs` runs there. |

## Architecture Notes

- role: Staff Reviewer
- decision: Accept the change as scoped. The functional surface is one lockfile, every moved entry
  traces to one of the four targeted advisories, and the one claim that could not be settled by
  build output alone (does `mermaid` still draw) was settled against a real DOM.
- constraint: Three requirements — R2, R3, RI6 — were structurally incompletable at the moment this
  review ran, because the artifacts satisfying them are written by Ship and Phase 3. They were kept
  as rows in Requirement Coverage (`partial`/`missing`, with the reason stated, rather than `covered`
  on intent) rather than quietly omitted. `check-manifest-coverage.mjs` polices the frontmatter
  `manifest_ids` list against what the task actually touched, in both directions: it first rejected
  R2/R3/RI6 as unbacked, then — once Phase 3 landed the `OI-35` edit — required R3 back. R3 is now
  declared and covered; R2 and RI6 remain Ship's to satisfy.
- downstream: Ship inherits a residual set that is now fixed and independently re-verified, so the
  waiver can be written against a measurement rather than a memory. F1 is the one open finding and
  is Phase 3's to close.

## Verification Reviewed

| Item | Outcome | Notes |
|---|---|---|
| `npm audit --json` before/after | pass | Re-derived the set difference independently this phase rather than trusting Build's summary. |
| `npm audit --omit=dev` | pass | `found 0 vulnerabilities`. |
| Lockfile diff, line by line | pass | 8 entries moved; 2 packages added; all `dev: true`, all MIT. |
| `npm view vitepress dist-tags` | pass | `latest: 1.6.4` — the no-stable-fix claim rests on this, not on the wp-r11 waiver. |
| `npm run site:build` | pass | Exit 0 before and after. |
| Real-DOM mermaid render | pass | 3 diagrams across 2 pages; false alarm from a base-path harness error correctly identified and discarded. |
| `validate` / `violations:test` / `conformance:test` | pass | Exit 0; 93/93 and 48/48. |
| Upstream artifact correction (`high: 0`) | pass | Brief and plan corrected during Build; correction logged rather than silently applied. |

## Residual Risk

- Four advisories remain open with no stable upstream fix, one of them (`vite`) `high`. Dev-only:
  `npm audit --omit=dev` is 0 and the published package has no runtime dependencies, so no consumer
  is exposed. This is the risk the Ship waiver exists to record, at its real severity.
- `vitepress` 2.x exists only as `2.0.0-alpha.20`. When it goes stable the residual set likely
  becomes fixable — the waiver's `follow_up_action` carries this revisit trigger. `OI-35` is closed
  per the user's Q1 decision (2026-09-11).
- The mermaid render check ran against the production build served locally and against the live
  published site, in one browser engine (Chromium headless shell). Cross-browser rendering is
  unverified and out of scope here; the pre-existing `OI-39` already tracks broader browser QA.

## Recommendation

pass-with-risk

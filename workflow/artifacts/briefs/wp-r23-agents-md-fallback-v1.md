---
slug: wp-r23-agents-md-fallback
version: 1
artifact: brief
status: ready-for-next-phase
created: 2026-09-13
updated: 2026-09-13
manifest_ids: [R1, R2, R3, R4, R5, R6, RI1, RI2, RI3, RI4, RI5, RI6, RI7]
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
    reason: "complexity_score 73 >= threshold 40; also new_surface true and task_class standard != trivial. Ran: mapped the requirement to real surfaces and found two misalignments (RI1, RI2)."
  - skill: architecture-decision-advisor
    decision: ran
    reason: "complexity_score 73 >= threshold 60; also touches_contract true (A1) and new_surface true. Without A1 the score is 58, below this threshold — the trigger still fires on new_surface alone, so A1 is not load-bearing for this decision. Ran: root AGENTS.md ownership decided with two named rejected alternatives — see Architecture Notes."
  - skill: constraint-conflict-scan
    decision: ran
    reason: "task_class standard != trivial. Ran: all three domain.yaml constraint arrays and repo-profile paths.protected read this session; one material constraint ([safety-2]) shapes R3/RI5, no blocking conflict, no protected-path match."
---

# WP-R23 — Generic AGENTS.md Adapter Fallback - Brief

## Source Links

- Notion WP-R23 — Generic AGENTS.md Adapter Fallback: https://app.notion.com/p/3b7972bdebbb817884cccb9fd47c4448 (Status 🟡 Ready, Class Standard, Priority P2, Target Version relation → "1.1.0 — Minor Release Work Plan")
- `workflow/config/source-of-truth.yaml` declares `mode: optional` with `providers: []`. Notion is therefore **not** a configured source of truth for this repo; the page above is cited as the requirement's origin, not as governing authority. Repo artifacts win on conflict per root `AGENTS.md` → Source Priority.

## Problem

Five adapters cover five tools (`src/adapters/{claude,codex,copilot,cursor,windsurf}`). Every other
agent that opens an agentsmyth repo has no way to discover the lifecycle and meets the gate only
when its commit is rejected. Writing a bespoke adapter per tool does not scale for a single
maintainer.

`AGENTS.md` is the vendor-neutral convention most agents already read. The repo half-uses it
already, and the half that exists is the wrong half:

- `src/assets/AGENTS.md` exists (2.3K) and `src/setup/SKILL.md:163-164` already places it —
  copy when absent, append under a plain `## agentsmyth Workflow` heading when present, "Never
  overwrite".
- That placement is **agent-driven** (the setup skill), not mechanical, so it depends on an agent
  following prose.
- It carries **no delimiters**, so a second run appends a duplicate, and its own "Never overwrite"
  rule means a stale block can never be refreshed — an upgrade has no way to detect or replace it.
- The block **never names the pre-commit hook**. It says "Bypass is not permitted" without
  identifying the thing that actually refuses the commit.

## Goals

- `init` owns root `AGENTS.md` mechanically and idempotently, under a marker convention consistent
  with the one the repo already uses for global gates.
- An agent with no first-class adapter can find the install root, the router, the lifecycle chain,
  and the fact that a pre-commit hook will refuse phase-skipping commits.
- Re-running `init`, and any later upgrade, replaces the block in place without touching a byte the
  user wrote.

## Non-Goals

- Any new first-class adapter. The five stay five.
- Claiming coverage parity. Positioning stays: five first-class adapters plus a generic fallback that
  is best-effort guidance, with the hook as the thing that actually holds.
- Implementing WP-R18's provenance manifest or migration descriptors. This package defines the marker
  convention; WP-R18 adopts it if and when it lands. No hard dependency in either direction.
- Resolving the 1.1.0 scope disagreement for WP-R20 and WP-R24 (see Q3).

## User Impact

A consumer running `npx agentsmyth init` gets a root `AGENTS.md` whether or not they use one of the
five supported tools. A consumer who already has a hand-written `AGENTS.md` keeps every byte of it
and gains one delimited block. Codex users see no behavioral loss: `AGENTS.md` is what Codex reads
natively, and the generic block is placed at the same path its adapter targeted (see RI1, Q2).

## Success Metrics

- `init` run twice against the same repo produces byte-identical `AGENTS.md` (idempotency proven by
  diff, not by inspection).
- `init` run against a repo with a pre-existing user-authored `AGENTS.md` leaves all pre-existing
  bytes unchanged and adds exactly one marker pair (proven by diff of the non-block region).
- `init` run against a repo whose `AGENTS.md` already carries a stale block replaces the block region
  only, and the file gains no second marker pair.
- The rendered block names the pre-commit hook by path.
- `npm run validate` and `npm run violations:test` pass at head.

## Requirements

Explicit requirements are the five bullets of the Notion page's Requirements and Convention Change
sections, carried as R1–R6. Implicit requirements RI1–RI7 are derived from repo state, config, and
the release position, and are the part the page does not state.

## Constraints

- `[safety-2]` (`domain.yaml`) — "Do not perform destructive actions without explicit user approval."
  Writing into a file the user authored is the constraint this work lives closest to. R3 is what keeps
  it on the right side of the line, and RI5 is what proves it.
- `[product-2]` — compatibility and release impact are implicit requirements when material. Both are
  material here (RI1, RI7).
- `[provider-neutrality-1/2]` — no conflict. `AGENTS.md` is a cross-tool convention, not a provider.
- `repo-profile.yaml` `paths.protected` (`.git/**`, `.env*`, `**/*secret*`) — root `AGENTS.md` matches
  none. No protected-path conflict.
- CLAUDE.md golden rules 1 and 2 — `src/` is the edit surface; `dist/` and `validators/` are build
  products and require `npm run build` after any `src/workflow/`, `src/setup/`, or `src/adapters/`
  change (RI3).
- Branch policy (`repo-profile.yaml` `branch_policy`): non-default branch required. Work is on
  `feat/wp-r23-agents-md-fallback`, cut from `release/1.1.0`.

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Marker insertion corrupts a user's `AGENTS.md` | low | high | R3 + RI5: the replace path is proven against a file with pre-existing content before ship, not asserted |
| Generic block and Codex adapter both write root `AGENTS.md`, producing two overlapping blocks | medium | medium | Q2 settles ownership before Build; RI1 records the collision |
| A second marker style diverges from `<!-- agentsmyth global gate BEGIN/END -->` | low | low | Settled by Q1: HTML-comment form retained, so RI2 holds |
| Version-stamped marker matched literally, so every release appends a block instead of replacing | medium | high | R2's second acceptance criterion requires pattern matching and a cross-version replace trial |
| New validator rule ships undefended, breaking the 0-undefended mutation ratchet | medium | medium | RI4: any added rule ships with its rejection fixture in the same change |
| 1.1.0 stays unreleased while WP-R20 (Complex) and WP-R24 land | certain | medium | Decided by the user via Q3, not a risk to mitigate. Recorded so Ship does not report this merge as closing the release |

## Open Questions

Q1 and Q3 are non-blocking and carry recommendations. Q2 is blocking and is mirrored in
`orchestration.blockers`.

## Requirement Manifest

### Explicit (R)

- **R1** — `init` creates root `AGENTS.md` when absent, and inserts the delimited block when the file
  exists without one.
  - Acceptance: against a repo with no `AGENTS.md`, `init` produces one containing exactly one marker
    pair. Against a repo with an `AGENTS.md` and no marker pair, `init` appends exactly one marker
    pair and changes nothing above it.
- **R2** — The block is wrapped in delimiters so re-running `init` replaces it in place rather than
  appending a second copy, and a later upgrade can detect a stale block.
  - Acceptance: two consecutive `init` runs produce byte-identical `AGENTS.md`. A file whose block
    content differs from the current template is replaced between markers, and the resulting file
    contains exactly one marker pair.
  - Acceptance (marker matching): the markers are version-stamped per Q1, so `init` MUST locate the
    block by PATTERN (`<!-- agentsmyth:<version> BEGIN -->`), never by literal string. Proven by a
    trial: a block stamped with an older version is found and replaced by a newer `init`, and the
    resulting file contains exactly one marker pair carrying the new version. Literal matching would
    make every release append a second block instead of replacing the previous one — the version
    stamp turns a fixed marker's one-time migration risk into a per-release one unless matching is
    pattern-based, which is why this is a requirement rather than a Build detail.
- **R3** — Never touch a byte outside the markers.
  - Acceptance: for a file with pre-existing content before and after the block, a diff of the
    non-block region across an `init` run is empty.
- **R4** — The block names the pre-commit hook explicitly.
  - Acceptance: rendered block contains the hook's path and states that it refuses commits which skip
    phases. Current `src/assets/AGENTS.md` fails this; the replacement must pass it.
- **R5** — The block stays small: install-root resolution, router and lifecycle pointers, hook
  statement. Not a second copy of the contract.
  - Acceptance: block content is bounded to those four concerns, and does not restate the seven-step
    gate that `src/assets/AGENTS.md` currently carries.
- **R6** — `AGENTS.md` joins `init`'s enumerated root-path list under a create-or-replace-between-markers
  rule, rather than the skip-if-exists rule the other enumerated paths use.
  - Acceptance: the write happens in `bin/agentsmyth.mjs` alongside the existing enumerated placements
    (`.cursor/rules/agentsmyth.mdc` at line 891, `.github/copilot-instructions.md` at line 899), not in
    `src/setup/SKILL.md`. The convention change is recorded in the repo, not only in Notion.

### Implicit (RI)

- **RI1** (repo / compatibility) — Root `AGENTS.md` is *already* Codex's per-repo adapter target
  (`src/setup/SKILL.md:189`) and is already one of five entries in `check-setup-complete.mjs:220-226`
  `adapterPaths`. The generic block must reconcile with that existing ownership rather than silently
  compete with it.
  - Acceptance: exactly one writer owns root `AGENTS.md` after this change — `init`, per Q2 — and
    `src/setup/SKILL.md`'s Step 5a and Step 5a.1 Codex row agree with it. `check-setup-complete.mjs`
    still treats `AGENTS.md` correctly under the new ownership.
- **RI2** (repo convention) — The repo already has a marker convention:
  `<!-- agentsmyth global gate BEGIN -->` / `<!-- agentsmyth global gate END -->` for markdown-comment
  tools (`src/adapters/claude/global-gate.md:1,16`, `src/adapters/copilot/global-gate.md:4,19`) and a
  `#`-prefixed variant for Codex and Windsurf. The new markers must extend that convention, not open a
  second style.
  - Acceptance: the chosen marker literal is an HTML comment of the same shape as the claude/copilot
    pair, and is documented in the same place the global-gate markers are documented.
- **RI3** (generated output) — `src/assets/`, `src/setup/`, and `src/adapters/` are bundle sources.
  `scripts/build-bundle.mjs` compiles them into `dist/`, and `repo-profile.yaml`
  `generated_output_policy.require_regeneration_or_waiver_when_source_changes` is true.
  - Acceptance: `npm run build` is run after the source edits and the regenerated `dist/` is committed
    in the same change. No stale bundle ships.
- **RI4** (verification) — `verification.yaml` marks `npm run validate` and `npm run violations:test`
  required for the `review` and `ship` phases. `test/mutation-baseline.json` records 0 undefended rules
  across 221 rules in 30 validators, as a ratchet that may shrink and never grow.
  - Acceptance: both configured commands pass at head with current output recorded in the verify
    artifact. If this change adds a validator rule, it ships with a rejection fixture in the same
    change and the mutation baseline still reads 0.
- **RI5** (safety / compatibility) — Modifying a user-authored file is the `[safety-2]` surface. The
  in-place replace path must be proven against a file that already has user content, not only against
  a freshly created one.
  - Acceptance: a Build- or Test-phase trial writes a repo with a hand-authored `AGENTS.md` containing
    content above and below the insertion point, runs `init` twice, and records the diffs. Source-only
    inspection is explicitly not enough (`verification.yaml` `generated_output.source_only_inspection_is_not_enough`).
- **RI6** (test coverage) — No repo under `examples/` carries an `AGENTS.md`, so `validate-example.mjs`
  cannot currently catch a regression in this path.
  - Acceptance: either an example gains an `AGENTS.md` exercising the marker block, or the gap is
    recorded as a skipped check with an owner per `verification.yaml` `skipped_checks.required_fields`.
- **RI7** (release) — The user scoped 1.1.0 to **seven** work packages, not four (Q3, 2026-09-13):
  the four already merged (WP-R8 #62, WP-R19 #63, WP-R21 #64, WP-R22 #65) plus WP-R20, WP-R23 and
  WP-R24. `release/1.1.0` is 90 commits ahead of `main` and 0 behind with CI green on `26de99b`, so it
  is mechanically dispatchable today — but it does not dispatch until all three remaining packages
  land. This work is one of the three, and merging it does not by itself unblock the release.
  `docs/release-checklist.md` requires the CHANGELOG entry for the version being released to be
  committed *before* the dispatch.
  - Acceptance: the 1.1.0 CHANGELOG entry gains this change; the entry date is corrected to the real
    dispatch date at dispatch time, not now; `package.json` is **not** pre-bumped (`release.yml` runs
    `npm version` itself). Ship records that WP-R20 and WP-R24 are still outstanding rather than
    presenting this merge as closing the release.
  - Recorded discrepancy, not a proposal: OI-87 states "All four work packages are merged into
    release/1.1.0" and enumerates the release as those four. Under the user's decision that text now
    under-describes 1.1.0 by three packages. Reconciling the ledger is not this work's scope.

### Assumptions (A)

- **A1** — `touches_contract` is scored **true** even though `repo-profile.yaml` `public_contracts` is
  `[]`. `init`'s on-disk write behavior is what consumers depend on, so it is a shipped contract in
  substance. Scoring it true raises scrutiny (it is what fires `architecture-decision-advisor`) and can
  never lower it, so the conservative reading is the safe one. Derivation: files_touched 6x3=18, ri_count 7x4=28 capped at 24, touches_contract 15, new_surface 10, task_class standard 6 = 73; without A1, 58. Plan should treat the empty
  `public_contracts` list as under-specified rather than as evidence of no contract.
- **A2** — Slug `wp-r23-agents-md-fallback`, version 1, branch `feat/wp-r23-agents-md-fallback` cut from
  `release/1.1.0`. Reversible naming choice, recorded so later phases do not re-derive it.
- **A3** — `pending-setup.yaml` items PS-4..PS-7 remain open. `src/workflow/router.md` §8 makes intent
  items explicitly non-blocking ("never treat an unresolved intent item as a reason to pause a phase"),
  and resolving them would write `repo-profile.yaml` changes outside this work's approved scope
  (`change_policy.stage_only_approved_scope`). Carried, not resolved.

### Open Questions (Q)

- **Q1** — What exactly are the marker literals? **ANSWERED 2026-09-13 by the user.**
  - Owner: user. Blocking: no. Status: resolved.
  - Decision: `<!-- agentsmyth:<version> BEGIN -->` / `<!-- agentsmyth:<version> END -->`, e.g.
    `<!-- agentsmyth:1.1.0 BEGIN -->`. Version-stamped, HTML-comment form.
  - User's rationale: backward compatibility — a future release can recognise which version wrote a
    block and apply fixes specific to it.
  - Agent's recorded caveat, accepted into R2: a version-stamped marker is only sound if `init`
    matches by pattern. Literal matching would make 1.2.0 miss every 1.1.0 block and append a second
    one, converting a one-time migration risk into a per-release one. R2 now carries that as an
    acceptance criterion.
  - Why this beats the original recommendation (`<!-- agentsmyth BEGIN -->`): staleness detection
    becomes "stamp != current version" rather than a content comparison, and WP-R18's version-aware
    delta upgrades get the provenance they need for free. The HTML-comment shape still follows RI2's
    existing convention (`src/adapters/claude/global-gate.md:1,16`), and still avoids the already-taken
    phrase "global gate".
- **Q2** — Does the generic block subsume Codex's per-repo `AGENTS.md` adapter placement, or do both
  coexist?
  **ANSWERED 2026-09-13 by the user: option 1 — subsume, accept the shrink.**
  - Owner: user. Blocking: was yes; now resolved, so `orchestration.blockers` is empty.
  - Decision: the generic block subsumes Codex's per-repo `AGENTS.md` placement. One block, one
    writer (`init`). `src/setup/SKILL.md` Step 5a.1's Codex row collapses to "covered by the generic
    block", and Step 5a's two `AGENTS.md` rows are replaced by the marker-based write.
  - Accepted consequence, stated plainly rather than buried: Codex users lose inline gate text. Today
    they receive all 2.3K of `src/assets/AGENTS.md` — seven numbered steps covering setup detection,
    router entry, task classification, routing, brief-before-code, per-phase status gating, and the
    evidence rule. Under R5 they receive a pointer to the router plus a named hook. The bet the user
    took: an agent that follows the pointer reaches the same rules, and one that ignores a pointer was
    not going to honour seven inline steps either — while the hook, which actually refuses the commit,
    is now named for the first time.
  - Rejected: (2) relaxing R5 to keep the block fuller for everyone, which reintroduces the stale
    duplicate-of-the-contract problem R5 exists to prevent; (3) keeping a separate Codex block, which
    restores two writers in one file with nothing keeping them consistent.
  - Original recommendation, now ratified: **subsume**. Codex reads `AGENTS.md` natively, so the generic block already serves
    it; `src/setup/SKILL.md`'s Step 5a.1 Codex row collapses to "covered by the generic block". Rests
    on repo evidence: Step 5a.1 already contains the same de-duplication logic for global gates ("writing
    a per-repo copy on top of an active global one is pure duplication"), and `src/setup/SKILL.md:189`
    already defers the Codex row to Step 5a. Keeping both would put two writers and two blocks in one
    file with nothing keeping them consistent. This changes shipped behavior for Codex users, which is
    why it is blocking rather than assumed.
- **Q3** — WP-R20 and WP-R24 are also linked to the "1.1.0 — Minor Release Work Plan" page and are
  unstarted. Does 1.1.0 hold for them too, or is WP-R23 the last one in?
  **ANSWERED 2026-09-13 by the user: all three are in 1.1.0.**
  - Owner: user. Blocking: no — it does not block this build, only the release close-out.
  - Decision: WP-R20, WP-R23 and WP-R24 are all in 1.1.0. The Notion work-plan page's seven-package
    scope is correct; `open-items.yaml` and OI-87 are the stale records.
  - Consequence: 1.1.0 does not dispatch on this merge. WP-R20 is Complex and WP-R24 is a content
    package, so the release is gated on two further chains after this one.
  - Agent's recommendation, NOT taken: re-point R20 and R24 to 1.2.0 on the grounds that OI-87 scopes
    the release to four packages. The user has scope authority over the release; recorded here so the
    reversal is visible rather than silently absorbed.

### Requirement Classification

Written at stage 2, before research. Single-agent mode, so `## Council Log` is omitted; this
sub-section is retained because the Think Exit Gate requires a classification entry for every active
R and RI regardless of mode.

| Manifest ID | Question bucket | Evidence classes |
|---|---|---|
| R1, R2, R3, R6 | How does `init` write enumerated root paths today, and where does a marker-based write fit? | repo, trial |
| R4, R5 | What does the current block say, and what must the replacement say? | repo |
| RI1 | Who owns root `AGENTS.md` today? | repo |
| RI2 | What marker convention already exists? | repo |
| RI3 | What is generated from these sources, and what regenerates it? | repo |
| RI4 | Which verification commands are required, and what constrains adding a validator rule? | repo, trial |
| RI5 | Does the replace path preserve user bytes? | trial |
| RI6 | Do the example repos cover this path? | repo |
| RI7 | What does the release position require of this change? | repo |

## Questions For User

**Q1 — marker literals. RESOLVED 2026-09-13.** The user chose version-stamped markers,
`<!-- agentsmyth:1.1.0 BEGIN -->` / `<!-- agentsmyth:1.1.0 END -->`, over the flat form originally
recommended. Accepted, with pattern-based matching folded into R2 as an acceptance criterion — see
the Q1 entry in the Requirement Manifest for the reasoning and the caveat.

**Q2 — Codex adapter reconciliation. RESOLVED 2026-09-13.** The user chose option 1: the generic block
subsumes Codex's per-repo `AGENTS.md` placement, accepting that Codex users trade 2.3K of inline gate
text for a pointer plus a named hook. `orchestration.blockers` is now empty. See the Q2 entry in the
Requirement Manifest for the accepted consequence and the two rejected options.

**Q3 — WP-R20 and WP-R24. RESOLVED 2026-09-13.** The user scoped all three remaining packages into
1.1.0. The release is gated on WP-R20 and WP-R24 in addition to this work; OI-87 and `open-items.yaml`
now under-describe the release. Reconciling them is outside this work's scope.

## Architecture Notes

- **role**: Architect
- **decision (architecture-decision-advisor, triggered; ratified by the user 2026-09-13 via Q2)**: *One
  marked block in root `AGENTS.md`, owned by `init`, serving both the generic-fallback role and Codex's
  per-repo adapter role.* The architecture
  question this requirement actually raises is **who owns root `AGENTS.md`**, because two mechanisms are
  about to write the same path.
  - **Rejected alternative 1 — two distinct marked blocks** (a generic block plus a separate Codex
    adapter block). Rejected: two writers (`init` and the setup skill) in one file with two marker
    pairs and nothing keeping them consistent. This is the exact duplication that Step 5a.1's
    global-gate check already exists to prevent, so adding it back would be repo-inconsistent.
  - **Rejected alternative 2 — leave `AGENTS.md` to the setup skill and add markers there.** Rejected
    on two grounds: the skill is agent-driven, so idempotency would depend on prose being followed; and
    its own rule is "Never overwrite", which makes refreshing a stale block impossible and defeats R2
    outright. The Notion page's Convention Change section independently moves this to `init`.
  - **Rationale**: repo-consistency. `init` already owns mechanical, deterministic placement of
    `.cursor/rules/agentsmyth.mdc` (`bin/agentsmyth.mjs:891`) and `.github/copilot-instructions.md`
    (`bin/agentsmyth.mjs:899`), both with skip-if-exists and both rendered through
    `renderAdapterTemplate`. `AGENTS.md` joining that enumerated list is the same pattern with a
    stricter write rule, not a new mechanism.
- **constraint**: `[safety-2]` bounds this work — the create-or-replace-between-markers rule is what
  keeps a write into a user-authored file non-destructive, and RI5 is what proves it rather than
  asserting it. The marker convention is fixed by RI2, not chosen freely.
- **tradeoff**: a stricter write rule for one entry in an otherwise uniform skip-if-exists list is a
  real inconsistency in `init`'s convention. Accepted because skip-if-exists cannot satisfy R2 — a repo
  that already has an `AGENTS.md` would never receive the block, which is precisely the common case
  this work exists to serve. Recorded so Review judges it as a decision rather than rediscovering it as
  a defect.
- **assumptions Plan must preserve**: A1 (treat `public_contracts: []` as under-specified, not as
  absence of contract), A2 (slug/branch), A3 (PS-4..PS-7 stay open by router rule).
- **downstream impact**:
  - *Plan* — must map R6 and RI1 to the same change, since moving the writer and reconciling Codex
    ownership are one edit, not two. Must decide whether `check-setup-complete.mjs` needs a rule change
    (RI1) and, if so, budget a rejection fixture for it (RI4).
  - *Build* — `src/` only; `npm run build` mandatory (RI3).
  - *Review* — scope-fence should confirm no byte of `dist/` was hand-edited.
  - *Test* — RI5 requires a real trial against a pre-populated `AGENTS.md`; source inspection is
    explicitly insufficient. RI6 is a coverage gap that must either close or be recorded as a skipped
    check with an owner.
  - *Ship* — RI7: the 1.1.0 CHANGELOG entry gains this change and `package.json` is not pre-bumped.
    Ship must NOT report this merge as closing 1.1.0 — WP-R20 and WP-R24 are in the release too (Q3),
    so the CHANGELOG date is corrected at dispatch time, not at this merge. Rollback scope is this
    branch, not the release.
  - *Reflect* — the schema tension found while writing this brief (the Think Exit Gate requires a
    Requirement Classification for every brief, but the starter block nests that sub-section under
    `## Council Log`, which single-agent briefs omit entirely) should become an open item.

## Checkpoint Approval

- Checkpoint: brief-review
- Status: approved
- User's own words (verbatim, this turn): "Approved, go to Plan"
- Approved: 2026-09-13, after a question-by-question walkthrough in which the user answered A1, A2,
  A3, Q1, Q2 and Q3 individually. Q1 and Q3 changed the artifact (see R2's second acceptance
  criterion and the rewritten RI7); the approval above covers the brief as it stands after those
  edits.

## Exit Gate

- [x] Every active R and RI has acceptance criteria.
- [x] Blocking Q IDs appear in orchestration.blockers (Q2).
- [x] User approved or waiver recorded.

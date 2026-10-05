---
slug: wp-r24-enforcement-proof
version: 1
artifact: plan
status: ready-for-next-phase
created: 2026-09-16
updated: 2026-09-16
manifest_ids: [R1, R2, R3, R4, RI1, RI2, RI3, RI4, RI5, RI6, RI7]
upstream:
  - workflow/artifacts/briefs/wp-r24-enforcement-proof-v1.md
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: plan-review
skill_trigger_log:
  - skill: domain.ui-ux-designer
    decision: ran
    reason: "Trigger `path~ui_globs`; ui_globs includes `**/*.vue` and Phase 3 touches site/.vitepress/theme/Layout.vue. Mechanically true here where WP-R23 recorded it false. Ran: the capture is a visual block landing in the hero region of the home page, so Phase 3's exit gate names contrast, max-width, horizontal-overflow and both-themes legibility rather than leaving them to Build's taste."
  - skill: domain.system-design-advisor
    decision: ran
    reason: "Trigger `complexity_score >= 60 OR new_surface`; score is 55 (below 60) but new_surface is true — the repo has never carried a generated capture or a regeneration path. Ran: confirmed the generator writes BOTH published copies in one run, so the two-surface duplication RI4 creates has a single writer."
  - skill: domain.quality-gates-validator
    decision: ran
    reason: "Trigger `task_class != trivial`; class is standard. Ran: verification plan built from verification.yaml's two required commands, plus site:build, plus a trial for idempotency and a manual-QA row for capture hygiene — neither of which a configured command can prove."
  - skill: domain.interface-contract-designer
    decision: ran
    reason: "Trigger `path~contract_globs OR touches_contract` evaluates FALSE — no planned touch matches contract_globs and repo-profile public_contracts is empty. Invoked anyway, deliberately: the marker grammar is a real contract between one generator and two consumer files, and leaving it to Build would repeat the class of gap OI-11 describes. Output is the marker-namespace decision in Architecture Notes and Phase 2's exit gate."
  - skill: domain.clean-code-architect
    decision: skipped
    reason: "Trigger `complexity_score >= thresholds.domain.clean-code-architect` (50); score 55, so the trigger is TRUE and this is a deliberate skip, not an unevaluated one. The chain's entire code surface is one regeneration script of an expected ~100 lines; a standing code-quality advisory over prose, a CHANGELOG entry and one script would return nothing Review's normal pass does not."
  - skill: domain.data-schema-designer
    decision: skipped
    reason: "Trigger `path~schema_globs` (**/migrations/**, **/schema/**, **/*.sql, **/models/**). No planned touch matches and no phase edits a schema. Note OI-100 records that this category cannot match this repo's own src/workflow/schemas/ in any case."
  - skill: domain.performance-optimizer
    decision: skipped
    reason: "Trigger `path~hotpath_globs OR complexity_score >= 60`; hotpath_globs is **/hot/** and **/perf/**, no planned touch matches, and score 55 is below 60. Both disjuncts false."
---

# WP-R24 — Enforcement Proof & Competitive Positioning Content - Plan

## Summary

**Amended twice after `plan-review` approval — once at Build (2026-09-16), once at Reflect (2026-09-17).**
Amendment 2 names `docs/regenerating-the-gate-capture.md` in Phase 2's Touches, the location the plan
had explicitly deferred to P2. It was written during the Review fix pass (F3) and stayed invisible to
`check-scope-fence` until the commit-readiness check, because Phase 2's Touches named it only as the
prose "documented steps" — the exact weakness OI-104 records.
 Amendment 1 adds
`site/.vitepress/theme/GateCapture.vue` to Phase 3 — the generated block moves out of `Layout.vue`
into its own component so the generator and the hand-maintained layout do not share a file. Surfaces,
requirements and phase boundaries are unchanged; `check-scope-fence` is what surfaced it, by refusing
a changed file that no phase declared. Recorded here rather than absorbed, because the approved plan is
the contract Build works against.

Publish a real, regenerable capture of the pre-commit gate refusing a commit on the two surfaces a
prospective user reads first, restate the Spec Kit comparison in verified file paths at a pinned SHA,
and state a current skill count where no surface states one.

The chain's product is **credibility**, which shapes every sequencing decision below: nothing is
published that a reader cannot re-derive, and the one asset that could be fabricated — the capture —
ships with the script that regenerates it and a proof that two runs agree.

## Inputs

- Approved brief: `workflow/artifacts/briefs/wp-r24-enforcement-proof-v1.md` (`brief-review` approved
  2026-09-16, verbatim "Continue to plan").
- Manifest: 4 explicit (R1–R4), 7 implicit (RI1–RI7), 3 assumptions (A1–A3, all resolved at Think),
  3 questions (Q1–Q3, all answered with their residues resolved).
- `workflow/config/`: `verification.yaml` (two required commands), `release.yaml` (`required: false`,
  `pull_request.create_policy: user_requested_or_configured`, `ci.provider: none`),
  `source-of-truth.yaml` (`mode: optional`, `providers: []`), `repo-profile.yaml` (branch policy,
  `tuning.council.sandbox_root`), `domain.yaml` ([safety-1], [safety-4], [provider-neutrality-1]).
- Repo state: branch `feat/wp-r24-enforcement-proof` at `22412f2`, stacked on
  `feat/wp-r20-ledger-closure` (PR #69) per the user's decision of 2026-09-16.
- Verified upstream evidence: `github/spec-kit` at SHA `1d5106f59e1b148ee23ab136638932dd790ff1b6`.

## Requirement Coverage

| Manifest ID | Covered by phases | Notes |
|---|---|---|
| R1 | P1, P2, P3 (owning: **P3**) | Capture published on both surfaces; P1/P2 produce it, P3 places it. Citation: brief R1 acceptance. |
| R2 | **P4** | Four verified claims with path + pinned SHA; both re-wordings applied. Citation: brief R2 acceptance (a)–(d). |
| R3 | **P4** | Generous naming with a concrete subject (`analyze.md`'s severity heuristics, coverage map, constitution checks). Citation: brief R3 acceptance. |
| R4 | P5, P6 (owning: **P5**) | Current count + counting rule in the 1.1.0 entry; `[1.0.0]` untouched; Notion updated in P6 from P5's evidenced derivation. Citation: brief R4 acceptance (a)–(e). |
| RI1 | **P4** | Satisfied at Think; P4's obligation is narrowed to citing SHA `1d5106f` accurately, not re-deriving verdicts. Citation: brief RI1.1–RI1.4. |
| RI2 | **P2** | Script under `scripts/` + documented steps, one source of truth, idempotent. Citation: brief RI2 acceptance (a)–(c). |
| RI3 | **P1** | Capture taken in a scratch repo under `sandbox_root`; no local paths, no skew banner. Citation: brief RI3 acceptance. |
| RI4 | **P3** | Both copies written by one run, between markers, byte-identical, asserted by Test. Citation: brief RI4 acceptance. |
| RI5 | **P7** | `package.json` `dependencies` unchanged; rebuild only if a phase touches `src/` (none planned). Citation: brief RI5 acceptance. |
| RI6 | **P5** | Derivation run at Build against `src/workflow/skills/`, not reused from the brief. Citation: brief RI6 acceptance. |
| RI7 | **P7** | 1.1.0 CHANGELOG entry gains this change; entry date untouched; no version pre-bump. Citation: brief RI7 acceptance. |

Ledger: 11 active IDs, 11 covered, 0 deferred, 0 waived, 0 dropped.

## Assumptions Verified

| Assumption ID | Status | Evidence / Question |
|---|---|---|
| A1 | evidence-backed | Closed at Think by direct file read of `github/spec-kit@1d5106f`: `scripts/bash/check-prerequisites.sh`, `templates/commands/analyze.md`, `templates/commands/implement.md`, plus a zero-result code search for `"pre-commit"`/`".git/hooks"`. Per-claim verdicts recorded in brief RI1.1–RI1.4. |
| A2 | evidence-backed | Superseded by the user's stacking decision and re-verified in git: branch fast-forwarded to `22412f2`, and `git merge-base --is-ancestor feat/wp-r20-ledger-closure HEAD` returns true. Recorded in brief A2. |
| A3 | evidence-backed | Confirmed by the user 2026-09-16 during the item-by-item brief review ("Inside the argument"); recorded in brief A3 and reflected in R1's acceptance criterion. |

## Repo Impact Map

| File | Change type | Manifest IDs | Notes |
|---|---|---|---|
| `scripts/capture-gate-refusal.mjs` | add | RI2, RI3 | New. Stands up a scratch repo under `sandbox_root`, provokes the refusal, writes both published blocks. Zero dependencies — Node builtins only. |
| `package.json` | modify | RI2 | One script entry (`capture:gate`). **`dependencies` untouched** — RI5. Deliberately NOT named `*:test`: conformance rule `r22-every-suite-runs-in-ci` requires every `:test` script to run in CI, and this one needs a writable scratch repo outside the checkout. |
| `README.md` | modify | R1, R2, R3, RI4 | Capture block inside "Where it fits" (A3); comparison section rewritten around the four verified claims. |
| `site/.vitepress/theme/Layout.vue` | modify | R1, RI4 | Adds a `#home-hero-actions-after` slot alongside the existing `#layout-top`. `site/index.md` is **not** touched. |
| `site/.vitepress/theme/GateCapture.vue` | add | R1, RI4 | **Amendment 1, added at Build 2026-09-16.** The plan originally had the generated block land in `Layout.vue` directly. Splitting it into its own component keeps the generator's target and the layout wiring separate: `Layout.vue` is hand-maintained and stable, `GateCapture.vue` is a generated-content file the script owns outright. Without the split, every regeneration would rewrite the same file that carries the `ForgeBackground` wiring and the content-reveal watcher. Same surfaces, same manifest IDs, no scope expansion. |
| `site/.vitepress/theme/style.css` | modify | R1 | Capture block styling: max-width, horizontal overflow containment, both-theme legibility. |
| `CHANGELOG.md` | modify | R4, RI6, RI7 | `## [1.1.0]` entry only. `## [1.0.0]` is a historical record and must not be edited — see Architecture Notes. |
| `docs/regenerating-the-gate-capture.md` | add | RI2 | **Amendment 2, 2026-09-17.** The plan deferred this location to P2 and wrote the Phase 2 Touches entry as the prose "documented steps", which `check-scope-fence` cannot resolve to a path — so the file was invisible to the fence until Reflect. Build first shipped the steps as code comments; Review F3 rejected that as undiscoverable and wrote this file. Naming the path here is the deferred decision, recorded rather than back-filled silently. The prose-Touches weakness itself is OI-104. |
| `workflow/artifacts/tasks/wp-r24-enforcement-proof-v1.md` | add | RI3 | Phase 1's evidence surface. The clean-room work itself happens under `sandbox_root`, outside every repo, so the transcript recorded here is its only repo-visible product. |
| Notion 04 — Reference | external write | R4 | Q3. Written in P6 from P5's evidenced derivation, never from the brief's numbers. |

Protected paths: none matched (`repo-profile.yaml` `paths.protected` is `.git/**`, `.env*`, `**/*secret*`).
Generated outputs under `generated_output_policy`: the two published capture blocks — source-mapped to
the script, regeneration method recorded, verified as artefacts rather than by inspecting the generator.

## Source-of-Truth Strategy

`source-of-truth.yaml` declares `mode: optional` with `providers: []`, so **no source-of-truth update
is required** and none is owed. The Notion writes in this chain are not source-of-truth obligations —
they are user-directed actions:

- **04 — Reference** (P6): the user chose this scope answering Q3. Written from the Build-evidenced
  derivation. If the page and the derivation disagree, the repo wins and the page is corrected.
- **WP-R24 page**: moved to Done at Ship as a user action, with the PR reference. Not an agent write
  without approval.

Where the WP-R24 page conflicts with repo evidence it has already been overruled once, on R4's "one is
wrong" premise (brief Q3). Ship records that correction rather than leaving the page's framing standing.

## Approach

Produce the proof before publishing it, and publish nothing a reader cannot re-derive.

Phases 1–3 build the capture from the bottom up: a clean room first, then the generator, then
placement — so that by the time text lands on a public surface it has already been proven reproducible
and hygienic. Phase 4 is independent content work over the same README, sequenced after P3 to avoid two
phases editing one file. Phase 5 derives the count. Phase 6 performs the single external write. Phase 7
closes the release-facing obligations and runs the suites.

The one genuinely novel decision is the marker namespace (Architecture Notes), because WP-R23 already
established a marker grammar in this repo and a second, colliding one would be a trap.

## Phases

### Phase 1 - Clean-room capture

- **Manifest IDs:** RI3
- Touches: `workflow/artifacts/tasks/wp-r24-enforcement-proof-v1.md`
- Work: **this phase changes no shipped repo file.** Its working area is a disposable consumer repo
  under `tuning.council.sandbox_root` (`~/.agentsmyth/sandbox/agentsmyth/`), which `repo-profile.yaml`
  places outside every repository by construction; its repo-visible output is the transcript and
  command sequence recorded in the task artifact declared above. Stand up that repo; point the CLI at
  it; provoke the real refusal —
  a `git commit` blocked because Build has no approved Plan. Record the verbatim transcript and the
  exact command sequence that produced it.
- **Exit gate:** a transcript exists containing the refusal and its non-zero exit, and a grep over it
  returns zero matches for `/Users/`, `/home/`, any environment value, and the `version skew` banner.

### Phase 2 - Regeneration script and documented steps

- **Manifest IDs:** RI2
- Touches: `scripts/capture-gate-refusal.mjs`, `package.json` (script entry only), `docs/regenerating-the-gate-capture.md`
- Work: automate Phase 1 end to end. The script creates the scratch repo, provokes the refusal,
  captures stdout/stderr verbatim, and writes the block into both published surfaces between markers.
  Steps document invoking it and what to verify — never a parallel manual procedure.
- **Exit gate:** two consecutive runs leave `git status --porcelain` empty on the second, and
  `package.json` `dependencies` is byte-identical to its pre-phase state.

### Phase 3 - Publish the capture on both surfaces

- **Manifest IDs:** R1, RI4
- Touches: `README.md`, `site/.vitepress/theme/Layout.vue`, `site/.vitepress/theme/GateCapture.vue`, `site/.vitepress/theme/style.css`
- Work: script writes the README block inside "Where it fits" (A3) and the site block into a new
  `#home-hero-actions-after` slot (Q2). Style the block: constrained max-width, `overflow-x` contained
  so the home page never scrolls sideways, legible in both themes.
- **Exit gate:** both blocks present between markers and byte-identical to each other;
  `npm run site:build` exits 0; the rendered home page shows the capture between hero actions and the
  features grid, with no horizontal page scroll at 375px and 1280px.

### Phase 4 - Comparison content

- **Manifest IDs:** R2, R3, RI1
- Touches: `README.md` ("Where it fits")
- Work: rewrite the comparison around the four verified claims, each with its upstream path and SHA
  `1d5106f`. Apply both required re-wordings: "never opens the artifacts it gates on" (not "never
  opens the file"), and "no **git** hook" with the agent-hook distinction stated. Add the generous
  Spec Kit paragraph naming `analyze.md`'s severity heuristics, coverage mapping and
  constitution-alignment checks. Frame the contrast as git-enforced versus agent-dispatched.
- **Exit gate:** every comparative claim in the published text resolves to `<path>@1d5106f`; both
  re-wordings present; at least one concrete statement of where Spec Kit is stronger; no claim appears
  in the Notion page's original phrasing where verification showed it imprecise.

### Phase 5 - Skill count, derived

- **Manifest IDs:** R4, RI6
- Touches: `CHANGELOG.md` (`## [1.1.0]` only)
- Work: derive the count from `src/workflow/skills/` with a recorded command; state it with its
  counting rule; write it into the 1.1.0 entry.
- **Exit gate:** the published number equals a fresh derivation's output, the counting rule is stated
  beside it, and `git diff` shows **zero** changes within the `## [1.0.0]` section.

### Phase 6 - Notion 04 — Reference

- **Manifest IDs:** R4
- Touches: Notion 04 — Reference (external)
- Work: update the Skill Tree counts and the counting rule from P5's evidenced derivation; refresh
  the page's "Last reviewed" date.
- **Exit gate:** the page states the derived count and rule, and the task artifact records exactly what
  was written and which derivation backed it.

### Phase 7 - Release note, invariants and suites

- **Manifest IDs:** RI5, RI7
- Touches: `CHANGELOG.md` (`## [1.1.0]`)
- Work: add the release note for this change; confirm the zero-dependency invariant; run the
  configured suites.
- **Exit gate:** `npm run validate` and `npm run violations:test` exit 0; `npm run site:build` exits 0;
  `git diff package.json` shows no change under `dependencies`; the 1.1.0 entry's **date is unedited**
  and `package.json` `version` is unchanged.

## Dependency Order

1. **P1 → P2** — the script automates a procedure that must first be known to work by hand.
2. **P2 → P3** — the script is the only writer of the published blocks; placing them by hand would
   break RI2's single-source-of-truth guarantee before it is established.
3. **P3 → P4** — both edit `README.md`. Sequencing them avoids one phase reformatting the other's
   output, and lets P4 write the argument around a block that already exists.
4. **P5 → P6** — the external write consumes P5's derivation; performing it first would publish a
   number with no evidence behind it.
5. **P5, P6 independent of P1–P4** — the count work shares no file with the capture work
   (`CHANGELOG.md` versus `README.md`/site). Either order is valid; recorded as independent rather than
   sequenced so Build is not forced into a false dependency.
6. **P7 last** — the release note describes the whole change, and the suites must run against the final
   tree.

## Branch Strategy

- Branch: `feat/wp-r24-enforcement-proof`, **stacked on `feat/wp-r20-ledger-closure`** at `22412f2`.
- `repo-profile.yaml` `branch_policy.require_non_default_branch_for_changes: true` — satisfied. No
  commit to `main` or to `release/1.1.0` directly.
- **PR base is `feat/wp-r20-ledger-closure`, retargeted to `release/1.1.0` only after PR #69 merges** —
  the pattern WP-R19/PR #63 used when stacked on PR #62. Opening against `release/1.1.0` while #69 is
  open would present WP-R20's commits as part of this package.
- If #69 is revised in review, this branch rebases onto the revision (accepted in brief A2).
- Commits: one per phase, message scoped to that phase's manifest IDs. `release.yaml`
  `pull_request.create_policy: user_requested_or_configured` — no PR is opened without the user asking.

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner | Manifest IDs |
|---|---|---|---|---|---|
| The capture's marker grammar collides with WP-R23's `agentsmyth:<version>` pattern, so a future migration that locates blocks by pattern matches a capture block | low | high | Distinct namespace `agentsmyth:capture` decided in Architecture Notes; P2's exit gate asserts the capture markers do not match WP-R23's version-stamped pattern | agent | RI2, RI4 |
| The two published copies drift because someone hand-edits one | medium | medium | Script is the single writer; Test asserts byte-identity between the two blocks; steps forbid manual editing | agent | RI4 |
| The capture embeds a local path or the version-skew banner | medium | high | P1 exit gate greps for `/Users/`, `/home/` and `version skew` before anything is published | agent | RI3 |
| The slot injection regresses the home page layout or introduces horizontal scroll on mobile | medium | medium | P3 exit gate requires `site:build` green plus a no-horizontal-scroll check at 375px and 1280px | agent | R1 |
| A Spec Kit claim goes stale between now and publication because `main` moves | low | medium | Claims are cited at SHA `1d5106f`, not at `main`; the citation stays true regardless of upstream drift | agent | R2, RI1 |
| Editing the `## [1.0.0]` CHANGELOG entry to "fix" 34 rewrites release history for a defect that does not exist | medium | medium | P5 exit gate asserts a zero-line diff inside that section | agent | R4, RI6 |
| The Notion write publishes a number the repo cannot back | low | medium | P6 consumes P5's evidenced derivation only, and is sequenced after it | agent | R4 |
| PR opened against the wrong base, merging WP-R20's commits a second time | low | medium | Branch Strategy names the base explicitly and the retarget condition | user | RI7 |
| `capture:gate` named as a `*:test` script, forcing CI to run a scratch-repo build | low | low | Repo Impact Map fixes the name and states why; conformance rule `r22-every-suite-runs-in-ci` only governs `:test` scripts | agent | RI2 |

## Verification Plan

| Manifest ID | Evidence | Owner phase | Notes |
|---|---|---|---|
| R1 | manual QA: rendered home page and README, both themes, 375px and 1280px | P3 | `manual_qa.required_fields` from `verification.yaml`: scenario, environment, steps, expected, observed, outcome, evidence, manifest_ids. |
| R2 | source: each published claim resolved against `<path>@1d5106f` | P4 | Evidence class `web` pinned to a SHA; verdicts already recorded in brief RI1. |
| R3 | review: the generous paragraph names a concrete Spec Kit capability | P4 | Judged at Review, not by command. |
| R4 | command: derivation over `src/workflow/skills/`, output recorded | P5 | Plus `git diff` proving `## [1.0.0]` unchanged. |
| RI1 | source: citations in the published text match the pinned SHA | P4 | Build cites; it does not re-derive. |
| RI2 | command: two consecutive script runs, second leaves the tree clean | P2 | Trial evidence — command plus output, per `command_policy`. |
| RI3 | command: grep of the transcript for `/Users/`, `/home/`, `version skew` returns zero | P1 | Gate on the capture before publication. |
| RI4 | command: byte-comparison of the two published blocks | P3 | Fails the phase if they differ. |
| RI5 | command: `git diff package.json` shows no `dependencies` change | P7 | Plus confirmation that no phase touched `src/`, so no rebuild is owed. |
| RI6 | command: fresh derivation equals the published number | P5 | Derived at Build, never copied from the brief. |
| RI7 | review: 1.1.0 entry present, date unedited, `version` unbumped | P7 | Per `docs/release-checklist.md`. |

Configured required commands (`verification.yaml`, phases `review` and `ship`): `npm run validate`,
`npm run violations:test`. Both run in P7 and again at Review and Ship. `npm run site:build` is added
as a discovered command under `command_policy.allow_discovered_commands: true`; it already runs in CI.

Skipped checks: none planned. Any that appear carry the six `skipped_checks.required_fields`.

## Architecture Notes

- role: Principal Engineer
- **decision (interface-contract-designer)**: the capture blocks use the marker namespace
  `<!-- agentsmyth:capture BEGIN -->` / `<!-- agentsmyth:capture END -->`, deliberately **not**
  WP-R23's `<!-- agentsmyth:<version> BEGIN -->`. WP-R23 locates its block by *pattern* so a later
  release can find and replace an earlier one; a capture block wearing a version-stamped marker would
  be a candidate match for that search. Two marker families in one repo is acceptable; one ambiguous
  family is not.
- **decision**: the generator writes both published copies in one run. Q2's resolution puts the site
  copy in a Vue slot rather than in markdown, so the text necessarily exists twice — and two copies with
  two writers is the drift this package cannot afford while arguing for mechanical enforcement.
- **decision**: the `## [1.0.0]` CHANGELOG entry is not edited. Verification showed 34 was correct on
  2026-07-23 under 04 — Reference's counting rule; `think-council` and `review-council` did not exist
  until 1.1.0. A Keep-a-Changelog entry records what shipped, not a live figure. This is recorded as a
  decision rather than an omission because the Notion page explicitly asks for a number to be "fixed"
  there.
- **constraint**: `[safety-1]` and `[safety-4]` make capture hygiene a gate, not a review note — P1
  cannot exit with a local path in the transcript.
- **constraint**: `release.yaml` `ci.provider: none` for this repo's own config; GitHub Actions runs on
  a PR as a consequence of opening one, not as a gate satisfied here.
- **tradeoff**: verifying the Spec Kit claims during Think rather than at Build front-loaded effort into
  a phase that normally only frames. It changed two requirement statements and produced a better core
  argument, so Build inherits citations instead of hypotheses — but the brief now carries evidence that
  a stricter reading would place in a task artifact. Recorded so Review reads RI1 as settled rather than
  as Think overreaching.
- **tradeoff considered and rejected**: publishing the capture as a static hand-written block with no
  generator. Cheaper, and it fails the one thing this package sells — a reader could not distinguish it
  from a fabrication.
- **assumption Build must preserve**: A1's verdicts are pinned to SHA `1d5106f`. Build cites that SHA;
  it does not silently re-resolve the claims against `main`.
- **downstream — Build**: seven phases, one commit each. The only `src/`-adjacent file is
  `scripts/capture-gate-refusal.mjs`, which is not under `src/workflow/`, `src/setup/` or
  `src/adapters/` — so CLAUDE.md rule 2's rebuild obligation does not fire. If that changes, the
  rebuild enters the chain.
- **downstream — Review**: the highest-risk surfaces are the four comparative claims (a wrong one is
  public and about a named competitor) and the capture's provenance. Review should re-run the script
  rather than read it.
- **downstream — Test**: `generated_output.source_only_inspection_is_not_enough` means the published
  blocks are verified directly. Reading `capture-gate-refusal.mjs` and concluding it works is explicitly
  not sufficient evidence.
- **downstream — Ship**: PR base `feat/wp-r20-ledger-closure`, retargeted after #69 merges. This merge
  makes 1.1.0 dispatchable; it does not dispatch it.
- **note for Reflect**: `check-scope-fence` rejected Phase 1's first Touches entry because the phase's
  real working area is outside the repository, and the validator resolves every entry as repo-relative.
  Declaring the task artifact is the honest fix — that *is* the phase's repo-visible output — but the
  contract has no way to say "this phase deliberately touches no shipped file", so the next chain with
  out-of-repo work will rediscover this. Adjacent to OI-104 (prose Touches entries) without being the
  same defect.
- **downstream — Reflect**: two follow-ups are owed under the two-file ledger contract inherited from
  WP-R20 — the unlocated `SPEC.md`, and the fact that 04 — Reference goes stale on counts by
  construction because nothing derives it from `src/workflow/skills/`.

## Open Questions

None blocking. Two judgment calls are recorded as decisions rather than questions, both reversible at
Build with no rework beyond a rename: the marker namespace (`agentsmyth:capture`) and the script name
(`scripts/capture-gate-refusal.mjs`, npm entry `capture:gate`).

## Checkpoint Approval

- Checkpoint: plan-review
- Status: approved
- User's own words (verbatim, this turn): "Plan is approved"
- Approved: 2026-09-16, in response to this plan's own content — the seven-phase sequence, the three
  recorded decisions (marker namespace, the untouched `## [1.0.0]` entry, the `capture:gate` script
  name), the `ui-ux-designer` trigger firing where WP-R23 skipped it, and the `check-scope-fence`
  rejection and its fix. Separate from the `brief-review` approval of 2026-09-16; that one did not
  and could not cover this artifact.

## Exit Gate

- [x] Every active R and RI mapped to a phase — 11 IDs, 11 mapped, each with exactly one owning phase.
- [x] Every phase has a binary exit gate — 7 phases.
- [x] Verification plan covers every R and RI — 11 rows.
- [x] Dependency order explicit, including the two genuinely independent tracks.
- [x] Risks have mitigations — 9 rows, each with an owner and manifest IDs.
- [x] Source-of-truth and release handling explicit; branch strategy names a non-default branch and its PR base.
- [x] `skill_trigger_log` records all seven evaluated domain triggers, including two true triggers and one deliberate skip of a true trigger.
- [x] User approved the plan or accepted a waiver — approved 2026-09-16, verbatim words recorded in `## Checkpoint Approval`.

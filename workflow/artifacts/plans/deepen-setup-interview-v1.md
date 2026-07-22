---
slug: deepen-setup-interview
version: 1
artifact: plan
status: ready-for-next-phase
created: 2026-07-22
updated: 2026-07-22
manifest_ids: [R1, R2, R3, R4, R5, R6, RI1, RI2]
upstream:
  - workflow/artifacts/briefs/deepen-setup-interview-v1.md
orchestration:
  phase: plan
  status: ready-for-next-phase
  next_phase: build
  blockers: []
  user_checkpoint: plan-review
---

# Deepen Setup Interview + Fold check-setup-complete into agentsmyth check - Plan

## Summary

Two coupled changes. First: `agentsmyth check` runs `check-setup-complete.mjs`'s existing checks
(placeholder-absence, `.agentsmyth/` gone, adapter present) automatically, so an agent can no
longer silently skip past incomplete setup. Second: `headlessBootstrap()`'s pending-setup seed
data is widened to cover the topics the old 9-topic interview covered — but the widening splits
into two distinct categories: fields resolved by **smarter inference alone** (no new question,
zero added friction) and fields that need a **real, waivable pending-setup item** (a question
that can be answered, inferred, or explicitly declined). This distinction is what keeps depth
"bearable" rather than reintroducing a 30-question wall.

## Inputs

- `workflow/artifacts/briefs/deepen-setup-interview-v1.md` (approved)
- `bin/agentsmyth.mjs` — `headlessBootstrap()`, `check` command, **as of PR #45 (`239f1f2`)** — per
  explicit user instruction, this branch was rebuilt on top of `mandatory-lifecycle-pre-commit-hook`
  instead of `origin/main`, so this Plan uses the already-shipped `resolveValidator(checkRoot,
  profilePath, validatorFilename)` helper (definitions_root/AGENTSMYTH_HOME-aware, parameterized by
  filename) directly, rather than reimplementing a simpler fallback against `origin/main`'s older code.
- `src/assets/workflow/config/{repo-profile,release,source-of-truth,verification,domain}.yaml`
  templates
- `src/workflow/validators/check-setup-complete.mjs`, `check-pending-setup.mjs`
- `src/setup/SKILL.md`, `src/setup/references/{config-map,inspection-checklist}.md`
- This session's field-by-field audit (see Approach below) of which `config-map.md` topics are
  inference-only vs. question-worthy vs. safe-silent-default

## Requirement Coverage

| Manifest ID | Covered by phases | Notes |
|---|---|---|
| R1 | Phase 1 | Fold check-setup-complete checks into `agentsmyth check` |
| R2 | Phase 2, Phase 3 | Inference-only widening (Phase 2), new waivable PS items (Phase 3) |
| R3 | Phase 4 | Fix stale Step 5e |
| R4 | Phase 4 | Keep config-map.md/inspection-checklist.md in sync |
| R5 | Phase 5 | Full regression suite |
| R6 | Phase 6 | Resolve the orphaned pre-commit hook file, added mid-chain per explicit user direction |
| RI1 | Phase 1-6 | No dependency changes anywhere |
| RI2 | Phase 1 | Standalone `check-setup-complete.mjs`/`check-config.mjs` invocation unchanged |

## Repo Impact Map

| File | Change type | Manifest IDs | Notes |
|---|---|---|---|
| `bin/agentsmyth.mjs` | modify | R1, R2 | Fold check-setup-complete resolution into `check`; widen `headlessBootstrap()`'s inference and PS-seeding logic |
| `src/assets/workflow/config/repo-profile.yaml` | modify | R2 | Widened `paths.*` fields get placeholder sentinels where question-worthy |
| `src/assets/workflow/config/release.yaml` | modify | R2 | No template change — inference-only (CI detection updates values at bootstrap time, not template defaults) |
| `src/assets/workflow/config/source-of-truth.yaml` | modify | R2 | Placeholder sentinel for `providers[0]` when question-worthy |
| `src/setup/SKILL.md` | modify | R3 | Fix Step 5e; light Phase 2/3 prose updates for new field categories |
| `src/setup/references/config-map.md` | modify | R4 | Cross-check only — confirm no new orphaned entries (likely no change needed, already comprehensive) |
| `src/setup/references/inspection-checklist.md` | modify | R4 | Add CI-provider-detection and package.json-multi-script-detection notes |
| `test/run-setup-complete-tests.mjs` | modify | R5 | Extend for widened placeholder fields |
| New scratch-repo regression cases | manual QA | R2, R5 | Verified live in Build/Test, not necessarily a new permanent fixture file |

## Source-of-Truth Strategy

Single source: `bin/agentsmyth.mjs` (mechanical scaffold logic) and `src/assets/workflow/config/`
(templates). No separate copy to keep in sync — these are already the canonical, directly-shipped
locations (confirmed no build-sync step needed for `src/assets/` per this repo's own CLAUDE.md).

## Approach

### Phase 1 design — folding check-setup-complete into `agentsmyth check`

`check-setup-complete.mjs`'s own checks are self-gating by construction: a genuinely complete
repo (no placeholders, `.agentsmyth/` gone, adapter present) passes all of them regardless of how
many times `agentsmyth check` runs afterward — so folding it in permanently is safe, not just
during active setup. Resolve it via the already-shipped `resolveValidator(checkRoot, profilePath,
'check-setup-complete.mjs')` call (PR #45's two-root-aware helper — definitions_root ->
AGENTSMYTH_HOME -> checkRoot/workflow/validators -> pkgRoot/src/workflow/validators), the exact
same call already used for `check-lifecycle.mjs`/`check-commit-coverage.mjs`. Run it first, print
its errors if any, then still run the existing lifecycle-gate validator (`check-lifecycle.mjs` or
`check-commit-coverage.mjs` for `--staged`) so both sets of issues surface in one invocation; exit
non-zero if either failed. `check-setup-complete.mjs`'s own internal `resolveRepoRoot()` (which
deliberately avoids importing `lib.mjs` to sidestep its process.exit(1)-on-bad-definitions_root
side effect) is unaffected — it still runs as a subprocess with `cwd: checkRoot`, unchanged.

Deliberately **not** folding in a hard-fail on merely-`open` (unresolved) `pending-setup.yaml`
items — `router.md`'s own already-established "Pending Setup Resolution" step 7 explicitly says
"do not hard-stop" on remaining open items for ongoing work, and conflicting with that existing,
correct philosophy is out of scope. `check-setup-complete.mjs`'s own scope (placeholder absence,
not open-item count) is the right boundary — an `open` PS item only becomes a real problem once a
placeholder it was meant to resolve is still sitting in a config file, which the placeholder scan
already catches.

### Phase 2 design — inference-only widening (no new questions)

These get smarter automatically during `headlessBootstrap()`, using only `existsSync`/directory
listing (no new dependency, no YAML parsing of arbitrary CI files needed):

- **CI/release gate reality** (`release.yaml` `gates.ci`): check for `.github/workflows/`,
  `.circleci/config.yml`, `.gitlab-ci.yml`, `Jenkinsfile` existence. If found, set
  `gates.ci.required: true` and `gates.ci.provider` to the matching label
  (`github-actions`/`circleci`/`gitlab-ci`/`jenkins`). If none found, leave the existing silent
  default (`required: false, provider: none`) — that's already an accurate reflection of reality,
  not a placeholder needing resolution. This directly fixes the concrete gap this session found in
  this repo's own `release.yaml`.
- **Protected paths beyond the generic floor** (`repo-profile.yaml` `paths.protected[]`): check
  for `secrets/`, `credentials/`, `certs/`, `keys/` directories at the repo root (per
  `inspection-checklist.md`'s existing "Secrets and Sensitive Paths" section). If found, append
  each as an additional `paths.protected[]` entry (`pattern: <dir>/**`, `reason: "detected sensitive directory"`)
  alongside the existing generic 3. Purely additive — never removes or questions the existing
  defaults.
- **Multiple verification commands** (`verification.yaml` `commands[]`): check `package.json`
  `scripts` for `test`, `build`, `lint` keys (in that priority order, matching common convention);
  for each one present, add a `commands[]` entry (`command: "npm run <script>"`, `required: true`,
  `phases: [review, ship]`). If `package.json` has none of these, fall back to checking a
  `Makefile` for `test`/`build`/`lint` targets the same way. Only if neither source yields anything
  does the existing single PS-3 question (now asking generically for "a" health-check command,
  unchanged from today) still apply, as the final fallback.

### Phase 3 design — new waivable pending-setup items

These get a new `pending-setup.yaml` item **and** a matching placeholder sentinel in the relevant
config file, so `check-setup-complete.mjs`'s existing literal-string scan naturally forces
attention — resolvable by inference, by asking, or by explicit waiver (all three are legitimate,
expected outcomes):

- **Key paths** (`repo-profile.yaml` `paths.source_roots[]`/`test_roots[]`/`docs_roots[]`):
  template ships each as `["<PLACEHOLDER>"]` instead of `[]`. One new PS item ("What are this
  repo's key directories — source, test, docs root?") with inference-first resolution via a
  simple top-level directory listing (matching `inspection-checklist.md`'s existing "Directory
  Structure" section: look for `src/`/`lib/`/`app/`/`pkg/`/`cmd/`, `test/`/`tests/`/`spec/`,
  `docs/`). Resolved state can legitimately be an empty array (`[]`, meaning "reviewed, no
  distinct root") once the placeholder string is replaced — the scan only cares that the literal
  sentinel is gone, not that the array is non-empty.
- **Source-of-truth** (`source-of-truth.yaml`): template's single example `providers[0]` ships
  with `location: "<PLACEHOLDER>"`. One new PS item ("Where are requirements/decisions tracked, if
  anywhere?"), explicitly noting in the question text that "nowhere formal" is a valid, common
  answer — resolved by waiving (reverting to `providers: []`, `mode: optional`, matching the
  existing template default) rather than forcing an answer that doesn't exist.
- **Release process** (`release.yaml` `release.required`): stays a plain boolean, no placeholder
  sentinel needed in the YAML itself (booleans can't hold `<PLACEHOLDER>` cleanly) — instead, a
  new PS item asks directly ("Does this repo have a formal release process — versioned publish,
  tagged deploy, etc.?") with `resolution` recorded in `pending-setup.yaml` itself, and the
  resolution pass writes the boolean directly once answered/waived. (This is the one widened item
  that doesn't use the placeholder-sentinel mechanism, since the field type doesn't support it —
  `check-setup-complete.mjs` is not changed for this one field; completeness is enforced by
  `check-pending-setup.mjs`'s open/resolved/waived accounting instead, consistent with how
  non-string fields already have to work.)
- **Risks and non-goals** (`domain.yaml` `constraints.product[]`): one new PS item ("Anything
  specific the AI agent should never do in this repo, beyond the generic defaults already
  listed?") — waivable ("no additional constraints" is valid and common). No template sentinel
  change needed; the existing generic constraints array already has real (non-placeholder)
  content, so this is purely a PS-item-driven prompt, resolved by either appending a new
  `constraints.product[]`/`constraints.safety[]` entry or marking the PS item waived.

Deliberately **not** widened (left as sensible silent defaults, matching the Brief's constraint):
`domain.glossary`/`preferred_terms`/`discouraged_terms` (niche, addable organically later),
`branch_policy`'s two boolean fields (safe conservative defaults), `paths.generated_outputs`/
`public_contracts` (niche), `gates.deployment` (niche).

### Phase 4 design — SKILL.md Step 5e + reference doc sync

Step 5e currently describes an opt-in pre-commit hook (`workflow/validators/hooks/pre-commit`)
offered as a yes/no question at the very end of setup. Since this branch now sits directly on top
of PR #45 (`239f1f2`), the real, already-shipped mechanism is known precisely: `agentsmyth init`
installs a **mandatory, automatic** pre-commit hook (`src/assets/hooks/pre-commit`, via
`installPreCommitHook()`) unconditionally, before the setup skill ever runs — no opt-in question,
no `workflow/validators/hooks/pre-commit` path (that path never existed; the real one lives at
`.git/hooks/pre-commit` or the repo's configured `core.hooksPath`). Step 5e is rewritten (not just
softened) to remove the yes/no question entirely and instead note, factually, that the hook is
already installed by `init` and enforces `agentsmyth check --staged` on every commit, bypassable
with `git commit --no-verify` — matching `README.md`'s own "Mandatory local lifecycle gate"
section verbatim in spirit. This is now definitive, not hedged, since both mechanisms are visible
in the same tree.

`config-map.md` needs no field additions — its 7-topic table already lists every field this Plan
touches (confirmed in Think). `inspection-checklist.md` gets two additions: CI-config-file
detection (already implied by its existing "Config and Tooling" section, made explicit for the
provider-label mapping) and package.json multi-script detection (test/build/lint enumeration,
not just "a" command).

### Phase 5 design — regression

Run the full existing local suite plus manual scratch-repo scenarios exercising each new
inference path (CI detected / not detected; secrets dir present / absent; multiple package.json
scripts / none) and each new PS item's three resolution outcomes (inferred, answered, waived).

## Phases

### Phase 1 - Fold check-setup-complete into `agentsmyth check`

- **Manifest IDs:** R1, RI1, RI2
- Touches: `bin/agentsmyth.mjs`, `src/workflow/validators/check-setup-complete.mjs`
- Work: Resolve `check-setup-complete.mjs` via the already-shipped `resolveValidator()` helper
  (same call already used for `check-lifecycle.mjs`/`check-commit-coverage.mjs`); run it before the
  lifecycle-gate validator, aggregate output, exit non-zero if either fails.
- **Exit gate:** Fresh scratch `agentsmyth init` + immediate `agentsmyth check` fails with
  `check-setup-complete`-style errors; this repo's own `agentsmyth check` still passes cleanly;
  standalone `node workflow/validators/check-setup-complete.mjs` invocation unchanged.
- Note (added post-hoc, matching actual Build execution): `src/workflow/validators/check-setup-complete.mjs`
  itself needed a fix (`definitionsRootIsSet()` didn't respect `AGENTSMYTH_HOME`) — found live
  while verifying this exact exit gate against this repo's own dev workspace, not scope creep.

### Phase 2 - Inference-only widening

- **Manifest IDs:** R2
- Touches: `bin/agentsmyth.mjs` (`headlessBootstrap()`)
- Work: CI-gate detection, protected-path secrets-directory detection, multi-command verification
  detection — all via `existsSync`/directory listing, no new PS items, no new questions.
- **Exit gate:** Scratch repo with real `.github/workflows/`, a `secrets/` dir, and `package.json`
  `test`/`build`/`lint` scripts produces a `release.yaml` with real CI values, a widened
  `paths.protected[]`, and 3 `verification.yaml` `commands[]` entries — with zero new questions
  asked for any of it.

### Phase 3 - New waivable pending-setup items

- **Manifest IDs:** R2
- Touches: `bin/agentsmyth.mjs` (`headlessBootstrap()`), `src/assets/workflow/config/repo-profile.yaml`,
  `src/assets/workflow/config/source-of-truth.yaml`
- Work: Add placeholder sentinels + matching PS items for key paths and source-of-truth; add the
  release-process boolean PS item (no sentinel, PS-tracked only); add the risks/non-goals PS item.
- **Exit gate:** A scratch repo's `pending-setup.yaml` contains the new items with correct
  `id`/`config`/`field`/`question`/`hint`/`status: open` shape; each is independently resolvable
  via inference, a direct answer, or an explicit waiver, verified for all three paths on at least
  one item.

### Phase 4 - SKILL.md + reference doc reconciliation

- **Manifest IDs:** R3, R4
- Touches: `src/setup/SKILL.md`, `src/setup/references/inspection-checklist.md`
- Work: Rewrite Step 5e to describe the real, already-shipped mandatory automatic hook
  (`installPreCommitHook()`/`src/assets/hooks/pre-commit`), removing the opt-in question and the
  nonexistent `workflow/validators/hooks/pre-commit` path entirely; add CI/multi-script detection
  notes to `inspection-checklist.md`; confirm `config-map.md` needs no changes.
- **Exit gate:** `SKILL.md` no longer describes an opt-in end-of-setup hook question or the
  nonexistent hook path; `check-setup-refs.mjs` still passes (no new orphaned field references).

### Phase 5 - Regression

- **Manifest IDs:** R5
- Touches: `test/run-setup-complete-tests.mjs` (extend), `test/run-init-prepare-interop-tests.mjs`
- Work: Run full existing suite; add scratch-repo manual QA scenarios for each new inference path
  and each new PS item's three resolution outcomes; extend the setup-complete regex fixture tests
  if the widened placeholder fields need new coverage.
- Note (added post-hoc, matching actual Build execution): running the full suite surfaced a real,
  expected consequence of R1 (not a bug) — `init-prepare-interop:test`'s F5 scenario asserted
  `agentsmyth check` exits 0 after headless bootstrap, which is no longer true for a repo that
  never actually completed setup. `test/run-init-prepare-interop-tests.mjs` needed updating to
  test what F5 actually intends (validator resolution) plus a new F6 confirming the new gate
  fires correctly — this was necessary follow-through of R1, not scope creep.
- **Exit gate:** All 9 named suites from the Brief's Success Metrics pass with zero regression;
  manual QA scenarios documented with real command output in the Task artifact.

### Phase 6 - Resolve the orphaned pre-commit hook file

- **Manifest IDs:** R6
- Touches: `src/assets/hooks/pre-commit`, `src/workflow/validators/hooks/pre-commit` (delete)
- Work: Added mid-chain at Ship, per explicit user direction ("Look at it now and resolve it")
  rather than deferred as an open item. `src/workflow/validators/hooks/pre-commit` (found during
  Phase 4) and the PR #45 mandatory hook are complementary, not redundant: the mandatory hook
  checks staged-file coverage; the orphaned hook checked phase-gate readiness specifically for
  staged lifecycle artifact files (infers the entering phase from the artifact's directory,
  verifies via `agentsmyth check --phase/--slug`). Folded the orphan's phase-gate logic into the
  mandatory hook script so one hook does both checks, then deleted the now-fully-absorbed orphan
  (confirmed tracked in git history, so recoverable if ever needed — not destroyed).
- **Exit gate:** A real scratch-repo commit of a lifecycle artifact with an unapproved checkpoint
  is rejected by the merged hook with the phase-gate error; the same artifact, once properly
  approved, commits successfully end-to-end; the orphaned file no longer exists anywhere in the
  tree; full regression suite still passes.

## Dependency Order

Phase 1 → Phase 2 → Phase 3 (Phase 3 reuses Phase 2's inference helpers where applicable, e.g.
directory-listing logic shared between key-paths detection and existing structure) → Phase 4
(independent of 1-3, could run in parallel, but sequenced last since it's the smallest and
benefits from Phase 1-3's final field list being settled) → Phase 5 (needs 1-4 complete).

## Branch Strategy

`deepen-setup-interview`, rebuilt (per explicit user instruction) on top of
`mandatory-lifecycle-pre-commit-hook` at `239f1f2` instead of `origin/main` — confirmed zero
unique commits existed on the prior version of this branch before the rebuild, so no history was
lost. This branch now carries PR #45's commits too; when PR #45 merges to `main` first (the
expected order, since it's already open with CI green), this branch will need a rebase onto `main`
before it can also merge — expected, not a problem to solve now. If PR #45 changes further before
merging, this branch needs a re-rebase to stay current — explicitly accepted as ongoing
maintenance, not a one-time cost.

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner | Manifest IDs |
|---|---|---|---|---|---|
| Folding check-setup-complete into `agentsmyth check` produces a false failure for this repo's own already-complete dogfood state | Low | Medium | Explicitly verified as a Phase 1 exit-gate criterion, not assumed | agent | R1 |
| Widened inference logic (CI detection, secrets-dir detection) produces false positives that misrepresent a repo's real policy | Low | Low | Purely additive (never removes/narrows existing safe defaults); worst case is a slightly-too-cautious protected-path or CI flag, not a missing one | agent | R2 |
| PR #45 changes further before merging, requiring a re-rebase of this branch | Medium | Low | Accepted ongoing maintenance cost per Branch Strategy above; re-verify full suite after any rebase | agent | — |

## Verification Plan

| Manifest ID | Verification method | Command / Scenario |
|---|---|---|
| R1 | Manual QA + Command | Fresh scratch `init` + `check` (expect failure); this repo's own `check` (expect pass) |
| R2 | Manual QA | Scratch repos with/without CI config, secrets dirs, multiple package.json scripts |
| R3 | Command (inspection) | `grep` for stale Step 5e wording; `check-setup-refs.mjs` |
| R4 | Command | `check-setup-refs.mjs` |
| R5 | Command | Full 9-suite regression list from Brief's Success Metrics |

## Architecture Notes

- role: Architect
- decision: Split "deepen the interview" into inference-only (Phase 2) vs. question-worthy
  (Phase 3) categories explicitly, rather than treating all widened fields uniformly — this is
  the mechanism that satisfies "bearable."
- constraint: Zero runtime dependencies (existsSync/directory listing only, no YAML parsing of
  arbitrary CI files).
- tradeoff: CI provider detection is presence-based only (existence of `.github/workflows/`, not
  parsing job names/steps) — accepted as sufficient signal for `gates.ci.required`/`provider`,
  full CI-config parsing is out of scope.
- downstream: Any future widening of pending-setup coverage should follow the same
  inference-vs-question split this Plan establishes, and reuse the placeholder-sentinel-in-array
  pattern introduced in Phase 3 for new array-type fields.

## Assumptions Verified

| Assumption ID | Status | Evidence / Question |
|---|---|---|
| A1 | evidence-backed | Re-read `check-setup-complete.mjs` and `check-pending-setup.mjs` directly this Plan (as they exist on top of PR #45's `239f1f2`): Check 2 (literal `<PLACEHOLDER>` scan → hard error), Check 6 (`<USER-TODO:...>` scan → warning only), and `check-pending-setup.mjs`'s `waived` status (never surfaced, never blocking) all already exist unchanged. Phase 1/3 reuse this three-state model as-is — no new state machine introduced. Holds. |

## Open Questions

None — Q1 from the Brief is resolved in Approach above.

## Checkpoint Approval

- Checkpoint: plan-review
- Status: approved
- User's own words (verbatim, this turn): "Approved"

## Exit Gate

- [x] Every active R and RI appears in Requirement Coverage, Phases, and Verification Plan.
- [x] User approved or waiver recorded.

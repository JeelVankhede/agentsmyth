---
slug: wp-r23-agents-md-fallback
version: 1
artifact: verify
status: ready-for-next-phase
created: 2026-09-13
updated: 2026-09-14
manifest_ids: [R1, R2, R3, R4, R5, R6, RI1, RI2, RI3, RI4, RI5, RI6, RI7]
upstream:
  - workflow/artifacts/briefs/wp-r23-agents-md-fallback-v1.md
  - workflow/artifacts/plans/wp-r23-agents-md-fallback-v1.md
  - workflow/artifacts/tasks/wp-r23-agents-md-fallback-v1.md
  - workflow/artifacts/reviews/wp-r23-agents-md-fallback-v1.md
orchestration:
  phase: test
  status: ready-for-next-phase
  next_phase: ship
  blockers: []
  user_checkpoint: none
---

# WP-R23 — Generic AGENTS.md Adapter Fallback - Verification

## Inputs

- Brief, plan, task and review artifacts for `wp-r23-agents-md-fallback-v1`, all
  `ready-for-next-phase`. Review recommendation `pass` after both findings were closed in a Build fix
  pass.
- `workflow/config/verification.yaml` — `npm run validate` and `npm run violations:test` are the two
  commands marked `required: true` for the `review` and `ship` phases. `manual_qa.enabled: true`.
  `generated_output.source_only_inspection_is_not_enough: true`.
- Branch `feat/wp-r23-agents-md-fallback`, nothing committed.

Every command below was run in this phase against current working-tree state. None is carried over
from Build's log — Build's evidence is cited only where this phase deliberately re-ran the same check
and got the same answer.

## Automated Checks

| Command | Outcome | Evidence |
|---|---|---|
| `npm run validate` | pass | exit 0. Configured required command. |
| `npm run violations:test` | pass | exit 0; suite reports its own count — `93/93 council fixtures emit exactly one error`. Configured required command. |
| `npm run conformance:test` | pass | exit 0; `48/48 conformance checks passed`. Includes `r22-every-suite-runs-in-ci`, which is what caught the new suite being registered but unwired during Build. |
| `npm run agents-md:test` | pass | exit 0; `20/20 AGENTS.md fallback checks passed`. The suite this work added. |
| `npm run setup-refs:test` | pass | exit 0; `5/5 setup-refs checks passed`. |
| `npm run setup-checks:test` | pass | exit 0; `13/13 setup-complete checks passed`. |
| `npm run root-resolution:test` | pass | exit 0; `21/21 root-resolution drift checks passed`. |
| `npm run init-prepare-interop:test` | pass | exit 0; `38/38 init/prepare interoperability checks passed`. The suite most likely to notice an `init` regression. |
| `npm run checkpoint-approval:test` | pass | exit 0; `9/9 check-lifecycle phase-gate cases correct`. |
| `npm run setup-validator-definitions-root:test` | pass | exit 0; `3/3 setup-validator definitions_root cases correct`. |
| `npm run tuning-merge:test` | pass | exit 0; `15/15 tuning-merge assertions passed`. |
| `npm run commit-coverage:test` | pass | exit 0; `7 passed, 0 failed`. |
| `npm run domain-placeholders:test` | pass | exit 0; `5/5 domain-placeholder checks passed`. |
| `node src/workflow/validators/check-scope-fence.mjs` | pass | exit 0 against the amended plan. |
| `npm run mutation:audit` | **not run** | Deliberate. Costs tens of minutes and `release.yml` runs it at dispatch. See Skipped Checks. |

`test/mutation-baseline.json` is unchanged — no validator rule was added by this work, so the ratchet
must not move, and it did not.

## Manifest Coverage

| Manifest ID | How Verified | Evidence | Result | Notes |
|---|---|---|---|---|
| R1 | command | `agents-md:test` A1–A2; manual QA STEP 2 | pass | File created when absent; exactly one marker pair. |
| R2 | command | `agents-md:test` B1–B2, C1–C4; manual QA STEP 3 | pass | Two runs byte-identical; older-stamped block replaced in place, not duplicated. |
| R3 | command + manual | `agents-md:test` D1, E1–E4; manual QA STEP 4 | pass | Non-block region byte-identical, including across an orphan `BEGIN`. |
| R4 | command + manual | `agents-md:test` A4–A5; manual QA STEP 5 | pass | Block names `.git/hooks/pre-commit` and a file exists there. Verified in a consumer-shaped repo, not this one. |
| R5 | command | `wc -l` = 23 against a ≤ 25 gate; `agents-md:test` A7 | pass | Bound met, and the setup trigger F1 restored is inside it. |
| R6 | source | Placement in `bin/agentsmyth.mjs`; absent from `src/setup/SKILL.md`; `setup-refs:test` | pass | Both halves. |
| RI1 | source | `src/setup/SKILL.md` diff; `setup-checks:test` 13/13 | pass | Single writer. Codex row collapsed. Residual risk unchanged and recorded below. |
| RI2 | source | Marker pair documented beside the global-gate table; HTML-comment form retained | pass | Consistent with the claude/copilot gate convention. |
| RI3 | generated-output | Two consecutive builds, identical md5 for both bundles; bundle content greps | pass | See Generated Output Evidence. |
| RI4 | command | All 13 suites green; `mutation-baseline.json` unchanged | pass | |
| RI5 | manual | Manual QA scenario below, full transcript | pass | A hand-authored `AGENTS.md` with real content above and below survived two `init` runs verbatim. |
| RI6 | waiver | Skipped Checks row below | **skip** | Deliberate. Nothing validates example `AGENTS.md` files, so a fixture would be coverage theatre. Owner: user. Does not block ship. |
| RI7 | source | `CHANGELOG.md` 1.1.0 entry contains the fallback item; `git diff package.json` is one added script line | pass | Entry date deliberately unchanged — corrected at dispatch per `docs/release-checklist.md`. |

Twelve pass, one skip. No fails.

## Manual QA

**Scenario.** A consumer repo that already has a hand-written `AGENTS.md` — the case the whole work
package exists for, and the one `[safety-2]` makes risky — runs `agentsmyth init` twice.

**Environment.** Fresh `git init` repo in an isolated scratch directory, with an isolated scratch
`HOME` so nothing could touch the developer's real `~/.agentsmyth`. Package version 1.0.1.

**Steps and observations.**

| Step | Expected | Observed |
|---|---|---|
| 1. Seed a user-authored `AGENTS.md` (200 bytes: title, House rules with two real constraints, Contact section) plus a README | no agentsmyth markers present | 0 marker pairs |
| 2. `init` | exactly one pair added; every authored line intact | exit 0; 1 pair; every authored line present; the `src/ledger/` house rule intact verbatim |
| 3. `init` again, modelling a later upgrade | byte-identical file | `true`; still 1 pair |
| 4. Compare the non-block region across both runs | unchanged, authored text verbatim | unchanged; authored text preserved verbatim |
| 5. Inspect what the block actually claims | hook path resolves; setup trigger present; no token leak | names `.git/hooks/pre-commit`, file exists; setup trigger present; no unrendered `{{TOKEN}}` |

**Outcome.** pass.

**Evidence.** Full transcript captured in this session. The non-block region after two runs reproduced
the seeded file exactly:

```
# Acme Payments Service

## House rules

- Never touch `src/ledger/` without a second reviewer.
- Migrations are append-only. Ask before editing one.

## Contact

Ping #payments-eng before a release.
```

**Manifest IDs.** RI5, and corroborating R1, R2, R3, R4.

## Generated Output Evidence

| Check | Command / path | Result |
|---|---|---|
| Build determinism | `npm run build` twice, `md5 -q` on both bundles | identical hashes |
| Bundle carries the new Step 5a.1 subsection | `grep -c 'Repo-local marker' dist/setup-bundle.md` | 1 |
| Bundle carries the corrected Step 5c log line | `grep -c 'owned by init — marked block already written' dist/setup-bundle.md` | 1 |
| Bundle no longer carries the removed append rule | `grep -c 'Append the agentsmyth section' dist/setup-bundle.md` | 0 |
| Asset ships as a file, not via a bundle | `package.json` `files` includes `src/assets/`; asset text in bundles | `true`; 0 occurrences, as expected |

`dist/` is gitignored and untracked, so no diff can demonstrate freshness. The guarantee that no stale
bundle ships is structural and lives in `.github/workflows/release.yml` line 51, which runs
`node scripts/build-bundle.mjs` inside the Verify step before `npm pack` and `npm publish`. Recorded
because the plan's original RI3 gate — "`git status --porcelain dist/` is empty" — could never fail on
an ignored path and therefore proved nothing.

## Findings

none

Review findings F1 (P1) and F2 (P2) were closed in the Build fix pass before this phase and were
re-verified here rather than taken on trust: R4 and R5 above are backed by this phase's own manual QA
and suite runs, not by the fix description.

## Skipped Checks

| Check | Why Skipped | Risk | Owner | Blocks Ship | Manifest IDs |
|---|---|---|---|---|---|
| Example-repo regression coverage for the marker block | No validator reaches example `AGENTS.md` files: `check-domain-placeholders.mjs` excludes `^examples/` and `scripts/validate-example.mjs` has no `AGENTS.md` handling. A fixture would produce the appearance of coverage with none behind it. | A regression in block placement would not be caught by the example corpus. Narrow in practice: `agents-md:test` exercises all five behaviours against real scratch repos, which is stronger than a static fixture. What goes unchecked is the shape of a shipped example, not the behaviour. | user | no | RI6 |
| `npm run mutation:audit` | Costs tens of minutes by design, and `release.yml` runs it as its own step at dispatch. Running it here would duplicate that without changing the answer: this work added no validator rule, so the ratchet has nothing new to measure. | If this work had silently weakened an existing validator rule, the audit would be the check that noticed. Mitigated by the baseline being unchanged and by the audit running unconditionally at release. | agent | no | RI4 |

## Architecture Notes

- role: Senior QA
- **decision**: RI5 was verified by a manual trial against a *consumer-shaped* repo rather than
  against agentsmyth's own. That distinction is the whole reason F2 existed — this repo sets
  `core.hooksPath`, so verifying here would have reproduced the same blind spot that let a wrong hook
  path through Build with a green gate.
- **decision**: the review's findings were re-verified rather than accepted as closed. A fix pass
  self-reporting success is the weakest form of evidence available, and F2 in particular was a case of
  a check agreeing with its own hardcoded expectation.
- **constraint**: `verification.yaml` `generated_output.source_only_inspection_is_not_enough` — RI3 is
  backed by two builds and hash comparison, not by reading `build-bundle.mjs`.
- **tradeoff**: `mutation:audit` not run here. Recorded as a skipped check with an owner rather than
  quietly omitted, because a coverage ratchet nobody ran is indistinguishable from one that passed.
- **downstream**: Ship must not present this merge as closing 1.1.0 — WP-R20 and WP-R24 are in the
  release too (brief Q3). Rollback scope is this branch alone. The RI6 skipped check carries an owner
  of `user` and needs to survive into the ship artifact rather than being dropped as resolved.

## Review Pass 2 Verification (2026-09-14)

Review pass 2 raised five findings (F3-F7) and three recorded-only observations. Every fix was
re-verified here against a fresh run rather than accepted from the fix description — the same rule
this phase applied to F1 and F2, and for the same reason: a fix pass self-reporting success is the
weakest evidence available.

### Suite re-run after the fixes

Every command below was re-run at current working-tree state, after `npm run build`.

| Command | Outcome | Evidence |
|---|---|---|
| `npm run build` | pass | Bundles regenerated; `src/assets/adapters/` re-synced from `src/adapters/`. |
| `npm run validate` | pass | exit 0. Configured required command. |
| `npm run violations:test` | pass | exit 0; `210/210 violations detected`, `93/93 council fixtures emit exactly one error`. Configured required command. |
| `npm run conformance:test` | pass | exit 0; `48/48 conformance checks passed`. See the `shipped-neutrality` note below — this one failed first and is the only red this pass produced. |
| `npm run agents-md:test` | pass | exit 0; `26/26 AGENTS.md fallback checks passed`, up from 20/20 — scenario F adds six. |
| `npm run setup-refs:test` | pass | exit 0; `5/5 setup-refs checks passed`. |
| `npm run setup-checks:test` | pass | exit 0; `13/13 setup-complete checks passed`. |
| `npm run root-resolution:test` | pass | exit 0; `21/21 root-resolution drift checks passed`. |
| `npm run init-prepare-interop:test` | pass | exit 0; `38/38 init/prepare interoperability checks passed`. The suite most likely to notice the `init` call-order change. |
| `npm run checkpoint-approval:test` | pass | exit 0; `9/9 check-lifecycle phase-gate cases correct`. |
| `npm run setup-validator-definitions-root:test` | pass | exit 0; `3/3 setup-validator definitions_root cases correct`. |
| `npm run tuning-merge:test` | pass | exit 0; `15/15 tuning-merge assertions passed`. |
| `npm run commit-coverage:test` | pass | exit 0; `7 passed, 0 failed`. |
| `npm run domain-placeholders:test` | pass | exit 0; `5/5 domain-placeholder checks passed`. |
| `node src/workflow/validators/check-scope-fence.mjs` | pass | exit 0; `check-scope-fence: ok`. See the scope note in the review artifact for why three touched files are deliberately absent from the task's Changed Files. |
| `npm run mutation:audit` | **not run** | Unchanged from the first pass: no validator rule was added or altered, so the ratchet has nothing new to measure, and `release.yml` runs it at dispatch. Recorded in Skipped Checks. |

`test/mutation-baseline.json` is unchanged. No validator rule was added by this pass either.

**One genuine red, recorded rather than smoothed over.** `conformance:test` failed at `47/48` on the
first run after the F6 fix: `shipped-neutrality` rejected the two `WP-R23` references the new
`src/adapters/README.md` section carried. `src/` is copied verbatim into consumer repos and into
`~/.agentsmyth`, so an internal ticket ID there is a real defect, not a lint nuisance. The references
were removed and the reasoning kept — which is exactly what that rule's own comment asks for — and
the suite returned `48/48`. Worth stating because it is the only check this pass actually caught
something with, and because it is a trap for the next person editing a file under `src/`.

### Per-finding evidence

| Finding | Fix | How it was verified here |
|---|---|---|
| F3 | `site/uninstall.md`: `AGENTS.md` added to the footprint list marked "not the whole file"; new `## Removing the AGENTS.md block` section mirroring the pre-commit hook section | Read back in full. The closing "That's the entire per-repo footprint" sentence now follows a list that includes `AGENTS.md`, and the removal instruction ("delete the lines between the two markers, inclusive") matches the marker grammar `init` actually writes, confirmed against a rendered block from a scratch repo. |
| F4 | `site/setup.md` Phase 5 bullet rewritten: no Codex placement, `init` owns root `AGENTS.md`, replace-in-place not append-under-a-heading | Cross-checked against the two sources it must agree with — `src/setup/SKILL.md` §5a.1's Codex row ("none — nothing to place") and `placeAgentsMd()`'s actual write path. Both claims the old bullet made are now absent, and no new claim is made that the code does not perform. |
| F5 | `installPreCommitHook()` returns the written path or `null`; `init` calls it before `placeAgentsMd()`; `placeAgentsMd(repoDir, pkgRootDir, hookPath)` renders one of two `{{GATE_PARAGRAPH}}` variants | Scenario F (6 checks) plus two hand trials, below. Mutation-verified. |
| F6 | `src/adapters/README.md`: "Placed where" column, AGENTS-compatible row reading "nowhere — bundle-only", new section stating no step places it and not to add one; five-adapter invariant retained with its reason | `grep` confirms `bin/agentsmyth.mjs` reads only `codex/global-gate.md` and `codex/invocation-prompt.md`, never `codex/AGENTS.md`; `render-adapters.mjs` still lists it and still passes, so the sync check the decision relies on is real. `conformance:test` green after the neutrality fix. |
| F7 | Comment above `renderAdapterTemplate()` rewritten to state the call is load-bearing and to name `{{GATE_PARAGRAPH}}` and A6 | Read against the code it describes. The asset carries exactly one token (`{{GATE_PARAGRAPH}}`); rendering it is what produces the gate sentence in both states, so the call cannot be a no-op. |

### Hand trials — both rendered states

Both run as real `agentsmyth init` subprocesses in isolated scratch directories with an isolated
scratch `HOME`, not by reading the asset.

| Environment | Expected | Observed |
|---|---|---|
| `git init` repo | block names a hook path; the file exists there | `A pre-commit hook at \`.git/hooks/pre-commit\` rejects any commit whose…`; file present |
| Plain directory, never `git init`-ed | `init` warns and skips the hook; block asserts no hook at any path; `init` still exits 0 | warned `not a git repository (or hooks path unavailable) — skipping mandatory pre-commit hook install`; block reads `**The gate is not installed.** \`agentsmyth init\` found no git repository here…`; `AGENTS.md` written; exit 0 |

Rendered block body is 23 lines in both states — unchanged from the measurement R5's ≤ 25 gate was
taken against, even though the asset file itself dropped from 23 to 21 lines when the three-line
gate paragraph became a one-line token.

**R4 in the non-git state.** R4's acceptance is "rendered block contains the hook's path and states
that it refuses commits which skip phases". With no hook installed there is no path to contain and
nothing that refuses anything, so R4 is vacuous there rather than failed. The block says so
explicitly instead of going silent, which is the honest reading of a requirement written for the
case where a hook exists.

### Mutation verification

Two mutations, both applied to `bin/agentsmyth.mjs`, both restored from a backup held **outside the
repository** (the session scratchpad) so no `.mutation-backup` file could ever be created under the
working tree.

| Mutation | Expected | Observed | Restored |
|---|---|---|---|
| Revert F5: `placeAgentsMd()` back to `(repoDir, pkgRootDir)` resolving the hook path itself via `resolveHooksDir()`, called before `installPreCommitHook()` | scenario F fails, A–E unaffected | `24/26` — fails exactly `F3-no-phantom-hook` and `F4-no-dangling-path`; A, B, C, D, E all green | md5 `1482138b4b0cd64d317e9b70a9b2e668` matches pre-mutation; `26/26` |
| Revert the tempered block pattern: middle back to a plain `[\s\S]*?` | fails exactly E1, E2, E4 | `23/26` — fails exactly `E1-content-survives`, `E2-section-survives`, `E4-orphan-kept`; `E3-one-pair` **passes** | md5 `1482138b4b0cd64d317e9b70a9b2e668` matches pre-mutation; `26/26` |

Both mutations were run twice: once when the fixes landed, and again after a late robustness tweak
to `placeAgentsMd()`'s `hookPath` test changed the file. The results above are that second run,
against the bytes as they stood **at the end of pass 2** — a mutation result measured against a file
that has since changed is not evidence about the file that ships. Review pass 3 changed
`bin/agentsmyth.mjs` again (F8), so this table is a historical record of pass 2 and the md5 above is
no longer the working tree's; both mutations were re-run against the current file and are recorded
with the current baseline under § Review Pass 3 Verification.

The F5 mutation is necessarily the ordering *and* the argument threading together — the two cannot
be separated, because `placeAgentsMd()`'s third argument does not exist until
`installPreCommitHook()` has returned. That inseparability is the fix: the block is structurally
incapable of being written before the hook's fate is known, and the test is a second line of defence
rather than the only one.

The second mutation reproduces the first pass's result exactly and doubles as the evidence for
recorded observation 1 — `E3` passing under it is precisely why it is not independent evidence of the
tempering.

### Recorded-only observations — verified, not assumed

Each was reproduced before being written down, so none is recorded on reasoning alone.

| Observation | How confirmed |
|---|---|
| `PAIR_RE` is untempered, so E3 passes under the tempering mutation | The mutation run above: `E3-one-pair` green while E1/E2/E4 red. Recorded as note 3 in the suite header. |
| The two-block sweep leaves blank-line residue | Scratch repo seeded with two well-formed pairs separated by one blank line each side. After `init`, the region between the surviving block's `END` and the following text holds three consecutive blank lines where the input held one. No user content lost. Cosmetic. |
| A fenced marker sample inside `AGENTS.md` is replaced with a live block | Scratch repo whose `AGENTS.md` contained a fenced three-line marker sample. After `init`, the full live block was rendered inside the fence, stamped with the current version. Recorded in `src/setup/SKILL.md`'s repo-local marker section with workarounds. |

### Findings from this pass

none open. F3-F7 all closed and re-verified above.

### Manifest impact

No manifest ID changes state. R4, R5, R6 and RI1 gain evidence rather than losing it: R4 is now
verified in both hook states instead of one, R5's bound is re-measured against the new rendered
block, and R6/RI1's single-writer claim is now consistent across `src/setup/SKILL.md`,
`src/adapters/README.md`, `site/setup.md` and `site/uninstall.md` rather than contradicted by three
of them.

### Recommendation

ship — unchanged. Nothing this pass found was a design flaw; F5 was the only code defect, and it is
closed structurally rather than by correcting a string.

## Review Pass 3 Verification (2026-09-14)

Review pass 3 raised two findings, F8 (P2) and F9 (P3). Both fixes re-verified here against fresh
runs, on the same rule applied to F1/F2 and F3-F7.

### Suite re-run after the fixes

Run at current working-tree state, after `npm run build`.

| Command | Outcome | Evidence |
|---|---|---|
| `npm run build` | pass | Bundles regenerated. |
| `npm run validate` | pass | exit 0. Configured required command. |
| `npm run violations:test` | pass | exit 0; `93/93 council fixtures emit exactly one error`. Configured required command. |
| `npm run conformance:test` | pass | exit 0; `48/48 conformance checks passed`. |
| `npm run agents-md:test` | pass | exit 0; `33/33 AGENTS.md fallback checks passed`, up from 26/26 — scenario G adds seven. |
| `npm run setup-refs:test` | pass | exit 0; `5/5`. |
| `npm run setup-checks:test` | pass | exit 0; `13/13`. |
| `npm run root-resolution:test` | pass | exit 0; `21/21`. |
| `npm run init-prepare-interop:test` | pass | exit 0; `38/38`. |
| `npm run checkpoint-approval:test` | pass | exit 0; `9/9`. |
| `npm run setup-validator-definitions-root:test` | pass | exit 0; `3/3`. |
| `npm run tuning-merge:test` | pass | exit 0; `15/15`. |
| `npm run commit-coverage:test` | pass | exit 0; `7 passed, 0 failed`. |
| `npm run domain-placeholders:test` | pass | exit 0; `5/5`. |
| `node src/workflow/validators/check-scope-fence.mjs` | pass | exit 0. |
| `npm run mutation:audit` | **not run** | Unchanged: no validator rule added or altered by this pass. Skipped Checks row still applies. |

`test/mutation-baseline.json` unchanged. No validator rule added by this pass either.

### F8 — reproduction before the fix

Recorded because a finding about a false claim deserves the transcript, not a summary. Scratch repo,
isolated scratch `HOME`, `git init` plus `git config core.hooksPath hooksfile` where `hooksfile` is a
regular file:

```
agentsmyth: could not create hooks directory at …/f8repo/hooksfile — skipping pre-commit hook install.
  EEXIST: file already exists, mkdir '…/f8repo/hooksfile'
```

and the block written by that same run:

```
**The gate is not installed.** `agentsmyth init` found no git repository here, so no pre-commit
hook was written and nothing refuses a commit that skips a phase. Run `agentsmyth init` again once
this directory is a git repo. …
```

`.git` was present throughout. The "no hook" half was true; the cause and the remedy were both false.

### F8 — both null branches after the fix

Real `agentsmyth init` subprocesses, isolated scratch `HOME`, not asset inspection.

| Branch | How reached | Block now reads |
|---|---|---|
| non-git guard | plain directory, never `git init`-ed | `**The gate is not installed.** No pre-commit hook was written, so nothing refuses a commit that skips a phase. …` |
| `mkdirSync` catch | `git init` + `core.hooksPath` → a regular file | byte-identical paragraph — no cause asserted in either |

Rendered block body remains 23 lines in all three states (installed, and both absent branches), so
R5's ≤ 25 bound is unaffected.

**R4 in the failed-install state.** As with the non-git state recorded in pass 2, R4's acceptance
("rendered block contains the hook's path and states that it refuses commits which skip phases") is
vacuous when no hook exists. The block says so explicitly rather than going silent, and now without
attributing a cause it cannot know.

### F9 — verification

Read the page end to end rather than diffing the one line. The `AGENTS.md` bullet now names the
pre-commit hook as the second file agentsmyth edits rather than creates, which is consistent with
*Removing the pre-commit hook* two sections below ("agentsmyth appended its block to the end of it
rather than overwriting anything"). No other claim on the page asserts a count of modified files, so
the contradiction is closed rather than relocated.

### Mutation verification — all three

Backups held **outside the repository** (session scratchpad); no `.mutation-backup` file was created
under the working tree at any point. Baseline `bin/agentsmyth.mjs` md5
`2df1ae4e967fe42a1467b21d36ce551c`, confirmed restored after each.

| Mutation | Expected | Observed | Restored |
|---|---|---|---|
| **New — F8:** restore the cause-asserting wording (`found no git repository here …`) | scenario G fails | `32/33` — fails exactly `G6-no-false-cause`. **Scenario F stays green**, because in a non-git directory the hardcoded cause happens to be true | md5 matches; `33/33` |
| **F5 ordering:** `placeAgentsMd()` back to `(repoDir, pkgRootDir)` resolving the hook path itself, called before `installPreCommitHook()` | F3, F4 — plus G5, see below | `30/33` — fails `F3-no-phantom-hook`, `F4-no-dangling-path`, `G5-no-phantom-hook` | md5 matches; `33/33` |
| **Tempered pattern:** middle back to a plain `[\s\S]*?` | E1, E2, E4 | `23/33` → fails exactly `E1`, `E2`, `E4`; `E3-one-pair` **passes** | md5 matches; `33/33` |

Two notes on the expected sets, since one of them moved.

**The F5 ordering mutation now fails three checks, not two.** `G5-no-phantom-hook` joined `F3` and
`F4`. This is coverage widening, not a changed defect: scenario G exercises a second `null`-returning
branch, and the reverted arrangement advertises a phantom hook path on that branch exactly as it does
on F's. The close-out expectation of "exactly F3/F4" was written before scenario G existed; the
correct expectation from here is F3, F4, G5.

**The F8 mutation failing only `G6` is the evidence that matters.** Had it also failed something in
scenario F, F8 would have been a defect pass 2 could have caught and did not. It does not — F's
directory genuinely has no git repository, so the old wording is accidentally true there. The
defect lived strictly in the gap between scenario A (hook installs) and scenario F (no repo at all),
which is the gap scenario G now occupies.

### Findings from this pass

none open. F8 and F9 both closed and re-verified above.

### Manifest impact

No manifest ID changes state. R4 gains evidence: it is now verified across three distinct hook
states — installed, absent-because-no-repo, and absent-because-the-install-failed — where pass 2
covered the first two and pass 1 covered only the first.

### Recommendation

ship — unchanged.

## Sign-Off

- Verifier: agent (Senior QA), single-agent mode — councils are Complex-only and this chain is Standard
- Date: 2026-09-13; re-verified 2026-09-14 after review pass 2, and again after review pass 3 (see those sections)
- Recommendation: ship

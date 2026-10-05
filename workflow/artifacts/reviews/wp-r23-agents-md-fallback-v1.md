---
slug: wp-r23-agents-md-fallback
version: 1
artifact: review
status: ready-for-next-phase
created: 2026-09-13
updated: 2026-09-14
manifest_ids: [R1, R2, R3, R4, R5, R6, RI1, RI2, RI3, RI4, RI5, RI6, RI7]
upstream:
  - workflow/artifacts/briefs/wp-r23-agents-md-fallback-v1.md
  - workflow/artifacts/plans/wp-r23-agents-md-fallback-v1.md
  - workflow/artifacts/tasks/wp-r23-agents-md-fallback-v1.md
orchestration:
  phase: review
  status: ready-for-next-phase
  next_phase: test
  blockers: []
  user_checkpoint: none
council:
  mode: single-agent
  resolution:
    dispatch_enabled: optional
    council_enabled: on-for-complex
    task_class: standard
---

# WP-R23 — Generic AGENTS.md Adapter Fallback - Review

## Findings

### F1 — P1 — RESOLVED 2026-09-13 — `src/assets/AGENTS.md` — the block no longer tells a fresh repo to run setup

**Manifest IDs:** R5 (and a brief-level gap, see below)

**Problem.** The old block's step 1 read: *"Check for `.agentsmyth/` — if it exists, read
`.agentsmyth/setup-bundle.md` and run the setup skill. Do not proceed to step 2 until setup is
complete and `.agentsmyth/` is removed."* The rewrite deletes it and nothing replaces it.

This matters **more** after this change, not less, because the file's placement moved. Previously the
block was written by the setup skill at Step 5a — that is, *after* setup finished and `.agentsmyth/`
was already gone, so its step 1 could never fire. It was dead text. Now `init` writes the block
*before* setup runs, so the file exists precisely during the window when `.agentsmyth/` is present —
the first moment that instruction would actually do something — and it is missing.

Consequence for the exact audience this work exists to serve. An agent with no first-class adapter
opens a freshly-initialised repo and reads the only file written for it. It is told to start at
`workflow/router.md`, falls back to `definitions_root`, and reaches the global install — so it will
begin lifecycle work. It is never told to run setup. `.agentsmyth/` is never removed, and
`check-setup-complete.mjs` treats that as an error (`'.agentsmyth/ still exists — agent must delete
it as the final step of Phase 5'`), so the repo sits permanently in a state its own validator reports
as incomplete.

Checked and ruled out as mitigations: the global gates do not carry the trigger either
(`src/adapters/claude/global-gate.md` says only "If `workflow/config/` is absent, run `agentsmyth
check`"), and `init`'s stdout tells the *human* to say "run the agentsmyth setup" — not the agent
reading the file.

**Fix recommendation.** Add the setup trigger back as one sentence, conditional on `.agentsmyth/`
existing. The block is 19 lines against R5's ≤ 25, so there is room without touching that gate.

**Note for Reflect, not for Build.** No `R` or `RI` in the brief ever required setup detection — R5
enumerated four concerns and setup was not among them. Build bounded the block exactly as specified
and still produced this gap, so the omission originates in the brief, not in the implementation.

### F2 — P2 — RESOLVED 2026-09-13 — `src/assets/AGENTS.md` — the hook path is wrong for every consumer

**Manifest IDs:** R4

**Problem.** The block states the hook is at `.githooks/pre-commit`. That path is correct only in
*this* repository, which sets `core.hooksPath=.githooks`. `installPreCommitHook()` resolves the
target as `git config core.hooksPath` when set, otherwise `<repo>/.git/hooks`
(`bin/agentsmyth.mjs`, the `hooksPath` assignment) — so a consumer repo with no `core.hooksPath`
gets the hook at `.git/hooks/pre-commit`.

Verified rather than reasoned: `init` was run in a fresh scratch git repo. The hook landed at
`.git/hooks/pre-commit`; `.githooks/pre-commit` did not exist; and the generated `AGENTS.md` named
`.githooks/pre-commit`. Every consumer therefore receives a block pointing at a file that is not
there.

R4's acceptance was "rendered block contains the hook's path and states that it refuses commits which
skip phases". The block contains *a* path and it is the wrong one, so R4 is met literally and failed
in substance.

**Fix recommendation.** Two options. Either drop the absolute path and describe the hook by what it
is ("a pre-commit hook installed by `agentsmyth init`"), which is true everywhere; or resolve the
real path at write time and pass it through the existing `{{TOKEN}}` mechanism, since
`placeAgentsMd()` already routes the asset through `renderAdapterTemplate()`. The first is smaller
and has no failure mode; the second is more informative. Naming a path at all is only worth doing if
it is the right one.

## Severity Summary

| Severity | Open | Found | IDs | Status |
|---|---|---|---|---|
| P0 | 0 | 0 | — | — |
| P1 | 0 | 1 | F1 | resolved in the Build fix pass |
| P2 | 0 | 1 | F2 | resolved in the Build fix pass |
| P3 | 0 | 0 | — | — |

## Requirement Coverage

| Manifest ID | Evidence | Status | Notes |
|---|---|---|---|
| R1 | `agents-md:test` A1–A4, real `init` in scratch repos | covered | File created, one pair, stamped, hook named — the path itself was F2 and is now resolved. |
| R2 | `agents-md:test` B1–B2, C1–C4 | covered | Idempotent and cross-version replace both proven. Mutation check confirms the suite fails when the tempered pattern is reverted. |
| R3 | `agents-md:test` D1, E1–E4 | covered | Byte preservation proven, including the orphan case that was genuinely broken mid-Build. |
| R4 | Scratch-repo `init`; block path checked against a real file; A4–A5, A7 | covered | F2 resolved: path now resolved per repo via `resolveHooksDir()` and a `{{HOOK_PATH}}` token, verified to name a file that exists. |
| R5 | `wc -l` = 23 against a ≤ 25 gate; A7 | covered | F1 resolved: setup trigger restored as a precondition, still inside the size bound. |
| R6 | Placement present in `bin/agentsmyth.mjs`, absent from `src/setup/SKILL.md` | covered | Both halves verified. |
| RI1 | `src/setup/SKILL.md` diff; `grep` for agent-driven writes | covered | Single writer established; Codex row collapsed. Residual risk below. |
| RI2 | Marker pair documented beside the global-gate table | covered | HTML-comment form retained, consistent with the claude/copilot gates. |
| RI3 | `npm run build`; second build byte-identical | covered | Deterministic. Real guarantee is `release.yml:51`, as the task log records. |
| RI4 | 13 release suites green; `mutation-baseline.json` unmoved | covered | Includes the conformance rule that caught the unwired suite. |
| RI5 | Scratch-repo trial with hand-authored content above and below | covered | Trial, not inspection, as `verification.yaml` requires. |
| RI6 | Skipped check recorded with all six required fields | **partial** | Example coverage deliberately not closed; owner user, `blocks_ship: no`. Correct call — see Residual Risk. |
| RI7 | CHANGELOG 1.1.0 entry; `package.json` version unchanged | covered | Date correctly left for dispatch. |

## Architecture Notes

- role: Staff Reviewer
- **decision** (original review, superseded by the fix pass — recommendation is now `pass`): `hold` rather than `pass-with-risk`. Both findings are in the same file,
  both are small, and both ship *wrong instructions* rather than merely incomplete ones — a block that
  names a nonexistent hook path and omits the one step a fresh repo must take is worse than no block,
  because it will be trusted. Neither is a design flaw; the architecture underneath them is sound.
- **constraint**: Review is read-only. Both fixes are Build's to make.
- **downstream**: Test should re-run `agents-md:test` after the fixes and add an assertion that the
  block's hook path resolves to a file that actually exists in the scratch repo — the current A4 check
  asserts the *string* is present, which is exactly why F2 survived Build with a green gate.

## Verification Reviewed

| Item | Outcome | Notes |
|---|---|---|
| `npm run validate` | pass | Exit 0 at review time. |
| `npm run violations:test` | pass | Exit 0. |
| `npm run conformance:test` | pass | Exit 0 — after the Phase 4 amendment wired the new suite into both workflows. |
| `npm run agents-md:test` | pass | 17/17. |
| Full 13-suite release list | pass | All green at Build handoff. |
| `check-scope-fence` | pass | Against the amended plan. |
| Mutation check on the new suite | pass | Reverting the tempered pattern fails E1/E2/E4 and leaves A–D green; restored copy byte-identical. Confirms the suite is load-bearing. |
| `test/mutation-baseline.json` | unchanged | No validator rule added, so the ratchet must not move — it did not. |
| A4 hook-path assertion | **inadequate** | Asserts the literal string is present, not that it resolves. This is the gap F2 slipped through. |

## Residual Risk

1. **`check-setup-complete`'s adapter check is now trivially satisfied.** `init` always writes
   `AGENTS.md`, and `AGENTS.md` is one of five entries in that validator's `adapterPaths`, so
   "at least one tool-native adapter present" can no longer fail. Accepted by the user via Q2 and
   recorded in the plan's Approach; every repair considered was worse. Owner: user. Does not block ship.
2. **RI6 — no example-repo coverage.** Deliberate, and the right call: `check-domain-placeholders`
   excludes `^examples/` and `validate-example.mjs` has no `AGENTS.md` handling, so a fixture would
   have produced the appearance of coverage with none behind it. Partially offset by
   `agents-md:test`, which exercises real scratch repos. Owner: user. Does not block ship.
3. **The version stamp is written but never read.** Nothing in the codebase parses a version out of a
   marker today; the stamp is provision for WP-R18. Its correctness in the direction that matters —
   a future release reading the stamp and migrating from it — is therefore untested, and will stay
   that way until something consumes it. Not actionable now; worth carrying to WP-R18.
4. **Plan amendment during Build.** Two workflow files were added to an approved plan's Phase 4
   touches. Recorded with a dated amendment block and surfaced to the user rather than absorbed. The
   underlying cause is worth noting: every per-phase gate was green while a registered suite ran
   nowhere, and only the full release list caught it.

## Fix Pass Verification (2026-09-13)

Both findings were returned to Build at the user's instruction and closed. Re-reviewed against the
resulting diff, not against the fix description:

| Finding | Fix | Evidence |
|---|---|---|
| F1 | Setup trigger restored as a precondition; block 19 → 23 lines | A7 asserts it in the written block; R5's ≤ 25 gate still met |
| F2 | `resolveHooksDir()` extracted and shared by the writer and the advertiser; `{{HOOK_PATH}}` token | Scratch repo: block names `.git/hooks/pre-commit`, file exists there |

The structural cause of F2 was duplication — two places independently deciding where the hook lives.
The fix removes the duplication rather than correcting one copy, so the two cannot drift again. That
is the right shape of fix and is why this re-review does not carry F2 forward as residual risk.

The assertion that allowed F2 through a green gate was replaced rather than supplemented: A4's
hardcoded string comparison became A4/A5 (a path is named, and it resolves), plus A6 guarding a
failure mode the fix itself introduced — an unrendered `{{TOKEN}}` reaching a consumer's file. Both
fixes were mutation-proven: reverting the token fails A5 at 19/20, restoring returns 20/20 with the
asset byte-identical.

Residual risks 1–4 below are unchanged by the fix pass and remain as recorded.

## Review Pass 2 (2026-09-14)

A second pass over the same diff, run at the user's instruction after the fix pass above closed F1
and F2. Its brief was narrow: the documentation surface the change moved, and the remaining seam
between the block's claims and what `init` actually does. Five findings, all closed in the same
session; three observations recorded without a fix; one item filed to the release rather than
carried here.

Every fix below was re-verified at Test against a fresh run rather than self-reported — see
`workflow/artifacts/verify/wp-r23-agents-md-fallback-v1.md` § Review Pass 2 Verification.

### F3 — P1 — RESOLVED 2026-09-14 — `site/uninstall.md` — the per-repo footprint list omits root `AGENTS.md`

**Manifest IDs:** R6, RI1

**Problem.** The page's "What `init` wrote to this repo" list enumerated `workflow/config/*.yaml`,
`workflow/artifacts/`, `workflow/learnings/` and the two conditional adapter files, then closed with
"Delete `workflow/` and, if present, the adapter file. **That's the entire per-repo footprint.**"
After this change it is not. `init` now also writes a marked block into the repository's root
`AGENTS.md`, and the page a user reaches when they want agentsmyth *gone* is the one page that did
not say so.

The sentence is the defect, not the omission. A list that is merely incomplete invites the reader to
look further; a list that closes by asserting completeness stops them. A user who followed this page
exactly would delete `workflow/`, believe the repo was clean, and still have an agentsmyth block in
the file their agent tool reads first — the one artifact most likely to be mistaken later for
something they wrote themselves.

**Fix.** Both halves. `AGENTS.md` added to the list, marked explicitly as *not the whole file*, and a
`## Removing the AGENTS.md block` section added mirroring the existing pre-commit hook section: the
marker pair shown, the stamp explained as "whichever version last ran `init` here", and the removal
stated as "delete the lines between the two markers, inclusive". The section says plainly that
everything outside the markers is the user's and was never written by agentsmyth, and that
`rm AGENTS.md` is equivalent only when the block is the entire file.

### F4 — P1 — RESOLVED 2026-09-14 — `site/setup.md` — the Codex bullet describes behaviour that no longer exists

**Manifest IDs:** R6, RI1

**Problem.** Line 50 read: *"Using Codex? No existing `AGENTS.md`? It writes one. Already have one?
It appends the agentsmyth section under its own heading and never overwrites yours."* Both claims
were inverted by this change:

1. **Who writes it.** Setup no longer places anything for Codex. `src/setup/SKILL.md` §5a.1's Codex
   row now reads "none — nothing to place", because `init` owns root `AGENTS.md` before that skill
   starts. The bullet sits under Phase 5 of the setup skill and attributes the write to a phase that
   does not perform it.
2. **How it merges.** There is no append and no `## agentsmyth` heading. The write is a marked-block
   replace-in-place located by pattern — which is the entire point of R2 and of the version stamp.

This is the worse kind of stale documentation: not silent about a new behaviour, but confidently
specific about the opposite of it. A reader who wanted to know whether their hand-written
`AGENTS.md` was safe would come away with the right conclusion for the wrong reason, and with a
false model of where the block lives in the file.

**Fix.** Bullet rewritten to state that Codex gets no per-repo placement at all, that `init` wrote
the root `AGENTS.md` before this skill started, and that an existing agentsmyth block is replaced in
place rather than appended under a heading — with the invariant that matters to the reader stated
last: everything outside the markers stays theirs on every run.

### F5 — P2 — RESOLVED 2026-09-14 — `bin/agentsmyth.mjs` — the block advertised a hook that was never installed

**Manifest IDs:** R4, RI4

**Problem.** Same class as F2, one step further out. F2 was *the wrong path*; this is *a path for a
hook that does not exist*.

`placeAgentsMd()` ran before `installPreCommitHook()` and resolved the hook location itself via the
shared `resolveHooksDir()`. In a non-git directory `installPreCommitHook()` warns
(`not a git repository (or hooks path unavailable) — skipping mandatory pre-commit hook install`)
and returns without writing anything — but `placeAgentsMd()` had already emitted
"**The gate is enforced, not advised.** A pre-commit hook at `.git/hooks/pre-commit` rejects any
commit…". Well-formed path, no file, and a categorical claim about enforcement that is false.

F2's fix could not have caught this, and it is worth being precise about why: sharing a resolver
makes two functions *agree about where a hook would go*. It cannot express whether one was written.
The reason scenario A never noticed is the same reason A4 never noticed F2 — A runs in a `git init`
repo, where the hook really is installed and the path really does resolve.

**Fix.** Three parts, and the third is the structural one.

1. `installPreCommitHook()` now returns the absolute path it installed, or `null` when it warned and
   skipped. Every `return` answers the same question honestly, including the idempotent
   already-installed path, which returns the target because a hook *is* there.
2. `init` calls it **before** `placeAgentsMd()` and passes the result in.
3. `placeAgentsMd()` takes `hookPath` as a parameter and no longer calls `resolveHooksDir()` at all.
   The asset's gate sentence became a `{{GATE_PARAGRAPH}}` token with two variants — the installed
   form naming the real path, and an absent form that states no hook was written, why, and what to
   do about it. The block cannot now be written before the hook's fate is known, because the
   argument it needs does not exist until then.

`resolveHooksDir()` drops to a single caller as a result. Its comment, which claimed deliberate
sharing between the writer and the advertiser, was rewritten rather than left to become the next
F7.

**Evidence.** New scenario F in `test/run-agents-md-tests.mjs`, six checks, exercising a real
non-git scratch directory. Mutation-verified: reverting the arrangement fails exactly F3 and F4 and
leaves A–E green. Both rendered variants inspected by hand.

### F6 — P2 — RESOLVED 2026-09-14 — `src/adapters/README.md` — "all five adapters" against SKILL.md's "nothing to place"

**Manifest IDs:** R6, RI1

**Problem.** The Included Paths table listed `adapters/codex/AGENTS.md` alongside four adapters that
are genuinely placed at tool-native paths, under a rule reading "Adapters … should be copied or
linked only when the corresponding tool needs a local instruction entrypoint", and closed with "All
five adapters must carry identical mandatory-gate content." `src/setup/SKILL.md` §5a.1 now says
Codex places nothing. Read together, the two files disagree about whether a fifth placement exists.

**Decision — the file stays, documented as bundle-only.** Stated explicitly because F6 asked for an
explicit decision, with the alternative and why it lost:

- *Considered: delete it.* It is placed by nothing — `bin/agentsmyth.mjs` reads only
  `codex/global-gate.md` and `codex/invocation-prompt.md`; SKILL.md's "Other / Unknown" row falls
  back to the Claude shim, not this one; `scripts/build-bundle.mjs` walks `src/adapters/` wholesale
  so removal would need no build-script edit beyond `scripts/render-adapters.mjs:8`.
- *Why it lost.* Removal would drop the file out of `render-adapters.mjs`'s gate-content loop, and
  nothing would replace that check — `src/assets/AGENTS.md` is a marker-bounded block, not a
  whole-file shim, and adding it to that loop would be a new validator rule this pass is fenced out
  of. It would also strand `CLAUDE.md` golden rule 3 ("All five adapters … must carry the same
  mandatory-gate content"), which is outside this pass's scope to amend. A five-member family kept
  mechanically in sync is worth more than one saved file.

**Fix.** Table gained a "Placed where" column naming each adapter's real target, with the
AGENTS-compatible row reading "nowhere — bundle-only". A new section states that no step places it,
that `init` owns root `AGENTS.md` directly and renders it from `src/assets/AGENTS.md`, that SKILL.md
§5a.1 lists Codex as "none — nothing to place", and — the part that matters for the next
maintainer — **do not add a placement for this file**, because that puts two writers back on the
same path. The five-adapter invariant is retained and now says *why* the bundle-only member is
included in it: `render-adapters.mjs` checks it, and a shim allowed to drift is worse than one that
was deleted.

Note for whoever edits that file next: it ships in `src/`, so the `shipped-neutrality` conformance
rule applies. The first draft of this fix named `WP-R23` twice and failed
`conformance:test` at 47/48. The reasoning stays; the ticket reference goes.

### F7 — P2 — RESOLVED 2026-09-14 — `bin/agentsmyth.mjs` — a comment asserting the opposite of the code

**Manifest IDs:** R4

**Problem.** The comment above the `renderAdapterTemplate()` call in `placeAgentsMd()` read
"renderAdapterTemplate() is a no-op on the current token-free asset, but routing through it keeps
this consistent with the sibling placements…". The asset has not been token-free since F2's fix
introduced `{{HOOK_PATH}}`; the call is load-bearing, and A6 exists precisely because an unrendered
token would otherwise reach a consumer's file. The comment survived the fix pass that falsified it,
one screen above the line that falsified it.

**Fix.** Rewritten to say the call is load-bearing rather than ceremony, to name `{{GATE_PARAGRAPH}}`
and the hook path it carries, and to name A6 as the guard on the failure mode the token introduces.

## Review Pass 2 — Recorded, Not Fixed

Three observations that did not warrant a code change. Each is written down where the next reader of
that file will hit it, rather than only here.

1. **`PAIR_RE` in the test suite is the untempered pattern, so E3 is not independent evidence.**
   The suite mirrors the implementation's pattern as a separate literal on purpose, so assertions
   cannot silently agree with whatever the implementation now does. The consequence: `pairCount()`
   uses the untempered form, and under the tempering mutation the swallowed file still reads as
   exactly one pair — **E3 passes**. Confirmed by running it: the mutation fails E1, E2 and E4 and
   nothing else. Recorded as note 3 in the suite's header so nobody reads a green E3 as proof the
   guard is in place. Not fixed: tempering `PAIR_RE` would make the assertions agree with the
   implementation by construction, which is the property the separate literal exists to prevent.

2. **The two-block sweep leaves blank-line residue.** When a file somehow carries two well-formed
   marker pairs, the extra is replaced with the empty string and the blank lines that surrounded it
   remain. Reproduced: a file with one blank line, a second block, and one blank line before the
   following text ends with three consecutive blank lines there. Cosmetic — Markdown collapses it,
   no user content is lost, and the input is already an anomaly. Not fixed: trimming around the
   removal means deciding how much whitespace next to a deleted block belongs to agentsmyth, and
   R3's rule is that nothing outside a pair is ever ours to touch. Residue is the conservative
   failure.

3. **A fenced marker sample inside a user `AGENTS.md` is replaced with a live block.** The match is
   a text pattern, not a Markdown parse, so a fenced code sample showing a well-formed marker pair —
   documentation of this very convention, most likely — is indistinguishable from a real block.
   Verified, not reasoned: a scratch repo whose `AGENTS.md` contained a fenced three-line sample came
   back with the full live block rendered *inside the fence*. Recorded in `src/setup/SKILL.md`'s
   repo-local marker section with the two workarounds (escape the angle brackets, or split the
   marker across lines) and the bound that matters — `init` reads no other file for markers. Not
   fixed: fence-awareness means a Markdown parser in a zero-dependency CLI, for an input nobody has
   produced.

## Review Pass 2 — Filed to the Release, Not to This PR

**OI-93 — make `check-setup-complete`'s adapter check able to fail again.** Filed against WP-R18 in
`workflow/artifacts/open-items.yaml`. Change the adapter-presence check from "`AGENTS.md` exists" to
"`AGENTS.md` carries a well-formed marker pair whose stamp matches the installed version". It closes
two of this review's own residual risks at once: risk 1, that the check is now trivially satisfied
because `init` always writes the file, and risk 3, that the version stamp has no reader and so its
correctness in the direction that matters is untested. Deliberately out of this PR — it is a
contract change to a shipped validator, and it needs its own rejection fixture to keep the mutation
ratchet at zero undefended.

## Review Pass 2 — Scope Note

Three of the files this pass touched — `site/uninstall.md`, `site/setup.md`,
`src/adapters/README.md` — are outside every phase's declared Touches in the approved plan, which
scoped Phases 1–6 to the asset, `bin/`, `src/setup/SKILL.md`, the suite, `package.json`, the two
workflow files, `dist/`, the example, and `CHANGELOG.md`. They are therefore **not** added to the
task artifact's Changed Files: doing so would fail `check-scope-fence`, and widening the plan or
writing a waiver is a plan amendment, not a review fix. They are recorded here instead. Surfaced
rather than absorbed, on the same principle as the Phase 4 amendment this chain already carries —
if the user wants them in the task artifact, that needs a plan amendment and a waiver entry.

## Review Pass 2 — Severity Summary

| Severity | Open | Found | IDs | Status |
|---|---|---|---|---|
| P0 | 0 | 0 | — | — |
| P1 | 0 | 2 | F3, F4 | both fixed and re-verified at Test |
| P2 | 0 | 3 | F5, F6, F7 | all fixed and re-verified at Test |
| P3 | 0 | 0 | — | — |

Recorded without fix: 3. Filed to the release: 1 (OI-93).

## Review Pass 2 — Recommendation

pass

## Review Pass 3 (2026-09-14)

A third pass over the same diff, run after pass 2's F3-F7 were verified closed. Two findings, both
closed in the same session. Both sit in the surface pass 2 created — which is the useful thing to
notice about them: F8 is a defect in F5's own fix, found by asking what the *other* null returns
mean, and F9 is a contradiction introduced by F3's new prose against prose already on the page.

Fixes re-verified at Test, not self-reported — see
`workflow/artifacts/verify/wp-r23-agents-md-fallback-v1.md` § Review Pass 3 Verification.

### F8 — P2 — RESOLVED 2026-09-14 — `bin/agentsmyth.mjs` — the absent gate paragraph names a cause the call site never established

**Manifest IDs:** R4, RI4

**Problem.** `GATE_PARAGRAPH_ABSENT` read *"`agentsmyth init` found no git repository here, so no
pre-commit hook was written … Run `agentsmyth init` again once this directory is a git repo."*
`installPreCommitHook()` returns `null` from three places, and only one of them is that:

1. the non-git guard — `!existsSync('.git') && !existsSync(hooksPath)`;
2. the `mkdirSync` catch — the hooks directory could not be created;
3. the write catch — the hook file itself could not be written.

Branches 2 and 3 are reachable inside a perfectly good git repository. There the paragraph tells the
reader to make a git repo out of a directory that already is one, and the remedy it prescribes is
one they have already performed.

Worth being precise about the branch count, since the finding as filed said "three other places":
there are three `return null` sites in total, so two others besides the one the wording named. The
defect is the same either way — and branch 1 does not strictly establish the cause either, since its
own warning hedges as "not a git repository (**or hooks path unavailable**)".

**Reproduced before fixing**, not reasoned. A scratch repo with `git init` plus
`git config core.hooksPath hooksfile`, where `hooksfile` is a regular file: `init` printed
`could not create hooks directory at …/hooksfile` / `EEXIST: file already exists`, and the block it
wrote in that same run claimed no git repository, in a directory whose `.git` was present.

Same class as F5 one step in. F5 was *a hook that does not exist*; this is *a cause that is not
true*. The common root is the same one F5 named and did not fully drain: a return value of `null`
carries "no hook", not "here is why", so any sentence rendered from it that asserts a why is
guessing.

**Fix — cause-neutral, and the reason the other option was refused.** The finding offered two: make
the paragraph cause-neutral, or extend `installPreCommitHook()` to return a reason alongside the
path and render per reason. The second is the better end state and was **not** taken, because it
reworks the F5 return-value arrangement this pass is explicitly fenced out of. Recorded rather than
silently dropped: if a later pass wants per-cause wording, that is the shape to build, and it must
preserve what F5 bought — that the block cannot be written before the hook's fate is known.

The paragraph now states only what the return value supports: no hook was written, nothing refuses a
commit that skips a phase, `agentsmyth init` printed the reason on the run that produced this block,
fix that and run it again. The comment above it was rewritten to say why the neutrality is
deliberate, so the next reader does not "improve" it back into a specific cause.

**Evidence.** New scenario G in `test/run-agents-md-tests.mjs`, seven checks, driving the
unwritable-hooks-path branch in a real git repo. Mutation-verified: restoring the old wording fails
exactly `G6-no-false-cause` and nothing else — scenario F stays green under it, which is precisely
why the defect survived pass 2. Suite 26 → 33 checks.

### F9 — P3 — RESOLVED 2026-09-14 — `site/uninstall.md` — a claim contradicted lower down the same page

**Manifest IDs:** R6, RI1

**Problem.** The `AGENTS.md` bullet, added by F3 one pass earlier, ended "It is the only file `init`
edits rather than creates". Two sections below, *Removing the pre-commit hook* says agentsmyth
"appended its block to the end of it rather than overwriting anything" — an edit to a file the user
already had. The page contradicts itself within one screen, and the false half is the one written to
reassure a reader about what agentsmyth touched.

Minor in consequence — no user is misled into losing data — but this is an uninstall page, where the
whole value is that the inventory can be trusted. A page that miscounts what it modifies is the kind
of thing a reader stops trusting entirely once they spot it.

**Fix.** The exception is named rather than the claim narrowed to nothing: "It and the pre-commit
hook are the only two things agentsmyth ever edits rather than creates — everything else in this
list it creates outright — which is why each of those two gets its own removal section below." That
also earns the two removal sections their place, instead of leaving the second looking like an
afterthought.

## Review Pass 3 — Severity Summary

| Severity | Open | Found | IDs | Status |
|---|---|---|---|---|
| P0 | 0 | 0 | — | — |
| P1 | 0 | 0 | — | — |
| P2 | 0 | 1 | F8 | fixed and re-verified at Test |
| P3 | 0 | 1 | F9 | fixed and re-verified at Test |

## Review Pass 3 — Scope Note

`bin/agentsmyth.mjs` and `test/run-agents-md-tests.mjs` are both inside the plan's declared Touches
(Phases 2 and 4). `site/uninstall.md` is not, and carries forward the same treatment as pass 2: it
is not added to the task artifact's Changed Files, because that would fail `check-scope-fence` and
widening the plan is an amendment rather than a review fix. Unchanged from pass 2's scope note; no
new file leaves the fence.

## Review Pass 3 — Recommendation

pass

## Recommendation

pass

---
slug: wp-r20-ledger-closure
version: 1
artifact: task
status: ready-for-next-phase
created: 2026-09-13
updated: 2026-09-13
manifest_ids: [R1, R2, R3, R4, R5, R6, R7, R8, RI1, RI2, RI3, RI4, RI5, RI6, RI7, RI8]
upstream:
  - workflow/artifacts/briefs/wp-r20-ledger-closure-v1.md
  - workflow/artifacts/plans/wp-r20-ledger-closure-v1.md
orchestration:
  phase: build
  status: ready-for-next-phase
  next_phase: review
  blockers: []
  user_checkpoint: none
---

# WP-R20 — Open-Items Ledger Closure Lifecycle - Task

## Active Phase

- Phase: Phase 7 — Rebuild, changelog, full suite (the last of seven; all complete, Build handed off to Review)
- Manifest IDs: R1-R8, RI1-RI8 — all 16 implemented and evidenced, nothing carried forward
- Exit gate: met. Every phase gate passed, all thirteen `release.yml` suites exit 0, and the full
  mutation audit reports 0/226 rules undefended across all 30 validators.

## Plan Phases Overview

| Phase | Status | Manifest IDs |
|---|---|---|
| Phase 1 - Schema: closure fields, archive kind, closed object | complete | R2, R3, RI1, RI5 |
| Phase 2 - Validator: two files, uniqueness across both, rotation both directions | complete | R5, RI5, RI6 |
| Phase 3 - Fixtures and the ratchet | complete | RI2, RI4 |
| Phase 4 - File the three WP-R23 handoff items | complete | R8 |
| Phase 5 - The sweep | complete | R1, R2, R6 |
| Phase 6 - Contract amendments and terminology sweep | complete | R4, R7 |
| Phase 7 - Rebuild, changelog, full suite | complete | RI3, RI7, RI8 |

## Branch / Repo Status

| Moment | Branch | Status | Notes |
|---|---|---|---|
| Before edits | `feat/wp-r20-ledger-closure` | `* feat/wp-r20-ledger-closure` / `?? workflow/artifacts/briefs/wp-r20-ledger-closure-v1.md` / `?? workflow/artifacts/plans/wp-r20-ledger-closure-v1.md` | Clean apart from this chain's own two approved artifacts. No unrelated dirty file exists, so `preserve_unrelated_changes` has nothing to preserve. Branch is non-default and matches the plan's Branch Strategy; created from `feat/wp-r23-agents-md-fallback` at `881441d`. |
| At handoff | `feat/wp-r20-ledger-closure` | 24 paths: 14 modified, 10 new (5 violation fixtures, 1 conformance fixture, the archive, 3 chain artifacts) | Every path maps to a Repo Impact Map row or is this chain's own artifact; `check-scope-fence` confirms it. Nothing committed, nothing staged, nothing pushed. No unrelated file touched — the tree was clean apart from this chain's artifacts before Build started. `dist/` and `workflow/schemas/` are rebuilt but gitignored, so they do not appear. |

## Scope

- In scope: the seven phases and the exact Touches each declares in
  `workflow/artifacts/plans/wp-r20-ledger-closure-v1.md` → `## Phases`, plus the Repo Impact Map's
  17 rows. Nothing outside that map.
- Out of scope: closing, reconciling or acting on any live open item (OI-87, OI-90, OI-92 included);
  re-triaging the 22 live items; the `schema_globs` glob-category near-miss recorded in the plan's
  Open Questions; WP-R18 migration machinery; the seven lifecycle artifact contracts; any commit,
  push or PR.

## Changed Files

- `src/workflow/schemas/open-items.schema.yaml` — `kind` widened to `enum: [open-items,
  open-items-archive]`; `resolution` and `closed_in_run` declared; `additionalProperties: false` added
  at both the document and the item level; file-level description rewritten to state the two-file
  model, the context rationale, the count-over-both-files rule and the never-read-for-work rule —
  IDs: R2, R3, RI1, RI5, RI6
- `src/workflow/validators/check-open-items.mjs` — rewritten from a one-file schema check into the
  two-file ledger validator: reads the archive when present, validates each file against `$id:
  open-items` by its own `kind`, enforces ID uniqueness across the pair, and adds five new failure
  directions. Header states the one deliberate divergence from `check-finding-quality.mjs` and why it
  must not be removed — IDs: R5, RI5, RI6
- `test/fixtures/lifecycle-violations/gq-open-items-archive-without-live/` — new; archive with no live
  ledger — IDs: R5
- `test/fixtures/lifecycle-violations/gr-open-items-copied-not-moved/` — new; one item in both files,
  same `first_seen_run` — IDs: R5
- `test/fixtures/lifecycle-violations/gs-open-items-id-reused-across-files/` — new; two different
  items sharing one `OI-N` across the split — IDs: R5
- `test/fixtures/lifecycle-violations/gt-open-items-archive-holds-open/` — new; unresolved item parked
  in the archive — IDs: RI6
- `test/fixtures/lifecycle-violations/gu-open-items-done-not-rotated/` — new; closed item left in the
  live ledger while an archive exists — IDs: R1, R5
- `test/fixtures/conformance/open-items-legacy-no-archive/` — new; the POSITIVE control: an un-rotated
  ledger full of `done` entries must still pass — IDs: RI5
- `test/run-violation-tests.mjs` — five fixtures registered, each with an `expect` asserting its own
  rule's wording — IDs: RI2
- `test/run-conformance-tests.mjs` — `r20-open-items-legacy-no-archive-ok` registered — IDs: RI5, RI4
- `test/mutation-baseline.json` — `check-open-items.mjs` entry `rules: 3 → 8`, `undefended` stays 0 —
  IDs: RI2
- `workflow/artifacts/open-items.yaml` — three entries appended (OI-93, OI-94, OI-95), then the 70
  `done` entries removed. 95,802 → 28,102 bytes; 95 → 25 items — IDs: R1, R6, R8
- `workflow/artifacts/open-items-archive.yaml` — new; `kind: open-items-archive`, 70 items, each
  carrying `closed_in_run` and, where it existed or could be split out, `resolution` — IDs: R2, R6
- `src/workflow/skills/follow-up-owner-assigner/SKILL.md` — Purpose, What To Load, Inputs, Refusal
  conditions, Workflow (sweep as steps 7-8), Exit Gate and Determinism Rules all amended. The
  wholesale-overwrite prohibition is replaced, not softened — IDs: R4, R7
- `src/workflow/skills/follow-up-owner-assigner/references/ledger-format.md` — rewritten: both files
  documented with a table and two worked examples, the append-only claim and its "future concern" note
  gone, plus a `## Rotation` section carrying the count-over-both-files and never-read-for-work rules —
  IDs: R7, RI6
- `src/workflow/skills/follow-up-owner-assigner/references/output-schema.md` — return shape gains
  `items_swept` and `swept_ids` — IDs: R4, R7
- `src/workflow/skills/lifecycle-reflect/SKILL.md` — both ledger references extended to the two-file
  model, including the Exit Gate assertion — IDs: R7
- `src/workflow/skills/README.md` — skill one-liner now mentions rotation — IDs: R7
- `src/workflow/validators/README.md` — `check-open-items.mjs` description rewritten; states the
  conditional and why both files are read — IDs: R7
- `docs/release-checklist.md` — triage line warns that an `OI-N` cited elsewhere may now live in the
  archive rather than having ceased to exist — IDs: R7
- `CHANGELOG.md` — one bullet under `### Added` (the two-file ledger, the two new fields, the closed
  object, the no-op upgrade) and one under `### Changed` (the skill's rotation step and replaced
  determinism rule). Entry date and `package.json` version both untouched — IDs: RI8
- `dist/workflow-bundle.md`, `workflow/schemas/open-items.schema.yaml` — regenerated by `npm run build`.
  Both gitignored build products — IDs: RI7

## Implementation Log

### Phase 1 — Schema (active)

Scoped before any edit, per `lifecycle-build` Workflow step 4. Pre-work state recorded above.

Planned change to `src/workflow/schemas/open-items.schema.yaml`, and nothing else:

1. `kind` becomes `enum: [open-items, open-items-archive]`, with a description stating why the kinds
   are distinct and that the archive is never read for work (brief A4).
2. Declare `resolution` — how and why the item closed, the field 39 of 92 live entries already use
   without declaring.
3. Declare `closed_in_run` — the slug-vN that closed it, with `unrecorded` valid for backfill only,
   carrying `pending-setup.schema.yaml:39-46`'s wording per Q2.
4. `additionalProperties: false` on the item object, in the same change as 2 and 3 — the plan's
   Architecture Notes record why it should not be deferred.
5. Neither new field joins `required`. RI5 depends on that: a required field would break every
   consumer ledger on upgrade and escalate the release past a minor bump.

**Done, as planned, plus one addition and one measured refusal.**

*Addition beyond the plan's stated Touches-level detail, recorded rather than silent:*
`additionalProperties: false` was added at the **document** level as well as the item level. The plan
named the item object only. The document level is the same defect class one scope up, the live file
has exactly three top-level keys so nothing breaks, and `finding-quality.schema.yaml` closes both
levels. Same file, same requirement, no new surface — recorded here so it is not discovered as
unexplained diff in Review.

*Refusal, on measurement:* the obvious next step was a conditional requirement — `if status is done,
then require resolution` — which is precisely what `finding-quality.schema.yaml` does for its closed
outcomes, and the engine supports `if`/`then`. **Not done.** Measured first:

```
done WITH resolution    : 39
done WITHOUT resolution : 31
non-done WITH resolution: 0
```

31 honest historical entries would have failed immediately, on a rule none of them could
retroactively satisfy. The absence of `resolution` on an old entry is a true statement — the
reasoning was never captured — and failing the file does not recover it. Both new fields are
therefore optional, and the schema's own description records the count and the reason so a later
reader does not "tighten" it back.

**A verification-method correction, which is the part of this phase worth keeping.**

The first exit-gate run reported `check-open-items: ok` and it was worthless. Run bare,
`node src/workflow/validators/check-open-items.mjs` resolves schemas through `defsPath()` →
`definitions_root`, which `workflow/config/repo-profile.yaml` sets to `~/.agentsmyth/workflow`. It was
validating the real ledger against the **globally installed** copy of the schema — confirmed still
pre-edit: `grep -c "additionalProperties: false\|open-items-archive"
~/.agentsmyth/workflow/schemas/open-items.schema.yaml` → `0`. The edit under test was not in the
schema being used.

Caught by probing whether the new assertion could fail: a fixture with an undeclared `made_up_key`
passed, which it could not have done if the closed object were in force.

The correct invocation is `AGENTSMYTH_HOME=src/workflow`, which moves the definitions root while
leaving the data root on `workflow/` — the two-root resolver used exactly as `scripts/validate-template.mjs:29`
uses it. `AGENTSMYTH_WF=src/workflow` is **not** the right override here: it moves both roots, so the
validator then looks for `src/workflow/artifacts/open-items.yaml`, finds nothing, and exits 0 with
"no open-items.yaml — no follow-ups persisted yet". Two different ways to get a green result that
means nothing, for one edit.

Both re-run correctly below. `npm run validate` was already right, because it sets
`AGENTSMYTH_HOME` itself; the bare invocation — the one a developer would naturally type, and the one
`src/workflow/validators/README.md` documents — is the trap. Noted for Reflect.

### Phase 2 — Validator (complete)

Rewritten on `check-finding-quality.mjs`'s shape, because that validator already solved this problem
once and its comments record why each check exists. Kept: schema-when-present, exit-0-when-absent,
both files read by one validator because the interesting failures are invisible from either alone.

Five new failure directions, each chosen because no single file shows it:

| Direction | Why it cannot be seen from one file |
|---|---|
| archive exists, live ledger does not | Rotation moves items OUT of the live file, so the drained file cannot be the missing one. It means the live ledger was deleted, taking every unresolved item with it. |
| one item in both files, same `first_seen_run` | A copy where a move was intended. Double-counted in any figure spanning the pair, and no reader can tell which copy is current. |
| one id in both files, different `first_seen_run` | Two different items given one number. The split is what makes this likely: the live file is the lean working file, so an author reaches for the next number it shows rather than the next ever issued. |
| unresolved item in the archive | Unreachable. Nothing reads the archive looking for work, so it sits forever while reading as accounted for. |
| `done` item in the live ledger, archive present | Not rotated. Unconditionally checking this is what would break every consumer on upgrade — see below. |

**The divergence, stated in the source rather than left to be inferred.** `check-finding-quality.mjs`
rejects a closed row in its active file unconditionally; it shipped new, with no legacy rows anywhere.
This ledger predates rotation by many releases, so every consumer repo that has run Reflect has a live
file full of `done` entries and no archive. The `done`-in-live check is therefore guarded on the
archive existing — the same "no file, exit 0" reasoning this validator already applied to the ledger as
a whole, applied one level in. The header says so, and says not to simplify it into symmetry.

Two diagnoses rather than one for the cross-file id clash, split on `first_seen_run`, because the
reader's next action differs: delete one copy, or renumber the newer item. The validator cannot be
certain which case it is, so each message states what it inferred and from what.

### Phase 3 — Fixtures and the ratchet (complete)

Five rejection fixtures, one per new error, each emitting **exactly one** error and each registered
with an `expect` asserting that rule's own wording. `gr` and `gs` share a code path and differ only in
which diagnosis they reach, so matching `'is already used'` or a filename would have left one of the
two undefended while both looked covered — the exact failure mode `run-mutation-audit.mjs`'s header
records twice.

One **positive** control, in conformance rather than violations: an un-rotated ledger with `done`
entries and no archive must keep passing. A rejection-only set would leave the upgrade guarantee
untested in the only direction that matters for a repo installing the release, and this check is what
fails if a later pass removes the conditional.

**Ratchet: `check-open-items.mjs` 3 rules → 8, 0 undefended.** Five new errors, five new fixtures, no
allowance taken.

Two recorded deviations from the plan, both smaller than they look:

1. **Five rejection fixtures, not the four the plan estimated.** Writing the validator split the
   cross-file clash into two genuinely distinct diagnoses. The plan's count was an estimate made before
   the code existed; the ratchet is what determines the real number, and it says eight rules need
   eight defences.
2. **The baseline was edited surgically, not regenerated, and `generated` was left at 2026-09-01.**
   `--only` populates `results` with one validator, so `--only --write-baseline` together would have
   written a 1-entry file and silently dropped 29 measurements. Advancing the top-level `generated`
   date would also have claimed 29 entries were re-measured today when they were not. The full audit
   with `--write-baseline` is deferred to Phase 7, where the tree is final — which is also the more
   correct place for it: the audit's own header records that repairing this repo's artifacts once
   *raised* the undefended count, because a rule whose only exercise was a real violation lost its
   accidental defence. Phase 5 removes 70 `done` entries from the live ledger, so re-measuring before
   that would measure a tree that no longer exists.

Note the ratchet compares `undefended` only, never `rules` — so a stale rule count fails nothing. It
was corrected anyway: a record that misdescribes what it measured is the drift this repo keeps
catching, and `CLAUDE.md` names the violations count as having drifted four times for exactly that
reason.

### Phase 4 — The three WP-R23 handoff items (complete)

OI-93, OI-94, OI-95 appended with `status: open`, `first_seen_run: wp-r23-agents-md-fallback-v1` — the
chain whose Reflect created them, not this one — and the owners that Reflect named.

One correction to the plan's classification: OI-95 is `source: requirement` with
`manifest_ids: [RI6]`, not `source: follow-up`. The schema's `source` enum decides it: `requirement` is the value
for an active R or RI that a chain did not ship, and WP-R23's RI6 was deferred at that chain's Test
with a six-field skipped-check record. Filing it as a bare follow-up would have lost the link to
the requirement it descends from.

OI-94 is the one this chain hit itself. It records the Requirement Classification table being
unreachable in a single-agent brief, and two chains have now worked around it identically — WP-R23 in
`single-agent` mode and this chain in `refused` mode. The entry names both, because a convention two
chains reinvented the same way is one the starter block should state rather than leave to be
rediscovered.

### Phase 5 — The sweep (complete)

**Asked before writing.** Q3 reserved a second, narrower ask for this step and it was made with
measured numbers rather than estimates, including that `open-items.yaml` is tracked at `0bb7051` so the
rewrite was recoverable. The user authorized it.

Three transformations, not one:

| | Count | What happened |
|---|---|---|
| Moved unchanged | 39 | Already had a `resolution`; `next_action` untouched |
| Closure prose split out of `next_action` | 24 | Action text stays in `next_action`, closure moves to `resolution` |
| Neither | 7 | OI-1..OI-10. No closure prose exists to move, so `resolution` stays absent — which truthfully records that the reasoning was never captured |

`closed_in_run`: **5 derived, 65 `unrecorded`.** A real slug-vN was taken only where the closure text
named exactly one chain other than `first_seen_run` (OI-29, OI-35, OI-37, OI-38, OI-52). OI-40 names
two and is therefore `unrecorded` rather than guessed at — ambiguity resolved by declining, per Q2's
"never use it for a new closure" boundary read in reverse.

**The split rule was wrong twice, and both were caught by looking rather than by a gate.**

*First error — the marker was too loose.* `Done\b` matched `Done` used as a Notion **status value**:
OI-32, OI-46 and OI-51 all read "update the Notion page status to Done, with PR #NN link, once
merged", and splitting there cut the action sentence in half, leaving `next_action` as "Update Notion
WP-R12 page/database row status to" and moving the rest to `resolution`. Tightened to require a real
closure shape — `Done:` with a colon, `Done <ISO date>`, `DONE`, `TRIAGED` — and re-inspected all 24
boundaries, not just the three that were wrong. This is Workflow step 6b applied literally: the change
adjusted a matching boundary, so it was verified with a before/after comparison across every case.

*Second error — the trim dropped content.* `rstrip(' -.,;')` removed trailing punctuation, which
measured out as **21 of 24 entries losing the full stop** on their action sentence. Changed to
whitespace-only. The sweep was re-run from a pre-sweep copy rather than patched in place, so the
second run started from the original bytes.

**No-loss verification, using the repo's own parser.** `loadYaml` from `lib.mjs` reads the pre-sweep
copy and both new files, and asserts: id sets partition exactly; `done` routes to the archive and
everything else to the live file; every non-`done` item is byte-for-byte unchanged; every field of every
archived item is unchanged except the split pair; and `next_action` joined with `resolution`
reconstitutes the original `next_action` character-for-character.

```
items before            : 95
live after              : 25
archive after           : 70
archived, resolution carried unchanged : 39
archived, closure prose split out      : 24
archived, closure never recorded       : 7
separator chars consumed by splits     : 0
no loss detected: every id accounted for, every field preserved, every split reconstitutes
```

Zero characters consumed: rejoining on the single space the split ate restores the original exactly.

OI-19 is the one entry whose `next_action` was **entirely** closure prose, so the split left it empty.
It reads `"none — closure prose only; moved to resolution"` — a statement about this entry rather than
an invented pending action for an item that has none.

### Phase 6 — Contract amendments and terminology sweep (complete)

The two amendments the brief records as load-bearing, both landed here with the sweep already shipped in
Phase 5 — so the skill's prose describes behaviour that exists rather than licensing behaviour that does
not.

**The determinism rule was replaced, not softened.** "Never overwrite `open-items.yaml` wholesale" cannot
survive a skill whose job includes rewriting both files, and weakening it to "avoid overwriting where
possible" would leave a rule that forbids nothing. What replaced it is narrower *and* stricter: every
item leaving the live file must arrive in the archive in the same operation with every field intact, and
losing an item, copying instead of moving, or dropping a field are named as the failures. A second new
rule was added that did not exist before — **never change an item's `status`** — because rotation reads
`done` and a skill that could also *write* it would be deciding closure on its own authority, which the
brief's Non-Goals forbid. That rule is now asserted in three places: Workflow, Exit Gate, and Determinism
Rules.

`ledger-format.md` was rewritten rather than patched. It now documents both files with a table and two
worked examples, and carries a `## Rotation` section stating the two things easiest to get wrong: any
figure counted from this ledger spans both files, and the archive is never read for work. The
"status transitions are a separate, future concern" note is gone — that future arrived.

One further change beyond the four descriptive surfaces the plan listed: `docs/release-checklist.md`'s
triage line now warns that an `OI-N` cited from a PR or a tracker may have moved to the archive rather
than ceased to exist. Someone triaging a release and finding an ID missing from the live file is exactly
the reader this rotation can mislead, and the checklist is where they will be looking.

### Phase 7 — Rebuild, changelog, full suite (active)

`npm run build` run after the `src/workflow/` edits. `diff src/workflow/schemas/open-items.schema.yaml
workflow/schemas/open-items.schema.yaml` → identical; `open-items-archive` appears 14 times in
`dist/workflow-bundle.md`, so the new content reached the shipped bundle rather than only the source.

CHANGELOG: one bullet under `### Added`, one under `### Changed`, matching the entry's existing style of
naming features rather than internal work-package IDs. **The 1.1.0 entry's date was deliberately not
touched** — it reads 2026-09-08 and today is 2026-09-13, so it has slipped, but correcting it is a
release-dispatch step owned by the release checklist and not by this chain. `package.json` is unchanged:
`release.yml` runs `npm version` itself, so a pre-bumped repo publishes the version after the intended
one.

All thirteen suites `release.yml` runs exit 0. The full mutation audit is running.

**Full mutation audit: 0/226 rules undefended, all 30 validators.** The rule count rose 221 → 226 —
exactly the five errors this chain added, with no sixth appearing from anywhere. More importantly nothing
regressed: the audit's own header records that repairing this repo's artifacts once *raised* the
undefended count, because a rule whose only exercise was a real violation lost its accidental defence.
Phase 5 removed 70 `done` entries from the live ledger, which was precisely that shape of risk, and no
validator lost a defence to it.

The baseline was then written by **parsing the audit's own output table**, not by transcribing numbers,
with an assertion that the derived totals equal the `0/226` line the audit printed itself. Result:
`entries changed: none` — the full measurement independently confirms the surgical Phase 3 edit was
right, and the only real change to the file is `generated` advancing to 2026-09-13, which is now true of
every one of the 30 entries rather than of 29 of them.

**One plan amendment, recorded because the plan carries an approval.** Phase 6's `Touches` line read
"`SKILL.md` + both references". `check-scope-fence` reported both reference files as outside the declared
Touches, correctly: two real files were named in prose rather than as repo-relative paths, and a fence
cannot resolve prose. Amended in place to list all three paths explicitly, with the amendment and its
reason written into the plan beside the line. No scope changed — the Repo Impact Map had already listed
both files individually, so the fence and the map disagreed about the same intent. Worth noting that the
existing fence rule checks each declared path *is* a real path; this was the inverse hole, a real file
that no declared path names.

**A note on how the audit is being run, because the obvious way is unsafe.** `--write-baseline` exits
immediately after writing and never performs the comparison, so running it directly would silently bake
in a regression in any validator rather than failing on it. The full audit is therefore being run in
comparison mode first; the per-validator table it prints is the measured result, and the baseline is
written from that only once the comparison has passed.

## Verification Items

| Manifest ID | Verification target | Expected result |
|---|---|---|
| R3 | The 39 existing `resolution` values validate under a closed item object | `check-open-items.mjs` exits 0 against the real ledger, unmodified |
| RI1 | No new schema file is added; the registry resolves both kinds from one `$id` | `ls src/workflow/schemas/*.yaml` count unchanged at 12 |
| R2 | `kind` accepts the archive value | schema `enum` lists both kinds |
| RI5 | Neither new field is required | item `required:` list unchanged at six fields |
| RI5 | The hand-rolled engine actually enforces what the schema now declares | `check-schema-keywords.mjs` exits 0 |
| RI3 | Both commands `verification.yaml` marks required, plus the one thing no command can prove | `npm run validate` and `npm run violations:test` exit 0, and the no-loss reconstruction reports 0 characters consumed — RI3 owns verification evidence rather than any file, so it is tracked here rather than in Changed Files |
| RI2 | Every error added to the validator is defended by a fixture | `run-mutation-audit.mjs` reports 0 undefended at the raised rule count |
| RI4 | No new `*:test` script, so the CI/release wiring rule stays satisfied | `git diff --stat package.json` empty and `conformance:test` green |

## Command Results

| Command | Area | Outcome | Notes |
|---|---|---|---|
| `git status --short --branch` | Phase 1 / pre-work | pass | Recorded in Branch / Repo Status. Two untracked files, both this chain's own artifacts. |
| `node src/workflow/validators/check-open-items.mjs` (bare) | Phase 1 / R3 | **void — not a result** | Reported ok against the GLOBAL pre-edit schema, not the edit. Recorded rather than deleted: a green line that proves nothing is the failure mode this phase actually produced. |
| `AGENTSMYTH_HOME=src/workflow node src/workflow/validators/check-open-items.mjs` | Phase 1 / R3, RI5 | pass | `22 open, 70 done, 0 blocked, 0 deferred`, exit 0. All 39 existing `resolution` values validate under a closed item object — the drift is legalized, not merely tolerated. |
| `AGENTSMYTH_HOME=src/workflow node src/workflow/validators/check-open-items.mjs --dir <probe>` | Phase 1 / R3 | pass (correctly rejected) | `items[0].made_up_key is not allowed`. Proves `additionalProperties: false` is load-bearing. Without this the phase's own gate could not have failed. |
| `validateSchema` against `kind` values `open-items` / `open-items-archive` / `open-items-bogus` | Phase 1 / R2 | pass | First two accepted, third rejected with `expected one of open-items, open-items-archive`. Checked directly against the schema because the two-file validator is Phase 2's work. |
| `npm run validate` | Phase 1 / RI5, RI7 | pass | Exit 0. Includes `check-schema-keywords` (12 schemas, 20 keywords) and `check-open-items` under the correct env. |
| `ls src/workflow/schemas/*.yaml \| wc -l` | Phase 1 / RI1 | pass | 12, unchanged. No new schema file; the archive kind lives in the existing `$id: open-items`. |
| `AGENTSMYTH_HOME=src/workflow node src/workflow/validators/check-open-items.mjs` | Phase 2 / R5, RI5 | pass | Exit 0 against the real un-swept ledger: `22 open, 70 done, 0 blocked, 0 deferred`, then `no …open-items-archive.yaml — this repo has not rotated yet, so a "done" entry in the live ledger is not an error here`. The upgrade guarantee executing against real data, not a fixture. |
| Same, `--dir` each of `u-`/`gn-`/`gp-open-items-*` | Phase 2 / regression | pass | 1 error each. The three pre-existing fixtures still reject, and still for their own rules. |
| Same, `--dir` each of `gq-`…`gu-open-items-*` | Phase 3 / R5, R1, RI6 | pass (correctly rejected) | Exactly 1 error each, each the rule the fixture names. |
| Same, `--dir test/fixtures/conformance/open-items-legacy-no-archive` | Phase 3 / RI5 | pass | Exit 0 with `1 open, 2 done` and `has not rotated yet`. The positive control. |
| `npm run violations:test` | Phase 3 / RI2 | pass | `215/215 violations detected`, up from 210 at Plan time. Attribution sweep 93/93 unaffected. |
| `npm run conformance:test` | Phase 3 / RI4, RI5 | pass | `49/49`, up from 48. First run was `48/49`: `shipped-neutrality` correctly caught `OI-93` — this repo's own next free tracker ID — in a shipped comment in `check-open-items.mjs`. Reworded to `the next OI-N`; the rule is right that shipped source carries no internal IDs. |
| `node test/run-mutation-audit.mjs --only check-open-items.mjs` | Phase 3 / RI2 | pass | `8 rules, 0 undefended`. Re-run after the baseline edit: still `mutation-audit: ok`. |
| `git diff --stat package.json` | Phase 3 / RI4 | pass | Empty. No new `*:test` script, so `r22-every-suite-runs-in-ci` stays satisfied without touching either workflow file. |
| `npm run validate` | Phases 2, 3 | pass | Exit 0 after each edit, per Workflow step 8a. |
| `AGENTSMYTH_HOME=src/workflow node …/check-open-items.mjs` | Phase 4 / R8 | pass | `25 open, 70 done, 0 blocked, 0 deferred` — the gate's exact expected figure. |
| id contiguity scan over OI-1..OI-95 | Phase 4 / R8 | pass | 95 entries, highest 95, no duplicates, none missing. |
| Split-boundary before/after inspection, all 24 cases | Phase 5 / R6 | pass (after two corrections) | First pass mis-split OI-32, OI-46, OI-51 on `Done` used as a status value; second measured 21 of 24 losing a full stop. Both fixed and all 24 re-inspected. Workflow step 6b. |
| `node verify-sweep.mjs` (lib.mjs `loadYaml`, pre-sweep copy vs both new files) | Phase 5 / R6, RI3 | pass | Exit 0. id sets partition exactly; non-`done` items byte-identical; every archived field preserved; all 24 splits reconstitute with **0** characters consumed. |
| `AGENTSMYTH_HOME=src/workflow node …/check-open-items.mjs` (post-sweep) | Phase 5 / R1, R2 | pass | `25 open, 0 done, 0 blocked, 0 deferred`, then `70 archived — 95 item(s) across both files`. |
| `wc -c` on both ledger files | Phase 5 / R1 | pass | Live 95,802 → **28,102** bytes, against a gate of under 30,000. Archive 70,435. A 70.7% cut in what every Reflect re-reads. |
| id partition scan across the pair | Phase 5 / R6 | pass | live 25 + archive 70 = 95; no duplicates across the pair; none of OI-1..OI-95 missing. |
| `npm run violations:test`, `npm run conformance:test` | Phases 4, 5 | pass | 215/215 and 49/49 after the sweep. The real repo now HAS an archive, so the `done`-in-live rule is hard here from this point on — and passes, because there are none. |
| `grep -rn "append-only" src/workflow/skills/follow-up-owner-assigner/` | Phase 6 / R7 | pass | No output. The claim is gone from the skill and both references. |
| `grep -rn "append-only" src/ docs/ scripts/ test/ README.md` | Phase 6 / R7 | pass | One surviving line, `validators/README.md:81`, about `agent-behavior.yaml`'s checkpoint union list — a different append-only rule that remains true. Correctly left alone. |
| `grep -n` for the never-sets-status rule | Phase 6 / R4 | pass | Present at three sites: Workflow (85), Exit Gate (96), Determinism Rules (106). |
| `npm run build` | Phase 7 / RI7 | pass | `build-bundle: ok`. |
| `diff src/workflow/schemas/open-items.schema.yaml workflow/schemas/open-items.schema.yaml` | Phase 7 / RI7 | pass | Identical. |
| `grep -c "open-items-archive" dist/workflow-bundle.md` | Phase 7 / RI7 | pass | 14. The change reached the shipped bundle, not just the source. |
| `git diff package.json` | Phase 7 / RI8 | pass | Empty. No version bump. |
| All 13 `release.yml` suites | Phase 7 / RI3 | pass | validate, violations 215/215, conformance 49/49, root-resolution 21/21, setup-complete 13/13, setup-refs 5/5, init-prepare-interop 38/38, checkpoint-approval 9/9, setup-validator-definitions-root 3/3, tuning-merge 15/15, commit-coverage, domain-placeholders 5/5, agents-md 20/20. Every one exit 0. |
| `node test/run-mutation-audit.mjs` (full, comparison mode) | Phase 7 / RI2 | pass | Exit 0. `0/226 rules undefended`, 30 validators, `check-open-items.mjs` at 8 rules / 0 undefended. Comparison mode deliberately, not `--write-baseline`, which skips the comparison and would have baked in a regression rather than failing on it. |
| Baseline written by parsing the audit log, with derived totals asserted against the audit's own total line | Phase 7 / RI2 | pass | `226` rules / `0` undefended agree with the printed `0/226`. `entries changed: none`; `generated` 2026-09-01 → 2026-09-13. |
| `npm run validate`, `violations:test`, `conformance:test` (final, post-baseline-write) | Phase 7 / RI3 | pass | Exit 0, 215/215, 49/49. |
| `git status --short` | Phase 7 / handoff | pass | 24 paths, all in scope. Nothing committed or staged. |

## Dispatch Log

none — `dispatch.enabled` resolves to `disabled` for this session (see the brief's
`council.resolution`), so no workstream was dispatched and none could be.

## Architecture Notes

- role: Senior Engineer
- decision: recorded per phase in the Implementation Log rather than collected here, so each sits
  beside the evidence that produced it.
- constraint: the active phase's declared Touches are the staging boundary
  (`stage_only_approved_scope: true`). `scope-fence` checks it.
- decision: `additionalProperties: false` at the document level as well as the item level (Phase 1), and
  no conditional requirement on closure fields (Phase 1) — the second on measurement, 31 entries would
  have failed.
- decision: the sweep's closure-marker regex requires a real closure shape (`Done:`, `Done <ISO date>`,
  `DONE`, `TRIAGED`), never bare `Done`, which three entries use as a Notion status value.
- constraint: R5's conditional — `done`-in-live is an error only once an archive exists — must not be
  made symmetric with `check-finding-quality.mjs`. Stated in the validator's own header, and the
  `r20-open-items-legacy-no-archive-ok` conformance check is what fails if it is removed.
- tradeoff: the full mutation audit was run in comparison mode and the baseline derived from its output,
  rather than running `--write-baseline` directly. Costs one parse step; buys the comparison actually
  happening.
- downstream: Review reads Phase 4's three ledger entries as content, separate from the restructure,
  and checks that Phase 5's second ask was actually made rather than recorded as made. Two worked-around
  issues are recorded under Blockers for Reflect, neither in this chain's scope.

## Blockers

none

Two things encountered and worked around rather than fixed, both recorded for Reflect because neither
belongs in this chain's scope:

1. **`check-waivers` false positive — twice in this one chain, both in new shapes.** This task artifact
   failed `npm run validate` twice for prose making no waiver claim at all. First for *quoting* the
   open-items schema's `source` enum description, because the quotation contains the word "waived".
   Second for the phrase "none deferred, waived or dropped" — a statement that there are **no** waivers,
   rejected as a possible unstructured waiver claim. The ledger already tracks this heuristic tripping on
   descriptive prose, and a prior chain narrowed it for "rather than" constructions; neither of these is
   that construction. Both worked around by rewording. Worth noting the second case in particular: the
   negation is the whole content of the sentence, so a heuristic that fires on it is inverted, not merely
   imprecise. Widening the negation regex is a validator change with its own fixture obligation under the
   ratchet, so it is not folded in here — but two hits in one chain, on top of a real CI failure recorded
   earlier in the ledger, is evidence this is worth prioritising rather than re-noting.
2. **A bare validator invocation silently checks the global install, not the source.** Recorded in full
   under Phase 1. `src/workflow/validators/README.md` documents the bare form, which is the form that
   resolves schemas from `definitions_root` — so in this repo a developer following the README can get a
   green result that says nothing about their edit. Two different wrong env overrides produce two
   different meaningless passes. Not fixed here: the fix is either a README change or a warning in
   `lib.mjs`, and choosing between them is a design question.

## Phase Completion Log

| Phase | Status | Completed | Notes |
|---|---|---|---|
| Phase 1 - Schema: closure fields, archive kind, closed object | complete | 2026-09-13 | All four gate conditions met: real ledger passes, undeclared key rejected, `additionalProperties: false` at both levels, item `required:` unchanged at six fields, schema count unchanged at 12. One recorded addition (document-level closure) and one measured refusal (no conditional requirement — 31 entries would have failed). |
| Phase 2 - Validator: two files, uniqueness across both, rotation both directions | complete | 2026-09-13 | Gate met: `npm run validate` exit 0 against the still-unswept ledger, and the `details` output names both paths. Three pre-existing fixtures still reject. |
| Phase 3 - Fixtures and the ratchet | complete | 2026-09-13 | Gate met: violations 210 → 215, conformance 48 → 49, mutation audit 8 rules / 0 undefended, `package.json` untouched. Two recorded deviations: five fixtures not four, and the baseline edited surgically with the full re-measure deferred to Phase 7. |
| Phase 4 - File the three WP-R23 handoff items | complete | 2026-09-13 | Gate met exactly: `25 open, 70 done, 0 blocked, 0 deferred`, OI-1..OI-95 contiguous with no duplicates. One classification correction: OI-95 filed as `source: requirement` with `manifest_ids: [RI6]`. |
| Phase 5 - The sweep | complete | 2026-09-13 | Gate met: live `25 open, 0 done`, archive 70, 95 across the pair, 28,102 bytes against a 30,000 gate, validate/violations/conformance all green. Asked before writing per Q3. Split rule corrected twice; no-loss verification passes with 0 characters consumed. |
| Phase 6 - Contract amendments and terminology sweep | complete | 2026-09-13 | Gate met: no append-only claim survives in the skill or its references, the never-sets-status rule is asserted in three places, validate exit 0. Determinism rule replaced rather than softened, and one rule added that did not exist before. |
| Phase 7 - Rebuild, changelog, full suite | complete | 2026-09-13 | Gate met: build-synced schema byte-identical to source, `open-items-archive` present 14× in the shipped bundle, `package.json` version unchanged, CHANGELOG entry added with its date untouched, all 13 `release.yml` suites exit 0, full mutation audit 0/226 undefended. One plan amendment recorded (Phase 6 Touches made explicit paths). |

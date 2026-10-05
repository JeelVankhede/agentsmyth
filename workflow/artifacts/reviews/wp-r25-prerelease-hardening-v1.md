---
slug: wp-r25-prerelease-hardening
version: 1
artifact: review
status: ready-for-next-phase
created: 2026-10-04
updated: 2026-10-04
manifest_ids:
  - R1
  - R2
  - R3
  - R4
  - R5
  - R6
  - R7
  - R8
  - R9
  - R10
  - R11
  - RI2
  - RI3
  - RI4
  - RI5
  - RI7
  - RI9
  - RI10
  - RI11
  - RI12
upstream:
  - workflow/artifacts/tasks/wp-r25-prerelease-hardening-v1.md
orchestration:
  phase: review
  status: ready-for-next-phase
  next_phase: test
  blockers: []
  user_checkpoint: none
council:
  mode: council
  authorization: explicit
  cap_resolved: 2
  cap_source: configured
  depth: standard
  model_tier: standard
  effort: very-high
  model_actual: unknown
  member_tokens:
    r1: 149703
    r2: 175421
  cost_estimate: no-history
  dispatch_depth: 1
  rounds_run: 1
  termination_reason: resolved
  resolution:
    dispatch_enabled: optional
    council_enabled: on-for-complex
    task_class: complex
  repo_integrity:
    before: 3bd4131cc640b410b21349790eed5a21612880e353c1dda8f7afe25bfd7146be
    after: 3bd4131cc640b410b21349790eed5a21612880e353c1dda8f7afe25bfd7146be
    algorithm: sha256/sorted-relpath+size+content
  evidence_classes:
    repo: used
    trial: used
    web: unused
    recall: unused
---

# WP-R25 Pre-Release Hardening - Review

## Findings

Twenty-two findings, four of them critical. Ordered by severity, then by area. Fix recommendations
are the parent's; the council members were forbidden from proposing them, so that a reviewer with a
fix in hand did not stop looking.

**Provenance.** Every finding below comes from **r1** (security, compatibility) or **r2**
(verification, lifecycle, contract), and each is tagged with its member. r1 contributed F3, F4, F5,
F6, F7, F13, F14, F20 and F21; r2 contributed F1, F2, F8, F9, F10, F11, F12, F15, F16, F17, F18, F19
and F22. The parent independently re-verified F1, F3, F11 and F14 against the code before accepting
them, because those four carry the recommendation.

**The headline is not the count. It is that the chain's central claim does not hold.** R4 was built
so a council cannot dispatch before a capability tier is chosen. The rule works when invoked and is
reachable from the shipped copy — and nothing in the shipped product invokes it. The skill text
asserts the opposite in so many words. That is the precise failure class this repository has already
named once, reproduced by the change that cited it.

### Critical

**F1 (r2) — the Think gate has no invoker, so R4 is inert as shipped.**
Area: `src/workflow/validators/check-lifecycle.mjs:135-196`, `src/workflow/skills/lifecycle-think/SKILL.md`, `src/assets/hooks/pre-commit:43-52`, `src/workflow/router.md:105-118`. Manifest: R4.
Problem: nothing in the shipped tree runs `check-lifecycle --phase think`. The commit hook's
`phase_for_dir()` maps `briefs→plan`, `plans→build`, `tasks→review`, `reviews→test`, `verify→ship`,
`ship→reflect` — it cannot emit `think`. The router's Pre-Action Gate is scoped to Build-, Review-,
Test- and Ship-owned writes. And `lifecycle-think/SKILL.md` is the **only** phase skill with no
`agentsmyth check --phase` line; the parent confirmed 0 occurrences against 1 in each of the other
six. `agentsmyth check` without `--phase` does not evaluate it either. Meanwhile
`think-council/SKILL.md:96-103` tells the reader "that refusal is not this skill's to improvise:
`check-lifecycle --phase think` holds it mechanically, and the Think gate runs ahead of stage 1".
Fix: add the phase-gate invocation to `lifecycle-think/SKILL.md` as the other six carry it, and add a
conformance case asserting that some shipped surface invokes `--phase think` — prose that says a gate
is held mechanically must be accompanied by the thing that holds it. The conformance case is the part
that stops this recurring.

**F2 (r2) — the Review council delegates its refusal to a gate that cannot fire for Review.**
Area: `src/workflow/skills/review-council/SKILL.md:87-93`, `check-lifecycle.mjs`. Manifest: R4.
Problem: Review's skill carries the same sentence pointing at `--phase think`, but `--phase review`
is the gate the commit hook actually invokes (`tasks→review`) and it carries no tier rule at all.
Independent of F1: even with Think wired correctly, Review would dispatch unchecked. By
`agent-behavior.yaml`'s own note Review "runs on every Complex chain with the same bill" and its
output blocks a commit, so this is the costlier and more consequential of the two.
Fix: make the tier precondition phase-agnostic rather than keyed on `targetPhase === 'think'` —
every phase that can dispatch a council must carry it — and gate on the resolved config rather than
on which phase string was passed.

**F3 (r1) — a damaged bundle deletes the entire global definitions tree, silently, and falsifies the
guard that should catch it.**
Area: `bin/agentsmyth.mjs:818-880`. Manifest: R9.
Problem: `declared` is built solely from the bundle regex and nothing asserts it is non-empty. The
parent confirmed there is no `written.length` check anywhere before the prune loop. With a truncated
or partially-extracted bundle the match count is zero, every ledger line becomes a prune candidate,
and the tree is removed in one pass — observed: `removed 252 file(s)`, five files left, `exit=0`.
Line 880 then writes the ledger as the empty string, destroying the record the comment at 844 claims
protects a mid-prune crash. `installed-version.txt` is left stamped current, so
`globalInstallState()` classifies the emptied tree as `current` and `ensureGlobalInstall()` never
refuses — defeating R1 — and a subsequent `init` exits 0 while linking a repo to nothing. The
refusal text claims an "emptied install" looks `unstamped`; it does not.
Fix: refuse to prune when the expansion produced no files, and treat that as a hard error rather
than an empty declaration — a bundle that declares nothing is a broken bundle, not an instruction to
delete everything. Write the ledger before the deletions, not after. Remove the stamp, or stamp it
only after a successful expansion, so an emptied tree cannot read as healthy.

**F4 (r1) — the noop sweep deletes a backup an open reconcile item still points at.**
Area: `bin/agentsmyth.mjs:3076-3080`, `:3028`. Manifest: RI7 (adjacent; the defect predates this chain).
Problem: `openBackupPaths` is computed and threaded only into `writeBackup`. The noop sweep never
consults it, so a drifted file whose refresh produces no change is classified `noop` and its backup
is deleted even while an open item names that exact path. Observed across three upgrades: the item
remained `open` with `backup_path` pointing at a file that no longer existed, and the run printed
nothing. The RI20 rule quoted at `:1385-1391` ("Resolution wins. Supersession skips") holds at one
deletion site and not the other.
Fix: consult `openBackupPaths` at both deletion sites, derived from one shared set rather than passed
to one caller — the same remedy `REWRITE_ACTIONS` already applies to a different coupling in this
file.

### High

**F5 (r1) — `writeBackup` overwrites the very backup an open item names.**
Area: `bin/agentsmyth.mjs:1412-1427`. Manifest: RI7 (predates this chain).
Problem: the supersede loop skips the destination version directory at `:1417` *before* the
protection test at `:1421`, then overwrites unconditionally. Whenever `fromVersion === pkgVersion`
— the state of every repo after its first real upgrade — the destination is the path the still-open
item names. Observed: the first edit's backup was replaced by the second edit's, while the run
printed "Your edits were preserved before anything was touched" and the idempotence guard declined to
raise a new item. Fix: apply the open-item protection before the destination-version skip, and
version backups per-run rather than per-release when the destination collides with a protected path.

**F6 (r1) — the prune follows symlinked intermediate directories and deletes outside the tree.**
Area: `bin/agentsmyth.mjs:866-876`. Manifest: R9.
Problem: the guards are `isSafeRelPath` on the ledger string and `lstatSync(abs).isFile()` on the
final component. Neither resolves intermediate components, so a symlinked directory anywhere under
`~/.agentsmyth/` turns the prune into a delete outside it. Observed: a file under a user's own
checkout deleted, with the log line naming a path inside `~/.agentsmyth/`.
Fix: resolve the real path and assert containment within the tree before deleting, rather than
validating the string and the leaf.

**F7 (r1) — `isSafeRelPath` is separator-blind, so Windows traversal passes.**
Area: `bin/agentsmyth.mjs:1004-1011`; consumers at `:869` and `:1960`. Manifest: R9 (predicate predates this chain).
Problem: the traversal test splits on `/` only. On Windows `path.join` honours `\`, so
`..\..\..\Users\me\Desktop\thesis.docx` is accepted and resolves outside the tree. It reaches the new
prune (delete) and the pre-existing manifest reader (overwrite) — and `workflow/provenance.yaml` is a
committed file, so the path is reachable through an ordinary pull request. Windows is a declared
target of this code.
Fix: split on both separators, or test with `path.isAbsolute` and a resolved-path containment check
rather than by string inspection.

**F8 (r2) — the gate reads a self-reported status flag, not the value it demands.**
Area: `check-lifecycle.mjs:148-163`, `bin/agentsmyth.mjs:206-275`. Manifest: R4.
Problem: flipping the item's `status` to `waived` or `resolved` clears the block permanently without
`tuning.council.model_tier` ever being written. Nothing cross-checks that a resolved item's field
exists, and the value — once written — is validated only by `check-config.mjs`, which no consumer
path runs: an invented tier passes `agentsmyth check` and is then handed to five adapter mappings
that cannot resolve it.
Fix: gate on the resolved VALUE rather than the item's status, and put `check-config` on the
consumer path so an invalid enum is caught where it is written.

**F9 (r2) — the gate passes when `pending-setup.yaml` cannot be read, or is absent.**
Area: `check-lifecycle.mjs:152-163`. Manifest: R4.
Problem: the parse failure is swallowed and the gate reports ok. The comment delegates the report to
`check-pending-setup.mjs`, which `agentsmyth check` never invokes — so a corrupt or deleted file is
both an undetected config fault and a silent clearance of the only blocking item. The repo-profile
branch in the same function correctly fails closed, which makes the asymmetry an oversight rather
than a decision.
Fix: fail closed on an unreadable pending-setup file, as the sibling branch already does.

**F10 (r2) — `depth: shallow` is unusable and `depth: deep` is unenforced.**
Area: `check-council-record.mjs:689-700` vs `agent-behavior.yaml:190-196`. Manifest: R3.
Problem: the web spot-check rule keys only on round, web findings and challenger presence, with no
branch on `depth`. A `shallow` council — defined by this chain as running no challenge stage — is
rejected the moment any member files a `web` citation. And `deep`'s stated stricter obligation gets
the identical single-sample check as `standard`. So the semantics this chain added are contradicted
by the validator in one direction and unenforced in the other.
Fix: branch the spot-check rule on resolved `depth`: no challenger requirement at `shallow`, one
sample at `standard`, per-member at `deep`.

**F11 (r2) — nothing reads `model_tier`, `effort` or `depth`, and the record need not carry them.**
Area: `check-council-record.mjs:381-385`, `artifact-frontmatter.schema.yaml:193-272`. Manifest: R3, R5.
Problem: the required-key list is unchanged, and a council record omitting every new key validates.
The parent confirmed every occurrence of `model_tier` across the validators is a comment, an error
string, or a match on the pending-setup item's field NAME — the resolved value is consumed nowhere.
`agent-behavior.yaml:184-189` names exactly this defect as the reason for defining `depth`: "a knob a
repo can set, an artifact records, and no behaviour consults is worse than an absent one, because the
record implies a choice took effect." The chain reproduced it for five new keys and left `depth`
unread as well. Because `member_tokens` is optional and unenforced, the cost history R13 is defined
against can never be made to exist, so `no-history` is permanently correct.
Fix: require the resolved tier, effort and depth on a council-mode record, and require
`member_tokens` with `unavailable` as the explicit opt-out — a field that may always be omitted is
not a record.

**F12 (r2) — an override recorded as a string bypasses the mandatory-reason rule.**
Area: `check-council-record.mjs:348-356`. Manifest: R4.
Problem: the guard requires `typeof overrides === 'object'`, so `overrides: "model_tier=deep"` — the
obvious shorthand — is invisible to it and the reason requirement never fires. The only validator
that rejects the shape, `check-artifacts.mjs`, is on no consumer path. An array fires but reports a
nonsense key list.
Fix: reject any `overrides` that is present and not a plain object, rather than ignoring it.

### Medium

**F13 (r1) — `expandBundle`'s write side has no path validation.**
Area: `bin/agentsmyth.mjs:819-829`; `src/setup/SKILL.md:305-308`. Manifest: R9 (predates this chain).
Problem: the capture group is `([^>]+)` and the write is unguarded, so a `<!-- FILE: ../../x -->`
block escapes the tree, is recorded in the ledger, and is then permanently un-prunable because the
prune guard rejects it. This chain guarded the delete and left the overwrite open. The same traversal
is handed to an agent as an instruction in the consumer fallback path.
Fix: validate the declared path on write with the same containment check the delete will use.

**F14 (r1) — the prune reaches all of `~/.agentsmyth/`, contradicting its own comment.**
Area: `bin/agentsmyth.mjs:857-880`. Manifest: R9.
Problem: nothing constrains a ledger entry to `workflow/`. The parent confirmed there is no scope
check beyond `isSafeRelPath`. Observed: `validators/lib.mjs` deleted and surviving only because
`copyRecursive` runs a few lines later — ordering, not containment — and a user file elsewhere under
`~/.agentsmyth/` deleted permanently. The comment at 836-841 asserts the design is "deliberately
narrower than 'anything here the bundle does not declare', which would reach `validators/` … and
anything a user put here themselves." It reaches all three.
Fix: scope prune candidates to the subtree the bundle owns, and correct the comment. A safety
argument in a comment that the code does not implement is worse than no comment.

**F15 (r2) — the cost-estimate rule checks the syntax of a sample claim, not the claim.**
Area: `check-council-record.mjs:370-379`. Manifest: R3.
Problem: `"from 0 councils"` passes — precisely the case the rule's own text says must be declared
`no-history`. `"from 3 councils"` with no figure passes. An asserted sample of 99 passes in a tree
holding one council record, even though the validator is enumerating those records in the same pass.
Fix: compare the asserted sample against the records actually present, and require a figure
alongside it; treat a claimed sample of zero as `no-history`.

**F16 (r2) — `council.enabled: disabled` is a free, unverifiable bypass.**
Area: `check-council-record.mjs:294-326`, `check-lifecycle.mjs:164-192`. Manifest: R4.
Problem: the gate's second advertised remedy is honoured by the gate and enforced nowhere. The
record's self-reported `resolution` block is cross-checked only against its own `mode`, never against
the resolved config — so a repo may declare councils disabled, clear the block, run councils, and
have both validators report green.
Fix: cross-check the recorded `resolution` against the resolved configuration, which
`resolveCouncilConfig()` already has in hand.

**F17 (r2) — the third advertised remedy cannot work.**
Area: `check-lifecycle.mjs:181-195`, `lib.mjs:374-392`. Manifest: R4.
Problem: the refusal text offers "record a waiver in the brief naming this requirement". The gate
exits before resolving any artifact path, and `finish()` has no waiver suppression, so a complete
six-field waiver changes nothing. Of three offered remedies one is unimplemented and two are evadable
(F8, F16) — which is how a mandatory gate becomes a routinely bypassed one.
Fix: implement waiver recognition at this gate or remove the option from the message. An error that
recommends a non-existent remedy costs the reader a cycle and then teaches them to distrust it.

**F18 (r2) — R10's wiring is skipped for the commonest council record shape.**
Area: `bin/agentsmyth.mjs:258-270`, `src/assets/hooks/pre-commit:85-92`. Manifest: R10.
Problem: the council validator runs only on the non-`--staged` leg, and the hook's per-artifact leg
skips any artifact not yet `ready-for-next-phase`. A council terminating `user-decision-required` is
written `blocked-for-user` — what all three of this chain's own fixtures carry — so that record is
committed with no council-record validation at all. The `--staged` leg, the only check on every
commit, skips the validator by design.
Fix: run the council-record check on the staged leg scoped to staged artifacts only, so the cost is
proportional and the commonest shape is covered.

**F19 (r2) — for upgrading repos the blocking item's documented resolution path does not exist.**
Area: `bin/agentsmyth.mjs:3289-3290`, `:186-187`, `src/setup/SKILL.md:240-269`. Manifest: R5.
Problem: the council-member templates are copied into `.agentsmyth/assets/` on the `init` path only;
`prepare` and `upgrade` never place them, and `check-setup-complete` requires `.agentsmyth/` to be
deleted. But the blocking tier item is appended to *existing* repos on version skew. So exactly the
population that receives the item has no copy of the template its resolution step reads.
Fix: resolve the template from the global definitions tree rather than the deleted staging
directory, and have `prepare` install it there.

### Low

**F20 (r1) — the supersede sweep deletes user directories whose names look like versions.**
Area: `bin/agentsmyth.mjs:1414-1424`. Manifest: RI7 (predates this chain).
Problem: condition (a) narrows the sweep to version-shaped directory names, which is a shape test
rather than an ownership test, so a consumer's own `workflow/backups/1.0.0/` is indistinguishable
from one agentsmyth wrote. Files at governed relpaths inside it are removed, unlogged.
Fix: record which backup directories agentsmyth created and sweep only those.

**F21 (r1) — the gate-first write widens a private hook's mode and demotes its shebang.**
Area: `bin/agentsmyth.mjs:2465-2469`. Manifest: R2.
Problem: no user bytes are lost, but an explicit `{ mode: 0o755 }` bypasses the mode-preserving
branch and widens a deliberate `0700` hook to group and world execute; and the user's `#!` line moves
to line 102, so the file no longer declares its interpreter — inert under husky's `sh -e` dispatch,
live if the file is ever executed directly.
Fix: preserve the existing mode when the target already exists, and keep a leading shebang at line 1
by inserting the gate block after it rather than before.

**F22 (r2) — nothing checks that members were dispatched by named definition.**
Area: `check-setup-complete.mjs:185-201`, `check-council-record.mjs`. Manifest: R5.
Problem: the mechanism this chain says converts the tier "from a wish into a parameter" has no
mechanical check. A setup agent that skips step 5a.3 leaves no trace, and a record of members
dispatched by prose is indistinguishable from one dispatched by named definition.
Fix: require the council record to name the definition each member was dispatched from, and add the
member-definition paths to `check-setup-complete`'s required set.

## Severity Summary

| Severity | Found | Open |
|---|---|---|
| critical | 4 | 4 |
| high | 8 | 8 |
| medium | 7 | 7 |
| low | 3 | 3 |
| **total** | **22** | **22** |

Nothing was remediated during Review. Review finds; Test and the remediation that precedes it settle.

## Council Log

### Requirement Classification

Every active requirement with the evidence class that would settle it. Written when the categories
were assigned, before dispatch — deciding what would settle a question is what keeps a review from
becoming an undirected read of the diff.

| Manifest ID | Question bucket | Evidence classes |
|---|---|---|
| R1 | does the stale-install refusal fire for a genuinely old install? | repo, trial |
| R2 | does the gate execute after a dependency install, not merely exist? | trial |
| R3 | is the capability vocabulary read by anything, and does the validator agree with its semantics? | repo, trial |
| R4 | is the pre-dispatch refusal reachable on any shipped surface? | repo, trial |
| R5 | is the tier enforced at the dispatch site, and is the template present for every population? | repo, trial |
| R6 | does the release entry describe what shipped? | repo |
| R7 | does a husky repo still report false drift? | trial |
| R8 | does a worktree install leave an upgradeable repo? | trial |
| R9 | what can the prune delete that it should not? | repo, trial |
| R10 | does the council contract run for a consumer, on which paths? | trial |
| R11 | was the rehearsal evidence re-derived against a real artifact? | repo, trial |
| RI1 | was any required field added anywhere? | repo |
| RI2 | does the staleness signal work at an identical version stamp? | repo, trial |
| RI3 | are the five adapters' gate contents still in sync? | repo |
| RI4 | do the build products reflect source? | trial |
| RI5 | is every validator rule depended on by a suite? | trial |
| RI6 | was a runtime dependency introduced? | repo |
| RI7 | can a backup an open item names be destroyed? | repo, trial |
| RI8 | was a prompt added under `bin/`? | repo |
| RI9 | does a missing definitions file explain itself? | trial |
| RI10 | does the documentation claim delivery parity the code lacks? | repo |
| RI11 | is the written hook executable where that matters? | trial |
| RI12 | does the corrected comment name the real callers? | repo |

### Members

| Member | Role | Round | Input | Capabilities | Sandbox |
|---|---|---|---|---|---|
| r1 | reviewer | 1 | diff+manifest | read + fetch + search; repo-axis fence instruction-enforced, corroborated by repo_integrity | ~/.agentsmyth/sandbox/agentsmyth/r1/ |
| r2 | reviewer | 1 | diff+manifest | read + fetch + search; repo-axis fence instruction-enforced, corroborated by repo_integrity | ~/.agentsmyth/sandbox/agentsmyth/r2/ |

No challenger ran. Recorded as a skipped check in Verification Reviewed rather than omitted: the
cap resolved to 2 from `council.per_phase.review.default_fan_out`, both slots were spent on
reviewers, and the consequence is that no member attacked another's findings.

**Risk categories, disjoint and assigned before dispatch.** r1 owned destructive-action safety —
every path that deletes, overwrites or relocates something a user owns. r2 owned enforcement
reachability — whether each new rule fires in the place it claims, for a real consumer. Neither was
permitted into the other's area, and neither received the Build session transcript: both were given
the diff range and the files, and both were told explicitly not to treat commit messages or artifact
claims as evidence, since the parent wrote those.

No category was left unassigned. Two surfaces were deliberately out of scope for this round and are
recorded in Residual Risk rather than silently dropped.

### Risk Category Assignment

Columns match the contract's shape: Member, Round, Risk categories, Rationale. The two reviewers were
briefed in terms of concrete surfaces; the categories below are that briefing in the contract's own
vocabulary, assigned before dispatch and disjoint within the round.

| Member | Round | Risk categories | Rationale |
|---|---|---|---|
| r1 | 1 | security | Every path that deletes, overwrites or relocates user-owned content: the new prune, the gate-first hook write, the backup and supersede sweeps, and the path-containment predicates they all depend on |
| r1 | 1 | compatibility | CRLF hook refresh, husky v8 against v9 layouts, Windows separator handling, and symlinks at both the leaf and intermediate positions |
| r2 | 1 | verification | Whether each new rule fires from the shipped copy for a real consumer, and what the green suites do and do not establish |
| r2 | 1 | lifecycle | Gate invocation across phases, the commit hook's phase map, and the staged against downstream legs |
| r2 | 1 | contract | The council record's required-key set, the new schema fields, and whether any code reads them |

Five of the ten categories went unread. They are named in the Check column of Skipped Checks below,
because with a two-reviewer cap over ten categories an unread category is the normal case and has to
be stated rather than inferred.

### Requirement Classification

Every active requirement with the evidence class that would settle it. Written when the categories
were assigned, before dispatch — deciding what would settle a question is what keeps a review from
becoming an undirected read of the diff.

| Manifest ID | Question bucket | Evidence classes |
|---|---|---|
| R1 | does the stale-install refusal fire for a genuinely old install? | repo, trial |
| R2 | does the gate execute after a dependency install, not merely exist? | trial |
| R3 | is the capability vocabulary read by anything, and does the validator agree with its semantics? | repo, trial |
| R4 | is the pre-dispatch refusal reachable on any shipped surface? | repo, trial |
| R5 | is the tier enforced at the dispatch site, and is the template present for every population? | repo, trial |
| R6 | does the release entry describe what shipped? | repo |
| R7 | does a husky repo still report false drift? | trial |
| R8 | does a worktree install leave an upgradeable repo? | trial |
| R9 | what can the prune delete that it should not? | repo, trial |
| R10 | does the council contract run for a consumer, on which paths? | trial |
| R11 | was the rehearsal evidence re-derived against a real artifact? | repo, trial |
| RI1 | was any required field added anywhere? | repo |
| RI2 | does the staleness signal work at an identical version stamp? | repo, trial |
| RI3 | are the five adapters' gate contents still in sync? | repo |
| RI4 | do the build products reflect source? | trial |
| RI5 | is every validator rule depended on by a suite? | trial |
| RI6 | was a runtime dependency introduced? | repo |
| RI7 | can a backup an open item names be destroyed? | repo, trial |
| RI8 | was a prompt added under `bin/`? | repo |
| RI9 | does a missing definitions file explain itself? | trial |
| RI10 | does the documentation claim delivery parity the code lacks? | repo |
| RI11 | is the written hook executable where that matters? | trial |
| RI12 | does the corrected comment name the real callers? | repo |

### Members

| Member | Role | Round | Input | Capabilities | Sandbox |
|---|---|---|---|---|---|
| r1 | reviewer | 1 | diff+manifest | read + fetch + search; repo-axis fence instruction-enforced, corroborated by repo_integrity | ~/.agentsmyth/sandbox/agentsmyth/r1/ |
| r2 | reviewer | 1 | diff+manifest | read + fetch + search; repo-axis fence instruction-enforced, corroborated by repo_integrity | ~/.agentsmyth/sandbox/agentsmyth/r2/ |

No challenger ran. Recorded as a skipped check in Verification Reviewed rather than omitted: the
cap resolved to 2 from `council.per_phase.review.default_fan_out`, both slots were spent on
reviewers, and the consequence is that no member attacked another's findings.

**Risk categories, disjoint and assigned before dispatch.** r1 owned destructive-action safety —
every path that deletes, overwrites or relocates something a user owns. r2 owned enforcement
reachability — whether each new rule fires in the place it claims, for a real consumer. Neither was
permitted into the other's area, and neither received the Build session transcript: both were given
the diff range and the files, and both were told explicitly not to treat commit messages or artifact
claims as evidence, since the parent wrote those.

No category was left unassigned. Two surfaces were deliberately out of scope for this round and are
recorded in Residual Risk rather than silently dropped.

### Risk Category Assignment

The ten canonical categories, each either assigned to a reviewer or declared unread. Assigned before
dispatch; the two reviewers were briefed in terms of concrete surfaces rather than category names,
and the mapping below is that briefing expressed in the contract's own vocabulary.

| Category | Round | Reviewer | What was actually read |
|---|---|---|---|
| security | 1 | r1 | every path that deletes, overwrites or relocates user-owned content: the prune, the hook writes, the backup and supersede sweeps, path-containment predicates |
| compatibility | 1 | r1 | CRLF hook refresh, husky v8 versus v9 layouts, Windows separator handling, symlinked targets and intermediate directories |
| verification | 1 | r2 | whether each new rule fires from the shipped copy for a real consumer, and what the green suites do and do not establish |
| lifecycle | 1 | r2 | gate invocation across phases, the commit hook's phase map, the staged versus downstream legs |
| contract | 1 | r2 | the council record's required-key set, the new schema fields, and whether anything reads them |

Five categories went unread and are named in Skipped Checks below. With a two-reviewer cap over ten
categories that is the normal case rather than an unusual one, which is why the contract requires it
stated rather than inferred.

### Rounds

| Round | Reviewers | Challengers | Open in | Open out | Items closed | Sizing rationale |
|---|---|---|---|---|---|---|
| 1 | 2 | 0 | 2 | 0 | destructive-action safety, enforcement reachability | Cap 2 from the configured per-phase Review fan-out, deliberately below Think's 3 because a Review verdict blocks a commit. Both categories returned conclusive findings with trial evidence, so no second round was needed: nothing remained open that another round would close. |

### Findings

Member findings as reported, without fix recommendations — those are the parent's and appear above.

| Finding | Member | Role | Round | Surface | Evidence class | Citation | Disposition | Reason / merged into |
|---|---|---|---|---|---|---|---|---|
| F1 | r2 | reviewer | 1 | think-gate invoker | repo | src/workflow/skills/lifecycle-think/SKILL.md | accepted | Parent independently confirmed 0 phase-gate occurrences against 1 in each of the other six skills. |
| F2 | r2 | reviewer | 1 | review-phase tier rule | trial | sandbox ~/.agentsmyth/sandbox/agentsmyth/r2/consumer; command: `node check-lifecycle.mjs --phase review --slug probe`; output: "failed with 1 issue(s) - review: no tasks artifact found" with no tier error | accepted | Independent of F1; both must be fixed. |
| F3 | r1 | reviewer | 1 | zero-match prune | trial | sandbox ~/.agentsmyth/sandbox/agentsmyth/r1; command: `prepare` against a bundle truncated before its first END FILE marker; output: "removed 252 file(s)", files left 5, exit=0 | accepted | Parent confirmed no `written.length` guard exists before the prune loop. |
| F4 | r1 | reviewer | 1 | noop backup sweep | trial | sandbox .../r1/repoG; command: three successive `upgrade` runs with edits between; output: backup absent while the open item still names it | accepted | Predates this chain; reachable and severe. |
| F5 | r1 | reviewer | 1 | writeBackup destination | trial | sandbox .../r1/repoG; command: `upgrade` after a second in-marker edit; output: "AAA present in backup: 0 / BBB present in backup: 1" | accepted | |
| F6 | r1 | reviewer | 1 | prune containment | trial | sandbox .../r1 home2; command: `prepare` with workflow/skills replaced by a symlink; output: "removed 1 file(s)" naming an in-tree path while deleting outside it | accepted | |
| F7 | r1 | reviewer | 1 | isSafeRelPath separators | trial | sandbox .../r1/wintest.cjs; command: `node wintest.cjs` with path.win32.join; output: "..\\..\\..\\Users\\me\\Desktop\\thesis.docx guard: ACCEPTED" | accepted | |
| F8 | r2 | reviewer | 1 | gate reads status not value | trial | sandbox .../r2/consumer; command: flip PS-13 status to waived, then resolved; output: `check-lifecycle --phase think: ok` both times with model_tier never written | accepted | |
| F9 | r2 | reviewer | 1 | unparseable pending-setup | trial | sandbox .../r2/consumer; command: replace pending-setup.yaml with invalid YAML, then remove it; output: `check-lifecycle --phase think: ok` in both cases | accepted | |
| F10 | r2 | reviewer | 1 | depth semantics vs validator | trial | sandbox .../r2/fx/shallow; command: `check-council-record.mjs --dir fx/shallow` with depth shallow and one web finding; output: "failed with 1 issue(s) - round 1 has web finding(s) but no challenger spot-check" | accepted | Directly contradicts the semantics R3 added. |
| F11 | r2 | reviewer | 1 | new keys unread | trial | sandbox .../r2/fx/nodepth; command: `check-council-record.mjs --dir fx/nodepth` with every new key absent; output: "check-council-record: ok" | accepted | Parent confirmed every validator occurrence of model_tier is a comment, error string, or field-name match. |
| F12 | r2 | reviewer | 1 | overrides shape | trial | sandbox .../r2/fx/str; command: `check-council-record.mjs --dir fx/str` with `overrides: "model_tier=deep"`; output: "check-council-record: ok" | accepted | |
| F13 | r1 | reviewer | 1 | expansion write validation | trial | sandbox .../r1 home9; command: `prepare` with a FILE block naming ../../ESCAPED-WRITE.txt; output: file written outside the tree, exit=0 | accepted | Predates this chain; framing that the delete was guarded and the write was not is fair. |
| F14 | r1 | reviewer | 1 | prune scope | trial | sandbox .../r1 home3, home8; command: `prepare` with validators and a user file appended to the ledger; output: "removed 3 file(s)" including userstuff/notes.md, which is GONE | accepted | Parent confirmed no workflow/ scope check exists. |
| F15 | r2 | reviewer | 1 | cost-estimate rule | trial | sandbox .../r2/fx; command: `check-council-record.mjs` with cost_estimate "pulled this out of thin air from 0 councils"; output: "check-council-record: ok" | accepted | |
| F16 | r2 | reviewer | 1 | disabled-council bypass | trial | sandbox .../r2/consumer; command: append `council.enabled: disabled` then run both validators; output: gate "not gated / ok" and `check-council-record: ok`, exit=0 | accepted | |
| F17 | r2 | reviewer | 1 | waiver remedy | repo | src/workflow/validators/lib.mjs:374-392 | accepted | |
| F18 | r2 | reviewer | 1 | staged-leg coverage | trial | sandbox .../r2/consumer; command: `node bin/agentsmyth.mjs check --staged`; output: commit-coverage failure with no council line | accepted | |
| F19 | r2 | reviewer | 1 | upgrade-path template | repo | src/setup/SKILL.md:240-269 | accepted | |
| F20 | r1 | reviewer | 1 | version-shaped user dirs | trial | sandbox .../r1/repoG; command: create workflow/backups/1.0.0/.githooks/pre-commit then `upgrade`; output: file absent afterwards | accepted | Predates this chain. |
| F21 | r1 | reviewer | 1 | hook mode and shebang | trial | sandbox .../r1/repoC; command: `init` over a 0700 bash hook; output: mode 755, user shebang at line 102 | accepted | |
| F22 | r2 | reviewer | 1 | dispatch-by-definition unchecked | repo | src/workflow/validators/check-setup-complete.mjs | accepted | |

### Reconcile Contract

Declared before dispatch. The two risk categories were cut to be disjoint, so overlap was expected
only where one surface is reachable from both — the hook relocation, which deletes nothing (r1's
area) but can leave a stale enforcement block behind (r2's area). r1 encountered it, identified it as
the other category's, and said so explicitly rather than reporting it; that boundary held without the
parent arbitrating.

Duplicate findings with identical claims and citations would collapse to the earlier member number,
recorded `merged` with the target named. None arose: the categories produced no overlapping findings,
which is the outcome a disjoint cut is for.

Disagreement on a shared surface would be recorded in Conflicts with both citations and the parent's
resolution, never averaged.

### Conflicts

| Surface | Findings | Resolution |
|---|---|---|
| — | — | None. The two members' findings do not contradict each other on any surface. Recorded explicitly rather than omitted, because an absent Conflicts section cannot be told apart from an unexamined one. |

### Skipped Checks

| Check | Why skipped | Risk | Owner | Blocks ship | Manifest IDs |
|---|---|---|---|---|---|
| requirement | Cap 2 over ten categories; coverage of requirement-level correctness was folded into the parent's Requirement Coverage table rather than given a reviewer | A requirement satisfied in letter but not in substance would be caught only by the parent, who also wrote it | workflow owner | no | R1, R2, R6, R7, R8, R11 |
| generated-output | Unread. The build products were confirmed regenerated but nobody reviewed whether `dist/` faithfully reflects `src/` for the new files | A stale or malformed bundle entry would ship silently; partially mitigated because r2 verified the five adapter templates sync and appear after `init` | workflow owner | no | RI4 |
| source-of-truth | Unread. No external provider is configured for this repo, so the category is near-empty by construction, but that was not verified by a reviewer | The Notion record and the ledger closures are Ship-owned and unreviewed | workflow owner | no | R11 |
| release | Unread. The CHANGELOG as release copy, and the dispatch preconditions, were not reviewed | Release copy may overstate what shipped — a live risk given OI-115 and finding F11 | user | no | R6, RI10 |
| maintainability | Unread. No reviewer assessed whether the added surfaces are maintainable; the parent's own comments were found overclaiming twice (F14, and the Phase 4 containment claim), which is evidence this category needed a reader | Comments asserting properties the code lacks are a recurring defect in this chain and nobody was assigned to look for more of them | workflow owner | no | R3, R9 |
| Adversarial challenge pass over the reviewers' findings | The resolved cap was 2 and both slots were spent on disjoint risk categories; raising the cap mid-run is an escalation, not a dispatch decision | A plausible-but-wrong finding survives unchallenged. Mitigated partially by the parent re-verifying F1, F3, F11 and F14 directly against the code | workflow owner | no | R3, R4, R5, R9 |
| Windows execution of the traversal and prune paths | No Windows host available to this run; F7 is demonstrated by running the predicate under `path.win32` semantics rather than on the platform | The Windows consequence is inferred from the predicate's behaviour rather than observed end to end | workflow owner | no | R9 |

### Termination

- Reason: `resolved`.
- Surviving items and their round history: none. Both question buckets returned conclusive findings
  with trial evidence in round 1, so nothing remained open that a further round would close. The
  twenty-two findings are output, not unfinished business — they are handed to remediation and Test,
  which is where a finding is settled.

## Requirement Coverage

**Declared manifest_ids versus coverage, and why they differ.** The frontmatter declares twenty
requirements; the table below carries twenty-three rows. The three absent from `manifest_ids` — RI1,
RI6 and RI8 — are NEGATIVE requirements, satisfied by what the diff does not contain rather than by
anything it does: RI1 that no required field was added anywhere, RI6 that no runtime dependency was
introduced, RI8 that no prompt was added under `bin/`. No Changed Files entry can touch them, because
a requirement met by absence has no file to name. They are verified in Verification Reviewed and
carry coverage rows here; declaring them as diff coverage would assert a file touched them, which
would be false.

| Manifest ID | Status | Notes |
|---|---|---|
| R1 | covered | Verified against the genuinely published 1.0.1 fetched from the registry. F3 undermines it in one direction: an emptied tree reads as `current`, so the guard can be blinded by the Phase 4 defect. |
| R2 | covered | Real commit output in husky v9 and v8. F21 is a low-severity property change on a user-owned file. |
| R3 | partial | The keys exist and merge correctly; nothing reads them (F11), the depth semantics are contradicted by the validator (F10), and the cost rule is satisfiable by syntax (F15). |
| R4 | missing | The gate has no invoker (F1), does not exist for Review (F2), reads a status flag rather than a value (F8), passes on an unreadable file (F9), and two of its three advertised remedies are evadable or unimplemented (F16, F17). |
| R5 | partial | Templates exist and sync on the `init` path; the tier is enforced at dispatch only if a setup step nothing checks was completed (F22), and the template is absent for upgrading repos (F19). |
| R6 | covered | The CHANGELOG entry covers the chain. The date is deliberately a placeholder. |
| R7 | covered | Zero drift after a husky reinstall, no backup, no reconcile item. |
| R8 | covered | Worktree `init` then `upgrade` both exit 0; no manifest entry escapes. |
| R9 | partial | Pruning works for the intended case and is unsafe in four others (F3, F6, F7, F14). |
| R10 | partial | The validator is genuinely wired and silent with no council artifacts, but is skipped for the commonest record shape (F18). |
| R11 | covered | Rehearsal re-derived; mislabelled tarball removed from the tree. |
| RI1 | covered | Additive; the declared carve-out went unused and the four historical artifacts are untouched. |
| RI2 | covered | Absent-or-differing stamp rule, verified against a real published install. |
| RI3 | covered | Adapter shims current. Delivery parity remains false and is tracked as OI-115. |
| RI4 | covered | Build run; `dist/` regenerated. |
| RI5 | covered | `mutation:audit` 0/238 undefended, all three new rules defended. |
| RI6 | covered | `dependencies` empty. |
| RI7 | partial | Tracked-hooks repos unregressed and superseded reported correctly, but the backup-protection rule holds at one deletion site and not the other (F4, F5, F20). |
| RI8 | covered | No prompt added under `bin/`; the gate is a validator. |
| RI9 | covered | Missing definitions name the file and the remedy, no stack trace. |
| RI10 | covered | Docs corrected; the delivery fix itself is OI-115. |
| RI11 | covered | Mode 0755 on the written hook, proven by a v8 commit. |
| RI12 | covered | Comment corrected to name all four callers. |

Every `partial` and the one `missing` appears as a finding above. No coverage row is unexplained.

## Architecture Notes

- role: Reviewer
- **decision — two reviewers, no challenger, and the cost of that is recorded.** The cap resolved to
  2 from the configured per-phase Review fan-out, and both slots went to disjoint risk categories
  rather than one reviewer plus one challenger. The tradeoff: breadth over adversarial depth. Nothing
  attacked either member's findings, so a plausible-but-wrong finding would have survived this round.
  The parent independently re-verified the four most consequential claims (F1, F3, F11, F14) against
  the code rather than accepting them, which is a weaker substitute than a challenger and is the
  reason it was done at all.
- **constraint:** members received the diff and the files, never the Build session transcript, so
  they could not inherit the parent's framing of what was built. Both were told not to treat commit
  messages or artifact claims as evidence, because the parent wrote those.
- **constraint:** members were forbidden from proposing fixes. A reviewer with a fix in hand stops
  looking, and the contract reserves remediation for the parent.
- **observation worth carrying to Reflect:** the four criticals divide evenly into two classes, and
  only one is about this chain's code. F3 and F4 are destructive-path defects. F1 and F2 are a rule
  that exists, is correct, is reachable, and is invoked by nothing — which is a *wiring* failure, not
  a logic failure, and no amount of unit-level evidence would have caught it. Every suite this chain
  ran invoked the rule directly; none asked whether the shipped product ever does. That gap is the
  most transferable lesson here.
- **downstream:** remediation must land before Test, and Test owes a case per critical. F1 in
  particular needs a conformance assertion that some shipped surface invokes the gate — the fix
  without that assertion would regress the moment someone edits the hook's phase map.

## Verification Reviewed

| Evidence | Outcome |
|---|---|
| `npm run validate` | pass, exit 0 |
| `npm run violations:test` | pass, 227/227, attribution 111/111 |
| `npm run conformance:test` | pass, exit 0 |
| `npm run init-prepare-interop:test` | pass, 56/56 |
| `npm run upgrade-path:test` | pass, 160 passed, 1 skipped (platform-conditional, waiver FQ-80) |
| `npm run tuning-merge:test` | pass, 18/18 |
| `npm run mutation:audit` | pass, 0/238 undefended |
| `node src/workflow/validators/repo-digest.mjs` before and after the council | identical, 2179 files, `3bd4131c…` |
| `npm pack @jeelvankhede/agentsmyth@1.0.1` then current-CLI `init` against that install | refused, exit 1, remedy named |

**What the green suites do and do not establish.** Every suite above passed while four critical
defects were present. That is not a suite failure: each asserts the behaviour it names, and none of
them asks whether the shipped product invokes the rule it tests. F1 is the clearest case — the rule
has a passing rejection fixture and a passing mutation audit, and nothing runs it in a consumer repo.
A passing ratchet establishes that every rule is depended on by some suite; it establishes nothing
about whether a consumer ever reaches that rule.

## Residual Risk

- **Two surfaces were out of scope for this round** and nothing says they are sound: the five adapter
  member definitions' per-tool mapping correctness beyond their stated capability claims, and the
  CHANGELOG's accuracy as release copy. Neither was assigned to a category.
- **The `model_actual` field is recorded as `unknown` for this very council.** The host does report
  per-member token counts, which this record carries, but not the model a member ran on in a form the
  parent could read back. That is the honest value and it is also an early demonstration of F11: a
  field that may be `unknown` and that nothing reads is close to no field at all.
- **`cost_estimate` is `no-history` and, per F11, will remain so.** No prior council record carries
  `member_tokens`, and nothing requires one to. This record is the first to carry them, which makes
  the next council's estimate possible in principle — but only if the requirement F11 asks for lands.
- **Four of the twenty-two findings predate this chain** (F4, F5, F13, F20) and one predates it as a
  predicate newly consumed by it (F7). They are reported rather than deferred because this chain made
  three of them reachable or more severe, but remediation scope is the user's call, not the reviewer's.

## Recommendation

**hold.**

Four critical findings, and the two that matter most are not bugs in the implementation — they are
the implementation being unreachable. R4 is the requirement this chain was reorganised around, and as
shipped nothing invokes it: the gate is correct, reachable, tested, mutation-defended, and dead. R3
and R5 are in the same condition one level down, with five new keys that no code reads. Shipping this
would put a release's worth of enforcement prose in front of a mechanism that does not run, which is
the precise failure this repository has already named once and cited as the reason for this work.

The destructive pair is independently sufficient for a hold. F3 deletes a user's entire global
definitions tree from a damaged bundle, exits 0, destroys its own recovery ledger, and leaves the
version stamp claiming health so that R1's guard cannot catch it. F4 deletes a backup that an open
reconcile item is actively pointing at.

This is not a `pass-with-risk`. A waiver is appropriate for a known, bounded, accepted cost; these
are a safety mechanism that reports itself active while being inert, and a data-loss path in the one
requirement the plan isolated specifically because it deletes.
